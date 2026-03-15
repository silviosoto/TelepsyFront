"use client";

import { useEffect, useState } from "react";
import { psychologistService } from "@/services/psychologist.service";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
    BarChart3,
    Calendar,
    Download,
    TrendingUp,
    Users,
    Wallet,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign
} from "lucide-react";
import { parseApiDate } from "@/lib/utils";
import { toast } from "sonner";

interface ProductivityItem {
    appointmentId: number;
    date: string;
    patientName: string;
    therapyName: string;
    grossAmount: number;
    commission: number;
    netAmount: number;
    status: string;
    patientAttended: boolean;
    psychologistAttended: boolean;
}

interface ReportData {
    items: ProductivityItem[];
    totalGross: number;
    totalCommission: number;
    totalNet: number;
    totalSessions: number;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<ReportData | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [psychologistId, setPsychologistId] = useState<number | null>(null);

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
            toast.error("Error al cargar el perfil del profesional");
        }
        return null;
    };

    const fetchReport = async (psyId: number) => {
        setLoading(true);
        try {
            const data = await psychologistService.getProductivityReport(psyId, startDate, endDate);
            setReport(data);
        } catch (error) {
            console.error("Error fetching report:", error);
            toast.error("Error al generar el reporte de productividad");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const id = await fetchPsychologistId();
            if (id) {
                fetchReport(id);
            }
        };
        init();
    }, []);

    const handleFilter = () => {
        if (psychologistId) {
            fetchReport(psychologistId);
        }
    };

    const formatDate = (dateString: string) => {
        return parseApiDate(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-glass-border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        Productividad y Ganancias
                    </h1>
                    <p className="text-gray-500 mt-1">Monitorea el desempeño de tus sesiones y tus ingresos netos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
                        <Download className="w-4 h-4 mr-2" /> Exportar PDF
                    </Button>
                </div>
            </header>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-glass-border shadow-sm">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Fecha Inicio</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Fecha Fin</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    <Button onClick={handleFilter} className="min-w-[120px] rounded-xl">
                        <Filter className="w-4 h-4 mr-2" /> Filtrar
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-glass-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group bg-gradient-to-br from-white to-primary/5">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-primary scale-125 rotate-12" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Sesiones</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-2">{report?.totalSessions || 0}</h3>
                    <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                        <TrendingUp className="w-3 h-3 mr-1" /> Actividad Confirmada
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-glass-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group bg-gradient-to-br from-white to-blue-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-16 h-16 text-blue-600 scale-125 -rotate-12" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Producción Bruta</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-2">{formatCurrency(report?.totalGross || 0)}</h3>
                    <div className="mt-4 text-xs font-medium text-gray-400">Total pacientes</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-glass-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group bg-gradient-to-br from-white to-amber-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <ArrowDownRight className="w-16 h-16 text-amber-600 scale-125 rotate-12" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Comisión Plataforma</p>
                    <h3 className="text-3xl font-black text-amber-600 mt-2">-{formatCurrency(report?.totalCommission || 0)}</h3>
                    <div className="mt-4 text-xs font-medium text-gray-400">Servicios MindCare (30%)</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-primary/20 shadow-lg shadow-primary/5 hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden group bg-gradient-to-br from-white to-primary/10">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                        <Wallet className="w-16 h-16 text-primary scale-125 -rotate-12" />
                    </div>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">Tu Pago Neto</p>
                    <h3 className="text-3xl font-black text-primary mt-2">{formatCurrency(report?.totalNet || 0)}</h3>
                    <div className="mt-4 flex items-center text-xs font-bold text-white bg-primary w-fit px-3 py-1 rounded-full shadow-lg shadow-primary/30">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> Disponible
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-2xl border border-glass-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-glass-border flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Historial de Productividad</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Paciente</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Servicio</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Bruto</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Comisión</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Neto</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Asistencia</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-4 h-16 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : report?.items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron datos para los filtros seleccionados.
                                    </td>
                                </tr>
                            ) : (
                                report?.items.map((item) => (
                                    <tr key={item.appointmentId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{formatDate(item.date)}</div>
                                            <div className="text-xs text-gray-400">Ref: #{item.appointmentId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{item.patientName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium px-2 py-0.5 bg-secondary/10 text-primary rounded-full border border-secondary/20">
                                                {item.therapyName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-right">
                                            {formatCurrency(item.grossAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-amber-600 text-right">
                                            -{formatCurrency(item.commission)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-primary text-right">
                                            {formatCurrency(item.netAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${item.patientAttended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    Pac: {item.patientAttended ? 'Sí' : 'No'}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${item.psychologistAttended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    Tú: {item.psychologistAttended ? 'Sí' : 'No'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${item.status === 'Completed' || item.status === '2' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                item.status === 'Confirmed' || item.status === '1' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    'bg-amber-50 text-amber-600 border border-amber-100'
                                                }`}>
                                                {item.status === 'Completed' || item.status === '2' ? 'Realizada' :
                                                    item.status === 'Confirmed' || item.status === '1' ? 'Confirmada' :
                                                        item.status === 'NoShow' || item.status === '4' ? 'Inasistencia' : 'Pendiente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
