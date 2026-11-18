"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "../../componentes/datos-demo";

export default function EmpresasPage() {
  const { empresas } = useDemo();
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const visibles = empresas.filter((empresa) =>
    `${empresa.razonSocial} ${empresa.nombreComercial} ${empresa.ruc}`.toLowerCase().includes(busqueda.trim().toLowerCase()) &&
    (!estado || empresa.estado === estado),
  );

  return (
    <main>
      <div className="nero-titulo">
        <div><h1>Empresas</h1><p>Administra las empresas y el acceso de sus responsables.</p></div>
        <Link href="/plataforma/empresas/nueva" className="nero-boton">+ Crear empresa</Link>
      </div>

      <dl className="nero-resumen">
        <div className="nero-tarjeta"><dt>Total de empresas</dt><dd>{empresas.length}</dd></div>
        <div className="nero-tarjeta"><dt>Activas</dt><dd>{empresas.filter((e) => e.estado === "Activa").length}</dd></div>
        <div className="nero-tarjeta"><dt>Pendientes de activación</dt><dd>{empresas.filter((e) => e.estado === "Pendiente").length}</dd></div>
      </dl>

      <section className="nero-tarjeta" aria-label="Directorio de empresas">
        <div className="nero-filtros">
          <div>
            <label htmlFor="buscar">Buscar empresa</label>
            <input id="buscar" type="search" placeholder="Nombre o RUC" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <div>
            <label htmlFor="estado">Estado</label>
            <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos los estados</option><option>Activa</option><option>Pendiente</option>
            </select>
          </div>
        </div>
        <div className="nero-tabla">
          <table>
            <caption className="sr-only">Empresas de demostración</caption>
            <thead><tr><th scope="col">Empresa</th><th scope="col">RUC</th><th scope="col">Administrador</th><th scope="col">Estado</th><th scope="col">Detalle</th></tr></thead>
            <tbody>
              {visibles.map((empresa) => (
                <tr key={empresa.id}>
                  <td><strong>{empresa.nombreComercial || empresa.razonSocial}</strong><small>{empresa.razonSocial}</small></td>
                  <td>{empresa.ruc}</td>
                  <td>{empresa.administrador}<small>{empresa.correo}</small></td>
                  <td><span className="nero-estado" data-estado={empresa.estado}>{empresa.estado}</span></td>
                  <td><Link className="nero-enlace" href={`/plataforma/empresas/${empresa.id}`} aria-label={`Ver ${empresa.razonSocial}`}>Ver empresa →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibles.length === 0 && <p className="nero-vacio" role="status">No hay empresas que coincidan con la búsqueda.</p>}
      </section>
    </main>
  );
}
