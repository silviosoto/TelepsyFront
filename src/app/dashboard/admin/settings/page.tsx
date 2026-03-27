"use client";

import { useState, useEffect } from "react";
import { Settings, Percent, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
    const [commissionRate, setCommissionRate] = useState<number>(30);
    const [discounts, setDiscounts] = useState({
        discount4Sessions: 5,
        discount8Sessions: 8,
        discount12Sessions: 12
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingCommission, setIsSavingCommission] = useState(false);
    const [isSavingDiscounts, setIsSavingDiscounts] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const [commissionData, discountData] = await Promise.all([
                    adminService.getCommissionRate().catch(() => ({ rate: 30 })),
                    adminService.getPackageDiscounts().catch(() => ({ discount4Sessions: 5, discount8Sessions: 8, discount12Sessions: 12 }))
                ]);
                
                if (commissionData && typeof commissionData.rate === 'number') {
                    setCommissionRate(commissionData.rate);
                }
                if (discountData) {
                    setDiscounts({
                        discount4Sessions: discountData.discount4Sessions ?? 5,
                        discount8Sessions: discountData.discount8Sessions ?? 8,
                        discount12Sessions: discountData.discount12Sessions ?? 12
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Error al cargar la configuración.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSaveCommission = async () => {
        setIsSavingCommission(true);
        try {
            await adminService.updateCommissionRate({ rate: commissionRate });
            toast.success("Comisión actualizada exitosamente.");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar la comisión.");
        } finally {
            setIsSavingCommission(false);
        }
    };

    const handleSaveDiscounts = async () => {
        setIsSavingDiscounts(true);
        try {
            await adminService.updatePackageDiscounts(discounts);
            toast.success("Descuentos de paquetes actualizados exitosamente.");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar los descuentos.");
        } finally {
            setIsSavingDiscounts(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">Configuración del Sistema</h1>
                    <p className="text-foreground/60">Gestiona las comisiones y descuentos de paquetes de sesiones.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 rounded-3xl border border-glass-border shadow-sm space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-glass-border pb-4">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <Percent className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Comisión de la Plataforma</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80">Porcentaje de Comisión (%)</label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(Number(e.target.value))}
                                className="w-full text-lg"
                            />
                            <p className="text-xs text-foreground/50">Este porcentaje se retendrá de los pagos de las sesiones.</p>
                        </div>

                        <Button
                            onClick={handleSaveCommission}
                            disabled={isSavingCommission}
                            className="w-full py-6 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30"
                        >
                            {isSavingCommission ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            Guardar Comisión
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-glass-border shadow-sm space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-glass-border pb-4">
                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                            <Settings className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Descuentos de Paquetes</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80">Descuento Paquete 4 Sesiones (%)</label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={discounts.discount4Sessions}
                                onChange={(e) => setDiscounts({ ...discounts, discount4Sessions: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80">Descuento Paquete 8 Sesiones (%)</label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={discounts.discount8Sessions}
                                onChange={(e) => setDiscounts({ ...discounts, discount8Sessions: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80">Descuento Paquete 12 Sesiones (%)</label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={discounts.discount12Sessions}
                                onChange={(e) => setDiscounts({ ...discounts, discount12Sessions: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        <Button
                            onClick={handleSaveDiscounts}
                            disabled={isSavingDiscounts}
                            variant="primary"
                            className="w-full py-6 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                        >
                            {isSavingDiscounts ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            Guardar Descuentos
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
