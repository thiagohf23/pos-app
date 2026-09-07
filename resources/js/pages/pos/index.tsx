'use client';

import { Head } from '@inertiajs/react';
import { Maximize2, Minimize2, Search } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Category, Product } from '@/types';
import { Cart } from './components/cart';
import { CheckoutDialog } from './components/checkout-dialog';
import { ProductGrid } from './components/product-grid';
import { useCart } from './components/use-cart';

interface Props {
    products?: Product[];
    categories?: Category[];
}


export default function PosIndex({ products = [], categories = [] }: Props) {
    const {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        discount,
        total,
    } = useCart();
    const [search, setSearch] = useState('');
    const [selectedProductIndex, setSelectedProductIndex] = useState(0);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null,
    );
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { setOpen } = useSidebar();
    const searchRef = useRef<HTMLInputElement>(null);

    // Reset selected product index when filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedProductIndex(0);
    }, [search, selectedCategoryId]);

    // Hide/show header and toggle sidebar when fullscreen toggles
    useEffect(() => {
        const header = document.querySelector<HTMLElement>(
            'header, [class*="border-b"][class*="border-sidebar-border"]',
        );

        if (header) {
            header.style.display = isFullscreen ? 'none' : '';
        }

        setOpen(!isFullscreen);
    }, [isFullscreen, setOpen]);

    // Restore header when leaving the page
    useEffect(() => {
        return () => {
            const header = document.querySelector<HTMLElement>(
                'header, [class*="border-b"][class*="border-sidebar-border"]',
            );

            if (header) {
                header.style.display = '';
            }
        };
    }, []);

    // Client-side filtering of products
    const filteredProducts = useMemo(() => {
        const query = search.toLowerCase();

        return products.filter((product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(query) ||
                (product.description &&
                    product.description.toLowerCase().includes(query));
            const matchesCategory =
                selectedCategoryId === null ||
                product.category_id === selectedCategoryId;

            return matchesSearch && matchesCategory;
        });
    }, [products, search, selectedCategoryId]);

    function openPaymentDialog() {
        if (cart.length === 0) {
            toast.error('Cart is empty!');

            return;
        }

        setShowPaymentDialog(true);
    }

    // Keyboard shortcuts listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeElement = document.activeElement;
            const isTyping =
                activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement;

            if (e.key === 'F2' || e.key === '/') {
                if (e.key === 'F2' || !isTyping) {
                    e.preventDefault();
                    searchRef.current?.focus();
                    searchRef.current?.select();
                }
            } else if (e.key === 'F8') {
                e.preventDefault();

                if (cart.length > 0) {
                    setShowPaymentDialog(true);
                } else {
                    toast.error('Cart is empty!');
                }
            } else if (e.key === 'Escape') {
                if (activeElement === searchRef.current) {
                    setSearch('');
                    searchRef.current?.blur();
                }
            } else if (e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                clearCart();
                toast.success('Cart cleared!');
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                if (activeElement === searchRef.current || !isTyping) {
                    e.preventDefault();
                    setSelectedProductIndex((prev) =>
                        filteredProducts.length > 0
                            ? (prev + 1) % filteredProducts.length
                            : -1
                    );
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                if (activeElement === searchRef.current || !isTyping) {
                    e.preventDefault();
                    setSelectedProductIndex((prev) =>
                        filteredProducts.length > 0
                            ? (prev - 1 + filteredProducts.length) % filteredProducts.length
                            : -1
                    );
                }
            } else if (e.key === 'Enter') {
                if (!isTyping && selectedProductIndex >= 0 && selectedProductIndex < filteredProducts.length) {
                    e.preventDefault();
                    const product = filteredProducts[selectedProductIndex];

                    if (product.stock > 0) {
                        addToCart(product);
                    } else {
                        toast.error(`${product.name} is out of stock!`);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, clearCart, filteredProducts, selectedProductIndex, addToCart]);

    return (
        <>
            <Head title="Point of Sale (POS)" />

            <div className={`flex flex-col overflow-hidden bg-neutral-50 lg:flex-row dark:bg-neutral-950/40 ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)]'}`}>
                {/* Product Catalog Area (Left) */}
                <div className="flex flex-1 flex-col gap-6 overflow-y-auto border-r border-neutral-200 p-6 dark:border-neutral-800">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                                POS Terminal
                            </h1>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="h-8 w-8"
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 className="h-4 w-4" />
                                        ) : (
                                            <Maximize2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isFullscreen ? 'Exit fullscreen' : 'Fullscreen mode'}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Search and select items to add to the checkout
                            order.
                        </p>
                    </div>

                    {/* Search and Filters side-by-side */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute top-3 left-3 size-4 text-neutral-400" />
                            <Input
                                ref={searchRef}
                                placeholder="Search by name, description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 bg-white pl-9 pr-10 dark:bg-neutral-900/50"
                            />
                            <div className="absolute right-3 top-3 text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-mono px-1.5 py-0.5 rounded border pointer-events-none select-none">
                                F2
                            </div>
                        </div>

                        <div className="scrollbar-none overflow-x-auto py-1">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedCategoryId(null)}
                                    className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                                        selectedCategoryId === null
                                            ? 'border-transparent bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950'
                                            : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    All Categories
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategoryId(category.id)}
                                        className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                                            selectedCategoryId === category.id
                                                ? 'border-transparent bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950'
                                                : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <ProductGrid
                        products={filteredProducts}
                        cart={cart}
                        onAddToCart={addToCart}
                        selectedProductIndex={selectedProductIndex}
                    />
                </div>

                {/* Checkout / Cart Side Panel (Right) */}
                <Cart
                    cart={cart}
                    subtotal={subtotal}
                    discount={discount}
                    total={total}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    onCheckout={openPaymentDialog}
                />
            </div>

            <CheckoutDialog
                open={showPaymentDialog}
                onOpenChange={setShowPaymentDialog}
                cart={cart}
                subtotal={subtotal}
                discount={discount}
                total={total}
                clearCart={clearCart}
            />
        </>
    );
}

// Add Breadcrumbs to match default layout requirements
PosIndex.layout = {
    breadcrumbs: [
        {
            title: 'nav.pos',
            href: '/pos',
        },
    ],
};
