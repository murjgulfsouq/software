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

interface Product {
    id: string;
    name: string;
    price: number;
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

    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    // Filter products
    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addToCart = (product: Product) => {
        if (product.quantity <= 0 || product.status === "out_of_stock") {
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

        // Find product actual stock
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

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.cartQuantity, 0);

    const [shouldPrint, setShouldPrint] = useState(false);

    useEffect(() => {
        if (lastInvoice && shouldPrint) {
            handlePrint();
            setShouldPrint(false);
        }
    }, [lastInvoice, shouldPrint, handlePrint]);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);

        try {
            const payload = {
                products: cart.map(item => ({
                    productId: item.id,
                    quantity: item.cartQuantity,
                    price: item.price,
                    name: item.name
                }))
            };

            const response = await axios.post("/api/billing", payload);
            const invoice = response.data;

            setLastInvoice(invoice);
            setShouldPrint(true); // Trigger print in useEffect
            toast.success("Billing successful!");
            setCart([]);

            // Update local product stock to reflect changes immediately
            setProducts(prev => prev.map(p => {
                const cartItem = cart.find(c => c.id === p.id);
                if (cartItem) {
                    const newQty = p.quantity - cartItem.cartQuantity;
                    return {
                        ...p,
                        quantity: newQty,
                        status: newQty === 0 ? "out_of_stock" : p.status
                    };
                }
                return p;
            }));

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
                                        <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm truncate w-full" title={product.name}>{product.name}</h3>
                                    <p className="text-sm font-bold text-primary">INR {product.price.toFixed(3)}</p>
                                    <p className="text-xs text-gray-500">{product.quantity} in stock</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Cart & Billing */}
            <div className="md:col-span-1 flex flex-col h-full border-l pl-4">
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
                                                INR {(item.price * item.cartQuantity).toFixed(3)}
                                                <span className="ml-1 text-[10px] text-gray-400">
                                                    (INR {item.price.toFixed(3)} ea)
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
            <div className="hidden">
                <div ref={componentRef}>
                    {lastInvoice ? (
                        <InvoiceTemplate invoice={lastInvoice} />
                    ) : null}
                </div>
            </div>
        </div>
    );
};
