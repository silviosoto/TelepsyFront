"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    CheckCircle2,
    AlertCircle,
    CreditCard,
    Calendar,
    Search,
    Filter,
    ChevronRight,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { invoiceService, Invoice } from "@/services/invoice.service";
import { parseApiDate } from "@/lib/utils";
import { Button } from "@/components/Button";
import { toast } from "sonner";

export default function PaymentsPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setIsLoading(true);
            const data = await invoiceService.getMyInvoices();
            setInvoices(data || []);
        } catch (error) {
            console.error("Error fetching invoices:", error);
            toast.error("No se pudo cargar el historial de pagos");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusInfo = (status: number) => {
        switch (status) {
            case 1: // Paid
                return { label: "Pagado", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 };
            case 2: // Cancelled
                return { label: "Cancelado", color: "bg-rose-500/10 text-rose-600", icon: AlertCircle };
            case 3: // Refunded
                return { label: "Reembolsado", color: "bg-blue-500/10 text-blue-600", icon: AlertCircle };
            default: // Issued
                return { label: "Pendiente", color: "bg-amber-500/10 text-amber-600", icon: Loader2 };
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.details.some(d => d.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Historial de Pagos</h1>
                    <p className="text-foreground/50 text-lg">Revisa y gestiona tus facturas y transacciones realizadas.</p>
                </div>
            </div>

            {/* Filters & Search */}

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                    <input
                        type="text"
                        placeholder="Buscar por número de factura o descripción..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-glass-border rounded-2xl h-12 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                </div>
                <Button variant="outline" className="rounded-2xl h-12 px-6 border-glass-border bg-white text-foreground/60 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filtros
                </Button>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white rounded-[2rem] border border-glass-border animate-pulse" />
                        ))}
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-glass-border flex flex-col items-center"
                    >
                        <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-primary/30" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No se encontraron pagos</h3>
                        <p className="text-foreground/40 max-w-xs">Aún no tienes transacciones registradas o no coinciden con tu búsqueda.</p>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredInvoices.map((inv, index) => {
                                const status = getStatusInfo(inv.status);
                                const dateObj = parseApiDate(inv.issueDate);

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={inv.id}
                                        className="group bg-white border border-glass-border p-5 md:p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 relative"
                                    >
                                        <div className="flex flex-col md:flex-row gap-6 md:items-center">
                                            {/* Date Badge */}
                                            <div className="flex md:flex-col items-center justify-center bg-secondary/5 rounded-2xl p-4 min-w-[90px] group-hover:bg-primary/5 transition-colors">
                                                <span className="text-2xl font-black text-primary">
                                                    {format(dateObj, "dd")}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 text-center leading-tight">
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
                                                        <CreditCard className="w-3 h-3" />
                                                        {inv.payment?.paymentMethod || "Pago Online"}
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                                    #{inv.invoiceNumber}
                                                    {inv.status === 1 && (
                                                        <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-md uppercase tracking-widest font-black">Verify</span>
                                                    )}
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-foreground/40">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                                            <Calendar className="w-4 h-4 text-foreground/60" />
                                                        </div>
                                                        {format(dateObj, "hh:mm a")}
                                                    </div>
                                                    <p className="truncate max-w-xs">{inv.details[0]?.description || "Descripción no disponible"}</p>
                                                </div>
                                            </div>

                                            {/* Amount & Action */}
                                            <div className="flex items-center gap-6 justify-between md:justify-end pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-glass-border md:pl-8 min-w-[180px]">
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Monto</p>
                                                    <p className="text-2xl font-black text-foreground">${inv.totalAmount.toLocaleString()}</p>
                                                </div>
                                                <button className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors group/btn shadow-sm">
                                                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
