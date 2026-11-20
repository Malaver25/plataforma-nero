"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useModulosDemo, type Registro } from "@/contexto/modulos-demo";
import { useDemo } from "@/contexto/demostracion";

function VideoLocal({ archivo, terminado }: { archivo: File; terminado: () => void }) {
  const [url, setUrl] = useState("");
  useEffect(() => { const temporal = URL.createObjectURL(archivo); setUrl(temporal); return () => URL.revokeObjectURL(temporal); }, [archivo]);
  return url ? <video className="nero-video" src={url} controls onEnded={terminado}><track kind="captions" />Tu navegador no permite reproducir este video.</video> : <p>Cargando recurso…</p>;
}

export function Formacion({ campus = false }: { campus?: boolean }) {
  const { registros, guardar } = useModulosDemo();
  const { usuarioActual } = useDemo();
  const [mensaje, setMensaje] = useState("");
  const [activo, setActivo] = useState("");
  const clave = campus ? "personas/cursos" : "ayuda/recursos";
  const cursos = registros.filter(r => r.clave === clave && !r.archivado && r.estado === "Disponible");
  const inscripcion = (curso: Registro) => registros.find(r => r.clave === "personas/matriculas" && !r.archivado && r.valores.curso === curso.id && r.valores.persona === usuarioActual);
  function completar(curso: Registro) { const matricula = inscripcion(curso); if (matricula) setMensaje(guardar(matricula.clave, { ...matricula, estado: "Completado", valores: { ...matricula.valores, avance: "100" } }).error || "Curso completado en la demostración. No se emite certificación oficial."); }
  return <section className="nero-tarjeta"><h2>{campus ? "Campus de formación interno" : "Biblioteca de tutoriales"}</h2><p>Recursos propios añadidos durante esta sesión. Los videos y textos se pierden al recargar.</p><Link className="nero-boton nero-secundario" href={`/gestion/${clave}?crear=1`}>Añadir recurso</Link><div className="nero-modulos-grid">{cursos.map(curso => {
    const matricula = inscripcion(curso), video = curso.archivos.find(a => a.type.startsWith("video/"));
    return <article className="nero-version" key={curso.id}><h3>{curso.nombre}</h3><p>{curso.valores.descripcion}</p>{campus && <p>{matricula ? `${matricula.estado} · ${matricula.valores.avance || 0} %` : "Sin matrícula"}</p>}<div className="nero-acciones">{campus && !matricula ? <button className="nero-boton" onClick={() => setMensaje(guardar("personas/matriculas", { nombre: curso.nombre, estado: "En curso", valores: { curso: curso.id, persona: usuarioActual, avance: "0" }, archivos: [] }).error || "Matrícula registrada en la sesión.")}>Matricularme</button> : <button className="nero-boton nero-secundario" onClick={() => setActivo(activo === curso.id ? "" : curso.id)}>{activo === curso.id ? "Cerrar recurso" : "Abrir recurso"}</button>}</div>{activo === curso.id && <div><p className="nero-contenido-texto">{curso.valores.contenido}</p>{video ? <VideoLocal archivo={video} terminado={() => completar(curso)} /> : <p>Recurso de lectura. Puedes adjuntar un video desde su ficha.</p>}{campus && matricula?.estado !== "Completado" && <button className="nero-enlace" onClick={() => completar(curso)}>Marcar estudio completado</button>}</div>}</article>;
  })}</div>{!cursos.length && <p className="nero-vacio">Añade un recurso y márcalo como Disponible para mostrarlo aquí.</p>}<p role="status">{mensaje}</p></section>;
}

export function CuentaDemo() {
  const [mensaje, setMensaje] = useState("");
  return <section className="nero-tarjeta"><h2>Cambio de contraseña · prototipo</h2><p className="nero-demo">Usa contraseñas ficticias. Esta pantalla comprueba el formulario; no cambia credenciales ni guarda su contenido.</p><form onSubmit={e => { e.preventDefault(); const datos = new FormData(e.currentTarget); const nueva = String(datos.get("nueva")); if (nueva !== datos.get("confirmar")) { setMensaje("Las contraseñas no coinciden."); return; } if (!/[a-z]/.test(nueva) || !/[A-Z]/.test(nueva) || !/[0-9]/.test(nueva)) { setMensaje("Incluye mayúsculas, minúsculas y números."); return; } setMensaje("Formulario válido. El cambio real requiere el servicio de autenticación."); e.currentTarget.reset(); }}><div className="nero-form-grid">{[["actual", "Contraseña actual de prueba"], ["nueva", "Nueva contraseña de prueba"], ["confirmar", "Confirmar contraseña"]].map(([id, label]) => <div className="nero-campo" key={id}><label htmlFor={id}>{label}</label><input type="password" id={id} name={id} required minLength={8} autoComplete="off" /></div>)}</div><button className="nero-boton">Comprobar formulario</button></form><p role="status">{mensaje}</p></section>;
}
