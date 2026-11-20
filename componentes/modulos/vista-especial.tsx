"use client";

import { Calendario } from "./seguimiento";
import { Biblioteca } from "./documentos";
import MatrizRiesgos from "./riesgos";
import { CompletarFormulario } from "./formularios-dinamicos";
import { Bandeja, CanalDenuncias, PortalTerceros } from "./portales";
import { CuentaDemo, Formacion } from "./ayuda-formacion";

export default function VistaEspecial({ modulo, seccion }: { modulo: string; seccion: string }) {
  if (seccion === "seguimiento") return <Calendario modulo={modulo} />;
  if (modulo === "personas" && seccion === "campus") return <Formacion campus />;
  if (modulo === "ayuda") return seccion === "contrasena" ? <CuentaDemo /> : <Formacion />;
  if (modulo === "documentos") return <Biblioteca />;
  if (modulo === "riesgos") return <MatrizRiesgos />;
  if (modulo === "denuncias") return <CanalDenuncias />;
  if (modulo === "infinity") return <CompletarFormulario proceso />;
  if (modulo === "comunicaciones") return seccion === "bandeja" ? <Bandeja /> : <CompletarFormulario />;
  if (modulo === "proveedores" || modulo === "clientes") return <PortalTerceros modulo={modulo} />;
  return <p>Vista no disponible.</p>;
}
