// header.js — Marca el enlace activo del menú según la página actual.
// Escucha "headerListo" emitido por header-loader.js para garantizar
// que el DOM del header ya existe antes de ejecutarse.
document.addEventListener('headerListo', () => {
  const currentURL = window.location.pathname.split('/').pop();
  const menuLinks  = document.querySelectorAll('#main-header nav a');
  let activoEncontrado = false;

  // Marcar según URL exacta
  menuLinks.forEach(link => {
    if (link.getAttribute('href') === currentURL) {
      link.classList.add('active');
      activoEncontrado = true;
    }
  });

  // Submódulos — marcar sección padre si estamos en página hija
  if (!activoEncontrado) {

    // detalle-plato.html → resaltar MENÚ
    if (currentURL === 'detalle-plato.html') {
      menuLinks.forEach(link => {
        if (link.getAttribute('href') === 'menu.html') {
          link.classList.add('active');
        }
      });
    }

    // articulo.html → resaltar BLOG
    if (currentURL === 'articulo.html' || currentURL === 'blog.html') {
      menuLinks.forEach(link => {
        if (link.textContent.trim() === 'BLOG') {
          link.classList.add('active');
        }
      });
    }
  }
});
