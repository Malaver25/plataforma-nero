"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { empresasDemo, perfilVacio, type Empresa, type NuevaEmpresa, type CambiosEmpresa } from "@/datos-demo/empresas";
import { usuariosDemo, type Usuario, type Rol } from "@/datos-demo/usuarios";
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
  agregarEmpresa: (datos: NuevaEmpresa) => string;
  actualizarEmpresa: (datos: CambiosEmpresa) => void;
  invitarUsuario: (datos: { nombre: string; correo: string; rol: Rol }) => { id?: string; error?: string };
  aceptarInvitacion: (id: string) => void;
  aceptarUsuario: (id: string) => void;
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

  // Coherencia de datos de la demo. La autorización real debe ejecutarse en el servidor.
  function validarRegistro(datos: { id?: string; nombre: string }, registros: { id: string; empresaId: string; nombre: string }[]) {
    if (!datos.nombre.trim()) return "Escribe un nombre.";
    if (datos.id && !registros.some((item) => item.id === datos.id && item.empresaId === empresaActual)) return "El registro no pertenece a esta empresa.";
    if (registros.some((item) => item.empresaId === empresaActual && item.id !== datos.id && item.nombre.toLocaleLowerCase() === datos.nombre.trim().toLocaleLowerCase())) return "Ya existe un registro con ese nombre en la empresa.";
  }

  function guardarSede(datos: Borrador<Sede>): ResultadoGuardado {
    const error = validarRegistro(datos, sedes);
    if (error) return { error };
    const registro: Sede = { ...datos, nombre: datos.nombre.trim(), direccion: datos.direccion.trim(), id: datos.id || crypto.randomUUID(), empresaId: empresaActual };
    setSedes((actuales) => datos.id ? actuales.map((item) => item.id === datos.id ? registro : item) : [...actuales, registro]);
    return { id: registro.id };
  }

  function guardarProceso(datos: Borrador<Proceso>): ResultadoGuardado {
    const error = validarRegistro(datos, procesos);
    if (error) return { error };
    if (!sedes.some((sede) => sede.id === datos.sedeId && sede.empresaId === empresaActual)) return { error: "Selecciona una sede de esta empresa." };
    if (!tiposProceso.includes(datos.tipo)) return { error: "Selecciona un tipo de proceso válido." };
    if (puestos.some((puesto) => puesto.procesoIds.includes(datos.id || "") && puesto.sedeId !== datos.sedeId)) return { error: "Este proceso está vinculado a puestos de su sede actual. Actualiza esos puestos antes de cambiarlo de sede." };
    const registro: Proceso = { ...datos, nombre: datos.nombre.trim(), id: datos.id || crypto.randomUUID(), empresaId: empresaActual };
    setProcesos((actuales) => datos.id ? actuales.map((item) => item.id === datos.id ? registro : item) : [...actuales, registro]);
    return { id: registro.id };
  }

  function guardarPuesto(datos: Borrador<Puesto>): ResultadoGuardado {
    const error = validarRegistro(datos, puestos);
    if (error) return { error };
    if (!sedes.some((sede) => sede.id === datos.sedeId && sede.empresaId === empresaActual)) return { error: "Selecciona una sede de esta empresa." };
    if (datos.procesoIds.some((id) => !procesos.some((proceso) => proceso.id === id && proceso.empresaId === empresaActual && proceso.sedeId === datos.sedeId))) return { error: "Los procesos deben pertenecer a la sede seleccionada." };
    if (funcionesPuesto.some(({ id }) => !nivelesAcceso.includes(datos.permisos[id]))) return { error: "Revisa los niveles de acceso." };
    const registro: Puesto = { ...datos, nombre: datos.nombre.trim(), id: datos.id || crypto.randomUUID(), empresaId: empresaActual };
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
    const id = crypto.randomUUID();
    setEmpresas((actuales) => [...actuales, { ...datos, id, estado: "Pendiente", perfil: { ...perfilVacio } }]);
    setUsuarios((actuales) => [...actuales, {
      id: `admin-${id}`, empresaId: id, nombre: datos.administrador, correo: datos.correo,
      rol: "Administrador", estado: "Pendiente", principal: true,
    }]);
    return id;
  }

  function actualizarEmpresa(datos: CambiosEmpresa) {
    setEmpresas((actuales) => actuales.map((empresa) =>
      empresa.id === empresaActual ? { ...empresa, ...datos } : empresa,
    ));
  }

  function invitarUsuario(datos: { nombre: string; correo: string; rol: Rol }) {
    const correo = datos.correo.trim().toLowerCase();
    if (usuarios.some((usuario) => usuario.correo.toLowerCase() === correo)) {
      return { error: "Este correo ya tiene un usuario o una invitación. Cada usuario pertenece a una sola empresa." };
    }
    const id = crypto.randomUUID();
    setUsuarios((actuales) => [...actuales, {
      ...datos, nombre: datos.nombre.trim(), correo, id,
      empresaId: empresaActual, estado: "Pendiente", principal: false,
    }]);
    return { id };
  }

  function aceptarUsuario(id: string) {
    const invitado = usuarios.find((usuario) => usuario.id === id && usuario.estado === "Pendiente");
    if (!invitado) return;
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
  }

  function aceptarInvitacion(id: string) {
    const administrador = usuarios.find((usuario) => usuario.empresaId === id && usuario.principal);
    if (administrador) aceptarUsuario(administrador.id);
  }

  return (
    <ContextoDemo.Provider value={{ empresas, empresaActual, usuarios, usuarioActual, sedes, procesos, puestos, guardarSede, guardarProceso, guardarPuesto, asignarPuesto, agregarEmpresa, actualizarEmpresa, invitarUsuario, aceptarInvitacion, aceptarUsuario }}>
      {children}
    </ContextoDemo.Provider>
  );
}

export function useDemo() {
  const datos = useContext(ContextoDemo);
  if (!datos) throw new Error("Falta el ProveedorDemo en el layout.");
  return datos;
}
