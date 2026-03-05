import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

export async function getSessionUser() {
    const cookieStore = await cookies();

    const adminToken = cookieStore.get("admin_token");
    if (adminToken) {
        return {
            id: "static_admin_id",
            name: "Admin",
            email: "admin@murjgulfsooq.com",
            role: "admin",
        };
    }

    const staffToken = cookieStore.get("staff_token");
    if (staffToken) {
        try {
            await connectDB();
            // Find the staff user by role to get their real name
            const staffUser = await User.findOne({ role: "staff" }).lean();
            const staffName = staffUser ? (staffUser as any).name : "Staff";
            return {
                id: staffToken.value,
                name: staffName,
                email: staffUser ? (staffUser as any).email : "staff@murjgulfsooq.com",
                role: "staff",
            };
        } catch {
            return {
                id: staffToken.value,
                name: "Staff",
                email: "staff@murjgulfsooq.com",
                role: "staff",
            };
        }
    }

    return null;
}
