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

        try {
            let totalCount = 0;
            let totalAmount = 0;
            const invoiceProducts = [];

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
                    product.status = "out_of_stock";
                }
                await product.save({ session: sessionMongo });

                totalCount += item.quantity;
                const lineTotalCalc = product.price * item.quantity;
                totalAmount += lineTotalCalc;

                invoiceProducts.push({
                    productId: product._id,
                    quantity: item.quantity,
                });
            }

            // Generate Invoice ID (e.g., INV-TIMESTAMP-RANDOM)
            const purchaseId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const invoice = new Invoice({
                purchaseId,
                products: invoiceProducts,
                totalCount,
                totalAmount,
                createdBy: user.role === "admin" ? "static_admin_id" : user.id,
            });

            await invoice.save({ session: sessionMongo });

            await sessionMongo.commitTransaction();
            sessionMongo.endSession();

            // Populate product details before returning and convert to plain object
            const populatedInvoice = await Invoice.findById(invoice._id)
                .populate("products.productId")
                .lean();

            console.log("[BILLING_POST_SUCCESS]", invoice.purchaseId);
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

