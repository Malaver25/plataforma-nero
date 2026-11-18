import { Suspense } from "react";
import FichaEmpresa from "./ficha-empresa";

async function Contenido({ params }: { params: Promise<{ empresaId: string }> }) {
  const { empresaId } = await params;
  return <FichaEmpresa id={empresaId} />;
}

export default function EmpresaPage({ params }: { params: Promise<{ empresaId: string }> }) {
  return (
    <Suspense fallback={<p>Cargando empresa…</p>}>
      <Contenido params={params} />
    </Suspense>
  );
}
