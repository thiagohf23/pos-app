import { Head, router } from '@inertiajs/react';
import { Search, Truck } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { destroy, update } from '@/routes/suppliers';
import type { Paginated, Supplier } from '@/types';
import { SupplierDialog } from './components/supplier-dialog';
import { SupplierTable } from './components/supplier-table';

interface Props {
    suppliers: Paginated<Supplier>;
}

export default function SuppliersIndex({ suppliers }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Supplier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    function handleEdit(supplier: Supplier) {
        setEditing(supplier);
        setShowForm(true);
    }

    function handleDelete(supplier: Supplier) {
        setDeletingSupplier(supplier);
    }

    function handleToggleActive(supplier: Supplier, checked: boolean) {
        router.put(
            update.url(supplier.id),
            {
                name: supplier.name,
                email: supplier.email || '',
                phone: supplier.phone || '',
                cpf_cnpj: supplier.cpf_cnpj || '',
                address: supplier.address || '',
                is_active: checked,
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Supplier "${supplier.name}" status updated!`,
                    );
                },
                onError: (errors) => {
                    toast.error('Failed to update status.');
                },
            },
        );
    }

    function confirmDelete() {
        if (!deletingSupplier) {
            return;
        }

        router.delete(destroy.url(deletingSupplier.id), {
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                router.flushAll();
                toast.success(
                    `Supplier "${deletingSupplier.name}" deleted successfully!`,
                );
                setDeletingSupplier(null);
            },
            onError: () => {
                toast.error('Failed to delete the supplier.');
            },
        });
    }

    const filteredSuppliers = useMemo(() => {
        const query = searchTerm.toLowerCase();

        return suppliers.data.filter(
            (supplier) =>
                supplier.name.toLowerCase().includes(query) ||
                supplier.email?.toLowerCase().includes(query) ||
                supplier.phone?.toLowerCase().includes(query) ||
                supplier.cpf_cnpj?.toLowerCase().includes(query) ||
                supplier.address?.toLowerCase().includes(query),
        );
    }, [suppliers.data, searchTerm]);

    return (
        <>
            <Head title="Suppliers" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Suppliers
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Manage suppliers and their active status.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                        className="w-full cursor-pointer gap-2 bg-neutral-950 shadow-md transition-all duration-200 hover:bg-neutral-800 sm:w-auto dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                        <Truck className="size-4" />
                        Add Supplier
                    </Button>
                </div>

                <div className="relative flex w-full max-w-md items-center gap-2">
                    <Search className="pointer-events-none absolute left-3 size-4 text-neutral-400" />
                    <Input
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white pl-9 dark:bg-neutral-900/50"
                    />
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                    <SupplierTable
                        suppliers={filteredSuppliers}
                        searchTerm={searchTerm}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        onAddClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                    />
                </div>

                <Pagination links={suppliers.links} />
            </div>

            <SupplierDialog
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                }}
                editing={editing}
            />

            <DeleteConfirmDialog
                open={deletingSupplier !== null}
                onClose={() => setDeletingSupplier(null)}
                onConfirm={confirmDelete}
                title="Delete Supplier"
                description={`Are you sure you want to delete "${deletingSupplier?.name}"? This action cannot be undone.`}
                loading={isDeleting}
            />
        </>
    );
}

SuppliersIndex.layout = {
    breadcrumbs: [
        {
            title: 'nav.suppliers',
            href: '/suppliers',
        },
    ],
};
