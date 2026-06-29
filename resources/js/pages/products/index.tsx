import { Head, router } from "@inertiajs/react";
import { Category, Product, Paginated } from "@/types";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { destroy, update } from "@/routes/products";
import { Pagination } from "@/components/pagination";
import { ProductTable } from "./components/product-table";
import { ProductDialog } from "./components/product-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";

interface Props {
    products: Paginated<Product>;
    categories: Category[];
}

export default function ProductsIndex({ products, categories }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    function handleEdit(product: Product) {
        setEditing(product);
        setShowForm(true);
    }

    function handleDelete(product: Product) {
        setDeletingProduct(product);
    }

    function handleToggleActive(product: Product, checked: boolean) {
        router.put(update.url(product.id), {
            category_id: String(product.category_id),
            name: product.name,
            description: product.description || "",
            price: product.price,
            stock: String(product.stock),
            is_active: checked,
        }, {
            onSuccess: () => {
                toast.success(`Product "${product.name}" status updated!`);
            },
            onError: () => {
                toast.error("Failed to update status.");
            }
        });
    }

    function confirmDelete() {
        if (!deletingProduct) return;
        
        router.delete(destroy.url(deletingProduct.id), {
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                toast.success(`Product "${deletingProduct.name}" deleted successfully!`);
                setDeletingProduct(null);
            },
            onError: () => {
                toast.error("Failed to delete the product.");
            }
        });
    }

    // Filter products on client-side for immediate search responsiveness, combined with backend pagination
    const filteredProducts = useMemo(() => {
        const query = searchTerm.toLowerCase();
        return products.data.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.category?.name.toLowerCase().includes(query)
        );
    }, [products.data, searchTerm]);

    return (
        <>
            <Head title="Products" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">Products</h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Manage your product catalog, stock levels, and pricing.
                        </p>
                    </div>
                    <Button 
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                        className="w-full sm:w-auto bg-neutral-950 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-950 gap-2 cursor-pointer shadow-md transition-all duration-200"
                    >
                        <Plus className="size-4" />
                        Add Product
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 max-w-md w-full relative">
                    <Search className="absolute left-3 size-4 text-neutral-400 pointer-events-none" />
                    <Input 
                        placeholder="Search products or categories..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white dark:bg-neutral-900/50"
                    />
                </div>

                {/* Content Table / Grid */}
                <div className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 overflow-hidden shadow-xs">
                    <ProductTable 
                        products={filteredProducts}
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
                <Pagination links={products.links} />
            </div>

            {/* Create/Edit Product Dialog */}
            <ProductDialog 
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                }}
                editing={editing}
                categories={categories}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog 
                open={deletingProduct !== null}
                onClose={() => setDeletingProduct(null)}
                onConfirm={confirmDelete}
                title="Delete Product"
                description={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
                loading={isDeleting}
            />
        </>
    );
}

// Add Breadcrumbs to match default layout requirements
ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: "Products",
            href: "/products",
        },
    ],
};