"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { patientService } from "@/services/patient.service";

interface ProfileFormConnect {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    city: string;
    hobbies: string;
}

export default function PatientProfilePage() {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormConnect>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Should fetch real profile data
                // const data = await patientService.getProfile();
                // setValue('firstName', data.firstName);
                // ...
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [setValue]);

    const onSubmit: SubmitHandler<ProfileFormConnect> = async (data) => {
        setIsSaving(true);
        setSuccessMessage("");
        try {
            await patientService.updateProfile(data);
            setSuccessMessage("Perfil actualizado correctamente.");
        } catch (error) {
            console.error(error);
            // Handle error (e.g., show toast)
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-center py-20">Cargando perfil...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Mi Perfil</h1>

            <div className="bg-white border border-glass-border rounded-2xl p-8 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {successMessage && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-between">
                            <span>{successMessage}</span>
                            <button onClick={() => setSuccessMessage("")} className="text-sm font-bold">&times;</button>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            label="Nombre"
                            {...register("firstName", { required: "El nombre es obligatorio" })}
                            error={errors.firstName?.message}
                        />
                        <Input
                            label="Apellido"
                            {...register("lastName", { required: "El apellido es obligatorio" })}
                            error={errors.lastName?.message}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            label="Fecha de Nacimiento"
                            type="date"
                            {...register("dateOfBirth")}
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">Género</label>
                            <select
                                {...register("gender")}
                                className="w-full h-12 rounded-xl border border-input bg-background/50 px-4 text-sm focus:ring-2 focus:ring-secondary"
                            >
                                <option value="">Selecciona...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Ciudad"
                        {...register("city")}
                    />

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">Intereses / Hobbies</label>
                        <textarea
                            {...register("hobbies")}
                            className="w-full h-32 rounded-xl border border-input bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-secondary resize-none"
                            placeholder="Cuéntanos un poco sobre ti..."
                        />
                        <p className="text-xs text-foreground/50 mt-1 ml-1">Esto ayuda a los psicólogos a conocerte mejor.</p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button disabled={isSaving} className="w-full md:w-auto">
                            {isSaving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
