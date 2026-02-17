import mongoose, { Schema, Document, Model } from "mongoose";

interface IInvoiceItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
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
                quantity: { type: Number, required: true },
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

// Force re-registration of the model to clear cached hooks/schema during development
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Invoice;
}

export const Invoice: Model<IInvoice> =
    mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);

