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
                            {/* Online Therapy Image */}
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/20 shadow-lg">
                                <img
                                    src="/images/online-therapy.png"
                                    alt="Sesión de terapia online"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-bottom p-4">
                                     <div className="mt-auto">
                                        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Sesión en vivo
                                        </div>
                                     </div>
                                </div>
                            </div>

                            <div className="mt-2 flex justify-between items-center text-xs text-foreground/50">
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-1.5 font-medium text-foreground/60 transition-colors hover:text-primary">
                                        <Smartphone className="w-3.5 h-3.5" />
                                        <span>Móvil</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-medium text-foreground/60 transition-colors hover:text-primary">
                                        <Monitor className="w-3.5 h-3.5" />
                                        <span>Escritorio</span>
                                    </div>
                                </div>
                                <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                                    Conexión Segura
                                </div>
                            </div>
                        </div>
                    </Card>

                </motion.div>
            </div>
        </section>
    );
};
