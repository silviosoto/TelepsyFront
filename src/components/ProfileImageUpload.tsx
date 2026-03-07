import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { Camera, X, Check, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import getCroppedImg from '@/utils/cropImage';

interface ProfileImageUploadProps {
    initialImage?: string;
    initials?: string;
    onImageUpdate: (base64Image: string) => void;
}

export function ProfileImageUpload({ initialImage, initials, onImageUpdate }: ProfileImageUploadProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
    const [preview, setPreview] = useState<string | null>(initialImage || null);
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || null);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCrop = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            setPreview(croppedImage);
            onImageUpdate(croppedImage);
            setIsCropping(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelCrop = () => {
        setIsCropping(false);
        setImageSrc(preview); // Reset to last saved state
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="relative flex flex-col items-center">
            {/* Avatar Display */}
            <div
                className="group relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg cursor-pointer flex items-center justify-center bg-primary/10 transition-transform hover:scale-105"
                onClick={() => !isCropping && fileInputRef.current?.click()}
            >
                {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-primary">
                        {initials ? (
                            <span className="text-4xl font-bold">{initials}</span>
                        ) : (
                            <User size={48} className="opacity-50" />
                        )}
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white mb-1" size={24} />
                    <span className="text-white text-xs font-medium">Cambiar foto</span>
                </div>
            </div>

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Cropper Modal */}
            {mounted && isCropping && imageSrc && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Ajustar foto de perfil</h3>
                            <button onClick={handleCancelCrop} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden mb-6">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="text-sm text-gray-600 block mb-2">Zoom</label>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div className="flex gap-3 mt-4">
                            <Button onClick={handleCancelCrop} type="button" variant="ghost" className="flex-1">
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveCrop} type="button" disabled={isProcessing} className="flex-1">
                                {isProcessing ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Aplicar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
