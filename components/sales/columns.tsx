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
