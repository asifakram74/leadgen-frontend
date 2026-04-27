"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { useAppDispatch, useAppSelector } from "@/store";
import { setProfile, setLoading as setUserLoading } from "@/store/slices/userSlice";
import { getMediaUrl } from "@/lib/api";
import { UserIcon, Mail, Phone, ShieldCheck, CheckCircle2, Eye, EyeOff, Lock, Edit, Camera, ArrowRight, X } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { profile, loading: userLoading } = useAppSelector((state) => state.user);

  const [loading, setLoading] = useState(!profile);

  // Password Modal
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", new: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Profile Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      dispatch(setProfile(data));
      setEditForm({
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        email: data.email || "",
        phoneNumber: data.phone_number || ""
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess(false);

    if (pwdForm.new !== pwdForm.confirm) {
      setPwdError("New passwords do not securely match!");
      return;
    }

    try {
      await userService.updatePassword({
        current_password: pwdForm.current,
        new_password: pwdForm.new
      });

      setPwdSuccess(true);
      setTimeout(() => {
        setShowPwdModal(false);
        setPwdForm({ current: "", new: "", confirm: "" });
        setPwdSuccess(false);
      }, 2000);

    } catch (err: any) {
      setPwdError(err.response?.data?.detail || err.message || "Authentication validation failed.");
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const updated = await userService.updateProfile({
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        email: editForm.email,
        phone_number: editForm.phoneNumber
      });

      // Sync Redux state
      dispatch(setProfile(updated));

      // Sync localStorage so sidebar/navbar reflect the change instantly
      localStorage.setItem("first_name", updated.first_name || "");
      localStorage.setItem("last_name", updated.last_name || "");
      localStorage.setItem("email", updated.email || "");

      setShowEditModal(false);
    } catch (err: any) {
      alert("Profile Patch Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await userService.uploadProfilePicture(file);
      if (profile) {
        const updatedProfile = { ...profile, profile_picture_url: data.profile_picture_url };

        // Sync Redux state
        dispatch(setProfile(updatedProfile));

        // Sync localStorage so sidebar/navbar avatar reflects the change instantly
        localStorage.setItem("profile_picture", data.profile_picture_url || "");
      }
    } catch (err: any) {
      alert("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 md:px-12 md:py-16 relative bg-indigo-500/10 overflow-hidden">

      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-card border-x border-b border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-2xl"></div>
            <div className="flex items-center justify-between p-4 border-b border-border bg-background/50">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-500" /> Secure Patch
              </h3>
              <button disabled={pwdSuccess} onClick={() => setShowPwdModal(false)} className="text-foreground/50 hover:text-foreground p-1 rounded-md transition-colors disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              {pwdError && (
                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 text-sm p-3 rounded-xl font-medium">
                  {pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm p-3 rounded-xl font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Password permanently updated!
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Current Authentication</label>
                <div className="relative">
                  <input type={showCurrent ? "text" : "password"} value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-3.5 text-foreground/40 hover:text-foreground transition-colors">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">New Password Pattern</label>
                <div className="relative">
                  <input type={showNew ? "text" : "password"} value={pwdForm.new} onChange={(e) => setPwdForm({ ...pwdForm, new: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required minLength={8} />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-3.5 text-foreground/40 hover:text-foreground transition-colors">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Confirm Pattern Re-entry</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required minLength={8} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-3.5 text-foreground/40 hover:text-foreground transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button disabled={pwdSuccess} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all mt-4 disabled:opacity-50">
                {pwdSuccess ? "Locked & Saved!" : "Patch Credentials"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-card border-x border-b border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-2xl"></div>
            <div className="flex items-center justify-between p-4 border-b border-border bg-background/50">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-500" /> Identity Patch
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-foreground/50 hover:text-foreground p-1 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">First Name</label>
                  <input type="text" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Last Name</label>
                  <input type="text" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Phone Number</label>
                <input type="text" value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} placeholder="+1 (555) 000-0000" className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-foreground/5 hover:bg-foreground/10 text-foreground font-medium py-2.5 rounded-xl transition-colors border border-border">Cancel</button>
                <button type="submit" disabled={editLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50">
                  {editLoading ? "Scaling..." : "Update Identity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            Account Profile
          </h1>
          <p className="text-foreground/60 mt-2">Manage your personal information, contact details, and account security settings.</p>
        </div>

        <div className="bg-card glass border-x border-b border-border rounded-3xl overflow-hidden shadow-2xl relative p-8 flex flex-col">
          <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 absolute top-0 left-0 rounded-t-3xl"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 text-center md:text-left">
            <div className="relative group">
              <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner border-4 border-border overflow-hidden">
                {profile.profile_picture_url ? (
                  <img
                    src={getMediaUrl(profile.profile_picture_url)}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <span className="text-3xl font-black text-foreground/20">
                    {(profile.first_name?.[0] || "")}{(profile.last_name?.[0] || "")}
                  </span>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full border-2 border-background flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition-all shadow-lg scale-90 group-hover:scale-110">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePictureUpload} disabled={uploading} />
              </label>
            </div>
            <div className="flex-grow space-y-1">
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <h2 className="text-2xl font-bold text-foreground">{profile.first_name} {profile.last_name}</h2>
                <button onClick={() => setShowEditModal(true)} className="px-3 py-1 bg-foreground/5 hover:bg-foreground/10 text-foreground/70 text-xs font-bold rounded-lg border border-border transition-colors flex items-center gap-2">
                  Edit Profile
                </button>
              </div>
              <p className="text-foreground/60 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" /> {profile.email}
              </p>
              {profile.phone_number && (
                <p className="text-foreground/60 flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-4 h-4" /> {profile.phone_number}
                </p>
              )}
              <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> {profile.role} Level
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${profile.is_verified
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}>
                  {profile.is_verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {profile.is_verified ? "Verified" : "Pending Verification"}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${profile.status === 'active'
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : profile.status === 'blocked'
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    : "bg-foreground/5 border-border text-foreground/40"
                  }`}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-sm">
            <div className="bg-background/30 p-4 rounded-2xl border border-border">
              <p className="text-foreground/40 text-xs uppercase tracking-widest font-bold mb-1">Registration Date</p>
              <p className="text-foreground/70">{new Date(profile.created_at).toLocaleString()}</p>
            </div>
            {profile.verified_at && (
              <div className="bg-background/30 p-4 rounded-2xl border border-border">
                <p className="text-foreground/40 text-xs uppercase tracking-widest font-bold mb-1">Verification Meta</p>
                <p className="text-emerald-600 dark:text-emerald-400/80">{new Date(profile.verified_at).toLocaleString()}</p>
              </div>
            )}
            {profile.updated_at && (
              <div className="bg-background/30 p-4 rounded-2xl border border-border">
                <p className="text-foreground/40 text-xs uppercase tracking-widest font-bold mb-1">Last Core Sync</p>
                <p className="text-foreground/70">{new Date(profile.updated_at).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Security Operations</h3>
            <button onClick={() => setShowPwdModal(true)} className="flex items-center justify-between w-full p-4 rounded-xl border border-border bg-card/50 hover:bg-foreground/5 transition-all group">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="bg-rose-500/10 p-2.5 rounded-lg text-rose-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-foreground font-bold">Authentication Vector</p>
                  <p className="text-foreground/50 text-xs sm:text-sm">Force password reset and cycle account authentication hooks.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors group-hover:translate-x-1 hidden sm:block" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
