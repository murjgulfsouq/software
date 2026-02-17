import { NextResponse } from "next/server";
import { Product } from "@/models/Product";
import { getSessionUser } from "@/lib/auth-helper";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();

        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, price, quantity, image, status } = body;

        if (!name || !price || quantity === undefined) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        await connectDB();

        const product = await Product.create({
            name,
            price,
            quantity,
            image,
            status: quantity === 0 ? "out_of_stock" : status || "active",
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query");

        await connectDB();

        let filter: any = {};
        if (query) {
            filter.name = { $regex: query, $options: "i" };
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });

        return NextResponse.json(products);
    } catch (error) {
        console.error("[PRODUCTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
