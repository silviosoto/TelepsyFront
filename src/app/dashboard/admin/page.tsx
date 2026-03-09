"use client";

import { motion } from "framer-motion";
import { Users, LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">Panel de Administrador</h1>
                    <p className="text-foreground/60">Bienvenido al sistema de administración de TelePsy.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-glass-border shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    onClick={() => window.location.href = '/dashboard/admin/patients'}
                >
                    <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform`}>
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold mt-4 text-foreground">Pacientes</h3>
                    <p className="text-sm text-foreground/50 font-medium">Gestionar registros</p>
                </motion.div>
            </div>
        </div>
    );
}
