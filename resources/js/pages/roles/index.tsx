import { Head, router } from '@inertiajs/react';
import { Plus, Search, Shield } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { destroy } from '@/routes/roles';
import type { Role, Paginated, Permission } from '@/types';
import { RoleDialog } from './components/role-dialog';
import { RoleTable } from './components/role-table';

interface Props {
    roles: Paginated<Role>;
    permissions: Permission[];
}

export default function RolesIndex({ roles, permissions = [] }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Role | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    function handleEdit(role: Role) {
        setEditing(role);
        setShowForm(true);
    }

    function handleDelete(role: Role) {
        setDeletingRole(role);
    }

    function confirmDelete() {
        if (!deletingRole) return;

        router.delete(destroy.url(deletingRole.id), {
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                toast.success(`Role "${deletingRole.name}" deleted successfully!`);
                setDeletingRole(null);
            },
            onError: () => {
                toast.error('Failed to delete the role.');
            },
        });
    }

    const filteredRoles = useMemo(() => {
        const query = searchTerm.toLowerCase();

        return roles.data.filter(
            (role) =>
                role.name.toLowerCase().includes(query) ||
                role.permissions.some((p) => p.name.toLowerCase().includes(query)),
        );
    }, [roles.data, searchTerm]);

    return (
        <>
            <Head title="Roles" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Roles
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Manage user roles and their associated permissions.
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
                        Add Role
                    </Button>
                </div>

                <div className="relative flex w-full max-w-md items-center gap-2">
                    <Search className="pointer-events-none absolute left-3 size-4 text-neutral-400" />
                    <Input
                        placeholder="Search roles or permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white pl-9 dark:bg-neutral-900/50"
                    />
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                    <RoleTable
                        roles={filteredRoles}
                        searchTerm={searchTerm}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                    />
                </div>

                <Pagination links={roles.links} />
            </div>

            <RoleDialog
                key={`${editing?.id ?? 'new'}-${showForm}`}
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                }}
                editing={editing}
                permissions={permissions}
            />

            <DeleteConfirmDialog
                open={deletingRole !== null}
                onClose={() => setDeletingRole(null)}
                onConfirm={confirmDelete}
                title="Delete Role"
                description={`Are you sure you want to delete "${deletingRole?.name}"? This action cannot be undone.`}
                loading={isDeleting}
            />
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: '/roles',
        },
    ],
};
