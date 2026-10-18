"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { appointmentService } from "@/services/appointment.service";
import { psychologistService } from "@/services/psychologist.service";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Calendar, Search, Filter, ChevronLeft, ChevronRight, Clock, User, FileText, CalendarClock, X, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import { parseApiDate } from "@/lib/utils";

interface Appointment {
    id: number;
    patientId: number;
    patient: {
        person: {
            firstName: string;
            lastName: string;
        };
    };
    scheduledTime: string;
    status: number; // 0: Pending, 1: Confirmed, 2: Completed, 3: Cancelled
    durationMinutes: number;
    notes?: string;
    reasonForConsultation?: string;
    sessionPackage?: {
        id: number;
        totalSessions: number;
        usedSessions: number;
    };
}

export default function AppointmentsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [psychologistId, setPsychologistId] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [patientName, setPatientName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState<number | undefined>(1); // Default to Confirmed

    // Reschedule Modal States
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // Reason for Consultation Modal
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [reasonModalAppointment, setReasonModalAppointment] = useState<Appointment | null>(null);

    const fetchPsychologistId = async () => {
        try {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) return null;

            const user = JSON.parse(storedUser);
            const profile = await psychologistService.getPsychologistByUserId(user.id);
            if (profile) {
                setPsychologistId(profile.id);
                return profile.id;
            }
        } catch (error) {
            console.error("Error resolving psychologist ID:", error);
        }
        return null;
    };

    const fetchAppointments = async (overrideId?: number) => {
        setLoading(true);
        try {
            const id = overrideId || psychologistId;
            if (!id) return;

            const filter = {
                psychologistId: id,
                patientName: patientName || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                pageNumber,
                pageSize: 10,
                status: statusFilter,
                onlyPaid: true
            };

            const result: any = await appointmentService.getPsychologistAppointments(filter);
            if (result && result.items) {
                setAppointments(result.items);
                setTotalCount(result.totalCount);
                setTotalPages(Math.ceil(result.totalCount / result.pageSize));
            } else {
                setAppointments([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsCompleted = async (id: number) => {
        try {
            await appointmentService.markAsCompleted(id);
            fetchAppointments();
        } catch (error) {
            console.error("Error marking appointment as completed", error);
        }
    };

    const handleMarkAsNoShow = async (id: number) => {
        try {
            await appointmentService.markAsNoShow(id);
            fetchAppointments();
        } catch (error) {
            console.error("Error marking appointment as no show", error);
        }
    };

    const minDateStr = format(new Date(), "yyyy-MM-dd");

    const maxRescheduleDate = (() => {
        const now = new Date();
        if (!selectedAppointment) {
            return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
        const appDate = parseApiDate(selectedAppointment.scheduledTime);
        const baseDate = appDate > now ? appDate : now;
        return new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    })();

    const maxDateStr = format(maxRescheduleDate, "yyyy-MM-dd");

    const openRescheduleModal = (app: Appointment) => {
        setSelectedAppointment(app);
        setRescheduleDate("");
        setAvailableSlots([]);
        setSelectedSlot(null);
        setShowRescheduleModal(true);
    };

    const fetchSlots = async (date: string) => {
        if (!selectedAppointment || !psychologistId) return;
        try {
            setIsLoadingSlots(true);
            const duration = selectedAppointment.durationMinutes || 60;
            const slots: any = await appointmentService.getAvailableSlots(psychologistId, date, duration);
            setAvailableSlots(slots || []);
        } catch (error) {
            console.error("Error fetching slots:", error);
            toast.error("Error al cargar horarios disponibles");
        } finally {
            setIsLoadingSlots(false);
        }
    };

    useEffect(() => {
        if (rescheduleDate && showRescheduleModal) {
            fetchSlots(rescheduleDate);
        }
    }, [rescheduleDate, showRescheduleModal]);

    const handleReschedule = async () => {
        if (!selectedAppointment || !selectedSlot) return;

        try {
            setIsRescheduling(true);
            await appointmentService.rescheduleAppointment(selectedAppointment.id, selectedSlot);
            toast.success("Cita reagendada correctamente");
            setShowRescheduleModal(false);
            fetchAppointments();
        } catch (error: any) {
            toast.error(error.message || "Error al reagendar la cita");
        } finally {
            setIsRescheduling(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const id = await fetchPsychologistId();
            if (id) {
                fetchAppointments(id);
            }
        };
        init();
    }, [pageNumber, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPageNumber(1); // Reset to first page
        fetchAppointments();
    };

    const handleClearFilters = () => {
        setPatientName("");
        setStartDate("");
        setEndDate("");
        setStatusFilter(1);
        setPageNumber(1);
        fetchAppointments(); // Fetch appointments with cleared filters
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Confirmada</span>;
            case 2: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completada</span>;
            case 3: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelada</span>;
            case 4: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">No Asistió</span>;
            default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Desconocido</span>;
        }
    };

    const formatDate = (dateString: string) => {
        return parseApiDate(dateString).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleJoinCall = async (appointmentId: number, scheduledTime: string) => {
        const scheduledDate = parseApiDate(scheduledTime);
        const expirationTime = new Date(scheduledDate.getTime() + 60 * 60 * 1000);

        if (new Date() > expirationTime) {
            toast.error("La sesión ha expirado. Solo puedes unirte hasta 60 minutos después de la hora programada.");
            return;
        }

        try {
            const response: any = await appointmentService.joinAppointment(appointmentId);
            if (response && response.link) {
                window.open(response.link, '_blank');
            } else {
                console.error("Link de reunión no encontrado");
            }
        } catch (error) {
            console.error("Error al intentar unirse a la llamada:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agenda de Citas</h1>
                    <p className="text-gray-500">Gestiona tus próximas sesiones y el historial</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border shadow-sm">
                    <span className="text-sm font-medium text-gray-600">Total: {totalCount} citas</span>
                </div>
            </div>

            <div className="flex bg-white p-1 rounded-2xl border border-glass-border shadow-sm w-fit">
                {[
                    { id: 1, label: "Confirmadas" },
                    { id: 2, label: "Realizadas" },
                    { id: 3, label: "Canceladas" },
                    { id: 4, label: "No Asistió" }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setStatusFilter(tab.id);
                            setPageNumber(1);
                        }}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === tab.id
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters Bar */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-glass-border">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar paciente..."
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <div>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleClearFilters} className="w-1/3 h-[46px] rounded-xl flex items-center justify-center p-0" title="Limpiar filtros">
                        <span className="text-gray-500 text-lg">×</span>
                    </Button>
                    <Button type="submit" variant="primary" className="w-2/3 h-[46px] rounded-xl">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrar
                    </Button>
                </div>
            </form>

            {/* Appointments List */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-glass-border overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Cargando citas...</div>
                ) : appointments.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No se encontraron citas</h3>
                        <p className="text-gray-500 mt-2">Prueba ajustando los filtros de búsqueda.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="p-6 hover:bg-white/80 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
                                <div
                                    className="flex gap-4 items-center cursor-pointer group/patient"
                                    onClick={() => router.push(`/dashboard/psychologist/patients/${appointment.patientId}`)}
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/patient:scale-105 transition-transform">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg group-hover/patient:text-primary transition-colors">
                                            {appointment.patient?.person?.firstName} {appointment.patient?.person?.lastName}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{parseApiDate(appointment.scheduledTime).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{parseApiDate(appointment.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        {appointment.reasonForConsultation && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReasonModalAppointment(appointment);
                                                    setShowReasonModal(true);
                                                }}
                                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 hover:border-indigo-300 transition-all group/reason"
                                            >
                                                <MessageSquare className="h-3.5 w-3.5 group-hover/reason:scale-110 transition-transform" />
                                                Ver motivo de consulta
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-4 border-l md:border-l-0 md:border-r border-gray-100 pr-6 mr-2">
                                        {getStatusBadge(appointment.status)}
                                        {appointment.sessionPackage && (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                Paquete ({appointment.sessionPackage.usedSessions}/{appointment.sessionPackage.totalSessions})
                                            </span>
                                        )}
                                    </div>

                                    {appointment.status === 1 && (
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <Button
                                                variant="primary"
                                                onClick={() => handleJoinCall(appointment.id, appointment.scheduledTime)}
                                                className="text-xs h-8 px-4"
                                            >
                                                Unirse a Llamada
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() => openRescheduleModal(appointment)}
                                                className="text-xs h-8 px-3 border-amber-500/40 text-amber-700 hover:bg-amber-50 font-bold flex items-center gap-1.5 shadow-sm"
                                                title="Reagendar Cita"
                                            >
                                                <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
                                                Reagendar
                                            </Button>

                                            {parseApiDate(appointment.scheduledTime) < new Date() && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        // disabled={true}
                                                        variant="outline"
                                                        onClick={() => handleMarkAsCompleted(appointment.id)}
                                                        className="text-xs h-8 px-2 border-green-500 text-green-600 hover:bg-green-50"
                                                        title="Marcar como Completada"
                                                    >
                                                        Completada
                                                    </Button>
                                                    <Button
                                                        disabled={true} // Disable if already cancelled
                                                        variant="outline"
                                                        onClick={() => handleMarkAsNoShow(appointment.id)}
                                                        className="text-xs h-8 px-2 border-red-500 text-red-600 hover:bg-red-50"
                                                        title="Marcar como No Asistió"
                                                    >
                                                        No Asistió
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {appointment.status === 0 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => openRescheduleModal(appointment)}
                                            className="text-xs h-8 px-3 border-amber-500/40 text-amber-700 hover:bg-amber-50 font-bold flex items-center gap-1.5 shadow-sm"
                                            title="Reagendar Cita"
                                        >
                                            <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
                                            Reagendar
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="text-xs h-8 gap-2 border-primary/20 text-primary hover:bg-primary/5"
                                        onClick={() => router.push(`/dashboard/psychologist/patients/${appointment.patientId}/history`)}
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        Historia Clínica
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && appointments.length > 0 && (
                    <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Página <span className="font-medium">{pageNumber}</span> de <span className="font-medium">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                disabled={pageNumber >= totalPages}
                                onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Motivo de Consulta */}
            <AnimatePresence>
                {showReasonModal && reasonModalAppointment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReasonModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-gray-100"
                        >
                            {/* Gradient header */}
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 relative">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-white">Motivo de Consulta</h2>
                                            <p className="text-xs text-white/70 mt-0.5">
                                                {reasonModalAppointment.patient?.person?.firstName} {reasonModalAppointment.patient?.person?.lastName}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowReasonModal(false)}
                                        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                                {/* Decorative circles */}
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
                                <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Date chip */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                        {parseApiDate(reasonModalAppointment.scheduledTime).toLocaleDateString('es-ES', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </span>
                                    <span className="mx-1">·</span>
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                        {parseApiDate(reasonModalAppointment.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {/* Reason text */}
                                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5">
                                    <p className="text-sm text-gray-700 leading-relaxed italic whitespace-pre-wrap">
                                        &ldquo;{reasonModalAppointment.reasonForConsultation}&rdquo;
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowReasonModal(false)}
                                    className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Reagendar Cita */}
            <AnimatePresence>
                {showRescheduleModal && selectedAppointment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isRescheduling && setShowRescheduleModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 border border-gray-100"
                        >
                            <div className="p-6 md:p-8 space-y-6">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                            <CalendarClock className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900">Reagendar Cita</h2>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Paciente: <span className="font-bold text-gray-800">{selectedAppointment.patient?.person?.firstName} {selectedAppointment.patient?.person?.lastName}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => !isRescheduling && setShowRescheduleModal(false)}
                                        className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Current appointment details */}
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Horario actual</span>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>{formatDate(selectedAppointment.scheduledTime)}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Máximo permitido para reagendar:{" "}
                                        <span className="font-bold text-primary">
                                            {format(maxRescheduleDate, "dd 'de' MMMM, yyyy", { locale: es })}
                                        </span>
                                    </p>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                                            Seleccionar nueva fecha
                                        </label>
                                        <input
                                            type="date"
                                            value={rescheduleDate}
                                            min={minDateStr}
                                            max={maxDateStr}
                                            onChange={(e) => {
                                                setRescheduleDate(e.target.value);
                                                setSelectedSlot(null);
                                            }}
                                            className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                                        />
                                    </div>

                                    {rescheduleDate && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                                                    Horarios disponibles en tu agenda
                                                </label>
                                                {selectedSlot && (
                                                    <span className="text-xs font-bold text-primary">
                                                        Seleccionado: {format(parseApiDate(selectedSlot), "HH:mm")}
                                                    </span>
                                                )}
                                            </div>

                                            {isLoadingSlots ? (
                                                <div className="flex flex-col items-center justify-center p-8 space-y-2 bg-gray-50/50 rounded-2xl border border-gray-100">
                                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                                    <p className="text-xs text-gray-400 font-medium">Buscando horarios disponibles...</p>
                                                </div>
                                            ) : availableSlots.length > 0 ? (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                                                    {availableSlots.map((slot: any) => {
                                                        const isSelected = selectedSlot === slot.startTime;
                                                        return (
                                                            <button
                                                                key={slot.startTime}
                                                                type="button"
                                                                onClick={() => setSelectedSlot(slot.startTime)}
                                                                className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                                                                    isSelected
                                                                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105"
                                                                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200/60"
                                                                }`}
                                                            >
                                                                {format(parseApiDate(slot.startTime), "HH:mm")}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/60 text-center space-y-1">
                                                    <div className="inline-flex p-1.5 bg-amber-100 rounded-full mb-1">
                                                        <AlertCircle className="w-4 h-4 text-amber-700" />
                                                    </div>
                                                    <p className="text-xs font-bold text-amber-800">
                                                        No hay horarios disponibles configurados para este día
                                                    </p>
                                                    <p className="text-[11px] text-amber-600">
                                                        Verifica tu horario de atención configurado en tu pestaña de Agenda.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Modal Actions */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowRescheduleModal(false)}
                                        disabled={isRescheduling}
                                        className="flex-1 rounded-xl h-12 text-sm"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleReschedule}
                                        disabled={!selectedSlot || isRescheduling}
                                        isLoading={isRescheduling}
                                        className="flex-1 rounded-xl h-12 text-sm font-bold shadow-lg shadow-primary/20"
                                    >
                                        Confirmar Reagendado
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
