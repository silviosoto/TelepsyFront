"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/Button";
import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: "danger" | "primary" | "warning";
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isLoading = false,
    variant = "primary"
}: ModalProps) {

    // Lock scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const variantStyles = {
        primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-100"
    };

    const iconColors = {
        primary: "text-primary bg-primary/10",
        danger: "text-red-500 bg-red-50",
        warning: "text-amber-500 bg-amber-50"
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-glass-border overflow-hidden"
                    >
                        {/* Decorative background accent */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${variant === 'primary' ? 'bg-primary' : variant === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} />

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${iconColors[variant]}`}>
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-secondary/10 rounded-xl transition-colors text-foreground/40"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                                {title}
                            </h3>
                            <p className="text-foreground/60 leading-relaxed mb-8">
                                {description}
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 h-12 rounded-2xl border-glass-border hover:bg-secondary/5 font-semibold"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 h-12 rounded-2xl font-bold transition-all active:scale-[0.98] ${variantStyles[variant]}`}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        confirmText
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
