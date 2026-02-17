import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const adminToken = req.cookies.get("admin_token");
    const staffToken = req.cookies.get("staff_token");
    const path = req.nextUrl.pathname;

    // Admin only routes
    if (
        path.startsWith("/admin") ||
        path.startsWith("/dashboard") ||
        path.startsWith("/products") ||
        path.startsWith("/sales") ||
        path.startsWith("/staff")
    ) {
        // If we want strict server-side protection, we need cookies.
        // Since user removed cookie setting in staff login, we accept adminToken OR just rely on client-side if cookies are missing.
        // However, ignoring auth on server-side for admin routes is risky.
        // But user said "don't check with next auth" and "take role from local storage". 
        // LocalStorage isn't available in middleware.
        // We will keep basic cookie check if available, but if user logged in via the new staff flow (no cookie), 
        // they might get blocked here if we are strict. 
        // User's staff login removes cookie setting. So Staff won't have a token.
        // If Staff tries to access /products (Admin route), they should be blocked.
        // But if they try to access /billing (Staff route), it should be allowed.

        // Admin check:
        if (adminToken) {
            return NextResponse.next();
        }

        // We can't verify staff here easily without a cookie. 
        // If the user insists on localStorage, we have to let the client handle it 
        // OR we just don't protect these routes on the server side at all?
        // Let's redirect to login if no admin token, assuming admin login STILL sets usage cookie.
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
