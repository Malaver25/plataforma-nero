"use client";

import Link from "next/link";
import { useDemo } from "@/contexto/demostracion";
import ArbolProcesos from "@/componentes/organizacion/arbol-procesos";

export default function OrganizacionPage() {
  const { empresas, empresaActual, sedes, procesos, puestos, usuarios } = useDemo();
  const empresa = empresas.find((item) => item.id === empresaActual)!;
  const sedesEmpresa = sedes.filter((sede) => sede.empresaId === empresaActual);
  return <main>
    <div className="nero-titulo"><div><p className="nero-sobretitulo">Organización</p><h1>Estructura de {empresa.nombreComercial || empresa.razonSocial}</h1><p>Consulta cómo se relacionan las sedes, los procesos y los puestos.</p></div><Link className="nero-boton" href="/gestion/organizacion/sedes">Gestionar sedes</Link></div>
    <section className="nero-tarjeta nero-seccion"><h2>{empresa.razonSocial}</h2><p className="nero-texto-secundario">Cada sede agrupa sus procesos y puestos. Los usuarios se asignan a los puestos desde Personas.</p><Link className="nero-enlace" href="/gestion/organizacion/configuracion">Editar datos de la organización</Link></section>
    <div className="nero-pila">{sedesEmpresa.map((sede) => {
      const procesosSede = procesos.filter((item) => item.empresaId === empresaActual && item.sedeId === sede.id);
      const puestosSede = puestos.filter((item) => item.empresaId === empresaActual && item.sedeId === sede.id);
      return <section key={sede.id} className="nero-tarjeta">
        <div className="nero-seccion-cabecera"><div><h2>{sede.nombre}</h2><p className="nero-texto-secundario">{sede.direccion || "Sin dirección registrada"}</p></div><span className="nero-etiqueta">Sede</span></div>
        <div className="nero-columnas">
          <div><h3>Jerarquía de procesos</h3><ArbolProcesos procesos={procesosSede} /></div>
          <div><h3>Procesos ({procesosSede.length})</h3><ul className="nero-lista-resumen">{procesosSede.map((proceso) => <li key={proceso.id}><strong>{proceso.nombre}</strong><span className="nero-texto-secundario">{proceso.tipo}</span></li>)}</ul>{!procesosSede.length && <p className="nero-texto-secundario">Aún no hay procesos en esta sede.</p>}<Link className="nero-enlace" href="/gestion/organizacion/procesos">Gestionar procesos</Link></div>
          <div><h3>Puestos ({puestosSede.length})</h3><ul className="nero-lista-resumen">{puestosSede.map((puesto) => <li key={puesto.id}><div><strong>{puesto.nombre}</strong><small>{puesto.procesoIds.map((id) => procesosSede.find((item) => item.id === id)?.nombre).filter(Boolean).join(", ") || "Sin procesos asignados"}</small></div><span className="nero-texto-secundario">{usuarios.filter((item) => item.empresaId === empresaActual && item.puestoId === puesto.id).length} personas</span></li>)}</ul>{!puestosSede.length && <p className="nero-texto-secundario">Aún no hay puestos en esta sede.</p>}<Link className="nero-enlace" href="/gestion/personas/puestos">Gestionar puestos</Link></div>
        </div>
      </section>;
    })}{!sedesEmpresa.length && <div className="nero-tarjeta nero-vacio"><p>Esta organización todavía no tiene sedes.</p><Link className="nero-enlace" href="/gestion/organizacion/sedes">Registrar la primera sede</Link></div>}</div>
  </main>;
}
