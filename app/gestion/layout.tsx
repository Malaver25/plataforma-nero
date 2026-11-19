import EstructuraAplicacion from "@/componentes/estructura/estructura-aplicacion";

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstructuraAplicacion area="empresa">
      <div className="nero-contenido">
        <p className="nero-demo">Demostración · Solo datos ficticios. Los cambios se reinician al recargar; acceso y permisos reales pendientes.</p>
        {children}
      </div>
    </EstructuraAplicacion>
  );
}
