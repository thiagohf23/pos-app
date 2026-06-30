import { Image as ImageIcon } from 'lucide-react';
import type { Product } from '@/types';

interface Props {
    product: Product;
    cartQty: number;
    onAdd: (product: Product) => void;
}

export function ProductCard({ product, cartQty, onAdd }: Props) {
    const isOutOfStock = product.stock <= cartQty;

    return (
        <div
            onClick={() => !isOutOfStock && onAdd(product)}
            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-white shadow-xs transition-all duration-200 select-none dark:bg-neutral-900/30 ${
                isOutOfStock
                    ? 'cursor-not-allowed border-neutral-200 opacity-60 dark:border-neutral-800'
                    : 'border-neutral-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-600'
            }`}
        >
            {/* Product Image */}
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden border-b border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                {product.image ? (
                    <img
                        src={`/storage/${product.image}`}
                        alt={product.name}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <ImageIcon className="size-6 text-neutral-400" />
                )}

                {/* Quantity Badge in Cart */}
                {cartQty > 0 && (
                    <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-md">
                        {cartQty}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex flex-1 flex-col justify-between gap-1 p-2">
                <div className="min-w-0">
                    <div className="truncate text-[10px] font-medium tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                        {product.category?.name || 'Uncategorized'}
                    </div>
                    <h4 className="truncate text-xs font-bold text-neutral-900 transition-colors group-hover:text-emerald-600 dark:text-neutral-100">
                        {product.name}
                    </h4>
                </div>
                <div className="flex items-center justify-between gap-1">
                    <span className="dark:text-neutral-150 text-xs font-extrabold text-neutral-900">
                        ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="truncate text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                        {product.stock - cartQty}
                    </span>
                </div>
            </div>
        </div>
    );
}
