import { Head, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Pagination } from '@/components/pagination';
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as stockAdjustmentsIndex, store as stockAdjustmentsStore } from '@/routes/stock-adjustments';
import type { Paginated } from '@/types';

interface ProductOption {
    id: number;
    name: string;
    stock: number;
}

interface StockMovement {
    id: number;
    product_id: number;
    quantity_change: number;
    reason: string;
    notes: string | null;
    created_at: string;
    product: { id: number; name: string } | null;
    user: { id: number; name: string } | null;
}

interface Props {
    products: ProductOption[];
    movements: Paginated<StockMovement>;
}

const REASON_LABELS: Record<string, string> = {
    sale: 'Sale',
    sale_cancellation: 'Sale Cancellation',
    manual_adjustment: 'Manual Adjustment',
};

export default function StockAdjustmentsIndex({ products, movements }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        quantity_change: '',
        notes: '',
    });

    const selectedProduct = products.find((p) => String(p.id) === data.product_id);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(stockAdjustmentsStore().url, {
            onSuccess: () => {
                toast.success('Stock adjusted successfully!');
                reset();
                setShowForm(false);
            },
            onError: () => {
                toast.error('Failed to adjust stock. Please check the form.');
            },
        });
    }

    return (
        <>
            <Head title="Stock Adjustments" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Stock Adjustments
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Manually adjust product stock levels and track all inventory movements.
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowForm(true)}
                        id="btn-new-adjustment"
                        className="w-full cursor-pointer gap-2 bg-neutral-950 shadow-md transition-all duration-200 hover:bg-neutral-800 sm:w-auto dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                        <Plus className="size-4" />
                        New Adjustment
                    </Button>
                </div>

                {/* Movements Table */}
                <div className="flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-500 dark:text-neutral-400">
                            <thead className="border-b border-neutral-100 text-xs font-bold tracking-wider text-neutral-400 uppercase dark:border-neutral-800 dark:text-neutral-500">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Reason</th>
                                    <th className="px-4 py-3">By</th>
                                    <th className="px-4 py-3">Notes</th>
                                    <th className="px-4 py-3 text-right">Change</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {movements.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-xs text-neutral-400">
                                            No stock movements recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    movements.data.map((movement) => (
                                        <tr
                                            key={movement.id}
                                            className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10"
                                        >
                                            <td className="px-4 py-3.5 text-xs text-neutral-500">
                                                {new Date(movement.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-neutral-900 dark:text-neutral-100">
                                                {movement.product?.name ?? `#${movement.product_id}`}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${movement.reason === 'sale'
                                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                                                        : movement.reason === 'sale_cancellation'
                                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                                                            : 'bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400'
                                                    }`}>
                                                    {REASON_LABELS[movement.reason] ?? movement.reason}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-neutral-500">
                                                {movement.user?.name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3.5 max-w-xs truncate text-xs text-neutral-500">
                                                {movement.notes ?? '—'}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <span className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${movement.quantity_change > 0
                                                        ? 'text-emerald-600'
                                                        : 'text-red-600'
                                                    }`}>
                                                    {movement.quantity_change > 0 ? (
                                                        <ArrowUp className="size-3" />
                                                    ) : (
                                                        <ArrowDown className="size-3" />
                                                    )}
                                                    {movement.quantity_change > 0 ? '+' : ''}
                                                    {movement.quantity_change}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={movements.links} />
            </div>

            {/* Adjustment Dialog */}
            <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Manual Stock Adjustment</DialogTitle>
                        <DialogDescription>
                            Adjust stock up (positive) or down (negative). All changes are logged.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="adjustment-product">Product *</Label>
                            <Select
                                value={data.product_id}
                                onValueChange={(val) => setData('product_id', val)}
                                required
                            >
                                <SelectTrigger id="adjustment-product" className="w-full">
                                    <SelectValue placeholder="Select a product..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name}
                                            <span className="ml-2 text-neutral-400">
                                                (stock: {p.stock})
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedProduct && (
                                <p className="text-[11px] text-neutral-500">
                                    Current stock: <span className="font-bold">{selectedProduct.stock}</span>
                                    {data.quantity_change && !isNaN(parseInt(data.quantity_change)) && (
                                        <> &rarr; <span className="font-bold">{selectedProduct.stock + parseInt(data.quantity_change)}</span></>
                                    )}
                                </p>
                            )}
                            {errors.product_id && <p className="text-xs text-destructive">{errors.product_id}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="quantity-change">Quantity Change *</Label>
                            <Input
                                id="quantity-change"
                                type="number"
                                value={data.quantity_change}
                                onChange={(e) => setData('quantity_change', e.target.value)}
                                placeholder="e.g. +10 or -3"
                                required
                            />
                            <p className="text-[11px] text-neutral-500">
                                Use positive to add stock, negative to remove stock.
                            </p>
                            {errors.quantity_change && <p className="text-xs text-destructive">{errors.quantity_change}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="adjustment-notes">Notes</Label>
                            <textarea
                                id="adjustment-notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Reason for adjustment (e.g. received shipment, damaged goods)..."
                                className="max-h-[120px] min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden"
                            />
                            {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setShowForm(false); reset(); }}
                                disabled={processing}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="cursor-pointer gap-2 bg-neutral-950 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                            >
                                {processing && <Loader2 className="size-4 animate-spin" />}
                                Save Adjustment
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

StockAdjustmentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Stock Adjustments',
            href: stockAdjustmentsIndex().url,
        },
    ],
};
