#!/usr/bin/env node
// Spring CLI, generated from github.com/somesh-ks/portfolio@2031126 (src/lib/spring).
// Don't edit: rebuild with `bun scripts/build-spring-cli.ts`. No dependencies; reads files only.
// src/lib/spring/cli.ts
import { lstatSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve as resolvePath, dirname, basename } from "node:path";
import { deflateRawSync } from "node:zlib";
// public/spring/schema.json
var schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://someshks.com/spring/schema.json",
  title: "spring.json",
  description: "Spring's input: the few choices a whole design system is built from. Open it at https://someshks.com/spring (Import), or build it offline with the spring CLI. Out-of-range values are clamped and reported, unknown fields ignored.",
  type: "object",
  properties: {
    $schema: { type: "string" },
    v: { const: 1 },
    name: { type: "string", maxLength: 60, default: "Untitled" },
    primary: {
      description: `The brand color: any CSS color string ("#e11d48", "oklch(0.6 0.2 20)"), or the engine's own shape.`,
      oneOf: [
        { type: "string" },
        {
          type: "object",
          properties: {
            hue: { type: "number", minimum: 0, maximum: 360 },
            chroma: { type: "number", minimum: 0, maximum: 0.4 },
            solidL: { type: "number", minimum: 0.2, maximum: 0.95, description: "OKLCH lightness of the brand fill." },
            label: { enum: ["auto", "white", "ink"], description: "Text color on the brand fill." }
          }
        }
      ]
    },
    neutralTint: { type: "number", minimum: 0, maximum: 1, default: 0.3, description: "0 pure gray, 1 clearly tinted." },
    neutralHue: { type: "number", minimum: 0, maximum: 360, description: "Hue the grays lean to. Defaults to the primary's." },
    curve: {
      type: "object",
      description: "Lightness curve of every 12-step scale.",
      properties: {
        bezier: { type: "array", items: { type: "number" }, minItems: 4, maxItems: 4, default: [0.42, 0, 1, 1] },
        hueShift: { type: "number", minimum: -60, maximum: 60, default: 0 },
        darkChroma: { type: "number", minimum: 0.4, maximum: 1.2, default: 1 }
      },
      required: ["bezier", "hueShift"]
    },
    status: {
      type: "object",
      description: "Status color overrides as #rrggbb.",
      properties: {
        danger: { $ref: "#/$defs/hex" },
        warning: { $ref: "#/$defs/hex" },
        success: { $ref: "#/$defs/hex" },
        info: { $ref: "#/$defs/hex" }
      },
      additionalProperties: false
    },
    colors: { type: "array", maxItems: 6, items: { $ref: "#/$defs/strip" }, description: "Extra color scales." },
    contrast: { enum: ["aa", "aaa", "apca"], default: "aa" },
    data: { type: "array", maxItems: 10, items: { $ref: "#/$defs/strip" }, description: "Chart colors in order. Absent: suggested from the primary." },
    ramps: {
      type: "object",
      properties: {
        seq: { type: "integer", minimum: 0, description: "Index into data for the sequential ramp." },
        div: { type: "array", items: { type: "integer", minimum: 0 }, minItems: 2, maxItems: 2 }
      }
    },
    type: {
      type: "object",
      properties: {
        body: { type: "string", description: "Any Google Fonts family.", default: "Inter" },
        heading: { type: "string", default: "Inter" },
        mono: { type: "string", default: "JetBrains Mono" },
        base: { type: "number", minimum: 12, maximum: 22, default: 16, description: "Body size, px." },
        ratio: { type: "number", minimum: 1.05, maximum: 1.7, default: 1.25 },
        headingWeight: { type: "number", minimum: 100, maximum: 900, default: 600 },
        fluid: { type: "boolean", default: true }
      }
    },
    density: { type: "number", minimum: 0, maximum: 1, default: 0.5, description: "0 compact, 1 comfortable." },
    roundness: { type: "number", minimum: 0, maximum: 1, default: 0.5, description: "0 square, 1 very round." },
    motion: { type: "number", minimum: 0, maximum: 1, default: 0.4, description: "0 calm, 1 lively." },
    stack: {
      type: "object",
      properties: {
        building: { enum: ["site", "app", "dashboard"], default: "app" },
        ownership: { enum: ["own", "package"], default: "own" },
        styling: { enum: ["tailwind", "css"], default: "tailwind" }
      }
    }
  },
  $defs: {
    hex: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
    strip: {
      type: "object",
      properties: { name: { type: "string", maxLength: 24 }, hex: { $ref: "#/$defs/hex" } },
      required: ["name", "hex"]
    }
  }
};
// public/spring/view.schema.json
var view_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://someshks.com/spring/view.schema.json",
  title: "Spring View v1",
  description: "A project's existing design system as a flat token map, for https://someshks.com/spring/view (drop the file, or pass it as #d=<base64url(deflate-raw(json))>). Values are raw CSS; var() references resolve per mode, falling back to the first mode.",
  type: "object",
  required: ["v", "tokens"],
  properties: {
    $schema: { type: "string" },
    v: { const: 1 },
    name: { type: "string", maxLength: 80 },
    modes: {
      type: "array",
      items: { type: "string", pattern: "^[\\w-]{1,32}$" },
      maxItems: 8,
      description: 'Theme names; the first is the default. Usually ["light", "dark"].'
    },
    tokens: {
      type: "object",
      description: "Token name without the leading -- → a value for every mode, or a mode → value map.",
      propertyNames: { pattern: "^[\\w-]{1,120}$" },
      additionalProperties: {
        oneOf: [
          { type: "string", maxLength: 500 },
          { type: "object", additionalProperties: { type: "string", maxLength: 500 } }
        ]
      },
      maxProperties: 3000
    },
    scoped: {
      type: "array",
      items: { type: "object", properties: { selector: { type: "string" }, count: { type: "integer" } } }
    },
    sources: { type: "array", items: { type: "string" } },
    usage: {
      type: "object",
      description: "How the code uses the tokens (the CLI fills this).",
      properties: {
        files: { type: "integer" },
        refs: { type: "object", additionalProperties: { type: "integer" } },
        raw: { type: "array", items: { $ref: "#/$defs/hit" } },
        rawCount: { type: "integer" },
        offSystem: { type: "array", items: { $ref: "#/$defs/hit" } },
        offSystemCount: { type: "integer" }
      }
    },
    notes: { type: "array", items: { type: "string" } }
  },
  $defs: {
    hit: {
      type: "object",
      properties: { value: { type: "string" }, at: { type: "string", description: "path:line" } },
      required: ["value", "at"]
    }
  }
};

// src/lib/spring/yaml.ts
function scalar(raw) {
  const s = raw.trim();
  if (s === "" || s === "~" || s === "null")
    return null;
  if (s === "true")
    return true;
  if (s === "false")
    return false;
  if (/^"(.*)"$/.test(s)) {
    try {
      return JSON.parse(s);
    } catch {
      return s.slice(1, -1);
    }
  }
  if (/^'(.*)'$/.test(s))
    return s.slice(1, -1).replace(/''/g, "'");
  if (/^-?\d+(\.\d+)?$/.test(s))
    return Number(s);
  if (/^\[.*\]$/.test(s))
    return s.slice(1, -1).split(",").map((x) => x.trim()).filter(Boolean).map(scalar);
  return s;
}
function uncomment(line) {
  let q = null;
  for (let i = 0;i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === q)
        q = null;
    } else if (ch === '"' || ch === "'")
      q = ch;
    else if (ch === "#" && (i === 0 || /\s/.test(line[i - 1])))
      return line.slice(0, i);
  }
  return line;
}
var indentOf = (l) => l.length - l.trimStart().length;
function parseYaml(text) {
  const lines = text.split(/\r?\n/).map((l) => uncomment(l).replace(/\s+$/, "")).filter((l) => l.trim() !== "");
  let i = 0;
  function block(indent) {
    const first = lines[i];
    if (first && indentOf(first) >= indent && first.trimStart().startsWith("- ")) {
      const list = [];
      while (i < lines.length && indentOf(lines[i]) === indent && lines[i].trimStart().startsWith("- ")) {
        list.push(scalar(lines[i].trimStart().slice(2)));
        i++;
      }
      return list;
    }
    const map = {};
    while (i < lines.length) {
      const line = lines[i];
      const ind = indentOf(line);
      if (ind < indent)
        break;
      const m = line.trim().match(/^("[^"]*"|'[^']*'|[^:]+?):(?:\s+(.*))?$/);
      i++;
      if (!m)
        continue;
      const key = String(scalar(m[1]));
      if (m[2] !== undefined && m[2] !== "")
        map[key] = scalar(m[2]);
      else {
        const next = lines[i];
        map[key] = next && indentOf(next) > ind ? block(indentOf(next)) : null;
      }
    }
    return map;
  }
  return block(0);
}
var PLAIN = /^-?[A-Za-z0-9_][\w .,;()/%+-]*$/;
function str(v) {
  if (typeof v === "number" || typeof v === "boolean")
    return String(v);
  if (v === null || v === undefined)
    return "null";
  const s = String(v);
  const looksLikeOther = /^(true|false|null|~|-?\d+(\.\d+)?)$/.test(s);
  return PLAIN.test(s) && !looksLikeOther && !s.endsWith(" ") ? s : JSON.stringify(s);
}
function stringifyYaml(value, _opts, indent = "") {
  let out = "";
  for (const [k, v] of Object.entries(value)) {
    if (v === undefined)
      continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out += `${indent}${k}:
${stringifyYaml(v, undefined, `${indent}  `)}`;
    } else if (Array.isArray(v)) {
      out += `${indent}${k}:
${v.map((x) => `${indent}  - ${str(x)}
`).join("")}`;
    } else
      out += `${indent}${k}: ${str(v)}
`;
  }
  return out;
}

// src/lib/spring/colormath.ts
var toLinear = (v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
var toGamma = (v) => v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
function oklchToLinear({ l, c, h }) {
  const r = h * Math.PI / 180;
  const a = c * Math.cos(r);
  const b = c * Math.sin(r);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_
  ];
}
function linearToOklch([r, g, b]) {
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.hypot(A, B);
  const h = c < 0.0001 ? 0 : (Math.atan2(B, A) * 180 / Math.PI + 360) % 360;
  return { l: L, c, h };
}
var EPS = 0.0001;
var inGamut = (c) => oklchToLinear(c).every((v) => v >= -EPS && v <= 1 + EPS);
function clampChroma(color) {
  if (inGamut(color))
    return color;
  let lo = 0;
  let hi = color.c;
  for (let i = 0;i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut({ ...color, c: mid }))
      lo = mid;
    else
      hi = mid;
  }
  return { ...color, c: lo };
}
var byte = (v) => Math.round(Math.min(1, Math.max(0, toGamma(v))) * 255).toString(16).padStart(2, "0");
function oklchToHex(c) {
  const [r, g, b] = oklchToLinear(c);
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}
function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3 || h.length === 4)
    h = h.slice(0, 3).split("").map((x) => x + x).join("");
  if (h.length === 8)
    h = h.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(h))
    return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}
var NAMED = {
  white: "#ffffff",
  black: "#000000",
  transparent: "#ffffff"
};
var num = (s, scale = 1) => s.endsWith("%") ? parseFloat(s) / 100 * scale : parseFloat(s);
function parseCss(input) {
  const s = input.trim().toLowerCase();
  if (NAMED[s])
    return parseCss(NAMED[s]);
  if (s.startsWith("#")) {
    const rgb = hexToRgb(s);
    return rgb ? linearToOklch(rgb.map(toLinear)) : null;
  }
  const m = s.match(/^(rgba?|hsla?|oklch)\(([^)]+)\)$/);
  if (!m)
    return null;
  const parts = m[2].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3)
    return null;
  if (m[1] === "oklch") {
    const l = num(parts[0], 1);
    return { l, c: num(parts[1], 0.4), h: parseFloat(parts[2]) || 0 };
  }
  if (m[1].startsWith("rgb")) {
    const rgb = parts.slice(0, 3).map((p) => p.endsWith("%") ? parseFloat(p) / 100 : parseFloat(p) / 255);
    return linearToOklch(rgb.map(toLinear));
  }
  const h = parseFloat(parts[0]) / 360;
  const sat = parseFloat(parts[1]) / 100;
  const lig = parseFloat(parts[2]) / 100;
  const f = (n) => {
    const k = (n + h * 12) % 12;
    return lig - sat * Math.min(lig, 1 - lig) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return linearToOklch([f(0), f(8), f(4)].map(toLinear));
}
function luminance(color) {
  const rgb = color.trim().startsWith("#") ? hexToRgb(color.trim()) : null;
  const c = rgb ? null : parseCss(color);
  if (!rgb && !c)
    return 0;
  const [r, g, b] = rgb ? rgb.map(toLinear) : oklchToLinear(c);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function wcagContrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
var APCA_BLACK_CLAMP = 1414 / 1000;
function apcaY(color) {
  const rgb = hexToRgb(color);
  if (!rgb)
    return 0;
  const v = 0.2126729 * rgb[0] ** 2.4 + 0.7151522 * rgb[1] ** 2.4 + 0.072175 * rgb[2] ** 2.4;
  return v < 0.022 ? v + (0.022 - v) ** APCA_BLACK_CLAMP : v;
}
function apcaContrast(fg, bg) {
  const t = apcaY(fg);
  const b = apcaY(bg);
  if (Math.abs(b - t) < 0.0005)
    return 0;
  const sapc = b > t ? (b ** 0.56 - t ** 0.57) * 1.14 : (b ** 0.65 - t ** 0.62) * 1.14;
  if (Math.abs(sapc) < 0.1)
    return 0;
  return Math.abs((sapc > 0 ? sapc - 0.027 : sapc + 0.027) * 100);
}
function alphaOf(input) {
  const s = input.trim().toLowerCase();
  if (s === "transparent")
    return 0;
  const hex = s.match(/^#([0-9a-f]{4}|[0-9a-f]{8})$/);
  if (hex) {
    const a = hex[1].length === 4 ? hex[1].slice(3).repeat(2) : hex[1].slice(6);
    return parseInt(a, 16) / 255;
  }
  const fn = s.match(/^(?:rgba?|hsla?|oklch)\(([^)]+)\)$/);
  if (!fn)
    return 1;
  const slash = fn[1].split("/")[1];
  const commas = fn[1].split(",");
  const a = slash ?? (commas.length === 4 ? commas[3] : undefined);
  if (a === undefined)
    return 1;
  const n = num(a.trim(), 1);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
}
var gamma = (c) => oklchToLinear(c).map((v) => toGamma(Math.min(1, Math.max(0, v))));
function over(fg, bg) {
  const a = alphaOf(fg);
  const f = parseCss(fg);
  const b = parseCss(bg);
  if (a >= 1 || !f || !b)
    return fg;
  const [fr, fgr, fb] = gamma(f);
  const [br, bgr, bb] = gamma(b);
  const mix = (x, y) => ((x * a + y * (1 - a)) * 255).toFixed(3);
  return `rgb(${mix(fr, br)} ${mix(fgr, bgr)} ${mix(fb, bb)})`;
}
var RGB_CH = ["red", "green", "blue"].map((label) => ({
  label,
  min: 0,
  max: 255,
  step: 1,
  unit: ""
}));

// src/lib/spring/color.ts
var STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var STEP_JOBS = {
  1: "App background",
  2: "Subtle background",
  3: "Component background",
  4: "Hovered component",
  5: "Pressed or selected component",
  6: "Subtle border, separators",
  7: "Component border",
  8: "Strong border, focus ring",
  9: "Solid fill (the brand color)",
  10: "Hovered solid fill",
  11: "Low-contrast text",
  12: "High-contrast text"
};
var DEFAULT_CURVE = { bezier: [0.42, 0, 1, 1], hueShift: 0 };
var ENDS = { light: [0.993, 0.24], dark: [0.165, 0.95] };
var cubic = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
function bezierAt([x1, y1, x2, y2], x) {
  let lo = 0;
  let hi = 1;
  for (let i = 0;i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (cubic(x1, x2, mid) < x)
      lo = mid;
    else
      hi = mid;
  }
  return cubic(y1, y2, (lo + hi) / 2);
}
var round = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;
function fit(color) {
  const c = clampChroma(color).c;
  return { oklch: { l: color.l, c, h: color.h }, clipped: c < color.c - 0.002 };
}
function swatch(step, color) {
  const { oklch, clipped } = fit(color);
  const hex = oklchToHex(oklch);
  return {
    step,
    oklch,
    hex,
    css: `oklch(${round(oklch.l * 100, 1)}% ${round(oklch.c, 3)} ${round(oklch.h, 1)})`,
    clipped
  };
}
function parseColor(input) {
  return parseCss(input);
}
function defaultSolidL(hue) {
  const h = (hue % 360 + 360) % 360;
  return h > 80 && h < 130 ? 0.86 : 0.55;
}
var ANCHORS = [3, 4, 5, 6, 7, 8, 9, 10];
function buildScale({ hue, chroma, solidL, curve = DEFAULT_CURVE }) {
  const target = solidL ?? defaultSolidL(hue);
  const e = STEPS.map((_, i) => bezierAt(curve.bezier, i / 11));
  const out = { anchor: {}, seed: { hue, chroma, l: target } };
  for (const mode of ["light", "dark"]) {
    const [from, to] = ENDS[mode];
    const raw = e.map((y) => from + (to - from) * y);
    const k = ANCHORS.reduce((best, s) => Math.abs(raw[s - 1] - target) < Math.abs(raw[best - 1] - target) ? s : best);
    const ek = e[k - 1];
    const lb = Math.min(Math.max(target, Math.min(from, to) + 0.02), Math.max(from, to) - 0.02);
    const l = e.map((y, i) => i < k - 1 ? from + (lb - from) * (ek ? y / ek : 0) : lb + (to - lb) * (ek < 1 ? (y - ek) / (1 - ek) : 0));
    const tk = (k - 1) / 11;
    out.anchor[mode] = k;
    out[mode] = STEPS.map((step, i) => {
      const t = i / 11;
      const w = t < tk ? Math.max(tk, 0.35) : 0.55;
      const share = Math.max(t > tk ? 0.4 : 0.05, 1 - ((t - tk) / w) ** 2);
      return swatch(step, {
        l: l[i],
        c: chroma * share * (mode === "dark" ? curve.darkChroma ?? 1 : 1),
        h: ((hue + curve.hueShift * (t - tk)) % 360 + 360) % 360
      });
    });
  }
  return out;
}
function buildNeutral(hue, tint, curve) {
  return buildScale({ hue, chroma: 0.004 + tint * 0.026, solidL: 0.62, curve });
}
function contrast(a, b) {
  return wcagContrast(a, b);
}
var HUE_NAMES = [
  [0, "pink"],
  [15, "red"],
  [45, "orange"],
  [70, "amber"],
  [95, "yellow"],
  [115, "lime"],
  [135, "green"],
  [170, "teal"],
  [205, "cyan"],
  [235, "blue"],
  [270, "indigo"],
  [295, "violet"],
  [330, "pink"]
];
function hueName({ c, h }) {
  if (c < 0.03)
    return "gray";
  const d = (h % 360 + 360) % 360;
  return HUE_NAMES.reduce((name, [from, n]) => d >= from ? n : name, "pink");
}
function freshName(color, taken) {
  const base = hueName(color);
  if (!taken.includes(base))
    return base;
  const shade = `${color.l > 0.62 ? "light" : color.l < 0.5 ? "dark" : "deep"} ${base}`;
  if (!taken.includes(shade))
    return shade;
  let n = 2;
  while (taken.includes(`${base} ${n}`))
    n++;
  return `${base} ${n}`;
}

// src/lib/spring/fonts.data.ts
var FONTS = {
  Inter: {
    tag: "sans",
    note: "The neutral workhorse. Clear at any size, but it reads as the default.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    variable: [100, 900],
    italic: true,
    scripts: [
      "Cyrillic",
      "Cyrillic Extended",
      "Greek",
      "Greek Extended",
      "Latin",
      "Latin Extended",
      "Vietnamese"
    ],
    tnum: true,
    kb: 23,
    popularity: 5,
    license: "OFL",
    ascent: 1984,
    descent: -494,
    lineGap: 0,
    unitsPerEm: 2048,
    xHeight: 1118,
    xWidthAvg: 978
  },
  Geist: {
    tag: "sans",
    note: "Precise and technical, drawn for developer tools.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    variable: [100, 900],
    italic: true,
    scripts: ["Cyrillic", "Cyrillic Extended", "Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 13,
    popularity: 94,
    license: "OFL",
    ascent: 1005,
    descent: -295,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 530,
    xWidthAvg: 467
  },
  "Instrument Sans": {
    tag: "sans",
    note: "A friendly grotesk with a width axis; modern without being cold.",
    weights: [400, 500, 600, 700],
    variable: [400, 700],
    italic: true,
    scripts: ["Latin", "Latin Extended"],
    tnum: true,
    kb: 16,
    popularity: 107,
    license: "OFL",
    ascent: 970,
    descent: -250,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 510,
    xWidthAvg: 458
  },
  "Hanken Grotesk": {
    tag: "sans",
    note: "Balanced and unfussy, a quieter Inter alternative.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    variable: [100, 900],
    italic: true,
    scripts: ["Cyrillic Extended", "Latin", "Latin Extended", "Vietnamese"],
    tnum: false,
    kb: 13,
    popularity: 144,
    license: "OFL",
    ascent: 1000,
    descent: -303,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 493,
    xWidthAvg: 450
  },
  "Schibsted Grotesk": {
    tag: "sans",
    note: "A newspaper grotesk: confident headlines, sturdy text.",
    weights: [400, 500, 600, 700, 800, 900],
    variable: [400, 900],
    italic: true,
    scripts: ["Latin", "Latin Extended"],
    tnum: true,
    kb: 24,
    popularity: 99,
    license: "OFL",
    ascent: 2000,
    descent: -528,
    lineGap: 0,
    unitsPerEm: 2048,
    xHeight: 1080,
    xWidthAvg: 954
  },
  Manrope: {
    tag: "sans",
    note: "Semi-geometric and modern; common in fintech.",
    weights: [200, 300, 400, 500, 600, 700, 800],
    variable: [200, 800],
    italic: false,
    scripts: ["Cyrillic", "Cyrillic Extended", "Greek", "Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 14,
    popularity: 28,
    license: "OFL",
    ascent: 2132,
    descent: -600,
    lineGap: 0,
    unitsPerEm: 2000,
    xHeight: 1080,
    xWidthAvg: 920
  },
  "Plus Jakarta Sans": {
    tag: "sans",
    note: "Rounded geometric, upbeat and startup-friendly.",
    weights: [200, 300, 400, 500, 600, 700, 800],
    variable: [200, 800],
    italic: true,
    scripts: ["Cyrillic Extended", "Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 12,
    popularity: 33,
    license: "OFL",
    ascent: 1038,
    descent: -222,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 536,
    xWidthAvg: 468
  },
  Figtree: {
    tag: "sans",
    note: "Warm geometric that stays easy to read; approachable.",
    weights: [300, 400, 500, 600, 700, 800, 900],
    variable: [300, 900],
    italic: true,
    scripts: ["Latin", "Latin Extended"],
    tnum: true,
    kb: 11,
    popularity: 35,
    license: "OFL",
    ascent: 950,
    descent: -250,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 500,
    xWidthAvg: 449
  },
  "DM Sans": {
    tag: "sans",
    note: "Low-contrast geometric, soft and friendly at small sizes.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    variable: [100, 1000],
    italic: true,
    scripts: ["Latin", "Latin Extended"],
    tnum: false,
    kb: 14,
    popularity: 20,
    license: "OFL",
    ascent: 992,
    descent: -310,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 504,
    xWidthAvg: 466
  },
  "Albert Sans": {
    tag: "sans",
    note: "Scandinavian geometric; clean with a little character.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    variable: [100, 900],
    italic: true,
    scripts: ["Latin", "Latin Extended"],
    tnum: false,
    kb: 10,
    popularity: 167,
    license: "OFL",
    ascent: 950,
    descent: -250,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 500,
    xWidthAvg: 463
  },
  Onest: {
    tag: "sans",
    note: "Calm and legible, with strong Cyrillic.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    variable: [100, 900],
    italic: false,
    scripts: ["Cyrillic", "Cyrillic Extended", "Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 14,
    popularity: 177,
    license: "OFL",
    ascent: 970,
    descent: -305,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 527,
    xWidthAvg: 469
  },
  "Public Sans": {
    tag: "sans",
    note: "Made for US government sites: neutral, trustworthy, plain.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    variable: [100, 900],
    italic: true,
    scripts: ["Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 14,
    popularity: 87,
    license: "OFL",
    ascent: 1900,
    descent: -450,
    lineGap: 0,
    unitsPerEm: 2000,
    xHeight: 1034,
    xWidthAvg: 935
  },
  "IBM Plex Sans": {
    tag: "sans",
    note: "Engineered and corporate, with a human edge in the curves.",
    weights: [100, 200, 300, 400, 500, 600, 700],
    variable: [100, 700],
    italic: true,
    scripts: ["Cyrillic", "Cyrillic Extended", "Greek", "Latin", "Latin Extended", "Vietnamese"],
    tnum: false,
    kb: 17,
    popularity: 51,
    license: "OFL",
    ascent: 1025,
    descent: -275,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 516,
    xWidthAvg: 451
  },
  "Work Sans": {
    tag: "sans",
    note: "Slightly grotesque and open; good for screens.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    variable: [100, 900],
    italic: true,
    scripts: ["Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 20,
    popularity: 41,
    license: "OFL",
    ascent: 930,
    descent: -243,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 500,
    xWidthAvg: 499
  },
  Sora: {
    tag: "sans",
    note: "Wide and futuristic; reads as web3 and tech.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    variable: [100, 800],
    italic: false,
    scripts: ["Latin", "Latin Extended"],
    tnum: true,
    kb: 14,
    popularity: 92,
    license: "OFL",
    ascent: 970,
    descent: -290,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 534,
    xWidthAvg: 507
  },
  Outfit: {
    tag: "display",
    note: "Pure geometric headlines; playful and round.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    variable: [100, 900],
    italic: false,
    scripts: ["Latin", "Latin Extended"],
    tnum: true,
    kb: 14,
    popularity: 30,
    license: "OFL",
    ascent: 1000,
    descent: -260,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 475,
    xWidthAvg: 445
  },
  "Space Grotesk": {
    tag: "display",
    note: "Quirky tech grotesk with odd details; nerdy and fun.",
    weights: [300, 400, 500, 600, 700],
    variable: [300, 700],
    italic: false,
    scripts: ["Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 13,
    popularity: 59,
    license: "OFL",
    ascent: 984,
    descent: -292,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 486,
    xWidthAvg: 489
  },
  "Bricolage Grotesque": {
    tag: "display",
    note: "Expressive and inky at large sizes; editorial with attitude.",
    weights: [200, 300, 400, 500, 600, 700, 800],
    variable: [200, 800],
    italic: false,
    scripts: ["Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 22,
    popularity: 58,
    license: "OFL",
    ascent: 930,
    descent: -270,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 517,
    xWidthAvg: 470
  },
  "Familjen Grotesk": {
    tag: "display",
    note: "Chunky Swedish grotesk; warm and a bit cheeky.",
    weights: [400, 500, 600, 700],
    variable: [400, 700],
    italic: true,
    scripts: ["Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 11,
    popularity: 456,
    license: "OFL",
    ascent: 1230,
    descent: -270,
    lineGap: 0,
    unitsPerEm: 1200,
    xHeight: 600,
    xWidthAvg: 506
  },
  Syne: {
    tag: "display",
    note: "Art-gallery loud; stretches wide at heavy weights.",
    weights: [400, 500, 600, 700, 800],
    variable: [400, 800],
    italic: false,
    scripts: ["Greek", "Latin", "Latin Extended"],
    tnum: true,
    kb: 13,
    popularity: 193,
    license: "OFL",
    ascent: 925,
    descent: -275,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 500,
    xWidthAvg: 439
  },
  Unbounded: {
    tag: "display",
    note: "Wide, round and playful; big personality, use short words.",
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    variable: [200, 900],
    italic: false,
    scripts: ["Cyrillic", "Cyrillic Extended", "Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 20,
    popularity: 165,
    license: "OFL",
    ascent: 995,
    descent: -245,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 566,
    xWidthAvg: 600
  },
  "Source Serif 4": {
    tag: "serif",
    note: "A readable editorial serif with optical sizes.",
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    variable: [200, 900],
    italic: true,
    scripts: ["Cyrillic", "Cyrillic Extended", "Greek", "Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 20,
    popularity: 105,
    license: "OFL",
    ascent: 1036,
    descent: -335,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 475,
    xWidthAvg: 479
  },
  Newsreader: {
    tag: "serif",
    note: "Made for news and long reads; calm authority.",
    weights: [200, 300, 400, 500, 600, 700, 800],
    variable: [200, 800],
    italic: true,
    scripts: ["Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 22,
    popularity: 101,
    license: "OFL",
    ascent: 1470,
    descent: -530,
    lineGap: 0,
    unitsPerEm: 2000,
    xHeight: 852,
    xWidthAvg: 857
  },
  Literata: {
    tag: "serif",
    note: "Designed for e-books; warm and very readable.",
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    variable: [200, 900],
    italic: true,
    scripts: [
      "Cyrillic",
      "Cyrillic Extended",
      "Greek",
      "Greek Extended",
      "Latin",
      "Latin Extended",
      "Vietnamese"
    ],
    tnum: true,
    kb: 20,
    popularity: 222,
    license: "OFL",
    ascent: 1177,
    descent: -308,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 507,
    xWidthAvg: 480
  },
  Lora: {
    tag: "serif",
    note: "Calligraphic and warm; gentle storytelling.",
    weights: [400, 500, 600, 700],
    variable: [400, 700],
    italic: true,
    scripts: ["Cyrillic", "Cyrillic Extended", "Latin", "Latin Extended", "Vietnamese"],
    tnum: true,
    kb: 21,
    popularity: 40,
    license: "OFL",
    ascent: 1006,
    descent: -274,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 500,
    xWidthAvg: 468
  },
  "EB Garamond": {
    tag: "serif",
    note: "Classical and literary; best large and in print-like layouts.",
    weights: [400, 500, 600, 700, 800],
    variable: [400, 800],
    italic: true,
    scripts: [
      "Cyrillic",
      "Cyrillic Extended",
      "Greek",
      "Greek Extended",
      "Latin",
      "Latin Extended",
      "Vietnamese"
    ],
    tnum: true,
    kb: 23,
    popularity: 79,
    license: "OFL",
    ascent: 1007,
    descent: -298,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 400,
    xWidthAvg: 385
  },
  Fraunces: {
    tag: "serif",
    note: "Soft, wonky old-style; warm and handmade.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    variable: [100, 900],
    italic: true,
    scripts: ["Latin", "Latin Extended", "Vietnamese"],
    tnum: false,
    kb: 18,
    popularity: 71,
    license: "OFL",
    ascent: 1956,
    descent: -510,
    lineGap: 0,
    unitsPerEm: 2000,
    xHeight: 964,
    xWidthAvg: 938
  },
  "Young Serif": {
    tag: "serif",
    note: "Chunky and friendly; a cookbook on a sunny day.",
    weights: [400],
    variable: null,
    italic: false,
    scripts: ["Latin", "Latin Extended"],
    tnum: true,
    kb: 18,
    popularity: 551,
    license: "OFL",
    ascent: 1046,
    descent: -366,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 500,
    xWidthAvg: 511
  },
  "Instrument Serif": {
    tag: "serif",
    note: "Condensed display serif; fashion-editorial, one weight.",
    weights: [400],
    variable: null,
    italic: true,
    scripts: ["Latin", "Latin Extended"],
    tnum: false,
    kb: 15,
    popularity: 66,
    license: "OFL",
    ascent: 990,
    descent: -310,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 510,
    xWidthAvg: 341
  },
  "DM Serif Display": {
    tag: "serif",
    note: "High-contrast headlines; premium and dramatic.",
    weights: [400],
    variable: null,
    italic: true,
    scripts: ["Latin", "Latin Extended"],
    tnum: false,
    kb: 17,
    popularity: 113,
    license: "OFL",
    ascent: 1036,
    descent: -335,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 481,
    xWidthAvg: 446
  },
  Gloock: {
    tag: "serif",
    note: "Bold, sharp serif headlines with a sculpted feel.",
    weights: [400],
    variable: null,
    italic: false,
    scripts: ["Cyrillic Extended", "Latin", "Latin Extended"],
    tnum: true,
    kb: 17,
    popularity: 445,
    license: "OFL",
    ascent: 975,
    descent: -225,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 508,
    xWidthAvg: 467
  },
  "Geist Mono": {
    tag: "mono",
    note: "Clean and technical; pairs with Geist.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    variable: [100, 900],
    italic: true,
    scripts: ["Cyrillic", "Cyrillic Extended", "Latin", "Latin Extended", "Vietnamese"],
    tnum: false,
    kb: 10,
    popularity: 126,
    license: "OFL",
    ascent: 1005,
    descent: -295,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 530,
    xWidthAvg: 600
  },
  "JetBrains Mono": {
    tag: "mono",
    note: "Tall x-height, made for reading code all day.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    variable: [100, 800],
    italic: true,
    scripts: ["Cyrillic", "Cyrillic Extended", "Greek", "Latin", "Latin Extended", "Vietnamese"],
    tnum: false,
    kb: 21,
    popularity: 43,
    license: "OFL",
    ascent: 1020,
    descent: -300,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 550,
    xWidthAvg: 600
  },
  "IBM Plex Mono": {
    tag: "mono",
    note: "Engineered with warm italics; pairs with Plex Sans.",
    weights: [100, 200, 300, 400, 500, 600, 700],
    variable: null,
    italic: true,
    scripts: ["Cyrillic", "Cyrillic Extended", "Latin", "Latin Extended", "Vietnamese"],
    tnum: false,
    kb: 10,
    popularity: 69,
    license: "OFL",
    ascent: 1025,
    descent: -275,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 516,
    xWidthAvg: 600
  },
  "DM Mono": {
    tag: "mono",
    note: "Soft and friendly, for numbers and labels more than code.",
    weights: [300, 400, 500],
    variable: null,
    italic: true,
    scripts: ["Latin", "Latin Extended"],
    tnum: false,
    kb: 8,
    popularity: 152,
    license: "OFL",
    ascent: 992,
    descent: -310,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 496,
    xWidthAvg: 600
  },
  "Space Mono": {
    tag: "mono",
    note: "Retro, characterful mono; great for labels, tiring for code.",
    weights: [400, 700],
    variable: null,
    italic: true,
    scripts: ["Latin", "Latin Extended", "Vietnamese"],
    tnum: false,
    kb: 9,
    popularity: 161,
    license: "OFL",
    ascent: 1120,
    descent: -361,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 496,
    xWidthAvg: 612
  }
};
var FALLBACKS = {
  Arial: {
    ascent: 1854,
    descent: -434,
    lineGap: 67,
    unitsPerEm: 2048,
    xHeight: 1062,
    xWidthAvg: 913
  },
  "Times New Roman": {
    ascent: 1825,
    descent: -443,
    lineGap: 87,
    unitsPerEm: 2048,
    xHeight: 916,
    xWidthAvg: 832
  },
  "Courier New": {
    ascent: 1705,
    descent: -615,
    lineGap: 0,
    unitsPerEm: 2048,
    xHeight: 866,
    xWidthAvg: 1229
  }
};

// src/lib/spring/type.ts
var FONT_NAMES = Object.keys(FONTS);
var SAFE_FONT = /^[A-Za-z0-9][A-Za-z0-9 ]{0,59}$/;
var isCurated = (n) => Object.hasOwn(FONTS, n);
var PROXY = {
  sans: "Inter",
  serif: "Source Serif 4",
  display: "Inter",
  hand: "Inter",
  mono: "JetBrains Mono"
};
function fontInfo(name, extra) {
  if (isCurated(name)) {
    const f = FONTS[name];
    return {
      ...f,
      tag: f.tag,
      weights: [...f.weights],
      variable: f.variable ? [f.variable[0], f.variable[1]] : null,
      measured: true
    };
  }
  const meta = extra?.[name] ?? { tag: "sans", weights: [400, 700], variable: null };
  return { ...FONTS[PROXY[meta.tag]], ...meta, measured: false };
}
var ROLE_JOBS = {
  display: "Hero and marketing headlines, once per page",
  h1: "Page title",
  h2: "Section title",
  h3: "Card and group title",
  "body-lg": "Lead paragraphs and intros",
  body: "Running text",
  label: "Buttons, inputs, tabs, menus",
  caption: "Metadata, helper text, timestamps",
  code: "Inline code and code blocks"
};
var STEP = {
  display: 6,
  h1: 4,
  h2: 3,
  h3: 2,
  "body-lg": 1,
  body: 0,
  label: -0.5,
  caption: -1.5,
  code: -0.5
};
var VIEWPORT = { min: 360, max: 1280 };
var round2 = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;
var rem = (px) => `${round2(px / 16, 4)}rem`;
function lineHeightFor(size, cap = 1.6) {
  const target = size * Math.min(cap, Math.max(1.1, 1 + 8 / size));
  const grid = size >= 20 ? 4 : 2;
  const px = Math.max(grid, Math.round(target / grid) * grid);
  return { ratio: round2(px / size, 3), px };
}
function trackingFor(size, tag) {
  const t = -0.0223 + 0.185 * Math.exp(-0.1745 * size);
  const scale = tag === "mono" ? 0 : tag === "serif" || tag === "hand" ? 0.5 : 1;
  return round2(t * scale, 3);
}
function fluidClamp(min, max) {
  if (Math.abs(max - min) < 0.5)
    return rem(max);
  const slope = (max - min) / (VIEWPORT.max - VIEWPORT.min);
  const intercept = min - slope * VIEWPORT.min;
  return `clamp(${rem(min)}, ${rem(intercept)} + ${round2(slope * 100, 4)}vw, ${rem(max)})`;
}
function weightFor(font, wanted) {
  if (font.variable)
    return Math.min(font.variable[1], Math.max(font.variable[0], wanted));
  const ws = font.weights;
  return ws.reduce((best, w) => Math.abs(w - wanted) < Math.abs(best - wanted) ? w : best, ws[0]);
}
var pct = (n) => `${round2(n * 100, 2)}%`;
function fallbackFor(font, f) {
  if (!f.measured)
    return { family: "", css: "" };
  const fbName = f.tag === "serif" ? "Times New Roman" : f.tag === "mono" ? "Courier New" : "Arial";
  const fb = FALLBACKS[fbName];
  const sizeAdjust = f.xWidthAvg / f.unitsPerEm / (fb.xWidthAvg / fb.unitsPerEm);
  const family = `${font} Fallback`;
  const css = [
    `@font-face {`,
    `  font-family: "${family}";`,
    `  src: local("${fbName}");`,
    `  size-adjust: ${pct(sizeAdjust)};`,
    `  ascent-override: ${pct(f.ascent / f.unitsPerEm / sizeAdjust)};`,
    `  descent-override: ${pct(Math.abs(f.descent) / f.unitsPerEm / sizeAdjust)};`,
    `  line-gap-override: ${pct(f.lineGap / f.unitsPerEm / sizeAdjust)};`,
    `}`
  ].join(`
`);
  return { family, css };
}
function opticalBase(font, extra) {
  const ref = FONTS.Inter.xHeight / FONTS.Inter.unitsPerEm * 16;
  const f = fontInfo(font, extra);
  const own = f.xHeight / f.unitsPerEm;
  return round2(ref / own, 1);
}
function buildType(input) {
  const mobileRatio = 1 + (input.ratio - 1) * 0.72;
  const notes = [];
  const info = (n) => fontInfo(n, input.extra);
  const tokens = Object.keys(STEP).map((role) => {
    const family = role === "code" ? input.mono : ["display", "h1", "h2", "h3"].includes(role) ? input.heading : input.body;
    const n = STEP[role];
    const max = Math.max(12, Math.round(input.base * input.ratio ** n));
    const min = input.fluid && n > 0 ? Math.max(12, Math.round(input.base * mobileRatio ** n)) : max;
    const lh = lineHeightFor(max, role === "label" ? 1.45 : 1.6);
    const heading = ["display", "h1", "h2", "h3"].includes(role);
    const weight = weightFor(info(family), heading ? input.headingWeight : role === "label" ? 500 : 400);
    return {
      role,
      family,
      weight,
      min,
      max,
      size: input.fluid ? fluidClamp(min, max) : rem(max),
      lineHeight: lh.ratio,
      lineHeightPx: lh.px,
      tracking: trackingFor(max, info(family).tag)
    };
  });
  for (const t of tokens) {
    if (t.max / t.min > 2.5)
      notes.push(`${t.role}: max is over 2.5× min, which can break 200% zoom.`);
  }
  const ob = opticalBase(input.body, input.extra);
  if (info(input.body).measured && Math.abs(ob - input.base) >= 1) {
    notes.push(`${input.body} reads ${ob > input.base ? "smaller" : "larger"} than its px size. ${ob}px matches the x-height of Inter at 16px.`);
  }
  return {
    tokens,
    fallbacks: {
      body: fallbackFor(input.body, info(input.body)),
      heading: fallbackFor(input.heading, info(input.heading)),
      mono: fallbackFor(input.mono, info(input.mono))
    },
    notes,
    opticalBase: ob
  };
}
function fontStack(font, extra) {
  const f = fontInfo(font, extra);
  const generic = f.tag === "serif" ? "ui-serif, Georgia, serif" : f.tag === "mono" ? "ui-monospace, monospace" : f.tag === "hand" ? "cursive" : "ui-sans-serif, system-ui, sans-serif";
  return f.measured ? `"${font}", "${font} Fallback", ${generic}` : `"${font}", ${generic}`;
}
function googleFontsUrl(fonts, extra) {
  const uniq = [...new Set(fonts)].sort();
  const fam = uniq.map((f) => {
    const d = fontInfo(f, extra);
    const span = d.variable ? `:wght@${d.variable[0]}..${d.variable[1]}` : d.weights.length > 1 ? `:wght@${d.weights.join(";")}` : "";
    return `family=${f.replace(/ /g, "+")}${span}`;
  }).join("&");
  return `https://fonts.googleapis.com/css2?${fam}&display=swap`;
}

// src/lib/spring/charts.ts
var CHART_MAX = 10;
var VISIONS = ["normal", "protan", "deutan", "tritan"];
var SIM = {
  protan: [
    0.152286,
    1.052583,
    -0.204868,
    0.114503,
    0.786281,
    0.099216,
    -0.003882,
    -0.048116,
    1.051998
  ],
  deutan: [
    0.367322,
    0.860646,
    -0.227968,
    0.280085,
    0.672501,
    0.047413,
    -0.01182,
    0.04294,
    0.968881
  ],
  tritan: [
    1.255528,
    -0.076749,
    -0.178779,
    -0.078411,
    0.930809,
    0.147602,
    0.004733,
    0.691367,
    0.3039
  ]
};
var CVD_FILTER = Object.fromEntries(Object.entries(SIM).map(([k, m]) => [
  k,
  [0, 1, 2].map((r) => `${m.slice(r * 3, r * 3 + 3).join(" ")} 0 0`).join(" ") + " 0 0 0 1 0"
]));
var lab = (l, c, h) => {
  const r = h * Math.PI / 180;
  return [l, c * Math.cos(r), c * Math.sin(r)];
};
var dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
function seen(l, c, h) {
  const rgb = oklchToLinear({ l, c, h }).map((v) => Math.min(1, Math.max(0, v)));
  const out = { normal: lab(l, c, h) };
  for (const [k, m] of Object.entries(SIM)) {
    const s = [0, 1, 2].map((i) => Math.min(1, Math.max(0, m[i * 3] * rgb[0] + m[i * 3 + 1] * rgb[1] + m[i * 3 + 2] * rgb[2])));
    const o = linearToOklch(s);
    out[k] = lab(o.l, o.c, o.h);
  }
  return out;
}
var SEQ_STEPS = [3, 4, 5, 6, 7, 8, 9, 10, 11];
var DIV_STEPS = [10, 8, 6, 4];
function markStep(scale, mode, page) {
  let k = scale.anchor[mode];
  while (k < 12 && wcagContrast(scale[mode][k - 1].hex, page) < 3)
    k++;
  return k;
}
var seeOf = (hex) => seen(...lch(hex));
function closestPairs(marks) {
  const see = marks.map(seeOf);
  const out = {};
  for (const v of VISIONS) {
    let best = { a: 0, b: 1, d: Infinity };
    for (let i = 0;i < see.length; i++)
      for (let j = i + 1;j < see.length; j++) {
        const d = dist(see[i][v], see[j][v]);
        if (d < best.d)
          best = { a: i, b: j, d };
      }
    out[v] = best;
  }
  return out;
}
var memo;
function suggest(primary, count, pages, curve) {
  const key = JSON.stringify([primary.hue, primary.chroma, primary.solidL, count, pages, curve]);
  if (memo?.key === key)
    return memo.seeds;
  const cand = (h, l, c) => {
    const cc = Math.min(c, clampChroma({ l, c, h }).c);
    const scale = buildScale({ hue: h, chroma: cc, solidL: l, curve });
    const see = {};
    for (const mode of ["light", "dark"])
      see[mode] = seeOf(scale[mode][markStep(scale, mode, pages[mode]) - 1].hex);
    return { seed: oklchToHex({ l, c: cc, h }), see };
  };
  const c = Math.max(0.12, Math.min(0.2, primary.chroma));
  const pool = [];
  for (let h = 0;h < 360; h += 15)
    for (const l of [0.45, 0.58, 0.72])
      pool.push(cand(h, l, c));
  const chosen = [
    primary.chroma < 0.05 ? cand(250, 0.5, c) : cand(primary.hue, primary.solidL ?? 0.55, primary.chroma)
  ];
  const gap = (p) => {
    let min = Infinity;
    for (const q of chosen)
      for (const mode of ["light", "dark"])
        for (const v of VISIONS)
          min = Math.min(min, dist(p.see[mode][v], q.see[mode][v]));
    return min;
  };
  while (chosen.length < Math.min(count, CHART_MAX)) {
    let best = pool[0];
    let score = -1;
    for (const p of pool) {
      const s = gap(p);
      if (s > score)
        [best, score] = [p, s];
    }
    chosen.push(best);
  }
  memo = { key, seeds: chosen.map((p) => p.seed) };
  return memo.seeds;
}
function check(id, title, value, ok, warn = false) {
  return { id, title, value, status: ok ? "pass" : warn ? "warn" : "fail" };
}
function buildCharts(keys, scales, neutral, pages, ramps = {}) {
  const at = (i) => i !== undefined && keys[i] ? keys[i] : undefined;
  const seq = at(ramps.seq ?? 0);
  const a = at(ramps.div?.[0] ?? 0);
  const b = at(ramps.div?.[1] ?? 1);
  const div = a && b && a !== b ? [a, b] : undefined;
  const out = {
    keys,
    seq,
    div,
    markStep: {},
    marks: {},
    sequential: {},
    diverging: {},
    closest: {},
    checks: {}
  };
  for (const mode of ["light", "dark"]) {
    const page = pages[mode];
    const steps = keys.map((k) => markStep(scales[k], mode, page));
    const marks = keys.map((k, i) => scales[k][mode][steps[i] - 1].hex);
    out.markStep[mode] = steps;
    out.marks[mode] = marks;
    out.sequential[mode] = seq ? SEQ_STEPS.map((s) => scales[seq][mode][s - 1].hex) : [];
    const arm = (k, order) => order.map((s) => scales[k][mode][s - 1].hex);
    out.diverging[mode] = div ? [...arm(div[0], DIV_STEPS), neutral[mode][1].hex, ...arm(div[1], DIV_STEPS.toReversed())] : [];
    const closest = closestPairs(marks);
    out.closest[mode] = closest;
    const checks = [];
    if (marks.length) {
      const low = Math.min(...marks.map((h) => wcagContrast(h, page)));
      checks.push(check("contrast", "Marks on the page", `${low.toFixed(2)}:1 lowest, needs 3:1`, low >= 3));
    }
    if (marks.length > 1) {
      const n = closest.normal.d;
      const cvd = Math.min(closest.protan.d, closest.deutan.d, closest.tritan.d);
      const ls = marks.map((h) => lch(h)[0]);
      const flat = ls.slice(1).filter((l, i) => Math.abs(l - ls[i]) < 0.06).length;
      checks.push(check("normal", "Apart, normal vision", `ΔE ${n.toFixed(3)}, needs 0.10`, n >= 0.1, n >= 0.06), check("cvd", "Apart, color blindness", `ΔE ${cvd.toFixed(3)}, needs 0.06`, cvd >= 0.06, cvd >= 0.04), check("gray", "Neighbours differ in lightness", flat ? `${flat} neighbouring pair${flat > 1 ? "s" : ""} under ΔL 0.06` : "every neighbour ΔL ≥ 0.06", !flat, true));
    }
    if (div) {
      const d = out.diverging[mode];
      const ends = [seeOf(d[0]), seeOf(d[d.length - 1])];
      const endGap = Math.min(...VISIONS.map((v) => dist(ends[0][v], ends[1][v])));
      const skew = Math.max(...DIV_STEPS.map((s) => Math.abs(scales[div[0]][mode][s - 1].oklch.l - scales[div[1]][mode][s - 1].oklch.l)));
      checks.push(check("diverge", "Diverging ends apart for everyone", `ΔE ${endGap.toFixed(3)}, needs 0.06`, endGap >= 0.06, endGap >= 0.04), check("balance", "Diverging arms balanced", `ΔL ${skew.toFixed(3)} at worst, keep under 0.04`, skew < 0.04, true));
    }
    out.checks[mode] = checks;
  }
  return out;
}
function lch(hex) {
  const r = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = r.map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const o = linearToOklch(lin);
  return [o.l, o.c, o.h];
}

// src/lib/spring/scales.ts
var round3 = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;
var clamp01 = (n) => Math.min(1, Math.max(0, n));
function buildSpace(density) {
  const d = clamp01(density);
  const unit = 4;
  const scale = {};
  for (const n of [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24])
    scale[String(n)] = n * unit;
  const md = 32 + Math.round(d * 2) * 4;
  return {
    unit,
    scale,
    control: { sm: md - 8, md, lg: md + 8 },
    paddingX: { sm: 8, md: md >= 40 ? 16 : 12, lg: md >= 40 ? 20 : 16 },
    gutter: d < 0.34 ? 16 : d < 0.67 ? 24 : 32,
    section: d < 0.34 ? 48 : d < 0.67 ? 80 : 120,
    breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280 },
    measure: "65ch"
  };
}
function buildShape(roundness) {
  const r = clamp01(roundness);
  const md = Math.round(r * 16 / 2) * 2;
  return {
    radius: {
      none: 0,
      sm: Math.round(md / 2 / 2) * 2,
      md,
      lg: Math.round(md * 1.5 / 2) * 2,
      xl: md * 2,
      full: 9999
    },
    border: { hairline: 1, default: 1, strong: 2 }
  };
}
function buildShadows(neutralHue, mode) {
  const a = mode === "light" ? 1 : 2.4;
  const h = round3(neutralHue, 1);
  const layer = (y, blur, alpha) => ({
    x: 0,
    y,
    blur,
    spread: 0,
    color: { l: 0.22, c: 0.02, h, alpha: round3(Math.min(alpha * a, 0.7), 3) }
  });
  const layers = {
    sm: [layer(1, 2, 0.06)],
    md: [layer(2, 4, 0.05), layer(4, 12, 0.07)],
    lg: [layer(4, 8, 0.05), layer(12, 32, 0.12)]
  };
  const css = (ls) => ls.map((l) => `${l.x} ${l.y}px ${l.blur}px oklch(22% 0.02 ${h} / ${l.color.alpha})`).join(", ");
  return { sm: css(layers.sm), md: css(layers.md), lg: css(layers.lg), layers };
}
function springLinear(stiffness, damping, mass = 1, points = 40) {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const x = (t) => {
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + zeta * w0 / wd * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  };
  let settle = 0;
  for (let t = 0;t < 5; t += 0.005) {
    let still = true;
    for (let u = t;u < t + 0.3; u += 0.02)
      if (Math.abs(1 - x(u)) > 0.001)
        still = false;
    if (still) {
      settle = t;
      break;
    }
  }
  settle ||= 1;
  const samples = Array.from({ length: points + 1 }, (_, i) => round3(i === points ? 1 : x(i / points * settle), 3));
  return { easing: `linear(${samples.join(", ")})`, duration: Math.round(settle * 1000) };
}
function buildMotion(energy) {
  const e = clamp01(energy);
  const fast = Math.round(160 - e * 60);
  const base = Math.round(240 - e * 60);
  const slow = Math.round(360 - e * 60);
  const stiffness = Math.round(170 + e * 230);
  const damping = round3(2 * Math.sqrt(stiffness) * (1 - e * 0.35), 1);
  const spring = springLinear(stiffness, damping);
  return {
    duration: { instant: 0, fast, base, slow, spring: spring.duration },
    easing: {
      out: "cubic-bezier(0.22, 1, 0.36, 1)",
      inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
      spring: spring.easing
    },
    springConfig: { stiffness, damping, mass: 1 }
  };
}

// src/lib/spring/stack.ts
var CHECKED = "2026-11";
var COMPONENTS = {
  shadcn: {
    id: "shadcn",
    name: "shadcn/ui",
    url: "https://ui.shadcn.com",
    install: "npx shadcn@latest init",
    why: "Components are copied into your repo, so you own and restyle every line. Built on Tailwind and accessible primitives, and the format most agents already know.",
    whenNot: "You don't use Tailwind, or you want upgrades from a package instead of maintaining copied code.",
    checked: CHECKED
  },
  "base-ui": {
    id: "base-ui",
    name: "Base UI",
    url: "https://base-ui.com",
    install: "npm i @base-ui/react",
    why: "Unstyled, accessible behaviour (focus, keyboard, ARIA) with zero opinions on looks. From people behind Radix, Floating UI and MUI. Pairs with any CSS.",
    whenNot: "You want finished-looking components on day one.",
    checked: CHECKED
  },
  "react-aria": {
    id: "react-aria",
    name: "React Aria Components",
    url: "https://react-spectrum.adobe.com/react-aria/",
    install: "npm i react-aria-components",
    why: "The deepest accessibility and internationalisation coverage available, including date pickers, tables and drag and drop that work with screen readers.",
    whenNot: "A small marketing site: the API is larger than you'll need.",
    checked: CHECKED
  },
  mantine: {
    id: "mantine",
    name: "Mantine",
    url: "https://mantine.dev",
    install: "npm i @mantine/core @mantine/hooks",
    why: "A complete, styled kit with forms, dates and notifications included. The fastest way to a working dashboard.",
    whenNot: "You want a distinctive look; overriding a styled kit fights you.",
    checked: CHECKED
  }
};
var ICONS = {
  lucide: {
    id: "lucide",
    name: "Lucide",
    url: "https://lucide.dev",
    install: "npm i lucide-react",
    why: "Clean, consistent outline icons with an adjustable stroke. shadcn/ui's default, so agents reach for it correctly.",
    whenNot: "You need filled or duotone variants.",
    checked: CHECKED,
    strokeAware: true
  },
  phosphor: {
    id: "phosphor",
    name: "Phosphor",
    url: "https://phosphoricons.com",
    install: "npm i @phosphor-icons/react",
    why: "Six weights (thin to bold, fill, duotone), so icons can match your font weight exactly. Friendly, slightly rounded.",
    whenNot: "You want the most neutral, technical look.",
    checked: CHECKED,
    strokeAware: false
  },
  tabler: {
    id: "tabler",
    name: "Tabler Icons",
    url: "https://tabler.io/icons",
    install: "npm i @tabler/icons-react",
    why: "A very large outline set, good when a dense product keeps needing one more specific icon.",
    whenNot: "A small site: the size of the set invites inconsistency.",
    checked: CHECKED,
    strokeAware: true
  },
  heroicons: {
    id: "heroicons",
    name: "Heroicons",
    url: "https://heroicons.com",
    install: "npm i @heroicons/react",
    why: "A small, carefully drawn set from the Tailwind team, in outline, solid and mini sizes.",
    whenNot: "A product UI that will need hundreds of icons.",
    checked: CHECKED,
    strokeAware: false
  },
  material: {
    id: "material",
    name: "Material Symbols",
    url: "https://fonts.google.com/icons",
    install: "npm i material-symbols",
    why: "A variable icon font: weight, fill, grade and optical size are all adjustable, so icons track your type exactly.",
    whenNot: "You don't want the Material look or an icon font.",
    checked: CHECKED,
    strokeAware: false
  }
};
var STYLING = {
  tailwind: {
    id: "tailwind",
    name: "Tailwind CSS v4",
    url: "https://tailwindcss.com",
    install: "npm i tailwindcss @tailwindcss/postcss",
    why: "Tokens become utilities through @theme, so agents write classes that can only use your values.",
    whenNot: "Your team prefers writing CSS, or the codebase already has a styling approach.",
    checked: CHECKED
  },
  css: {
    id: "css",
    name: "CSS variables + CSS Modules",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties",
    install: "No install: import tokens.css once at the root.",
    why: "No build dependency and nothing to learn. Works with any framework.",
    whenNot: "You want agents constrained to your scale; raw CSS lets them type any value.",
    checked: CHECKED
  }
};
function recommend(a) {
  let components = "base-ui";
  let cr = "You want to own the code and write your own CSS, so behaviour-only primitives fit best.";
  if (a.ownership === "package") {
    components = a.building === "app" ? "react-aria" : "mantine";
    cr = a.building === "app" ? "Product apps live or die on accessible complex widgets; React Aria covers the most." : "You want a package that works out of the box; Mantine is the most complete.";
  } else if (a.styling === "tailwind") {
    components = "shadcn";
    cr = "You own the code and use Tailwind: shadcn/ui is exactly that, and agents know it well.";
  }
  const icons = a.building === "dashboard" ? "tabler" : a.building === "site" ? "phosphor" : "lucide";
  const ir = icons === "tabler" ? "Dashboards keep needing specific icons; Tabler has the widest set." : icons === "phosphor" ? "Sites benefit from icons that match the font weight; Phosphor has six weights." : "A neutral, stroke-adjustable set that matches most product type.";
  const sr = a.styling === "tailwind" ? STYLING.tailwind.why : STYLING.css.why;
  return {
    components,
    icons,
    styling: a.styling,
    reasons: { components: cr, icons: ir, styling: sr }
  };
}
function iconStroke(weight) {
  return weight <= 300 ? 1.25 : weight <= 400 ? 1.5 : weight <= 500 ? 1.75 : 2;
}

// src/lib/spring/system.ts
var DEFAULT_INPUT = {
  v: 1,
  name: "Untitled",
  primary: { hue: 264, chroma: 0.2 },
  neutralTint: 0.3,
  type: {
    body: "Inter",
    heading: "Inter",
    mono: "JetBrains Mono",
    base: 16,
    ratio: 1.25,
    headingWeight: 600,
    fluid: true
  },
  density: 0.5,
  roundness: 0.5,
  motion: 0.4,
  stack: { building: "app", ownership: "own", styling: "tailwind" }
};
var r4 = (n) => Math.round(n * 1e4) / 1e4;
function inputFromSeed(seed, name = "Untitled") {
  const c = parseColor(seed);
  if (!c)
    return { ...DEFAULT_INPUT, name };
  const neutralish = c.c < 0.03;
  return {
    ...DEFAULT_INPUT,
    name,
    primary: {
      hue: Math.round((c.h || 0) * 10) / 10,
      chroma: r4(neutralish ? 0.02 : Math.min(0.3, Math.max(0.06, c.c))),
      solidL: r4(Math.min(0.9, Math.max(0.35, c.l)))
    }
  };
}
var STATUS_HUES = { danger: 25, warning: 70, success: 150, info: 245 };
var STATUS_RANGE = {
  danger: [-5, 40],
  warning: [55, 85],
  success: [130, 165],
  info: [225, 265]
};
var hueGap = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);
function statusHue(name, primaryHue, primaryChroma, set) {
  const [lo0, hi0] = STATUS_RANGE[name];
  if (set !== undefined)
    return (Math.min(hi0, Math.max(lo0, set)) + 360) % 360;
  const base = STATUS_HUES[name];
  if (primaryChroma < 0.05 || hueGap(base, primaryHue) >= 25)
    return base;
  const [lo, hi] = STATUS_RANGE[name];
  const best = hueGap(lo, primaryHue) > hueGap(hi, primaryHue) ? lo : hi;
  return (best + 360) % 360;
}
var RESERVED = new Set([
  "primary",
  "neutral",
  ...Object.keys(STATUS_HUES),
  "bg",
  "fill",
  "border",
  "text",
  "ring",
  "shadow",
  "color"
]);
function stripKeys(colors) {
  const used = new Set;
  return colors.map((c, i) => {
    let k = slug(c.name) === "design-system" ? `color-${i + 1}` : slug(c.name);
    if (RESERVED.has(k))
      k = `${k}-custom`;
    let n = 2;
    const base = k;
    while (used.has(k))
      k = `${base}-${n++}`;
    used.add(k);
    return k;
  });
}
var MAX_STRIPS = 6;
var BARS = {
  aa: { ui: 3, text: 4.5, body: 4.5, strong: 7 },
  aaa: { ui: 3, text: 7, body: 7, strong: 7 },
  apca: { ui: 45, text: 60, body: 75, strong: 75 }
};
var CONTRAST_LABEL = {
  aa: "WCAG 2.2 AA",
  aaa: "WCAG 2.2 AAA",
  apca: "APCA"
};
function meter(target) {
  return {
    score: target === "apca" ? apcaContrast : contrast,
    bar: (level) => BARS[target][level],
    unit: target === "apca" ? "Lc" : ":1"
  };
}
var said = (m, level) => m.unit === "Lc" ? `Lc ${m.bar(level)}` : `${m.bar(level)}:1`;
var get = (scales, name, mode, step) => scales[name][mode][step - 1];
function nudge(scales, name, mode, step, against, min, m) {
  const s = get(scales, name, mode, step);
  const dir = mode === "light" ? -1 : 1;
  let { l } = s.oklch;
  for (let i = 0;i < 60; i++) {
    const cur = swatch(step, { ...s.oklch, l });
    if (against.every((bg) => m.score(cur.hex, bg) >= m.bar(min))) {
      scales[name][mode][step - 1] = cur;
      return i > 0;
    }
    l = Math.min(1, Math.max(0, l + dir * 0.01));
  }
  return false;
}
var towardContrast = (fg, mode) => fg === "#ffffff" === (mode === "light") ? 1 : -1;
function stepsNeeded(scale, mode, from, fg, m) {
  const dir = towardContrast(fg, mode);
  for (let n = 0;n < 12; n++) {
    const s = from + dir * n;
    const h = s + dir;
    if (h < 1 || h > 12)
      return 99;
    if (m.score(fg, scale[mode][s - 1].hex) >= m.bar("text") && m.score(fg, scale[mode][h - 1].hex) >= m.bar("text"))
      return n;
  }
  return 99;
}
function solidLabel(scale, mode, m, pref = "auto") {
  const ink = scale.light[11].hex;
  if (pref === "white")
    return "#ffffff";
  if (pref === "ink")
    return ink;
  const k = scale.anchor[mode];
  const w = stepsNeeded(scale, mode, k, "#ffffff", m);
  return w === 0 || w <= stepsNeeded(scale, mode, k, ink, m) ? "#ffffff" : ink;
}
function solidStep(scale, mode, fg, m) {
  const n = stepsNeeded(scale, mode, scale.anchor[mode], fg, m);
  const k = scale.anchor[mode] + towardContrast(fg, mode) * (n === 99 ? 0 : n);
  return Math.min(11, Math.max(2, k));
}
function buildRoles(scales, mode, labels, solid, custom) {
  const at = (scale) => solid[scale][mode];
  const hover = (scale) => at(scale) + towardContrast(labels[scale][mode], mode);
  const r = (name, scale, step, job) => {
    const s = get(scales, scale, mode, step);
    return { name, hex: s.hex, css: s.css, from: `${scale}.${step}`, job };
  };
  const on = (name, scale, job) => {
    const hex = labels[scale][mode];
    return { name, hex, css: hex, from: `on ${scale}.${at(scale)}`, job };
  };
  const roles = [
    r("bg", "neutral", 1, "Page background"),
    r("bg-subtle", "neutral", 2, "Sidebars, cards, striped rows"),
    r("fill", "neutral", 3, "Inputs, secondary buttons, chips"),
    r("fill-hover", "neutral", 4, "Hovered fill"),
    r("fill-active", "neutral", 5, "Pressed or selected fill"),
    r("border-subtle", "neutral", 6, "Dividers and card edges"),
    r("border", "neutral", 7, "Input and control borders"),
    r("border-strong", "neutral", 8, "Hovered borders, emphasis"),
    r("text-muted", "neutral", 11, "Secondary text, placeholders, icons"),
    r("text", "neutral", 12, "Body and heading text"),
    r("primary", "primary", at("primary"), "Primary action, one per view"),
    r("primary-hover", "primary", hover("primary"), "Hovered primary action"),
    on("primary-fg", "primary", "Text and icons on primary"),
    r("primary-subtle", "primary", 3, "Selected rows, soft badges"),
    r("primary-subtle-hover", "primary", 4, "Hovered soft primary"),
    r("primary-border", "primary", 7, "Borders of primary-subtle elements"),
    r("primary-text", "primary", 11, "Links and primary text on bg"),
    r("ring", "primary", at("primary"), "Focus ring")
  ];
  for (const s of Object.keys(STATUS_HUES)) {
    roles.push(r(s, s, at(s), `Solid ${s} fill`), on(`${s}-fg`, s, `Text on ${s}`), r(`${s}-subtle`, s, 3, `Soft ${s} background`), r(`${s}-text`, s, 11, `${s[0].toUpperCase() + s.slice(1)} text on bg`));
  }
  for (const { key: k, name } of custom)
    roles.push(r(k, k, at(k), `Solid ${name} fill`), on(`${k}-fg`, k, `Text on ${name}`), r(`${k}-subtle`, k, 3, `Soft ${name} background`), r(`${k}-text`, k, 11, `${name} text on bg`));
  return roles;
}
var BASE_PAIRS = [
  ["text", "bg", "body", "Body text"],
  ["text", "bg-subtle", "body", "Text on cards and sidebars"],
  ["text", "fill", "text", "Text in inputs and secondary buttons"],
  ["text-muted", "bg", "text", "Secondary text"],
  ["text-muted", "bg-subtle", "text", "Secondary text on cards"],
  ["text-muted", "fill", "text", "Placeholders in inputs"],
  ["primary-fg", "primary", "text", "Primary button label"],
  ["primary-fg", "primary-hover", "text", "Hovered primary button label"],
  ["primary-text", "bg", "text", "Links"],
  ["primary-text", "primary-subtle", "text", "Text in soft primary badges"],
  ["ring", "bg", "ui", "Focus ring is visible (WCAG 2.4.13)"],
  ["border-strong", "bg", "ui", "Control edges alone identify the control (WCAG 1.4.11)", true],
  ...Object.keys(STATUS_HUES).flatMap((s) => [
    [`${s}-text`, "bg", "text", `${s} messages`],
    [`${s}-fg`, s, "text", `Label on solid ${s}`]
  ])
];
function runChecks(roles, m, custom) {
  const by = Object.fromEntries(roles.map((r) => [r.name, r]));
  const pairs = [
    ...BASE_PAIRS,
    ...custom.flatMap(({ key: k, name }) => [
      [`${k}-text`, "bg", "text", `${name} text`],
      [`${k}-fg`, k, "text", `Label on solid ${name}`]
    ])
  ];
  return pairs.map(([fg, bg, level, why, advisory]) => {
    const ratio = m.score(by[fg].hex, by[bg].hex);
    const min = m.bar(level);
    return { fg, bg, ratio: Math.round(ratio * 100) / 100, min, pass: ratio >= min, advisory, why };
  });
}
function named(seeds) {
  const out = [];
  for (const hex of seeds)
    out.push({
      name: freshName(parseColor(hex), out.map((c) => c.name)),
      hex
    });
  return out;
}
function buildSystem(input) {
  const flat = input.curve ? { ...input.curve, hueShift: 0 } : undefined;
  const calm = Math.min(1, Math.max(0.6, input.primary.chroma / 0.15));
  const status = (name, chroma, solidL) => {
    const set = input.status?.[name] ? parseColor(input.status[name]) : null;
    return buildScale({
      hue: statusHue(name, input.primary.hue, input.primary.chroma, set?.h),
      chroma: set ? Math.min(0.3, Math.max(0.06, set.c)) : chroma * calm,
      solidL,
      curve: flat
    });
  };
  const neutral = buildNeutral(input.neutralHue ?? input.primary.hue, input.neutralTint, flat);
  const pages = { light: neutral.light[0].hex, dark: neutral.dark[0].hex };
  const dataIn = input.data ?? named(suggest(input.primary, 6, pages, input.curve));
  const colorsIn = input.colors ?? [];
  const keys = stripKeys([...colorsIn, ...dataIn]);
  const strip = (c, i) => ({
    name: c.name,
    hex: c.hex,
    key: keys[i]
  });
  const custom = colorsIn.map(strip);
  const data = dataIn.map((c, i) => strip(c, colorsIn.length + i));
  const scales = {
    primary: buildScale({ ...input.primary, curve: input.curve }),
    neutral,
    danger: status("danger", 0.2, 0.55),
    warning: status("warning", 0.16, 0.82),
    success: status("success", 0.15, 0.52),
    info: status("info", 0.15, 0.52)
  };
  for (const c of custom) {
    const seed = parseColor(c.hex);
    if (seed)
      scales[c.key] = buildScale({
        hue: seed.h,
        chroma: seed.c,
        solidL: Math.min(0.9, Math.max(0.35, seed.l)),
        curve: input.curve
      });
  }
  const strips = custom.filter((c) => scales[c.key]);
  for (const c of data) {
    const seed = parseColor(c.hex);
    scales[c.key] = buildScale({
      hue: seed.h,
      chroma: seed.c,
      solidL: Math.min(0.9, Math.max(0.35, seed.l)),
      curve: input.curve
    });
  }
  const m = meter(input.contrast ?? "aa");
  const adjustments = [];
  const labels = Object.fromEntries(Object.keys(scales).map((k) => [k, { light: "#ffffff", dark: "#ffffff" }]));
  const solid = Object.fromEntries(Object.keys(scales).map((k) => [k, { light: 9, dark: 9 }]));
  for (const mode of ["light", "dark"]) {
    const n = (s) => get(scales, "neutral", mode, s).hex;
    if (nudge(scales, "neutral", mode, 11, [n(1), n(2), n(3)], "text", m))
      adjustments.push(`neutral.11 (${mode}) adjusted so secondary text reaches ${said(m, "text")} on inputs.`);
    if (nudge(scales, "neutral", mode, 12, [n(1), n(2), n(3)], "strong", m))
      adjustments.push(`neutral.12 (${mode}) adjusted to reach ${said(m, "strong")}.`);
    for (const name of ["primary", ...Object.keys(STATUS_HUES), ...strips.map((c) => c.key)]) {
      const scale = scales[name];
      labels[name][mode] = solidLabel(scale, mode, m, name === "primary" ? input.primary.label ?? "auto" : "auto");
      const step = solidStep(scale, mode, labels[name][mode], m);
      solid[name] = { ...solid[name], [mode]: step };
      if (name === "primary" && step !== scale.anchor[mode])
        adjustments.push(`Brand color sits on step ${scale.anchor[mode]} (${mode}); buttons use step ${step} so their label reaches ${said(m, "text")}.`);
      const subtle = get(scales, name, mode, 3).hex;
      if (nudge(scales, name, mode, 11, [n(1), n(2), subtle], "text", m) && name === "primary")
        adjustments.push(`${name}.11 (${mode}) adjusted to reach ${said(m, "text")} as text.`);
      if (name === "primary" && m.score(get(scales, name, mode, step).hex, n(1)) < m.bar("ui"))
        adjustments.push(`primary.${step} (${mode}) is under ${said(m, "ui")} on bg; the focus ring uses primary.11 instead.`);
    }
  }
  const roles = {
    light: buildRoles(scales, "light", labels, solid, strips),
    dark: buildRoles(scales, "dark", labels, solid, strips)
  };
  for (const mode of ["light", "dark"]) {
    const ring = roles[mode].find((r) => r.name === "ring");
    if (m.score(ring.hex, roles[mode][0].hex) < m.bar("ui")) {
      const alt = get(scales, "primary", mode, 11);
      Object.assign(ring, { hex: alt.hex, css: alt.css, from: "primary.11" });
    }
  }
  const rec = recommend(input.stack);
  return {
    input,
    scales,
    custom: strips,
    solid,
    roles,
    checks: { light: runChecks(roles.light, m, strips), dark: runChecks(roles.dark, m, strips) },
    adjustments,
    type: buildType(input.type),
    space: buildSpace(input.density),
    shape: buildShape(input.roundness),
    shadows: {
      light: buildShadows(input.neutralHue ?? input.primary.hue, "light"),
      dark: buildShadows(input.neutralHue ?? input.primary.hue, "dark")
    },
    motion: buildMotion(input.motion),
    data,
    charts: {
      ...buildCharts(data.map((c) => c.key), scales, scales.neutral, {
        light: get(scales, "neutral", "light", 1).hex,
        dark: get(scales, "neutral", "dark", 1).hex
      }, input.ramps),
      other: {
        light: get(scales, "neutral", "light", 9).hex,
        dark: get(scales, "neutral", "dark", 9).hex
      }
    },
    stack: {
      components: input.stack.components ?? rec.components,
      icons: input.stack.icons ?? rec.icons,
      styling: input.stack.styling
    },
    stackReasons: rec.reasons
  };
}
function slug(name) {
  return name.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-") || "design-system";
}

// src/lib/spring/css-names.ts
var PACKED = "alicebluef0f8ff antiquewhitefaebd7 aqua00ffff aquamarine7fffd4 azuref0ffff beigef5f5dc bisqueffe4c4 black000000 blanchedalmondffebcd blue0000ff blueviolet8a2be2 browna52a2a burlywooddeb887 cadetblue5f9ea0 chartreuse7fff00 chocolated2691e coralff7f50 cornflowerblue6495ed cornsilkfff8dc crimsondc143c cyan00ffff darkblue00008b darkcyan008b8b darkgoldenrodb8860b darkgraya9a9a9 darkgreen006400 darkgreya9a9a9 darkkhakibdb76b darkmagenta8b008b darkolivegreen556b2f darkorangeff8c00 darkorchid9932cc darkred8b0000 darksalmone9967a darkseagreen8fbc8f darkslateblue483d8b darkslategray2f4f4f darkslategrey2f4f4f darkturquoise00ced1 darkviolet9400d3 deeppinkff1493 deepskyblue00bfff dimgray696969 dimgrey696969 dodgerblue1e90ff firebrickb22222 floralwhitefffaf0 forestgreen228b22 fuchsiaff00ff gainsborodcdcdc ghostwhitef8f8ff goldffd700 goldenroddaa520 gray808080 green008000 greenyellowadff2f grey808080 honeydewf0fff0 hotpinkff69b4 indianredcd5c5c indigo4b0082 ivoryfffff0 khakif0e68c lavendere6e6fa lavenderblushfff0f5 lawngreen7cfc00 lemonchiffonfffacd lightblueadd8e6 lightcoralf08080 lightcyane0ffff lightgoldenrodyellowfafad2 lightgrayd3d3d3 lightgreen90ee90 lightgreyd3d3d3 lightpinkffb6c1 lightsalmonffa07a lightseagreen20b2aa lightskyblue87cefa lightslategray778899 lightslategrey778899 lightsteelblueb0c4de lightyellowffffe0 lime00ff00 limegreen32cd32 linenfaf0e6 magentaff00ff maroon800000 mediumaquamarine66cdaa mediumblue0000cd mediumorchidba55d3 mediumpurple9370db mediumseagreen3cb371 mediumslateblue7b68ee mediumspringgreen00fa9a mediumturquoise48d1cc mediumvioletredc71585 midnightblue191970 mintcreamf5fffa mistyroseffe4e1 moccasinffe4b5 navajowhiteffdead navy000080 oldlacefdf5e6 olive808000 olivedrab6b8e23 orangeffa500 orangeredff4500 orchidda70d6 palegoldenrodeee8aa palegreen98fb98 paleturquoiseafeeee palevioletreddb7093 papayawhipffefd5 peachpuffffdab9 perucd853f pinkffc0cb plumdda0dd powderblueb0e0e6 purple800080 rebeccapurple663399 redff0000 rosybrownbc8f8f royalblue4169e1 saddlebrown8b4513 salmonfa8072 sandybrownf4a460 seagreen2e8b57 seashellfff5ee siennaa0522d silverc0c0c0 skyblue87ceeb slateblue6a5acd slategray708090 slategrey708090 snowfffafa springgreen00ff7f steelblue4682b4 tand2b48c teal008080 thistled8bfd8 tomatoff6347 turquoise40e0d0 violetee82ee wheatf5deb3 whiteffffff whitesmokef5f5f5 yellowffff00 yellowgreen9acd32";
var table;
function namedColor(name) {
  table ??= new Map(PACKED.split(" ").map((e) => [e.slice(0, -6), `#${e.slice(-6)}`]));
  return table.get(name.trim().toLowerCase());
}

// src/lib/spring/audit.ts
var toPx = (v) => {
  if (typeof v === "number")
    return v;
  if (v && typeof v === "object" && "value" in v) {
    const o = v;
    return o.unit === "rem" || o.unit === "em" ? o.value * 16 : o.value;
  }
  if (typeof v !== "string")
    return;
  const cl = v.match(/^clamp\((.+),\s*([^,]+)\)$/);
  if (cl)
    return toPx(cl[2].trim());
  const m = v.trim().match(/^(-?[\d.]+)(px|rem|em)?$/);
  if (!m)
    return;
  const n = Number(m[1]);
  return m[2] === "rem" || m[2] === "em" ? n * 16 : n;
};
var cssOf = (v) => {
  if (typeof v === "string") {
    const s = v.trim();
    const named = namedColor(s);
    if (named)
      return named;
    if (/^-?[\d.]+(deg)?\s+[\d.]+%\s+[\d.]+%(\s*\/\s*[\d.]+%?)?$/.test(s))
      return `hsl(${s})`;
    return s.toLowerCase() === "transparent" || parseColor(s) ? s : undefined;
  }
  if (v && typeof v === "object") {
    const o = v;
    const a = o.alpha !== undefined && o.alpha < 1 ? ` / ${o.alpha}` : "";
    if (o.colorSpace && o.components) {
      const [x, y, z] = o.components;
      if (o.colorSpace === "oklch")
        return `oklch(${x} ${y} ${z}${a})`;
      if (o.colorSpace === "srgb")
        return `rgb(${x * 255} ${y * 255} ${z * 255}${a})`;
    }
    if (o.hex)
      return cssOf(o.hex);
  }
  return;
};
var color = (name, v, dark) => {
  const css = cssOf(v);
  const c = css ? parseColor(css) : null;
  if (!css || !c)
    return;
  const d = dark === undefined ? undefined : cssOf(dark);
  return { name, hex: oklchToHex(c), css, dark: d };
};
function detect(text) {
  const t = text.trimStart();
  if (t.startsWith("{"))
    return "dtcg";
  if (/module\.exports|export\s+default|\btheme\s*:\s*\{/.test(t) && !/--[\w-]+\s*:/.test(t))
    return "tailwind";
  if (t.startsWith("---") || /^#\s/m.test(t))
    return "design.md";
  return "css";
}
var dims = (o) => Object.entries(o ?? {}).map(([name, v]) => ({ name, px: toPx(v) })).filter((d) => d.px !== undefined);
var isColor = (c) => !!c;
function parseDesignMd(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const y = m ? parseYaml(m[1]) : {};
  const colors = Object.entries(y.colors ?? {}).map(([name, v]) => color(name, v)).filter(isColor);
  const type = Object.entries(y.typography ?? {}).flatMap(([name, t]) => {
    const size = toPx(t?.fontSize);
    if (!size)
      return [];
    const lh = t.lineHeight;
    const lineHeight = typeof lh === "number" ? lh : toPx(lh) ? toPx(lh) / size : undefined;
    const tr = typeof t.letterSpacing === "string" ? t.letterSpacing.match(/^(-?[\d.]+)em$/) : null;
    const trPx = toPx(t.letterSpacing);
    return [
      {
        name,
        size,
        lineHeight,
        tracking: tr ? Number(tr[1]) : trPx !== undefined ? trPx / size : undefined,
        weight: t.fontWeight !== undefined ? Number(t.fontWeight) : undefined,
        family: typeof t.fontFamily === "string" ? t.fontFamily : undefined
      }
    ];
  });
  return {
    format: "design.md",
    name: typeof y.name === "string" ? y.name : undefined,
    colors,
    type,
    radii: dims(y.rounded),
    spacing: dims(y.spacing),
    hasDark: /dark/i.test(text.slice(m?.[0].length ?? 0))
  };
}
var TYPE_DIM = /(font|size|line|letter|tracking|leading|text)/i;
function parseDtcg(text) {
  let root;
  try {
    root = JSON.parse(text);
  } catch (e) {
    throw new Error(`Not valid JSON, so nothing was audited: ${e.message}`, {
      cause: e
    });
  }
  const out = {
    format: "dtcg",
    colors: [],
    type: [],
    radii: [],
    spacing: [],
    hasDark: false
  };
  const all = new Map;
  const deref = (v) => {
    for (let hop = 0;hop < 10 && typeof v === "string" && /^\{.+\}$/.test(v); hop++) {
      const next = all.get(v.slice(1, -1));
      if (next === undefined)
        break;
      v = next;
    }
    return v;
  };
  const walk = (node, path, inherited) => {
    if (!node || typeof node !== "object")
      return;
    const o = node;
    const type = o.$type ?? inherited;
    if ("$value" in o) {
      all.set(path.join("."), o.$value);
      const name = path.join("-");
      const v = deref(o.$value);
      const ext = o.$extensions?.mode;
      if (ext?.dark)
        out.hasDark = true;
      if (type === "color") {
        const c = color(name, v, ext?.dark === undefined ? undefined : deref(ext.dark));
        if (c)
          out.colors.push(c);
      } else if (type === "typography" && v && typeof v === "object") {
        const t = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deref(x)]));
        const size = toPx(t.fontSize);
        const lh = t.lineHeight;
        const ls = t.letterSpacing;
        if (size)
          out.type.push({
            name,
            size,
            lineHeight: typeof lh === "number" ? lh : toPx(lh) ? toPx(lh) / size : undefined,
            tracking: typeof ls === "object" && ls?.unit === "em" ? ls.value : typeof ls === "string" && ls.endsWith("em") ? parseFloat(ls) : undefined,
            weight: t.fontWeight !== undefined ? Number(t.fontWeight) : undefined,
            family: typeof t.fontFamily === "string" ? t.fontFamily : undefined
          });
      } else if (type === "dimension") {
        const px = toPx(v);
        if (px !== undefined && !TYPE_DIM.test(name))
          (/radius|round|corner/i.test(name) ? out.radii : out.spacing).push({ name, px });
      }
      return;
    }
    for (const [k, child] of Object.entries(o))
      if (!k.startsWith("$"))
        walk(child, [...path, k], type);
  };
  walk(root, []);
  out.colors = [];
  out.type = [];
  out.radii = [];
  out.spacing = [];
  walk(root, []);
  if (/"dark"/.test(text))
    out.hasDark = true;
  return out;
}
var DARK = /prefers-color-scheme:\s*dark|\.dark\b|\[data-(theme|mode|color-scheme)=["']?dark|theme-dark|dark-theme/i;
var OTHER = /prefers-contrast|forced-colors|\bprint\b/i;
function cssThemes(text) {
  const light = new Map;
  const dark = new Map;
  let schemeDark = false;
  const src = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const stack = [];
  let buf = "";
  const take = () => {
    const ctx = stack.join(" ");
    const m = buf.match(/^\s*--([\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m && !OTHER.test(ctx))
      (DARK.test(ctx) ? dark : light).set(m[1], m[2]);
    if (/^\s*color-scheme\s*:\s*dark\s*$/.test(buf) && !DARK.test(ctx))
      schemeDark = true;
    buf = "";
  };
  for (const ch of src) {
    if (ch === "{") {
      stack.push(buf.trim());
      buf = "";
    } else if (ch === "}") {
      take();
      stack.pop();
    } else if (ch === ";")
      take();
    else
      buf += ch;
  }
  take();
  return { light, dark, schemeDark };
}
function resolveVars(v, vars) {
  for (let i = 0;i < 8 && v.includes("var("); i++)
    v = v.replace(/var\(\s*--([\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (all, n, fb) => vars.has(n) ? vars.get(n) : fb !== undefined ? fb.trim() : all);
  return v.trim();
}
function parseCss2(text) {
  const { light, dark, schemeDark } = cssThemes(text);
  const darkOnly = schemeDark && !dark.size;
  const darkVars = new Map([...light, ...dark]);
  const out = {
    format: "css",
    colors: [],
    type: [],
    radii: [],
    spacing: [],
    hasDark: dark.size > 0 || darkOnly,
    darkOnly
  };
  const vars = new Map([...light].map(([k, v]) => [k, resolveVars(v, light)]));
  for (const [name, v] of vars) {
    if (/(radius|rounded)/i.test(name)) {
      const px = toPx(v);
      if (px !== undefined)
        out.radii.push({ name, px });
      continue;
    }
    if (/(space|spacing|gap|gutter)/i.test(name)) {
      const px = toPx(v);
      if (px !== undefined)
        out.spacing.push({ name, px });
      continue;
    }
    if (/(font-size|text-[\w-]+$|fs-)/i.test(name) && !/(line-height|letter-spacing|weight|color|leading|tracking)/i.test(name)) {
      const px = toPx(v);
      if (px !== undefined) {
        const key = name.replace(/^(text|font-size|fs)-/, "");
        const lh = vars.get(`${name}--line-height`) ?? vars.get(`${name}-line-height`) ?? vars.get(`leading-${key}`) ?? vars.get(`line-height-${key}`) ?? vars.get("leading") ?? vars.get("line-height");
        const tr = (vars.get(`${name}--letter-spacing`) ?? vars.get(`${name}-letter-spacing`) ?? vars.get(`tracking-${key}`))?.match(/^(-?[\d.]+)em$/);
        out.type.push({
          name,
          size: px,
          lineHeight: lh && !isNaN(Number(lh)) ? Number(lh) : undefined,
          tracking: tr ? Number(tr[1]) : undefined
        });
        continue;
      }
    }
    if (/(shadow|font|ease|duration|transition|z-|index)/i.test(name))
      continue;
    const c = color(name, v, dark.size ? resolveVars(darkVars.get(name) ?? v, darkVars) : undefined);
    if (c)
      out.colors.push(c);
  }
  return out;
}
function parseTailwind(text) {
  const src = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'])\/\/.*$/gm, "$1");
  const at = src.search(/\btheme\s*:\s*\{/);
  if (at < 0)
    throw new Error("No theme object found in this Tailwind config.");
  const start = src.indexOf("{", at);
  let depth = 0;
  let end = start;
  for (;end < src.length; end++) {
    if (src[end] === "{")
      depth++;
    else if (src[end] === "}" && --depth === 0)
      break;
  }
  const json = src.slice(start, end + 1).replace(/'([^'\\]*)'/g, (_, s) => JSON.stringify(s)).replace(/([{,]\s*)([\w$-]+)\s*:/g, '$1"$2":').replace(/,(\s*[}\]])/g, "$1");
  let theme;
  try {
    theme = JSON.parse(json);
  } catch (e) {
    throw new Error("This Tailwind theme uses code (functions or imports), so it can't be read.", {
      cause: e
    });
  }
  const t = { ...theme, ...theme.extend };
  const colors = [];
  const flat = (o, path) => {
    if (o && typeof o === "object")
      for (const [k, v] of Object.entries(o))
        flat(v, k === "DEFAULT" ? path : [...path, k]);
    else {
      const c = color(path.join("-"), o);
      if (c)
        colors.push(c);
    }
  };
  flat(t.colors, []);
  const type = Object.entries(t.fontSize ?? {}).flatMap(([name, v]) => {
    const [s, opts] = Array.isArray(v) ? v : [v];
    const size = toPx(s);
    if (!size)
      return [];
    const o = typeof opts === "object" ? opts : { lineHeight: opts };
    const lh = o.lineHeight;
    const n = typeof lh === "string" && /^[\d.]+$/.test(lh) ? Number(lh) : lh;
    const ls = typeof o.letterSpacing === "string" ? o.letterSpacing.match(/^(-?[\d.]+)em$/) : null;
    return [
      {
        name,
        size,
        lineHeight: typeof n === "number" ? n : toPx(n) ? toPx(n) / size : undefined,
        tracking: ls ? Number(ls[1]) : undefined,
        weight: o.fontWeight !== undefined ? Number(o.fontWeight) : undefined
      }
    ];
  });
  return {
    format: "tailwind",
    colors,
    type,
    radii: dims(t.borderRadius),
    spacing: dims(t.spacing),
    hasDark: false
  };
}
function parseSystem(text) {
  const f = detect(text);
  if (f === "dtcg")
    return parseDtcg(text);
  if (f === "tailwind")
    return parseTailwind(text);
  return f === "design.md" ? parseDesignMd(text) : parseCss2(text);
}
var TEXT = /(^|-)(text|foreground|fg|ink|content|link|placeholder|on-[\w-]+)(-|$)/i;
var NOT_PAGE_TEXT = /(^on-|-on-|inverse|disabled|white|black|^text-(xs|sm|base|lg|\d?xl))/i;
var SURFACE = /^(bg|background|surface|canvas|paper|page|panel|card|popover|sidebar)(-(subtle|raised|elevated|sunken|alt|alternate|secondary|tertiary|default|base|inset|\d))?$/i;
var NOT_SURFACE = /(-(fg|foreground|text|border|ring|hover|active|pressed)|inverse|overlay|scrim)$/i;
var RING = /(^|-)(ring|focus|focus-ring|outline)$/i;
var BRAND = /(primary|accent|brand)(?!.*(fg|foreground|text|on-))/i;
var bare = (n) => n.replace(/^(color-)?(role-|semantic-|sys-)?/i, "");
var isScaleStep = (n) => /-\d{1,3}$/.test(n);
var isOn = (n) => /^on-|-(fg|foreground)$/i.test(bare(n));
function byNames(items, names) {
  for (const n of names) {
    const hit = items.find((i) => bare(i.name).toLowerCase() === n);
    if (hit)
      return hit;
  }
  return;
}
function pickBg(p) {
  const exact = byNames(p.colors, ["bg", "background", "surface", "canvas", "page", "base"]);
  return exact ?? p.colors.find((c) => SURFACE.test(bare(c.name)) && !NOT_SURFACE.test(bare(c.name))) ?? p.colors.find((c) => (parseColor(c.hex)?.l ?? 0) > (p.darkOnly ? -1 : 0.95));
}
var shown = (r, min) => {
  const n = Math.round(r * 100) / 100;
  return (r < min && n >= min ? Math.floor(r * 100) / 100 : n).toFixed(2);
};
function checkColor(p, findings) {
  const bg = pickBg(p);
  if (!bg) {
    findings.push({
      id: "no-bg",
      area: "Color",
      status: "warn",
      title: "No background color found",
      detail: "Couldn't tell which color is the page background, so text contrast wasn't checked."
    });
    return dupesAndSprawl(p, findings);
  }
  const by = new Map(p.colors.map((c) => [bare(c.name), c]));
  const surfaces = p.colors.filter((c) => SURFACE.test(bare(c.name)) && !NOT_SURFACE.test(bare(c.name)));
  if (!surfaces.includes(bg))
    surfaces.unshift(bg);
  const modes = p.colors.some((c) => c.dark) ? ["light", "dark"] : ["light"];
  const failing = [];
  const rings = [];
  const pairs = [];
  const pair = (fg, on, min, into) => {
    for (const mode of modes) {
      const f = mode === "dark" ? fg.dark : fg.css;
      const b0 = mode === "dark" ? on.dark : on.css;
      if (!f || !b0)
        continue;
      const page = (mode === "dark" ? bg.dark : bg.css) ?? "#ffffff";
      const b = over(b0, page);
      const r = contrast(over(f, b), b);
      pairs.push(fg.name);
      if (r < min)
        into.push(`${fg.name} on ${on.name}${mode === "dark" ? " (dark)" : ""} ${shown(r, min)}:1`);
    }
  };
  for (const c of p.colors) {
    const b = bare(c.name);
    if (isScaleStep(c.name))
      continue;
    if (TEXT.test(b) && !isOn(c.name) && !NOT_PAGE_TEXT.test(b)) {
      for (const s of surfaces)
        if (s !== c)
          pair(c, s, 4.5, failing);
    }
    const m = b.match(/^on-(.+)$/) ?? b.match(/^(.+)-(?:fg|foreground)$/);
    const fill = m ? by.get(m[1]) : undefined;
    if (fill)
      pair(c, fill, 4.5, failing);
    const scoped = b.match(/^(.+)-(fg|text|muted|foreground)$/);
    const own = scoped ? by.get(`${scoped[1]}-bg`) : undefined;
    if (own && own !== fill)
      pair(c, own, 4.5, failing);
    if (RING.test(b)) {
      const scope = b.match(/^(.+)-(?:ring|focus|focus-ring|outline)$/)?.[1];
      const home = scope ? by.get(scope) : undefined;
      pair(c, home ?? bg, 3, rings);
    }
  }
  findings.push(failing.length ? {
    id: "contrast",
    area: "Color",
    status: "fail",
    title: failing.length > 1 ? `${failing.length} text pairs fail WCAG AA` : "1 text pair fails WCAG AA",
    detail: failing.slice(0, 8).join(", ") + (failing.length > 8 ? "…" : ""),
    fix: "Text steps are generated to pass 4.5:1 on every surface, in both themes."
  } : {
    id: "contrast",
    area: "Color",
    status: "pass",
    title: "Text pairs pass WCAG AA",
    detail: `${new Set(pairs).size} colors checked on ${surfaces.map((s) => s.name).join(", ")}${modes.length > 1 ? ", in light and dark" : ""}.`
  });
  if (rings.length)
    findings.push({
      id: "ring",
      area: "Color",
      status: "fail",
      title: "Focus ring under 3:1",
      detail: rings.slice(0, 6).join(", "),
      fix: "The ring uses a step that passes 3:1 on every surface."
    });
  dupesAndSprawl(p, findings);
}
var HUE_WORD = /(^|-)(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|grey|slate|zinc)(-|$)/i;
function dupesAndSprawl(p, findings) {
  const roles = p.colors.filter((c) => !isScaleStep(c.name) && !isOn(c.name));
  const dupes = [];
  const lab = roles.map((c) => {
    const o = parseColor(c.hex);
    const r = o.h * Math.PI / 180;
    return [o.l, o.c * Math.cos(r), o.c * Math.sin(r)];
  });
  for (let i = 0;i < roles.length; i++)
    for (let j = i + 1;j < roles.length; j++) {
      const [a, b] = [roles[i], roles[j]];
      const [x, y] = [lab[i], lab[j]];
      if (a.hex !== b.hex && Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < 0.005)
        dupes.push(`${a.name} ≈ ${b.name}`);
    }
  if (dupes.length)
    findings.push({
      id: "near-dupes",
      area: "Color",
      status: "warn",
      title: `${dupes.length} near-identical color${dupes.length > 1 ? "s" : ""}`,
      detail: `Indistinguishable side by side: ${dupes.slice(0, 6).join(", ")}. Each one is a choice an agent can get wrong.`,
      fix: "One scale per hue, with a fixed job per step."
    });
  const byValue = roles.filter((c) => HUE_WORD.test(bare(c.name)) && /[a-z]-[a-z]/i.test(bare(c.name)));
  if (byValue.length)
    findings.push({
      id: "value-names",
      area: "Color",
      status: "warn",
      title: "Roles named by their color",
      detail: `${byValue.map((c) => c.name).slice(0, 4).join(", ")}: a role says its job, not its hue, so a rebrand doesn't make the name lie.`,
      fix: "Every role is named for its job."
    });
  const uniq = new Set(roles.map((c) => c.hex)).size;
  if (uniq > 45)
    findings.push({
      id: "sprawl",
      area: "Color",
      status: "warn",
      title: `${uniq} distinct colors`,
      detail: "Large palettes are where agents pick the wrong one. Most products need about 20 roles.",
      fix: "About 30 roles over six 12-step scales."
    });
}
function checkType(p, findings) {
  if (!p.type.length) {
    findings.push({
      id: "no-type",
      area: "Type",
      status: "warn",
      title: "No type scale",
      detail: "No font sizes found. Agents will set sizes by hand.",
      fix: "Nine roles from display to caption, each with line height and tracking."
    });
    return;
  }
  const sizes = [...new Set(p.type.map((t) => Math.round(t.size)))].sort((a, b) => a - b);
  const tiny = p.type.filter((t) => t.size < 12);
  if (tiny.length)
    findings.push({
      id: "tiny",
      area: "Type",
      status: "fail",
      title: "Text under 12px",
      detail: tiny.map((t) => `${t.name} ${t.size}px`).join(", "),
      fix: "Nothing below 12px."
    });
  if (sizes.length >= 4) {
    const ratios = sizes.slice(1).map((s, i) => s / sizes[i]);
    const logs = ratios.slice(0, -1).map(Math.log);
    const mean = logs.reduce((a, b) => a + b, 0) / logs.length;
    const cv = Math.sqrt(logs.reduce((a, b) => a + (b - mean) ** 2, 0) / logs.length) / mean;
    const tooClose = ratios.filter((r) => r < 1.08).length;
    findings.push(cv > 0.45 || tooClose > 0 ? {
      id: "scale",
      area: "Type",
      status: "warn",
      title: "Sizes don't follow a scale",
      detail: `Steps between sizes range from ×${Math.min(...ratios).toFixed(2)} to ×${Math.max(...ratios).toFixed(2)}${tooClose ? `; ${tooClose === 1 ? "one pair is" : `${tooClose} pairs are`} too close to tell apart` : ""}. Sizes: ${sizes.join(", ")}px.`,
      fix: "One ratio, applied to roles."
    } : {
      id: "scale",
      area: "Type",
      status: "pass",
      title: "Sizes follow a consistent scale",
      detail: `About ×${Math.exp(mean).toFixed(2)} per step: ${sizes.join(", ")}px.`
    });
  }
  const noLh = p.type.filter((t) => t.lineHeight === undefined);
  if (noLh.length)
    findings.push({
      id: "no-lh",
      area: "Type",
      status: "warn",
      title: noLh.length > 1 ? `${noLh.length} sizes without a line height` : "1 size without a line height",
      detail: "Line height left to the browser default (about 1.2) is too tight for body text.",
      fix: "Line height per role, on a 4px grid."
    });
  const tight = p.type.filter((t) => t.size < 24 && t.lineHeight !== undefined && t.lineHeight < 1.35);
  if (tight.length)
    findings.push({
      id: "tight",
      area: "Type",
      status: "warn",
      title: "Text line height too tight",
      detail: tight.map((t) => `${t.name} ${t.size}px at ${Math.round(t.lineHeight * 100) / 100}`).join(", ") + ". Text that wraps needs about 1.4 or more.",
      fix: "Line height per role, on a 4px grid."
    });
  const thin = p.type.filter((t) => t.size < 24 && t.weight !== undefined && t.weight < 400);
  if (thin.length)
    findings.push({
      id: "thin",
      area: "Type",
      status: "warn",
      title: "Light weight at small size",
      detail: `${thin.map((t) => `${t.name} ${t.size}px at ${t.weight}`).join(", ")}. Under 400, small text loses its strokes on low-density screens.`,
      fix: "400 or heavier below display sizes."
    });
  const loose = p.type.filter((t) => t.size >= 28 && (t.lineHeight ?? 0) > 1.35);
  if (loose.length)
    findings.push({
      id: "loose-headings",
      area: "Type",
      status: "warn",
      title: "Headings use body line height",
      detail: loose.map((t) => `${t.name} ${t.size}px at ${t.lineHeight}`).join(", ") + ". Large text needs 1.1–1.25.",
      fix: "Line height falls as size grows."
    });
  const flat = p.type.filter((t) => t.size >= 28 && !t.tracking);
  if (flat.length)
    findings.push({
      id: "tracking",
      area: "Type",
      status: "warn",
      title: "Large text has default tracking",
      detail: `${flat.map((t) => t.name).join(", ")}: big sizes look loose without negative tracking.`,
      fix: "Tracking tightens with size (Inter's dynamic metrics)."
    });
  const body = pickBody(p);
  const fam = body?.family?.split(",")[0]?.replace(/["']/g, "").trim();
  if (body && fam && FONT_NAMES.includes(fam)) {
    const ob = opticalBase(fam);
    const looks = Math.round(body.size * 16 / ob * 2) / 2;
    if (looks < 13.5 || looks > 17.5)
      findings.push({
        id: "optical",
        area: "Type",
        status: "warn",
        title: `${fam} at ${body.size}px reads ${looks < 14 ? "small" : "large"}`,
        detail: `Its x-height is ${ob > 16 ? "short" : "tall"}: at ${body.size}px it looks like Inter at ${looks}px. ${ob}px matches Inter at 16px.`,
        fix: "Body size suggested from the font's x-height."
      });
  }
}
function checkShapeSpace(p, findings) {
  const radii = [...new Set(p.radii.map((r) => r.px).filter((r) => r < 999))];
  if (radii.length > 6)
    findings.push({
      id: "radii",
      area: "Shape",
      status: "warn",
      title: `${radii.length} different radii`,
      detail: `${radii.sort((a, b) => a - b).join(", ")}px. More than five makes nesting inconsistent.`,
      fix: "Five radii from one roundness dial."
    });
  const off = p.spacing.filter((s) => s.px > 1 && s.px % 2 !== 0);
  if (off.length)
    findings.push({
      id: "grid",
      area: "Space",
      status: "warn",
      title: off.length > 1 ? `${off.length} spacing values off the grid` : "1 spacing value off the grid",
      detail: off.slice(0, 6).map((s) => `${s.name} ${s.px}px`).join(", "),
      fix: "Everything on a 4px grid."
    });
  if (!p.spacing.length)
    findings.push({
      id: "no-space",
      area: "Space",
      status: "warn",
      title: "No spacing scale",
      detail: "Agents will invent padding and gaps.",
      fix: "A 4px scale plus control heights."
    });
}
function checkCoverage(p, findings) {
  const names = p.colors.map((c) => c.name).join(" ");
  const missing = [];
  if (!/(ring|focus|outline)/i.test(names))
    missing.push("focus ring");
  if (!/(error|danger|destructive|critical)/i.test(names))
    missing.push("error");
  if (!/(muted|faint|variant|secondary-text|subtle-text|text-2|tertiary|text-(light|soft|secondary|subtle))/i.test(names))
    missing.push("muted text");
  if (!/(border|stroke|outline|divider|line)/i.test(names))
    missing.push("border");
  if (missing.length)
    findings.push({
      id: "roles",
      area: "Coverage",
      status: "warn",
      title: `Missing roles: ${missing.join(", ")}`,
      detail: "When a role is missing, agents improvise one, and each improvises differently.",
      fix: "Every role a product needs, named for its job."
    });
  if (!p.hasDark)
    findings.push({
      id: "dark",
      area: "Coverage",
      status: "warn",
      title: "No dark theme",
      detail: "Agents asked for dark mode will invert colors, which breaks contrast and saturation.",
      fix: "Dark scales generated for dark backgrounds."
    });
}
function pickBody(p) {
  return byNames(p.type, [
    "body",
    "body-md",
    "text-body",
    "text-base",
    "base",
    "paragraph",
    "body-medium",
    "text-md"
  ]) ?? p.type.find((t) => /body|paragraph/i.test(t.name) && t.size >= 14 && t.size <= 18) ?? p.type.find((t) => t.size >= 14 && t.size <= 18);
}
function inferInput(p) {
  const brand = byNames(p.colors, [
    "primary",
    "brand",
    "accent",
    "accent-9",
    "primary-9",
    "brand-9",
    "primary-500",
    "brand-500"
  ]) ?? p.colors.find((c) => BRAND.test(c.name) && !isScaleStep(c.name) && !isOn(c.name)) ?? [...p.colors].sort((a, b) => (parseColor(b.hex)?.c ?? 0) - (parseColor(a.hex)?.c ?? 0))[0];
  const bc = brand ? parseColor(brand.hex) : null;
  const text = byNames(p.colors, [
    "text",
    "foreground",
    "on-surface",
    "on-background",
    "ink",
    "text-primary"
  ]);
  const ink = text ? parseColor(text.hex) : null;
  const famOf = (t) => {
    const f = t?.family?.split(",")[0]?.replace(/["']/g, "").trim();
    return f && FONT_NAMES.includes(f) ? f : undefined;
  };
  const sorted = [...p.type].sort((a, b) => a.size - b.size);
  const body = pickBody(p);
  const largest = sorted[sorted.length - 1];
  const base = body ? Math.round(body.size) : 16;
  const h1 = p.type.find((t) => /h1|headline-lg|title-lg|heading-1/i.test(t.name)) ?? largest;
  const ratio = h1 && h1.size > base ? Math.min(1.5, Math.max(1.125, (h1.size / base) ** (1 / 4))) : 1.25;
  const radii = p.radii.map((r) => r.px).filter((r) => r > 0 && r < 999).sort((a, b) => a - b);
  const mid = byNames(p.radii, ["md", "radius-md", "default", "base", "radius"])?.px ?? radii[Math.floor(radii.length / 2)];
  const heading = famOf(p.type.find((t) => /h\d|head|display|title/i.test(t.name)));
  const bodyFont = famOf(body);
  return {
    ...DEFAULT_INPUT,
    name: p.name ?? "Audited system",
    primary: bc ? {
      hue: Math.round(bc.h || 0),
      chroma: Math.max(0.02, Math.min(0.3, bc.c)),
      solidL: Math.min(0.9, Math.max(0.3, bc.l))
    } : DEFAULT_INPUT.primary,
    neutralTint: ink ? Math.round(Math.min(1, Math.max(0, (ink.c / 0.5 - 0.004) / 0.026)) * 100) / 100 : DEFAULT_INPUT.neutralTint,
    type: {
      ...DEFAULT_INPUT.type,
      body: bodyFont ?? DEFAULT_INPUT.type.body,
      heading: heading ?? bodyFont ?? DEFAULT_INPUT.type.heading,
      base: Math.min(18, Math.max(14, base)),
      ratio: Math.round(ratio * 1000) / 1000
    },
    roundness: mid !== undefined ? Math.min(1, mid / 16) : DEFAULT_INPUT.roundness
  };
}
function audit(text) {
  const parsed = parseSystem(text);
  if (!parsed.colors.length && !parsed.type.length && !parsed.spacing.length)
    throw new Error("Found no colors, sizes or spacing. Paste DESIGN.md, tokens.json, CSS variables or a Tailwind config.");
  const findings = [];
  checkColor(parsed, findings);
  checkType(parsed, findings);
  checkShapeSpace(parsed, findings);
  checkCoverage(parsed, findings);
  const fails = findings.filter((f) => f.status === "fail").length;
  const warns = findings.filter((f) => f.status === "warn").length;
  const score = Math.max(0, 100 - fails * 20 - warns * 7);
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
  const order = { fail: 0, warn: 1, pass: 2 };
  findings.sort((a, b) => order[a.status] - order[b.status]);
  return { parsed, findings, score, grade, input: inferInput(parsed) };
}

// src/lib/spring/exports.ts
var SCALES = ["primary", "neutral", "danger", "warning", "success", "info"];
var scaleNames = (sys) => [
  ...SCALES,
  ...sys.custom.map((c) => c.key),
  ...new Set([sys.charts.seq, ...sys.charts.div ?? []].filter((k) => !!k))
];
var px = (n) => `${n}px`;
var Z = {
  base: 0,
  raised: 10,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1300,
  modal: 1400,
  toast: 1500,
  tooltip: 1600
};
var OPACITY = { disabled: 0.5, muted: 0.7, scrim: 0.6 };
var BREAKPOINT = { sm: 640, md: 768, lg: 1024, xl: 1280 };
var ICON = { sm: 16, md: 20, lg: 24 };
var FOCUS = { width: 2, offset: 2 };
function colorVars(sys, mode, indent = "  ") {
  const lines = [];
  for (const name of scaleNames(sys))
    for (const s of sys.scales[name][mode])
      lines.push(`${indent}--${name}-${s.step}: ${s.css};`);
  for (const r of sys.roles[mode]) {
    const ref = r.from.match(/^(\w+)\.(\d+)$/);
    lines.push(`${indent}--color-${r.name}: ${ref ? `var(--${ref[1]}-${ref[2]})` : r.css};`);
  }
  for (const [name, hex] of chartVars(sys, mode))
    lines.push(`${indent}--${name}: ${hex};`);
  lines.push(`${indent}--chart-gap: var(--color-bg);`);
  for (const k of ["sm", "md", "lg"])
    lines.push(`${indent}--shadow-${k}: ${sys.shadows[mode][k]};`);
  return lines.join(`
`);
}
function chartsDoc(sys) {
  const c = sys.charts;
  const n = c.keys.length;
  if (!n)
    return "No data colors are set; add some before drawing charts.";
  const names = sys.data.map((d, i) => `\`--chart-${i + 1}\` (${d.name})`).join(", ");
  const ramps = [
    c.seq ? `\`--chart-seq-1\` … \`--chart-seq-${c.sequential.light.length}\` are for amounts, light to strong, from ${c.seq}` : "",
    c.div ? `\`--chart-div-1\` … \`--chart-div-${c.diverging.light.length}\` are for values above and below a midpoint (\`--chart-div-${Math.ceil(c.diverging.light.length / 2)}\`), from ${c.div[0]} to ${c.div[1]}` : ""
  ].filter(Boolean);
  return `Data uses its own colors, never the UI roles. ${names} are series colors in a fixed order: use them in order and keep a series' color when filtering. Each is the mark step of a 12-step scale on the same curve as the UI, and every one reaches 3:1 on the page. Past ${n} series, group the rest as \`--chart-other\`.${ramps.length ? ` ${ramps.join("; ")}.` : ""} Separate touching bars and pie slices with a 1–2px \`--chart-gap\`. Label series directly where you can, so color is never the only cue.`;
}
function chartVars(sys, mode) {
  const c = sys.charts;
  return [
    ...c.marks[mode].map((h, i) => [`chart-${i + 1}`, h]),
    ...c.sequential[mode].map((h, i) => [`chart-seq-${i + 1}`, h]),
    ...c.diverging[mode].map((h, i) => [`chart-div-${i + 1}`, h]),
    ["chart-other", c.other[mode]]
  ];
}
function fontVars(sys, indent, fonts) {
  const f = sys.input.type;
  return [
    `${indent}--font-body: ${fonts?.body ?? fontStack(f.body, f.extra)};`,
    `${indent}--font-heading: ${fonts?.heading ?? fontStack(f.heading, f.extra)};`,
    `${indent}--font-mono: ${fonts?.mono ?? fontStack(f.mono, f.extra)};`
  ];
}
function typeVars(sys, indent) {
  return sys.type.tokens.flatMap((tok) => [
    `${indent}--text-${tok.role}: ${tok.size};`,
    `${indent}--text-${tok.role}--line-height: ${tok.lineHeight};`,
    `${indent}--text-${tok.role}--letter-spacing: ${tok.tracking}em;`,
    `${indent}--text-${tok.role}--font-weight: ${tok.weight};`
  ]);
}
function spaceVars(sys, indent) {
  const out = Object.entries(sys.space.scale).map(([k, v]) => `${indent}--space-${k.replace(".", "-")}: ${px(v)};`);
  out.push(`${indent}--control-sm: ${px(sys.space.control.sm)};`, `${indent}--control-md: ${px(sys.space.control.md)};`, `${indent}--control-lg: ${px(sys.space.control.lg)};`, `${indent}--pad-sm: ${px(sys.space.paddingX.sm)};`, `${indent}--pad-md: ${px(sys.space.paddingX.md)};`, `${indent}--pad-lg: ${px(sys.space.paddingX.lg)};`, `${indent}--gutter: ${px(sys.space.gutter)};`, `${indent}--section: ${px(sys.space.section)};`, `${indent}--measure: ${sys.space.measure};`, "");
  for (const [k, v] of Object.entries(sys.shape.radius))
    out.push(`${indent}--radius-${k}: ${px(v)};`);
  out.push(`${indent}--border-width: ${px(sys.shape.border.default)};`, `${indent}--border-width-strong: ${px(sys.shape.border.strong)};`, `${indent}--focus-width: ${px(FOCUS.width)};`, `${indent}--focus-offset: ${px(FOCUS.offset)};`, "", ...Object.entries(ICON).map(([k, v]) => `${indent}--icon-${k}: ${px(v)};`), ...Object.entries(Z).map(([k, v]) => `${indent}--z-${k}: ${v};`), ...Object.entries(OPACITY).map(([k, v]) => `${indent}--opacity-${k}: ${v};`), `${indent}/* Breakpoints, for reference: custom properties can't be used inside @media. */`, ...Object.entries(BREAKPOINT).map(([k, v]) => `${indent}--breakpoint-${k}: ${px(v)};`));
  return out;
}
function motionVars(sys, indent) {
  const m = sys.motion;
  return [
    ...Object.entries(m.duration).map(([k, v]) => `${indent}--duration-${k}: ${v}ms;`),
    `${indent}--ease-out: ${m.easing.out};`,
    `${indent}--ease-in-out: ${m.easing.inOut};`,
    `${indent}--ease-spring: ${m.easing.spring};`
  ];
}
function staticVars(sys, indent = "  ", fonts) {
  return [
    ...fontVars(sys, indent, fonts),
    ...typeVars(sys, indent),
    "",
    ...spaceVars(sys, indent),
    "",
    ...motionVars(sys, indent)
  ];
}
var REDUCED_MOTION = [
  "@media (prefers-reduced-motion: reduce) {",
  "  :root {",
  "    --duration-fast: 0ms;",
  "    --duration-base: 0ms;",
  "    --duration-slow: 0ms;",
  "    --duration-spring: 0ms;",
  "    --ease-spring: linear;",
  "  }",
  "}"
];
function toCss(sys) {
  const t = sys.type;
  const fonts = sys.input.type;
  const out = [
    `/* ${sys.input.name} design tokens. Generated by Spring. Import once at the root. */`,
    `/* Fonts: ${googleFontsUrl([fonts.body, fonts.heading, fonts.mono], fonts.extra)} */`,
    "",
    ...new Set([t.fallbacks.body.css, t.fallbacks.heading.css, t.fallbacks.mono.css].filter(Boolean)),
    "",
    ":root {",
    "  color-scheme: light;",
    colorVars(sys, "light"),
    "",
    ...staticVars(sys),
    "}",
    "",
    `:root[data-theme="dark"] {`,
    "  color-scheme: dark;",
    colorVars(sys, "dark"),
    "}",
    "",
    "@media (prefers-color-scheme: dark) {",
    `  :root:not([data-theme="light"]) {`,
    "    color-scheme: dark;",
    colorVars(sys, "dark", "    "),
    "  }",
    "}",
    "",
    ...REDUCED_MOTION,
    ""
  ];
  return out.join(`
`);
}
function toTailwind(sys) {
  const lines = [
    `/* ${sys.input.name} for Tailwind CSS v4. Generated by Spring. */`,
    `@import "tailwindcss";`,
    `@import "./tokens.css";`,
    "",
    "/* Dark mode follows data-theme, and the OS when it isn't set. */",
    `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));`,
    "",
    "/* inline: utilities read the variables at use time, so dark mode switches. */",
    "@theme inline {",
    "  --color-*: initial;",
    "  --color-white: #fff;",
    "  --color-black: #000;",
    "  --color-transparent: transparent;",
    "  --color-current: currentColor;"
  ];
  for (const r of sys.roles.light)
    lines.push(`  --color-${r.name}: var(--color-${r.name});`);
  for (const name of scaleNames(sys))
    for (const s of STEPS)
      lines.push(`  --color-${name}-${s}: var(--${name}-${s});`);
  for (const [name] of chartVars(sys, "light"))
    lines.push(`  --color-${name}: var(--${name});`);
  lines.push("", "  --font-*: initial;", "  --font-sans: var(--font-body);", "  --font-heading: var(--font-heading);", "  --font-mono: var(--font-mono);", "", "  --text-*: initial;");
  for (const t of sys.type.tokens) {
    lines.push(`  --text-${t.role}: var(--text-${t.role});`, `  --text-${t.role}--line-height: var(--text-${t.role}--line-height);`, `  --text-${t.role}--letter-spacing: var(--text-${t.role}--letter-spacing);`, `  --text-${t.role}--font-weight: var(--text-${t.role}--font-weight);`);
  }
  lines.push("", "  --spacing: 4px;", "", "  --radius-*: initial;");
  for (const k of Object.keys(sys.shape.radius))
    lines.push(`  --radius-${k}: var(--radius-${k});`);
  lines.push("", "  --shadow-*: initial;");
  for (const k of ["sm", "md", "lg"])
    lines.push(`  --shadow-${k}: var(--shadow-${k});`);
  lines.push("", "  --ease-*: initial;", "  --ease-out: var(--ease-out);", "  --ease-in-out: var(--ease-in-out);", "  --ease-spring: var(--ease-spring);", "}");
  if (sys.stack.components === "shadcn") {
    lines.push("", "/* shadcn/ui variable names, mapped to the system. Note: shadcn's 'accent' is a hover fill, not the brand color. */", ':root, :root[data-theme="dark"] {', "  --background: var(--color-bg);", "  --foreground: var(--color-text);", "  --card: var(--color-bg-subtle);", "  --card-foreground: var(--color-text);", "  --popover: var(--color-bg);", "  --popover-foreground: var(--color-text);", "  --primary: var(--color-primary);", "  --primary-foreground: var(--color-primary-fg);", "  --secondary: var(--color-fill);", "  --secondary-foreground: var(--color-text);", "  --muted: var(--color-fill);", "  --muted-foreground: var(--color-text-muted);", "  --accent: var(--color-fill-hover);", "  --accent-foreground: var(--color-text);", "  --destructive: var(--color-danger);", "  --border: var(--color-border-subtle);", "  --input: var(--color-border);", "  --ring: var(--color-ring);", `  --radius: ${px(sys.shape.radius.md)};`, "}", "", "@theme inline {", ...[
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "input"
    ].map((n) => `  --color-${n}: var(--${n});`), "}");
  }
  return lines.join(`
`) + `
`;
}
var dtcgColor = (s) => ({
  colorSpace: "oklch",
  components: [round4(s.oklch.l), round4(s.oklch.c), round4(s.oklch.h, 2)],
  hex: s.hex
});
var round4 = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d;
var dim = (n) => ({ value: n, unit: "px" });
var cubic2 = (s) => s.match(/[\d.]+/g).map(Number);
function toDtcg(sys) {
  const scale = {};
  for (const name of scaleNames(sys)) {
    const group = {};
    sys.scales[name].light.forEach((s, i) => {
      const d = sys.scales[name].dark[i];
      group[String(s.step)] = {
        $value: dtcgColor(s),
        $description: STEP_JOBS[s.step],
        $extensions: { mode: { light: dtcgColor(s), dark: dtcgColor(d) } }
      };
    });
    scale[name] = group;
  }
  const role = {};
  for (const r of sys.roles.light) {
    const dark = sys.roles.dark.find((d) => d.name === r.name);
    const ref = r.from.match(/^(\w+)\.(\d+)$/);
    if (ref && dark.from === r.from)
      role[r.name] = { $value: `{color.scale.${ref[1]}.${ref[2]}}`, $description: r.job };
    else {
      const lit = (hex, css) => ({
        colorSpace: "srgb",
        components: hexToRgb2(hex),
        hex,
        ...css !== hex ? {} : {}
      });
      role[r.name] = {
        $value: lit(r.hex, r.css),
        $description: r.job,
        $extensions: { mode: { light: lit(r.hex, r.css), dark: lit(dark.hex, dark.css) } }
      };
    }
  }
  const chart = {};
  const dark = new Map(chartVars(sys, "dark"));
  for (const [name, hex] of chartVars(sys, "light")) {
    const lit = (h) => ({ colorSpace: "srgb", components: hexToRgb2(h), hex: h });
    chart[name.replace(/^chart-/, "")] = {
      $value: lit(hex),
      $extensions: { mode: { light: lit(hex), dark: lit(dark.get(name)) } }
    };
  }
  const typography = {};
  for (const t of sys.type.tokens) {
    typography[t.role] = {
      $type: "typography",
      $description: ROLE_JOBS[t.role],
      $value: {
        fontFamily: `{font.${t.role === "code" ? "mono" : ["display", "h1", "h2", "h3"].includes(t.role) ? "heading" : "body"}}`,
        fontSize: dim(t.max),
        fontWeight: t.weight,
        lineHeight: t.lineHeight,
        letterSpacing: { value: t.tracking, unit: "em" }
      }
    };
  }
  const shadow = (k) => ({
    $type: "shadow",
    $value: sys.shadows.light.layers[k].map((l) => ({
      color: {
        colorSpace: "oklch",
        components: [l.color.l, l.color.c, l.color.h],
        alpha: l.color.alpha
      },
      offsetX: dim(l.x),
      offsetY: dim(l.y),
      blur: dim(l.blur),
      spread: dim(l.spread)
    }))
  });
  return {
    $description: `${sys.input.name} design tokens. Generated by Spring. Colors carry light and dark values in $extensions.mode.`,
    color: { $type: "color", scale, role, chart },
    font: {
      $type: "fontFamily",
      body: { $value: [sys.input.type.body, `${sys.input.type.body} Fallback`, "sans-serif"] },
      heading: {
        $value: [sys.input.type.heading, `${sys.input.type.heading} Fallback`, "sans-serif"]
      },
      mono: { $value: [sys.input.type.mono, `${sys.input.type.mono} Fallback`, "monospace"] }
    },
    typography,
    space: {
      $type: "dimension",
      ...Object.fromEntries(Object.entries(sys.space.scale).map(([k, v]) => [k.replace(".", "-"), { $value: dim(v) }])),
      control: {
        sm: { $value: dim(sys.space.control.sm) },
        md: { $value: dim(sys.space.control.md) },
        lg: { $value: dim(sys.space.control.lg) }
      },
      gutter: { $value: dim(sys.space.gutter) },
      section: { $value: dim(sys.space.section) }
    },
    radius: {
      $type: "dimension",
      ...Object.fromEntries(Object.entries(sys.shape.radius).map(([k, v]) => [k, { $value: dim(v) }]))
    },
    shadow: { sm: shadow("sm"), md: shadow("md"), lg: shadow("lg") },
    border: {
      $type: "dimension",
      default: { $value: dim(sys.shape.border.default) },
      strong: { $value: dim(sys.shape.border.strong) }
    },
    focus: {
      $type: "dimension",
      width: { $value: dim(FOCUS.width) },
      offset: { $value: dim(FOCUS.offset) }
    },
    icon: {
      $type: "dimension",
      ...Object.fromEntries(Object.entries(ICON).map(([k, v]) => [k, { $value: dim(v) }]))
    },
    breakpoint: {
      $type: "dimension",
      ...Object.fromEntries(Object.entries(BREAKPOINT).map(([k, v]) => [k, { $value: dim(v) }]))
    },
    z: {
      $type: "number",
      ...Object.fromEntries(Object.entries(Z).map(([k, v]) => [k, { $value: v }]))
    },
    opacity: {
      $type: "number",
      ...Object.fromEntries(Object.entries(OPACITY).map(([k, v]) => [k, { $value: v }]))
    },
    duration: {
      $type: "duration",
      ...Object.fromEntries(Object.entries(sys.motion.duration).map(([k, v]) => [
        k,
        { $value: { value: v, unit: "ms" } }
      ]))
    },
    easing: {
      $type: "cubicBezier",
      out: { $value: cubic2(sys.motion.easing.out) },
      "in-out": { $value: cubic2(sys.motion.easing.inOut) }
    }
  };
}
function hexToRgb2(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => round4(parseInt(h.slice(i, i + 2), 16) / 255));
}
function toDesignMd(sys) {
  const l = Object.fromEntries(sys.roles.light.map((r) => [r.name, r]));
  const d = Object.fromEntries(sys.roles.dark.map((r) => [r.name, r]));
  const T = Object.fromEntries(sys.type.tokens.map((t) => [t.role, t]));
  const comp = COMPONENTS[sys.stack.components];
  const icon = ICONS[sys.stack.icons];
  const stroke = iconStroke(T.body.weight);
  const tokenNames = {
    primary: "primary",
    "on-primary": "primary-fg",
    "primary-hover": "primary-hover",
    "primary-subtle": "primary-subtle",
    "primary-text": "primary-text",
    neutral: "bg",
    surface: "bg-subtle",
    fill: "fill",
    "fill-hover": "fill-hover",
    "on-surface": "text",
    "on-surface-muted": "text-muted",
    border: "border",
    "border-subtle": "border-subtle",
    ring: "ring",
    error: "danger",
    "on-error": "danger-fg",
    "error-text": "danger-text",
    warning: "warning",
    "on-warning": "warning-fg",
    success: "success",
    "on-success": "success-fg",
    info: "info",
    "on-info": "info-fg"
  };
  const colors = Object.fromEntries(Object.entries(tokenNames).map(([k, role]) => [k, l[role].hex]));
  const typography = Object.fromEntries(sys.type.tokens.map((t) => [
    t.role === "body" ? "body-md" : t.role === "display" ? "headline-display" : t.role,
    {
      fontFamily: t.family,
      fontSize: px(t.max),
      fontWeight: t.weight,
      lineHeight: t.lineHeight,
      letterSpacing: `${t.tracking}em`
    }
  ]));
  const rounded = Object.fromEntries(Object.entries(sys.shape.radius).map(([k, v]) => [k, px(v)]));
  const spacing = {
    base: px(sys.space.unit),
    xs: px(4),
    sm: px(8),
    md: px(16),
    lg: px(24),
    xl: px(48),
    gutter: px(sys.space.gutter),
    section: px(sys.space.section)
  };
  const components = {
    "button-primary": {
      backgroundColor: "{colors.primary}",
      textColor: "{colors.on-primary}",
      typography: "{typography.label}",
      rounded: "{rounded.md}",
      height: px(sys.space.control.md),
      padding: px(sys.space.paddingX.md)
    },
    "button-primary-hover": { backgroundColor: "{colors.primary-hover}" },
    "button-secondary": {
      backgroundColor: "{colors.fill}",
      textColor: "{colors.on-surface}",
      typography: "{typography.label}",
      rounded: "{rounded.md}",
      height: px(sys.space.control.md),
      padding: px(sys.space.paddingX.md)
    },
    "button-secondary-hover": { backgroundColor: "{colors.fill-hover}" },
    input: {
      backgroundColor: "{colors.neutral}",
      textColor: "{colors.on-surface}",
      typography: "{typography.body-md}",
      rounded: "{rounded.md}",
      height: px(sys.space.control.md),
      padding: px(sys.space.paddingX.md)
    },
    card: {
      backgroundColor: "{colors.surface}",
      textColor: "{colors.on-surface}",
      rounded: "{rounded.lg}",
      padding: px(sys.space.gutter)
    },
    badge: {
      backgroundColor: "{colors.primary-subtle}",
      textColor: "{colors.primary-text}",
      typography: "{typography.caption}",
      rounded: "{rounded.full}"
    },
    "input-border": { backgroundColor: "{colors.border}", height: "1px" },
    divider: { backgroundColor: "{colors.border-subtle}", height: "1px" },
    "focus-ring": { backgroundColor: "{colors.ring}", width: "2px" },
    "helper-text": { textColor: "{colors.on-surface-muted}", typography: "{typography.caption}" },
    "error-message": { textColor: "{colors.error-text}", typography: "{typography.caption}" },
    "button-danger": {
      backgroundColor: "{colors.error}",
      textColor: "{colors.on-error}",
      typography: "{typography.label}",
      rounded: "{rounded.md}",
      height: px(sys.space.control.md)
    },
    "badge-success": {
      backgroundColor: "{colors.success}",
      textColor: "{colors.on-success}",
      rounded: "{rounded.full}"
    },
    "badge-warning": {
      backgroundColor: "{colors.warning}",
      textColor: "{colors.on-warning}",
      rounded: "{rounded.full}"
    },
    "badge-info": {
      backgroundColor: "{colors.info}",
      textColor: "{colors.on-info}",
      rounded: "{rounded.full}"
    }
  };
  const front = stringifyYaml({
    version: "alpha",
    name: sys.input.name,
    description: `${sys.input.name} design system. Generated by Spring; light-mode values below, dark values in the Colors section and tokens.css.`,
    colors,
    typography,
    rounded,
    spacing,
    components
  }, { lineWidth: 0 });
  const isRound = sys.shape.radius.md >= 10 ? "soft and friendly" : sys.shape.radius.md <= 2 ? "sharp and precise" : "lightly rounded";
  const dens = sys.input.density < 0.34 ? "compact" : sys.input.density < 0.67 ? "balanced" : "spacious";
  const mot = sys.input.motion < 0.34 ? "calm" : sys.input.motion < 0.67 ? "responsive" : "lively";
  const row = (name, job) => `| \`${name}\` | ${l[name].hex} | ${d[name].hex} | ${job} |`;
  const body = `# ${sys.input.name}

## Overview

${sys.input.name} is a ${dens}, ${isRound} interface with ${mot} motion. One primary color carries every primary action; everything else is neutral. Light and dark themes are equal citizens: dark values are generated for dark backgrounds, not inverted.

Source files: \`tokens.css\` (all values, both themes), \`tokens.json\` (DTCG), ${sys.stack.styling === "tailwind" ? "`theme.css` (Tailwind v4)" : "no framework layer"}. When a value isn't in these files, it isn't in the system: ask, don't invent.

## Colors

The primary is **${l.primary.hex}** (light) / **${d.primary.hex}** (dark). Neutrals are tinted toward the primary hue so surfaces and brand feel related. Every text pair below passes ${CONTRAST_LABEL[sys.input.contrast ?? "aa"]} in both themes.

| Role | Light | Dark | Use for |
|---|---|---|---|
${sys.roles.light.map((r) => row(r.name, r.job)).join(`
`)}

Each color is also a 12-step scale (\`--primary-1\` … \`--primary-12\`). Steps run one way along a lightness curve and have jobs: 1–2 backgrounds, 3–5 component fills (rest, hover, pressed), 6–8 borders, 11–12 text. The brand color sits on step ${sys.scales.primary.anchor.light} and solid buttons use step ${sys.solid.primary.light} (light) / ${sys.solid.primary.dark} (dark); use the \`primary\` role rather than the step. \`palette.js\` regenerates every scale from the seed and curve.

### Charts

${chartsDoc(sys)}

## Typography

Headings use **${sys.input.type.heading}**, text uses **${sys.input.type.body}**, code uses **${sys.input.type.mono}**. The scale ratio is ${sys.input.type.ratio}${sys.input.type.fluid ? `, fluid between ${360}px and ${1280}px viewports (headings shrink on phones; body text never does)` : ""}. Line heights sit on a 4px grid (2px below 20px), and tracking tightens as size grows.

| Role | Size | Line height | Tracking | Weight | Use for |
|---|---|---|---|---|---|
${sys.type.tokens.map((t) => `| \`${t.role}\` | ${t.min === t.max ? `${t.max}px` : `${t.min}–${t.max}px`} | ${t.lineHeightPx}px | ${t.tracking}em | ${t.weight} | ${ROLE_JOBS[t.role]} |`).join(`
`)}

Keep running text under ${sys.space.measure} wide. Use only these roles; don't set font sizes by hand.

## Layout

Spacing is a 4px grid: use \`--space-*\` steps only (4, 8, 12, 16, 24, 32, 48…). Controls are ${sys.space.control.md}px tall (${sys.space.control.sm}px small, ${sys.space.control.lg}px large). Gutter ${sys.space.gutter}px, section spacing ${sys.space.section}px. Breakpoints: ${Object.entries(sys.space.breakpoints).map(([k, v]) => `${k} ${v}px`).join(", ")}.

## Elevation & Depth

Hierarchy comes from tonal surfaces first (\`bg\` → \`bg-subtle\` → \`fill\`), borders second, shadows last. Shadows are tinted with the neutral hue: \`--shadow-sm\` for raised controls, \`--shadow-md\` for popovers and menus, \`--shadow-lg\` for dialogs. In dark mode, rely on lighter surfaces and borders; shadows are barely visible.

## Shapes

Corners are ${isRound}: ${Object.entries(sys.shape.radius).filter(([k]) => k !== "full" && k !== "none").map(([k, v]) => `${k} ${v}px`).join(", ")}, full for pills. Controls use \`md\`, cards \`lg\`, dialogs \`xl\`. **Nested corners:** inner radius = outer radius − padding, never the same radius inside and out.

## Components

Built with **${comp.name}** (${comp.url}). Icons: **${icon.name}** only${icon.strokeAware ? `, ${stroke}px stroke to match ${T.body.weight} weight text` : ""}, sized to the text they sit beside (16px with body, 20px with h3). Styling: **${STYLING[sys.stack.styling].name}**.

- **Primary button:** \`primary\` fill, \`primary-fg\` label, one per view.
- **Secondary button:** \`fill\` with \`text\`; hover \`fill-hover\`, pressed \`fill-active\`.
- **Input:** \`bg\` fill, \`border\` edge, \`border-strong\` on hover, \`ring\` on focus (2px, offset 2px); placeholder \`text-muted\`; error \`danger\` border with \`danger-text\` message.
- **Card:** \`bg-subtle\`, \`border-subtle\` edge, \`lg\` radius, ${sys.space.gutter}px padding.
- **Badge:** \`primary-subtle\` with \`primary-text\`; status badges use \`<status>-subtle\` with \`<status>-text\`.

## Motion

Durations: ${Object.entries(sys.motion.duration).filter(([k]) => k !== "instant").map(([k, v]) => `${k} ${v}ms`).join(", ")}. Enter with \`--ease-out\`, move on screen with \`--ease-in-out\`, use \`--ease-spring\` with \`--duration-spring\` for things the user drags or toggles. Animate only transform and opacity. Under \`prefers-reduced-motion\`, durations drop to 0.

## Do's and Don'ts

- Do use one \`primary\` action per view; everything else is secondary.
- Do use roles (\`text\`, \`bg-subtle\`, \`border\`) in components, and raw scale steps only for one-off illustration.
- Don't put \`text-muted\` on \`primary\`, or body text on any solid fill.
- Don't add colors, sizes, radii or shadows that aren't tokens. If one is missing, flag it.
- Don't mix icon sets. ${icon.name} only.
- Don't use the same radius on nested elements.
- Do check both themes before calling a screen done.
`;
  return `---
${front}---

${body}`;
}
function toSkill(sys) {
  const name = `${slug(sys.input.name)}-design-system`;
  const icon = ICONS[sys.stack.icons];
  const comp = COMPONENTS[sys.stack.components];
  return `---
name: ${name}
description: Applies the ${sys.input.name} design system to any UI work in this project (components, pages, styling, colors, type, spacing, icons, motion). Use whenever writing or reviewing UI code here.
---

# ${sys.input.name} design system

The system lives in \`DESIGN.md\` (rules and rationale) and \`tokens.css\` (every value). Read DESIGN.md before writing UI. These rules are not optional.

## Hard rules

1. **Tokens only.** Every color, font size, line height, spacing, radius, shadow, duration and easing comes from a token. No hex codes, no arbitrary px, no Tailwind arbitrary values like \`p-[13px]\`. If a value is missing, say so and stop; don't invent one.
2. **Roles before steps.** Use role tokens (\`bg\`, \`text\`, \`text-muted\`, \`fill\`, \`border\`, \`primary\`, \`primary-fg\`…). Raw scale steps (\`primary-3\`) only for their documented step job.
3. **One primary action per view** uses \`primary\`. Everything else is secondary (\`fill\`) or ghost.
4. **Type roles only:** display, h1, h2, h3, body-lg, body, label, caption, code. Never set font-size by hand.
5. **Icons: ${icon.name} only.**${icon.strokeAware ? ` Stroke ${iconStroke(sys.type.tokens.find((t) => t.role === "body").weight)}px.` : ""} Never import a second icon library.
6. **Components: ${comp.name}.** Extend it; don't add another component library.
7. **Nested radius:** inner = outer − padding.
8. **Both themes.** Never hardcode light-only colors; roles switch automatically with \`data-theme\`.
9. **Motion:** transform and opacity only, durations from tokens, respect reduced motion.

## Before you finish

- Search your diff for \`#\`, \`rgb(\`, \`px\` outside token files and arbitrary values. Replace each with a token.
- Check every new text color against its background in DESIGN.md's Colors table.
- Confirm no new dependency for icons or components was added.
`;
}
function toAgentsSnippet(sys) {
  return `## Design system

UI follows **${sys.input.name}**: read \`DESIGN.md\` before writing UI, and use only tokens from \`tokens.css\`. Icons: ${ICONS[sys.stack.icons].name} only. Components: ${COMPONENTS[sys.stack.components].name}. Never add colors, sizes or radii that aren't tokens.
`;
}
function exportAll(sys) {
  const files = [
    { path: "DESIGN.md", label: "DESIGN.md", content: toDesignMd(sys) },
    { path: "tokens.css", label: "CSS variables", content: toCss(sys) },
    {
      path: "tokens.json",
      label: "DTCG tokens",
      content: JSON.stringify(toDtcg(sys), null, 2) + `
`
    }
  ];
  if (sys.stack.styling === "tailwind")
    files.push({ path: "theme.css", label: "Tailwind v4 theme", content: toTailwind(sys) });
  files.push({
    path: `skills/${slug(sys.input.name)}-design-system/SKILL.md`,
    label: "Agent skill",
    content: toSkill(sys)
  }, { path: "AGENTS.md", label: "AGENTS.md snippet", content: toAgentsSnippet(sys) }, { path: "palette.js", label: "Headless palette", content: toPaletteJs(sys) });
  return files;
}
function toPaletteJs(sys) {
  const i = sys.input;
  const curve = i.curve ?? DEFAULT_CURVE;
  const bends = new Set(["primary", ...sys.custom.map((c) => c.key)]);
  const scales = Object.fromEntries(scaleNames(sys).map((k) => [k, { ...sys.scales[k].seed, bend: bends.has(k) }]));
  return `// ${i.name} palette, generated by Spring (someshks.com/spring).
// Headless: change a seed or the curve and call scale() to rebuild. No dependencies.
// Note: the system's contrast fixes (nudged text steps) are applied on top in tokens.css.

export const curve = ${JSON.stringify(curve)};
export const ends = ${JSON.stringify(ENDS)};
export const seeds = ${JSON.stringify(scales, null, 2)};

const cubic = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
export function ease([x1, y1, x2, y2], x) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (cubic(x1, x2, mid) < x) lo = mid; else hi = mid;
  }
  return cubic(y1, y2, (lo + hi) / 2);
}

function toLinear({ l, c, h }) {
  const r = (h * Math.PI) / 180, a = c * Math.cos(r), b = c * Math.sin(r);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}
const inGamut = (c) => toLinear(c).every((v) => v >= -1e-4 && v <= 1 + 1e-4);
function fit(c) {
  if (inGamut(c)) return c;
  let lo = 0, hi = c.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut({ ...c, c: mid })) lo = mid; else hi = mid;
  }
  return { ...c, c: lo };
}
const gamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
export function hex(c) {
  return "#" + toLinear(fit(c)).map((v) => Math.round(Math.min(1, Math.max(0, gamma(v))) * 255).toString(16).padStart(2, "0")).join("");
}

/** 12 steps, page to text, bent through the seed's lightness. mode: "light" | "dark". */
export function scale({ hue, chroma, l: target, bend = true }, mode = "light", c = curve) {
  const [from, to] = ends[mode];
  const e = Array.from({ length: 12 }, (_, i) => ease(c.bezier, i / 11));
  const raw = e.map((y) => from + (to - from) * y);
  let k = 3;
  for (let s = 3; s <= 10; s++) if (Math.abs(raw[s - 1] - target) < Math.abs(raw[k - 1] - target)) k = s;
  const ek = e[k - 1];
  const lb = Math.min(Math.max(target, Math.min(from, to) + 0.02), Math.max(from, to) - 0.02);
  const tk = (k - 1) / 11;
  return e.map((y, i) => {
    const t = i / 11;
    const l = i < k - 1 ? from + (lb - from) * (ek ? y / ek : 0) : lb + (to - lb) * (ek < 1 ? (y - ek) / (1 - ek) : 0);
    const w = t < tk ? Math.max(tk, 0.35) : 0.55;
    const share = Math.max(t > tk ? 0.4 : 0.05, 1 - ((t - tk) / w) ** 2);
    return hex({ l, c: chroma * share * (mode === "dark" ? (c.darkChroma ?? 1) : 1), h: (((hue + (bend ? c.hueShift : 0) * (t - tk)) % 360) + 360) % 360 });
  });
}
`;
}

// src/lib/spring/state.ts
var b64url = {
  encode: (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
  decode: (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)))
};
var r3 = (n) => Math.round(n * 1000) / 1000;
var r42 = (n) => Math.round(n * 1e4) / 1e4;
function encodeInput(input) {
  const i = input;
  const compact = [
    i.v,
    i.name,
    [
      Math.round(i.primary.hue * 10) / 10,
      r42(i.primary.chroma),
      i.primary.solidL === undefined ? null : r42(i.primary.solidL),
      i.primary.label ?? "auto"
    ],
    i.neutralHue === undefined ? r3(i.neutralTint) : [r3(i.neutralTint), Math.round(i.neutralHue)],
    [
      i.type.body,
      i.type.heading,
      i.type.mono,
      i.type.base,
      r3(i.type.ratio),
      i.type.headingWeight,
      i.type.fluid ? 1 : 0,
      ...i.type.extra ? [Object.entries(i.type.extra).map(([n, m]) => [n, m.tag, m.weights, m.variable ?? 0])] : []
    ],
    r3(i.density),
    r3(i.roundness),
    r3(i.motion),
    [
      i.stack.building,
      i.stack.ownership,
      i.stack.styling,
      i.stack.components ?? null,
      i.stack.icons ?? null
    ],
    i.curve ? [
      ...i.curve.bezier.map(r3),
      Math.round(i.curve.hueShift),
      ...i.curve.darkChroma === undefined ? [] : [r3(i.curve.darkChroma)]
    ] : null,
    i.status ? STATUSES.map((n) => i.status?.[n] ?? null) : null,
    i.contrast ?? null,
    i.colors?.length ? i.colors.map((c) => [c.name, c.hex]) : null,
    null,
    i.data ? i.data.map((c) => [c.name, c.hex]) : null,
    i.ramps ? [i.ramps.seq ?? null, i.ramps.div ?? null] : null
  ];
  while (compact.length > 9 && compact.at(-1) === null)
    compact.pop();
  return b64url.encode(JSON.stringify(compact));
}
var index = (v, len) => typeof v === "number" && Number.isInteger(v) && v >= 0 && v < len ? v : undefined;
var ramps = ([seq, div], len) => {
  const at = (x) => index(x, len);
  const a = Array.isArray(div) ? [at(div[0]), at(div[1])] : [];
  return {
    seq: at(seq),
    div: a[0] !== undefined && a[1] !== undefined ? [a[0], a[1]] : undefined
  };
};
var isStrip = (c) => Array.isArray(c) && typeof c[0] === "string" && isHex(c[1]);
var strips = (v, max) => v.length <= max && v.every(isStrip) ? v.map(([name, hex]) => ({ name: name.slice(0, 24), hex })) : undefined;
var pick = (v, from) => typeof v === "string" && Object.hasOwn(from, v) ? v : undefined;
var STATUSES = Object.keys(STATUS_RANGE);
var isHex = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
var num2 = (v, lo, hi, d) => typeof v === "number" && v >= lo && v <= hi ? v : d;
var oneOf = (v, opts, d) => opts.includes(v) ? v : d;
var TAGS = ["sans", "serif", "display", "mono", "hand"];
var weight = (w) => typeof w === "number" && Number.isInteger(w) && w >= 1 && w <= 1000;
function decodeExtra(v) {
  if (!Array.isArray(v))
    return;
  const out = {};
  for (const row of v.slice(0, 3)) {
    if (!Array.isArray(row))
      continue;
    const [n, tag, ws, vr] = row;
    if (typeof n !== "string" || !SAFE_FONT.test(n))
      continue;
    if (!Array.isArray(ws) || !ws.length || ws.length > 18 || !ws.every(weight))
      continue;
    const variable = Array.isArray(vr) && vr.length === 2 && vr.every(weight) && vr[0] < vr[1] ? [vr[0], vr[1]] : null;
    out[n] = { tag: oneOf(tag, TAGS, "sans"), weights: ws, variable };
  }
  return Object.keys(out).length ? out : undefined;
}
function decodeInput(s) {
  if (!s)
    return null;
  try {
    const a = JSON.parse(b64url.decode(s));
    if (!Array.isArray(a) || a[0] !== 1)
      return null;
    const D = DEFAULT_INPUT;
    const [acc, t, st] = [a[2], a[4], a[8]];
    const extra = decodeExtra(t?.[7]);
    const fonts = [...FONT_NAMES, ...Object.keys(extra ?? {})];
    const colors = Array.isArray(a[12]) ? strips(a[12], MAX_STRIPS) : undefined;
    const data = Array.isArray(a[14]) ? strips(a[14], CHART_MAX) : undefined;
    return {
      v: 1,
      name: typeof a[1] === "string" ? a[1].slice(0, 60) : D.name,
      primary: {
        hue: num2(acc?.[0], 0, 360, D.primary.hue),
        chroma: num2(acc?.[1], 0, 0.4, D.primary.chroma),
        solidL: typeof acc?.[2] === "number" ? num2(acc[2], 0.2, 0.95, 0.55) : undefined,
        label: oneOf(acc?.[3], ["auto", "white", "ink"], "auto")
      },
      neutralTint: num2(Array.isArray(a[3]) ? a[3][0] : a[3], 0, 1, D.neutralTint),
      neutralHue: Array.isArray(a[3]) ? num2(a[3][1], 0, 360, 0) : undefined,
      type: {
        body: oneOf(t?.[0], fonts, D.type.body),
        heading: oneOf(t?.[1], fonts, D.type.heading),
        mono: oneOf(t?.[2], fonts, D.type.mono),
        base: num2(t?.[3], 12, 22, D.type.base),
        ratio: num2(t?.[4], 1.05, 1.7, D.type.ratio),
        headingWeight: num2(t?.[5], 100, 900, D.type.headingWeight),
        fluid: t?.[6] !== 0,
        ...extra ? { extra } : {}
      },
      density: num2(a[5], 0, 1, D.density),
      roundness: num2(a[6], 0, 1, D.roundness),
      motion: num2(a[7], 0, 1, D.motion),
      stack: {
        building: oneOf(st?.[0], ["site", "app", "dashboard"], D.stack.building),
        ownership: oneOf(st?.[1], ["own", "package"], D.stack.ownership),
        styling: oneOf(st?.[2], ["tailwind", "css"], D.stack.styling),
        components: pick(st?.[3], COMPONENTS),
        icons: pick(st?.[4], ICONS)
      },
      ...Array.isArray(a[9]) && (a[9].length === 5 || a[9].length === 6) ? {
        curve: {
          bezier: [
            num2(a[9][0], 0, 1, 0.4),
            num2(a[9][1], -0.5, 1.5, 0.08),
            num2(a[9][2], 0, 1, 0.9),
            num2(a[9][3], -0.5, 1.5, 0.6)
          ],
          hueShift: num2(a[9][4], -60, 60, 0),
          ...typeof a[9][5] === "number" ? { darkChroma: num2(a[9][5], 0.4, 1.2, 1) } : {}
        }
      } : {},
      ...Array.isArray(a[10]) ? {
        status: Object.fromEntries(STATUSES.flatMap((n, k) => {
          const v = a[10][k];
          return isHex(v) ? [[n, v]] : [];
        }))
      } : {},
      ...a[11] === "aaa" || a[11] === "apca" ? { contrast: a[11] } : {},
      ...colors ? { colors } : {},
      ...data ? { data } : {},
      ...Array.isArray(a[15]) && (data || !Array.isArray(a[14])) ? { ramps: ramps(a[15], data?.length ?? CHART_MAX) } : {}
    };
  } catch {
    return null;
  }
}

// src/lib/spring/io.ts
var SCHEMA_URL = "https://someshks.com/spring/schema.json";
var SPRING_URL = "https://someshks.com/spring";
var isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
function withDefaults(raw) {
  const out = { ...DEFAULT_INPUT, ...raw, v: 1 };
  for (const k of ["primary", "type", "stack"])
    out[k] = { ...DEFAULT_INPUT[k], ...isObj(raw[k]) ? raw[k] : {} };
  return out;
}
function leaves(v, path = "", out = new Map) {
  if (isObj(v))
    for (const [k, x] of Object.entries(v))
      leaves(x, path ? `${path}.${k}` : k, out);
  else if (v !== undefined)
    out.set(path, JSON.stringify(v));
  return out;
}
function readInput(json) {
  if (!isObj(json))
    throw new Error("spring.json must be a JSON object.");
  const raw = { ...json };
  delete raw.$schema;
  const notes = [];
  if (typeof raw.primary === "string") {
    const seed = inputFromSeed(namedColor(raw.primary.trim()) ?? raw.primary);
    if (seed === DEFAULT_INPUT || seed.primary === DEFAULT_INPUT.primary)
      notes.push(`primary: couldn't read "${raw.primary}" as a color; used the default.`);
    raw.primary = seed.primary;
  }
  const known = new Set(Object.keys(DEFAULT_INPUT).concat(KNOWN_OPTIONAL));
  for (const k of Object.keys(raw))
    if (!known.has(k))
      notes.push(`${k}: not a Spring field; ignored.`);
  for (const k of ["primary", "type", "stack", "curve", "status"])
    if (k in raw && !isObj(raw[k])) {
      notes.push(`${k}: should be an object; used the default.`);
      delete raw[k];
    }
  const merged = withDefaults(raw);
  clamp(merged, notes);
  let input = null;
  try {
    input = decodeInput(encodeInput(merged));
  } catch {
    input = null;
  }
  if (!input)
    throw new Error("spring.json has a field of the wrong type. See " + SCHEMA_URL);
  const before = leaves(merged);
  const after = leaves(input);
  for (const [p, v] of before) {
    if (!known.has(p.split(".")[0]))
      continue;
    const now = after.get(p);
    if (now === undefined)
      notes.push(`${p}: ${v} isn't allowed; dropped.`);
    else if (now !== v)
      notes.push(`${p}: ${v} isn't allowed; used ${now}.`);
  }
  return { input, notes };
}
var RANGES = [
  ["primary.hue", 0, 360],
  ["primary.chroma", 0, 0.4],
  ["primary.solidL", 0.2, 0.95],
  ["neutralTint", 0, 1],
  ["neutralHue", 0, 360],
  ["type.base", 12, 22],
  ["type.ratio", 1.05, 1.7],
  ["type.headingWeight", 100, 900],
  ["density", 0, 1],
  ["roundness", 0, 1],
  ["motion", 0, 1],
  ["curve.hueShift", -60, 60],
  ["curve.darkChroma", 0.4, 1.2]
];
function clamp(o, notes) {
  for (const [path, lo, hi] of RANGES) {
    const keys = path.split(".");
    const parent = keys.length === 2 ? o[keys[0]] : o;
    const k = keys.at(-1);
    if (!isObj(parent) || !(k in parent) || parent[k] === undefined)
      continue;
    const v = parent[k];
    if (typeof v !== "number" || !Number.isFinite(v)) {
      notes.push(`${path}: ${JSON.stringify(v) ?? String(v)} isn't a number; used the default.`);
      delete parent[k];
    } else if (k.endsWith("ue") && (v < lo || v > hi)) {
      const w = Math.round((v % 360 + 360) % 360 * 10) / 10;
      notes.push(`${path}: ${v} wraps to ${w}.`);
      parent[k] = w;
    } else if (v < lo || v > hi) {
      const c = Math.min(hi, Math.max(lo, v));
      notes.push(`${path}: ${v} is outside ${lo}–${hi}; used ${c}.`);
      parent[k] = c;
    }
  }
}
var KNOWN_OPTIONAL = ["neutralHue", "curve", "status", "colors", "contrast", "data", "ramps"];
function writeInput(input) {
  return JSON.stringify({ $schema: SCHEMA_URL, ...input }, null, 2) + `
`;
}
function linkFor(input, base = SPRING_URL) {
  return `${base}?s=${encodeInput(input)}`;
}

// public/spring/google-fonts.json
var google_fonts_default = [["Roboto", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Open Sans", "s", [300, 400, 500, 600, 700, 800], [300, 800], 1], ["Google Sans", "s", [400, 500, 600, 700], [400, 700], 1], ["Inter", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Montserrat", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Poppins", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Lato", "s", [100, 300, 400, 700, 900], 0, 1], ["Noto Sans JP", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Arimo", "s", [400, 500, 600, 700], [400, 700], 1], ["Roboto Condensed", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Roboto Mono", "m", [100, 200, 300, 400, 500, 600, 700], [100, 700], 1], ["Oswald", "s", [200, 300, 400, 500, 600, 700], [200, 700], 0], ["DM Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [100, 1000], 1], ["Playfair Display", "r", [400, 500, 600, 700, 800, 900], [400, 900], 1], ["Noto Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Raleway", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Nunito Sans", "s", [200, 300, 400, 500, 600, 700, 800, 900, 1000], [200, 1000], 1], ["Nunito", "s", [200, 300, 400, 500, 600, 700, 800, 900, 1000], [200, 1000], 1], ["Rubik", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["Roboto Slab", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Manrope", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Outfit", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Plus Jakarta Sans", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 1], ["Kanit", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Figtree", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["Merriweather", "r", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["Archivo Black", "s", [400], 0, 0], ["Ubuntu", "s", [300, 400, 500, 700], 0, 1], ["Lora", "r", [400, 500, 600, 700], [400, 700], 1], ["Noto Sans KR", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Work Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Bebas Neue", "s", [400], 0, 0], ["JetBrains Mono", "m", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 1], ["Archivo", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Prompt", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Barlow", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Black Ops One", "d", [400], 0, 0], ["Saira", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Jost", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Mulish", "s", [200, 300, 400, 500, 600, 700, 800, 900, 1000], [200, 1000], 1], ["Noto Sans TC", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["IBM Plex Sans", "s", [100, 200, 300, 400, 500, 600, 700], [100, 700], 1], ["PT Sans", "s", [400, 700], 0, 1], ["Share Tech", "s", [400], 0, 0], ["Smooch Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Quicksand", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["Source Code Pro", "m", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Cormorant Garamond", "r", [300, 400, 500, 600, 700], [300, 700], 1], ["Space Grotesk", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["Bricolage Grotesque", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Source Sans 3", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Karla", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 1], ["Barlow Condensed", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Titillium Web", "s", [200, 300, 400, 600, 700, 900], 0, 1], ["Instrument Serif", "r", [400], 0, 1], ["Fira Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Anton", "s", [400], 0, 0], ["Fraunces", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Heebo", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Libre Baskerville", "r", [400, 500, 600, 700], [400, 700], 1], ["Noto Serif", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["IBM Plex Mono", "m", [100, 200, 300, 400, 500, 600, 700], 0, 1], ["Changa One", "d", [400], 0, 1], ["PT Serif", "r", [400, 700], 0, 1], ["Inter Tight", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["EB Garamond", "r", [400, 500, 600, 700, 800], [400, 800], 1], ["Noto Sans SC", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Libre Franklin", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Cairo", "s", [200, 300, 400, 500, 600, 700, 800, 900, 1000], [200, 1000], 0], ["Google Sans Flex", "s", [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [1, 1000], 0], ["Sora", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Assistant", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Josefin Sans", "s", [100, 200, 300, 400, 500, 600, 700], [100, 700], 1], ["Inconsolata", "m", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Public Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Noto Serif JP", "r", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Dancing Script", "h", [400, 500, 600, 700], [400, 700], 0], ["Roboto Serif", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Geist", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Quantico", "s", [400, 700], 0, 1], ["Fjalla One", "s", [400], 0, 0], ["Schibsted Grotesk", "s", [400, 500, 600, 700, 800, 900], [400, 900], 1], ["Caveat", "h", [400, 500, 600, 700], [400, 700], 0], ["Hind Siliguri", "s", [300, 400, 500, 600, 700], 0, 0], ["Alfa Slab One", "d", [400], 0, 0], ["Lexend", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Instrument Sans", "s", [400, 500, 600, 700], [400, 700], 1], ["Lobster Two", "d", [400, 700], 0, 1], ["Newsreader", "r", [200, 300, 400, 500, 600, 700, 800], [200, 800], 1], ["Merriweather Sans", "s", [300, 400, 500, 600, 700, 800], [300, 800], 1], ["Source Serif 4", "r", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Bitter", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Roboto Flex", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [100, 1000], 0], ["Urbanist", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["DM Serif Display", "r", [400], 0, 1], ["Dosis", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Cabin", "s", [400, 500, 600, 700], [400, 700], 1], ["Fredoka", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["M PLUS Rounded 1c", "s", [100, 300, 400, 500, 700, 800, 900], 0, 0], ["Nanum Gothic", "s", [400, 700, 800], 0, 0], ["Noto Sans Khmer", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Mukta", "s", [200, 300, 400, 500, 600, 700, 800], 0, 0], ["Cinzel", "r", [400, 500, 600, 700, 800, 900], [400, 900], 0], ["Exo 2", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Zeyada", "h", [400], 0, 0], ["Rajdhani", "s", [300, 400, 500, 600, 700], 0, 0], ["Geist Mono", "m", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Red Hat Display", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["Bodoni Moda", "r", [400, 500, 600, 700, 800, 900], [400, 900], 1], ["Slabo 27px", "r", [400], 0, 0], ["Tajawal", "s", [200, 300, 400, 500, 700, 800, 900], 0, 0], ["Barlow Semi Condensed", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Pacifico", "h", [400], 0, 0], ["Faustina", "r", [300, 400, 500, 600, 700, 800], [300, 800], 1], ["Oxygen", "s", [300, 400, 700], 0, 0], ["Noto Sans Telugu", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Hind", "s", [300, 400, 500, 600, 700], 0, 0], ["Ramabhadra", "s", [400], 0, 0], ["Anek Telugu", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Orbitron", "s", [400, 500, 600, 700, 800, 900], [400, 900], 0], ["Hanken Grotesk", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Epilogue", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Crimson Text", "r", [400, 600, 700], 0, 1], ["Noto Sans Arabic", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["M PLUS 1p", "s", [100, 300, 400, 500, 700, 800, 900], 0, 0], ["Lobster", "d", [400], 0, 0], ["Overpass", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Arvo", "r", [400, 700], 0, 1], ["DM Mono", "m", [300, 400, 500], 0, 1], ["Baloo 2", "d", [400, 500, 600, 700, 800], [400, 800], 0], ["Teko", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["Saira Condensed", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 0], ["Noto Sans Thai", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Comfortaa", "d", [300, 400, 500, 600, 700], [300, 700], 0], ["Bungee", "d", [400], 0, 0], ["PT Sans Narrow", "s", [400, 700], 0, 0], ["Chakra Petch", "s", [300, 400, 500, 600, 700], 0, 1], ["Shadows Into Light", "h", [400], 0, 0], ["Space Mono", "m", [400, 700], 0, 1], ["Zen Kaku Gothic New", "s", [300, 400, 500, 700, 900], 0, 0], ["Unbounded", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Abel", "s", [400], 0, 0], ["Asap", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Maven Pro", "s", [400, 500, 600, 700, 800, 900], [400, 900], 0], ["Albert Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Almarai", "s", [300, 400, 700, 800], 0, 0], ["Lilita One", "d", [400], 0, 0], ["Domine", "r", [400, 500, 600, 700], [400, 700], 0], ["Archivo Narrow", "s", [400, 500, 600, 700], [400, 700], 1], ["Be Vietnam Pro", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Questrial", "s", [400], 0, 0], ["Onest", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Cormorant", "r", [300, 400, 500, 600, 700], [300, 700], 1], ["Marcellus", "r", [400], 0, 0], ["League Spartan", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["IBM Plex Sans Arabic", "s", [100, 200, 300, 400, 500, 600, 700], 0, 0], ["Zilla Slab", "r", [300, 400, 500, 600, 700], 0, 1], ["Spectral", "r", [200, 300, 400, 500, 600, 700, 800], 0, 1], ["Great Vibes", "h", [400], 0, 0], ["Geologica", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Abril Fatface", "d", [400], 0, 0], ["Play", "s", [400, 700], 0, 0], ["Frank Ruhl Libre", "r", [300, 400, 500, 600, 700, 800, 900], [300, 900], 0], ["ABeeZee", "s", [400], 0, 1], ["Syne", "s", [400, 500, 600, 700, 800], [400, 800], 0], ["Noto Serif SC", "r", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Sofia Sans", "s", [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [1, 1000], 1], ["Lexend Deca", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Varela Round", "s", [400], 0, 0], ["Exo", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Satisfy", "h", [400], 0, 0], ["Nanum Myeongjo", "r", [400, 700, 800], 0, 0], ["Permanent Marker", "h", [400], 0, 0], ["Press Start 2P", "d", [400], 0, 0], ["Gravitas One", "d", [400], 0, 0], ["Noto Serif KR", "r", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Noto Serif TC", "r", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Alegreya Sans", "s", [100, 300, 400, 500, 700, 800, 900], 0, 1], ["Amiri", "r", [400, 700], 0, 1], ["IBM Plex Serif", "r", [100, 200, 300, 400, 500, 600, 700], 0, 1], ["Zen Maru Gothic", "s", [300, 400, 500, 700, 900], 0, 0], ["News Cycle", "s", [400, 700], 0, 0], ["Montserrat Alternates", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Noto Kufi Arabic", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Red Hat Text", "s", [300, 400, 500, 600, 700], [300, 700], 1], ["Noto Sans Tamil", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Kalam", "h", [300, 400, 700], 0, 0], ["Courier Prime", "m", [400, 700], 0, 1], ["Noto Naskh Arabic", "r", [400, 500, 600, 700], [400, 700], 0], ["Chivo", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Atkinson Hyperlegible", "s", [400, 700], 0, 1], ["Indie Flower", "h", [400], 0, 0], ["Vollkorn", "r", [400, 500, 600, 700, 800, 900], [400, 900], 1], ["Yellowtail", "h", [400], 0, 0], ["Crimson Pro", "r", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Yanone Kaffeesatz", "s", [200, 300, 400, 500, 600, 700], [200, 700], 0], ["Literata", "r", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Hammersmith One", "s", [400], 0, 0], ["Playfair", "r", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["League Gothic", "s", [400], 0, 0], ["Sarabun", "s", [100, 200, 300, 400, 500, 600, 700, 800], 0, 1], ["Noto Sans Devanagari", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Righteous", "d", [400], 0, 0], ["Baskervville", "r", [400, 500, 600, 700], [400, 700], 1], ["Fira Sans Condensed", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Shippori Mincho", "r", [400, 500, 600, 700, 800], 0, 0], ["Alata", "s", [400], 0, 0], ["Prata", "r", [400], 0, 0], ["Nanum Gothic Coding", "h", [400, 700], 0, 0], ["Cardo", "r", [400, 700], 0, 1], ["Readex Pro", "s", [200, 300, 400, 500, 600, 700], [160, 700], 0], ["DM Serif Text", "r", [400], 0, 1], ["Old Standard TT", "r", [400, 700], 0, 1], ["Comic Neue", "h", [300, 400, 700], 0, 1], ["Catamaran", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Acme", "s", [400], 0, 0], ["Noto Sans Display", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["LINE Seed JP", "s", [100, 400, 700, 800], 0, 0], ["Google Sans Code", "m", [300, 400, 500, 600, 700, 800], [300, 800], 1], ["Russo One", "s", [400], 0, 0], ["Libre Caslon Text", "r", [400, 700], 0, 1], ["Tenor Sans", "s", [400], 0, 0], ["Patua One", "d", [400], 0, 0], ["Asap Condensed", "s", [200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Luckiest Guy", "d", [400], 0, 0], ["Lexend Giga", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Golos Text", "s", [400, 500, 600, 700, 800, 900], [400, 900], 0], ["Bree Serif", "r", [400], 0, 0], ["Alegreya", "r", [400, 500, 600, 700, 800, 900], [400, 900], 1], ["Noto Nastaliq Urdu", "r", [400, 500, 600, 700], [400, 700], 0], ["Rethink Sans", "s", [400, 500, 600, 700, 800], [400, 800], 1], ["Rowdies", "d", [300, 400, 700], 0, 0], ["Viga", "s", [400], 0, 0], ["Saira Extra Condensed", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 0], ["Hind Madurai", "s", [300, 400, 500, 600, 700], 0, 0], ["Special Elite", "d", [400], 0, 0], ["Tinos", "r", [400, 700], 0, 1], ["Antonio", "s", [100, 200, 300, 400, 500, 600, 700], [100, 700], 0], ["Aleo", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Patrick Hand", "h", [400], 0, 0], ["M PLUS 1", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Gothic A1", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 0], ["Crete Round", "r", [400], 0, 1], ["Bangers", "d", [400], 0, 0], ["Signika", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["Amatic SC", "h", [400, 700], 0, 0], ["Londrina Solid", "d", [100, 300, 400, 900], 0, 0], ["Changa", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Khand", "s", [300, 400, 500, 600, 700], 0, 0], ["Alexandria", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Cantarell", "s", [400, 700], 0, 1], ["Kaushan Script", "h", [400], 0, 0], ["Noto Sans Mono", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Vazirmatn", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Fira Code", "m", [300, 400, 500, 600, 700], [300, 700], 0], ["Passion One", "d", [400, 700, 900], 0, 0], ["BIZ UDPGothic", "s", [400, 700], 0, 0], ["Sanchez", "r", [400], 0, 1], ["Dela Gothic One", "d", [400], 0, 0], ["Courgette", "h", [400], 0, 0], ["Share Tech Mono", "m", [400], 0, 0], ["Allura", "h", [400], 0, 0], ["Libre Barcode 39", "d", [400], 0, 0], ["Encode Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Chelsea Market", "d", [400], 0, 0], ["Commissioner", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Oleo Script", "d", [400, 700], 0, 0], ["Kumbh Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Averia Serif Libre", "d", [300, 400, 700], 0, 1], ["Sawarabi Mincho", "r", [400], 0, 0], ["Pinyon Script", "h", [400], 0, 0], ["IBM Plex Sans Condensed", "s", [100, 200, 300, 400, 500, 600, 700], 0, 1], ["Philosopher", "s", [400, 700], 0, 1], ["Noto Sans Bengali", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Zen Old Mincho", "r", [400, 500, 600, 700, 900], 0, 0], ["Noticia Text", "r", [400, 700], 0, 1], ["Francois One", "s", [400], 0, 0], ["Noto Sans Hebrew", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Sacramento", "h", [400], 0, 0], ["Rubik Mono One", "s", [400], 0, 0], ["Antic Slab", "r", [400], 0, 0], ["STIX Two Text", "r", [400, 500, 600, 700], [400, 700], 1], ["VT323", "m", [400], 0, 0], ["Biryani", "s", [200, 300, 400, 600, 700, 800, 900], 0, 0], ["Titan One", "d", [400], 0, 0], ["Sen", "s", [400, 500, 600, 700, 800], [400, 800], 0], ["Oxanium", "d", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Josefin Slab", "r", [100, 200, 300, 400, 500, 600, 700], [100, 700], 1], ["Funnel Sans", "s", [300, 400, 500, 600, 700, 800], [300, 800], 1], ["Gabarito", "d", [400, 500, 600, 700, 800, 900], [400, 900], 0], ["Yantramanav", "s", [100, 300, 400, 500, 700, 900], 0, 0], ["Cinzel Decorative", "d", [400, 700, 900], 0, 0], ["Gilda Display", "r", [400], 0, 0], ["Paytone One", "s", [400], 0, 0], ["Gruppo", "s", [400], 0, 0], ["Playfair Display SC", "r", [400, 700, 900], 0, 1], ["Advent Pro", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Amaranth", "s", [400, 700], 0, 1], ["Fugaz One", "d", [400], 0, 0], ["Rammetto One", "d", [400], 0, 0], ["Sawarabi Gothic", "s", [400], 0, 0], ["Bai Jamjuree", "s", [200, 300, 400, 500, 600, 700], 0, 1], ["Neuton", "r", [200, 300, 400, 700, 800], 0, 1], ["Audiowide", "d", [400], 0, 0], ["Noto Serif Display", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Unna", "r", [400, 700], 0, 1], ["Ubuntu Condensed", "s", [400], 0, 0], ["PT Sans Caption", "s", [400, 700], 0, 0], ["Alex Brush", "h", [400], 0, 0], ["Forum", "d", [400], 0, 0], ["Architects Daughter", "h", [400], 0, 0], ["Martel", "r", [200, 300, 400, 600, 700, 800, 900], 0, 0], ["Rokkitt", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Yeseva One", "d", [400], 0, 0], ["Playball", "d", [400], 0, 0], ["Quattrocento", "r", [400, 700], 0, 0], ["Encode Sans Condensed", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 0], ["Gloria Hallelujah", "h", [400], 0, 0], ["Quattrocento Sans", "s", [400, 700], 0, 1], ["Science Gothic", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Balsamiq Sans", "d", [400, 700], 0, 1], ["Poiret One", "d", [400], 0, 0], ["Kosugi Maru", "s", [400], 0, 0], ["Didact Gothic", "s", [400], 0, 0], ["Sofia Sans Condensed", "s", [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [1, 1000], 1], ["El Messiri", "s", [400, 500, 600, 700], [400, 700], 0], ["Istok Web", "s", [400, 700], 0, 1], ["Delius", "h", [400], 0, 0], ["Nanum Pen Script", "h", [400], 0, 0], ["Host Grotesk", "s", [300, 400, 500, 600, 700, 800], [300, 800], 1], ["Tangerine", "h", [400, 700], 0, 0], ["Abhaya Libre", "r", [400, 500, 600, 700, 800], 0, 0], ["IBM Plex Sans Thai", "s", [100, 200, 300, 400, 500, 600, 700], 0, 0], ["Arsenal", "s", [400, 700], 0, 1], ["Cormorant Infant", "r", [300, 400, 500, 600, 700], [300, 700], 1], ["Homemade Apple", "h", [400], 0, 0], ["Radio Canada", "s", [300, 400, 500, 600, 700], [300, 700], 1], ["Anek Bangla", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["GFS Didot", "r", [400], 0, 0], ["Creepster", "d", [400], 0, 0], ["Actor", "s", [400], 0, 0], ["Signika Negative", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["Krub", "s", [200, 300, 400, 500, 600, 700], 0, 1], ["Gelasio", "r", [400, 500, 600, 700], [400, 700], 1], ["Noto Sans HK", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Monda", "s", [400, 500, 600, 700], [400, 700], 0], ["Volkhov", "r", [400, 700], 0, 1], ["Bentham", "r", [400], 0, 0], ["Cookie", "h", [400], 0, 0], ["Lalezar", "s", [400], 0, 0], ["Andada Pro", "r", [400, 500, 600, 700, 800], [400, 840], 1], ["Jua", "s", [400], 0, 0], ["PT Mono", "m", [400], 0, 0], ["Reenie Beanie", "h", [400], 0, 0], ["Libre Bodoni", "r", [400, 500, 600, 700], [400, 700], 1], ["Mitr", "s", [200, 300, 400, 500, 600, 700], 0, 0], ["Tektur", "d", [400, 500, 600, 700, 800, 900], [400, 900], 0], ["Fira Sans Extra Condensed", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Vidaloka", "r", [400], 0, 0], ["Unica One", "d", [400], 0, 0], ["Racing Sans One", "d", [400], 0, 0], ["Michroma", "s", [400], 0, 0], ["Staatliches", "d", [400], 0, 0], ["Concert One", "d", [400], 0, 0], ["Suez One", "r", [400], 0, 0], ["Shippori Mincho B1", "r", [400, 500, 600, 700, 800], 0, 0], ["Ubuntu Mono", "m", [400, 700], 0, 1], ["Italiana", "s", [400], 0, 0], ["Petrona", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Amita", "h", [400, 700], 0, 0], ["Bowlby One SC", "d", [400], 0, 0], ["Sorts Mill Goudy", "r", [400], 0, 1], ["Lusitana", "r", [400, 700], 0, 0], ["Parisienne", "h", [400], 0, 0], ["Pathway Gothic One", "s", [400], 0, 0], ["Tiro Devanagari Hindi", "r", [400], 0, 1], ["Goldman", "d", [400, 700], 0, 0], ["Black Han Sans", "s", [400], 0, 0], ["Merienda", "h", [300, 400, 500, 600, 700, 800, 900], [300, 900], 0], ["Belleza", "s", [400], 0, 0], ["Rock Salt", "h", [400], 0, 0], ["Mona Sans", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Mrs Saint Delafield", "h", [400], 0, 0], ["Arapey", "r", [400], 0, 1], ["Calistoga", "d", [400], 0, 0], ["Alumni Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Afacad", "s", [400, 500, 600, 700], [400, 700], 1], ["Radio Canada Big", "s", [400, 500, 600, 700], [400, 700], 1], ["Squada One", "d", [400], 0, 0], ["Gloock", "r", [400], 0, 0], ["Sofia Sans Extra Condensed", "s", [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [1, 1000], 1], ["Caveat Brush", "h", [400], 0, 0], ["Georama", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Reem Kufi", "s", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Malayalam", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Cuprum", "s", [400, 500, 600, 700], [400, 700], 1], ["Zen Kaku Gothic Antique", "s", [300, 400, 500, 700, 900], 0, 0], ["Pixelify Sans", "d", [400, 500, 600, 700], [400, 700], 0], ["Familjen Grotesk", "s", [400, 500, 600, 700], [400, 700], 1], ["Sriracha", "h", [400], 0, 0], ["Blinker", "s", [100, 200, 300, 400, 600, 700, 800, 900], 0, 0], ["Noto Serif Bengali", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Besley", "r", [400, 500, 600, 700, 800, 900], [400, 900], 1], ["Mate", "r", [400], 0, 1], ["Italianno", "h", [400], 0, 0], ["Alice", "r", [400], 0, 0], ["Anek Latin", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["IBM Plex Sans KR", "s", [100, 200, 300, 400, 500, 600, 700], 0, 0], ["Noto Sans Georgian", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Angkor", "d", [400], 0, 0], ["Jura", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["Bowlby One", "d", [400], 0, 0], ["Ultra", "r", [400], 0, 0], ["Saira Semi Condensed", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 0], ["Anonymous Pro", "m", [400, 700], 0, 1], ["Secular One", "s", [400], 0, 0], ["Gowun Batang", "r", [400, 700], 0, 0], ["Bad Script", "h", [400], 0, 0], ["Handlee", "h", [400], 0, 0], ["Six Caps", "s", [400], 0, 0], ["Bevan", "r", [400], 0, 1], ["Berkshire Swash", "h", [400], 0, 0], ["Chivo Mono", "m", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Annie Use Your Telescope", "h", [400], 0, 0], ["Atkinson Hyperlegible Next", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 1], ["Nothing You Could Do", "h", [400], 0, 0], ["Wix Madefor Display", "s", [400, 500, 600, 700, 800], [400, 800], 0], ["Varela", "s", [400], 0, 0], ["Palanquin", "s", [100, 200, 300, 400, 500, 600, 700], 0, 0], ["Carlito", "s", [400, 700], 0, 1], ["Julius Sans One", "s", [400], 0, 0], ["Big Shoulders", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Khula", "s", [300, 400, 600, 700, 800], 0, 0], ["Funnel Display", "d", [300, 400, 500, 600, 700, 800], [300, 800], 0], ["Caprasimo", "d", [400], 0, 0], ["Syncopate", "s", [400, 700], 0, 0], ["Cutive Mono", "m", [400], 0, 0], ["Oooh Baby", "h", [400], 0, 0], ["Azeret Mono", "m", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Just Another Hand", "h", [400], 0, 0], ["Fira Mono", "m", [400, 500, 700], 0, 0], ["Shantell Sans", "d", [300, 400, 500, 600, 700, 800], [300, 800], 1], ["Reddit Sans", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Gochi Hand", "h", [400], 0, 0], ["Carter One", "d", [400], 0, 0], ["Fahkwang", "s", [200, 300, 400, 500, 600, 700], 0, 1], ["Geo", "s", [400], 0, 1], ["Tomorrow", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Chewy", "d", [400], 0, 0], ["Rye", "d", [400], 0, 0], ["Monoton", "d", [400], 0, 0], ["IBM Plex Sans JP", "s", [100, 200, 300, 400, 500, 600, 700], 0, 0], ["Wix Madefor Text", "s", [400, 500, 600, 700, 800], [400, 800], 1], ["Baloo Bhai 2", "d", [400, 500, 600, 700, 800], [400, 800], 0], ["Mada", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Kaisei Decol", "r", [400, 500, 700], 0, 0], ["Cousine", "m", [400, 700], 0, 1], ["Libre Caslon Display", "r", [400], 0, 0], ["Aclonica", "s", [400], 0, 0], ["M PLUS 2", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Mr Dafoe", "h", [400], 0, 0], ["Jersey 25", "d", [400], 0, 0], ["Eczar", "r", [400, 500, 600, 700, 800], [400, 800], 0], ["Silkscreen", "d", [400, 700], 0, 0], ["Young Serif", "r", [400], 0, 0], ["Lemonada", "d", [300, 400, 500, 600, 700], [300, 700], 0], ["Alegreya Sans SC", "s", [100, 300, 400, 500, 700, 800, 900], 0, 1], ["Fustat", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Marck Script", "h", [400], 0, 0], ["Chango", "d", [400], 0, 0], ["Belanosima", "s", [400, 600, 700], 0, 0], ["Basic", "s", [400], 0, 0], ["Coda", "d", [400, 800], 0, 0], ["Damion", "h", [400], 0, 0], ["Darker Grotesque", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 0], ["Pragati Narrow", "s", [400, 700], 0, 0], ["Economica", "s", [400, 700], 0, 1], ["Mukta Malar", "s", [200, 300, 400, 500, 600, 700, 800], 0, 0], ["Krona One", "s", [400], 0, 0], ["Gantari", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Ms Madi", "h", [400], 0, 0], ["M PLUS U", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Ovo", "r", [400], 0, 0], ["Noto Sans Sinhala", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Original Surfer", "d", [400], 0, 0], ["Sofia", "h", [400], 0, 0], ["Grandstander", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Leckerli One", "h", [400], 0, 0], ["Do Hyeon", "s", [400], 0, 0], ["Itim", "h", [400], 0, 0], ["Hind Vadodara", "s", [300, 400, 500, 600, 700], 0, 0], ["Taviraj", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Pirata One", "d", [400], 0, 0], ["Adamina", "r", [400], 0, 0], ["Proza Libre", "s", [400, 500, 600, 700, 800], 0, 1], ["IM Fell English", "r", [400], 0, 1], ["Anton SC", "s", [400], 0, 0], ["Parkinsans", "s", [300, 400, 500, 600, 700, 800], [300, 800], 0], ["Sansita", "s", [400, 700, 800, 900], 0, 1], ["Aboreto", "d", [400], 0, 0], ["Eater", "d", [400], 0, 0], ["Niramit", "s", [200, 300, 400, 500, 600, 700], 0, 1], ["Marcellus SC", "r", [400], 0, 0], ["Gudea", "s", [400, 700], 0, 1], ["Dongle", "s", [300, 400, 700], 0, 0], ["Noto Sans Meetei Mayek", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Noto Sans Symbols", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Overpass Mono", "m", [300, 400, 500, 600, 700], [300, 700], 0], ["Pangolin", "h", [400], 0, 0], ["MuseoModerno", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["BenchNine", "s", [300, 400, 700], 0, 0], ["Hind Guntur", "s", [300, 400, 500, 600, 700], 0, 0], ["Andika", "s", [400, 700], 0, 1], ["Murecho", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Martian Mono", "m", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Baloo Da 2", "d", [400, 500, 600, 700, 800], [400, 800], 0], ["Karma", "r", [300, 400, 500, 600, 700], 0, 0], ["Charm", "h", [400, 700], 0, 0], ["Pridi", "r", [200, 300, 400, 500, 600, 700], 0, 0], ["Rampart One", "d", [400], 0, 0], ["Cedarville Cursive", "h", [400], 0, 0], ["Stardos Stencil", "d", [400, 700], 0, 0], ["Hachi Maru Pop", "h", [400], 0, 0], ["Ruda", "s", [400, 500, 600, 700, 800, 900], [400, 900], 0], ["K2D", "s", [100, 200, 300, 400, 500, 600, 700, 800], 0, 1], ["Limelight", "d", [400], 0, 0], ["Potta One", "d", [400], 0, 0], ["Spline Sans Mono", "m", [300, 400, 500, 600, 700], [300, 700], 1], ["Kreon", "r", [300, 400, 500, 600, 700], [300, 700], 0], ["Shrikhand", "d", [400], 0, 0], ["Zalando Sans Expanded", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Sofia Sans Semi Condensed", "s", [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [1, 1000], 1], ["RocknRoll One", "s", [400], 0, 0], ["Days One", "s", [400], 0, 0], ["Ropa Sans", "s", [400], 0, 1], ["Tiro Bangla", "r", [400], 0, 1], ["Poller One", "d", [400], 0, 0], ["Special Gothic Expanded One", "s", [400], 0, 0], ["Electrolize", "s", [400], 0, 0], ["Rozha One", "r", [400], 0, 0], ["Anuphan", "s", [100, 200, 300, 400, 500, 600, 700], [100, 700], 0], ["Knewave", "d", [400], 0, 0], ["Lateef", "r", [200, 300, 400, 500, 600, 700, 800], 0, 0], ["Zalando Sans", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Martel Sans", "s", [200, 300, 400, 600, 700, 800, 900], 0, 0], ["Pontano Sans", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["DotGothic16", "s", [400], 0, 0], ["Ma Shan Zheng", "h", [400], 0, 0], ["Anybody", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Trirong", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Noto Sans Myanmar", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Covered By Your Grace", "h", [400], 0, 0], ["Baloo Bhaijaan 2", "d", [400, 500, 600, 700, 800], [400, 800], 0], ["Shadows Into Light Two", "h", [400], 0, 0], ["Rufina", "r", [400, 700], 0, 0], ["UnifrakturMaguntia", "d", [400], 0, 0], ["Afacad Flux", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [100, 1000], 0], ["Kiwi Maru", "r", [300, 400, 500], 0, 0], ["Lexend Zetta", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Cabin Condensed", "s", [400, 500, 600, 700], 0, 0], ["Sometype Mono", "m", [400, 500, 600, 700], [400, 700], 1], ["Noto Sans Gujarati", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Fredericka the Great", "d", [400], 0, 0], ["Palanquin Dark", "s", [400, 500, 600, 700], 0, 0], ["Yatra One", "d", [400], 0, 0], ["Noto Serif Devanagari", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Pattaya", "s", [400], 0, 0], ["Charis SIL", "r", [400, 700], 0, 1], ["Doto", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Akshar", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["Petit Formal Script", "h", [400], 0, 0], ["Spline Sans", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["Montagu Slab", "r", [100, 200, 300, 400, 500, 600, 700], [100, 700], 0], ["Noto Sans Kannada", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Castoro", "r", [400, 500, 600, 700], [400, 700], 1], ["Playpen Sans", "h", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Cormorant SC", "r", [300, 400, 500, 600, 700], 0, 0], ["Ubuntu Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 1], ["Radley", "r", [400], 0, 1], ["Inria Serif", "r", [300, 400, 700], 0, 1], ["Yuji Mai", "r", [400], 0, 0], ["Neucha", "h", [400], 0, 0], ["Livvic", "s", [100, 200, 300, 400, 500, 600, 700, 900], 0, 1], ["Grand Hotel", "h", [400], 0, 0], ["Mandali", "s", [400], 0, 0], ["Caudex", "r", [400, 700], 0, 1], ["BIZ UDGothic", "s", [400, 700], 0, 0], ["Fragment Mono", "m", [400], 0, 1], ["Vina Sans", "d", [400], 0, 0], ["Boogaloo", "d", [400], 0, 0], ["ZCOOL KuaiLe", "s", [400], 0, 0], ["Mali", "h", [200, 300, 400, 500, 600, 700], 0, 1], ["Cantata One", "r", [400], 0, 0], ["Cal Sans", "s", [400], 0, 0], ["Aref Ruqaa", "r", [400, 700], 0, 0], ["TikTok Sans", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 0], ["Bellefair", "r", [400], 0, 0], ["Niconne", "h", [400], 0, 0], ["Graduate", "r", [400], 0, 0], ["Yrsa", "r", [300, 400, 500, 600, 700], [300, 700], 1], ["Sintony", "s", [400, 700], 0, 0], ["Glory", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 1], ["Cabin Sketch", "d", [400, 700], 0, 0], ["Klee One", "h", [400, 600], 0, 0], ["Ibarra Real Nova", "r", [400, 500, 600, 700], [400, 700], 1], ["Spinnaker", "s", [400], 0, 0], ["Mochiy Pop One", "s", [400], 0, 0], ["Gowun Dodum", "s", [400], 0, 0], ["Antic Didone", "r", [400], 0, 0], ["Sarala", "s", [400, 700], 0, 0], ["Lexend Exa", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["ADLaM Display", "d", [400], 0, 0], ["Oranienbaum", "r", [400], 0, 0], ["Brygada 1918", "r", [400, 500, 600, 700], [400, 700], 1], ["Tilt Warp", "d", [400], 0, 0], ["Alef", "s", [400, 700], 0, 0], ["Aldrich", "s", [400], 0, 0], ["Hepta Slab", "r", [1, 100, 200, 300, 400, 500, 600, 700, 800, 900], [1, 900], 0], ["Noto Sans Gurmukhi", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["La Belle Aurore", "h", [400], 0, 0], ["Style Script", "h", [400], 0, 0], ["IM Fell English SC", "r", [400], 0, 0], ["ZCOOL XiaoWei", "s", [400], 0, 0], ["PT Serif Caption", "r", [400], 0, 1], ["Averia Libre", "d", [300, 400, 700], 0, 1], ["Corben", "d", [400, 700], 0, 0], ["Lexend Peta", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Mozilla Headline", "s", [200, 300, 400, 500, 600, 700], [200, 700], 0], ["Fondamento", "h", [400], 0, 1], ["Kameron", "r", [400, 500, 600, 700], [400, 700], 0], ["Pathway Extreme", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Anaheim", "s", [400, 500, 600, 700, 800], [400, 800], 0], ["Marmelad", "s", [400], 0, 0], ["Nanum Brush Script", "h", [400], 0, 0], ["Sedgwick Ave Display", "h", [400], 0, 0], ["Herr Von Muellerhoff", "h", [400], 0, 0], ["Chonburi", "d", [400], 0, 0], ["Red Hat Mono", "m", [300, 400, 500, 600, 700], [300, 700], 1], ["Telex", "s", [400], 0, 0], ["Armata", "s", [400], 0, 0], ["Bona Nova SC", "r", [400, 700], 0, 1], ["Athiti", "s", [200, 300, 400, 500, 600, 700], 0, 0], ["Sniglet", "d", [400, 800], 0, 0], ["Glegoo", "r", [400, 700], 0, 0], ["Alegreya SC", "r", [400, 500, 700, 800, 900], 0, 1], ["Hina Mincho", "r", [400], 0, 0], ["Lustria", "r", [400], 0, 0], ["Magra", "s", [400, 700], 0, 0], ["Kosugi", "s", [400], 0, 0], ["Faster One", "d", [400], 0, 0], ["Share", "s", [400, 700], 0, 1], ["Kantumruy Pro", "s", [100, 200, 300, 400, 500, 600, 700], [100, 700], 1], ["Beth Ellen", "h", [400], 0, 0], ["Noto Sans Armenian", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Halant", "r", [300, 400, 500, 600, 700], 0, 0], ["Arbutus Slab", "r", [400], 0, 0], ["Noto Sans Oriya", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Trocchi", "r", [400], 0, 0], ["Yuji Syuku", "r", [400], 0, 0], ["Hahmlet", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Monsieur La Doulaise", "h", [400], 0, 0], ["Mountains of Christmas", "d", [400, 700], 0, 0], ["BIZ UDPMincho", "r", [400, 700], 0, 0], ["Metrophobic", "s", [400], 0, 0], ["Fjord One", "r", [400], 0, 0], ["Libre Barcode 128", "d", [400], 0, 0], ["Nixie One", "d", [400], 0, 0], ["AR One Sans", "s", [400, 500, 600, 700], [400, 700], 0], ["Seaweed Script", "d", [400], 0, 0], ["IBM Plex Sans Hebrew", "s", [100, 200, 300, 400, 500, 600, 700], 0, 0], ["MedievalSharp", "d", [400], 0, 0], ["Flow Circular", "d", [400], 0, 0], ["Allison", "h", [400], 0, 0], ["Monomaniac One", "s", [400], 0, 0], ["Grenze Gotisch", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Comic Relief", "d", [400, 700], 0, 0], ["Ysabeau Office", "s", [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [1, 1000], 1], ["Caladea", "r", [400, 700], 0, 1], ["DynaPuff", "d", [400, 500, 600, 700], [400, 700], 0], ["Rosario", "s", [300, 400, 500, 600, 700], [300, 700], 1], ["Hedvig Letters Serif", "r", [400], 0, 0], ["Judson", "r", [400, 700], 0, 1], ["Inria Sans", "s", [300, 400, 700], 0, 1], ["Allerta Stencil", "s", [400], 0, 0], ["Cormorant Upright", "r", [300, 400, 500, 600, 700], 0, 0], ["Sigmar One", "d", [400], 0, 0], ["Mouse Memoirs", "s", [400], 0, 0], ["Song Myung", "r", [400], 0, 0], ["Candal", "s", [400], 0, 0], ["Goudy Bookletter 1911", "r", [400], 0, 0], ["Coming Soon", "h", [400], 0, 0], ["Enriqueta", "r", [400, 500, 600, 700], 0, 0], ["Zen Dots", "d", [400], 0, 0], ["BBH Bogle", "s", [400], 0, 0], ["Cormorant Unicase", "r", [300, 400, 500, 600, 700], 0, 0], ["Rouge Script", "h", [400], 0, 0], ["Koulen", "d", [400], 0, 0], ["Kodchasan", "s", [200, 300, 400, 500, 600, 700], 0, 1], ["Special Gothic Condensed One", "s", [400], 0, 0], ["Podkova", "r", [400, 500, 600, 700, 800], [400, 800], 0], ["Yusei Magic", "s", [400], 0, 0], ["Irish Grover", "d", [400], 0, 0], ["Corinthia", "h", [400, 700], 0, 0], ["Markazi Text", "r", [400, 500, 600, 700], [400, 700], 0], ["Freehand", "d", [400], 0, 0], ["Amiko", "s", [400, 600, 700], 0, 0], ["Akatab", "s", [400, 500, 600, 700, 800, 900], 0, 0], ["Mukta Vaani", "s", [200, 300, 400, 500, 600, 700, 800], 0, 0], ["Nobile", "s", [400, 500, 700], 0, 1], ["KoHo", "s", [200, 300, 400, 500, 600, 700], 0, 1], ["REM", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Quando", "r", [400], 0, 0], ["Special Gothic", "s", [400, 500, 600, 700], [400, 700], 0], ["Qwitcher Grypen", "h", [400, 700], 0, 0], ["Barriecito", "d", [400], 0, 0], ["Chiron GoRound TC", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Reddit Sans Condensed", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Noto Sans Ethiopic", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Average Sans", "s", [400], 0, 0], ["Arizonia", "h", [400], 0, 0], ["Bayon", "s", [400], 0, 0], ["National Park", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Overlock", "d", [400, 700, 900], 0, 1], ["Zain", "s", [200, 300, 400, 700, 800, 900], 0, 1], ["Gaegu", "h", [300, 400, 700], 0, 0], ["Love Ya Like A Sister", "d", [400], 0, 0], ["BioRhyme", "r", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Alatsi", "s", [400], 0, 0], ["Libertinus Serif", "r", [400, 600, 700], 0, 1], ["Turret Road", "d", [200, 300, 400, 500, 700, 800], 0, 0], ["Oxygen Mono", "m", [400], 0, 0], ["Baloo Thambi 2", "d", [400, 500, 600, 700, 800], [400, 800], 0], ["Bitcount Single", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Meddon", "h", [400], 0, 0], ["Ephesis", "h", [400], 0, 0], ["Tienne", "r", [400, 700, 900], 0, 0], ["Piazzolla", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Anek Devanagari", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["B612 Mono", "m", [400, 700], 0, 1], ["Zen Kurenaido", "s", [400], 0, 0], ["Zen Antique", "r", [400], 0, 0], ["Asul", "r", [400, 700], 0, 0], ["Calligraffitti", "h", [400], 0, 0], ["Rakkas", "d", [400], 0, 0], ["Allerta", "s", [400], 0, 0], ["Noto Sans Ol Chiki", "s", [400, 500, 600, 700], [400, 700], 0], ["Marvel", "s", [400, 700], 0, 1], ["Norican", "h", [400], 0, 0], ["Zalando Sans SemiExpanded", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Bubblegum Sans", "d", [400], 0, 0], ["Schoolbell", "h", [400], 0, 0], ["Noto Serif Thai", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Yesteryear", "h", [400], 0, 0], ["Rubik Doodle Shadow", "d", [400], 0, 0], ["Hi Melody", "h", [400], 0, 0], ["Rubik Dirt", "d", [400], 0, 0], ["Gurajada", "s", [400], 0, 0], ["Bungee Shade", "d", [400], 0, 0], ["Rancho", "h", [400], 0, 0], ["Rochester", "h", [400], 0, 0], ["Recursive", "s", [300, 400, 500, 600, 700, 800, 900, 1000], [300, 1000], 0], ["Aladin", "d", [400], 0, 0], ["Sunflower", "s", [300, 500, 700], 0, 0], ["Spectral SC", "r", [200, 300, 400, 500, 600, 700, 800], 0, 1], ["Poetsen One", "d", [400], 0, 0], ["Train One", "d", [400], 0, 0], ["Capriola", "s", [400], 0, 0], ["Numans", "s", [400], 0, 0], ["Over the Rainbow", "h", [400], 0, 0], ["Nova Square", "d", [400], 0, 0], ["Hurricane", "h", [400], 0, 0], ["Red Rose", "d", [300, 400, 500, 600, 700], [300, 700], 0], ["Inclusive Sans", "s", [300, 400, 500, 600, 700], [300, 700], 1], ["Manjari", "s", [100, 400, 700], 0, 0], ["Gotu", "s", [400], 0, 0], ["Noto Sans Thai Looped", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Bungee Inline", "d", [400], 0, 0], ["Birthstone", "h", [400], 0, 0], ["David Libre", "r", [400, 500, 700], 0, 0], ["Lily Script One", "d", [400], 0, 0], ["Cambay", "s", [400, 700], 0, 1], ["Rubik Spray Paint", "d", [400], 0, 0], ["Boldonse", "d", [400], 0, 0], ["Syne Mono", "m", [400], 0, 0], ["Metamorphous", "d", [400], 0, 0], ["Alan Sans", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 0], ["Fanwood Text", "r", [400], 0, 1], ["Mansalva", "h", [400], 0, 0], ["Wallpoet", "d", [400], 0, 0], ["Quintessential", "h", [400], 0, 0], ["Croissant One", "d", [400], 0, 0], ["Maitree", "r", [200, 300, 400, 500, 600, 700], 0, 0], ["Cherry Bomb One", "d", [400], 0, 0], ["Libre Barcode 39 Extended Text", "d", [400], 0, 0], ["ZCOOL QingKe HuangYou", "s", [400], 0, 0], ["Inknut Antiqua", "r", [300, 400, 500, 600, 700, 800, 900], 0, 0], ["Copse", "r", [400], 0, 0], ["Noto Sans Lao", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Kaisei Opti", "r", [400, 500, 700], 0, 0], ["Gabriela", "r", [400], 0, 0], ["Skranji", "d", [400, 700], 0, 0], ["Shippori Antique", "s", [400], 0, 0], ["Platypi", "r", [300, 400, 500, 600, 700, 800], [300, 800], 1], ["Scheherazade New", "r", [400, 500, 600, 700], 0, 0], ["Prosto One", "d", [400], 0, 0], ["Meow Script", "h", [400], 0, 0], ["B612", "s", [400, 700], 0, 1], ["Kadwa", "r", [400, 700], 0, 0], ["Laila", "r", [300, 400, 500, 600, 700], 0, 0], ["Voltaire", "s", [400], 0, 0], ["Bagel Fat One", "d", [400], 0, 0], ["Mr De Haviland", "h", [400], 0, 0], ["Delicious Handrawn", "h", [400], 0, 0], ["Huninn", "s", [400], 0, 0], ["Noto Sans Symbols 2", "s", [400], 0, 0], ["Aguafina Script", "h", [400], 0, 0], ["Asta Sans", "s", [300, 400, 500, 600, 700, 800], [300, 800], 0], ["Federant", "d", [400], 0, 0], ["Finlandica Text", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Kristi", "h", [400], 0, 0], ["Jersey 10", "d", [400], 0, 0], ["Scada", "s", [400, 700], 0, 1], ["Happy Monkey", "d", [400], 0, 0], ["Contrail One", "d", [400], 0, 0], ["Sansita Swashed", "d", [300, 400, 500, 600, 700, 800, 900], [300, 900], 0], ["Waiting for the Sunrise", "h", [400], 0, 0], ["Poltawski Nowy", "r", [400, 500, 600, 700], [400, 700], 1], ["Kurale", "r", [400], 0, 0], ["MonteCarlo", "h", [400], 0, 0], ["Coiny", "d", [400], 0, 0], ["Coustard", "r", [400, 900], 0, 0], ["Mukta Mahee", "s", [200, 300, 400, 500, 600, 700, 800], 0, 0], ["Cutive", "r", [400], 0, 0], ["Della Respira", "r", [400], 0, 0], ["Rambla", "s", [400, 700], 0, 1], ["Moon Dance", "h", [400], 0, 0], ["Baloo Chettan 2", "d", [400, 500, 600, 700, 800], [400, 800], 0], ["Atma", "d", [300, 400, 500, 600, 700], 0, 0], ["Square Peg", "h", [400], 0, 0], ["Noto Serif Georgian", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Ruslan Display", "d", [400], 0, 0], ["Miriam Libre", "s", [400, 500, 600, 700], [400, 700], 0], ["Ruwudu", "r", [400, 500, 600, 700], 0, 0], ["Lacquer", "d", [400], 0, 0], ["Bellota Text", "d", [300, 400, 700], 0, 1], ["Dawning of a New Day", "h", [400], 0, 0], ["Jockey One", "s", [400], 0, 0], ["Alike", "r", [400], 0, 0], ["Aoboshi One", "r", [400], 0, 0], ["Jaldi", "s", [400, 700], 0, 0], ["Finger Paint", "d", [400], 0, 0], ["Noto Serif HK", "r", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Major Mono Display", "m", [400], 0, 0], ["Encode Sans Expanded", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 0], ["Noto Serif Tibetan", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Frijole", "d", [400], 0, 0], ["Arima", "d", [100, 200, 300, 400, 500, 600, 700], [100, 700], 0], ["Megrim", "d", [400], 0, 0], ["LXGW WenKai TC", "h", [300, 400, 700], 0, 0], ["Bona Nova", "r", [400, 700], 0, 1], ["Vujahday Script", "h", [400], 0, 0], ["Carrois Gothic", "s", [400], 0, 0], ["Lekton", "m", [400, 700], 0, 1], ["Orelega One", "d", [400], 0, 0], ["Karantina", "d", [300, 400, 700], 0, 0], ["Average", "r", [400], 0, 0], ["Baloo Tamma 2", "d", [400, 500, 600, 700, 800], [400, 800], 0], ["Sulphur Point", "s", [300, 400, 700], 0, 0], ["Battambang", "d", [100, 300, 400, 700, 900], 0, 0], ["Protest Revolution", "d", [400], 0, 0], ["Yomogi", "h", [400], 0, 0], ["Whisper", "h", [400], 0, 0], ["Hanuman", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Trade Winds", "d", [400], 0, 0], ["Amarante", "d", [400], 0, 0], ["Metal Mania", "d", [400], 0, 0], ["Agbalumo", "d", [400], 0, 0], ["Gluten", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Phudu", "d", [300, 400, 500, 600, 700, 800, 900], [300, 900], 0], ["Momo Signature", "s", [400], 0, 0], ["Cherry Cream Soda", "d", [400], 0, 0], ["Sarina", "d", [400], 0, 0], ["Xanh Mono", "m", [400], 0, 1], ["IM Fell DW Pica", "r", [400], 0, 1], ["Freeman", "d", [400], 0, 0], ["Vollkorn SC", "r", [400, 600, 700, 900], 0, 0], ["Fresca", "s", [400], 0, 0], ["Sour Gummy", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Libre Barcode 39 Text", "d", [400], 0, 0], ["Stick No Bills", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Reggae One", "d", [400], 0, 0], ["Padauk", "s", [400, 700], 0, 0], ["Almendra", "r", [400, 700], 0, 1], ["Hedvig Letters Sans", "s", [400], 0, 0], ["Balthazar", "r", [400], 0, 0], ["UnifrakturCook", "d", [700], 0, 0], ["Rasa", "r", [300, 400, 500, 600, 700], [300, 700], 1], ["Homenaje", "s", [400], 0, 0], ["Encode Sans Semi Condensed", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 0], ["Kalnia", "r", [100, 200, 300, 400, 500, 600, 700], [100, 700], 0], ["Pompiere", "d", [400], 0, 0], ["Nova Mono", "m", [400], 0, 0], ["New Rocker", "d", [400], 0, 0], ["Fauna One", "r", [400], 0, 0], ["Sedgwick Ave", "h", [400], 0, 0], ["Qwigley", "h", [400], 0, 0], ["Zen Antique Soft", "r", [400], 0, 0], ["Protest Strike", "d", [400], 0, 0], ["Oleo Script Swash Caps", "d", [400, 700], 0, 0], ["Modak", "d", [400], 0, 0], ["Sarpanch", "s", [400, 500, 600, 700, 800, 900], 0, 0], ["Allan", "d", [400, 700], 0, 0], ["Montez", "h", [400], 0, 0], ["Antic", "s", [400], 0, 0], ["Inder", "s", [400], 0, 0], ["Vast Shadow", "r", [400], 0, 0], ["Gentium Book Plus", "r", [400, 700], 0, 1], ["Euphoria Script", "h", [400], 0, 0], ["Carattere", "h", [400], 0, 0], ["Imprima", "s", [400], 0, 0], ["Arya", "s", [400, 700], 0, 0], ["Buenard", "r", [400, 500, 600, 700], [400, 700], 0], ["Gamja Flower", "h", [400], 0, 0], ["Tenali Ramakrishna", "s", [400], 0, 0], ["Imperial Script", "h", [400], 0, 0], ["Germania One", "d", [400], 0, 0], ["Cambo", "r", [400], 0, 0], ["Kufam", "s", [400, 500, 600, 700, 800, 900], [400, 900], 1], ["Teachers", "s", [400, 500, 600, 700, 800], [400, 800], 1], ["Rosarivo", "r", [400], 0, 1], ["Fuzzy Bubbles", "h", [400, 700], 0, 0], ["Noto Serif Hebrew", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Uncial Antiqua", "d", [400], 0, 0], ["Supermercado One", "d", [400], 0, 0], ["Libre Barcode 128 Text", "d", [400], 0, 0], ["Atkinson Hyperlegible Mono", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 1], ["Solway", "r", [300, 400, 500, 700, 800], 0, 0], ["Oregano", "d", [400], 0, 1], ["Mozilla Text", "s", [200, 300, 400, 500, 600, 700], [200, 700], 0], ["Gayathri", "s", [100, 400, 700], 0, 0], ["Mallanna", "s", [400], 0, 0], ["Just Me Again Down Here", "h", [400], 0, 0], ["Anta", "s", [400], 0, 0], ["Protest Riot", "d", [400], 0, 0], ["Galada", "d", [400], 0, 0], ["Vibur", "h", [400], 0, 0], ["Medula One", "d", [400], 0, 0], ["Scope One", "r", [400], 0, 0], ["Farro", "s", [300, 400, 500, 700], 0, 0], ["Atomic Age", "d", [400], 0, 0], ["Wittgenstein", "r", [400, 500, 600, 700, 800, 900], [400, 900], 1], ["Noto Serif Khmer", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Luxurious Script", "h", [400], 0, 0], ["Abyssinica SIL", "r", [400], 0, 0], ["Short Stack", "h", [400], 0, 0], ["Brawler", "r", [400, 700], 0, 0], ["Gasoek One", "s", [400], 0, 0], ["Convergence", "s", [400], 0, 0], ["Kelly Slab", "d", [400], 0, 0], ["Beau Rivage", "h", [400], 0, 0], ["Averia Sans Libre", "d", [300, 400, 700], 0, 1], ["Walter Turncoat", "h", [400], 0, 0], ["Stack Sans Headline", "s", [200, 300, 400, 500, 600, 700], [200, 700], 0], ["M PLUS 1 Code", "m", [100, 200, 300, 400, 500, 600, 700], [100, 700], 0], ["Reddit Mono", "m", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Bellota", "d", [300, 400, 700], 0, 1], ["Chocolate Classical Sans", "s", [400], 0, 0], ["Mohave", "s", [300, 400, 500, 600, 700], [300, 700], 1], ["Poly", "r", [400], 0, 1], ["Vend Sans", "s", [300, 400, 500, 600, 700], [300, 700], 1], ["Jomhuria", "d", [400], 0, 0], ["Suranna", "r", [400], 0, 0], ["East Sea Dokdo", "h", [400], 0, 0], ["Darumadrop One", "d", [400], 0, 0], ["Gulzar", "r", [400], 0, 0], ["Viaoda Libre", "d", [400], 0, 0], ["Patrick Hand SC", "h", [400], 0, 0], ["Kaisei Tokumin", "r", [400, 500, 700, 800], 0, 0], ["Kranky", "d", [400], 0, 0], ["Road Rage", "d", [400], 0, 0], ["Grenze", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Dynalight", "d", [400], 0, 0], ["Amiri Quran", "r", [400], 0, 0], ["Eagle Lake", "h", [400], 0, 0], ["Bilbo Swash Caps", "h", [400], 0, 0], ["Puritan", "s", [400, 700], 0, 1], ["IBM Plex Sans Thai Looped", "s", [100, 200, 300, 400, 500, 600, 700], 0, 0], ["Slackey", "d", [400], 0, 0], ["Expletus Sans", "d", [400, 500, 600, 700], [400, 700], 1], ["Ysabeau SC", "s", [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [1, 1000], 0], ["Sue Ellen Francisco", "h", [400], 0, 0], ["WindSong", "h", [400, 500], 0, 0], ["Tilt Neon", "d", [400], 0, 0], ["Fontdiner Swanky", "d", [400], 0, 0], ["Spicy Rice", "d", [400], 0, 0], ["Bakbak One", "d", [400], 0, 0], ["Anek Tamil", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Girassol", "d", [400], 0, 0], ["Give You Glory", "h", [400], 0, 0], ["Borel", "h", [400], 0, 0], ["McLaren", "d", [400], 0, 0], ["Rubik Glitch", "d", [400], 0, 0], ["Charmonman", "h", [400, 700], 0, 0], ["Codystar", "d", [300, 400], 0, 0], ["Mirza", "r", [400, 500, 600, 700], 0, 0], ["Elms Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Kode Mono", "m", [400, 500, 600, 700], [400, 700], 0], ["Ranchers", "d", [400], 0, 0], ["Dangrek", "d", [400], 0, 0], ["Waterfall", "h", [400], 0, 0], ["Elsie", "d", [400, 900], 0, 0], ["Vesper Libre", "r", [400, 500, 700, 900], 0, 0], ["Sancreek", "d", [400], 0, 0], ["Sekuya", "d", [400], 0, 0], ["Crafty Girls", "h", [400], 0, 0], ["Peralta", "r", [400], 0, 0], ["Mochiy Pop P One", "s", [400], 0, 0], ["Molengo", "s", [400], 0, 0], ["Kulim Park", "s", [200, 300, 400, 600, 700], 0, 1], ["TASA Orbiter", "s", [400, 500, 600, 700, 800], [400, 800], 0], ["Fuggles", "h", [400], 0, 0], ["Alike Angular", "r", [400], 0, 0], ["Sail", "d", [400], 0, 0], ["Dokdo", "d", [400], 0, 0], ["Yuji Boku", "r", [400], 0, 0], ["Julee", "h", [400], 0, 0], ["Madimi One", "s", [400], 0, 0], ["Encode Sans Semi Expanded", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], 0, 0], ["Ledger", "r", [400], 0, 0], ["Anek Malayalam", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["IM Fell Great Primer", "r", [400], 0, 1], ["Meie Script", "h", [400], 0, 0], ["Qahiri", "s", [400], 0, 0], ["Unkempt", "d", [400, 700], 0, 0], ["Prociono", "r", [400], 0, 0], ["Comme", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Macondo", "d", [400], 0, 0], ["Tiro Devanagari Sanskrit", "r", [400], 0, 1], ["Federo", "s", [400], 0, 0], ["Stack Sans Text", "s", [200, 300, 400, 500, 600, 700], [200, 700], 0], ["Alkalami", "r", [400], 0, 0], ["Mina", "s", [400, 700], 0, 0], ["Bokor", "d", [400], 0, 0], ["Bodoni Moda SC", "r", [400, 500, 600, 700, 800, 900], [400, 900], 1], ["Salsa", "d", [400], 0, 0], ["Life Savers", "d", [400, 700, 800], 0, 0], ["Amethysta", "r", [400], 0, 0], ["Noto Sans Warang Citi", "s", [400], 0, 0], ["Rationale", "s", [400], 0, 0], ["Caesar Dressing", "d", [400], 0, 0], ["IM Fell Double Pica", "r", [400], 0, 1], ["Nata Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Ribeye", "d", [400], 0, 0], ["BhuTuka Expanded One", "r", [400], 0, 0], ["Thasadith", "s", [400, 700], 0, 1], ["Headland One", "r", [400], 0, 0], ["Cherry Swash", "d", [400, 700], 0, 0], ["Nokora", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["SUSE", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Birthstone Bounce", "h", [400, 500], 0, 0], ["Noto Serif Malayalam", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Duru Sans", "s", [400], 0, 0], ["Imbue", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Noto Sans Mongolian", "s", [400], 0, 0], ["Libertinus Sans", "s", [400, 700], 0, 1], ["Asar", "r", [400], 0, 0], ["Kdam Thmor Pro", "s", [400], 0, 0], ["Baloo Paaji 2", "d", [400, 500, 600, 700, 800], [400, 800], 0], ["Slabo 13px", "r", [400], 0, 0], ["Nosifer", "d", [400], 0, 0], ["League Script", "h", [400], 0, 0], ["Clicker Script", "h", [400], 0, 0], ["Montaga", "r", [400], 0, 0], ["Long Cang", "h", [400], 0, 0], ["Voces", "s", [400], 0, 0], ["Edu TAS Beginner", "h", [400, 500, 600, 700], [400, 700], 0], ["Agdasima", "s", [400, 700], 0, 0], ["Orienta", "s", [400], 0, 0], ["Stick", "s", [400], 0, 0], ["Emilys Candy", "d", [400], 0, 0], ["Kavoon", "d", [400], 0, 0], ["Genos", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Varta", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["Goblin One", "d", [400], 0, 0], ["Doppio One", "s", [400], 0, 0], ["Macondo Swash Caps", "d", [400], 0, 0], ["Cactus Classical Serif", "r", [400], 0, 0], ["Alkatra", "d", [400, 500, 600, 700], [400, 700], 0], ["Sumana", "r", [400, 700], 0, 0], ["Tiny5", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Anek Kannada", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Tourney", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Port Lligat Sans", "s", [400], 0, 0], ["Jolly Lodger", "d", [400], 0, 0], ["Freckle Face", "d", [400], 0, 0], ["Noto Serif Telugu", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Truculenta", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Henny Penny", "d", [400], 0, 0], ["Anek Gujarati", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Ballet", "h", [400], 0, 0], ["Noto Sans Samaritan", "s", [400], 0, 0], ["Habibi", "r", [400], 0, 0], ["NTR", "s", [400], 0, 0], ["Zhi Mang Xing", "h", [400], 0, 0], ["Faculty Glyphic", "s", [400], 0, 0], ["Kablammo", "d", [400], 0, 0], ["Bigshot One", "d", [400], 0, 0], ["Bonheur Royale", "h", [400], 0, 0], ["Iceberg", "d", [400], 0, 0], ["Noto Sans Cypriot", "s", [400], 0, 0], ["Esteban", "r", [400], 0, 0], ["Lemon", "d", [400], 0, 0], ["Edu NSW ACT Cursive", "h", [400, 500, 600, 700], [400, 700], 0], ["Rubik Bubbles", "d", [400], 0, 0], ["Baumans", "d", [400], 0, 0], ["Noto Serif Tamil", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Redressed", "h", [400], 0, 0], ["Notable", "s", [400], 0, 0], ["Noto Serif Khojki", "r", [400, 500, 600, 700], [400, 700], 0], ["Ancizar Serif", "r", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["Montserrat Underline", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Gemunu Libre", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Wendy One", "s", [400], 0, 0], ["Fasthand", "d", [400], 0, 0], ["Handjet", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Climate Crisis", "d", [400], 0, 0], ["Delius Unicase", "h", [400, 700], 0, 0], ["Single Day", "d", [400], 0, 0], ["Jomolhari", "r", [400], 0, 0], ["Harmattan", "s", [400, 500, 600, 700], 0, 0], ["Rubik Wet Paint", "d", [400], 0, 0], ["Koh Santepheap", "r", [100, 300, 400, 700, 900], 0, 0], ["Raleway Dots", "d", [400], 0, 0], ["BIZ UDMincho", "r", [400, 700], 0, 0], ["Baloo Tammudu 2", "d", [400, 500, 600, 700, 800], [400, 800], 0], ["Chicle", "d", [400], 0, 0], ["Chau Philomene One", "s", [400], 0, 1], ["Denk One", "s", [400], 0, 0], ["Baloo Bhaina 2", "d", [400, 500, 600, 700, 800], [400, 800], 0], ["Mooli", "s", [400], 0, 0], ["Delius Swash Caps", "h", [400], 0, 0], ["Story Script", "s", [400], 0, 0], ["Miniver", "d", [400], 0, 0], ["Shojumaru", "d", [400], 0, 0], ["Gafata", "s", [400], 0, 0], ["Crushed", "d", [400], 0, 0], ["Victor Mono", "m", [100, 200, 300, 400, 500, 600, 700], [100, 700], 1], ["IM Fell French Canon", "r", [400], 0, 1], ["Lavishly Yours", "h", [400], 0, 0], ["Carme", "s", [400], 0, 0], ["Ruthie", "h", [400], 0, 0], ["The Girl Next Door", "h", [400], 0, 0], ["Momo Trust Display", "s", [400], 0, 0], ["Wire One", "s", [400], 0, 0], ["Nova Round", "d", [400], 0, 0], ["Geom", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["Momo Trust Sans", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Artifika", "r", [400], 0, 0], ["Noto Serif Kannada", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Iceland", "d", [400], 0, 0], ["Monofett", "m", [400], 0, 0], ["Holtwood One SC", "r", [400], 0, 0], ["Sevillana", "d", [400], 0, 0], ["Cairo Play", "s", [200, 300, 400, 500, 600, 700, 800, 900, 1000], [200, 1000], 0], ["Asimovian", "s", [400], 0, 0], ["Timmana", "s", [400], 0, 0], ["Metal", "d", [400], 0, 0], ["Bungee Spice", "d", [400], 0, 0], ["Mea Culpa", "h", [400], 0, 0], ["Pavanam", "s", [400], 0, 0], ["Estedad", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["BBH Bartle", "s", [400], 0, 0], ["Baskervville SC", "r", [400, 500, 600, 700], [400, 700], 0], ["Margarine", "d", [400], 0, 0], ["Licorice", "h", [400], 0, 0], ["Overlock SC", "d", [400], 0, 0], ["Honk", "d", [400], 0, 0], ["Sansation", "s", [300, 400, 700], 0, 1], ["Mako", "s", [400], 0, 0], ["Badeen Display", "d", [400], 0, 0], ["Shanti", "s", [400], 0, 0], ["Sunshiney", "h", [400], 0, 0], ["Liter", "s", [400], 0, 0], ["Nova Slim", "d", [400], 0, 0], ["Sono", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Marhey", "d", [300, 400, 500, 600, 700], [300, 700], 0], ["Ceviche One", "d", [400], 0, 0], ["Rubik Moonrocks", "d", [400], 0, 0], ["Mynerve", "h", [400], 0, 0], ["Gugi", "d", [400], 0, 0], ["Kavivanar", "h", [400], 0, 0], ["Stoke", "r", [300, 400], 0, 0], ["Ysabeau", "s", [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [1, 1000], 1], ["Stint Ultra Condensed", "r", [400], 0, 0], ["Hubot Sans", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Belgrano", "r", [400], 0, 0], ["Engagement", "h", [400], 0, 0], ["Fenix", "r", [400], 0, 0], ["Sura", "r", [400, 700], 0, 0], ["Noto Music", "s", [400], 0, 0], ["Zen Tokyo Zoo", "d", [400], 0, 0], ["Mate SC", "r", [400], 0, 0], ["Cute Font", "d", [400], 0, 0], ["Smooch", "h", [400], 0, 0], ["Akaya Telivigala", "d", [400], 0, 0], ["Noto Sans Canadian Aboriginal", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Trispace", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["IBM Plex Sans Devanagari", "s", [100, 200, 300, 400, 500, 600, 700], 0, 0], ["Maiden Orange", "r", [400], 0, 0], ["Firjar", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Stylish", "s", [400], 0, 0], ["Geostar Fill", "d", [400], 0, 0], ["Mystery Quest", "d", [400], 0, 0], ["Suwannaphum", "r", [100, 300, 400, 700, 900], 0, 0], ["Gentium Plus", "r", [400, 700], 0, 1], ["Devonshire", "h", [400], 0, 0], ["Manuale", "r", [300, 400, 500, 600, 700, 800], [300, 800], 1], ["Akronim", "d", [400], 0, 0], ["Loved by the King", "h", [400], 0, 0], ["Nabla", "d", [400], 0, 0], ["Noto Sans Elbasan", "s", [400], 0, 0], ["Zilla Slab Highlight", "r", [400, 700], 0, 0], ["Jaro", "s", [400], 0, 0], ["Moderustic", "s", [300, 400, 500, 600, 700, 800], [300, 800], 0], ["Sirin Stencil", "d", [400], 0, 0], ["Risque", "d", [400], 0, 0], ["Rum Raisin", "s", [400], 0, 0], ["Tauri", "s", [400], 0, 0], ["Encode Sans SC", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Akaya Kanadaka", "d", [400], 0, 0], ["Smokum", "d", [400], 0, 0], ["The Nautigal", "h", [400, 700], 0, 0], ["Lovers Quarrel", "h", [400], 0, 0], ["Passions Conflict", "h", [400], 0, 0], ["Shippori Antique B1", "s", [400], 0, 0], ["Manufacturing Consent", "d", [400], 0, 0], ["Flamenco", "d", [300, 400], 0, 0], ["Moul", "d", [400], 0, 0], ["Comforter", "h", [400], 0, 0], ["BBH Hegarty", "s", [400], 0, 0], ["Joan", "r", [400], 0, 0], ["Bilbo", "h", [400], 0, 0], ["Unlock", "d", [400], 0, 0], ["Londrina Outline", "d", [400], 0, 0], ["Modern Antiqua", "d", [400], 0, 0], ["Englebert", "s", [400], 0, 0], ["Winky Sans", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["Noto Serif Gujarati", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Festive", "h", [400], 0, 0], ["IM Fell DW Pica SC", "r", [400], 0, 0], ["Yeon Sung", "d", [400], 0, 0], ["Nerko One", "h", [400], 0, 0], ["Spirax", "d", [400], 0, 0], ["Arsenal SC", "s", [400, 700], 0, 1], ["Stalemate", "h", [400], 0, 0], ["Milonga", "d", [400], 0, 0], ["Erica One", "d", [400], 0, 0], ["Tillana", "d", [400, 500, 600, 700, 800], 0, 0], ["Redacted", "d", [400], 0, 0], ["Agrave Pro", "h", [100, 200, 300, 400, 500, 600, 700], [100, 700], 0], ["Swanky and Moo Moo", "h", [400], 0, 0], ["Kapakana", "h", [300, 400], [300, 400], 0], ["Katibeh", "d", [400], 0, 0], ["Carrois Gothic SC", "s", [400], 0, 0], ["Poor Story", "d", [400], 0, 0], ["Castoro Titling", "d", [400], 0, 0], ["Fascinate", "d", [400], 0, 0], ["Akt", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Lexend Mega", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Port Lligat Slab", "r", [400], 0, 0], ["Strait", "s", [400], 0, 0], ["Braah One", "s", [400], 0, 0], ["Stack Sans Notch", "s", [200, 300, 400, 500, 600, 700], [200, 700], 0], ["Nova Flat", "d", [400], 0, 0], ["Grape Nuts", "h", [400], 0, 0], ["Dorsa", "s", [400], 0, 0], ["Solitreo", "h", [400], 0, 0], ["Monomakh", "d", [400], 0, 0], ["Edu AU VIC WA NT Hand", "h", [400, 500, 600, 700], [400, 700], 0], ["Liu Jian Mao Cao", "h", [400], 0, 0], ["Srisakdi", "d", [400, 700], 0, 0], ["Ramaraja", "r", [400], 0, 0], ["Playpen Sans Arabic", "h", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Griffy", "d", [400], 0, 0], ["SN Pro", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Text Me One", "s", [400], 0, 0], ["Gwendolyn", "h", [400, 700], 0, 0], ["Lugrasimo", "h", [400], 0, 0], ["Dekko", "h", [400], 0, 0], ["Beiruti", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Sassy Frass", "h", [400], 0, 0], ["Noto Sans Thaana", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Paprika", "d", [400], 0, 0], ["Barrio", "d", [400], 0, 0], ["Junge", "r", [400], 0, 0], ["Noto Sans Tagalog", "s", [400], 0, 0], ["Tiro Devanagari Marathi", "r", [400], 0, 1], ["Noto Serif Armenian", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Kotta One", "r", [400], 0, 0], ["Yarndings 20 Charted", "d", [400], 0, 0], ["Jacquard 12", "d", [400], 0, 0], ["Glass Antiqua", "d", [400], 0, 0], ["Kaisei HarunoUmi", "r", [400, 500, 700], 0, 0], ["Pliant", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Jacques Francois", "r", [400], 0, 0], ["Noto Serif Gurmukhi", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Island Moments", "h", [400], 0, 0], ["Inika", "r", [400, 700], 0, 0], ["Arbutus", "r", [400], 0, 0], ["Romanesco", "h", [400], 0, 0], ["Gupter", "r", [400, 500, 700], 0, 0], ["Cantora One", "s", [400], 0, 0], ["Sree Krushnadevaraya", "r", [400], 0, 0], ["Water Brush", "h", [400], 0, 0], ["Bruno Ace SC", "d", [400], 0, 0], ["Bruno Ace", "d", [400], 0, 0], ["Cagliostro", "s", [400], 0, 0], ["Shalimar", "h", [400], 0, 0], ["Linden Hill", "r", [400], 0, 1], ["Asset", "d", [400], 0, 0], ["Iansui", "h", [400], 0, 0], ["Autour One", "d", [400], 0, 0], ["Nova Oval", "d", [400], 0, 0], ["Big Shoulders Stencil", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Bitcount Grid Double", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Galindo", "d", [400], 0, 0], ["Jersey 15", "d", [400], 0, 0], ["Sonsie One", "d", [400], 0, 0], ["Lexend Tera", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Anek Odia", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Luxurious Roman", "d", [400], 0, 0], ["Mogra", "d", [400], 0, 0], ["Meera Inimai", "s", [400], 0, 0], ["Ysabeau Infant", "s", [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [1, 1000], 1], ["Chathura", "s", [100, 300, 400, 700, 800], 0, 0], ["Send Flowers", "h", [400], 0, 0], ["Jacques Francois Shadow", "d", [400], 0, 0], ["Kenia", "d", [400], 0, 0], ["IM Fell French Canon SC", "r", [400], 0, 0], ["Princess Sofia", "h", [400], 0, 0], ["IM Fell Double Pica SC", "r", [400], 0, 0], ["Noto Sans Sora Sompeng", "s", [400, 500, 600, 700], [400, 700], 0], ["Elsie Swash Caps", "d", [400, 900], 0, 0], ["Mr Bedfort", "h", [400], 0, 0], ["Miltonian", "d", [400], 0, 0], ["Texturina", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Libre Barcode EAN13 Text", "d", [400], 0, 0], ["Sigmar", "d", [400], 0, 0], ["Reem Kufi Fun", "s", [400, 500, 600, 700], [400, 700], 0], ["Underdog", "d", [400], 0, 0], ["WDXL Lubrifont JP N", "s", [400], 0, 0], ["Trykker", "r", [400], 0, 0], ["Kite One", "s", [400], 0, 0], ["Bigelow Rules", "d", [400], 0, 0], ["Marko One", "r", [400], 0, 0], ["Stint Ultra Expanded", "r", [400], 0, 0], ["Gorditas", "d", [400, 700], 0, 0], ["Dhurjati", "s", [400], 0, 0], ["Datatype", "m", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Donegal One", "r", [400], 0, 0], ["Annapurna SIL", "r", [400, 700], 0, 0], ["Gveret Levin", "h", [400], 0, 0], ["Almendra SC", "r", [400], 0, 0], ["Simonetta", "d", [400, 900], 0, 1], ["Noto Rashi Hebrew", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Epunda Sans", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["Tiro Telugu", "r", [400], 0, 1], ["Averia Gruesa Libre", "d", [400], 0, 0], ["Fascinate Inline", "d", [400], 0, 0], ["Cascadia Code", "s", [200, 300, 400, 500, 600, 700], [200, 700], 1], ["Rubik Scribble", "d", [400], 0, 0], ["Ewert", "d", [400], 0, 0], ["Chela One", "d", [400], 0, 0], ["Chiron Hei HK", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Gideon Roman", "d", [400], 0, 0], ["Sedan", "r", [400], 0, 1], ["Yaldevi", "s", [200, 300, 400, 500, 600, 700], [200, 700], 0], ["Oi", "d", [400], 0, 0], ["SUSE Mono", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 1], ["Noto Sans Gothic", "s", [400], 0, 0], ["Odibee Sans", "d", [400], 0, 0], ["Londrina Shadow", "d", [400], 0, 0], ["New Amsterdam", "s", [400], 0, 0], ["Libre Barcode 39 Extended", "d", [400], 0, 0], ["Jersey 20", "d", [400], 0, 0], ["Comforter Brush", "h", [400], 0, 0], ["Farsan", "d", [400], 0, 0], ["Offside", "d", [400], 0, 0], ["Noto Sans Tai Viet", "s", [400], 0, 0], ["New Tegomin", "r", [400], 0, 0], ["Seymour One", "s", [400], 0, 0], ["Bonbon", "h", [400], 0, 0], ["Cascadia Mono", "s", [200, 300, 400, 500, 600, 700], [200, 700], 1], ["Joti One", "d", [400], 0, 0], ["Almendra Display", "d", [400], 0, 0], ["IM Fell Great Primer SC", "r", [400], 0, 0], ["Intel One Mono", "m", [300, 400, 500, 600, 700], [300, 700], 1], ["Alumni Sans Pinstripe", "s", [400], 0, 1], ["Ravi Prakash", "d", [400], 0, 0], ["Orbit", "s", [400], 0, 0], ["Ojuju", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Fleur De Leah", "h", [400], 0, 0], ["Smythe", "d", [400], 0, 0], ["Chilanka", "h", [400], 0, 0], ["Ruluko", "s", [400], 0, 0], ["Benne", "r", [400], 0, 0], ["Tac One", "s", [400], 0, 0], ["Jim Nightshade", "h", [400], 0, 0], ["Tulpen One", "d", [400], 0, 0], ["Bubbler One", "s", [400], 0, 0], ["Emblema One", "d", [400], 0, 0], ["Praise", "h", [400], 0, 0], ["Kedebideri", "s", [400, 500, 600, 700, 800, 900], 0, 0], ["Piedra", "d", [400], 0, 0], ["Playpen Sans Hebrew", "h", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Konkhmer Sleokchher", "d", [400], 0, 0], ["Lakki Reddy", "h", [400], 0, 0], ["Kings", "h", [400], 0, 0], ["Noto Sans Vai", "s", [400], 0, 0], ["Buda", "d", [300], 0, 0], ["Neonderthaw", "h", [400], 0, 0], ["Purple Purse", "d", [400], 0, 0], ["Galdeano", "s", [400], 0, 0], ["Miranda Sans", "s", [400, 500, 600, 700], [400, 700], 1], ["LXGW WenKai Mono TC", "m", [300, 400, 700], 0, 0], ["Keania One", "d", [400], 0, 0], ["Butcherman", "d", [400], 0, 0], ["Dai Banna SIL", "r", [300, 400, 500, 600, 700], 0, 1], ["Noto Sans Limbu", "s", [400], 0, 0], ["Noto Sans Buhid", "s", [400], 0, 0], ["Grey Qo", "h", [400], 0, 0], ["Astloch", "d", [400, 700], 0, 0], ["Sedan SC", "r", [400], 0, 0], ["Nova Cut", "d", [400], 0, 0], ["Tilt Prism", "d", [400], 0, 0], ["Diplomata", "d", [400], 0, 0], ["Nuosu SIL", "s", [400], 0, 0], ["Odor Mean Chey", "r", [400], 0, 0], ["Sofadi One", "d", [400], 0, 0], ["Condiment", "h", [400], 0, 0], ["Noto Serif Ethiopic", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Hubballi", "s", [400], 0, 0], ["Bahiana", "d", [400], 0, 0], ["Twinkle Star", "h", [400], 0, 0], ["Wellfleet", "r", [400], 0, 0], ["Felipa", "h", [400], 0, 0], ["Gidugu", "s", [400], 0, 0], ["Noto Sans Javanese", "s", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Kaithi", "s", [400], 0, 0], ["Anek Gurmukhi", "s", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Sixtyfour", "m", [400], 0, 0], ["TASA Explorer", "s", [400, 500, 600, 700, 800], [400, 800], 0], ["GFS Neohellenic", "s", [400, 700], 0, 1], ["Fruktur", "d", [400], 0, 1], ["Miltonian Tattoo", "d", [400], 0, 0], ["Love Light", "h", [400], 0, 0], ["Noto Serif Sinhala", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Jacquard 24", "d", [400], 0, 0], ["Vampiro One", "d", [400], 0, 0], ["Rubik Burned", "d", [400], 0, 0], ["Plaster", "d", [400], 0, 0], ["Rhodium Libre", "r", [400], 0, 0], ["Oldenburg", "d", [400], 0, 0], ["Noto Sans Coptic", "s", [400], 0, 0], ["Edu NSW ACT Foundation", "h", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Lao Looped", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Ribeye Marrow", "d", [400], 0, 0], ["Bacasime Antique", "r", [400], 0, 0], ["Babylonica", "h", [400], 0, 0], ["Geist Pixel", "d", [400], 0, 0], ["Sahitya", "r", [400, 700], 0, 0], ["Bungee Hairline", "d", [400], 0, 0], ["Foldit", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Caramel", "h", [400], 0, 0], ["Updock", "h", [400], 0, 0], ["Kumar One", "d", [400], 0, 0], ["Idiqlat", "r", [200, 300, 400], 0, 0], ["Ancizar Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], [100, 1000], 1], ["Cossette Texte", "s", [400, 700], 0, 0], ["Nova Script", "d", [400], 0, 0], ["Alumni Sans Inline One", "d", [400], 0, 1], ["WDXL Lubrifont SC", "s", [400], 0, 0], ["Bungee Outline", "d", [400], 0, 0], ["Noto Sans Osmanya", "s", [400], 0, 0], ["Noto Sans Takri", "s", [400], 0, 0], ["Snippet", "s", [400], 0, 0], ["Uchen", "r", [400], 0, 0], ["Diplomata SC", "d", [400], 0, 0], ["Isometra", "r", [400], 0, 0], ["Mrs Sheppards", "h", [400], 0, 0], ["Tuffy", "s", [400, 700], 0, 1], ["Miss Fajardose", "h", [400], 0, 0], ["Bitcount Prop Single", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Chiron Sung HK", "r", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Lancelot", "d", [400], 0, 0], ["Sixtyfour Convergence", "m", [400], 0, 0], ["Inspiration", "h", [400], 0, 0], ["Diphylleia", "r", [400], 0, 0], ["Preahvihear", "s", [400], 0, 0], ["Noto Sans Tangsa", "s", [400, 500, 600, 700], [400, 700], 0], ["Londrina Sketch", "d", [400], 0, 0], ["Molle", "h", [400], 0, 1], ["Dr Sugiyama", "h", [400], 0, 0], ["Tiro Tamil", "r", [400], 0, 1], ["Noto Sans Anatolian Hieroglyphs", "s", [400], 0, 0], ["Rubik Distressed", "d", [400], 0, 0], ["Noto Sans Tai Le", "s", [400], 0, 0], ["Noto Sans Runic", "s", [400], 0, 0], ["Flavors", "d", [400], 0, 0], ["Kirang Haerang", "d", [400], 0, 0], ["Peddana", "r", [400], 0, 0], ["Noto Sans Adlam", "s", [400, 500, 600, 700], [400, 700], 0], ["Alyamama", "r", [300, 400, 500, 600, 700, 800, 900], [300, 900], 0], ["Iosevka Charon Mono", "m", [300, 400, 500, 700], 0, 1], ["Clarity City", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Shizuru", "d", [400], 0, 0], ["Reem Kufi Ink", "s", [400], 0, 0], ["Alumni Sans Collegiate One", "s", [400], 0, 1], ["My Soul", "h", [400], 0, 0], ["Ruge Boogie", "h", [400], 0, 0], ["Gidole", "s", [400], 0, 0], ["Noto Sans Wancho", "s", [400], 0, 0], ["Amarna", "s", [100, 200, 300, 400, 500, 600, 700], [100, 700], 1], ["Rubik Iso", "d", [400], 0, 0], ["Noto Sans New Tai Lue", "s", [400, 500, 600, 700], [400, 700], 0], ["Rubik Storm", "d", [400], 0, 0], ["Micro 5", "d", [400], 0, 0], ["Passero One", "d", [400], 0, 0], ["Iosevka Charon", "m", [300, 400, 500, 700], 0, 1], ["Jacquarda Bastarda 9", "d", [400], 0, 0], ["Bungee Tint", "d", [400], 0, 0], ["Langar", "d", [400], 0, 0], ["Stalinist One", "d", [400], 0, 0], ["Kolker Brush", "h", [400], 0, 0], ["Libre Caslon Condensed", "r", [400, 500, 600, 700], [400, 700], 1], ["Ranga", "d", [400, 700], 0, 0], ["Lunasima", "s", [400, 700], 0, 0], ["Aref Ruqaa Ink", "r", [400, 700], 0, 0], ["Cossette Titre", "s", [400, 700], 0, 0], ["Triodion", "d", [400], 0, 0], ["Noto Sans Mende Kikakui", "s", [400], 0, 0], ["Edu SA Beginner", "h", [400, 500, 600, 700], [400, 700], 0], ["Tiro Kannada", "r", [400], 0, 1], ["Noto Sans Shavian", "s", [400], 0, 0], ["Rubik Vinyl", "d", [400], 0, 0], ["Noto Sans Linear A", "s", [400], 0, 0], ["UoqMunThenKhung", "r", [400], 0, 0], ["Valley Sans", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Tapestry", "h", [400], 0, 0], ["Blaka", "d", [400], 0, 0], ["Hanalei Fill", "d", [400], 0, 0], ["BioRhyme Expanded", "r", [200, 300, 400, 700, 800], 0, 0], ["Noto Sans Hanunoo", "s", [400], 0, 0], ["Noto Sans Pahawh Hmong", "s", [400], 0, 0], ["Noto Sans Cherokee", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Bitcount Grid Single", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Noto Sans Nag Mundari", "s", [400, 500, 600, 700], [400, 700], 0], ["Aubrey", "d", [400], 0, 0], ["Revalia", "d", [400], 0, 0], ["Grechen Fuemen", "h", [400], 0, 0], ["Noto Sans Egyptian Hieroglyphs", "s", [400], 0, 0], ["Noto Serif Balinese", "r", [400], 0, 0], ["Noto Serif Tangut", "r", [400], 0, 0], ["Noto Serif Lao", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Edu VIC WA NT Beginner", "h", [400, 500, 600, 700], [400, 700], 0], ["Ubuntu Sans Mono", "m", [400, 500, 600, 700], [400, 700], 1], ["Trochut", "d", [400, 700], 0, 1], ["Rubik Glitch Pop", "d", [400], 0, 0], ["Black And White Picture", "d", [400], 0, 0], ["Slackside One", "h", [400], 0, 0], ["Winky Rough", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["Explora", "h", [400], 0, 0], ["Butterfly Kids", "h", [400], 0, 0], ["Tsukimi Rounded", "s", [300, 400, 500, 600, 700], 0, 0], ["Redacted Script", "d", [300, 400, 700], 0, 0], ["Noto Sans Old Persian", "s", [400], 0, 0], ["Splash", "h", [400], 0, 0], ["LXGW Marker Gothic", "s", [400], 0, 0], ["Cherish", "h", [400], 0, 0], ["Noto Serif Dives Akuru", "r", [400], 0, 0], ["Suravaram", "r", [400], 0, 0], ["Matemasie", "s", [400], 0, 0], ["Tai Heritage Pro", "r", [400, 700], 0, 0], ["Are You Serious", "h", [400], 0, 0], ["Noto Sans Cypro Minoan", "s", [400], 0, 0], ["Edu AU VIC WA NT Dots", "h", [400, 500, 600, 700], [400, 700], 0], ["Rubik Microbe", "d", [400], 0, 0], ["Rubik Gemstones", "d", [400], 0, 0], ["Namdhinggo", "r", [400, 500, 600, 700, 800], 0, 0], ["Cause", "h", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Zen Loop", "d", [400], 0, 1], ["Menbere", "s", [100, 200, 300, 400, 500, 600, 700], [100, 700], 0], ["Estonia", "h", [400], 0, 0], ["Epunda Slab", "r", [300, 400, 500, 600, 700, 800, 900], [300, 900], 1], ["Moulpali", "s", [400], 0, 0], ["Redaction", "r", [400, 700], 0, 1], ["Noto Sans Syriac", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Rubik Beastly", "d", [400], 0, 0], ["Noto Sans Chakma", "s", [400], 0, 0], ["Noto Sans Vithkuqi", "s", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Batak", "s", [400], 0, 0], ["Workbench", "m", [400], 0, 0], ["Rubik 80s Fade", "d", [400], 0, 0], ["Alumni Sans SC", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Exile", "d", [400], 0, 0], ["Vibes", "d", [400], 0, 0], ["Protest Guerrilla", "d", [400], 0, 0], ["Playpen Sans Thai", "h", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Tiro Gurmukhi", "r", [400], 0, 1], ["Noto Sans Yi", "s", [400], 0, 0], ["Lumanosimo", "h", [400], 0, 0], ["WDXL Lubrifont TC", "s", [400], 0, 0], ["Snowburst One", "d", [400], 0, 0], ["Libertinus Mono", "m", [400], 0, 0], ["Lilex", "m", [100, 200, 300, 400, 500, 600, 700], [100, 700], 1], ["Syne Tactile", "d", [400], 0, 0], ["Rubik Marker Hatch", "d", [400], 0, 0], ["Labrada", "r", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Noto Sans Tifinagh", "s", [400], 0, 0], ["Edu AU VIC WA NT Guides", "h", [400, 500, 600, 700], [400, 700], 0], ["Taprom", "d", [400], 0, 0], ["Savate", "s", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 1], ["Ponomar", "d", [400], 0, 0], ["Noto Sans Carian", "s", [400], 0, 0], ["Petemoss", "h", [400], 0, 0], ["Libertinus Serif Display", "d", [400], 0, 0], ["Kanchenjunga", "s", [400, 500, 600, 700], 0, 0], ["Coral Pixels", "d", [400], 0, 0], ["Noto Sans Multani", "s", [400], 0, 0], ["Gajraj One", "d", [400], 0, 0], ["Noto Serif Ahom", "r", [400], 0, 0], ["Rubik Puddles", "d", [400], 0, 0], ["Tirra", "s", [400, 500, 600, 700, 800, 900], 0, 0], ["Combo", "d", [400], 0, 0], ["Ole", "h", [400], 0, 0], ["Noto Serif Toto", "r", [400, 500, 600, 700], [400, 700], 0], ["Flow Block", "d", [400], 0, 0], ["Noto Sans NKo", "s", [400], 0, 0], ["Narnoor", "s", [400, 500, 600, 700, 800], 0, 0], ["M PLUS Code Latin", "s", [100, 200, 300, 400, 500, 600, 700], [100, 700], 0], ["Moo Lah Lah", "d", [400], 0, 0], ["Parastoo", "r", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Marchen", "s", [400], 0, 0], ["Rubik Pixels", "d", [400], 0, 0], ["Edu SA Hand", "h", [400, 500, 600, 700], [400, 700], 0], ["Grandiflora One", "r", [400], 0, 0], ["Bpmf Huninn", "s", [400], 0, 0], ["Noto Sans Nabataean", "s", [400], 0, 0], ["Noto Sans Sunuwar", "s", [400], 0, 0], ["Noto Sans Glagolitic", "s", [400], 0, 0], ["Bpmf Zihi Kai Std", "s", [400], 0, 0], ["Noto Sans Old Italic", "s", [400], 0, 0], ["Kumar One Outline", "d", [400], 0, 0], ["Noto Sans Old Permic", "s", [400], 0, 0], ["Noto Serif Oriya", "r", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Nandinagari", "s", [400], 0, 0], ["Noto Serif Hentaigana", "r", [200, 300, 400, 500, 600, 700, 800, 900], [200, 900], 0], ["Sirivennela", "s", [400], 0, 0], ["Rubik Broken Fax", "d", [400], 0, 0], ["Noto Sans Sundanese", "s", [400, 500, 600, 700], [400, 700], 0], ["Kalnia Glaze", "d", [100, 200, 300, 400, 500, 600, 700], [100, 700], 0], ["Noto Sans Bhaiksuki", "s", [400], 0, 0], ["Noto Serif Vithkuqi", "r", [400, 500, 600, 700], [400, 700], 0], ["Noto Serif Yezidi", "r", [400, 500, 600, 700], [400, 700], 0], ["Palette Mosaic", "d", [400], 0, 0], ["Moirai One", "d", [400], 0, 0], ["Agu Display", "d", [400], 0, 0], ["Noto Sans Indic Siyaq Numbers", "s", [400], 0, 0], ["Geostar", "d", [400], 0, 0], ["Edu QLD Beginner", "h", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Old Turkic", "s", [400], 0, 0], ["Bitcount", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Rock 3D", "d", [400], 0, 0], ["Tagesschrift", "d", [400], 0, 0], ["Ga Maamli", "d", [400], 0, 0], ["Playpen Sans Deva", "h", [100, 200, 300, 400, 500, 600, 700, 800], [100, 800], 0], ["Asap Sharp", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Noto Sans Syloti Nagri", "s", [400], 0, 0], ["Ingrid Darling", "h", [400], 0, 0], ["Noto Sans Old Hungarian", "s", [400], 0, 0], ["Noto Traditional Nushu", "s", [300, 400, 500, 600, 700], [300, 700], 0], ["Tiny5 Duo", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Noto Sans Brahmi", "s", [400], 0, 0], ["Lisu Bosa", "r", [200, 300, 400, 500, 600, 700, 800, 900], 0, 1], ["Redaction 50", "d", [400, 700], 0, 1], ["Flow Rounded", "d", [400], 0, 0], ["Noto Serif NP Hmong", "r", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Duployan", "s", [400, 700], 0, 0], ["Edu QLD Hand", "h", [400, 500, 600, 700], [400, 700], 0], ["Jaini Purva", "d", [400], 0, 0], ["Scoutie Sans", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 1], ["Noto Serif Dogra", "r", [400], 0, 0], ["Noto Sans Lisu", "s", [400, 500, 600, 700], [400, 700], 0], ["Danfo", "r", [400], 0, 0], ["Puppies Play", "h", [400], 0, 0], ["Noto Sans Adlam Unjoined", "s", [400, 500, 600, 700], [400, 700], 0], ["Hibur Mono", "m", [400], 0, 0], ["Hind Mysuru", "s", [300, 400, 500, 600, 700], 0, 0], ["Noto Sans Avestan", "s", [400], 0, 0], ["Rubik Maps", "d", [400], 0, 0], ["Geomini", "s", [200, 300, 400, 500, 600, 700, 800], [200, 800], 0], ["Bahianita", "d", [400], 0, 0], ["Bpmf Iansui", "h", [400], 0, 0], ["Chokokutai", "d", [400], 0, 0], ["Big Shoulders Inline", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Redaction 70", "d", [400, 700], 0, 1], ["Noto Sans Balinese", "s", [400, 500, 600, 700], [400, 700], 0], ["Redaction 10", "r", [400, 700], 0, 1], ["Finlandica Headline", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Pochaevsk", "d", [400], 0, 0], ["Shafarik", "d", [400], 0, 0], ["Redaction 35", "d", [400, 700], 0, 1], ["Noto Sans Lydian", "s", [400], 0, 0], ["Maname", "r", [400], 0, 0], ["Noto Sans Meroitic", "s", [400], 0, 0], ["Noto Sans Cuneiform", "s", [400], 0, 0], ["Noto Sans Siddham", "s", [400], 0, 0], ["Redaction 20", "r", [400, 700], 0, 1], ["Noto Sans Osage", "s", [400], 0, 0], ["Noto Sans Medefaidrin", "s", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Old North Arabian", "s", [400], 0, 0], ["Rubik Maze", "d", [400], 0, 0], ["Redaction 100", "d", [400, 700], 0, 1], ["Bytesized", "s", [400], 0, 0], ["Noto Sans Grantha", "s", [400], 0, 0], ["Xmind", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Noto Sans Bamum", "s", [400, 500, 600, 700], [400, 700], 0], ["Ponnala", "d", [400], 0, 0], ["Bitcount Single Ink", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Noto Sans Tamil Supplement", "s", [400], 0, 0], ["Noto Serif Todhri", "r", [400], 0, 0], ["Hanalei", "d", [400], 0, 0], ["Mingzat", "s", [400], 0, 0], ["Noto Serif Grantha", "r", [400], 0, 0], ["Alien Block", "d", [400], 0, 0], ["Noto Sans Syriac Eastern", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Noto Sans Buginese", "s", [400], 0, 0], ["Noto Sans Inscriptional Parthian", "s", [400], 0, 0], ["Edu AU VIC WA NT Pre", "h", [400, 500, 600, 700], [400, 700], 0], ["Rubik Doodle Triangles", "d", [400], 0, 0], ["Bitcount Prop Double", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Edu VIC WA NT Hand Pre", "h", [400, 500, 600, 700], [400, 700], 0], ["Jaini", "d", [400], 0, 0], ["Yarndings 12", "d", [400], 0, 0], ["Saira Stencil", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 1], ["Yuji Hentaigana Akari", "h", [400], 0, 0], ["Noto Sans Inscriptional Pahlavi", "s", [400], 0, 0], ["Noto Sans Newa", "s", [400], 0, 0], ["Noto Sans Mahajani", "s", [400], 0, 0], ["Montenegrin Gothic One", "r", [400], 0, 0], ["Noto Sans Cham", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Noto Sans Khojki", "s", [400], 0, 0], ["Noto Serif Makasar", "r", [400], 0, 0], ["Noto Serif Ottoman Siyaq", "r", [400], 0, 0], ["Blaka Ink", "d", [400], 0, 0], ["Sankofa Display", "s", [400], 0, 0], ["Noto Sans Phoenician", "s", [400], 0, 0], ["Edu AU VIC WA NT Arrows", "h", [400, 500, 600, 700], [400, 700], 0], ["Warnes", "d", [400], 0, 0], ["Noto Sans Ugaritic", "s", [400], 0, 0], ["Rubik Lines", "d", [400], 0, 0], ["Yuyu Short", "h", [400], 0, 0], ["Noto Sans NKo Unjoined", "s", [400, 500, 600, 700], [400, 700], 0], ["Blaka Hollow", "d", [400], 0, 0], ["Noto Sans Tai Tham", "s", [400, 500, 600, 700], [400, 700], 0], ["Bitcount Ink", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["BJCree", "r", [400, 500, 600, 700], 0, 0], ["Noto Sans Zanabazar Square", "s", [400], 0, 0], ["Noto Sans Deseret", "s", [400], 0, 0], ["Noto Sans Imperial Aramaic", "s", [400], 0, 0], ["Padyakke Expanded One", "r", [400], 0, 0], ["Micro 5 Charted", "d", [400], 0, 0], ["Libertinus Keyboard", "d", [400], 0, 0], ["Yuyu", "h", [400], 0, 0], ["Bitcount Grid Double Ink", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Noto Sans Sharada", "s", [400], 0, 0], ["Strichpunkt Sans", "s", [400, 500, 600, 700, 800, 900], [400, 900], 0], ["Noto Sans Tagbanwa", "s", [400], 0, 0], ["Kay Pho Du", "r", [400, 500, 600, 700], 0, 0], ["Noto Sans Palmyrene", "s", [400], 0, 0], ["Yarndings 12 Charted", "d", [400], 0, 0], ["Noto Serif Khitan Small Script", "r", [400], 0, 0], ["Jacquard 12 Charted", "d", [400], 0, 0], ["Bitcount Grid Single Ink", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Edu VIC WA NT Hand", "h", [400, 500, 600, 700], [400, 700], 0], ["Yarndings 20", "d", [400], 0, 0], ["Bitcount Prop Double Ink", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Noto Znamenny Musical Notation", "s", [400], 0, 0], ["Jacquard 24 Charted", "d", [400], 0, 0], ["Noto Sans Kawi", "s", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Miao", "s", [400], 0, 0], ["Noto Sans Mayan Numerals", "s", [400], 0, 0], ["Noto Serif Old Uyghur", "r", [400], 0, 0], ["Noto Sans Old South Arabian", "s", [400], 0, 0], ["Noto Sans Kayah Li", "s", [400, 500, 600, 700], [400, 700], 0], ["Yuji Hentaigana Akebono", "h", [400], 0, 0], ["Caacupe One", "d", [400], 0, 0], ["Betania Patmos In GDL", "h", [400], 0, 0], ["Edu NSW ACT Hand Pre", "h", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Masaram Gondi", "s", [400], 0, 0], ["Bitcount Prop Single Ink", "d", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Jersey 10 Charted", "d", [400], 0, 0], ["Noto Sans Elymaic", "s", [400], 0, 0], ["Noto Sans Caucasian Albanian", "s", [400], 0, 0], ["Noto Sans Kharoshthi", "s", [400], 0, 0], ["Ramsina", "r", [400], 0, 0], ["Matangi", "s", [300, 400, 500, 600, 700, 800, 900], [300, 900], 0], ["Noto Sans Syriac Western", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Noto Sans SignWriting", "s", [400], 0, 0], ["Jersey 25 Charted", "d", [400], 0, 0], ["Noto Sans Lepcha", "s", [400], 0, 0], ["Noto Sans Hatran", "s", [400], 0, 0], ["Jersey 15 Charted", "d", [400], 0, 0], ["Noto Sans Rejang", "s", [400], 0, 0], ["Betania Patmos", "h", [400], 0, 0], ["Noto Sans Soyombo", "s", [400], 0, 0], ["Kripa", "s", [100, 200, 300, 400, 500, 600, 700, 800, 900], [100, 900], 0], ["Noto Sans Bassa Vah", "s", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Linear B", "s", [400], 0, 0], ["Noto Sans Sogdian", "s", [400], 0, 0], ["Jacquarda Bastarda 9 Charted", "d", [400], 0, 0], ["Noto Sans Psalter Pahlavi", "s", [400], 0, 0], ["Noto Sans Saurashtra", "s", [400], 0, 0], ["Noto Sans Khudawadi", "s", [400], 0, 0], ["Noto Sans Hanifi Rohingya", "s", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans PhagsPa", "s", [400], 0, 0], ["Noto Sans Gunjala Gondi", "s", [400, 500, 600, 700], [400, 700], 0], ["Noto Sans Old Sogdian", "s", [400], 0, 0], ["Noto Sans Pau Cin Hau", "s", [400], 0, 0], ["Noto Sans Chorasmian", "s", [400], 0, 0], ["Noto Sans Ogham", "s", [400], 0, 0], ["Noto Sans Modi", "s", [400], 0, 0], ["Noto Sans Mro", "s", [400], 0, 0], ["Noto Sans Tirhuta", "s", [400], 0, 0], ["Noto Sans Manichaean", "s", [400], 0, 0], ["Jersey 20 Charted", "d", [400], 0, 0], ["Betania Patmos In", "h", [400], 0, 0], ["Noto Sans Mandaic", "s", [400], 0, 0], ["Betania Patmos GDL", "h", [400], 0, 0], ["Noto Sans Nushu", "s", [400], 0, 0]];

// src/lib/spring/fonts-any.ts
var TAG = { s: "sans", r: "serif", d: "display", m: "mono", h: "hand" };
var CATALOGUE = new Map(google_fonts_default.map((r) => [r[0].toLowerCase(), r]));
function withFonts(raw, notes) {
  const type = raw.type ?? {};
  const extra = { ...type.extra };
  for (const role of ["body", "heading", "mono"]) {
    const f = type[role];
    if (typeof f !== "string" || isCurated(f) || extra[f])
      continue;
    const r = CATALOGUE.get(f.toLowerCase());
    if (!r) {
      notes.push(`type.${role}: "${f}" isn't a Google font Spring knows; used the default.`);
      continue;
    }
    type[role] = r[0];
    extra[r[0]] = { tag: TAG[r[1]] ?? "sans", weights: r[2], variable: r[3] || null };
  }
  if (Object.keys(extra).length)
    type.extra = extra;
  raw.type = type;
}

// src/lib/spring/tokens.ts
var VIEW_SCHEMA_URL = "https://someshks.com/spring/view.schema.json";
var MAX_TOKENS = 3000;
var MAX_SCOPED = 40;
var MAX_MODES = 8;
var RESOLVED_MAX = 2000;
var SKIP = /prefers-contrast|forced-colors|\bprint\b|prefers-reduced/i;
var NOT = /:not\((?:[^()]|\([^()]*\))*\)/g;
var DARK_MEDIA = /prefers-color-scheme:\s*dark/i;
var DARK_PART = /^(?:html|:root|body|:host)?(?:\.dark|\.theme-dark|\.dark-theme|\.dark-mode|\[data-(?:theme|mode|color-scheme|bs-theme)\s*=\s*["']?dark["']?\])$/i;
var isDark = (c) => DARK_MEDIA.test(c) || c.replace(NOT, "").split(",").some((p) => DARK_PART.test(p.trim()));
var ROOTISH = /^(:root|html|body|:host|@theme(\s+(inline|static|reference))*|\*|::?backdrop)$/i;
function themeOf(ctx) {
  const plain = ctx.map((c) => c.replace(NOT, "").trim());
  if (plain.some((c) => SKIP.test(c)))
    return null;
  const darkMedia = plain.some((c) => DARK_MEDIA.test(c));
  const sel = plain.toReversed().find((c) => !/^@(media|supports|layer|container)\b/i.test(c));
  const other = plain.find((c) => /^@(media|container)\b/i.test(c) && !/prefers-color-scheme/i.test(c));
  if (other)
    return { scoped: `${other} ${sel ?? ""}`.trim() };
  if (sel === undefined)
    return { mode: darkMedia ? "dark" : "light" };
  const parts = sel.split(",").map((s) => s.trim());
  if (parts.some((p) => DARK_PART.test(p)))
    return { mode: "dark" };
  for (const p of parts) {
    const m = p.match(/\[data-(?:theme|mode|color-scheme|bs-theme)\s*=\s*["']?([\w-]+)/i) ?? p.match(/^(?:html|:root|body)?\.theme-([\w-]+)$/i);
    if (m)
      return { mode: m[1].toLowerCase() === "light" ? "light" : m[1].toLowerCase() };
    if (/^(?:html|:root)?\.light$/i.test(p))
      return { mode: "light" };
  }
  if (parts.some((p) => ROOTISH.test(p)))
    return { mode: darkMedia ? "dark" : "light" };
  return { scoped: sel };
}
var put = (acc, name, mode, value) => {
  if (name === "__proto__")
    return;
  if (!acc.tokens.has(name)) {
    if (acc.tokens.size >= MAX_TOKENS)
      return;
    acc.tokens.set(name, new Map);
  }
  acc.modes.add(mode);
  acc.tokens.get(name).set(mode, value.trim());
};
function readCss(text, acc, path = "") {
  let src = text.replace(/\/\*[\s\S]*?\*\//g, "");
  if (/\.(scss|sass|less)$/i.test(path))
    src = src.replace(/(^|[^:"'\\])\/\/.*$/gm, "$1");
  const stack = [];
  let buf = "";
  let quote = "";
  let schemeDark = false;
  const before = acc.tokens.size;
  const local = [];
  const take = () => {
    const m = buf.match(/^\s*--([\w-]+)\s*:([\s\S]*)$/);
    if (m) {
      const t = themeOf(stack);
      if (t && "mode" in t)
        local.push([m[1], t.mode, m[2].replace(/\s*!important\s*$/, "")]);
      else if (t)
        acc.scoped.set(t.scoped, (acc.scoped.get(t.scoped) ?? 0) + 1);
    } else if (/^\s*color-scheme\s*:\s*dark\s*$/i.test(buf) && !stack.some(isDark))
      schemeDark = true;
    buf = "";
  };
  let depth = 0;
  let escaped = false;
  for (const ch of src) {
    if (quote) {
      buf += ch;
      if (escaped)
        escaped = false;
      else if (ch === "\\")
        escaped = true;
      else if (ch === quote)
        quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
    } else if (ch === "(") {
      depth++;
      buf += ch;
    } else if (ch === ")") {
      depth = Math.max(0, depth - 1);
      buf += ch;
    } else if (depth)
      buf += ch;
    else if (ch === "{") {
      stack.push(buf.trim());
      buf = "";
    } else if (ch === "}") {
      take();
      stack.pop();
    } else if (ch === ";")
      take();
    else
      buf += ch;
  }
  take();
  const darkOnly = schemeDark && !local.some(([, m]) => m === "dark");
  for (const [n, m, v] of local)
    put(acc, n, darkOnly && m === "light" ? "dark" : m, v);
  return acc.tokens.size - before;
}
var isObj2 = (v) => !!v && typeof v === "object" && !Array.isArray(v);
var kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^\w-]+/g, "-").toLowerCase();
var refName = (path) => path.replace(/\.\$?value$/, "").split(".").map(kebab).join("-");
var refs = (s) => s.replace(/\{([^{}]+)\}/g, (_, p) => `var(--${refName(p)})`);
var unit = (v) => {
  if (typeof v === "number")
    return String(v);
  if (typeof v === "string")
    return refs(v);
  if (isObj2(v) && typeof v.value === "number")
    return `${v.value}${v.unit ?? ""}`;
  return;
};
var PREDEFINED = new Set([
  "srgb",
  "srgb-linear",
  "display-p3",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020",
  "xyz",
  "xyz-d50",
  "xyz-d65"
]);
function dtcgCss(v, type) {
  if (typeof v === "string")
    return refs(v);
  if (typeof v === "number")
    return type === "duration" ? `${v}ms` : String(v);
  if (Array.isArray(v)) {
    if (type === "cubicBezier" && v.length === 4)
      return `cubic-bezier(${v.join(", ")})`;
    if (type === "shadow" || v.every(isObj2))
      return v.map((x) => dtcgCss(x, "shadow")).join(", ");
    return v.map((x) => typeof x === "string" && /\s/.test(x) ? `"${x}"` : String(x)).join(", ");
  }
  if (!isObj2(v))
    return;
  if (typeof v.colorSpace === "string" && Array.isArray(v.components)) {
    const [x, y, z] = v.components;
    const a = typeof v.alpha === "number" && v.alpha < 1 ? ` / ${v.alpha}` : "";
    const space = v.colorSpace.toLowerCase();
    if (space === "hsl" || space === "hwb")
      return `${space}(${x} ${y}% ${z}%${a})`;
    if (["oklch", "oklab", "lab", "lch"].includes(space))
      return `${space}(${x} ${y} ${z}${a})`;
    if (PREDEFINED.has(space))
      return `color(${space} ${x} ${y} ${z}${a})`;
    if (typeof v.hex === "string")
      return v.hex;
    return;
  }
  if ("value" in v && "unit" in v)
    return unit(v);
  if (type === "shadow" || "offsetX" in v || "blur" in v) {
    const parts = [v.inset ? "inset" : "", unit(v.offsetX) ?? "0", unit(v.offsetY) ?? "0"];
    parts.push(unit(v.blur) ?? "0", unit(v.spread) ?? "0", dtcgCss(v.color, "color") ?? "");
    return parts.filter(Boolean).join(" ");
  }
  return;
}
var TYPO_KEYS = {
  fontFamily: "font-family",
  fontSize: "font-size",
  fontWeight: "font-weight",
  lineHeight: "line-height",
  letterSpacing: "letter-spacing"
};
function readJson(text, path, acc) {
  let root;
  try {
    root = JSON.parse(text);
  } catch (e) {
    acc.notes.push(`${path}: not valid JSON (${e.message}); skipped.`);
    return 0;
  }
  const before = acc.tokens.size;
  const fileMode = /(^|[\W_])dark([\W_]|$)/i.test(path) ? "dark" : "light";
  const walk = (node, trail, inherited) => {
    if (!isObj2(node))
      return;
    const type = (typeof node.$type === "string" ? node.$type : undefined) ?? inherited;
    const has$ = "$value" in node;
    const legacy = !has$ && "value" in node && !isObj2(node.value) && trail.length > 0;
    if (has$ || legacy) {
      const value = has$ ? node.$value : node.value;
      const t = type ?? (typeof node.type === "string" ? node.type : undefined);
      const name = trail.map(kebab).join("-");
      const set = (n, v, mode = fileMode) => {
        const css = dtcgCss(v, t);
        if (css !== undefined)
          put(acc, n, mode, css);
      };
      if (t === "typography" && isObj2(value)) {
        for (const [k, x] of Object.entries(value))
          set(`${name}-${TYPO_KEYS[k] ?? kebab(k)}`, x, fileMode);
      } else
        set(name, value);
      const ext = isObj2(node.$extensions) ? node.$extensions : undefined;
      const modes = ext && (isObj2(ext.mode) ? ext.mode : isObj2(ext.modes) ? ext.modes : undefined);
      if (modes)
        for (const [m, x] of Object.entries(modes))
          set(name, x, kebab(m));
      return;
    }
    for (const [k, child] of Object.entries(node))
      if (!k.startsWith("$"))
        walk(child, [...trail, k], type);
  };
  walk(root, []);
  return acc.tokens.size - before;
}
var TW_NS = {
  colors: "color",
  fontFamily: "font",
  fontSize: "text",
  fontWeight: "font-weight",
  lineHeight: "leading",
  letterSpacing: "tracking",
  spacing: "spacing",
  borderRadius: "radius",
  boxShadow: "shadow",
  transitionDuration: "duration",
  transitionTimingFunction: "ease",
  screens: "breakpoint",
  zIndex: "z",
  opacity: "opacity"
};
function readTailwind(text, path, acc) {
  const src = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/.*$/gm, "$1");
  const at = src.search(/\btheme\s*:\s*\{/);
  if (at < 0) {
    acc.notes.push(`${path}: no theme object; Tailwind defaults only.`);
    return 0;
  }
  const start = src.indexOf("{", at);
  let depth = 0;
  let end = start;
  for (;end < src.length; end++) {
    if (src[end] === "{")
      depth++;
    else if (src[end] === "}" && --depth === 0)
      break;
  }
  const json = src.slice(start, end + 1).replace(/`([^`\\$]*)`/g, (_, s) => JSON.stringify(s)).replace(/'([^'\\]*)'/g, (_, s) => JSON.stringify(s)).replace(/([{,]\s*)([\w$-]+)\s*:/g, '$1"$2":').replace(/,(\s*[}\]])/g, "$1");
  let theme;
  try {
    theme = JSON.parse(json);
  } catch {
    acc.notes.push(`${path}: the theme uses code (functions, imports or spreads), so it can't be read without running it. Values set there are missing.`);
    return 0;
  }
  const before = acc.tokens.size;
  const t = { ...theme };
  if (isObj2(theme.extend))
    for (const [k, v] of Object.entries(theme.extend))
      t[k] = isObj2(t[k]) && isObj2(v) ? { ...t[k], ...v } : v;
  for (const [key, ns] of Object.entries(TW_NS)) {
    const flat = (o, trail) => {
      if (isObj2(o)) {
        for (const [k, v] of Object.entries(o))
          flat(v, k === "DEFAULT" ? trail : [...trail, k]);
        return;
      }
      const name = [ns, ...trail].join("-");
      if (key === "fontSize" && Array.isArray(o)) {
        const [size, opts] = o;
        if (typeof size === "string")
          put(acc, name, "light", size);
        const lh = typeof opts === "string" ? opts : isObj2(opts) ? opts.lineHeight : undefined;
        if (typeof lh === "string" || typeof lh === "number")
          put(acc, `${name}--line-height`, "light", String(lh));
        if (isObj2(opts) && typeof opts.letterSpacing === "string")
          put(acc, `${name}--letter-spacing`, "light", opts.letterSpacing);
        return;
      }
      if (Array.isArray(o))
        put(acc, name, "light", o.map((x) => /\s/.test(String(x)) ? `"${x}"` : x).join(", "));
      else if (typeof o === "string" || typeof o === "number")
        put(acc, name, "light", String(o));
    };
    flat(t[key], []);
  }
  return acc.tokens.size - before;
}
function readDesignMd(text, acc) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m)
    return 0;
  const y = parseYaml(m[1]);
  const before = acc.tokens.size;
  const each = (o, ns) => {
    if (isObj2(o)) {
      for (const [k, v] of Object.entries(o))
        if (typeof v === "string" || typeof v === "number")
          put(acc, `${ns}-${kebab(k)}`, "light", String(v));
    }
  };
  each(y.colors, "color");
  each(y.rounded, "radius");
  each(y.spacing, "spacing");
  if (isObj2(y.typography))
    for (const [role, t] of Object.entries(y.typography)) {
      if (!isObj2(t))
        continue;
      const r = kebab(role);
      if (t.fontSize !== undefined)
        put(acc, `text-${r}`, "light", String(t.fontSize));
      if (t.lineHeight !== undefined)
        put(acc, `text-${r}--line-height`, "light", String(t.lineHeight));
      if (t.letterSpacing !== undefined)
        put(acc, `text-${r}--letter-spacing`, "light", String(t.letterSpacing));
      if (t.fontWeight !== undefined)
        put(acc, `text-${r}--font-weight`, "light", String(t.fontWeight));
      if (typeof t.fontFamily === "string")
        put(acc, `font-${r}`, "light", t.fontFamily);
    }
  if (typeof y.name === "string")
    acc.notes.push(`name:${y.name}`);
  return acc.tokens.size - before;
}
function kindOf(path, text) {
  const p = path.toLowerCase();
  if (/tailwind\.config\.(js|cjs|mjs|ts|cts|mts)$/.test(p))
    return "tailwind";
  if (/(^|\/)design\.md$/.test(p))
    return "design.md";
  if (/\.(css|scss|sass|less|pcss|postcss)$/.test(p))
    return "css";
  if (p.endsWith(".json"))
    return /"\$?value"\s*:/.test(text) ? "json" : null;
  const t = text.trimStart();
  if (t.startsWith("{"))
    return "json";
  if (t.startsWith("---"))
    return "design.md";
  if (/\btheme\s*:\s*\{/.test(t) && !/--[\w-]+\s*:/.test(t))
    return "tailwind";
  return /--[\w-]+\s*:/.test(t) ? "css" : null;
}
function extract(files, name) {
  const acc = { modes: new Set, tokens: new Map, scoped: new Map, notes: [] };
  const sources = [];
  for (const f of files) {
    const k = kindOf(f.path, f.text);
    if (!k)
      continue;
    const n = k === "css" ? readCss(f.text, acc, f.path) : k === "json" ? readJson(f.text, f.path, acc) : k === "tailwind" ? readTailwind(f.text, f.path, acc) : readDesignMd(f.text, acc);
    const touched = n > 0 || k === "css" && /--[\w-]+\s*:/.test(f.text);
    if (touched)
      sources.push(f.path);
  }
  if (acc.tokens.size >= MAX_TOKENS)
    acc.notes.push(`Stopped at ${MAX_TOKENS} tokens; the rest were left out.`);
  const named = acc.notes.find((n) => n.startsWith("name:"));
  const notes = acc.notes.filter((n) => !n.startsWith("name:"));
  const found = [...acc.modes].sort((a, b) => rank(a) - rank(b));
  const modes = found.slice(0, MAX_MODES);
  if (found.length > MAX_MODES)
    notes.push(`${found.length} themes found; kept ${modes.join(", ")}. Left out: ${found.slice(MAX_MODES).join(", ")}.`);
  if (!modes.length)
    modes.push("light");
  const kept = new Set(modes);
  const tokens = {};
  for (const [k, m] of acc.tokens)
    Object.defineProperty(tokens, k, {
      value: Object.fromEntries([...m].filter(([mode]) => kept.has(mode))),
      enumerable: true,
      writable: true,
      configurable: true
    });
  const scoped = [...acc.scoped].sort((a, b) => b[1] - a[1]).slice(0, MAX_SCOPED).map(([selector, count]) => ({ selector, count }));
  return {
    $schema: VIEW_SCHEMA_URL,
    v: 1,
    ...name ?? named ? { name: name ?? named.slice(5) } : {},
    modes,
    tokens,
    ...scoped.length ? { scoped } : {},
    sources,
    ...notes.length ? { notes } : {}
  };
}
var rank = (m) => m === "light" ? 0 : m === "dark" ? 1 : 2;
var modeValue = (rec, mode, view) => {
  if (!rec)
    return;
  const at = (m) => Object.hasOwn(rec, m) ? rec[m] : undefined;
  return at(mode) ?? at(view.modes[0]);
};
function resolve(view, name, mode) {
  const own = Object.hasOwn(view.tokens, name) ? view.tokens[name] : undefined;
  let v = modeValue(own, mode, view);
  if (v === undefined)
    return;
  for (let i = 0;i < 10 && v.includes("var("); i++) {
    const next = replaceVars(v, (n) => {
      return modeValue(Object.hasOwn(view.tokens, n) ? view.tokens[n] : undefined, mode, view);
    });
    if (next === v || next.length > RESOLVED_MAX)
      break;
    v = next;
  }
  return v;
}
function replaceVars(v, lookup) {
  let out = "";
  let i = 0;
  while (i < v.length) {
    const at = v.indexOf("var(", i);
    if (at < 0) {
      out += v.slice(i);
      break;
    }
    out += v.slice(i, at);
    let depth = 0;
    let j = at + 3;
    for (;j < v.length; j++) {
      if (v[j] === "(")
        depth++;
      else if (v[j] === ")" && --depth === 0)
        break;
    }
    const inner = v.slice(at + 4, j);
    const comma = topComma(inner);
    const n = (comma < 0 ? inner : inner.slice(0, comma)).trim().replace(/^--/, "");
    const fb = comma < 0 ? undefined : inner.slice(comma + 1).trim();
    out += lookup(n) ?? fb ?? v.slice(at, j + 1);
    i = j + 1;
  }
  return out;
}
var topComma = (s) => {
  let d = 0;
  for (let i = 0;i < s.length; i++) {
    if (s[i] === "(")
      d++;
    else if (s[i] === ")")
      d--;
    else if (s[i] === "," && d === 0)
      return i;
  }
  return -1;
};
var LENGTH = /^-?[\d.]+(px|rem|em|%|vw|vh|dvh|svh|ch|ex|pt)?$|^(clamp|calc|min|max)\(/i;
function kind(name, value) {
  const n = name.toLowerCase();
  const v = (value ?? "").trim();
  if (/(^|-)(shadow|elevation)(-|$)/.test(n))
    return "shadow";
  if (/(^|-)(ease|easing|duration|transition|animation|animate|delay|motion)(-|$)/.test(n))
    return "motion";
  if (/(^|-)(breakpoint|screen|bp)(-|$)/.test(n))
    return "breakpoint";
  if (/(^|-)(radius|rounded|corner)(-|$)/.test(n))
    return "radius";
  if (/(line-height|leading)/.test(n))
    return "leading";
  if (/(letter-spacing|tracking)/.test(n))
    return "tracking";
  if (/(^|-)(font-weight|weight)(-|$)/.test(n))
    return "weight";
  if (/(^|-)(font-size|fs)(-|$)|^text-[\w-]+$/.test(n) && LENGTH.test(v))
    return "size";
  if (/(^|-)(font|family|typeface)(-|$)/.test(n) && !/[\d.]+(px|rem)$/.test(v) && !isColor2(v))
    return "font";
  if (isColor2(v))
    return "color";
  if (/(^|-)(space|spacing|gap|gutter|inset|padding|margin|size|sizing)(-|$)/.test(n) && LENGTH.test(v))
    return "space";
  return "other";
}
function isColor2(v) {
  return !!colorOf(v);
}
function colorOf(v) {
  const s = v.trim();
  if (!s)
    return;
  const named = namedColor(s);
  if (named)
    return named;
  if (/^-?[\d.]+(deg)?\s+[\d.]+%\s+[\d.]+%(\s*\/\s*[\d.]+%?)?$/.test(s))
    return `hsl(${s})`;
  return parseCss(s) ? s : undefined;
}
var key = (p) => `${p.fg}|${p.bg}`;
function pairs(names) {
  const has = new Set(names);
  const out = [];
  const add = (fg, bg) => has.has(bg) && fg !== bg && out.push({ fg, bg });
  for (const n of names) {
    const m = n.match(/^(.*?)-?(foreground|fg|text|on)$/);
    const on = n.match(/^(color-)?on-(.+)$/);
    if (on)
      add(n, `${on[1] ?? ""}${on[2]}`);
    else if (m && m[2] !== "on") {
      const base = m[1];
      if (!base || /^(color)?$/.test(base)) {
        const p = base.replace(/-$/, "");
        for (const bg of ["background", "bg", "surface", "canvas", "page"])
          add(n, p ? `${p}-${bg}` : bg);
      } else if (m[2] !== "text")
        add(n, base);
    }
  }
  const seen = new Set(out.map(key));
  return out.filter((p) => !(p.fg.startsWith("color-") && p.bg.startsWith("color-") && seen.has(key({ fg: p.fg.slice(6), bg: p.bg.slice(6) }))));
}
var selectorOf = (m, i) => i === 0 ? ":root" : m === "dark" ? ".dark" : `[data-theme="${m}"]`;
function toCss2(view) {
  return view.modes.map((m, i) => {
    const lines = Object.entries(view.tokens).filter(([, per]) => per[m] !== undefined).map(([n, per]) => `  --${n}: ${per[m]};`);
    return lines.length ? `${selectorOf(m, i)} {
${lines.join(`
`)}
}` : "";
  }).filter(Boolean).join(`
`);
}

// src/lib/spring/cli.ts
var VIEW_URL = "https://someshks.com/spring/view";
var LINK_MAX = 8000;
var SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".turbo",
  ".vercel",
  ".output",
  ".cache",
  "dist",
  "build",
  "out",
  "coverage",
  "vendor",
  "target",
  "storybook-static",
  "__snapshots__"
]);
var CODE = /\.(css|scss|sass|less|pcss|ts|tsx|js|jsx|mjs|cjs|vue|svelte|astro|html|mdx)$/i;
var MAX_FILES = 20000;
var MAX_BYTES = 1e6;
function* walk(root, dir = root, seen = { n: 0 }) {
  let names;
  try {
    names = readdirSync(dir).sort();
  } catch {
    return;
  }
  for (const name of names) {
    if (seen.n >= MAX_FILES)
      return;
    const path = join(dir, name);
    let st;
    try {
      st = lstatSync(path);
    } catch {
      continue;
    }
    if (st.isSymbolicLink())
      continue;
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name) && !(name.startsWith(".") && name !== ".storybook"))
        yield* walk(root, path, seen);
    } else if (st.size <= MAX_BYTES) {
      seen.n++;
      yield path;
    }
  }
}
var TOKEN_JSON = /(token|theme|design|variable|color|palette|semantic|primitive|brand)/i;
function sources(root, all) {
  const out = [];
  for (const abs of all) {
    const path = relative(root, abs).replaceAll("\\", "/");
    if (/\.min\.css$/i.test(path) || /(^|\/)(package(-lock)?|tsconfig|jsconfig|components)\.json$/i.test(path))
      continue;
    const isJson = path.toLowerCase().endsWith(".json");
    if (isJson && !TOKEN_JSON.test(path))
      continue;
    if (!/\.(css|scss|sass|less|pcss|postcss|json)$/i.test(path) && !/tailwind\.config\.|(^|\/)design\.md$/i.test(path))
      continue;
    let text;
    try {
      text = readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    const k = kindOf(path, text);
    if (!k)
      continue;
    if (k === "css" && !/--[\w-]+\s*:/.test(text))
      continue;
    out.push({
      path,
      text,
      rank: k === "tailwind" ? 0 : k === "json" ? 1 : k === "design.md" ? 2 : 3
    });
  }
  return out.sort((a, b) => a.rank - b.rank || a.path.localeCompare(b.path));
}
var COLOR_UTIL = "bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|fill|stroke|from|via|to|outline|decoration|divide|placeholder|accent|caret|shadow";
var UTIL = new RegExp(String.raw`(?<![\w-])(${COLOR_UTIL}|rounded(?:-[trblse]{1,2})?|font|leading|tracking|ease|duration|p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|space-[xy]|w|h|size|inset|top|left|right|bottom)-([a-z0-9][\w.-]*?)(?:\/[\w.]+)?(?![\w-])`, "g");
var PALETTE = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
var OFF = new RegExp(String.raw`(?<![\w-])(?:[\w-]+:)*(?:${COLOR_UTIL})-(?:(${PALETTE})-(?:50|[1-9]00|950)|\[(?:#[0-9a-f]{3,8}|(?:rgb|hsl|oklch)a?\([^\]]*\))\])(?:\/[\w.]+)?(?![\w-])`, "gi");
var LITERAL = /#[0-9a-f]{8}\b|#[0-9a-f]{6}\b|#[0-9a-f]{3,4}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\([^)]*\)/gi;
var STYLE_LINE = /(color|background|border|fill|stroke|shadow|style|className|class=|theme|palette|gradient)/i;
var DEFINES = /(^|[{;\s])--[\w-]+\s*:/;
function candidates(util, x) {
  if (new RegExp(`^(${COLOR_UTIL})$`).test(util)) {
    const c = [`color-${x}`, x];
    if (util === "text")
      c.push(`text-${x}`);
    if (util === "shadow")
      c.push(`shadow-${x}`);
    return c;
  }
  if (util.startsWith("rounded"))
    return [`radius-${x}`];
  if (util === "font")
    return [`font-${x}`, `font-weight-${x}`];
  if (util === "leading")
    return [`leading-${x}`];
  if (util === "tracking")
    return [`tracking-${x}`];
  if (util === "ease")
    return [`ease-${x}`];
  if (util === "duration")
    return [`duration-${x}`];
  return [`spacing-${x}`];
}
function usage(root, files, view, defs) {
  const names = new Set(Object.keys(view.tokens));
  const refs = Object.fromEntries([...names].map((n) => [n, 0]));
  const groups = new Set(Object.keys(view.tokens).map((n) => n.replace(/^color-/, "").split("-")[0]));
  const raw = [];
  const offSystem = [];
  let rawCount = 0;
  let offSystemCount = 0;
  let scanned = 0;
  for (const abs of files) {
    if (!CODE.test(abs) || /\.(test|spec|stories)\.[jt]sx?$/.test(abs))
      continue;
    let text;
    try {
      text = readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    scanned++;
    const path = relative(root, abs).replaceAll("\\", "/");
    const isCss = /\.(css|scss|sass|less|pcss)$/i.test(path);
    const isDef = defs.has(path);
    text.split(`
`).forEach((line, i) => {
      if (line.length > 2000)
        return;
      const defining = DEFINES.test(line);
      if (!defining || !isDef) {
        for (const m of line.matchAll(/var\(\s*--([\w-]+)/g))
          if (names.has(m[1]))
            refs[m[1]]++;
      }
      if (!isCss) {
        for (const m of line.matchAll(UTIL))
          for (const c of candidates(m[1], m[2]))
            if (names.has(c))
              refs[c]++;
      }
      for (const m of line.matchAll(OFF)) {
        if (m[1] && groups.has(m[1].toLowerCase()))
          continue;
        offSystemCount++;
        if (offSystem.length < 100)
          offSystem.push({ value: m[0], at: `${path}:${i + 1}` });
      }
      if (defining || !isCss && !STYLE_LINE.test(line))
        return;
      if (/^\s*(\/\/|\*|\/\*)/.test(line) || /\[(#|rgb|hsl|oklch)/i.test(line))
        return;
      for (const m of line.matchAll(LITERAL)) {
        if (m[0].includes("var("))
          continue;
        rawCount++;
        if (raw.length < 100)
          raw.push({ value: m[0], at: `${path}:${i + 1}` });
      }
    });
  }
  for (let pass = 0;pass < 3; pass++)
    for (const [n, modes] of Object.entries(view.tokens)) {
      if (!refs[n])
        continue;
      for (const v of Object.values(modes))
        for (const m of v.matchAll(/var\(\s*--([\w-]+)/g))
          if (names.has(m[1]) && refs[m[1]] === 0)
            refs[m[1]] = refs[n];
    }
  return { files: scanned, refs, raw, rawCount, offSystem, offSystemCount };
}
function pageOf(view, mode) {
  for (const n of [
    "background",
    "color-background",
    "bg",
    "color-bg",
    "surface",
    "color-surface",
    "canvas",
    "page"
  ]) {
    const c = colorOf(resolve(view, n, mode) ?? "");
    if (c)
      return c;
  }
  return /dark/.test(mode) ? "#000000" : "#ffffff";
}
function contrastPairs(view) {
  const out = [];
  for (const mode of view.modes) {
    const page = pageOf(view, mode);
    for (const { fg, bg } of pairs(Object.keys(view.tokens))) {
      const b = colorOf(resolve(view, bg, mode) ?? "");
      const f = colorOf(resolve(view, fg, mode) ?? "");
      if (!b || !f) {
        out.push({ fg, bg, mode, ratio: null });
        continue;
      }
      const solidBg = over(b, page);
      out.push({
        fg,
        bg,
        mode,
        ratio: Math.round(wcagContrast(over(f, solidBg), solidBg) * 100) / 100
      });
    }
  }
  return out;
}
function counts(view) {
  const out = {};
  for (const n of Object.keys(view.tokens)) {
    const k = kind(n, resolve(view, n, view.modes[0]));
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}
function viewLink(view) {
  const json = JSON.stringify(view);
  return `${VIEW_URL}#d=${deflateRawSync(Buffer.from(json)).toString("base64url")}`;
}
var list = (xs, max = 8) => xs.slice(0, max).join(", ") + (xs.length > max ? `, +${xs.length - max} more` : "");
function summary(view, dir, link, file) {
  const lines = [`Spring scan of ${dir}`];
  if (!view.sources.length) {
    lines.push("No design tokens found: no CSS custom properties, tokens JSON, Tailwind theme or DESIGN.md.");
  } else
    lines.push(`Sources (${view.sources.length}): ${list(view.sources)}`);
  lines.push(`Modes: ${view.modes.join(", ")}`);
  const c = counts(view);
  const total = Object.keys(view.tokens).length;
  lines.push(`Tokens: ${total}` + (total ? ` (${Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(", ")})` : ""));
  const ps = contrastPairs(view);
  if (ps.length) {
    const low = ps.filter((p) => p.ratio !== null && p.ratio < 4.5);
    const unread = ps.filter((p) => p.ratio === null).length;
    lines.push(`Contrast: ${ps.length} named text/background pairs; ${low.length} under 4.5:1` + (low.length ? `: ${list(low.map((p) => `${p.fg} on ${p.bg} (${p.mode}) ${p.ratio}`), 6)}` : "") + (unread ? `; ${unread} not computed here (color-mix or unresolved; the view resolves them)` : ""));
  }
  const u = view.usage;
  if (u) {
    const unused = Object.entries(u.refs).filter(([, n]) => n === 0).map(([k]) => `--${k}`);
    lines.push(`Usage (${u.files} files): ${total - unused.length} of ${total} tokens referenced` + (unused.length ? `; never referenced: ${list(unused)}` : ""));
    lines.push(`Color literals outside tokens: ${u.rawCount}` + (u.raw.length ? ` (${list(u.raw.map((h) => `${h.value} ${h.at}`), 5)})` : ""));
    if (u.offSystemCount)
      lines.push(`Off-system color classes: ${u.offSystemCount} (${list(u.offSystem.map((h) => `${h.value} ${h.at}`), 5)})`);
  }
  for (const n of view.notes ?? [])
    lines.push(`Note: ${n}`);
  if (link)
    lines.push(`View: ${link}`);
  if (file)
    lines.push(link ? `Saved: ${file}` : `View: the link would be too long to paste, so open ${VIEW_URL} and drop ${file} on it.`);
  return lines.join(`
`);
}
function build({ _: pos, opts: o }) {
  const file = pos[0];
  const raw = file ? JSON.parse(readFileSync(file, "utf8")) : {};
  if (o.primary)
    raw.primary = o.primary;
  if (o.name)
    raw.name = o.name;
  const t = { ...raw.type };
  if (o.font)
    t.body = t.heading = o.font;
  if (o.heading)
    t.heading = o.heading;
  if (o.mono)
    t.mono = o.mono;
  raw.type = t;
  if (o.styling)
    raw.stack = { ...raw.stack, styling: o.styling };
  if (o.contrast)
    raw.contrast = o.contrast;
  const fontNotes = [];
  withFonts(raw, fontNotes);
  const { input, notes } = readInput(raw);
  const sys = buildSystem(input);
  const files = [
    ...exportAll(sys),
    { path: "spring.json", label: "Spring input", content: writeInput(input) }
  ];
  const only = o.only?.split(",").map((x) => x.trim().toLowerCase());
  const keep = only ? files.filter((f) => only.some((x) => f.path.toLowerCase() === x || basename(f.path).toLowerCase().startsWith(x))) : files;
  if (o.print) {
    const f = files.find((x) => x.path === o.print || basename(x.path) === o.print);
    if (!f)
      fail(`No file named ${o.print}. Files: ${files.map((x) => x.path).join(", ")}`);
    process.stdout.write(f.content);
    for (const n of [...fontNotes, ...notes])
      console.warn(`Note: ${n}`);
    return;
  }
  const out = [`Spring build: ${input.name}`];
  if (o.out) {
    for (const f of keep) {
      const p = join(o.out, f.path);
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, f.content);
    }
    out.push(`Wrote ${keep.length} files to ${o.out}: ${keep.map((f) => f.path).join(", ")}`);
  } else
    out.push(`Files (pass --out dir to write, --print name to print one): ${keep.map((f) => f.path).join(", ")}`);
  const failing = sys.checks.light.concat(sys.checks.dark).filter((c) => !c.pass && !c.advisory);
  out.push(failing.length ? `Contrast: ${failing.length} pairs miss the target: ${failing.map((c) => `${c.fg} on ${c.bg} ${c.ratio.toFixed(2)}`).join(", ")}` : "Contrast: every role pair passes the target.");
  for (const a of sys.adjustments)
    out.push(`Adjusted: ${a}`);
  for (const n of [...fontNotes, ...notes])
    out.push(`Note: ${n}`);
  out.push(`Edit: ${linkFor(input)}`);
  say(out.join(`
`));
}
var BOOL = new Set(["json", "no-usage", "help"]);
function parse(argv) {
  const out = { _: [], flags: new Set, opts: {} };
  for (let i = 0;i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const eq = a.indexOf("=");
    const k = eq < 0 ? a.slice(2) : a.slice(2, eq);
    if (eq >= 0)
      out.opts[k] = a.slice(eq + 1);
    else if (!BOOL.has(k) && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--"))
      out.opts[k] = argv[++i];
    else
      out.flags.add(k);
  }
  return out;
}
var say = (s) => process.stdout.write(s + `
`);
function fail(msg) {
  console.error(msg);
  process.exit(1);
}
var HELP = `spring scan [dir] [--json] [--out file] [--no-usage]
spring build [spring.json] [--primary color] [--name n] [--font f] [--heading f] [--mono f]
             [--contrast aa|aaa|apca] [--styling tailwind|css] [--out dir] [--only a,b] [--print file]
spring infer [dir] [--out spring.json]
spring schema [input|view]`;
function main(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;
  const args = parse(rest);
  if (cmd === "scan") {
    const dir = resolvePath(args._[0] ?? ".");
    const all = [...walk(dir)];
    const src = sources(dir, all);
    const view = extract(src, basename(dir));
    if (!args.flags.has("no-usage"))
      view.usage = usage(dir, all, view, new Set(src.map((s) => s.path)));
    if (args.flags.has("json")) {
      process.stdout.write(JSON.stringify(view, null, 2) + `
`);
      return;
    }
    const link = viewLink(view);
    const fits = link.length <= LINK_MAX;
    let file = null;
    if (args.opts.out || !fits) {
      file = args.opts.out ?? join(tmpdir(), `spring-view-${Date.now()}.json`);
      writeFileSync(file, JSON.stringify(view, null, 2) + `
`);
    }
    say(summary(view, dir, fits ? link : null, file));
    return;
  }
  if (cmd === "infer") {
    const dir = resolvePath(args._[0] ?? ".");
    const view = extract(sources(dir, [...walk(dir)]), basename(dir));
    if (!Object.keys(view.tokens).length)
      fail(`No design tokens found in ${dir}.`);
    const { input } = audit(toCss2(view));
    const text = writeInput({ ...input, name: view.name ?? input.name });
    if (args.opts.out) {
      writeFileSync(args.opts.out, text);
      say(`Wrote ${args.opts.out}: the closest Spring starting point to ${dir}.`);
    } else
      process.stdout.write(text);
    console.warn("Closest starting point, not a conversion: brand hue, chroma, grays, fonts, base size, ratio and radius are inferred.");
    return;
  }
  if (cmd === "build")
    return build(args);
  if (cmd === "schema") {
    process.stdout.write(JSON.stringify(args._[0] === "view" ? view_schema_default : schema_default, null, 2) + `
`);
    return;
  }
  say(HELP);
  if (cmd && cmd !== "help" && cmd !== "--help")
    process.exit(1);
}

// dist/spring-entry.ts
main();
