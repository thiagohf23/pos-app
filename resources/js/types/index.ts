export type * from './auth';
export type * from './navigation';
export type * from './ui';

export interface Employee {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    cpf: string | null;
    salary: string;
    hire_date: string | null;
    is_active: boolean;
    roles: { id: number; name: string }[];
}

export type CouponScope = 'all' | 'category' | 'product';

export interface Coupon {
    id: number;
    code: string;
    description: string | null;
    discount_percent: string;
    scope: CouponScope;
    max_uses: number | null;
    used_count: number;
    starts_at: string;
    expires_at: string;
    is_active: boolean;
    categories?: { id: number; name: string }[];
    products?: { id: number; name: string }[];
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions: Permission[];
}

export interface Supplier {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    cpf_cnpj: string | null;
    address: string | null;
    is_active: boolean;
}

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
    unit_price: string;
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
    payment_method: string;
    cash_tendered: string | null;
    change_amount: string | null;
    notes: string | null;
    coupon_id: number | null;
    coupon_code: string | null;
    sold_at: string;
    created_at: string;
    updated_at: string;
    items?: SaleItem[];
}
