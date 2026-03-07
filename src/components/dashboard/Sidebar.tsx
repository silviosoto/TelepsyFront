"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Calendar, Users, LogOut, Settings, Briefcase, Clock, Tag } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

const navItems = [
    { name: "Mi Perfil", href: "/dashboard/psychologist/profile", icon: User },
    { name: "Mis Servicios", href: "/dashboard/psychologist/services", icon: Briefcase },
    { name: "Especialidades", href: "/dashboard/psychologist/specialties", icon: Tag },
    { name: "Mi Agenda", href: "/dashboard/psychologist/agenda", icon: Clock },
    { name: "Mis Citas", href: "/dashboard/psychologist/appointments", icon: Calendar },
    { name: "Mis Pacientes", href: "/dashboard/psychologist/patients", icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-glass-border hidden md:flex flex-col fixed h-full z-20">
            <div className="p-6 border-b border-glass-border">
                <div className="flex items-center gap-2">
                    <Logo />
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
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
                <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                    </Button>
                </Link>
            </div>
        </aside>
    );
}
