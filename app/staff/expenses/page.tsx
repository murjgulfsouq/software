import connectDB from "@/lib/db";
import { Expense } from "@/models/Expense";
import DashboardLayout from "../../dashboard/layout";
import { ExpenseClient } from "@/components/expenses/expense-client";

export const dynamic = "force-dynamic";

export default async function StaffExpensesPage() {
    await connectDB();

    // Fetch all expenses, newest first
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 }).lean();

    // Format for the data table
    const formattedExpenses = expenses.map((item: any) => ({
        id: item._id.toString(),
        description: item.description,
        amount: item.amount,
        date: item.date ? item.date.toISOString() : new Date().toISOString(),
        createdBy: item.createdBy,
    }));

    return (
        <DashboardLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ExpenseClient data={formattedExpenses} />
            </div>
        </DashboardLayout>
    );
}
