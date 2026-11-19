import { type Modulo, listado, configuracion, informacion, texto, area, fecha, numero, opciones, referencia, casilla, responsable, sede, proceso, norma, descripcion, frecuencia, fechas, documento, tarea, evaluacion, auditoriaLog, medicion, estadisticas, configuracionSeguimiento } from "./definiciones";

export const gestionInterna: Modulo[] = [
  { id: "organizacion", titulo: "Organización", descripcion: "La estructura que sostiene el sistema de gestión.", secciones: [
    { id: "", titulo: "Estructura", propia: true },
    { id: "sedes", titulo: "Sedes", propia: true },
    { id: "procesos", titulo: "Procesos", propia: true },
    listado("normas", "Normas", "norma", [descripcion], ["Sistema de calidad · ejemplo", "Política ambiental · ejemplo"], ["Activa", "Inactiva"]),
    listado("activos", "Activos", "activo", [sede, texto("codigo", "Código"), opciones("tipo", "Tipo", ["Información", "Tecnología", "Instalación", "Otro"]), responsable, opciones("clasificacion", "Clasificación", ["Pública", "Interna", "Confidencial"]), descripcion], ["Repositorio documental · ejemplo"], ["Activo", "Inactivo"]),
    { id: "configuracion", titulo: "Configuración", propia: true },
  ] },
  { id: "personas", titulo: "Personas", descripcion: "Puestos, equipo, documentos y formación.", secciones: [
    { id: "usuarios", titulo: "Usuarios", propia: true }, { id: "puestos", titulo: "Puestos y permisos", propia: true },
    listado("documentacion", "Documentación", "documento de personal", [referencia("persona", "Persona", "usuarios", true), opciones("accion", "Acción", ["Solicitar", "Entregar", "Guardar"]), ...documento, casilla("lectura", "Requiere confirmación de lectura")]),
    listado("planes-documentales", "Planes documentales", "plan documental", [frecuencia, responsable, referencia("destinatario", "Destinatario", "usuarios"), descripcion]),
    listado("evaluaciones", "Evaluaciones", "evaluación", [referencia("persona", "Persona evaluada", "usuarios", true), ...evaluacion]),
    listado("formacion", "Formación", "acción formativa", [responsable, ...fechas, opciones("modalidad", "Modalidad", ["Presencial", "Virtual", "Mixta"]), numero("duracion", "Duración en horas"), area("objetivos", "Objetivos de la formación")], ["Inducción al sistema de gestión · ejemplo"], ["Planificada", "En curso", "Realizada", "Cancelada"]),
    informacion("campus", "Campus", [{ titulo: "Campus de formación", texto: "La planificación de capacitaciones se encuentra en Formación. El catálogo externo, la matrícula, la reproducción de cursos y la emisión de certificados requieren definir una plataforma y todavía no están integrados." }]),
    auditoriaLog,
  ] },
  { id: "documentos", titulo: "Documentos", descripcion: "Biblioteca, versiones y seguimiento documental.", secciones: [
    listado("controlados", "Controlados", "documento controlado", documento, ["Manual del sistema de gestión · ejemplo", "Procedimiento de revisión documental · ejemplo"], ["Borrador", "En revisión", "Aprobado", "Obsoleto"]),
    listado("no-controlados", "No controlados", "documento", [texto("carpeta", "Carpeta"), responsable, descripcion], ["Material de consulta · ejemplo"], ["Disponible", "Archivado"]),
    listado("registros", "Registros pendientes", "registro", [referencia("documento", "Documento de origen", "documentos/controlados", true), ...tarea]),
    configuracion([responsable, referencia("revisor", "Revisor por defecto", "usuarios"), referencia("aprobador", "Aprobador por defecto", "usuarios"), numero("conservacion", "Conservación en años", 1, 99), casilla("codificacion", "Codificación automática propuesta")]),
  ] },
  { id: "objetivos", titulo: "Objetivos", descripcion: "Metas, tareas y evidencia de resultados.", secciones: [
    listado("planificacion", "Planificación", "objetivo", [sede, proceso, norma, responsable, ...fechas, frecuencia, numero("meta", "Meta esperada"), texto("unidad", "Unidad"), descripcion], ["Mejorar el cumplimiento documental · ejemplo"], ["Planificado", "En seguimiento", "Cumplido", "No cumplido"]),
    listado("mediciones", "Mediciones", "medición", medicion("objetivos/planificacion"), [], ["Registrada", "Validada"]),
    listado("tareas", "Tareas", "tarea", [referencia("objetivo", "Objetivo", "objetivos/planificacion", true), ...tarea]),
    configuracionSeguimiento(),
  ] },
  { id: "riesgos", titulo: "Riesgos", descripcion: "Identificación, evaluación y seguimiento de controles.", secciones: [
    listado("evaluaciones", "Evaluaciones", "evaluación", [sede, proceso, norma, responsable, opciones("enfoque", "Enfoque", ["Procesos", "Activos", "Estructura libre"]), descripcion], ["Evaluación de procesos · ejemplo"], ["En preparación", "En evaluación", "Aprobada", "Cerrada"]),
    listado("registro", "Registro de riesgos", "riesgo", [referencia("evaluacion", "Evaluación", "riesgos/evaluaciones", true), proceso, area("causa", "Causa"), area("consecuencia", "Consecuencia"), { ...numero("probabilidad", "Probabilidad (1–5)", 1, 5), requerido: true }, { ...numero("impacto", "Impacto (1–5)", 1, 5), requerido: true }, responsable], ["Pérdida de evidencia documental · ejemplo"], ["Identificado", "En tratamiento", "Controlado"]),
    listado("controles", "Biblioteca de controles", "control", [responsable, frecuencia, opciones("naturaleza", "Naturaleza", ["Preventivo", "Detectivo", "Correctivo"]), descripcion], ["Revisión periódica de respaldos · ejemplo"], ["Propuesto", "Implementado", "En revisión"]),
    listado("tratamiento", "Tratamiento", "plan de tratamiento", [referencia("riesgo", "Riesgo", "riesgos/registro", true), referencia("control", "Control", "riesgos/controles"), ...tarea]),
    listado("seguimiento", "Seguimiento", "seguimiento", [referencia("control", "Control", "riesgos/controles", true), ...tarea, opciones("resultado", "Resultado", ["Sin incidencias", "Con incidencias"])]),
    listado("oportunidades", "Oportunidades", "oportunidad", [proceso, ...tarea, area("impactoEsperado", "Impacto esperado")], [], ["Propuesta", "En análisis", "Aceptada", "Rechazada", "Implementada"]),
    informacion("metodologia", "Metodología", [{ titulo: "Evaluación inicial de la maqueta", texto: "El registro calcula probabilidad × impacto, con escalas de 1 a 5. El resultado es orientativo para revisar la interfaz. La metodología aprobada, los umbrales, la eficacia de los controles y el cálculo del riesgo residual están pendientes de validación con el negocio." }]),
    configuracion([opciones("niveles", "Niveles de clasificación", ["3 niveles", "4 niveles", "5 niveles"]), responsable, casilla("propuestas", "Permitir propuestas de riesgos")]),
  ] },
  { id: "comunicaciones", titulo: "Comunicaciones", descripcion: "Mensajes internos, informes y cuestionarios.", secciones: [
    listado("internas", "Internas", "comunicación", [referencia("destinatario", "Destinatario", "usuarios", true), fecha("fechaFin", "Fecha límite de respuesta"), area("mensaje", "Mensaje"), casilla("confirmacion", "Solicitar confirmación de lectura")], ["Revisión del sistema de gestión · ejemplo"], ["Borrador", "Preparada", "Archivada"]),
    listado("informes", "Informes de cumplimiento", "informe", [responsable, opciones("prioridad", "Prioridad", ["Ordinaria", "Urgente"]), descripcion, area("acciones", "Acciones propuestas")]),
    listado("encuestas", "Encuestas", "encuesta", [referencia("cuestionario", "Cuestionario", "comunicaciones/cuestionarios", true), fecha("fechaFin", "Fecha límite"), casilla("anonima", "Respuesta anónima"), descripcion], [], ["Borrador", "Activa en demo", "Cerrada"]),
    listado("cuestionarios", "Cuestionarios", "cuestionario", [opciones("categoria", "Categoría", ["Satisfacción", "Evaluación", "Cumplimiento", "Otro"]), area("preguntas", "Preguntas (una por línea)")], ["Satisfacción interna · ejemplo"], ["Borrador", "Disponible"]),
    configuracion([casilla("lectura", "Solicitar lectura por defecto"), casilla("anonimas", "Permitir encuestas anónimas"), responsable]),
  ] },
  { id: "indicadores", titulo: "Indicadores", descripcion: "Resultados, metas y mediciones periódicas.", secciones: [
    listado("registro", "Indicadores", "indicador", [sede, proceso, norma, responsable, frecuencia, texto("unidad", "Unidad"), numero("meta", "Meta"), area("formula", "Definición y fórmula (descriptiva)"), ...fechas], ["Cumplimiento del plan documental · ejemplo", "Acciones cerradas en plazo · ejemplo"], ["Activo", "Inactivo"]),
    listado("mediciones", "Mediciones", "medición", medicion("indicadores/registro"), [], ["Registrada", "Validada"]),
    listado("agrupaciones", "Agrupaciones", "agrupación", [descripcion], ["Calidad · ejemplo"], ["Activa", "Inactiva"]),
    estadisticas, configuracionSeguimiento(),
  ] },
  { id: "no-conformidades", titulo: "No conformidades", descripcion: "Hallazgos, causas y acciones de mejora.", secciones: [
    listado("registro", "No conformidades", "no conformidad", [texto("referencia", "Referencia"), sede, proceso, norma, responsable, fecha("deteccion", "Fecha de detección"), fecha("fechaFin", "Fecha límite"), opciones("origen", "Origen", ["Auditoría interna", "Auditoría externa", "Reclamo", "Revisión interna"]), descripcion, area("causa", "Análisis de causa raíz"), area("correccion", "Corrección inmediata")], ["Registro sin evidencia de revisión · ejemplo"], ["Abierta", "En proceso", "Cerrada"]),
    listado("acciones", "Acciones correctivas", "acción correctiva", [referencia("hallazgo", "No conformidad", "no-conformidades/registro", true), ...tarea, referencia("evaluador", "Responsable de evaluar eficacia", "usuarios"), opciones("eficacia", "Eficacia", ["Pendiente de evaluación", "Eficaz", "No eficaz"])], [], ["Planificada", "En proceso", "Cerrada"]),
    listado("tareas", "Tareas", "tarea", [referencia("accion", "Acción correctiva", "no-conformidades/acciones", true), ...tarea]),
    configuracionSeguimiento(),
  ] },
  { id: "auditorias", titulo: "Auditorías", descripcion: "Planificación, ejecución y resultados.", secciones: [
    listado("planificacion", "Planificación", "auditoría", [opciones("tipo", "Tipo", ["Interna", "Externa", "Cliente", "Proveedor"]), norma, sede, proceso, responsable, ...fechas, area("alcance", "Alcance"), area("criterios", "Criterios"), texto("equipo", "Equipo auditor")], ["Revisión interna de calidad · ejemplo"], ["Programada", "En ejecución", "Pendiente de informe", "Finalizada"]),
    listado("resultados", "Resultados", "resultado de auditoría", [referencia("auditoria", "Auditoría", "auditorias/planificacion", true), area("conclusiones", "Conclusiones"), referencia("hallazgo", "No conformidad relacionada", "no-conformidades/registro"), area("oportunidades", "Oportunidades de mejora")], [], ["Borrador", "Revisado", "Aprobado"]),
    listado("tipos", "Tipos de auditoría", "tipo", [descripcion], ["Auditoría interna", "Auditoría externa"], ["Activo", "Inactivo"]),
    configuracionSeguimiento(),
  ] },
];
