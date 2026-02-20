"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40 pointer-events-none [&>svg]:w-5 [&>svg]:h-5">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                            "hover:border-primary/50 focus:border-primary",
                            "backdrop-blur-sm bg-white shadow-sm",
                            icon && "pl-10",
                            error && "border-red-500 focus-visible:ring-red-500",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-xs text-red-500 ml-1 animate-pulse">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
