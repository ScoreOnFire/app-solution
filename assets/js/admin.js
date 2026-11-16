// ==========================================================
// Admin panel — orders, payments, content, settings
// ==========================================================
import {
  auth, db, DEFAULTS, collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, deleteDoc,
  query, orderBy, serverTimestamp, money, esc, toast, STATUS, fmtDate, copyText
} from "./firebase.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const LOGO = `<svg viewBox="0 0 512 512" fill="none" aria-hidden="true"><rect width="512" height="512" rx="120" fill="#0B2A5B"/><path d="M136 376 L256 136 L376 376" stroke="#fff" stroke-width="56" stroke-linecap="round" stroke-linejoin="round"/><rect x="224" y="300" width="64" height="64" rx="16" fill="#FF8A1F"/></svg>`;
const app = document.getElementById("app");
const dlg = document.getElementById("dlg");

// ---------------- schemas for every editable collection ----------------
const ICON_OPTS = ["briefcase", "bag", "code", "phone", "game", "chart"];
const SCHEMAS = {
  paymentMethods: {
    title: "Payment methods", single: "payment method",
    help: "Wallets and payment links shown on the payment page. Only active ones are shown. Double-check every address — coins sent to a wrong address are lost.",
    cols: ["name", "network", "address", "active"],
    fields: [
      ["name", "Name shown to clients", "text", "USDT"],
      ["type", "Type", "select", ["crypto", "link"]],
      ["symbol", "Coin symbol (USDT, BTC, ETH…)", "text"],
      ["network", "Network (TRC20, BEP20, ERC20, Bitcoin…)", "text"],
      ["address", "Wallet address / account email", "text"],
      ["memo", "Memo / tag (only if your exchange needs it)", "text"],
      ["url", "Payment link (for PayPal/Wise). {amount} and {code} are replaced automatically", "text", "https://paypal.me/yourname/{amount}"],
      ["addressLabel", "Label for the address (link type)", "text", "PayPal email"],
      ["color", "Coin colour", "color"],
      ["symbolChar", "Coin icon letter (₮, ₿, Ξ, P…)", "text"],
      ["coingeckoId", "CoinGecko id for live rate (bitcoin, ethereum). Leave empty for stablecoins", "text"],
      ["decimals", "Decimals to show", "number"],
      ["badge", "Small badge (e.g. Lowest fee)", "text"],
      ["explorer", "Explorer link with {tx}", "text", "https://tronscan.org/#/transaction/{tx}"],
      ["note", "Extra note for clients", "textarea"],
      ["order", "Sort order", "number"],
      ["active", "Show on website", "checkbox"]
    ]
  },
  services: {
    title: "App types", single: "app type", cols: ["name", "price", "active"],
    help: "The app types clients choose from on step 1 of the order form and on the home page.",
    fields: [["name", "Name", "text"], ["desc", "Description", "textarea"], ["price", "Starting price (USD)", "number"], ["icon", "Icon", "select", ICON_OPTS], ["order", "Sort order", "number"], ["active", "Show on website", "checkbox"]]
  },
  features: {
    title: "Features / add-ons", single: "feature", cols: ["name", "price", "active"],
    help: "Optional extras clients tick on step 2. The price is added to the total.",
    fields: [["name", "Name", "text"], ["desc", "Short description", "text"], ["price", "Price (USD)", "number"], ["order", "Sort order", "number"], ["active", "Show on website", "checkbox"]]
  },
  packages: {
    title: "Packages", single: "package", cols: ["name", "price", "featured", "active"],
    help: "Shown on the pricing page and as ready-made options in the order form.",
    fields: [["name", "Name", "text"], ["desc", "Description", "textarea"], ["price", "Price (USD)", "number"], ["unit", "Price label (one-off / from)", "text"], ["items", "What's included — one per line", "textarea"], ["featured", "Highlight as most chosen", "checkbox"], ["order", "Sort order", "number"], ["active", "Show on website", "checkbox"]]
  },
  portfolio: {
    title: "Portfolio", single: "project", cols: ["name", "category", "installs", "active"],
    help: "Your published apps. Image links must be public URLs (Google Play screenshot links, Imgur, etc.) — file uploads are not available on the free Firebase plan.",
    fields: [
      ["name", "App name", "text"], ["category", "Category (used for filters)", "text", "Business"], ["installs", "Installs (e.g. 10K+)", "text"],
      ["year", "Year", "text"], ["duration", "Build time (e.g. 6 weeks)", "text"], ["desc", "One-line summary", "textarea"],
      ["color", "Card colour", "color"], ["image", "Card image URL (optional)", "text"], ["screens", "Up to 3 screenshot URLs — one per line", "textarea"],
      ["playUrl", "Google Play link", "text"], ["challenge", "The challenge", "textarea"], ["solution", "What we built", "textarea"], ["result", "The result", "textarea"],
      ["tech", "Built with (comma separated)", "text", "Kotlin, Firebase, Material 3"],
      ["stat1Val", "Stat 1 value", "text"], ["stat1Lbl", "Stat 1 label", "text"], ["stat2Val", "Stat 2 value", "text"], ["stat2Lbl", "Stat 2 label", "text"],
      ["stat3Val", "Stat 3 value", "text"], ["stat3Lbl", "Stat 3 label", "text"], ["stat4Val", "Stat 4 value", "text"], ["stat4Lbl", "Stat 4 label", "text"],
      ["quote", "Client quote (real words only)", "textarea"], ["quoteName", "Client name", "text"], ["quoteRole", "Client role / company", "text"],
      ["order", "Sort order", "number"], ["active", "Show on website", "checkbox"]
    ]
  },
  testimonials: {
    title: "Reviews", single: "review", cols: ["name", "role", "active"],
    help: "Only publish reviews your clients really wrote.",
    fields: [["quote", "Review text", "textarea"], ["name", "Client name", "text"], ["role", "Role / company", "text"], ["order", "Sort order", "number"], ["active", "Show on website", "checkbox"]]
  },
  faqs: {
    title: "FAQ", single: "question", cols: ["q", "active"],
    fields: [["q", "Question", "text"], ["a", "Answer", "textarea"], ["order", "Sort order", "number"], ["active", "Show on website", "checkbox"]]
  }
};

const NAV = [
  ["dashboard", "Dashboard"], ["orders", "Orders"], ["messages", "Messages"], ["sep"],
  ["paymentMethods", "Payment methods"], ["services", "App types"], ["features", "Features"], ["packages", "Packages"], ["sep"],
  ["portfolio", "Portfolio"], ["testimonials", "Reviews"], ["faqs", "FAQ"], ["settings", "Settings & profile"]
];

let view = location.hash.slice(1) || "dashboard";
let ordersCache = [], msgCache = [];

// ---------------- auth ----------------
function loginView(msg = "") {
  app.innerHTML = `<div class="login"><form class="card" id="lf">
    <div class="brand" style="margin-bottom:26px">${LOGO}<span>Admin <small>App Solution</small></span></div>
    <h1 style="font-size:24px">Sign in</h1>
    <p class="muted" style="margin:8px 0 24px;font-size:14.5px">Use the admin email you created in Firebase Authentication.</p>
    <div class="field"><label for="em">Email</label><input class="input" id="em" type="email" autocomplete="username" required></div>
    <div class="field" style="margin-top:14px"><label for="pw">Password</label><input class="input" id="pw" type="password" autocomplete="current-password" required></div>
    <p class="err" id="le" style="margin-top:12px" ${msg ? "" : "hidden"}>${esc(msg)}</p>
    <button class="btn btn-primary btn-block" style="margin-top:20px" type="submit">Sign in</button>
    <button class="btn btn-ghost btn-block btn-sm" style="margin-top:10px" type="button" id="forgot">Forgot password</button>
    <a href="../index.html" class="hint" style="display:block;text-align:center;margin-top:18px">&larr; Back to website</a>
  </form></div>`;
  const f = document.getElementById("lf");
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const b = f.querySelector("[type=submit]"); b.disabled = true; b.innerHTML = '<span class="spin"></span>';
    try { await signInWithEmailAndPassword(auth, f.em.value.trim(), f.pw.value); }
    catch (x) { loginView(x.code === "auth/invalid-credential" ? "Wrong email or password." : (x.code || "Sign-in failed")); }
  });
  document.getElementById("forgot").addEventListener("click", async () => {
    const em = f.em.value.trim(); if (!em) return toast("Type your email first", "bad");
    try { await sendPasswordResetEmail(auth, em); toast("Reset email sent"); } catch (x) { toast(x.code || "Failed", "bad"); }
  });
}

function notAdminView(u) {
  app.innerHTML = `<div class="login"><div class="card" style="width:min(560px,100%)">
    <h1 style="font-size:22px">This account is not an admin yet</h1>
    <p class="muted" style="margin:12px 0 18px">To make it an admin, open <b>Firebase Console → Firestore Database</b>, create a collection called <code class="mono">admins</code>, and add a document whose <b>Document ID</b> is this UID:</p>
    <div class="copy-row"><input readonly value="${esc(u.uid)}"><button class="copy-btn" id="cu">Copy</button></div>
    <p class="hint" style="margin-top:12px">The document can be empty, or add a field <code class="mono">email</code>. Then reload this page.</p>
    <div style="display:flex;gap:10px;margin-top:24px"><button class="btn btn-primary" onclick="location.reload()">Reload</button><button class="btn btn-ghost" id="so">Sign out</button></div>
  </div></div>`;
  document.getElementById("cu").onclick = (e) => copyText(u.uid, e.currentTarget);
  document.getElementById("so").onclick = () => signOut(auth);
}

onAuthStateChanged(auth, async (u) => {
  if (!u || u.isAnonymous) return loginView();
  let ok = false;
  try { ok = (await getDoc(doc(db, "admins", u.uid))).exists(); } catch (e) { console.warn(e); }
  if (!ok) return notAdminView(u);
  shell(u);
});

// ---------------- layout ----------------
function shell(u) {
  app.innerHTML = `<div class="mob-top"><button class="btn btn-ghost btn-sm" id="mm">Menu</button><b>Admin</b></div>
  <div class="adm">
    <nav class="side" aria-label="Admin">
      <a class="brand" href="../index.html" target="_blank">${LOGO}<span>Admin <small>↗ site</small></span></a>
      ${NAV.map(([k, t]) => k === "sep" ? '<div class="sep"></div>' : `<button data-v="${k}">${t}<span class="cnt" data-cnt="${k}" hidden></span></button>`).join("")}
      <div class="sep"></div>
      <div class="hint" style="padding:0 14px;word-break:break-all">${esc(u.email)}</div>
      <button id="out">Sign out</button>
    </nav>
    <section class="content" id="content"></section>
  </div>`;
  document.querySelector(".side").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    view = b.dataset.v; location.hash = view; document.body.classList.remove("side-open"); render();
  });
  document.getElementById("out").onclick = () => signOut(auth);
  document.getElementById("mm").onclick = () => document.body.classList.toggle("side-open");
  render();
}

async function render() {
  document.querySelectorAll(".side [data-v]").forEach((b) => b.classList.toggle("on", b.dataset.v === view));
  const c = document.getElementById("content");
  c.innerHTML = `<div class="skeleton" style="height:44px;max-width:300px"></div><div class="skeleton" style="height:300px;margin-top:20px"></div>`;
  try {
    if (view === "dashboard") await dashboard(c);
    else if (view === "orders") await ordersView(c);
    else if (view === "messages") await messagesView(c);
    else if (view === "settings") await settingsView(c);
    else if (SCHEMAS[view]) await crudView(c, view);
    else { view = "dashboard"; await dashboard(c); }
  } catch (e) {
    console.error(e);
    c.innerHTML = `<div class="notice bad">${esc(e.code || e.message)} — check that your Firestore security rules are published (see README).</div>`;
  }
  badges();
}

async function loadOrders() {
  const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
  ordersCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return ordersCache;
}
async function loadMessages() {
  const snap = await getDocs(query(collection(db, "messages"), orderBy("createdAt", "desc")));
  msgCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return msgCache;
}
function badges() {
  const n = ordersCache.filter((o) => o.status === "submitted").length;
  const m = msgCache.filter((x) => !x.read).length;
  const set = (k, v) => { const el = document.querySelector(`[data-cnt="${k}"]`); if (el) { el.hidden = !v; el.textContent = v; } };
  set("orders", n); set("messages", m);
}
const pill = (s) => `<span class="status-pill st-${esc(s)}">${esc(STATUS[s]?.label || s)}</span>`;

// ---------------- dashboard ----------------
async function dashboard(c) {
  const [orders] = await Promise.all([loadOrders(), loadMessages().catch(() => [])]);
  const paidStates = ["verified", "design", "development", "testing", "delivered"];
  const received = orders.filter((o) => paidStates.includes(o.status)).reduce((a, o) => a + (o.status === "delivered" && o.balancePaid ? o.total : o.advance || 0), 0);
  const pipeline = orders.filter((o) => paidStates.includes(o.status) && o.status !== "delivered").reduce((a, o) => a + (o.total || 0), 0);
  const waiting = orders.filter((o) => o.status === "submitted");
  const setupDone = (await getDocs(collection(db, "paymentMethods"))).size > 0;
  c.innerHTML = `
    <div class="top"><h1>Dashboard</h1></div>
    ${setupDone ? "" : `<div class="notice warn" style="margin-bottom:22px"><span>⚠</span><div><b style="color:#fff">First time here?</b> Click <b>Load starter content</b> to fill the website with the default app types, features, packages and FAQ, plus example payment methods you then edit with your real wallet addresses.
      <div style="margin-top:12px"><button class="btn btn-primary btn-sm" id="seed">Load starter content</button></div></div></div>`}
    <div class="kpis">
      <div class="kpi"><b>${orders.length}</b><span>Total orders</span></div>
      <div class="kpi"><b style="color:#9CC0FF">${waiting.length}</b><span>Payments to verify</span></div>
      <div class="kpi"><b style="color:var(--green-text)">${money(received)}</b><span>Received (verified)</span></div>
      <div class="kpi"><b style="color:var(--accent)">${money(pipeline)}</b><span>Active project value</span></div>
    </div>
    <h2 style="font-size:18px;margin-bottom:14px">Waiting for your verification</h2>
    ${waiting.length ? orderTable(waiting) : `<p class="muted">Nothing to verify right now.</p>`}
    <h2 style="font-size:18px;margin:30px 0 14px">Latest orders</h2>
    ${orders.length ? orderTable(orders.slice(0, 8)) : `<p class="muted">No orders yet.</p>`}`;
  bindOrderRows(c);
  document.getElementById("seed")?.addEventListener("click", seed);
}

// ---------------- orders ----------------
function orderTable(rows) {
  return `<div class="tbl-box"><table class="tbl"><thead><tr><th>Order</th><th>Client</th><th>Build</th><th>Total</th><th>Advance</th><th>Status</th><th>Date</th></tr></thead><tbody>
    ${rows.map((o) => `<tr class="click" data-o="${esc(o.id)}"><td class="mono">${esc(o.code)}</td><td>${esc(o.name)}<div class="hint">${esc(o.email)}</div></td><td>${esc(o.base?.name || "")}</td><td>${money(o.total)}</td><td>${money(o.advance)}</td><td>${pill(o.status)}</td><td class="hint">${esc(fmtDate(o.createdAt))}</td></tr>`).join("")}
  </tbody></table></div>`;
}
function bindOrderRows(c) { c.querySelectorAll("[data-o]").forEach((r) => r.addEventListener("click", () => orderDialog(r.dataset.o))); }

async function ordersView(c) {
  const orders = await loadOrders();
  let f = "all";
  const draw = () => {
    const rows = f === "all" ? orders : orders.filter((o) => o.status === f);
    c.innerHTML = `<div class="top"><h1>Orders</h1>
      <div class="r"><select class="select" id="flt" style="min-height:44px;width:auto">
        <option value="all">All statuses (${orders.length})</option>
        ${Object.keys(STATUS).map((k) => `<option value="${k}" ${f === k ? "selected" : ""}>${STATUS[k].label} (${orders.filter((o) => o.status === k).length})</option>`).join("")}
      </select></div></div>
      ${rows.length ? orderTable(rows) : `<p class="muted">No orders in this status.</p>`}`;
    document.getElementById("flt").value = f;
    document.getElementById("flt").onchange = (e) => { f = e.target.value; draw(); };
    bindOrderRows(c);
  };
  draw();
}

function orderDialog(id) {
  const o = ordersCache.find((x) => x.id === id); if (!o) return;
  const ex = o.txid && o.method?.explorer ? o.method.explorer.replace("{tx}", encodeURIComponent(o.txid)) : "";
  const trackUrl = new URL("../track.html?id=" + encodeURIComponent(o.id), location.href).href;
  dlg.innerHTML = `<form method="dialog" id="of">
    <div class="dlg-h"><h2>Order <span class="mono">${esc(o.code)}</span></h2>${pill(o.status)}<button class="x" value="cancel" aria-label="Close">×</button></div>
    <div class="dlg-b">
      ${o.txid ? `<div class="notice info" style="margin-bottom:20px"><span>₿</span><div style="min-width:0;flex:1"><b style="color:#fff">Payment reference</b> · ${esc(o.method?.name || "")} ${esc(o.method?.network || "")} · ${esc(o.payAmount || "")}
        <div class="copy-row" style="margin-top:10px"><input readonly value="${esc(o.txid)}"><button type="button" class="copy-btn ghost" data-cp="${esc(o.txid)}">Copy</button></div>
        ${ex ? `<a class="btn btn-primary btn-sm" style="margin-top:12px" href="${esc(ex)}" target="_blank" rel="noopener">Check on blockchain explorer ↗</a>` : ""}
        <p class="hint" style="margin-top:10px">Confirm the amount, the receiving address and the network match before verifying.</p></div></div>` : ""}
      <dl class="kv">
        <dt>Client</dt><dd>${esc(o.name)}</dd>
        <dt>Email</dt><dd><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></dd>
        <dt>WhatsApp</dt><dd>${esc(o.whatsapp || "—")}</dd>
        <dt>Country</dt><dd>${esc(o.country || "—")}</dd>
        <dt>Build</dt><dd>${esc(o.base?.name || "")} — ${money(o.base?.price)}</dd>
        <dt>Features</dt><dd>${(o.features || []).map((f) => `${esc(f.name)} (${money(f.price)})`).join("<br>") || "—"}</dd>
        <dt>Total / advance</dt><dd><b>${money(o.total)}</b> / ${money(o.advance)} (${o.advancePercent}%)</dd>
        <dt>App name</dt><dd>${esc(o.appName || "—")}</dd>
        <dt>Deadline</dt><dd>${esc(o.deadline || "—")}</dd>
        <dt>Brief</dt><dd style="white-space:pre-wrap">${esc(o.details)}</dd>
        <dt>Links</dt><dd style="white-space:pre-wrap">${esc(o.links || "—")}</dd>
        <dt>Tracking link</dt><dd><a href="${esc(trackUrl)}" target="_blank">${esc(trackUrl)}</a></dd>
      </dl>
      <div class="notice warn" style="margin:18px 0 0"><span>!</span><div>Prices are calculated in the client's browser. Check that the total matches your prices before verifying.</div></div>
      <div class="form-grid" style="margin-top:22px">
        <div class="field"><label for="st">Status</label><select class="select" id="st">${Object.keys(STATUS).map((k) => `<option value="${k}" ${o.status === k ? "selected" : ""}>${STATUS[k].label}</option>`).join("")}</select></div>
        <label class="chk" style="margin-top:22px"><input type="checkbox" id="bp" ${o.balancePaid ? "checked" : ""}> Balance paid</label>
        <div class="field full"><label for="pn">Message shown to client on tracking page</label><textarea class="textarea" id="pn" style="min-height:80px">${esc(o.publicNote || "")}</textarea></div>
        <div class="field full"><label for="an">Reason shown if payment rejected / order cancelled</label><textarea class="textarea" id="an" style="min-height:70px">${esc(o.adminNote || "")}</textarea></div>
        <div class="field"><label for="pv">Design preview link</label><input class="input" id="pv" value="${esc(o.previewUrl || "")}"></div>
        <div class="field"><label for="apk">Test APK link</label><input class="input" id="apk" value="${esc(o.apkUrl || "")}"></div>
        <div class="field full"><label for="pu">Google Play link (when delivered)</label><input class="input" id="pu" value="${esc(o.playUrl || "")}"></div>
        <div class="field full"><label for="pr">Private notes (only you see this)</label><textarea class="textarea" id="pr" style="min-height:70px">${esc(o.privateNote || "")}</textarea></div>
      </div>
    </div>
    <div class="dlg-f">
      <button type="button" class="btn btn-danger btn-sm" id="del">Delete</button>
      <button type="button" class="btn btn-ghost btn-sm" id="quickV" ${o.status === "submitted" ? "" : "hidden"}>✓ Verify payment</button>
      <button type="button" class="btn btn-primary btn-sm" id="sv" style="margin-left:auto">Save</button>
    </div></form>`;
  dlg.showModal();
  dlg.querySelectorAll("[data-cp]").forEach((b) => b.onclick = () => copyText(b.dataset.cp, b));
  const save = async (over = {}) => {
    const g = (i) => dlg.querySelector("#" + i).value.trim();
    const data = { status: g("st"), balancePaid: dlg.querySelector("#bp").checked, publicNote: g("pn"), adminNote: g("an"), previewUrl: g("pv"), apkUrl: g("apk"), playUrl: g("pu"), privateNote: g("pr"), updatedAt: serverTimestamp(), ...over };
    if (data.status !== o.status) data[data.status + "At"] = serverTimestamp();
    await updateDoc(doc(db, "orders", o.id), data);
    toast("Order saved"); dlg.close(); render();
  };
  dlg.querySelector("#sv").onclick = () => save().catch((e) => toast(e.code || "Save failed", "bad"));
  dlg.querySelector("#quickV").onclick = () => save({ status: "design" }).catch((e) => toast(e.code || "Failed", "bad"));
  dlg.querySelector("#del").onclick = async () => {
    if (!confirm(`Delete order ${o.code}? This cannot be undone.`)) return;
    await deleteDoc(doc(db, "orders", o.id)); toast("Order deleted"); dlg.close(); render();
  };
}

// ---------------- messages ----------------
async function messagesView(c) {
  const rows = await loadMessages();
  c.innerHTML = `<div class="top"><h1>Messages</h1></div>
    ${rows.length ? `<div style="display:flex;flex-direction:column;gap:14px">${rows.map((m) => `
      <article class="card flat" style="padding:22px;${m.read ? "" : "border-color:var(--accent-line)"}">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center"><b>${esc(m.name)}</b><a href="mailto:${esc(m.email)}">${esc(m.email)}</a><span class="tag gray">${esc(m.type || "")}</span><span class="hint" style="margin-left:auto">${esc(fmtDate(m.createdAt))}</span></div>
        <p style="margin-top:12px;white-space:pre-wrap;color:var(--soft)">${esc(m.message)}</p>
        <div style="display:flex;gap:10px;margin-top:16px">
          <a class="btn btn-primary btn-sm" href="mailto:${esc(m.email)}?subject=${encodeURIComponent("Re: your message to App Solution Limited")}">Reply by email</a>
          ${m.read ? "" : `<button class="btn btn-ghost btn-sm" data-read="${esc(m.id)}">Mark read</button>`}
          <button class="btn btn-danger btn-sm" data-del="${esc(m.id)}">Delete</button>
        </div>
      </article>`).join("")}</div>` : `<p class="muted">No messages yet.</p>`}`;
  c.querySelectorAll("[data-read]").forEach((b) => b.onclick = async () => { await updateDoc(doc(db, "messages", b.dataset.read), { read: true }); render(); });
  c.querySelectorAll("[data-del]").forEach((b) => b.onclick = async () => { if (confirm("Delete this message?")) { await deleteDoc(doc(db, "messages", b.dataset.del)); render(); } });
}

// ---------------- generic content editor ----------------
async function crudView(c, name) {
  const S = SCHEMAS[name];
  const snap = await getDocs(collection(db, name));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const cell = (r, k) => {
    const v = r[k];
    if (k === "active" || k === "featured") return v === false || (k === "featured" && !v) ? '<span class="tag gray">No</span>' : '<span class="tag green">Yes</span>';
    if (k === "price") return money(v);
    return `<span style="display:inline-block;max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom" class="${k === "address" ? "mono" : ""}">${esc(v ?? "")}</span>`;
  };
  c.innerHTML = `<div class="top"><h1>${S.title}</h1><div class="r"><button class="btn btn-primary btn-sm" id="add">+ Add ${S.single}</button></div></div>
    ${S.help ? `<p class="muted" style="margin:-10px 0 22px;max-width:760px">${esc(S.help)}</p>` : ""}
    ${rows.length ? `<div class="tbl-box"><table class="tbl"><thead><tr>${S.cols.map((k) => `<th>${esc(S.fields.find((f) => f[0] === k)?.[1].split(" (")[0] || k)}</th>`).join("")}<th></th></tr></thead><tbody>
      ${rows.map((r) => `<tr class="click" data-id="${esc(r.id)}">${S.cols.map((k) => `<td>${cell(r, k)}</td>`).join("")}<td style="text-align:right"><span class="hint">Edit →</span></td></tr>`).join("")}
    </tbody></table></div>` : `<div class="notice info"><span>i</span><div>Nothing here yet — the website is showing built-in defaults. Add your own, or use <b>Load starter content</b> on the Dashboard.</div></div>`}`;
  c.querySelector("#add").onclick = () => editDialog(name, null);
  c.querySelectorAll("[data-id]").forEach((tr) => tr.onclick = () => editDialog(name, rows.find((r) => r.id === tr.dataset.id)));
}

function fieldHtml([k, label, type, extra], v) {
  const id = "f_" + k;
  if (type === "checkbox") return `<label class="chk full"><input type="checkbox" id="${id}" ${v === false ? "" : v || k === "active" ? "checked" : ""}> ${esc(label)}</label>`;
  if (type === "textarea") return `<div class="field full"><label for="${id}">${esc(label)}</label><textarea class="textarea" id="${id}" style="min-height:96px">${esc(Array.isArray(v) ? v.join("\n") : v ?? "")}</textarea></div>`;
  if (type === "select") return `<div class="field"><label for="${id}">${esc(label)}</label><select class="select" id="${id}">${extra.map((o) => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
  if (type === "color") return `<div class="field"><label for="${id}">${esc(label)}</label><input class="input" type="color" id="${id}" value="${esc(v || "#2E6BD1")}" style="padding:6px;height:54px"></div>`;
  const wide = ["address", "url", "explorer", "image", "playUrl", "desc", "name", "q", "tech"].includes(k) ? " full" : "";
  return `<div class="field${wide}"><label for="${id}">${esc(label)}</label><input class="input${k === "address" ? " mono" : ""}" id="${id}" type="${type === "number" ? "number" : "text"}" ${type === "number" ? 'step="any"' : ""} value="${esc(v ?? "")}" placeholder="${esc(typeof extra === "string" ? extra : "")}"></div>`;
}

function editDialog(name, row) {
  const S = SCHEMAS[name];
  dlg.innerHTML = `<form method="dialog" id="ef">
    <div class="dlg-h"><h2>${row ? "Edit" : "Add"} ${S.single}</h2><button class="x" value="cancel" aria-label="Close">×</button></div>
    <div class="dlg-b"><div class="form-grid">${S.fields.map((f) => fieldHtml(f, row?.[f[0]])).join("")}</div></div>
    <div class="dlg-f">${row ? '<button type="button" class="btn btn-danger btn-sm" id="del">Delete</button>' : ""}<button type="button" class="btn btn-primary btn-sm" id="sv" style="margin-left:auto">Save</button></div>
  </form>`;
  dlg.showModal();
  dlg.querySelector("#sv").onclick = async () => {
    const data = {};
    for (const [k, , type] of S.fields) {
      const el = dlg.querySelector("#f_" + k);
      if (type === "checkbox") data[k] = el.checked;
      else if (type === "number") data[k] = el.value === "" ? null : Number(el.value);
      else data[k] = el.value.trim();
    }
    if (!data[S.fields[0][0]]) return toast("Please fill in " + S.fields[0][1].toLowerCase(), "bad");
    try {
      if (row) await updateDoc(doc(db, name, row.id), data);
      else await addDoc(collection(db, name), data);
      toast("Saved"); dlg.close(); render();
    } catch (e) { toast(e.code || "Save failed", "bad"); }
  };
  dlg.querySelector("#del")?.addEventListener("click", async () => {
    if (!confirm("Delete this " + S.single + "?")) return;
    await deleteDoc(doc(db, name, row.id)); toast("Deleted"); dlg.close(); render();
  });
}

// ---------------- settings ----------------
const SETTINGS_FIELDS = [
  ["Brand", [["brand", "Company name"], ["tagline", "Footer tagline"], ["heroTitle", "Home headline"], ["heroText", "Home intro text", "textarea"]]],
  ["About you", [["founderName", "Your name"], ["founderRole", "Your role"], ["founderPhoto", "Photo URL (optional)"], ["city", "City / country"], ["since", "Working since (year)"], ["aboutText", "About — paragraph 1", "textarea"], ["aboutText2", "About — paragraph 2", "textarea"], ["skills", "Skills / tools (comma separated)", "textarea"], ["experience", "Experience — one per line:  years | title | description   (first line = current)", "textarea"]]],
  ["Numbers on the website", [["statApps", "Apps delivered", "number"], ["statCountries", "Countries served", "number"], ["statDays", "Average build days", "number"], ["statRating", "Average rating", "number"]]],
  ["Contact", [["email", "Email"], ["whatsapp", "WhatsApp number with country code"], ["telegram", "Telegram username"], ["facebook", "Facebook page URL"], ["playUrl", "Google Play developer page URL"], ["replyHours", "Reply time (hours)", "number"]]],
  ["Payments", [["advancePercent", "Advance percentage", "number"], ["supportDays", "Free support days", "number"]]]
];

async function settingsView(c) {
  const snap = await getDoc(doc(db, "settings", "site"));
  const s = { ...DEFAULTS.settings, ...(snap.exists() ? snap.data() : {}) };
  const expText = (Array.isArray(s.experience) ? s.experience : []).map((e) => [e.when, e.title, e.text].join(" | ")).join("\n");
  c.innerHTML = `<div class="top"><h1>Settings &amp; profile</h1><div class="r"><button class="btn btn-primary btn-sm" id="save">Save settings</button></div></div>
    ${SETTINGS_FIELDS.map(([title, fs]) => `<section class="card flat" style="padding:26px;margin-bottom:18px"><h2 style="font-size:17px;margin-bottom:18px">${title}</h2>
      <div class="form-grid">${fs.map(([k, l, t]) => {
        const v = k === "experience" ? expText : s[k];
        return t === "textarea" ? `<div class="field full"><label for="s_${k}">${esc(l)}</label><textarea class="textarea" id="s_${k}" style="min-height:${k === "experience" ? 130 : 90}px">${esc(v ?? "")}</textarea></div>`
          : `<div class="field"><label for="s_${k}">${esc(l)}</label><input class="input" id="s_${k}" type="${t === "number" ? "number" : "text"}" step="any" value="${esc(v ?? "")}"></div>`;
      }).join("")}</div></section>`).join("")}`;
  c.querySelector("#save").onclick = async () => {
    const data = {};
    SETTINGS_FIELDS.forEach(([, fs]) => fs.forEach(([k, , t]) => {
      const v = c.querySelector("#s_" + k).value.trim();
      data[k] = t === "number" ? Number(v) || 0 : v;
    }));
    data.experience = data.experience.split("\n").map((l) => l.split("|").map((x) => x.trim())).filter((p) => p[0])
      .map(([when, title, text], i) => ({ when, title: title || "", text: text || "", now: i === 0 }));
    data.advancePercent = Math.min(100, Math.max(1, data.advancePercent || 50));
    try { await setDoc(doc(db, "settings", "site"), data, { merge: true }); toast("Settings saved"); }
    catch (e) { toast(e.code || "Save failed", "bad"); }
  };
}

// ---------------- starter content ----------------
const STARTER_METHODS = [
  { name: "USDT", type: "crypto", symbol: "USDT", symbolChar: "₮", network: "TRC20 (TRON)", address: "PASTE-YOUR-TRC20-ADDRESS", color: "#26A17B", badge: "Lowest fee", explorer: "https://tronscan.org/#/transaction/{tx}", order: 1, active: false },
  { name: "USDT", type: "crypto", symbol: "USDT", symbolChar: "₮", network: "BEP20 (BNB Smart Chain)", address: "PASTE-YOUR-BEP20-ADDRESS", color: "#26A17B", explorer: "https://bscscan.com/tx/{tx}", order: 2, active: false },
  { name: "Bitcoin", type: "crypto", symbol: "BTC", symbolChar: "₿", network: "Bitcoin", address: "PASTE-YOUR-BTC-ADDRESS", color: "#F7931A", coingeckoId: "bitcoin", decimals: 8, explorer: "https://mempool.space/tx/{tx}", order: 3, active: false },
  { name: "Ethereum", type: "crypto", symbol: "ETH", symbolChar: "Ξ", network: "ERC20 (Ethereum)", address: "PASTE-YOUR-ETH-ADDRESS", color: "#627EEA", coingeckoId: "ethereum", decimals: 6, explorer: "https://etherscan.io/tx/{tx}", order: 4, active: false },
  { name: "PayPal", type: "link", symbolChar: "P", network: "Card or PayPal balance", url: "https://paypal.me/YOURNAME/{amount}", address: "", addressLabel: "PayPal email", color: "#2E6BD1", order: 5, active: false },
  { name: "Wise", type: "link", symbolChar: "W", network: "Bank transfer", url: "", address: "your-wise-email@example.com", addressLabel: "Wise account email", color: "#5DBB4A", order: 6, active: false }
];

async function seed() {
  if (!confirm("Add the starter content? Existing items are not changed. Payment methods are added switched OFF — edit each one, paste your real address, then switch it on.")) return;
  const b = document.getElementById("seed"); if (b) { b.disabled = true; b.innerHTML = '<span class="spin"></span> Loading'; }
  try {
    const put = async (name, rows) => {
      if ((await getDocs(collection(db, name))).size) return;
      for (const r of rows) { const { id, ...rest } = r; await setDoc(doc(db, name, id || crypto.randomUUID().slice(0, 12)), { ...rest, active: rest.active ?? true }); }
    };
    await put("services", DEFAULTS.services);
    await put("features", DEFAULTS.features);
    await put("packages", DEFAULTS.packages);
    await put("faqs", DEFAULTS.faqs);
    await put("paymentMethods", STARTER_METHODS);
    const s = await getDoc(doc(db, "settings", "site"));
    if (!s.exists()) await setDoc(doc(db, "settings", "site"), DEFAULTS.settings);
    toast("Starter content added");
    view = "paymentMethods"; location.hash = view; render();
  } catch (e) { console.error(e); toast(e.code || "Failed", "bad"); if (b) { b.disabled = false; b.textContent = "Load starter content"; } }
}

addEventListener("hashchange", () => { const v = location.hash.slice(1); if (v && v !== view) { view = v; if (document.getElementById("content")) render(); } });
