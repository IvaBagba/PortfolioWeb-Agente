# Portfolio de Ivan Baguena

Portfolio web estático en español dividido en cuatro páginas: inicio, perfil y
tecnologías, proyectos y contacto. La navegación enlaza las páginas, con
desplazamiento animado entre las secciones del perfil, temas oscuro/claro, una
red sutil de puntos conectados en movimiento y carruseles automáticos.

El modo oscuro es el predeterminado. La preferencia de tema queda guardada en
el navegador. Los carruseles avanzan automáticamente, se pausan al pasar el
cursor o al recibir el foco y permiten pausar/reanudar manualmente; respetan la
preferencia de movimiento reducido del dispositivo.

El formulario de contacto prepara un mensaje dirigido a
`baguena.delabandera.ivan@gmail.com` y abre la aplicación de correo del visitante.
El visitante debe revisar y enviar el correo; el portfolio estático no envía
mensajes a través de un servidor.

## Ver el sitio localmente

No necesita dependencias ni proceso de compilación. Abre `index.html` en un
navegador o sirve la carpeta desde un servidor estático local.

## Personalización

Los datos del perfil y los proyectos se mantienen en las páginas HTML. Los
enlaces de los proyectos apuntan a los repositorios públicos del perfil
[IvaBagba](https://github.com/IvaBagba).

El retrato principal se guarda localmente en
`assets/ivan-baguena-linkedin.jpg`, así no depende de la URL temporal de LinkedIn.
La imagen de muestra de la sección «Sobre mí» sigue en
`assets/profile-placeholder-about.svg`; puedes sustituirla por otra foto o
actualizar su ruta `src` en `pages/about.html`.

## Páginas

- `index.html`: presentación.
- `pages/about.html`: perfil y áreas de desarrollo.
- `pages/projects.html`: proyectos seleccionados en un carrusel.
- `pages/contact.html`: email y perfiles profesionales.
