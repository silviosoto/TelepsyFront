"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Calendar, User, Users, Mail, Phone, RefreshCw, CheckCircle, XCircle, Filter } from "lucide-react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";

interface PsychologistData {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    specialization: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
}

export default function AdminPsychologistsPage() {
    const [psychologists, setPsychologists] = useState<PsychologistData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Filter state
    const [search, setSearch] = useState("");
    const [isVerified, setIsVerified] = useState<string>("all"); // "all", "true", "false"
    const [filterDate, setFilterDate] = useState("");

    const fetchPsychologists = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getPsychologists(page, pageSize, search, isVerified, filterDate);

            if (data) {
                setPsychologists(data.data);
                setTotalCount(data.totalCount);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar la lista de psicólogos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(fetchPsychologists, 500);
        return () => clearTimeout(timeoutId);
    }, [page, search, isVerified, filterDate]);

    // Reset pagination
    useEffect(() => {
        setPage(1);
    }, [search, isVerified, filterDate]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">Gestión de Psicólogos</h1>
                    <p className="text-foreground/60">Administra, verifica y filtra a los profesionales de la salud mental.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold">
                    <Users className="w-4 h-4" /> Total: {totalCount}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-glass-border flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 z-10" />
                    <Input
                        placeholder="Nombre, especialidad o correo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 w-full"
                    />
                </div>

                <div className="w-full md:w-48 relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 z-10" />
                    <select
                        className="w-full pl-12 pr-4 h-12 bg-secondary/5 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl outline-none text-sm appearance-none transition-all cursor-pointer"
                        value={isVerified}
                        onChange={(e) => setIsVerified(e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="true">Verificados</option>
                        <option value="false">No Verificados</option>
                    </select>
                </div>

                <div className="w-full md:w-56 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 z-10" />
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="pl-12 w-full"
                    />
                </div>

                <Button variant="outline" onClick={() => { setSearch(""); setIsVerified("all"); setFilterDate(""); setPage(1); }} className="px-6 h-12">
                    <RefreshCw className="w-4 h-4 mr-2" /> Limpiar
                </Button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-glass-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-glass-border text-foreground/60 text-sm">
                                <th className="p-4 font-semibold uppercase tracking-wider">Profesional</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Especialidad</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Estado</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Contacto</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-foreground/40 font-medium">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                        <div className="mt-2 text-sm">Cargando psicólogos...</div>
                                    </td>
                                </tr>
                            ) : psychologists.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-foreground/40">
                                        No hay psicólogos con estos criterios.
                                    </td>
                                </tr>
                            ) : (
                                psychologists.map((psych, index) => (
                                    <motion.tr
                                        key={psych.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-glass-border/50 hover:bg-secondary/5 transition-colors group"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                                                    {psych.fullName.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                                                        {psych.fullName}
                                                    </span>
                                                    <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-tighter">ID: #{psych.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-semibold px-3 py-1 bg-secondary/10 rounded-full text-foreground/70">
                                                {psych.specialization || "General"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {psych.isVerified ? (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Verificado
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full w-fit">
                                                    <XCircle className="w-3.5 h-3.5" /> Pendiente
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-foreground/60">
                                                    <Mail className="w-3 h-3" /> {psych.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-foreground/60">
                                                    <Phone className="w-3 h-3" /> {psych.phone || "Sin tel."}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-foreground/50 font-medium">
                                            {psych.createdAt ? new Date(psych.createdAt).toLocaleDateString() : "N/A"}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                {!isLoading && psychologists.length > 0 && (
                    <div className="p-4 border-t border-glass-border flex items-center justify-between bg-secondary/5">
                        <div className="text-sm text-foreground/60">
                            Página <span className="font-bold text-foreground">{page}</span> de <span className="font-bold">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-10 h-10 p-0 rounded-xl"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-10 h-10 p-0 rounded-xl"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
