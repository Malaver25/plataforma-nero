import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { modulos, rutaSeccion } from "@/modulos/catalogo";
import PantallaModulo from "@/componentes/modulos/pantalla-modulo";

async function Contenido({ params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params;
  const modulo = modulos.find((item) => item.id === ruta[0]);
  if (!modulo || ruta.length > 2) notFound();
  if (ruta.length === 1) redirect(rutaSeccion(modulo.id, modulo.secciones[0].id));
  const seccion = modulo.secciones.find((item) => item.id === ruta[1]);
  if (!seccion || seccion.propia) notFound();
  return <PantallaModulo moduloId={modulo.id} seccionId={seccion.id} />;
}

export default function ModuloPage({ params }: { params: Promise<{ ruta: string[] }> }) {
  return <Suspense fallback={<p className="nero-tarjeta">Cargando módulo…</p>}><Contenido params={params} /></Suspense>;
}
