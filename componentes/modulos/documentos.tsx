"use client";

import Link from "next/link";
import { useState } from "react";
import { useModulosDemo, type Registro } from "@/contexto/modulos-demo";
import { useDemo } from "@/contexto/demostracion";
import { transiciones } from "@/modulos/flujos";

export function Biblioteca() {
  const { registros, guardar } = useModulosDemo();
  const [carpeta, setCarpeta] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const carpetas = registros.filter(r => r.clave === "documentos/carpetas" && !r.archivado);
  const documentos = registros.filter(r => ["documentos/controlados", "documentos/no-controlados"].includes(r.clave) && !r.archivado && (!carpeta || (carpeta === "sin" ? !r.valores.carpeta : r.valores.carpeta === carpeta)) && (!estado || r.estado === estado) && r.nombre.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()));
  function arbol(padre = "", visitados = new Set<string>()): React.ReactNode {
    return <ul className="nero-arbol">{carpetas.filter(c => (c.valores.padre || "") === padre && !visitados.has(c.id)).map(c => <li key={c.id}><button className="nero-enlace" aria-pressed={carpeta === c.id} onClick={() => setCarpeta(c.id)}>{c.nombre}</button>{arbol(c.id, new Set([...visitados, c.id]))}</li>)}</ul>;
  }
  return <section className="nero-tarjeta"><h2>Biblioteca por carpetas</h2><div className="nero-acciones"><Link className="nero-boton" href="/gestion/documentos/controlados?crear=1">Nuevo documento</Link><Link className="nero-boton nero-secundario" href="/gestion/documentos/carpetas?crear=1">Nueva carpeta</Link></div><div className="nero-filtros"><div><label htmlFor="biblioteca-buscar">Buscar documento</label><input id="biblioteca-buscar" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></div><div><label htmlFor="biblioteca-estado">Estado</label><select id="biblioteca-estado" value={estado} onChange={e => setEstado(e.target.value)}><option value="">Todos</option>{["Borrador", "En revisión", "Pendiente de aprobación", "Aprobado", "Obsoleto"].map(e => <option key={e}>{e}</option>)}</select></div></div>
    <div className="nero-biblioteca"><nav aria-label="Carpetas documentales"><button className="nero-enlace" onClick={() => setCarpeta("")}>Todos los documentos</button>{arbol()}<button className="nero-enlace" onClick={() => setCarpeta("sin")}>Sin carpeta</button></nav><div><div className="nero-tabla"><table><thead><tr><th>Documento</th><th>Versión</th><th>Estado</th><th>Adjuntos</th></tr></thead><tbody>{documentos.map(r => <tr key={r.id}><td><Link className="nero-enlace" href={`/gestion/${r.clave}?registro=${r.id}`}>{r.nombre}</Link><small>{r.valores.codigo}</small></td><td>{r.valores.version || "—"}</td><td>{r.estado}</td><td>{r.archivos.length}</td></tr>)}</tbody></table></div>{!documentos.length && <p className="nero-vacio">No hay documentos para estos filtros.</p>}</div></div>
    <div className="nero-campo"><label htmlFor="carga-masiva">Carga múltiple a documentos no controlados (hasta 20 archivos)</label><input id="carga-masiva" type="file" multiple onChange={e => {
      const archivos = Array.from(e.target.files || []);
      if (archivos.length > 20 || archivos.some(a => a.size > 10 * 1024 * 1024)) { setMensaje("Selecciona hasta 20 archivos de 10 MB como máximo cada uno."); return; }
      let total = 0; let error = "";
      for (const a of archivos) { const r = guardar("documentos/no-controlados", { nombre: a.name, estado: "Disponible", valores: { carpeta: carpeta === "sin" ? "" : carpeta }, archivos: [a] }); if (!r.error) total++; else error = r.error; }
      setMensaje(`${total} documentos añadidos a la sesión. ${error}`); e.target.value = "";
    }} /></div><p role="status">{mensaje}</p>
  </section>;
}

export function AccionesFlujo({ registro }: { registro: Registro }) {
  const { actuar, nuevaVersion } = useModulosDemo();
  const { usuarios, empresaActual, usuarioActual } = useDemo();
  const [actor, setActor] = useState(usuarioActual);
  const [nota, setNota] = useState("");
  const [mensaje, setMensaje] = useState("");
  if (!transiciones[registro.clave]) return null;
  const opciones = transiciones[registro.clave][registro.estado] || [];
  return <section className="nero-flujo"><h3>Recorrido de revisión</h3><p>Simulación de participantes. La autorización real se implementará en el servidor.</p><div className="nero-pasos-flujo">{Object.keys(transiciones[registro.clave]).map(e => <span key={e} aria-current={registro.estado === e ? "step" : undefined}>{e}</span>)}</div>
    {!registro.archivado && <><div className="nero-form-grid"><div className="nero-campo"><label htmlFor="flujo-actor">Simular acción como</label><select id="flujo-actor" value={actor} onChange={e => setActor(e.target.value)}>{usuarios.filter(u => u.empresaId === empresaActual).map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select></div><div className="nero-campo"><label htmlFor="flujo-nota">Motivo o resultado de revisión</label><textarea id="flujo-nota" value={nota} onChange={e => setNota(e.target.value)} maxLength={2000} /></div></div><div className="nero-acciones">{opciones.map(e => <button key={e} className="nero-boton nero-secundario" onClick={() => { const error = actuar(registro.id, e, nota, actor); setMensaje(error || `Estado actualizado: ${e}`); if (!error) setNota(""); }}>{e === "Borrador" ? "Devolver a borrador" : `Pasar a ${e.toLowerCase()}`}</button>)}{registro.clave === "documentos/controlados" && ["Aprobado", "Obsoleto"].includes(registro.estado) && <button className="nero-boton" onClick={() => setMensaje(nuevaVersion(registro.id) || "Nueva versión creada en borrador.")}>Crear nueva versión</button>}</div></>}
    <p role="status">{mensaje}</p>
    {!!registro.versiones?.length && <details><summary>Versiones y revisiones anteriores ({registro.versiones.length})</summary>{registro.versiones.map((v, i) => <article className="nero-version" key={i}><strong>{v.nombre} · v{v.valores.version || i + 1} · {v.estado}</strong><p>{new Date(v.fecha).toLocaleString("es-PE")}</p><dl>{Object.entries(v.valores).filter(([, valor]) => valor).map(([k, valor]) => <div key={k}><dt>{k}</dt><dd>{valor}</dd></div>)}</dl>{v.archivos.map((a, j) => <button className="nero-enlace" key={j} onClick={() => { const url = URL.createObjectURL(a); const link = document.createElement("a"); link.href = url; link.download = a.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Descargar {a.name}</button>)}</article>)}</details>}
  </section>;
}
