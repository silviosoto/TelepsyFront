"use client";

import { useEffect, useState } from "react";
import { appointmentService } from "@/services/appointment.service";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Calendar, Search, Filter, ChevronLeft, ChevronRight, Clock, User, FileText } from "lucide-react";

interface Appointment {
    id: number;
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
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [patientName, setPatientName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const PSYCHOLOGIST_ID = 1; // Mock ID

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const filter = {
                psychologistId: PSYCHOLOGIST_ID,
                patientName: patientName || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                pageNumber,
                pageSize: 10
            };

            const result: any = await appointmentService.getPsychologistAppointments(filter);
            // Assuming API returns { items: [], totalCount: 0, totalPages: 0 } or similar wrapper
            // Adjust based on actual API response structure (PaginatedResult)
            if (result && result.items) {
                setAppointments(result.items);
                setTotalCount(result.totalCount);
                setTotalPages(Math.ceil(result.totalCount / result.pageSize));
            } else {
                setAppointments([]);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [pageNumber]); // Fetch when page changes

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPageNumber(1); // Reset to first page
        fetchAppointments();
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
            case 1: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Confirmada</span>;
            case 2: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completada</span>;
            case 3: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelada</span>;
            default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Desconocido</span>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

            {/* Filters Bar */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-glass-border">
                <div className="relative">
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
                <Button type="submit" variant="primary" className="w-full h-[46px] rounded-xl">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                </Button>
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
                                <div className="flex gap-4 items-center">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {appointment.patient?.person?.firstName} {appointment.patient?.person?.lastName}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{new Date(appointment.scheduledTime).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{new Date(appointment.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <span className="text-gray-300">|</span>
                                            <span>{appointment.durationMinutes} min</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
                                    {getStatusBadge(appointment.status)}
                                    <Button variant="ghost" className="text-sm">
                                        Detalles
                                        <ChevronRight className="h-4 w-4 ml-1" />
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
