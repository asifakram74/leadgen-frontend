"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If securely logged in, push to leads center. Otherwise force login.
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/leads");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center animate-pulse">
        <h1 className="text-foreground/40 font-medium text-lg flex items-center justify-center gap-3">
           <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
           Authenticating Route...
        </h1>
      </div>
    </div>
  );
}
