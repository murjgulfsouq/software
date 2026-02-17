
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;
        if (email === "staff@murjgulfsooq.com" && password === "staff123") {
            return NextResponse.json({ success: true, user: { name: "staff", email, role: "staff" } });
        }

        return new NextResponse("Invalid credentials", { status: 401 });
    } catch (error) {
        console.error("[STAFF_LOGIN]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

