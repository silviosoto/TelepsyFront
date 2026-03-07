"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    User,
    CreditCard,
    ShieldCheck,
    ArrowLeft,
    ChevronRight,
    CheckCircle2,
    Lock,
    Info
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/Button";
import { appointmentService } from "@/services/appointment.service";
import { paymentService } from "@/services/payment.service";
import { toast } from "sonner";

interface CheckoutSummary {
    appointmentId: number;
    invoiceId: number;
    psychologistName: string;
    therapyName: string;
    scheduledTime: string;
    amount: number;
}

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [summary, setSummary] = useState<CheckoutSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutData, setCheckoutData] = useState<any>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!id) return;
            try {
                const data = await appointmentService.getCheckoutSummary(id);
                setSummary(data);
            } catch (error: any) {
                console.error("Failed to fetch checkout summary", error);
                toast.error("No se pudo cargar la información de la cita");
                router.push("/");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, [id]);

    const handlePayment = async () => {
        if (!summary) return;

        setIsProcessing(true);
        try {
            const data = await paymentService.getCheckoutData(summary.invoiceId);
            setCheckoutData(data);

            // Wait for state update then submit form
            // Or just submit it programmatically
            toast.success("Redirigiendo a pasarela de pago...");

            // Small timeout to ensure form is rendered if needed, 
            // but we can also just use the data to create a form on the fly
            setTimeout(() => {
                const form = document.getElementById('payu-form') as HTMLFormElement;
                if (form) form.submit();
            }, 500);

        } catch (error: any) {
            console.error("Payment error:", error);
            toast.error(error.message || "Error al procesar el pago");
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!summary) return null;

    const scheduledDate = new Date(summary.scheduledTime);
    const formattedDate = scheduledDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = scheduledDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex-1 pt-28 pb-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-secondary/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Finalizar Reserva</h1>
                        <p className="text-sm text-foreground/60">Revisa los detalles y procede al pago seguro</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Summary and Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5 border border-glass-border"
                        >
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Resumen de la cita
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Psicólogo</p>
                                        <p className="text-lg font-bold text-foreground">{summary.psychologistName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Fecha y Hora</p>
                                        <p className="text-lg font-bold text-foreground capitalize">{formattedDate}</p>
                                        <p className="text-foreground/60">A las {formattedTime}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Info className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Servicio</p>
                                        <p className="text-lg font-bold text-foreground">{summary.therapyName}</p>
                                        <p className="text-foreground/60">Sesión individual (45 min)</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>


                    </div>

                    {/* Right: Price and Action */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-3xl p-6 shadow-2xl shadow-primary/10 border border-glass-border"
                            >
                                <h3 className="text-lg font-bold mb-6">Detalles del pago</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-foreground/60">
                                        <span>Subtotal</span>
                                        <span>${summary.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-foreground/60">
                                        <span>IVA (0%)</span>
                                        <span>$0</span>
                                    </div>
                                    <div className="pt-4 border-t border-glass-border flex justify-between items-center">
                                        <span className="font-bold text-lg text-foreground">Total</span>
                                        <span className="font-extrabold text-2xl text-primary">${summary.amount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] text-center text-foreground/40 uppercase font-bold tracking-widest leading-relaxed">
                                        Al hacer clic, serás redirigido a PayU para completar tu pago de forma segura.
                                    </p>

                                    <Button
                                        className="w-full h-14 text-lg font-bold rounded-2xl group shadow-lg shadow-primary/20"
                                        onClick={handlePayment}
                                        disabled={isProcessing}
                                        isLoading={isProcessing}
                                    >
                                        {isProcessing ? "Procesando..." : (
                                            <>
                                                Pagar ahora
                                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>

                                    <div className="flex items-center justify-center gap-2 text-xs text-foreground/40">
                                        <Lock className="w-3 h-3" />
                                        Pago encriptado SSL de 256 bits
                                    </div>
                                </div>
                            </motion.div>

                            {/* Payment Logos Mockup */}
                            <div className="flex flex-wrap justify-between items-center px-4 opacity-40 grayscale">
                                <span className="font-black text-xs">VISA</span>
                                <span className="font-black text-xs">MASTERCARD</span>
                                <span className="font-black text-xs">PSE</span>
                                <span className="font-black text-xs">PayU</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden PayU Form */}
            {checkoutData && (
                <form
                    id="payu-form"
                    method="post"
                    action={checkoutData.checkoutUrl}
                    className="hidden"
                >
                    <input name="merchantId" type="hidden" value={checkoutData.merchantId} />
                    <input name="accountId" type="hidden" value={checkoutData.accountId} />
                    <input name="description" type="hidden" value={checkoutData.description} />
                    <input name="referenceCode" type="hidden" value={checkoutData.referenceCode} />
                    <input name="amount" type="hidden" value={checkoutData.amount} />
                    <input name="tax" type="hidden" value={checkoutData.tax} />
                    <input name="taxReturnBase" type="hidden" value={checkoutData.taxReturnBase} />
                    <input name="currency" type="hidden" value={checkoutData.currency} />
                    <input name="signature" type="hidden" value={checkoutData.signature} />
                    <input name="test" type="hidden" value={checkoutData.test} />
                    <input name="buyerEmail" type="hidden" value={checkoutData.buyerEmail} />
                    <input name="responseUrl" type="hidden" value={checkoutData.responseUrl} />
                    <input name="confirmationUrl" type="hidden" value={checkoutData.confirmationUrl} />
                </form>
            )}

            <Footer />
        </main>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
