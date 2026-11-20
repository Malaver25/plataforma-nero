"use client";

import { useState, type FormEvent } from "react";
import { useDemo } from "@/contexto/demostracion";
import { roles, type Rol, type Usuario } from "@/datos-demo/usuarios";

export default function EditorUsuario({ usuario, cancelar, guardado }: { usuario: Usuario; cancelar: () => void; guardado: (nombre: string) => void }) {
  const { editarUsuario, puestos, empresaActual } = useDemo();
  const [error, setError] = useState("");
  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const campos = new FormData(event.currentTarget);
    const nombre = String(campos.get("nombre") || "");
    const resultado = editarUsuario({ id: usuario.id, nombre, correo: String(campos.get("correo") || ""), rol: usuario.principal ? "Administrador" : String(campos.get("rol")) as Rol, puestoId: String(campos.get("puesto") || "") });
    if (resultado.error) setError(resultado.error); else guardado(nombre.trim());
  }
  return <form className="nero-tarjeta nero-seccion" onSubmit={enviar} onChange={() => setError("")}>
    <h2>Editar a {usuario.nombre}</h2>
    <div className="nero-form-grid">
      <div className="nero-campo"><label htmlFor="editar-nombre">Nombre *</label><input id="editar-nombre" name="nombre" defaultValue={usuario.nombre} required maxLength={120} autoFocus /></div>
      <div className="nero-campo"><label htmlFor="editar-correo">Correo *</label><input id="editar-correo" name="correo" type="email" defaultValue={usuario.correo} required /></div>
      <div className="nero-campo"><label htmlFor="editar-rol">Rol general *</label><select id="editar-rol" name="rol" defaultValue={usuario.rol} disabled={usuario.principal}>{roles.map(rol => <option key={rol}>{rol}</option>)}</select>{usuario.principal && <small>El administrador principal conserva su rol.</small>}</div>
      <div className="nero-campo"><label htmlFor="editar-puesto">Puesto</label><select id="editar-puesto" name="puesto" defaultValue={usuario.puestoId || ""}><option value="">Sin puesto asignado</option>{puestos.filter(p => p.empresaId === empresaActual).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></div>
    </div>
    <p>Estado: {usuario.estado}. La activación se realiza al aceptar la invitación de prueba.</p>
    {error && <p className="nero-error" role="alert">{error}</p>}
    <div className="nero-acciones"><button className="nero-boton">Guardar usuario</button><button type="button" className="nero-boton nero-secundario" onClick={cancelar}>Cancelar</button></div>
  </form>;
}
