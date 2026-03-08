"use client";

import { useEffect, useState, useRef } from "react";
import { psychologistService } from "@/services/psychologist.service";
import { Button } from "@/components/Button";
import {
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    Search,
    Plus,
    X,
    Settings2,
    Tag as TagIcon
} from "lucide-react";

interface SpecialtyState {
    specialtyId: number;
    specialtyName: string;
    description: string;
    isActive: boolean;
    isSaving: boolean;
}

interface Specialty {
    id: number;
    name: string;
    description: string;
}

export default function SpecialtiesPage() {
    const [mySpecialties, setMySpecialties] = useState<SpecialtyState[]>([]);
    const [allSpecialties, setAllSpecialties] = useState<Specialty[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [psychologistId, setPsychologistId] = useState<number | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();

        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) return;

            const user = JSON.parse(storedUser);
            const profile = await psychologistService.getPsychologistByUserId(user.id);
            if (!profile) return;

            setPsychologistId(profile.id);
            const psychologistId = profile.id;

            const [specialtiesResponse, currentSpecialtiesResponse] = await Promise.all([
                psychologistService.getAvailableSpecialties("", 4),
                psychologistService.getPsychologistSpecialties(profile.id)
            ]);

            setAllSpecialties(specialtiesResponse as Specialty[]);

            // Map current specialties
            const mapped = (currentSpecialtiesResponse as Specialty[]).map(s => {
                return {
                    specialtyId: s.id,
                    specialtyName: s.name,
                    description: s.description,
                    isActive: true,
                    isSaving: false
                };
            });

            setMySpecialties(mapped);
        } catch (error) {
            console.error("Error loading specialties:", error);
            setMessage({ type: 'error', text: "Error al cargar las especialidades." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isSearchFocused && !searchQuery) return;

        const fetchSearchResults = async () => {
            try {
                const results = await psychologistService.getAvailableSpecialties(searchQuery, searchQuery ? undefined : 4);
                setAllSpecialties(results as Specialty[]);
            } catch (error) {
                console.error("Error fetching specialties:", error);
            }
        };

        const timeoutId = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, isSearchFocused]);

    const handleToggleSpecialty = async (specialty: Specialty) => {
        if (!psychologistId) return;
        const isCurrentlyActive = mySpecialties.some(ms => ms.specialtyId === specialty.id);

        setIsAdding(true);
        try {
            await psychologistService.updatePsychologistSpecialty(psychologistId, {
                specialtyId: specialty.id,
                isActive: !isCurrentlyActive
            });

            if (isCurrentlyActive) {
                setMySpecialties(prev => prev.filter(ms => ms.specialtyId !== specialty.id));
                setMessage({ type: 'success', text: `Especialidad "${specialty.name}" removida.` });
            } else {
                setMySpecialties(prev => [...prev, {
                    specialtyId: specialty.id,
                    specialtyName: specialty.name,
                    description: specialty.description,
                    isActive: true,
                    isSaving: false
                }]);
                setMessage({ type: 'success', text: `Especialidad "${specialty.name}" agregada.` });
            }
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Error toggling specialty:", error);
            setMessage({ type: 'error', text: "Error al actualizar la especialidad." });
        } finally {
            setIsAdding(false);
        }
    };

    const filteredAvailableSpecialties = allSpecialties.filter(t =>
        !mySpecialties.find(ms => ms.specialtyId === t.id)
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-gray-500 font-medium">Cargando tus especialidades...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mis Especialidades</h1>
                <p className="text-lg text-gray-500 mt-2">Gestiona las áreas de especialidad que aparecerán en tu perfil.</p>
            </div>

            {/* Alert Message */}
            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-100 shadow-sm shadow-green-100/50'
                    : 'bg-red-50 text-red-700 border border-red-100 shadow-sm shadow-red-100/50'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span className="font-medium text-sm">{message.text}</span>
                    <button onClick={() => setMessage(null)} className="ml-auto hover:bg-black/5 p-1 rounded-lg">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Search and Select */}
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-visible">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Agregar Especialidad</h2>
                    </div>

                    <div className="relative" ref={searchRef}>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Busca especialidades (ej: Ansiedad, Depresión...)"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchFocused(true);
                                }}
                                onFocus={() => setIsSearchFocused(true)}
                            />
                        </div>

                        {/* Dropdown Results */}
                        {isSearchFocused && (searchQuery.length > 0 || filteredAvailableSpecialties.length > 0) && (
                            <div className="absolute z-50 mt-3 w-full bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                {filteredAvailableSpecialties.length > 0 ? (
                                    <div className="p-2">
                                        {filteredAvailableSpecialties.map((specialty) => (
                                            <button
                                                key={specialty.id}
                                                disabled={isAdding}
                                                onClick={() => {
                                                    handleToggleSpecialty(specialty);
                                                    setIsSearchFocused(false);
                                                    setSearchQuery("");
                                                }}
                                                className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-colors group flex items-center justify-between"
                                            >
                                                <div>
                                                    <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                        {specialty.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                        {specialty.description}
                                                    </div>
                                                </div>
                                                <Plus className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <div className="inline-flex p-3 bg-gray-50 rounded-full mb-3">
                                            <Search className="h-6 w-6 text-gray-300" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No se encontraron especialidades disponibles</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* List of Configured Specialties */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <TagIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Especialidades Activas ({mySpecialties.length})</h2>
                    </div>
                </div>

                {mySpecialties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mySpecialties.map((specialty) => (
                            <div
                                key={specialty.specialtyId}
                                className="group p-6 rounded-3xl border transition-all duration-300 bg-white border-primary/20 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden"
                            >
                                <div className="absolute -right-6 -top-6 bg-primary/5 w-24 h-24 rounded-full" />
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg leading-snug text-primary">
                                            {specialty.specialtyName}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => handleToggleSpecialty({ id: specialty.specialtyId, name: specialty.specialtyName, description: specialty.description })}
                                        disabled={isAdding}
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                        title="Remover especialidad"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                        {specialty.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
                        <div className="p-6 bg-white rounded-3xl shadow-sm mb-6">
                            <TagIcon className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes especialidades</h3>
                        <p className="text-gray-500 text-center max-w-sm">
                            Utiliza el buscador de arriba para agregar tus áreas de especialidad. Aparecerán en tu perfil como etiquetas.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
