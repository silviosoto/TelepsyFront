"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../lib/utils";
import React from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer relative overflow-hidden";

        const variants = {
            primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90",
            ghost: "bg-transparent text-primary hover:bg-primary/10",
            outline: "border border-primary/20 bg-transparent text-primary hover:bg-primary/5"
        };

        const sizes = {
            sm: "h-9 px-4 text-sm font-semibold",
            md: "h-11 px-6 text-base font-bold",
            lg: "h-14 px-8 text-lg font-extrabold"
        };

        return (
            <motion.button
                ref={ref}
                whileHover={!isLoading && !disabled ? { scale: 1.02 } : {}}
                whileTap={!isLoading && !disabled ? { scale: 0.98 } : {}}
                disabled={isLoading || disabled}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Cargando...</span>
                    </div>
                ) : (
                    children
                )}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
