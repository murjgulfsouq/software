"use client";

import { DataTable } from "@/components/ui/data-table";
import { SalesColumn, columns } from "./columns";

interface SalesClientProps {
    data: SalesColumn[];
}

export const SalesClient: React.FC<SalesClientProps> = ({ data }) => {
    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sales History ({data.length})</h2>
                    <p className="text-sm text-muted-foreground">View all past transactions</p>
                </div>
            </div>
            <DataTable searchKey="purchaseId" columns={columns} data={data} />
        </>
    );
};
