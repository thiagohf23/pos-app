'use client';

import { Head, Deferred } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import type { Category, Product } from '@/types';
import { Cart } from './components/cart';
import { CheckoutDialog } from './components/checkout-dialog';
import { ProductGrid } from './components/product-grid';
import { useCart } from './components/use-cart';

interface Props {
    products?: Product[];
    categories?: Category[];
}

function CatalogSkeleton() {
    return (
        <div className="flex animate-pulse flex-col gap-6">
            {/* Category Badges Skeleton */}
            <div className="flex scrollbar-none gap-2 overflow-x-auto pb-2">
                <div className="h-8 w-24 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-8 w-28 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-8 w-20 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-8 w-32 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-8 w-24 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-3 gap-3 pb-6 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="dark:border-neutral-850 flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xs dark:bg-neutral-900/30"
                    >
                        {/* Image Skeleton */}
                        <div className="dark:border-neutral-850 aspect-square w-full border-b border-neutral-100/50 bg-neutral-100 dark:bg-neutral-900" />
                        {/* Info Skeleton */}
                        <div className="flex flex-col gap-1.5 p-2">
                            <div className="h-2.5 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                            <div className="mt-1 flex items-center justify-between">
                                <div className="h-3 w-10 rounded bg-neutral-200 dark:bg-neutral-800" />
                                <div className="h-2.5 w-6 rounded bg-neutral-200 dark:bg-neutral-800" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
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
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null,
    );
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);

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

    return (
        <>
            <Head title="Point of Sale (POS)" />

            <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-neutral-50 lg:flex-row dark:bg-neutral-950/40">
                {/* Product Catalog Area (Left) */}
                <div className="flex flex-1 flex-col gap-6 overflow-y-auto border-r border-neutral-200 p-6 dark:border-neutral-800">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                            POS Terminal
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Search and select items to add to the checkout
                            order.
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full">
                            <Search className="pointer-events-none absolute top-3 left-3 size-4 text-neutral-400" />
                            <Input
                                placeholder="Search by name, description or barcode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 bg-white pl-9 dark:bg-neutral-900/50"
                            />
                        </div>
                    </div>

                    <Deferred
                        data={['products', 'categories']}
                        fallback={<CatalogSkeleton />}
                    >
                        <>
                            {/* Category Badges */}
                            <div className="flex scrollbar-none gap-2 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setSelectedCategoryId(null)}
                                    className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                                        selectedCategoryId === null
                                            ? 'bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950'
                                            : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    All Categories
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            setSelectedCategoryId(category.id)
                                        }
                                        className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                                            selectedCategoryId === category.id
                                                ? 'bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950'
                                                : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>

                            {/* Products Grid */}
                            <ProductGrid
                                products={filteredProducts}
                                cart={cart}
                                onAddToCart={addToCart}
                            />
                        </>
                    </Deferred>
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
            title: 'POS Terminal',
            href: '/pos',
        },
    ],
};
