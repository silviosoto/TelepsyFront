"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { psychologistService, PsychologistProfileUI } from "@/services/psychologist.service";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Loader2, Save, X, ShieldCheck, ShieldAlert, Info, Clock } from "lucide-react";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { motion, AnimatePresence } from "framer-motion";
import { locationService, DepartmentUI, CityUI } from "@/services/location.service";

export default function ProfilePage() {
    const [psychologist, setPsychologist] = useState<PsychologistProfileUI | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [psychologistId, setPsychologistId] = useState<number | null>(null);
    const [departments, setDepartments] = useState<DepartmentUI[]>([]);
    const [cities, setCities] = useState<CityUI[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PsychologistProfileUI>();

    const selectedState = watch("state");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            // Load departments first
            const deps = await locationService.getDepartments();
            setDepartments(deps);

            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const data = await psychologistService.getPsychologistByUserId(user.id);
                if (data) {
                    setPsychologist(data);
                    setPsychologistId(data.id);
                    reset(data); // Initialize form with data

                    // If has department, load cities
                    if (data.state) {
                        const dep = deps.find(d => d.name === data.state);
                        if (dep) {
                            const cts = await locationService.getCities(dep.id);
                            setCities(cts);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching profile", error);
            setMessage({ text: "Error al cargar el perfil", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to handle department change
    useEffect(() => {
        const updateCities = async () => {
            if (selectedState && isEditing) {
                const dep = departments.find(d => d.name === selectedState);
                if (dep) {
                    setIsLoadingLocations(true);
                    const cts = await locationService.getCities(dep.id);
                    setCities(cts);
                    setIsLoadingLocations(false);
                }
            }
        };
        updateCities();
    }, [selectedState, departments, isEditing]);

    const onSubmit = async (data: PsychologistProfileUI) => {
        setIsSaving(true);
        setMessage(null);
        try {
            // Transform UI data back to DTO format expected by API
            const dto = {
                firstName: data.firstName,
                lastName: data.lastName,
                city: data.city,
                state: data.state,
                phoneNumber: data.phone,
                gender: data.gender,
                documentType: data.documentType,
                documentNumber: data.documentNumber,
                licenseNumber: psychologist?.licenseNumber || "MOCK-LICENSE",
                specialization: data.specialization,
                university: data.university,
                experienceYears: Number(data.experience),
                sessionRate: psychologist?.price || 0,
                bio: data.bio,
                hobbies: data.hobbies,
                bankAccountType: data.bankAccountType,
                bankAccountNumber: data.bankAccountNumber
            };

            if (!psychologistId) return;
            await psychologistService.updateProfile(psychologistId, dto);
            setPsychologist({ ...psychologist, ...data } as PsychologistProfileUI);
            setIsEditing(false);
            setMessage({ text: "Perfil actualizado correctamente", type: 'success' });
        } catch (error) {
            console.error("Error updating profile", error);
            setMessage({ text: "Error al actualizar el perfil", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpdate = async (base64Image: string) => {
        if (psychologist) {
            setPsychologist({ ...psychologist, profilePicture: base64Image });
            try {
                // Convert Base64 (DataURL) to Blob/File to send to the backend
                const response = await fetch(base64Image);
                const blob = await response.blob();
                const file = new File([blob], "profile-picture.jpg", { type: "image/jpeg" });

                if (!psychologistId) return;
                await psychologistService.updateProfilePicture(psychologistId, file);
                setMessage({ text: "Foto de perfil actualizada correctamente.", type: 'success' });
            } catch (error) {
                console.error("Error updating profile picture", error);
                setMessage({ text: "Error al actualizar la foto de perfil.", type: 'error' });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!psychologist) {
        return <div className="text-center p-8">No se encontró el perfil del psicólogo.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mi Perfil Profesional</h1>
                    <p className="text-gray-500">Administra tu información pública y privada</p>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="primary">
                        Editar Perfil
                    </Button>
                )}
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 mb-6 rounded-2xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}
                >
                    {message.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    <span className="font-medium">{message.text}</span>
                </motion.div>
            )}

            {!psychologist.isVerified && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 shadow-sm flex flex-col md:flex-row gap-4 items-center md:items-start"
                >
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-amber-600">
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-amber-900 font-bold mb-1">Perfil en Proceso de Verificación</h3>
                        <p className="text-amber-800/80 text-sm leading-relaxed">
                            Nuestro equipo administrativo está revisando tus credenciales y documentos. Una vez verificado tu perfil, aparecerás en los resultados de búsqueda y podrás comenzar a recibir solicitudes de nuevos pacientes.
                        </p>
                    </div>
                </motion.div>
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-glass-border">
                    {/* Header Row: Profile Picture & Basic Names */}
                    <div className="flex flex-col md:flex-row gap-8 items-start pb-8 border-b border-glass-border">
                        <div className="flex-shrink-0 flex flex-col items-center gap-3 w-full md:w-auto">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Foto de Perfil</span>
                            <ProfileImageUpload
                                initialImage={psychologist.profilePicture}
                                initials={`${psychologist.firstName[0]}${psychologist.lastName[0]}`}
                                onImageUpdate={handleImageUpdate}
                            />
                        </div>

                        <div className="flex-grow w-full space-y-4">
                            <h3 className="text-lg font-semibold text-primary mb-4">Información Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Nombre *"
                                    {...register("firstName", {
                                        required: "El nombre es requerido",
                                        minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres" },
                                        pattern: { value: /^[A-Za-zÁéíóúÁÉÍÓÚñÑ ]+$/, message: "El nombre solo puede contener letras" }
                                    })}
                                    error={errors.firstName?.message}
                                />
                                <Input
                                    label="Apellidos *"
                                    {...register("lastName", {
                                        required: "Los apellidos son requeridos",
                                        minLength: { value: 2, message: "Los apellidos deben tener al menos 2 caracteres" },
                                        pattern: { value: /^[A-Za-zÁéíóúÁÉÍÓÚñÑ ]+$/, message: "Los apellidos solo pueden contener letras" }
                                    })}
                                    error={errors.lastName?.message}
                                />

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-700">Departamento *</label>
                                    <select
                                        {...register("state", { required: "El departamento es requerido" })}
                                        className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Selecciona un departamento</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                    {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-700">Ciudad *</label>
                                    <select
                                        {...register("city", { required: "La ciudad es requerida" })}
                                        disabled={!selectedState || isLoadingLocations}
                                        className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                    >
                                        <option value="">Selecciona una ciudad</option>
                                        {cities.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                    {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                                </div>

                                <Input
                                    label="Número de Teléfono *"
                                    {...register("phone", {
                                        required: "El teléfono es requerido",
                                        pattern: {
                                            value: /^(\+57|57)?(3[0-9]{9}|[1-9][0-9]{6})$/,
                                            message: "Ingresa un número de teléfono válido (ej: 3001234567)"
                                        }
                                    })}
                                    error={errors.phone?.message}
                                />
                                <Input
                                    label="Correo Electrónico"
                                    value={psychologist.email}
                                    disabled
                                    className="bg-gray-50 cursor-not-allowed"
                                    title="El correo está vinculado a tu cuenta y no se puede cambiar desde aquí."
                                />
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-700">Généro *</label>
                                    <select
                                        {...register("gender", { required: "El género es requerido" })}
                                        className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Selecciona...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                    </select>
                                    {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-700">Tipo de Documento *</label>
                                    <select
                                        {...register("documentType", { required: "El tipo de documento es requerido" })}
                                        className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Selecciona...</option>
                                        <option value="CC">CC – Cédula de Ciudadanía</option>
                                        <option value="TI">TI – Tarjeta de Identidad</option>
                                        <option value="CE">CE – Cédula de Extranjería</option>
                                        <option value="NIT">NIT – Número de Identificación Tributaria</option>
                                        <option value="RC">RC – Registro Civil</option>
                                    </select>
                                    {errors.documentType && <p className="text-xs text-red-500">{errors.documentType.message}</p>}
                                </div>
                                <Input
                                    label="Número de Documento *"
                                    {...register("documentNumber", { required: "El número de documento es requerido" })}
                                    error={errors.documentNumber?.message}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Middle Row: Professional Info */}
                    <div className="space-y-4 pb-8 border-b border-glass-border">
                        <h3 className="text-lg font-semibold text-primary">Información Profesional</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Universidad de Egreso *"
                                {...register("university", { required: "La universidad es requerida" })}
                                error={errors.university?.message}
                            />
                            <Input
                                label="Años de Experiencia Clínica *"
                                type="number"
                                {...register("experience", {
                                    required: "Los años de experiencia son requeridos",
                                    min: { value: 0, message: "La experiencia no puede ser negativa" },
                                    max: { value: 60, message: "Ingresa un valor válido" }
                                })}
                                error={errors.experience?.message}
                            />
                        </div>
                    </div>

                    {/* Bottom Row: Extended Details */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-primary">Sobre Mí</h3>
                            <span className="text-sm text-gray-400">Esta información se mostrará públicamente en tu perfil</span>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Biografía Profesional *</label>
                                <textarea
                                    {...register("bio", {
                                        required: "La biografía es requerida",
                                        minLength: { value: 50, message: "La biografía debe tener al menos 50 caracteres para ser profesional" }
                                    })}
                                    rows={5}
                                    placeholder="Cuéntale a tus futuros pacientes acerca de tu enfoque, tus especialidades y cómo puedes ayudarles..."
                                    className={`w-full rounded-xl border ${errors.bio ? 'border-red-500' : 'border-input'} bg-transparent px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent`}
                                />
                                {errors.bio && <p className="text-xs text-red-500 ml-1">{errors.bio.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Input
                                    label="Hobbies e Intereses (Opcional)"
                                    {...register("hobbies")}
                                    placeholder="Ej: Yoga, Lectura sobre filosofía, Senderismo..."
                                />
                                <p className="text-xs text-gray-400 mt-1">Compartir tus hobbies puede ayudar a los pacientes a conectar mejor contigo.</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-glass-border space-y-4">
                            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                <span className="p-1.5 bg-primary/10 rounded-lg"><Info className="w-4 h-4" /></span>
                                Información de Pagos (Privado)
                            </h3>
                            <p className="text-sm text-gray-500">Estos datos se utilizarán únicamente para realizar los pagos de tus sesiones completadas.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-700">Tipo de Cuenta</label>
                                    <select
                                        {...register("bankAccountType")}
                                        className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Selecciona...</option>
                                        <option value="Ahorros">Ahorros</option>
                                        <option value="Corriente">Corriente</option>
                                    </select>
                                </div>
                                <Input
                                    label="Número de Cuenta"
                                    {...register("bankAccountNumber", {
                                        pattern: { 
                                            value: /^[0-9-]+$/, 
                                            message: "El número de cuenta solo puede contener números y guiones" 
                                        }
                                    })}
                                    placeholder="Ej: 123-456789-01"
                                    error={errors.bankAccountNumber?.message}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-glass-border">
                        <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); reset(psychologist); }}>
                            <X className="w-4 h-4 mr-2" /> Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving} className="min-w-[140px]">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Summary Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-glass-border text-center transition-all hover:shadow-md">
                            <div className="flex justify-center mb-6">
                                <ProfileImageUpload
                                    initialImage={psychologist.profilePicture}
                                    initials={`${psychologist.firstName[0]}${psychologist.lastName[0]}`}
                                    onImageUpdate={handleImageUpdate}
                                />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{psychologist.firstName} {psychologist.lastName}</h2>
                            <div className="flex flex-wrap justify-center gap-1 mt-2 mb-2 max-w-[200px] mx-auto">
                                {psychologist.tags.filter(t => t !== psychologist.city).map(tag => (
                                    <span key={tag} className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{tag}</span>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-col items-center gap-3">
                                {psychologist.isVerified ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Profesional Verificado
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100 uppercase tracking-wider">
                                        <Clock className="w-3.5 h-3.5" /> Verificación Pendiente
                                    </div>
                                )}
                                <span className="px-3 py-1 bg-secondary/10 text-primary rounded-full text-[10px] font-bold border border-glass-border uppercase tracking-wider">
                                    {psychologist.experience} años de exp.
                                </span>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-glass-border">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary rounded-full"></span> Contacto
                            </h3>
                            <div className="space-y-4 text-sm text-gray-600">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <span>Teléfono:</span>
                                    <span className="font-medium text-gray-900">{psychologist.phone}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <span>Email:</span>
                                    <span className="font-medium text-gray-900">{psychologist.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <span>Departamento:</span>
                                    <span className="font-medium text-gray-900">{psychologist.state}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <span>Ciudad:</span>
                                    <span className="font-medium text-gray-900">{psychologist.city}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <span>Documento:</span>
                                    <span className="font-medium text-gray-900">{psychologist.documentType} {psychologist.documentNumber}</span>
                                </div>
                                <div className="pt-4 mt-2 border-t-2 border-dashed border-gray-100">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Datos Bancarios</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs">Tipo:</span>
                                            <span className="font-medium text-gray-900">{psychologist.bankAccountType || 'No definido'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs">N° Cuenta:</span>
                                            <span className="font-medium text-gray-900">{psychologist.bankAccountNumber || 'No definido'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-glass-border h-full">
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-primary rounded-full"></span> Sobre Mí
                                </h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                                    {psychologist.bio}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 bg-secondary/10 rounded-xl">
                                    <h4 className="font-semibold text-primary mb-2">Educación</h4>
                                    <p className="text-gray-700">{psychologist.university}</p>
                                </div>
                                <div className="p-6 bg-secondary/10 rounded-xl">
                                    <h4 className="font-semibold text-primary mb-2">Intereses</h4>
                                    <p className="text-gray-700">{psychologist.hobbies}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
