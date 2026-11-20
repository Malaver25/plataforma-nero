"use client";

import Link from "next/link";
import { useState } from "react";
import { useModulosDemo } from "@/contexto/modulos-demo";
import { useDemo } from "@/contexto/demostracion";
import { avanceProyecto, cerrado, fechasProgramadas, hoyISO, medicionesPendientes } from "@/modulos/flujos";
import { useFechaActual } from "./fecha-actual";

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export function Calendario({ modulo }: { modulo: string }) {
  const { registros } = useModulosDemo();
  const hoy = useFechaActual();
  const [anio, setAnio] = useState(2026);
  const [filtro, setFiltro] = useState("");
  const medible = ["objetivos", "indicadores"].includes(modulo);
  const claves: Record<string, string[]> = { objetivos: ["planificacion"], indicadores: ["registro"], auditorias: ["planificacion"], equipamientos: ["calibraciones", "mantenimientos"], proyectos: ["registro", "hitos", "tareas"], personas: ["formacion", "planes-documentales"] };
  const elementos = registros.filter(r => !r.archivado && claves[modulo]?.some(k => r.clave === modulo + "/" + k) && r.nombre.toLocaleLowerCase().includes(filtro.toLocaleLowerCase()));
  const mediciones = registros.filter(r => r.clave === modulo + "/mediciones" && !r.archivado);
  return <section className="nero-tarjeta nero-seccion">
    <div className="nero-filtros"><div><label htmlFor="cal-buscar">Buscar en el calendario</label><input id="cal-buscar" value={filtro} onChange={e => setFiltro(e.target.value)} /></div><div><label htmlFor="cal-anio">Año</label><input id="cal-anio" type="number" min={2000} max={2100} value={anio} onChange={e => setAnio(Number(e.target.value))} /></div></div>
    <p className="nero-texto-secundario">{medible ? "Cada periodo conserva su propia medición. Registrar un mes no completa los siguientes." : "Calendario de fechas y recurrencias. Abre una ficha para registrar resultados o reprogramar."}</p>
    <div className="nero-tabla"><table><caption>Programación anual · {anio}</caption><thead><tr><th>Elemento</th>{meses.map(m => <th key={m}>{m}</th>)}<th>Seguimiento</th></tr></thead><tbody>
      {elementos.map(r => {
        const fechas = fechasProgramadas(r.valores.fechaInicio || r.valores.fechaFin, r.valores.fechaFin, r.valores.frecuencia, `${anio}-12-31`);
        const pendientes = medible ? medicionesPendientes(r, mediciones, `${anio}-12-31`) : fechas;
        return <tr key={r.id}><td><Link className="nero-enlace" href={`/gestion/${r.clave}?registro=${r.id}`}>{r.nombre}</Link><small>{r.valores.frecuencia || "Única"}</small></td>{meses.map((m, i) => <td key={m}>{fechas.filter(f => f.startsWith(`${anio}-${String(i + 1).padStart(2, "0")}`)).map(f => {
          const evidencia = registros.some(e => !e.archivado && e.valores.periodo === f && ([e.valores.calibracion, e.valores.mantenimiento, e.valores.auditoria].includes(r.id)) && ["Realizada", "Aprobado"].includes(e.estado));
          const cumplido = medible ? !pendientes.includes(f) : evidencia || ((!r.valores.frecuencia || r.valores.frecuencia === "Única") && cerrado(r.estado));
          const destino = medible && !cumplido ? `/gestion/${modulo}/mediciones?crear=1&origen=${r.id}&periodo=${f}&fecha=${f}` : modulo === "equipamientos" && !cumplido ? `/gestion/equipamientos/intervenciones?crear=1&${r.clave.endsWith("calibraciones") ? "calibracion" : "mantenimiento"}=${r.id}&periodo=${f}&fecha=${f}` : `/gestion/${r.clave}?registro=${r.id}`;
          return <Link key={f} className="nero-periodo" data-estado={cumplido ? "hecho" : hoy && f < hoy ? "atrasado" : "programado"} title={`${f}: ${cumplido ? "Realizado" : "Pendiente"}`} href={destino}>{f.slice(8)} {cumplido ? "✓" : "·"}</Link>;
        })}</td>)}<td>{modulo === "proyectos" && r.clave === "proyectos/registro" ? `${avanceProyecto(r.id, registros)} %` : r.estado}</td></tr>;
      })}
    </tbody></table></div>
    {!elementos.length && <p className="nero-vacio">No hay elementos programados. Registra una fecha de inicio y una frecuencia en el módulo.</p>}
    {medible && <Resultados modulo={modulo} />}
  </section>;
}

export function Resultados({ modulo }: { modulo: string }) {
  const { registros } = useModulosDemo();
  const origenes = registros.filter(r => r.clave === `${modulo}/${modulo === "objetivos" ? "planificacion" : "registro"}` && !r.archivado);
  const [seleccion, setSeleccion] = useState("");
  const origen = origenes.find(r => r.id === seleccion) || origenes[0];
  const serie = registros.filter(r => r.clave === modulo + "/mediciones" && r.valores.origen === origen?.id && !r.archivado).sort((a, b) => a.valores.fecha.localeCompare(b.valores.fecha));
  const valores = serie.map(r => Number(r.valores.valor));
  const min = Math.min(0, ...valores), max = Math.max(1, ...valores, Number(origen?.valores.meta || 0));
  const y = (n: number) => 150 - (n - min) / (max - min) * 130;
  return <section className="nero-seccion"><h2>Evolución de resultados</h2><div className="nero-campo"><label htmlFor="resultado-origen">Elemento a analizar</label><select id="resultado-origen" value={origen?.id || ""} onChange={e => setSeleccion(e.target.value)}>{origenes.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select></div>
    {serie.length ? <><svg className="nero-grafico" viewBox="0 0 640 180" role="img" aria-label={`Evolución de ${origen?.nombre}; resultados detallados en la tabla siguiente`}><line x1="20" y1="150" x2="620" y2="150" stroke="#64748b" /><line x1="20" y1={y(Number(origen?.valores.meta || 0))} x2="620" y2={y(Number(origen?.valores.meta || 0))} stroke="#a16207" strokeDasharray="6 4" /><polyline fill="none" stroke="#18344f" strokeWidth="3" points={valores.map((v, i) => `${30 + i * 570 / Math.max(1, valores.length - 1)},${y(v)}`).join(" ")} />{valores.map((v, i) => <circle key={i} cx={30 + i * 570 / Math.max(1, valores.length - 1)} cy={y(v)} r="5" fill="#f5c542" stroke="#18344f" />)}</svg><p>Meta: {origen?.valores.meta || "Sin definir"} · Promedio: {(valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2)}</p><div className="nero-tabla"><table><thead><tr><th>Fecha</th><th>Periodo</th><th>Resultado</th><th>Rango</th></tr></thead><tbody>{serie.map(r => <tr key={r.id}><td>{r.valores.fecha}</td><td>{r.valores.periodo || "Según fecha"}</td><td>{r.valores.valor} {r.valores.unidad}</td><td>{!origen?.valores.minimo && !origen?.valores.maximo ? "Sin rango" : (origen?.valores.minimo && Number(r.valores.valor) < Number(origen.valores.minimo)) || (origen?.valores.maximo && Number(r.valores.valor) > Number(origen.valores.maximo)) ? "Fuera de rango" : "Dentro de rango"}</td></tr>)}</tbody></table></div></> : <p className="nero-vacio">Registra mediciones para ver la evolución.</p>}
  </section>;
}

export function PanelSeguimiento() {
  const { registros, configuraciones } = useModulosDemo();
  const { empresaActual } = useDemo();
  const preferencias = configuraciones[empresaActual + ":organizacion/personalizacion"] || {};
  const actual = useFechaActual();
  const [corte, setFecha] = useState("");
  const fecha = corte || actual;
  const activos = registros.filter(r => !r.archivado);
  const vencidos = activos.filter(r => r.valores.fechaFin && r.valores.fechaFin < fecha && !cerrado(r.estado));
  const revisar = activos.filter(r => ["En revisión", "Pendiente de aprobación", "Pendiente de validación", "Segunda validación", "Tercera validación"].includes(r.estado));
  const objetivos = activos.filter(r => ["objetivos/planificacion", "indicadores/registro"].includes(r.clave) && !cerrado(r.estado));
  const pendientes = objetivos.reduce((s, r) => s + medicionesPendientes(r, activos.filter(m => m.clave === r.clave.split("/")[0] + "/mediciones"), fecha).length, 0);
  return <section className="nero-seccion"><div className="nero-seccion-cabecera"><h2>Seguimiento del sistema</h2><Link className="nero-enlace" href="/gestion/organizacion/personalizacion">Configurar paneles</Link></div><div className="nero-campo"><label htmlFor="panel-fecha">Fecha de corte</label><input id="panel-fecha" type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
    {preferencias.indicadores !== "no" && <dl className="nero-resumen"><div className="nero-tarjeta"><dt>Registros vencidos</dt><dd>{vencidos.length}</dd></div><div className="nero-tarjeta"><dt>Revisiones pendientes</dt><dd>{revisar.length}</dd></div><div className="nero-tarjeta"><dt>Mediciones pendientes</dt><dd>{pendientes}</dd></div></dl>}
    {preferencias.paneles !== "no" && <div className="nero-columnas">{[["Atender vencimientos", vencidos], ["Revisar y aprobar", revisar]].map(([titulo, datos]) => <section className="nero-tarjeta" key={String(titulo)}><h3>{String(titulo)}</h3><ul className="nero-lista-resumen">{(datos as typeof registros).slice(0, 8).map(r => <li key={r.id}><Link className="nero-enlace" href={`/gestion/${r.clave}?registro=${r.id}`}>{r.nombre}</Link><span>{r.valores.fechaFin || r.estado}</span></li>)}</ul>{!(datos as typeof registros).length && <p>No hay pendientes en esta vista.</p>}</section>)}</div>}
  </section>;
}
