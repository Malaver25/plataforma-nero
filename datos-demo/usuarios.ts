export const roles = ["Administrador", "Operador", "Consulta"] as const;
export type Rol = (typeof roles)[number];

export const descripcionRoles: Record<Rol, string> = {
  Administrador: "Configura la empresa y gestiona su equipo.",
  Operador: "Trabaja con las operaciones que se le habiliten.",
  Consulta: "Consulta información sin modificar registros.",
};

export type Usuario = {
  id: string;
  empresaId: string;
  nombre: string;
  correo: string;
  rol: Rol;
  estado: "Activo" | "Pendiente";
  principal: boolean;
  puestoId?: string;
};

// Cada usuario de ejemplo pertenece a una sola empresa.
export const usuariosDemo: Usuario[] = [
  { id: "admin-norte", empresaId: "norte", nombre: "Ana Torres", correo: "ana@example.com", rol: "Administrador", estado: "Activo", principal: true, puestoId: "coordinacion-norte" },
  { id: "marco", empresaId: "norte", nombre: "Marco Ruiz", correo: "marco@example.com", rol: "Operador", estado: "Activo", principal: false, puestoId: "operaciones-norte" },
  { id: "elena", empresaId: "norte", nombre: "Elena Díaz", correo: "elena@example.com", rol: "Consulta", estado: "Pendiente", principal: false },
  { id: "admin-costa", empresaId: "costa", nombre: "Luis Pérez", correo: "luis@example.com", rol: "Administrador", estado: "Pendiente", principal: true },
];
