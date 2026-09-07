import { router, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
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
import { store, update } from '@/routes/categories';
import type { Category } from '@/types';

interface Props {
    open: boolean;
    onClose: () => void;
    editing: Category | null;
}

export function CategoryDialog({ open, onClose, editing }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            description: '',
            is_active: true,
        });

    useEffect(() => {
        if (open) {
            if (editing) {
                setData({
                    name: editing.name,
                    description: editing.description || '',
                    is_active: editing.is_active,
                });
            } else {
                reset();
                clearErrors();
            }
        }
    }, [open, editing, clearErrors, reset, setData]);

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
                    // Invalidate prefetched pages (e.g. products) so updated categories show without a reload
                    router.flushAll();
                    toast.success(
                        t('categories.updated_success_alert', { defaultValue: `Category "${data.name}" updated successfully!`, name: data.name })
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        t('categories.update_failed_form_alert', 'Failed to update the category. Please check the form.')
                    );
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    // Invalidate prefetched pages (e.g. products) so the new category shows without a reload
                    router.flushAll();
                    toast.success(
                        t('categories.created_success_alert', { defaultValue: `Category "${data.name}" created successfully!`, name: data.name })
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        t('categories.create_failed_form_alert', 'Failed to create the category. Please check the form.')
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
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>
                        {editing ? t('categories.edit') : t('categories.create')}
                    </DialogTitle>
                    <DialogDescription>
                        {editing
                            ? t('categories.edit_description', 'Fill in the details below to update the category.')
                            : t('categories.create_description', 'Fill in the details below to add a new category for products.')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">{t('categories.category_name_label', 'Category Name *')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('categories.category_name_placeholder', 'e.g. Electronics, Books')}
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
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

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description">{t('products.description', 'Description')}</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder={t('categories.description_placeholder', 'Describe the category...')}
                            className="max-h-[160px] min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">
                                {errors.description}
                            </p>
                        )}
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
                            {editing ? t('common.save_changes') : t('categories.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
