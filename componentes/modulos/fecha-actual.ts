"use client";
import { useEffect, useState } from "react";
// Evita consultar el reloj durante el prerender de Next; se actualiza al montar.
export function useFechaActual() {
  const [fecha, setFecha] = useState("");
  useEffect(() => { setFecha(new Date().toISOString().slice(0, 10)); }, []);
  return fecha;
}
