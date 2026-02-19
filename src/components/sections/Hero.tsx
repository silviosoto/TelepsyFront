"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Smartphone, Tablet, Monitor } from "lucide-react";
import Link from "next/link";
import { Button } from "../Button";
import { Card } from "../Card";

export const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl mix-blend-multiply animate-blob" />
                <div className="absolute top-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Disponible ahora en Colombia
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-sans font-bold text-foreground leading-tight mb-6">
                        Te conectamos con el <span className="text-primary">psicólogo ideal</span> para ti en minutos.
                    </h1>

                    <p className="text-lg text-foreground/70 mb-8 leading-relaxed max-w-lg">
                        Sin listas de espera, desde la comodidad de tu hogar. Profesionales verificados listos para escucharte.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-10">
                        <Link href="/test">
                            <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-primary/20">
                                Iniciar test ahora
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="#how-it-works">
                            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                                Ver cómo funciona
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-foreground/60">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>100% Confidencial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Profesionales Verificados</span>
                        </div>
                    </div>
                </motion.div>

                {/* Visual Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <Card className="relative z-10 overflow-hidden border-white/40 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/20 z-0" />
                        <div className="relative z-10 p-6 flex flex-col gap-6">
                            {/* Mock Chat Interface */}
                            <div className="flex items-center gap-4 border-b border-glass-border pb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="font-bold text-primary">Dr</span>
                                </div>
                                <div>
                                    <div className="font-medium">Dra. Ana García</div>
                                    <div className="text-xs text-foreground/50">Psicóloga Clínica • En línea</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/50 p-3 rounded-2xl rounded-tl-none max-w-[80%] self-start">
                                    <p className="text-sm">Hola, ¿cómo te has sentido esta semana?</p>
                                </div>
                                <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] ml-auto shadow-md">
                                    <p className="text-sm">Me he sentido un poco ansioso por el trabajo, pero mejor que antes.</p>
                                </div>
                                <div className="bg-white/50 p-3 rounded-2xl rounded-tl-none max-w-[80%] self-start">
                                    <p className="text-sm">Es normal sentirse así. Vamos a trabajar en algunas herramientas para manejarlo.</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-glass-border flex justify-between items-center text-xs text-foreground/40">
                                <div className="flex gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    <Tablet className="w-4 h-4" />
                                    <Monitor className="w-4 h-4" />
                                </div>
                                <span>Videollamada segura end-to-end</span>
                            </div>
                        </div>
                    </Card>

                </motion.div>
            </div>
        </section>
    );
};
