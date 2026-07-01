import { Edit, Plus, Trash2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Supplier } from '@/types';

interface Props {
    suppliers: Supplier[];
    searchTerm: string;
    onEdit: (supplier: Supplier) => void;
    onDelete: (supplier: Supplier) => void;
    onToggleActive: (supplier: Supplier, checked: boolean) => void;
    onAddClick: () => void;
}

export function SupplierTable({
    suppliers,
    searchTerm,
    onEdit,
    onDelete,
    onToggleActive,
    onAddClick,
}: Props) {
    if (suppliers.length === 0) {
        return (
            <div className="flex h-96 flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 rounded-full bg-neutral-50 p-4 text-neutral-400 ring-1 ring-neutral-200/50 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800">
                    <Truck className="size-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    No suppliers found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                    {searchTerm
                        ? 'Try adjusting your search terms or filter criteria.'
                        : 'Get started by adding your first supplier.'}
                </p>
                {!searchTerm && (
                    <Button
                        onClick={onAddClick}
                        variant="outline"
                        className="mt-4 cursor-pointer gap-2"
                    >
                        <Plus className="size-4" />
                        Add Supplier
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
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">CPF/CNPJ</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {suppliers.map((supplier) => (
                        <tr
                            key={supplier.id}
                            className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                        >
                            <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                {supplier.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                                {supplier.email || '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                                {supplier.phone || '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                                {supplier.cpf_cnpj || '—'}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center">
                                    <Switch
                                        checked={supplier.is_active}
                                        onCheckedChange={(checked) =>
                                            onToggleActive(supplier, checked)
                                        }
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(supplier)}
                                        className="size-8 cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                                    >
                                        <Edit className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(supplier)}
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
