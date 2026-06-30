import type { CartItem, Product } from '@/types';

export type CartAction =
    | { type: 'ADD'; product: Product }
    | { type: 'UPDATE_QTY'; productId: number; delta: number }
    | { type: 'REMOVE'; productId: number }
    | { type: 'CLEAR' };

/**
 * Finds a cart line by product id. Shared between the pure reducer and the
 * hook's action-creators so the lookup rule lives in a single place.
 */
export function findCartItem(
    cart: CartItem[],
    productId: number,
): CartItem | undefined {
    return cart.find((item) => item.product.id === productId);
}

/**
 * Pure state-transition function for the cart. Holds no side-effects (no
 * toasts, no I/O), so it can be reasoned about and unit-tested in isolation.
 */
export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
    switch (action.type) {
        case 'ADD': {
            const existingItem = findCartItem(state, action.product.id);

            if (existingItem) {
                if (existingItem.quantity >= action.product.stock) {
                    return state;
                }

                return state.map((item) =>
                    item.product.id === action.product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            return [...state, { product: action.product, quantity: 1 }];
        }

        case 'UPDATE_QTY': {
            return state
                .map((item) => {
                    if (item.product.id !== action.productId) {
                        return item;
                    }

                    const newQty = item.quantity + action.delta;

                    if (newQty <= 0) {
                        return null;
                    }

                    if (newQty > item.product.stock) {
                        return item;
                    }

                    return { ...item, quantity: newQty };
                })
                .filter((item): item is CartItem => item !== null);
        }

        case 'REMOVE': {
            return state.filter((item) => item.product.id !== action.productId);
        }

        case 'CLEAR': {
            return [];
        }

        default: {
            const exhaustiveCheck: never = action;

            return exhaustiveCheck;
        }
    }
}
