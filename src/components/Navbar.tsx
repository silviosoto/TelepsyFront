"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "./Button";
import { Logo } from "./Logo";
import { cn } from "../lib/utils";
import { authService } from "@/services/auth.service";
import { UserAvatar } from "./dashboard/UserAvatar";

const navLinks = [
    { name: "Especialistas", href: "/psychologists" },
    { name: "Cómo funciona", href: "/#how-it-works" },
    { name: "Testimonios", href: "/#testimonials" },
];

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        
        // Initial auth check
        if (typeof window !== "undefined") {
            setIsAuthenticated(authService.isAuthenticated());
            setUserRole(authService.getRole());
        }

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
                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <UserAvatar className="hidden lg:flex" />
                                    <Link href={`/dashboard/${userRole?.toLowerCase() || 'patient'}`}>
                                        <Button size="sm">Ir a mi Panel</Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                                        Iniciar Sesión
                                    </Link>
                                    <Link href="/register">
                                        <Button size="sm">Empezar Ahora</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            className="p-2 -mr-2 text-foreground hover:bg-black/5 rounded-full transition-colors relative z-[60]"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed inset-x-0 top-[72px] z-[50] bg-white border-b border-glass-border md:hidden overflow-hidden shadow-xl"
                    >
                        <div className="flex flex-col p-6 gap-4 bg-white">
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
                            {isAuthenticated ? (
                                <Link href={`/dashboard/${userRole?.toLowerCase() || 'patient'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full">Ir a mi Panel</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-primary py-2">
                                        Iniciar Sesión
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full">Empezar Ahora</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
