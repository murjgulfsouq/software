import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;
        if (email === "admin@murjgulfsooq.com" && password === "admin@321") {
            const response = NextResponse.json({
                success: true,
                user: { name: "Admin", email, role: "admin" }
            });

            // Set the admin_token cookie for server-side authentication
            response.cookies.set("admin_token", "admin_session_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            return response;
        }

        return new NextResponse("Invalid credentials", { status: 401 });
    } catch (error) {
        console.error("[ADMIN_LOGIN]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
