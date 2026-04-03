"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Calendar, Clock, Award, BookOpen, MessageCircle, CheckCircle, Shield, ArrowLeft, ChevronDown, Check, Package } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/Button";
import { psychologistService, PsychologistProfileUI } from "@/services/psychologist.service";
import { appointmentService } from "@/services/appointment.service";
import { toast } from "sonner";

interface ScheduleItem {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export function ProfileContent() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [psychologist, setPsychologist] = useState<PsychologistProfileUI | null>(null);
    const [services, setServices] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [allSchedules, setAllSchedules] = useState<ScheduleItem[]>([]);
    const [dynamicTimeSlots, setDynamicTimeSlots] = useState<string[]>([]);
    const [isBooking, setIsBooking] = useState(false);
    const [packageSessions, setPackageSessions] = useState<number | null>(null);
    const [patientPackages, setPatientPackages] = useState<any[]>([]);

    useEffect(() => {
        const fetchPatientPackages = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const packages = await appointmentService.getMyPackages();
                    setPatientPackages(packages);
                } catch (e) {
                    console.error("No se pudieron cargar los paquetes del paciente", e);
                }
            }
        };
        fetchPatientPackages();
    }, []);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const [profileData, servicesData, scheduleData] = await Promise.all([
                    psychologistService.getPsychologistById(id),
                    psychologistService.getServices(id),
                    psychologistService.getSchedule(id)
                ]);

                setPsychologist(profileData);

                const activeServices = (servicesData as any[] || []).filter(s => s.isActive);
                setServices(activeServices);

                if (activeServices.length > 0) {
                    setSelectedService(activeServices[0]);
                }

                if (scheduleData && Array.isArray(scheduleData)) {
                    const mapped = scheduleData.map((s: any) => ({
                        dayOfWeek: s.dayOfWeek ?? s.DayOfWeek,
                        startTime: typeof (s.startTime ?? s.StartTime) === 'string' ? (s.startTime ?? s.StartTime).substring(0, 5) : "08:00",
                        endTime: typeof (s.endTime ?? s.EndTime) === 'string' ? (s.endTime ?? s.EndTime).substring(0, 5) : "17:00"
                    }));
                    setAllSchedules(mapped);
                }
            } catch (error) {
                console.error("Failed to fetch psychologist profile or services", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [id]);

    useEffect(() => {
        const day = selectedDate.getDay();
        const currentDaySchedules = allSchedules.filter(s => s.dayOfWeek === day);

        const slots: string[] = [];
        currentDaySchedules.forEach(schedule => {
            let startHour = parseInt(schedule.startTime.split(':')[0]);
            const endHour = parseInt(schedule.endTime.split(':')[0]);

            while (startHour < endHour) {
                const formattedHour = `${startHour.toString().padStart(2, '0')}:00`;
                slots.push(formattedHour);
                startHour++;
            }
        });

        setDynamicTimeSlots(slots.sort());
        setSelectedTime(null);
    }, [selectedDate, allSchedules]);

    const handleBooking = async () => {
        if (!selectedService || !selectedTime) return;

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Debes iniciar sesión para reservar una cita");
            router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
            return;
        }

        setIsBooking(true);
        try {
            const [hours, minutes] = selectedTime.split(':');
            const scheduledTime = new Date(selectedDate);
            scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const result = await appointmentService.initiateBooking({
                psychologistId: id,
                therapyId: selectedService.therapyId,
                scheduledTime: scheduledTime.toISOString(),
                packageSessions: packageSessions
            });

            if (result && result.appointmentId) {
                toast.success("¡Reserva preparada con éxito! Redirigiendo al pago seguro...");
                setTimeout(() => {
                    router.push(`/appointments/checkout/${result.appointmentId}`);
                }, 1500);
            }
        } catch (error: any) {
            console.error("Booking error:", error);
            toast.error(error.message || "Error al iniciar la reserva");
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!psychologist) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-2xl font-bold mb-4">Psicólogo no encontrado</h2>
                    <Button onClick={() => router.back()}>Volver al listado</Button>
                </div>
            </div>
        );
    }

    const availableDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    const activePackageForSelectedService = patientPackages.find(p => p.therapyId === selectedService?.therapyId && p.psychologistId === id);

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <div className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-foreground/60 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver a resultados
                </button>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5 border border-glass-border flex flex-col md:flex-row gap-6 items-start"
                        >
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-secondary/20 flex-shrink-0 relative overflow-hidden flex items-center justify-center text-4xl text-primary font-bold">
                                {psychologist.profilePicture ? (
                                    <Image
                                        src={psychologist.profilePicture}
                                        alt={`${psychologist.firstName} ${psychologist.lastName}`}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <>{psychologist.firstName[0]}{psychologist.lastName[0]}</>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {psychologist.isVerified ? (
                                        <span className="bg-emerald-500/10 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Verificado
                                        </span>
                                    ) : (
                                        <span className="bg-amber-500/10 text-amber-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Pendiente de Validación
                                        </span>
                                    )}
                                    <span className="bg-secondary/10 text-foreground/70 text-xs font-bold px-3 py-1 rounded-full">
                                        {psychologist.experience} años exp.
                                    </span>
                                </div>

                                <h1 className="text-3xl font-bold text-foreground mb-3">
                                    {psychologist.firstName} {psychologist.lastName}
                                </h1>

                                <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-4">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {psychologist.city}
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold" aria-label={`Puntuación de ${psychologist.rating}`}>
                                        <Star className="w-4 h-4 fill-current" />
                                        {psychologist.rating} <span className="text-foreground/40 font-normal">({psychologist.reviews} reseñas)</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {psychologist.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-secondary/5 border border-glass-border px-2 py-1 rounded-md text-foreground/70">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.article>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-glass-border"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-primary" />
                                Sobre mí
                            </h2>
                            <p className="text-foreground/80 leading-relaxed mb-6">
                                {psychologist.bio}
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-sm text-foreground/50 uppercase tracking-wider mb-3">Formación</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <BookOpen className="w-3 h-3 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{psychologist.university}</p>
                                                <p className="text-sm text-foreground/60">Licenciatura en Psicología</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground/50 uppercase tracking-wider mb-3">Especialidades</h3>
                                    <ul className="space-y-2">
                                        {psychologist.tags.filter(tag => tag !== psychologist.city && tag !== psychologist.specialization).map((tag, index) => (
                                            <li key={index} className="flex items-center gap-2 text-foreground/80">
                                                <CheckCircle className="w-4 h-4 text-primary" />
                                                {tag}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.section>

                        <section
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-glass-border"
                        >
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-primary" />
                                Opiniones de pacientes
                            </h2>

                            <div className="space-y-6">
                                {[1, 2].map((review) => (
                                    <div key={review} className="border-b border-glass-border last:border-0 pb-6 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-xs">
                                                    P{review}
                                                </div>
                                                <span className="font-bold text-sm">Paciente Verificado</span>
                                            </div>
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-current" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/70 italic">
                                            "Excelente profesional, me ayudó mucho a entender mis procesos y mejorar mi calidad de vida. Muy recomendado."
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="lg:col-span-1">
                        <div className="sticky top-28 space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl p-6 shadow-2xl shadow-primary/10 border border-glass-border"
                            >
                                <div className="space-y-4 mb-6 pb-6 border-b border-glass-border">
                                    <span className="text-foreground/60 font-medium text-sm">Escoge el servicio</span>

                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className={`w-full bg-secondary/5 border border-glass-border rounded-2xl px-5 py-4 flex items-center justify-between transition-all hover:bg-secondary/10 group ${isDropdownOpen ? 'ring-2 ring-primary/20 border-primary/50' : ''}`}
                                            aria-expanded={isDropdownOpen}
                                        >
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-0.5">Servicio Seleccionado</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">{selectedService ? selectedService.therapyName : 'Seleccionar...'}</span>
                                                    {selectedService && (
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                                            ${selectedService.rate.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronDown className={`w-5 h-5 text-foreground/40 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="absolute z-[60] mt-2 w-full bg-white rounded-2xl shadow-2xl shadow-primary/20 border border-glass-border overflow-hidden"
                                                >
                                                    <div className="p-2 max-h-64 overflow-y-auto scrollbar-hide">
                                                        {services.map((service) => (
                                                            <button
                                                                key={service.therapyId}
                                                                onClick={() => {
                                                                    setSelectedService(service);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all hover:bg-primary/5 group ${selectedService?.therapyId === service.therapyId ? 'bg-primary/5' : ''}`}
                                                            >
                                                                <div className="text-left">
                                                                    <p className={`font-bold text-sm ${selectedService?.therapyId === service.therapyId ? 'text-primary' : 'text-foreground'}`}>
                                                                        {service.therapyName}
                                                                    </p>
                                                                    <p className="text-xs text-foreground/50 line-clamp-1">{service.description}</p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-extrabold text-sm text-primary">
                                                                        ${service.rate.toLocaleString()}
                                                                    </span>
                                                                    {selectedService?.therapyId === service.therapyId && (
                                                                        <Check className="w-4 h-4 text-primary" />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {activePackageForSelectedService ? (
                                    <div className="space-y-3 pt-4 border-t border-glass-border">
                                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                                            <p className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                                                <Package className="w-4 h-4" /> Paquete Activo Detectado
                                            </p>
                                            <p className="text-xs text-foreground/70">
                                                Tienes un paquete de {activePackageForSelectedService.totalSessions} sesiones disponible. Al agendar, se descontará automáticamente 1 sesión ({activePackageForSelectedService.usedSessions}/{activePackageForSelectedService.totalSessions} usadas).
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pt-4 border-t border-glass-border">
                                        <span className="text-foreground/60 font-medium text-sm">Modalidad (Opcional)</span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setPackageSessions(null)}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${packageSessions === null ? 'bg-primary text-white' : 'bg-secondary/5 text-foreground/70 hover:bg-secondary/10'}`}
                                            >
                                                1 Sesión
                                            </button>
                                            <button
                                                onClick={() => setPackageSessions(4)}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${packageSessions === 4 ? 'bg-primary text-white' : 'bg-secondary/5 text-foreground/70 hover:bg-secondary/10'}`}
                                            >
                                                Paquete 4 Sesiones
                                            </button>
                                            <button
                                                onClick={() => setPackageSessions(8)}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${packageSessions === 8 ? 'bg-primary text-white' : 'bg-secondary/5 text-foreground/70 hover:bg-secondary/10'}`}
                                            >
                                                Paquete 8 Sesiones
                                            </button>
                                            <button
                                                onClick={() => setPackageSessions(12)}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${packageSessions === 12 ? 'bg-primary text-white' : 'bg-secondary/5 text-foreground/70 hover:bg-secondary/10'}`}
                                            >
                                                Paquete 12 Sesiones
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6 pt-4 border-t border-glass-border">
                                    <div>
                                        <label className="block text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary" /> Selecciona un día
                                        </label>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {availableDates.map((date, i) => {
                                                const isSelected = selectedDate.getDate() === date.getDate();
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedDate(date)}
                                                        className={`flex flex-col items-center justify-center min-w-[4rem] h-16 rounded-xl border transition-all ${isSelected
                                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105"
                                                            : "bg-secondary/5 border-transparent text-foreground/60 hover:bg-secondary/10"
                                                            }`}
                                                    >
                                                        <span className="text-xs uppercase font-bold">
                                                            {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                                                        </span>
                                                        <span className="text-lg font-bold">
                                                            {date.getDate()}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary" /> Horarios disponibles
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {dynamicTimeSlots.length > 0 ? dynamicTimeSlots.map((time) => {
                                                const isToday = selectedDate.toDateString() === new Date().toDateString();
                                                const slotHour = parseInt(time.split(':')[0]);
                                                const currentHour = new Date().getHours();
                                                const isPast = isToday && slotHour <= currentHour;

                                                return (
                                                    <button
                                                        key={time}
                                                        disabled={isPast}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${selectedTime === time
                                                            ? "bg-primary text-white shadow-md"
                                                            : isPast
                                                                ? "bg-secondary/5 text-foreground/20 cursor-not-allowed opacity-50"
                                                                : "bg-secondary/5 text-foreground/70 hover:bg-secondary/10"
                                                            }`}
                                                    >
                                                        {time}
                                                    </button>
                                                );
                                            }) : (
                                                <div className="col-span-2 text-center py-4 bg-secondary/5 rounded-xl border border-glass-border">
                                                    <p className="text-xs font-bold text-foreground/40 italic">No hay horarios disponibles</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-12 text-lg font-bold rounded-xl mt-4"
                                        disabled={!selectedTime || !selectedService || isBooking || !psychologist?.isVerified}
                                        onClick={handleBooking}
                                        isLoading={isBooking}
                                    >
                                        {!psychologist?.isVerified ? "No Disponible" : isBooking ? "Procesando..." : "Reservar Cita"}
                                    </Button>

                                    {psychologist?.isVerified && (
                                        <p className="text-xs text-center text-foreground/40 mt-4">
                                            No se cobrará nada hasta confirmar la reserva.
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </aside>
                </div>
            </div >

            <Footer />
        </main >
    );
}

function UserIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
