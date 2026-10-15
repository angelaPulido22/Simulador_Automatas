/**
 * Conversión de AFND a AFD mediante el método de subconjuntos.
 * No depende del DOM. Requiere js/automatas.js cargado antes.
 */
(function (global) {
  "use strict";

  function claveConjunto(estados) {
    // JSON evita ambigüedades con separadores presentes en nombres de estados.
    return JSON.stringify([...estados].sort());
  }

  function normalizarConjunto(estados) {
    return [...new Set(estados)].sort();
  }

  function contieneEstadoFinal(conjunto, estadosFinales) {
    return conjunto.some(estado => estadosFinales.includes(estado));
  }

  function convertirAFNDaAFD(afnd) {
    if (!global.Automatas) {
      throw new Error("Debe cargarse js/automatas.js antes de js/conversion.js.");
    }

    const errores = global.Automatas.validarAutomata(afnd);
    if (errores.length > 0) {
      throw new Error(`AFND inválido: ${errores.join(" ")}`);
    }

    const alfabeto = [...afnd.alphabet];
    const inicial = [afnd.initialState];
    const conjuntos = [inicial];
    const procesados = new Set();
    const cola = [inicial];
    const transiciones = [];
    const pasos = [];

    while (cola.length > 0) {
      const actual = cola.shift();
      const claveActual = claveConjunto(actual);

      if (procesados.has(claveActual)) continue;
      procesados.add(claveActual);

      for (const simbolo of alfabeto) {
        const destino = normalizarConjunto(
          global.Automatas.obtenerDestinosDeConjunto(afnd, actual, simbolo)
        );
        const claveDestino = claveConjunto(destino);
        const yaExiste = conjuntos.some(c => claveConjunto(c) === claveDestino);

        if (!yaExiste) {
          conjuntos.push(destino);
          cola.push(destino);
        }

        transiciones.push({
          from: actual,
          symbol: simbolo,
          to: destino
        });

        pasos.push({
          numero: pasos.length + 1,
          conjuntoProcesado: [...actual],
          simbolo,
          conjuntoDestino: [...destino],
          conjuntoDestinoNuevo: !yaExiste,
          descripcion: destino.length === 0
            ? `Desde ${formatearConjunto(actual)} con "${simbolo}" no se alcanza ningún estado; se utiliza el estado pozo ∅.`
            : `Desde ${formatearConjunto(actual)} con "${simbolo}" se alcanza ${formatearConjunto(destino)}.${yaExiste ? " El conjunto ya estaba registrado." : " Se añade un conjunto nuevo."}`
        });
      }
    }

    // El conjunto vacío se procesa igual que los demás y recibe bucles para cada símbolo.
    const finales = conjuntos
      .filter(conjunto => contieneEstadoFinal(conjunto, afnd.finalStates))
      .map(conjunto => [...conjunto]);

    const afd = {
      states: conjuntos.map(conjunto => [...conjunto]),
      alphabet: [...alfabeto],
      initialState: [...inicial],
      finalStates: finales,
      transitions: transiciones
    };

    const tabla = {
      headers: ["Estado del AFD", ...alfabeto],
      rows: conjuntos.map(conjunto => {
        const fila = {
          state: [...conjunto],
          label: formatearConjunto(conjunto),
          initial: claveConjunto(conjunto) === claveConjunto(inicial),
          final: contieneEstadoFinal(conjunto, afnd.finalStates),
          sink: conjunto.length === 0,
          transitions: {}
        };

        alfabeto.forEach(simbolo => {
          const transicion = transiciones.find(t =>
            claveConjunto(t.from) === claveConjunto(conjunto) &&
            t.symbol === simbolo
          );
          fila.transitions[simbolo] = transicion ? [...transicion.to] : [];
        });

        return fila;
      })
    };

    return { afd, tabla, pasos };
  }

  function formatearConjunto(estados) {
    if (!estados || estados.length === 0) return "∅";
    return `{${[...estados].sort().join(",")}}`;
  }

  const API = {
    convertirAFNDaAFD,
    claveConjunto,
    formatearConjunto
  };

  global.Conversion = API;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
