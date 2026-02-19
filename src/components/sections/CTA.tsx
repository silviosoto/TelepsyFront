"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "../Button";

export const CTA = () => {
    return (
        <section className="py-20 relative overflow-hidden bg-primary text-white">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Tu bienestar mental no puede esperar.
                    </h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        Da el primer paso hoy. Encuentra al profesional que realmente te entienda en menos de lo que dura una canción.
                    </p>
                    <Link href="/test">
                        <Button
                            size="lg"
                            className="bg-white text-primary hover:bg-white/90 shadow-2xl h-16 px-10 text-lg"
                        >
                            Comenzar mi test ahora
                            <ArrowRight className="ml-2 w-6 h-6" />
                        </Button>
                    </Link>
                    <p className="mt-6 text-sm text-white/60">
                        Prueba gratuita de matching • Sin compromiso
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
