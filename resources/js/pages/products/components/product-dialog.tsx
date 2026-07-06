import { useForm } from '@inertiajs/react';
import { Image as ImageIcon, Loader2, Crop } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store, update } from '@/routes/products';
import type { Category, Product, Supplier } from '@/types';
import { AvatarCropper } from '@/pages/settings/components/avatar-cropper';

interface Props {
    open: boolean;
    onClose: () => void;
    editing: Product | null;
    categories: Category[];
    suppliers: Supplier[];
}

export function ProductDialog({ open, onClose, editing, categories, suppliers }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    // State is initialized from `editing` at mount; the parent remounts this dialog
    // via a `key` whenever it opens, so we never sync props to state inside an effect.
    const [imagePreview, setImagePreview] = useState<string | null>(
        editing?.image ? (editing.image.startsWith('http') ? editing.image : `/storage/${editing.image}`) : null,
    );
    const [categorySearchQuery, setCategorySearchQuery] = useState('');
    const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            category_id: editing ? String(editing.category_id) : '',
            supplier_id: editing?.supplier_id ? String(editing.supplier_id) : '',
            name: editing?.name ?? '',
            sku: editing?.sku ?? '',
            barcode: editing?.barcode ?? '',
            description: editing?.description ?? '',
            price: editing?.price ?? '',
            stock: editing ? String(editing.stock) : '0',
            image: null as File | null,
            is_active: editing?.is_active ?? true,
        });

    const filteredCategories = useMemo(() => {
        const query = categorySearchQuery.toLowerCase().trim();

        if (!query) {
            return categories;
        }

        return categories.filter((category) =>
            category.name.toLowerCase().includes(query),
        );
    }, [categories, categorySearchQuery]);

    const filteredSuppliers = useMemo(() => {
        const query = supplierSearchQuery.toLowerCase().trim();

        if (!query) {
            return suppliers;
        }

        return suppliers.filter((supplier) =>
            supplier.name.toLowerCase().includes(query),
        );
    }, [suppliers, supplierSearchQuery]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (file) {
            setSelectedFile(file);
            setIsCropperOpen(true);
        }
    }

    function handleCropComplete(croppedFile: File) {
        setData('image', croppedFile);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(croppedFile);

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(croppedFile);

        if (fileInputRef.current) {
            fileInputRef.current.files = dataTransfer.files;
        }

        setIsCropperOpen(false);
    }

    async function handleEditCurrentImage() {
        if (!imagePreview) {
return;
}

        try {
            const response = await fetch(imagePreview);
            const blob = await response.blob();
            const file = new File([blob], 'product.jpg', { type: blob.type || 'image/jpeg' });
            setSelectedFile(file);
            setIsCropperOpen(true);
        } catch (error) {
            console.error('Failed to load product image for editing', error);
        }
    }

    function handleClose() {
        onClose();
        reset();
        clearErrors();
        setImagePreview(null);
        setCategorySearchQuery('');
        setSupplierSearchQuery('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editing) {
            // Laravel requires POST with ?_method=PUT to handle file uploads in updates
            post(update.url(editing.id) + '?_method=PUT', {
                onSuccess: () => {
                    toast.success(
                        `Product "${data.name}" updated successfully!`,
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        'Failed to update the product. Please check the form.',
                    );
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    toast.success(
                        `Product "${data.name}" created successfully!`,
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        'Failed to create the product. Please check the form.',
                    );
                },
            });
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(openState) => !openState && handleClose()}
        >
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>
                        {editing ? 'Edit Product' : 'Add Product'}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the details below to{' '}
                        {editing
                            ? 'update the product'
                            : 'add a new product to your inventory'}
                        .
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Premium Wireless Mouse"
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* SKU & Barcode Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                placeholder="e.g. MS-PRO-01"
                            />
                            {errors.sku && (
                                <p className="text-xs text-destructive">
                                    {errors.sku}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="barcode">Barcode</Label>
                            <Input
                                id="barcode"
                                value={data.barcode}
                                onChange={(e) => setData('barcode', e.target.value)}
                                placeholder="Scan or type barcode"
                            />
                            {errors.barcode && (
                                <p className="text-xs text-destructive">
                                    {errors.barcode}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Category & Supplier Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(val) =>
                                    setData('category_id', val)
                                }
                                required
                            >
                                <SelectTrigger id="category" className="w-full">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="border-b border-neutral-100 p-2 dark:border-neutral-800">
                                        <Input
                                            placeholder="Search category..."
                                            value={categorySearchQuery}
                                            onChange={(e) =>
                                                setCategorySearchQuery(
                                                    e.target.value,
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            className="h-8 bg-neutral-50 text-xs dark:bg-neutral-900"
                                        />
                                    </div>
                                    {filteredCategories.length === 0 ? (
                                        <div className="p-2 text-center text-xs text-neutral-400">
                                            No categories found
                                        </div>
                                    ) : (
                                        filteredCategories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.category_id && (
                                <p className="text-xs text-destructive">
                                    {errors.category_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Select
                                value={data.supplier_id}
                                onValueChange={(val) =>
                                    setData('supplier_id', val)
                                }
                            >
                                <SelectTrigger id="supplier" className="w-full">
                                    <SelectValue placeholder="Select supplier..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="border-b border-neutral-100 p-2 dark:border-neutral-800">
                                        <Input
                                            placeholder="Search supplier..."
                                            value={supplierSearchQuery}
                                            onChange={(e) =>
                                                setSupplierSearchQuery(
                                                    e.target.value,
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            className="h-8 bg-neutral-50 text-xs dark:bg-neutral-900"
                                        />
                                    </div>
                                    <SelectItem value="">No Supplier</SelectItem>
                                    {filteredSuppliers.length === 0 ? (
                                        <div className="p-2 text-center text-xs text-neutral-400">
                                            No suppliers found
                                        </div>
                                    ) : (
                                        filteredSuppliers.map((supplier) => (
                                            <SelectItem
                                                key={supplier.id}
                                                value={String(supplier.id)}
                                            >
                                                {supplier.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.supplier_id && (
                                <p className="text-xs text-destructive">
                                    {errors.supplier_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Price & Stock Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="price">Price ($) *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
                                placeholder="29.99"
                                required
                            />
                            {errors.price && (
                                <p className="text-xs text-destructive">
                                    {errors.price}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="stock">Stock Quantity *</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={data.stock}
                                onChange={(e) =>
                                    setData('stock', e.target.value)
                                }
                                placeholder="100"
                                required
                            />
                            {errors.stock && (
                                <p className="text-xs text-destructive">
                                    {errors.stock}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Active */}
                    <div className="grid grid-cols-1 items-center gap-4">
                        <div className="mt-2 flex items-center gap-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', !!checked)
                                }
                            />
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer text-sm font-medium select-none"
                            >
                                Active on store
                            </Label>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Product Image</Label>
                        <div className="flex items-center gap-4">
                            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="size-6 text-neutral-400" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="text-xs file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-neutral-100 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-neutral-700 dark:file:bg-neutral-800 dark:file:text-neutral-300"
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                        Max size 25MB (JPG, PNG, WEBP)
                                    </p>
                                    {imagePreview && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleEditCurrentImage}
                                            className="h-7 px-2 flex items-center gap-1 text-[10px]"
                                        >
                                            <Crop className="size-3" />
                                            Crop Image
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {errors.image && (
                            <p className="text-xs text-destructive">
                                {errors.image}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Describe the key features, size, materials, etc..."
                            className="max-h-[160px] min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">
                                {errors.description}
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
                            {editing ? 'Save Changes' : 'Create Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            <AvatarCropper
                imageFile={selectedFile}
                open={isCropperOpen}
                onClose={() => setIsCropperOpen(false)}
                onCrop={handleCropComplete}
                shape="square"
            />
        </Dialog>
    );
}
