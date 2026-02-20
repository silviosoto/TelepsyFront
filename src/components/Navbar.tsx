"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "./Button";
import { Logo } from "./Logo";
import { cn } from "../lib/utils";

const navLinks = [
    { name: "Especialistas", href: "/psychologists" },
    { name: "Cómo funciona", href: "/#how-it-works" },
    { name: "Testimonios", href: "/#testimonials" },
];

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
                    isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-glass-border" : "bg-transparent"
                )}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Logo />

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                                Iniciar Sesión
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Empezar Ahora</Button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="fixed top-[72px] left-0 right-0 z-40 bg-white border-b border-glass-border md:hidden overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium text-foreground/80 hover:text-primary py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-glass-border my-2" />
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-primary py-2">
                                Iniciar Sesión
                            </Link>
                            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full">Empezar Ahora</Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
