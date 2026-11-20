"use client";
import Link from "next/link";
import { useDemo } from "@/contexto/demostracion";

export default function RecorridoOrganizacion() {
  const { empresaActual, empresas, sedes, procesos, puestos, usuarios } = useDemo();
  const empresa = empresas.find(e => e.id === empresaActual);
  const pasos = [
    { titulo: "Empresa", listo: empresa?.estado === "Activa", url: "/gestion/organizacion/configuracion", texto: "Revisar datos y contacto" },
    { titulo: "Sedes", listo: sedes.some(s => s.empresaId === empresaActual), url: "/gestion/organizacion/sedes", texto: "Registrar centros de trabajo" },
    { titulo: "Procesos", listo: procesos.some(p => p.empresaId === empresaActual), url: "/gestion/organizacion/procesos", texto: "Definir procesos y subprocesos" },
    { titulo: "Puestos", listo: puestos.some(p => p.empresaId === empresaActual && p.procesoIds.length), url: "/gestion/personas/puestos", texto: "Asignar sede, procesos y permisos" },
    { titulo: "Usuarios", listo: usuarios.some(u => u.empresaId === empresaActual && u.puestoId && u.estado === "Activo"), url: "/gestion/personas/usuarios", texto: "Invitar y asignar el puesto" },
  ];
  return <section className="nero-tarjeta nero-seccion"><h2>Recorrido inicial de la organización</h2><p>{pasos.filter(p => p.listo).length} de {pasos.length} pasos con datos de prueba. Esto indica preparación básica, no una validación completa de la empresa.</p><ol className="nero-recorrido">{pasos.map((p, i) => <li key={p.titulo}><span className="nero-etiqueta">{p.listo ? "Con datos" : "Pendiente"}</span><Link className="nero-enlace" href={p.url}>{i + 1}. {p.titulo}</Link><small>{p.texto}</small></li>)}</ol><Link className="nero-enlace" href="/gestion/organizacion/departamentos">Organizar departamentos y responsables</Link></section>;
}
