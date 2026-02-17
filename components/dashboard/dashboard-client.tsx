"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { CreditCard, Package, DollarSign, Activity, AlertTriangle } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function DashboardClient() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("/api/dashboard");
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">INR {stats.totalRevenue.toFixed(3)}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime revenue
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sales
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.salesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total invoices
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products In Stock</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.productsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalStock} total items
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Low Stock
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStockProducts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Items requiring restock
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alert Section */}
            {stats.lowStockProducts.length > 0 && (
                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-md p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-yellow-800 font-semibold">
                        <AlertTriangle className="h-5 w-5" />
                        <h3>Low Stock Alert</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {stats.lowStockProducts.map((p: any) => (
                            <div key={p._id} className="text-sm text-yellow-700 bg-white px-2 py-1 rounded border border-yellow-100">
                                {p.name} ({p.quantity} left)
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={stats.graphData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            You made {stats.salesCount} sales total.
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RecentSales data={stats.recentSales} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
