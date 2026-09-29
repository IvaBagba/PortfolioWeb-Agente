(() => {
  let theme = "dark";

  try {
    const savedTheme = window.localStorage.getItem("portfolio-theme");
    if (savedTheme === "light" || savedTheme === "dark") theme = savedTheme;
  } catch (error) {
    console.warn("No se pudo recuperar el tema guardado.", error);
  }

  document.documentElement.dataset.theme = theme;
})();
