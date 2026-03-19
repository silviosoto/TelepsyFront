import { Metadata, ResolvingMetadata } from "next";
import { ProfileContent } from "./ProfileContent";
import { psychologistService } from "@/services/psychologist.service";

type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = Number(params.id);
    
    try {
        const psychologist = await psychologistService.getPsychologistById(id);
        
        if (!psychologist) {
            return {
                title: "Psicólogo no encontrado | Mindcare",
            };
        }

        const fullName = `${psychologist.firstName} ${psychologist.lastName}`;
        const description = `${fullName} es un psicólogo especialista en ${psychologist.specialization} con ${psychologist.experience} años de experiencia en ${psychologist.city}. Agenda tu cita online.`;

        return {
            title: `Ps. ${fullName} | ${psychologist.specialization} | Mindcare`,
            description,
            openGraph: {
                title: `Perfil de ${fullName} - Psicólogo Verificado | Mindcare`,
                description,
                images: psychologist.profilePicture ? [psychologist.profilePicture] : [],
            },
        };
    } catch (error) {
        return {
            title: "Expertos en Salud Mental | Mindcare",
        };
    }
}

export default function Page() {
    return <ProfileContent />;
}
