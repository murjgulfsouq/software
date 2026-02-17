"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if(!role) router.push('/login')
      
    if (role === "admin") {
      router.push("/dashboard");
    } else if (role === "staff") {
      router.push("/billing");
    } else {
      router.push("/login");
    }
  }, [router]);

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
}
