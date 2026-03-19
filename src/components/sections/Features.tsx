"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck, HeartPulse, Laptop } from "lucide-react";

export const Features = () => {
    const features = [
        {
            icon: <HeartPulse className="w-12 h-12 text-primary mb-4" />,
            title: "Matching Personalizado",
            description: "Nuestro algoritmo considera tus necesidades clínicas, estilo de vida y preferencias personales."
        },
        {
            icon: <ShieldCheck className="w-12 h-12 text-primary mb-4" />,
            title: "Verificación Rigurosa",
            description: "Solo aceptamos al top 5% de los psicólogos que aplican. Verificamos títulos, experiencia y ética."
        },
        {
            icon: <Laptop className="w-12 h-12 text-primary mb-4" />,
            title: "Tecnología Segura",
            description: "Plataforma encriptada end-to-end. Tus datos y conversaciones son confidenciales."
        },
        {
            icon: <Check className="w-12 h-12 text-primary mb-4" />,
            title: "Flexibilidad Total",
            description: "Cancela o reprograma tus sesiones con facilidad. Compra paquetes con descuento."
        }
    ];

    return (
        <section id="features" className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground mb-4">¿Por qué elegir Salumia?</h2>
                    <p className="text-foreground/70">Reinventamos la experiencia de ir al psicólogo.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center group p-6 rounded-2xl hover:bg-accent/20 transition-colors duration-300"
                        >
                            <div className="flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-foreground/70 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
