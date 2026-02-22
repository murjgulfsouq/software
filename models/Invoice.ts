import mongoose, { Schema, Document, Model } from "mongoose";

interface IInvoiceItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
}

export interface IInvoice extends Document {
    purchaseId: string;
    invoiceNumber: string; // Human-readable sequential number (e.g., INV-2026-00001)
    products: IInvoiceItem[];
    totalCount: number;
    subtotal: number; // Cart total at offer/regular prices (before any bill discount)
    discountTotal: number; // Combined savings: offer-price discounts + cashier bill discount
    taxRate: number; // Tax percentage (e.g., 5 for 5%)
    taxAmount: number; // Calculated tax amount
    totalAmount: number; // Final amount customer pays
    cashierName: string; // Staff member who processed the sale
    cashierId: string; // Reference to user ID
    paymentMethod: string; // Payment type (Cash, Card, etc.)
    status: string; // Invoice status: pending, completed, cancelled
    notes?: string; // Optional notes
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceSchema: Schema<IInvoice> = new Schema(
    {
        purchaseId: { type: String, required: true, unique: true },
        invoiceNumber: { type: String, required: true, unique: true },
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
        subtotal: { type: Number, required: true },
        discountTotal: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        cashierName: { type: String, required: true },
        cashierId: { type: String, required: true },
        paymentMethod: { type: String, required: true, default: "Cash" },
        status: { type: String, required: true, default: "pending", enum: ["pending", "completed", "cancelled"] },
        notes: { type: String },
        createdBy: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Invoice;
}

export const Invoice: Model<IInvoice> =
    mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);

