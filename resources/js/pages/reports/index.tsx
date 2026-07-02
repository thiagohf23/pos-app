import { Head, router } from '@inertiajs/react';
import {
    DollarSign,
    TrendingUp,
    ShoppingCart,
    Percent,
    Download,
    CreditCard,
    Smartphone,
    Banknote,
    Package,
    FileDown,
    Printer,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { index as reportsIndex, exportMethod, exportPdf } from '@/routes/reports';

interface Summary {
    total_sales: number;
    total_revenue: number;
    total_discount: number;
    average_ticket: number;
}

interface PaymentMethod {
    method: string;
    label: string;
    count: number;
    total: number;
}

interface TopProduct {
    product_id: number;
    product_name: string;
    total_quantity: number;
    total_revenue: number;
}

interface DailySale {
    date: string;
    count: number;
    total: number;
}

interface Filters {
    start_date: string;
    end_date: string;
}

interface Props {
    summary: Summary;
    salesByPaymentMethod: PaymentMethod[];
    topProducts: TopProduct[];
    dailySales: DailySale[];
    filters: Filters;
}

export default function ReportsIndex({
    summary,
    salesByPaymentMethod,
    topProducts,
    dailySales,
    filters,
}: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    function handleFilter() {
        router.get(
            reportsIndex().url,
            { start_date: startDate, end_date: endDate },
            { preserveState: true },
        );
    }

    function handleExport() {
        const url = exportMethod.url({
            start_date: startDate,
            end_date: endDate,
        });
        window.location.href = url;
    }

    function handlePrint() {
        window.print();
    }

    function handleExportPdf() {
        const url = exportPdf.url({
            start_date: startDate,
            end_date: endDate,
        });
        window.location.href = url;
    }

    const maxDailyTotal = Math.max(...dailySales.map((d) => d.total), 1);

    const totalPaymentAmount =
        salesByPaymentMethod.reduce((acc, curr) => acc + curr.total, 0) || 1;

    return (
        <>
            <Head title="Reports" />

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-header {
                        display: block !important;
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 2px solid #000;
                    }
                    .print-date {
                        display: block !important;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        margin-bottom: 20px;
                    }
                    .daily-sales-bars > div {
                        background: #000 !important;
                    }
                }
            `}</style>

            <div className="print-area">
                {/* Print Header - only visible when printing */}
                <div className="print-header hidden">
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Sales Report</h1>
                </div>
                <div className="print-date hidden">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                <div className="flex flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                                Sales Reports
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                Analyze sales performance across date ranges.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={handlePrint}
                                className="cursor-pointer gap-2 bg-neutral-200 text-neutral-700 shadow-md transition-all duration-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                            >
                                <Printer className="size-4" />
                                Print
                            </Button>
                            <Button
                                onClick={handleExportPdf}
                                className="cursor-pointer gap-2 bg-red-600 text-white shadow-md transition-all duration-200 hover:bg-red-700"
                            >
                                <FileDown className="size-4" />
                                PDF
                            </Button>
                            <Button
                                onClick={handleExport}
                                className="cursor-pointer gap-2 bg-neutral-950 shadow-md transition-all duration-200 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                            >
                                <Download className="size-4" />
                                CSV
                            </Button>
                        </div>
                    </div>

                {/* Date Filters */}
                <div className="no-print flex flex-wrap items-end gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
                        />
                    </div>
                    <Button
                        onClick={handleFilter}
                        className="cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                        Apply Filter
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                                ${summary.total_revenue.toFixed(2)}
                            </span>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Within selected period
                            </p>
                        </div>
                    </div>

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
                                {summary.total_sales}
                            </span>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Completed transactions
                            </p>
                        </div>
                    </div>

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
                                ${summary.average_ticket.toFixed(2)}
                            </span>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Per transaction
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/30">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                Total Discounts
                            </span>
                            <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/30">
                                <Percent className="size-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                                ${summary.total_discount.toFixed(2)}
                            </span>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Applied to orders
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left 2 Columns */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Daily Sales Chart */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                Daily Sales
                            </h2>
                            {dailySales.length === 0 ? (
                                <p className="py-8 text-center text-sm text-neutral-400">
                                    No sales data for this period
                                </p>
                            ) : (
                                <div className="flex items-end gap-1.5" style={{ height: '200px' }}>
                                    {dailySales.map((day) => (
                                        <div
                                            key={day.date}
                                            className="group flex flex-1 flex-col items-center gap-1"
                                        >
                                            <div className="relative w-full" style={{ height: '160px' }}>
                                                <div
                                                    className="absolute bottom-0 w-full rounded-t bg-emerald-500 transition-all group-hover:bg-emerald-600"
                                                    style={{
                                                        height: `${(day.total / maxDailyTotal) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500">
                                                {new Date(day.date).getDate()}
                                            </span>
                                            <span className="hidden text-[10px] font-bold text-neutral-700 group-hover:block dark:text-neutral-300">
                                                ${day.total.toFixed(0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Products */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                Top Products
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-neutral-500 dark:text-neutral-400">
                                    <thead className="border-b border-neutral-100 text-xs font-bold tracking-wider text-neutral-400 uppercase dark:border-neutral-800">
                                        <tr>
                                            <th className="px-1 py-3">#</th>
                                            <th className="px-2 py-3">Product</th>
                                            <th className="px-2 py-3 text-right">Qty Sold</th>
                                            <th className="px-2 py-3 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 font-mono dark:divide-neutral-800">
                                        {topProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-6 text-center text-xs text-neutral-400">
                                                    No product data for this period
                                                </td>
                                            </tr>
                                        ) : (
                                            topProducts.map((product, index) => (
                                                <tr
                                                    key={product.product_id}
                                                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10"
                                                >
                                                    <td className="px-1 py-3.5 font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-2 py-3.5 font-sans text-neutral-700 dark:text-neutral-300">
                                                        {product.product_name}
                                                    </td>
                                                    <td className="px-2 py-3.5 text-right">
                                                        {product.total_quantity}
                                                    </td>
                                                    <td className="px-2 py-3.5 text-right font-bold text-emerald-600">
                                                        ${product.total_revenue.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Payment Methods */}
                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                Payment Methods
                            </h2>
                            <div className="space-y-4">
                                {salesByPaymentMethod.length === 0 ? (
                                    <p className="py-4 text-center text-xs text-neutral-400">
                                        No payment data for this period
                                    </p>
                                ) : (
                                    salesByPaymentMethod.map((item) => {
                                        const percent = Math.round(
                                            (item.total / totalPaymentAmount) * 100,
                                        );

                                        return (
                                            <div key={item.method} className="space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                                                        {item.method === 'cash' && <Banknote className="size-4 text-emerald-500" />}
                                                        {item.method === 'pix' && <Smartphone className="size-4 text-cyan-500" />}
                                                        {item.method !== 'cash' && item.method !== 'pix' && (
                                                            <CreditCard className="size-4 text-blue-500" />
                                                        )}
                                                        {item.label}
                                                        <span className="font-normal text-neutral-400">
                                                            ({item.count} sales)
                                                        </span>
                                                    </div>
                                                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                                        ${item.total.toFixed(2)} ({percent}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            item.method === 'cash'
                                                                ? 'bg-emerald-500'
                                                                : item.method === 'pix'
                                                                  ? 'bg-cyan-500'
                                                                  : 'bg-blue-500'
                                                        }`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: '/reports',
        },
    ],
};
