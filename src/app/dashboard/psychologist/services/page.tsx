"use client";

import { useEffect, useState, useRef } from "react";
import { psychologistService } from "@/services/psychologist.service";
import { Button } from "@/components/Button";
import {
    Save,
    Loader2,
    DollarSign,
    CheckCircle,
    AlertCircle,
    Search,
    Plus,
    X,
    Settings2
} from "lucide-react";

interface ServiceState {
    therapyId: number;
    therapyName: string;
    description: string;
    rate: number;
    isActive: boolean;
    isModified: boolean;
    isSaving: boolean;
}

interface Therapy {
    id: number;
    name: string;
    description: string;
}

export default function ServicesPage() {
    const [myServices, setMyServices] = useState<ServiceState[]>([]);
    const [allTherapies, setAllTherapies] = useState<Therapy[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedTherapy, setSelectedTherapy] = useState<Therapy | null>(null);
    const [newServiceRate, setNewServiceRate] = useState<string>("");
    const [isAdding, setIsAdding] = useState(false);

    const [psychologistId, setPsychologistId] = useState<number | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();

        // Handle clicking outside of search results
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

            const [therapies, currentServices] = await Promise.all([
                psychologistService.getAvailableTherapies(),
                psychologistService.getServices(profile.id)
            ]);

            setAllTherapies(therapies as Therapy[]);

            // Map current services
            const mapped = (currentServices as any[]).map(s => {
                const therapyInfo = (therapies as any[]).find(t => t.id === s.therapyId);
                return {
                    therapyId: s.therapyId,
                    therapyName: therapyInfo?.name || "Servicio desconocido",
                    description: therapyInfo?.description || "",
                    rate: s.rate,
                    isActive: s.isActive,
                    isModified: false,
                    isSaving: false
                };
            });

            setMyServices(mapped);
        } catch (error) {
            console.error("Error loading services:", error);
            setMessage({ type: 'error', text: "Error al cargar los servicios." });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (service: ServiceState) => {
        if (!psychologistId) return;
        setMyServices(prev => prev.map(s => s.therapyId === service.therapyId ? { ...s, isSaving: true } : s));
        setMessage(null);

        try {
            await psychologistService.updateService(psychologistId, {
                therapyId: service.therapyId,
                rate: service.rate,
                isActive: service.isActive
            });

            setMyServices(prev => prev.map(s => s.therapyId === service.therapyId ? { ...s, isSaving: false, isModified: false } : s));
            setMessage({ type: 'success', text: `Servicio "${service.therapyName}" actualizado.` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Error saving service:", error);
            setMessage({ type: 'error', text: "Error al guardar el servicio." });
            setMyServices(prev => prev.map(s => s.therapyId === service.therapyId ? { ...s, isSaving: false } : s));
        }
    };

    const handleAddService = async () => {
        if (!selectedTherapy || !newServiceRate || !psychologistId) return;

        const rate = parseFloat(newServiceRate);
        if (isNaN(rate) || rate <= 0) {
            setMessage({ type: 'error', text: "Por favor ingresa un monto válido." });
            return;
        }

        setIsAdding(true);
        setMessage(null);

        try {
            await psychologistService.updateService(psychologistId, {
                therapyId: selectedTherapy.id,
                rate: rate,
                isActive: true
            });

            // Update local state instead of reloading everything
            const newService: ServiceState = {
                therapyId: selectedTherapy.id,
                therapyName: selectedTherapy.name,
                description: selectedTherapy.description,
                rate: rate,
                isActive: true,
                isModified: false,
                isSaving: false
            };

            setMyServices(prev => [...prev, newService]);
            setSelectedTherapy(null);
            setNewServiceRate("");
            setSearchQuery("");
            setMessage({ type: 'success', text: "Servicio agregado correctamente." });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Error adding service:", error);
            setMessage({ type: 'error', text: "Error al agregar el servicio." });
        } finally {
            setIsAdding(false);
        }
    };

    const handleRateChange = (therapyId: number, newRate: string) => {
        setMyServices(prev => prev.map(s => {
            if (s.therapyId === therapyId) {
                return { ...s, rate: parseFloat(newRate) || 0, isModified: true };
            }
            return s;
        }));
    };

    const handleToggleActive = (therapyId: number) => {
        setMyServices(prev => prev.map(s => {
            if (s.therapyId === therapyId) {
                return { ...s, isActive: !s.isActive, isModified: true };
            }
            return s;
        }));
    };

    const filteredAvailableTherapies = allTherapies.filter(t =>
        !myServices.find(ms => ms.therapyId === t.id) &&
        (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-gray-500 font-medium">Cargando tus servicios...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mis Servicios</h1>
                <p className="text-lg text-gray-500 mt-2">Gestiona las terapias que ofreces y configura tus tarifas.</p>
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

            {/* Step 1 & 2: Search and Select */}
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-visible">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Agregar Nuevo Servicio</h2>
                    </div>

                    {!selectedTherapy ? (
                        <div className="relative" ref={searchRef}>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Busca servicios por nombre (ej: Terapia Cognitiva, Ansiedad...)"
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
                            {isSearchFocused && (searchQuery.length > 0 || filteredAvailableTherapies.length > 0) && (
                                <div className="absolute z-50 mt-3 w-full bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                    {filteredAvailableTherapies.length > 0 ? (
                                        <div className="p-2">
                                            {filteredAvailableTherapies.map((therapy) => (
                                                <button
                                                    key={therapy.id}
                                                    onClick={() => {
                                                        setSelectedTherapy(therapy);
                                                        setIsSearchFocused(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                                                >
                                                    <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                        {therapy.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                        {therapy.description}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="inline-flex p-3 bg-gray-50 rounded-full mb-3">
                                                <Search className="h-6 w-6 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No se encontraron servicios disponibles</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Step 3: Set Rate for newly selected service */
                        <div className="flex flex-col md:flex-row gap-6 items-end p-6 bg-primary/5 rounded-2xl border border-primary/10 animate-in zoom-in-95 duration-300">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Servicio Seleccionado</span>
                                    <button
                                        onClick={() => setSelectedTherapy(null)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedTherapy.name}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{selectedTherapy.description}</p>
                            </div>

                            <div className="w-full md:w-64 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tarifa por Sesión</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-semibold"
                                        value={newServiceRate}
                                        onChange={(e) => setNewServiceRate(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleAddService}
                                disabled={isAdding || !newServiceRate}
                                className="w-full md:w-auto px-8 py-3 h-[52px] shadow-lg shadow-primary/20"
                            >
                                {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Agregar Servicio"}
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* List of Configured Services */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <Settings2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Servicios Activos ({myServices.length})</h2>
                    </div>
                </div>

                {myServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myServices.map((service) => (
                            <div
                                key={service.therapyId}
                                className={`group p-6 rounded-3xl border transition-all duration-300 ${service.isActive
                                    ? 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1'
                                    : 'bg-gray-50 border-gray-100 opacity-75 grayscale-[0.5]'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-lg leading-snug ${service.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {service.therapyName}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => handleToggleActive(service.therapyId)}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 ${service.isActive ? 'bg-primary' : 'bg-gray-300'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${service.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="relative">
                                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 block">
                                            Tu Tarifa Actual
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={service.rate}
                                                onChange={(e) => handleRateChange(service.therapyId, e.target.value)}
                                                disabled={!service.isActive}
                                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary disabled:opacity-50 transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2 italic">
                                        {service.description}
                                    </p>
                                </div>

                                <Button
                                    onClick={() => handleSave(service)}
                                    disabled={!service.isModified || service.isSaving}
                                    variant={service.isActive ? "primary" : "outline"}
                                    className={`w-full rounded-2xl h-11 transition-all ${service.isModified
                                        ? 'shadow-lg shadow-primary/20'
                                        : 'opacity-50'
                                        }`}
                                >
                                    {service.isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    <span className="font-bold">{service.isModified ? 'Guardar Cambios' : (service.isActive ? 'Actualizado' : 'Inactivo')}</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
                        <div className="p-6 bg-white rounded-3xl shadow-sm mb-6">
                            <Settings2 className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes servicios configurados</h3>
                        <p className="text-gray-500 text-center max-w-sm">
                            Utiliza el buscador de arriba para encontrar y agregar los servicios que deseas ofrecer a tus pacientes.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
