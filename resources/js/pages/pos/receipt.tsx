import { Head } from "@inertiajs/react";
import { Sale } from "@/types";

interface Props {
    sale: Sale & {
        items: Array<{
            product_name: string;
            price: string;
            quantity: number;
            total: string;
        }>;
        user?: {
            name: string;
        };
    };
}

export default function ReceiptPage({ sale }: Props) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <>
            <Head title={`Receipt #${sale.id}`} />
            
            <div className="min-h-screen bg-white dark:bg-neutral-950 p-8 print:p-0">
                <div className="max-w-md mx-auto bg-white dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 print:border-0 print:shadow-none">
                    {/* Receipt Header */}
                    <div className="text-center border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-4 mb-4">
                        <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50">SALE RECEIPT</h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Transaction #{sale.id}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(sale.sold_at)}</p>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                        {sale.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs">
                                <div className="flex-1">
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.product_name}</p>
                                    <p className="text-neutral-500 dark:text-neutral-400">
                                        ${parseFloat(item.price).toFixed(2)} x {item.quantity}
                                    </p>
                                </div>
                                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                    ${parseFloat(item.total).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-dashed border-neutral-300 dark:border-neutral-700 mt-4 pt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                            <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                            <span className="text-neutral-800 dark:text-neutral-200">
                                ${parseFloat(sale.subtotal).toFixed(2)}
                            </span>
                        </div>
                        {parseFloat(sale.discount as string) > 0 && (
                            <div className="flex justify-between">
                                <span className="text-neutral-500 dark:text-neutral-400">Discount</span>
                                <span className="text-emerald-600">
                                    -${parseFloat(sale.discount as string).toFixed(2)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-sm text-neutral-900 dark:text-neutral-100 pt-2">
                            <span>Total</span>
                            <span className="text-emerald-600">${parseFloat(sale.total).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6 pt-4 border-t border-dashed border-neutral-300 dark:border-neutral-700">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">Thank you for your purchase!</p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">Status: PAID</p>
                        {sale.user && (
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
                                Cashier: {sale.user.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}