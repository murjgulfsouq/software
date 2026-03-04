import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Product } from "@/models/Product";
import { Invoice } from "@/models/Invoice";
import { Expense } from "@/models/Expense";
import { getSessionUser } from "@/lib/auth-helper";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function GET(req: Request) {
    try {
        const user = await getSessionUser();

        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectDB();

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // ── Daily Stats ──────────────────────────────────────────────
        const dailyRevenueResult = await Invoice.aggregate([
            { $match: { status: "completed", createdAt: { $gte: todayStart, $lte: todayEnd } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);
        const dailyRevenue = dailyRevenueResult[0]?.total || 0;

        const dailyExpensesResult = await Expense.aggregate([
            { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const dailyExpenses = dailyExpensesResult[0]?.total || 0;

        const dailyNetRevenue = dailyRevenue - dailyExpenses;

        const dailySalesCount = await Invoice.countDocuments({
            status: "completed",
            createdAt: { $gte: todayStart, $lte: todayEnd },
        });

        // ── Lifetime Stats ───────────────────────────────────────────
        const totalRevenueResult = await Invoice.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        const totalExpensesResult = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const totalExpenses = totalExpensesResult[0]?.total || 0;

        const netRevenue = totalRevenue - totalExpenses;
        const salesCount = await Invoice.countDocuments({ status: "completed" });

        // ── Products & Stock ─────────────────────────────────────────
        const productsCount = await Product.countDocuments();
        const stockCountResult = await Product.aggregate([
            { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);
        const totalStock = stockCountResult[0]?.total || 0;

        // Total value of all products in stock (price × quantity)
        const stockValueResult = await Product.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ["$price", "$quantity"] } } } },
        ]);
        const totalStockValue = stockValueResult[0]?.total || 0;

        const lowStockProducts = await Product.find({ quantity: { $lt: 10 } })
            .select("name quantity")
            .limit(5);

        // ── Recent Sales ─────────────────────────────────────────────
        const recentSales = await Invoice.find({ status: "completed" })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("createdBy", "name email");

        // ── 7-Day Graph ──────────────────────────────────────────────
        const graphData = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const start = startOfDay(date);
            const end = endOfDay(date);

            const dayRevenue = await Invoice.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end }, status: "completed" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]);

            graphData.push({
                name: format(date, "EEE"),
                total: dayRevenue[0]?.total || 0,
            });
        }

        return NextResponse.json({
            // daily
            dailyRevenue,
            dailyExpenses,
            dailyNetRevenue,
            dailySalesCount,
            // lifetime
            totalRevenue,
            totalExpenses,
            netRevenue,
            salesCount,
            // products
            productsCount,
            totalStock,
            totalStockValue,
            lowStockProducts,
            // misc
            recentSales,
            graphData,
        });
    } catch (error) {
        console.error("[DASHBOARD_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
