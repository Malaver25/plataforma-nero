import { roles, descripcionRoles } from "@/datos-demo/usuarios";

export default function RolesEquipo() {
  return (
    <section className="nero-tarjeta nero-seccion" aria-labelledby="roles-equipo">
      <h2 id="roles-equipo">Roles del equipo</h2>
      <div className="nero-roles">{roles.map((rol) => (
        <div key={rol}><h3>{rol}</h3><p>{descripcionRoles[rol]}</p></div>
      ))}</div>
      <p className="nero-texto-secundario">Descripción de roles propuesta. En este prototipo todavía no se restringen acciones por rol.</p>
    </section>
  );
}
