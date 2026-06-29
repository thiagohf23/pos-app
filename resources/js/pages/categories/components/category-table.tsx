 import { Edit, Folder, Plus, Trash2 } from "lucide-react";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Props {
    categories: Category[];
    searchTerm: string;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onToggleActive: (category: Category, checked: boolean) => void;
    onAddClick: () => void;
}

export function CategoryTable({ categories, searchTerm, onEdit, onDelete, onToggleActive, onAddClick }: Props) {
    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-96">
                <div className="p-4 rounded-full bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 mb-4 ring-1 ring-neutral-200/50 dark:ring-neutral-800">
                    <Folder className="size-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No categories found</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                    {searchTerm ? "Try adjusting your search terms or filter criteria." : "Get started by adding your first category."}
                </p>
                {!searchTerm && (
                    <Button 
                        onClick={onAddClick} 
                        variant="outline" 
                        className="mt-4 gap-2 cursor-pointer"
                    >
                        <Plus className="size-4" />
                        Add Category
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4 text-center">Products</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {categories.map((category) => (
                        <tr key={category.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-colors">
                            <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                {category.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400 max-w-xs truncate">
                                {category.description || "No description"}
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                {category.products_count ?? 0}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center">
                                    <Switch 
                                        checked={category.is_active} 
                                        onCheckedChange={(checked) => onToggleActive(category, checked)} 
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => onEdit(category)}
                                        className="size-8 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 cursor-pointer"
                                    >
                                        <Edit className="size-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => onDelete(category)}
                                        className="size-8 text-destructive hover:text-destructive/95 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
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
