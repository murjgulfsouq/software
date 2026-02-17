import { cookies } from "next/headers";

export async function getSessionUser() {
    const cookieStore = await cookies();

    // 1. Check for Admin Cookie
    const adminToken = cookieStore.get("admin_token");
    if (adminToken) {
        return {
            id: "static_admin_id",
            name: "Admin User",
            email: "admin@murjgulfsooq.com",
            role: "admin",
        };
    }

    // 2. Check for Staff Cookie
    const staffToken = cookieStore.get("staff_token");
    if (staffToken) {
        return {
            id: staffToken.value,
            name: "Staff User",
            email: "staff@murjgulfsooq.com",
            role: "staff",
        };
    }

    return null;
}
