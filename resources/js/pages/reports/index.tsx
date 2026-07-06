import { Head, router } from '@inertiajs/react';
import {
    DollarSign,
    TrendingUp,
    ShoppingCart,
    Percent,
    Download,
    Printer,
    FileDown,
    Search,
    ChevronDown,
    Check,
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
    payment_method: string | null;
    category_id: number | null;
    product_id: number | null;
}

interface PaymentMethodOption {
    value: string;
    label: string;
}

interface CategoryOption {
    id: number;
    name: string;
}

interface ProductOption {
    id: number;
    name: string;
}

interface Props {
    summary: Summary;
    salesByPaymentMethod: PaymentMethod[];
    topProducts: TopProduct[];
    dailySales: DailySale[];
    filters: Filters;
    paymentMethods: PaymentMethodOption[];
    categories: CategoryOption[];
    products: ProductOption[];
}

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { id: string | number; name: string }[];
    placeholder: string;
    label: string;
}

function SearchableSelect({ value, onChange, options, placeholder, label }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const selectedOption = options.find((opt) => String(opt.id) === value);

    const filteredOptions = options.filter((opt) =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative flex flex-col gap-1.5 min-w-[200px]">
            <label className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex h-[38px] w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm text-neutral-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:ring-neutral-300 cursor-pointer"
                >
                    <span className="block truncate">
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        
                        <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-md border border-neutral-200 bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm dark:border-neutral-700 dark:bg-neutral-800">
                            <div className="sticky top-0 z-10 bg-white px-2 py-1.5 dark:bg-neutral-800">
                                <div className="flex items-center rounded-md border border-neutral-200 px-2 py-1 dark:border-neutral-700">
                                    <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50 text-neutral-505 dark:text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-transparent py-1 text-xs outline-none text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <ul className="max-h-48 overflow-y-auto py-1">
                                <li
                                    onClick={() => {
                                        onChange('');
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className="relative cursor-pointer select-none py-1.5 pl-8 pr-4 text-neutral-900 hover:bg-neutral-100 dark:text-neutral-50 dark:hover:bg-neutral-700 text-xs"
                                >
                                    {!value && (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5">
                                            <Check className="h-3.5 w-3.5 text-neutral-950 dark:text-neutral-50" />
                                        </span>
                                    )}
                                    {placeholder}
                                </li>
                                {filteredOptions.length === 0 ? (
                                    <li className="relative cursor-default select-none py-2 px-4 text-neutral-500 text-xs">
                                        No results found
                                    </li>
                                ) : (
                                    filteredOptions.map((opt) => (
                                        <li
                                            key={opt.id}
                                            onClick={() => {
                                                onChange(String(opt.id));
                                                setIsOpen(false);
                                                setSearch('');
                                            }}
                                            className="relative cursor-pointer select-none py-1.5 pl-8 pr-4 text-neutral-900 hover:bg-neutral-100 dark:text-neutral-50 dark:hover:bg-neutral-700 text-xs"
                                        >
                                            {String(opt.id) === value && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5">
                                                    <Check className="h-3.5 w-3.5 text-neutral-950 dark:text-neutral-50" />
                                                </span>
                                            )}
                                            <span className="block truncate">{opt.name}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ReportsIndex({
    summary,
    salesByPaymentMethod,
    topProducts,
    dailySales,
    filters,
    paymentMethods,
    categories,
    products,
}: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ? String(filters.category_id) : '');
    const [productId, setProductId] = useState(filters.product_id ? String(filters.product_id) : '');

    function buildQuery(): Record<string, string> {
        const query: Record<string, string> = {
            start_date: startDate,
            end_date: endDate,
        };

        if (paymentMethod) {
            query.payment_method = paymentMethod;
        }
        if (categoryId) {
            query.category_id = categoryId;
        }
        if (productId) {
            query.product_id = productId;
        }

        return query;
    }

    function handleFilter() {
        router.get(reportsIndex().url, buildQuery(), { preserveState: true });
    }
    
    function handleClearFilters() {
        setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
        setEndDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);
        setPaymentMethod('');
        setCategoryId('');
        setProductId('');
        router.get(reportsIndex().url, {}, { preserveState: false });
    }

    function handleExport() {
        window.location.href = exportMethod.url({ query: buildQuery() });
    }

    function handlePrint() {
        window.print();
    }

    function handleExportPdf() {
        window.location.href = exportPdf.url({ query: buildQuery() });
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
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                            Payment
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
                        >
                            <option value="">All methods</option>
                            {paymentMethods.map((method) => (
                                <option key={method.value} value={method.value}>
                                    {method.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <SearchableSelect
                        value={categoryId}
                        onChange={setCategoryId}
                        options={categories}
                        placeholder="All categories"
                        label="Category"
                    />
                    <SearchableSelect
                        value={productId}
                        onChange={setProductId}
                        options={products}
                        placeholder="All products"
                        label="Product"
                    />
                    <div className="flex gap-2">
                        <Button
                            onClick={handleFilter}
                            className="cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                        >
                            Apply Filter
                        </Button>
                        {(paymentMethod !== '' ||
                          categoryId !== '' ||
                          productId !== '' ||
                          startDate !== new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0] ||
                          endDate !== new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearFilters}
                                className="cursor-pointer border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
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
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                    Daily Sales
                                </h2>
                                {dailySales.length > 0 && (
                                    <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                                        Total: ${dailySales.reduce((a, d) => a + d.total, 0).toFixed(2)}
                                    </span>
                                )}
                            </div>
                            {dailySales.length === 0 ? (
                                <p className="py-8 text-center text-sm text-neutral-400">
                                    No sales data for this period
                                </p>
                            ) : (
                                <div className="flex gap-2">
                                    {/* Y-Axis */}
                                    <div className="flex flex-col justify-between py-1 text-right" style={{ height: '180px' }}>
                                        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                                            ${maxDailyTotal.toFixed(0)}
                                        </span>
                                        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                                            ${(maxDailyTotal / 2).toFixed(0)}
                                        </span>
                                        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                                            $0
                                        </span>
                                    </div>

                                    {/* Chart Area */}
                                    <div className="flex-1">
                                        {/* Grid lines */}
                                        <div className="relative" style={{ height: '180px' }}>
                                            <div className="absolute inset-0 flex flex-col justify-between">
                                                <div className="border-b border-dashed border-neutral-100 dark:border-neutral-800" />
                                                <div className="border-b border-dashed border-neutral-100 dark:border-neutral-800" />
                                                <div className="border-b border-neutral-100 dark:border-neutral-800" />
                                            </div>

                                            {/* Bars */}
                                            <div className="absolute inset-0 flex items-end gap-1 px-0.5">
                                                {dailySales.map((day) => {
                                                    const height = (day.total / maxDailyTotal) * 100;
                                                    const dayName = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
                                                    const dayNum = new Date(day.date + 'T12:00:00').getDate();

                                                    return (
                                                        <div
                                                            key={day.date}
                                                            className="group relative flex flex-1 items-end"
                                                        >
                                                            {/* Tooltip */}
                                                            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-2 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-neutral-50 dark:text-neutral-900">
                                                                <div className="font-bold">{dayName}, {dayNum}</div>
                                                                <div className="mt-0.5 font-mono">${day.total.toFixed(2)}</div>
                                                                <div className="text-neutral-400 dark:text-neutral-500">{day.count} sale{day.count !== 1 ? 's' : ''}</div>
                                                                {/* Arrow */}
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-50" />
                                                            </div>

                                                            {/* Bar */}
                                                            <div
                                                                className="w-full rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-200 group-hover:from-emerald-700 group-hover:to-emerald-500 group-hover:shadow-md dark:from-emerald-500 dark:to-emerald-300 dark:group-hover:from-emerald-600 dark:group-hover:to-emerald-400"
                                                                style={{ height: `${Math.max(height, 2)}%` }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* X-Axis Labels */}
                                        <div className="mt-2 flex gap-1 px-0.5">
                                            {dailySales.map((day) => {
                                                const d = new Date(day.date + 'T12:00:00');
                                                const showLabel = dailySales.length <= 14 || d.getDate() % Math.ceil(dailySales.length / 14) === 1;

                                                return (
                                                    <div key={day.date} className="flex flex-1 justify-center">
                                                        {showLabel && (
                                                            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500">
                                                                {d.getDate()}/{d.getMonth() + 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Top Products */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                Top Products
                            </h2>
                            {topProducts.length === 0 ? (
                                <p className="py-8 text-center text-sm text-neutral-400">
                                    No product data for this period
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {topProducts.map((product, index) => {
                                        const maxRevenue = topProducts[0]?.total_revenue || 1;
                                        const barWidth = (product.total_revenue / maxRevenue) * 100;
                                        const colors = [
                                            'from-emerald-500 to-emerald-400',
                                            'from-blue-500 to-blue-400',
                                            'from-purple-500 to-purple-400',
                                            'from-amber-500 to-amber-400',
                                            'from-rose-500 to-rose-400',
                                        ];

                                        return (
                                            <div key={product.product_id} className="group">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-[10px] font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                                            {product.product_name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                                            {product.total_quantity} unit{product.total_quantity !== 1 ? 's' : ''}
                                                        </span>
                                                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                            ${product.total_revenue.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                    <div
                                                        className={`h-full rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500 group-hover:shadow-sm`}
                                                        style={{ width: `${barWidth}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Payment Methods */}
                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                Payment Methods
                            </h2>
                            {salesByPaymentMethod.length === 0 ? (
                                <p className="py-4 text-center text-xs text-neutral-400">
                                    No payment data for this period
                                </p>
                            ) : (
                                <>
                                    {/* Stacked Bar */}
                                    <div className="mb-5 flex h-4 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        {salesByPaymentMethod.map((item) => {
                                            const percent = (item.total / totalPaymentAmount) * 100;
                                            return (
                                                <div
                                                    key={item.method}
                                                    className={`transition-all duration-300 ${
                                                        item.method === 'cash'
                                                            ? 'bg-emerald-500'
                                                            : item.method === 'pix'
                                                              ? 'bg-cyan-500'
                                                              : 'bg-blue-500'
                                                    }`}
                                                    style={{ width: `${percent}%` }}
                                                    title={`${item.label}: $${item.total.toFixed(2)} (${Math.round(percent)}%)`}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Legend + Details */}
                                    <div className="space-y-3">
                                        {salesByPaymentMethod.map((item) => {
                                            const percent = Math.round(
                                                (item.total / totalPaymentAmount) * 100,
                                            );

                                            return (
                                                <div key={item.method} className="flex items-center gap-3">
                                                    <div className={`h-3 w-3 shrink-0 rounded-full ${
                                                        item.method === 'cash'
                                                            ? 'bg-emerald-500'
                                                            : item.method === 'pix'
                                                              ? 'bg-cyan-500'
                                                              : 'bg-blue-500'
                                                    }`} />
                                                    <div className="flex flex-1 items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                                                {item.label}
                                                            </span>
                                                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                                                {item.count} sale{item.count !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                                ${item.total.toFixed(2)}
                                                            </span>
                                                            <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                                                                {percent}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
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
            title: 'nav.reports',
            href: '/reports',
        },
    ],
};
