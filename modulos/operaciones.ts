import { type Modulo, listado, configuracion, informacion, texto, area, fecha, numero, opciones, referencia, casilla, responsable, sede, descripcion, frecuencia, fechas, documento, tarea, evaluacion, auditoriaLog, estadisticas, configuracionSeguimiento, consulta } from "./definiciones";

function terceros(id: "proveedores" | "clientes", titulo: string, singular: string): Modulo {
  const tercero = referencia("tercero", singular, id + "/directorio", true);
  return { id, titulo, descripcion: "Documentación, evaluación y relaciones con " + titulo.toLowerCase() + ".", secciones: [
    listado("directorio", titulo, singular, [texto("identificacion", "Identificación fiscal"), { id: "correo", etiqueta: "Correo de contacto", tipo: "email" }, texto("telefono", "Teléfono"), opciones("riesgo", "Nivel de riesgo", ["Sin evaluar", "Bajo", "Medio", "Alto"]), descripcion], [id === "proveedores" ? "Suministros Andinos · ejemplo" : "Cliente Horizonte · ejemplo"], ["Pendiente", "En evaluación", "Aprobado", "Rechazado"]),
    listado("documentacion", "Documentación", "documento", [tercero, ...documento], [], ["Solicitado", "Recibido", "En revisión", "Aceptado", "Vencido"]),
    listado("evaluaciones", "Evaluaciones", "evaluación", [tercero, ...evaluacion]),
    listado("contratos", "Contratos", "contrato", [tercero, texto("referencia", "Referencia"), ...fechas, numero("importe", "Importe"), opciones("moneda", "Moneda", ["PEN", "USD"]), area("condiciones", "Términos y condiciones")], [], ["Borrador", "Pendiente de aceptación", "Aceptado", "Rechazado", "Finalizado"]),
    { ...listado("facturas", "Facturas", "factura", [tercero, texto("referencia", "Referencia", true), fecha("emision", "Fecha de emisión"), numero("importe", "Importe"), opciones("moneda", "Moneda", ["PEN", "USD"]), descripcion], [], ["Registrada", "En revisión", "Validada", "Rechazada"]), descripcion: "Registro de datos y adjuntos. Esta maqueta no emite comprobantes electrónicos." },
    ...(id === "proveedores" ? [listado("licitaciones", "Licitaciones", "licitación", [...fechas, numero("presupuesto", "Presupuesto"), opciones("modalidad", "Modalidad", ["Abierta", "Por invitación"]), area("requisitos", "Requisitos mínimos")], ["Servicio de mantenimiento · ejemplo"], ["Borrador", "Abierta", "En evaluación", "Adjudicada", "Cerrada"])] : []),
    ...(id === "clientes" ? [listado("ordenes-servicio", "Órdenes de servicio", "orden de servicio", [tercero, texto("referencia", "Referencia"), responsable, ...fechas, descripcion], [], ["Borrador", "En ejecución", "Finalizada", "Cancelada"])] : []),
    informacion("analytics", "Analytics", [{ titulo: "Consultas y monitorización", texto: "La referencia contempla búsquedas externas y consumo de créditos. La fuente de datos, el proveedor y las condiciones de integración están pendientes de definición. Todavía no se realizan consultas externas." }]),
    configuracion([casilla("portal", "Habilitar portal externo (preferencia de demo)"), casilla("documentacion", "Solicitar documentación al registrar"), casilla("evaluacion", "Requerir evaluación"), responsable]),
  ] };
}

export const operaciones: Modulo[] = [
  { id: "infinity", titulo: "Procesos digitales", descripcion: "Propuestas de formularios y circuitos de validación.", secciones: [
    consulta("disponibles", "Procesos disponibles", "Procesos preparados en la demostración, sin publicación externa."),
    consulta("validaciones", "Validaciones pendientes", "Solicitudes pendientes de revisión; no hay un motor automático de aprobación."),
    { ...listado("procesos", "Procesos", "proceso digital", [opciones("destino", "Destinatarios", ["Personal interno", "Proveedores", "Clientes"]), frecuencia, ...fechas, area("campos", "Campos propuestos (uno por línea)"), referencia("validador", "Primer validador", "usuarios"), referencia("segundoValidador", "Segundo validador", "usuarios")], ["Solicitud de revisión documental · ejemplo"], ["En diseño", "Preparado", "Archivado"]), descripcion: "Define la propuesta del formulario. Las reglas y la ejecución automática del circuito de aprobación están pendientes." },
    listado("solicitudes", "Solicitudes", "solicitud", [referencia("procesoDigital", "Proceso digital", "infinity/procesos", true), responsable, descripcion], [], ["Borrador", "Pendiente de validación", "Aprobada", "Rechazada"]),
    listado("packs", "Packs de procesos", "pack", [texto("procesos", "Procesos incluidos"), descripcion], [], ["Borrador", "Preparado"]),
    listado("categorias", "Categorías de inventario", "categoría", [descripcion], [], ["Activa", "Inactiva"]),
    listado("inventario", "Inventario", "producto", [referencia("categoria", "Categoría", "infinity/categorias"), numero("cantidad", "Cantidad inicial"), numero("minimo", "Stock mínimo"), texto("unidad", "Unidad"), numero("precio", "Precio de referencia"), descripcion], ["Material de capacitación · ejemplo"], ["Activo", "Inactivo"]),
    configuracion([referencia("validador", "Validador por defecto", "usuarios"), casilla("edicion", "Permitir editar resultados (preferencia)"), opciones("moneda", "Moneda", ["PEN", "USD"])]),
  ] },
  { id: "denuncias", titulo: "Canal de denuncias", descripcion: "Recepción y seguimiento de casos ficticios.", secciones: [
    informacion("previsualizar", "Previsualizar canal", [{ titulo: "Vista previa del canal de denuncias", texto: "La referencia muestra un enlace al canal público. En esta maqueta todavía no se publica una página externa: faltan controles de anonimato, privacidad, autorización e investigación." }]),
    listado("registro", "Comunicaciones recibidas", "caso de prueba", [opciones("origen", "Origen", ["Registro manual", "Canal público", "Correo"]), opciones("categoria", "Categoría", ["Ética", "Conflicto de interés", "Otro"]), casilla("anonima", "Identidad anónima"), area("hechos", "Descripción de los hechos"), responsable, fecha("fechaFin", "Fecha límite de atención")], [], ["Recibida", "En análisis", "En investigación", "Cerrada", "Descartada"]),
    listado("investigaciones", "Investigaciones", "investigación", [referencia("caso", "Caso", "denuncias/registro", true), ...tarea, area("conclusiones", "Conclusiones")], [], ["Propuesta", "Abierta", "En análisis", "Cerrada"]),
    estadisticas, auditoriaLog,
    configuracion([texto("nombreCanal", "Nombre del canal"), casilla("anonimas", "Permitir comunicaciones anónimas"), responsable, numero("plazo", "Plazo de atención en días", 1, 365)], "Preferencias de la maqueta. El canal público y las reglas de confidencialidad todavía no están implementados."),
  ] },
  terceros("proveedores", "Proveedores", "Proveedor"), terceros("clientes", "Clientes", "Cliente"),
  { id: "equipamientos", titulo: "Equipamientos", descripcion: "Equipos, calibración y mantenimiento.", secciones: [
    listado("equipos", "Equipos", "equipo", [texto("codigo", "Código"), texto("serie", "Número de serie"), texto("modelo", "Modelo"), sede, responsable, opciones("propiedad", "Propiedad", ["Propio", "Tercero"]), descripcion], ["Equipo de medición · ejemplo"], ["Disponible", "En uso", "En mantenimiento", "Fuera de servicio"]),
    listado("calibraciones", "Calibraciones", "calibración", [referencia("equipo", "Equipo", "equipamientos/equipos", true), responsable, frecuencia, ...fechas, opciones("resultado", "Resultado", ["Pendiente", "Conforme", "No conforme"]), descripcion]),
    listado("mantenimientos", "Mantenimiento", "mantenimiento", [referencia("equipo", "Equipo", "equipamientos/equipos", true), opciones("tipo", "Tipo", ["Preventivo", "Correctivo"]), ...tarea, numero("coste", "Coste previsto")]),
    configuracionSeguimiento(),
  ] },
  { id: "proyectos", titulo: "Proyectos", descripcion: "Hitos, tareas y seguimiento de avances.", secciones: [
    listado("registro", "Proyectos", "proyecto", [sede, responsable, ...fechas, numero("presupuesto", "Presupuesto previsto"), descripcion, area("recursos", "Recursos necesarios")], ["Implementación del sistema de gestión · ejemplo"], ["Pendiente de inicio", "En curso", "En pausa", "Finalizado"]),
    listado("hitos", "Hitos", "hito", [referencia("proyecto", "Proyecto", "proyectos/registro", true), ...tarea]),
    listado("tareas", "Tareas", "tarea", [referencia("proyecto", "Proyecto", "proyectos/registro", true), referencia("hito", "Hito", "proyectos/hitos"), ...tarea, numero("avance", "Avance (%)", 0, 100)]),
    estadisticas, configuracionSeguimiento(),
  ] },
  { id: "ayuda", titulo: "Ayuda", descripcion: "Guía del prototipo y estado de las funcionalidades.", secciones: [
    consulta("permisos", "Permisos asignados", "Visualiza las propuestas de acceso del puesto actual; no otorgan acceso real."),
    { ...configuracion([opciones("idioma", "Idioma preferido", ["Español", "Inglés"])], "Preferencia de demostración. La traducción de la aplicación todavía no está implementada."), id: "idioma", titulo: "Idioma de aplicación" },
    informacion("guia", "Guía de uso", [
      { titulo: "Empieza por la organización", texto: "Registra sedes y procesos, crea puestos y asígnalos a los usuarios. Los otros módulos utilizan estas referencias." },
      { titulo: "Explora los módulos", texto: "Cada pestaña permite consultar sus registros. En las pantallas de gestión puedes crear, editar, archivar y restaurar ejemplos. Los datos se conservan al navegar y se reinician al recargar." },
      { titulo: "Datos exclusivamente ficticios", texto: "No hay autenticación, almacenamiento remoto ni envío de correos. Las preferencias y estados sirven para revisar el flujo; no ejecutan aprobaciones reales ni protegen información." },
    ]),
    informacion("integraciones", "API SOFIDYA", [
      { titulo: "API e integración", texto: "La API servirá para integrar otros sistemas. Todavía no se publican endpoints ni se generan claves de acceso." },
      { titulo: "Servicios externos", texto: "Correo, campus, Analytics y emisión tributaria necesitan requisitos e integraciones independientes. Los registros de facturas de esta maqueta no emiten comprobantes." },
    ]),
    consulta("espacio", "Espacio consumido", "Tamaño de los archivos adjuntos durante esta sesión. No equivale al almacenamiento del servidor."),
    informacion("versiones", "Control de versiones", [{ titulo: "Frontend · primera versión", texto: "Navegación por módulos, estructura organizacional, formularios de prueba, filtros, detalle, archivos temporales y configuración local en memoria." }]),
    informacion("acuerdo", "Acuerdo de servicio", [{ titulo: "Acuerdo de servicio pendiente", texto: "La pantalla de referencia contiene las condiciones de uso de SOFIDYA. NERO necesitará un acuerdo de servicio propio, aprobado por la empresa. No se reproduce ni se presenta como vigente el contrato de otro proveedor." }]),
    informacion("tutoriales", "Videotutoriales", [{ titulo: "Biblioteca de ayuda", texto: "Sección preparada para publicar tutoriales propios de NERO. No se han definido ni subido videos de capacitación." }]),
    informacion("contrasena", "Modificar contraseña", [{ titulo: "Cambio de contraseña no disponible en la demo", texto: "La autenticación todavía no está implementada. No introduzcas contraseñas reales. El formulario de cambio se incorporará cuando existan usuarios autenticados y recuperación segura." }]),
  ] },
];
