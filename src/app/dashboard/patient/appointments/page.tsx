"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, User, Clock, AlertTriangle } from "lucide-react";

// Mock data for appointments
const appointments = [
    {
        id: 1,
        psychologist: "Dra. Ana García",
        date: new Date(2023, 10, 15, 10, 0),
        status: "upcoming",
        type: "online",
        price: 80000
    },
    {
        id: 2,
        psychologist: "Dr. Carlos Rodríguez",
        date: new Date(2023, 9, 20, 14, 30),
        status: "completed",
        type: "online",
        price: 120000
    },
    {
        id: 3,
        psychologist: "Psic. Valentina Ruiz",
        date: new Date(2023, 9, 10, 11, 0),
        status: "cancelled",
        type: "online",
        price: 75000
    }
];

export default function AppointmentsPage() {
    const [filter, setFilter] = useState("all");

    const filteredAppointments = appointments.filter(app => {
        if (filter === "all") return true;
        return app.status === filter;
    });

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground">Mis Citas</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all" ? "bg-primary text-white" : "bg-secondary/10 text-foreground/70 hover:bg-secondary/20"}`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter("upcoming")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "upcoming" ? "bg-primary text-white" : "bg-secondary/10 text-foreground/70 hover:bg-secondary/20"}`}
                    >
                        Próximas
                    </button>
                    <button
                        onClick={() => setFilter("completed")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "completed" ? "bg-primary text-white" : "bg-secondary/10 text-foreground/70 hover:bg-secondary/20"}`}
                    >
                        Completadas
                    </button>
                </div>
            </header>

            <div className="grid gap-4">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-secondary/5 rounded-2xl border border-dashed border-glass-border">
                        <Calendar className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                        <p className="text-foreground/60">No hay citas en esta categoría.</p>
                    </div>
                ) : (
                    filteredAppointments.map(app => (
                        <div key={app.id} className="bg-white border border-glass-border p-6 rounded-2xl flex flex-col md:flex-row gap-6 md:items-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${app.status === "upcoming" ? "bg-emerald-100 text-emerald-700" :
                                        app.status === "completed" ? "bg-blue-100 text-blue-700" :
                                            "bg-red-100 text-red-700"
                                        }`}>
                                        {app.status === "upcoming" ? "Confirmada" :
                                            app.status === "completed" ? "Realizada" : "Cancelada"}
                                    </span>
                                    <span className="text-xs text-foreground/40 hidden md:inline">•</span>
                                    <span className="text-sm text-foreground/60">{app.type === "online" ? "Videollamada" : "Presencial"}</span>
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1">{app.psychologist}</h3>
                                <div className="flex items-center gap-4 text-sm text-foreground/60">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {format(app.date, "d 'de' MMMM, yyyy", { locale: es })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {format(app.date, "h:mm a")}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 justify-end border-t md:border-t-0 md:border-l border-glass-border pt-4 md:pt-0 md:pl-6">
                                {app.status === "upcoming" && (
                                    <>
                                        <button className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors">Cancelar</button>
                                        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                            Unirse a Sala
                                        </button>
                                    </>
                                )}
                                {app.status === "completed" && (
                                    <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/5">
                                        Calificar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
