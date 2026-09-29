const navigationLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = document.querySelectorAll(".page-section[id]");
const revealElements = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
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
