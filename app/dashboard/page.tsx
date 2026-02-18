import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helper";
import DashboardClient from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {

    const user = await getSessionUser();
    console.log(user)

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    return (
        <DashboardClient />
    );
}
