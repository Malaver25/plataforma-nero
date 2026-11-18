"use client";

import { useDemo } from "../../componentes/datos-demo";
import FormularioPerfil from "./formulario-perfil";

export default function ConfiguracionPage() {
  const { empresas, empresaActual } = useDemo();
  const empresa = empresas.find((item) => item.id === empresaActual)!;
  return (
    <main>
      <div className="nero-titulo">
        <div><p className="nero-sobretitulo">{empresa.nombreComercial || empresa.razonSocial}</p><h1>Configuración de empresa</h1><p>Completa la identidad, los datos de contacto y las preferencias de tu empresa.</p></div>
      </div>
      <FormularioPerfil key={empresa.id} empresa={empresa} />
    </main>
  );
}
