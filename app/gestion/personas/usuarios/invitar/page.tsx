"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useDemo } from "@/contexto/demostracion";
import { roles, descripcionRoles, type Rol } from "@/datos-demo/usuarios";

export default function InvitarUsuarioPage() {
  const { empresas, empresaActual, invitarUsuario } = useDemo();
  const empresa = empresas.find((item) => item.id === empresaActual)!;
  const [rol, setRol] = useState<Rol>("Operador");
  const [error, setError] = useState("");
  const [invitacion, setInvitacion] = useState<{ id: string; correo: string } | null>(null);

  function invitar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    const nombre = String(datos.get("nombre") ?? "").trim();
    const correo = String(datos.get("correo") ?? "").trim().toLowerCase();
    if (!nombre) { setError("Escribe el nombre del usuario."); return; }
    const resultado = invitarUsuario({ nombre, correo, rol });
    if (resultado.error) { setError(resultado.error); return; }
    if (resultado.id) setInvitacion({ id: resultado.id, correo });
  }

  return (
    <main>
      <Link className="nero-enlace" href="/gestion/personas/usuarios">← Volver a usuarios</Link>
      <div className="nero-titulo"><div><h1>Invitar usuario</h1><p>El nuevo usuario pertenecerá a {empresa.nombreComercial || empresa.razonSocial}.</p></div></div>
      {invitacion ? (
        <section className="nero-tarjeta nero-form-estrecho">
          <h2>Invitación de prueba creada</h2>
          <p role="status">{invitacion.correo} figura como pendiente en el equipo. No se ha enviado ningún correo.</p>
          <div className="nero-acciones">
            <Link href={`/aceptar-invitacion?usuario=${invitacion.id}`} className="nero-boton">Probar aceptación</Link>
            <Link href="/gestion/personas/usuarios" className="nero-boton nero-secundario">Ver equipo</Link>
            <button className="nero-enlace" onClick={() => { setInvitacion(null); setRol("Operador"); }}>Invitar a otra persona</button>
          </div>
        </section>
      ) : (
        <form className="nero-tarjeta nero-form-estrecho" onSubmit={invitar} onChange={() => setError("")}>
          <div className="nero-campo"><label htmlFor="nombre">Nombre completo *</label><input id="nombre" name="nombre" placeholder="Nombre y apellidos" required /></div>
          <div className="nero-campo"><label htmlFor="correo">Correo electrónico *</label><input id="correo" name="correo" type="email" placeholder="usuario@empresa.com" required /></div>
          <div className="nero-campo">
            <label htmlFor="rol">Rol *</label>
            <select id="rol" value={rol} onChange={(e) => setRol(e.target.value as Rol)} aria-describedby="descripcion-rol">{roles.map((item) => <option key={item}>{item}</option>)}</select>
            <small id="descripcion-rol">{descripcionRoles[rol]}</small>
          </div>
          <p className="nero-demo">El usuario establecerá su contraseña al aceptar la invitación. En esta demo no se guardan contraseñas ni se envían correos.</p>
          {error && <p role="alert" className="nero-error">{error}</p>}
          <div className="nero-acciones nero-al-final"><Link href="/gestion/personas/usuarios" className="nero-boton nero-secundario">Cancelar</Link><button type="submit" className="nero-boton">Crear invitación de prueba</button></div>
        </form>
      )}
    </main>
  );
}
