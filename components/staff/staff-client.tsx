"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import { StaffColumn, columns } from "./columns";
import { useState } from "react";
import { StaffModal } from "./staff-modal";

interface StaffClientProps {
    data: StaffColumn[];
}

export const StaffClient: React.FC<StaffClientProps> = ({ data }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <StaffModal isOpen={open} onClose={() => setOpen(false)} />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Staff ({data.length})</h2>
                    <p className="text-sm text-muted-foreground">Manage your staff accounts</p>
                </div>
                <Button onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            <DataTable searchKey="name" columns={columns} data={data} />
        </>
    );
};
