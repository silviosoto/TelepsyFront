import { Metadata, ResolvingMetadata } from "next";
import { ProfileContent } from "./ProfileContent";
import { psychologistService } from "@/services/psychologist.service";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    
    try {
        const psychologist = await psychologistService.getPsychologistById(id);
        
        if (!psychologist) {
            return {
                title: "Psicólogo no encontrado | Salumia",
            };
        }

        const fullName = `${psychologist.firstName} ${psychologist.lastName}`;
        const description = `${fullName} es un psicólogo especialista en ${psychologist.specialization} con ${psychologist.experience} años de experiencia en ${psychologist.city}. Agenda tu cita online.`;

        return {
            title: `Ps. ${fullName} | ${psychologist.specialization} | Salumia`,
            description,
            openGraph: {
                title: `Perfil de ${fullName} - Psicólogo Verificado | Salumia`,
                description,
                images: psychologist.profilePicture ? [psychologist.profilePicture] : [],
            },
        };
    } catch (error) {
        return {
            title: "Expertos en Salud Mental | Salumia",
        };
    }
}

export default function Page() {
    return <ProfileContent />;
}
