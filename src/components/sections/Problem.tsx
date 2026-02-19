"use client";

import { motion } from "framer-motion";
import { Clock, BatteryWarning, SearchX, CloudOff } from "lucide-react";
import { Card } from "../Card";

const painPoints = [
    {
        icon: <BatteryWarning className="w-8 h-8 text-primary" />,
        title: "Estrés y Agotamiento",
        description: "Sientes que el trabajo y la vida diaria te sobrepasan, pero no encuentras el momento para detenerte."
    },
    {
        icon: <SearchX className="w-8 h-8 text-primary" />,
        title: "Difícil de Encontrar",
        description: "Buscar un psicólogo adecuado es abrumador. Llamadas, correos y listas de espera interminables."
    },
    {
        icon: <Clock className="w-8 h-8 text-primary" />,
        title: "Agendas Complicadas",
        description: "Tus horarios no coinciden con los consultorios tradicionales. Necesitas flexibilidad real."
    },
    {
        icon: <CloudOff className="w-8 h-8 text-primary" />,
        title: "Falta de Conexión",
        description: "Has intentado terapia antes, pero no sentiste 'química' con el profesional. Te da miedo volver a intentar."
    }
];

export const Problem = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-foreground mb-4">¿Te sientes identificado?</h2>
                    <p className="text-foreground/70">
                        No estás solo. Miles de profesionales en Colombia enfrentan estos desafíos diariamente.
                        Reconocerlo es el primer paso.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {painPoints.map((point, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full border-none shadow-md bg-zinc-50 hover:bg-white text-center">
                                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                    {point.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{point.title}</h3>
                                <p className="text-foreground/60 text-sm leading-relaxed">
                                    {point.description}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
