import { router, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
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
import { store, update } from '@/routes/suppliers';
import type { Supplier } from '@/types';

interface Props {
    open: boolean;
    onClose: () => void;
    editing: Supplier | null;
}

export function SupplierDialog({ open, onClose, editing }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            email: '',
            phone: '',
            cpf_cnpj: '',
            address: '',
            is_active: true,
        });

    useEffect(() => {
        if (open) {
            if (editing) {
                setData({
                    name: editing.name,
                    email: editing.email || '',
                    phone: editing.phone || '',
                    cpf_cnpj: editing.cpf_cnpj || '',
                    address: editing.address || '',
                    is_active: editing.is_active,
                });
            } else {
                reset();
                clearErrors();
            }
        }
    }, [open, editing]);

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
                        `Supplier "${data.name}" updated successfully!`,
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        'Failed to update the supplier. Please check the form.',
                    );
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    router.flushAll();
                    toast.success(
                        `Supplier "${data.name}" created successfully!`,
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        'Failed to create the supplier. Please check the form.',
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
                        {editing ? 'Edit Supplier' : 'Add Supplier'}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the details below to{' '}
                        {editing
                            ? 'update the supplier'
                            : 'add a new supplier'}
                        .
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Supplier Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Acme Corp"
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="contato@acme.com"
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                placeholder="(11) 99999-9999"
                            />
                            {errors.phone && (
                                <p className="text-xs text-destructive">
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                        <Input
                            id="cpf_cnpj"
                            value={data.cpf_cnpj}
                            onChange={(e) =>
                                setData('cpf_cnpj', e.target.value)
                            }
                            placeholder="00.000.000/0001-00"
                        />
                        {errors.cpf_cnpj && (
                            <p className="text-xs text-destructive">
                                {errors.cpf_cnpj}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="address">Address</Label>
                        <textarea
                            id="address"
                            value={data.address}
                            onChange={(e) =>
                                setData('address', e.target.value)
                            }
                            placeholder="Full address..."
                            className="max-h-[120px] min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.address && (
                            <p className="text-xs text-destructive">
                                {errors.address}
                            </p>
                        )}
                    </div>

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
                            Active
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
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="cursor-pointer gap-2 bg-neutral-950 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                        >
                            {processing && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {editing ? 'Save Changes' : 'Create Supplier'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
