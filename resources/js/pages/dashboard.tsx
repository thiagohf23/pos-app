import { Head } from '@inertiajs/react';
import {
    DollarSign,
    TrendingUp,
    ShoppingCart,
    AlertTriangle,
    Package,
    CreditCard,
    Smartphone,
    Banknote,
} from 'lucide-react';
import { dashboard } from '@/routes';

interface Props {
    metrics: {
        revenue: number;
        sales_count: number;
        avg_ticket: number;
        low_stock_count: number;
        out_of_stock_count: number;
        payment_methods: Record<string, { count: number; total: number }>;
        top_selling: Array<{
            product_id: number;
            product_name: string;
            quantity_sold: number;
            revenue: number;
        }>;
        recent_sales: Array<{
            id: number;
            total: string;
            payment_method: string;
            created_at: string;
            user?: { name: string };
        }>;
        low_stock_products: Array<{
            id: number;
            name: string;
            stock: number;
            category?: { name: string };
        }>;
    };
}

export default function Dashboard({ metrics }: Props) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'cash':
                return <Banknote className="size-4 text-emerald-500" />;
            case 'pix':
                return <Smartphone className="size-4 text-cyan-500" />;
            default:
                return <CreditCard className="size-4 text-blue-500" />;
        }
    };

    const getPaymentLabel = (method: string) => {
        switch (method) {
            case 'cash':
                return 'Cash';
            case 'pix':
                return 'PIX';
            case 'credit_card':
                return 'Credit Card';
            case 'debit_card':
                return 'Debit Card';
            default:
                return method;
        }
    };

    // Calculate payment percentages
    const totalPaymentsValue =
        Object.values(metrics.payment_methods).reduce(
            (acc, curr) => acc + curr.total,
            0,
        ) || 1;

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Real-time overview of your store's sales and inventory
                        levels.
                    </p>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Revenue Card */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/30">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                Total Revenue
                            </span>
                            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30">
                                <DollarSign className="size-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                                ${metrics.revenue.toFixed(2)}
                            </span>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                All-time sales value
                            </p>
                        </div>
                    </div>

                    {/* Average Ticket Card */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/30">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                Average Ticket
                            </span>
                            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/30">
                                <TrendingUp className="size-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                                ${metrics.avg_ticket.toFixed(2)}
                            </span>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Average order value
                            </p>
                        </div>
                    </div>

                    {/* Sales Count Card */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/30">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                Total Sales
                            </span>
                            <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950/30">
                                <ShoppingCart className="size-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                                {metrics.sales_count}
                            </span>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Completed checkouts
                            </p>
                        </div>
                    </div>

                    {/* Inventory Warning Card */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/30">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                Inventory Health
                            </span>
                            <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/30">
                                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                                {metrics.low_stock_count +
                                    metrics.out_of_stock_count}
                            </span>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                {metrics.out_of_stock_count} out &middot;{' '}
                                {metrics.low_stock_count} low stock items
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left 2 Columns */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Recent Transactions */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                Recent Sales
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-neutral-500 dark:text-neutral-400">
                                    <thead className="border-b border-neutral-100 text-xs font-bold tracking-wider text-neutral-400 uppercase dark:border-neutral-800">
                                        <tr>
                                            <th className="px-1 py-3">ID</th>
                                            <th className="px-2 py-3">
                                                Cashier
                                            </th>
                                            <th className="px-2 py-3">
                                                Payment
                                            </th>
                                            <th className="px-2 py-3">Date</th>
                                            <th className="px-2 py-3 text-right">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 font-mono dark:divide-neutral-800">
                                        {metrics.recent_sales.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-6 text-center text-xs text-neutral-400"
                                                >
                                                    No transactions recorded yet
                                                </td>
                                            </tr>
                                        ) : (
                                            metrics.recent_sales.map((sale) => (
                                                <tr
                                                    key={sale.id}
                                                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10"
                                                >
                                                    <td className="px-1 py-3.5 font-semibold text-neutral-900 dark:text-neutral-100">
                                                        #{sale.id}
                                                    </td>
                                                    <td className="px-2 py-3.5 font-sans text-neutral-700 dark:text-neutral-300">
                                                        {sale.user?.name ||
                                                            'System'}
                                                    </td>
                                                    <td className="px-2 py-3.5">
                                                        <div className="flex items-center gap-1.5 font-sans">
                                                            {getPaymentIcon(
                                                                sale.payment_method,
                                                            )}
                                                            <span className="text-xs">
                                                                {getPaymentLabel(
                                                                    sale.payment_method,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-3.5 text-xs">
                                                        {formatDate(
                                                            sale.created_at,
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-3.5 text-right font-bold text-emerald-600">
                                                        $
                                                        {parseFloat(
                                                            sale.total,
                                                        ).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Breakdown Progress Bars */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                Payment Methods Share
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(metrics.payment_methods).map(
                                    ([method, data]) => {
                                        const percent = Math.round(
                                            (data.total / totalPaymentsValue) *
                                                100,
                                        );

                                        return (
                                            <div
                                                key={method}
                                                className="space-y-2"
                                            >
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                                                        {getPaymentIcon(method)}
                                                        {getPaymentLabel(
                                                            method,
                                                        )}
                                                        <span className="font-normal text-neutral-400">
                                                            ({data.count} sales)
                                                        </span>
                                                    </div>
                                                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                                        ${data.total.toFixed(2)}{' '}
                                                        ({percent}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            method === 'cash'
                                                                ? 'bg-emerald-500'
                                                                : method ===
                                                                    'pix'
                                                                  ? 'bg-cyan-500'
                                                                  : 'bg-blue-500'
                                                        }`}
                                                        style={{
                                                            width: `${percent}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">
                        {/* Top Selling Products */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                Top Selling
                            </h2>
                            <div className="space-y-4">
                                {metrics.top_selling.length === 0 ? (
                                    <p className="py-4 text-center text-xs text-neutral-400">
                                        No items sold yet
                                    </p>
                                ) : (
                                    metrics.top_selling.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                #{index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                    {item.product_name}
                                                </p>
                                                <p className="font-mono text-[10px] text-neutral-500">
                                                    Qty: {item.quantity_sold}
                                                </p>
                                            </div>
                                            <span className="font-mono text-xs font-bold text-emerald-600">
                                                ${item.revenue.toFixed(2)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Inventory / Low Stock Alert List */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                    Stock Warnings
                                </h2>
                                <Package className="size-4 text-neutral-400" />
                            </div>
                            <div className="space-y-3.5">
                                {metrics.low_stock_products.length === 0 ? (
                                    <p className="py-4 text-center text-xs text-neutral-400">
                                        All products have good stock levels
                                    </p>
                                ) : (
                                    metrics.low_stock_products.map(
                                        (product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between border-b border-neutral-50 pb-2.5 last:border-0 last:pb-0 dark:border-neutral-800/40"
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="truncate text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500 uppercase">
                                                        {product.category
                                                            ?.name || 'General'}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${
                                                        product.stock === 0
                                                            ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                                                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                                                    }`}
                                                >
                                                    {product.stock === 0
                                                        ? 'Out of Stock'
                                                        : `${product.stock} left`}
                                                </span>
                                            </div>
                                        ),
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
