import { router } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { locales, type Locale } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
    variant?: 'desktop' | 'mobile';
};

export function LanguageSwitcher({ variant = 'desktop' }: Props) {
    const { i18n } = useTranslation();
    const current = i18n.language as Locale;

    const handleSwitch = (locale: Locale) => {
        if (locale === current) return;
        document.cookie = `locale=${locale};path=/;max-age=${60 * 24 * 365};SameSite=Strict`;
        i18n.changeLanguage(locale);
        router.reload({ only: [] });
    };

    if (variant === 'mobile') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Globe className="size-4" />
                        <span>{locales[current]?.flag}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {(Object.keys(locales) as Locale[]).map((locale) => (
                        <DropdownMenuItem
                            key={locale}
                            onClick={() => handleSwitch(locale)}
                            className={locale === current ? 'bg-accent' : ''}
                        >
                            <span className="mr-2">{locales[locale].flag}</span>
                            {locales[locale].label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9"
                        >
                            <Globe className="size-5 opacity-80" />
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{locales[current]?.label}</p>
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
                {(Object.keys(locales) as Locale[]).map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        onClick={() => handleSwitch(locale)}
                        className={locale === current ? 'bg-accent' : ''}
                    >
                        <span className="mr-2">{locales[locale].flag}</span>
                        {locales[locale].label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
