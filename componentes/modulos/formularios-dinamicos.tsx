"use client";

import Link from "next/link";
import { useState } from "react";
import { useModulosDemo, type Valores } from "@/contexto/modulos-demo";
import { useDemo } from "@/contexto/demostracion";
import { hoyISO } from "@/modulos/flujos";
import { useFechaActual } from "./fecha-actual";

export type Pregunta = { id: string; titulo: string; tipo: "texto" | "numero" | "fecha" | "opcion" | "casilla"; requerida: boolean; opciones: string; depende: string; respuesta: string };
export function leerDiseno(valores: Valores): Pregunta[] {
  try { if (valores.diseno) { const datos: Pregunta[] = JSON.parse(valores.diseno); if (Array.isArray(datos)) return datos; } } catch { /* Compatibilidad con propuestas anteriores. */ }
  return (valores.preguntas || valores.campos || "").split("\n").filter(Boolean).map((titulo, i) => ({ id: "campo-" + i, titulo, tipo: "texto", requerida: true, opciones: "", depende: "", respuesta: "" }));
}
export function Disenador({ valores, cambiar }: { valores: Valores; cambiar: (id: string, valor: string) => void }) {
  const preguntas = leerDiseno(valores);
  function guardar(lista: Pregunta[]) { cambiar("diseno", JSON.stringify(lista)); }
  function actualizar(id: string, datos: Partial<Pregunta>) { guardar(preguntas.map(p => p.id === id ? { ...p, ...datos } : p)); }
  return <fieldset className="nero-disenador"><legend>Diseñador de campos</legend><p>Define los campos, su orden y las condiciones de visualización.</p>{preguntas.map((p, i) => <section className="nero-version" key={p.id}><div className="nero-form-grid"><div className="nero-campo"><label htmlFor={p.id + "titulo"}>Pregunta {i + 1}</label><input id={p.id + "titulo"} required value={p.titulo} onChange={e => actualizar(p.id, { titulo: e.target.value })} /></div><div className="nero-campo"><label htmlFor={p.id + "tipo"}>Tipo de respuesta</label><select id={p.id + "tipo"} value={p.tipo} onChange={e => actualizar(p.id, { tipo: e.target.value as Pregunta["tipo"] })}>{["texto", "numero", "fecha", "opcion", "casilla"].map(t => <option key={t}>{t}</option>)}</select></div>{p.tipo === "opcion" && <div className="nero-campo"><label htmlFor={p.id + "opciones"}>Opciones separadas por punto y coma</label><input id={p.id + "opciones"} required value={p.opciones} onChange={e => actualizar(p.id, { opciones: e.target.value })} /></div>}<div className="nero-campo"><label><input type="checkbox" checked={p.requerida} onChange={e => actualizar(p.id, { requerida: e.target.checked })} /> Respuesta obligatoria</label></div><div className="nero-campo"><label htmlFor={p.id + "depende"}>Mostrar cuando</label><select id={p.id + "depende"} value={p.depende} onChange={e => actualizar(p.id, { depende: e.target.value })}><option value="">Siempre</option>{preguntas.slice(0, i).map(a => <option value={a.id} key={a.id}>{a.titulo}</option>)}</select></div>{p.depende && <div className="nero-campo"><label htmlFor={p.id + "condicion"}>Respuesta esperada (casilla: sí)</label><input id={p.id + "condicion"} value={p.respuesta} required onChange={e => actualizar(p.id, { respuesta: e.target.value })} /></div>}</div><div className="nero-acciones"><button className="nero-enlace" type="button" disabled={i === 0 || preguntas.some(a => a.depende)} onClick={() => { const copia = [...preguntas]; [copia[i - 1], copia[i]] = [copia[i], copia[i - 1]]; guardar(copia); }}>Subir campo</button><button className="nero-enlace" type="button" onClick={() => guardar(preguntas.filter(a => a.id !== p.id).map(a => a.depende === p.id ? { ...a, depende: "", respuesta: "" } : a))}>Eliminar campo</button></div></section>)}<button className="nero-boton nero-secundario" type="button" onClick={() => guardar([...preguntas, { id: crypto.randomUUID(), titulo: "", tipo: "texto", requerida: false, opciones: "", depende: "", respuesta: "" }])}>Añadir campo</button></fieldset>;
}

export function CompletarFormulario({ proceso = false }: { proceso?: boolean }) {
  const { registros, guardar } = useModulosDemo();
  const { usuarioActual } = useDemo();
  const hoy = useFechaActual();
  const disponibles = registros.filter(r => !r.archivado && r.clave === (proceso ? "infinity/procesos" : "comunicaciones/encuestas") && (proceso ? r.estado === "Preparado" : r.estado === "Activa en demo") && (!r.valores.fechaFin || r.valores.fechaFin >= hoy));
  const [seleccion, setSeleccion] = useState("");
  const [respuestas, setRespuestas] = useState<Valores>({});
  const [mensaje, setMensaje] = useState("");
  const [creado, setCreado] = useState("");
  const origen = disponibles.find(r => r.id === seleccion);
  const diseno = proceso ? origen : registros.find(r => r.id === origen?.valores.cuestionario);
  const preguntas = diseno ? leerDiseno(diseno.valores) : [];
  const visibles: Pregunta[] = [];
  for (const p of preguntas) if (!p.depende || (visibles.some(a => a.id === p.depende) && respuestas[p.depende] === p.respuesta)) visibles.push(p);
  return <section className="nero-tarjeta"><h2>{proceso ? "Completar un proceso disponible" : "Responder una encuesta"}</h2><div className="nero-campo"><label htmlFor="form-origen">Seleccionar formulario</label><select id="form-origen" value={seleccion} onChange={e => { setSeleccion(e.target.value); setRespuestas({}); setCreado(""); setMensaje(""); }}><option value="">Seleccionar</option>{disponibles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select></div>{!disponibles.length && <p>No hay formularios disponibles. Prepara un proceso o activa una encuesta con cuestionario.</p>}
    {origen && preguntas.length > 0 && <form key={seleccion} onSubmit={e => { e.preventDefault(); const datos = new FormData(e.currentTarget); const respuestasGuardadas = visibles.map(p => ({ pregunta: p.titulo, respuesta: p.tipo === "casilla" ? datos.has(p.id) ? "sí" : "no" : String(datos.get(p.id) || "") })); const resultado = guardar(proceso ? "infinity/solicitudes" : "comunicaciones/respuestas", { nombre: origen.nombre + " · respuesta", estado: proceso ? "Borrador" : "Registrada", archivos: [], valores: proceso ? { procesoDigital: origen.id, responsable: usuarioActual, descripcion: respuestasGuardadas.map(r => r.pregunta + ": " + r.respuesta).join("\n"), respuestas: JSON.stringify(respuestasGuardadas) } : { encuesta: origen.id, persona: origen.valores.anonima === "si" ? "" : usuarioActual, fecha: hoyISO(), descripcion: respuestasGuardadas.map(r => r.pregunta + ": " + r.respuesta).join("\n") } }); setMensaje(resultado.error || (proceso ? "Solicitud guardada. Abre el detalle para enviarla a validación." : "Respuesta registrada en esta demostración.")); setCreado(resultado.id || ""); }}>
      <p>{origen.valores.anonima === "si" ? "Respuesta sin nombre en la demostración. No constituye un servicio anónimo real." : "Respuesta asociada al participante de demostración."}</p>
      {visibles.map(p => <div className="nero-campo" key={p.id}><label htmlFor={p.id}>{p.titulo}{p.requerida ? " *" : ""}</label>{p.tipo === "opcion" ? <select name={p.id} id={p.id} required={p.requerida} value={respuestas[p.id] || ""} onChange={e => setRespuestas({ ...respuestas, [p.id]: e.target.value })}><option value="">Seleccionar</option>{p.opciones.split(";").map(o => o.trim()).filter(Boolean).map(o => <option key={o}>{o}</option>)}</select> : <input name={p.id} id={p.id} type={p.tipo === "casilla" ? "checkbox" : p.tipo === "fecha" ? "date" : p.tipo === "numero" ? "number" : "text"} required={p.requerida} step={p.tipo === "numero" ? "any" : undefined} onChange={e => setRespuestas({ ...respuestas, [p.id]: p.tipo === "casilla" ? e.target.checked ? "sí" : "no" : e.target.value })} />}</div>)}<button className="nero-boton" disabled={!!creado}>Registrar respuesta</button>
    </form>}{origen && !preguntas.length && <p>El formulario todavía no tiene campos definidos.</p>}<p role="status">{mensaje}</p>{creado && proceso && <Link className="nero-enlace" href={`/gestion/infinity/solicitudes?registro=${creado}`}>Abrir solicitud</Link>}
  </section>;
}
