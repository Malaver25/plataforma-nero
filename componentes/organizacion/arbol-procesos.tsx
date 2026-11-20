"use client";
import { type Proceso } from "@/datos-demo/organizacion";
export default function ArbolProcesos({ procesos, padre = "", visitados = [] }: { procesos: Proceso[]; padre?: string; visitados?: string[] }) {
  return <ul className="nero-arbol">{procesos.filter(p => (p.padreId || "") === padre && !visitados.includes(p.id)).map(p => <li key={p.id}><strong>{p.nombre}</strong><small> · {p.tipo}</small><ArbolProcesos procesos={procesos} padre={p.id} visitados={[...visitados, p.id]} /></li>)}</ul>;
}
