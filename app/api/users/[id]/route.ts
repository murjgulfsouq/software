import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/auth-helper";
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }

) {
    try {
        const userSession = await getSessionUser();
        const { id } = await params;

        if (!userSession || userSession.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, email, password, role } = body;

        await connectDB();

        const updateData: any = { name, email, role };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });

        return NextResponse.json(user);
    } catch (error) {
        console.error("[USER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userSession = await getSessionUser();
        const { id } = await params;

        if (!userSession || userSession.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectDB();

        const user = await User.findByIdAndDelete(id);

        return NextResponse.json(user);
    } catch (error) {
        console.error("[USER_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
