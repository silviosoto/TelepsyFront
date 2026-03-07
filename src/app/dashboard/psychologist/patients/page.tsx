"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Mail, Phone, Calendar, ChevronRight, Users, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/Button";
import { psychologistService, PatientListItemUI } from "@/services/psychologist.service";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function MyPatientsPage() {
    const [patients, setPatients] = useState<PatientListItemUI[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPatientsData = async () => {
            try {
                // In this dashboard we assume the psychologist is logged in.
                // We'll try to find the ID or use ID 1 for testing.
                let psychologistId = 1;

                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    const psyProfile = await psychologistService.getPsychologistByUserId(user.id);
                    if (psyProfile) psychologistId = psyProfile.id;
                }

                const data = await psychologistService.getPatients(psychologistId);
                setPatients(data);
            } catch (error) {
                console.error("Failed to fetch patients", error);
                toast.error("Error al cargar la lista de pacientes");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientsData();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">Mis Pacientes</h1>
                    <p className="text-foreground/60">Gestiona y realiza seguimiento a tus pacientes activos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-glass-border flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Total Pacientes</p>
                            <p className="text-lg font-bold text-foreground leading-tight">{patients.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-glass-border">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        className="w-full pl-12 pr-4 py-3 bg-secondary/5 border-transparent focus:bg-white focus:border-primary/30 rounded-2xl transition-all outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="w-full md:w-auto rounded-2xl gap-2 font-bold py-3">
                    <Filter className="w-4 h-4" /> Filtros
                </Button>
            </div>

            {/* Patients List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-glass-border" />
                    ))}
                </div>
            ) : filteredPatients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredPatients.map((patient, index) => (
                            <motion.div
                                key={patient.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 border border-glass-border transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-secondary/20 relative overflow-hidden flex items-center justify-center text-xl font-bold text-primary">
                                            {patient.profilePicturePath ? (
                                                <Image
                                                    src={patient.profilePicturePath}
                                                    alt={patient.fullName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                patient.fullName.split(' ').map(n => n[0]).join('')
                                            )}
                                        </div>
                                        <button className="p-2 text-foreground/20 hover:text-primary transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                        {patient.fullName}
                                    </h3>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                                            <Mail className="w-4 h-4" />
                                            {patient.email || "Sin correo"}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                                            <Phone className="w-4 h-4" />
                                            {patient.phone || "Sin teléfono"}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/5 rounded-2xl mb-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Sesiones</p>
                                            <p className="text-sm font-bold text-foreground">{patient.sessionCount}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Última Cita</p>
                                            <p className="text-sm font-bold text-foreground">
                                                {patient.lastAppointmentDate ? new Date(patient.lastAppointmentDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/dashboard/psychologist/patients/${patient.id}`} className="w-full">
                                    <Button className="w-full rounded-2xl font-bold h-12 gap-2 group/btn">
                                        Ver Perfil <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-glass-border"
                >
                    <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-10 h-10 text-foreground/20" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No tienes pacientes registrados</h3>
                    <p className="text-foreground/60">Los pacientes aparecerán aquí después de su primera cita confirmada.</p>
                </motion.div>
            )}
        </div>
    );
}
