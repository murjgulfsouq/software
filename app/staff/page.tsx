import connectDB from "@/lib/db";
import DashboardLayout from "../dashboard/layout";
import { getSessionUser } from "@/lib/auth-helper";

export default async function StaffPage() {
    await connectDB();

    const user = await getSessionUser();
    console.log(user)


    return (
        <DashboardLayout>
            <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 pt-6 min-h-[50vh]">
                <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
                <p className="text-muted-foreground text-lg">Coming Soon...</p>
            </div>
        </DashboardLayout>
    );
}
