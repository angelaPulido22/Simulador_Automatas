/* Generación exhaustiva de cadenas y comparación de representaciones. */
(function (g) {
  "use strict";
  function generarCadenas(alphabet, maxLength, limit = 100000) {
    if (!Array.isArray(alphabet) || !alphabet.length)
      throw Error("El alfabeto debe contener símbolos.");
    if (!Number.isInteger(maxLength) || maxLength < 6)
      throw Error(
        "La longitud máxima debe ser un entero igual o superior a 6.",
      );
    let total = 0,
      p = 1;
    for (let i = 0; i <= maxLength; i++) {
      total += p;
      p *= alphabet.length;
      if (total > limit)
        throw Error(
          `El límite produciría más de ${limit.toLocaleString()} cadenas. Reduzca n o use un alfabeto menor.`,
        );
    }
    const result = [[]];
    let level = [[]];
    for (let n = 1; n <= maxLength; n++) {
      const next = [];
      for (const prefix of level)
        for (const sym of alphabet) next.push([...prefix, sym]);
      result.push(...next);
      level = next;
    }
    return result;
  }
  function verificar({ afnd, afd, regex, maxLength = 6, limit = 100000 }) {
    if (!g.Automatas || !g.Expresiones)
      throw Error("Deben cargarse automatas.js y expresiones.js.");
    const strings = generarCadenas(afnd.alphabet, maxLength, limit);
    const results = strings.map((symbols) => {
      const nfa = g.Automatas.aceptaAFND(afnd, symbols);
      const dfa = afd ? g.Automatas.aceptaAFD(afd, symbols) : null;
      const re =
        regex !== undefined && regex !== null && regex !== ""
          ? g.Expresiones.aceptaER(regex, symbols, afnd.alphabet)
          : null;
      return {
        symbols,
        text: symbols.length ? symbols.join("") : "ε",
        afnd: nfa,
        afd: dfa,
        er: re,
        discrepancia:
          (dfa !== null && nfa !== dfa) ||
          (re !== null && nfa !== re) ||
          (re !== null && dfa !== null && dfa !== re),
      };
    });
    return {
      maxLength,
      total: results.length,
      discrepancies: results.filter((r) => r.discrepancia),
      results,
      summary: {
        acceptedAFND: results.filter((r) => r.afnd).length,
        acceptedAFD: results.filter((r) => r.afd === true).length,
        acceptedER: results.filter((r) => r.er === true).length,
        discrepancies: results.filter((r) => r.discrepancia).length,
      },
      scope: `Equivalencia comprobada solo para cadenas de longitud 0 a ${maxLength}. No constituye por sí sola una demostración para cadenas ilimitadas.`,
    };
  }
  g.Verificador = { generarCadenas, verificar };
  if (typeof module !== "undefined" && module.exports)
    module.exports = g.Verificador;
})(typeof globalThis !== "undefined" ? globalThis : window);
