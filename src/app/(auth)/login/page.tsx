"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MoveRight, Lock, Mail, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('http://localhost:5002/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            localStorage.setItem('token', data.token);

            // Save user info for ID resolution in dashboards
            const user = {
                id: data.userId,
                email: data.email,
                role: data.role
            };
            localStorage.setItem('user', JSON.stringify(user));

            if (data.role === "Admin") {
                router.push("/dashboard/admin");
            } else if (data.role === "Psychologist" || email.includes("psych")) {
                router.push("/dashboard/psychologist");
            } else {
                router.push("/dashboard/patient");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden">
            {/* Background Texture Logic */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5 pointer-events-none" />

            {/* Left Content (Form) */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 z-10 relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <Link href="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
                            <Logo />
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Bienvenido de nuevo</h1>
                        <p className="text-foreground/60">
                            Ingresa a tu espacio seguro y continúa tu camino hacia el bienestar.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    type="email"
                                    placeholder="tu@email.com"
                                    required
                                    icon={<Mail />}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    type="password"
                                    placeholder="********"
                                    required
                                    icon={<Lock />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary/20 transition-all" />
                                <span className="text-foreground/60 group-hover:text-foreground transition-colors">Recordarme</span>
                            </label>
                            <Link href="#" className="font-medium text-primary hover:text-accent transition-colors">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        <Button
                            className="w-full h-12 text-lg font-medium shadow-xl shadow-primary/20"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Iniciando...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Iniciar Sesión <MoveRight className="ml-2 w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-glass-border text-center">
                        <p className="text-sm text-foreground/60">
                            ¿Aún no tienes cuenta?{" "}
                            <Link href="/register" className="font-medium text-primary hover:text-accent transition-colors">
                                Regístrate gratis
                            </Link>
                        </p>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-xs text-foreground/40 bg-foreground/5 py-2 px-4 rounded-full w-fit mx-auto">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Conexión cifrada de extremo a extremo</span>
                    </div>
                </div>
            </div>

            {/* Right Content (Visual) */}
            <div className="hidden md:flex w-1/2 bg-secondary/10 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/20" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-lg text-center"
                >
                    <div className="premium-card p-10 bg-white/60 backdrop-blur-xl border-white/20 shadow-2xl">
                        <h2 className="text-2xl font-bold text-foreground mb-4">"El primer paso no te lleva a donde quieres ir, pero te saca de donde estás."</h2>
                        <p className="text-foreground/60 italic">— Anónimo</p>

                        <div className="mt-8 flex justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary/40" />
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <div className="w-2 h-2 rounded-full bg-primary/40" />
                        </div>
                    </div>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl mix-blend-multiply opacity-30 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl mix-blend-multiply opacity-30 animate-pulse delay-1000" />
            </div>
        </div>
    );
}
