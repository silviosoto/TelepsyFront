"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LogOut, LayoutDashboard, CreditCard } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { authService } from "@/services/auth.service";
import { X } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

const navItems = [
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Psicólogos", href: "/dashboard/admin/psychologists", icon: Users },
    { name: "Pacientes", href: "/dashboard/admin/patients", icon: Users },
    { name: "Gestión de Pagos", href: "/dashboard/admin/payments", icon: CreditCard },
];

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={`w-64 bg-white border-r border-glass-border flex flex-col fixed h-full z-40 transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                }`}>
                <div className="p-6 border-b border-glass-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Logo />
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full ml-1">ADMIN</span>
                    </div>
                    <button className="md:hidden p-2 text-foreground/50 hover:text-foreground" onClick={onClose}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = item.href === "/dashboard/admin"
                            ? pathname === item.href
                            : pathname.startsWith(item.href);

                        return (
                            <Link key={item.href} href={item.href} onClick={onClose}>
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-foreground/70 hover:bg-secondary/10 hover:text-foreground"
                                    }`}>
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-glass-border space-y-4">
                    <UserAvatar className="px-2" />
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                            authService.logout();
                            window.location.replace('/login');
                        }}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>
        </>
    );
}
