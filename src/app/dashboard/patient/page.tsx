"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { appointmentService } from "@/services/appointment.service";
import { toast } from "sonner";
import { Package, CalendarCheck2 } from "lucide-react";

export default function PatientDashboard() {
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoadingPackages, setIsLoadingPackages] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const data = await appointmentService.getMyPackages();
                setPackages(data);
            } catch (error) {
                console.error("Error al obtener paquetes activos:", error);
            } finally {
                setIsLoadingPackages(false);
            }
        };

        fetchPackages();
    }, []);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Hola, Paciente</h1>
                    <p className="text-foreground/60">¿Cómo te sientes hoy?</p>
                </div>
            </header>

            {/* Quick Actions / Status */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="premium-card bg-white shadow-sm border border-glass-border p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Próxima Sesión</h3>
                        <p className="text-sm text-foreground/60">Aún no tienes citas agendadas.</p>
                    </div>
                    <Link href="/psychologists" className="mt-4 text-primary text-sm font-medium hover:underline">
                        Buscar especialista &rarr;
                    </Link>
                </div>

                <div className="premium-card bg-primary/5 border border-primary/10 p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Mi Bienestar</h3>
                        <p className="text-sm text-foreground/60">Completa tu perfil para recibir recomendaciones.</p>
                    </div>
                    <Link href="/dashboard/patient/profile" className="mt-4 text-primary text-sm font-medium hover:underline">
                        <span className="w-full bg-white py-2 px-4 rounded-lg text-center block shadow-sm border border-primary/10">
                            Actualizar Perfil
                        </span>
                    </Link>
                </div>
            </div>

            {/* Mis Paquetes Activos */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" /> Mis Paquetes Activos
                    </h2>
                </div>

                {isLoadingPackages ? (
                    <div className="flex justify-center p-8">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : packages.length === 0 ? (
                    <div className="bg-white border border-glass-border rounded-xl p-6 text-center">
                        <p className="text-foreground/60 text-sm mb-4">No tienes paquetes de sesiones activos.</p>
                        <Link href="/psychologists">
                            <Button size="sm">Explorar Especialistas</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {packages.map((pkg) => {
                            const remaining = pkg.totalSessions - pkg.usedSessions;
                            const percentage = (pkg.usedSessions / pkg.totalSessions) * 100;
                            
                            return (
                                <div key={pkg.id} className="bg-white border border-glass-border rounded-xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -z-10" />
                                    
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-lg text-foreground">{pkg.psychologistName}</h4>
                                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">
                                                {remaining} disponibles
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground/60">{pkg.therapyName}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium text-foreground/70">
                                            <span>Progreso del Paquete</span>
                                            <span>{pkg.usedSessions} / {pkg.totalSessions} Sesiones</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Link href={`/psychologists/${pkg.psychologistId}`} className="mt-2 text-primary hover:underline text-sm font-bold flex items-center gap-1 group w-max">
                                        <CalendarCheck2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Agendar Siguiente Sesión
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Recent Activity / Recommendations */}
            <section className="pt-4 border-t border-glass-border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">Recomendados para ti</h2>
                    <Link href="/psychologists" className="text-sm text-primary hover:underline">Ver todos</Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-glass-border rounded-xl p-4 flex gap-4 items-center">
                        <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center text-secondary font-bold">
                            AP
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground">Ana Pérez</h4>
                            <p className="text-xs text-foreground/60">Psicología Clínica</p>
                        </div>
                        <Button size="sm" variant="ghost" className="ml-auto">Ver</Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
