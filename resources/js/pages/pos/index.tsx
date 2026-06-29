"use client";

import { Head, router } from "@inertiajs/react";
import { Category, Product, CartItem } from "@/types";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
    Search, 
    ShoppingCart, 
    Trash2, 
    Plus, 
    Minus, 
    Image as ImageIcon,
    Check,
    CreditCard,
    ArrowRight,
    Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
    products: Product[];
    categories: Category[];
}

export default function PosIndex({ products, categories }: Props) {
    const [search, setSearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
    const [saleId, setSaleId] = useState<number | null>(null);
    const [checkoutDetails, setCheckoutDetails] = useState({ subtotal: 0, total: 0, discount: 0 });

    // Client-side filtering of products
    const filteredProducts = useMemo(() => {
        const query = search.toLowerCase();
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(query) ||
                (product.description && product.description.toLowerCase().includes(query));
            const matchesCategory = selectedCategoryId === null || product.category_id === selectedCategoryId;
            return matchesSearch && matchesCategory;
        });
    }, [products, search, selectedCategoryId]);

    // Cart operations
    function addToCart(product: Product) {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product.id === product.id);
            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                    toast.error(`Only ${product.stock} items of "${product.name}" are in stock.`);
                    return prevCart;
                }
                toast.success(`Increased "${product.name}" quantity.`);
                return prevCart.map(item => 
                    item.product.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            toast.success(`Added "${product.name}" to cart.`);
            return [...prevCart, { product, quantity: 1 }];
        });
    }

    function updateQuantity(productId: number, delta: number) {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.product.id === productId) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) {
                        return null;
                    }
                    if (newQty > item.product.stock) {
                        toast.error(`Only ${item.product.stock} items of "${item.product.name}" are in stock.`);
                        return item;
                    }
                    return { ...item, quantity: newQty };
                }
                return item;
            }).filter((item): item is CartItem => item !== null);
        });
    }

    function removeFromCart(productId: number) {
        setCart(prevCart => {
            const item = prevCart.find(i => i.product.id === productId);
            if (item) {
                toast.error(`Removed "${item.product.name}" from cart.`);
            }
            return prevCart.filter(i => i.product.id !== productId);
        });
    }

    // Calculations
    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);
    }, [cart]);

    const discount = useMemo(() => {
        return subtotal > 100 ? subtotal * 0.05 : 0;
    }, [subtotal]);

    const total = useMemo(() => {
        return subtotal - discount;
    }, [subtotal, discount]);

    async function handleCheckout() {
        if (cart.length === 0) {
            toast.error("Cart is empty!");
            return;
        }

        const saleData = {
            items: cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
            })),
            subtotal,
            discount,
            total,
        };

        try {
            const response = await fetch(route('pos.checkout'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(saleData),
            });

            if (!response.ok) throw new Error('Failed to process sale');

            const data = await response.json();
            setSaleId(data.sale.id);
            setCheckoutDetails({ subtotal, total, discount });
            setShowCheckoutSuccess(true);
            toast.success("Checkout completed successfully!");
        } catch {
            toast.error("Failed to process sale");
        }
    }

    function printReceipt() {
        if (saleId) {
            window.open(route('pos.receipt', saleId), '_blank');
        }
    }

    return (
        <>
            <Head title="Point of Sale (POS)" />

            <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-neutral-50 dark:bg-neutral-950/40 overflow-hidden">
                {/* Product Catalog Area (Left) */}
                <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto border-r border-neutral-200 dark:border-neutral-800">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">POS Terminal</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Search and select items to add to the checkout order.</p>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-3 size-4 text-neutral-400 pointer-events-none" />
                            <Input 
                                placeholder="Search by name, description or barcode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-11 bg-white dark:bg-neutral-900/50"
                            />
                        </div>

                        {/* Category Badges */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            <button
                                onClick={() => setSelectedCategoryId(null)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                                    selectedCategoryId === null
                                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs"
                                        : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                }`}
                            >
                                All Categories
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategoryId(category.id)}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                                        selectedCategoryId === category.id
                                            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs"
                                            : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                            <ShoppingCart className="size-12 text-neutral-400 animate-pulse mb-3" />
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No active products found</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                            {filteredProducts.map((product) => {
                                const cartQty = cart.find(i => i.product.id === product.id)?.quantity ?? 0;
                                const isOutOfStock = product.stock <= cartQty;

                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => !isOutOfStock && addToCart(product)}
                                        className={`group relative flex flex-col rounded-xl border bg-white dark:bg-neutral-900/30 overflow-hidden cursor-pointer shadow-xs transition-all duration-200 select-none ${
                                            isOutOfStock 
                                                ? "opacity-60 border-neutral-200 dark:border-neutral-800 cursor-not-allowed" 
                                                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md hover:-translate-y-0.5"
                                        }`}
                                    >
                                        {/* Product Image */}
                                        <div className="relative aspect-square w-full bg-neutral-50 dark:bg-neutral-900 overflow-hidden border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-center">
                                            {product.image ? (
                                                <img 
                                                    src={`/storage/${product.image}`} 
                                                    alt={product.name} 
                                                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <ImageIcon className="size-8 text-neutral-400" />
                                            )}

                                            {/* Quantity Badge in Cart */}
                                            {cartQty > 0 && (
                                                <div className="absolute top-2 right-2 size-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                                                    {cartQty}
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-3.5 flex flex-col flex-1 gap-1.5 justify-between">
                                            <div className="min-w-0">
                                                <div className="text-xs text-neutral-400 dark:text-neutral-500 font-medium truncate uppercase tracking-wider">
                                                    {product.category?.name || "Uncategorized"}
                                                </div>
                                                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 transition-colors truncate">
                                                    {product.name}
                                                </h4>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="font-extrabold text-sm text-neutral-900 dark:text-neutral-150">
                                                    ${parseFloat(product.price).toFixed(2)}
                                                </span>
                                                <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                                                    Stock: {product.stock - cartQty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Checkout / Cart Side Panel (Right) */}
                <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-neutral-900/50 shadow-lg border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-neutral-800 h-full">
                    {/* Cart Header */}
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/20">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="size-5 text-neutral-700 dark:text-neutral-300" />
                            <h3 className="font-bold text-neutral-900 dark:text-neutral-50">Current Cart</h3>
                        </div>
                        <Badge variant="secondary" className="font-bold">
                            {cart.reduce((a, b) => a + b.quantity, 0)} Items
                        </Badge>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12 text-neutral-400">
                                <ShoppingCart className="size-10 stroke-[1.5px] mb-2 animate-bounce" />
                                <p className="text-sm font-medium">Your cart is empty.</p>
                                <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">Click on catalog products to start a sale terminal order.</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div 
                                    key={item.product.id}
                                    className="flex items-center gap-3 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-900/20 group hover:shadow-xs transition-shadow"
                                >
                                    {/* Item Thumbnail */}
                                    <div className="size-12 rounded-md bg-neutral-100 dark:bg-neutral-850 overflow-hidden flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-800">
                                        {item.product.image ? (
                                            <img src={`/storage/${item.product.image}`} alt={item.product.name} className="size-full object-cover" />
                                        ) : (
                                            <ImageIcon className="size-4 text-neutral-400" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">{item.product.name}</h5>
                                        <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
                                            ${parseFloat(item.product.price).toFixed(2)} x {item.quantity}
                                        </div>
                                    </div>

                                    {/* Action Quantity Controls */}
                                    <div className="flex flex-col items-end gap-1.5">
                                        <div className="flex items-center gap-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-md p-0.5">
                                            <button 
                                                onClick={() => updateQuantity(item.product.id, -1)}
                                                className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-pointer"
                                            >
                                                <Minus className="size-3" />
                                            </button>
                                            <span className="text-xs font-bold px-1.5 text-neutral-800 dark:text-neutral-200">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.product.id, 1)}
                                                className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-pointer"
                                            >
                                                <Plus className="size-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remove button */}
                                    <button 
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="text-neutral-300 hover:text-red-500 p-1 cursor-pointer transition-colors"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Summary calculations */}
                    <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col gap-3">
                        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <span>Subtotal</span>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">${subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-xs text-emerald-600 font-medium">
                                <span>Discount (5% off &gt; $100)</span>
                                <span>-${discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex justify-between items-baseline">
                            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Total</span>
                            <span className="font-extrabold text-xl text-emerald-600 dark:text-emerald-450">${total.toFixed(2)}</span>
                        </div>

                        {/* Checkout button */}
                        <Button 
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl mt-2 cursor-pointer gap-2 transition-all flex items-center justify-center shadow-lg"
                        >
                            <CreditCard className="size-4" />
                            Checkout Order
                            <ArrowRight className="size-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Checkout Success Modal Dialog */}
            <Dialog open={showCheckoutSuccess} onOpenChange={setShowCheckoutSuccess}>
                <DialogContent className="sm:max-w-[400px]">
                    <div className="flex flex-col items-center text-center py-6">
                        <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/10">
                            <Check className="size-8 stroke-[3px] animate-bounce" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Transaction Successful</DialogTitle>
                        <DialogDescription className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                            The sale transaction was processed successfully.
                        </DialogDescription>
                        
                        {/* Transaction Receipt Details */}
                        <div className="w-full mt-5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 p-4 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                            <div className="flex justify-between">
                                <span>Status</span>
                                <span className="font-bold text-emerald-600">PAID</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${checkoutDetails.subtotal.toFixed(2)}</span>
                            </div>
                            {checkoutDetails.discount > 0 && (
                                <div className="flex justify-between">
                                    <span>Discount</span>
                                    <span>-${checkoutDetails.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-sm text-neutral-900 dark:text-neutral-100 border-t border-neutral-200/50 dark:border-neutral-800 pt-2.5">
                                <span>Total Paid</span>
                                <span className="text-emerald-600">${checkoutDetails.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button 
                            onClick={printReceipt}
                            disabled={!saleId}
                            variant="outline"
                            className="flex-1 cursor-pointer font-semibold"
                        >
                            <Printer className="size-4 mr-1" />
                            Print Receipt
                        </Button>
                        <Button 
                            onClick={() => {
                                setShowCheckoutSuccess(false);
                                setCart([]);
                                setSaleId(null);
                            }}
                            className="flex-1 bg-neutral-950 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-950 cursor-pointer font-semibold"
                        >
                            New Sale
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Add Breadcrumbs to match default layout requirements
PosIndex.layout = {
    breadcrumbs: [
        {
            title: "POS Terminal",
            href: "/pos",
        },
    ],
};