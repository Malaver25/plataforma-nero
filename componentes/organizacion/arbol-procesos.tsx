"use client";
import { type Proceso } from "@/datos-demo/organizacion";
import { type Registro } from "@/contexto/modulos-demo";
import Link from "next/link";
export default function ArbolProcesos({ procesos, padre = "", visitados = [] }: { procesos: Proceso[]; padre?: string; visitados?: string[] }) {
  return <ul className="nero-arbol">{procesos.filter(p => (p.padreId || "") === padre && !visitados.includes(p.id)).map(p => <li key={p.id}><strong>{p.nombre}</strong><small> · {p.tipo}</small><ArbolProcesos procesos={procesos} padre={p.id} visitados={[...visitados, p.id]} /></li>)}</ul>;
}

export function ArbolDepartamentos({ departamentos, padre = "", visitados = [] }: { departamentos: Registro[]; padre?: string; visitados?: string[] }) {
  return <ul className="nero-arbol">{departamentos.filter(d => (d.valores.padre || "") === padre && !visitados.includes(d.id)).map(d => <li key={d.id}><Link className="nero-enlace" href={`/gestion/organizacion/departamentos?registro=${d.id}`}>{d.nombre}</Link><ArbolDepartamentos departamentos={departamentos} padre={d.id} visitados={[...visitados, d.id]} /></li>)}</ul>;
}
