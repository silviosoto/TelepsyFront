"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, AlertTriangle, CheckCircle2, MoveRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { authService } from "@/services/auth.service";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    useEffect(() => {
        if (!token || !email) {
            setError("Falta el enlace de recuperación o es inválido.");
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await authService.resetPassword({ email: email!, token: token!, newPassword: password });
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 z-10 bg-white/40 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl"
        >
            <div className="text-center">
                <Logo />
                <h1 className="text-3xl font-bold text-foreground mt-6 mb-2">Nueva Contraseña</h1>
                <p className="text-foreground/60">
                    {isSubmitted 
                        ? "Tu contraseña ha sido actualizada con éxito."
                        : "Elige una nueva contraseña segura para tu cuenta."}
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
                    
                    <div className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Nueva contraseña"
                            required
                            icon={<Lock />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Confirmar contraseña"
                            required
                            icon={<Lock />}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        className="w-full h-12 text-lg font-medium shadow-xl shadow-primary/20"
                        disabled={isLoading || !token}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Actualizando...
                            </span>
                        ) : (
                            "Guardar Contraseña"
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
                        Ahora puedes iniciar sesión con tu nueva contraseña.
                    </p>
                    <Button 
                        className="w-full h-12 text-lg font-medium"
                        onClick={() => router.push("/login")}
                    >
                        <span className="flex items-center">
                            Ir al Login <MoveRight className="ml-2 w-5 h-5" />
                        </span>
                    </Button>
                </div>
            )}
        </motion.div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5 pointer-events-none" />
            <Suspense fallback={
                <div className="w-full max-w-md p-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center space-y-4">
                    <Logo />
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-foreground/60">Cargando...</p>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
