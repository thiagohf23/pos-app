import {
    ArrowRight,
    CreditCard,
    Image as ImageIcon,
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CartItem } from '@/types';

interface Props {
    cart: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    updateQuantity: (productId: number, delta: number) => void;
    removeFromCart: (productId: number) => void;
    onCheckout: () => void;
}

export function Cart({
    cart,
    subtotal,
    total,
    updateQuantity,
    removeFromCart,
    onCheckout,
}: Props) {
    return (
        <div className="flex h-full w-full flex-col border-t border-neutral-200 bg-white shadow-lg lg:w-96 lg:border-t-0 lg:border-l dark:border-neutral-800 dark:bg-neutral-900/50">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/20">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="size-5 text-neutral-700 dark:text-neutral-300" />
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-50">
                        Current Cart
                    </h3>
                </div>
                <Badge variant="secondary" className="font-bold">
                    {cart.reduce((a, b) => a + b.quantity, 0)} Items
                </Badge>
            </div>

            {/* Cart Items List */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {cart.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center py-12 text-center text-neutral-400">
                        <ShoppingCart className="mb-2 size-10 animate-bounce stroke-[1.5px]" />
                        <p className="text-sm font-medium">
                            Your cart is empty.
                        </p>
                        <p className="mt-1 max-w-[200px] text-xs text-neutral-500">
                            Click on catalog products to start a sale terminal
                            order.
                        </p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div
                            key={item.product.id}
                            className="group flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/40 p-2.5 transition-shadow hover:shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900/20"
                        >
                            {/* Item Thumbnail */}
                            <div className="dark:bg-neutral-850 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 dark:border-neutral-800">
                                {item.product.image ? (
                                    <img
                                        src={item.product.image.startsWith('http') ? item.product.image : `/storage/${item.product.image}`}
                                        alt={item.product.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="size-4 text-neutral-400" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                                <h5 className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                    {item.product.name}
                                </h5>
                                <div className="mt-0.5 text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                                    ${parseFloat(item.product.price).toFixed(2)}{' '}
                                    x {item.quantity}
                                </div>
                            </div>

                            {/* Action Quantity Controls */}
                            <div className="flex flex-col items-end gap-1.5">
                                <div className="dark:border-neutral-850 flex items-center gap-1 rounded-md border border-neutral-200 bg-white p-0.5 dark:bg-neutral-950">
                                    <button
                                        onClick={() =>
                                            updateQuantity(item.product.id, -1)
                                        }
                                        className="cursor-pointer rounded-md p-1 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        <Minus className="size-3" />
                                    </button>
                                    <span className="px-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            updateQuantity(item.product.id, 1)
                                        }
                                        className="cursor-pointer rounded-md p-1 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        <Plus className="size-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Remove button */}
                            <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="cursor-pointer p-1 text-neutral-300 transition-colors hover:text-red-500"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Order Summary calculations */}
            <div className="flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/20">
                <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        ${subtotal.toFixed(2)}
                    </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        Total
                    </span>
                    <span className="dark:text-emerald-450 text-xl font-extrabold text-emerald-600">
                        ${total.toFixed(2)}
                    </span>
                </div>

                {/* Checkout button */}
                <Button
                    onClick={onCheckout}
                    disabled={cart.length === 0}
                    className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-white shadow-lg transition-all hover:bg-emerald-500"
                >
                    <CreditCard className="size-4" />
                    Checkout Order
                    <ArrowRight className="ml-1 size-4" />
                </Button>
            </div>
        </div>
    );
}
