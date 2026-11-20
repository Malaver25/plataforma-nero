"use client";
import Link from "next/link";
import { useDemo } from "@/contexto/demostracion";

export default function Cabecera({ area }: { area: "plataforma" | "empresa" }) {
  const { empresas, empresaActual, usuarios, usuarioActual } = useDemo();
  const empresa = empresas.find(e => e.id === empresaActual);
  const usuario = usuarios.find(u => u.id === usuarioActual && u.empresaId === empresaActual);
  return (
    <header className="nero-cabecera">
      <span className="nero-area">{area === "plataforma" ? "Administración de plataforma" : "Sistema de gestión organizacional"}</span>
      <span className="nero-cabecera-perfil">{area === "plataforma" ? "Administrador de plataforma" : `${empresa?.nombreComercial || empresa?.razonSocial} · ${usuario?.nombre}`} · Demo</span>
      {area === "empresa" && <Link className="nero-enlace" href="/plataforma/empresas">Cambiar empresa en demo</Link>}
    </header>
  );
}
