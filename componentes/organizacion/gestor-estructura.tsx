"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useDemo } from "@/contexto/demostracion";
import { funcionesPuesto, nivelesAcceso, permisosVacios, tiposProceso, type PermisosPuesto, type Proceso } from "@/datos-demo/organizacion";

type Tipo = "sedes" | "procesos" | "puestos";
type Formulario = {
  id?: string;
  nombre: string;
  sedeId: string;
  direccion: string;
  descripcion: string;
  responsabilidades: string;
  tipo: Proceso["tipo"];
  procesoIds: string[];
  permisos: PermisosPuesto;
  padreId?: string;
  requisitos?: string;
  riesgo?: string;
  revision?: string;
};
const textos = {
  sedes: { titulo: "Sedes", nuevo: "Nueva sede", editar: "Editar sede", descripcion: "Registra los centros de trabajo de tu organización." },
  procesos: { titulo: "Procesos", nuevo: "Nuevo proceso", editar: "Editar proceso", descripcion: "Define las actividades y la sede donde se desarrollan." },
  puestos: { titulo: "Puestos y permisos", nuevo: "Nuevo puesto", editar: "Editar puesto", descripcion: "Define responsabilidades, procesos y niveles de acceso por puesto." },
};

export default function GestorEstructura({ tipo }: { tipo: Tipo }) {
  const { empresaActual } = useDemo();
  return <EditorEstructura key={empresaActual + tipo} tipo={tipo} />;
}

function EditorEstructura({ tipo }: { tipo: Tipo }) {
  const { empresaActual, sedes, procesos, puestos, usuarios, guardarSede, guardarProceso, guardarPuesto } = useDemo();
  const sedesEmpresa = sedes.filter((item) => item.empresaId === empresaActual);
  const procesosEmpresa = procesos.filter((item) => item.empresaId === empresaActual);
  const puestosEmpresa = puestos.filter((item) => item.empresaId === empresaActual);
  const registros = tipo === "sedes" ? sedesEmpresa : tipo === "procesos" ? procesosEmpresa : puestosEmpresa;
  const [busqueda, setBusqueda] = useState("");
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [filtroPermisos, setFiltroPermisos] = useState("");
  const encabezado = useRef<HTMLHeadingElement>(null);
  const texto = textos[tipo];
  const visibles = registros.filter((item) => item.nombre.toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase()));

  function abrir(id?: string) {
    const sede = tipo === "sedes" ? sedesEmpresa.find((item) => item.id === id) : undefined;
    const proceso = tipo === "procesos" ? procesosEmpresa.find((item) => item.id === id) : undefined;
    const puesto = tipo === "puestos" ? puestosEmpresa.find((item) => item.id === id) : undefined;
    setFormulario({ id, nombre: sede?.nombre || proceso?.nombre || puesto?.nombre || "", sedeId: proceso?.sedeId || puesto?.sedeId || "", direccion: sede?.direccion || "", descripcion: proceso?.descripcion || "", responsabilidades: puesto?.responsabilidades || "", tipo: proceso?.tipo || "Operativo", procesoIds: puesto?.procesoIds || [], permisos: { ...permisosVacios, ...puesto?.permisos }, padreId: proceso?.padreId || "", requisitos: puesto?.requisitos || "", riesgo: puesto?.riesgo || "Sin evaluar", revision: puesto?.revision || "" });
    setError("");
    setMensaje("");
  }

  function cambiar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setFormulario((actual) => actual ? { ...actual, [campo]: valor } : actual);
    setError("");
  }

  function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formulario) return;
    const { id, nombre, direccion, sedeId, descripcion, responsabilidades, procesoIds, permisos } = formulario;
    const resultado = tipo === "sedes" ? guardarSede({ id, nombre, direccion })
      : tipo === "procesos" ? guardarProceso({ id, nombre, sedeId, tipo: formulario.tipo, descripcion, padreId: formulario.padreId })
      : guardarPuesto({ id, nombre, sedeId, responsabilidades, procesoIds, permisos, requisitos: formulario.requisitos, riesgo: formulario.riesgo, revision: formulario.revision });
    if (resultado.error) { setError(resultado.error); return; }
    setFormulario(null);
    setBusqueda("");
    setMensaje(`${nombre.trim()}: ${id ? "cambios guardados" : "registro creado"} en la demostración.`);
    encabezado.current?.focus();
  }

  return <main>
    <div className="nero-titulo"><div><p className="nero-sobretitulo">{tipo === "puestos" ? "Personas" : "Organización"}</p><h1 ref={encabezado} tabIndex={-1}>{texto.titulo}</h1><p>{texto.descripcion}</p></div>{!formulario && (tipo === "sedes" || sedesEmpresa.length > 0) && <button className="nero-boton" onClick={() => abrir()}>{texto.nuevo}</button>}</div>
    {mensaje && <p role="status" className="nero-exito">{mensaje}</p>}
    {formulario ? <form className="nero-tarjeta nero-seccion" onSubmit={guardar}>
      <h2>{formulario.id ? texto.editar : texto.nuevo}</h2>
      <div className="nero-form-grid">
        <div className="nero-campo"><label htmlFor="nombre-registro">Nombre *</label><input id="nombre-registro" value={formulario.nombre} onChange={(event) => cambiar("nombre", event.target.value)} required maxLength={120} autoFocus /></div>
        {tipo === "sedes" ? <div className="nero-campo"><label htmlFor="direccion-sede">Dirección</label><input id="direccion-sede" value={formulario.direccion} onChange={(event) => cambiar("direccion", event.target.value)} maxLength={250} /></div>
          : <div className="nero-campo"><label htmlFor="sede-registro">Sede *</label><select id="sede-registro" value={formulario.sedeId} required onChange={(event) => { cambiar("sedeId", event.target.value); cambiar("procesoIds", []); }}><option value="">Selecciona una sede</option>{sedesEmpresa.map((sede) => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}</select></div>}
        {tipo === "procesos" && <>
          <div className="nero-campo"><label htmlFor="padre-proceso">Proceso superior</label><select id="padre-proceso" value={formulario.padreId} onChange={e => cambiar("padreId", e.target.value)}><option value="">Sin proceso superior</option>{procesosEmpresa.filter(p => p.sedeId === formulario.sedeId && p.id !== formulario.id).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></div>
          <div className="nero-campo"><label htmlFor="tipo-proceso">Tipo de proceso *</label><select id="tipo-proceso" value={formulario.tipo} onChange={(event) => cambiar("tipo", event.target.value as Proceso["tipo"])}>{tiposProceso.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="nero-campo nero-ancho-completo"><label htmlFor="descripcion-proceso">Descripción</label><textarea id="descripcion-proceso" value={formulario.descripcion} onChange={(event) => cambiar("descripcion", event.target.value)} rows={3} maxLength={2000} /></div>
        </>}
        {tipo === "puestos" && <>
          <div className="nero-campo"><label htmlFor="puesto-requisitos">Requisitos y competencias</label><textarea id="puesto-requisitos" value={formulario.requisitos} onChange={e => cambiar("requisitos", e.target.value)} /></div>
          <div className="nero-campo"><label htmlFor="puesto-riesgo">Riesgo del puesto</label><select id="puesto-riesgo" value={formulario.riesgo} onChange={e => cambiar("riesgo", e.target.value)}>{["Sin evaluar", "Bajo", "Medio", "Alto"].map(r => <option key={r}>{r}</option>)}</select></div>
          <div className="nero-campo"><label htmlFor="puesto-revision">Próxima revisión</label><input id="puesto-revision" type="date" value={formulario.revision} onChange={e => cambiar("revision", e.target.value)} /></div>
          <div className="nero-campo nero-ancho-completo"><label htmlFor="responsabilidades-puesto">Funciones y responsabilidades</label><textarea id="responsabilidades-puesto" value={formulario.responsabilidades} onChange={(event) => cambiar("responsabilidades", event.target.value)} rows={3} maxLength={2000} /></div>
          <fieldset className="nero-ancho-completo nero-opciones"><legend>Procesos en los que participa</legend>
            {procesosEmpresa.filter((proceso) => proceso.sedeId === formulario.sedeId).map((proceso) => <label key={proceso.id}><input type="checkbox" checked={formulario.procesoIds.includes(proceso.id)} onChange={(event) => cambiar("procesoIds", event.target.checked ? [...formulario.procesoIds, proceso.id] : formulario.procesoIds.filter((id) => id !== proceso.id))} />{proceso.nombre}</label>)}
            {!procesosEmpresa.some((proceso) => proceso.sedeId === formulario.sedeId) && <p className="nero-texto-secundario">{formulario.sedeId ? "Esta sede aún no tiene procesos. Puedes vincularlos después." : "Selecciona una sede para ver sus procesos."}</p>}
          </fieldset>
          <fieldset className="nero-ancho-completo"><legend>Niveles de acceso propuestos</legend>
            <p className="nero-demo">Matriz por apartado. Define el acceso propuesto; no constituye autorización del servidor.</p>
            <div className="nero-campo"><label htmlFor="filtro-permisos">Buscar permiso o módulo</label><input id="filtro-permisos" type="search" value={filtroPermisos} onChange={e => setFiltroPermisos(e.target.value)} /></div>
            <div className="nero-permisos-grid">{funcionesPuesto.filter(f => f.nombre.toLowerCase().includes(filtroPermisos.toLowerCase())).map((funcion) => <div className="nero-campo" key={funcion.id}><label htmlFor={`permiso-${funcion.id}`}>{funcion.nombre}</label><select id={`permiso-${funcion.id}`} value={formulario.permisos[funcion.id] || "Sin acceso"} onChange={(event) => cambiar("permisos", { ...formulario.permisos, [funcion.id]: event.target.value as PermisosPuesto[typeof funcion.id] })}>{nivelesAcceso.map((nivel) => <option key={nivel}>{nivel}</option>)}</select></div>)}</div>
          </fieldset>
        </>}
      </div>
      {error && <p className="nero-error" role="alert">{error}</p>}
      <div className="nero-acciones"><button className="nero-boton" type="submit">Guardar {tipo === "sedes" ? "sede" : tipo === "procesos" ? "proceso" : "puesto"}</button><button className="nero-boton nero-secundario" type="button" onClick={() => { setFormulario(null); encabezado.current?.focus(); }}>Cancelar</button></div>
    </form> : <section className="nero-tarjeta" aria-label={`Listado de ${texto.titulo.toLowerCase()}`}>
      <div className="nero-filtros"><div><label htmlFor="buscar-registro">Buscar por nombre</label><input id="buscar-registro" type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder={`Buscar ${tipo}`} /></div><span className="nero-texto-secundario">{visibles.length} registros</span></div>
      {tipo !== "sedes" && !sedesEmpresa.length && <p className="nero-demo">Primero debes <Link className="nero-enlace" href="/gestion/organizacion/sedes">registrar una sede</Link>.</p>}
      <div className="nero-tabla"><table><caption className="sr-only">{texto.titulo} de la empresa actual</caption><thead><tr><th scope="col">Nombre</th><th scope="col">{tipo === "sedes" ? "Dirección" : "Sede"}</th><th scope="col">{tipo === "sedes" ? "Procesos" : tipo === "procesos" ? "Tipo" : "Personas"}</th><th scope="col">Acción</th></tr></thead><tbody>
        {visibles.map((registro) => <tr key={registro.id}>
          <td><strong>{registro.nombre}</strong>{"responsabilidades" in registro && <small>{registro.responsabilidades || "Sin responsabilidades registradas"}</small>}</td>
          <td>{"direccion" in registro ? registro.direccion || "Sin dirección" : sedesEmpresa.find((sede) => sede.id === registro.sedeId)?.nombre}</td>
          <td>{tipo === "sedes" ? procesosEmpresa.filter((proceso) => proceso.sedeId === registro.id).length : "tipo" in registro ? registro.tipo : usuarios.filter((usuario) => usuario.empresaId === empresaActual && usuario.puestoId === registro.id).length}</td>
          <td><button className="nero-enlace" onClick={() => abrir(registro.id)} aria-label={`Editar ${registro.nombre}`}>Editar</button></td>
        </tr>)}
      </tbody></table></div>
      {!visibles.length && <div className="nero-vacio"><p>{busqueda ? "No se encontraron coincidencias." : `Todavía no hay ${tipo} registrados.`}</p>{busqueda && <button className="nero-enlace" onClick={() => setBusqueda("")}>Limpiar búsqueda</button>}</div>}
    </section>}
  </main>;
}
