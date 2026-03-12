"use client";

import { useState, useEffect } from "react";
import { format, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import {
    Calendar,
    User,
    Clock,
    Video,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Star,
    ArrowRight,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { appointmentService } from "@/services/appointment.service";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import { parseApiDate } from "@/lib/utils";

interface Appointment {
    id: number;
    psychologistName: string;
    psychologistId: number;
    scheduledTime: string;
    status: number; // 0: Pending, 1: Confirmed, 2: Completed, 3: Cancelled
    therapyName: string;
    rate: number;
    videoLink?: string;
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const data = await appointmentService.getAppointments();
            setAppointments(data || []);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error("No se pudieron cargar tus citas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm("¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.")) return;

        try {
            await appointmentService.cancelAppointment(id);
            toast.success("Cita cancelada correctamente");
            fetchAppointments();
        } catch (error) {
            toast.error("No se pudo cancelar la cita");
        }
    };

    const handleJoinCall = async (id: number) => {
        try {
            const response: any = await appointmentService.joinAppointment(id);
            if (response && response.link) {
                window.open(response.link, '_blank');
            } else {
                toast.error("Link de reunión no disponible");
            }
        } catch (error) {
            toast.error("No se pudo acceder a la sala de espera");
        }
    };

    const getStatusInfo = (status: number, date: string) => {
        const appointmentDate = new Date(date);
        const now = new Date();

        switch (status) {
            case 1: // Confirmed
                return { label: "Confirmada", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 };
            case 2: // Completed
                return { label: "Realizada", color: "bg-blue-500/10 text-blue-600", icon: CheckCircle2 };
            case 3: // Cancelled
                return { label: "Cancelada", color: "bg-rose-500/10 text-rose-600", icon: XCircle };
            default: // Pending (awaiting payment usually)
                return { label: "Pendiente de Pago", color: "bg-amber-500/10 text-amber-600", icon: Clock };
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (filter === "all") return true;
        if (filter === "upcoming") return app.status === 1;
        if (filter === "completed") return app.status === 2;
        if (filter === "cancelled") return app.status === 3;
        return true;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Mis Citas</h1>
                    <p className="text-foreground/50 text-lg">Gestiona tus sesiones y mantén un seguimiento de tu progreso.</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-glass-border shadow-sm">
                    {[
                        { id: "all", label: "Todas" },
                        { id: "upcoming", label: "Próximas" },
                        { id: "completed", label: "Historial" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === tab.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-foreground/50 hover:text-foreground hover:bg-secondary/5"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-4 bg-white/50 border border-glass-border p-4 rounded-3xl text-sm">
                <span className="font-bold text-foreground/50 mr-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Estados de tus citas:
                </span>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="font-semibold text-foreground/70">Confirmada:</span>
                    <span className="text-foreground/50">Cita pagada y lista. Ve a 'Unirse ahora' a la hora programada.</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-semibold text-foreground/70">Realizada:</span>
                    <span className="text-foreground/50">Sesión completada con éxito.</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="font-semibold text-foreground/70">Cancelada:</span>
                    <span className="text-foreground/50">Cita anulada antes de realizarse.</span>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white rounded-[2rem] border border-glass-border animate-pulse" />
                        ))}
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-glass-border flex flex-col items-center"
                    >
                        <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
                            <Calendar className="w-10 h-10 text-primary/30" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No tienes citas agendadas</h3>
                        <p className="text-foreground/40 max-w-xs mb-8">Comienza hoy mismo tu camino hacia el bienestar emocional.</p>
                        <Button onClick={() => router.push("/")} className="rounded-2xl h-12 px-8">
                            Agendar mi primera cita
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredAppointments.map((app, index) => {
                                const status = getStatusInfo(app.status, app.scheduledTime);
                                const isUpcoming = app.status === 1 || app.status === 0;

                                const dateObj = parseApiDate(app.scheduledTime);

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={app.id}
                                        className="group bg-white border border-glass-border p-5 md:p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 relative"
                                    >
                                        <div className="flex flex-col md:flex-row gap-6 md:items-center">
                                            {/* Date Badge */}
                                            <div className="flex md:flex-col items-center justify-center bg-secondary/5 rounded-2xl p-4 min-w-[90px] group-hover:bg-primary/5 transition-colors">
                                                <span className="text-2xl font-black text-primary">
                                                    {format(dateObj, "dd")}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                                    {format(dateObj, "MMM", { locale: es })}
                                                </span>
                                            </div>

                                            {/* Main Info */}
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${status.color}`}>
                                                        <status.icon className="w-3 h-3" />
                                                        {status.label}
                                                    </div>
                                                    <span className="text-xs text-foreground/20 font-bold">•</span>
                                                    <div className="flex items-center gap-1.5 text-foreground/40 text-xs font-bold">
                                                        <Video className="w-3 h-3" />
                                                        Sesión Online
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">
                                                    {app.psychologistName}
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-foreground/40">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                                            <Clock className="w-4 h-4 text-foreground/60" />
                                                        </div>
                                                        {format(dateObj, "hh:mm a")}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                                            <Star className="w-4 h-4 text-foreground/60" />
                                                        </div>
                                                        {app.therapyName}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 justify-end pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-glass-border md:pl-8 min-w-[200px]">
                                                {isUpcoming ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleCancel(app.id)}
                                                            className="text-xs font-black text-rose-500/40 hover:text-rose-500 transition-colors uppercase tracking-widest px-4"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <Button
                                                            onClick={app.videoLink ? () => handleJoinCall(app.id) : undefined}
                                                            disabled={!app.videoLink && app.status !== 1}
                                                            className="rounded-2xl px-6 h-12 shadow-lg shadow-primary/20 group/btn"
                                                        >
                                                            {app.videoLink ? "Unirse ahora" : "Cita confirmada"}
                                                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </>
                                                ) : app.status === 2 ? (
                                                    <Button variant="outline" className="rounded-2xl px-6 h-12 border-primary/20 text-primary hover:bg-primary/5">
                                                        Dejar reseña
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs font-bold text-foreground/20 italic p-4">
                                                        No hay acciones disponibles
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Assistance Card */}
            <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-primary/5">
                        <AlertCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-foreground">¿Problemas con tu cita?</h4>
                        <p className="text-foreground/50 font-medium">Nuestro equipo de soporte está listo para ayudarte con lo que necesites.</p>
                    </div>
                </div>
                <Button variant="outline" className="rounded-2xl px-8 h-12 border-primary/20 bg-white shadow-sm">
                    Contactar soporte
                </Button>
            </div>
        </div>
    );
}

// Router mockup for the Agendar primera cita button
import { useRouter as useNextRouter } from "next/navigation";
const router = { push: (path: string) => window.location.href = path };
