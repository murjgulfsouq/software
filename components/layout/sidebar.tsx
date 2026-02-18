"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Receipt } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const [role, setRole] = useState<string>("staff");

    useEffect(() => {
        const storedRole = localStorage.getItem("user_role");
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);

    const allRoutes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            color: "text-sky-500",
            roles: ["admin"],
        },
        {
            label: "POS / Billing",
            icon: Receipt,
            href: "/billing",
            color: "text-violet-500",
            roles: ["admin", "staff"],
        },
        {
            label: "Products",
            icon: Package,
            href: "/products",
            color: "text-pink-700",
            roles: ["admin"],
        },
        {
            label: "Sales History",
            icon: ShoppingCart,
            href: "/sales",
            color: "text-orange-700",
            roles: ["admin"],
        },
        {
            label: "Staff",
            icon: Users,
            href: "/staff",
            color: "text-emerald-500",
            roles: ["admin"],
        },
    ];

    const routes = allRoutes.filter(route => route.roles.includes(role));

    const handleLogout = async () => {
        try {
            await fetch("/api/logout", { method: "POST" });
            localStorage.removeItem("user_role");
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className={cn("pb-12 space-y-4 flex flex-col h-full bg-slate-900 text-white", className)}>
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14 mt-4">
                    <h1 className="text-2xl font-bold">
                        Murj Gulf Sooq
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
