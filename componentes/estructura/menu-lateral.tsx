"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const gruposGestion = [
  { titulo: "Mi organización", enlaces: [
    { texto: "Inicio", url: "/gestion" },
    { texto: "Estructura", url: "/gestion/organizacion" },
    { texto: "Sedes", url: "/gestion/organizacion/sedes" },
    { texto: "Procesos", url: "/gestion/organizacion/procesos" },
    { texto: "Configuración", url: "/gestion/organizacion/configuracion" },
  ] },
  { titulo: "Personas", enlaces: [
    { texto: "Puestos y permisos", url: "/gestion/personas/puestos" },
    { texto: "Usuarios", url: "/gestion/personas/usuarios" },
  ] },
];
const gruposPlataforma = [{ titulo: "Administración", enlaces: [
  { texto: "Inicio", url: "/plataforma" },
  { texto: "Empresas", url: "/plataforma/empresas" },
  { texto: "Crear empresa", url: "/plataforma/empresas/nueva" },
] }];

export default function MenuLateral({ area }: { area: "plataforma" | "empresa" }) {
  const ruta = usePathname();
  const grupos = area === "plataforma" ? gruposPlataforma : gruposGestion;
  const urls = grupos.flatMap((grupo) => grupo.enlaces.map((enlace) => enlace.url));
  const activa = urls.filter((url) => ruta === url || ruta.startsWith(url + "/")).sort((a, b) => b.length - a.length)[0];

  return (
    <aside className="nero-lateral">
      <Link href={area === "plataforma" ? "/plataforma" : "/gestion"} className="nero-marca" aria-label="NERO Gestión, inicio">
        <span aria-hidden="true">N</span><span className="nero-marca-texto">NERO<small>Gestión organizacional</small></span>
      </Link>
      <nav aria-label="Menú principal">
        {grupos.map((grupo) => <div key={grupo.titulo}>
          <p className="nero-lateral-titulo">{grupo.titulo}</p>
          {grupo.enlaces.map((enlace) => <Link key={enlace.url} href={enlace.url} aria-current={activa === enlace.url ? "page" : undefined}>{enlace.texto}</Link>)}
        </div>)}
      </nav>
      <div className="nero-lateral-pie"><span className="nero-lateral-demo">Modo demostración</span><Link href="/login">Volver al acceso</Link></div>
    </aside>
  );
}
