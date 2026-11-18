import { Suspense } from "react";
import FormularioInvitacion from "./formulario-invitacion";

export default function InvitacionPage() {
  return (
    <main className="nero-acceso">
      <Suspense fallback={<p>Cargando invitación…</p>}>
        <FormularioInvitacion />
      </Suspense>
    </main>
  );
}
