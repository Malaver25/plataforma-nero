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

Todo sigue siendo una demostración: los datos se conservan al navegar y se reinician al recargar. Los estados se cambian manualmente. No hay autenticación, autorización en el servidor, base de datos, almacenamiento de archivos, correo ni aprobaciones reales.

Campus, Analytics, verificación de accesos y otras vistas sin servicio real muestran explícitamente su estado de demostración. El canal público de denuncias y los portales externos aún no están implementados. La sección de facturas solo registra información; no emite comprobantes. Las preferencias de los módulos no activan servicios externos.

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
- app/globals.css: Tailwind CSS 4, tokens de marca y estilos reutilizables hechos con `@apply` (sin hojas CSS separadas).
- Los componentes mantienen clases semánticas `nero-*` para evitar repetir grandes cadenas de utilidades y facilitar su mantenimiento.

Los componentes compartidos evitan copiar el mismo listado y formulario en decenas de archivos. Para cambiar los campos de una pestaña, empieza por su definición en modulos; para cambiar su comportamiento común, revisa componentes/modulos.

## Comprobaciones

    npm run build
    node scripts/comprobar-frontend.cjs
    node scripts/comprobar-frontend.cjs http://localhost:3000

El último comando necesita el servidor local encendido: comprueba el catálogo, sus referencias y que cada apartado devuelve contenido. No sustituye una revisión visual ni pruebas de seguridad.

## Supuestos y trabajo siguiente

- Una organización por empresa y un usuario interno vinculado a una empresa.
- Un puesto pertenece a una sede en esta primera versión.
- Roles generales y permisos por puesto son propuestas para validar con negocio.
- Se debe acordar el flujo real de revisión/aprobación documental, el alcance por sede y el acceso de terceros.
- Antes de usar datos reales: autenticación y permisos en servidor, persistencia, archivos privados, trazabilidad, copias de seguridad y pruebas de acceso.
