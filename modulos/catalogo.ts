import { gestionInterna } from "./gestion-interna";
import { operaciones } from "./operaciones";
export type { Campo, Seccion, Modulo } from "./definiciones";

export const modulos = [...gestionInterna, ...operaciones];
export function rutaSeccion(modulo: string, seccion: string) {
  return "/gestion/" + modulo + (seccion ? "/" + seccion : "");
}
export function buscarSeccion(clave: string) {
  const [moduloId, seccionId] = clave.split("/");
  return modulos.find((modulo) => modulo.id === moduloId)?.secciones.find((seccion) => seccion.id === seccionId);
}
