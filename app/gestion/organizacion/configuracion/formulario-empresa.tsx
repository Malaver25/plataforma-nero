"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useDemo } from "@/contexto/demostracion";
import type { Empresa, PerfilEmpresa } from "@/datos-demo/empresas";

const camposContacto: { clave: keyof PerfilEmpresa; texto: string; tipo: string; ejemplo: string }[] = [
  { clave: "correoContacto", texto: "Correo de la empresa", tipo: "email", ejemplo: "contacto@empresa.com" },
  { clave: "telefono", texto: "Teléfono", tipo: "tel", ejemplo: "+51 900 000 000" },
  { clave: "direccion", texto: "Domicilio fiscal", tipo: "text", ejemplo: "Calle, número y referencia" },
  { clave: "region", texto: "Departamento o región", tipo: "text", ejemplo: "Lima" },
  { clave: "ciudad", texto: "Ciudad o distrito", tipo: "text", ejemplo: "Lima" },
  { clave: "codigoPostal", texto: "Código postal", tipo: "text", ejemplo: "Opcional" },
];

export default function FormularioEmpresa({ empresa }: { empresa: Empresa }) {
  const { actualizarEmpresa } = useDemo();
  const [razonSocial, setRazonSocial] = useState(empresa.razonSocial);
  const [nombreComercial, setNombreComercial] = useState(empresa.nombreComercial);
  const [perfil, setPerfil] = useState({ ...empresa.perfil });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  function cambiar(campo: keyof PerfilEmpresa, valor: string) {
    setPerfil((actual) => ({ ...actual, [campo]: valor }));
  }

  function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!razonSocial.trim()) {
      setError("La razón social no puede estar vacía.");
      return;
    }
    const resultado = actualizarEmpresa({ razonSocial: razonSocial.trim(), nombreComercial: nombreComercial.trim(), perfil });
    if (resultado.error) { setError(resultado.error); setMensaje(""); return; }
    setRazonSocial(razonSocial.trim());
    setNombreComercial(nombreComercial.trim());
    setError("");
    setMensaje("Cambios guardados en la demostración. Se conservarán mientras navegues sin recargar.");
  }

  function descartar() {
    setRazonSocial(empresa.razonSocial);
    setNombreComercial(empresa.nombreComercial);
    setPerfil({ ...empresa.perfil });
    setError("");
    setMensaje("Se descartaron los cambios sin guardar.");
  }

  function cargarLogo(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(archivo.type) || archivo.size > 2 * 1024 * 1024) {
      setError("Selecciona un logotipo PNG, JPG o WebP de hasta 2 MB.");
      return;
    }
    const lector = new FileReader();
    lector.onload = () => { cambiar("logo", String(lector.result)); setError(""); };
    lector.onerror = () => setError("No se pudo leer la imagen. Prueba con otro archivo.");
    lector.readAsDataURL(archivo);
  }

  return (
    <form className="nero-formulario" onSubmit={guardar} onChangeCapture={() => { setMensaje(""); setError(""); }}>
      <p className="nero-texto-secundario">* Campo obligatorio. Identidad, contacto y preferencias de la organización.</p>
      <fieldset className="nero-tarjeta">
        <legend>Identidad de la empresa</legend>
        <div className="nero-form-grid">
          <div className="nero-campo"><label htmlFor="razon">Razón social *</label><input id="razon" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} required /></div>
          <div className="nero-campo"><label htmlFor="comercial">Nombre comercial</label><input id="comercial" value={nombreComercial} onChange={(e) => setNombreComercial(e.target.value)} /></div>
          <div className="nero-campo"><label htmlFor="ruc">RUC</label><input id="ruc" value={empresa.ruc} readOnly /><small>Asignado al crear la empresa.</small></div>
          <div className="nero-campo"><label htmlFor="pais">País</label><input id="pais" value="Perú" readOnly /></div>
          <div className="nero-campo">
            <label htmlFor="tipoPersona">Tipo de contribuyente</label>
            <select id="tipoPersona" value={perfil.tipoPersona} onChange={(e) => { cambiar("tipoPersona", e.target.value); if (e.target.value === "Persona natural") cambiar("formaJuridica", ""); }}>
              <option>Persona jurídica</option><option>Persona natural</option>
            </select>
          </div>
          <div className="nero-campo">
            <label htmlFor="formaJuridica">Forma jurídica</label>
            <select id="formaJuridica" value={perfil.formaJuridica} onChange={(e) => cambiar("formaJuridica", e.target.value)} disabled={perfil.tipoPersona === "Persona natural"}>
              <option value="">{perfil.tipoPersona === "Persona natural" ? "No corresponde" : "Seleccionar (opcional)"}</option>
              <option>S.A.C.</option><option>S.A.</option><option>S.R.L.</option><option>E.I.R.L.</option><option>Otra</option>
            </select>
          </div>
          <div className="nero-campo nero-ancho-completo"><label htmlFor="actividad">Actividad del negocio</label><input id="actividad" value={perfil.actividad} onChange={(e) => cambiar("actividad", e.target.value)} placeholder="Describe a qué se dedica la empresa" /></div>
        </div>
      </fieldset>

      <fieldset className="nero-tarjeta">
        <legend>Contacto y ubicación</legend>
        <div className="nero-form-grid">
          {camposContacto.map((campo) => (
            <div className="nero-campo" key={campo.clave}>
              <label htmlFor={campo.clave}>{campo.texto}</label>
              <input id={campo.clave} type={campo.tipo} placeholder={campo.ejemplo} value={perfil[campo.clave]} onChange={(e) => cambiar(campo.clave, e.target.value)} />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="nero-tarjeta">
        <legend>Preferencias</legend>
        <div className="nero-form-grid">
          <div className="nero-campo">
            <label htmlFor="moneda">Moneda base</label>
            <select id="moneda" value={perfil.moneda} onChange={(e) => cambiar("moneda", e.target.value)}><option value="PEN">PEN — Sol peruano</option><option value="USD">USD — Dólar estadounidense</option></select>
          </div>
          <div className="nero-campo">
            <label htmlFor="zonaHoraria">Zona horaria</label>
            <select id="zonaHoraria" value={perfil.zonaHoraria} onChange={(e) => cambiar("zonaHoraria", e.target.value)}><option value="America/Lima">Lima — America/Lima</option><option value="UTC">UTC</option></select>
          </div>
        </div>
      </fieldset>

      <fieldset className="nero-tarjeta">
        <legend>Logotipo</legend>
        <div className="nero-logo-editor">
          <div className="nero-logo-preview">
            {perfil.logo ? <Image src={perfil.logo} alt="Vista previa del logotipo" width={88} height={88} unoptimized /> : <span aria-hidden="true">{(nombreComercial || razonSocial || "E").slice(0, 2).toUpperCase()}</span>}
          </div>
          <div className="nero-campo">
            <label htmlFor="logo">Subir imagen</label>
            <input id="logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={cargarLogo} aria-describedby="ayuda-logo" />
            <small id="ayuda-logo">PNG, JPG o WebP. Máximo 2 MB. Solo se usa en esta demostración.</small>
            {perfil.logo && <button className="nero-enlace" type="button" onClick={() => { cambiar("logo", ""); setMensaje(""); }}>Quitar logotipo</button>}
          </div>
        </div>
      </fieldset>

      {error && <p className="nero-error" role="alert">{error}</p>}
      {mensaje && <p className="nero-exito" role="status">{mensaje}</p>}
      <div className="nero-acciones nero-al-final">
        <button type="button" className="nero-boton nero-secundario" onClick={descartar}>Descartar cambios</button>
        <button type="submit" className="nero-boton">Guardar cambios</button>
      </div>
    </form>
  );
}
