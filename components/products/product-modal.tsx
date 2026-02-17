"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CldUploadButton } from "next-cloudinary";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
    name: z.string().min(1),
    price: z.coerce.number().min(0),
    quantity: z.coerce.number().min(0),
    image: z.string().optional(),
    status: z.enum(["active", "inactive", "out_of_stock"]),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: ProductFormValues & { id: string };
}

export const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    initialData,
}) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit product" : "Create product";
    const description = initialData ? "Edit a product." : "Add a new product";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema) as any, // Cast to any to avoid strict type issues with coerce
        defaultValues: initialData || {
            name: "",
            price: 0,
            quantity: 0,
            image: "",
            status: "active",
        },
    });

    // Reset form when initialData changes (e.g., switching between edit and create)
    useEffect(() => {
        if (isOpen) {
            form.reset(initialData || {
                name: "",
                price: 0,
                quantity: 0,
                image: "",
                status: "active",
            });
        }
    }, [initialData, form, isOpen]);

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/products/${initialData.id}`, data);
            } else {
                await axios.post(`/api/products`, data);
            }
            form.reset();
            router.refresh();
            toast.success(initialData ? "Product updated." : "Product created.");
            onClose();
        } catch (error) {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={title}
            description={description}
            isOpen={isOpen}
            onClose={onClose}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-4">
                                            {field.value ? (
                                                <div className="relative w-[100px] h-[100px] rounded-md overflow-hidden border">
                                                    <div className="z-10 absolute top-1 right-1">
                                                        <Button type="button" onClick={() => field.onChange("")} variant="destructive" size="icon" className="h-6 w-6">
                                                            <Trash className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Image
                                                        fill
                                                        className="object-cover"
                                                        alt="Image"
                                                        src={field.value}
                                                    />
                                                </div>
                                            ) : (
                                                <CldUploadButton
                                                    options={{ maxFiles: 1 }}
                                                    onSuccess={(result: any) => {
                                                        field.onChange(result.info.secure_url);
                                                    }}
                                                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                                >
                                                    <div className="flex flex-col items-center justify-center w-[100px] h-[100px] border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-100">
                                                        <ImagePlus className="h-4 w-4 text-gray-500" />
                                                        <span className="text-xs text-gray-500">Upload</span>
                                                    </div>
                                                </CldUploadButton>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                disabled={loading}
                                                placeholder="0.000"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                disabled={loading}
                                                placeholder="0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} placeholder="Select a status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                        <Button disabled={loading} variant="outline" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button disabled={loading} type="submit">
                            {action}
                        </Button>
                    </div>
                </form>
            </Form>
        </Modal>
    );
};
