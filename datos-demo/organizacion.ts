// Modelo inicial: una organización por empresa. Revisar si se requieren grupos de empresas.
export type Sede = { id: string; empresaId: string; nombre: string; direccion: string };
export const tiposProceso = ["Estratégico", "Operativo", "Apoyo"] as const;
export type Proceso = {
  id: string;
  empresaId: string;
  sedeId: string;
  nombre: string;
  tipo: (typeof tiposProceso)[number];
  descripcion: string;
};

export const funcionesPuesto = [
  { id: "organizacion", nombre: "Estructura de la organización" },
  { id: "personas", nombre: "Gestión de personas" },
  { id: "documentos", nombre: "Gestión documental" },
] as const;
export const nivelesAcceso = ["Sin acceso", "Lectura", "Edición"] as const;
export type PermisosPuesto = Record<(typeof funcionesPuesto)[number]["id"], (typeof nivelesAcceso)[number]>;
export const permisosVacios: PermisosPuesto = { organizacion: "Sin acceso", personas: "Sin acceso", documentos: "Sin acceso" };
export type Puesto = {
  id: string;
  empresaId: string;
  sedeId: string;
  nombre: string;
  responsabilidades: string;
  procesoIds: string[];
  permisos: PermisosPuesto;
};

export type Borrador<T extends { id: string; empresaId: string }> = Omit<T, "id" | "empresaId"> & { id?: string };
export type ResultadoGuardado = { error?: string; id?: string };

export const sedesDemo: Sede[] = [
  { id: "lima-norte", empresaId: "norte", nombre: "Sede Lima", direccion: "Av. de Ejemplo 123, Lima" },
  { id: "sede-costa", empresaId: "costa", nombre: "Sede Costa", direccion: "Dirección de ejemplo" },
];
export const procesosDemo: Proceso[] = [
  { id: "gestion-norte", empresaId: "norte", sedeId: "lima-norte", nombre: "Gestión de calidad", tipo: "Estratégico", descripcion: "Coordinar objetivos, documentos y mejora continua." },
  { id: "servicio-norte", empresaId: "norte", sedeId: "lima-norte", nombre: "Prestación del servicio", tipo: "Operativo", descripcion: "Organizar y dar seguimiento a las actividades del servicio." },
];
export const puestosDemo: Puesto[] = [
  { id: "coordinacion-norte", empresaId: "norte", sedeId: "lima-norte", nombre: "Coordinación de calidad", responsabilidades: "Coordinar el sistema de gestión y el seguimiento de sus procesos.", procesoIds: ["gestion-norte"], permisos: { organizacion: "Edición", personas: "Edición", documentos: "Edición" } },
  { id: "operaciones-norte", empresaId: "norte", sedeId: "lima-norte", nombre: "Responsable de operaciones", responsabilidades: "Dar seguimiento a la prestación del servicio.", procesoIds: ["servicio-norte"], permisos: { organizacion: "Lectura", personas: "Sin acceso", documentos: "Lectura" } },
];
