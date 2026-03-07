"use client";

import { useEffect, useState } from "react";
import { psychologistService } from "@/services/psychologist.service";
import { Button } from "@/components/Button";
import {
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Trash2,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    CalendarCheck,
    Clock3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScheduleItem {
    dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
    startTime: string; // "HH:mm:ss"
    endTime: string; // "HH:mm:ss"
}

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function AgendaPage() {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("17:00");

    const [psychologistId, setPsychologistId] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const profile = await psychologistService.getMe();
            if (!profile) return;

            setPsychologistId(profile.id);
            console.log("Fetching schedule for ID:", profile.id);
            const data = await psychologistService.getSchedule(profile.id);
            console.log("Schedule data received:", data);

            if (data && Array.isArray(data)) {
                const mapped = data.map((s: any) => {
                    // Handle potential PascalCase from API (StartTime vs startTime)
                    const day = s.dayOfWeek ?? s.DayOfWeek;
                    const start = s.startTime ?? s.StartTime;
                    const end = s.endTime ?? s.EndTime;

                    return {
                        dayOfWeek: day,
                        startTime: typeof start === 'string' ? start.substring(0, 5) : "08:00",
                        endTime: typeof end === 'string' ? end.substring(0, 5) : "17:00"
                    };
                });
                console.log("Mapped schedules:", mapped);
                setSchedules(mapped.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)));
            }
        } catch (error) {
            console.error("Error loading schedule:", error);
            setMessage({ type: 'error', text: "Error al cargar la agenda." });
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchedules = () => {
        if (!psychologistId) return;
        if (selectedDays.length === 0) {
            setMessage({ type: 'error', text: "Selecciona al menos un día." });
            return;
        }

        if (startTime >= endTime) {
            setMessage({ type: 'error', text: "La hora de inicio debe ser estrictamente menor a la de fin." });
            return;
        }

        const conflicts: string[] = [];
        const newItemsToAdd: ScheduleItem[] = [];

        selectedDays.forEach(day => {
            // Check if this new range overlaps with any existing range for the same day
            const hasOverlap = schedules.some(existing => {
                if (existing.dayOfWeek !== day) return false;

                // Overlap logic: (StartA < EndB) and (EndA > StartB)
                return startTime < existing.endTime && endTime > existing.startTime;
            });

            if (hasOverlap) {
                conflicts.push(DAYS_ES[day]);
            } else {
                newItemsToAdd.push({
                    dayOfWeek: day,
                    startTime,
                    endTime
                });
            }
        });

        if (conflicts.length > 0) {
            setMessage({
                type: 'error',
                text: `Conflicto de horario detectado para: ${conflicts.join(", ")}. Por favor revisa los bloques existentes.`
            });
            return;
        }

        const updated = [...schedules, ...newItemsToAdd];
        setSchedules(updated.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)));
        setSelectedDays([]);
        setMessage({ type: 'success', text: "Horarios agregados correctamente." });
        setTimeout(() => setMessage(null), 3000);
    };

    const removeSchedule = (index: number) => {
        setSchedules(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            if (!psychologistId) return;
            await psychologistService.updateSchedule(psychologistId, schedules.map(s => ({
                ...s,
                startTime: s.startTime + ":00",
                endTime: s.endTime + ":00"
            })));
            setMessage({ type: 'success', text: "Agenda actualizada correctamente." });
            setTimeout(() => setMessage(null), 4000);
        } catch (error) {
            console.error("Error saving schedule:", error);
            setMessage({ type: 'error', text: "Error al guardar la agenda." });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-gray-500 font-medium">Cargando tu configuración de agenda...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Agenda</h1>
                    <p className="text-lg text-gray-500 mt-2">Configura tus horarios de atención semanal.</p>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-400 bg-white px-4 py-2 rounded-2xl border border-gray-100">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    <span>Año 2026</span>
                </div>
            </div>

            {/* Alert Message */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-100 shadow-green-100/50'
                            : 'bg-red-50 text-red-700 border-red-100 shadow-red-100/50'
                            }`}>
                        {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        <span className="font-medium text-sm">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Configuration Panel */}
                <div className="lg:col-span-5 space-y-8">
                    <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-8">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Plus className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Agregar Horarios</h2>
                        </div>

                        {/* Day Selector */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Selecciona los días</label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS_ES.map((day, index) => (
                                    <button
                                        key={day}
                                        onClick={() => toggleDay(index)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedDays.includes(index)
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                            : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Range Selector */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Hora Inicio</label>
                                <div className="relative group">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Hora Fin</label>
                                <div className="relative group">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleAddSchedules}
                            className="w-full h-14 rounded-2xl shadow-xl shadow-primary/10 group"
                        >
                            <span className="font-bold flex items-center gap-2">
                                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                                Agregar bloques a la lista
                            </span>
                        </Button>
                    </section>

                    {/* Summary Card */}
                    <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
                        <div className="relative z-10 space-y-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit">
                                <Clock3 className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold">Resumen Diario</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed">
                                Los bloques configurados se dividirán en sesiones de 45-60 minutos automáticamente para tus pacientes.
                            </p>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Schedule List */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Configuración Actual</h2>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 rounded-xl"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {isSaving ? "Guardando..." : "Guardar Agenda"}
                            </Button>
                        </div>

                        <div className="p-8 flex-1 overflow-y-auto">
                            {schedules.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Group by day would be better, but let's list for now */}
                                    {schedules.map((schedule, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={`${schedule.dayOfWeek}-${schedule.startTime}-${index}`}
                                            className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-gray-100/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100 group-hover:border-primary/20 group-hover:text-primary transition-all">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-tighter text-gray-400 group-hover:text-primary/60">{DAYS_ES[schedule.dayOfWeek].substring(0, 3)}</span>
                                                    <CalendarIcon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900">{DAYS_ES[schedule.dayOfWeek]}</span>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{schedule.startTime} - {schedule.endTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeSchedule(index)}
                                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6">
                                    <div className="p-6 bg-gray-50 rounded-[40px] border border-gray-100">
                                        <CalendarIcon className="h-12 w-12 text-gray-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-gray-900">Tu agenda está vacía</h3>
                                        <p className="text-gray-500 max-w-xs mx-auto">Agrega tus días y horarios de trabajo usando el panel de la izquierda.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
