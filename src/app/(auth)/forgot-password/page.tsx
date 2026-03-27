"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MoveLeft, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        try {
            await authService.forgotPassword(email);
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5 pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 z-10 bg-white/40 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl"
            >
                <div className="text-center">
                    <Logo />
                    <h1 className="text-3xl font-bold text-foreground mt-6 mb-2">Recuperar Contraseña</h1>
                    <p className="text-foreground/60">
                        {isSubmitted 
                            ? "Revisa tu bandeja de entrada para continuar."
                            : "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña."}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6 text-foreground">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        
                        <Input
                            type="email"
                            placeholder="tu@email.com"
                            required
                            icon={<Mail />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Button
                            className="w-full h-12 text-lg font-medium shadow-xl shadow-primary/20"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando...
                                </span>
                            ) : (
                                "Enviar enlace"
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                        </div>
                        <p className="text-sm text-foreground/60">
                            Si existe una cuenta asociada a <strong>{email}</strong>, recibirás instrucciones para restablecer tu contraseña en unos minutos.
                        </p>
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Intentar con otro correo
                        </Button>
                    </div>
                )}

                <div className="pt-6 border-t border-glass-border text-center">
                    <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors">
                        <MoveLeft className="w-4 h-4" /> Volver al Inicio de Sesión
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
