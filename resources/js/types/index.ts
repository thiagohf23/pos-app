export type * from './auth';
export type * from './navigation';
export type * from './ui';


export interface Category {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    products_count?: number;
}

export interface Product {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    image: string | null;
    is_active: boolean;
    category: Category;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface SaleItem {
    id: number;
    product_id: number;
    product_name: string;
    price: string;
    quantity: number;
    total: string;
}

export interface Sale {
    id: number;
    user_id: number | null;
    subtotal: string;
    discount: string;
    total: string;
    status: string;
    sold_at: string;
    created_at: string;
    updated_at: string;
    items?: SaleItem[];
}