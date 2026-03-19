import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mindcare | Conectamos tu bienestar mental",
    template: "%s | Mindcare"
  },
  description: "La plataforma líder en Colombia para conectar psicólogos verificados con pacientes. Terapia online segura, rápida y profesional.",
  keywords: ["psicólogos colombia", "terapia online", "salud mental", "psicología virtual", "terapia en casa"],
  authors: [{ name: "Mindcare Team" }],
  creator: "Mindcare",
  publisher: "Mindcare",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://mindcare.com.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mindcare | Tu bienestar mental a un clic",
    description: "Encuentra al psicólogo ideal para ti. Sesiones seguras, profesionales y desde la comodidad de tu hogar en Colombia.",
    url: "https://mindcare.com.co",
    siteName: "Mindcare",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mindcare - Salud Mental en Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindcare | Conectamos tu bienestar mental",
    description: "La forma más fácil y segura de encontrar psicólogos en Colombia.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.variable} ${inter.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
