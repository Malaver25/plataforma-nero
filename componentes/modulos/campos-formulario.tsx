"use client";

import Link from "next/link";
import { type Campo } from "@/modulos/catalogo";
import { useModulosDemo, type Valores } from "@/contexto/modulos-demo";

export function leerValores(formulario: HTMLFormElement, campos: Campo[]): Valores {
  const datos = new FormData(formulario);
  return Object.fromEntries(campos.map((campo) => [campo.id, campo.tipo === "casilla" ? (datos.has(campo.id) ? "si" : "no") : String(datos.get(campo.id) || "").trim()]));
}

export default function CamposFormulario({ campos, valores, cambiar }: { campos: Campo[]; valores: Valores; cambiar: (id: string, valor: string) => void }) {
  const { opcionesCampo } = useModulosDemo();
  return <div className="nero-form-grid">{campos.map((campo) => {
    const id = "campo-" + campo.id;
    const valor = valores[campo.id] || "";
    const opciones = opcionesCampo(campo, valores);
    const seleccion = campo.tipo === "seleccion" || !!campo.referencia;
    return <div className={"nero-campo" + (campo.tipo === "area" ? " nero-ancho-completo" : "")} key={campo.id}>
      {campo.tipo === "casilla" ? <label className="nero-casilla"><input id={id} name={campo.id} type="checkbox" checked={valor === "si"} onChange={(event) => cambiar(campo.id, event.target.checked ? "si" : "no")} />{campo.etiqueta}</label> : <>
        <label htmlFor={id}>{campo.etiqueta}{campo.requerido ? " *" : ""}</label>
        {seleccion ? <select id={id} name={campo.id} required={campo.requerido} value={valor} onChange={(event) => cambiar(campo.id, event.target.value)}>
          <option value="">Seleccionar</option>{opciones.map((opcion) => <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>)}
        </select> : campo.tipo === "area" ? <textarea id={id} name={campo.id} value={valor} rows={4} required={campo.requerido} maxLength={5000} onChange={(event) => cambiar(campo.id, event.target.value)} /> :
          <input id={id} name={campo.id} type={campo.tipo === "numero" ? "number" : campo.tipo === "fecha" ? "date" : campo.tipo === "email" ? "email" : "text"} value={valor} required={campo.requerido} min={campo.minimo} max={campo.maximo} step={campo.tipo === "numero" ? "any" : undefined} maxLength={5000} onInput={(event) => cambiar(campo.id, event.currentTarget.value)} onChange={(event) => cambiar(campo.id, event.target.value)} />}
        {campo.referencia && !opciones.length && <small>No hay opciones disponibles. {campo.referencia.includes("/") ? <Link className="nero-enlace" href={"/gestion/" + campo.referencia}>Revisar registros relacionados</Link> : "Completa primero la estructura de la organización."}</small>}
      </>}
    </div>;
  })}</div>;
}
