import { Head, router } from '@inertiajs/react';
import { FolderPlus, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { destroy, update } from '@/routes/categories';
import type { Category, Paginated } from '@/types';
import { CategoryDialog } from './components/category-dialog';
import { CategoryTable } from './components/category-table';

interface Props {
    categories: Paginated<Category>;
}

export default function CategoriesIndex({ categories }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    function handleEdit(category: Category) {
        setEditing(category);
        setShowForm(true);
    }

    function handleDelete(category: Category) {
        if (category.products_count && category.products_count > 0) {
            toast.error(
                `Cannot delete category "${category.name}" because it is linked to ${category.products_count} product(s).`,
            );

            return;
        }

        setDeletingCategory(category);
    }

    function handleToggleActive(category: Category, checked: boolean) {
        if (
            !checked &&
            category.products_count &&
            category.products_count > 0
        ) {
            toast.error(
                `Cannot deactivate category "${category.name}" because it is linked to ${category.products_count} product(s).`,
            );

            return;
        }

        router.put(
            update.url(category.id),
            {
                name: category.name,
                description: category.description || '',
                is_active: checked,
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Category "${category.name}" status updated!`,
                    );
                },
                onError: (errors) => {
                    if (errors.is_active) {
                        toast.error(errors.is_active);
                    } else {
                        toast.error('Failed to update status.');
                    }
                },
            },
        );
    }

    function confirmDelete() {
        if (!deletingCategory) {
            return;
        }

        router.delete(destroy.url(deletingCategory.id), {
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                // Invalidate prefetched pages (e.g. products) so the removed category disappears without a reload
                router.flushAll();
                toast.success(
                    `Category "${deletingCategory.name}" deleted successfully!`,
                );
                setDeletingCategory(null);
            },
            onError: (errors) => {
                if (errors.delete) {
                    toast.error(errors.delete);
                } else {
                    toast.error('Failed to delete the category.');
                }
            },
        });
    }

    // Filter categories on client-side for immediate search responsiveness, combined with backend pagination
    const filteredCategories = useMemo(() => {
        const query = searchTerm.toLowerCase();

        return categories.data.filter(
            (category) =>
                category.name.toLowerCase().includes(query) ||
                category.description?.toLowerCase().includes(query),
        );
    }, [categories.data, searchTerm]);

    return (
        <>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Categories
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Manage product categories and active status levels.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                        className="w-full cursor-pointer gap-2 bg-neutral-950 shadow-md transition-all duration-200 hover:bg-neutral-800 sm:w-auto dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                        <FolderPlus className="size-4" />
                        Add Category
                    </Button>
                </div>

                {/* Filters */}
                <div className="relative flex w-full max-w-md items-center gap-2">
                    <Search className="pointer-events-none absolute left-3 size-4 text-neutral-400" />
                    <Input
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white pl-9 dark:bg-neutral-900/50"
                    />
                </div>

                {/* Content Table / Grid */}
                <div className="flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                    <CategoryTable
                        categories={filteredCategories}
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

                {/* Pagination */}
                <Pagination links={categories.links} />
            </div>

            {/* Create/Edit Category Dialog */}
            <CategoryDialog
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                }}
                editing={editing}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                open={deletingCategory !== null}
                onClose={() => setDeletingCategory(null)}
                onConfirm={confirmDelete}
                title="Delete Category"
                description={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
                loading={isDeleting}
            />
        </>
    );
}

// Add Breadcrumbs to match default layout requirements
CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'nav.categories',
            href: '/categories',
        },
    ],
};
