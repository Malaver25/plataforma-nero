"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { empresasDemo, perfilVacio, type Empresa, type NuevaEmpresa, type CambiosEmpresa } from "@/datos-demo/empresas";
import { usuariosDemo, roles, type Usuario, type Rol } from "@/datos-demo/usuarios";
import { sedesDemo, procesosDemo, puestosDemo, tiposProceso, nivelesAcceso, funcionesPuesto, type Sede, type Proceso, type Puesto, type Borrador, type ResultadoGuardado } from "@/datos-demo/organizacion";

type DatosDemo = {
  empresas: Empresa[];
  empresaActual: string;
  usuarios: Usuario[];
  usuarioActual: string;
  sedes: Sede[];
  procesos: Proceso[];
  puestos: Puesto[];
  guardarSede: (datos: Borrador<Sede>) => ResultadoGuardado;
  guardarProceso: (datos: Borrador<Proceso>) => ResultadoGuardado;
  guardarPuesto: (datos: Borrador<Puesto>) => ResultadoGuardado;
  asignarPuesto: (usuarioId: string, puestoId: string) => ResultadoGuardado;
  agregarEmpresa: (datos: NuevaEmpresa) => ResultadoGuardado;
  actualizarEmpresa: (datos: CambiosEmpresa) => ResultadoGuardado;
  invitarUsuario: (datos: { nombre: string; correo: string; rol: Rol; puestoId?: string }) => ResultadoGuardado;
  editarUsuario: (datos: Pick<Usuario, "id" | "nombre" | "correo" | "rol" | "puestoId">) => ResultadoGuardado;
  seleccionarEmpresa: (id: string) => ResultadoGuardado;
  aceptarInvitacion: (id: string) => ResultadoGuardado;
  aceptarUsuario: (id: string) => ResultadoGuardado;
};

const ContextoDemo = createContext<DatosDemo | null>(null);

// Estado temporal: se conserva al navegar y se reinicia al recargar la página.
export function ProveedorDemo({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState(empresasDemo);
  const [empresaActual, setEmpresaActual] = useState("norte");
  const [usuarios, setUsuarios] = useState(usuariosDemo);
  const [usuarioActual, setUsuarioActual] = useState("admin-norte");
  const [sedes, setSedes] = useState(sedesDemo);
  const [procesos, setProcesos] = useState(procesosDemo);
  const [puestos, setPuestos] = useState(puestosDemo);
  const normalizar = (valor: string) => valor.trim().replace(/\s+/g, " ");
  const correoValido = (valor: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  // Coherencia de datos de la demo. La autorización real debe ejecutarse en el servidor.
  function validarRegistro(datos: { id?: string; nombre: string }, registros: { id: string; empresaId: string; nombre: string }[]) {
    if (!normalizar(datos.nombre)) return "Escribe un nombre.";
    if (normalizar(datos.nombre).length > 120) return "El nombre admite hasta 120 caracteres.";
    if (datos.id && !registros.some((item) => item.id === datos.id && item.empresaId === empresaActual)) return "El registro no pertenece a esta empresa.";
    if (registros.some((item) => item.empresaId === empresaActual && item.id !== datos.id && normalizar(item.nombre).toLocaleLowerCase() === normalizar(datos.nombre).toLocaleLowerCase())) return "Ya existe un registro con ese nombre en la empresa.";
  }

  function guardarSede(datos: Borrador<Sede>): ResultadoGuardado {
    const error = validarRegistro(datos, sedes);
    if (error) return { error };
    const registro: Sede = { ...datos, nombre: normalizar(datos.nombre), direccion: datos.direccion.trim(), id: datos.id || crypto.randomUUID(), empresaId: empresaActual };
    setSedes((actuales) => datos.id ? actuales.map((item) => item.id === datos.id ? registro : item) : [...actuales, registro]);
    return { id: registro.id };
  }

  function guardarProceso(datos: Borrador<Proceso>): ResultadoGuardado {
    const error = validarRegistro(datos, procesos);
    if (error) return { error };
    if (!sedes.some((sede) => sede.id === datos.sedeId && sede.empresaId === empresaActual)) return { error: "Selecciona una sede de esta empresa." };
    if (!tiposProceso.includes(datos.tipo)) return { error: "Selecciona un tipo de proceso válido." };
    if (datos.id && procesos.some(p => p.empresaId === empresaActual && p.padreId === datos.id && p.sedeId !== datos.sedeId)) return { error: "Reasigna los subprocesos antes de cambiar la sede." };
    if (datos.padreId) {
      let padre = procesos.find(p => p.id === datos.padreId && p.empresaId === empresaActual && p.sedeId === datos.sedeId);
      if (!padre) return { error: "El proceso superior debe pertenecer a la misma sede." };
      const vistos = new Set<string>();
      while (padre) { if (padre.id === datos.id || vistos.has(padre.id)) return { error: "La jerarquía de procesos no puede contener ciclos." }; vistos.add(padre.id); padre = procesos.find(p => p.id === padre?.padreId); }
    }
    if (puestos.some((puesto) => puesto.procesoIds.includes(datos.id || "") && puesto.sedeId !== datos.sedeId)) return { error: "Este proceso está vinculado a puestos de su sede actual. Actualiza esos puestos antes de cambiarlo de sede." };
    const registro: Proceso = { ...datos, nombre: normalizar(datos.nombre), padreId: datos.padreId || undefined, id: datos.id || crypto.randomUUID(), empresaId: empresaActual };
    setProcesos((actuales) => datos.id ? actuales.map((item) => item.id === datos.id ? registro : item) : [...actuales, registro]);
    return { id: registro.id };
  }

  function guardarPuesto(datos: Borrador<Puesto>): ResultadoGuardado {
    const error = validarRegistro(datos, puestos);
    if (error) return { error };
    if (!sedes.some((sede) => sede.id === datos.sedeId && sede.empresaId === empresaActual)) return { error: "Selecciona una sede de esta empresa." };
    if (datos.procesoIds.some((id) => !procesos.some((proceso) => proceso.id === id && proceso.empresaId === empresaActual && proceso.sedeId === datos.sedeId))) return { error: "Los procesos deben pertenecer a la sede seleccionada." };
    if (funcionesPuesto.some(({ id }) => datos.permisos[id] && !nivelesAcceso.includes(datos.permisos[id]))) return { error: "Revisa los niveles de acceso." };
    if (datos.riesgo && !["Sin evaluar", "Bajo", "Medio", "Alto"].includes(datos.riesgo)) return { error: "Selecciona un nivel de riesgo válido." };
    const permisos = Object.fromEntries(funcionesPuesto.map(({ id }) => [id, datos.permisos[id] || "Sin acceso"]));
    const registro: Puesto = { ...datos, nombre: normalizar(datos.nombre), permisos, procesoIds: [...new Set(datos.procesoIds)], id: datos.id || crypto.randomUUID(), empresaId: empresaActual };
    setPuestos((actuales) => datos.id ? actuales.map((item) => item.id === datos.id ? registro : item) : [...actuales, registro]);
    return { id: registro.id };
  }

  function asignarPuesto(usuarioId: string, puestoId: string): ResultadoGuardado {
    if (!usuarios.some((usuario) => usuario.id === usuarioId && usuario.empresaId === empresaActual)) return { error: "El usuario no pertenece a esta empresa." };
    if (puestoId && !puestos.some((puesto) => puesto.id === puestoId && puesto.empresaId === empresaActual)) return { error: "El puesto no pertenece a esta empresa." };
    setUsuarios((actuales) => actuales.map((usuario) => usuario.id === usuarioId ? { ...usuario, puestoId: puestoId || undefined } : usuario));
    return { id: usuarioId };
  }

  function agregarEmpresa(datos: NuevaEmpresa) {
    const razonSocial = normalizar(datos.razonSocial), administrador = normalizar(datos.administrador);
    const correo = datos.correo.trim().toLowerCase(), ruc = datos.ruc.trim();
    if (!razonSocial || !administrador) return { error: "Completa la razón social y el administrador." };
    if (razonSocial.length > 160 || administrador.length > 120) return { error: "Revisa la longitud de los nombres." };
    if (!/^\d{11}$/.test(ruc)) return { error: "El RUC de prueba debe contener 11 dígitos." };
    if (!correoValido(correo)) return { error: "Escribe un correo válido para el administrador." };
    if (empresas.some(e => e.ruc === ruc)) return { error: "Ya existe una empresa con ese RUC de prueba." };
    if (usuarios.some(u => u.correo.trim().toLowerCase() === correo)) return { error: "Ese correo ya pertenece a un usuario. Cada usuario pertenece a una sola empresa." };
    const id = crypto.randomUUID();
    setEmpresas((actuales) => [...actuales, { ...datos, razonSocial, administrador, correo, ruc, nombreComercial: normalizar(datos.nombreComercial), id, estado: "Pendiente", perfil: { ...perfilVacio } }]);
    setUsuarios((actuales) => [...actuales, {
      id: `admin-${id}`, empresaId: id, nombre: administrador, correo,
      rol: "Administrador", estado: "Pendiente", principal: true,
    }]);
    return { id };
  }

  function actualizarEmpresa(datos: CambiosEmpresa) {
    if (!normalizar(datos.razonSocial)) return { error: "La razón social no puede estar vacía." };
    if (datos.perfil.correoContacto && !correoValido(datos.perfil.correoContacto.trim())) return { error: "Revisa el correo de contacto." };
    if (!empresas.some(e => e.id === empresaActual)) return { error: "Empresa no disponible." };
    setEmpresas((actuales) => actuales.map((empresa) =>
      empresa.id === empresaActual ? { ...empresa, ...datos, razonSocial: normalizar(datos.razonSocial), nombreComercial: normalizar(datos.nombreComercial), perfil: { ...datos.perfil } } : empresa,
    ));
    return { id: empresaActual };
  }

  function validarUsuario(datos: { id?: string; nombre: string; correo: string; rol: Rol; puestoId?: string }) {
    if (!normalizar(datos.nombre) || normalizar(datos.nombre).length > 120) return "Escribe un nombre de hasta 120 caracteres.";
    if (!correoValido(datos.correo.trim())) return "Escribe un correo electrónico válido.";
    if (!roles.includes(datos.rol)) return "Selecciona un rol válido.";
    if (usuarios.some(u => u.id !== datos.id && u.correo.trim().toLowerCase() === datos.correo.trim().toLowerCase())) return "Este correo ya tiene un usuario o una invitación. Cada usuario pertenece a una sola empresa.";
    if (datos.puestoId && !puestos.some(p => p.id === datos.puestoId && p.empresaId === empresaActual)) return "Selecciona un puesto de esta empresa.";
  }

  function invitarUsuario(datos: { nombre: string; correo: string; rol: Rol; puestoId?: string }) {
    const error = validarUsuario(datos);
    if (error) return { error };
    const correo = datos.correo.trim().toLowerCase();
    const id = crypto.randomUUID();
    setUsuarios((actuales) => [...actuales, {
      ...datos, nombre: normalizar(datos.nombre), correo, id,
      empresaId: empresaActual, estado: "Pendiente", principal: false,
    }]);
    return { id };
  }

  function editarUsuario(datos: Pick<Usuario, "id" | "nombre" | "correo" | "rol" | "puestoId">) {
    const actual = usuarios.find(u => u.id === datos.id && u.empresaId === empresaActual);
    if (!actual) return { error: "El usuario no pertenece a esta empresa." };
    const error = validarUsuario(datos);
    if (error) return { error };
    if (actual.principal && datos.rol !== "Administrador") return { error: "El administrador principal debe conservar su rol." };
    const nombre = normalizar(datos.nombre), correo = datos.correo.trim().toLowerCase();
    setUsuarios(actuales => actuales.map(u => u.id === actual.id ? { ...u, nombre, correo, rol: datos.rol, puestoId: datos.puestoId || undefined } : u));
    if (actual.principal) setEmpresas(actuales => actuales.map(e => e.id === empresaActual ? { ...e, administrador: nombre, correo } : e));
    return { id: actual.id };
  }

  function seleccionarEmpresa(id: string) {
    const empresa = empresas.find(e => e.id === id && e.estado === "Activa");
    const administrador = usuarios.find(u => u.empresaId === id && u.principal && u.estado === "Activo");
    if (!empresa || !administrador) return { error: "Acepta primero la invitación del administrador de esta empresa." };
    setEmpresaActual(id); setUsuarioActual(administrador.id);
    return { id };
  }

  function aceptarUsuario(id: string) {
    const invitado = usuarios.find((usuario) => usuario.id === id && usuario.estado === "Pendiente");
    if (!invitado) return { error: "La invitación no está disponible o ya fue aceptada." };
    if (!empresas.some(e => e.id === invitado.empresaId)) return { error: "La empresa de la invitación ya no está disponible." };
    setUsuarios((actuales) => actuales.map((usuario) =>
      usuario.id === id ? { ...usuario, estado: "Activo" } : usuario,
    ));
    if (invitado.principal) {
      setEmpresas((actuales) => actuales.map((empresa) =>
        empresa.id === invitado.empresaId ? { ...empresa, estado: "Activa" } : empresa,
      ));
    }
    setEmpresaActual(invitado.empresaId);
    setUsuarioActual(invitado.id);
    return { id: invitado.id };
  }

  function aceptarInvitacion(id: string) {
    const administrador = usuarios.find((usuario) => usuario.empresaId === id && usuario.principal);
    return administrador ? aceptarUsuario(administrador.id) : { error: "Administrador no disponible." };
  }

  return (
    <ContextoDemo.Provider value={{ empresas, empresaActual, usuarios, usuarioActual, sedes, procesos, puestos, guardarSede, guardarProceso, guardarPuesto, asignarPuesto, agregarEmpresa, actualizarEmpresa, invitarUsuario, editarUsuario, seleccionarEmpresa, aceptarInvitacion, aceptarUsuario }}>
      {children}
    </ContextoDemo.Provider>
  );
}

export function useDemo() {
  const datos = useContext(ContextoDemo);
  if (!datos) throw new Error("Falta el ProveedorDemo en el layout.");
  return datos;
}
