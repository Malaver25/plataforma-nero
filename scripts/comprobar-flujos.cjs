// Comprueba reglas de negocio de la demostración sin navegador ni servicios externos.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const raiz = path.resolve(__dirname, '..');
const cache = new Map();
const estados = [];
let cursor = 0;
const demo = {
  empresaActual: 'norte', usuarioActual: 'autor',
  usuarios: ['autor', 'revisor', 'aprobador'].map(id => ({ id, nombre: id, empresaId: 'norte' })),
  sedes: [], procesos: [],
};
const react = {
  createContext: () => ({ Provider: 'provider' }),
  useContext: () => null,
  useState: inicial => { const i = cursor++; if (!(i in estados)) estados[i] = inicial; return [estados[i], valor => { estados[i] = typeof valor === 'function' ? valor(estados[i]) : valor; }]; },
};
function cargar(archivo) {
  archivo = path.resolve(archivo);
  if (cache.has(archivo)) return cache.get(archivo);
  const exports = {};
  cache.set(archivo, exports);
  const source = fs.readFileSync(archivo, 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const resolver = nombre => {
    if (nombre === 'react') return react;
    if (nombre === 'react/jsx-runtime') return { jsx: (tipo, props) => ({ tipo, props }) };
    if (nombre === './demostracion') return { useDemo: () => demo };
    if (nombre.startsWith('.') || nombre.startsWith('@/')) {
      const base = nombre.startsWith('@/') ? path.join(raiz, nombre.slice(2)) : path.resolve(path.dirname(archivo), nombre);
      return cargar(['.ts', '.tsx'].map(e => base + e).find(fs.existsSync));
    }
    return require(nombre);
  };
  vm.runInNewContext(js, { exports, require: resolver, crypto: globalThis.crypto, File, Date, console }, { filename: archivo });
  return exports;
}
const reglas = cargar(path.join(raiz, 'modulos/flujos.ts'));
const simple = (valores, datos = {}) => ({ id: 'r', clave: 'objetivos/planificacion', nombre: 'Prueba', estado: 'Planificado', archivado: false, valores, ...datos });
assert.equal(reglas.fechasProgramadas('2024-01-31', '', 'Mensual', '2024-03-31').join(','), '2024-01-31,2024-02-29,2024-03-31');
const objetivo = simple({ fechaInicio: '2026-01-15', frecuencia: 'Mensual' });
const medicion = simple({ origen: 'r', fecha: '2026-01-20' }, { id: 'medicion' });
assert.equal(reglas.medicionesPendientes(objetivo, [medicion], '2026-03-31').join(','), '2026-02-15,2026-03-15');
assert.equal(reglas.medicionesPendientes(objetivo, [simple({ origen: 'r', fecha: '2026-12-31', periodo: '2026-01-15' })], '2026-02-01').length, 1);
assert.equal(reglas.medicionesPendientes(objetivo, [{ ...medicion, archivado: true }], '2026-02-01').length, 1);
assert.equal(reglas.nivelRiesgo(20), 'Muy alto');
assert.equal(reglas.nivelRiesgo(20, 3), 'Alto');
assert.equal(reglas.validarTransicion(simple({}, { clave: 'no-conformidades/registro', estado: 'En proceso' }), 'Cerrada', []).includes('acciones'), true);

const { ProveedorModulosDemo } = cargar(path.join(raiz, 'contexto/modulos-demo.tsx'));
let ctx;
function render() { cursor = 0; ctx = ProveedorModulosDemo({ children: null }).props.value; }
render();
function crear(clave, valores, estado, nombre = 'Prueba', archivos = []) {
  const result = ctx.guardar(clave, { nombre, valores, estado, archivos });
  assert.ok(result.id, result.error);
  render(); return ctx.registros.find(r => r.id === result.id);
}
function actualizar(r, cambios) { const result = ctx.guardar(r.clave, { ...r, ...cambios }); render(); return result; }
const carpeta = crear('documentos/carpetas', {}, 'Disponible');
const subcarpeta = crear('documentos/carpetas', { padre: carpeta.id }, 'Disponible');
assert.ok(actualizar(carpeta, { valores: { padre: subcarpeta.id } }).error, 'Impide ciclos de carpetas');
const doc = crear('documentos/controlados', { version: '1.0', revisor: 'revisor', aprobador: 'aprobador' }, 'Borrador', 'Manual', [new File(['contenido'], 'manual.txt')]);
assert.ok(actualizar(doc, { estado: 'Aprobado' }).error, 'No salta la revisión desde el formulario');
assert.equal(ctx.actuar(doc.id, 'En revisión', 'Enviar', 'autor'), undefined); render();
assert.ok(ctx.actuar(doc.id, 'Pendiente de aprobación', 'Revisado', 'autor'), 'Exige revisor asignado');
assert.equal(ctx.actuar(doc.id, 'Pendiente de aprobación', 'Revisado', 'revisor'), undefined); render();
assert.equal(ctx.actuar(doc.id, 'Aprobado', 'Conforme', 'aprobador'), undefined); render();
assert.ok(actualizar(ctx.registros.find(r => r.id === doc.id), { nombre: 'Cambiar aprobado' }).error);
assert.equal(ctx.nuevaVersion(doc.id), undefined); render();
assert.equal(ctx.registros.find(r => r.id === doc.id).estado, 'Borrador');
assert.equal(ctx.registros.find(r => r.id === doc.id).versiones.at(-1).archivos[0].name, 'manual.txt');
const producto = crear('infinity/inventario', { cantidad: '10' }, 'Activo');
crear('infinity/movimientos', { producto: producto.id, cantidad: '7', tipo: 'Salida', fecha: '2026-11-20' }, 'Registrado');
assert.equal(reglas.stock(producto, ctx.registros), 3);
assert.ok(ctx.guardar('infinity/movimientos', { nombre: 'Exceso', estado: 'Registrado', valores: { producto: producto.id, cantidad: '4', tipo: 'Salida', fecha: '2026-11-20' }, archivos: [] }).error);
const proyecto = crear('proyectos/registro', { fechaInicio: '2026-01-01', fechaFin: '2026-01-31' }, 'Pendiente de inicio');
const hito = crear('proyectos/hitos', { proyecto: proyecto.id, fechaInicio: '2026-01-05' }, 'Pendiente');
crear('proyectos/tareas', { proyecto: proyecto.id, hito: hito.id, fechaInicio: '2026-01-05', avance: '80' }, 'En proceso');
const copia = ctx.clonarProyecto(proyecto.id, 'Copia', '2026-02-01'); assert.ok(copia.id); render();
const hijos = ctx.registros.filter(r => r.valores.proyecto === copia.id);
assert.equal(hijos.length, 2);
assert.equal(hijos.find(r => r.clave === 'proyectos/tareas').valores.hito, hijos.find(r => r.clave === 'proyectos/hitos').id);
assert.equal(hijos.find(r => r.clave === 'proyectos/tareas').valores.avance, '0');
assert.equal(hijos[0].valores.fechaInicio, '2026-02-05');
demo.empresaActual = 'otra'; render();
assert.equal(ctx.registros.length, 0, 'La vista de otra empresa no recibe registros de Norte');
assert.ok(ctx.guardar(doc.clave, { ...doc, nombre: 'Intento entre empresas' }).error);
assert.ok(ctx.actuar(doc.id, 'En revisión', 'Intento', 'autor'));
console.log('OK: recurrencias, periodos, riesgos, cierre, jerarquía, revisión, versiones, stock, plantillas y separación de empresas en demo.');
