"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    CreditCard,
    Receipt,
    ArrowRight,
    Home
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/Button";

function PaymentResponseContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Extract PayU parameters
    const transactionState = searchParams.get("transactionState");
    const referenceCode = searchParams.get("referenceCode");
    const transactionId = searchParams.get("transactionId");
    const txValue = searchParams.get("TX_VALUE");
    const currency = searchParams.get("currency");
    const message = searchParams.get("message");
    const paymentMethod = searchParams.get("lapPaymentMethod");

    // States for visual feedback
    const isApproved = transactionState === "4";
    const isDeclined = transactionState === "6";
    const isPending = transactionState === "7";

    return (
        <div className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-primary/5 border border-glass-border overflow-hidden relative"
            >
                {/* Decorative background element */}
                <div className={`absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 opacity-[0.03] rounded-full ${isApproved ? 'bg-emerald-500' : isDeclined ? 'bg-rose-500' : 'bg-amber-500'}`} />

                <div className="flex flex-col items-center text-center relative z-10">
                    {/* Status Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, delay: 0.2 }}
                        className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl ${isApproved ? 'bg-emerald-50 text-emerald-500 shadow-emerald-500/10' :
                            isDeclined ? 'bg-rose-50 text-rose-500 shadow-rose-500/10' :
                                'bg-amber-50 text-amber-500 shadow-amber-500/10'
                            }`}
                    >
                        {isApproved && <CheckCircle2 className="w-12 h-12" />}
                        {isDeclined && <XCircle className="w-12 h-12" />}
                        {isPending && <Clock className="w-12 h-12" />}
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                        {isApproved && "¡Pago Confirmado!"}
                        {isDeclined && "Pago Rechazado"}
                        {isPending && "Pago en Proceso"}
                        {!isApproved && !isDeclined && !isPending && "Resultado del Pago"}
                    </h1>

                    <p className="text-lg text-foreground/60 max-w-lg mb-12">
                        {isApproved && "Tu cita ha sido agendada con éxito. En breve recibirás un correo con el enlace de Zoom para tu sesión."}
                        {isDeclined && "Lo sentimos, tu transacción no pudo ser completada. Por favor, intenta de nuevo o usa otro medio de pago."}
                        {isPending && "Tu pago está siendo verificado por la entidad financiera. Te notificaremos por correo electrónico una vez se confirme."}
                    </p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12 text-left">
                        <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-5 flex items-center gap-4">
                            <Receipt className="w-6 h-6 text-primary/60" />
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Referencia de Pago</p>
                                <p className="font-bold text-foreground text-sm">{referenceCode || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-5 flex items-center gap-4">
                            <CreditCard className="w-6 h-6 text-primary/60" />
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Monto Pagado</p>
                                <p className="font-bold text-foreground text-sm">
                                    {txValue ? `${Number(txValue).toLocaleString()} ${currency}` : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-5 flex items-center gap-4">
                            <Clock className="w-6 h-6 text-primary/60" />
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Estado Transacción</p>
                                <p className={`font-bold text-sm ${isApproved ? 'text-emerald-600' : isDeclined ? 'text-rose-600' : 'text-amber-600'}`}>
                                    {message || 'Procesado'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-5 flex items-center gap-4">
                            <Calendar className="w-6 h-6 text-primary/60" />
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Medio de Pago</p>
                                <p className="font-bold text-foreground text-sm">{paymentMethod || 'Tarjeta'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Button
                            variant="primary"
                            className="h-14 px-10 rounded-2xl text-lg group shadow-xl shadow-primary/20 sm:w-auto w-full"
                            onClick={() => router.push("/dashboard/patient/appointments")}
                        >
                            Mis Citas
                            <Calendar className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-14 px-10 rounded-2xl text-lg group sm:w-auto w-full"
                            onClick={() => router.push("/")}
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Volver al Inicio
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Support message */}
            <p className="text-center mt-12 text-foreground/40 text-sm">
                ¿Tienes alguna duda con tu pago? <a href="#" className="text-primary font-bold hover:underline">Contactar a soporte</a>
            </p>
        </div>
    );
}

export default function PaymentResponsePage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            }>
                <PaymentResponseContent />
            </Suspense>
            <Footer />
        </main>
    );
}
