// Verifica el catálogo y, opcionalmente, las rutas de la aplicación local.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const ts = require("typescript");
const raiz = path.resolve(__dirname, "../modulos");
const cache = new Map();
function cargar(nombre) {
  const archivo = path.resolve(raiz, nombre + ".ts");
  assert(archivo.startsWith(raiz + path.sep), "Importación fuera del catálogo");
  if (cache.has(archivo)) return cache.get(archivo);
  const exports = {};
  cache.set(archivo, exports);
  const js = ts.transpileModule(fs.readFileSync(archivo, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(js, { exports, require: (ruta) => cargar(ruta) }, { filename: archivo });
  return exports;
}
const { modulos, rutaSeccion } = cargar("catalogo");
const claves = new Set();
const rutas = [];
for (const modulo of modulos) {
  assert(modulo.secciones.length, "Módulo vacío: " + modulo.id);
  for (const seccion of modulo.secciones) {
    const clave = modulo.id + "/" + seccion.id;
    assert(!claves.has(clave), "Pestaña duplicada: " + clave);
    claves.add(clave);
    const ids = (seccion.campos || []).map((campo) => campo.id);
    assert.equal(ids.length, new Set(ids).size, "Campos duplicados: " + clave);
    if (!seccion.modo && !seccion.propia) assert(seccion.estados?.length, "Faltan estados: " + clave);
    rutas.push({ url: rutaSeccion(modulo.id, seccion.id), titulo: seccion.titulo });
  }
}
for (const modulo of modulos) for (const seccion of modulo.secciones) for (const campo of seccion.campos || []) {
  if (campo.referencia) assert(claves.has(campo.referencia) || ["sedes", "procesos", "usuarios"].includes(campo.referencia), "Referencia inexistente: " + campo.referencia);
}
async function main() {
  const base = process.argv[2];
  let comprobadas = 0;
  if (base) {
    const pendientes = [...rutas];
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (pendientes.length) {
        const ruta = pendientes.shift();
        const response = await fetch(new URL(ruta.url, base), { signal: AbortSignal.timeout(30000) });
        const html = await response.text();
        const contenido = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
        assert.equal(response.status, 200, ruta.url + ": HTTP " + response.status);
        assert(!contenido.includes("Pestaña no encontrada"), ruta.url + ": ruta no resuelta");
        assert(!html.includes("NEXT_HTTP_ERROR_FALLBACK;500"), ruta.url + ": error del servidor");
        assert(contenido.includes("<h1"), ruta.url + ": falta contenido de la página");
        comprobadas++;
      }
    }));
  }
  console.log(JSON.stringify({ modulos: modulos.length, pestanas: rutas.length, rutasComprobadas: comprobadas, catalogo: "OK" }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
