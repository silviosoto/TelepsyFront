"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Star, MapPin, Calendar, ArrowRight, User, CheckCircle, Briefcase, Heart, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { cn } from "@/lib/utils";

import { psychologistService, PsychologistUI } from "@/services/psychologist.service";

const specialties = ["Todas", "Psicología Clínica", "Terapia de Pareja", "Psicología Infantil", "Neuropsicología"];

export default function PsychologistsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");
    const [psychologists, setPsychologists] = useState<PsychologistUI[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        const fetchPsychologists = async () => {
            setIsLoading(true);
            try {
                const data = await psychologistService.getVerifiedPsychologists();
                setPsychologists(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPsychologists();
    }, []);

    const filteredPsychologists = psychologists.filter(psy => {
        const fullName = `${psy.firstName} ${psy.lastName}`;
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            psy.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === "Todas" || psy.specialization.includes(selectedSpecialty);
        const isVerified = psy.isVerified === true;
        return matchesSearch && matchesSpecialty && isVerified;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredPsychologists.length / itemsPerPage);
    const paginatedPsychologists = filteredPsychologists.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedSpecialty]);

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            {/* Header / Search Section */}
            <section className="pt-32 pb-12 bg-secondary/5 border-b border-glass-border">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto text-center mb-10"
                    >
                        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                            Encuentra a tu especialista ideal
                        </h1>
                        <p className="text-lg text-foreground/70">
                            Explora perfiles verificados y agenda tu cita en minutos.
                        </p>
                    </motion.div>

                    <div className="bg-white p-4 rounded-2xl shadow-xl shadow-primary/5 border border-glass-border flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-foreground/40" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, especialidad o síntoma..."
                                className="w-full h-12 pl-12 pr-4 rounded-xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-foreground/40"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {specialties.map(spec => (
                                <button
                                    key={spec}
                                    onClick={() => setSelectedSpecialty(spec)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedSpecialty === spec
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-secondary/10 text-foreground/70 hover:bg-secondary/20"
                                        }`}
                                >
                                    {spec}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Grid */}
            <section className="py-12 bg-background">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center mb-8">
                        <p className="text-foreground/60">
                            Mostrando <span className="font-bold text-foreground">{filteredPsychologists.length}</span> especialistas
                        </p>
                        <div className="flex items-center gap-2 text-sm text-primary font-medium cursor-pointer">
                            <Filter className="w-4 h-4" /> Filtros Avanzados
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-96 rounded-2xl bg-secondary/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                <AnimatePresence>
                                    {paginatedPsychologists.map((psy, index) => (
                                        <motion.div
                                            key={psy.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group"
                                        >
                                            <div className="premium-card h-full bg-white border border-glass-border hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 flex flex-col overflow-hidden relative">

                                                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                                    {psy.isVerified && (
                                                        <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> Verificado
                                                        </div>
                                                    )}
                                                    {psy.available && (
                                                        <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Disponible
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-6 pb-0 flex gap-4">
                                                    <div className="w-20 h-20 rounded-2xl bg-secondary/20 flex-shrink-0 relative overflow-hidden">
                                                        {psy.profilePicture ? (
                                                            <Image
                                                                src={psy.profilePicture}
                                                                alt={`${psy.firstName} ${psy.lastName}`}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center text-primary font-bold text-2xl">
                                                                {psy.firstName[0]}{psy.lastName[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{psy.firstName} {psy.lastName}</h3>
                                                        <p className="text-sm text-foreground/60 mb-2">{psy.specialization}</p>
                                                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                                            <Star className="w-4 h-4 fill-current" />
                                                            {psy.rating} <span className="text-foreground/40 font-normal">({psy.reviews})</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 space-y-4 flex-1">
                                                    <div className="flex flex-wrap gap-2">
                                                        {psy.tags.map(tag => (
                                                            <span key={tag} className="text-xs bg-secondary/10 text-foreground/70 px-2 py-1 rounded-md">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                                                        <Briefcase className="w-4 h-4" />
                                                        <span>{psy.experience} años de experiencia</span>
                                                    </div>

                                                    <div className="pt-4 border-t border-glass-border">
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3" /> Servicios relacionados
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(() => {
                                                                const allServices = Array.from(new Set([
                                                                    psy.specialization,
                                                                    ...psy.specialties,
                                                                    ...psy.services
                                                                ])).filter(s => s && s !== 'Pendiente');

                                                                if (allServices.length > 0) {
                                                                    return (
                                                                        <>
                                                                            {allServices.slice(0, 4).map(item => (
                                                                                <span key={item} className="text-[10px] bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full font-medium">
                                                                                    {item}
                                                                                </span>
                                                                            ))}
                                                                            {allServices.length > 4 && (
                                                                                <span className="text-[10px] text-foreground/40 font-medium self-center">+{allServices.length - 4} más</span>
                                                                            )}
                                                                        </>
                                                                    );
                                                                }
                                                                return <span className="text-[10px] text-foreground/40 italic">Enfoque clínico integral</span>;
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-secondary/5 border-t border-glass-border">
                                                    <Link href={`/psychologists/${psy.id}`} className="w-full">
                                                        <Button className="w-full rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                                                            Ver Perfil
                                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 h-9"
                                    >
                                        Anterior
                                    </Button>

                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${currentPage === page
                                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                                    : "bg-transparent text-foreground/60 hover:bg-secondary/10"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 h-9"
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {!isLoading && filteredPsychologists.length === 0 && (
                        <div className="text-center py-20 opacity-60">
                            <Search className="w-16 h-16 mx-auto mb-4 text-foreground/20" />
                            <h3 className="text-xl font-bold text-foreground">No encontramos coincidencias</h3>
                            <p>Intenta con otros términos o filtros.</p>
                            <button
                                onClick={() => { setSearchTerm(""); setSelectedSpecialty("Todas") }}
                                className="mt-4 text-primary hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}

