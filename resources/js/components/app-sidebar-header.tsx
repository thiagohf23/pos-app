import { LayoutGrid } from 'lucide-react';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { toggleSidebar } = useSidebar();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear md:px-4">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="-ml-1 size-8 cursor-pointer"
                    aria-label="Toggle sidebar"
                >
                    <LayoutGrid className="size-5" />
                </Button>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
                <AppearanceToggleTab />
            </div>
        </header>
    );
}
