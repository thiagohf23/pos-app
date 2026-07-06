import { router, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { store, update } from '@/routes/coupons';
import type { Coupon, CouponScope } from '@/types';

interface Props {
    open: boolean;
    onClose: () => void;
    editing: Coupon | null;
    categories: { id: number; name: string }[];
    products: { id: number; name: string }[];
}

export function CouponDialog({
    open,
    onClose,
    editing,
    categories,
    products,
}: Props) {
    const { t } = useTranslation();
    // State is initialized from `editing` at mount; the parent remounts this dialog
    // via a `key` whenever it opens, so we never sync props to state inside an effect.
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            code: editing?.code ?? '',
            description: editing?.description ?? '',
            discount_percent: editing?.discount_percent ?? '',
            scope: editing?.scope ?? ('all' as CouponScope),
            max_uses: editing?.max_uses != null ? String(editing.max_uses) : '',
            starts_at: editing?.starts_at ? editing.starts_at.slice(0, 16) : '',
            expires_at: editing?.expires_at
                ? editing.expires_at.slice(0, 16)
                : '',
            is_active: editing?.is_active ?? true,
            category_ids: editing?.categories?.map((c) => c.id) ?? [],
            product_ids: editing?.products?.map((p) => p.id) ?? [],
        });

    function handleClose() {
        onClose();
        reset();
        clearErrors();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editing) {
            put(update.url(editing.id), {
                onSuccess: () => {
                    router.flushAll();
                    toast.success(
                        t('coupons.updated_success_alert', { defaultValue: `Coupon "${data.code}" updated successfully!`, code: data.code })
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        t('coupons.update_failed_form_alert', 'Failed to update the coupon. Please check the form.')
                    );
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    router.flushAll();
                    toast.success(
                        t('coupons.created_success_alert', { defaultValue: `Coupon "${data.code}" created successfully!`, code: data.code })
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        t('coupons.create_failed_form_alert', 'Failed to create the coupon. Please check the form.')
                    );
                },
            });
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(openState) => !openState && handleClose()}
        >
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>
                        {editing ? t('coupons.edit') : t('coupons.create')}
                    </DialogTitle>
                    <DialogDescription>
                        {editing
                            ? t('coupons.edit_description', 'Fill in the details below to update the coupon.')
                            : t('coupons.create_description', 'Fill in the details below to create a new discount coupon.')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Code & Discount Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="code">{t('common.code')} *</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                placeholder="e.g. SUMMER20"
                                required
                            />
                            {errors.code && (
                                <p className="text-xs text-destructive">
                                    {errors.code}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="discount_percent">
                                {t('coupons.discount_label', 'Discount (%) *')}
                            </Label>
                            <Input
                                id="discount_percent"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max="100"
                                value={data.discount_percent}
                                onChange={(e) =>
                                    setData('discount_percent', e.target.value)
                                }
                                placeholder="e.g. 20"
                                required
                            />
                            {errors.discount_percent && (
                                <p className="text-xs text-destructive">
                                    {errors.discount_percent}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description">{t('products.description', 'Description')}</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder={t('coupons.description_placeholder', "Describe the coupon's purpose or conditions...")}
                            className="max-h-[160px] min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Scope */}
                    <div className="space-y-1.5">
                        <Label htmlFor="scope">{t('coupons.scope', 'Scope')} *</Label>
                        <Select
                            value={data.scope}
                            onValueChange={(val) =>
                                setData('scope', val as CouponScope)
                            }
                        >
                            <SelectTrigger id="scope" className="w-full">
                                <SelectValue placeholder={t('coupons.select_scope_placeholder', 'Select scope...')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t('coupons.scope_all', 'All products')}
                                </SelectItem>
                                <SelectItem value="category">
                                    {t('coupons.scope_category_specific', 'Specific categories')}
                                </SelectItem>
                                <SelectItem value="product">
                                    {t('coupons.scope_product_specific', 'Specific products')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.scope && (
                            <p className="text-xs text-destructive">
                                {errors.scope}
                            </p>
                        )}
                    </div>

                    {/* Conditional: Category MultiSelect */}
                    {data.scope === 'category' && (
                        <div className="space-y-1.5">
                            <Label>{t('nav.categories', 'Categories')}</Label>
                            <MultiSelect
                                options={categories}
                                selected={data.category_ids}
                                onChange={(ids) => setData('category_ids', ids)}
                                placeholder={t('categories.search_placeholder', 'Search categories...')}
                            />
                            {errors.category_ids && (
                                <p className="text-xs text-destructive">
                                    {errors.category_ids}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Conditional: Product MultiSelect */}
                    {data.scope === 'product' && (
                        <div className="space-y-1.5">
                            <Label>{t('nav.products', 'Products')}</Label>
                            <MultiSelect
                                options={products}
                                selected={data.product_ids}
                                onChange={(ids) => setData('product_ids', ids)}
                                placeholder={t('products.search_placeholder', 'Search products...')}
                            />
                            {errors.product_ids && (
                                <p className="text-xs text-destructive">
                                    {errors.product_ids}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Starts at & Expires at Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="starts_at">{t('coupons.starts_at', 'Starts at *')}</Label>
                            <Input
                                id="starts_at"
                                type="datetime-local"
                                value={data.starts_at}
                                onChange={(e) =>
                                    setData('starts_at', e.target.value)
                                }
                                required
                            />
                            {errors.starts_at && (
                                <p className="text-xs text-destructive">
                                    {errors.starts_at}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="expires_at">{t('coupons.expires_at', 'Expires at *')}</Label>
                            <Input
                                id="expires_at"
                                type="datetime-local"
                                value={data.expires_at}
                                onChange={(e) =>
                                    setData('expires_at', e.target.value)
                                }
                                required
                            />
                            {errors.expires_at && (
                                <p className="text-xs text-destructive">
                                    {errors.expires_at}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Max Uses */}
                    <div className="space-y-1.5">
                        <Label htmlFor="max_uses">{t('coupons.max_uses_label', 'Max Uses')}</Label>
                        <Input
                            id="max_uses"
                            type="number"
                            min="1"
                            value={data.max_uses}
                            onChange={(e) =>
                                setData('max_uses', e.target.value)
                            }
                            placeholder={t('coupons.unlimited', 'Unlimited')}
                        />
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {t('coupons.unlimited_hint', 'Leave empty for unlimited uses.')}
                        </p>
                        {errors.max_uses && (
                            <p className="text-xs text-destructive">
                                {errors.max_uses}
                            </p>
                        )}
                    </div>

                    {/* Active Checkbox */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', !!checked)
                            }
                        />
                        <Label
                            htmlFor="is_active"
                            className="cursor-pointer text-sm font-medium select-none"
                        >
                            {t('products.active_on_store', 'Active on store')}
                        </Label>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                            className="cursor-pointer"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="cursor-pointer gap-2 bg-neutral-950 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                        >
                            {processing && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {editing ? t('common.save_changes') : t('coupons.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
