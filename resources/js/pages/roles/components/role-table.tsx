import { Edit, Plus, Shield, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Role } from '@/types';

interface Props {
    roles: Role[];
    searchTerm: string;
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
    onAddClick: () => void;
}

export function RoleTable({
    roles,
    searchTerm,
    onEdit,
    onDelete,
    onAddClick,
}: Props) {
    if (roles.length === 0) {
        return (
            <div className="flex h-96 flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 rounded-full bg-neutral-50 p-4 text-neutral-400 ring-1 ring-neutral-200/50 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800">
                    <Shield className="size-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    No roles found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                    {searchTerm
                        ? 'Try adjusting your search terms or filter criteria.'
                        : 'Get started by creating your first role.'}
                </p>
                {!searchTerm && (
                    <Button
                        onClick={onAddClick}
                        variant="outline"
                        className="mt-4 cursor-pointer gap-2"
                    >
                        <Plus className="size-4" />
                        Add Role
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
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Guard</th>
                        <th className="px-6 py-4">Permissions</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {roles.map((role) => (
                        <tr
                            key={role.id}
                            className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
                                        <Shield className="size-4 text-neutral-500 dark:text-neutral-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold text-neutral-900 dark:text-neutral-100">
                                            {role.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <Badge
                                    variant="secondary"
                                    className="bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                    {role.guard_name}
                                </Badge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions.length > 0 ? (
                                        role.permissions.slice(0, 3).map((perm) => (
                                            <Badge
                                                key={perm.id}
                                                variant="outline"
                                                className="border-neutral-200 text-xs dark:border-neutral-700"
                                            >
                                                {perm.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-neutral-400">
                                            No permissions
                                        </span>
                                    )}
                                    {role.permissions.length > 3 && (
                                        <Badge
                                            variant="outline"
                                            className="border-neutral-200 text-xs dark:border-neutral-700"
                                        >
                                            +{role.permissions.length - 3} more
                                        </Badge>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(role)}
                                        className="size-8 cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                                    >
                                        <Edit className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(role)}
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
