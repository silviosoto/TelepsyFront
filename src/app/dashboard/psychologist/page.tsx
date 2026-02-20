"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    Users,
    Briefcase,
    TrendingUp,
    ArrowRight,
    CheckCircle2,
    Bell,
    CalendarDays
} from "lucide-react";
import { psychologistService, PsychologistProfileUI } from "@/services/psychologist.service";

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface ScheduleItem {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export default function PsychologistDashboard() {
    const [profile, setProfile] = useState<PsychologistProfileUI | null>(null);
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedViewDate, setSelectedViewDate] = useState<number>(new Date().getDay());

    const PSYCHOLOGIST_ID = 1; // Demo ID

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const [profileData, scheduleData] = await Promise.all([
                    psychologistService.getPsychologistById(PSYCHOLOGIST_ID),
                    psychologistService.getSchedule(PSYCHOLOGIST_ID)
                ]);

                setProfile(profileData);

                if (scheduleData && Array.isArray(scheduleData)) {
                    const mapped = scheduleData.map((s: any) => ({
                        dayOfWeek: s.dayOfWeek ?? s.DayOfWeek,
                        startTime: typeof (s.startTime ?? s.StartTime) === 'string' ? (s.startTime ?? s.StartTime).substring(0, 5) : "08:00",
                        endTime: typeof (s.endTime ?? s.EndTime) === 'string' ? (s.endTime ?? s.EndTime).substring(0, 5) : "17:00"
                    }));
                    setSchedules(mapped);
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const dailySchedules = schedules.filter(s => s.dayOfWeek === selectedViewDate);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold text-foreground"
                    >
                        ¡Hola, Dr. {profile?.lastName || 'Psicólogo'}! 👋
                    </motion.h1>
                    <p className="text-foreground/60 mt-1">Aquí tienes un resumen de tu actividad para hoy.</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-2 bg-white rounded-xl border border-glass-border shadow-sm hover:bg-secondary/5 transition-all relative">
                        <Bell className="w-5 h-5 text-foreground/60" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                    </button>
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary">
                        {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Citas Hoy", value: "4", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pacientes Activos", value: "28", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Sesiones Realizadas", value: "156", icon: Briefcase, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Ingresos Mes", value: "$4.200", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-glass-border shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <h3 className="text-2xl font-bold mt-4 text-foreground">{stat.value}</h3>
                        <p className="text-sm text-foreground/50 font-medium">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Agenda View Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-glass-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-glass-border flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-primary" />
                                Horarios Disponibles
                            </h3>
                            <div className="flex gap-2">
                                <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                                    Configurado
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Days Selector - Design from profile page */}
                            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                                {DAYS_ES.map((day, i) => {
                                    const isSelected = selectedViewDate === i;
                                    const hasSchedule = schedules.some(s => s.dayOfWeek === i);

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedViewDate(i)}
                                            className={`flex flex-col items-center justify-center min-w-[4.5rem] p-3 rounded-2xl border transition-all relative ${isSelected
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105"
                                                    : "bg-secondary/5 border-transparent text-foreground/60 hover:bg-secondary/10"
                                                }`}
                                        >
                                            <span className="text-[10px] uppercase font-bold opacity-80">{day.substring(0, 3)}</span>
                                            <span className="text-lg font-bold">{day === DAYS_ES[new Date().getDay()] ? "Hoy" : day.substring(0, 1)}</span>

                                            {hasSchedule && !isSelected && (
                                                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time Slots - Design from profile page */}
                            <div>
                                <h4 className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-4">
                                    Bloques de disponibilidad para el {DAYS_ES[selectedViewDate]}
                                </h4>

                                {dailySchedules.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {dailySchedules.map((slot, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                key={i}
                                                className="flex items-center gap-3 p-4 bg-secondary/5 border border-glass-border rounded-2xl group hover:border-primary/30 transition-all hover:bg-white hover:shadow-sm"
                                            >
                                                <div className="p-2 rounded-xl bg-white text-primary shadow-sm">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-foreground/30 uppercase tracking-tighter">Turno {i + 1}</p>
                                                    <p className="text-sm font-bold text-foreground">{slot.startTime} - {slot.endTime}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-secondary/5 border-2 border-dashed border-glass-border rounded-3xl p-12 text-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <Calendar className="w-8 h-8 text-foreground/20" />
                                        </div>
                                        <p className="text-foreground/40 font-medium">No hay horarios configurados para este día.</p>
                                        <button
                                            onClick={() => window.location.href = '/dashboard/psychologist/agenda'}
                                            className="text-primary font-bold text-sm mt-2 hover:underline inline-flex items-center gap-1"
                                        >
                                            Configurar mi agenda <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Patients Placeholder */}
                    <div className="bg-white rounded-3xl border border-glass-border shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Citas Próximas</h3>
                            <button className="text-primary text-sm font-bold hover:underline">Ver todas</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: "Sofía Rodríguez", time: "14:00", type: "Terapia Individual", status: "Confirmado" },
                                { name: "Marco Velásquez", time: "15:30", type: "Terapia de Pareja", status: "Pendiente" }
                            ].map((apt, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-secondary/5 rounded-2xl border border-glass-border group hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-primary">
                                            {apt.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">{apt.name}</h4>
                                            <p className="text-xs text-foreground/40">{apt.type} • {apt.time}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${apt.status === 'Confirmado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Stats & Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-primary/20">
                        <h3 className="font-bold text-xl mb-2">Tu Perfil está al 85%</h3>
                        <p className="text-white/70 text-sm mb-4">Completa tu información profesional para atraer a más pacientes.</p>
                        <div className="w-full bg-white/20 h-2 rounded-full mb-6">
                            <div className="bg-white h-full rounded-full w-[85%]"></div>
                        </div>
                        <button className="w-full py-3 bg-white text-primary font-bold rounded-2xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
                            Completar Perfil <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-glass-border shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 text-center">Resumen Semanal</h3>
                        <div className="flex justify-center items-end gap-3 h-32 px-4">
                            {[40, 60, 45, 90, 65, 30, 20].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        className={`w-full rounded-t-lg transition-all ${i === 3 ? 'bg-primary' : 'bg-secondary/20'}`}
                                    ></motion.div>
                                    <span className="text-[10px] font-bold text-foreground/30">{["L", "M", "M", "J", "V", "S", "D"][i]}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-glass-border text-center">
                            <p className="text-2xl font-bold">12.5h</p>
                            <p className="text-xs text-foreground/40 font-medium uppercase tracking-widest">Tiempo en Sesiones</p>
                        </div>
                    </div>

                    <div className="bg-secondary/5 rounded-3xl p-6 border border-glass-border">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <h3 className="font-bold">Tips MindCare</h3>
                        </div>
                        <p className="text-sm text-foreground/60 italic">
                            "Mantener tus horarios actualizados ayuda a reducir las cancelaciones de último minuto."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
