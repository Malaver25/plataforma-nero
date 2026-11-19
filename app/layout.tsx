import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./sistema-gestion.css";
import { ProveedorDemo } from "@/contexto/demostracion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NERO Gestión | Sistema de gestión organizacional",
  description: "Organización, personas y seguimiento de la gestión empresarial.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><ProveedorDemo>{children}</ProveedorDemo></body>
    </html>
  );
}
