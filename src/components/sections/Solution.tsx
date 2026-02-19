"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Sparkles, CalendarCheck } from "lucide-react";
import { Card } from "../Card";

const steps = [
    {
        icon: <ClipboardCheck className="w-10 h-10 text-white" />,
        title: "1. Realiza el Test",
        description: "Completa nuestro test inteligente en 60 segundos.",
        color: "bg-primary"
    },
    {
        icon: <Sparkles className="w-10 h-10 text-white" />,
        title: "2. Conexión Ideal",
        description: "Nuestro algoritmo analiza tu perfil y te conecta con el psicólogo perfecto.",
        color: "bg-accent"
    },
    {
        icon: <CalendarCheck className="w-10 h-10 text-white" />,
        title: "3. Agenda tu Sesión",
        description: "Elige el horario que te convenga y conéctate desde cualquier lugar.",
        color: "bg-primary"
    }
];

export const Solution = () => {
    return (
        <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-secondary/10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-primary font-bold uppercase tracking-wider text-sm">Cómo funciona</span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-4">
                        Tu bienestar en 3 simples pasos
                    </h2>
                </div>

                <div className="relative grid md:grid-cols-3 gap-8">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative z-10"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-2xl ${step.color} shadow-lg flex items-center justify-center mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-foreground/70 max-w-xs">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
