"use client";

import Link from "next/link";
import { useState } from "react";
import { useModulosDemo, type Registro } from "@/contexto/modulos-demo";
import { useDemo } from "@/contexto/demostracion";
import { avanceProyecto } from "@/modulos/flujos";

export default function DetalleOperativo({ registro }: { registro: Registro }) {
  const { registros, guardar, clonarProyecto } = useModulosDemo();
  const { usuarios, empresaActual } = useDemo();
  const [mensaje, setMensaje] = useState("");
  const [nuevo, setNuevo] = useState("");
  const [qr, setQR] = useState("");
  const persona = usuarios.find(u => u.id === registro.valores.persona && u.empresaId === empresaActual);
  const relacionados = registros.filter(r => !r.archivado && Object.values(r.valores).some(v => v === registro.id));
  return <div className="nero-seccion">
    {registro.clave === "personas/documentacion" && <section className="nero-flujo"><h3>Entrega y confirmación documental</h3><p>Simular recepción como {persona?.nombre || "participante asignado"}.</p><div className="nero-acciones"><button className="nero-boton nero-secundario" disabled={registro.valores.confirmado === "si"} onClick={() => setMensaje(guardar(registro.clave, { ...registro, valores: { ...registro.valores, confirmado: "si", fechaLectura: new Date().toISOString() }, estado: "Completado" }).error || "Lectura y recepción confirmadas en la demo.")}>{registro.valores.confirmado === "si" ? "Lectura confirmada" : "Confirmar recepción y lectura"}</button></div></section>}
    {registro.clave === "proyectos/registro" && <section className="nero-flujo"><h3>Avance consolidado: {avanceProyecto(registro.id, registros)} %</h3><progress max={100} value={avanceProyecto(registro.id, registros)} aria-label="Avance del proyecto" /><p>Presupuesto: {registro.valores.presupuesto || "0"} · Coste real: {registro.valores.costeReal || "0"}</p><details><summary>Crear un proyecto desde esta plantilla</summary><form onSubmit={e => { e.preventDefault(); const datos = new FormData(e.currentTarget); const resultado = clonarProyecto(registro.id, String(datos.get("nombre")), String(datos.get("inicio"))); setMensaje(resultado.error || "Proyecto, hitos y tareas copiados con fechas desplazadas y avance reiniciado."); setNuevo(resultado.id || ""); }}><div className="nero-form-grid"><div className="nero-campo"><label htmlFor="plantilla-nombre">Nombre del nuevo proyecto</label><input id="plantilla-nombre" name="nombre" required maxLength={160} /></div><div className="nero-campo"><label htmlFor="plantilla-inicio">Inicio</label><input id="plantilla-inicio" name="inicio" type="date" required /></div></div><button className="nero-boton">Crear desde plantilla</button></form>{nuevo && <Link className="nero-enlace" href={`/gestion/proyectos/registro?registro=${nuevo}`}>Abrir nuevo proyecto</Link>}</details></section>}
    {registro.clave === "equipamientos/equipos" && <section className="nero-flujo"><h3>Etiqueta del equipo</h3><p>{registro.nombre} · {registro.valores.codigo || registro.id} · Serie {registro.valores.serie || "Sin registrar"}</p><button className="nero-boton nero-secundario" onClick={async () => { try { const { default: QRCode } = await import("qrcode"); setQR(await QRCode.toDataURL(`${registro.nombre}\nCódigo: ${registro.valores.codigo || registro.id}\nSerie: ${registro.valores.serie || ""}`, { width: 240, margin: 4 })); } catch { setMensaje("No se pudo generar la etiqueta QR."); } }}>Generar etiqueta QR</button>{qr && <div><img src={qr} width={240} height={240} alt={`QR con identificación de ${registro.nombre}`} /><a className="nero-enlace" href={qr} download={`equipo-${registro.valores.codigo || registro.id}.png`}>Descargar etiqueta</a><p>El QR contiene la identificación del equipo; no publica una ficha externa.</p></div>}</section>}
    {!!relacionados.length && <section className="nero-flujo"><h3>Registros relacionados</h3><ul className="nero-lista-resumen">{relacionados.map(r => <li key={r.id}><Link className="nero-enlace" href={`/gestion/${r.clave}?registro=${r.id}`}>{r.nombre}</Link><span>{r.estado}</span></li>)}</ul></section>}
    <p role="status">{mensaje}</p>
  </div>;
}
