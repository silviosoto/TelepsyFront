"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, AlertTriangle, Download, ArrowRight } from "lucide-react";

// Mock transaction data
const transactions = [
    {
        id: 1,
        date: new Date(2023, 10, 10, 18, 30),
        amount: 80000,
        status: "success",
        method: "Credit Card",
        description: "Sesión con Dra. Ana García"
    },
    {
        id: 2,
        date: new Date(2023, 9, 15, 9, 0),
        amount: 120000,
        status: "success",
        method: "Paypal",
        description: "Sesión con Dr. Carlos Rodríguez"
    },
    {
        id: 3,
        date: new Date(2023, 8, 20, 14, 0),
        amount: 75000,
        status: "failed",
        method: "Credit Card",
        description: "Intento de pago - Psic. Valentina Ruiz"
    }
];

export default function PaymentsPage() {
    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground">Historial de Pagos</h1>
                <button className="flex items-center gap-2 bg-secondary/10 text-foreground/70 px-4 py-2 rounded-lg hover:bg-secondary/20 transition-colors">
                    <Download className="w-4 h-4" /> Exportar CSV
                </button>
            </header>

            <div className="bg-white border border-glass-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/5 border-b border-glass-border text-foreground/60 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Descripción</th>
                                <th className="px-6 py-4">Método</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-secondary/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-foreground/80">
                                        {format(tx.date, "d MMM, yyyy", { locale: es })}
                                        <div className="text-xs text-foreground/40">{format(tx.date, "h:mm a")}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        {tx.description}
                                    </td>
                                    <td className="px-6 py-4 text-foreground/60">
                                        {tx.method}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tx.status === "success"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}>
                                            {tx.status === "success" ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                            {tx.status === "success" ? "Exitoso" : "Fallido"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-foreground">
                                        ${tx.amount.toLocaleString()} COP
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary hover:text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="w-4 h-4 ml-auto" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
