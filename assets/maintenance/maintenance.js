(() => {
  "use strict";

  const root = document.documentElement;
  const language = root.lang.split("-")[0];
  const dictionary = window.EUC_I18N?.[language] || window.EUC_I18N?.de || {};
  const translate = (key, fallback) => dictionary[key] || fallback;
  const canvas = document.querySelector("#particles");
  const context = canvas.getContext("2d");
  const motionButton = document.querySelector("#motion-toggle");
  const teaButton = document.querySelector("#tea-button");
  const speech = document.querySelector("#speech-content");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  let paused = reducedMotion.matches;
  let manualPause = false;
  let frame = 0;
  let lastTime = 0;
  let width = 0;
  let height = 0;
  let particles = [];
  let bursts = [];
  let teaCount = 0;
  let trail = [];
  const cups = [];
  const pile = document.querySelector("#tea-pile");
  const cupTemplate = document.querySelector("#tea-cup-template");
  const pointer = { x: -1000, y: -1000, active: false, smoothX: 0, smoothY: 0 };

  document.querySelector("#year").textContent = new Date().getFullYear();
  teaButton.hidden = false;
  motionButton.hidden = false;

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.6 + Math.random() * 2.1,
      vx: -0.13 + Math.random() * 0.26,
      vy: -0.13 - Math.random() * 0.38,
      phase: Math.random() * Math.PI * 2,
      petal: Math.random() > 0.84,
      opacity: 0.15 + Math.random() * 0.48,
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: width < 700 ? 34 : 78 }, createParticle);
    layoutCups();
  }

  function layoutCups() {
    if (!cups.length) return;
    const rows = Math.ceil((Math.sqrt(8 * cups.length + 1) - 1) / 2);
    const stageWidth = pile.clientWidth;
    const stageHeight = pile.clientHeight;
    const unscaledWidth = (rows - 1) * 114 + 160;
    const unscaledHeight = (rows - 1) * 79 + 155;
    const scale = Math.min(
      1,
      stageWidth / (unscaledWidth + 24),
      stageHeight / (unscaledHeight + 12),
    );
    let index = 0;
    for (let row = 0; row < rows; row++) {
      const columns = rows - row;
      for (
        let column = 0;
        column < columns && index < cups.length;
        column++, index++
      ) {
        const cup = cups[index];
        const offset = ((index % 3) - 1) * 3;
        const x =
          (stageWidth - unscaledWidth * scale) / 2 +
          (column * 114 + row * 57 + offset) * scale;
        cup.style.setProperty("--cup-x", `${x}px`);
        cup.style.setProperty("--cup-y", `${-row * 79 * scale}px`);
        cup.style.setProperty("--cup-scale", scale);
        cup.style.setProperty("--cup-rotation", `${((index * 7) % 13) - 6}deg`);
        cup.style.zIndex = String(row + 1);
      }
    }
  }

  function addCup() {
    const cup = cupTemplate.content.firstElementChild.cloneNode(true);
    cup.style.setProperty("--cup-hue", `${((cups.length % 5) - 2) * 7}deg`);
    cup.classList.add("is-warm");
    pile.append(cup);
    cups.push(cup);
    // Limit animated steam, never the number of retained cups.
    if (cups.length > 3) cups[cups.length - 4].classList.remove("is-warm");
    layoutCups();
    const count = document.querySelector("#tea-count");
    count.hidden = false;
    count.textContent = `${translate("cupCount", "Tassen serviert:")} ${new Intl.NumberFormat(language).format(cups.length)}`;
  }

  function drawThreadTrail(time) {
    trail = trail.filter((point) => time - point.time < 760);
    if (trail.length < 2) return;
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    for (let index = 1; index < trail.length; index++) {
      const previous = trail[index - 1];
      const current = trail[index];
      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;
      const life = Math.max(0, 1 - (time - current.time) / 760);
      const wave = Math.sin(index * 0.55 + time * 0.003) * 2;
      context.globalAlpha = life * 0.8;
      for (const side of [-1, 1]) {
        const offset = side * (3 + wave);
        context.strokeStyle = side === 1 ? "#d35045" : "#f5c4a0";
        context.lineWidth = side === 1 ? 1.7 : 0.8;
        context.beginPath();
        context.moveTo(previous.x + nx * offset, previous.y + ny * offset);
        context.lineTo(current.x + nx * offset, current.y + ny * offset);
        context.stroke();
      }
      if (index % 4 === 0) {
        context.strokeStyle = "#e68a70";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(current.x - nx * 6, current.y - ny * 6);
        context.lineTo(
          current.x + nx * 6 + dx * 0.3,
          current.y + ny * 6 + dy * 0.3,
        );
        context.stroke();
      }
    }
    context.restore();
  }

  function drawParticle(particle, time, step) {
    const distanceX = particle.x - pointer.x;
    const distanceY = particle.y - pointer.y;
    const distance = Math.hypot(distanceX, distanceY);
    if (pointer.active && distance > 0 && distance < 150) {
      const force = (1 - distance / 150) * 1.6;
      particle.x += (distanceX / distance) * force * step;
      particle.y += (distanceY / distance) * force * step;
    }
    particle.x +=
      (particle.vx + Math.sin(time * 0.0003 + particle.phase) * 0.13) * step;
    particle.y += particle.vy * step;
    if (particle.y < -15) {
      particle.y = height + 15;
      particle.x = Math.random() * width;
    }
    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    context.save();
    context.translate(particle.x, particle.y);
    context.globalAlpha =
      particle.opacity *
      (0.75 + Math.sin(time * 0.001 + particle.phase) * 0.25);
    context.fillStyle = particle.petal ? "#d77a65" : "#e9d9a0";
    context.beginPath();
    if (particle.petal) {
      context.rotate(time * 0.00015 + particle.phase);
      context.ellipse(
        0,
        0,
        particle.radius * 2.3,
        particle.radius * 0.75,
        0,
        0,
        Math.PI * 2,
      );
    } else {
      context.arc(0, 0, particle.radius, 0, Math.PI * 2);
    }
    context.fill();
    context.restore();
  }

  function tick(time) {
    frame = 0;
    if (paused || document.hidden || !context) return;
    const step = Math.min((time - (lastTime || time - 16.7)) / 16.7, 2);
    lastTime = time;
    context.clearRect(0, 0, width, height);
    const targetX = pointer.active ? pointer.x / width - 0.5 : 0;
    const targetY = pointer.active ? pointer.y / height - 0.5 : 0;
    pointer.smoothX += (targetX - pointer.smoothX) * 0.055 * step;
    pointer.smoothY += (targetY - pointer.smoothY) * 0.055 * step;
    root.style.setProperty("--drift-x", `${pointer.smoothX * -17}px`);
    root.style.setProperty("--drift-y", `${pointer.smoothY * -12}px`);
    root.style.setProperty("--parallax-x", `${pointer.smoothX * -100}px`);
    root.style.setProperty("--parallax-y", `${pointer.smoothY * -65}px`);
    root.style.setProperty("--bubble-tilt", `${pointer.smoothX * 1.4}deg`);
    for (const particle of particles) drawParticle(particle, time, step);
    drawThreadTrail(time);
    for (const burst of bursts) {
      burst.x += burst.vx * step;
      burst.y += burst.vy * step;
      burst.vy += 0.022 * step;
      burst.life -= 0.012 * step;
      context.globalAlpha = Math.max(0, burst.life);
      context.fillStyle = burst.color;
      context.beginPath();
      context.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    bursts = bursts.filter((burst) => burst.life > 0);
    frame = requestAnimationFrame(tick);
  }

  function applyMotionState() {
    paused = manualPause || reducedMotion.matches;
    document.body.classList.toggle("effects-paused", paused);
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.setAttribute(
      "aria-label",
      paused
        ? translate("enableMotion", "Effekte einschalten")
        : translate("pauseMotion", "Effekte pausieren"),
    );
    motionButton.title = reducedMotion.matches
      ? translate(
          "systemMotion",
          "Reduzierte Bewegung ist in deinen Systemeinstellungen aktiviert.",
        )
      : motionButton.getAttribute("aria-label");
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (paused) {
      trail = [];
      context?.clearRect(0, 0, width, height);
    } else if (!document.hidden && context) frame = requestAnimationFrame(tick);
  }

  const teaResponses = [
    [
      "teaReply1",
      "Eine ausgezeichnete Wahl. Frisch aufgebrüht, selbstverständlich. Die letzte Tasse hat nur ganz kurz geleuchtet.",
    ],
    [
      "teaReply2",
      "Noch eine Tasse? Du hast Geschmack. Der Tee ist bereits produktionsreif. Die KI bekommt noch den letzten Schliff.",
    ],
    [
      "teaReply3",
      "Langsam glaube ich, du bist gar nicht wegen der KI hier. Keine Sorge. Das bleibt unter uns.",
    ],
    [
      "teaReply4",
      "Mein Vorrat ist unerschöpflich. Im Gegensatz zum Geduldsfaden meiner Entwickler. Noch ein Schluck?",
    ],
  ];

  teaButton.addEventListener("click", () => {
    const [key, fallback] = teaResponses[teaCount % teaResponses.length];
    teaCount += 1;
    addCup();
    document.body.classList.add("tea-served");
    const message = document.createElement("p");
    message.className = "speech-text";
    message.textContent = translate(key, fallback);
    const closing = document.createElement("p");
    closing.className = "tea-question";
    closing.textContent = translate(
      "teaClosing",
      "Lehn dich zurück. Ich kümmere mich um den Rest.",
    );
    speech.replaceChildren(message, closing);
    document.querySelector("#tea-label").textContent = translate(
      "moreTea",
      "Noch eine Tasse",
    );
    if (!paused) {
      const bounds = teaButton.getBoundingClientRect();
      bursts = bursts
        .concat(
          Array.from({ length: 28 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.8 + Math.random() * 2;
            return {
              x: bounds.x + bounds.width / 2,
              y: bounds.y + bounds.height / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 1,
              radius: 0.8 + Math.random() * 1.8,
              life: 1,
              color: Math.random() > 0.6 ? "#d77a65" : "#e9d9a0",
            };
          }),
        )
        .slice(-112);
    }
  });

  motionButton.addEventListener("click", () => {
    manualPause = !manualPause;
    applyMotionState();
  });
  window.addEventListener(
    "pointermove",
    (event) => {
      if (paused || !finePointer.matches || event.pointerType === "touch")
        return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      const now = performance.now();
      const previous = trail[trail.length - 1];
      if (
        !previous ||
        Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 3
      ) {
        trail.push({ x: event.clientX, y: event.clientY, time: now });
        if (trail.length > 90) trail.shift();
      }
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  window.addEventListener("blur", () => {
    pointer.active = false;
  });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", applyMotionState);
  reducedMotion.addEventListener("change", applyMotionState);
  resize();
  applyMotionState();
})();
