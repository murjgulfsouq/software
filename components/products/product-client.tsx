"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import { ProductColumn, columns } from "./columns";
import { useState, useEffect } from "react";
import { ProductModal } from "./product-modal";

interface ProductClientProps {
    data: ProductColumn[];
}

export const ProductClient: React.FC<ProductClientProps> = ({ data }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ProductModal isOpen={open} onClose={() => setOpen(false)} />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-sm text-muted-foreground">Manage products for your store</p>
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
