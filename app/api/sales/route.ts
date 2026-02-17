import { NextResponse } from "next/server";
import { Invoice } from "@/models/Invoice";
import { getSessionUser } from "@/lib/auth-helper";
import connectDB from "@/lib/db";

export async function GET(req: Request) {
    try {
        const user = await getSessionUser();

        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectDB();

        const invoices = await Invoice.find()
            .sort({ createdAt: -1 })
            .populate("createdBy", "name");

        return NextResponse.json(invoices);
    } catch (error) {
        console.error("[SALES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
