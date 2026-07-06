import { Edit, Image as ImageIcon, Package, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Product } from '@/types';

interface Props {
    products: Product[];
    searchTerm: string;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onToggleActive: (product: Product, checked: boolean) => void;
    onAddClick: () => void;
}

export function ProductTable({
    products,
    searchTerm,
    onEdit,
    onDelete,
    onToggleActive,
    onAddClick,
}: Props) {
    if (products.length === 0) {
        return (
            <div className="flex h-96 flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 rounded-full bg-neutral-50 p-4 text-neutral-400 ring-1 ring-neutral-200/50 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800">
                    <Package className="size-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    No products found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                    {searchTerm
                        ? 'Try adjusting your search terms or filter criteria.'
                        : 'Get started by adding your first product to the catalog.'}
                </p>
                {!searchTerm && (
                    <Button
                        onClick={onAddClick}
                        variant="outline"
                        className="mt-4 cursor-pointer gap-2"
                    >
                        <Plus className="size-4" />
                        Add Product
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
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">SKU / Barcode</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4 text-center">Stock</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {products.map((product) => (
                        <tr
                            key={product.id}
                            className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
                                        {product.image ? (
                                            <img
                                                src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`}
                                                alt={product.name}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="size-5 text-neutral-400 dark:text-neutral-600" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold text-neutral-900 dark:text-neutral-100">
                                            {product.name}
                                        </div>
                                        <div className="max-w-xs truncate text-xs text-neutral-500 dark:text-neutral-400">
                                            {product.description ||
                                                'No description'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                        {product.sku || '-'}
                                    </span>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {product.barcode || '-'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col items-start gap-1">
                                    <Badge
                                        variant="secondary"
                                        className="bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                                    >
                                        {product.category?.name || 'Uncategorized'}
                                    </Badge>
                                    {product.supplier && (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] text-neutral-500 dark:text-neutral-400"
                                        >
                                            {product.supplier.name}
                                        </Badge>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                                ${parseFloat(product.price).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span
                                    className={`font-semibold ${product.stock <= 5 ? 'text-amber-600 dark:text-amber-500' : 'text-neutral-700 dark:text-neutral-300'}`}
                                >
                                    {product.stock}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center">
                                    <Switch
                                        checked={product.is_active}
                                        onCheckedChange={(checked) =>
                                            onToggleActive(product, checked)
                                        }
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(product)}
                                        className="size-8 cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                                    >
                                        <Edit className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(product)}
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
