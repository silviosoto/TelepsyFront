"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, Mail, Phone, MapPin, Calendar, GraduationCap,
    Award, Download, CreditCard, Clock, User, CheckCircle,
    XCircle, Briefcase, Heart, Star, Trash2, RotateCcw, Search
} from "lucide-react";
import { Button } from "@/components/Button";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

export default function PsychologistDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"profile" | "appointments" | "payments">("profile");
    const [psychologist, setPsychologist] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [appointmentsPage, setAppointmentsPage] = useState(1);
    const [appointmentsSearch, setAppointmentsSearch] = useState("");
    const [appointmentsStartDate, setAppointmentsStartDate] = useState("");
    const [appointmentsEndDate, setAppointmentsEndDate] = useState("");
    const [payments, setPayments] = useState<any[]>([]);
    const [totalPayments, setTotalPayments] = useState(0);
    const [paymentsPage, setPaymentsPage] = useState(1);
    const [paymentsSearch, setPaymentsSearch] = useState("");
    const [paymentsStatus, setPaymentsStatus] = useState("all");
    const [paymentsStartDate, setPaymentsStartDate] = useState("");
    const [paymentsEndDate, setPaymentsEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchPsychologistDetails = async () => {
        try {
            const psiId = parseInt(id as string);
            const details = await adminService.getPsychologistDetails(psiId);
            setPsychologist(details);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar los detalles del psicólogo.");
        }
    };

    const fetchAppointments = async () => {
        try {
            const psiId = parseInt(id as string);
            const response = await adminService.getPsychologistAppointments(
                psiId,
                appointmentsPage,
                10,
                appointmentsSearch,
                appointmentsStartDate,
                appointmentsEndDate
            );
            setAppointments(response.data || []);
            setTotalAppointments(response.totalCount || 0);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar las citas.");
        }
    };

    const fetchPayments = async () => {
        try {
            const psiId = parseInt(id as string);
            const response = await adminService.getPsychologistPayments(
                psiId,
                paymentsPage,
                10,
                paymentsSearch,
                paymentsStatus,
                paymentsStartDate,
                paymentsEndDate
            );
            setPayments(response.data || []);
            setTotalPayments(response.totalCount || 0);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar los pagos.");
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchPsychologistDetails(),
            fetchAppointments(),
            fetchPayments()
        ]);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!isLoading) {
            fetchAppointments();
        }
    }, [appointmentsPage, appointmentsSearch, appointmentsStartDate, appointmentsEndDate]);

    useEffect(() => {
        if (!isLoading) {
            fetchPayments();
        }
    }, [paymentsPage, paymentsSearch, paymentsStatus, paymentsStartDate, paymentsEndDate]);

    const clearFilters = () => {
        setAppointmentsSearch("");
        setAppointmentsStartDate("");
        setAppointmentsEndDate("");
        setAppointmentsPage(1);
    };

    const clearPaymentFilters = () => {
        setPaymentsSearch("");
        setPaymentsStatus("all");
        setPaymentsStartDate("");
        setPaymentsEndDate("");
        setPaymentsPage(1);
    };

    const handleApproveStatus = async () => {
        const psiId = parseInt(id as string);
        toast.promise(adminService.approvePsychologist(psiId), {
            loading: 'Actualizando estado...',
            success: () => {
                fetchPsychologistDetails();
                return 'Psicólogo verificado con éxito';
            },
            error: 'Error al verificar el psicólogo'
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-foreground/60 animate-pulse font-medium">Cargando información detallada...</p>
            </div>
        );
    }

    if (!psychologist) return <div className="p-8 text-center">Psicólogo no encontrado.</div>;

    return (
        <div className="space-y-8 pb-12">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl h-10 w-10 p-0">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Perfil del Profesional</h1>
                    <p className="text-sm text-foreground/60">ID: #{psychologist.id} • {psychologist.fullName}</p>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Quick Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-glass-border shadow-sm overflow-hidden p-6 text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-4 shadow-inner">
                            {psychologist.fullName.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{psychologist.fullName}</h2>
                        <p className="text-sm text-primary font-semibold mb-4">{psychologist.specialization || "Psicólogo General"}</p>

                        <div className="flex justify-center gap-2 mb-6">
                            {psychologist.isVerified ? (
                                <span className="bg-green-50 text-green-600 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Verificado
                                </span>
                            ) : (
                                <span className="bg-orange-50 text-orange-600 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Pendiente
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-glass-border">
                            <div className="flex items-center gap-3 text-sm text-foreground/70">
                                <Mail className="w-4 h-4 text-primary/60" /> {psychologist.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground/70">
                                <Phone className="w-4 h-4 text-primary/60" /> {psychologist.phone || "No registrado"}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground/70 text-left">
                                <MapPin className="w-4 h-4 text-primary/60 flex-shrink-0" /> {psychologist.city}, {psychologist.address || "Dirección no especificada"}
                            </div>
                        </div>

                        {psychologist.cvPath && (
                            <Button
                                className="w-full mt-8 rounded-2xl"
                                onClick={() => window.open(psychologist.cvPath, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" /> Descargar CV
                            </Button>
                        )}

                        {!psychologist.isVerified && (
                            <Button
                                className="w-full mt-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white border-none shadow-lg shadow-green-200"
                                onClick={handleApproveStatus}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Verificar Profesional
                            </Button>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl border border-glass-border shadow-sm p-6 overflow-hidden relative">
                        <h3 className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-4">Especialidades</h3>
                        <div className="flex flex-wrap gap-2">
                            {psychologist.specialties?.length > 0 ? (
                                psychologist.specialties.map((s: string) => (
                                    <span key={s} className="px-3 py-1.5 bg-secondary/10 rounded-xl text-xs font-bold text-foreground/70">
                                        {s}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-foreground/40 italic">Ninguna registrada</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Content with Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs Navigation */}
                    <div className="bg-secondary/10 p-1.5 rounded-2xl flex gap-1 w-fit">
                        {[
                            { id: "profile", label: "Perfil Profesional", icon: User },
                            { id: "appointments", label: "Citas", icon: Clock },
                            { id: "payments", label: "Pagos y Ganancias", icon: CreditCard }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-foreground/50 hover:text-foreground hover:bg-white/50"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "profile" && (
                            <motion.div
                                key="profile-tab"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-white rounded-3xl border border-glass-border shadow-sm p-8 space-y-8">
                                    <section>
                                        <div className="flex items-center gap-2 text-primary font-bold mb-4">
                                            <GraduationCap className="w-5 h-5" />
                                            <h3>Educación y Experiencia</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-4 bg-secondary/5 rounded-2xl border border-glass-border">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40">Universidad</span>
                                                <p className="font-bold text-foreground">{psychologist.university || "No especificada"}</p>
                                            </div>
                                            <div className="p-4 bg-secondary/5 rounded-2xl border border-glass-border">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40">Años de experiencia</span>
                                                <p className="font-bold text-foreground">{psychologist.experienceYears || 0} años</p>
                                            </div>
                                            <div className="p-4 bg-secondary/5 rounded-2xl border border-glass-border">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40">Número de Licencia</span>
                                                <p className="font-bold text-foreground">{psychologist.licenseNumber || "N/A"}</p>
                                            </div>
                                            <div className="p-4 bg-secondary/5 rounded-2xl border border-glass-border">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40">Miembro desde</span>
                                                <p className="font-bold text-foreground">{psychologist.createdAt ? new Date(psychologist.createdAt).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-2 text-primary font-bold mb-4">
                                            <Award className="w-5 h-5" />
                                            <h3>Biografía Profesional</h3>
                                        </div>
                                        <div className="p-6 bg-secondary/5 rounded-3xl border border-glass-border text-foreground/70 leading-relaxed italic">
                                            "{psychologist.bio || "Este psicólogo aún no ha redactado su biografía profesional."}"
                                        </div>
                                    </section>

                                    {psychologist.therapies?.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 text-primary font-bold mb-4">
                                                <Briefcase className="w-5 h-5" />
                                                <h3>Servicios y Tarifas</h3>
                                            </div>
                                            <div className="overflow-x-auto rounded-2xl border border-glass-border">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-secondary/5 text-[10px] uppercase tracking-wider font-bold text-foreground/40">
                                                            <th className="p-4">Servicio</th>
                                                            <th className="p-4">Tarifa por Sesión</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-sm font-medium">
                                                        {psychologist.therapies.map((t: any) => (
                                                            <tr key={t.name} className="border-t border-glass-border">
                                                                <td className="p-4 text-foreground">{t.name}</td>
                                                                <td className="p-4 text-primary font-bold">${t.rate.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>
                                    )}

                                    {psychologist.hobbies && (
                                        <section>
                                            <div className="flex items-center gap-2 text-primary font-bold mb-4">
                                                <Heart className="w-5 h-5" />
                                                <h3>Intereses Personaless</h3>
                                            </div>
                                            <p className="text-sm text-foreground/70 px-4">{psychologist.hobbies}</p>
                                        </section>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "appointments" && (
                            <motion.div
                                key="appointments-tab"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="bg-white rounded-3xl border border-glass-border shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-glass-border space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-foreground">Historial de Citas</h3>
                                            <span className="text-xs bg-secondary/20 px-3 py-1 rounded-full font-bold">Total: {totalAppointments}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3 items-end">
                                            <div className="flex-1 min-w-[200px]">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40 ml-1 mb-1 block">Buscar Paciente</span>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre..."
                                                        className="w-full pl-10 pr-4 py-2 bg-secondary/5 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                        value={appointmentsSearch}
                                                        onChange={(e) => {
                                                            setAppointmentsSearch(e.target.value);
                                                            setAppointmentsPage(1);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="min-w-[140px]">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40 ml-1 mb-1 block">Desde</span>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                                    <input
                                                        type="date"
                                                        className="w-full pl-10 pr-4 py-2 bg-secondary/5 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                        value={appointmentsStartDate}
                                                        onChange={(e) => {
                                                            setAppointmentsStartDate(e.target.value);
                                                            setAppointmentsPage(1);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="min-w-[140px]">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40 ml-1 mb-1 block">Hasta</span>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                                    <input
                                                        type="date"
                                                        className="w-full pl-10 pr-4 py-2 bg-secondary/5 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                        value={appointmentsEndDate}
                                                        onChange={(e) => {
                                                            setAppointmentsEndDate(e.target.value);
                                                            setAppointmentsPage(1);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearFilters}
                                                className="rounded-xl h-10 w-10 p-0 border-dashed border-foreground/20 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                                title="Limpiar filtros"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-secondary/5 text-[10px] uppercase tracking-wider font-bold text-foreground/40">
                                                <tr>
                                                    <th className="p-4">Paciente</th>
                                                    <th className="p-4">Servicio</th>
                                                    <th className="p-4">Fecha/Hora</th>
                                                    <th className="p-4">Estado</th>
                                                    <th className="p-4 text-right">Monto</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {appointments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="p-12 text-center text-foreground/40 italic">
                                                            No se registran citas para este profesional.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    appointments.map((a) => (
                                                        <tr key={a.id} className="border-t border-glass-border hover:bg-secondary/5 transition-colors">
                                                            <td className="p-4 font-bold text-foreground">{a.patientName}</td>
                                                            <td className="p-4">
                                                                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">
                                                                    {a.therapyName}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 font-medium text-foreground/60">
                                                                {new Date(a.scheduledTime).toLocaleString()}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${a.status === 2 ? 'bg-green-100 text-green-700' :
                                                                    a.status === 3 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                    {a.status === 2 ? 'Completada' : a.status === 3 ? 'Cancelada' : 'Confirmada'}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right font-bold text-primary">
                                                                ${a.rate.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Footer */}
                                    {totalAppointments > 10 && (
                                        <div className="p-6 border-t border-glass-border flex items-center justify-between">
                                            <p className="text-xs text-foreground/40 font-medium">
                                                Mostrando {appointments.length} de {totalAppointments} citas
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setAppointmentsPage(prev => Math.max(1, prev - 1))}
                                                    disabled={appointmentsPage === 1}
                                                    className="rounded-xl"
                                                >
                                                    Anterior
                                                </Button>
                                                <div className="flex items-center px-4 text-sm font-bold text-primary bg-primary/5 rounded-xl">
                                                    {appointmentsPage}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setAppointmentsPage(prev => prev + 1)}
                                                    disabled={appointmentsPage * 10 >= totalAppointments}
                                                    className="rounded-xl"
                                                >
                                                    Siguiente
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "payments" && (
                            <motion.div
                                key="payments-tab"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-primary p-6 rounded-3xl shadow-lg shadow-primary/20 text-white relative overflow-hidden">
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Total Generado</p>
                                        <h4 className="text-3xl font-bold">${payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}</h4>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-glass-border shadow-sm overflow-hidden flex flex-col justify-center">
                                        <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest mb-1">Pagos Procesados</p>
                                        <h4 className="text-3xl font-bold text-foreground">{payments.length}</h4>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl border border-glass-border shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-glass-border space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-foreground">Relación de Pagos</h3>
                                            <span className="text-xs bg-secondary/20 px-3 py-1 rounded-full font-bold">Total: {totalPayments}</span>
                                        </div>

                                        {/* Filters Bar */}
                                        <div className="flex flex-wrap gap-3 items-end">
                                            <div className="flex-1 min-w-[200px]">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40 ml-1 mb-1 block">Buscar Paciente o Ref.</span>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre o Transacción..."
                                                        className="w-full pl-10 pr-4 py-2 bg-secondary/5 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                        value={paymentsSearch}
                                                        onChange={(e) => {
                                                            setPaymentsSearch(e.target.value);
                                                            setPaymentsPage(1);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="min-w-[140px]">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40 ml-1 mb-1 block">Estado</span>
                                                <select
                                                    className="w-full px-4 py-2 bg-secondary/5 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                                                    value={paymentsStatus}
                                                    onChange={(e) => {
                                                        setPaymentsStatus(e.target.value);
                                                        setPaymentsPage(1);
                                                    }}
                                                >
                                                    <option value="all">Todos</option>
                                                    <option value="Completed">Completado</option>
                                                    <option value="Pending">Pendiente</option>
                                                    <option value="Approved">Aprobado</option>
                                                </select>
                                            </div>

                                            <div className="min-w-[140px]">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40 ml-1 mb-1 block">Desde</span>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                                    <input
                                                        type="date"
                                                        className="w-full pl-10 pr-4 py-2 bg-secondary/5 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                        value={paymentsStartDate}
                                                        onChange={(e) => {
                                                            setPaymentsStartDate(e.target.value);
                                                            setPaymentsPage(1);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="min-w-[140px]">
                                                <span className="text-[10px] uppercase font-bold text-foreground/40 ml-1 mb-1 block">Hasta</span>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                                    <input
                                                        type="date"
                                                        className="w-full pl-10 pr-4 py-2 bg-secondary/5 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                        value={paymentsEndDate}
                                                        onChange={(e) => {
                                                            setPaymentsEndDate(e.target.value);
                                                            setPaymentsPage(1);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearPaymentFilters}
                                                className="rounded-xl h-10 w-10 p-0 border-dashed border-foreground/20 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                                title="Limpiar filtros"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-secondary/5 text-[10px] uppercase tracking-wider font-bold text-foreground/40">
                                                <tr>
                                                    <th className="p-4">Ref. Transacción</th>
                                                    <th className="p-4">Paciente</th>
                                                    <th className="p-4">Fecha</th>
                                                    <th className="p-4">Estado</th>
                                                    <th className="p-4 text-right">Monto</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {payments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="p-12 text-center text-foreground/40 italic">
                                                            No se registran transacciones para este profesional.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    payments.map((p) => (
                                                        <tr key={p.id} className="border-t border-glass-border hover:bg-secondary/5 transition-colors">
                                                            <td className="p-4 font-mono text-xs text-foreground/50">{p.transactionId || '---'}</td>
                                                            <td className="p-4 font-bold text-foreground">{p.patientName}</td>
                                                            <td className="p-4 font-medium text-foreground/60">{new Date(p.date).toLocaleDateString()}</td>
                                                            <td className="p-4">
                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'Completed' || p.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                                    }`}>
                                                                    {p.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right font-bold text-primary">
                                                                ${p.amount.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Footer for Payments */}
                                    {totalPayments > 10 && (
                                        <div className="p-6 border-t border-glass-border flex items-center justify-between">
                                            <p className="text-xs text-foreground/40 font-medium">
                                                Mostrando {payments.length} de {totalPayments} pagos
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPaymentsPage(prev => Math.max(1, prev - 1))}
                                                    disabled={paymentsPage === 1}
                                                    className="rounded-xl"
                                                >
                                                    Anterior
                                                </Button>
                                                <div className="flex items-center px-4 text-sm font-bold text-primary bg-primary/5 rounded-xl">
                                                    {paymentsPage}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPaymentsPage(prev => prev + 1)}
                                                    disabled={paymentsPage * 10 >= totalPayments}
                                                    className="rounded-xl"
                                                >
                                                    Siguiente
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
