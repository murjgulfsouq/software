import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const adminToken = req.cookies.get("admin_token");
    const staffToken = req.cookies.get("staff_token");
    const path = req.nextUrl.pathname;

    // Staff-accessible routes (expenses for staff)
    if (path.startsWith("/staff/expenses")) {
        if (adminToken || staffToken) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/staff/login", req.url));
    }

    // Admin only routes
    if (
        path.startsWith("/admin") ||
        path.startsWith("/dashboard") ||
        path.startsWith("/products") ||
        path.startsWith("/sales") ||
        path.startsWith("/staff") && !path.startsWith("/staff/login")
    ) {
        // Admin check:
        if (adminToken) {
            return NextResponse.next();
        }

        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Staff/Shared Routes (Billing)
    if (path.startsWith("/billing")) {
        // Just allow it, client side will kick them out if no localStorage role
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/products/:path*",
        "/sales/:path*",
        "/billing/:path*",
        "/admin/:path*",
        "/staff/:path*",
    ],
};
