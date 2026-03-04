import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helper";
import { AnalyticsClient } from "@/components/analytics/analytics-client";

export default async function AnalyticsPage() {
    const user = await getSessionUser();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    return <AnalyticsClient />;
}
