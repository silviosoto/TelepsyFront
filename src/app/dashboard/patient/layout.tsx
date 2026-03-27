"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User, Calendar, CreditCard, Home, LogOut, Settings, Menu, X } from "lucide-react";
import { authService } from "@/services/auth.service";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { UserAvatar } from "@/components/dashboard/UserAvatar";

const menuItems = [
    { label: "Inicio", href: "/dashboard/patient", icon: Home },
    { label: "Mis Citas", href: "/dashboard/patient/appointments", icon: Calendar },
    { label: "Historial de Pagos", href: "/dashboard/patient/payments", icon: CreditCard },
    { label: "Mi Perfil", href: "/dashboard/patient/profile", icon: User },
];

export default function PatientDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.replace('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-white border-r border-glass-border flex flex-col fixed h-full z-40 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}>
                <div className="p-6 border-b border-glass-border flex items-center justify-between">
                    <Logo />
                    <button className="md:hidden p-2 text-foreground/50 hover:text-foreground" onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)}>
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-foreground/70 hover:bg-secondary/10 hover:text-foreground"
                                    }`}>
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
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

            {/* Mobile Header */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-glass-border md:hidden z-20 flex items-center justify-between px-4">
                <Logo />
                <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 pt-24 md:pt-8 bg-secondary/5 min-h-screen">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
