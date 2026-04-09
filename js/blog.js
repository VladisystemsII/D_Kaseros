// blog.js — Lógica de carga de artículos del Blog de MasterMenú
// Dependencia: config.js debe cargarse antes que este script.
// Dependencia: DOM debe tener #loadingBlogs y #blogTable antes de ejecutarse.

// Sanitiza strings para prevenir XSS al inyectar HTML dinámico
function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// Extraer ID de Google Drive (copiado de menu.js)
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

// Normalizar URL de foto (mismo método que menu.js — thumbnail funciona)
function normalizarFoto(url) {
  if (!url || url.trim() === '') return null;
  const fileId = extraerFileId(url);
  if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  return url;
}

async function loadBlogs() {
  const loading   = document.getElementById("loadingBlogs");
  const tableBody = document.querySelector("#blogTable tbody");

  try {
    loading.style.display = "block";
    const response = await fetch(MENUMASTER_CONFIG.BLOG_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    tableBody.innerHTML = "";

    const activos = data.filter(
      post => String(post["Activo (si/no)"]).toLowerCase() === "si"
    );

    if (activos.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding:40px; color:#555;">
            No hay artículos publicados aún.
          </td>
        </tr>
      `;
      return;
    }

    activos.forEach(post => {
      const codigo  = post["CÓDIGO"] || "";
      const titulo  = post["Título"] || post["Titulo"] || "Sin título";
      const fotoUrl = normalizarFoto(post["Foto"] || "");

      const fechaFormateada = new Date(post["Fecha"]).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      const fotoHtml = fotoUrl
        ? `<img
             src="${sanitize(fotoUrl)}"
             alt="${sanitize(titulo)}"
             loading="lazy"
             onerror="this.style.display='none'"
             style="
               width: 100%;
               height: 110px;
               object-fit: cover;
               display: block;
               border-radius: 6px;
               margin-bottom: 8px;
             "
           />`
        : "";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="Artículo">
          <a href="articulo.html?codigo=${encodeURIComponent(codigo)}"
             style="color:inherit; text-decoration:none;">
            ${fotoHtml}
            <span style="font-weight:700; font-size:1rem;">${sanitize(titulo)}</span>
          </a>
        </td>
        <td data-label="Fecha">${sanitize(fechaFormateada)}</td>
        <td data-label="Resumen">${sanitize(post["Resumen"])}</td>
        <td data-label="Leer Más">
          <a href="articulo.html?codigo=${encodeURIComponent(codigo)}"
             class="readMoreBtn">
            Leer Más
          </a>
        </td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("❌ Error cargando blogs:", err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; color:#d32f2f; padding:40px;">
          Error al cargar los blogs. Intenta más tarde.
        </td>
      </tr>
    `;
  } finally {
    loading.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", loadBlogs);
