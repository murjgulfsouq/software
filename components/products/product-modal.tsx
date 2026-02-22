"use client";

import React, { useState, useEffect, useRef } from "react";
import * as z from "zod";
import { useForm, type Resolver } from "react-hook-form";
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
import { ImagePlus, Trash, Loader2, Tag } from "lucide-react";
import Image from "next/image";

const toNumber = (val: unknown) => (val === "" || val === undefined || val === null ? undefined : Number(val));

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.preprocess(toNumber, z.number().min(0)),
    quantity: z.preprocess(toNumber, z.number().min(0)),
    image: z.string().optional(),
    status: z.enum(["active", "inactive", "out of stock"]),
    // Offer Fields
    offerAmount: z.preprocess(toNumber, z.number().optional()),
    offerType: z.enum(["percent", "fixed"]).default("percent"),
    removeOffer: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any; // Accepting any to handle the offerPrice from DB
}

export const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    initialData,
}) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const title = initialData ? "Edit product" : "Create product";
    const description = initialData
        ? "Update product details and offers."
        : "Add a new product to your inventory";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema) as Resolver<ProductFormValues>,
        defaultValues: {
            name: "",
            price: 0,
            quantity: 0,
            image: "",
            status: "active",
            offerAmount: undefined,
            offerType: "percent",
            removeOffer: false,
        },
    });

    // Watch values for real-time calculation preview
    const watchedPrice = form.watch("price");
    const watchedOfferAmount = form.watch("offerAmount");
    const watchedOfferType = form.watch("offerType");
    const watchedImage = form.watch("image");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset({
                    name: initialData.name,
                    price: initialData.price,
                    quantity: initialData.quantity,
                    image: initialData.image || "",
                    status: initialData.status,
                    offerType: "percent",
                    offerAmount: undefined,
                    removeOffer: false,
                });
            } else {
                form.reset({
                    name: "",
                    price: 0,
                    quantity: 0,
                    image: "",
                    status: "active",
                    offerAmount: undefined,
                    offerType: "percent",
                    removeOffer: false,
                });
            }
        }
    }, [initialData, form, isOpen]);

    const calculatePreview = () => {
        if (!watchedOfferAmount || watchedOfferAmount <= 0) return null;
        let preview = 0;
        if (watchedOfferType === "percent") {
            preview = watchedPrice * (1 - watchedOfferAmount / 100);
        } else {
            preview = watchedPrice - watchedOfferAmount;
        }
        return Math.max(0, preview).toFixed(2);
    };

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/products/${initialData.id}`, data);
            } else {
                await axios.post(`/api/products`, data);
            }
            router.refresh();
            toast.success(initialData ? "Product updated." : "Product created.");
            onClose();
        } catch (error) {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (
        file: File,
        onChange: (url: string) => void
    ) => {
        if (!file) return;
        setImageUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            onChange(data.secure_url);
            toast.success("Image uploaded!");
        } catch (error) {
            toast.error("Upload failed.");
        } finally {
            setImageUploading(false);
        }
    };

    return (
        <Modal title={title} description={description} isOpen={isOpen} onClose={onClose}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="max-h-[65vh] overflow-y-auto pr-2 space-y-4">

                        {/* --- IMAGE FIELD --- */}
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Image</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            {watchedImage ? (
                                                <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-gray-50">
                                                    <Image
                                                        src={watchedImage}
                                                        alt="Product image"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => field.onChange("")}
                                                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                                                    >
                                                        <Trash className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                                                >
                                                    {imageUploading ? (
                                                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                                    ) : (
                                                        <>
                                                            <ImagePlus className="w-8 h-8 text-gray-400" />
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                Click to upload image
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={loading || imageUploading}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleImageUpload(file, field.onChange);
                                                    }
                                                }}
                                            />
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
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Base Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" disabled={loading} {...field} />
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
                                            <Input type="number" disabled={loading} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* --- OFFER SECTION (edit only) --- */}
                        {initialData && (
                            <div className="p-4 border rounded-lg bg-gray-50/50 space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                                    <Tag className="w-4 h-4" />
                                    Promotional Offer
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="offerType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Discount Type</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={loading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="percent">Percentage (%)</SelectItem>
                                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="offerAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        disabled={loading}
                                                        placeholder={
                                                            watchedOfferType === "percent"
                                                                ? "e.g. 20"
                                                                : "0.00"
                                                        }
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value === ""
                                                                    ? undefined
                                                                    : Number(e.target.value)
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Real-time offer price preview */}
                                {calculatePreview() && (
                                    <div className="text-sm font-medium text-green-600 animate-in fade-in">
                                        New Offer Price: ₹{calculatePreview()}
                                    </div>
                                )}

                                {/* Show current offer price if editing */}
                                {initialData?.offerPrice && (
                                    <div className="text-sm text-muted-foreground">
                                        Current Offer Price:{" "}
                                        <span className="font-semibold text-blue-600">
                                            ₹{Number(initialData.offerPrice).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                {/* Remove offer button */}
                                {initialData?.offerPrice && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-red-500 border-red-200 hover:bg-red-50"
                                        onClick={() => {
                                            form.setValue("removeOffer", true);
                                            form.setValue("offerAmount", undefined);
                                            form.setValue("price", initialData.price);
                                            toast.info("Offer removed. Price restored to INR " + initialData.price.toFixed(3) + ". Save to confirm.");
                                        }}
                                    >
                                        Remove Current Offer
                                    </Button>
                                )}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={loading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="out of stock">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="pt-6 flex items-center justify-end gap-2">
                        <Button
                            disabled={loading}
                            variant="outline"
                            onClick={onClose}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button disabled={loading || imageUploading} type="submit">
                            {loading ? (
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            ) : null}
                            {action}
                        </Button>
                    </div>
                </form>
            </Form>
        </Modal>
    );
};