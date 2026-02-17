import connectDB from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import DashboardLayout from "../dashboard/layout";
import { format } from "date-fns";
import { SalesClient } from "@/components/sales/sales-client";

export default async function SalesPage() {
    await connectDB();

    const invoices = await Invoice.find().sort({ createdAt: -1 }).populate("createdBy", "name");

    const formattedSales = invoices.map((item) => ({
        id: item._id.toString(),
        purchaseId: item.purchaseId,
        totalCount: item.totalCount,
        totalAmount: item.totalAmount,
        createdBy: item.createdBy,
        createdAt: format(item.createdAt, "MMMM do, yyyy HH:mm"),
    }));

    return (
        <DashboardLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SalesClient data={formattedSales} />
            </div>
        </DashboardLayout>
    );
}
