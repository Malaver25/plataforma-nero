import { type Modulo, type Campo, listado, referencia, opciones, texto, area, fecha, numero, casilla, responsable, frecuencia, descripcion } from "./definiciones";

export function ampliarModulos(modulos: Modulo[]): Modulo[] {
  const buscar = (clave: string) => { const [m, s] = clave.split("/"); return modulos.find(x => x.id === m)!.secciones.find(x => x.id === s)!; };
  const campos = (clave: string, nuevos: Campo[]) => {
    const s = buscar(clave); s.campos = [...(s.campos || []).filter(c => !nuevos.some(n => n.id === c.id)), ...nuevos];
  };
  const agregar = (id: string, seccion: ReturnType<typeof listado>) => modulos.find(m => m.id === id)!.secciones.push(seccion);
  buscar("organizacion/personalizacion").campos = [casilla("paneles", "Mostrar paneles de pendientes"), casilla("indicadores", "Mostrar indicadores de seguimiento")];
  buscar("organizacion/personalizacion").descripcion = "Elige qué bloques de seguimiento aparecen en tu inicio. Se conservan durante la sesión.";
  campos("organizacion/departamentos", [referencia("sede", "Sede", "sedes", true), referencia("padre", "Departamento superior", "organizacion/departamentos")]);
  campos("documentos/carpetas", [referencia("padre", "Carpeta superior", "documentos/carpetas"), responsable, referencia("revisor", "Revisor", "usuarios"), referencia("aprobador", "Aprobador", "usuarios")]);
  campos("documentos/controlados", [referencia("carpeta", "Carpeta", "documentos/carpetas"), referencia("revisor", "Revisor", "usuarios", true), referencia("aprobador", "Aprobador", "usuarios", true), numero("conservacion", "Conservación (años)", 1, 99), casilla("descarga", "Permitir descarga")]);
  buscar("documentos/controlados").estados = ["Borrador", "En revisión", "Pendiente de aprobación", "Aprobado", "Obsoleto"];
  for (const id of ["objetivos", "indicadores"]) {
    campos(id + "/" + (id === "objetivos" ? "planificacion" : "registro"), [numero("minimo", "Resultado mínimo esperado"), numero("maximo", "Resultado máximo esperado"), referencia("seguimiento", "Responsable de seguimiento", "usuarios"), area("fuente", "Fuente de información")]);
    campos(id + "/mediciones", [fecha("periodo", "Fecha programada que cubre esta medición")]);
  }
  campos("indicadores/registro", [referencia("agrupacion", "Agrupación", "indicadores/agrupaciones"), opciones("tipo", "Tipo de indicador", ["Numérico", "KRI"])]);
  campos("auditorias/planificacion", [referencia("tipo", "Tipo de auditoría", "auditorias/tipos", true), texto("horaInicio", "Hora de inicio (HH:MM)"), texto("horaFin", "Hora final (HH:MM)"), frecuencia, area("objetivo", "Objetivo"), area("competencias", "Competencias del equipo")]);
  campos("riesgos/registro", [referencia("control", "Control aplicado", "riesgos/controles"), numero("probabilidadResidual", "Probabilidad residual observada (1–5)", 1, 5), numero("impactoResidual", "Impacto residual observado (1–5)", 1, 5)]);
  campos("riesgos/controles", [numero("eficacia", "Eficacia evaluada (%)", 0, 100), area("evidencia", "Evidencia de eficacia")]);
  campos("riesgos/controles", [opciones("categoriaControl", "Categoría del control", ["Específico", "Genérico"], true), ...[["aplicacion", "Grado de aplicación"], ["ejecucion", "Frecuencia y seguimiento"], ["responsabilidad", "Definición del responsable"], ["prevencion", "Carácter preventivo"], ["documentacion", "Documentación y evidencia"]].map(([id, label]) => numero(id, label + " (1–5)", 1, 5))]);
  campos("riesgos/registro", [referencia("controlPlanificado", "Control planificado", "riesgos/controles")]);
  buscar("riesgos/metodologia").contenido = [{ titulo: "Método de cinco factores de la referencia", texto: "Riesgo inherente = probabilidad × impacto. El grado de protección es el promedio redondeado de aplicación, ejecución, responsabilidad, prevención y documentación. Para grados 1 a 5, la vulnerabilidad específica es 1; 0,8; 0,6; 0,4; 0,2, y la genérica es 1; 0,95; 0,9; 0,85; 0,8. El residual es el inherente × vulnerabilidad, redondeado. El planificado usa el control previsto. Esta versión calcula un control aplicado y uno planificado por riesgo; la combinación de varios controles requiere acordar la regla." }, { titulo: "Clasificación", texto: "La matriz observada utiliza probabilidad e impacto de 1 a 5. Las bandas de tres y cuatro niveles son propuestas del prototipo; la tabla de cinco niveles sigue la referencia. Valida la metodología con la organización antes de emplearla para decisiones reales." }];
  campos("comunicaciones/internas", [{ ...referencia("destinatarios", "Destinatarios", "usuarios", true), multiple: true }, referencia("cuestionario", "Cuestionario adjunto", "comunicaciones/cuestionarios")]);
  agregar("comunicaciones", listado("respuestas", "Respuestas de encuestas", "respuesta", [referencia("encuesta", "Encuesta", "comunicaciones/encuestas", true), referencia("persona", "Participante", "usuarios"), fecha("fecha", "Fecha", true), descripcion], [], ["Registrada"]));
  buscar("comunicaciones/internas").campos = buscar("comunicaciones/internas").campos!.filter(c => c.id !== "destinatario");
  buscar("comunicaciones/internas").estados = ["Borrador", "Enviada en demo", "Archivada"];
  campos("personas/formacion", [{ ...referencia("participantes", "Participantes", "usuarios"), multiple: true }, area("temario", "Temario"), texto("lugar", "Lugar o aula virtual"), opciones("eficacia", "Evaluación de eficacia", ["Pendiente", "Eficaz", "No eficaz"])]);
  campos("personas/planes-documentales", [fecha("fechaInicio", "Primera solicitud"), fecha("fechaFin", "Fin del plan"), referencia("documento", "Documento de referencia", "documentos/controlados")]);
  campos("infinity/procesos", [referencia("tercerValidador", "Tercer validador", "usuarios"), casilla("edicion", "Permitir editar respuestas")]);
  campos("infinity/packs", [{ ...referencia("procesos", "Procesos incluidos", "infinity/procesos"), multiple: true }]);
  buscar("infinity/solicitudes").estados = ["Borrador", "Pendiente de validación", "Segunda validación", "Tercera validación", "Aprobada", "Rechazada"];
  agregar("infinity", listado("movimientos", "Movimientos de inventario", "movimiento", [referencia("producto", "Producto", "infinity/inventario", true), opciones("tipo", "Movimiento", ["Entrada", "Salida"], true), { ...numero("cantidad", "Cantidad", 0.01), requerido: true }, fecha("fecha", "Fecha", true), responsable, descripcion], [], ["Registrado"]));
  for (const id of ["proveedores", "clientes"]) {
    campos(id + "/directorio", [texto("pais", "País"), texto("direccion", "Dirección"), texto("categoria", "Categoría de servicio")]);
    campos(id + "/evaluaciones", [numero("resultado", "Resultado (%)", 0, 100), opciones("dictamen", "Dictamen", ["Pendiente", "Homologado", "Condicionado", "No homologado"])]);
    modulos.find(m => m.id === id)!.secciones.push({ id: "portal", titulo: "Vista del portal", modo: "especial" });
  }
  agregar("proveedores", listado("ofertas", "Ofertas recibidas", "oferta", [referencia("licitacion", "Licitación", "proveedores/licitaciones", true), referencia("tercero", "Proveedor", "proveedores/directorio", true), numero("importe", "Importe ofertado"), descripcion], [], ["Presentada", "Seleccionada", "Descartada"]));
  campos("equipamientos/equipos", [texto("fabricante", "Fabricante"), texto("ubicacion", "Ubicación"), fecha("garantia", "Fin de garantía"), numero("coste", "Coste de adquisición"), area("instrucciones", "Instrucciones y seguridad")]);
  campos("equipamientos/calibraciones", [fecha("realizada", "Fecha de realización"), area("incidencias", "Incidencias y resultado")]);
  campos("equipamientos/mantenimientos", [frecuencia, fecha("realizada", "Fecha de realización"), area("informe", "Informe del trabajo")]);
  agregar("equipamientos", listado("intervenciones", "Intervenciones realizadas", "intervención", [referencia("calibracion", "Programación de calibración", "equipamientos/calibraciones"), referencia("mantenimiento", "Programación de mantenimiento", "equipamientos/mantenimientos"), fecha("periodo", "Fecha programada", true), fecha("fecha", "Fecha de realización", true), opciones("resultado", "Resultado", ["Conforme", "No conforme"], true), responsable, area("informe", "Informe e incidencias")], [], ["Realizada"]));
  campos("auditorias/resultados", [fecha("periodo", "Fecha programada"), fecha("fecha", "Fecha de realización")]);
  campos("proyectos/registro", [referencia("seguimiento", "Responsable de seguimiento", "usuarios"), referencia("medicion", "Responsable de medición", "usuarios"), numero("costeReal", "Coste real acumulado")]);
  campos("no-conformidades/registro", [numero("coste", "Coste estimado"), casilla("repetitiva", "Es repetitiva"), referencia("proveedor", "Proveedor relacionado", "proveedores/directorio")]);
  campos("no-conformidades/registro", [referencia("auditoria", "Auditoría de origen", "auditorias/planificacion")]);
  campos("no-conformidades/acciones", [fecha("fechaEvaluacion", "Fecha de evaluación de eficacia"), area("evidencia", "Evidencia de eficacia")]);
  agregar("personas", listado("asistencias", "Asistencia y formación", "asistencia", [referencia("formacion", "Acción formativa", "personas/formacion", true), referencia("persona", "Participante", "usuarios", true), opciones("asistencia", "Asistencia", ["Pendiente", "Asistió", "Ausente"]), numero("nota", "Resultado (%)", 0, 100)], [], ["Pendiente", "Completado"]));
  for (const id of ["objetivos", "indicadores", "auditorias", "equipamientos", "proyectos", "personas"]) modulos.find(m => m.id === id)!.secciones.push({ id: "seguimiento", titulo: "Calendario y seguimiento", modo: "especial" });
  for (const [id, seccion, titulo] of [["documentos", "biblioteca", "Biblioteca documental"], ["riesgos", "matriz", "Matriz de riesgos"], ["comunicaciones", "bandeja", "Bandeja de mensajes"], ["comunicaciones", "responder", "Responder encuesta"], ["infinity", "ejecutar", "Completar proceso"]]) modulos.find(m => m.id === id)!.secciones.push({ id: seccion, titulo, modo: "especial" });
  buscar("denuncias/previsualizar").modo = "especial";
  for (const [modulo, id] of [["personas", "campus"], ["ayuda", "tutoriales"], ["ayuda", "contrasena"]]) buscar(modulo + "/" + id).modo = "especial";
  agregar("personas", listado("cursos", "Recursos del campus", "curso", [descripcion, area("contenido", "Contenido y material de estudio"), numero("duracion", "Duración estimada (horas)")], [], ["Borrador", "Disponible"]));
  agregar("personas", listado("matriculas", "Matrículas y progreso", "matrícula", [referencia("curso", "Curso", "personas/cursos", true), referencia("persona", "Participante", "usuarios", true), numero("avance", "Avance (%)", 0, 100)], [], ["En curso", "Completado"]));
  agregar("ayuda", listado("recursos", "Gestionar tutoriales", "tutorial", [descripcion, area("contenido", "Pasos y transcripción del video")], [], ["Borrador", "Disponible"]));
  campos("denuncias/registro", [area("respuestaPublica", "Respuesta visible para el comunicante")]);
  buscar("infinity/procesos").descripcion = "Diseña campos, condiciones y responsables. Prepara el proceso para completarlo y recorrer sus validaciones en esta sesión.";
  buscar("denuncias/configuracion").descripcion = "Configura la vista previa. La publicación externa y la confidencialidad requieren backend.";
  return modulos;
}
