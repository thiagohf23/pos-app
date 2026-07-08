import { LayoutGrid, Sun, Moon } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { LanguageSwitcher } from './language-switcher';

export function AppSidebarHeader() {
    const { toggleSidebar } = useSidebar();
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const toggleAppearance = () => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');

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
            </div>
            <div className="flex items-center space-x-2">
                <LanguageSwitcher />
                <button
                    onClick={toggleAppearance}
                    className="rounded-full p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label="Toggle theme"
                    title={`Switch to ${resolvedAppearance === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {resolvedAppearance === 'dark' ? (
                        <Sun className="size-5" />
                    ) : (
                        <Moon className="size-5" />
                    )}
                </button>
            </div>
        </header>
    );
}
