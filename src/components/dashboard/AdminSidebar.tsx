"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LogOut, LayoutDashboard, CreditCard } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { authService } from "@/services/auth.service";

const navItems = [
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Psicólogos", href: "/dashboard/admin/psychologists", icon: Users },
    { name: "Pacientes", href: "/dashboard/admin/patients", icon: Users },
    { name: "Gestión de Pagos", href: "/dashboard/admin/payments", icon: CreditCard },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-glass-border hidden md:flex flex-col fixed h-full z-20">
            <div className="p-6 border-b border-glass-border">
                <div className="flex items-center gap-2">
                    <Logo />
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full ml-1">ADMIN</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    // Check exact match for dashboard home, or starts-with for sub-routes
                    const isActive = item.href === "/dashboard/admin"
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Link key={item.href} href={item.href}>
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

            <div className="p-4 border-t border-glass-border">
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
    );
}
