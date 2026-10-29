const navigationLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionLinks = document.querySelectorAll('a[href^="#"]');
const sections = document.querySelectorAll(".page-section[id]");
const revealElements = document.querySelectorAll("[data-reveal]");
const emailForms = document.querySelectorAll("[data-email-form]");
const carousels = document.querySelectorAll("[data-carousel]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const themeToggles = document.querySelectorAll("[data-theme-toggle]");
const themeMeta = document.querySelector('meta[name="theme-color"]');

function updateIcon(element, iconName) {
  element?.querySelector("use")?.setAttribute("href", `#icon-${iconName}`);
}

function updateThemeControls(theme) {
  const isDark = theme === "dark";

  themeToggles.forEach((button) => {
    const label = isDark ? "Claro" : "Oscuro";
    const action = `Cambiar a modo ${isDark ? "claro" : "oscuro"}`;
    button.setAttribute("aria-label", action);
    button.setAttribute("title", action);
    button.querySelector("[data-theme-label]")?.replaceChildren(label);
    updateIcon(button.querySelector("[data-theme-icon]"), isDark ? "sun" : "moon");
  });

  if (themeMeta) themeMeta.setAttribute("content", isDark ? "#171a1b" : "#f0eee7");
}

updateThemeControls(document.documentElement.dataset.theme || "dark");

themeToggles.forEach((button) => {
  button.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    updateThemeControls(theme);

    try {
      window.localStorage.setItem("portfolio-theme", theme);
    } catch (error) {
      console.warn("No se pudo guardar la preferencia de tema.", error);
    }

    window.dispatchEvent(new Event("portfolio-theme-change"));
  });
});

let activeScrollFrame = 0;

function cancelSectionScroll() {
  if (!activeScrollFrame) return;
  window.cancelAnimationFrame(activeScrollFrame);
  activeScrollFrame = 0;
}

function scrollToSection(target, updateHistory = false) {
  cancelSectionScroll();

  const headerHeight = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
  ) || 0;
  const destination = Math.max(
    0,
    target.getBoundingClientRect().top + window.scrollY - headerHeight,
  );
  const start = window.scrollY;

  if (updateHistory) {
    history.pushState(null, "", `#${target.id}`);
  }

  if (reducedMotion.matches || Math.abs(destination - start) < 2) {
    window.scrollTo(0, destination);
    return;
  }

  const duration = Math.min(2300, 1250 + Math.abs(destination - start) * 0.28);
  let startedAt;

  function step(timestamp) {
    startedAt ??= timestamp;
    const progress = Math.min(1, (timestamp - startedAt) / duration);
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    window.scrollTo(0, start + (destination - start) * eased);

    if (progress < 1) {
      activeScrollFrame = window.requestAnimationFrame(step);
    } else {
      activeScrollFrame = 0;
    }
  }

  activeScrollFrame = window.requestAnimationFrame(step);
}

sectionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;

    event.preventDefault();
    scrollToSection(target, true);
  });
});

window.addEventListener("wheel", cancelSectionScroll, { passive: true });
window.addEventListener("touchstart", cancelSectionScroll, { passive: true });
window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
    cancelSectionScroll();
  }
});

window.addEventListener("hashchange", () => {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) scrollToSection(target);
});

if (location.hash) {
  requestAnimationFrame(() => {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) scrollToSection(target);
  });
}

if ("IntersectionObserver" in window) {
  if (sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const activeLink = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`,
          );
          if (!activeLink) continue;

          navigationLinks.forEach((link) => link.removeAttribute("aria-current"));
          activeLink.setAttribute("aria-current", "location");
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

carousels.forEach((carousel) => {
  const viewport = carousel.querySelector("[data-carousel-viewport]");
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const toggleButton = carousel.querySelector("[data-carousel-toggle]");
  const toggleIcon = carousel.querySelector("[data-carousel-toggle-icon]");
  const status = carousel.querySelector("[data-carousel-status]");

  if (!(viewport instanceof HTMLElement) ||
      !(previousButton instanceof HTMLButtonElement) ||
      !(nextButton instanceof HTMLButtonElement) ||
      !(toggleButton instanceof HTMLButtonElement)) {
    return;
  }

  const cards = Array.from(viewport.querySelectorAll(".carousel-track > *"));
  const progress = carousel.querySelector(".carousel-progress");
  const interval = 7000;
  let timer = 0;
  let hovered = false;
  let focused = false;
  let manuallyPaused = false;
  let inView = !("IntersectionObserver" in window);

  function getCurrentCardIndex() {
    const viewportRect = viewport.getBoundingClientRect();
    const viewportCenter = viewportRect.left + viewport.clientLeft + viewport.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - viewportCenter);

      if (distance < closestDistance) {
        closestIndex = index;
        closestDistance = distance;
      }
    });

    return closestIndex;
  }

  function updateControls() {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const canScroll = cards.length > 1 && maxScroll > 2;
    previousButton.disabled = !canScroll;
    nextButton.disabled = !canScroll;
    toggleButton.disabled = !canScroll || reducedMotion.matches;

    if (status) {
      status.textContent = `${String(getCurrentCardIndex() + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    }

    cards.forEach((card, index) => {
      card.setAttribute("aria-roledescription", "diapositiva");
      card.setAttribute("aria-label", `${index + 1} de ${cards.length}`);
    });
  }

  function scrollToCard(direction) {
    if (cards.length < 2) return;
    const nextCard = (getCurrentCardIndex() + direction + cards.length) % cards.length;
    const viewportRect = viewport.getBoundingClientRect();
    const cardRect = cards[nextCard].getBoundingClientRect();
    const scrollInset = Number.parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
    const target = viewport.scrollLeft + cardRect.left - viewportRect.left -
      viewport.clientLeft - scrollInset;

    viewport.scrollTo({
      left: Math.max(0, Math.min(target, viewport.scrollWidth - viewport.clientWidth)),
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  }

  function syncAutoplay() {
    const shouldPlay = inView && !hovered && !focused && !manuallyPaused &&
      !document.hidden && !reducedMotion.matches && cards.length > 1;

    window.clearInterval(timer);
    timer = 0;
    carousel.classList.toggle("is-autoplaying", shouldPlay);
    carousel.classList.toggle("is-paused", !shouldPlay);

    if (shouldPlay) {
      timer = window.setInterval(() => {
        const currentCard = Number.parseInt(status?.textContent.split("/")[0] || "1", 10);
        scrollToCard(currentCard >= cards.length ? 1 - cards.length : 1);
      }, interval);
    }

    const action = manuallyPaused ? "Reanudar" : "Pausar";
    const label = reducedMotion.matches
      ? "Carrusel automático desactivado por preferencia de movimiento"
      : `${action} reproducción automática`;
    toggleButton.setAttribute("aria-label", label);
    toggleButton.setAttribute("title", label);
    updateIcon(toggleIcon, manuallyPaused || reducedMotion.matches ? "play" : "pause");
    if (progress) progress.setAttribute("aria-hidden", "true");
  }

  previousButton.addEventListener("click", () => scrollToCard(-1));
  nextButton.addEventListener("click", () => scrollToCard(1));
  toggleButton.addEventListener("click", () => {
    manuallyPaused = !manuallyPaused;
    syncAutoplay();
  });

  carousel.addEventListener("pointerenter", () => {
    hovered = true;
    syncAutoplay();
  });
  carousel.addEventListener("pointerleave", () => {
    hovered = false;
    syncAutoplay();
  });
  carousel.addEventListener("focusin", () => {
    focused = true;
    syncAutoplay();
  });
  carousel.addEventListener("focusout", (event) => {
    if (carousel.contains(event.relatedTarget)) return;
    focused = false;
    syncAutoplay();
  });
  viewport.addEventListener("scroll", updateControls, { passive: true });
  viewport.addEventListener("touchstart", () => {
    hovered = true;
    syncAutoplay();
  }, { passive: true });
  viewport.addEventListener("touchend", () => {
    window.setTimeout(() => {
      hovered = false;
      syncAutoplay();
    }, 900);
  }, { passive: true });
  window.addEventListener("resize", updateControls);
  document.addEventListener("visibilitychange", syncAutoplay);
  reducedMotion.addEventListener("change", () => {
    updateControls();
    syncAutoplay();
  });

  if ("IntersectionObserver" in window) {
    const carouselObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncAutoplay();
      },
      { threshold: 0.2 },
    );
    carouselObserver.observe(carousel);
  }

  updateControls();
  syncAutoplay();
});

emailForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const recipient = form.dataset.recipient;

    if (!recipient || !name || !email || !message) return;

    const subject = `Mensaje desde el portfolio de ${name}`;
    const body = [`Nombre: ${name}`, `Email: ${email}`, "", message].join("\n");
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const status = form.querySelector("[data-email-status]");

    if (status) {
      status.textContent = "Abriendo tu aplicación de correo para que revises y envíes el mensaje.";
    }

    window.location.href = mailto;
  });
});
