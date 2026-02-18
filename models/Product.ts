import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
    name: string;
    price: number;
    quantity: number;
    image: string;
    status: "active" | "inactive" | "out of stock";
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 0 },
        image: { type: String },
        status: {
            type: String,
            enum: ["active", "inactive", "out of stock"],
            default: "active",
        },
    },
    { timestamps: true }
);

ProductSchema.pre("save", async function () {
    if (this.quantity === 0) {
        this.status = "out of stock";
    } else if (this.status === "out of stock" && this.quantity > 0) {
        this.status = "active";
    }
});

// Force re-registration of the model to clear cached hooks during development
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Product;
}

export const Product: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
