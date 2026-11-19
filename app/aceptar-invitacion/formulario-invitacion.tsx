"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useDemo } from "@/contexto/demostracion";

export default function FormularioInvitacion() {
  const { empresas, usuarios, aceptarUsuario } = useDemo();
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const usuarioId = params.get("usuario");
  const invitado = usuarioId !== null
    ? usuarios.find((usuario) => usuario.id === usuarioId)
    : usuarios.find((usuario) => usuario.empresaId === params.get("empresa") && usuario.principal);
  const empresa = empresas.find((item) => item.id === invitado?.empresaId);

  function aceptar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    if (datos.get("clave") !== datos.get("confirmacion")) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!empresa || !invitado || invitado.estado !== "Pendiente") return;
    // Solo cambiamos el estado de la demostración. No almacenamos contraseñas.
    aceptarUsuario(invitado.id);
    router.push("/gestion");
  }

  if (!empresa || !invitado || invitado.estado !== "Pendiente") return (
    <section className="nero-tarjeta">
      <h1>Invitación no disponible</h1>
      <p>La invitación de prueba no existe, ya fue aceptada o se reinició al recargar.</p>
      <Link className="nero-enlace" href="/plataforma/empresas">Volver a empresas</Link>
    </section>
  );

  return (
    <section className="nero-tarjeta">
      <div className="nero-marca"><span aria-hidden="true">N</span> NERO</div>
      <h1>Tu empresa te espera</h1>
      <p>{invitado.nombre}, configura tu acceso a <strong>{empresa.nombreComercial || empresa.razonSocial}</strong>.</p>
      <p className="nero-demo">Invitación de demostración. Usa una contraseña ficticia; no se guardará.</p>
      <form onSubmit={aceptar} onChange={() => setError("")}>
        <div className="nero-campo">
          <label htmlFor="invitado">Correo invitado</label>
          <input id="invitado" type="email" value={invitado.correo} readOnly />
        </div>
        <div className="nero-campo">
          <label htmlFor="nuevaClave">Contraseña de prueba</label>
          <input id="nuevaClave" name="clave" type="password" minLength={8} placeholder="Al menos 8 caracteres" autoComplete="off" required />
        </div>
        <div className="nero-campo">
          <label htmlFor="confirmacion">Repetir contraseña</label>
          <input id="confirmacion" name="confirmacion" type="password" minLength={8} autoComplete="off" required />
        </div>
        {error && <p role="alert" className="nero-error">{error}</p>}
        <button type="submit" className="nero-boton">Aceptar invitación de prueba</button>
      </form>
      <p className="nero-pie"><Link href={`/plataforma/empresas/${empresa.id}`} className="nero-enlace">Volver a la ficha</Link></p>
    </section>
  );
}
