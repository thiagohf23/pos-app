import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans p-6">
                <div className="max-w-md w-full text-center space-y-4">
                    <h1 className="text-3xl font-bold">Welcome Page</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        This is the default welcome page. The main application homepage has been moved to Home.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all shadow-xs"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </>
    );
}
