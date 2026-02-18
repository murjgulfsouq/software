
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;
        console.log(email, password);
        if (email === "staff@murjgulfsooq.com" && password === "staff123") {
            const response = NextResponse.json({ success: true, user: { name: "staff", email, role: "staff" } });

            response.cookies.set("staff_token", "staff_session_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, 
            });

            return response;
        }

        return new NextResponse("Invalid credentials", { status: 401 });
    } catch (error) {
        console.error("[STAFF_LOGIN]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

