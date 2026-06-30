import { useMemo, useReducer } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { cartReducer, findCartItem } from './cart-reducer';

export function useCart() {
    const [cart, dispatch] = useReducer(cartReducer, []);

    function addToCart(product: Product) {
        const existingItem = findCartItem(cart, product.id);

        if (existingItem && existingItem.quantity >= product.stock) {
            toast.error(
                `Only ${product.stock} items of "${product.name}" are in stock.`,
            );
        } else if (existingItem) {
            toast.success(`Increased "${product.name}" quantity.`);
        } else {
            toast.success(`Added "${product.name}" to cart.`);
        }

        dispatch({ type: 'ADD', product });
    }

    function updateQuantity(productId: number, delta: number) {
        const item = findCartItem(cart, productId);

        if (item && item.quantity + delta > item.product.stock) {
            toast.error(
                `Only ${item.product.stock} items of "${item.product.name}" are in stock.`,
            );
        }

        dispatch({ type: 'UPDATE_QTY', productId, delta });
    }

    function removeFromCart(productId: number) {
        const item = findCartItem(cart, productId);

        if (item) {
            toast.error(`Removed "${item.product.name}" from cart.`);
        }

        dispatch({ type: 'REMOVE', productId });
    }

    function clearCart() {
        dispatch({ type: 'CLEAR' });
    }

    const subtotal = useMemo(() => {
        return cart.reduce(
            (acc, item) => acc + parseFloat(item.product.price) * item.quantity,
            0,
        );
    }, [cart]);

    const discount = useMemo(() => {
        return subtotal > 100 ? subtotal * 0.05 : 0;
    }, [subtotal]);

    const total = useMemo(() => {
        return subtotal - discount;
    }, [subtotal, discount]);

    return {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        discount,
        total,
    };
}
