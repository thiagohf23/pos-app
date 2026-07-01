import { useForm } from '@inertiajs/react';
import { Loader2, Shield } from 'lucide-react';
import { useState } from 'react';
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
import { store, update } from '@/routes/roles';
import type { Role, Permission } from '@/types';

interface Props {
    open: boolean;
    onClose: () => void;
    editing: Role | null;
    permissions: Permission[];
}

export function RoleDialog({ open, onClose, editing, permissions = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: editing?.name ?? '',
            permissions: editing?.permissions.map((p) => String(p.id)) ?? [],
        });

    function handleClose() {
        onClose();
        reset();
        clearErrors();
        setSearchQuery('');
    }

    function togglePermission(permissionId: string) {
        setData(
            'permissions',
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId],
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editing) {
            post(update.url(editing.id) + '?_method=PUT', {
                onSuccess: () => {
                    toast.success(`Role "${data.name}" updated successfully!`);
                    handleClose();
                },
                onError: () => {
                    toast.error('Failed to update the role. Please check the form.');
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    toast.success(`Role "${data.name}" created successfully!`);
                    handleClose();
                },
                onError: () => {
                    toast.error('Failed to create the role. Please check the form.');
                },
            });
        }
    }

    const filteredPermissions = permissions.filter(
        (p) =>
            !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const allSelected =
        permissions.length > 0 &&
        filteredPermissions.every((p) => data.permissions.includes(String(p.id)));

    function toggleAll() {
        if (allSelected) {
            const filteredIds = filteredPermissions.map((p) => String(p.id));
            setData(
                'permissions',
                data.permissions.filter((id) => !filteredIds.includes(id)),
            );
        } else {
            const current = new Set(data.permissions);
            filteredPermissions.forEach((p) => current.add(String(p.id)));
            setData('permissions', [...current]);
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
                        {editing ? 'Edit Role' : 'Add Role'}
                    </DialogTitle>
                    <DialogDescription>
                        {editing
                            ? 'Update the role name and its assigned permissions.'
                            : 'Create a new role and assign permissions to it.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Role Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. admin, manager, cashier"
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Permissions */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Permissions</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={toggleAll}
                                className="h-7 cursor-pointer text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                            >
                                {allSelected ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>

                        {/* Search */}
                        <Input
                            placeholder="Search permissions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 text-xs"
                        />

                        {/* Permission list */}
                        <div className="max-h-48 overflow-y-auto rounded-md border border-neutral-200 p-2 dark:border-neutral-800">
                            {filteredPermissions.length === 0 ? (
                                <p className="py-4 text-center text-xs text-neutral-400">
                                    {searchQuery
                                        ? 'No permissions match your search.'
                                        : 'No permissions available.'}
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {filteredPermissions.map((permission) => (
                                        <label
                                            key={permission.id}
                                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        >
                                            <Checkbox
                                                checked={data.permissions.includes(
                                                    String(permission.id),
                                                )}
                                                onCheckedChange={() =>
                                                    togglePermission(
                                                        String(permission.id),
                                                    )
                                                }
                                            />
                                            <span className="text-neutral-700 dark:text-neutral-300">
                                                {permission.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        {errors.permissions && (
                            <p className="text-xs text-destructive">
                                {errors.permissions}
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
                            {editing ? 'Save Changes' : 'Create Role'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
