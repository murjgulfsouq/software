import { NextResponse } from "next/server";
import { Product } from "@/models/Product";
import { getSessionUser } from "@/lib/auth-helper";
import connectDB from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const product = await Product.findById(id);

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser();
        const { id } = await params;

        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const body = await req.json();
        const { name, price, quantity, image, status, offerAmount, offerType, removeOffer } = body;

        await connectDB();

        const product = await Product.findById(id);
        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        // Build basic update payload
        const updateFields: Record<string, any> = {};
        if (name !== undefined) updateFields.name = name;
        if (price !== undefined) updateFields.price = price;
        if (quantity !== undefined) updateFields.quantity = quantity;
        if (image !== undefined) updateFields.image = image;
        if (status !== undefined) updateFields.status = status;

        // Offer handling
        let offerUpdate: Record<string, any> = {};

        if (removeOffer) {
            // Properly unset the field in MongoDB
            offerUpdate = { $unset: { offerPrice: 1 } };
        } else if (offerAmount !== undefined && offerAmount !== null && Number(offerAmount) > 0) {
            const basePrice = price !== undefined ? Number(price) : product.price;
            const type = offerType === "fixed" ? "fixed" : "percent";

            let computedOfferPrice: number;
            if (type === "fixed") {
                computedOfferPrice = Math.max(0, basePrice - Number(offerAmount));
            } else {
                const pct = Number(offerAmount);
                computedOfferPrice = Math.max(0, basePrice * (1 - pct / 100));
            }
            updateFields.offerPrice = computedOfferPrice;
        }

        const updated = await Product.findByIdAndUpdate(
            id,
            { $set: updateFields, ...offerUpdate },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return new NextResponse("Product not found", { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PRODUCT_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser();
        const { id } = await params;

        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectDB();

        const product = await Product.findByIdAndDelete(id);

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}