"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Trash, ShoppingCart, Printer, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { InvoiceTemplate } from "./invoice-template";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    price: number;
    offerPrice?: number;
    quantity: number;
    image: string;
    status: string;
}

interface CartItem extends Product {
    cartQuantity: number;
}

interface POSClientProps {
    initialProducts: Product[];
}

export const POSClient: React.FC<POSClientProps> = ({ initialProducts }) => {
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastInvoice, setLastInvoice] = useState<any>(null);
    const [shouldPrint, setShouldPrint] = useState(false);
    const [pendingInvoiceId, setPendingInvoiceId] = useState<string | null>(null);
    const [showPrintConfirmation, setShowPrintConfirmation] = useState(false);
    const [savedCartForRollback, setSavedCartForRollback] = useState<CartItem[]>([]);

    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        onAfterPrint: () => {
            setShowPrintConfirmation(true);
        },
    });

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addToCart = (product: Product) => {
        console.log(product.status)
        if (product.quantity <= 0 || product.status === "out of stock") {
            toast.error("Product out of stock");
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                if (existing.cartQuantity >= product.quantity) {
                    toast.error("Not enough stock available");
                    return prev;
                }
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, cartQuantity: item.cartQuantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, cartQuantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) return;

        if (quantity > product.quantity) {
            toast.error("Cannot add more than available stock");
            return;
        }

        setCart((prev) =>
            prev.map((item) =>
                item.id === productId ? { ...item, cartQuantity: quantity } : item
            )
        );
    };

    const subtotal = cart.reduce((acc, item) => {
        const effectivePrice = item.offerPrice ?? item.price;
        return acc + effectivePrice * item.cartQuantity;
    }, 0);


    useEffect(() => {
        if (lastInvoice && shouldPrint) {
            handlePrint();
            setShouldPrint(false);
        }
    }, [lastInvoice, shouldPrint, handlePrint]);

    const handlePrintSuccess = async () => {
        if (!pendingInvoiceId) return;

        setLoading(true);
        try {
            // Confirm the invoice after print
            await axios.post("/api/billing/confirm", { invoiceId: pendingInvoiceId });

            toast.success("Transaction completed successfully!");

            setProducts(prev => prev.map(p => {
                const cartItem = savedCartForRollback.find(c => c.id === p.id);
                if (cartItem) {
                    const newQty = p.quantity - cartItem.cartQuantity;
                    return {
                        ...p,
                        quantity: newQty,
                        status: newQty === 0 ? "out of stock" : p.status
                    };
                }
                return p;
            }));

            // Clear cart and reset states
            setCart([]);
            setPendingInvoiceId(null);
            setShowPrintConfirmation(false);
            setSavedCartForRollback([]);

        } catch (error) {
            console.error("Failed to confirm invoice:", error);
            toast.error("Print confirmation failed. Please contact support.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrintCancelled = async () => {
        if (!pendingInvoiceId) return;

        setLoading(true);
        try {
            await axios.post("/api/billing/cancel", { invoiceId: pendingInvoiceId });

            toast.info("Transaction cancelled. No stock was deducted.");

            setPendingInvoiceId(null);
            setShowPrintConfirmation(false);
            setSavedCartForRollback([]);

        } catch (error) {
            console.error("Failed to cancel invoice:", error);
            toast.error("Cancellation failed. Please contact support.");
        } finally {
            setLoading(false);
        }
    };


    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);

        try {
            const payload = {
                products: cart.map(item => ({
                    productId: item.id,
                    quantity: item.cartQuantity,
                }))
            };

            const response = await axios.post("/api/billing/prepare", payload);
            const invoice = response.data;

            setSavedCartForRollback([...cart]);

            setLastInvoice(invoice);
            setPendingInvoiceId(invoice._id);
            setShouldPrint(true);

            toast.info("Please complete the print to finalize transaction");

        } catch (error: any) {
            console.error("Checkout error:", error);
            const errorMessage = typeof error.response?.data === 'string'
                ? error.response.data
                : "Checkout failed. Please check stock.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* Product List */}
            <div className="md:col-span-2 flex flex-col space-y-4 h-full">
                <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-gray-500" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2" style={{ maxHeight: "calc(100vh - 200px)" }}>
                    {filteredProducts.map((product) => (
                        <Card
                            key={product.id}
                            className={`cursor-pointer hover:shadow-md transition-all ${product.quantity === 0 ? "opacity-50 grayscale" : ""}`}
                            onClick={() => addToCart(product)}
                        >
                            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                <div className="w-full aspect-square relative bg-gray-100 rounded-md overflow-hidden">
                                    {/* Image placeholder or actual image */}
                                    {product.image ? (
                                        <Image
                                            width={50}
                                            height={50}
                                            src={product.image}
                                            alt={product.name}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm truncate w-full" title={product.name}>{product.name}</h3>
                                    {product.offerPrice != null ? (
                                        <div className="flex flex-col items-center">
                                            <p className="text-sm font-bold text-green-600">INR {product.offerPrice.toFixed(3)}</p>
                                            <p className="text-xs line-through text-gray-400">INR {product.price.toFixed(3)}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-primary">INR {product.price.toFixed(3)}</p>
                                    )}
                                    <p className="text-xs text-gray-500"> {product.status !== "out of stock" ? `${product.quantity} in stock` : "out of stock"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Cart & Billing */}
            <div className="md:col-span-1 flex flex-col h-full border-l pl-4 md:mb-10">
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Current Bill
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto px-2">
                        {cart.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Cart is empty
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center border-b pb-2 gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm truncate" title={item.name}>{item.name}</h4>
                                            <div className="text-xs text-gray-500">
                                                INR {((item.offerPrice ?? item.price) * item.cartQuantity).toFixed(3)}
                                                <span className="ml-1 text-[10px] text-gray-400">
                                                    (INR {(item.offerPrice ?? item.price).toFixed(3)} ea{item.offerPrice != null ? " - offer" : ""})
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <div className="flex items-center border rounded-md overflow-hidden bg-gray-50">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-none"
                                                    onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                                                    disabled={item.cartQuantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <div className="w-8 text-center text-xs font-medium">
                                                    {item.cartQuantity}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-none"
                                                    onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 border-t pt-4">
                        <div className="flex justify-between w-full text-lg font-bold">
                            <span>Total</span>
                            <span>INR {subtotal.toFixed(3)}</span>
                        </div>
                        <Button className="w-full" size="lg" disabled={loading || cart.length === 0} onClick={handleCheckout}>
                            {loading ? "Processing..." : "Print Bill"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Hidden Print Template */}
            <div style={{ display: "none" }}>
                <div ref={componentRef}>
                    {lastInvoice ? (
                        <InvoiceTemplate invoice={lastInvoice} />
                    ) : null}
                </div>
            </div>

            {/* Print Confirmation Dialog */}
            <Dialog open={showPrintConfirmation} onOpenChange={setShowPrintConfirmation}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Confirm Print Success</DialogTitle>
                        <DialogDescription>
                            Did the invoice print successfully? Confirming will finalize the transaction and update stock.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePrintCancelled}
                            disabled={loading}
                        >
                            No, Cancel Transaction
                        </Button>
                        <Button
                            onClick={handlePrintSuccess}
                            disabled={loading}
                        >
                            {loading ? "Confirming..." : "Yes, Transaction Successful"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
