"use client";

import { ColumnDef } from "@tanstack/react-table";

export type SalesColumn = {
    id: string;
    purchaseId: string;
    totalCount: number;
    totalAmount: number;
    createdBy: string;
    createdAt: string;
};

export const columns: ColumnDef<SalesColumn>[] = [
    {
        accessorKey: "purchaseId",
        header: "Invoice ID",
    },
    {
        accessorKey: "createdBy",
        header: "Sold By",
        cell: ({ row }) => {
            const value = row.original.createdBy;
            if (value === "static_admin_id") return <div>Owner</div>;
            if (value === "static_cashier_id") return <div>Staff</div>;
            return <div>{value}</div>;
        },
    },
    {
        accessorKey: "totalCount",
        header: "Items",
    },
    {
        accessorKey: "totalAmount",
        header: "Amount (INR)",
        cell: ({ row }) => <div>{row.original.totalAmount.toFixed(3)}</div>,
    },
    {
        accessorKey: "createdAt",
        header: "Date",
    },
];
