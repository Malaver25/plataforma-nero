import MarcoPanel from "../componentes/marco-panel";

export default function PlataformaLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarcoPanel area="plataforma">
      <div className="nero-contenido">
        <p className="nero-demo">Vista previa · Datos ficticios. Los cambios se reinician al recargar; no se envían correos.</p>
        {children}
      </div>
    </MarcoPanel>
  );
}
