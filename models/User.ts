import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: "admin" | "staff";
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        role: {
            type: String,
            enum: ["admin", "staff"],
            default: "staff",
        },
    },
    {
        timestamps: true,
    }
);

export const User = models.User || model<IUser>("User", UserSchema);
