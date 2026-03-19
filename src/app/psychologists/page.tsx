import { Metadata } from "next";
import { ListingContent } from "./ListingContent";

export const metadata: Metadata = {
  title: "Psicólogos Online Verificados en Colombia | Listado Completo",
  description: "Explora nuestra red de psicólogos certificados en Colombia. Filtra por especialidad: ansiedad, depresión, terapia infantil y más. Agenda tu cita online hoy.",
  keywords: ["psicólogos especialistas", "terapia de pareja colombia", "psicología clínica", "neuropsicología bogotá", "terapia online medellín"],
  openGraph: {
    title: "Encuentra al Especialista en Salud Mental Ideal para Ti | Salumia",
    description: "Perfiles detallados, valoraciones reales y disponibilidad inmediata.",
  }
};

export default function PsychologistsPage() {
  return <ListingContent />;
}
