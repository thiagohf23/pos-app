import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Folder,
    FolderGit2,
    LayoutGrid,
    Package,
    ShoppingCart,
    Ticket,
    Truck,
    Users,
    ClipboardList,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
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
import { index as stockAdjustmentsIndex } from '@/routes/stock-adjustments';
import { index as suppliersIndex } from '@/routes/suppliers';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'POS Terminal',
        href: posIndex().url,
        icon: ShoppingCart,
    },
    {
        title: 'Products',
        href: productsIndex().url,
        icon: Package,
    },
    {
        title: 'Categories',
        href: categoriesIndex().url,
        icon: Folder,
    },
    {
        title: 'Coupons',
        href: couponsIndex().url,
        icon: Ticket,
        roles: ['Admin'],
    },
    {
        title: 'Employees',
        href: employeesIndex().url,
        icon: Users,
        roles: ['Admin'],
    },
    {
        title: 'Suppliers',
        href: suppliersIndex().url,
        icon: Truck,
        roles: ['Admin'],
    },
    {
        title: 'Roles',
        href: rolesIndex().url,
        icon: Users,
        roles: ['Admin'],
    },
    {
        title: 'Permissions',
        href: permissionsIndex().url,
        icon: Users,
        roles: ['Admin'],
    },
    {
        title: 'Reports',
        href: reportsIndex().url,
        icon: BarChart3,
        roles: ['Admin'],
    },
    {
        title: 'Stock Adjustments',
        href: stockAdjustmentsIndex().url,
        icon: ClipboardList,
        roles: ['Admin'],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    const visibleNavItems = mainNavItems.filter(
        (item) => !item.roles || item.roles.some((role) => auth.roles.includes(role)),
    );

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={posIndex().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
