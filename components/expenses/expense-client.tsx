"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { ExpenseColumn, columns } from "./columns";
import { ExpenseModal } from "./expense-modal";

interface ExpenseClientProps {
    data: ExpenseColumn[];
}

export const ExpenseClient: React.FC<ExpenseClientProps> = ({ data }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <ExpenseModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
            <div className="flex items-center justify-between">
                <Heading
                    title={`Expenses (${data.length})`}
                    description="Manage daily expenses and records for your business"
                />
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                </Button>
            </div>
            <Separator />
            <DataTable
                searchKey="description"
                columns={columns}
                data={data}
            />
        </>
    );
};
