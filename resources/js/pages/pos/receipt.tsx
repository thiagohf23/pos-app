import { Head, router } from '@inertiajs/react';
import { Printer, TriangleAlert, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { cancel } from '@/routes/sales';
import type { Sale } from '@/types';

interface Props {
    sale: Sale & {
        items: Array<{
            product_name: string;
            unit_price: string;
            quantity: number;
            total: string;
        }>;
        user?: {
            name: string;
        };
    };
}

export default function ReceiptPage({ sale }: Props) {
    const { t } = useTranslation();

    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        // Automatically open the print dialog when the page mounts
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const isCancelled = sale.status === 'cancelled';

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleClose = () => {
        window.close();
    };

    function handleCancelSale() {
        router.patch(cancel({ sale: sale.id }).url, {}, {
            onStart: () => setIsCancelling(true),
            onFinish: () => setIsCancelling(false),
            onSuccess: () => {
                toast.success('Sale cancelled and stock returned.');
                setShowCancelDialog(false);
            },
            onError: () => {
                toast.error('Failed to cancel sale.');
            },
        });
    }

    return (
        <>
            <Head title={`Receipt #${sale.id}`} />

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page {
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                }
            `,
                }}
            />

            {/* Top Control Bar (Hidden in physical print) */}
            <div className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-6 print:hidden">
                <span className="text-sm font-semibold text-neutral-300">
                    Receipt Print Preview
                </span>
                <div className="flex gap-2">
                    {!isCancelled && (
                        <Button
                            onClick={() => setShowCancelDialog(true)}
                            variant="outline"
                            className="hover:bg-neutral-750 h-9 gap-1.5 border-red-700 bg-red-800 text-white hover:bg-red-700"
                        >
                            <TriangleAlert className="size-4" />
                            Cancel Sale
                        </Button>
                    )}
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="hover:bg-neutral-750 h-9 gap-1.5 border-neutral-700 bg-neutral-800 text-white"
                    >
                        <Printer className="size-4" />
                        Print Receipt
                    </Button>
                    <Button
                        onClick={handleClose}
                        className="h-9 gap-1.5 bg-red-600 text-white hover:bg-red-500"
                    >
                        <X className="size-4" />
                        Close Preview
                    </Button>
                </div>
            </div>

            <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 pt-24 pb-12 dark:bg-neutral-950 print:m-0 print:block print:bg-white print:p-0 dark:print:bg-white">
                <div className="w-full max-w-[400px] rounded-lg border border-neutral-200 bg-white p-6 text-neutral-800 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-200 print:w-full print:max-w-none print:border-0 print:p-0 print:text-black print:shadow-none dark:print:text-black">
                    {/* Receipt Header */}
                    <div className="mb-4 border-b border-dashed border-neutral-300 pb-4 text-center dark:border-neutral-700 print:border-neutral-400">
                        <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 print:text-black">
                            SALE RECEIPT
                        </h2>
                        <p className="mt-1 font-mono text-xs text-neutral-500 dark:text-neutral-400 print:text-neutral-600">
                            Transaction #{sale.id}
                        </p>
                        <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 print:text-neutral-600">
                            {formatDate(sale.sold_at)}
                        </p>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                        <div className="flex justify-between border-b border-neutral-100 pb-1.5 text-xs font-bold tracking-wider uppercase dark:border-neutral-800 print:border-neutral-200">
                            <span>{t('item_description')}</span>
                            <span>{t('total')}</span>
                        </div>
                        {sale.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex justify-between font-mono text-xs"
                            >
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="truncate font-semibold text-neutral-900 dark:text-neutral-100 print:text-black">
                                        {item.product_name}
                                    </p>
                                    <p className="text-neutral-500 dark:text-neutral-400 print:text-neutral-600">
                                        $
                                        {parseFloat(item.unit_price).toFixed(2)}{' '}
                                        x {item.quantity}
                                    </p>
                                </div>
                                <span className="align-bottom font-bold text-neutral-800 dark:text-neutral-200 print:text-black">
                                    ${parseFloat(item.total).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-4 space-y-1.5 border-t border-dashed border-neutral-300 pt-3 font-mono text-xs dark:border-neutral-700 print:border-neutral-400">
                        <div className="flex justify-between">
                            <span className="text-neutral-500 dark:text-neutral-400 print:text-neutral-600">
                                Subtotal
                            </span>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 print:text-black">
                                ${parseFloat(sale.subtotal).toFixed(2)}
                            </span>
                        </div>
                        {parseFloat(sale.discount as string) > 0 && (
                            <div className="flex justify-between text-emerald-600 print:text-black">
                                <span>
                                    Discount
                                    {sale.coupon_code
                                        ? ` (${sale.coupon_code})`
                                        : ''}
                                </span>
                                <span className="font-semibold">
                                    -$
                                    {parseFloat(
                                        sale.discount as string,
                                    ).toFixed(2)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-dotted border-neutral-200 pt-1.5 text-sm font-bold text-neutral-900 dark:border-neutral-800 dark:text-neutral-100 print:border-neutral-200 print:text-black">
                            <span>{t('total')}</span>
                            <span className="text-emerald-600 print:text-black">
                                ${parseFloat(sale.total).toFixed(2)}
                            </span>
                        </div>

                        {/* Payment details */}
                        <div className="border-t border-dotted border-neutral-200 pt-1.5 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400 print:border-neutral-200 print:text-neutral-600">
                            <div className="flex justify-between">
                                <span>{t('payment_method')}</span>
                                <span className="capitalize">
                                    {sale.payment_method === 'credit_card'
                                        ? 'Credit Card'
                                        : sale.payment_method === 'debit_card'
                                          ? 'Debit Card'
                                          : sale.payment_method === 'pix'
                                            ? 'PIX'
                                            : 'Cash'}
                                </span>
                            </div>
                            {sale.payment_method === 'cash' &&
                                sale.cash_tendered && (
                                    <>
                                        <div className="mt-0.5 flex justify-between">
                                            <span>{t('cash_tendered')}</span>
                                            <span>
                                                $
                                                {parseFloat(
                                                    sale.cash_tendered,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        {parseFloat(sale.change_amount ?? '0') >
                                            0 && (
                                            <div className="mt-0.5 flex justify-between text-emerald-600 print:text-black">
                                                <span>Change</span>
                                                <span>
                                                    $
                                                    {parseFloat(
                                                        sale.change_amount as string,
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                        </div>
                    </div>

                    {/* Sale Notes */}
                    {sale.notes && (
                        <div className="mt-4 border-t border-dashed border-neutral-300 pt-3 text-xs dark:border-neutral-700 print:border-neutral-400">
                            <p className="font-mono text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500 print:text-neutral-600">
                                Notes
                            </p>
                            <p className="mt-1 font-mono whitespace-pre-wrap text-neutral-700 dark:text-neutral-300 print:text-black">
                                {sale.notes}
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 border-t border-dashed border-neutral-300 pt-4 text-center dark:border-neutral-700 print:border-neutral-400">
                        <p className="text-xs font-bold text-neutral-900 dark:text-neutral-50 print:text-black">
                            Thank you for your purchase!
                        </p>
                        <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400 print:text-neutral-600">
                            Status: {isCancelled ? 'CANCELLED' : 'PAID'}
                        </p>
                        {sale.user && (
                            <p className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 print:text-neutral-600">
                                Cashier: {sale.user.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <DeleteConfirmDialog
                open={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
                onConfirm={handleCancelSale}
                title="Cancel Sale"
                description="This will void the sale and return all items to stock. Are you sure?"
                loading={isCancelling}
            />
        </>
    );
}
