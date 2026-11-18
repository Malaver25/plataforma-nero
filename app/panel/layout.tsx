import MarcoPanel from "../componentes/marco-panel";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarcoPanel area="empresa">
      <div className="nero-contenido">
        <p className="nero-demo">Demostración · Solo datos ficticios. Los cambios se reinician al recargar; acceso y permisos reales pendientes.</p>
        {children}
      </div>
    </MarcoPanel>
  );
}
