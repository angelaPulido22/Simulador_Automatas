(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let current = null,
    conversion = null,
    afdSimple = null,
    regexActual = "";
  function split(s) {
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  function parseForm() {
    const states = split($("states").value),
      alphabet = split($("alphabet").value),
      finalStates = split($("finals").value),
      initialState = $("initial").value.trim();
    const transitions = [...$("transitionRows").querySelectorAll("tr")]
      .map((tr) => ({
        from: tr.querySelector(".from").value.trim(),
        symbol: tr.querySelector(".symbol").value.trim(),
        to: tr.querySelector(".to").value.trim(),
      }))
      .filter((t) => t.from || t.symbol || t.to);
    return { states, alphabet, initialState, finalStates, transitions };
  }
  function addRow(t = { from: "", symbol: "", to: "" }) {
    const tr = document.createElement("tr");
    for (const [cls, val, ph] of [
      ["from", t.from, "Origen"],
      ["symbol", t.symbol, "Símbolo"],
      ["to", t.to, "Destino"],
    ]) {
      const td = document.createElement("td"),
        input = document.createElement("input");
      input.className = cls;
      input.value = val;
      input.placeholder = ph;
      td.appendChild(input);
      tr.appendChild(td);
    }
    const td = document.createElement("td"),
      b = document.createElement("button");
    b.type = "button";
    b.className = "secondary";
    b.textContent = "Quitar";
    b.addEventListener("click", () => tr.remove());
    td.appendChild(b);
    tr.appendChild(td);
    $("transitionRows").appendChild(tr);
  }
  function msg(text, type = "success") {
    $("message").textContent = text;
    $("message").className = "message " + type;
  }
  function labelSet(s) {
    return Conversion.formatearConjunto(s);
  }
  function normalizarAFD(afd) {
    const names = afd.states.map(labelSet),
      map = new Map(afd.states.map((s, i) => [JSON.stringify(s), names[i]]));
    return {
      states: names,
      alphabet: [...afd.alphabet],
      initialState: map.get(JSON.stringify(afd.initialState)),
      finalStates: afd.finalStates.map((s) => map.get(JSON.stringify(s))),
      transitions: afd.transitions.map((t) => ({
        from: map.get(JSON.stringify(t.from)),
        symbol: t.symbol,
        to: map.get(JSON.stringify(t.to)),
      })),
    };
  }
  function validateAndDraw() {
    current = parseForm();
    const errors = Automatas.validarAutomata(current);
    if (errors.length) {
      msg(errors.join(" "), "error");
      return false;
    }
    Diagramas.dibujar(current, $("afndDiagram"));
    msg("Autómata válido. Puedes convertirlo.", "success");
    return true;
  }
  function convert() {
    if (!validateAndDraw()) return;
    try {
      conversion = Conversion.convertirAFNDaAFD(current);
      afdSimple = normalizarAFD(conversion.afd);
      Diagramas.dibujar(conversion.afd, $("afdDiagram"), { conjuntos: true });
      renderTable();
      renderConversionSteps();
      $("regexSteps").innerHTML =
        "<li>El AFD está listo. Pulsa «Obtener expresión regular».</li>";
      $("regexOutput").textContent = "—";
      $("useRegex").disabled = true;
      regexActual = "";
      msg(
        `Conversión completada: ${conversion.afd.states.length} estados en el AFD y ${conversion.pasos.length} cálculos registrados.`,
      );
      $("verificationSummary").textContent =
        "La conversión cambió. Ejecuta de nuevo el verificador.";
      $("verificationSummary").className = "summary empty";
      $("discrepancies").innerHTML = "";
    } catch (e) {
      msg(e.message, "error");
    }
  }
  function renderTable() {
    const table = document.createElement("table"),
      thead = document.createElement("thead"),
      tr = document.createElement("tr");
    ["Estado", "Tipo", ...conversion.tabla.headers.slice(1)].forEach((x) => {
      const th = document.createElement("th");
      th.textContent = x;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    conversion.tabla.rows.forEach((row) => {
      const tr = document.createElement("tr"),
        td = document.createElement("td");
      td.textContent = (row.initial ? "→ " : "") + row.label;
      tr.appendChild(td);
      const type = document.createElement("td");
      type.textContent =
        [row.final ? "Final" : "", row.sink ? "Pozo" : ""]
          .filter(Boolean)
          .join(" · ") || "—";
      tr.appendChild(type);
      conversion.tabla.headers.slice(1).forEach((sym) => {
        const td = document.createElement("td");
        td.textContent = labelSet(row.transitions[sym]);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    $("conversionTable").innerHTML = "";
    $("conversionTable").appendChild(table);
  }
  function renderConversionSteps() {
    const ol = $("conversionSteps");
    ol.innerHTML = "";
    conversion.pasos.forEach((p) => {
      const li = document.createElement("li"),
        strong = document.createElement("strong");
      strong.textContent = `Paso ${p.numero}: ${labelSet(p.conjuntoProcesado)} con «${p.simbolo}»`;
      li.appendChild(strong);
      li.appendChild(document.createTextNode(p.descripcion));
      const dest = document.createElement("div");
      dest.className = "hint";
      dest.textContent = "Destino: " + labelSet(p.conjuntoDestino);
      li.appendChild(dest);
      ol.appendChild(li);
    });
  }
  function regex() {
    if (!current) {
      msg("Primero define y valida el autómata.", "error");
      return;
    }
    try {
      const result = Expresiones.convertirAFaER(afdSimple || current);
      regexActual = result.expression;
      $("regexOutput").textContent = regexActual;
      $("regexInput").value = regexActual;
      $("useRegex").disabled = false;
      const ol = $("regexSteps");
      ol.innerHTML = "";
      result.steps.forEach((p, i) => {
        const li = document.createElement("li"),
          strong = document.createElement("strong");
        strong.textContent = p.title;
        li.appendChild(strong);
        li.appendChild(document.createTextNode(p.detail));
        if (p.expression) {
          const code = document.createElement("div");
          code.className = "hint";
          code.textContent = "Expresión parcial: " + p.expression;
          li.appendChild(code);
        }
        ol.appendChild(li);
      });
      msg(
        "Expresión regular calculada por eliminación de estados. Comprueba su equivalencia con el verificador.",
      );
    } catch (e) {
      msg(e.message, "error");
    }
  }
  function verify() {
    if (!current) {
      msg("Primero define y valida el autómata.", "error");
      return;
    }
    const errors = Automatas.validarAutomata(current);
    if (errors.length) {
      msg(errors.join(" "), "error");
      return;
    }
    const n = Number($("maxLength").value);
    if (!Number.isInteger(n) || n < 6 || n > 12) {
      msg("La longitud máxima debe estar entre 6 y 12.", "error");
      return;
    }
    const re = $("regexInput").value.trim();
    try {
      const result = Verificador.verificar({
        afnd: current,
        afd: afdSimple,
        regex: re,
        maxLength: n,
      });
      const summary = $("verificationSummary");
      summary.className = "summary";
      summary.innerHTML = `<strong>${result.total.toLocaleString()} cadenas evaluadas</strong><p>AFND acepta: ${result.summary.acceptedAFND} · AFD acepta: ${result.summary.acceptedAFD === undefined ? "—" : result.summary.acceptedAFD} · ER acepta: ${re ? result.summary.acceptedER : "no evaluada"}</p><p><strong>Discrepancias: ${result.summary.discrepancies}</strong></p><p class="hint">${result.scope}</p>`;
      const table = document.createElement("table"),
        thead = document.createElement("thead"),
        hr = document.createElement("tr");
      ["Cadena", "AFND", "AFD", "ER", "Resultado"].forEach((x) => {
        const th = document.createElement("th");
        th.textContent = x;
        hr.appendChild(th);
      });
      thead.appendChild(hr);
      table.appendChild(thead);
      const body = document.createElement("tbody");
      const rows = result.discrepancies.length
        ? result.discrepancies
        : result.results.slice(0, Math.min(30, result.results.length));
      rows.forEach((r) => {
        const tr = document.createElement("tr");
        [
          r.text,
          r.afnd ? "Acepta" : "Rechaza",
          r.afd === null ? "—" : r.afd ? "Acepta" : "Rechaza",
          r.er === null ? "—" : r.er ? "Acepta" : "Rechaza",
          r.discrepancia ? "DISCREPANCIA" : "Coincide",
        ].forEach((v) => {
          const td = document.createElement("td");
          td.textContent = v;
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      table.appendChild(body);
      $("discrepancies").innerHTML = "";
      $("discrepancies").appendChild(table);
      if (!result.discrepancies.length)
        $("discrepancies").insertAdjacentHTML(
          "afterbegin",
          '<p class="hint">No se encontraron discrepancias en el rango probado. Se muestran las primeras cadenas evaluadas como referencia.</p>',
        );
      msg(
        result.discrepancies.length
          ? "Se encontraron discrepancias; revisa las filas de la tabla."
          : "Las representaciones disponibles coinciden en el rango probado.",
        "success",
      );
    } catch (e) {
      msg(e.message, "error");
    }
  }
  function manual() {
    if (!current) {
      msg("Primero define y valida el autómata.", "error");
      return;
    }
    try {
      const raw = $("manualString").value.trim();
      const input = current.alphabet.every((s) => s.length === 1)
        ? raw
        : raw === ""
          ? []
          : raw.split(",").map((x) => x.trim());
      const n = Automatas.aceptaAFND(current, input),
        d = afdSimple ? Automatas.aceptaAFD(afdSimple, input) : null,
        r = $("regexInput").value.trim()
          ? Expresiones.aceptaER(
              $("regexInput").value.trim(),
              input,
              current.alphabet,
            )
          : null;
      $("manualResult").className = "summary";
      $("manualResult").textContent =
        `Cadena: ${raw || "ε"} · AFND: ${n ? "acepta" : "rechaza"} · AFD: ${d === null ? "no calculado" : d ? "acepta" : "rechaza"} · ER: ${r === null ? "no evaluada" : r ? "acepta" : "rechaza"}`;
    } catch (e) {
      $("manualResult").textContent = e.message;
      $("manualResult").className = "summary";
    }
  }
  function loadCase(which) {
    $("transitionRows").innerHTML = "";
    if (which === 1) {
      $("states").value = "q0, q1, q2";
      $("alphabet").value = "a, b";
      $("initial").value = "q0";
      $("finals").value = "q2";
      [
        { from: "q0", symbol: "a", to: "q0" },
        { from: "q0", symbol: "a", to: "q1" },
        { from: "q1", symbol: "b", to: "q2" },
      ].forEach(addRow);
    } else {
      $("states").value = "q0, q1, q2";
      $("alphabet").value = "x, y";
      $("initial").value = "q0";
      $("finals").value = "q1";
      [
        { from: "q0", symbol: "x", to: "q1" },
        { from: "q1", symbol: "x", to: "q2" },
        { from: "q2", symbol: "y", to: "q2" },
        { from: "q2", symbol: "y", to: "q1" },
      ].forEach(addRow);
    }
    $("regexInput").value = "";
    current = null;
    conversion = null;
    afdSimple = null;
    regexActual = "";
    $("afndDiagram").innerHTML = "";
    $("afdDiagram").innerHTML = "";
    $("conversionTable").textContent =
      "Ejecuta la conversión para ver la tabla.";
    $("conversionSteps").innerHTML = "";
    $("regexSteps").innerHTML = "";
    $("regexOutput").textContent = "—";
    $("useRegex").disabled = true;
    msg(`Caso ${which} cargado. Valida y convierte para continuar.`);
  }
  $("addTransition").addEventListener("click", () => addRow());
  $("clearTransitions").addEventListener(
    "click",
    () => ($("transitionRows").innerHTML = ""),
  );
  $("runConversion").addEventListener("click", convert);
  $("runRegex").addEventListener("click", regex);
  $("runVerifier").addEventListener("click", verify);
  $("runManual").addEventListener("click", manual);
  $("case1").addEventListener("click", () => loadCase(1));
  $("case2").addEventListener("click", () => loadCase(2));
  $("useRegex").addEventListener("click", () => {
    $("regexInput").value = regexActual;
    msg("La expresión generada se copió al verificador.");
  });
  loadCase(1);
})();
