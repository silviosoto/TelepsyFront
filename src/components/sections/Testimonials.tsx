"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card } from "../Card";

const testimonials = [
    {
        name: "Camila R.",
        role: "Diseñadora Gráfica",
        content: "Llevaba meses buscando un psicólogo con quien me sintiera cómoda. En Salumia encontré a la Dra. Sofía en menos de 24 horas.",
        rating: 5
    },
    {
        name: "Andrés M.",
        role: "Desarrollador de Software",
        content: "La flexibilidad de horarios es increíble. Puedo tener mis sesiones antes de empezar mi jornada laboral sin desplazarme.",
        rating: 5
    },
    {
        name: "Valentina T.",
        role: "Gerente de Marketing",
        content: "El proceso de matching realmente funciona. Me conectaron con alguien que entiende perfectamente el estrés corporativo.",
        rating: 5
    }
];

export const Testimonials = () => {
    return (
        <section id="testimonials" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Lo que dicen nuestros pacientes</h2>
                    <p className="text-foreground/70">Más de 2.500 personas han mejorado su bienestar con nosotros.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                        >
                            <Card className="h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-foreground/80 italic mb-6">"{testimonial.content}"</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-primary">
                                        {testimonial.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{testimonial.name}</div>
                                        <div className="text-xs text-foreground/50">{testimonial.role}</div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
