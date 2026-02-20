import { NextResponse } from "next/server";
import { Invoice } from "@/models/Invoice";
import { Product } from "@/models/Product";
import { getSessionUser } from "@/lib/auth-helper";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { products } = body;

        if (!products || products.length === 0) {
            return new NextResponse("No products in cart", { status: 400 });
        }

        await connectDB();

        try {
            let totalCount = 0;
            let subtotal = 0;
            const invoiceProducts = [];

            for (const item of products) {
                const product = await Product.findById(item.productId);

                if (!product) {
                    throw new Error(`Product not found`);
                }

                if (product.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                totalCount += item.quantity;
                const lineTotal = product.price * item.quantity;
                subtotal += lineTotal;

                invoiceProducts.push({
                    productId: product._id,
                    quantity: item.quantity,
                });
            }

            const totalAmount = subtotal;

            // Generate sequential invoice number
            const year = new Date().getFullYear();
            const lastInvoice = await Invoice.findOne()
                .sort({ createdAt: -1 });

            let sequenceNumber = 1;
            if (lastInvoice && lastInvoice.invoiceNumber) {
                const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
                sequenceNumber = lastSequence + 1;
            }

            const invoiceNumber = `INV-${year}-${String(sequenceNumber).padStart(5, '0')}`;
            const purchaseId = `PUR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const invoice = new Invoice({
                purchaseId,
                invoiceNumber,
                products: invoiceProducts,
                totalCount,
                subtotal,
                totalAmount,
                cashierName: user.name || user.email || "Staff",
                cashierId: user.id,
                paymentMethod: "Cash",
                createdBy: user.role === "admin" ? "static_admin_id" : user.id,
                status: "pending",
            });

            await invoice.save();

            const populatedInvoice = await Invoice.findById(invoice._id)
                .populate("products.productId")
                .lean();

            console.log("[BILLING_PREPARE_SUCCESS]", invoice.invoiceNumber);
            return NextResponse.json(populatedInvoice);

        } catch (error: any) {
            console.error("[BILLING_PREPARE_ERROR]", error);
            return new NextResponse(error.message || "Checkout preparation failed", { status: 400 });
        }
    } catch (error) {
        console.error("[BILLING_PREPARE_FATAL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
