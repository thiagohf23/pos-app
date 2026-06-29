import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    loading?: boolean;
}

export function DeleteConfirmDialog({ open, onClose, onConfirm, title, description, loading }: Props) {
    return (
        <Dialog open={open} onOpenChange={(openState) => !openState && onClose()}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        disabled={loading}
                        className="cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                        className="cursor-pointer gap-2"
                    >
                        {loading && <Loader2 className="size-4 animate-spin" />}
                        Confirm Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
