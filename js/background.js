const networkCanvas = document.querySelector("[data-network]");

if (networkCanvas instanceof HTMLCanvasElement) {
  const context = networkCanvas.getContext("2d");

  if (!context) {
    console.warn("No se pudo iniciar la animación de fondo: Canvas 2D no está disponible.");
  } else {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const points = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastFrame = 0;

    function resizeCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      networkCanvas.width = Math.round(width * ratio);
      networkCanvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.min(56, Math.max(18, Math.round(width / 28)));
      points.length = 0;

      for (let index = 0; index < count; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.07 + Math.random() * 0.14;
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }
    }

    function renderNetwork(timestamp = 0) {
      frame = 0;

      if (document.hidden || (timestamp - lastFrame < 32 && !reducedMotion.matches)) {
        if (!document.hidden && !reducedMotion.matches) {
          frame = window.requestAnimationFrame(renderNetwork);
        }
        return;
      }

      lastFrame = timestamp;
      context.clearRect(0, 0, width, height);
      context.fillStyle = getComputedStyle(networkCanvas).getPropertyValue("--network-dot").trim();
      context.strokeStyle = getComputedStyle(networkCanvas).getPropertyValue("--network-line").trim();
      context.lineWidth = 1;

      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];

        if (!reducedMotion.matches) {
          point.x += point.vx;
          point.y += point.vy;

          if (point.x < -12 || point.x > width + 12) point.vx *= -1;
          if (point.y < -12 || point.y > height + 12) point.vy *= -1;
        }

        for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
          const other = points[otherIndex];
          const distanceX = point.x - other.x;
          const distanceY = point.y - other.y;
          const distance = Math.hypot(distanceX, distanceY);

          if (distance > 135) continue;

          context.globalAlpha = (1 - distance / 135) * 0.52;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }

        context.globalAlpha = 0.72;
        context.shadowColor = context.fillStyle;
        context.shadowBlur = 6;
        context.beginPath();
        context.arc(point.x, point.y, 1.15, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
      }

      context.globalAlpha = 1;

      if (!reducedMotion.matches && !document.hidden) {
        frame = window.requestAnimationFrame(renderNetwork);
      }
    }

    function updateAnimation() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      renderNetwork();
    }

    resizeCanvas();
    updateAnimation();
    window.addEventListener("resize", () => {
      resizeCanvas();
      updateAnimation();
    });
    document.addEventListener("visibilitychange", updateAnimation);
    reducedMotion.addEventListener("change", updateAnimation);
    window.addEventListener("portfolio-theme-change", updateAnimation);
  }
}
