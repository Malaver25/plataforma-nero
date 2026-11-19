"use client";

import Link from "next/link";
import { useDemo } from "@/contexto/demostracion";
import { modulos, rutaSeccion } from "@/modulos/catalogo";

export default function InicioGestionPage() {
  const { empresas, empresaActual, usuarios, usuarioActual, sedes, procesos, puestos } = useDemo();
  const empresa = empresas.find((item) => item.id === empresaActual)!;
  const usuario = usuarios.find((item) => item.id === usuarioActual)!;
  const equipo = usuarios.filter((item) => item.empresaId === empresaActual);
  const resumen = [
    { titulo: "Sedes", cantidad: sedes.filter((item) => item.empresaId === empresaActual).length, url: "/gestion/organizacion/sedes" },
    { titulo: "Procesos", cantidad: procesos.filter((item) => item.empresaId === empresaActual).length, url: "/gestion/organizacion/procesos" },
    { titulo: "Puestos", cantidad: puestos.filter((item) => item.empresaId === empresaActual).length, url: "/gestion/personas/puestos" },
    { titulo: "Personas", cantidad: equipo.length, url: "/gestion/personas/usuarios" },
  ];
  return (
    <main>
      <div className="nero-titulo"><div><p className="nero-sobretitulo">{empresa.nombreComercial || empresa.razonSocial}</p><h1>Hola, {usuario.nombre.split(" ")[0]}</h1><p>Empieza por la estructura y las personas de tu organización.</p></div><Link className="nero-boton" href="/gestion/organizacion">Ver estructura</Link></div>
      <dl className="nero-resumen nero-resumen-cuatro">{resumen.map((item) => <div className="nero-tarjeta" key={item.titulo}><dt><Link className="nero-enlace" href={item.url}>{item.titulo}</Link></dt><dd>{item.cantidad}</dd></div>)}</dl>
      <div className="nero-columnas">
        <section className="nero-tarjeta">
          <h2>Construye tu organización</h2>
          <div className="nero-accesos">
            <Link href="/gestion/organizacion/sedes"><strong>Sedes y centros de trabajo</strong><span>Define dónde se realizan las actividades.</span></Link>
            <Link href="/gestion/organizacion/procesos"><strong>Procesos de la organización</strong><span>Relaciona las actividades con su sede.</span></Link>
            <Link href="/gestion/personas/puestos"><strong>Puestos y responsabilidades</strong><span>Define funciones, procesos y niveles de acceso propuestos.</span></Link>
            <Link href="/gestion/personas/usuarios"><strong>Personas del equipo</strong><span>Asigna un puesto a cada usuario e invita a tu equipo.</span></Link>
          </div>
        </section>
        <div className="nero-pila">
          <section className="nero-tarjeta"><h2>Pendientes de configuración</h2><ul className="nero-lista-resumen">
            <li><Link href="/gestion/personas/usuarios" className="nero-enlace">Personas sin puesto</Link><strong>{equipo.filter((item) => !item.puestoId).length}</strong></li>
            <li><Link href="/gestion/personas/usuarios" className="nero-enlace">Invitaciones pendientes</Link><strong>{equipo.filter((item) => item.estado === "Pendiente").length}</strong></li>
          </ul></section>
          <section className="nero-tarjeta"><span className="nero-etiqueta">Explora el frontend</span><h2>Gestión documental</h2><p className="nero-texto-secundario">Prueba la biblioteca, registra documentos y revisa sus datos y adjuntos durante esta sesión.</p><Link className="nero-enlace" href="/gestion/documentos/controlados">Abrir biblioteca</Link></section>
        </div>
      </div>
      <section className="nero-seccion-modulos"><h2>Módulos del sistema</h2><p className="nero-texto-secundario">Explora las pestañas y sus flujos de demostración.</p><div className="nero-modulos-grid">{modulos.map((modulo) => <Link className="nero-tarjeta nero-modulo-enlace" key={modulo.id} href={rutaSeccion(modulo.id, modulo.secciones[0].id)}><span className="nero-etiqueta">{modulo.secciones.length} apartados</span><h3>{modulo.titulo}</h3><p>{modulo.descripcion}</p></Link>)}</div></section>
    </main>
  );
}
