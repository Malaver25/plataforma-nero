"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/contexto/demostracion";
import { roles } from "@/datos-demo/usuarios";
import RolesEquipo from "./roles-equipo";

export default function UsuariosPage() {
  const { empresas, usuarios, empresaActual, usuarioActual, puestos, asignarPuesto } = useDemo();
  const puestosEmpresa = puestos.filter((puesto) => puesto.empresaId === empresaActual);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const empresa = empresas.find((item) => item.id === empresaActual)!;
  const equipo = usuarios.filter((usuario) => usuario.empresaId === empresaActual);
  const [busqueda, setBusqueda] = useState("");
  const [rol, setRol] = useState("");
  const [estado, setEstado] = useState("");
  const visibles = equipo.filter((usuario) =>
    `${usuario.nombre} ${usuario.correo}`.toLowerCase().includes(busqueda.trim().toLowerCase()) &&
    (!rol || usuario.rol === rol) && (!estado || usuario.estado === estado),
  );

  return (
    <main>
      <div className="nero-titulo">
        <div><p className="nero-sobretitulo">{empresa.nombreComercial || empresa.razonSocial}</p><h1>Usuarios de empresa</h1><p>Consulta tu equipo y las invitaciones pendientes.</p></div>
        <Link className="nero-boton" href="/gestion/personas/usuarios/invitar">+ Invitar usuario</Link>
      </div>
      <dl className="nero-resumen">
        <div className="nero-tarjeta"><dt>Miembros del equipo</dt><dd>{equipo.length}</dd></div>
        <div className="nero-tarjeta"><dt>Activos</dt><dd>{equipo.filter((usuario) => usuario.estado === "Activo").length}</dd></div>
        <div className="nero-tarjeta"><dt>Invitaciones pendientes</dt><dd>{equipo.filter((usuario) => usuario.estado === "Pendiente").length}</dd></div>
      </dl>
      {mensaje && <p className="nero-exito" role="status">{mensaje}</p>}
      {error && <p className="nero-error" role="alert">{error}</p>}
      <section className="nero-tarjeta nero-seccion" aria-label="Listado de usuarios">
        <div className="nero-filtros">
          <div><label htmlFor="buscar-usuario">Buscar usuario</label><input id="buscar-usuario" type="search" placeholder="Nombre o correo" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div>
          <div><label htmlFor="filtro-rol">Rol</label><select id="filtro-rol" value={rol} onChange={(e) => setRol(e.target.value)}><option value="">Todos los roles</option>{roles.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div><label htmlFor="filtro-estado">Estado</label><select id="filtro-estado" value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Todos los estados</option><option>Activo</option><option>Pendiente</option></select></div>
        </div>
        <div className="nero-tabla">
          <table>
            <caption className="sr-only">Usuarios de {empresa.razonSocial}</caption>
            <thead><tr><th scope="col">Usuario</th><th scope="col">Rol general</th><th scope="col">Puesto</th><th scope="col">Estado</th><th scope="col">Invitación</th></tr></thead>
            <tbody>{visibles.map((usuario) => (
              <tr key={usuario.id}>
                <td><strong>{usuario.nombre}</strong>{usuario.id === usuarioActual && <span className="nero-tu">Tú</span>}<small>{usuario.correo}</small></td>
                <td>{usuario.rol}{usuario.principal && <small>Administrador inicial</small>}</td>
                <td><select className="nero-selector-puesto" aria-label={`Puesto de ${usuario.nombre}`} value={usuario.puestoId || ""} onChange={(event) => {
                  const resultado = asignarPuesto(usuario.id, event.target.value);
                  setError(resultado.error || "");
                  setMensaje(resultado.error ? "" : `Puesto actualizado para ${usuario.nombre} en la demostración.`);
                }}><option value="">Sin puesto asignado</option>{puestosEmpresa.map((puesto) => <option key={puesto.id} value={puesto.id}>{puesto.nombre}</option>)}</select></td>
                <td><span className="nero-estado" data-estado={usuario.estado}>{usuario.estado}</span></td>
                <td>{usuario.estado === "Pendiente" ? <Link className="nero-enlace" href={`/aceptar-invitacion?usuario=${usuario.id}`} aria-label={`Probar invitación de ${usuario.nombre}`}>Probar invitación →</Link> : <span className="nero-texto-secundario">Aceptada</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {visibles.length === 0 && <div className="nero-vacio" role="status"><p>No se encontraron usuarios con esos filtros.</p><button type="button" className="nero-enlace" onClick={() => { setBusqueda(""); setRol(""); setEstado(""); }}>Limpiar filtros</button></div>}
      </section>
      <p className="nero-demo">Los roles generales son provisionales. Puedes configurar los <Link className="nero-enlace" href="/gestion/personas/puestos">puestos y sus niveles de acceso</Link>; la autorización en el servidor todavía está pendiente.</p>
      <RolesEquipo />
    </main>
  );
}
