"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useDemo } from "./demostracion";
import { buscarSeccion, modulos, type Campo } from "@/modulos/catalogo";

export type Valores = Record<string, string>;
export type Registro = {
  id: string; empresaId: string; clave: string; nombre: string; estado: string;
  valores: Valores; archivado: boolean; archivos: File[];
  historial: { fecha: string; accion: string }[];
};
export type Opcion = { id: string; nombre: string };
type Contexto = {
  registros: Registro[]; configuraciones: Record<string, Valores>;
  opcionesCampo: (campo: Campo, valores?: Valores) => Opcion[];
  guardar: (clave: string, datos: { id?: string; nombre: string; estado: string; valores: Valores; archivos: File[] }) => { error?: string; id?: string };
  archivar: (id: string) => void;
  configurar: (clave: string, valores: Valores) => string | undefined;
};

function idEjemplo(clave: string, indice = 0) { return "norte-" + clave.replace("/", "-") + "-" + indice; }
const registrosIniciales: Registro[] = modulos.flatMap((modulo) => modulo.secciones.flatMap((seccion) =>
  (seccion.ejemplos || []).map((nombre, indice) => {
    const valores: Valores = {};
    for (const campo of seccion.campos || []) {
      if (campo.referencia) {
        const fijas: Record<string, string> = { usuarios: "admin-norte", sedes: "lima-norte", procesos: "gestion-norte" };
        valores[campo.id] = fijas[campo.referencia] || (buscarSeccion(campo.referencia)?.ejemplos?.length ? idEjemplo(campo.referencia) : "");
      } else if (campo.opciones) valores[campo.id] = campo.opciones[0];
      else if (campo.tipo === "casilla") valores[campo.id] = "no";
      else if (campo.tipo === "numero") valores[campo.id] = String(campo.minimo || 0);
      else if (campo.tipo === "fecha") valores[campo.id] = campo.id === "fechaFin" ? "2026-12-18" : "2026-11-19";
      else if (campo.id === "version") valores[campo.id] = "1.0";
      else if (campo.id === "codigo") valores[campo.id] = "DEMO-" + (indice + 1);
      else if (campo.tipo === "area") valores[campo.id] = "Contenido ficticio para revisar el flujo de trabajo.";
      else valores[campo.id] = "";
    }
    return { id: idEjemplo(modulo.id + "/" + seccion.id, indice), empresaId: "norte", clave: modulo.id + "/" + seccion.id, nombre, estado: seccion.estados?.[0] || "Pendiente", valores, archivado: false, archivos: [], historial: [] };
  })
));

const DatosModulos = createContext<Contexto | null>(null);
export function ProveedorModulosDemo({ children }: { children: ReactNode }) {
  const { empresaActual, usuarios, sedes, procesos } = useDemo();
  const [registros, setRegistros] = useState<Registro[]>(registrosIniciales);
  const [configuraciones, setConfiguraciones] = useState<Record<string, Valores>>({});
  const deEmpresa = registros.filter((item) => item.empresaId === empresaActual);

  function opcionesCampo(campo: Campo, valores: Valores = {}): Opcion[] {
    if (campo.referencia === "usuarios") return usuarios.filter((item) => item.empresaId === empresaActual).map(({ id, nombre }) => ({ id, nombre }));
    if (campo.referencia === "sedes") return sedes.filter((item) => item.empresaId === empresaActual).map(({ id, nombre }) => ({ id, nombre }));
    if (campo.referencia === "procesos") return procesos.filter((item) => item.empresaId === empresaActual && (!valores.sede || item.sedeId === valores.sede)).map(({ id, nombre }) => ({ id, nombre }));
    if (campo.referencia) return deEmpresa.filter((item) => item.clave === campo.referencia && (campo.id !== "hito" || !valores.proyecto || item.valores.proyecto === valores.proyecto)).map((item) => ({ id: item.id, nombre: item.nombre + (item.archivado ? " (archivado)" : "") }));
    return (campo.opciones || []).map((nombre) => ({ id: nombre, nombre }));
  }

  function validar(clave: string, valores: Valores) {
    const seccion = buscarSeccion(clave);
    if (!seccion || seccion.propia) return "La sección no está disponible.";
    for (const campo of seccion.campos || []) {
      const valor = (valores[campo.id] || "").trim();
      if (campo.requerido && !valor) return "Completa: " + campo.etiqueta + ".";
      if (!valor) continue;
      if (valor.length > 5000) return campo.etiqueta + ": máximo 5000 caracteres.";
      if (campo.tipo === "numero" && (!Number.isFinite(Number(valor)) || (campo.minimo !== undefined && Number(valor) < campo.minimo) || (campo.maximo !== undefined && Number(valor) > campo.maximo))) return "Revisa el valor de " + campo.etiqueta + ".";
      if ((campo.referencia || campo.opciones) && !opcionesCampo(campo, valores).some((opcion) => opcion.id === valor)) return "Selecciona una opción válida en " + campo.etiqueta + ".";
      if (campo.tipo === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "Revisa el correo electrónico.";
    }
    if (valores.fechaInicio && valores.fechaFin && valores.fechaFin < valores.fechaInicio) return "La fecha límite no puede ser anterior a la fecha de inicio.";
  }

  function guardar(clave: string, datos: { id?: string; nombre: string; estado: string; valores: Valores; archivos: File[] }) {
    const seccion = buscarSeccion(clave);
    if (!seccion || seccion.modo || seccion.propia) return { error: "Esta sección no admite registros." };
    const actual = datos.id ? deEmpresa.find((item) => item.id === datos.id && item.clave === clave) : undefined;
    if (datos.id && !actual) return { error: "El registro no pertenece a esta empresa." };
    if (!datos.nombre.trim()) return { error: "Escribe un nombre para el registro." };
    if (!seccion.estados?.includes(datos.estado)) return { error: "Selecciona un estado válido." };
    const error = validar(clave, datos.valores);
    if (error) return { error };
    if (datos.archivos.length > 5 || datos.archivos.some((archivo) => archivo.size > 10 * 1024 * 1024)) return { error: "Adjunta hasta 5 archivos de un máximo de 10 MB cada uno." };
    const registro: Registro = {
      id: actual?.id || crypto.randomUUID(), empresaId: empresaActual, clave,
      nombre: datos.nombre.trim(), estado: datos.estado, valores: { ...datos.valores },
      archivado: actual?.archivado || false, archivos: datos.archivos,
      historial: [...(actual?.historial || []), { fecha: new Date().toISOString(), accion: actual ? "Registro editado en demo" : "Registro creado en demo" }],
    };
    setRegistros((actuales) => actual ? actuales.map((item) => item.id === registro.id ? registro : item) : [...actuales, registro]);
    return { id: registro.id };
  }

  function archivar(id: string) {
    setRegistros((actuales) => actuales.map((item) => item.id === id && item.empresaId === empresaActual ? {
      ...item, archivado: !item.archivado,
      historial: [...item.historial, { fecha: new Date().toISOString(), accion: item.archivado ? "Restaurado en demo" : "Archivado en demo" }],
    } : item));
  }
  function configurar(clave: string, valores: Valores) {
    if (buscarSeccion(clave)?.modo !== "configuracion") return "Configuración no disponible.";
    const error = validar(clave, valores);
    if (error) return error;
    setConfiguraciones((actuales) => ({ ...actuales, [empresaActual + ":" + clave]: { ...valores } }));
  }

  return <DatosModulos.Provider value={{ registros: deEmpresa, configuraciones, opcionesCampo, guardar, archivar, configurar }}>{children}</DatosModulos.Provider>;
}
export function useModulosDemo() {
  const contexto = useContext(DatosModulos);
  if (!contexto) throw new Error("Falta ProveedorModulosDemo.");
  return contexto;
}
