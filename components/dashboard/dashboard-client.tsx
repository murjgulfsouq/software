"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { RecentSales } from "@/components/dashboard/recent-sales";
import {
    CreditCard, Package, DollarSign, Activity, AlertTriangle, TrendingUp, ArrowUpRight, BarChart2
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardClient() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/api/dashboard")
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to fetch dashboard stats", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-sm text-muted-foreground mt-1">{today}</p>
                </div>
                <Link href="/analytics">
                    <Button variant="outline" className="gap-2 text-sm font-medium border-primary/30 hover:bg-primary/5">
                        <BarChart2 className="h-4 w-4" />
                        View Full Analytics
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                </Link>
            </div>

            {/* Today's Stat Cards */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today&apos;s Performance</h3>
                    <Badge variant="secondary" className="text-xs">Live</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Daily Net Revenue */}
                    <Card className="border-green-200 dark:border-green-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                                Today&apos;s Net Revenue
                            </CardTitle>
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                INR {(stats.dailyNetRevenue || 0).toFixed(3)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Gross sales − expenses today</p>
                        </CardContent>
                    </Card>

                    {/* Daily Gross Revenue */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today&apos;s Gross Sales</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">INR {(stats.dailyRevenue || 0).toFixed(3)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total invoiced today</p>
                        </CardContent>
                    </Card>

                    {/* Daily Expenses */}
                    <Card className="border-red-200 dark:border-red-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                                Today&apos;s Expenses
                            </CardTitle>
                            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                INR {(stats.dailyExpenses || 0).toFixed(3)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Expenses recorded today</p>
                        </CardContent>
                    </Card>

                    {/* Daily Sales Count */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today&apos;s Invoices</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{stats.dailySalesCount || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Transactions completed today</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Inventory Summary Cards */}
            <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Inventory</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products In Stock</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.productsCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stats.totalStock} total items</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.lowStockProducts.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Items requiring restock</p>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-200 dark:border-emerald-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Stock Value</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                INR {(stats.totalStockValue || 0).toFixed(3)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Price × qty across all products</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Low Stock Alert */}
            {stats.lowStockProducts.length > 0 && (
                <div className="w-full bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 font-semibold">
                        <AlertTriangle className="h-5 w-5" />
                        <h3>Low Stock Alert</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {stats.lowStockProducts.map((p: any) => (
                            <div key={p._id} className="text-sm text-yellow-700 dark:text-yellow-300 bg-white dark:bg-yellow-900/40 px-2 py-1 rounded border border-yellow-100 dark:border-yellow-800">
                                {p.name} ({p.quantity} left)
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 7-Day Chart + Recent Sales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>7-Day Overview</CardTitle>
                        <CardDescription>Daily revenue for the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={stats.graphData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            {stats.salesCount} total lifetime invoices
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
