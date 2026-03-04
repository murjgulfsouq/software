import { NextResponse } from "next/server";
import { Expense } from "@/models/Expense";
import { getSessionUser } from "@/lib/auth-helper";
import connectDB from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser();
        const { id } = await params;

        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectDB();

        const expense = await Expense.findByIdAndDelete(id);

        if (!expense) {
            return new NextResponse("Expense not found", { status: 404 });
        }

        return NextResponse.json(expense);
    } catch (error) {
        console.error("[EXPENSE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
