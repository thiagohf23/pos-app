import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Folder,
    Zap,
    LayoutGrid,
    Package,
    ShoppingCart,
    Ticket,
    Truck,
    ClipboardList,
    History,
    Lock,
} from 'lucide-react';

import AppLogoIcon from '@/components/app-logo-icon';

import { NavFooter } from '@/components/nav-footer';
import { NavMain  } from '@/components/nav-main';
import type {NavGroup} from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as categoriesIndex } from '@/routes/categories';
import { index as couponsIndex } from '@/routes/coupons';
import { index as employeesIndex } from '@/routes/employees';
import { index as permissionsIndex } from '@/routes/permissions';
import { index as posIndex } from '@/routes/pos';
import { index as productsIndex } from '@/routes/products';
import { index as reportsIndex } from '@/routes/reports';
import { index as rolesIndex } from '@/routes/roles';
import { index as salesIndex } from '@/routes/sales';
import { index as stockAdjustmentsIndex } from '@/routes/stock-adjustments';
import { index as suppliersIndex } from '@/routes/suppliers';
import type { NavItem } from '@/types';

const navGroups: NavGroup[] = [
    {
        label: 'nav.group_sales',
        items: [
            {
                title: 'nav.dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'nav.pos',
                href: posIndex().url,
                icon: ShoppingCart,
            },
            {
                title: 'nav.sales',
                href: salesIndex().url,
                icon: History,
            },
        ],
    },
    {
        label: 'nav.group_catalog',
        items: [
            {
                title: 'nav.products',
                href: productsIndex().url,
                icon: Package,
            },
            {
                title: 'nav.categories',
                href: categoriesIndex().url,
                icon: Folder,
            },
            {
                title: 'nav.suppliers',
                href: suppliersIndex().url,
                icon: Truck,
                roles: ['Admin'],
            },
            {
                title: 'nav.stock_adjustments',
                href: stockAdjustmentsIndex().url,
                icon: ClipboardList,
                roles: ['Admin'],
            },
        ],
    },
    {
        label: 'nav.group_marketing',
        items: [
            {
                title: 'nav.coupons',
                href: couponsIndex().url,
                icon: Ticket,
                roles: ['Admin'],
            },
        ],
    },
    {
        label: 'nav.group_admin',
        items: [
            {
                title: 'nav.reports',
                href: reportsIndex().url,
                icon: BarChart3,
                roles: ['Admin'],
            },
            {
                title: 'nav.access_control',
                icon: Lock,
                roles: ['Admin'],
                items: [
                    {
                        title: 'nav.employees',
                        href: employeesIndex().url,
                    },
                    {
                        title: 'nav.roles',
                        href: rolesIndex().url,
                    },
                    {
                        title: 'nav.permissions',
                        href: permissionsIndex().url,
                    },
                ],
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'nav.Home_Page',
        href: '/',
        icon: Zap,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    const filterItemByRole = (item: NavItem): boolean => {
        return !item.roles || item.roles.some((role) => auth.roles.includes(role));
    };

    const visibleGroups = navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter(filterItemByRole),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={posIndex().url} prefetch>
                                <AppLogoIcon className="size-27" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={visibleGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
