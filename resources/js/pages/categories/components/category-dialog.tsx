import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Category } from "@/types";
import { store, update } from "@/routes/categories";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
    open: boolean;
    onClose: () => void;
    editing: Category | null;
}

export function CategoryDialog({ open, onClose, editing }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: "",
        description: "",
        is_active: true,
    });

    useEffect(() => {
        if (open) {
            if (editing) {
                setData({
                    name: editing.name,
                    description: editing.description || "",
                    is_active: editing.is_active,
                });
            } else {
                reset();
                clearErrors();
            }
        }
    }, [open, editing]);

    function handleClose() {
        onClose();
        reset();
        clearErrors();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editing) {
            put(update.url(editing.id), {
                onSuccess: () => {
                    toast.success(`Category "${data.name}" updated successfully!`);
                    handleClose();
                },
                onError: () => {
                    toast.error("Failed to update the category. Please check the form.");
                }
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    toast.success(`Category "${data.name}" created successfully!`);
                    handleClose();
                },
                onError: () => {
                    toast.error("Failed to create the category. Please check the form.");
                }
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={(openState) => !openState && handleClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to {editing ? "update the category" : "add a new category for products"}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Category Name *</Label>
                        <Input 
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g. Electronics, Books"
                            required
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    {/* Active Checkbox */}
                    <div className="flex items-center gap-2">
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

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <textarea 
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Describe the category..."
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
                            {editing ? "Save Changes" : "Create Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
