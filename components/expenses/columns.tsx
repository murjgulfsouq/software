"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { format } from "date-fns";

export type ExpenseColumn = {
    id: string;
    description: string;
    amount: number;
    date: string;
    createdBy: string;
};

export const columns: ColumnDef<ExpenseColumn>[] = [
    {
        id: "sno",
        header: "S.No",
        cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <div>{format(new Date(row.original.date), "MMM do, yyyy")}</div>,
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <div className="font-medium text-red-600">INR {row.original.amount.toFixed(3)}</div>,
    },
    {
        accessorKey: "createdBy",
        header: "Created By",
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];
