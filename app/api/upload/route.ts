import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSessionUser } from "@/lib/auth-helper";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new NextResponse("No file provided", { status: 400 });
        }

        // Convert File to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64, {
            folder: "products",
            resource_type: "image",
        });

        return NextResponse.json({ secure_url: result.secure_url });
    } catch (error) {
        console.error("[UPLOAD_POST]", error);
        return new NextResponse("Upload failed", { status: 500 });
    }
}
