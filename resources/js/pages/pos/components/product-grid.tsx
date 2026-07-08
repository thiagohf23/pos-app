import { ShoppingCart } from 'lucide-react';
import type { Product, CartItem } from '@/types';
import { ProductCard } from './product-card';

interface Props {
    products: Product[];
    cart: CartItem[];
    onAddToCart: (product: Product) => void;
    selectedProductIndex: number;
}

export function ProductGrid({ products, cart, onAddToCart, selectedProductIndex }: Props) {
    if (products.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="mb-3 size-12 animate-pulse text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    No active products found
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Try adjusting your filters or search terms.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Keyboard Navigation Hints */}
            <div className="flex gap-1.5 flex-wrap items-center text-[9px] text-neutral-500 dark:text-neutral-400">
                <span className="font-semibold">Navigate:</span>
                <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-mono px-1.5 py-0.5 rounded border border-neutral-200/50 dark:border-neutral-800/80 select-none">
                    ↑↓←→
                </span>
                <span>/</span>
                <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-mono px-1.5 py-0.5 rounded border border-neutral-200/50 dark:border-neutral-800/80 select-none">
                    Alt+N
                </span>
                <span className="text-neutral-400">to clear</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pb-6 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {products.map((product, index) => {
                const cartQty =
                    cart.find((i) => i.product.id === product.id)?.quantity ??
                    0;

                return (
                    <ProductCard
                        key={product.id}
                        product={product}
                        cartQty={cartQty}
                        onAdd={onAddToCart}
                        isSelected={index === selectedProductIndex}
                    />
                );
            })}
            </div>
        </div>
    );
}
