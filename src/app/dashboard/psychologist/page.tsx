"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { psychologistService, PsychologistProfileUI } from "@/services/psychologist.service";

export default function PsychologistDashboard() {
    const [profile, setProfile] = useState<PsychologistProfileUI | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Resolve the current session psychologist from localStorage
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    const profileData = await psychologistService.getPsychologistByUserId(user.id);

                    if (profileData) {
                        setProfile(profileData);
                    }
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold text-foreground"
                    >
                        ¡Hola, Dr. {profile?.lastName || 'Psicólogo'}! 👋
                    </motion.h1>
                    <p className="text-foreground/60 mt-1">Aquí tienes un resumen de tu actividad para hoy.</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-2 bg-white rounded-xl border border-glass-border shadow-sm hover:bg-secondary/5 transition-all relative">
                        <Bell className="w-5 h-5 text-foreground/60" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                    </button>
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary">
                        {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </div>
                </div>
            </div>

        </div>
    );
}
