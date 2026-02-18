"use client";

import { ColumnDef } from "@tanstack/react-table";

export type SalesColumn = {
    id: string;
    purchaseId: string;
    totalCount: number;
    totalAmount: number;
    cashierName: string;
    createdAt: string;

};

export const columns: ColumnDef<SalesColumn>[] = [
    {
        accessorKey: "purchaseId",
        header: "Invoice ID",
    },
    {
        accessorKey: "cashierName",
        header: "Sold By",
        cell: ({ row }) => {
            return <div>{row.original.cashierName}</div>;
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
