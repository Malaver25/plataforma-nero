"use client";

import "./formulario.css";

export default function NuevaEmpresa() {
  return (
    <div className="empresa-fondo">
      <main className="empresa-pagina">
        <h1>Crear empresa</h1>
        <p>Registra la empresa e invita a su administrador.</p>
        <p>* Campos obligatorios</p>

        {/* Evita el envío hasta que conectemos el formulario al servidor. */}
        <form onSubmit={(event) => event.preventDefault()}>
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
                <input id="numeroIdentificacion" name="numeroIdentificacion" type="text" placeholder="Ingresa el número" required />
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

          <p className="empresa-aviso">Formulario de práctica: todavía no guarda datos ni envía invitaciones.</p>
          <div className="empresa-botones">
            <button type="reset">Cancelar</button>
            <button type="submit">Crear empresa y enviar invitación</button>
          </div>
        </form>
      </main>
    </div>
  );
}
