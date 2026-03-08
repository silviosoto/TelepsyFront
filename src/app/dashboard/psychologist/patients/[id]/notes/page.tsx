"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Save, ArrowLeft, History, PlusCircle, Calendar, Edit2, CheckCircle, Info
} from "lucide-react";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import { PsychologyNote, getPsychologyNotes, createPsychologyNote, updatePsychologyNote } from "@/services/psychology-notes.service";

export default function PsychologyNotesPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = Number(params.id);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [notes, setNotes] = useState<PsychologyNote[]>([]);
    const [viewMode, setViewMode] = useState<"list" | "form">("list");
    const [currentNote, setCurrentNote] = useState<Partial<PsychologyNote>>({});

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const token = localStorage.getItem("token") || "";
                const data = await getPsychologyNotes(patientId, token);
                setNotes(data || []);
            } catch (error) {
                console.error("Error fetching notes:", error);
                toast.error("Error al cargar las notas de sesión");
            } finally {
                setIsLoading(false);
            }
        };

        if (patientId) fetchNotes();
    }, [patientId]);

    const handleNewNote = () => {
        setCurrentNote({
            patientId,
            sessionNumber: notes.length + 1,
            reasonForSession: "",
            evolution: "",
            interventions: "",
            therapeuticPlan: "",
            professionalSignature: ""
        });
        setViewMode("form");
    };

    const handleEditNote = (note: PsychologyNote) => {
        setCurrentNote(note);
        setViewMode("form");
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentNote(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!currentNote.sessionNumber || !currentNote.reasonForSession) {
            toast.error("El número de sesión y el motivo son obligatorios");
            return;
        }

        setIsSaving(true);
        const token = localStorage.getItem("token") || "";
        try {
            const payload = { ...currentNote, patientId };
            payload.sessionNumber = Number(payload.sessionNumber);

            if (payload.nextAppointmentDate === "") {
                payload.nextAppointmentDate = undefined;
            }

            if (currentNote.id) {
                // Update existing
                await updatePsychologyNote(currentNote.id, payload, token);
                toast.success("Nota actualizada correctamente");
                setNotes(prev => prev.map(n => n.id === currentNote.id ? { ...payload } as PsychologyNote : n));
            } else {
                // Create new
                const response = await createPsychologyNote(payload, token);
                toast.success("Nota creada correctamente");
                // Refresh list
                const data = await getPsychologyNotes(patientId, token);
                setNotes(data || []);
            }
            setViewMode("list");
        } catch (error) {
            console.error("Error saving note:", error);
            toast.error("Error al guardar la nota");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => viewMode === "form" ? setViewMode("list") : router.back()}
                        className="p-2 hover:bg-secondary/10 rounded-xl transition-colors text-foreground/40"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">
                            Notas de Sesión
                        </h1>
                        <p className="text-foreground/50 font-medium">
                            {viewMode === "list" ? "Historial de notas del paciente" : currentNote.id ? "Editando Nota de Sesión" : "Nueva Nota de Sesión"}
                        </p>
                    </div>
                </div>

                {viewMode === "list" ? (
                    <Button onClick={handleNewNote} className="gap-2 h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
                        <PlusCircle className="w-5 h-5" /> Nueva Nota
                    </Button>
                ) : (
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gap-2 h-12 px-6 rounded-2xl shadow-lg shadow-primary/20"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Guadar Nota
                    </Button>
                )}
            </div>

            {viewMode === "list" ? (
                // Timeline / List View
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] p-8 shadow-sm border border-glass-border space-y-6"
                >
                    {notes.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-foreground mb-2">Sin Notas Registradas</h3>
                            <p className="text-foreground/50">Crea la primera nota de sesión para este paciente.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notes.map(note => (
                                <div key={note.id} className="group relative bg-secondary/5 border border-glass-border/50 rounded-2xl p-6 transition-all hover:bg-white hover:shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                #{note.sessionNumber}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground text-lg">Sesión #{note.sessionNumber}</h4>
                                                <p className="text-sm font-medium text-foreground/50 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(note.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleEditNote(note)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity gap-2 border-primary/20 text-primary hover:bg-primary/5 rounded-xl h-10"
                                        >
                                            <Edit2 className="w-4 h-4" /> Editar
                                        </Button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-glass-border/50">
                                        <div>
                                            <span className="font-bold text-foreground/40 uppercase tracking-wider text-[10px] block mb-1">Motivo:</span>
                                            <p className="text-foreground/80 line-clamp-2">{note.reasonForSession}</p>
                                        </div>
                                        <div>
                                            <span className="font-bold text-foreground/40 uppercase tracking-wider text-[10px] block mb-1">Evolución:</span>
                                            <p className="text-foreground/80 line-clamp-2">{note.evolution || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            ) : (
                // Form View
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid lg:grid-cols-3 gap-8"
                >
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-glass-border space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider">Número de Sesión *</label>
                                    <input
                                        type="number"
                                        name="sessionNumber"
                                        value={currentNote.sessionNumber || ""}
                                        onChange={handleChange}
                                        className="w-full h-12 bg-secondary/10 border-transparent rounded-xl px-4 font-medium text-foreground focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Ej. 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider">Próxima Cita (Opcional)</label>
                                    <input
                                        type="date"
                                        name="nextAppointmentDate"
                                        value={currentNote.nextAppointmentDate ? new Date(currentNote.nextAppointmentDate).toISOString().split('T')[0] : ""}
                                        onChange={handleChange}
                                        className="w-full h-12 bg-secondary/10 border-transparent rounded-xl px-4 font-medium text-foreground focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-primary" /> Motivo de la sesión *
                                </label>
                                <textarea
                                    name="reasonForSession"
                                    value={currentNote.reasonForSession || ""}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Describe el motivo principal de la consulta hoy..."
                                    className="w-full bg-secondary/10 border-transparent rounded-xl p-4 font-medium text-foreground focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider flex items-center gap-2">
                                    <History className="w-4 h-4 text-emerald-500" /> Evolución
                                </label>
                                <textarea
                                    name="evolution"
                                    value={currentNote.evolution || ""}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Avances, retrocesos o cambios observados..."
                                    className="w-full bg-secondary/10 border-transparent rounded-xl p-4 font-medium text-foreground focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider">Intervenciones Realizadas</label>
                                <textarea
                                    name="interventions"
                                    value={currentNote.interventions || ""}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Técnicas, herramientas o dinámicas aplicadas en sesión..."
                                    className="w-full bg-secondary/10 border-transparent rounded-xl p-4 font-medium text-foreground focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-orange-500" /> Plan Terapéutico
                                </label>
                                <textarea
                                    name="therapeuticPlan"
                                    value={currentNote.therapeuticPlan || ""}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Tareas, objetivos para la próxima sesión..."
                                    className="w-full bg-secondary/10 border-transparent rounded-xl p-4 font-medium text-foreground focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
                            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5" /> Información
                            </h3>
                            <p className="text-sm text-foreground/70 leading-relaxed mb-6">
                                Las notas de sesión son información confidencial encriptada end-to-end. Al guardar esta nota, certificas la veracidad de la información bajo secreto profesional.
                            </p>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider">Firma o Identificación del Profesional</label>
                                <input
                                    type="text"
                                    name="professionalSignature"
                                    value={currentNote.professionalSignature || ""}
                                    onChange={handleChange}
                                    placeholder="Nombre y Registro Profesional"
                                    className="w-full h-12 bg-white/50 border-white/50 rounded-xl px-4 font-medium text-foreground focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
