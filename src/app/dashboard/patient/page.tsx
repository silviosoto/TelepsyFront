import Link from "next/link";
import { Button } from "@/components/Button";

export default function PatientDashboard() {
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
                        <span className="w-full bg-white py-2 px-4 rounded-lg text-center block">
                            Actualizar Perfil
                        </span>
                    </Link>
                </div>
            </div>

            {/* Recent Activity / Recommendations */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">Recomendados para ti</h2>
                    <Link href="/psychologists" className="text-sm text-primary hover:underline">Ver todos</Link>
                </div>

                {/* Simplified Psychologist Cards (Reusing simplified version or import component if extracted) */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placeholder for recommended psychologists */}
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
