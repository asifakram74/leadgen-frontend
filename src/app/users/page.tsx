"use client";
import { useState, useEffect, useRef } from "react";
import {
  Loader2, Trash2, ShieldAlert, User as UserIcon, UserCheck, X, Plus, Edit,
  Eye, EyeOff, MoreVertical, Settings, UserMinus, RotateCcw, Search as SearchIcon,
  ChevronDown
} from "lucide-react";
import { userService } from "@/services/userService";
import { getMediaUrl } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  verified_at?: string;
  profile_picture_url?: string;
}

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  position = "bottom",
  size = "md"
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  position?: "bottom" | "top";
  size?: "sm" | "md";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-card/40 backdrop-blur-xl border border-border rounded-xl text-foreground flex items-center justify-between hover:border-primary/40 transition-all shadow-xl active:scale-[0.98] cursor-pointer ${size === 'sm' ? 'py-1.5 px-3 text-xs font-bold' : 'py-4 px-6 text-sm font-bold'
          }`}
      >
        <span className={!selectedOption ? "text-foreground/30" : "text-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-foreground/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 bg-card/90 backdrop-blur-2xl border border-border/50 rounded-xl overflow-hidden shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 ${position === "top" ? "bottom-full mb-2" : "top-full mt-3"
          }`}>
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left transition-all flex items-center gap-3 ${size === 'sm' ? 'px-4 py-2 text-[11px] font-bold' : 'px-6 py-3.5 text-sm font-bold'
                  } ${value === option.value
                    ? "bg-primary/20 text-primary border-l-4 border-primary"
                    : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState("1");

  // Sync pageInput when currentPage changes (e.g. from prev/next buttons)
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
    isVerified: true
  });

  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Reactive Logic: Is anything filtered?
  const isFiltered = searchTerm !== "" || filterRole !== "all" || filterStatus !== "all";

  // Intelligence: Backend Refetch Trigger
  useEffect(() => {
    fetchUsers(!loading); // Don't show full-page loader if we're just refetching
  }, [searchTerm, filterRole, filterStatus, currentPage, itemsPerPage]);

  const fetchUsers = async (quiet = false) => {
    try {
      if (quiet) setIsRefetching(true);
      else setLoading(true);

      const response = await userService.getAllUsers({
        q: searchTerm,
        role: filterRole,
        status: filterStatus,
        page: currentPage,
        size: itemsPerPage
      });

      setUsers(response.items);
      setTotalUsers(response.total);
      setTotalPages(response.pages);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to load user list");
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const handlePageChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(pageInput);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        setCurrentPage(val);
      } else {
        setPageInput(currentPage.toString());
      }
    }
  };

  const handlePageBlur = () => {
    const val = parseInt(pageInput);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      setCurrentPage(val);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      await userService.deleteUser(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast.success("Identity Purged", {
        description: `${userToDelete.first_name}'s access has been cleared from the matrix.`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      });
    } catch (err: any) {
      toast.error("Purge Failed", {
        description: err.response?.data?.detail || err.message,
      });
    } finally {
      setIsDeletingUser(false);
      setUserToDelete(null);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "user",
      status: "active",
      isVerified: true
    });
    setShowModal(true);
  };

  const openEditModal = (user: UserData) => {
    setModalMode("edit");
    setSelectedUserId(user.id);
    setFormData({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
      isVerified: user.is_verified
    });
    setShowModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);

    try {
      if (modalMode === "create") {
        await userService.createUser({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status,
          is_verified: formData.isVerified
        });
        toast.success("Identity Created", {
          description: "New platform access has been provisioned.",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        });
      } else if (selectedUserId) {
        await userService.updateUser(selectedUserId, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          is_verified: formData.isVerified
        });
        toast.success("Identity Updated", {
          description: "The patch has been successfully applied to the directory.",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error("Operation Failed", {
        description: err.response?.data?.detail || err.message,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-rose-500/10 border border-rose-500/50 p-8 rounded-2xl max-w-md text-center">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 bg-indigo-500/10 relative overflow-hidden">

      {/* Modal Injection Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-card border-x border-b border-gray-300 dark:border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-2xl"></div>
            <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-white/10 bg-background/50">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                {modalMode === "create" ? <Plus className="w-5 h-5 text-indigo-500" /> : <Edit className="w-5 h-5 text-amber-500" />}
                {modalMode === "create" ? "Create New Identity" : "Identity Patch"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-foreground/50 hover:text-foreground p-1 rounded-md hover:bg-foreground/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">First Name</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none hover:border-primary/40 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none hover:border-primary/40 transition-all" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none hover:border-primary/40 transition-all" required />
              </div>

              {modalMode === "create" && (
                <div>
                  <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Authentication Key</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none hover:border-primary/40 transition-all" required minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-foreground/40 hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">CRM Role Level</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none hover:border-primary/40 transition-all appearance-none cursor-pointer">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Identity State</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none hover:border-primary/40 transition-all appearance-none cursor-pointer">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-4 bg-background border border-border rounded-xl cursor-pointer hover:bg-foreground/5 hover:border-primary/30 transition-all">
                  <input type="checkbox" checked={formData.isVerified} onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })} className="w-5 h-5 accent-indigo-600 rounded bg-background border-border" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground uppercase tracking-tight">Force Verification</span>
                    <span className="text-[10px] text-foreground/40">Bypass identity validation and cycle account as active.</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} disabled={isActionLoading} className="flex-1 bg-foreground/5 hover:bg-foreground/10 text-foreground font-medium py-3 rounded-xl transition-colors border border-border cursor-pointer disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isActionLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                  {isActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modalMode === "create" ? "Add Identity" : "Apply Patch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-10">
        {/* ─── Robust Header ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              User <span className="text-indigo-600">Management</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Intelligence Console */}
        {/* Intelligence Console - Tactical Layout */}
        <div className="flex flex-col md:flex-row items-stretch gap-4">

          {/* 1. Large Search Bar */}
          <div className="flex-[2] relative group px-0.5">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500/40 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search directory matrix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card/40 backdrop-blur-xl border border-border rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-indigo-500/40 transition-all shadow-xl"
            />
          </div>

          {/* 2 & 3. Balanced Filters */}
          <div className="flex-1 md:w-64">
            <CustomSelect
              value={filterRole}
              onChange={setFilterRole}
              placeholder="Authority"
              options={[
                { value: "all", label: "All Authority" },
                { value: "super_admin", label: "Super Admin" },
                { value: "manager", label: "Manager" },
                { value: "user", label: "User" }
              ]}
            />
          </div>
          <div className="flex-1 md:w-64">
            <CustomSelect
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="State"
              options={[
                { value: "all", label: "All States" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "blocked", label: "Blocked" }
              ]}
            />
          </div>

          {/* 4. Compact Action-Style Reset Button */}
          <button
            onClick={handleReset}
            disabled={!isFiltered}
            title={isFiltered ? "Reset Matrix Filters" : "Filters Clear"}
            className={`aspect-square w-[54px] flex items-center justify-center rounded-xl border transition-all active:scale-90 ${isFiltered
              ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30 cursor-pointer hover:bg-indigo-500"
              : "bg-card/40 border-border text-foreground/20 cursor-not-allowed pointer-events-none"
              }`}
          >
            <RotateCcw className={`w-5 h-5 ${isFiltered ? 'animate-in spin-in-180 duration-700' : ''}`} />
          </button>
        </div>

        {/* <div className="rounded-2xl shadow-2xl bg-card/40 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-[2rem] shadow-2xl relative overflow-visible flex flex-col"> */}
        <div className="bg-card glass border-x border-b border-border rounded-3xl overflow-hidden shadow-2xl relative p-4 flex flex-col">

          {/* Top Clipping Container for perfect corners */}
          <div className=" w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 absolute top-0 left-0 rounded-t-3xl"></div>

          <div className="overflow-hidden">

            {/* Table View (Desktop Only) */}
            <div className="hidden md:block overflow-x-auto overflow-y-hidden text-amber-100">
              <table className="w-full text-left border-collapse min-w-[600px] md:min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-white/10 bg-background/30 text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Entity</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Contact Vector</th>
                    <th className="px-6 py-4">Authority</th>
                    <th className="px-6 py-4 hidden md:table-cell">Identity Stat</th>
                    <th className="px-6 py-4">System State</th>
                    <th className="px-6 py-4 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-white/5 transition-opacity duration-300 ${isRefetching ? 'opacity-40' : 'opacity-100'}`}>
                  {users.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <UserIcon className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-foreground font-bold">{user.first_name} {user.last_name}</p>
                            <p className="text-[10px] text-foreground/30 font-black">ID: {user.id.toString().padStart(4, '0')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <p className="text-foreground/70 text-sm font-medium">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${user.role === 'super_admin'
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                          }`}>
                          {user.role === 'super_admin' ? <ShieldAlert className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {user.is_verified ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">Verified</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase">Unsynced</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${user.status === 'active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          user.status === 'blocked' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                            "bg-muted/50 border-border text-foreground/40"
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-6 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          {user.role === 'super_admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider">
                              <ShieldAlert className="w-3 h-3" /> Protected
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => openEditModal(user)}
                                title="Edit Profile"
                                className="p-2.5 rounded-xl border border-border bg-card hover:bg-indigo-500/10 hover:text-indigo-400 text-foreground/40 transition-all active:scale-95 cursor-pointer"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setUserToDelete(user)}
                                title="Eradicate User"
                                className="p-2.5 rounded-xl border border-border bg-card hover:bg-rose-500/10 hover:text-rose-400 text-foreground/40 transition-all active:scale-95 cursor-pointer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                          <UserIcon className="w-12 h-12" />
                          <p className="text-xl font-black italic uppercase tracking-tighter">No Entities Found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Grid/Card View (Mobile Only) */}
            <div className="md:hidden p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {users.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {users.map((user) => (
                    <div key={user.id} className="bg-card/60 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-2xl p-5 shadow-lg relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>

                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20 shadow-inner overflow-hidden">
                            {user.profile_picture_url ? (
                              <img
                                src={getMediaUrl(user.profile_picture_url)}
                                alt={user.first_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-black text-indigo-400">{user.first_name[0]}{user.last_name[0]}</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <h4 className="font-black text-foreground text-base tracking-tight">{user.first_name} {user.last_name}</h4>
                            <span className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mt-0.5">ID: {user.id.toString().padStart(4, '0')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${user.status === 'active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            user.status === 'blocked' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                              "bg-muted/50 border-border text-foreground/40"
                            }`}>
                            {user.status}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${user.role === 'super_admin'
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                            }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 bg-background/30 rounded-xl p-3 border border-white/5 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-foreground/30 font-black uppercase">Contact Vector</span>
                          <span className="text-xs font-bold text-foreground/70 truncate max-w-[200px]">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-foreground/30 font-black uppercase">Identity Stat</span>
                          <span className={`text-[10px] font-black uppercase ${user.is_verified ? "text-emerald-400" : "text-amber-400"}`}>{user.is_verified ? "Verified" : "Unsynced"}</span>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                        <p className="text-[9px] text-foreground/20 font-bold italic">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                        {user.role === 'super_admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider">
                            <ShieldAlert className="w-3 h-3" /> Protected
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2.5 rounded-xl border border-border bg-card/60 hover:bg-indigo-500/10 hover:text-indigo-400 text-foreground/40 transition-all active:scale-95 cursor-pointer shadow-sm"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-2.5 rounded-xl border border-border bg-card/60 hover:bg-rose-500/10 hover:text-rose-400 text-foreground/40 transition-all active:scale-95 cursor-pointer shadow-sm"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-3 opacity-20">
                  <UserIcon className="w-12 h-12" />
                  <p className="text-xl font-black italic uppercase tracking-tighter">No Entities Found</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination Footer - Lives in the 'overflow-visible' zone */}
          <div className="p-3 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 bg-background/20 rounded-b-[2rem]">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
              <div className="flex items-center bg-card border border-border px-3 py-1 rounded-xl shadow-lg relative z-[200]">
                <span className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mr-3">Page Yield</span>
                <div className="w-20 relative">
                  <CustomSelect
                    value={itemsPerPage.toString()}
                    onChange={(val) => { setItemsPerPage(parseInt(val)); setCurrentPage(1); }}
                    placeholder={itemsPerPage.toString()}
                    size="sm"
                    position="bottom"
                    options={[5, 10, 15, 25, 50, 100].map(val => ({ value: val.toString(), label: val.toString() }))}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-foreground/40">
                Showing {totalUsers > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(totalUsers, currentPage * itemsPerPage)} of {totalUsers} entities
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-border bg-card hover:bg-foreground/5 text-foreground disabled:opacity-20 transition-all text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg active:scale-95"
              >
                Prev
              </button>

              <div className="flex items-center px-4 py-2 bg-foreground/5 rounded-xl border border-border/50">
                <span className="text-xs font-black text-primary">
                  {currentPage}
                </span>
                <span className="mx-2 text-foreground/20 text-[10px] font-bold">/</span>
                <span className="text-[10px] font-bold text-foreground/40">
                  {totalPages || 1}
                </span>
              </div>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-border bg-card hover:bg-foreground/5 text-foreground disabled:opacity-20 transition-all text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeletingUser}
        title="Eradicate Identity?"
        description={`This will permanently purge ${userToDelete?.first_name} ${userToDelete?.last_name} from the matrix. All access rights will be immediately revoked.`}
        confirmText="Eradicate"
      />
    </div>
  );
}

