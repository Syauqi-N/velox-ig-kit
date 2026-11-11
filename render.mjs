#!/usr/bin/env node
// Render a Velox IG carousel (1080x1350 PNG per slide) from a post JSON.
// Usage: node ig-kit/render.mjs ig-kit/examples/contoh.json
// Output: ig-kit/out/<nama-json>/01.png, 02.png, ...
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

// Warna diambil dari logo shield Velox: navy #0a2540 + emas #e9cd6b.
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

header { position: absolute; top: 56px; left: 60px; right: 60px; display: flex; align-items: center; gap: 14px; }
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
.gold { background: linear-gradient(180deg, #fff3b0 0%, #ecd06e 50%, #c39a3e 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }

.disclaimer { position: absolute; bottom: 52px; left: 50%; transform: translateX(-50%); display: flex;
  border: 1.5px solid rgba(233,205,107,.6); border-radius: 10px; overflow: hidden; white-space: nowrap;
  font-size: 17px; background: rgba(3,8,15,.78); }
.disclaimer b { padding: 10px 18px; font-weight: 800; letter-spacing: .08em; color: #0a2540;
  background: linear-gradient(180deg, #f6e08a, #d4b257); }
.disclaimer span { padding: 10px 20px; color: rgba(255,255,255,.85); }

.points .body { position: absolute; top: 168px; left: 72px; right: 72px; }
.points .kicker { font-size: 32px; font-weight: 600; color: #ecd06e; margin-bottom: 6px; }
.points h2 { font-size: 64px; font-weight: 800; text-transform: uppercase; line-height: 1.05; letter-spacing: -.02em; margin-bottom: 48px; }
.points ol { list-style: none; display: grid; gap: 30px; }
.points li { display: grid; grid-template-columns: 72px 1fr; gap: 24px; align-items: start; padding: 28px;
  border: 1.5px solid rgba(233,205,107,.28); border-radius: 18px; background: rgba(10,37,64,.55); }
.points .num { width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; font-size: 34px;
  font-weight: 800; color: #0a2540; background: linear-gradient(180deg, #f6e08a, #c9a24a); }
.points h3 { font-size: 36px; font-weight: 700; margin-bottom: 8px; }
.points p { font-size: 27px; line-height: 1.42; color: rgba(255,255,255,.82); }

.cta .text { top: 50%; transform: translateY(-46%); }
.cta .big { height: 260px; margin-bottom: 44px; filter: drop-shadow(0 0 60px rgba(233,205,107,.35)); }
.cta .handle { display: inline-block; margin-top: 40px; padding: 18px 40px; border-radius: 999px; font-size: 40px;
  font-weight: 800; color: #0a2540; background: linear-gradient(180deg, #f6e08a, #d4b257); }
`;

// Shrink a headline until its longest line fits the slide width.
const FIT = `document.fonts.ready.then(() => {
  for (const h of document.querySelectorAll("[data-fit]")) {
    let size = +h.dataset.fit;
    const over = () => [...h.children].some((s) => s.scrollWidth > s.clientWidth);
    while (size > 64 && over()) h.style.fontSize = (size -= 2) + "px";
    if (over()) for (const s of h.children) s.style.whiteSpace = "normal"; // too long even at minimum: wrap, never clip
  }
});`;

const header = (post, withSource = true) => `<header><img src="${SHIELD}"><span class="word">VELOX</span>
  ${withSource && post.sumber ? `<span class="src">Sumber: <b>${esc(post.sumber)}</b></span>` : ""}</header>`;
const disclaimer = `<div class="disclaimer"><b>DISCLAIMER</b><span>${DISCLAIMER}</span></div>`;
const headline = (s, size) => `<div class="headline" data-fit="${size}" style="font-size:${size}px">
  ${(s.headline ?? []).map((l) => `<span>${esc(l)}</span>`).join("")}
  ${(s.accent ?? []).map((l) => `<span class="gold">${esc(l)}</span>`).join("")}</div>`;

const SLIDES = {
  cover: (s, post, base) => `<body class="${s.layout === "bottom" ? "bottom" : "top"}">
    ${s.hero ? `<img class="hero" src="${pathToFileURL(resolve(base, s.hero)).href}">` : ""}<div class="shade"></div>
    ${header(post)}<div class="text"><div class="kicker">${esc(s.kicker)}</div>${headline(s, 104)}</div>${disclaimer}</body>`,
  points: (s, post) => `<body class="points">${header(post)}<div class="body">
    <div class="kicker">${esc(s.kicker)}</div><h2>${esc(s.title)}</h2>
    <ol>${(s.items ?? []).map((it, i) => `<li><div class="num">${i + 1}</div><div><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></div></li>`).join("")}</ol>
    </div>${disclaimer}</body>`,
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
  console.error("Usage: node ig-kit/render.mjs <post.json>");
  process.exit(1);
}
const post = JSON.parse(readFileSync(jsonPath, "utf8"));
const base = dirname(resolve(jsonPath));
const outDir = join(KIT, "out", basename(jsonPath, ".json"));
mkdirSync(outDir, { recursive: true });

post.slides.forEach((s, i) => {
  const build = SLIDES[s.type];
  if (!build) throw new Error(`Slide ${i + 1}: type "${s.type}" tidak dikenal (cover | points | cta | frame)`);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>${build(s, post, base)}<script>${FIT}</script></html>`;
  const out = join(outDir, `${String(i + 1).padStart(2, "0")}.png`);
  shoot(html, out, s.type === "frame");
  console.log(out);
});
