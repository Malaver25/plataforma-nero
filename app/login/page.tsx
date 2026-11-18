"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="nero-acceso">
      <section className="nero-tarjeta">
        <div className="nero-marca"><span aria-hidden="true">N</span> NERO</div>
        <h1>Bienvenido a Nero</h1>
        <p>Accede al espacio de tu empresa.</p>
        <p className="nero-demo">Vista previa sin autenticación. Usa datos ficticios; no se guardan contraseñas.</p>

        <form onSubmit={(event) => { event.preventDefault(); router.push("/panel"); }}>
          <div className="nero-campo">
            <label htmlFor="correo">Correo electrónico</label>
            <input id="correo" type="email" placeholder="tu@empresa.com" autoComplete="username" required />
          </div>
          <div className="nero-campo">
            <label htmlFor="clave">Contraseña de prueba</label>
            <input id="clave" type="password" placeholder="Introduce una contraseña ficticia" autoComplete="off" required />
          </div>
          <button className="nero-boton" type="submit">Entrar a la demostración</button>
        </form>

        <p className="nero-pie">El acceso a las empresas se realiza por invitación.</p>
        <div className="nero-acciones">
          <Link href="/plataforma" className="nero-enlace">Ver administración de plataforma →</Link>
        </div>
      </section>
    </main>
  );
}
