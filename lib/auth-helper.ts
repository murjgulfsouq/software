import { cookies } from "next/headers";

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
        return {
            id: staffToken.value,
            name: "Staff",
            email: "staff@murjgulfsooq.com",
            role: "staff",
        };
    }

    return null;
}
