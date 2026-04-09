// articulo.js — Lógica de carga del detalle de artículo de MenuMaster
// Dependencia: config.js debe cargarse antes que este script.
// Dependencia: marked.js debe cargarse antes que este script.
// Dependencia: DOM debe tener #loadingArticulo y #articleContainer.

// Extraer ID de Google Drive
function extraerFileId(url) {
  if (!url || url.trim() === '') return null;
  url = url.trim();
  let m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  return null;
}

// Normalizar URL de foto — igual que menu.js
function normalizarFoto(url) {
  if (!url || url.trim() === '') return null;
  const fileId = extraerFileId(url);
  if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  return url;
}

document.addEventListener("DOMContentLoaded", function () {
  const loading     = document.getElementById("loadingArticulo");
  const containerEl = document.getElementById("articleContainer");
  const titleEl     = document.getElementById("articleTitle");
  const dateEl      = document.getElementById("articleDate");
  const resumenEl   = document.getElementById("articleResumen");
  const contentEl   = document.getElementById("articleContent");
  const fotoWrap    = document.getElementById("articleFotoWrap");
  const fotoImg     = document.getElementById("articleFoto");

  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
  });

  const params = new URLSearchParams(window.location.search);
  const codigo = params.get("codigo");

  if (!codigo) {
    loading.style.display = "none";
    titleEl.textContent = "Artículo no encontrado";
    containerEl.style.display = "block";
    return;
  }

  loading.style.display = "block";

  fetch(MENUMASTER_CONFIG.BLOG_ENDPOINT)
    .then(function (response) {
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return response.json();
    })
    .then(function (data) {
      const post = data.find(function (p) {
        return (
          p["CÓDIGO"]?.trim() === codigo.trim() &&
          String(p["Activo (si/no)"]).toLowerCase() === "si"
        );
      });

      if (!post) {
        titleEl.textContent = "Artículo no encontrado o inactivo";
        containerEl.style.display = "block";
        return;
      }

      // Foto — mostrar si existe
      const fotoUrl = normalizarFoto(post["Foto"] || "");
      if (fotoUrl) {
        fotoImg.src = fotoUrl;
        fotoImg.alt = post["Título"] || post["Titulo"] || "";
        fotoImg.onerror = function () { fotoWrap.style.display = "none"; };
        fotoWrap.style.display = "block";
      }

      // Título
      titleEl.textContent = post["Título"] || post["Titulo"] || "";

      // Fecha
      dateEl.textContent = new Date(post["Fecha"]).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      // Resumen
      resumenEl.textContent = post["Resumen"] || "";

      // Contenido Markdown → HTML
      const contenido = post["Contenido"] || post["contenido"] || "";
      contentEl.innerHTML = contenido.trim()
        ? marked.parse(contenido)
        : "<p>Este artículo no tiene contenido disponible.</p>";

      containerEl.style.display = "block";
    })
    .catch(function (err) {
      console.error("❌ Error cargando artículo:", err);
      titleEl.textContent = "Error al cargar el artículo. Intenta más tarde.";
      containerEl.style.display = "block";
    })
    .finally(function () {
      loading.style.display = "none";
    });
});
