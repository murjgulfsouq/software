import { NextResponse } from "next/server";
import { Expense } from "@/models/Expense";
import { getSessionUser } from "@/lib/auth-helper";
import connectDB from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();

        if (!user || (user.role !== "admin" && user.role !== "staff")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { description, amount, date } = body;

        if (!description || !amount) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        await connectDB();

        const expense = await Expense.create({
            description,
            amount,
            date: date || new Date(),
            createdBy: user.name,
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error("[EXPENSES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const user = await getSessionUser();

        if (!user || (user.role !== "admin" && user.role !== "staff")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        await connectDB();

        let filter: any = {};

        if (startDate && endDate) {
            filter.date = {
                $gte: startOfDay(new Date(startDate)),
                $lte: endOfDay(new Date(endDate)),
            };
        }

        const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error("[EXPENSES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
