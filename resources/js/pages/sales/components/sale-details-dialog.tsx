import { Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Sale } from '@/types';

interface Props {
    open: boolean;
    onClose: () => void;
    sale: Sale | null;
}

export function SaleDetailsDialog({ open, onClose, sale }: Props) {
    const { t } = useTranslation();

    if (!sale) {
        return null;
    }

    const formatCurrency = (amount: string | number) => {
        const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;

        return new Intl.NumberFormat(navigator.language || 'pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(numeric);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

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

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-6">
                <DialogHeader className="shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        <DialogTitle className="text-xl font-bold">
                            {t('sales.details_title', 'Sale Details')} #{sale.id}
                        </DialogTitle>
                        <div className="mr-6">{getStatusBadge(sale.status)}</div>
                    </div>
                    <DialogDescription className="text-xs text-neutral-500 mt-1">
                        {formatDate(sale.sold_at)}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto my-4 py-2 space-y-4 pr-1">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-neutral-50/50 p-4 text-sm dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
                        <div>
                            <span className="text-xs text-neutral-500 block">
                                {t('sales.cashier', 'Cashier')}
                            </span>
                            <span className="font-semibold">{sale.user?.name || 'System'}</span>
                        </div>
                        <div>
                            <span className="text-xs text-neutral-500 block">
                                {t('sales.payment_method', 'Payment Method')}
                            </span>
                            <span className="font-semibold">
                                {getPaymentMethodLabel(sale.payment_method)}
                            </span>
                        </div>
                        {sale.coupon_code && (
                            <div className="col-span-2">
                                <span className="text-xs text-neutral-500 block">
                                    {t('sales.coupon', 'Coupon')}
                                </span>
                                <span className="font-semibold font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border">
                                    {sale.coupon_code}
                                </span>
                            </div>
                        )}
                        {sale.notes && (
                            <div className="col-span-2">
                                <span className="text-xs text-neutral-500 block">
                                    {t('sales.notes', 'Notes')}
                                </span>
                                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                    {sale.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <div>
                        <h3 className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
                            {t('sales.items', 'Items Sold')}
                        </h3>
                        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                                        <th className="px-3 py-2">{t('sales.product', 'Product')}</th>
                                        <th className="px-3 py-2 text-center">{t('sales.qty', 'Qty')}</th>
                                        <th className="px-3 py-2 text-right">{t('sales.unit_price', 'Unit')}</th>
                                        <th className="px-3 py-2 text-right">{t('sales.total_price', 'Total')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {sale.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2 font-medium">{item.product_name}</td>
                                            <td className="px-3 py-2 text-center font-mono">{item.quantity}</td>
                                            <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.unit_price)}</td>
                                            <td className="px-3 py-2 text-right font-semibold font-mono">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="space-y-1.5 pt-2 text-sm border-t border-dashed dark:border-neutral-800">
                        <div className="flex justify-between text-neutral-500">
                            <span>{t('sales.subtotal', 'Subtotal')}</span>
                            <span className="font-mono">{formatCurrency(sale.subtotal)}</span>
                        </div>
                        {sale.discount && parseFloat(sale.discount) > 0 && (
                            <div className="flex justify-between text-red-600 dark:text-red-400">
                                <span>{t('sales.discount', 'Discount')}</span>
                                <span className="font-mono">-{formatCurrency(sale.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-neutral-100 pt-1 border-t dark:border-neutral-800">
                            <span>{t('sales.total', 'Total')}</span>
                            <span className="font-mono text-lg">{formatCurrency(sale.total)}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="shrink-0 gap-2 border-t pt-4 dark:border-neutral-800">
                    <Button
                        onClick={() => window.open(`/pos/receipt/${sale.id}`, '_blank')}
                        variant="outline"
                        className="flex-1 cursor-pointer font-semibold gap-1.5"
                    >
                        <Printer className="size-4" />
                        {t('sales.print_receipt', 'Print Receipt')}
                    </Button>
                    <Button
                        onClick={onClose}
                        className="flex-1 cursor-pointer bg-neutral-950 font-semibold hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                        {t('common.cancel', 'Close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
