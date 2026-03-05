"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig
} from "@/components/ui/chart";
import { Loader2, TrendingUp, DollarSign, CreditCard, ShoppingBag, Trophy } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const areaChartConfig: ChartConfig = {
    revenue: { label: "Revenue", color: "#3b82f6" },
    expenses: { label: "Expenses", color: "#ef4444" },
};

const barChartConfig: ChartConfig = {
    revenue: { label: "Monthly Revenue", color: "#8b5cf6" },
};

const PIE_COLORS = ["#22c55e", "#ef4444"];

function StatCard({
    label, value, sub, icon: Icon, colorClass,
}: {
    label: string; value: string; sub: string; icon: any; colorClass: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${colorClass}`}>{label}</CardTitle>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center bg-opacity-10 ${colorClass.replace("text-", "bg-").replace("-600", "-100").replace("-400", "-900")}`}>
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className={`text-xl sm:text-2xl font-bold tracking-tight ${colorClass} break-all`}>{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
        </Card>
    );
}

interface CustomLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
}

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomLabelProps) {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

export function AnalyticsClient() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/api/analytics")
            .then(res => setData(res.data))
            .catch(err => console.error("Analytics fetch failed", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    const formatINR = (n: number) => `INR ${n.toFixed(3)}`;

    return (
        <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 pt-4 sm:pt-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h2>
                <p className="text-sm text-muted-foreground mt-1">Full historical performance overview</p>
            </div>

            {/* Summary Stat Cards — 1 col mobile, 2 col tablet, 4 col desktop */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Lifetime Net Revenue"
                    value={formatINR(data.netRevenue || 0)}
                    sub="Total sales minus all expenses"
                    icon={TrendingUp}
                    colorClass="text-green-600"
                />
                <StatCard
                    label="Gross Revenue"
                    value={formatINR(data.totalRevenue || 0)}
                    sub="Total of all completed invoices"
                    icon={DollarSign}
                    colorClass="text-blue-600"
                />
                <StatCard
                    label="Lifetime Expenses"
                    value={formatINR(data.totalExpenses || 0)}
                    sub="All recorded expenses"
                    icon={ShoppingBag}
                    colorClass="text-red-600"
                />
                <StatCard
                    label="Total Invoices"
                    value={`${data.salesCount || 0}`}
                    sub="Completed transactions ever"
                    icon={CreditCard}
                    colorClass="text-violet-600"
                />
            </div>

            <Separator />

            {/* Area Chart — 30-day Revenue vs Expenses */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg">30-Day Revenue vs Expenses</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Daily breakdown for the last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    <ChartContainer config={areaChartConfig} className="h-[220px] sm:h-[280px] md:h-[320px] w-full">
                        <AreaChart data={data.areaData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                            <XAxis
                                dataKey="date"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval={6}
                                tick={{ fill: "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                width={45}
                                tickFormatter={(v) => `${v}`}
                                tick={{ fill: "hsl(var(--muted-foreground))" }}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent
                                    formatter={(value, name) => (
                                        <span className="font-mono font-semibold">INR {Number(value).toFixed(3)}</span>
                                    )}
                                />}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#gradRevenue)"
                                isAnimationActive
                                animationDuration={900}
                            />
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="url(#gradExpenses)"
                                isAnimationActive
                                animationDuration={900}
                                animationBegin={200}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Bar Chart + Pie Chart — stacked on mobile, side-by-side on large */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
                {/* Bar Chart */}
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base sm:text-lg">Monthly Revenue</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Last 6 months breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-6">
                        <ChartContainer config={barChartConfig} className="h-[220px] sm:h-[260px] md:h-[280px] w-full">
                            <BarChart data={data.monthlyData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                                />
                                <YAxis
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    width={45}
                                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                                />
                                <ChartTooltip
                                    content={<ChartTooltipContent
                                        formatter={(value) => (
                                            <span className="font-mono font-semibold">INR {Number(value).toFixed(3)}</span>
                                        )}
                                    />}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="url(#gradBar)"
                                    radius={[6, 6, 0, 0]}
                                    isAnimationActive
                                    animationDuration={900}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Pie / Donut Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base sm:text-lg">Revenue vs Expenses</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Lifetime distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4 px-2 sm:px-6">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={data.pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                    labelLine={false}
                                    label={CustomPieLabel}
                                    isAnimationActive
                                    animationDuration={900}
                                >
                                    {(data.pieData as any[]).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any, name: any) => [
                                        `INR ${Number(value).toFixed(3)}`,
                                        name,
                                    ]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-3 w-full text-sm">
                            <div className="flex flex-col items-center gap-1 rounded-lg bg-green-50 dark:bg-green-950 p-3">
                                <span className="text-xs text-muted-foreground">Net Revenue</span>
                                <span className="font-bold text-green-600 dark:text-green-400 text-xs sm:text-sm break-all text-center">
                                    INR {(data.netRevenue || 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1 rounded-lg bg-red-50 dark:bg-red-950 p-3">
                                <span className="text-xs text-muted-foreground">Expenses</span>
                                <span className="font-bold text-red-600 dark:text-red-400 text-xs sm:text-sm break-all text-center">
                                    INR {(data.totalExpenses || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Sellers */}
            {data.topProducts?.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-base sm:text-lg">Best-Selling Products</CardTitle>
                        </div>
                        <CardDescription className="text-xs sm:text-sm">Top 5 products by units sold (all time)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(data.topProducts as any[]).map((p: any, i: number) => (
                                <div key={p._id || i} className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <span className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-none">{p.name || "Unknown Product"}</span>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-muted-foreground">{p.unitsSold} units</span>
                                                <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    INR {(p.revenue || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-amber-400 dark:bg-amber-500 transition-all duration-700"
                                                style={{
                                                    width: `${Math.min(100, (p.unitsSold / (data.topProducts[0]?.unitsSold || 1)) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
