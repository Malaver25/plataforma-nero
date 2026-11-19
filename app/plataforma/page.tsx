"use client";

import Link from "next/link";
import { useDemo } from "@/contexto/demostracion";

export default function InicioPlataforma() {
  const { empresas, usuarios } = useDemo();
  const activas = empresas.filter((empresa) => empresa.estado === "Activa");
  const pendientes = empresas.filter((empresa) => empresa.estado === "Pendiente");
  const invitaciones = usuarios.filter((usuario) => usuario.estado === "Pendiente");

  return (
    <main>
      <div className="nero-titulo">
        <div><p className="nero-sobretitulo">Panel de plataforma</p><h1>Resumen general</h1><p>Una vista del estado de las empresas y sus invitaciones.</p></div>
        <Link href="/plataforma/empresas/nueva" className="nero-boton">+ Crear empresa</Link>
      </div>

      <dl className="nero-resumen nero-resumen-cuatro">
        <div className="nero-tarjeta"><dt>Empresas registradas</dt><dd>{empresas.length}</dd></div>
        <div className="nero-tarjeta"><dt>Empresas activas</dt><dd>{activas.length}</dd></div>
        <div className="nero-tarjeta"><dt>Pendientes de activación</dt><dd>{pendientes.length}</dd></div>
        <div className="nero-tarjeta"><dt>Invitaciones pendientes</dt><dd>{invitaciones.length}</dd></div>
      </dl>

      <section className="nero-tarjeta nero-seccion" aria-labelledby="titulo-invitaciones">
        <div className="nero-seccion-cabecera"><h2 id="titulo-invitaciones">Invitaciones por aceptar</h2><span className="nero-contador">{invitaciones.length}</span></div>
        <p className="nero-texto-secundario">Incluye administradores iniciales y usuarios invitados por cada empresa.</p>
        {invitaciones.length ? (
          <div className="nero-tabla">
            <table>
              <caption className="sr-only">Invitaciones pendientes de todas las empresas de prueba</caption>
              <thead><tr><th scope="col">Invitado</th><th scope="col">Empresa</th><th scope="col">Rol</th><th scope="col">Acción</th></tr></thead>
              <tbody>{invitaciones.map((usuario) => {
                const empresa = empresas.find((item) => item.id === usuario.empresaId)!;
                return (
                  <tr key={usuario.id}>
                    <td><strong>{usuario.nombre}</strong><small>{usuario.correo}</small></td>
                    <td><Link className="nero-enlace" href={`/plataforma/empresas/${empresa.id}`}>{empresa.nombreComercial || empresa.razonSocial}</Link></td>
                    <td>{usuario.rol}</td>
                    <td><Link className="nero-enlace" href={`/aceptar-invitacion?usuario=${usuario.id}`} aria-label={`Probar invitación de ${usuario.nombre}`}>Probar invitación →</Link></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        ) : <p className="nero-vacio">Todas las invitaciones de prueba fueron aceptadas.</p>}
      </section>

      <div className="nero-columnas">
        <section className="nero-tarjeta">
          <div className="nero-seccion-cabecera"><h2>Empresas</h2><Link className="nero-enlace" href="/plataforma/empresas">Ver todas →</Link></div>
          <ul className="nero-lista-resumen">{empresas.slice(-4).reverse().map((empresa) => (
            <li key={empresa.id}>
              <div><Link className="nero-enlace" href={`/plataforma/empresas/${empresa.id}`}>{empresa.nombreComercial || empresa.razonSocial}</Link><small>{empresa.administrador}</small></div>
              <span className="nero-estado" data-estado={empresa.estado}>{empresa.estado}</span>
            </li>
          ))}</ul>
        </section>
        <section className="nero-tarjeta">
          <h2>Accesos rápidos</h2>
          <div className="nero-accesos">
            <Link href="/plataforma/empresas/nueva"><strong>Crear una empresa <span aria-hidden="true">→</span></strong><span>Registrar sus datos y su primer administrador.</span></Link>
            <Link href="/plataforma/empresas"><strong>Consultar empresas <span aria-hidden="true">→</span></strong><span>Buscar empresas y revisar su estado.</span></Link>
            <Link href="/gestion"><strong>Ver espacio de empresa (demo) <span aria-hidden="true">→</span></strong><span>Probar el perfil y la gestión del equipo.</span></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
