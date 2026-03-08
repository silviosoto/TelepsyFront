"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Calendar, CreditCard, Home, LogOut, Settings } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

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

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-glass-border hidden md:flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-glass-border">
                    <Logo />
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
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

                <div className="p-4 border-t border-glass-border">
                    <Link href="/login">
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header (TODO: Add functionality) */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-glass-border md:hidden z-20 flex items-center justify-between px-4">
                <Logo />
                {/* Mobile menu toggle would go here */}
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
