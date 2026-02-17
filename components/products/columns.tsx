import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type ProductColumn = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    status: "active" | "inactive" | "out_of_stock";
    createdAt: string;
    image: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
    {
        id: "sno",
        header: "S.No",
        cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => (
            <div className="relative w-10 h-10 overflow-hidden rounded-md border">
                {row.original.image ? (
                    <Image
                        fill
                        src={row.original.image}
                        alt={row.original.name}
                        className="object-cover"
                    />
                ) : (
                    <div className="flex bg-muted h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        No IMG
                    </div>
                )}
            </div>
        ),
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => <div>INR {row.original.price.toFixed(3)}</div>,
    },
    {
        id: "totalPrice",
        header: "Total Price",
        cell: ({ row }) => {
            const total = row.original.price * row.original.quantity;
            return <div>INR {total.toFixed(3)}</div>;
        },
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];
