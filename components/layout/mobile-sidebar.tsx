"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar whenever the route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* Hamburger button */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/10"
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
            >
                <Menu className="h-6 w-6" />
            </Button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-in drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-[100] w-72 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Close button inside drawer */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu"
                >
                    <X className="h-5 w-5" />
                </Button>

                <Sidebar />
            </div>
        </>
    );
}
