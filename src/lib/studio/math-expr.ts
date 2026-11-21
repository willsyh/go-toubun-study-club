/**
 * Tiny, safe expression compiler for the graphing calculator.
 * Supports + - * / ^, parentheses, implicit multiplication (2x, 3(x+1), x sin x),
 * the variable x, constants pi and e, and common functions.
 */

type Tok = { t: "num"; v: number } | { t: "id"; v: string } | { t: "op"; v: string };

const FUNCS: Record<string, (a: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  floor: Math.floor,
  ceil: Math.ceil,
};

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  const s = src.replace(/\*\*/g, "^").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/²/g, "^2").replace(/³/g, "^3").replace(/π/g, "pi");
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
    } else if (/[0-9.]/.test(c)) {
      const m = /^[0-9]*\.?[0-9]+(e[-+]?[0-9]+)?/i.exec(s.slice(i)) ?? /^[0-9]+\.?/.exec(s.slice(i));
      if (!m) throw new Error(`Bad number near "${s.slice(i, i + 5)}"`);
      out.push({ t: "num", v: parseFloat(m[0]) });
      i += m[0].length;
    } else if (/[a-z]/i.test(c)) {
      const m = /^[a-z]+/i.exec(s.slice(i))![0].toLowerCase();
      // Split runs like "xsinx" or "2pix" into known pieces.
      let j = 0;
      while (j < m.length) {
        const name = Object.keys(FUNCS)
          .concat(["pi"])
          .sort((a, b) => b.length - a.length)
          .find((n) => m.startsWith(n, j));
        if (name) {
          out.push({ t: "id", v: name });
          j += name.length;
        } else {
          out.push({ t: "id", v: m[j] });
          j++;
        }
      }
      i += m.length;
    } else if ("+-*/^(),".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
    } else {
      throw new Error(`Unexpected "${c}"`);
    }
  }
  return out;
}

type Node = (x: number) => number;

export function compile(src: string): Node {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === "op" && peek()!.v === v;

  function expr(): Node {
    let left = term();
    while (isOp("+") || isOp("-")) {
      const op = toks[p++].v;
      const a = left;
      const b = term();
      left = op === "+" ? (x) => a(x) + b(x) : (x) => a(x) - b(x);
    }
    return left;
  }

  function startsFactor() {
    const t = peek();
    return !!t && (t.t === "num" || t.t === "id" || (t.t === "op" && t.v === "("));
  }

  function term(): Node {
    let left = unary();
    for (;;) {
      if (isOp("*") || isOp("/")) {
        const op = toks[p++].v;
        const a = left;
        const b = unary();
        left = op === "*" ? (x) => a(x) * b(x) : (x) => a(x) / b(x);
      } else if (startsFactor()) {
        const a = left;
        const b = power();
        left = (x) => a(x) * b(x);
      } else return left;
    }
  }

  function unary(): Node {
    if (isOp("-")) {
      p++;
      const a = unary();
      return (x) => -a(x);
    }
    if (isOp("+")) {
      p++;
      return unary();
    }
    return power();
  }

  function power(): Node {
    const base = atom();
    if (isOp("^")) {
      p++;
      const e = unary();
      return (x) => Math.pow(base(x), e(x));
    }
    return base;
  }

  function atom(): Node {
    const t = toks[p++];
    if (!t) throw new Error("Expression ends too early");
    if (t.t === "num") return () => t.v;
    if (t.t === "op" && t.v === "(") {
      const inner = expr();
      if (!isOp(")")) throw new Error("Missing )");
      p++;
      return inner;
    }
    if (t.t === "id") {
      if (t.v === "x") return (x) => x;
      if (t.v === "pi") return () => Math.PI;
      if (t.v === "e") return () => Math.E;
      const f = FUNCS[t.v];
      if (f) {
        const arg = isOp("(") ? atom() : power();
        return (x) => f(arg(x));
      }
      throw new Error(`Unknown name "${t.v}"`);
    }
    throw new Error(`Unexpected "${t.v}"`);
  }

  const node = expr();
  if (p < toks.length) throw new Error(`Unexpected "${toks[p].v}"`);
  return node;
}

export type GraphItem =
  | { kind: "fn"; src: string; label: string; f: Node }
  | { kind: "point"; src: string; label: string; x: number; y: number }
  | { kind: "error"; src: string; message: string };

/** Parses one calculator line: "y = x^2 - 1", "f(x) = sin x", "(1, 0)" or a bare expression. */
export function parseGraphLine(line: string): GraphItem {
  const src = line.trim();
  const pt = /^\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/.exec(src);
  if (pt) return { kind: "point", src, label: `(${pt[1]}, ${pt[2]})`, x: Number(pt[1]), y: Number(pt[2]) };
  const body = src.replace(/^(y|f\s*\(\s*x\s*\)|g\s*\(\s*x\s*\))\s*=\s*/i, "");
  try {
    const f = compile(body);
    f(0.5);
    return { kind: "fn", src, label: `y = ${body}`, f };
  } catch (e) {
    return { kind: "error", src, message: (e as Error).message };
  }
}

/** Approximate real roots of f in [a, b] by sign changes plus bisection. */
export function findZeros(f: Node, a = -10, b = 10, steps = 2000): number[] {
  const roots: number[] = [];
  let px = a;
  let py = f(px);
  for (let i = 1; i <= steps; i++) {
    const x = a + ((b - a) * i) / steps;
    const y = f(x);
    if (Number.isFinite(py) && Number.isFinite(y)) {
      if (y === 0 || py * y < 0) {
        let lo = px;
        let hi = x;
        for (let k = 0; k < 50; k++) {
          const mid = (lo + hi) / 2;
          if (f(lo) * f(mid) <= 0) hi = mid;
          else lo = mid;
        }
        const r = Math.round(((lo + hi) / 2) * 1e4) / 1e4;
        if (!roots.some((q) => Math.abs(q - r) < 1e-3)) roots.push(r);
      }
    }
    px = x;
    py = y;
  }
  return roots;
}
