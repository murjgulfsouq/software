"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const role = localStorage.getItem("user_role");

    if (!role) {
      router.push("/login");
      return;
    }

    switch (role) {
      case "admin":
        router.push("/dashboard");
        break;
      case "staff":
        router.push("/billing");
        break;
      default:
        router.push("/login");
        break;
    }
  }, [router, mounted]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
