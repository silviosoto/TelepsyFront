"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { appointmentService } from "@/services/appointment.service";
import { psychologistService } from "@/services/psychologist.service";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Calendar, Search, Filter, ChevronLeft, ChevronRight, Clock, User, FileText } from "lucide-react";
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
            alert("La sesión ha expirado (más de 60 minutos desde la hora programada).");
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
                                        <div className="flex gap-3">
                                            <Button
                                                variant="primary"
                                                onClick={() => handleJoinCall(appointment.id, appointment.scheduledTime)}
                                                className="text-xs h-8 px-4"
                                            >
                                                Unirse a Llamada
                                            </Button>

                                            {parseApiDate(appointment.scheduledTime) < new Date() && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleMarkAsCompleted(appointment.id)}
                                                        className="text-xs h-8 px-2 border-green-500 text-green-600 hover:bg-green-50"
                                                        title="Marcar como Completada"
                                                    >
                                                        Completada
                                                    </Button>
                                                    <Button
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
        </div>
    );
}
