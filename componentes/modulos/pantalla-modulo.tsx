"use client";

import { useRef, useState, type FormEvent } from "react";
import { modulos, type Campo, type Modulo, type Seccion } from "@/modulos/catalogo";
import { useDemo } from "@/contexto/demostracion";
import { useModulosDemo, type Registro, type Valores } from "@/contexto/modulos-demo";
import CamposFormulario, { leerValores } from "./campos-formulario";

function descargar(archivo: Blob, nombre: string) {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function fechaVisible(valor: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(valor));
}

export default function PantallaModulo({ moduloId, seccionId }: { moduloId: string; seccionId: string }) {
  const { empresaActual } = useDemo();
  const modulo = modulos.find((item) => item.id === moduloId)!;
  const seccion = modulo.secciones.find((item) => item.id === seccionId)!;
  return <ContenidoModulo key={empresaActual + moduloId + seccionId} modulo={modulo} seccion={seccion} />;
}

function ContenidoModulo({ modulo, seccion }: { modulo: Modulo; seccion: Seccion }) {
  const { registros, archivar, opcionesCampo } = useModulosDemo();
  const clave = modulo.id + "/" + seccion.id;
  const propios = registros.filter((item) => item.clave === clave);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [archivados, setArchivados] = useState(false);
  const [orden, setOrden] = useState("recientes");
  const [pagina, setPagina] = useState(1);
  const [vista, setVista] = useState<"lista" | "formulario" | "detalle">("lista");
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const titulo = useRef<HTMLHeadingElement>(null);
  const registro = propios.find((item) => item.id === seleccionado);
  const columnas = (seccion.campos || []).filter((campo) => campo.tipo !== "area" && campo.tipo !== "casilla").slice(0, 2);
  const esListado = !seccion.modo || seccion.modo === "registros";
  const filtrados = propios.filter((item) => item.archivado === archivados && (!estado || item.estado === estado) && (item.nombre + " " + Object.values(item.valores).join(" ")).toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase())).sort((a, b) => orden === "nombre" ? a.nombre.localeCompare(b.nombre, "es") : orden === "estado" ? a.estado.localeCompare(b.estado, "es") : propios.indexOf(b) - propios.indexOf(a));
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / 8));
  const paginaActual = Math.min(pagina, totalPaginas);

  function mostrar(campo: Campo, item: Registro) {
    const valor = item.valores[campo.id];
    if (campo.tipo === "casilla") return valor === "si" ? "Sí" : "No";
    if (campo.referencia) return opcionesCampo(campo, item.valores).find((opcion) => opcion.id === valor)?.nombre || "Sin asignar";
    return valor || "Sin completar";
  }
  function volver() { setVista("lista"); setSeleccionado(null); titulo.current?.focus(); }
  function exportar() {
    const campos = seccion.campos || [];
    const celda = (valor: string) => '"' + (/^\s*[=+\-@]/.test(valor) ? "'" + valor : valor).replaceAll('"', '""') + '"';
    const filas = [["Nombre", "Estado", ...campos.map((campo) => campo.etiqueta)], ...filtrados.map((item) => [item.nombre, item.estado, ...campos.map((campo) => mostrar(campo, item))])];
    descargar(new Blob(["\uFEFF" + filas.map((fila) => fila.map(celda).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" }), modulo.id + "-" + seccion.id + ".csv");
    setMensaje("Se exportaron " + filtrados.length + " registros de la vista filtrada.");
  }

  return <main>
    <div className="nero-titulo"><div><p className="nero-sobretitulo">{modulo.titulo}</p><h1 ref={titulo} tabIndex={-1}>{seccion.titulo}</h1><p>{seccion.descripcion || modulo.descripcion}</p></div>
      {esListado && vista === "lista" && <button className="nero-boton" onClick={() => { setSeleccionado(null); setVista("formulario"); setMensaje(""); }}>Crear {seccion.singular}</button>}
    </div>
    {mensaje && <p className="nero-exito" role="status">{mensaje}</p>}
    {seccion.modo === "informacion" && <div className="nero-pila">{seccion.contenido?.map((bloque) => <section className="nero-tarjeta" key={bloque.titulo}><h2>{bloque.titulo}</h2><p className="nero-texto-secundario">{bloque.texto}</p></section>)}</div>}
    {seccion.modo === "configuracion" && <Configuracion clave={clave} seccion={seccion} />}
    {seccion.modo === "estadisticas" && <Estadisticas modulo={modulo} />}
    {seccion.modo === "lectura" && <section className="nero-tarjeta"><h2>Actividad de esta sesión</h2><ul className="nero-historial">{registros.filter((item) => item.clave.startsWith(modulo.id + "/")).flatMap((item) => item.historial.map((evento, indice) => <li key={item.id + indice}><strong>{item.nombre}</strong><span>{evento.accion}</span><small>{fechaVisible(evento.fecha)}</small></li>))}</ul>{!registros.some((item) => item.clave.startsWith(modulo.id + "/") && item.historial.length) && <p className="nero-vacio">Todavía no hay cambios registrados en este módulo.</p>}</section>}
    {esListado && vista === "formulario" && <FormularioRegistro clave={clave} seccion={seccion} registro={registro} cancelar={volver} guardado={(id) => { setSeleccionado(id); setVista("detalle"); setMensaje("Registro guardado en la demostración."); }} />}
    {esListado && vista === "detalle" && registro && <section className="nero-tarjeta">
      <div className="nero-seccion-cabecera"><div><span className="nero-etiqueta">{registro.archivado ? "Archivado" : registro.estado}</span><h2>{registro.nombre}</h2></div><button className="nero-boton nero-secundario" onClick={volver}>Volver al listado</button></div>
      <dl className="nero-detalle-grid">{(seccion.campos || []).map((campo) => <div key={campo.id} className={campo.tipo === "area" ? "nero-ancho-completo" : ""}><dt>{campo.etiqueta}</dt><dd>{mostrar(campo, registro)}</dd></div>)}</dl>
      {clave === "riesgos/registro" && <ResultadoRiesgo valores={registro.valores} />}
      <h3 className="nero-subtitulo">Archivos de esta sesión</h3>
      {registro.archivos.length ? <ul className="nero-archivos">{registro.archivos.map((archivo, indice) => <li key={indice}><span>{archivo.name}</span><button className="nero-enlace" onClick={() => descargar(archivo, archivo.name)}>Descargar</button></li>)}</ul> : <p className="nero-texto-secundario">No se adjuntaron archivos.</p>}
      <h3 className="nero-subtitulo">Historial de cambios</h3>
      <ul className="nero-historial">{registro.historial.map((evento, indice) => <li key={indice}><span>{evento.accion}</span><small>{fechaVisible(evento.fecha)}</small></li>)}</ul>
      {!registro.historial.length && <p className="nero-texto-secundario">Registro de ejemplo sin cambios.</p>}
      <div className="nero-acciones"><button className="nero-boton" onClick={() => setVista("formulario")}>Editar registro</button><button className="nero-boton nero-secundario" onClick={() => { archivar(registro.id); setMensaje(registro.archivado ? "Registro restaurado." : "Registro archivado. Puedes restaurarlo desde Archivados."); }}>{registro.archivado ? "Restaurar" : "Archivar"}</button></div>
    </section>}
    {esListado && vista === "lista" && <>
      <dl className="nero-resumen">
        <div className="nero-tarjeta"><dt>Registros activos</dt><dd>{propios.filter((item) => !item.archivado).length}</dd></div>
        <div className="nero-tarjeta"><dt>Con responsable</dt><dd>{propios.filter((item) => !item.archivado && item.valores.responsable).length}</dd></div>
        <div className="nero-tarjeta"><dt>Archivados</dt><dd>{propios.filter((item) => item.archivado).length}</dd></div>
      </dl>
      <section className="nero-tarjeta">
        <div className="nero-seccion-cabecera"><div className="nero-conmutador"><button aria-pressed={!archivados} onClick={() => { setArchivados(false); setPagina(1); }}>Activos</button><button aria-pressed={archivados} onClick={() => { setArchivados(true); setPagina(1); }}>Archivados</button></div><button className="nero-boton nero-secundario" disabled={!filtrados.length} onClick={exportar}>Exportar CSV</button></div>
        <div className="nero-filtros">
          <div><label htmlFor="buscar-modulo">Buscar registro</label><input id="buscar-modulo" type="search" value={busqueda} placeholder="Nombre o contenido" onChange={(event) => { setBusqueda(event.target.value); setPagina(1); }} /></div>
          <div><label htmlFor="estado-modulo">Estado</label><select id="estado-modulo" value={estado} onChange={(event) => { setEstado(event.target.value); setPagina(1); }}><option value="">Todos los estados</option>{seccion.estados?.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div><label htmlFor="orden-modulo">Ordenar</label><select id="orden-modulo" value={orden} onChange={(event) => setOrden(event.target.value)}><option value="recientes">Últimos creados</option><option value="nombre">Nombre</option><option value="estado">Estado</option></select></div>
        </div>
        <div className="nero-tabla"><table><caption className="sr-only">{seccion.titulo} de la empresa actual</caption><thead><tr><th scope="col">Nombre</th><th scope="col">Estado</th>{columnas.map((campo) => <th key={campo.id} scope="col">{campo.etiqueta}</th>)}<th scope="col">Acción</th></tr></thead><tbody>
          {filtrados.slice((paginaActual - 1) * 8, paginaActual * 8).map((item) => <tr key={item.id}><td><strong>{item.nombre}</strong><small>{item.archivos.length} archivos</small></td><td><span className="nero-estado" data-estado={item.estado}>{item.estado}</span></td>{columnas.map((campo) => <td key={campo.id}>{mostrar(campo, item)}</td>)}<td><button className="nero-enlace" aria-label={"Ver " + item.nombre} onClick={() => { setSeleccionado(item.id); setVista("detalle"); setMensaje(""); }}>Ver detalle</button></td></tr>)}
        </tbody></table></div>
        {!filtrados.length && <div className="nero-vacio"><h2>{busqueda || estado ? "No hay coincidencias" : archivados ? "No hay registros archivados" : "Comienza con el primer registro"}</h2><p>{busqueda || estado ? "Prueba con otros filtros." : "Los registros de prueba aparecerán aquí."}</p>{(busqueda || estado) && <button className="nero-enlace" onClick={() => { setBusqueda(""); setEstado(""); }}>Limpiar filtros</button>}</div>}
        <div className="nero-paginacion"><span>{filtrados.length} registros · Página {paginaActual} de {totalPaginas}</span><div><button className="nero-boton nero-secundario" disabled={paginaActual <= 1} onClick={() => setPagina(paginaActual - 1)}>Anterior</button><button className="nero-boton nero-secundario" disabled={paginaActual >= totalPaginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button></div></div>
      </section>
    </>}
  </main>;
}

function FormularioRegistro({ clave, seccion, registro, cancelar, guardado }: { clave: string; seccion: Seccion; registro?: Registro; cancelar: () => void; guardado: (id: string) => void }) {
  const { guardar } = useModulosDemo();
  const [nombre, setNombre] = useState(registro?.nombre || "");
  const [estado, setEstado] = useState(registro?.estado || seccion.estados?.[0] || "");
  const [valores, setValores] = useState<Valores>({ ...registro?.valores });
  const [archivos, setArchivos] = useState<File[]>(registro?.archivos || []);
  const [error, setError] = useState("");
  function cambiar(id: string, valor: string) {
    setValores((actual) => ({ ...actual, [id]: valor, ...(id === "sede" ? { proceso: "" } : {}), ...(id === "proyecto" ? { hito: "" } : {}) }));
    setError("");
  }
  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const capturados = leerValores(event.currentTarget, seccion.campos || []);
    setValores(capturados);
    const resultado = guardar(clave, { id: registro?.id, nombre, estado, valores: capturados, archivos });
    if (resultado.error) setError(resultado.error);
    else if (resultado.id) guardado(resultado.id);
  }
  return <form className="nero-tarjeta" onSubmit={enviar}>
    <h2>{registro ? "Editar " : "Crear "}{seccion.singular}</h2>
    <p className="nero-texto-secundario">* Campos obligatorios. Los cambios de estado son manuales en esta maqueta.</p>
    <div className="nero-form-grid">
      <div className="nero-campo"><label htmlFor="nombre-modulo">Nombre o título *</label><input id="nombre-modulo" value={nombre} onChange={(event) => setNombre(event.target.value)} required maxLength={160} autoFocus /></div>
      <div className="nero-campo"><label htmlFor="estado-registro">Estado *</label><select id="estado-registro" value={estado} onChange={(event) => setEstado(event.target.value)} required>{seccion.estados?.map((item) => <option key={item}>{item}</option>)}</select></div>
    </div>
    <CamposFormulario campos={seccion.campos || []} valores={valores} cambiar={cambiar} />
    {clave === "riesgos/registro" && <ResultadoRiesgo valores={valores} />}
    <div className="nero-campo"><label htmlFor="archivos-modulo">Adjuntos de prueba</label><input id="archivos-modulo" type="file" multiple aria-describedby="ayuda-adjuntos" onChange={(event) => {
      const seleccion = Array.from(event.target.files || []);
      if (seleccion.length + archivos.length > 5 || seleccion.some((archivo) => archivo.size > 10 * 1024 * 1024)) { setError("Adjunta hasta 5 archivos de un máximo de 10 MB cada uno."); event.target.value = ""; return; }
      setArchivos((actual) => [...actual, ...seleccion]); setError(""); event.target.value = "";
    }} /><small id="ayuda-adjuntos">Hasta 5 archivos, 10 MB cada uno. Permanecen en memoria durante esta sesión; no se suben a un servidor.</small></div>
    <ul className="nero-archivos">{archivos.map((archivo, indice) => <li key={indice}><span>{archivo.name}</span><button className="nero-enlace" type="button" onClick={() => setArchivos((actuales) => actuales.filter((_, posicion) => posicion !== indice))} aria-label={"Quitar " + archivo.name}>Quitar</button></li>)}</ul>
    {error && <p role="alert" className="nero-error">{error}</p>}
    <div className="nero-acciones"><button className="nero-boton" type="submit">Guardar registro</button><button className="nero-boton nero-secundario" type="button" onClick={cancelar}>Cancelar</button></div>
  </form>;
}
function ResultadoRiesgo({ valores }: { valores: Valores }) {
  const p = Number(valores.probabilidad), i = Number(valores.impacto);
  return p >= 1 && p <= 5 && i >= 1 && i <= 5 ? <p className="nero-demo">Valor inicial orientativo: <strong>{p * i} / 25</strong> · Probabilidad × impacto. No incluye eficacia de controles ni riesgo residual.</p> : null;
}

function Configuracion({ clave, seccion }: { clave: string; seccion: Seccion }) {
  const { empresaActual } = useDemo();
  const { configuraciones, configurar } = useModulosDemo();
  const guardados = configuraciones[empresaActual + ":" + clave] || {};
  const [valores, setValores] = useState<Valores>({ ...guardados });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  return <form className="nero-tarjeta" onSubmit={(event) => { event.preventDefault(); const capturados = leerValores(event.currentTarget, seccion.campos || []); setValores(capturados); const problema = configurar(clave, capturados); setError(problema || ""); setMensaje(problema ? "" : "Preferencias guardadas en la demostración. No activan servicios externos."); }}>
    <h2>Preferencias del módulo</h2>
    <CamposFormulario campos={seccion.campos || []} valores={valores} cambiar={(id, valor) => { setValores((actual) => ({ ...actual, [id]: valor })); setMensaje(""); setError(""); }} />
    {error && <p className="nero-error" role="alert">{error}</p>}{mensaje && <p className="nero-exito" role="status">{mensaje}</p>}
    <div className="nero-acciones"><button className="nero-boton" type="submit">Guardar preferencias</button><button className="nero-boton nero-secundario" type="button" onClick={() => { setValores({ ...guardados }); setError(""); setMensaje("Se descartaron los cambios sin guardar."); }}>Descartar cambios</button></div>
  </form>;
}
function Estadisticas({ modulo }: { modulo: Modulo }) {
  const { registros } = useModulosDemo();
  const datos = registros.filter((item) => item.clave.startsWith(modulo.id + "/") && !item.archivado);
  const estados = Array.from(new Set(datos.map((item) => item.estado)));
  return <div className="nero-columnas"><section className="nero-tarjeta"><h2>Distribución por estado</h2>{estados.map((estado) => {
    const cantidad = datos.filter((item) => item.estado === estado).length;
    return <div className="nero-barra-fila" key={estado}><div><span>{estado}</span><strong>{cantidad}</strong></div><meter min={0} max={Math.max(datos.length, 1)} value={cantidad} aria-label={estado + ": " + cantidad + " registros"} /></div>;
  })}{!datos.length && <p className="nero-vacio">Crea registros para ver la distribución.</p>}</section><section className="nero-tarjeta"><h2>Registros por apartado</h2><ul className="nero-lista-resumen">{modulo.secciones.filter((seccion) => !seccion.modo).map((seccion) => <li key={seccion.id}><span>{seccion.titulo}</span><strong>{datos.filter((item) => item.clave === modulo.id + "/" + seccion.id).length}</strong></li>)}</ul><p className="nero-texto-secundario">Los conteos se calculan a partir de los registros activos de esta demostración.</p></section></div>;
}
