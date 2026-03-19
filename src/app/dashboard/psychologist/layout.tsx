"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function PsychologistDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.replace('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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

            <main className="flex-1 md:ml-64 p-8 pt-24 md:pt-8 bg-secondary/5 min-h-screen">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
