import mongoose, { Schema, Document, Model } from "mongoose";

interface IInvoiceItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    total: number;
}

export interface IInvoice extends Document {
    purchaseId: string;
    products: IInvoiceItem[];
    totalCount: number;
    totalAmount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceSchema: Schema<IInvoice> = new Schema(
    {
        purchaseId: { type: String, required: true, unique: true },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                total: { type: Number, required: true },
            },
        ],
        totalCount: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        createdBy: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const Invoice: Model<IInvoice> =
    mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
