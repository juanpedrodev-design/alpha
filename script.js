/* ===== Starfield minimal e performático ===== */
(() => {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const cfg = {
    density: 0.00012, // estrelas por pixel
    rMin: 0.4,
    rMax: 1.6,
    speed: 0.02, // velocidade vertical
    twinkle: true,
    maxStars: 800,
    shootingChance: 0.01,
    shootingSpeed: 6,
  };

  let DPR = Math.max(1, window.devicePixelRatio || 1);
  let W = 0,
    H = 0;
  let stars = [];
  let shooting = [];
  let raf = null,
    last = 0;

  function size() {
    DPR = Math.max(1, window.devicePixelRatio || 1);
    const cssW = Math.max(1, window.innerWidth || 300);
    const cssH = Math.max(1, window.innerHeight || 300);

    canvas.width = Math.floor(cssW * DPR);
    canvas.height = Math.floor(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    W = cssW;
    H = cssH;
    createStars();
  }

  function createStars() {
    stars.length = 0;
    const count = Math.min(cfg.maxStars, Math.floor(W * H * cfg.density));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: cfg.rMin + Math.random() * (cfg.rMax - cfg.rMin),
        a0: 0.35 + Math.random() * 0.65,
        a: 0.7,
        tw: 0.002 + Math.random() * 0.012,
        v: (0.05 + Math.random() * 0.3) * cfg.speed,
      });
    }
  }

  function spawnShoot() {
    const x = Math.random() * W * 0.6;
    const y = Math.random() * H * 0.3;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
    const v = cfg.shootingSpeed + Math.random() * 4;
    shooting.push({
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life: 80 + Math.random() * 60,
    });
  }

  function draw(t) {
    if (!last) last = t;
    const dt = t - last;
    last = t;

    ctx.clearRect(0, 0, W, H);

    // estrelas
    for (const s of stars) {
      if (cfg.twinkle) {
        s.a = Math.max(
          0.05,
          Math.min(1, s.a0 + Math.sin(t * s.tw + s.x) * 0.25)
        );
      }
      s.y -= s.v * (dt / 16.666);
      if (s.y < -5) s.y = H + 5;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // meteoros
    if (Math.random() < cfg.shootingChance) spawnShoot();
    for (let i = shooting.length - 1; i >= 0; i--) {
      const sh = shooting[i];
      sh.x += sh.vx * (dt / 16.666);
      sh.y += sh.vy * (dt / 16.666);
      sh.life -= dt / 16.666;

      const trail = 30;
      const tx = sh.x - sh.vx * trail * 0.08;
      const ty = sh.y - sh.vy * trail * 0.08;
      const g = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(sh.x, sh.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = "#fff";
      ctx.arc(sh.x, sh.y, 1.6, 0, Math.PI * 2);
      ctx.fill();

      if (sh.life <= 0 || sh.x > W + 50 || sh.y > H + 50) shooting.splice(i, 1);
    }

    raf = requestAnimationFrame(draw);
  }

  // init + listeners
  window.addEventListener("resize", size);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = null;
    } else if (!document.hidden && !raf) {
      last = 0;
      raf = requestAnimationFrame(draw);
    }
  });

  // start
  window.addEventListener("load", () => {
    size();
    raf = requestAnimationFrame(draw);
  });
})();

/* ===== Smooth scroll para qualquer [data-scroll] ===== */
(() => {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-scroll]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (href && href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
})();

/* ===== Revelar .reveal na viewport ===== */
(() => {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => io.observe(el));
})();

/* ===== Formulário final ===== */
(() => {
  const form = document.getElementById("demoForm");
  const btn = document.getElementById("demoSubmit");
  const fb = document.getElementById("formFeedback");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    btn.disabled = true;
    btn.textContent = "Enviando...";
    // Simule envio; troque por fetch() no seu backend
    setTimeout(() => {
      btn.textContent = "Enviado! ✅";
      fb.hidden = false;
      fb.textContent =
        "Obrigado! Entraremos em contato para agendar sua demonstração.";
      form.reset();
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "Quero minha demonstração";
      }, 1400);
    }, 700);
  });
})();
