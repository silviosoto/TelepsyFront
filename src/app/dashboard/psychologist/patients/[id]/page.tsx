"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    User, Mail, Phone, Calendar, ArrowLeft,
    MessageSquare, FileText, CheckCircle, Clock,
    Activity, Shield, MapPin, Cake, Heart
} from "lucide-react";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import Image from "next/image";

// Placeholder for Patient Service - we'll define a basic structure here
interface DetailedPatient {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    birthDate?: string;
    gender?: string;
    city?: string;
    bio?: string;
    profilePicturePath?: string;
    medicalHistory?: string;
    totalSessions: number;
    nextSession?: string;
    appointments: any[];
}

export default function PatientProfileDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<DetailedPatient | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, we would fetch this from the API
        // For now, let's simulate the fetch with a delay
        const fetchPatientDetail = async () => {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 800));

                // MOCK DATA
                setPatient({
                    id: Number(params.id),
                    fullName: "Paciente en Simulación",
                    email: "paciente@ejemplo.com",
                    phone: "+57 300 123 4567",
                    birthDate: "1992-05-15",
                    gender: "Femenino",
                    city: "Bogotá, Colombia",
                    bio: "Paciente presenta cuadros leves de ansiedad relacionados con el entorno laboral. Enfoque cognitivo-conductual recomendado.",
                    profilePicturePath: "",
                    medicalHistory: "Sin antecedentes patológicos de importancia. Alérgica a la penicilina.",
                    totalSessions: 4,
                    nextSession: new Date(Date.now() + 86400000 * 2).toISOString(),
                    appointments: [
                        { id: 1, date: "2024-02-15", status: "Completed", type: "Terapia Individual" },
                        { id: 2, date: "2024-02-08", status: "Completed", type: "Terapia Individual" },
                        { id: 3, date: "2024-02-01", status: "Completed", type: "Terapia Individual" },
                    ]
                });
            } catch (error) {
                toast.error("Error al cargar el detalle del paciente");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientDetail();
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!patient) return null;

    return (
        <div className="space-y-8 pb-20">
            {/* Nav & Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors font-medium group"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Volver a Mis Pacientes
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Summary Card */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-glass-border text-center overflow-hidden relative"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/5 to-secondary/5 -z-10" />

                        <div className="flex justify-center mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-secondary/20 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-4xl font-bold text-primary">
                                {patient.profilePicturePath ? (
                                    <Image src={patient.profilePicturePath} alt={patient.fullName} fill className="object-cover" />
                                ) : (
                                    patient.fullName.split(' ').map(n => n[0]).join('')
                                )}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-foreground mb-2">{patient.fullName}</h2>
                        <div className="flex justify-center gap-2 mb-8">
                            <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Activo</span>
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{patient.totalSessions} Sesiones</span>
                        </div>

                        <div className="space-y-4 text-left border-t border-glass-border pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-primary">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Email</p>
                                    <p className="text-sm font-medium text-foreground">{patient.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-primary">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Teléfono</p>
                                    <p className="text-sm font-medium text-foreground">{patient.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-primary">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Ubicación</p>
                                    <p className="text-sm font-medium text-foreground">{patient.city}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <Button className="w-full rounded-2xl h-14 font-bold gap-2">
                        <MessageSquare className="w-5 h-5" /> Enviar Mensaje
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/psychologist/patients/${params.id}/notes`)}
                        variant="outline"
                        className="w-full rounded-2xl h-14 font-bold gap-2 border-primary/20 text-primary hover:bg-primary/5">
                        <FileText className="w-5 h-5" /> Notas de Sesión
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/psychologist/patients/${params.id}/history`)}
                        variant="outline"
                        className="w-full rounded-2xl h-14 font-bold gap-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5">
                        <Activity className="w-5 h-5" /> Historia Clínica
                    </Button>
                </div>

                {/* Right: Detailed Info & History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-glass-border flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Próxima Cita</p>
                                <p className="text-lg font-bold text-foreground">
                                    {patient.nextSession ? new Date(patient.nextSession).toLocaleDateString() : 'No programada'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-glass-border flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Estado Clínico</p>
                                <p className="text-lg font-bold text-foreground">Estable</p>
                            </div>
                        </div>
                    </div>

                    {/* Bio & Medical Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-glass-border"
                    >
                        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> Notas y Antecedentes
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-2">Resumen de Seguimiento</h4>
                                <p className="text-foreground/70 leading-relaxed bg-secondary/5 p-4 rounded-2xl">
                                    {patient.bio}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-2">Historia Médica / Alergias</h4>
                                <p className="text-foreground/70 leading-relaxed bg-secondary/5 p-4 rounded-2xl">
                                    {patient.medicalHistory}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Appointment History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-glass-border"
                    >
                        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" /> Historial de Sesiones
                        </h3>

                        <div className="space-y-4">
                            {patient.appointments.map((apt) => (
                                <div key={apt.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/5 transition-colors border border-glass-border/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-foreground/40">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{apt.type}</p>
                                            <p className="text-xs text-foreground/40 font-medium">{new Date(apt.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">Completada</span>
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
