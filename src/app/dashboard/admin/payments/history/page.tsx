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
    XCircle,
    ArrowLeft,
    Filter,
    Download,
    IdCard
} from "lucide-react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import Link from "next/link";

interface PaymentHistoryItem {
    paymentId: number;
    date: string;
    patientId: number;
    patientName: string;
    patientIdentification: string;
    amount: number;
    status: string;
    transactionId: string;
    appointmentId: number;
    therapyName: string;
    psychologistName: string;
    psychologistPaymentAccount?: string;
}

export default function AdminPaymentHistoryPage() {
    const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [idenitificationTerm, setIdentificationTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await adminService.getAllPayments(
                page,
                pageSize,
                searchTerm || undefined,
                idenitificationTerm || undefined,
                statusFilter === "all" ? undefined : statusFilter,
                startDate || undefined,
                endDate || undefined
            );
            
            if (response?.data) {
                setPayments(response.data);
                setTotalCount(response.totalCount);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar el historial de pagos.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsPaid = async (paymentId: number) => {
        if (!confirm("¿Estás seguro de que deseas marcar este pago como pagado manualmente? Esto habilitará las citas para el paciente y el psicólogo.")) return;

        try {
            await adminService.markPaymentAsPaid(paymentId);
            toast.success("Pago marcado como pagado exitosamente.");
            fetchHistory(); // Refresh the list
        } catch (error) {
            console.error(error);
            toast.error("Error al marcar el pago como pagado.");
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [page, statusFilter, startDate, endDate]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchHistory();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'approved':
            case 'paid':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            case 'failed':
            case 'declined':
                return 'bg-red-100 text-red-700';
            case 'expired':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-secondary/10 text-foreground/60';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'approved':
            case 'paid':
                return <CheckCircle2 className="w-3.5 h-3.5" />;
            case 'pending':
                return <Clock className="w-3.5 h-3.5" />;
            case 'failed':
            case 'declined':
                return <XCircle className="w-3.5 h-3.5" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass-border pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/dashboard/admin/payments" className="text-primary hover:underline flex items-center text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Gestión
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">Historial de Transacciones</h1>
                    <p className="text-foreground/60">Consulta todos los intentos de pago y estados de transacciones en la plataforma.</p>
                </div>
                <Button variant="outline" className="hidden md:flex">
                    <Download className="w-4 h-4 mr-2" /> Exportar Reporte
                </Button>
            </div>

            {/* Premium Filter Section */}
            <form onSubmit={handleSearch} className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-glass-border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">Paciente / Psicólogo</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                            <Input
                                placeholder="Nombre o Referencia..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">Identificación</label>
                        <div className="relative">
                            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                            <Input
                                placeholder="Cédula / ID..."
                                value={idenitificationTerm}
                                onChange={(e) => setIdentificationTerm(e.target.value)}
                                className="pl-10 h-11 bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">Desde</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 h-11 bg-secondary/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">Hasta</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 h-11 bg-secondary/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-glass-border/30">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-foreground/60">Estado:</label>
                        <div className="flex p-1 bg-secondary/10 rounded-xl">
                            {['all', 'Completed', 'Pending', 'Failed'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === status 
                                        ? 'bg-white text-primary shadow-sm' 
                                        : 'text-foreground/40 hover:text-foreground/70'}`}
                                >
                                    {status === 'all' ? 'Todos' : status === 'Completed' ? 'Exitosos' : status === 'Pending' ? 'Pendientes' : 'Fallidos'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setIdentificationTerm("");
                                setStatusFilter("all");
                                setStartDate("");
                                setEndDate("");
                                setPage(1);
                            }}
                            className="h-11 px-6 rounded-2xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Reiniciar
                        </Button>
                        <Button type="submit" className="h-11 px-8 rounded-2xl shadow-lg shadow-primary/20">
                            Aplicar Filtros
                        </Button>
                    </div>
                </div>
            </form>

            {/* Results Table */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-secondary/5 border border-glass-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-glass-border text-foreground/60 text-xs font-bold uppercase tracking-widest">
                                <th className="p-6">Fecha / Referencia</th>
                                <th className="p-6">Paciente</th>
                                <th className="p-6">Psicólogo / Servicio</th>
                                <th className="p-6 text-right">Monto</th>
                                <th className="p-6">Estado</th>
                                <th className="p-6">Transacción ID</th>
                                <th className="p-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-glass-border/30">
                                        <td colSpan={6} className="p-6">
                                            <div className="h-12 bg-secondary/10 animate-pulse rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <CreditCard className="w-16 h-16" />
                                            <p className="text-xl font-medium">No se encontraron pagos</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment, index) => (
                                    <motion.tr
                                        key={payment.paymentId}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-glass-border/30 hover:bg-secondary/5 transition-colors group"
                                    >
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{new Date(payment.date).toLocaleString()}</span>
                                                <span className="text-[10px] bg-secondary/20 w-fit px-2 py-0.5 rounded text-foreground/40 mt-1 uppercase">
                                                    ID: {payment.paymentId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold">
                                                    {payment.patientName?.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">{payment.patientName}</span>
                                                    <span className="text-xs text-foreground/50">{payment.patientIdentification || 'Sin ID'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground/80">{payment.psychologistName}</span>
                                                <span className="text-xs text-primary font-medium">{payment.therapyName}</span>
                                                <div className="mt-1 flex items-center gap-1.5 p-1 px-2 bg-secondary/5 rounded-md border border-glass-border w-fit">
                                                    <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Cuenta:</span>
                                                    <span className="text-[10px] text-foreground/40 font-medium">{payment.psychologistPaymentAccount || 'Sin datos'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="font-bold text-lg text-foreground">
                                                {formatCurrency(payment.amount)}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusColor(payment.status)}`}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-xs font-mono text-foreground/30 group-hover:text-foreground/70 transition-colors">
                                                {payment.transactionId || '---'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            {payment.status.toLowerCase() === 'pending' ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="primary" 
                                                    onClick={() => handleMarkAsPaid(payment.paymentId)}
                                                    className="rounded-xl h-9 px-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Marcar Pagado
                                                </Button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-foreground/20 italic">No disponible</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalCount > pageSize && (
                    <div className="p-6 bg-secondary/5 flex items-center justify-between border-t border-glass-border">
                        <p className="text-sm text-foreground/40 font-medium">
                            Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, totalCount)} de {totalCount} resultados
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="rounded-xl px-4"
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page * pageSize >= totalCount}
                                onClick={() => setPage(page + 1)}
                                className="rounded-xl px-4"
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
