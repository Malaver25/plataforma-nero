// Definiciones de la maqueta. No sustituyen las reglas de negocio del servidor.
export type Campo = {
  id: string; etiqueta: string;
  tipo?: "texto" | "area" | "numero" | "fecha" | "email" | "seleccion" | "casilla";
  opciones?: string[]; requerido?: boolean; minimo?: number; maximo?: number; referencia?: string;
};
export type Seccion = {
  id: string; titulo: string; singular?: string; descripcion?: string; campos?: Campo[];
  estados?: string[]; ejemplos?: string[]; propia?: boolean;
  modo?: "registros" | "configuracion" | "estadisticas" | "informacion" | "lectura";
  contenido?: { titulo: string; texto: string }[];
};
export type Modulo = { id: string; titulo: string; descripcion: string; secciones: Seccion[] };

export const texto = (id: string, etiqueta: string, requerido = false): Campo => ({ id, etiqueta, requerido });
export const area = (id: string, etiqueta: string): Campo => ({ id, etiqueta, tipo: "area" });
export const fecha = (id: string, etiqueta: string, requerido = false): Campo => ({ id, etiqueta, tipo: "fecha", requerido });
export const numero = (id: string, etiqueta: string, minimo = 0, maximo?: number): Campo => ({ id, etiqueta, tipo: "numero", minimo, maximo });
export const opciones = (id: string, etiqueta: string, valores: string[], requerido = false): Campo => ({ id, etiqueta, tipo: "seleccion", opciones: valores, requerido });
export const referencia = (id: string, etiqueta: string, origen: string, requerido = false): Campo => ({ id, etiqueta, referencia: origen, tipo: "seleccion", requerido });
export const casilla = (id: string, etiqueta: string): Campo => ({ id, etiqueta, tipo: "casilla" });
export const responsable = referencia("responsable", "Responsable", "usuarios");
export const sede = referencia("sede", "Sede", "sedes");
export const proceso = referencia("proceso", "Proceso", "procesos");
export const norma = referencia("norma", "Norma relacionada", "organizacion/normas");
export const descripcion = area("descripcion", "Descripción");
export const frecuencia = opciones("frecuencia", "Frecuencia", ["Única", "Semanal", "Mensual", "Trimestral", "Semestral", "Anual"]);
export const fechas = [fecha("fechaInicio", "Fecha de inicio"), fecha("fechaFin", "Fecha límite")];
export const pendientes = ["Pendiente", "En proceso", "Completado"];
export const documento = [texto("codigo", "Código"), texto("version", "Versión"), norma, proceso, responsable, fecha("fechaFin", "Vencimiento"), descripcion];
export const tarea = [responsable, ...fechas, descripcion];
export const evaluacion = [responsable, fecha("fechaFin", "Fecha límite"), referencia("cuestionario", "Cuestionario", "comunicaciones/cuestionarios"), descripcion];
export const listado = (id: string, titulo: string, singular: string, campos: Campo[], ejemplos: string[] = [], estados = pendientes): Seccion => ({ id, titulo, singular, campos, ejemplos, estados });
export const configuracion = (campos: Campo[], descripcion = "Ajusta las preferencias de este módulo en la demostración."): Seccion => ({ id: "configuracion", titulo: "Configuración", modo: "configuracion", campos, descripcion });
export const estadisticas: Seccion = { id: "estadisticas", titulo: "Estadísticas", modo: "estadisticas" };
export const auditoriaLog: Seccion = { id: "accesos", titulo: "Historial de actividad", modo: "lectura", descripcion: "Cambios realizados durante esta demostración. No representa un registro de seguridad del servidor." };
export const medicion = (origen: string): Campo[] => [referencia("origen", "Elemento a medir", origen, true), fecha("fecha", "Fecha de medición", true), numero("valor", "Resultado"), texto("unidad", "Unidad"), responsable, area("observaciones", "Observaciones")];
export const configuracionSeguimiento = () => configuracion([responsable, frecuencia, numero("diasAviso", "Días de anticipación del aviso", 0, 365), casilla("alertas", "Activar avisos de vencimiento")]);
export const informacion = (id: string, titulo: string, contenido: { titulo: string; texto: string }[]): Seccion => ({ id, titulo, modo: "informacion", contenido });
