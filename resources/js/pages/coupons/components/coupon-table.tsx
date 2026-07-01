import { Edit, Plus, Ticket, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Coupon, CouponScope } from '@/types';

interface Props {
    coupons: Coupon[];
    searchTerm: string;
    onEdit: (coupon: Coupon) => void;
    onDelete: (coupon: Coupon) => void;
    onAddClick: () => void;
}

function scopeLabel(scope: CouponScope): string {
    if (scope === 'all') {
        return 'All products';
    }

    if (scope === 'category') {
        return 'Categories';
    }

    return 'Products';
}

export function CouponTable({
    coupons,
    searchTerm,
    onEdit,
    onDelete,
    onAddClick,
}: Props) {
    if (coupons.length === 0) {
        return (
            <div className="flex h-96 flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 rounded-full bg-neutral-50 p-4 text-neutral-400 ring-1 ring-neutral-200/50 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800">
                    <Ticket className="size-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    No coupons found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                    {searchTerm
                        ? 'Try adjusting your search terms or filter criteria.'
                        : 'Get started by creating your first discount coupon.'}
                </p>
                {!searchTerm && (
                    <Button
                        onClick={onAddClick}
                        variant="outline"
                        className="mt-4 cursor-pointer gap-2"
                    >
                        <Plus className="size-4" />
                        Add Coupon
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/50 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Scope</th>
                        <th className="px-6 py-4">Discount</th>
                        <th className="px-6 py-4">Validity</th>
                        <th className="px-6 py-4 text-center">Usage</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {coupons.map((coupon) => (
                        <tr
                            key={coupon.id}
                            className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                        >
                            <td className="px-6 py-4">
                                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                    {coupon.code}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <Badge
                                    variant="secondary"
                                    className="bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                    {scopeLabel(coupon.scope)}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                                {parseFloat(coupon.discount_percent)
                                    .toFixed(2)
                                    .replace(/\.?0+$/, '')}
                                %
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                                {new Date(
                                    coupon.starts_at,
                                ).toLocaleDateString()}{' '}
                                –{' '}
                                {new Date(
                                    coupon.expires_at,
                                ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                {coupon.used_count}
                                {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {coupon.is_active ? (
                                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                    >
                                        Inactive
                                    </Badge>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(coupon)}
                                        className="size-8 cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                                    >
                                        <Edit className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(coupon)}
                                        className="size-8 cursor-pointer text-destructive hover:text-destructive/95 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
