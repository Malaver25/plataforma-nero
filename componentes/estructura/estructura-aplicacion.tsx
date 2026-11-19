import { Suspense, type ReactNode } from "react";
import Cabecera from "./cabecera";
import MenuLateral from "./menu-lateral";
import "./menu-lateral.css";

export default function EstructuraAplicacion({ area, children }: {
  area: "plataforma" | "empresa";
  children: ReactNode;
}) {
  return (
    <div className="nero-marco">
      <Suspense fallback={<aside className="nero-lateral">Cargando menú…</aside>}>
        <MenuLateral area={area} />
      </Suspense>
      <div className="nero-marco-principal">
        <Cabecera area={area} />
        {children}
      </div>
    </div>
  );
}
