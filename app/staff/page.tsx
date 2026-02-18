import connectDB from "@/lib/db";
import DashboardLayout from "../dashboard/layout";
import { getSessionUser } from "@/lib/auth-helper";

export default async function StaffPage() {
    await connectDB();

    const user = await getSessionUser();
    console.log(user)
    

    return (
        <DashboardLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
            </div>
        </DashboardLayout>
    );
}
