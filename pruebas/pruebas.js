/* Pruebas automáticas de desarrollo. Ejecutar: node pruebas/pruebas.js */
const A = require("../js/automatas.js");
const C = require("../js/conversion.js");
const E = require("../js/expresiones.js");
const V = require("../js/verificador.js");
let ok = 0,
  fail = 0;
function test(name, fn) {
  try {
    if (fn()) {
      ok++;
      console.log("✓ " + name);
    } else {
      fail++;
      console.error("✗ " + name);
    }
  } catch (e) {
    fail++;
    console.error("✗ " + name + " — " + e.message);
  }
}
const afnd = {
  states: ["q0", "q1", "q2"],
  alphabet: ["a", "b"],
  initialState: "q0",
  finalStates: ["q2"],
  transitions: [
    { from: "q0", symbol: "a", to: "q0" },
    { from: "q0", symbol: "a", to: "q1" },
    { from: "q1", symbol: "b", to: "q2" },
  ],
};
const cv = C.convertirAFNDaAFD(afnd);
const label = C.formatearConjunto;
const afd = {
  states: cv.afd.states.map(label),
  alphabet: cv.afd.alphabet,
  initialState: label(cv.afd.initialState),
  finalStates: cv.afd.finalStates.map(label),
  transitions: cv.afd.transitions.map((t) => ({
    from: label(t.from),
    symbol: t.symbol,
    to: label(t.to),
  })),
};
test("Valida el caso 1", () => A.validarAutomata(afnd).length === 0);
test("Rechaza entrada vacía en el caso 1", () => !A.aceptaAFND(afnd, []));
test("Acepta ab en el AFND", () => A.aceptaAFND(afnd, ["a", "b"]));
test("Rechaza aa en el AFND", () => !A.aceptaAFND(afnd, ["a", "a"]));
test("Incluye el conjunto pozo", () =>
  cv.afd.states.some((s) => s.length === 0));
test("El resultado del método de subconjuntos es determinista", () =>
  A.verificarDeterminismo(afd).esDeterminista);
test("El AFD acepta ab", () => A.aceptaAFD(afd, ["a", "b"]));
test("El AFD rechaza b", () => !A.aceptaAFD(afd, ["b"]));
test("ER simple acepta a", () => E.aceptaER("a", ["a"], ["a", "b"]));
test("ER unión acepta a y b", () =>
  E.aceptaER("a+b", ["b"], ["a", "b"]) && E.aceptaER("a+b", ["a"], ["a", "b"]));
test("ER estrella acepta cadena vacía", () => E.aceptaER("a*", [], ["a", "b"]));
test("ER estrella acepta aaa", () =>
  E.aceptaER("a*", ["a", "a", "a"], ["a", "b"]));
test("ER concatenada acepta ab", () =>
  E.aceptaER("ab", ["a", "b"], ["a", "b"]));
test("ER ∅ no acepta cadena vacía", () => !E.aceptaER("∅", [], ["a", "b"]));
const er = E.convertirAFaER(afnd).expression;
test("ER generada acepta ab", () => E.aceptaER(er, ["a", "b"], afnd.alphabet));
test("ER generada rechaza b", () => !E.aceptaER(er, ["b"], afnd.alphabet));
test("Genera 127 cadenas para alfabeto binario hasta longitud 6", () =>
  V.generarCadenas(["a", "b"], 6).length === 127);
test("Rechaza longitud menor que 6", () => {
  try {
    V.generarCadenas(["a", "b"], 5);
    return false;
  } catch (_) {
    return true;
  }
});
test("El verificador no detecta diferencias entre AFND, AFD y ER generada hasta longitud 6", () =>
  V.verificar({ afnd, afd, regex: er, maxLength: 6 }).summary.discrepancies ===
  0);
const caso2 = {
  states: ["q0", "q1", "q2"],
  alphabet: ["x", "y"],
  initialState: "q0",
  finalStates: ["q1"],
  transitions: [
    { from: "q0", symbol: "x", to: "q1" },
    { from: "q1", symbol: "x", to: "q2" },
    { from: "q2", symbol: "y", to: "q2" },
    { from: "q2", symbol: "y", to: "q1" },
  ],
};
const cv2 = C.convertirAFNDaAFD(caso2);
const afd2 = {
  states: cv2.afd.states.map(label),
  alphabet: cv2.afd.alphabet,
  initialState: label(cv2.afd.initialState),
  finalStates: cv2.afd.finalStates.map(label),
  transitions: cv2.afd.transitions.map((t) => ({
    from: label(t.from),
    symbol: t.symbol,
    to: label(t.to),
  })),
};
const er2 = E.convertirAFaER(afd2).expression;
test("Caso 2: acepta x en AFND", () => A.aceptaAFND(caso2, ["x"]));
test("Caso 2: rechaza xx en AFND", () => !A.aceptaAFND(caso2, ["x", "x"]));
test("Caso 2: expresión generada y autómata coinciden hasta longitud 6", () =>
  V.verificar({ afnd: caso2, afd: afd2, regex: er2, maxLength: 6 }).summary
    .discrepancies === 0);
console.log(`\nResultado: ${ok} aprobadas, ${fail} fallidas.`);
if (fail) process.exitCode = 1;
