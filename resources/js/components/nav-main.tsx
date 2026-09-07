import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export type NavGroup = { label: string; items: NavItem[] };

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { t } = useTranslation();

    const renderItem = (item: NavItem) => {
        if ('items' in item && item.items && item.items.length > 0) {
            return (
                <Collapsible key={item.title} asChild>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={{ children: t(item.title) }}>
                                {item.icon && <item.icon />}
                                <span>{t(item.title)}</span>
                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.items.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={'href' in subItem ? isCurrentUrl(subItem.href) : false}
                                        >
                                            <Link href={'href' in subItem ? subItem.href : '#'} prefetch>
                                                <span>{t(subItem.title)}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            );
        }

        if ('href' in item) {
            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        isActive={isCurrentUrl(item.href)}
                        tooltip={{ children: t(item.title) }}
                    >
                        <Link href={item.href} prefetch>
                            {item.icon && <item.icon />}
                            <span>{t(item.title)}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        }

        return null;
    };

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.label} className="px-2 py-0">
                    <SidebarGroupLabel>{t(group.label)}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map(renderItem)}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
