"use client";

import { useState, useEffect } from "react";
import { format, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import {
    Calendar,
    User,
    Clock,
    Video,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Star,
    ArrowRight,
    Info,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal as MoreIcon
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
    isPackage: boolean;
    sessionPackageId?: number;
    videoLink?: string;
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    // Pagination States
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Reschedule/Cancel Modal States
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'choice' | 'cancel' | 'reschedule'>('choice');
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, [filter, pageNumber]);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            let statusFilter = undefined;
            if (filter === "upcoming") statusFilter = 1;
            else if (filter === "completed") statusFilter = 2;
            else if (filter === "cancelled") statusFilter = 3;

            const response: any = await appointmentService.getAppointments({
                pageNumber,
                pageSize: 6,
                status: statusFilter,
                onlyPaid: true
            });

            setAppointments(response.items || []);
            setTotalCount(response.totalCount || 0);
            setTotalPages(Math.ceil((response.totalCount || 0) / (response.pageSize || 6)));
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error("No se pudieron cargar tus citas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        try {
            setIsProcessing(true);
            await appointmentService.cancelAppointment(id);
            toast.success("Cita cancelada correctamente");
            setShowModal(false);
            fetchAppointments();
        } catch (error: any) {
            toast.error(error.message || "No se pudo cancelar la cita");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReschedule = async () => {
        if (!selectedAppointment || !selectedSlot) return;

        try {
            setIsProcessing(true);
            await appointmentService.rescheduleAppointment(selectedAppointment.id, selectedSlot);
            toast.success("Cita reprogramada correctamente");
            setShowModal(false);
            fetchAppointments();
        } catch (error: any) {
            toast.error(error.message || "Error al reprogramar la cita");
        } finally {
            setIsProcessing(false);
        }
    };

    const fetchSlots = async (date: string) => {
        if (!selectedAppointment) return;
        try {
            setIsLoadingSlots(true);
            const slots = await appointmentService.getAvailableSlots(selectedAppointment.psychologistId, date);
            setAvailableSlots(slots || []);
        } catch (error) {
            console.error("Error fetching slots:", error);
            toast.error("Error al cargar horarios disponibles");
        } finally {
            setIsLoadingSlots(false);
        }
    };

    useEffect(() => {
        if (rescheduleDate && modalMode === 'reschedule') {
            fetchSlots(rescheduleDate);
        }
    }, [rescheduleDate, modalMode]);

    const openActionModal = (app: Appointment) => {
        setSelectedAppointment(app);
        setModalMode('choice');
        setRescheduleDate("");
        setAvailableSlots([]);
        setSelectedSlot(null);
        setShowModal(true);
    };

    const maxRescheduleDate = selectedAppointment
        ? new Date(new Date(selectedAppointment.scheduledTime).setMonth(new Date(selectedAppointment.scheduledTime).getMonth() + 1))
        : new Date();

    const handleJoinCall = async (appointment: Appointment) => {
        const scheduledDate = parseApiDate(appointment.scheduledTime);
        const expirationTime = new Date(scheduledDate.getTime() + 60 * 60 * 1000);

        if (isAfter(new Date(), expirationTime)) {
            toast.error("La sesión ha expirado. Solo puedes unirte hasta 60 minutos después de la hora programada.");
            return;
        }

        try {
            const response: any = await appointmentService.joinAppointment(appointment.id);
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
            default:
                return { label: "Confirmada", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 };
        }
    };

    const filteredAppointments = appointments; // Already filtered by service

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
                        { id: "upcoming", label: "Confirmadas" },
                        { id: "completed", label: "Realizadas" },
                        { id: "cancelled", label: "Canceladas" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setFilter(tab.id);
                                setPageNumber(1);
                            }}
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
                    <span className="text-foreground/50">Cita anulada.</span>
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
                                const now = new Date();
                                const expirationTime = new Date(dateObj.getTime() + 60 * 60 * 1000);
                                const isExpired = isAfter(now, expirationTime);
                                const canJoin = !!app.videoLink && !isExpired && app.status === 1;

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
                                                    {app.isPackage && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-600">
                                                            Paquete
                                                        </div>
                                                    )}
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openActionModal(app);
                                                            }}
                                                            className="text-xs font-black text-rose-500/40 hover:text-rose-500 transition-colors uppercase tracking-widest px-4"
                                                        >
                                                            Cancelar / Reprogramar
                                                        </button>
                                                        <Button
                                                            onClick={canJoin ? () => handleJoinCall(app) : undefined}
                                                            disabled={!canJoin}
                                                            className="rounded-2xl px-6 h-12 shadow-lg shadow-primary/20 group/btn"
                                                            variant="primary"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Video className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                                                <span>{app.videoLink ? (isExpired ? "Sesión expirada" : "Unirse ahora") : "Cita confirmada"}</span>
                                                            </div>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                        disabled={pageNumber === 1}
                        className="w-10 h-10 rounded-xl border border-glass-border flex items-center justify-center bg-white text-foreground/50 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:hover:text-foreground/50 disabled:hover:border-glass-border transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPageNumber(i + 1)}
                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${pageNumber === i + 1
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white border border-glass-border text-foreground/40 hover:text-foreground hover:border-primary/20"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                        disabled={pageNumber === totalPages}
                        className="w-10 h-10 rounded-xl border border-glass-border flex items-center justify-center bg-white text-foreground/50 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:hover:text-foreground/50 disabled:hover:border-glass-border transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

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

            {/* Reschedule/Cancel Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isProcessing && setShowModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-8 md:p-10">
                                {modalMode === 'choice' && (
                                    <div className="space-y-8">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <MoreIcon className="w-8 h-8 text-primary" />
                                            </div>
                                            <h2 className="text-2xl font-black text-foreground mb-2">¿Qué deseas hacer?</h2>
                                            <p className="text-foreground/50">Selecciona una opción para tu cita con {selectedAppointment?.psychologistName}</p>
                                        </div>

                                        <div className="grid gap-4">
                                            <button
                                                onClick={() => setModalMode('reschedule')}
                                                className="flex items-center gap-6 p-6 rounded-3xl border-2 border-primary/5 hover:border-primary/20 hover:bg-primary/5 transition-all group text-left"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Calendar className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground">Reprogramar cita</h4>
                                                    <p className="text-xs text-foreground/40 font-medium">Cambiar la fecha y hora por una nueva.</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setModalMode('cancel')}
                                                className="flex items-center gap-6 p-6 rounded-3xl border-2 border-rose-500/5 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all group text-left"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <XCircle className="w-6 h-6 text-rose-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-rose-500">Cancelar definitivamente</h4>
                                                    <p className="text-xs text-rose-500/40 font-medium">Anular la sesión actual.</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {modalMode === 'cancel' && (
                                    <div className="space-y-8">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <AlertCircle className="w-8 h-8 text-rose-500" />
                                            </div>
                                            <h2 className="text-2xl font-black text-foreground mb-2">¿Estás seguro?</h2>
                                            <p className="text-foreground/50">Esta acción cancelará tu cita de forma permanente y no podrá deshacerse.</p>
                                        </div>

                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setModalMode('choice')}
                                                disabled={isProcessing}
                                                className="flex-1 rounded-2xl h-14"
                                            >
                                                Volver
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={() => selectedAppointment && handleCancel(selectedAppointment.id)}
                                                isLoading={isProcessing}
                                                className="flex-1 rounded-2xl h-14 bg-rose-500 hover:bg-rose-600 border-none"
                                            >
                                                Sí, cancelar
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {modalMode === 'reschedule' && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <h2 className="text-2xl font-black text-foreground mb-2">Reprogramar Cita</h2>
                                            <p className="text-foreground/50 text-sm">
                                                Máximo permitido hasta: <span className="font-bold text-primary">{format(maxRescheduleDate, "dd 'de' MMMM", { locale: es })}</span>
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-2 block">Selecciona nueva fecha</label>
                                                <input
                                                    type="date"
                                                    value={rescheduleDate}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    max={maxRescheduleDate.toISOString().split('T')[0]}
                                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                                    className="w-full p-4 rounded-2xl border border-glass-border bg-secondary/5 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>

                                            {rescheduleDate && (
                                                <div className="animate-in fade-in slide-in-from-top-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-2 block">Horarios disponibles</label>
                                                    {isLoadingSlots ? (
                                                        <div className="flex items-center justify-center p-8">
                                                            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                        </div>
                                                    ) : availableSlots.length > 0 ? (
                                                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                                                            {availableSlots.map((slot: any) => {
                                                                const isSelected = selectedSlot === slot.startTime;
                                                                return (
                                                                    <button
                                                                        key={slot.startTime}
                                                                        onClick={() => setSelectedSlot(slot.startTime)}
                                                                        className={`p-3 rounded-xl text-xs font-bold transition-all ${isSelected
                                                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                                            : "bg-secondary/5 text-foreground/60 hover:bg-secondary/10 border border-transparent"
                                                                            }`}
                                                                    >
                                                                        {format(parseApiDate(slot.startTime), "HH:mm")}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                                                            <p className="text-xs text-amber-600 font-bold">No hay horarios para este día</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setModalMode('choice')}
                                                disabled={isProcessing}
                                                className="flex-1 rounded-2xl h-14"
                                            >
                                                Volver
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={handleReschedule}
                                                disabled={!selectedSlot}
                                                isLoading={isProcessing}
                                                className="flex-1 rounded-2xl h-14"
                                            >
                                                Confirmar nueva fecha
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Router mockup for the Agendar primera cita button
import { useRouter as useNextRouter } from "next/navigation";
const router = { push: (path: string) => window.location.href = path };
