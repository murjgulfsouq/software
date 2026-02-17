import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;
        if (email === "admin@murjgulfsooq.com" && password === "admin@321") {
            return NextResponse.json({ success: true, user: { name: "Admin", email, role: "admin" } });
        }

        return new NextResponse("Invalid credentials", { status: 401 });
    } catch (error) {
        console.error("[ADMIN_LOGIN]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
