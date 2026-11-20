"use client";

import Link from "next/link";
import { useState } from "react";
import { useModulosDemo } from "@/contexto/modulos-demo";
import { nivelRiesgo } from "@/modulos/flujos";
import { useDemo } from "@/contexto/demostracion";

export default function MatrizRiesgos() {
  const { registros, configuraciones } = useModulosDemo();
  const { empresaActual } = useDemo();
  const niveles = Number.parseInt(configuraciones[empresaActual + ":riesgos/configuracion"]?.niveles || "5");
  const clasificar = (valor: number) => nivelRiesgo(valor, niveles);
  const [evaluacion, setEvaluacion] = useState("");
  const [residual, setResidual] = useState(false);
  const [celda, setCelda] = useState("");
  const riesgos = registros.filter(r => r.clave === "riesgos/registro" && !r.archivado && (!evaluacion || r.valores.evaluacion === evaluacion));
  const p = residual ? "probabilidadResidual" : "probabilidad", i = residual ? "impactoResidual" : "impacto";
  return <section className="nero-tarjeta"><h2>Matriz {residual ? "residual" : "inherente"}</h2><div className="nero-filtros"><div><label htmlFor="riesgo-evaluacion">Evaluación</label><select id="riesgo-evaluacion" value={evaluacion} onChange={e => { setEvaluacion(e.target.value); setCelda(""); }}><option value="">Todas las evaluaciones</option>{registros.filter(r => r.clave === "riesgos/evaluaciones" && !r.archivado).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select></div><label><input type="checkbox" checked={residual} onChange={e => { setResidual(e.target.checked); setCelda(""); }} /> Ver riesgo residual observado</label></div><p>Escala de referencia: probabilidad × impacto (1–5). El residual utiliza una nueva valoración documentada después de aplicar controles; no se deduce automáticamente de su eficacia.</p>
    <div className="nero-tabla"><table className="nero-matriz"><caption>Probabilidad (filas) × impacto (columnas). Selecciona una celda para filtrar.</caption><thead><tr><th>P / I</th>{[1, 2, 3, 4, 5].map(n => <th key={n}>{n}</th>)}</tr></thead><tbody>{[5, 4, 3, 2, 1].map(prob => <tr key={prob}><th>{prob}</th>{[1, 2, 3, 4, 5].map(imp => <td key={imp} data-nivel={clasificar(prob * imp)}><button aria-pressed={celda === `${prob}-${imp}`} onClick={() => setCelda(celda === `${prob}-${imp}` ? "" : `${prob}-${imp}`)}><strong>{prob * imp}</strong><span>{clasificar(prob * imp)}</span><small>{riesgos.filter(r => Number(r.valores[p]) === prob && Number(r.valores[i]) === imp).length} riesgos</small></button></td>)}</tr>)}</tbody></table></div>
    <button className="nero-enlace" onClick={() => setCelda("")}>Mostrar todos</button><ul className="nero-lista-resumen">{riesgos.filter(r => !celda || `${r.valores[p]}-${r.valores[i]}` === celda).map(r => <li key={r.id}><Link href={`/gestion/riesgos/registro?registro=${r.id}`} className="nero-enlace">{r.nombre}</Link><span>{r.valores[p] && r.valores[i] ? `${Number(r.valores[p]) * Number(r.valores[i])} · ${clasificar(Number(r.valores[p]) * Number(r.valores[i]))}` : "Pendiente de valorar"}</span></li>)}</ul>{!riesgos.length && <p className="nero-vacio">Crea riesgos dentro de una evaluación para visualizar la matriz.</p>}
  </section>;
}
