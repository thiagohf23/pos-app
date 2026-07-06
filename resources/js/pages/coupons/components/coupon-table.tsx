import { Edit, Plus, Ticket, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

export function CouponTable({
    coupons,
    searchTerm,
    onEdit,
    onDelete,
    onAddClick,
}: Props) {
    const { t } = useTranslation();

    function scopeLabel(scope: CouponScope): string {
        if (scope === 'all') {
            return t('coupons.scope_all', 'All products');
        }

        if (scope === 'category') {
            return t('coupons.scope_category', 'Categories');
        }

        return t('coupons.scope_product', 'Products');
    }

    if (coupons.length === 0) {
        return (
            <div className="flex h-96 flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 rounded-full bg-neutral-50 p-4 text-neutral-400 ring-1 ring-neutral-200/50 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800">
                    <Ticket className="size-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {t('common.no_results')}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                    {searchTerm
                        ? t('coupons.no_results_search_hint', 'Try adjusting your search terms or filter criteria.')
                        : t('coupons.no_results_empty_hint', 'Get started by creating your first discount coupon.')}
                </p>
                {!searchTerm && (
                    <Button
                        onClick={onAddClick}
                        variant="outline"
                        className="mt-4 cursor-pointer gap-2"
                    >
                        <Plus className="size-4" />
                        {t('coupons.create')}
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
                        <th className="px-6 py-4">{t('common.code')}</th>
                        <th className="px-6 py-4">{t('coupons.scope', 'Scope')}</th>
                        <th className="px-6 py-4">{t('common.discount')}</th>
                        <th className="px-6 py-4">{t('coupons.validity', 'Validity')}</th>
                        <th className="px-6 py-4 text-center">{t('coupons.usage', 'Usage')}</th>
                        <th className="px-6 py-4 text-center">{t('common.status')}</th>
                        <th className="px-6 py-4 text-right">{t('common.actions')}</th>
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
                                        {t('common.active')}
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                    >
                                        {t('common.inactive')}
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
