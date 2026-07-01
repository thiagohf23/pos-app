import { Head, Link, usePage } from '@inertiajs/react';
import { login, register, home } from '@/routes';
import { index as posIndex } from '@/routes/pos';
import { LayoutGrid, ShoppingCart, ShieldCheck, ArrowRight, Printer } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props as any;

    return (
        <>
            <Head title="Welcome to POS Terminal" />
            
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
                {/* Header */}
                <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 p-2 rounded-lg">
                                <ShoppingCart className="size-5" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">POS Terminal</span>
                        </div>

                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={posIndex().url}
                                    className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all shadow-xs"
                                >
                                    Go to POS <ArrowRight className="ml-2 size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all shadow-xs"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 lg:py-24 text-center max-w-4xl mx-auto">
                    <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 text-neutral-600 dark:text-neutral-400 mb-6">
                        Smart Point of Sale Solution
                    </span>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-neutral-950 to-neutral-700 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
                        Run your business smoothly with POS Terminal
                    </h1>

                    <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mb-10 leading-relaxed">
                        A modern, fast, and responsive Point of Sale system designed to make sales, manage inventory, and track metrics effortlessly.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-16">
                        {auth.user ? (
                            <Link
                                href={posIndex().url}
                                className="inline-flex items-center justify-center h-12 rounded-full bg-neutral-950 px-8 text-base font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all shadow-md"
                            >
                                Open POS Terminal
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center justify-center h-12 rounded-full bg-neutral-950 px-8 text-base font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all shadow-md"
                                >
                                    Get Started Free
                                </Link>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center h-12 rounded-full border border-neutral-300 dark:border-neutral-850 px-8 text-base font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Features Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full text-left border-t border-neutral-200 dark:border-neutral-800 pt-16 mt-8">
                        <div className="flex flex-col gap-3">
                            <div className="size-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-850 text-neutral-900 dark:text-neutral-100">
                                <ShoppingCart className="size-5" />
                            </div>
                            <h3 className="font-semibold text-lg">Fast Checkout</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Scan items, apply discounts, select payment methods, and finalize sales quickly.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="size-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-850 text-neutral-900 dark:text-neutral-100">
                                <LayoutGrid className="size-5" />
                            </div>
                            <h3 className="font-semibold text-lg">Inventory Control</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Keep track of stock quantities, set alerts, and manage product categories.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="size-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-850 text-neutral-900 dark:text-neutral-100">
                                <Printer className="size-5" />
                            </div>
                            <h3 className="font-semibold text-lg">Receipt Printing</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Integrated system to print structured receipts and sales summaries instantly.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="size-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-850 text-neutral-900 dark:text-neutral-100">
                                <ShieldCheck className="size-5" />
                            </div>
                            <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Built with modern security protocols ensuring safe transactions and data persistence.
                            </p>
                        </div>
                    </div>

                    {/* Tech Stack Section */}
                    <div className="w-full border-t border-neutral-200 dark:border-neutral-800 pt-16 mt-16 text-center">
                        <h2 className="text-2xl font-bold tracking-tight mb-8">Tecnologias Utilizadas</h2>
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
                            Este projeto é totalmente de código aberto sob a licença MIT, ideal para estudos de arquitetura moderna e como ponto de partida para sistemas comerciais.
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 bg-white dark:bg-neutral-950">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>&copy; {new Date().getFullYear()} POS Terminal. All rights reserved.</span>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
