"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { empresasDemo, perfilVacio, type Empresa, type NuevaEmpresa, type CambiosEmpresa } from "../datos/empresas-demo";
import { usuariosDemo, type Usuario, type Rol } from "../datos/usuarios-demo";

type DatosDemo = {
  empresas: Empresa[];
  empresaActual: string;
  usuarios: Usuario[];
  usuarioActual: string;
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
    <ContextoDemo.Provider value={{ empresas, empresaActual, usuarios, usuarioActual, agregarEmpresa, actualizarEmpresa, invitarUsuario, aceptarInvitacion, aceptarUsuario }}>
      {children}
    </ContextoDemo.Provider>
  );
}

export function useDemo() {
  const datos = useContext(ContextoDemo);
  if (!datos) throw new Error("Falta el ProveedorDemo en el layout.");
  return datos;
}
