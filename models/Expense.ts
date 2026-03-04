import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpense extends Document {
    description: string;
    amount: number;
    date: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseSchema: Schema<IExpense> = new Schema(
    {
        description: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        date: { type: Date, required: true, default: Date.now },
        createdBy: { type: String, required: true },
    },
    { timestamps: true }
);

// Force re-registration of the model to clear cached hooks during development
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Expense;
}

export const Expense: Model<IExpense> =
    mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
