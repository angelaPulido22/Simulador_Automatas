/**
 * Modelo y operaciones básicas de autómatas finitos.
 * Este archivo no depende del DOM ni de la interfaz gráfica.
 *
 * Modelo esperado:
 * {
 *   states: ["q0", "q1"],
 *   alphabet: ["a", "b"],
 *   initialState: "q0",
 *   finalStates: ["q1"],
 *   transitions: [
 *     { from: "q0", symbol: "a", to: "q1" }
 *   ]
 * }
 */

(function (global) {
  "use strict";

  function esArregloDeCadenasUnicas(valor) {
    return Array.isArray(valor) &&
      valor.every(item => typeof item === "string" && item.trim() !== "") &&
      new Set(valor).size === valor.length;
  }

  /**
   * Valida la estructura de un autómata básico, sin transiciones ε.
   * Devuelve un arreglo vacío si es válido o una lista de errores.
   */
  function validarAutomata(automata) {
    const errores = [];

    if (!automata || typeof automata !== "object" || Array.isArray(automata)) {
      return ["El autómata debe ser un objeto válido."];
    }

    const { states, alphabet, initialState, finalStates, transitions } = automata;

    if (!esArregloDeCadenasUnicas(states) || states.length === 0) {
      errores.push("Debe existir una lista de estados no vacía, con nombres únicos y no vacíos.");
    }

    if (!esArregloDeCadenasUnicas(alphabet) || alphabet.length === 0) {
      errores.push("El alfabeto debe contener al menos un símbolo único y no vacío.");
    }

    if (typeof initialState !== "string" || initialState.trim() === "") {
      errores.push("Debe definirse un estado inicial válido.");
    } else if (Array.isArray(states) && !states.includes(initialState)) {
      errores.push("El estado inicial debe pertenecer al conjunto de estados.");
    }

    if (!Array.isArray(finalStates)) {
      errores.push("Los estados finales deben proporcionarse en una lista.");
    } else {
      if (new Set(finalStates).size !== finalStates.length) {
        errores.push("La lista de estados finales no debe contener duplicados.");
      }

      finalStates.forEach(estado => {
        if (typeof estado !== "string" || !Array.isArray(states) || !states.includes(estado)) {
          errores.push(`El estado final "${String(estado)}" no pertenece al conjunto de estados.`);
        }
      });
    }

    if (!Array.isArray(transitions)) {
      errores.push("Las transiciones deben proporcionarse en una lista.");
    } else {
      transitions.forEach((transicion, indice) => {
        const numero = indice + 1;

        if (!transicion || typeof transicion !== "object") {
          errores.push(`La transición ${numero} no es un objeto válido.`);
          return;
        }

        const { from, symbol, to } = transicion;

        if (typeof from !== "string" || !Array.isArray(states) || !states.includes(from)) {
          errores.push(`El origen de la transición ${numero} no pertenece al conjunto de estados.`);
        }

        if (typeof to !== "string" || !Array.isArray(states) || !states.includes(to)) {
          errores.push(`El destino de la transición ${numero} no pertenece al conjunto de estados.`);
        }

        if (typeof symbol !== "string" || !Array.isArray(alphabet) || !alphabet.includes(symbol)) {
          errores.push(`El símbolo de la transición ${numero} no pertenece al alfabeto.`);
        }
      });
    }

    return errores;
  }

  /**
   * Devuelve todos los destinos posibles desde un estado con un símbolo.
   * Admite varios destinos para una misma combinación (AFND).
   */
  function obtenerDestinos(automata, estado, simbolo) {
    const errores = validarAutomata(automata);
    if (errores.length > 0) {
      throw new Error(`Autómata inválido: ${errores.join(" ")}`);
    }

    if (!automata.states.includes(estado)) {
      throw new Error(`El estado "${estado}" no existe en el autómata.`);
    }

    if (!automata.alphabet.includes(simbolo)) {
      throw new Error(`El símbolo "${simbolo}" no pertenece al alfabeto.`);
    }

    return [...new Set(
      automata.transitions
        .filter(t => t.from === estado && t.symbol === simbolo)
        .map(t => t.to)
    )];
  }

  /**
   * Devuelve los estados alcanzables desde un conjunto de estados
   * consumiendo un símbolo. El resultado no contiene duplicados.
   */
  function obtenerDestinosDeConjunto(automata, conjuntoEstados, simbolo) {
    const errores = validarAutomata(automata);
    if (errores.length > 0) {
      throw new Error(`Autómata inválido: ${errores.join(" ")}`);
    }

    if (!Array.isArray(conjuntoEstados)) {
      throw new Error("El conjunto de estados debe ser una lista.");
    }

    conjuntoEstados.forEach(estado => {
      if (!automata.states.includes(estado)) {
        throw new Error(`El estado "${estado}" no existe en el autómata.`);
      }
    });

    if (!automata.alphabet.includes(simbolo)) {
      throw new Error(`El símbolo "${simbolo}" no pertenece al alfabeto.`);
    }

    const destinos = new Set();

    conjuntoEstados.forEach(estado => {
      automata.transitions.forEach(transicion => {
        if (transicion.from === estado && transicion.symbol === simbolo) {
          destinos.add(transicion.to);
        }
      });
    });

    return [...destinos].sort();
  }

  /**
   * Determina si un AFND acepta una cadena.
   * Una cadena se representa como arreglo de símbolos, por ejemplo ["a", "b"].
   * También acepta una cadena de texto si cada símbolo del alfabeto es un carácter.
   */
  function aceptaAFND(automata, entrada) {
    const errores = validarAutomata(automata);
    if (errores.length > 0) {
      throw new Error(`Autómata inválido: ${errores.join(" ")}`);
    }

    const simbolos = normalizarEntrada(automata, entrada);
    let actuales = new Set([automata.initialState]);

    for (const simbolo of simbolos) {
      if (!automata.alphabet.includes(simbolo)) {
        throw new Error(`El símbolo "${simbolo}" no pertenece al alfabeto.`);
      }

      const siguientes = new Set();

      actuales.forEach(estado => {
        automata.transitions.forEach(transicion => {
          if (transicion.from === estado && transicion.symbol === simbolo) {
            siguientes.add(transicion.to);
          }
        });
      });

      actuales = siguientes;
      if (actuales.size === 0) break;
    }

    return [...actuales].some(estado => automata.finalStates.includes(estado));
  }

  /**
   * Determina si un AFD completo acepta una cadena.
   * La función admite AFD con transiciones faltantes: en ese caso,
   * la ejecución queda sin estado activo y la cadena se rechaza.
   * La validación de determinismo se realiza por separado.
   */
  function aceptaAFD(automata, entrada) {
    const errores = validarAutomata(automata);
    if (errores.length > 0) {
      throw new Error(`Autómata inválido: ${errores.join(" ")}`);
    }

    let estadoActual = automata.initialState;
    const simbolos = normalizarEntrada(automata, entrada);

    for (const simbolo of simbolos) {
      if (!automata.alphabet.includes(simbolo)) {
        throw new Error(`El símbolo "${simbolo}" no pertenece al alfabeto.`);
      }

      const destinos = automata.transitions
        .filter(t => t.from === estadoActual && t.symbol === simbolo)
        .map(t => t.to);

      if (destinos.length > 1) {
        throw new Error(`El autómata no es determinista: hay varios destinos desde "${estadoActual}" con "${simbolo}".`);
      }

      if (destinos.length === 0) return false;
      estadoActual = destinos[0];
    }

    return automata.finalStates.includes(estadoActual);
  }

  function normalizarEntrada(automata, entrada) {
    if (Array.isArray(entrada)) {
      if (!entrada.every(s => typeof s === "string")) {
        throw new Error("La entrada debe ser una lista de símbolos de texto.");
      }
      return entrada;
    }

    if (typeof entrada !== "string") {
      throw new Error("La entrada debe ser texto o una lista de símbolos.");
    }

    // Para alfabetos de símbolos de varios caracteres, se exige pasar un arreglo.
    const simbolosDeVariosCaracteres = automata.alphabet.some(s => [...s].length !== 1);
    if (simbolosDeVariosCaracteres && entrada !== "") {
      throw new Error("Este alfabeto contiene símbolos de varios caracteres; pasa la entrada como arreglo de símbolos.");
    }

    return [...entrada];
  }

  /**
   * Verifica que no haya más de un destino para cada par estado-símbolo.
   * Devuelve { esDeterminista, errores }.
   */
  function verificarDeterminismo(automata) {
    const errores = validarAutomata(automata);
    if (errores.length > 0) {
      return { esDeterminista: false, errores };
    }

    const vistos = new Map();

    automata.transitions.forEach(t => {
      const clave = JSON.stringify([t.from, t.symbol]);
      if (!vistos.has(clave)) vistos.set(clave, new Set());
      vistos.get(clave).add(t.to);
    });

    vistos.forEach((destinos, clave) => {
      if (destinos.size > 1) {
        const [estado, simbolo] = JSON.parse(clave);
        errores.push(`No es determinista: "${estado}" tiene varios destinos con "${simbolo}".`);
      }
    });

    return { esDeterminista: errores.length === 0, errores };
  }

  const API = {
    validarAutomata,
    obtenerDestinos,
    obtenerDestinosDeConjunto,
    aceptaAFND,
    aceptaAFD,
    verificarDeterminismo
  };

  // Compatible con el uso directo desde index.html y con pruebas.
  global.Automatas = API;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
