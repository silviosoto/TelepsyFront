"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 text-sm text-foreground/60">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Image
                            src="/icon.png"
                            alt="Salumia Icon"
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain"
                        />
                        <span className="font-bold text-lg text-foreground">Salumia</span>
                    </div>
                    <p className="max-w-xs mb-6">
                        Conectando bienestar mental con tecnología humana. Tu espacio seguro para crecer.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></Link>
                        <Link href="#" className="hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></Link>
                        <Link href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></Link>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-foreground mb-4">Plataforma</h4>
                    <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-primary transition-colors">Cómo funciona</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Nuestros Psicólogos</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Precios</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Empresas</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-foreground mb-4">Legal</h4>
                    <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Política de Tratamiento de Datos</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
                <p>&copy; {new Date().getFullYear()} Salumia Colombia S.A.S. Todos los derechos reservados.</p>
                <p>Hecho con ❤️ en Colombia</p>
            </div>
        </footer>
    );
};
