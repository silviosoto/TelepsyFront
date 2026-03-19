import { Navbar } from "@/components/Navbar";
import { CTA } from "@/components/sections/CTA";
import { Features } from "@/components/sections/Features";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { Testimonials } from "@/components/sections/Testimonials";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tu psicólogo ideal en Colombia | Mindcare",
  description: "Encuentra y agenda citas con los mejores psicólogos verificados en Colombia. Terapia online personalizada para ansiedad, depresión, pareja y más.",
  openGraph: {
    title: "Encuentra tu psicólogo ideal en minutos | Mindcare",
    description: "La red de profesionales de la salud mental más confiable de Colombia.",
  }
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
