const navigationLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionLinks = document.querySelectorAll('a[href^="#"]');
const sections = document.querySelectorAll(".page-section[id]");
const revealElements = document.querySelectorAll("[data-reveal]");
const emailForms = document.querySelectorAll("[data-email-form]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
