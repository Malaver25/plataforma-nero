import Link from "next/link";

export default function NoEncontrado() {
  return <main className="nero-tarjeta"><h1>Pestaña no encontrada</h1><p>Revisa la dirección o vuelve al inicio del sistema.</p><Link className="nero-boton" href="/gestion">Ir al inicio</Link></main>;
}
