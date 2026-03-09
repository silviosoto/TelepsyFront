"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Calendar, User, Mail, Phone, RefreshCw } from "lucide-react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import Image from "next/image";

interface PatientData {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    createdAt: string;
}

export default function AdminPatientsPage() {
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Filter state
    const [searchName, setSearchName] = useState("");
    const [filterDate, setFilterDate] = useState("");

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getPatients(page, pageSize, searchName, filterDate);

            if (data) {
                setPatients(data.data);
                setTotalCount(data.totalCount);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar la lista de pacientes.");
        } finally {
            setIsLoading(false);
        }
    };

    // Effect for fetching on init or on state change
    useEffect(() => {
        // use a debouncer for search
        const timeoutId = setTimeout(() => {
            fetchPatients();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [page, searchName, filterDate]); // Re-fetch on dependencies change

    // Reset pagination when filters change
    useEffect(() => {
        setPage(1);
    }, [searchName, filterDate]);

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">Listado de Pacientes</h1>
                    <p className="text-foreground/60">Monitorea y explora a todos los pacientes registrados en la plataforma.</p>
                </div>
                <div className="flex gap-2 text-sm font-medium">
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Total: {totalCount}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-glass-border flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 z-10" />
                    <Input
                        placeholder="Buscar por Nombre o Correo..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="pl-12 w-full"
                    />
                </div>
                <div className="w-full md:w-64 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 z-10" />
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="pl-12 w-full"
                    />
                </div>
                <Button variant="outline" onClick={() => { setSearchName(""); setFilterDate(""); setPage(1); }} className="px-6 h-12">
                    <RefreshCw className="w-4 h-4 mr-2" /> Limpiar
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-glass-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-glass-border text-foreground/60 text-sm">
                                <th className="p-4 font-semibold uppercase tracking-wider">ID</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Paciente</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Contacto</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Fecha de Creación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-foreground/40">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                        <div className="mt-2">Cargando datos...</div>
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-foreground/40">
                                        <div className="flex justify-center mb-4">
                                            <User className="w-12 h-12 text-foreground/20" />
                                        </div>
                                        No se encontraron pacientes que coincidan con los filtros.
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient, index) => (
                                    <motion.tr
                                        key={patient.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-glass-border/50 hover:bg-secondary/5 transition-colors group"
                                    >
                                        <td className="p-4 text-foreground/50 font-medium">#{patient.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                                                    {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {patient.fullName || "Sin Nombre"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                                                <Mail className="w-3.5 h-3.5" />
                                                {patient.email || "N/A"}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                                                <Phone className="w-3.5 h-3.5" />
                                                {patient.phone || "N/A"}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-foreground/70 font-medium">
                                            {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : "N/A"}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!isLoading && patients.length > 0 && (
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
