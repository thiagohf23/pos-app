import {
    Check,
    CreditCard,
    Printer,
    Banknote,
    Smartphone,
    Landmark,
    Coins,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { checkout, coupon as couponRoute, receipt } from '@/routes/pos';
import type { CartItem } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cart: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    clearCart: () => void;
}

type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'pix';

const PAYMENT_METHODS: {
    value: PaymentMethod;
    label: string;
    icon: React.ElementType;
}[] = [
        { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
        { value: 'debit_card', label: 'Debit Card', icon: Landmark },
        { value: 'cash', label: 'Cash', icon: Coins },
        { value: 'pix', label: 'PIX', icon: Smartphone },
    ];

export function CheckoutDialog({
    open,
    onOpenChange,
    cart,
    subtotal,
    clearCart,
}: Props) {
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>('credit_card');
    const [amountPaid, setAmountPaid] = useState('');
    const [notes, setNotes] = useState('');
    const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
    const [saleId, setSaleId] = useState<number | null>(null);
    const [checkoutDetails, setCheckoutDetails] = useState({
        subtotal: 0,
        total: 0,
        discount: 0,
        paymentMethod: '' as PaymentMethod | '',
        amountPaid: 0,
        change: 0,
    });

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discount: number;
    } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    // Reset local state on close so the next open starts clean (avoids setState-in-effect)
    function handleOpenChange(next: boolean) {
        if (!next) {
            setPaymentMethod('credit_card');
            setAmountPaid('');
            setNotes('');
            setCouponCode('');
            setAppliedCoupon(null);
            setCouponError(null);
            setCouponLoading(false);
        }

        onOpenChange(next);
    }

    async function applyCoupon() {
        if (!couponCode.trim()) {
            return;
        }

        setCouponLoading(true);
        setCouponError(null);

        try {
            const response = await fetch(couponRoute.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    code: couponCode.trim(),
                    items: cart.map((i) => ({
                        product_id: i.product.id,
                        quantity: i.quantity,
                    })),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setAppliedCoupon({
                    code: data.coupon_code,
                    discount: Number(data.discount),
                });
                toast.success(`Coupon ${data.coupon_code} applied`);
            } else {
                setCouponError(data.message);
                setAppliedCoupon(null);
                toast.error(data.message);
            }
        } catch {
            const message = 'Failed to apply coupon. Please try again.';
            setCouponError(message);
            setAppliedCoupon(null);
            toast.error(message);
        } finally {
            setCouponLoading(false);
        }
    }

    const couponDiscount = appliedCoupon?.discount ?? 0;
    const finalTotal = Math.max(0, subtotal - couponDiscount);

    const parsedAmountPaid = useMemo(() => {
        const parsed = parseFloat(amountPaid);

        return isNaN(parsed) ? 0 : parsed;
    }, [amountPaid]);

    const calculatedChange = useMemo(() => {
        if (paymentMethod !== 'cash' || parsedAmountPaid < finalTotal) {
            return 0;
        }

        return Math.round((parsedAmountPaid - finalTotal) * 100) / 100;
    }, [paymentMethod, parsedAmountPaid, finalTotal]);

    async function handleCheckout() {
        const saleData = {
            items: cart.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
            })),
            subtotal,
            discount: couponDiscount,
            total: finalTotal,
            coupon_code: appliedCoupon?.code ?? null,
            payment_method: paymentMethod,
            cash_tendered: paymentMethod === 'cash' ? parsedAmountPaid : null,
            notes: notes.trim() || null,
        };

        try {
            const response = await fetch(checkout.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                    Accept: 'application/json',
                },
                body: JSON.stringify(saleData),
            });

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(errorData.message || 'Failed to process sale');
            }

            const data = await response.json();
            setSaleId(data.sale.id);
            setCheckoutDetails({
                subtotal,
                total: finalTotal,
                discount: couponDiscount,
                paymentMethod: paymentMethod,
                amountPaid:
                    paymentMethod === 'cash' ? parsedAmountPaid : finalTotal,
                change: calculatedChange,
            });
            handleOpenChange(false);
            setShowCheckoutSuccess(true);
            toast.success('Checkout completed successfully!');
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to process sale';
            toast.error(message);
        }
    }

    function printReceipt() {
        if (saleId) {
            window.open(receipt.url(saleId), '_blank');
        }
    }

    return (
        <>
            {/* Payment Method Dialog */}
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                            Select Payment Method
                        </DialogTitle>
                        <DialogDescription className="text-sm text-neutral-500 dark:text-neutral-400">
                            Choose how the customer will pay. Total:{' '}
                            <strong className="text-neutral-900 dark:text-neutral-200">
                                ${finalTotal.toFixed(2)}
                            </strong>
                        </DialogDescription>
                    </DialogHeader>

                    {/* Coupon Code */}
                    <div className="flex flex-col gap-1.5 pb-2">
                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            Coupon code
                        </label>
                        {appliedCoupon ? (
                            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950/20">
                                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                    {appliedCoupon.code} &mdash; &minus;$
                                    {appliedCoupon.discount.toFixed(2)}
                                </span>
                                <button
                                    onClick={() => {
                                        setAppliedCoupon(null);
                                        setCouponCode('');
                                        setCouponError(null);
                                    }}
                                    className="ml-2 cursor-pointer text-xs font-semibold text-red-500 hover:text-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) =>
                                        setCouponCode(e.target.value)
                                    }
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    onClick={applyCoupon}
                                    disabled={
                                        couponLoading || !couponCode.trim()
                                    }
                                    className="cursor-pointer font-semibold"
                                >
                                    {couponLoading ? 'Applying...' : 'Apply'}
                                </Button>
                            </div>
                        )}
                        {couponError && (
                            <p className="text-xs font-medium text-red-500 dark:text-red-400">
                                {couponError}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-4">
                        {PAYMENT_METHODS.map((method) => {
                            const Icon = method.icon;
                            const isSelected = paymentMethod === method.value;

                            return (
                                <button
                                    key={method.value}
                                    onClick={() =>
                                        setPaymentMethod(method.value)
                                    }
                                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${isSelected
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400 dark:hover:border-neutral-600'
                                        }`}
                                >
                                    <Icon
                                        className={`size-8 ${isSelected ? 'text-emerald-600' : ''}`}
                                    />
                                    <span
                                        className={`text-xs font-semibold ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : ''}`}
                                    >
                                        {method.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Cash payment: amount paid + change */}
                    {paymentMethod === 'cash' && (
                        <div className="space-y-3 pb-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                    Amount Received
                                </label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                                        $
                                    </span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={amountPaid}
                                        onChange={(e) =>
                                            setAmountPaid(e.target.value)
                                        }
                                        className="h-12 bg-white pl-7 text-lg font-bold dark:bg-neutral-900/50"
                                    />
                                </div>
                            </div>

                            {parsedAmountPaid >= finalTotal &&
                                parsedAmountPaid > 0 && (
                                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
                                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                            Change
                                        </span>
                                        <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                                            ${calculatedChange.toFixed(2)}
                                        </span>
                                    </div>
                                )}

                            {parsedAmountPaid > 0 &&
                                parsedAmountPaid < finalTotal && (
                                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                        Amount received is less than the total.
                                        Customer still owes $
                                        {(
                                            finalTotal - parsedAmountPaid
                                        ).toFixed(2)}
                                        .
                                    </p>
                                )}
                        </div>
                    )}

                    {/* Optional sale notes */}
                    <div className="flex flex-col gap-1.5 pb-2">
                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add a note for this sale..."
                            rows={2}
                            className="resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500/40 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-100"
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            className="flex-1 cursor-pointer font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCheckout}
                            disabled={
                                paymentMethod === 'cash'
                                    ? parsedAmountPaid < finalTotal
                                    : false
                            }
                            className="flex-1 cursor-pointer gap-2 bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
                        >
                            <Banknote className="size-4" />
                            Pay ${finalTotal.toFixed(2)}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Checkout Success Modal Dialog */}
            <Dialog
                open={showCheckoutSuccess}
                onOpenChange={setShowCheckoutSuccess}
            >
                <DialogContent className="sm:max-w-[420px]">
                    <div className="flex flex-col items-center py-6 text-center">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-950/10">
                            <Check className="size-8 animate-bounce stroke-[3px]" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                            Transaction Successful
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                            The sale transaction was processed successfully.
                        </DialogDescription>

                        {/* Transaction Receipt Details */}
                        <div className="mt-5 w-full space-y-2.5 rounded-lg border border-neutral-100 bg-neutral-50/50 p-4 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400">
                            <div className="flex justify-between">
                                <span>Status</span>
                                <span className="font-bold text-emerald-600">
                                    PAID
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Payment</span>
                                <span className="font-semibold text-neutral-800 capitalize dark:text-neutral-200">
                                    {checkoutDetails.paymentMethod ===
                                        'credit_card'
                                        ? 'Credit Card'
                                        : checkoutDetails.paymentMethod ===
                                            'debit_card'
                                            ? 'Debit Card'
                                            : checkoutDetails.paymentMethod ===
                                                'pix'
                                                ? 'PIX'
                                                : 'Cash'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                                    ${checkoutDetails.subtotal.toFixed(2)}
                                </span>
                            </div>
                            {checkoutDetails.discount > 0 && (
                                <div className="flex justify-between">
                                    <span>Discount</span>
                                    <span>
                                        -${checkoutDetails.discount.toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Amount Paid</span>
                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                    ${checkoutDetails.amountPaid.toFixed(2)}
                                </span>
                            </div>
                            {checkoutDetails.paymentMethod === 'cash' &&
                                checkoutDetails.change > 0 && (
                                    <div className="flex justify-between font-medium text-emerald-600">
                                        <span>Change</span>
                                        <span>
                                            -$
                                            {checkoutDetails.change.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            <div className="flex justify-between border-t border-neutral-200/50 pt-2.5 text-sm font-bold text-neutral-900 dark:border-neutral-800 dark:text-neutral-100">
                                <span>Total Paid</span>
                                <span className="text-emerald-600">
                                    ${checkoutDetails.total.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            onClick={printReceipt}
                            disabled={!saleId}
                            variant="outline"
                            className="flex-1 cursor-pointer font-semibold"
                        >
                            <Printer className="mr-1 size-4" />
                            Print Receipt
                        </Button>
                        <Button
                            onClick={() => {
                                setShowCheckoutSuccess(false);
                                clearCart();
                                setSaleId(null);
                            }}
                            className="flex-1 cursor-pointer bg-neutral-950 font-semibold hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                        >
                            New Sale
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
