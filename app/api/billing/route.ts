import { NextResponse } from "next/server";
import { Invoice } from "@/models/Invoice";
import { Product } from "@/models/Product";
import { getSessionUser } from "@/lib/auth-helper";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

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
        const sessionMongo = await mongoose.startSession();
        sessionMongo.startTransaction();
        console.log("invooce data fetching from backend")
        try {
            let totalCount = 0;
            let subtotal = 0;
            const invoiceProducts = [];

            // Process each product in the cart
            for (const item of products) {
                const product = await Product.findById(item.productId).session(sessionMongo);

                if (!product) {
                    throw new Error(`Product ${item.name} not found`);
                }

                if (product.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                product.quantity -= item.quantity;
                if (product.quantity === 0) {
                    product.status = "out of stock";
                }
                await product.save({ session: sessionMongo });

                totalCount += item.quantity;
                const lineTotal = product.price * item.quantity;
                subtotal += lineTotal;

                invoiceProducts.push({
                    productId: product._id,
                    quantity: item.quantity,
                });
            }

            // Tax calculation (5% VAT - configurable)
            const TAX_RATE = 5; // 5% VAT
            const taxAmount = (subtotal * TAX_RATE) / 100;
            const totalAmount = subtotal + taxAmount;

            // Generate sequential invoice number
            const year = new Date().getFullYear();
            const lastInvoice = await Invoice.findOne()
                .sort({ createdAt: -1 })
                .session(sessionMongo);

            let sequenceNumber = 1;
            if (lastInvoice && lastInvoice.invoiceNumber) {
                const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
                sequenceNumber = lastSequence + 1;
            }

            const invoiceNumber = `INV-${year}-${String(sequenceNumber).padStart(5, '0')}`;
            const purchaseId = `PUR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // Create invoice with enhanced data
            const invoice = new Invoice({
                purchaseId,
                invoiceNumber,
                products: invoiceProducts,
                totalCount,
                subtotal,
                taxRate: TAX_RATE,
                taxAmount,
                totalAmount,
                cashierName: user.name || user.email || "Staff",
                cashierId: user.id,
                paymentMethod: "Cash", // Default to Cash, can be enhanced later
                createdBy: user.role === "admin" ? "static_admin_id" : user.id,
                status: "completed",
            });

            await invoice.save({ session: sessionMongo });

            await sessionMongo.commitTransaction();
            sessionMongo.endSession();

            // Populate product details before returning and convert to plain object
            const populatedInvoice = await Invoice.findById(invoice._id)
                .populate("products.productId")
                .lean();

            console.log("[BILLING_POST_SUCCESS]", invoice.invoiceNumber);
            return NextResponse.json(populatedInvoice);

        } catch (error: any) {
            console.error("[BILLING_POST_ERROR]", error);
            if (sessionMongo) {
                await sessionMongo.abortTransaction();
                sessionMongo.endSession();
            }
            return new NextResponse(error.message || "Checkout failed", { status: 400 });
        }
    } catch (error) {
        console.error("[BILLING_POST_FATAL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}