import { Printer, RotateCcw, ShoppingBag, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Sale } from '@/types';

interface Props {
    sales: Sale[];
    searchTerm: string;
    onPrintReceipt: (sale: Sale) => void;
    onRefund: (sale: Sale) => void;
    onViewDetails: (sale: Sale) => void;
    isAdmin: boolean;
}

export function SaleTable({
    sales,
    searchTerm,
    onPrintReceipt,
    onRefund,
    onViewDetails,
    isAdmin,
}: Props) {
    const { t } = useTranslation();

    if (sales.length === 0) {
        return (
            <div className="flex h-96 flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 rounded-full bg-neutral-50 p-4 text-neutral-400 ring-1 ring-neutral-200/50 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800">
                    <ShoppingBag className="size-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {t('common.no_results')}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                    {searchTerm
                        ? t('common.no_results_search_hint', 'Try adjusting your search terms or filter criteria.')
                        : t('sales.no_sales_hint', 'No sales found in the system.')}
                </p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
                        {t('sales.status_completed', 'Completed')}
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400">
                        {t('sales.status_cancelled', 'Cancelled')}
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                        {t('sales.status_pending', 'Pending')}
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'cash':
                return t('pos.payment_cash', 'Cash');
            case 'credit_card':
                return t('pos.payment_credit', 'Credit Card');
            case 'debit_card':
                return t('pos.payment_debit', 'Debit Card');
            case 'pix':
                return 'PIX';
            default:
                return method;
        }
    };

    const formatCurrency = (amount: string | number) => {
        const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;

        return new Intl.NumberFormat(navigator.language || 'pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(numeric);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/50 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
                        <th className="px-6 py-4">{t('sales.id', 'ID')}</th>
                        <th className="px-6 py-4">{t('sales.date', 'Date')}</th>
                        <th className="px-6 py-4">{t('sales.cashier', 'Cashier')}</th>
                        <th className="px-6 py-4">{t('sales.subtotal', 'Subtotal')}</th>
                        <th className="px-6 py-4">{t('sales.discount', 'Discount')}</th>
                        <th className="px-6 py-4">{t('sales.total', 'Total')}</th>
                        <th className="px-6 py-4">{t('sales.payment_method', 'Payment Method')}</th>
                        <th className="px-6 py-4 text-center">{t('sales.status', 'Status')}</th>
                        <th className="px-6 py-4 text-right">{t('sales.actions', 'Actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {sales.map((sale) => (
                        <tr
                            key={sale.id}
                            className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                        >
                            <td className="px-6 py-4 font-mono text-sm font-semibold">
                                #{sale.id}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                {formatDate(sale.sold_at)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                {sale.user?.name || 'System'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                {formatCurrency(sale.subtotal)}
                            </td>
                            <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400">
                                {sale.discount && parseFloat(sale.discount) > 0 ? `-${formatCurrency(sale.discount)}` : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {formatCurrency(sale.total)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                {getPaymentMethodLabel(sale.payment_method)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {getStatusBadge(sale.status)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        onClick={() => onViewDetails(sale)}
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        title={t('sales.view_details', 'View Details')}
                                    >
                                        <Eye className="size-4" />
                                    </Button>
                                    <Button
                                        onClick={() => onPrintReceipt(sale)}
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        title={t('sales.print_receipt', 'Reprint Receipt')}
                                    >
                                        <Printer className="size-4" />
                                    </Button>
                                    {isAdmin && sale.status !== 'cancelled' && (
                                        <Button
                                            onClick={() => onRefund(sale)}
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                            title={t('sales.refund', 'Refund')}
                                        >
                                            <RotateCcw className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
