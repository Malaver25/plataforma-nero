export type PerfilEmpresa = {
  tipoPersona: string;
  formaJuridica: string;
  actividad: string;
  correoContacto: string;
  telefono: string;
  direccion: string;
  region: string;
  ciudad: string;
  codigoPostal: string;
  moneda: string;
  zonaHoraria: string;
  logo: string;
};

export const perfilVacio: PerfilEmpresa = {
  tipoPersona: "Persona jurídica", formaJuridica: "", actividad: "",
  correoContacto: "", telefono: "", direccion: "", region: "", ciudad: "",
  codigoPostal: "", moneda: "PEN", zonaHoraria: "America/Lima", logo: "",
};

export type Empresa = {
  id: string;
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  administrador: string;
  correo: string;
  estado: "Activa" | "Pendiente";
  perfil: PerfilEmpresa;
};

export type NuevaEmpresa = Omit<Empresa, "id" | "estado" | "perfil">;
export type CambiosEmpresa = Pick<Empresa, "razonSocial" | "nombreComercial" | "perfil">;

// Información ficticia para diseñar las pantallas. No son empresas reales.
export const empresasDemo: Empresa[] = [
  {
    id: "norte",
    razonSocial: "Comercial Norte S.A.C.",
    nombreComercial: "Norte",
    ruc: "20111111111",
    administrador: "Ana Torres",
    correo: "ana@example.com",
    estado: "Activa",
    perfil: {
      ...perfilVacio, formaJuridica: "S.A.C.", actividad: "Comercio de productos",
      correoContacto: "contacto@example.com", telefono: "+51 900 000 000",
      direccion: "Av. de Ejemplo 123", region: "Lima", ciudad: "Lima",
    },
  },
  {
    id: "costa",
    razonSocial: "Servicios Costa S.R.L.",
    nombreComercial: "Costa",
    ruc: "20222222222",
    administrador: "Luis Pérez",
    correo: "luis@example.com",
    estado: "Pendiente",
    perfil: { ...perfilVacio, formaJuridica: "S.R.L." },
  },
];
