import { Head, router } from '@inertiajs/react';
import { Plus, Search, KeyRound } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { destroy } from '@/routes/permissions';
import type { Permission, Paginated } from '@/types';
import { PermissionDialog } from './components/permission-dialog';
import { PermissionTable } from './components/permission-table';

interface Props {
    permissions: Paginated<Permission>;
}

export default function PermissionsIndex({ permissions }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Permission | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingPermission, setDeletingPermission] =
        useState<Permission | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    function handleEdit(permission: Permission) {
        setEditing(permission);
        setShowForm(true);
    }

    function handleDelete(permission: Permission) {
        setDeletingPermission(permission);
    }

    function confirmDelete() {
        if (!deletingPermission) {
            return;
        }

        router.delete(destroy.url(deletingPermission.id), {
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                toast.success(
                    `Permission "${deletingPermission.name}" deleted successfully!`,
                );
                setDeletingPermission(null);
            },
            onError: () => {
                toast.error('Failed to delete the permission.');
            },
        });
    }

    const filteredPermissions = useMemo(() => {
        const query = searchTerm.toLowerCase();

        return permissions.data.filter(
            (permission) =>
                permission.name.toLowerCase().includes(query) ||
                permission.guard_name.toLowerCase().includes(query),
        );
    }, [permissions.data, searchTerm]);

    return (
        <>
            <Head title="Permissions" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Permissions
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Define granular access permissions for the system.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                        className="w-full cursor-pointer gap-2 bg-neutral-950 shadow-md transition-all duration-200 hover:bg-neutral-800 sm:w-auto dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                        <Plus className="size-4" />
                        Add Permission
                    </Button>
                </div>

                <div className="relative flex w-full max-w-md items-center gap-2">
                    <Search className="pointer-events-none absolute left-3 size-4 text-neutral-400" />
                    <Input
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white pl-9 dark:bg-neutral-900/50"
                    />
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                    <PermissionTable
                        permissions={filteredPermissions}
                        searchTerm={searchTerm}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                    />
                </div>

                <Pagination links={permissions.links} />
            </div>

            <PermissionDialog
                key={`${editing?.id ?? 'new'}-${showForm}`}
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                }}
                editing={editing}
            />

            <DeleteConfirmDialog
                open={deletingPermission !== null}
                onClose={() => setDeletingPermission(null)}
                onConfirm={confirmDelete}
                title="Delete Permission"
                description={`Are you sure you want to delete "${deletingPermission?.name}"? This action cannot be undone.`}
                loading={isDeleting}
            />
        </>
    );
}

PermissionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'nav.permissions',
            href: '/permissions',
        },
    ],
};
