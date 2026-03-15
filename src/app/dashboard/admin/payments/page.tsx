"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Calendar,
    User,
    CreditCard,
    RefreshCw,
    CheckCircle2,
    Clock,
    DollarSign,
    ExternalLink,
    Filter
} from "lucide-react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import { ConfirmationModal } from "@/components/ConfirmationModal";

interface PaymentItem {
    invoiceId: number;
    invoiceNumber: string;
    date: string;
    patientId: number;
    patientName: string;
    psychologistId: number;
    psychologistName: string;
    serviceName: string;
    totalAmount: number;
    psychologistShare: number;
    platformCommission: number;
    isPaidToPsychologist: boolean;
    patientAttended: boolean;
    psychologistAttended: boolean;
    appointmentId: number;
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<number | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<{ psychId: number, apptId: number } | null>(null);

    // List sources for filters
    const [psychologists, setPsychologists] = useState<{ id: number, fullName: string }[]>([]);
    const [patients, setPatients] = useState<{ id: number, fullName: string }[]>([]);

    // Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedPsychologistId, setSelectedPsychologistId] = useState<string>("all");
    const [selectedPatientId, setSelectedPatientId] = useState<string>("all");

    const fetchFiltersData = async () => {
        try {
            const [psyData, patData] = await Promise.all([
                adminService.getPsychologists(1, 1000),
                adminService.getPatients(1, 1000)
            ]);
            if (psyData?.data) setPsychologists(psyData.data);
            if (patData?.data) setPatients(patData.data);
        } catch (error) {
            console.error("Error fetching filter options:", error);
        }
    };

    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const psychId = selectedPsychologistId === "all" ? undefined : parseInt(selectedPsychologistId);
            const patientId = selectedPatientId === "all" ? undefined : parseInt(selectedPatientId);

            const data = await adminService.getPaymentManagement(
                psychId,
                patientId,
                startDate || undefined,
                endDate || undefined
            );
            if (Array.isArray(data)) {
                setPayments(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar la gestión de pagos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiltersData();
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [selectedPsychologistId, selectedPatientId, startDate, endDate]);

    const handleProcessPayout = (psychologistId: number, appointmentId: number) => {
        setSelectedPayout({ psychId: psychologistId, apptId: appointmentId });
        setIsModalOpen(true);
    };

    const confirmPayout = async () => {
        if (!selectedPayout) return;

        const { psychId, apptId } = selectedPayout;
        setIsProcessing(apptId);
        setIsModalOpen(false);

        try {
            await adminService.processPayout({
                psychologistId: psychId,
                appointmentIds: [apptId]
            });
            toast.success("Pago procesado exitosamente.");
            fetchPayments();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al procesar el pago.");
        } finally {
            setIsProcessing(null);
        }
    };

    const filteredPayments = payments.filter(p => {
        const matchesSearch =
            p.psychologistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "pending" && !p.isPaidToPsychologist) ||
            (statusFilter === "paid" && p.isPaidToPsychologist);

        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">Gestión de Pagos</h1>
                    <p className="text-foreground/60">Administra los pagos de los pacientes y liquida las sesiones a los psicólogos.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-glass-border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/50 uppercase ml-1">Psicólogo</label>
                        <select
                            value={selectedPsychologistId}
                            onChange={(e) => setSelectedPsychologistId(e.target.value)}
                            className="w-full bg-secondary/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        >
                            <option value="all">Todos los Psicólogos</option>
                            {psychologists.filter(p => p.fullName).map(p => (
                                <option key={p.id} value={p.id}>{p.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/50 uppercase ml-1">Paciente</label>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full bg-secondary/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        >
                            <option value="all">Todos los Pacientes</option>
                            {patients.filter(p => p.fullName).map(p => (
                                <option key={p.id} value={p.id}>{p.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/50 uppercase ml-1">Fecha Inicio</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-secondary/5 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/50 uppercase ml-1">Fecha Fin</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-secondary/5 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-2 border-t border-glass-border/30">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 z-10" />
                        <Input
                            placeholder="Filtrar resultados actuales..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 w-full h-11"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-secondary/5 border border-glass-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendientes de Pago</option>
                            <option value="paid">Pagados al Psicólogo</option>
                        </select>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setStartDate("");
                                setEndDate("");
                                setSelectedPsychologistId("all");
                                setSelectedPatientId("all");
                            }}
                            className="px-6 h-11 rounded-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Limpiar Filtros
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-glass-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-glass-border text-foreground/60 text-sm">
                                <th className="p-4 font-semibold uppercase tracking-wider">Fecha</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Factura</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Psicólogo / Servicio</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Paciente</th>
                                <th className="p-4 font-semibold uppercase tracking-wider text-right">Total</th>
                                <th className="p-4 font-semibold uppercase tracking-wider text-right">Comisión</th>
                                <th className="p-4 font-semibold uppercase tracking-wider text-right text-primary">A Pagar</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Asistencia</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Estado</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-foreground/40">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                        <div className="mt-2">Cargando pagos...</div>
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-12 text-center text-foreground/40">
                                        <div className="flex justify-center mb-4">
                                            <CreditCard className="w-12 h-12 text-foreground/20" />
                                        </div>
                                        No se encontraron registros de pagos.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment, index) => (
                                    <motion.tr
                                        key={`${payment.appointmentId}-${index}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="border-b border-glass-border/50 hover:bg-secondary/5 transition-colors group"
                                    >
                                        <td className="p-4 text-sm text-foreground/70">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm font-medium">
                                            <span className="bg-secondary/10 px-2 py-1 rounded text-foreground/60 lowercase">
                                                {payment.invoiceNumber}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{payment.psychologistName}</span>
                                                <span className="text-xs text-foreground/50">{payment.serviceName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-foreground/70">{payment.patientName}</span>
                                        </td>
                                        <td className="p-4 text-right text-sm font-medium">
                                            {formatCurrency(payment.totalAmount)}
                                        </td>
                                        <td className="p-4 text-right text-sm text-red-500 font-medium">
                                            -{formatCurrency(payment.platformCommission)}
                                        </td>
                                        <td className="p-4 text-right text-sm text-primary font-bold">
                                            {formatCurrency(payment.psychologistShare)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${payment.patientAttended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    Pac: {payment.patientAttended ? 'Sí' : 'No'}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${payment.psychologistAttended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    Psi: {payment.psychologistAttended ? 'Sí' : 'No'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {payment.isPaidToPsychologist ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Liquidado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {!payment.isPaidToPsychologist && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleProcessPayout(payment.psychologistId, payment.appointmentId)}
                                                    disabled={isProcessing === payment.appointmentId || !payment.psychologistAttended}
                                                    className="h-9 px-4 rounded-xl shadow-lg shadow-primary/20"
                                                >
                                                    {isProcessing === payment.appointmentId ? (
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <DollarSign className="w-4 h-4 mr-1.5" />
                                                            Liquidar
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmPayout}
                title="¿Confirmar Liquidación?"
                description="Esta acción generará una factura de liquidación para el psicólogo y marcará la sesión como pagada. Asegúrese de haber verificado los montos antes de continuar."
                confirmText="Liquidar Sesión"
                cancelText="Revisar de nuevo"
                variant="primary"
            />
        </div>
    );
}
