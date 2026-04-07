// footer-loader.js — Inyecta el footer directamente en el DOM.
// No usa fetch() para evitar errores CORS en Live Server / file://

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("footer-container");
  if (!container) return;

  container.innerHTML = `
    <footer>
      <div class="container footer-grid">
        <div>
          <h4>Contacto</h4>
          <p><a href="https://wa.me/573XXXXXXXXX" target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
          <p><a href="mailto:contacto@menumaster.com">Email</a></p>
        </div>
        <div>
          <h4>Redes</h4>
          <p><a href="https://instagram.com/menumaster" target="_blank" rel="noopener noreferrer">Instagram</a></p>
          <p><a href="https://facebook.com/menumaster" target="_blank" rel="noopener noreferrer">Facebook</a></p>
        </div>
        <div>
          <h4>El Chef</h4>
          <div class="agent-photo">
            <img src="img/CHEF-MASTERMENU.png" alt="Chef MenuMaster" loading="lazy">
          </div>
          <p class="agent-name">MenuMaster</p>
        </div>
      </div>
      <div class="footer-slogan">"Conectamos sabores con personas."</div>
    </footer>
  `;
});
