"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { psychologistService, PsychologistProfileUI } from "@/services/psychologist.service";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Loader2, Save, X } from "lucide-react";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";

export default function ProfilePage() {
    const [psychologist, setPsychologist] = useState<PsychologistProfileUI | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [psychologistId, setPsychologistId] = useState<number | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PsychologistProfileUI>();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const data = await psychologistService.getPsychologistByUserId(user.id);
                if (data) {
                    setPsychologist(data);
                    setPsychologistId(data.id);
                    reset(data); // Initialize form with data
                }
            }
        } catch (error) {
            console.error("Error fetching profile", error);
            setMessage({ text: "Error al cargar el perfil", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: PsychologistProfileUI) => {
        setIsSaving(true);
        setMessage(null);
        try {
            // Transform UI data back to DTO format expected by API
            const dto = {
                firstName: data.firstName,
                lastName: data.lastName,
                city: data.city,
                phoneNumber: data.phone,
                gender: data.gender,
                licenseNumber: "MOCK-LICENSE", // Ensure this exists or is editable
                specialization: data.specialization,
                university: data.university,
                experienceYears: Number(data.experience),
                sessionRate: psychologist?.price || 0,
                bio: data.bio,
                hobbies: data.hobbies
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
                <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
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
                                <Input label="Nombre" {...register("firstName", { required: "El nombre es requerido" })} error={errors.firstName?.message} />
                                <Input label="Apellidos" {...register("lastName", { required: "Los apellidos son requeridos" })} error={errors.lastName?.message} />
                                <Input label="Ciudad de residencia" {...register("city", { required: "La ciudad es requerida" })} error={errors.city?.message} />
                                <Input label="Número de Teléfono" {...register("phone", { required: "El teléfono es requerido" })} error={errors.phone?.message} />
                            </div>
                        </div>
                    </div>

                    {/* Middle Row: Professional Info */}
                    <div className="space-y-4 pb-8 border-b border-glass-border">
                        <h3 className="text-lg font-semibold text-primary">Información Profesional</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Universidad de Egreso" {...register("university")} />
                            <Input label="Años de Experiencia Clínica" type="number" {...register("experience")} />
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
                                <label className="text-sm font-medium text-gray-700">Biografía Profesional</label>
                                <textarea
                                    {...register("bio")}
                                    rows={5}
                                    placeholder="Cuéntale a tus futuros pacientes acerca de tu enfoque, tus especialidades y cómo puedes ayudarles..."
                                    className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
                                />
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
                            <div className="mt-6 flex justify-center gap-2 flex-wrap">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                    {psychologist.experience} años exp.
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
                                    <span>Ciudad:</span>
                                    <span className="font-medium text-gray-900">{psychologist.city}</span>
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
