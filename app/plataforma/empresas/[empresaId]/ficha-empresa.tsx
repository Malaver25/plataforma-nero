"use client";

import Link from "next/link";
import { useDemo } from "@/contexto/demostracion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FichaEmpresa({ id }: { id: string }) {
  const { empresas, seleccionarEmpresa } = useDemo();
  const router = useRouter();
  const [error, setError] = useState("");
  const empresa = empresas.find((item) => item.id === id);

  if (!empresa) return (
    <main className="nero-tarjeta">
      <h1>Empresa no disponible</h1>
      <p>Los datos de prueba se reinician al recargar la página.</p>
      <Link href="/plataforma/empresas" className="nero-enlace">Volver a empresas</Link>
    </main>
  );

  return (
    <main>
      <Link href="/plataforma/empresas" className="nero-enlace">← Volver a empresas</Link>
      <div className="nero-titulo">
        <div><h1>{empresa.nombreComercial || empresa.razonSocial}</h1><p>Configuración y administrador de la empresa.</p></div>
        <span className="nero-estado" data-estado={empresa.estado}>{empresa.estado}</span>
      </div>
      <div className="nero-columnas">
        <section className="nero-tarjeta">
          <h2>Datos de la empresa</h2>
          <dl className="nero-datos">
            <div><dt>Razón social</dt><dd>{empresa.razonSocial}</dd></div>
            <div><dt>Nombre comercial</dt><dd>{empresa.nombreComercial || "Sin nombre comercial"}</dd></div>
            <div><dt>RUC · identificación de ejemplo</dt><dd>{empresa.ruc}</dd></div>
            <div><dt>País</dt><dd>Perú</dd></div>
            <div><dt>Moneda base</dt><dd>{empresa.perfil.moneda}</dd></div>
          </dl>
        </section>
        <section className="nero-tarjeta">
          <h2>Administrador e invitación</h2>
          <dl className="nero-datos">
            <div><dt>Nombre completo</dt><dd>{empresa.administrador}</dd></div>
            <div><dt>Correo electrónico</dt><dd>{empresa.correo}</dd></div>
            <div><dt>Invitación de prueba</dt><dd>{empresa.estado === "Activa" ? "Aceptada" : "Pendiente de aceptación"}</dd></div>
          </dl>
          {empresa.estado === "Pendiente" && (
            <div className="nero-acciones">
              <Link href={`/aceptar-invitacion?empresa=${empresa.id}`} className="nero-boton">Probar invitación</Link>
            </div>
          )}
          {empresa.estado === "Activa" && <div className="nero-acciones"><button className="nero-boton" onClick={() => { const resultado = seleccionarEmpresa(empresa.id); if (resultado.error) setError(resultado.error); else router.push("/gestion/organizacion"); }}>Abrir empresa en la demo</button></div>}
          {error && <p className="nero-error" role="alert">{error}</p>}
        </section>
      </div>
    </main>
  );
}
