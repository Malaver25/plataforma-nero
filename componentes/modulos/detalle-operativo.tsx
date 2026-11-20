"use client";

import Link from "next/link";
import { useState } from "react";
import { useModulosDemo, type Registro } from "@/contexto/modulos-demo";
import { useDemo } from "@/contexto/demostracion";
import { avanceProyecto, proteccionControl, riesgoConControl } from "@/modulos/flujos";

export default function DetalleOperativo({ registro }: { registro: Registro }) {
  const { registros, guardar, clonarProyecto } = useModulosDemo();
  const { usuarios, empresaActual } = useDemo();
  const [mensaje, setMensaje] = useState("");
  const [nuevo, setNuevo] = useState("");
  const [qr, setQR] = useState("");
  const persona = usuarios.find(u => u.id === registro.valores.persona && u.empresaId === empresaActual);
  const relacionados = registros.filter(r => !r.archivado && Object.values(r.valores).some(v => v === registro.id));
  const proteccion = proteccionControl(registro.valores);
  const residual = riesgoConControl(Number(registro.valores.probabilidad), Number(registro.valores.impacto), registros.find(r => r.id === registro.valores.control));
  const planificado = riesgoConControl(Number(registro.valores.probabilidad), Number(registro.valores.impacto), registros.find(r => r.id === registro.valores.controlPlanificado));
  const acciones: Record<string, [string, string, string][]> = {
    "documentos/controlados": [["Crear registro periódico", "documentos/registros", "documento"]],
    "objetivos/planificacion": [["Registrar medición", "objetivos/mediciones", "origen"], ["Añadir tarea", "objetivos/tareas", "objetivo"]],
    "indicadores/registro": [["Registrar medición", "indicadores/mediciones", "origen"]],
    "no-conformidades/registro": [["Planificar acción correctiva", "no-conformidades/acciones", "hallazgo"]],
    "no-conformidades/acciones": [["Añadir tarea", "no-conformidades/tareas", "accion"]],
    "auditorias/planificacion": [["Registrar resultado", "auditorias/resultados", "auditoria"], ["Registrar no conformidad", "no-conformidades/registro", "auditoria"]],
    "riesgos/registro": [["Planificar tratamiento", "riesgos/tratamiento", "riesgo"]],
    "proyectos/registro": [["Añadir hito", "proyectos/hitos", "proyecto"], ["Añadir tarea", "proyectos/tareas", "proyecto"]],
    "equipamientos/equipos": [["Programar calibración", "equipamientos/calibraciones", "equipo"], ["Programar mantenimiento", "equipamientos/mantenimientos", "equipo"]],
    "personas/formacion": [["Registrar asistencia", "personas/asistencias", "formacion"]],
  };
  return <div className="nero-seccion">
    <div className="nero-acciones">{(acciones[registro.clave] || []).map(([label, destino, campo]) => <Link className="nero-boton nero-secundario" key={destino} href={`/gestion/${destino}?crear=1&${campo}=${registro.id}`}>{label}</Link>)}</div>
    {registro.clave === "riesgos/controles" && <p className="nero-demo">{proteccion ? `Grado de protección: ${proteccion.grado}/5 · Vulnerabilidad: ${proteccion.vulnerabilidad}` : "Completa los cinco factores del control para calcular su vulnerabilidad."}</p>}
    {registro.clave === "riesgos/registro" && <dl className="nero-resumen"><div className="nero-tarjeta"><dt>Inherente</dt><dd>{Number(registro.valores.probabilidad) * Number(registro.valores.impacto)}</dd></div><div className="nero-tarjeta"><dt>Residual por control aplicado</dt><dd>{residual ?? "Sin evaluar"}</dd></div><div className="nero-tarjeta"><dt>Planificado</dt><dd>{planificado ?? "Sin evaluar"}</dd></div></dl>}
    {registro.clave === "personas/documentacion" && <section className="nero-flujo"><h3>Entrega y confirmación documental</h3><p>Simular recepción como {persona?.nombre || "participante asignado"}.</p><div className="nero-acciones"><button className="nero-boton nero-secundario" disabled={registro.valores.confirmado === "si"} onClick={() => setMensaje(guardar(registro.clave, { ...registro, valores: { ...registro.valores, confirmado: "si", fechaLectura: new Date().toISOString() }, estado: "Completado" }).error || "Lectura y recepción confirmadas en la demo.")}>{registro.valores.confirmado === "si" ? "Lectura confirmada" : "Confirmar recepción y lectura"}</button></div></section>}
    {registro.clave === "proyectos/registro" && <section className="nero-flujo"><h3>Avance consolidado: {avanceProyecto(registro.id, registros)} %</h3><progress max={100} value={avanceProyecto(registro.id, registros)} aria-label="Avance del proyecto" /><p>Presupuesto: {registro.valores.presupuesto || "0"} · Coste real: {registro.valores.costeReal || "0"}</p><details><summary>Crear un proyecto desde esta plantilla</summary><form onSubmit={e => { e.preventDefault(); const datos = new FormData(e.currentTarget); const resultado = clonarProyecto(registro.id, String(datos.get("nombre")), String(datos.get("inicio"))); setMensaje(resultado.error || "Proyecto, hitos y tareas copiados con fechas desplazadas y avance reiniciado."); setNuevo(resultado.id || ""); }}><div className="nero-form-grid"><div className="nero-campo"><label htmlFor="plantilla-nombre">Nombre del nuevo proyecto</label><input id="plantilla-nombre" name="nombre" required maxLength={160} /></div><div className="nero-campo"><label htmlFor="plantilla-inicio">Inicio</label><input id="plantilla-inicio" name="inicio" type="date" required /></div></div><button className="nero-boton">Crear desde plantilla</button></form>{nuevo && <Link className="nero-enlace" href={`/gestion/proyectos/registro?registro=${nuevo}`}>Abrir nuevo proyecto</Link>}</details></section>}
    {registro.clave === "equipamientos/equipos" && <section className="nero-flujo"><h3>Etiqueta del equipo</h3><p>{registro.nombre} · {registro.valores.codigo || registro.id} · Serie {registro.valores.serie || "Sin registrar"}</p><button className="nero-boton nero-secundario" onClick={async () => { try { const { default: QRCode } = await import("qrcode"); setQR(await QRCode.toDataURL(`${registro.nombre}\nCódigo: ${registro.valores.codigo || registro.id}\nSerie: ${registro.valores.serie || ""}`, { width: 240, margin: 4 })); } catch { setMensaje("No se pudo generar la etiqueta QR."); } }}>Generar etiqueta QR</button>{qr && <div><img src={qr} width={240} height={240} alt={`QR con identificación de ${registro.nombre}`} /><a className="nero-enlace" href={qr} download={`equipo-${registro.valores.codigo || registro.id}.png`}>Descargar etiqueta</a><p>El QR contiene la identificación del equipo; no publica una ficha externa.</p></div>}</section>}
    {!!relacionados.length && <section className="nero-flujo"><h3>Registros relacionados</h3><ul className="nero-lista-resumen">{relacionados.map(r => <li key={r.id}><Link className="nero-enlace" href={`/gestion/${r.clave}?registro=${r.id}`}>{r.nombre}</Link><span>{r.estado}</span></li>)}</ul></section>}
    <p role="status">{mensaje}</p>
  </div>;
}
