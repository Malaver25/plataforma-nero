// Recorrido de datos del frontend. No comprueba autenticación ni seguridad del servidor.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const raiz = path.resolve(__dirname, '..');
const cache = new Map(), estados = [];
let cursor = 0, ctx;
const react = {
  createContext: () => ({ Provider: 'provider' }),
  useContext: () => null,
  useState: valor => { const i = cursor++; if (!(i in estados)) estados[i] = valor; return [estados[i], cambio => { estados[i] = typeof cambio === 'function' ? cambio(estados[i]) : cambio; }]; },
};
function cargar(archivo) {
  if (cache.has(archivo)) return cache.get(archivo);
  const exports = {}; cache.set(archivo, exports);
  const js = ts.transpileModule(fs.readFileSync(archivo, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  function resolver(nombre) {
    if (nombre === 'react') return react;
    if (nombre === 'react/jsx-runtime') return { jsx: (tipo, props) => ({ tipo, props }) };
    if (nombre.startsWith('.') || nombre.startsWith('@/')) {
      const base = nombre.startsWith('@/') ? path.join(raiz, nombre.slice(2)) : path.resolve(path.dirname(archivo), nombre);
      return cargar(['.ts', '.tsx'].map(e => base + e).find(fs.existsSync));
    }
    return require(nombre);
  }
  vm.runInNewContext(js, { exports, require: resolver, crypto: globalThis.crypto, Date, console }, { filename: archivo });
  return exports;
}
const { ProveedorDemo } = cargar(path.join(raiz, 'contexto/demostracion.tsx'));
function render() { cursor = 0; ctx = ProveedorDemo({ children: null }).props.value; }
function ok(resultado) { assert.ok(resultado.id, resultado.error); render(); return resultado.id; }
render();
const alta = { razonSocial: ' Empresa   Recorrido ', nombreComercial: 'Recorrido', ruc: '20999999991', administrador: ' Admin   Prueba ', correo: ' ADMIN.RECORRIDO@EXAMPLE.COM ' };
assert.ok(ctx.agregarEmpresa({ ...alta, ruc: '123' }).error);
assert.ok(ctx.agregarEmpresa({ ...alta, correo: 'invalido' }).error);
const empresaId = ok(ctx.agregarEmpresa(alta));
assert.equal(ctx.empresas.find(e => e.id === empresaId).razonSocial, 'Empresa Recorrido');
assert.ok(ctx.agregarEmpresa(alta).error);
assert.ok(ctx.agregarEmpresa({ ...alta, ruc: '20999999992', correo: 'ana@example.com' }).error);
assert.ok(ctx.seleccionarEmpresa(empresaId).error, 'No abre empresas aún pendientes');
const admin = ctx.usuarios.find(u => u.empresaId === empresaId && u.principal);
ok(ctx.aceptarUsuario(admin.id));
assert.equal(ctx.empresaActual, empresaId);
assert.equal(ctx.empresas.find(e => e.id === empresaId).estado, 'Activa');
assert.ok(ctx.aceptarUsuario(admin.id).error, 'No acepta una invitación dos veces');
const sede = ok(ctx.guardarSede({ nombre: 'Sede Principal', direccion: 'Dirección ficticia' }));
assert.ok(ctx.guardarSede({ nombre: ' SEDE   PRINCIPAL ', direccion: '' }).error);
const otraSede = ok(ctx.guardarSede({ nombre: 'Segunda sede', direccion: '' }));
const borrador = { nombre: 'Proceso raíz', sedeId: sede, tipo: 'Operativo', descripcion: '' };
const proceso = ok(ctx.guardarProceso(borrador)); // Regresión: otros procesos raíz no deben bloquear una creación.
const proceso2 = ok(ctx.guardarProceso({ ...borrador, nombre: 'Proceso de otra sede', sedeId: otraSede }));
assert.ok(ctx.guardarProceso({ ...borrador, nombre: 'Cruce', sedeId: 'lima-norte' }).error);
const hijo = ok(ctx.guardarProceso({ ...borrador, nombre: 'Subproceso', padreId: proceso }));
assert.ok(ctx.guardarProceso({ ...borrador, id: proceso, padreId: hijo }).error, 'Impide ciclos');
assert.ok(ctx.guardarProceso({ ...borrador, id: proceso, sedeId: otraSede }).error, 'Impide mover un padre con hijos');
const puesto = ok(ctx.guardarPuesto({ nombre: 'Coordinador', sedeId: sede, responsabilidades: 'Revisar', procesoIds: [proceso], permisos: { 'documentos/controlados': 'Revisión' } }));
assert.equal(ctx.puestos.find(p => p.id === puesto).permisos['documentos/controlados'], 'Revisión');
assert.equal(ctx.puestos.find(p => p.id === puesto).permisos['personas/usuarios'], 'Sin acceso');
assert.ok(ctx.guardarPuesto({ nombre: 'Cruce de puesto', sedeId: otraSede, responsabilidades: '', procesoIds: [proceso], permisos: {} }).error);
assert.ok(ctx.guardarPuesto({ nombre: 'Permiso inválido', sedeId: sede, responsabilidades: '', procesoIds: [], permisos: { personas: 'Todopoderoso' } }).error);
const invitado = ok(ctx.invitarUsuario({ nombre: ' Operador Prueba ', correo: ' OPERADOR.RECORRIDO@EXAMPLE.COM ', rol: 'Operador', puestoId: puesto }));
assert.equal(ctx.usuarios.find(u => u.id === invitado).puestoId, puesto);
assert.ok(ctx.invitarUsuario({ nombre: 'Otro', correo: 'operador.recorrido@example.com', rol: 'Consulta' }).error);
assert.ok(ctx.invitarUsuario({ nombre: 'Otro', correo: 'otro@example.com', rol: 'Consulta', puestoId: 'coordinacion-norte' }).error);
assert.ok(ctx.editarUsuario({ id: 'marco', nombre: 'No autorizado', correo: 'otro@example.com', rol: 'Operador' }).error);
ok(ctx.aceptarUsuario(invitado));
ok(ctx.editarUsuario({ id: invitado, nombre: 'Operador Editado', correo: 'operador.editado@example.com', rol: 'Consulta', puestoId: puesto }));
assert.equal(ctx.usuarios.find(u => u.id === invitado).nombre, 'Operador Editado');
assert.equal(ctx.usuarios.find(u => u.id === invitado).estado, 'Activo');
assert.ok(ctx.editarUsuario({ id: admin.id, nombre: admin.nombre, correo: admin.correo, rol: 'Consulta' }).error);
ok(ctx.editarUsuario({ id: admin.id, nombre: 'Administrador Editado', correo: 'admin.editado@example.com', rol: 'Administrador', puestoId: puesto }));
assert.equal(ctx.empresas.find(e => e.id === empresaId).correo, 'admin.editado@example.com');
ok(ctx.guardarPuesto({ ...ctx.puestos.find(p => p.id === puesto), nombre: 'Coordinador Editado' }));
assert.equal(ctx.usuarios.find(u => u.id === invitado).puestoId, puesto);
ok(ctx.asignarPuesto(invitado, ''));
assert.equal(ctx.usuarios.find(u => u.id === invitado).puestoId, undefined);
ok(ctx.asignarPuesto(invitado, puesto));
assert.ok(ctx.asignarPuesto('marco', puesto).error);
assert.ok(ctx.asignarPuesto(invitado, 'coordinacion-norte').error);
ok(ctx.seleccionarEmpresa('norte'));
assert.equal(ctx.usuarioActual, 'admin-norte');
ok(ctx.seleccionarEmpresa(empresaId));
assert.equal(ctx.usuarioActual, admin.id);
assert.equal(ctx.procesos.find(p => p.id === proceso2).sedeId, otraSede);
console.log('OK: empresa → invitación → sede → proceso → puesto/permisos → usuario, edición, duplicados, jerarquías y regreso a empresas activas.');
