import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            {/* Desktop sidebar */}
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>

            {/* Mobile top navbar */}
            <div className="md:hidden flex items-center h-14 px-4 bg-slate-900 border-b border-white/10 sticky top-0 z-[80]">
                <MobileSidebar />
                <span className="ml-3 text-white font-bold text-lg">Murj Gulf Souq</span>
            </div>

            <main className="md:pl-72 h-full">
                {children}
            </main>
        </div>
    );
}