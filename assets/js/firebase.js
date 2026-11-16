// ==========================================================
// Firebase connection + shared data helpers
// ==========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCqUXD9pvhqOHkGHfbp0VzEYXihZ0EF65g",
  authDomain: "app-solution-limited.firebaseapp.com",
  projectId: "app-solution-limited",
  storageBucket: "app-solution-limited.firebasestorage.app",
  messagingSenderId: "681764701989",
  appId: "1:681764701989:web:97ca37082a9525d81a7ccc",
  measurementId: "G-J55DL64844"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics is optional — never let it break the page
import("https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js")
  .then(async (m) => { if (await m.isSupported()) m.getAnalytics(app); })
  .catch(() => {});

export { collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, deleteDoc, query, where, orderBy, serverTimestamp };

// ---------- auth ----------
export function currentUser() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => { off(); resolve(u); });
  });
}
/** Every visitor gets a silent anonymous account so their orders belong to them. */
export async function ensureAnon() {
  const u = await currentUser();
  if (u) return u;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

// ---------- defaults (shown until the admin adds real data) ----------
export const DEFAULTS = {
  settings: {
    brand: "App Solution Limited",
    tagline: "Custom Android apps, built and published to Google Play.",
    heroTitle: "We write the code. You get the app.",
    heroText: "Custom Android apps for businesses worldwide — designed, built and published to Google Play. Order online, pay in crypto or by card, and follow your build in real time.",
    founderName: "Your Name",
    founderRole: "Founder & lead developer",
    founderPhoto: "",
    city: "Bangladesh",
    since: "2024",
    aboutText: "App Solution Limited is a Google Play developer studio. We design, build and publish Android apps for clients around the world — business tools, e-commerce, sports, tournaments and utilities.",
    aboutText2: "Every project goes out under our own verified developer account, so you never have to wrestle with Play Console policies, signing keys or store reviews.",
    email: "contact@example.com",
    whatsapp: "",
    telegram: "",
    facebook: "",
    playUrl: "https://play.google.com/store/apps/dev?id=",
    advancePercent: 50,
    replyHours: 12,
    supportDays: 30,
    statApps: 25, statCountries: 8, statDays: 14, statRating: 4.9,
    skills: "Kotlin, Java, Android Studio, Jetpack Compose, Firebase, Firestore, Cloud Messaging, AdMob, Play Console, Material Design",
    experience: [
      { when: "2024 — Now", title: "App Solution Limited", text: "Running our own Google Play developer account. Building client apps end to end — design, Firebase backend, release and updates.", now: true },
      { when: "2022 — 2024", title: "Freelance Android developer", text: "Built and shipped Android apps for small businesses and individual clients." },
      { when: "2020 — 2022", title: "Where it started", text: "First apps, first Play Store releases, learning Kotlin and Firebase." }
    ]
  },
  services: [
    { id: "business", name: "Business & service app", desc: "Catalogue, booking, enquiry forms and an admin panel you control. Ideal for shops, clinics and agencies.", price: 349, icon: "briefcase", order: 1 },
    { id: "ecommerce", name: "E-commerce app", desc: "Product listings, cart, checkout, order management and push notifications, wired to your own database.", price: 649, icon: "bag", order: 2 },
    { id: "custom", name: "Custom build", desc: "Tournaments, news, fitness, education, tips — tell us the idea and we scope it feature by feature.", price: 499, icon: "code", order: 3 }
  ],
  features: [
    { id: "login", name: "User login & profiles", desc: "Email, Google and phone sign-in", price: 80, order: 1 },
    { id: "admin", name: "Admin panel", desc: "Manage content and orders yourself", price: 150, order: 2 },
    { id: "push", name: "Push notifications", desc: "Send offers straight to phones", price: 60, order: 3 },
    { id: "payments", name: "In-app payments", desc: "Card and wallet checkout", price: 120, order: 4 },
    { id: "chat", name: "Live chat", desc: "Talk to your customers in-app", price: 90, order: 5 },
    { id: "lang", name: "Multi-language", desc: "Your app in more than one language", price: 110, order: 6 },
    { id: "ads", name: "AdMob ads", desc: "Earn from banner and rewarded ads", price: 60, order: 7 },
    { id: "publish", name: "Play Store publishing", desc: "We upload and handle the review", price: 70, order: 8 },
    { id: "source", name: "Source code handover", desc: "Full Android Studio project", price: 250, order: 9 }
  ],
  packages: [
    { id: "starter", name: "Starter", desc: "A clean app that puts your business on Google Play.", price: 349, unit: "one-off", items: "Up to 5 screens\nCustom design & your branding\nPlay Store publishing\n30 days bug fixing", featured: false, order: 1 },
    { id: "business", name: "Business", desc: "Logins, a database and an admin panel you run yourself.", price: 649, unit: "one-off", items: "Everything in Starter\nUp to 12 screens\nUser accounts & Firebase database\nWeb admin panel\nPush notifications\n60 days support", featured: true, order: 2 },
    { id: "premium", name: "Premium", desc: "Full e-commerce or a bespoke build with payments inside the app.", price: 1199, unit: "from", items: "Everything in Business\nUnlimited screens\nCart, checkout & payments\nPriority build slot\n90 days support", featured: false, order: 3 }
  ],
  portfolio: [
    { id: "demo1", name: "Your first app", category: "Business", installs: "10K+", desc: "Add your real apps from the admin panel — this card is a placeholder.", color: "#16285A", order: 1 },
    { id: "demo2", name: "Your second app", category: "E-commerce", installs: "5K+", desc: "Each app gets its own case study page with screenshots and results.", color: "#2E6BD1", order: 2 },
    { id: "demo3", name: "Your third app", category: "Sports", installs: "20K+", desc: "Filter buttons above are built automatically from your categories.", color: "#3B2A6B", order: 3 }
  ],
  faqs: [
    { q: "Do I need my own Google Play account?", a: "No. We publish under App Solution Limited, our verified developer account. If you would rather own the listing, we can set up your account and transfer the app.", order: 1 },
    { q: "What if I do not like the design?", a: "Design comes before coding and you get two free rounds of changes. We only start building once you say yes.", order: 2 },
    { q: "Why do you accept crypto?", a: "Our clients are in many countries and crypto clears in minutes with low fees. PayPal and Wise work too if you prefer them.", order: 3 },
    { q: "How do I track my order?", a: "After ordering you get a private tracking link. Open it on any device to see each stage of your build.", order: 4 },
    { q: "Do I get the source code?", a: "It is an optional add-on. If you want full ownership we hand over the complete Android Studio project.", order: 5 },
    { q: "When do I pay the rest?", a: "The balance is due when you have tested the finished app and approved it — before it goes live.", order: 6 }
  ],
  testimonials: [
    { quote: "Add real client reviews from the admin panel. Only publish words your clients actually wrote.", name: "Client name", role: "Role, Company", order: 1 }
  ],
  paymentMethods: [] // wallet addresses must come from the admin panel
};

// ---------- reads with graceful fallback ----------
const cache = {};
export async function getSettings() {
  if (cache.settings) return cache.settings;
  let s = {};
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    if (snap.exists()) s = snap.data();
  } catch (e) { console.warn("settings:", e.code || e.message); }
  cache.settings = { ...DEFAULTS.settings, ...s };
  return cache.settings;
}

/** Reads a public collection, hides inactive rows, sorts by `order`. Falls back to defaults if empty. */
export async function list(name, { fallback = true } = {}) {
  if (cache[name]) return cache[name];
  let rows = [];
  try {
    const snap = await getDocs(collection(db, name));
    rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) { console.warn(name + ":", e.code || e.message); }
  rows = rows.filter((r) => r.active !== false);
  if (!rows.length && fallback) rows = (DEFAULTS[name] || []).map((r, i) => ({ id: r.id || name + i, ...r, _demo: true }));
  rows.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  cache[name] = rows;
  return rows;
}

// ---------- small utilities ----------
export const money = (n) => {
  const v = Number(n) || 0;
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
};
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const qs = (k) => new URLSearchParams(location.search).get(k);
export const lines = (s) => (Array.isArray(s) ? s : String(s || "").split(/\n/)).map((x) => String(x).trim()).filter(Boolean);
export const csv = (s) => (Array.isArray(s) ? s : String(s || "").split(/\n|,/)).map((x) => String(x).trim()).filter(Boolean);
export function makeOrderCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const r = crypto.getRandomValues(new Uint8Array(6));
  for (const b of r) s += a[b % a.length];
  return "ASL-" + s;
}
export function toast(msg, kind = "ok") {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.className = "toast " + kind;
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2800);
}
export async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch {}
    ta.remove();
  }
  if (btn) {
    const old = btn.textContent; btn.textContent = "Copied"; btn.classList.add("done");
    setTimeout(() => { btn.textContent = old; btn.classList.remove("done"); }, 1600);
  }
  toast("Copied to clipboard");
}
export const STATUS = {
  pending:     { label: "Awaiting payment", step: 1 },
  submitted:   { label: "Payment submitted", step: 2 },
  verified:    { label: "Payment verified", step: 3 },
  design:      { label: "In design", step: 3 },
  development: { label: "In development", step: 4 },
  testing:     { label: "Testing & approval", step: 5 },
  delivered:   { label: "Delivered", step: 6 },
  rejected:    { label: "Payment not found", step: 1 },
  cancelled:   { label: "Cancelled", step: 0 }
};
export const fmtDate = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
