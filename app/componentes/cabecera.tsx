export default function Cabecera({ area }: { area: "plataforma" | "empresa" }) {
  return (
    <header className="nero-cabecera">
      <span className="nero-area">{area === "plataforma" ? "Administración de plataforma" : "Espacio de empresa"}</span>
      <span className="nero-cabecera-perfil">{area === "plataforma" ? "Administrador" : "Usuario de empresa"} · Demo</span>
    </header>
  );
}
