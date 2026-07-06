import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AvatarCropperProps {
    imageFile: File | null;
    open: boolean;
    onClose: () => void;
    onCrop: (croppedFile: File) => void;
    shape?: 'circle' | 'square';
}

export function AvatarCropper({ imageFile, open, onClose, onCrop, shape = 'circle' }: AvatarCropperProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Load image file into a Data URL
    useEffect(() => {
        if (!imageFile) {
            setImageSrc(null);

            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        };
        reader.readAsDataURL(imageFile);
    }, [imageFile]);

    // Handle mouse/touch down
    const handleStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        setDragStart({ x: clientX - position.x, y: clientY - position.y });
    };

    // Handle mouse/touch move
    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging) {
return;
}
        
        // Calculate new position
        const newX = clientX - dragStart.x;
        const newY = clientY - dragStart.y;
        
        setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    const handleSave = () => {
        if (!imageRef.current || !imageSrc) {
return;
}

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Save as 300x300 for high quality
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
return;
}

            // Dimensions of the display cutout container (e.g., 256px)
            const viewSize = 256;
            
            // Calculate scale factor between original image and displayed image
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;
            
            // Displayed dimensions (matching object-fit: contain/cover logic)
            // Let's assume the base scale fits the smaller side of the image to the 256px container
            const baseScale = Math.max(viewSize / imgWidth, viewSize / imgHeight);
            const displayedWidth = imgWidth * baseScale;
            const displayedHeight = imgHeight * baseScale;

            // Apply zoom and offsets
            const finalWidth = displayedWidth * zoom;
            const finalHeight = displayedHeight * zoom;

            // Position of the top-left corner relative to the center of the cutout
            const cx = viewSize / 2;
            const cy = viewSize / 2;

            // Map position to canvas coordinates (cutout is centered in viewSize)
            // Current center of cutout in view coordinates is (cx, cy)
            // Top-left of image in view coordinates is (cx - finalWidth/2 + position.x, cy - finalHeight/2 + position.y)
            const scaleFactor = 300 / viewSize;
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw image on canvas
            ctx.drawImage(
                img,
                (cx - finalWidth / 2 + position.x) * scaleFactor,
                (cy - finalHeight / 2 + position.y) * scaleFactor,
                finalWidth * scaleFactor,
                finalHeight * scaleFactor
            );

            canvas.toBlob((blob) => {
                if (blob) {
                    const croppedFile = new File([blob], imageFile?.name || 'avatar.jpg', {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    onCrop(croppedFile);
                }
            }, 'image/jpeg', 0.9);
        };
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Recortar Foto de Perfil</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-6 gap-6">
                    {/* Cropping Container */}
                    <div
                        ref={containerRef}
                        className="relative w-64 h-64 bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden cursor-move select-none touch-none"
                        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onTouchStart={(e) => {
                            const touch = e.touches[0];
                            handleStart(touch.clientX, touch.clientY);
                        }}
                        onTouchMove={(e) => {
                            const touch = e.touches[0];
                            handleMove(touch.clientX, touch.clientY);
                        }}
                        onTouchEnd={handleEnd}
                    >
                        {imageSrc && (
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="To crop"
                                className="absolute pointer-events-none max-w-none transition-transform duration-75"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                }}
                            />
                        )}

                        {/* Circular/Square Overlay Cutout */}
                        <div className="absolute inset-0 pointer-events-none border-[16px] border-neutral-950/80 flex items-center justify-center">
                            <div className={cn(
                                "w-full h-full border border-neutral-100/30 shadow-[0_0_0_9999px_rgba(10,10,10,0.4)]",
                                shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                            )} />
                        </div>
                    </div>

                    {/* Zoom Slider */}
                    <div className="w-full max-w-xs flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-neutral-500">
                            <span>Zoom</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-850 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-neutral-100"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={handleSave}>
                        Aplicar Recorte
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
