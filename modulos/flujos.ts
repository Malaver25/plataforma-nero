// Reglas del prototipo: funciones puras compartidas por la interfaz y sus pruebas.
export type Dato = { id: string; clave: string; nombre: string; estado: string; archivado: boolean; valores: Record<string, string> };
export const cerrado = (estado: string) => ["Completado", "Finalizado", "Finalizada", "Cerrada", "Cancelada", "Cancelado", "Obsoleto"].includes(estado);
export const hoyISO = () => new Date().toISOString().slice(0, 10);
export function fechasProgramadas(inicio: string, fin: string, frecuencia: string, hasta: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio) || !hasta || inicio > hasta) return [];
  const limite = fin && fin < hasta ? fin : hasta;
  const base = new Date(inicio + "T00:00:00Z");
  if (!Number.isFinite(base.getTime())) return [];
  const meses: Record<string, number> = { Mensual: 1, Trimestral: 3, Semestral: 6, Anual: 12 };
  const salida: string[] = [];
  for (let n = 0; n < 600; n++) {
    let fecha: Date;
    if (meses[frecuencia]) {
      const mes = base.getUTCMonth() + n * meses[frecuencia];
      const ultimo = new Date(Date.UTC(base.getUTCFullYear(), mes + 1, 0)).getUTCDate();
      fecha = new Date(Date.UTC(base.getUTCFullYear(), mes, Math.min(base.getUTCDate(), ultimo)));
    } else fecha = new Date(base.getTime() + n * 7 * 86400000);
    const iso = fecha.toISOString().slice(0, 10);
    if (iso > limite) break;
    salida.push(iso);
    if (frecuencia !== "Semanal" && !meses[frecuencia]) break;
  }
  return salida;
}
export function medicionesPendientes(elemento: Dato, mediciones: Dato[], hasta: string) {
  const fechas = fechasProgramadas(elemento.valores.fechaInicio, elemento.valores.fechaFin, elemento.valores.frecuencia, hasta);
  // Una medición pertenece a un periodo explícito o al periodo que contiene su fecha.
  const cubiertos = new Set(mediciones.filter(m => !m.archivado && m.valores.origen === elemento.id && m.valores.fecha <= hasta).map(m =>
    m.valores.periodo || fechas.filter(f => f <= m.valores.fecha).at(-1)));
  return fechas.filter(f => !cubiertos.has(f));
}
export function stock(producto: Dato, registros: Dato[]) {
  return Number(producto.valores.cantidad || 0) + registros.filter(r => r.clave === "infinity/movimientos" && !r.archivado && r.valores.producto === producto.id)
    .reduce((suma, r) => suma + (r.valores.tipo === "Salida" ? -1 : 1) * Number(r.valores.cantidad || 0), 0);
}
export function nivelRiesgo(valor: number, niveles = 5) {
  if (niveles === 3) return valor >= 15 ? "Alto" : valor >= 5 ? "Medio" : "Bajo";
  if (niveles === 4) return valor >= 20 ? "Muy alto" : valor >= 10 ? "Alto" : valor >= 5 ? "Medio" : "Bajo";
  return valor >= 20 ? "Muy alto" : valor >= 10 ? "Alto" : valor >= 5 ? "Medio" : valor >= 3 ? "Bajo" : "Muy bajo";
}
export function avanceProyecto(id: string, registros: Dato[]) {
  const tareas = registros.filter(r => r.clave === "proyectos/tareas" && !r.archivado && r.valores.proyecto === id);
  return tareas.length ? Math.round(tareas.reduce((s, t) => s + (t.estado === "Completado" ? 100 : Number(t.valores.avance || 0)), 0) / tareas.length) : 0;
}
export function proteccionControl(valores: Record<string, string>) {
  const factores = ["aplicacion", "ejecucion", "responsabilidad", "prevencion", "documentacion"].map(k => Number(valores[k]));
  if (factores.some(n => !Number.isInteger(n) || n < 1 || n > 5)) return undefined;
  const grado = Math.round(factores.reduce((s, n) => s + n, 0) / 5);
  const tabla = valores.categoriaControl === "Genérico" ? [1, 0.95, 0.9, 0.85, 0.8] : [1, 0.8, 0.6, 0.4, 0.2];
  return { grado, vulnerabilidad: tabla[grado - 1] };
}
export function riesgoConControl(probabilidad: number, impacto: number, control?: Dato) {
  const proteccion = control && proteccionControl(control.valores);
  return proteccion ? Math.round(probabilidad * impacto * proteccion.vulnerabilidad) : undefined;
}
export const transiciones: Record<string, Record<string, string[]>> = {
  "documentos/controlados": { Borrador: ["En revisión"], "En revisión": ["Borrador", "Pendiente de aprobación"], "Pendiente de aprobación": ["Borrador", "Aprobado"], Aprobado: ["Obsoleto"], Obsoleto: [] },
  "no-conformidades/registro": { Abierta: ["En proceso"], "En proceso": ["Abierta", "Cerrada"], Cerrada: ["Abierta"] },
  "no-conformidades/acciones": { Planificada: ["En proceso"], "En proceso": ["Cerrada"], Cerrada: ["En proceso"] },
  "auditorias/planificacion": { Programada: ["En ejecución"], "En ejecución": ["Pendiente de informe"], "Pendiente de informe": ["Finalizada"], Finalizada: [] },
  "infinity/solicitudes": { Borrador: ["Pendiente de validación"], "Pendiente de validación": ["Segunda validación", "Rechazada"], "Segunda validación": ["Tercera validación", "Rechazada"], "Tercera validación": ["Aprobada", "Rechazada"], Aprobada: [], Rechazada: ["Borrador"] },
};
export function validarTransicion(registro: Dato, destino: string, registros: Dato[]) {
  if (!transiciones[registro.clave]?.[registro.estado]?.includes(destino)) return "Transición no disponible desde este estado.";
  if (registro.clave === "documentos/controlados" && destino === "En revisión" && (!registro.valores.revisor || !registro.valores.aprobador)) return "Asigna revisor y aprobador antes de enviar el documento.";
  if (registro.clave === "no-conformidades/acciones" && destino === "Cerrada" && (registro.valores.eficacia !== "Eficaz" || !registro.valores.evidencia || !registro.valores.fechaEvaluacion)) return "Registra la fecha, evidencia y resultado eficaz antes de cerrar la acción.";
  if (registro.clave === "no-conformidades/registro" && destino === "Cerrada") {
    const acciones = registros.filter(r => !r.archivado && r.clave === "no-conformidades/acciones" && r.valores.hallazgo === registro.id);
    if (!acciones.length || acciones.some(a => a.estado !== "Cerrada" || a.valores.eficacia !== "Eficaz")) return "Completa y evalúa las acciones correctivas antes del cierre.";
  }
  if (registro.clave === "auditorias/planificacion" && destino === "Finalizada" && !registros.some(r => !r.archivado && r.clave === "auditorias/resultados" && r.valores.auditoria === registro.id && r.estado === "Aprobado")) return "Falta un resultado aprobado de esta auditoría.";
}
