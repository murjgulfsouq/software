import connectDB from "@/lib/db";
import { Product } from "@/models/Product";
import { ProductClient } from "@/components/products/product-client";
import { format } from "date-fns";
import DashboardLayout from "../dashboard/layout";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();

    const formattedProducts = products.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        price: item.price,
        offerPrice: item.offerPrice,
        quantity: item.quantity,
        image: item.image,
        status: item.status,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return (
        <DashboardLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductClient data={formattedProducts} />
            </div>
        </DashboardLayout>
    );
}