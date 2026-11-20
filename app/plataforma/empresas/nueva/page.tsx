"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useDemo } from "@/contexto/demostracion";

export default function NuevaEmpresa() {
  const router = useRouter();
  const { empresas, usuarios, agregarEmpresa } = useDemo();
  const [error, setError] = useState("");

  function crearEmpresa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const campos = new FormData(event.currentTarget);
    const texto = (nombre: string) => String(campos.get(nombre) ?? "").trim();
    const datos = {
      razonSocial: texto("razonSocial"), nombreComercial: texto("nombreComercial"),
      ruc: texto("numeroIdentificacion"), administrador: texto("nombreAdministrador"),
      correo: texto("correoAdministrador").toLowerCase(),
    };
    if (!datos.razonSocial || !datos.administrador) {
      setError("Completa la razón social y el nombre del administrador.");
      return;
    }
    if (empresas.some((empresa) => empresa.ruc === datos.ruc) || usuarios.some((usuario) => usuario.correo.toLowerCase() === datos.correo)) {
      setError("Ya existe una empresa de prueba con ese RUC o correo de administrador.");
      return;
    }
    const id = agregarEmpresa(datos);
    router.push(`/plataforma/empresas/${id}`);
  }

  return (
    <div className="empresa-fondo">
      <main className="empresa-pagina">
        <Link href="/plataforma/empresas" className="nero-enlace">← Volver a empresas</Link>
        <h1>Crear empresa</h1>
        <p>Registra la empresa e invita a su administrador.</p>
        <p>* Campos obligatorios</p>

        <form onSubmit={crearEmpresa} onChange={() => setError("")}>
          <fieldset>
            <legend>Datos de la empresa</legend>
            <div className="empresa-campos">
              <div>
                <label htmlFor="pais">País *</label>
                <select id="pais" name="pais" required>
                  <option value="PE">Perú</option>
                </select>
              </div>

              <div>
                <label htmlFor="tipoIdentificacion">Tipo de identificación fiscal *</label>
                <select id="tipoIdentificacion" name="tipoIdentificacion" required>
                  <option value="RUC">RUC</option>
                </select>
              </div>

              <div>
                <label htmlFor="numeroIdentificacion">Número de identificación fiscal *</label>
                <input id="numeroIdentificacion" name="numeroIdentificacion" type="text" inputMode="numeric" pattern="[0-9]{11}" maxLength={11} title="Ingresa 11 dígitos para el RUC de prueba." placeholder="Ingresa el número" required />
              </div>

              <div>
                <label htmlFor="razonSocial">Razón social *</label>
                <input id="razonSocial" name="razonSocial" type="text" placeholder="Nombre legal de la empresa" required />
              </div>

              <div>
                <label htmlFor="nombreComercial">Nombre comercial (opcional)</label>
                <input id="nombreComercial" name="nombreComercial" type="text" placeholder="Nombre del negocio" />
              </div>

              <div>
                <label htmlFor="monedaBase">Moneda base *</label>
                <select id="monedaBase" name="monedaBase" required>
                  <option value="PEN">PEN — Sol peruano</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Administrador</legend>
            <div className="empresa-campos">
              <div>
                <label htmlFor="nombreAdministrador">Nombre completo *</label>
                <input id="nombreAdministrador" name="nombreAdministrador" type="text" placeholder="Nombre y apellidos" required />
              </div>

              <div>
                <label htmlFor="correoAdministrador">Correo electrónico *</label>
                <input id="correoAdministrador" name="correoAdministrador" type="email" placeholder="administrador@empresa.com" required />
              </div>
            </div>
          </fieldset>

          <p className="empresa-aviso">Se creará una empresa de prueba. Podrás simular su invitación desde la ficha; no se enviará ningún correo.</p>
          {error && <p className="nero-error" role="alert">{error}</p>}
          <div className="empresa-botones">
            <Link href="/plataforma/empresas" className="nero-boton nero-secundario">Cancelar</Link>
            <button type="submit">Crear empresa de prueba</button>
          </div>
        </form>
      </main>
    </div>
  );
}
