// ---------- Mobile menu ----------
const menuBtn = document.getElementById("menuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");

function openMenu() {
  mobileMenu.style.display = "block";
  mobileMenu.setAttribute("aria-hidden", "false");
}
function closeMenu() {
  mobileMenu.style.display = "none";
  mobileMenu.setAttribute("aria-hidden", "true");
}
menuBtn?.addEventListener("click", openMenu);
closeMenuBtn?.addEventListener("click", closeMenu);
mobileMenu?.addEventListener("click", (e) => {
  if (e.target === mobileMenu) closeMenu();
});
document.querySelectorAll(".mobileMenuInner a").forEach(a => {
  a.addEventListener("click", () => closeMenu());
});

// ---------- Year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Reveal on scroll ----------
const revealEls = [
  ...document.querySelectorAll(".hero-left, .hero-right, .section, .card, .tCard, .skillCard, .contactCard")
];
revealEls.forEach(el => el.classList.add("reveal"));

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("in");
  });
}, { threshold: 0.12 });

revealEls.forEach(el => io.observe(el));

// ---------- Project rendering ----------
const grid = document.getElementById("projectGrid");
const search = document.getElementById("search");
const segs = document.querySelectorAll(".seg");

let state = {
  filter: "all",
  query: ""
};

function createMedia(media) {
  const wrap = document.createElement("div");
  wrap.className = "media";

  if (!media || !media.src) {
    wrap.innerHTML = `<div class="fallback">Add media in <code>assets/projects/</code></div>`;
    return wrap;
  }

  if (media.type === "video") {
    const v = document.createElement("video");
    v.autoplay = true;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.innerHTML = `<source src="${media.src}" type="video/mp4">`;
    v.onerror = () => {
      wrap.innerHTML = `<div class="fallback">Missing: <code>${media.src}</code></div>`;
    };
    wrap.appendChild(v);
    return wrap;
  }

  const img = document.createElement("img");
  img.src = media.src;
  img.alt = "Project demo";
  img.onerror = () => {
    wrap.innerHTML = `<div class="fallback">Missing: <code>${media.src}</code></div>`;
  };
  wrap.appendChild(img);
  return wrap;
}

function renderProjects(items) {
  grid.innerHTML = "";
  items.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";

    const media = createMedia(p.media);
    const body = document.createElement("div");
    body.className = "cardBody";

    const title = document.createElement("h3");
    title.className = "cardTitle";
    title.textContent = p.title;

    const desc = document.createElement("p");
    desc.className = "cardDesc";
    desc.textContent = p.desc;

    const meta = document.createElement("div");
    meta.className = "metaRow";
    (p.tags || []).slice(0, 8).forEach(t => {
      const s = document.createElement("span");
      s.className = "tag";
      s.textContent = t;
      meta.appendChild(s);
    });

    const links = document.createElement("div");
    links.className = "cardLinks";
    (p.links || []).forEach(l => {
      const a = document.createElement("a");
      a.className = "linkBtn";
      a.href = l.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = `${l.label} <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
      links.appendChild(a);
    });

    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(meta);
    if ((p.links || []).length) body.appendChild(links);

    card.appendChild(media);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

function matchesFilter(p) {
  if (state.filter === "all") return true;
  const tags = (p.tags || []).map(t => String(t).toLowerCase());
  return tags.includes(state.filter);
}

function matchesQuery(p) {
  if (!state.query) return true;
  const q = state.query.toLowerCase();
  const hay = `${p.title} ${p.desc} ${(p.tags || []).join(" ")}`.toLowerCase();
  return hay.includes(q);
}

let allProjects = [];

async function loadProjects() {
  try {
    const res = await fetch("projects.json", { cache: "no-store" });
    allProjects = await res.json();
    update();
  } catch (e) {
    grid.innerHTML = `<div class="hint">Could not load <code>projects.json</code>. Make sure it is in repo root.</div>`;
  }
}

function update() {
  const items = allProjects.filter(p => matchesFilter(p) && matchesQuery(p));
  renderProjects(items);
}

search?.addEventListener("input", (e) => {
  state.query = e.target.value.trim();
  update();
});

segs.forEach(btn => {
  btn.addEventListener("click", () => {
    segs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.filter = btn.dataset.filter;
    update();
  });
});

loadProjects();

// ---------- Animated background (robotic network/grid) ----------
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let w, h, pts;

function resize() {
  w = canvas.width = window.innerWidth * devicePixelRatio;
  h = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  const n = Math.floor((window.innerWidth * window.innerHeight) / 45000);
  pts = new Array(n).fill(0).map(() => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35 * devicePixelRatio,
    vy: (Math.random() - 0.5) * 0.35 * devicePixelRatio
  }));
}
window.addEventListener("resize", resize);
resize();

function draw() {
  ctx.clearRect(0, 0, w, h);

  // grid glow
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.strokeStyle = "rgba(0,229,255,0.10)";
  ctx.lineWidth = 1 * devicePixelRatio;
  const step = 70 * devicePixelRatio;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();

  // points + links
  for (const p of pts) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
  }

  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      const max = (160 * devicePixelRatio);
      if (d2 < max*max) {
        const t = 1 - Math.sqrt(d2) / max;
        ctx.strokeStyle = `rgba(0,229,255,${0.12 * t})`;
        ctx.lineWidth = 1 * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const p of pts) {
    ctx.fillStyle = "rgba(0,229,255,0.22)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.2 * devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
draw();
