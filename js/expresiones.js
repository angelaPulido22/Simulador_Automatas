/* Conversión de autómata a expresión regular por eliminación de estados (GNFA). */
(function (g) {
  "use strict";
  const EPS = "ε",
    EMPTY = "∅";
  function union(a, b) {
    if (!a || a === EMPTY) return b || EMPTY;
    if (!b || b === EMPTY) return a;
    if (a === b) return a;
    return [a, b].sort().join(" + ");
  }
  function concat(a, b) {
    if (!a || !b || a === EMPTY || b === EMPTY) return EMPTY;
    if (a === EPS) return b;
    if (b === EPS) return a;
    const wrap = (x) => (/[+]/.test(x) ? `(${x})` : x);
    return `${wrap(a)}${wrap(b)}`;
  }
  function star(a) {
    if (!a || a === EMPTY || a === EPS) return EPS;
    if (a.endsWith("*")) return a;
    return `(${a})*`;
  }
  function convertirAFaER(aut) {
    if (!g.Automatas) throw Error("Debe cargarse automatas.js primero.");
    const errs = g.Automatas.validarAutomata(aut);
    if (errs.length) throw Error("Autómata inválido: " + errs.join(" "));
    const names = aut.states.map((s, i) => ({ id: `S${i}`, label: s }));
    let start = "__START__",
      end = "__END__";
    const nodes = [start, ...aut.states, end];
    const R = new Map(),
      key = (i, j) => i + "→" + j;
    const get = (i, j) => R.get(key(i, j)) || EMPTY;
    const put = (i, j, v) => R.set(key(i, j), v);
    for (const t of aut.transitions)
      put(t.from, t.to, union(get(t.from, t.to), t.symbol));
    put(start, aut.initialState, EPS);
    for (const f of aut.finalStates) put(f, end, union(get(f, end), EPS));
    const steps = [
      {
        title: "Construcción del GNFA",
        detail:
          "Se agrega un estado inicial nuevo con transición ε al inicial original y un estado final nuevo. Las transiciones paralelas se agrupan con unión (+).",
        expression: null,
      },
    ];
    let active = [...aut.states];
    for (const q of [...active]) {
      const incoming = nodes.filter((i) => i !== q && get(i, q) !== EMPTY);
      const outgoing = nodes.filter((j) => j !== q && get(q, j) !== EMPTY);
      const loop = star(get(q, q));
      for (const i of incoming) {
        for (const j of outgoing) {
          const before = get(i, j),
            route = concat(concat(get(i, q), loop), get(q, j));
          put(i, j, union(before, route));
        }
      }
      for (const n of nodes) {
        R.delete(key(n, q));
        R.delete(key(q, n));
      }
      active = active.filter((x) => x !== q);
      steps.push({
        title: `Eliminar estado ${q}`,
        detail: `Para cada camino que pasa por ${q}, se aplica Rᵢⱼ ← Rᵢⱼ + Rᵢq(Rqq)*Rqⱼ. Bucle simplificado: ${loop}.`,
        expression: get(start, end),
      });
    }
    let expression = get(start, end);
    if (expression === EMPTY) expression = "∅";
    steps.push({
      title: "Expresión regular final",
      detail:
        "La etiqueta entre el nuevo estado inicial y el nuevo estado final representa el lenguaje aceptado.",
      expression,
    });
    return {
      expression,
      steps,
      method: "Eliminación de estados (GNFA)",
      notes: [
        "+ representa unión; la concatenación se escribe yuxtaponiendo; * representa estrella de Kleene; ε es la cadena vacía; ∅ es el lenguaje vacío.",
        "La expresión puede ser equivalente a otras expresiones sintácticamente distintas.",
      ],
    };
  }
  // Compila ER con símbolos de alfabeto explícito: + unión, concatenación implícita, * estrella, paréntesis, ε/λ y ∅.
  function aceptaER(regex, entrada, alphabet) {
    const tokens = tokenizar(regex, alphabet);
    const withConcat = [];
    const endAtom = (t) =>
      ["SYM", "EPS", "EMPTY", "RP", "STAR"].includes(t.type);
    const startAtom = (t) => ["SYM", "EPS", "EMPTY", "LP"].includes(t.type);
    for (let i = 0; i < tokens.length; i++) {
      if (i > 0 && endAtom(tokens[i - 1]) && startAtom(tokens[i]))
        withConcat.push({ type: "CONCAT" });
      withConcat.push(tokens[i]);
    }
    let pos = 0;
    function parseUnion() {
      let n = parseConcat();
      while (withConcat[pos]?.type === "UNION") {
        pos++;
        n = { type: "union", a: n, b: parseConcat() };
      }
      return n;
    }
    function parseConcat() {
      let n = parseRepeat();
      while (withConcat[pos]?.type === "CONCAT") {
        pos++;
        n = { type: "concat", a: n, b: parseRepeat() };
      }
      return n;
    }
    function parseRepeat() {
      let n = parseAtom();
      while (withConcat[pos]?.type === "STAR") {
        pos++;
        n = { type: "star", a: n };
      }
      return n;
    }
    function parseAtom() {
      const t = withConcat[pos++];
      if (!t) throw Error("Expresión regular incompleta.");
      if (t.type === "SYM") return { type: "sym", v: t.v };
      if (t.type === "EPS") return { type: "eps" };
      if (t.type === "EMPTY") return { type: "empty" };
      if (t.type === "LP") {
        const n = parseUnion();
        if (withConcat[pos++]?.type !== "RP")
          throw Error("Falta cerrar un paréntesis.");
        return n;
      }
      throw Error("Símbolo inesperado en la expresión regular.");
    }
    if (!withConcat.length) throw Error("Escriba una expresión regular.");
    const ast = parseUnion();
    if (pos !== withConcat.length)
      throw Error("La expresión regular contiene elementos no reconocidos.");
    let next = 0;
    const epsEdges = new Map(),
      symEdges = new Map();
    function node() {
      return next++;
    }
    function add(map, a, s, b) {
      if (!map.has(a)) map.set(a, []);
      map.get(a).push({ symbol: s, to: b });
    }
    function build(x) {
      const s = node(),
        e = node();
      if (x.type === "sym") add(symEdges, s, x.v, e);
      else if (x.type === "eps") add(epsEdges, s, "ε", e);
      else if (x.type === "empty") {
      } else if (x.type === "concat") {
        const A = build(x.a),
          B = build(x.b);
        add(epsEdges, s, "ε", A.s);
        add(epsEdges, A.e, "ε", B.s);
        add(epsEdges, B.e, "ε", e);
      } else if (x.type === "union") {
        const A = build(x.a),
          B = build(x.b);
        add(epsEdges, s, "ε", A.s);
        add(epsEdges, s, "ε", B.s);
        add(epsEdges, A.e, "ε", e);
        add(epsEdges, B.e, "ε", e);
      } else if (x.type === "star") {
        const A = build(x.a);
        add(epsEdges, s, "ε", e);
        add(epsEdges, s, "ε", A.s);
        add(epsEdges, A.e, "ε", A.s);
        add(epsEdges, A.e, "ε", e);
      }
      return { s, e };
    }
    const nfa = build(ast);
    function closure(set) {
      const out = new Set(set),
        stack = [...set];
      while (stack.length) {
        const q = stack.pop();
        for (const t of epsEdges.get(q) || [])
          if (!out.has(t.to)) {
            out.add(t.to);
            stack.push(t.to);
          }
      }
      return out;
    }
    let current = closure([nfa.s]);
    const syms = Array.isArray(entrada)
      ? entrada
      : alphabet.every((s) => s.length === 1)
        ? [...entrada]
        : (() => {
            throw Error(
              "Para símbolos de varios caracteres, entregue la cadena como arreglo de símbolos.",
            );
          })();
    for (const sym of syms) {
      if (!alphabet.includes(sym))
        throw Error(`El símbolo "${sym}" no pertenece al alfabeto.`);
      const nxt = new Set();
      for (const q of current)
        for (const t of symEdges.get(q) || [])
          if (t.symbol === sym) nxt.add(t.to);
      current = closure(nxt);
    }
    return current.has(nfa.e);
  }
  function tokenizar(regex, alphabet) {
    let s = regex.replace(/λ/g, "ε").replace(/\s+/g, "");
    const out = [];
    for (let i = 0; i < s.length; ) {
      if (s.startsWith("∅", i)) {
        out.push({ type: "EMPTY" });
        i++;
        continue;
      }
      if (s.startsWith("ε", i)) {
        out.push({ type: "EPS" });
        i++;
        continue;
      }
      if (s[i] === "+") {
        out.push({ type: "UNION" });
        i++;
        continue;
      }
      if (s[i] === "*") {
        out.push({ type: "STAR" });
        i++;
        continue;
      }
      if (s[i] === "(") {
        out.push({ type: "LP" });
        i++;
        continue;
      }
      if (s[i] === ")") {
        out.push({ type: "RP" });
        i++;
        continue;
      }
      const sym = alphabet
        .filter((a) => s.startsWith(a, i))
        .sort((a, b) => b.length - a.length)[0];
      if (!sym)
        throw Error(`Símbolo no reconocido en la ER cerca de "${s.slice(i)}".`);
      out.push({ type: "SYM", v: sym });
      i += sym.length;
    }
    return out;
  }
  g.Expresiones = { convertirAFaER, aceptaER };
  if (typeof module !== "undefined" && module.exports)
    module.exports = g.Expresiones;
})(typeof globalThis !== "undefined" ? globalThis : window);
