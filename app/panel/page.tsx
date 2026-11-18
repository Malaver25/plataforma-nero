"use client";

import Link from "next/link";
import { useDemo } from "../componentes/datos-demo";

export default function PanelPage() {
  const { empresas, empresaActual, usuarios, usuarioActual } = useDemo();
  const empresa = empresas.find((item) => item.id === empresaActual)!;
  const usuario = usuarios.find((item) => item.id === usuarioActual)!;
  const equipo = usuarios.filter((item) => item.empresaId === empresaActual);

  return (
      <main>
        <div className="nero-titulo">
          <div><h1>Hola, {usuario.nombre.split(" ")[0]}</h1><p>Este es el espacio de {empresa.nombreComercial || empresa.razonSocial}. Tu rol de prueba: {usuario.rol}.</p></div>
          <span className="nero-estado" data-estado={empresa.estado}>{empresa.estado}</span>
        </div>
        <dl className="nero-resumen">
          <div className="nero-tarjeta"><dt>Usuarios del equipo</dt><dd>{equipo.length}</dd></div>
          <div className="nero-tarjeta"><dt>Usuarios activos</dt><dd>{equipo.filter((item) => item.estado === "Activo").length}</dd></div>
          <div className="nero-tarjeta"><dt>Invitaciones pendientes</dt><dd>{equipo.filter((item) => item.estado === "Pendiente").length}</dd></div>
        </dl>
        <div className="nero-columnas">
          <section className="nero-tarjeta">
            <h2>Mi empresa</h2>
            <dl className="nero-datos">
              <div><dt>Razón social</dt><dd>{empresa.razonSocial}</dd></div>
              <div><dt>RUC de ejemplo</dt><dd>{empresa.ruc}</dd></div>
              <div><dt>Administrador</dt><dd>{empresa.administrador}</dd></div>
              <div><dt>Correo</dt><dd>{empresa.correo}</dd></div>
              <div><dt>Moneda base</dt><dd>{empresa.perfil.moneda}</dd></div>
              <div><dt>Correo de contacto</dt><dd>{empresa.perfil.correoContacto || "Por completar"}</dd></div>
              <div><dt>Dirección</dt><dd>{empresa.perfil.direccion || "Por completar"}</dd></div>
            </dl>
            <div className="nero-acciones"><Link href="/panel/configuracion" className="nero-enlace">Editar perfil de empresa →</Link></div>
          </section>
          <section className="nero-tarjeta">
            <h2>Primeros pasos</h2>
            <ol className="nero-pasos">
              <li>Crear la empresa y asignar a su administrador.</li>
              <li>Aceptar la invitación y configurar el acceso.</li>
              <li><Link href="/panel/configuracion" className="nero-enlace">Completar el perfil de la empresa.</Link></li>
              <li><Link href="/panel/usuarios/invitar" className="nero-enlace">Invitar a los usuarios de tu equipo.</Link></li>
            </ol>
            <div className="nero-acciones"><Link href="/panel/usuarios" className="nero-boton nero-secundario">Ver usuarios</Link></div>
          </section>
        </div>
      </main>
  );
}
