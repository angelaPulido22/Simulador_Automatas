/* Renderizador SVG sin dependencias externas. */
(function (g) {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs = {}) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }
  function dibujar(automata, contenedor, { conjuntos = false } = {}) {
    contenedor.innerHTML = "";
    const svg = el("svg", {
      viewBox: "0 0 760 300",
      role: "img",
      "aria-label": "Diagrama del autómata",
    });
    const states = automata.states;
    const n = states.length;
    const positions = new Map();
    const cx = 380,
      cy = 150,
      rx = Math.min(290, 100 + n * 24),
      ry = 88;
    states.forEach((s, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      positions.set(key(s), {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
      });
    });
    const defs = el("defs");
    const marker = el("marker", {
      id: "arrow-" + Math.random().toString(36).slice(2),
      markerWidth: 8,
      markerHeight: 8,
      refX: 7,
      refY: 3,
      orient: "auto",
      markerUnits: "strokeWidth",
    });
    marker.appendChild(el("path", { d: "M0,0 L0,6 L7,3 z", fill: "#252525" }));
    defs.appendChild(marker);
    const markerId = marker.getAttribute("id");
    svg.appendChild(defs);
    const groups = new Map();
    (automata.transitions || []).forEach((t) => {
      const k = key(t.from) + "|" + key(t.to);
      if (!groups.has(k)) groups.set(k, { from: t.from, to: t.to, labels: [] });
      groups.get(k).labels.push(t.symbol);
    });
    for (const tr of groups.values()) {
      const a = positions.get(key(tr.from)),
        b = positions.get(key(tr.to));
      if (!a || !b) continue;
      let path, labelX, labelY;
      if (tr.from === tr.to) {
        path = el("path", {
          d: `M ${a.x - 17} ${a.y - 17} C ${a.x - 55} ${a.y - 70}, ${a.x + 55} ${a.y - 70}, ${a.x + 17} ${a.y - 17}`,
          fill: "none",
          stroke: "#252525",
          "stroke-width": 1.7,
          "marker-end": `url(#${markerId})`,
        });
        labelX = a.x;
        labelY = a.y - 62;
      } else {
        const dx = b.x - a.x,
          dy = b.y - a.y,
          len = Math.hypot(dx, dy) || 1,
          ux = dx / len,
          uy = dy / len,
          sx = a.x + ux * 29,
          sy = a.y + uy * 29,
          ex = b.x - ux * 32,
          ey = b.y - uy * 32;
        let curve = 0;
        if (Math.abs(dx) < 80) {
          curve = (tr.from < tr.to ? 1 : -1) * 18;
        }
        const mx = (sx + ex) / 2 - uy * curve,
          my = (sy + ey) / 2 + ux * curve;
        path = el("path", {
          d: curve
            ? `M${sx},${sy} Q${mx},${my} ${ex},${ey}`
            : `M${sx},${sy} L${ex},${ey}`,
          fill: "none",
          stroke: "#252525",
          "stroke-width": 1.7,
          "marker-end": `url(#${markerId})`,
        });
        labelX = mx;
        labelY = my - 7;
      }
      svg.appendChild(path);
      const text = el("text", {
        x: labelX,
        y: labelY,
        "text-anchor": "middle",
        "font-size": 13,
        fill: "#111",
      });
      text.textContent = tr.labels.join(", ");
      svg.appendChild(text);
    }
    states.forEach((s) => {
      const p = positions.get(key(s)),
        label = conjuntos ? formatSet(s) : String(s);
      if (
        s === automata.initialState ||
        (Array.isArray(automata.initialState) &&
          key(s) === key(automata.initialState))
      )
        svg.appendChild(
          el("path", {
            d: `M${p.x - 68},${p.y} L${p.x - 33},${p.y}`,
            stroke: "#252525",
            "stroke-width": 1.8,
            "marker-end": `url(#${markerId})`,
          }),
        );
      svg.appendChild(
        el("ellipse", {
          cx: p.x,
          cy: p.y,
          rx: 30,
          ry: 23,
          fill: "#fff",
          stroke: "#252525",
          "stroke-width": 1.8,
        }),
      );
      if ((automata.finalStates || []).some((f) => key(f) === key(s)))
        svg.appendChild(
          el("ellipse", {
            cx: p.x,
            cy: p.y,
            rx: 25,
            ry: 18,
            fill: "none",
            stroke: "#252525",
            "stroke-width": 1.5,
          }),
        );
      const t = el("text", {
        x: p.x,
        y: p.y + 4,
        "text-anchor": "middle",
        "font-size": 12,
        fill: "#111",
      });
      t.textContent = label;
      svg.appendChild(t);
    });
    contenedor.appendChild(svg);
  }
  function key(x) {
    return JSON.stringify(x);
  }
  function formatSet(x) {
    return Array.isArray(x)
      ? x.length
        ? "{" + x.join(",") + "}"
        : "∅"
      : String(x);
  }
  g.Diagramas = { dibujar };
})(window);
