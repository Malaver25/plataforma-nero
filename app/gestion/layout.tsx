import EstructuraAplicacion from "@/componentes/estructura/estructura-aplicacion";
import { Suspense } from "react";
import PestanasModulo from "@/componentes/estructura/pestanas-modulo";

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstructuraAplicacion area="empresa">
      <div className="nero-contenido">
        <p className="nero-demo">Demostración · Solo datos ficticios. Los cambios se reinician al recargar; acceso y permisos reales pendientes.</p>
        <Suspense fallback={null}><PestanasModulo /></Suspense>
        {children}
      </div>
    </EstructuraAplicacion>
  );
}
