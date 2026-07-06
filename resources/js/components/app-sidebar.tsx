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
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppLogo from '@/components/app-logo';
import { LanguageSwitcher } from '@/components/language-switcher';
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
import { index as employeesIndex } from '@/routes/employees';
import { index as suppliersIndex } from '@/routes/suppliers';
import { index as couponsIndex } from '@/routes/coupons';
import { index as posIndex } from '@/routes/pos';
import { index as productsIndex } from '@/routes/products';
import { index as rolesIndex } from '@/routes/roles';
import { index as permissionsIndex } from '@/routes/permissions';
import { index as reportsIndex } from '@/routes/reports';
import { index as stockAdjustmentsIndex } from '@/routes/stock-adjustments';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
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
        title: 'nav.coupons',
        href: couponsIndex().url,
        icon: Ticket,
        roles: ['Admin'],
    },
    {
        title: 'nav.employees',
        href: employeesIndex().url,
        icon: Users,
        roles: ['Admin'],
    },
    {
        title: 'nav.suppliers',
        href: suppliersIndex().url,
        icon: Truck,
        roles: ['Admin'],
    },
    {
        title: 'nav.roles',
        href: rolesIndex().url,
        icon: Users,
        roles: ['Admin'],
    },
    {
        title: 'nav.permissions',
        href: permissionsIndex().url,
        icon: Users,
        roles: ['Admin'],
    },
    {
        title: 'nav.stock_adjustments',
        href: stockAdjustmentsIndex().url,
        icon: Package,
        roles: ['Admin'],
    },
    {
        title: 'nav.reports',
        href: reportsIndex().url,
        icon: BarChart3,
        roles: ['Admin'],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'sidebar.repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'sidebar.documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const { t } = useTranslation();

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
                <LanguageSwitcher variant="mobile" />
            </SidebarFooter>
        </Sidebar>
    );
}
