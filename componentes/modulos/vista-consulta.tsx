"use client";

import Link from "next/link";
import { useDemo } from "@/contexto/demostracion";
import { useModulosDemo } from "@/contexto/modulos-demo";
import { funcionesPuesto } from "@/datos-demo/organizacion";

function Tabla({ columnas, filas, vacio }: { columnas: string[]; filas: string[][]; vacio: string }) {
  return <div className="nero-tabla">
    <table>
      <thead><tr>{columnas.map((titulo) => <th scope="col" key={titulo}>{titulo}</th>)}</tr></thead>
      <tbody>{filas.map((fila, indice) => <tr key={indice}>{fila.map((valor, posicion) => <td key={posicion}>{valor || "—"}</td>)}</tr>)}</tbody>
    </table>
    {!filas.length && <p className="nero-vacio" role="status">{vacio}</p>}
  </div>;
}
function datosTamano(bytes: number) { return bytes < 1024 ? bytes + " B" : (bytes / 1024 / 1024).toFixed(2) + " MB"; }

export default function VistaConsulta({ clave }: { clave: string }) {
  const { empresaActual, usuarios, usuarioActual, puestos } = useDemo();
  const { registros } = useModulosDemo();
  const usuario = usuarios.find((item) => item.id === usuarioActual && item.empresaId === empresaActual);
  const puesto = puestos.find((item) => item.id === usuario?.puestoId && item.empresaId === empresaActual);
  const puestosEmpresa = puestos.filter((item) => item.empresaId === empresaActual);
  let columnas = ["Nombre", "Estado"];
  let filas: string[][] = [];
  let descripcion = "Consulta de demostración: no se conecta con servicios externos.";
  let vacio = "No hay elementos que mostrar en esta sesión.";
  let destino = "";
  let textoEnlace = "Abrir registros relacionados";

  if (clave === "personas/mis-documentos") {
    columnas = ["Documento", "Acción", "Estado"];
    filas = registros.filter((item) => item.clave === "personas/documentacion" && !item.archivado && item.valores.persona === usuarioActual)
      .map((item) => [item.nombre, item.valores.accion || "", item.estado]);
    descripcion = "Documentos de personal asignados al usuario seleccionado en la demostración.";
    destino = "/gestion/personas/documentacion";
  } else if (clave === "personas/verificacion-accesos") {
    columnas = ["Nombre", "Correo", "Estado"];
    filas = usuarios.filter((item) => item.empresaId === empresaActual && item.estado === "Pendiente")
      .map((item) => [item.nombre, item.correo, item.estado]);
    descripcion = "Usuarios pendientes de invitación. No verifica identidad, accesos ni aprobación administrativa.";
    destino = "/gestion/personas/usuarios";
  } else if (clave === "personas/mapa-permisos") {
    columnas = ["Puesto", "Función", "Nivel propuesto"];
    filas = puestosEmpresa.flatMap((item) => funcionesPuesto.map((funcion) => [item.nombre, funcion.nombre, item.permisos[funcion.id]]));
    descripcion = "Mapa de permisos declarados para los puestos. No restringe acceso a rutas ni datos.";
    destino = "/gestion/personas/puestos";
  } else if (clave === "objetivos/pendientes" || clave === "indicadores/pendientes") {
    const objetivos = clave.startsWith("objetivos");
    const origen = objetivos ? "objetivos/planificacion" : "indicadores/registro";
    const mediciones = objetivos ? "objetivos/mediciones" : "indicadores/mediciones";
    columnas = ["Elemento", "Estado", "Mediciones registradas"];
    filas = registros.filter((item) => item.clave === origen && !item.archivado && (objetivos ? ["Planificado", "En seguimiento"].includes(item.estado) : item.estado === "Activo"))
      .map((item) => ({ item, cantidad: registros.filter((medicion) => medicion.clave === mediciones && !medicion.archivado && medicion.valores.origen === item.id).length }))
      .filter(({ cantidad }) => cantidad === 0)
      .map(({ item, cantidad }) => [item.nombre, item.estado, String(cantidad)]);
    descripcion = "Pendientes orientativos: no hay calendario de vencimientos ni validación automática de mediciones.";
    destino = "/gestion/" + (objetivos ? "objetivos" : "indicadores") + "/mediciones";
    vacio = "Todos los elementos activos tienen alguna medición o aún no hay elementos registrados.";
  } else if (clave === "infinity/disponibles") {
    columnas = ["Proceso digital", "Estado"];
    filas = registros.filter((item) => item.clave === "infinity/procesos" && !item.archivado && item.estado === "Preparado")
      .map((item) => [item.nombre, item.estado]);
    descripcion = "Procesos listos en la maqueta, todavía no publicables ni ejecutables por externos.";
    destino = "/gestion/infinity/procesos";
  } else if (clave === "infinity/validaciones") {
    columnas = ["Solicitud", "Estado", "Proceso"];
    filas = registros.filter((item) => item.clave === "infinity/solicitudes" && !item.archivado && item.estado === "Pendiente de validación")
      .map((item) => [item.nombre, item.estado, registros.find((r) => r.id === item.valores.procesoDigital)?.nombre || "No encontrado"]);
    descripcion = "Solicitudes pendientes de validación según su estado manual. No se envían notificaciones ni se aprueban automáticamente.";
    destino = "/gestion/infinity/solicitudes";
  } else if (clave === "ayuda/permisos") {
    columnas = ["Función", "Nivel asignado al puesto"];
    filas = funcionesPuesto.map((funcion) => [funcion.nombre, puesto?.permisos[funcion.id] || "Sin puesto asignado"]);
    descripcion = "Usuario de prueba: " + (usuario?.nombre || "No seleccionado") + ". Estos niveles son informativos, no autorización de servidor.";
    destino = "/gestion/personas/puestos";
    textoEnlace = "Ver puestos y permisos";
  } else if (clave === "ayuda/espacio") {
    columnas = ["Archivo adjunto", "Apartado", "Tamaño temporal"];
    filas = registros.flatMap((item) => item.archivos.map((archivo) => [archivo.name, item.clave, datosTamano(archivo.size)]));
    const total = registros.reduce((acumulado, item) => acumulado + item.archivos.reduce((suma, archivo) => suma + archivo.size, 0), 0);
    descripcion = "Archivos actualmente en memoria: " + datosTamano(total) + ". Se perderán al recargar; no es espacio usado en un servidor.";
  }

  return <section className="nero-tarjeta">
    <p className="nero-demo">{descripcion}</p>
    <Tabla columnas={columnas} filas={filas} vacio={vacio} />
    {destino && <div className="nero-acciones"><Link href={destino} className="nero-boton nero-secundario">{textoEnlace}</Link></div>}
  </section>;
}
