#!/usr/bin/env node
// Render a Velox IG carousel (1080x1350 PNG per slide) from a post JSON.
// Usage: node render.mjs examples/contoh.json
// Output: out/<nama-json>/01.png, 02.png, ...
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve, basename, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const KIT = dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1350;
const DISCLAIMER = "Bukan rekomendasi untuk membeli/menjual saham tertentu.";
const FONT = `data:font/ttf;base64,${readFileSync(join(KIT, "fonts/Montserrat.ttf")).toString("base64")}`;
const SHIELD = pathToFileURL(join(KIT, "brand/velox-shield.png")).href;

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
// **teks** -> highlighted
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
// Indonesian number format: "5.139,09" -> 5139.09, "Rp1,58 T" -> 1.58
const num = (s) => parseFloat(String(s).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
const fmt = (n) => n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
const tone = (r) => r.tone ?? (/^\s*[-−]/.test(r.change ?? "") ? "down" : /^\s*\+/.test(r.change ?? "") ? "up" : "");

// Warna diambil dari logo shield Velox: navy #0a2540 + emas #ecd06e.
const CSS = `
@font-face { font-family: Montserrat; src: url(${FONT}); font-weight: 100 900; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body { position: relative; font-family: Montserrat, sans-serif; color: #fff;
  background: radial-gradient(110% 75% at 50% 62%, #0f2d4d 0%, #081a2e 42%, #03080f 100%); }
body.frame { background: transparent; }
.hero { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.shade { position: absolute; inset: 0; }
.top .shade { background: linear-gradient(180deg, #03080f 0%, rgba(3,8,15,.88) 34%, rgba(3,8,15,0) 54%),
  linear-gradient(0deg, rgba(3,8,15,.92) 0%, rgba(3,8,15,0) 16%); }
.bottom .shade { background: linear-gradient(0deg, #03080f 0%, rgba(3,8,15,.92) 36%, rgba(3,8,15,0) 60%),
  linear-gradient(180deg, rgba(3,8,15,.75) 0%, rgba(3,8,15,0) 16%); }

header { position: absolute; top: 56px; left: 60px; right: 60px; display: flex; align-items: center; gap: 14px; z-index: 2; }
header img { height: 58px; }
header .word { font-weight: 800; font-size: 30px; letter-spacing: .1em; }
header .src { margin-left: auto; font-size: 22px; color: rgba(255,255,255,.72); }
header .src b { color: #fff; font-weight: 700; }

.text { position: absolute; left: 50px; right: 50px; text-align: center; }
.top .text { top: 168px; }
.bottom .text { bottom: 150px; }
.kicker { font-size: 44px; font-weight: 400; letter-spacing: -.01em; margin-bottom: 10px; }
.headline { font-weight: 800; text-transform: uppercase; line-height: 1.02; letter-spacing: -.02em; }
.headline span { display: block; white-space: nowrap; }
.gold, .title b { background: linear-gradient(180deg, #fff3b0 0%, #ecd06e 50%, #c39a3e 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }

.disclaimer { position: absolute; bottom: 52px; left: 50%; transform: translateX(-50%); display: flex;
  border: 1.5px solid rgba(233,205,107,.6); border-radius: 10px; overflow: hidden; white-space: nowrap;
  font-size: 17px; background: rgba(3,8,15,.78); z-index: 2; }
.disclaimer b { padding: 10px 18px; font-weight: 800; letter-spacing: .08em; color: #0a2540;
  background: linear-gradient(180deg, #f6e08a, #d4b257); }
.disclaimer span { padding: 10px 20px; color: rgba(255,255,255,.85); }

/* Content slide: chip + title bar + visual blocks, vertically centred and shrunk to fit. */
.content::before { content: ""; position: absolute; inset: 0; background-size: 60px 60px;
  background-image: linear-gradient(rgba(233,205,107,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(233,205,107,.06) 1px, transparent 1px);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 55%, #000 20%, transparent 80%); }
.band { position: absolute; top: 0; left: 0; width: 100%; height: 640px; object-fit: cover;
  -webkit-mask-image: linear-gradient(180deg, #000 45%, transparent 100%); }
.bandshade { position: absolute; top: 0; left: 0; right: 0; height: 240px; background: linear-gradient(180deg, rgba(3,8,15,.85), transparent); }
.col { position: absolute; left: 64px; right: 64px; top: 160px; bottom: 124px; display: flex; flex-direction: column; justify-content: center; }
.has-hero .col { top: 400px; }
.stack { display: flex; flex-direction: column; gap: 26px; }
.chip { align-self: flex-start; font-size: 22px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #ecd06e;
  padding: 8px 18px; border: 1.5px solid rgba(233,205,107,.5); border-radius: 999px; background: rgba(233,205,107,.08); margin-bottom: -10px; }
.title { align-self: flex-start; font-size: 54px; font-weight: 800; text-transform: uppercase; line-height: 1.08; letter-spacing: -.02em;
  padding: 16px 28px 18px; border: 1.5px solid rgba(233,205,107,.4); border-left: 10px solid #ecd06e; border-radius: 14px;
  background: linear-gradient(90deg, rgba(20,58,100,.95), rgba(10,37,64,.8)); }
.label { font-size: 21px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #ecd06e; margin-bottom: 12px; }
.lead { font-size: 30px; line-height: 1.45; color: rgba(255,255,255,.86); }
.lead b, .panel p b, .points p b { color: #ecd06e; font-weight: 700; }
.panel { padding: 26px 30px; border: 1.5px solid rgba(233,205,107,.28); border-radius: 20px; background: rgba(10,37,64,.62); }
.panel h3 { font-size: 30px; font-weight: 800; margin-bottom: 8px; }
.panel h3 b { color: #ecd06e; }
.panel p { font-size: 27px; line-height: 1.42; color: rgba(255,255,255,.84); }

.cmp { display: grid; grid-template-columns: 1fr auto 1fr; align-items: end; }
.cmp small { display: block; font-size: 21px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.6); }
.cmp strong { display: block; font-size: 124px; font-weight: 800; line-height: 1; letter-spacing: -.03em; }
.cmp .to { text-align: right; }
.cmp svg { width: 130px; margin: 0 20px 36px; }
.track { display: flex; height: 46px; margin-top: 22px; border-radius: 12px; overflow: hidden; font-size: 22px; font-weight: 800; }
.track span { display: grid; place-items: center; background: rgba(255,255,255,.18); }
.track .add { flex: 1; color: #0a2540; background: linear-gradient(90deg, #d4b257, #f6e08a); }
.compare p { margin-top: 18px; }

.rows { padding-top: 8px; padding-bottom: 8px; }
.row { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 18px; padding: 18px 0; }
.row + .row { border-top: 1px solid rgba(255,255,255,.09); }
.row span { font-size: 27px; color: rgba(255,255,255,.8); }
.row > b { font-size: 33px; font-weight: 800; }
.row em { font-style: normal; font-size: 22px; font-weight: 800; padding: 6px 14px; border-radius: 999px; min-width: 120px; text-align: center;
  color: #cbd5e1; background: rgba(255,255,255,.1); }
.up { color: #34d399 !important; background: rgba(52,211,153,.14) !important; }
.down { color: #f87171 !important; background: rgba(248,113,113,.14) !important; }

.seg { display: flex; gap: 5px; height: 30px; border-radius: 999px; overflow: hidden; }
.seg span { background: rgba(255,255,255,.28); }
.seg .up { background: #34d399 !important; }
.seg .down { background: #f87171 !important; }
.legend { display: flex; gap: 34px; margin-top: 18px; font-size: 25px; color: rgba(255,255,255,.8); }
.legend i { display: inline-block; width: 16px; height: 16px; border-radius: 50%; margin-right: 10px; background: rgba(255,255,255,.4); }
.legend i.up { background: #34d399 !important; }
.legend i.down { background: #f87171 !important; }
.legend b { color: #fff; font-weight: 800; margin-left: 6px; }

.timeline { position: relative; padding-left: 62px; display: grid; gap: 20px; }
.timeline::before { content: ""; position: absolute; left: 39px; top: 40px; bottom: 40px; width: 2px; background: rgba(233,205,107,.45); }
.tl { position: relative; }
.tl::before { content: ""; position: absolute; left: -31px; top: 9px; width: 18px; height: 18px; border-radius: 50%;
  background: #ecd06e; box-shadow: 0 0 0 5px rgba(233,205,107,.2), 0 0 18px rgba(233,205,107,.6); }
.tl .date { display: inline-block; font-size: 21px; font-weight: 800; color: #0a2540; padding: 4px 14px; border-radius: 8px;
  background: linear-gradient(180deg, #f6e08a, #d4b257); }
.tl p { font-size: 27px; margin-top: 8px; }

.points { list-style: none; display: grid; gap: 22px; }
.points li { display: grid; grid-template-columns: 64px 1fr; gap: 22px; align-items: start; padding: 24px 26px;
  border: 1.5px solid rgba(233,205,107,.28); border-radius: 18px; background: rgba(10,37,64,.62); }
.points .num { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; font-size: 30px;
  font-weight: 800; color: #0a2540; background: linear-gradient(180deg, #f6e08a, #c9a24a); }
.points h3 { font-size: 33px; font-weight: 700; margin-bottom: 6px; }
.points p { font-size: 26px; line-height: 1.42; color: rgba(255,255,255,.84); }
.overflow { position: absolute; left: 0; right: 0; top: 0; padding: 14px; z-index: 9; text-align: center;
  font-size: 26px; font-weight: 800; background: #dc2626; }

.cta .text { top: 50%; transform: translateY(-46%); }
.cta .big { height: 260px; margin-bottom: 44px; filter: drop-shadow(0 0 60px rgba(233,205,107,.35)); }
.cta .handle { display: inline-block; margin-top: 40px; padding: 18px 40px; border-radius: 999px; font-size: 40px;
  font-weight: 800; color: #0a2540; background: linear-gradient(180deg, #f6e08a, #d4b257); }
`;

// Shrink headlines to fit the width; shrink content stacks to fit the height. Never clip silently.
const FIT = `document.fonts.ready.then(() => {
  for (const h of document.querySelectorAll("[data-fit]")) {
    let size = +h.dataset.fit;
    const over = () => [...h.children].some((s) => s.scrollWidth > s.clientWidth);
    while (size > 64 && over()) h.style.fontSize = (size -= 2) + "px";
    if (over()) for (const s of h.children) s.style.whiteSpace = "normal"; // too long even at minimum: wrap, never clip
  }
  for (const col of document.querySelectorAll(".col")) {
    const stack = col.firstElementChild, tall = () => stack.getBoundingClientRect().height > col.clientHeight;
    let z = 1;
    while (z > 0.74 && tall()) stack.style.zoom = (z -= 0.02);
    if (tall()) document.body.insertAdjacentHTML("beforeend", '<div class="overflow">KONTEN KEPANJANGAN: kurangi teks/blok di slide ini</div>');
  }
});`;

const header = (post, withSource = true) => `<header><img src="${SHIELD}"><span class="word">VELOX</span>
  ${withSource && post.sumber ? `<span class="src">Sumber: <b>${esc(post.sumber)}</b></span>` : ""}</header>`;
const disclaimer = `<div class="disclaimer"><b>DISCLAIMER</b><span>${DISCLAIMER}</span></div>`;
const headline = (s, size) => `<div class="headline" data-fit="${size}" style="font-size:${size}px">
  ${(s.headline ?? []).map((l) => `<span>${esc(l)}</span>`).join("")}
  ${(s.accent ?? []).map((l) => `<span class="gold">${esc(l)}</span>`).join("")}</div>`;
const img = (base, p) => pathToFileURL(resolve(base, p)).href;

const ARROW = `<svg viewBox="0 0 130 40"><path d="M4 20h116M104 6l16 14-16 14" fill="none" stroke="#ecd06e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const BLOCKS = {
  text: (t) => `<p class="lead">${rich(t)}</p>`,
  card: (c) => `<div class="panel"><h3>${rich(c.title)}</h3><p>${rich(c.body)}</p></div>`,
  compare: (c) => {
    const a = num(c.from), b = num(c.to);
    return `<div class="panel compare"><div class="cmp">
      <div><small>${esc(c.fromLabel ?? "Sebelumnya")}</small><strong>${esc(c.from)}</strong></div>${ARROW}
      <div class="to"><small>${esc(c.toLabel ?? "Sekarang")}</small><strong class="gold">${esc(c.to)}</strong></div></div>
      ${b > a && a > 0 ? `<div class="track"><span style="width:${(a / b) * 100}%">${esc(c.from)}</span><span class="add">+${fmt(b - a)}</span></div>` : ""}
      ${c.note ? `<p>${rich(c.note)}</p>` : ""}</div>`;
  },
  rows: (rows) => `<div class="panel rows">${rows.map((r) => `<div class="row"><span>${rich(r.label)}</span><b>${esc(r.value)}</b>
    ${r.change ? `<em class="${tone(r)}">${esc(r.change)}</em>` : ""}</div>`).join("")}</div>`,
  bar: (segs) => `<div class="panel"><div class="seg">${segs.map((s) => `<span class="${s.tone ?? ""}" style="flex:${s.value}"></span>`).join("")}</div>
    <div class="legend">${segs.map((s) => `<div><i class="${s.tone ?? ""}"></i>${esc(s.label)}<b>${fmt(s.value)}</b></div>`).join("")}</div></div>`,
  timeline: (items) => `<div class="panel timeline">${items.map((it) => `<div class="tl"><span class="date">${esc(it.date)}</span><p>${rich(it.text)}</p></div>`).join("")}</div>`,
  points: (items) => `<ol class="points">${items.map((it, i) => `<li><div class="num">${i + 1}</div><div><h3>${rich(it.title)}</h3><p>${rich(it.body)}</p></div></li>`).join("")}</ol>`,
};
const block = (b, i) => {
  const key = Object.keys(BLOCKS).find((k) => k in b);
  if (!key) throw new Error(`Blok ${i + 1}: butuh salah satu dari ${Object.keys(BLOCKS).join(" | ")}`);
  return `<section>${b.label ? `<div class="label">${esc(b.label)}</div>` : ""}${BLOCKS[key](b[key])}</section>`;
};

const SLIDES = {
  cover: (s, post, base) => `<body class="${s.layout === "bottom" ? "bottom" : "top"}">
    ${s.hero ? `<img class="hero" src="${img(base, s.hero)}">` : ""}<div class="shade"></div>
    ${header(post)}<div class="text"><div class="kicker">${esc(s.kicker)}</div>${headline(s, 104)}</div>${disclaimer}</body>`,
  content: (s, post, base) => `<body class="content${s.hero ? " has-hero" : ""}">
    ${s.hero ? `<img class="band" src="${img(base, s.hero)}"><div class="bandshade"></div>` : ""}${header(post)}
    <main class="col"><div class="stack">${s.chip ? `<div class="chip">${esc(s.chip)}</div>` : ""}
    ${s.title ? `<h2 class="title">${rich(s.title)}</h2>` : ""}${(s.blocks ?? []).map(block).join("")}</div></main>${disclaimer}</body>`,
  // Older format: kicker + title + items, rendered as a content slide with one points block.
  points: (s, post, base) => SLIDES.content({ ...s, chip: s.kicker, blocks: [{ points: s.items }] }, post, base),
  cta: (s, post) => `<body class="cta">${header(post, false)}<div class="text"><img class="big" src="${SHIELD}">
    <div class="kicker">${esc(s.kicker)}</div>${headline(s, 96)}<div class="handle">${esc(post.handle)}</div></div>${disclaimer}</body>`,
  // Transparent overlay (logo + disclaimer only), for compositing on top of an image elsewhere.
  frame: (s, post) => `<body class="frame">${header(post, false)}${disclaimer}</body>`,
};

function shoot(html, out, transparent) {
  const dir = mkdtempSync(join(tmpdir(), "velox-ig-"));
  try {
    const file = join(dir, "slide.html");
    writeFileSync(file, html);
    execFileSync(process.env.CHROME || "google-chrome", [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
      `--user-data-dir=${join(dir, "profile")}`, `--window-size=${W},${H}`, "--virtual-time-budget=5000",
      ...(transparent ? ["--default-background-color=00000000"] : []),
      `--screenshot=${out}`, pathToFileURL(file).href,
    ], { stdio: "pipe" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error("Usage: node render.mjs <post.json>");
  process.exit(1);
}
const post = JSON.parse(readFileSync(jsonPath, "utf8"));
const base = dirname(resolve(jsonPath));
const outDir = join(KIT, "out", basename(jsonPath, ".json"));
mkdirSync(outDir, { recursive: true });

post.slides.forEach((s, i) => {
  const build = SLIDES[s.type];
  if (!build) throw new Error(`Slide ${i + 1}: type "${s.type}" tidak dikenal (${Object.keys(SLIDES).join(" | ")})`);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>${build(s, post, base)}<script>${FIT}</script></html>`;
  const out = join(outDir, `${String(i + 1).padStart(2, "0")}.png`);
  shoot(html, out, s.type === "frame");
  console.log(out);
});
