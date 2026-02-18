"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const role = localStorage.getItem("user_role");
    setUserRole(role);

    // Redirect based on role
    if (role === "admin") {
      router.push("/dashboard");
    } else if (role === "staff") {
      router.push("/billing");
    }
  }, [mounted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const adminResp = await axios.post("/api/admin/login", { email, password });
      if (adminResp.data.success) {
        toast.success("Admin Login successful");
        localStorage.setItem("user_role", "admin");
        setUserRole("admin");
      }
    } catch (error) {
      console.log(error);
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  console.log(userRole)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }


  if (userRole === "staff") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Redirecting to billing...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Access Dashboard &amp; Management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In as Admin
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 justify-center border-t p-6">
          <p className="text-sm text-gray-500">
            Staff member? <Link href="/staff/login" className="text-blue-600 hover:underline">Login here</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

