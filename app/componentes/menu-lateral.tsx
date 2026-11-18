"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuLateral({ area }: { area: "plataforma" | "empresa" }) {
  const ruta = usePathname();
  const enlaces = area === "plataforma"
    ? [
        { texto: "Inicio", url: "/plataforma", icono: "⌂" },
        { texto: "Empresas", url: "/plataforma/empresas", icono: "▦" },
        { texto: "Crear empresa", url: "/plataforma/empresas/nueva", icono: "+" },
      ]
    : [
        { texto: "Inicio", url: "/panel", icono: "⌂" },
        { texto: "Configuración", url: "/panel/configuracion", icono: "⚙" },
        { texto: "Usuarios", url: "/panel/usuarios", icono: "♙" },
      ];

  return (
    <aside className="nero-lateral">
      <Link href={enlaces[0].url} className="nero-marca" aria-label="Nero, inicio del panel">
        <span aria-hidden="true">N</span> NERO
      </Link>
      <p className="nero-lateral-titulo">{area === "plataforma" ? "Administración" : "Mi espacio"}</p>
      <nav aria-label="Menú lateral">
        {enlaces.map((enlace) => {
          const activa = ruta === enlace.url || (
            enlace.url === "/plataforma/empresas" &&
            ruta.startsWith("/plataforma/empresas/") &&
            ruta !== "/plataforma/empresas/nueva"
          ) || (enlace.url === "/panel/usuarios" && ruta.startsWith("/panel/usuarios/"));
          return (
            <Link key={enlace.url} href={enlace.url} aria-current={activa ? "page" : undefined}>
              <span aria-hidden="true" className="nero-lateral-icono">{enlace.icono}</span>
              {enlace.texto}
            </Link>
          );
        })}
      </nav>
      <div className="nero-lateral-pie">
        <span className="nero-lateral-demo">Modo demostración</span>
        <Link href="/login">← Volver al acceso</Link>
      </div>
    </aside>
  );
}
