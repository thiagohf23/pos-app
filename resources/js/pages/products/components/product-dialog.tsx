import { useEffect, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { Category, Product } from "@/types";
import { store, update } from "@/routes/products";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
    open: boolean;
    onClose: () => void;
    editing: Product | null;
    categories: Category[];
}

export function ProductDialog({ open, onClose, editing, categories }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        category_id: "",
        name: "",
        description: "",
        price: "",
        stock: "0",
        image: null as File | null,
        is_active: true,
    });

    useEffect(() => {
        if (open) {
            if (editing) {
                setData({
                    category_id: String(editing.category_id),
                    name: editing.name,
                    description: editing.description || "",
                    price: editing.price,
                    stock: String(editing.stock),
                    image: null,
                    is_active: editing.is_active,
                });
                if (editing.image) {
                    setImagePreview(`/storage/${editing.image}`);
                } else {
                    setImagePreview(null);
                }
            } else {
                reset();
                clearErrors();
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    }, [open, editing]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData("image", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleClose() {
        onClose();
        reset();
        clearErrors();
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editing) {
            // Laravel requires POST with ?_method=PUT to handle file uploads in updates
            post(update.url(editing.id) + "?_method=PUT", {
                onSuccess: () => {
                    toast.success(`Product "${data.name}" updated successfully!`);
                    handleClose();
                },
                onError: () => {
                    toast.error("Failed to update the product. Please check the form.");
                }
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    toast.success(`Product "${data.name}" created successfully!`);
                    handleClose();
                },
                onError: () => {
                    toast.error("Failed to create the product. Please check the form.");
                }
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={(openState) => !openState && handleClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to {editing ? "update the product" : "add a new product to your inventory"}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input 
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g. Premium Wireless Mouse"
                            required
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    {/* Category & Price Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="category">Category *</Label>
                            <Select 
                                value={data.category_id} 
                                onValueChange={(val) => setData("category_id", val)}
                                required
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="price">Price ($) *</Label>
                            <Input 
                                id="price"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.price}
                                onChange={(e) => setData("price", e.target.value)}
                                placeholder="29.99"
                                required
                            />
                            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                        </div>
                    </div>

                    {/* Stock & Active Grid */}
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="space-y-1.5">
                            <Label htmlFor="stock">Stock Quantity *</Label>
                            <Input 
                                id="stock"
                                type="number"
                                min="0"
                                value={data.stock}
                                onChange={(e) => setData("stock", e.target.value)}
                                placeholder="100"
                                required
                            />
                            {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
                        </div>

                        <div className="flex items-center gap-2 mt-5">
                            <Checkbox 
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData("is_active", !!checked)}
                            />
                            <Label 
                                htmlFor="is_active"
                                className="cursor-pointer select-none text-sm font-medium"
                            >
                                Active on store
                            </Label>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Product Image</Label>
                        <div className="flex items-center gap-4">
                            <div className="size-20 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-hidden flex items-center justify-center shrink-0">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="size-full object-cover" />
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
                                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-700 dark:file:text-neutral-300 file:cursor-pointer"
                                />
                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Max size 2MB (JPG, PNG, WEBP)</p>
                            </div>
                        </div>
                        {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <textarea 
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Describe the key features, size, materials, etc..."
                            className="w-full min-h-[80px] max-h-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
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
                            className="bg-neutral-950 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-950 cursor-pointer gap-2"
                        >
                            {processing && <Loader2 className="size-4 animate-spin" />}
                            {editing ? "Save Changes" : "Create Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
