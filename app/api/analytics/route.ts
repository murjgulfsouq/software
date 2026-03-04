import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { Expense } from "@/models/Expense";
import { getSessionUser } from "@/lib/auth-helper";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectDB();

        // ── 30-day Area Chart (Revenue & Expenses per day) ───────────
        const areaData = [];
        for (let i = 29; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const start = startOfDay(date);
            const end = endOfDay(date);

            const [revResult, expResult] = await Promise.all([
                Invoice.aggregate([
                    { $match: { status: "completed", createdAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                ]),
                Expense.aggregate([
                    { $match: { createdAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: "$amount" } } },
                ]),
            ]);

            areaData.push({
                date: format(date, "MMM d"),
                revenue: revResult[0]?.total || 0,
                expenses: expResult[0]?.total || 0,
            });
        }

        // ── 6-Month Bar Chart ────────────────────────────────────────
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const month = subMonths(new Date(), i);
            const start = startOfMonth(month);
            const end = endOfMonth(month);

            const result = await Invoice.aggregate([
                { $match: { status: "completed", createdAt: { $gte: start, $lte: end } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]);

            monthlyData.push({
                month: format(month, "MMM yyyy"),
                revenue: result[0]?.total || 0,
            });
        }

        // ── Lifetime Totals for Pie Chart ────────────────────────────
        const [totalRevResult, totalExpResult, salesCount] = await Promise.all([
            Invoice.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            Expense.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Invoice.countDocuments({ status: "completed" }),
        ]);

        const totalRevenue = totalRevResult[0]?.total || 0;
        const totalExpenses = totalExpResult[0]?.total || 0;
        const netRevenue = totalRevenue - totalExpenses;

        const pieData = [
            { name: "Net Revenue", value: netRevenue > 0 ? netRevenue : 0, fill: "#22c55e" },
            { name: "Expenses", value: totalExpenses, fill: "#ef4444" },
        ];

        // ── Top 5 Best-Selling Products ──────────────────────────────
        const topProducts = await Invoice.aggregate([
            { $match: { status: "completed" } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    name: { $first: "$items.name" },
                    unitsSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
                },
            },
            { $sort: { unitsSold: -1 } },
            { $limit: 5 },
        ]);

        return NextResponse.json({
            areaData,
            monthlyData,
            pieData,
            totalRevenue,
            totalExpenses,
            netRevenue,
            salesCount,
            topProducts,
        });
    } catch (error) {
        console.error("[ANALYTICS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
