import { Head, router, usePage } from '@inertiajs/react';
import { Search, TrendingUp, ShoppingBag, Tag, Calendar, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { Pagination } from '@/components/pagination';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cancel } from '@/routes/sales';
import type { Paginated, Sale } from '@/types';
import { SaleDetailsDialog } from './components/sale-details-dialog';
import { SaleTable } from './components/sale-table';

interface Props {
    sales: Paginated<Sale>;
    filters: {
        search?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
    };
    summary: {
        total_revenue: number;
        total_sales: number;
        total_discounts: number;
    };
}

export default function SalesIndex({ sales, filters, summary }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const isAdmin = auth.roles?.includes('Admin') || false;

    // Filter states
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    // Modal states
    const [refundingSale, setRefundingSale] = useState<Sale | null>(null);
    const [isRefunding, setIsRefunding] = useState(false);
    const [detailingSale, setDetailingSale] = useState<Sale | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Combine and run filters
    const runFilters = (searchVal: string, statusVal: string, startVal: string, endVal: string) => {
        const queryParams: Record<string, string> = {};

        if (searchVal) {
queryParams.search = searchVal;
}

        if (statusVal && statusVal !== 'all') {
queryParams.status = statusVal;
}

        if (startVal) {
queryParams.start_date = startVal;
}

        if (endVal) {
queryParams.end_date = endVal;
}

        router.get('/sales', queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    // Debounce search query
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                runFilters(searchTerm, statusFilter, startDate, endDate);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Handle filter changes instantly for non-search inputs
    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        runFilters(searchTerm, val, startDate, endDate);
    };

    const handleStartDateChange = (val: string) => {
        setStartDate(val);
        runFilters(searchTerm, statusFilter, val, endDate);
    };

    const handleEndDateChange = (val: string) => {
        setEndDate(val);
        runFilters(searchTerm, statusFilter, startDate, val);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setStartDate('');
        setEndDate('');
        router.get('/sales', {}, { replace: true });
    };

    function handlePrintReceipt(sale: Sale) {
        window.open(`/pos/receipt/${sale.id}`, '_blank');
    }

    function handleRefund(sale: Sale) {
        setRefundingSale(sale);
    }

    function handleViewDetails(sale: Sale) {
        setDetailingSale(sale);
        setShowDetails(true);
    }

    function confirmRefund() {
        if (!refundingSale) {
            return;
        }

        router.patch(
            cancel({ sale: refundingSale.id }).url,
            {},
            {
                onStart: () => setIsRefunding(true),
                onFinish: () => setIsRefunding(false),
                onSuccess: () => {
                    toast.success(
                        t('sales.refunded_success', {
                            defaultValue: `Sale #${refundingSale.id} refunded successfully!`,
                            id: refundingSale.id,
                        })
                    );
                    setRefundingSale(null);
                },
                onError: () => {
                    toast.error(t('sales.refund_failed', 'Failed to refund sale.'));
                },
            }
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(navigator.language || 'pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(amount);
    };

    const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || startDate !== '' || endDate !== '';

    return (
        <>
            <Head title={t('sales.title', 'Sales History')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                            {t('sales.title', 'Sales History')}
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {t(
                                'sales.subtitle',
                                'View and manage all past sales, reprint receipts, or perform refunds.'
                            )}
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {/* Revenue Card */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-neutral-500 uppercase dark:text-neutral-400">
                                {t('sales.summary_revenue', 'Total Revenue')}
                            </span>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono">
                                {formatCurrency(summary.total_revenue)}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-lg">
                            <TrendingUp className="size-6" />
                        </div>
                    </div>

                    {/* Sales Count Card */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-neutral-500 uppercase dark:text-neutral-400">
                                {t('sales.summary_count', 'Total Sales')}
                            </span>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono">
                                {summary.total_sales}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-lg">
                            <ShoppingBag className="size-6" />
                        </div>
                    </div>

                    {/* Discounts Card */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-neutral-500 uppercase dark:text-neutral-400">
                                {t('sales.summary_discount', 'Total Discounts')}
                            </span>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono">
                                {formatCurrency(summary.total_discounts)}
                            </h3>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-lg">
                            <Tag className="size-6" />
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="pointer-events-none absolute left-3 size-4 text-neutral-400 top-1/2 -translate-y-1/2" />
                            <Input
                                placeholder={t(
                                    'sales.search_placeholder',
                                    'Search by sale ID, cashier...'
                                )}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white pl-9 dark:bg-neutral-900/50 h-9"
                            />
                        </div>

                        {/* Status Select Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="size-4 text-neutral-400 shrink-0" />
                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[160px] bg-white dark:bg-neutral-900/50 h-9">
                                    <SelectValue placeholder={t('sales.filter_status', 'Status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('sales.all_statuses', 'All Statuses')}</SelectItem>
                                    <SelectItem value="completed">{t('sales.status_completed', 'Completed')}</SelectItem>
                                    <SelectItem value="cancelled">{t('sales.status_cancelled', 'Cancelled')}</SelectItem>
                                    <SelectItem value="pending">{t('sales.status_pending', 'Pending')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Pickers */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Calendar className="size-4 text-neutral-400 shrink-0" />
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                className="w-[140px] bg-white dark:bg-neutral-900/50 h-9 px-2 text-xs"
                                title={t('sales.filter_start_date', 'Start Date')}
                            />
                            <span className="text-neutral-400 text-xs">-</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => handleEndDateChange(e.target.value)}
                                className="w-[140px] bg-white dark:bg-neutral-900/50 h-9 px-2 text-xs"
                                title={t('sales.filter_end_date', 'End Date')}
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors shrink-0 underline cursor-pointer"
                        >
                            {t('common.clear_all', 'Clear Filters')}
                        </button>
                    )}
                </div>

                {/* Content Table */}
                <div className="flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                    <SaleTable
                        sales={sales.data}
                        searchTerm={searchTerm}
                        onPrintReceipt={handlePrintReceipt}
                        onRefund={handleRefund}
                        onViewDetails={handleViewDetails}
                        isAdmin={isAdmin}
                    />
                </div>

                {/* Pagination */}
                <Pagination links={sales.links} />
            </div>

            {/* Refund Confirmation Dialog */}
            <DeleteConfirmDialog
                open={refundingSale !== null}
                onClose={() => setRefundingSale(null)}
                onConfirm={confirmRefund}
                title={t('sales.refund_confirm_title', 'Refund Sale')}
                description={t('sales.refund_confirm_description', {
                    defaultValue: `Are you sure you want to refund sale #${refundingSale?.id}? Product stock levels will be restored and the sale status will be marked as Cancelled. This action cannot be undone.`,
                    id: refundingSale?.id,
                })}
                loading={isRefunding}
            />

            {/* Detail Dialog */}
            <SaleDetailsDialog
                open={showDetails}
                onClose={() => {
                    setShowDetails(false);
                    setDetailingSale(null);
                }}
                sale={detailingSale}
            />
        </>
    );
}

// Add Breadcrumbs to match default layout requirements
SalesIndex.layout = {
    breadcrumbs: [
        {
            title: 'nav.sales',
            href: '/sales',
        },
    ],
};
