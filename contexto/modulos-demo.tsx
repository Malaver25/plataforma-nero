"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useDemo } from "./demostracion";
import { buscarSeccion, modulos, type Campo } from "@/modulos/catalogo";
import { stock, transiciones, validarTransicion } from "@/modulos/flujos";

export type Valores = Record<string, string>;
export type Registro = {
  id: string; empresaId: string; clave: string; nombre: string; estado: string;
  valores: Valores; archivado: boolean; archivos: File[];
  historial: { fecha: string; accion: string }[];
  versiones?: { fecha: string; nombre: string; estado: string; valores: Valores; archivos: File[] }[];
};
export type Opcion = { id: string; nombre: string };
type Contexto = {
  registros: Registro[]; configuraciones: Record<string, Valores>;
  opcionesCampo: (campo: Campo, valores?: Valores) => Opcion[];
  guardar: (clave: string, datos: { id?: string; nombre: string; estado: string; valores: Valores; archivos: File[] }) => { error?: string; id?: string };
  archivar: (id: string) => void;
  configurar: (clave: string, valores: Valores) => string | undefined;
  actuar: (id: string, estado: string, nota: string, actor: string) => string | undefined;
  nuevaVersion: (id: string) => string | undefined;
  clonarProyecto: (id: string, nombre: string, inicio: string) => { id?: string; error?: string };
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
  const { empresaActual, usuarios, sedes, procesos, usuarioActual } = useDemo();
  const [registros, setRegistros] = useState<Registro[]>(registrosIniciales);
  const [configuraciones, setConfiguraciones] = useState<Record<string, Valores>>({});
  const deEmpresa = registros.filter((item) => item.empresaId === empresaActual);

  function opcionesCampo(campo: Campo, valores: Valores = {}): Opcion[] {
    if (campo.referencia === "usuarios") return usuarios.filter((item) => item.empresaId === empresaActual).map(({ id, nombre }) => ({ id, nombre }));
    if (campo.referencia === "sedes") return sedes.filter((item) => item.empresaId === empresaActual).map(({ id, nombre }) => ({ id, nombre }));
    if (campo.referencia === "procesos") return procesos.filter((item) => item.empresaId === empresaActual && (!valores.sede || item.sedeId === valores.sede)).map(({ id, nombre }) => ({ id, nombre }));
    if (campo.referencia) return deEmpresa.filter((item) => item.clave === campo.referencia && (campo.id !== "hito" || !valores.proyecto || item.valores.proyecto === valores.proyecto) && (campo.referencia !== "organizacion/departamentos" || !valores.sede || item.valores.sede === valores.sede)).map((item) => ({ id: item.id, nombre: item.nombre + (item.archivado ? " (archivado)" : "") }));
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
      if ((campo.referencia || campo.opciones) && (campo.multiple ? valor.split("|") : [valor]).some(v => !opcionesCampo(campo, valores).some(opcion => opcion.id === v))) return "Selecciona una opción válida en " + campo.etiqueta + ".";
      if (campo.tipo === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "Revisa el correo electrónico.";
    }
    if (valores.fechaInicio && valores.fechaFin && valores.fechaFin < valores.fechaInicio) return "La fecha límite no puede ser anterior a la fecha de inicio.";
    if (valores.minimo && valores.maximo && Number(valores.minimo) > Number(valores.maximo)) return "El mínimo esperado no puede superar al máximo.";
  }

  function guardar(clave: string, datos: { id?: string; nombre: string; estado: string; valores: Valores; archivos: File[] }) {
    const seccion = buscarSeccion(clave);
    if (!seccion || seccion.modo || seccion.propia) return { error: "Esta sección no admite registros." };
    const actual = datos.id ? deEmpresa.find((item) => item.id === datos.id && item.clave === clave) : undefined;
    if (datos.id && !actual) return { error: "El registro no pertenece a esta empresa." };
    if (transiciones[clave] && datos.estado !== (actual?.estado || seccion.estados?.[0])) return { error: "Utiliza las acciones del detalle para avanzar en este flujo." };
    if (clave === "documentos/controlados" && actual && actual.estado !== "Borrador") return { error: "Devuelve el documento a borrador o crea una nueva versión antes de editarlo." };
    if (datos.valores.padre) {
      let padre: Registro | undefined = deEmpresa.find(r => r.id === datos.valores.padre);
      if (clave === "organizacion/departamentos" && padre?.valores.sede !== datos.valores.sede) return { error: "El departamento superior debe pertenecer a la misma sede." };
      const vistos = new Set<string>();
      while (padre) {
        if (padre.id === datos.id || vistos.has(padre.id)) return { error: "La jerarquía no puede contener ciclos." };
        vistos.add(padre.id); padre = deEmpresa.find(r => r.id === padre?.valores.padre);
      }
    }
    if (clave === "organizacion/departamentos" && actual && actual.valores.sede !== datos.valores.sede && deEmpresa.some(r => r.clave === clave && r.valores.padre === actual.id)) return { error: "Reasigna los subdepartamentos antes de cambiar de sede." };
    if (clave === "proyectos/hitos" && actual && actual.valores.proyecto !== datos.valores.proyecto && deEmpresa.some(r => r.valores.hito === actual.id)) return { error: "El hito tiene tareas vinculadas. Reasígnalas antes de cambiar de proyecto." };
    if (["objetivos/mediciones", "indicadores/mediciones"].includes(clave) && datos.valores.periodo && datos.valores.fecha < datos.valores.periodo) return { error: "La medición no puede ser anterior al periodo que cubre." };
    if (clave === "equipamientos/intervenciones" && Boolean(datos.valores.calibracion) === Boolean(datos.valores.mantenimiento)) return { error: "Vincula exactamente una calibración o un mantenimiento." };
    if (clave === "auditorias/resultados" && datos.estado === "Aprobado" && (!datos.valores.conclusiones?.trim() || !datos.archivos.length)) return { error: "Añade conclusiones y el informe adjunto antes de aprobar el resultado." };
    if (["riesgos/registro"].includes(clave) && ["probabilidad", "impacto", "probabilidadResidual", "impactoResidual"].some(c => datos.valores[c] && !Number.isInteger(Number(datos.valores[c])))) return { error: "Las escalas de riesgo usan números enteros de 1 a 5." };
    if (clave === "riesgos/controles" && ["aplicacion", "ejecucion", "responsabilidad", "prevencion", "documentacion"].some(c => datos.valores[c] && !Number.isInteger(Number(datos.valores[c])))) return { error: "Los factores de protección deben ser enteros de 1 a 5." };
    if (!datos.nombre.trim()) return { error: "Escribe un nombre para el registro." };
    if (!seccion.estados?.includes(datos.estado)) return { error: "Selecciona un estado válido." };
    const error = validar(clave, datos.valores);
    if (error) return { error };
    if (datos.archivos.length > 5 || datos.archivos.some((archivo) => archivo.size > 10 * 1024 * 1024)) return { error: "Adjunta hasta 5 archivos de un máximo de 10 MB cada uno." };
    if (clave === "infinity/movimientos") {
      if (actual && actual.valores.producto !== datos.valores.producto) return { error: "No se puede cambiar el producto de un movimiento; registra una corrección." };
      const producto = deEmpresa.find(r => r.id === datos.valores.producto);
      if (!producto || producto.archivado) return { error: "Selecciona un producto activo." };
      const saldo = stock(producto, deEmpresa.filter(r => r.id !== datos.id)) + (datos.valores.tipo === "Salida" ? -1 : 1) * Number(datos.valores.cantidad);
      if (saldo < 0) return { error: "La salida supera las existencias disponibles." };
    }
    if (clave === "infinity/inventario" && actual && stock({ ...actual, valores: datos.valores }, deEmpresa) < 0) return { error: "La cantidad inicial dejaría un saldo negativo." };
    const registro: Registro = {
      id: actual?.id || crypto.randomUUID(), empresaId: empresaActual, clave,
      nombre: datos.nombre.trim(), estado: datos.estado, valores: { ...datos.valores },
      archivado: actual?.archivado || false, archivos: datos.archivos,
      historial: [...(actual?.historial || []), { fecha: new Date().toISOString(), accion: actual ? "Registro editado en demo" : "Registro creado en demo" }],
      versiones: actual ? [...(actual.versiones || []), { fecha: new Date().toISOString(), nombre: actual.nombre, estado: actual.estado, valores: { ...actual.valores }, archivos: [...actual.archivos] }] : [],
    };
    setRegistros((actuales) => actual ? actuales.map((item) => item.id === registro.id ? registro : item) : [...actuales, registro]);
    return { id: registro.id };
  }

  function archivar(id: string) {
    // Los movimientos se conservan: las correcciones se registran con un movimiento inverso.
    if (deEmpresa.some(r => r.id === id && r.clave === "infinity/movimientos")) return;
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

  function actuar(id: string, estado: string, nota: string, actor: string) {
    const registro = deEmpresa.find(r => r.id === id && !r.archivado);
    if (!registro) return "Registro no disponible.";
    const error = validarTransicion(registro, estado, deEmpresa);
    if (error) return error;
    if (!nota.trim()) return "Escribe el motivo o resultado de la revisión.";
    const persona = usuarios.find(u => u.empresaId === empresaActual && u.id === actor);
    if (!persona) return "Selecciona al participante de la simulación.";
    let esperado = "";
    if (registro.clave === "documentos/controlados") {
      esperado = registro.estado === "En revisión" ? registro.valores.revisor : registro.estado === "Pendiente de aprobación" ? registro.valores.aprobador : "";
      if (estado === "En revisión" && !registro.archivos.length) return "Adjunta el documento antes de enviarlo a revisión.";
    }
    if (registro.clave === "infinity/solicitudes") {
      const proceso = deEmpresa.find(r => r.id === registro.valores.procesoDigital);
      const campo = registro.estado === "Pendiente de validación" ? "validador" : registro.estado === "Segunda validación" ? "segundoValidador" : registro.estado === "Tercera validación" ? "tercerValidador" : "";
      esperado = proceso?.valores[campo] || "";
    }
    if (esperado && esperado !== actor) return "Selecciona al responsable asignado para esta etapa.";
    setRegistros(actuales => actuales.map(r => r.id === id && r.empresaId === empresaActual ? { ...r, estado, historial: [...r.historial, { fecha: new Date().toISOString(), accion: `${persona.nombre}: ${r.estado} → ${estado}. ${nota.trim()}` }] } : r));
  }
  function nuevaVersion(id: string) {
    const r = deEmpresa.find(x => x.id === id && !x.archivado);
    if (!r || r.clave !== "documentos/controlados" || !["Aprobado", "Obsoleto"].includes(r.estado)) return "Solo se puede versionar un documento aprobado u obsoleto.";
    const version = String((Number.parseInt(r.valores.version) || 1) + 1) + ".0";
    setRegistros(actuales => actuales.map(item => item.id === id ? { ...item, estado: "Borrador", valores: { ...item.valores, version }, versiones: [...(item.versiones || []), { fecha: new Date().toISOString(), nombre: item.nombre, estado: item.estado, valores: { ...item.valores }, archivos: [...item.archivos] }], historial: [...item.historial, { fecha: new Date().toISOString(), accion: `Nueva versión ${version} creada por ${usuarioActual}` }] } : item));
  }

  function clonarProyecto(id: string, nombre: string, inicio: string) {
    const original = deEmpresa.find(r => r.id === id && r.clave === "proyectos/registro" && !r.archivado);
    if (!original || !nombre.trim() || !inicio) return { error: "Selecciona proyecto, nombre y fecha de inicio." };
    const hijos = deEmpresa.filter(r => !r.archivado && ["proyectos/hitos", "proyectos/tareas"].includes(r.clave) && r.valores.proyecto === id);
    const mapa = new Map([original, ...hijos].map(r => [r.id, crypto.randomUUID()]));
    const desplazamiento = Date.parse(inicio) - Date.parse(original.valores.fechaInicio || inicio);
    if (!Number.isFinite(desplazamiento)) return { error: "Revisa las fechas de la plantilla." };
    const copias = [original, ...hijos].map(r => {
      const valores = { ...r.valores };
      for (const campo of ["fechaInicio", "fechaFin"]) if (valores[campo]) valores[campo] = new Date(Date.parse(valores[campo]) + desplazamiento).toISOString().slice(0, 10);
      if (r.id === id) { valores.fechaInicio = inicio; valores.costeReal = "0"; } else valores.proyecto = mapa.get(id)!;
      if (valores.hito) valores.hito = mapa.get(valores.hito) || "";
      if (r.clave === "proyectos/tareas") valores.avance = "0";
      return { ...r, id: mapa.get(r.id)!, nombre: r.id === id ? nombre.trim() : r.nombre, estado: r.id === id ? "Pendiente de inicio" : "Pendiente", valores, versiones: [], archivos: [], historial: [{ fecha: new Date().toISOString(), accion: "Creado desde plantilla de proyecto" }] };
    });
    setRegistros(actuales => [...actuales, ...copias]);
    return { id: mapa.get(id) };
  }

  return <DatosModulos.Provider value={{ registros: deEmpresa, configuraciones, opcionesCampo, guardar, archivar, configurar, actuar, nuevaVersion, clonarProyecto }}>{children}</DatosModulos.Provider>;
}
export function useModulosDemo() {
  const contexto = useContext(DatosModulos);
  if (!contexto) throw new Error("Falta ProveedorModulosDemo.");
  return contexto;
}
