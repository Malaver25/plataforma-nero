"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { modulos, rutaSeccion } from "@/modulos/catalogo";

const gruposGestion = [
  { titulo: "Mi espacio", enlaces: [{ texto: "Inicio", url: "/gestion" }] },
  { titulo: "Módulos", enlaces: modulos.map((modulo) => ({ texto: modulo.titulo, url: rutaSeccion(modulo.id, modulo.secciones[0].id) })) },
];
const gruposPlataforma = [{ titulo: "Administración", enlaces: [
  { texto: "Inicio", url: "/plataforma" },
  { texto: "Empresas", url: "/plataforma/empresas" },
  { texto: "Crear empresa", url: "/plataforma/empresas/nueva" },
] }];

export default function MenuLateral({ area }: { area: "plataforma" | "empresa" }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const grupos = area === "plataforma" ? gruposPlataforma : gruposGestion;
  const urls = grupos.flatMap((grupo) => grupo.enlaces.map((enlace) => enlace.url));
  const moduloActual = modulos.find((modulo) => ruta === "/gestion/" + modulo.id || ruta.startsWith("/gestion/" + modulo.id + "/"));
  const activa = area === "empresa" && moduloActual ? rutaSeccion(moduloActual.id, moduloActual.secciones[0].id) : urls.filter((url) => ruta === url || ruta.startsWith(url + "/")).sort((a, b) => b.length - a.length)[0];

  return (
    <aside className="nero-lateral" data-abierto={abierto}>
      <Link href={area === "plataforma" ? "/plataforma" : "/gestion"} className="nero-marca" aria-label="NERO Gestión, inicio">
        <span aria-hidden="true">N</span><span className="nero-marca-texto">NERO<small>Gestión organizacional</small></span>
      </Link>
      <button className="nero-menu-toggle" type="button" aria-expanded={abierto} aria-controls="navegacion-principal" onClick={() => setAbierto(!abierto)}>{abierto ? "Ocultar menú" : "Mostrar menú"}</button>
      <nav id="navegacion-principal" aria-label="Menú principal">
        {grupos.map((grupo) => <div key={grupo.titulo}>
          <p className="nero-lateral-titulo">{grupo.titulo}</p>
          {grupo.enlaces.map((enlace) => <Link key={enlace.url} href={enlace.url} onClick={() => setAbierto(false)} aria-current={activa === enlace.url ? "page" : undefined}>{enlace.texto}</Link>)}
        </div>)}
      </nav>
      <div className="nero-lateral-pie"><span className="nero-lateral-demo">Modo demostración</span><Link href="/login">Volver al acceso</Link></div>
    </aside>
  );
}
