"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Briefcase, Mail, Lock, Phone, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/config";


enum Role {
    PATIENT = "Patient",
    PSYCHOLOGIST = "Psychologist"
}

export default function RegisterPage() {
    const [role, setRole] = useState<Role>(Role.PATIENT);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: ""
    });
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRoleChange = (newRole: Role) => {
        setRole(newRole);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const endpoint = `${API_CONFIG.BASE_URL}/auth/register`;

            const payload = new FormData();
            payload.append("FirstName", formData.firstName);
            payload.append("LastName", formData.lastName);
            payload.append("Email", formData.email);
            payload.append("Password", formData.password);
            payload.append("Role", role);

            // Additional fields logic can go here if needed, such as phoneNumber 
            // the DTO does not have phone number but I will pass it if they ever add it
            // payload.append("PhoneNumber", formData.phoneNumber);

            if (role === Role.PSYCHOLOGIST) {
                if (!cvFile) {
                    throw new Error("Debes adjuntar tu hoja de vida (CV) con el Rethus incluido.");
                }
                payload.append("CvFile", cvFile);
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                body: payload
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0] as string[];
                    throw new Error(firstError?.[0] || 'Error en el registro');
                }
                throw new Error(data.message || 'Error en el registro');
            }

            router.push("/login");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
            {/* Left Content (Visual) */}
            <div className={`hidden md:flex w-1/2 p-12 flex-col justify-between transition-colors duration-500 ${role === Role.PATIENT ? 'bg-primary/5' : 'bg-secondary/5'}`}>
                <div>
                    <Logo />
                </div>

                <div className="max-w-md">
                    <h1 className="text-4xl font-bold text-foreground mb-6">
                        {role === Role.PATIENT
                            ? "Tu viaje hacia el bienestar comienza aquí."
                            : "Únete a la red de profesionales que está cambiando vidas."}
                    </h1>
                    <p className="text-foreground/70 text-lg leading-relaxed">
                        {role === Role.PATIENT
                            ? "Accede a terapia de calidad, a tu propio ritmo y desde donde te sientas cómodo."
                            : "Gestiona tus pacientes, optimiza tu agenda y expande tu práctica con herramientas diseñadas para ti."}
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className={`w-3 h-3 rounded-full transition-colors ${role === Role.PATIENT ? 'bg-primary' : 'bg-foreground/20'}`} />
                    <div className={`w-3 h-3 rounded-full transition-colors ${role === Role.PSYCHOLOGIST ? 'bg-secondary' : 'bg-foreground/20'}`} />
                </div>
            </div>

            {/* Right Content (Form) */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-background relative overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex justify-between items-center mb-8">
                        <Link href="/login" className="text-sm font-medium text-foreground/60 hover:text-foreground flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                        </Link>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paso 1 de 2</span>
                    </div>

                    <div className="bg-secondary/10 p-1 rounded-xl flex gap-1 mb-8">
                        <button
                            onClick={() => handleRoleChange(Role.PATIENT)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${role === Role.PATIENT
                                ? "bg-white shadow-md text-primary"
                                : "text-foreground/60 hover:bg-white/50 hover:text-foreground"
                                }`}
                        >
                            <User className="w-4 h-4" /> Soy Paciente
                        </button>
                        <button
                            onClick={() => handleRoleChange(Role.PSYCHOLOGIST)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${role === Role.PSYCHOLOGIST
                                ? "bg-white shadow-md text-secondary"
                                : "text-foreground/60 hover:bg-white/50 hover:text-foreground"
                                }`}
                        >
                            <Briefcase className="w-4 h-4" /> Soy Psicólogo
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.form
                            key={role}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                            onSubmit={handleSubmit}
                        >
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Nombre" name="firstName" placeholder="Tu nombre" required autoComplete="given-name" onChange={handleChange} />
                                <Input label="Apellido" name="lastName" placeholder="Tu apellido" required autoComplete="family-name" onChange={handleChange} />
                            </div>

                            <Input label="Correo Electrónico" name="email" type="email" placeholder="nombre@ejemplo.com" icon={<Mail />} required autoComplete="email" onChange={handleChange} />

                            <Input label="Teléfono (WhatsApp)" name="phoneNumber" type="tel" placeholder="+57 300 123 4567" icon={<Phone />} required autoComplete="tel" onChange={handleChange} />

                            <Input label="Contraseña" name="password" type="password" placeholder="Crear contraseña segura" icon={<Lock />} required autoComplete="new-password" onChange={handleChange} />

                            {role === Role.PSYCHOLOGIST && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-4 pt-4 border-t border-glass-border"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">
                                            Hoja de Vida (CV)
                                        </label>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                            className="w-full h-12 rounded-xl border border-input bg-background/50 px-4 text-sm focus:ring-2 focus:ring-secondary pt-2"
                                            required
                                        />
                                        <p className="text-xs text-foreground/50 mt-1 ml-1">
                                            Debes adjuntar tu Hoja de Vida, la cual debe incluir el Rethus.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700">
                                        ℹ️ Tu perfil pasará por un proceso de verificación manual antes de ser activado.
                                    </div>
                                </motion.div>
                            )}

                            <div className="pt-4">
                                <Button
                                    className={`w-full h-12 text-lg font-medium shadow-xl ${role === Role.PATIENT ? "shadow-primary/20 bg-primary" : "shadow-secondary/20 bg-secondary hover:bg-secondary/90"
                                        }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creando cuenta..." : "Comenzar ahora"}
                                </Button>
                                <p className="text-xs text-center text-foreground/50 mt-4">
                                    Al registrarte, aceptas nuestros <Link href="#" className="underline">Términos y Condiciones</Link> y <Link href="#" className="underline">Política de Privacidad</Link>.
                                </p>
                            </div>
                        </motion.form>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
