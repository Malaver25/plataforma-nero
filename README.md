# NERO Gestión

Prototipo de frontend para un sistema de gestión organizacional. Identidad visual: amarillo, blanco y azul oscuro.

## Ejecutar

    npm install
    npm run dev

Abrir http://localhost:3000/gestion. La administración de empresas está en /plataforma.
Las antiguas rutas /panel, /panel/configuracion y /panel/usuarios redirigen a sus equivalentes nuevos.

## Estado del proyecto

Hay 16 módulos de gestión y una página de inicio. El catálogo incluye pantallas adicionales para cubrir apartados del documento SOFIDYA; el número de pestañas se obtiene del catálogo. Las pantallas de gestión permiten crear y editar registros ficticios, buscar, filtrar, consultar detalles, archivar, restaurar y exportar CSV. Los campos y estados están definidos por módulo. Los archivos se mantienen como objetos File en memoria y se pueden descargar durante la sesión.

Las sedes, procesos, puestos y usuarios forman la base de organización. Las referencias entre módulos permiten relacionar documentos y registros, auditorías y hallazgos, proyectos e hitos, entre otros.

Todo sigue siendo una demostración: los datos se conservan al navegar y se reinician al recargar. Documentos, solicitudes, auditorías y no conformidades tienen transiciones y validaciones locales. Otros estados se registran manualmente. No hay autenticación, autorización en el servidor, base de datos, almacenamiento de archivos ni correo real.

Los portales de terceros y el canal de denuncias tienen vistas internas de simulación; todavía no se publican ni autentican externos. Campus permite recursos propios temporales, matrícula y progreso de prueba; no integra un proveedor ni emite certificados oficiales. Analytics y verificación de accesos continúan sin servicio real. La sección de facturas registra información; no emite comprobantes.

## Flujos ampliados del frontend

- Inicio: indicadores, pendientes y fecha de corte; visibilidad de paneles configurable.
- Organización: procesos anidados, departamentos con padre y comprobación de ciclos. Puestos con requisitos, revisión y permisos propuestos por apartado.
- Documentos: biblioteca en árbol, búsqueda y estado, carga múltiple, revisión y aprobación simuladas por participante, historial de revisiones y nuevas versiones conservando adjuntos anteriores.
- Objetivos e indicadores: calendarios anuales, mediciones por periodo, pendientes por fecha, evolución gráfica, meta y rango. Las agrupaciones están conectadas con los indicadores.
- Riesgos: matriz filtrable, clasificación por niveles y cálculo de protección de cinco factores, residual y planificado para un control por riesgo. La valoración residual observada se muestra aparte del cálculo por vulnerabilidad.
- Comunicaciones: bandejas de prueba, destinatarios múltiples, confirmación de lectura, diseñador de preguntas y respuestas de encuestas.
- Procesos digitales: campos tipados, condiciones, formularios ejecutables y tres etapas de validación; inventario con entradas, salidas y control de existencias.
- No conformidades y auditorías: creación de registros relacionados desde el detalle, cierre condicionado a evidencia/eficacia y resultados aprobados. Los tipos de auditoría alimentan la planificación.
- Terceros: vista por cliente/proveedor, entrega de documentos, aceptación de contratos y presentación de ofertas ficticias.
- Denuncias: formulario interno de vista previa, código de seguimiento y respuesta para el comunicante. No es un canal anónimo real.
- Equipos: datos de garantía y uso, etiqueta QR descargable, calendario e intervenciones por periodo. El QR contiene identificación; no publica una ficha externa. Generación local con [node-qrcode](https://github.com/soldair/node-qrcode).
- Proyectos: avance consolidado, vínculos de hitos y tareas, calendario y copia como plantilla con fechas desplazadas y progreso reiniciado.
- Formación y ayuda: asistencia, catálogo interno, matrícula, videos temporales, recursos de lectura y validación del formulario de cambio de contraseña sin almacenar credenciales.

Los detalles y formularios aceptan enlaces con `?registro=ID` y `?crear=1`. Los enlaces dejan de encontrar registros creados en la sesión después de recargar, porque todavía no existe persistencia.

## Recorridos para revisar

### Organización y Personas

1. En `/plataforma/empresas/nueva`, crea una empresa ficticia y abre su invitación desde la ficha.
2. Acepta la invitación de prueba; abre la estructura de la empresa. Las claves de prueba no se guardan.
3. Crea una sede, un proceso y, si corresponde, subprocesos y departamentos de esa misma sede.
4. Crea un puesto, vincula sus procesos y configura los permisos propuestos. Se mantiene un puesto por sede.
5. Invita a un usuario seleccionando su puesto, acepta su invitación y comprueba la asignación en el listado.
6. Usa Editar para cambiar nombre, correo, rol o puesto. El administrador principal conserva su rol y sus datos se sincronizan con la ficha de empresa.
7. Usa Cambiar empresa en demo y, desde una ficha activa, Abrir empresa en la demo. Cambia el contexto al administrador principal sin recargar ni perder los datos temporales.

Las validaciones del proveedor comprueban formato y duplicados de correo/RUC de prueba, pertenencia de sedes/puestos/procesos, permisos admitidos y ciclos de jerarquía. No comprueban existencia tributaria ni sustituyen controles de servidor. El editor de procesos bloquea también los cambios de sede incompatibles con registros de módulos vinculados.

### Otros módulos

1. `/gestion/documentos/biblioteca`: crear carpeta y documento, adjuntar archivo, asignar revisor/aprobador, enviar, revisar, aprobar y crear una nueva versión.
2. `/gestion/indicadores/seguimiento`: abrir un periodo, guardar la medición y volver al calendario; los otros periodos deben seguir pendientes.
3. `/gestion/comunicaciones/cuestionarios`: diseñar preguntas; crear una encuesta activa y responderla desde `responder`.
4. `/gestion/infinity/procesos`: preparar formulario, completarlo en `ejecutar` y recorrer las validaciones desde el detalle de la solicitud.
5. `/gestion/proveedores/portal`: seleccionar tercero y probar documentos/contratos; para ofertas debe existir una licitación abierta.
6. `/gestion/proyectos/registro`: crear hitos/tareas y copiar el proyecto como plantilla desde su detalle.

## Estructura para estudiar el código

- app/gestion: páginas y rutas del sistema.
- app/plataforma: alta y administración de empresas.
- app/gestion/[...ruta]/page.tsx: resuelve las pestañas registradas en el catálogo; las rutas desconocidas muestran la página de no encontrado.
- componentes/estructura: cabecera, menú lateral y pestañas.
- componentes/organizacion: formularios de sedes, procesos y puestos.
- componentes/modulos: listados, detalle, formularios y configuración compartidos.
- contexto/demostracion.tsx: estado temporal de empresas, organización y usuarios.
- contexto/modulos-demo.tsx: estado temporal de los registros de los demás módulos.
- datos-demo: datos ficticios iniciales de la estructura.
- modulos/definiciones.ts: tipos de campos y constructores sencillos.
- modulos/gestion-interna.ts y modulos/operaciones.ts: campos, estados y apartados de cada módulo.
- modulos/ampliaciones.ts: relaciones y pantallas de los flujos especializados.
- modulos/flujos.ts: reglas puras de recurrencias, riesgo, inventario y transiciones.
- componentes/modulos/vista-especial.tsx: selecciona bibliotecas, calendarios, matrices, portales y formularios especializados.
- app/globals.css: Tailwind CSS 4, tokens de marca y estilos reutilizables hechos con `@apply` (sin hojas CSS separadas).
- Los componentes mantienen clases semánticas `nero-*` para evitar repetir grandes cadenas de utilidades y facilitar su mantenimiento.

Los componentes compartidos evitan copiar el mismo listado y formulario en decenas de archivos. Para cambiar los campos de una pestaña, empieza por su definición en modulos; para cambiar su comportamiento común, revisa componentes/modulos.

## Comprobaciones

    npm run build
    node scripts/comprobar-frontend.cjs
    node scripts/comprobar-frontend.cjs http://localhost:3000
    node scripts/comprobar-flujos.cjs
    node scripts/comprobar-organizacion.cjs

La comprobación del catálogo revisa sus referencias y duplicados. La variante con URL también comprueba que cada apartado devuelve contenido. No sustituye una revisión visual ni pruebas de seguridad.

La comprobación HTTP necesita el servidor encendido. `comprobar-flujos.cjs` no lo necesita: verifica recurrencias de fin de mes, mediciones por periodo, riesgo, condiciones de cierre, ciclos, revisión documental, versiones, existencias, copia de proyectos y separación de registros por empresa en el estado de demostración. Usa un arnés de estado para el proveedor; no sustituye pruebas de interacción en navegador ni de autorización real.

`comprobar-organizacion.cjs` ejercita el proveedor de Organización/Personas: alta y activación de una empresa nueva, creación de sus primeras sedes y procesos, jerarquías, puestos y permisos, invitación/asignación, edición de usuarios, protección del rol principal y cambio de contexto entre empresas. Incluye la regresión que impedía crear procesos nuevos cuando existían procesos raíz de otras sedes.

La revisión visual de este recorrido sigue pendiente. El acceso directo al navegador no estaba disponible y el intento de control de Windows fue detenido porque no pudo determinar la URL con suficiente confianza. No se hicieron más acciones en el navegador tras ese bloqueo.

## Supuestos y trabajo siguiente

- Una organización por empresa y un usuario interno vinculado a una empresa.
- Un puesto pertenece a una sede en esta primera versión.
- Roles generales y permisos por puesto son propuestas para validar con negocio.
- Se debe acordar el flujo real de revisión/aprobación documental, el alcance por sede y el acceso de terceros.
- Falta cerrar la equivalencia completa con las capturas: traducción integral, autorizaciones por carpeta/puesto, combinaciones de varios controles y métodos de activos, asignación multisede, importadores masivos específicos e informes PDF/Excel. El catálogo de pestañas no mide la terminación de esos flujos.
- Las preferencias que no se consumen todavía por un flujo son propuestas; no activan servicios externos. Algunas vistas de administración siguen usando el formulario compartido.
- La comprobación visual en escritorio/móvil queda pendiente: el puente del navegador no estuvo disponible durante esta ampliación. No se afirma haber probado todos los controles de las pantallas nuevas.
- Antes de usar datos reales: autenticación y permisos en servidor, persistencia, archivos privados, trazabilidad, copias de seguridad y pruebas de acceso.
