// header-loader.js — Inyecta el header directamente en el DOM.
// No usa fetch() para evitar errores CORS en Live Server / file://
// Emite "headerListo" cuando el header ya está disponible en el DOM.

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("header-container");
  if (!container) return;

  container.innerHTML = `
    <header id="main-header">
      <div class="container nav">
        <div class="logo">
          <a href="index.html">
            <img src="img/logo-menumaster.png" alt="MenuMaster"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
            <span style="display:none; font-size:1.4rem; font-weight:900; color:#B8813A;">🍽️ MenuMaster</span>
          </a>
        </div>
        <nav class="menu">
          <a href="index.html">INICIO</a>
          <a href="menu.html">MENÚ</a>
          <a href="reservas.html">RESERVAS / PEDIDOS</a>
          <a href="blog.html">BLOG</a>
          <a href="opiniones.html">OPINIONES</a>
        </nav>
        <button class="menu-toggle" aria-label="Abrir menú" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  `;

  // ✅ Notificar que el header ya está en el DOM
  document.dispatchEvent(new CustomEvent("headerListo"));
});
