import connectDB from "@/lib/db";
import DashboardLayout from "../dashboard/layout";

export default async function StaffPage() {
    await connectDB();

    return (
        <DashboardLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
            </div>
        </DashboardLayout>
    );
}
