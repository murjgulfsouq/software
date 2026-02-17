"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { ProductColumn } from "./columns";
import { ProductModal } from "./product-modal";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionProps {
    data: ProductColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<string>("staff");

    useEffect(() => {
        const storedRole = localStorage.getItem("user_role");
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);

    const isAdmin = role === "admin";

    if (!isAdmin) {
        return null;
    }

    const onConfirm = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/products/${data.id}`);
            toast.success("Product deleted.");
            router.refresh();
        } catch (error) {
            toast.error("Make sure you removed all invoices using this product first.");
        } finally {
            setLoading(false);
            setOpenAlert(false);
        }
    };

    return (
        <>
            <AlertModal
                isOpen={openAlert}
                onClose={() => setOpenAlert(false)}
                onConfirm={onConfirm}
                loading={loading}
            />
            <ProductModal
                isOpen={open}
                onClose={() => setOpen(false)}
                initialData={data}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpenAlert(true)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
