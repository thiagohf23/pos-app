import { Head, Link, usePage } from '@inertiajs/react';
import {
    ShoppingCart,
    Package,
    Boxes,
    History,
    Ticket,
    Truck,
    BarChart3,
    ShieldCheck,
    ArrowRight,
    Sun,
    Moon,
    type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppLogoIcon from '@/components/app-logo-icon';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useAppearance } from '@/hooks/use-appearance';
import { login, register } from '@/routes';
import { index as posIndex } from '@/routes/pos';

type FeatureModule = {
    icon: LucideIcon;
    titleKey: string;
    descKey: string;
};

const featureModules: FeatureModule[] = [
    { icon: ShoppingCart, titleKey: 'home.mod_pos_title', descKey: 'home.mod_pos_desc' },
    { icon: Package, titleKey: 'home.mod_catalog_title', descKey: 'home.mod_catalog_desc' },
    { icon: Boxes, titleKey: 'home.mod_stock_title', descKey: 'home.mod_stock_desc' },
    { icon: History, titleKey: 'home.mod_sales_title', descKey: 'home.mod_sales_desc' },
    { icon: Ticket, titleKey: 'home.mod_coupons_title', descKey: 'home.mod_coupons_desc' },
    { icon: Truck, titleKey: 'home.mod_suppliers_title', descKey: 'home.mod_suppliers_desc' },
    { icon: BarChart3, titleKey: 'home.mod_reports_title', descKey: 'home.mod_reports_desc' },
    { icon: ShieldCheck, titleKey: 'home.mod_access_title', descKey: 'home.mod_access_desc' },
];

export default function Home() {
    const { auth } = usePage().props as any;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const { t } = useTranslation();

    const toggleAppearance = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            <Head title={t('home.title')} />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
                {/* Header */}
                <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className='size-24' />
                        </div>

                        <nav className="flex items-center gap-2">
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

                            {auth.user ? (
                                <Link
                                    href={posIndex().url}
                                    className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all shadow-xs"
                                >
                                    {t('home.go_to_pos')} <ArrowRight className="ml-2 size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                                    >
                                        {t('home.login')}
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all shadow-xs"
                                    >
                                        {t('home.register')}
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 lg:py-24 text-center max-w-4xl mx-auto">
                    <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 text-neutral-600 dark:text-neutral-400 mb-6">
                        {t('home.hero_tagline')}
                    </span>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-neutral-950 to-neutral-700 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
                        {t('home.hero_title')}
                    </h1>

                    <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mb-10 leading-relaxed">
                        {t('home.hero_desc')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-16">
                        {auth.user ? (
                            <Link
                                href={posIndex().url}
                                className="inline-flex items-center justify-center h-12 rounded-full bg-neutral-950 px-8 text-base font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all shadow-md"
                            >
                                {t('home.open_pos')}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center justify-center h-12 rounded-full bg-neutral-950 px-8 text-base font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all shadow-md"
                                >
                                    {t('home.get_started')}
                                </Link>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center h-12 rounded-full border border-neutral-300 dark:border-neutral-850 px-8 text-base font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all"
                                >
                                    {t('home.sign_in')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Features Section */}
                    <div className="w-full border-t border-neutral-200 dark:border-neutral-800 pt-16 mt-8">
                        <h2 className="text-3xl font-bold tracking-tight mb-3">{t('home.features_heading')}</h2>
                        <p className="text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mb-12">
                            {t('home.features_subheading')}
                        </p>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full text-left">
                            {featureModules.map(({ icon: Icon, titleKey, descKey }) => (
                                <div key={titleKey} className="flex flex-col gap-3">
                                    <div className="size-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-850 text-neutral-900 dark:text-neutral-100">
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="font-semibold text-lg">{t(titleKey)}</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {t(descKey)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tech Stack Section */}
                    <div className="w-full border-t border-neutral-200 dark:border-neutral-800 pt-16 mt-16 text-center">
                        <h2 className="text-2xl font-bold tracking-tight mb-8">{t('home.tech_title')}</h2>
                        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 backdrop-blur-xs">
                                Laravel 13
                            </span>
                            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 backdrop-blur-xs">
                                React 19
                            </span>
                            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 backdrop-blur-xs">
                                Inertia.js v3
                            </span>
                            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 backdrop-blur-xs">
                                Tailwind CSS v4
                            </span>
                            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 backdrop-blur-xs">
                                TypeScript
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-6 max-w-md mx-auto leading-relaxed">
                            {t('home.open_source')}
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 bg-white dark:bg-neutral-950">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>&copy; {new Date().getFullYear()} POS Terminal. {t('home.copyright')}</span>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{t('home.privacy_policy')}</a>
                            <a href="#" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{t('home.terms_of_service')}</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
