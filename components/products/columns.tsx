import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type ProductColumn = {
    id: string;
    name: string;
    price: number;
    offerPrice?: number;
    quantity: number;
    status: "active" | "inactive" | "out of stock";
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
            <div className="relative w-16 h-16 overflow-hidden rounded-md border min-w-[64px]">
                {row.original.image ? (
                    <Image
                        fill
                        src={row.original.image}
                        alt={row.original.name}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        accessorKey: "offerPrice",
        header: "Offer Price",
        cell: ({ row }) => {
            const op = row.original.offerPrice;
            return op != null ? (
                <div className="text-green-600 font-semibold">INR {Number(op).toFixed(3)}</div>
            ) : (
                <div className="text-muted-foreground">—</div>
            );
        },
    },
    {
        id: "totalPrice",
        header: "Total Price",
        cell: ({ row }) => {
            const effectivePrice = row.original.offerPrice ?? row.original.price;
            const total = effectivePrice * row.original.quantity;
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
        cell: ({ row }) => {
            const status = row.original.status;
            const display = status
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
            return <div>{display}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];
