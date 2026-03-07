"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { patientService } from "@/services/patient.service";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { User, Calendar, MapPin, Heart, ShieldCheck, Loader2 } from "lucide-react";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";

interface ProfileFormConnect {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    city: string;
    hobbies: string;
}

export default function PatientProfilePage() {
    const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm<ProfileFormConnect>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await patientService.getProfile();

                // Map API data to form fields
                if (data) {
                    setValue('firstName', data.firstName);
                    setValue('lastName', data.lastName);
                    // Format date for input: YYYY-MM-DD
                    if (data.dateOfBirth) {
                        setValue('dateOfBirth', data.dateOfBirth.split('T')[0]);
                    }
                    setValue('gender', data.gender || "");
                    setValue('city', data.city || "");
                    setValue('hobbies', data.hobbies || "");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("No se pudo cargar la información de tu perfil");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [setValue]);

    const onSubmit: SubmitHandler<ProfileFormConnect> = async (data) => {
        setIsSaving(true);
        try {
            await patientService.updateProfile(data);
            toast.success("¡Perfil actualizado con éxito!", {
                description: "Tus cambios han sido guardados correctamente."
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Hubo un problema al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-foreground/50 font-medium animate-pulse">Cargando tu información...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with profile overview */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="relative group flex-shrink-0">
                    <ProfileImageUpload
                        initialImage={profilePicture}
                        initials={`${getValues('firstName')?.[0] || 'P'}${getValues('lastName')?.[0] || ''}`}
                        onImageUpdate={(base64) => {
                            setProfilePicture(base64);
                            toast.success("Foto recortada", { description: "Recuerda que para el paciente esto actualmente se guarda localmente en esta vista." });
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-foreground tracking-tight">Mi Perfil</h1>
                    <div className="flex flex-wrap gap-4 text-sm font-bold text-foreground/40">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Paciente Verificado
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> Residente en Colombia
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-glass-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
                    <div className="p-8 md:p-10 space-y-10">
                        {/* Personal Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Información Personal</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Input
                                        label="Nombre"
                                        placeholder="Tu nombre"
                                        className="rounded-2xl h-14 bg-secondary/5 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                                        {...register("firstName", { required: "El nombre es obligatorio" })}
                                        error={errors.firstName?.message}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        label="Apellido"
                                        placeholder="Tu apellido"
                                        className="rounded-2xl h-14 bg-secondary/5 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                                        {...register("lastName", { required: "El apellido es obligatorio" })}
                                        error={errors.lastName?.message}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Input
                                        label="Fecha de Nacimiento"
                                        type="date"
                                        className="rounded-2xl h-14 bg-secondary/5 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                                        {...register("dateOfBirth")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-foreground/60 mb-2 ml-1">Género</label>
                                    <select
                                        {...register("gender")}
                                        className="w-full h-14 rounded-2xl border-transparent bg-secondary/5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all shadow-sm"
                                    >
                                        <option value="">Selecciona...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro/No binario</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Location & Details Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-foreground/60" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Ubicación y Preferencias</h3>
                            </div>

                            <Input
                                label="Ciudad"
                                placeholder="Ciudad donde resides"
                                className="rounded-2xl h-14 bg-secondary/5 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                                {...register("city")}
                            />

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="text-sm font-bold text-foreground/60 ml-1">Intereses / Hobbies / Bio Corta</label>
                                    <div className="group relative">
                                        <Heart className="w-4 h-4 text-rose-400 cursor-help" />
                                    </div>
                                </div>
                                <textarea
                                    {...register("hobbies")}
                                    className="w-full h-32 rounded-[2rem] border-transparent bg-secondary/5 px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all shadow-sm resize-none"
                                    placeholder="Cuéntanos un poco sobre tus hobbies o intereses..."
                                />
                                <p className="text-xs text-foreground/40 mt-2 ml-2 italic">
                                    Esta información ayuda a que los psicólogos puedan conectar mejor contigo y personalizar tus sesiones.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary/5 px-8 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-sm text-foreground/50 max-w-sm text-center md:text-left">
                            Tus datos personales están protegidos por nuestra política de privacidad y no serán compartidos sin tu consentimiento.
                        </div>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-full md:w-auto px-10 h-14 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar Cambios"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
