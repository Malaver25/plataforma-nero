"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { modulos, rutaSeccion } from "@/modulos/catalogo";

export default function PestanasModulo() {
  const ruta = usePathname();
  const modulo = modulos.find((item) => ruta === "/gestion/" + item.id || ruta.startsWith("/gestion/" + item.id + "/"));
  if (!modulo) return null;
  const activa = modulo.secciones.filter((seccion) => ruta === rutaSeccion(modulo.id, seccion.id) || (seccion.id && ruta.startsWith(rutaSeccion(modulo.id, seccion.id) + "/"))).sort((a, b) => b.id.length - a.id.length)[0];
  return <nav className="nero-pestanas" aria-label={"Apartados de " + modulo.titulo}>{modulo.secciones.map((seccion) => <Link key={seccion.id} href={rutaSeccion(modulo.id, seccion.id)} aria-current={activa?.id === seccion.id ? "page" : undefined}>{seccion.titulo}</Link>)}</nav>;
}
