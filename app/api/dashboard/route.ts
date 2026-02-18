import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Product } from "@/models/Product";
import { Invoice } from "@/models/Invoice";
import { getSessionUser } from "@/lib/auth-helper";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function GET(req: Request) {
    try {
        const user = await getSessionUser();

        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectDB();

        // 1. Total Revenue
        const totalRevenueResult = await Invoice.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // 2. Sales Count (Invoices)
        const salesCount = await Invoice.countDocuments({ status: "completed" });

        // 3. Total Products & Stock
        const productsCount = await Product.countDocuments();
        const stockCountResult = await Product.aggregate([
            { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);
        const totalStock = stockCountResult[0]?.total || 0;

        // 4. Low Stock Products
        const lowStockProducts = await Product.find({ quantity: { $lt: 10 } })
            .select("name quantity")
            .limit(5);

        // 5. Recent Sales
        const recentSales = await Invoice.find({ status: "completed" })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("createdBy", "name email");

        // 6. Graph Data (Last 7 days revenue)
        const graphData = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const start = startOfDay(date);
            const end = endOfDay(date);

            const dayRevenue = await Invoice.aggregate([
                {
                    $match: {
                        createdAt: { $gte: start, $lte: end },
                        status: "completed"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" }
                    }
                }
            ]);

            graphData.push({
                name: format(date, "EEE"), // Mon, Tue...
                total: dayRevenue[0]?.total || 0
            });
        }

        return NextResponse.json({
            totalRevenue,
            salesCount,
            productsCount,
            totalStock,
            lowStockProducts,
            recentSales,
            graphData
        });

    } catch (error) {
        console.error("[DASHBOARD_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
