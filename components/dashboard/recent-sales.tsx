import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecentSalesProps {
    data: any[];
}

export function RecentSales({ data }: RecentSalesProps) {
    return (
        <div className="space-y-8">
            {data.map((sale: any) => (
                <div key={sale._id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="/avatars/01.png" alt="Avatar" />
                        <AvatarFallback>{sale.createdBy?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.createdBy?.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                            {sale.purchaseId}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">+INR {sale.totalAmount.toFixed(3)}</div>
                </div>
            ))}
            {data.length === 0 && <p className="text-sm text-muted-foreground">No recent sales.</p>}
        </div>
    );
}
