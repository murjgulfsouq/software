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
        const { invoiceId } = body;

        if (!invoiceId) {
            return new NextResponse("Invoice ID required", { status: 400 });
        }

        await connectDB();
        const sessionMongo = await mongoose.startSession();
        sessionMongo.startTransaction();

        try {
            const invoice = await Invoice.findById(invoiceId)
                .populate("products.productId")
                .session(sessionMongo);

            if (!invoice) {
                throw new Error("Invoice not found");
            }

            if (invoice.status !== "pending") {
                throw new Error("Invoice already processed");
            }

            for (const item of invoice.products) {
                const product = await Product.findById(item.productId._id).session(sessionMongo);

                if (!product) {
                    throw new Error(`Product not found`);
                }

                if (product.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                product.quantity -= item.quantity;
                if (product.quantity === 0) {
                    product.status = "out of stock";
                }
                await product.save({ session: sessionMongo });
            }

            invoice.status = "completed";
            await invoice.save({ session: sessionMongo });

            await sessionMongo.commitTransaction();
            sessionMongo.endSession();

            console.log("[BILLING_CONFIRM_SUCCESS]", invoice.invoiceNumber);
            return NextResponse.json({ success: true, invoice });

        } catch (error: any) {
            console.error("[BILLING_CONFIRM_ERROR]", error);
            if (sessionMongo) {
                await sessionMongo.abortTransaction();
                sessionMongo.endSession();
            }
            return new NextResponse(error.message || "Confirmation failed", { status: 400 });
        }
    } catch (error) {
        console.error("[BILLING_CONFIRM_FATAL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
