import connectDB from "@/lib/db";
import { Product } from "@/models/Product";
import DashboardLayout from "../dashboard/layout";
import { POSClient } from "@/components/billing/pos-client";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
    await connectDB();
    const products = await Product.find({ status: { $ne: "inactive" } }).sort({ name: 1 });

    const formattedProducts = products.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        price: item.price,
        offerPrice: item.offerPrice,
        quantity: item.quantity,
        image: item.image,
        status: item.status,
    }));

    return (
        <DashboardLayout>
            <div className="flex-1 space-y-4 p-8 pt-6 h-full flex flex-col">
                <POSClient initialProducts={formattedProducts} />
            </div>
        </DashboardLayout>
    );
}
