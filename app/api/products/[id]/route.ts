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
        const { name, price, quantity, image, status } = body;

        await connectDB();

        let newStatus = status;
        if (quantity === 0) {
            newStatus = "out of stock";
        }

        const product = await Product.findByIdAndUpdate(
            id,
            {
                name,
                price,
                quantity,
                image,
                status: newStatus,
            },
            { new: true }
        );

        return NextResponse.json(product);
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