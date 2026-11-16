// Shared card renderers
import { esc } from "./firebase.js";

const CAT_TAG = { business: "", "e-commerce": "blue", ecommerce: "blue", sports: "purple", gaming: "purple", tools: "green", utility: "green" };

function miniScreen(i) {
  const v = i % 4;
  if (v === 0) return `<i style="height:26px;background:#FF8A1F"></i><i style="height:7px;width:90%"></i><i style="height:7px;width:66%;opacity:.6"></i><i style="height:36px"></i>`;
  if (v === 1) return `<i style="height:50px"></i><span style="display:flex;gap:6px"><i style="flex:1;height:30px"></i><i style="flex:1;height:30px"></i></span><i style="height:26px;background:#FF8A1F"></i>`;
  if (v === 2) return `<i style="height:16px;width:60%;background:rgba(255,255,255,.3)"></i><i style="height:44px;background:rgba(255,138,31,.35)"></i><i style="height:10px"></i><i style="height:10px;width:80%;opacity:.6"></i>`;
  return `<span style="display:flex;gap:5px"><i style="flex:1;height:22px"></i><i style="flex:1;height:22px"></i><i style="flex:1;height:22px;background:#FF8A1F"></i></span><i style="height:60px"></i><i style="height:20px"></i>`;
}

export function workCard(w, i = 0) {
  const color = w.color || ["#16285A", "#2E6BD1", "#3B2A6B", "#0E4A43", "#5A2E16"][i % 5];
  const tag = CAT_TAG[String(w.category || "").toLowerCase()] ?? "gray";
  const thumb = w.image
    ? `<img src="${esc(w.image)}" alt="" loading="lazy">`
    : `<div class="mini" style="animation-delay:${(i % 4) * .4}s">${miniScreen(i)}</div>`;
  return `<a class="card work reveal reveal-d${i % 4}" data-tilt href="case.html?id=${encodeURIComponent(w.id)}" data-cat="${esc(w.category || "")}">
    <div class="thumb" style="background:linear-gradient(140deg,${esc(color)} 0%,#0A142C 100%)">${thumb}</div>
    <div class="meta"><span class="tag ${tag}">${esc(w.category || "App")}</span>${w.installs ? `<span>${esc(w.installs)} installs</span>` : ""}</div>
    <h3>${esc(w.name)}</h3>
    <p>${esc(w.desc || "")}</p>
  </a>`;
}
