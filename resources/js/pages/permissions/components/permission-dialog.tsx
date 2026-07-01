import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/permissions';
import type { Permission } from '@/types';

interface Props {
    open: boolean;
    onClose: () => void;
    editing: Permission | null;
}

export function PermissionDialog({ open, onClose, editing }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: editing?.name ?? '',
        });

    function handleClose() {
        onClose();
        reset();
        clearErrors();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editing) {
            post(update.url(editing.id) + '?_method=PUT', {
                onSuccess: () => {
                    toast.success(
                        `Permission "${data.name}" updated successfully!`,
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        'Failed to update the permission. Please check the form.',
                    );
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    toast.success(
                        `Permission "${data.name}" created successfully!`,
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        'Failed to create the permission. Please check the form.',
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
                        {editing ? 'Edit Permission' : 'Add Permission'}
                    </DialogTitle>
                    <DialogDescription>
                        {editing
                            ? 'Update the permission name.'
                            : 'Create a new permission for the system.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Permission Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. manage-users, view-reports"
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
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
                            {editing ? 'Save Changes' : 'Create Permission'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
