"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../lib/utils";
import React from "react";

interface CardProps extends HTMLMotionProps<"div"> {
    hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverEffect = true, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                whileHover={hoverEffect ? { y: -5, scale: 1.02, boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.1)" } : undefined}
                transition={{ duration: 0.3 }}
                className={cn("premium-card p-6", className)}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = "Card";
