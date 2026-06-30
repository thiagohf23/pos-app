import { ShoppingCart } from 'lucide-react';
import type { Product, CartItem } from '@/types';
import { ProductCard } from './product-card';

interface Props {
    products: Product[];
    cart: CartItem[];
    onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, cart, onAddToCart }: Props) {
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
        <div className="grid grid-cols-3 gap-3 pb-6 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {products.map((product) => {
                const cartQty =
                    cart.find((i) => i.product.id === product.id)?.quantity ??
                    0;

                return (
                    <ProductCard
                        key={product.id}
                        product={product}
                        cartQty={cartQty}
                        onAdd={onAddToCart}
                    />
                );
            })}
        </div>
    );
}
