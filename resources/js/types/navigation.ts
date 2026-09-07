import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavLeafItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    roles?: string[];
};

export type NavGroupItem = {
    title: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    roles?: string[];
    items: NavItem[];
};

export type NavItem = NavLeafItem | NavGroupItem;

export function isNavLeaf(item: NavItem): item is NavLeafItem {
    return 'href' in item;
}
