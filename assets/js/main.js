// ==========================================================
// Shared site chrome: header, footer, 3D background, effects
// ==========================================================
import { getSettings, esc } from "./firebase.js";

export const LOGO = `<svg viewBox="0 0 512 512" fill="none" aria-hidden="true"><rect width="512" height="512" rx="120" fill="#0B2A5B"/><path d="M136 376 L256 136 L376 376" stroke="#fff" stroke-width="56" stroke-linecap="round" stroke-linejoin="round"/><rect x="224" y="300" width="64" height="64" rx="16" fill="#FF8A1F"/></svg>`;

export const ICONS = {
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14h18V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m8 7-5 5 5 5"/><path d="m16 7 5 5-5 5"/><path d="m14 4-4 16"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>',
  game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r="1"/><circle cx="18" cy="13.5" r="1"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
  tg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 4-9 8"/><path d="M21 4 14 21l-2-7-7-2z"/></svg>',
  fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2.8v18.4c0 .6.7 1 1.2.6L16 12 5.2 2.2C4.7 1.8 4 2.2 4 2.8zm13.4 10.4-2.2-1.2L5.9 21l11.5-7.8zm0-2.4L5.9 3l9.3 9 2.2-1.2zm1.5.8 2.6 1.4c.6.3.6 1.1 0 1.4l-2.6 1.4-2.4-2.1z"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 6-6 6 6"/></svg>',
  shield: '<svg width="22" height="22" style="flex:0 0 22px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.4 8.3-8 9-4.6-.7-8-4-8-9V7z"/><path d="m9 12 2 2 4-4"/></svg>',
  warn: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v5"/><path d="M12 17h.01"/><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};

const NAV = [
  ["index.html", "Home"], ["about.html", "About"], ["portfolio.html", "Portfolio"],
  ["pricing.html", "Pricing"], ["track.html", "Track order"], ["contact.html", "Contact"]
];

function header() {
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const links = NAV.map(([h, t]) => `<li><a href="${h}"${here === h ? ' class="active" aria-current="page"' : ""}>${t}</a></li>`).join("");
  const el = document.createElement("header");
  el.className = "site-header";
  el.innerHTML = `<div class="wrap nav">
      <a class="brand" href="index.html" aria-label="App Solution Limited home">${LOGO}<span>App Solution <small>Limited</small></span></a>
      <ul class="nav-links">${links}</ul>
      <a class="btn btn-primary btn-sm nav-cta" href="order.html">Start an order</a>
      <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false"><span></span></button>
    </div>`;
  const mm = document.createElement("nav");
  mm.className = "mobile-menu";
  mm.setAttribute("aria-label", "Mobile");
  mm.innerHTML = NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("") + `<a class="btn btn-primary" href="order.html">Start an order</a>`;
  document.body.prepend(mm);
  document.body.prepend(el);
  const btn = el.querySelector(".menu-btn");
  btn.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  mm.addEventListener("click", (e) => { if (e.target.closest("a")) document.body.classList.remove("menu-open"); });
  const onScroll = () => el.classList.toggle("scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
}

function background() {
  const rain = [
    ["val app = Build(0101) fun onCreate(){} 1001101 class User(id)", "#2E6BD1", 15, 0],
    ["0110 Firestore.collection(\"orders\") 1101 signInAnonymously()", "#1E4F9E", 22, -6],
    ["suspend fun order(){ pay() } 0110 allow read: if true;", "#FF8A1F", 18, -3],
    ["if(verified) release() 1010 build.gradle.kts 011 @Composable", "#2E6BD1", 26, -11],
    ["fun Screen() 0011 rules_version='2' Intent(this, Main::class)", "#1E4F9E", 19, -8],
    ["0101 assembleRelease 1100 BUILD SUCCESSFUL 1011 onPay(tx)", "#2E6BD1", 24, -2],
    ["LazyColumn { items(apps) } 0110 setContent { Home() } 10", "#1E4F9E", 21, -14],
    ["val ref = db.collection(\"apps\") 1001 .addSnapshotListener", "#2E6BD1", 17, -5]
  ].map(([t, c, d, delay]) => `<div class="rain" style="color:${c};animation-duration:${d}s;animation-delay:${delay}s">${esc(t)}</div>`).join("");
  const bg = document.createElement("div");
  bg.className = "bg3d";
  bg.setAttribute("aria-hidden", "true");
  bg.innerHTML = `
    <div class="grid"></div><div class="grid-fade"></div><div class="horizon"></div>
    <div class="rain-wrap">${rain}</div>
    <div class="orb" style="top:-140px;right:-60px;width:520px;height:520px;background:radial-gradient(circle,rgba(255,138,31,.22),transparent 70%)"></div>
    <div class="orb" style="top:40%;left:-160px;width:460px;height:460px;background:radial-gradient(circle,rgba(46,107,209,.26),transparent 70%);animation-delay:-7s"></div>
    <span class="tok" style="top:22%;left:4%;font-size:88px;color:rgba(255,138,31,.12)">&lt;/&gt;</span>
    <span class="tok" style="top:70%;left:22%;font-size:62px;color:rgba(46,107,209,.18);animation-delay:-4s">{ }</span>
    <span class="tok" style="top:44%;right:36%;font-size:50px;color:rgba(255,255,255,.06);animation-delay:-7s">( )</span>
    <span class="tok" style="bottom:12%;right:8%;font-size:70px;color:rgba(46,107,209,.16);animation-delay:-2s">;</span>
    <div class="snip" style="top:120px;right:2.5%;width:282px">
      <div class="dots"><i></i><i></i><i></i><b>MainActivity.kt</b></div>
<pre><span class="c-c">// your app, our code</span>
<span class="c-k">class</span> <span class="c-t">YourApp</span> : <span class="c-t">Activity</span>() {
  <span class="c-k">override fun</span> <span class="c-f">onCreate</span>() {
    setContent { <span class="c-t">Home</span>() }
  }
}<span class="caret">|</span></pre>
    </div>
    <div class="snip" style="bottom:22px;left:1.5%;width:236px;animation-name:snipB;animation-duration:11s">
<pre><span class="c-c">$</span> gradlew assembleRelease
<span class="c-f">BUILD SUCCESSFUL</span> in 42s
<span class="c-c">$</span> publish --track production
<span class="c-k">&rarr; live on Google Play</span></pre>
    </div>`;
  document.body.prepend(bg);

  // soft glow that follows the mouse (desktop only)
  if (matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    const g = document.createElement("div");
    g.className = "cursor-glow";
    document.body.appendChild(g);
    addEventListener("pointermove", (e) => { g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px"; }, { passive: true });
    // background parallax: the whole 3D layer leans toward the pointer
    addEventListener("pointermove", (e) => {
      const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
      bg.style.perspectiveOrigin = `${50 + x * 14}% ${40 + y * 10}%`;
    }, { passive: true });
  }
}

async function footer() {
  const s = await getSettings();
  const year = new Date().getFullYear();
  const social = [];
  if (s.facebook) social.push(`<a href="${esc(s.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.fb}</a>`);
  if (s.whatsapp) social.push(`<a href="https://wa.me/${esc(String(s.whatsapp).replace(/\D/g, ""))}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.wa}</a>`);
  if (s.telegram) social.push(`<a href="https://t.me/${esc(String(s.telegram).replace(/^@/, ""))}" target="_blank" rel="noopener" aria-label="Telegram">${ICONS.tg}</a>`);
  if (s.playUrl) social.push(`<a href="${esc(s.playUrl)}" target="_blank" rel="noopener" aria-label="Google Play">${ICONS.play}</a>`);
  if (s.email) social.push(`<a href="mailto:${esc(s.email)}" aria-label="Email">${ICONS.mail}</a>`);
  const f = document.createElement("footer");
  f.className = "site-footer";
  f.innerHTML = `<div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="index.html">${LOGO}<span>App Solution <small>Limited</small></span></a>
        <p class="muted" style="margin-top:16px;font-size:14.5px;max-width:340px">${esc(s.tagline)}</p>
        <div class="socials">${social.join("")}</div>
      </div>
      <div><h4>Studio</h4><ul><li><a href="about.html">About &amp; experience</a></li><li><a href="portfolio.html">Portfolio</a></li><li><a href="pricing.html">Pricing</a></li><li><a href="contact.html">Contact</a></li></ul></div>
      <div><h4>Clients</h4><ul><li><a href="order.html">Start an order</a></li><li><a href="track.html">Track an order</a></li><li><a href="contact.html#faq">FAQ</a></li></ul></div>
      <div><h4>Legal</h4><ul><li><a href="privacy.html">Privacy policy</a></li><li><a href="terms.html">Terms of service</a></li></ul></div>
    </div>
    <div class="foot-bottom"><span>&copy; ${year} ${esc(s.brand)}. All rights reserved.</span><span>Google Play verified developer</span></div>
  </div>`;
  document.body.appendChild(f);

  const fb = document.createElement("div");
  fb.className = "float-btns";
  fb.innerHTML = (s.whatsapp ? `<a class="fab wa" href="https://wa.me/${esc(String(s.whatsapp).replace(/\D/g, ""))}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ICONS.wa}</a>` : "")
    + `<button class="fab top" type="button" aria-label="Back to top">${ICONS.up}</button>`;
  document.body.appendChild(fb);
  const top = fb.querySelector(".top");
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  addEventListener("scroll", () => top.classList.toggle("show", scrollY > 700), { passive: true });
}

// ---------- effects that pages call after rendering ----------
let io;
export function reveal(root = document) {
  if (!io) io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  root.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
}

/** Real 3D tilt that follows the pointer, plus a light "shine". */
export function tilt(root = document) {
  if (!matchMedia("(pointer:fine)").matches || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  root.querySelectorAll("[data-tilt]:not([data-tilt-on])").forEach((el) => {
    el.setAttribute("data-tilt-on", "");
    if (el.classList.contains("card") && !el.querySelector(".shine")) el.insertAdjacentHTML("afterbegin", '<span class="shine"></span>');
    const max = Number(el.dataset.tilt) || 8;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateX(${(.5 - y) * max}deg) rotateY(${(x - .5) * max}deg) translateY(-6px)`;
      el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

/** Counts numbers up when they scroll into view. */
export function counters(root = document) {
  const els = root.querySelectorAll("[data-count]");
  const ob = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    ob.unobserve(e.target);
    const el = e.target, end = parseFloat(el.dataset.count), dec = (String(el.dataset.count).split(".")[1] || "").length, suf = el.dataset.suffix || "";
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .4 });
  els.forEach((el) => ob.observe(el));
}

export function refresh(root = document) { reveal(root); tilt(root); counters(root); }

// ---------- boot ----------
function loader() {
  const l = document.createElement("div");
  l.className = "page-loader";
  l.innerHTML = `<div class="ld"><span class="c-c">$</span> <b>launch</b> app-solution<span class="caret">_</span></div>`;
  document.body.appendChild(l);
  const done = () => setTimeout(() => l.classList.add("gone"), 250);
  if (document.readyState === "complete") done(); else addEventListener("load", done);
  setTimeout(() => l.classList.add("gone"), 2500);
}

if (!document.body.dataset.noChrome) {
  loader();
  background();
  header();
  footer();
}
refresh();
