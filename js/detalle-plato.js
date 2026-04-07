// detalle-plato.js — Detalle de un plato individual
// MenuMaster v2 — Campos sincronizados con Google Sheets real
// Dependencias: config.js y marked.js deben cargarse antes que este script.

// ===== NORMALIZAR URLs DE GOOGLE DRIVE =====
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

function normalizarFoto(url) {
  if (!url || url.trim() === '') return null;
  const fileId = extraerFileId(url);
  if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  return url;
}

// ===== FORMATEAR PRECIO =====
function formatearPrecio(precio, moneda) {
  if (!precio) return "Consultar";
  const num = Number(precio);
  if (isNaN(num)) return String(precio);
  const mon = String(moneda || "COP").toUpperCase();
  if (mon === "COP" || mon === "OPTION 1") {
    return "$ " + num.toLocaleString("es-CO") + " COP";
  }
  try {
    return num.toLocaleString("en-US", { style: "currency", currency: mon });
  } catch {
    return "$ " + num.toLocaleString("es-CO");
  }
}

// ===== CARGA PRINCIPAL =====
async function cargarPlato() {
  const mensajeCarga       = document.getElementById('mensajeCarga');
  const contenidoPropiedad = document.getElementById('contenidoPropiedad');

  const params = new URLSearchParams(window.location.search);
  // Acepta ?id=PLATO-0001 (nuevo) o ?codigo=... (legacy)
  const idPlato = params.get("id") || params.get("codigo");

  if (!idPlato) {
    mostrarError('No se especificó el plato.');
    return;
  }

  try {
    mensajeCarga.style.display = 'block';
    contenidoPropiedad.style.display = 'none';

    const response = await fetch(MENUMASTER_CONFIG.MENU_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const data = await response.json();

    // Buscar por id_plato (campo real del JSON)
    const plato = data.find(p =>
      String(p["id_plato"] || p["column 1"] || "").trim() === idPlato.trim() &&
      String(p.disponible || "").toLowerCase() === "si"
    );

    if (!plato) {
      mostrarError('Plato no encontrado o no disponible.');
      return;
    }

    renderizarPlato(plato);
    mensajeCarga.style.display = 'none';
    contenidoPropiedad.style.display = 'block';

  } catch (error) {
    console.error('Error cargando plato:', error);
    mostrarError('Error al cargar la información. Intenta más tarde.');
  }
}

// ===== RENDERIZAR =====
function renderizarPlato(plato) {

  // Título de la página
  const nombre = plato.nombre_plato || "Sin nombre";
  document.title = `${nombre} — MenuMaster`;
  document.getElementById('propTitulo').textContent = nombre;

  // Categoría
  const categoria = plato.categoria || "";
  document.getElementById('propUbicacion').textContent = categoria;

  // Disponibilidad → badge
  const disponible = String(plato.disponible || "").toLowerCase() === "si"
    ? "Disponible"
    : "No disponible";
  const tipoBadge = document.getElementById('propTipo');
  tipoBadge.textContent = disponible;
  tipoBadge.style.background = disponible === "Disponible" ? "var(--color-olive)" : "#c0392b";
  tipoBadge.style.color = "#fff";

  // Características (campos que existen en el JSON actual)
  // Tiempo, picante, porciones, valoración no están en v1 → mostramos orden y restaurante
  document.getElementById('propArea').textContent          = plato.orden           || "-";
  document.getElementById('propHabitaciones').textContent  = plato.id_restaurante  || "-";
  document.getElementById('propBanos').textContent         = "1";
  document.getElementById('propParqueaderos').textContent  = plato.destacado === "Si" ? "⭐" : "-";

  // Labels de las características (las reescribimos para que tengan sentido)
  const labels = document.querySelectorAll('.caracteristica-item .label');
  if (labels[0]) labels[0].textContent = "Orden";
  if (labels[1]) labels[1].textContent = "Restaurante";
  if (labels[2]) labels[2].textContent = "Porción";
  if (labels[3]) labels[3].textContent = "Destacado";

  // Íconos también
  const iconos = document.querySelectorAll('.caracteristica-item .icono');
  if (iconos[0]) iconos[0].textContent = "🔢";
  if (iconos[1]) iconos[1].textContent = "🏠";
  if (iconos[2]) iconos[2].textContent = "🍽️";
  if (iconos[3]) iconos[3].textContent = "⭐";

  // Descripción — Markdown si está disponible, texto plano si no
  const descripcion = plato.descripcion || "";
  const descEl = document.getElementById('propDescripcion');
  if (descripcion.trim()) {
    descEl.innerHTML = typeof marked !== 'undefined'
      ? marked.parse(descripcion)
      : descripcion;
  } else {
    descEl.innerHTML = "<p>Sin descripción disponible.</p>";
  }

  // Precio principal
  const precioFormateado = formatearPrecio(plato.precio, plato.moneda);
  document.getElementById('propPrecioVenta').textContent = precioFormateado;
  document.getElementById('propEstadoVenta').textContent = "Precio por porción";

  // Precio combo (no existe en v1, ocultamos el box)
  document.getElementById('precioArriendoBox').style.display = 'none';

  // Detalles extra (sidebar)
  document.getElementById('propEstrato').textContent        = categoria || "-";
  document.getElementById('propAdministracion').textContent = "Consultar";   // sin campo alérgenos en v1
  document.getElementById('propClasificacion').textContent  = disponible;

  // Galería — imagen única desde imagen_url
  cargarGaleria(plato);

  // Botón WhatsApp
  document.getElementById('btnWhatsapp').onclick = () => {
    const idStr  = plato.id_plato || "";
    const precio = formatearPrecio(plato.precio, plato.moneda);
    const mensaje = `Hola! Quiero pedir:\n*${nombre}*\nPrecio: ${precio}\nRef: ${idStr}`;
    window.open(
      `https://wa.me/${MENUMASTER_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
      '_blank'
    );
  };
}

// ===== GALERÍA =====
function cargarGaleria(plato) {
  const fotosArray = [];

  // Campo real del JSON: imagen_url (una sola imagen por ahora)
  const urlNormalizada = normalizarFoto(plato.imagen_url);
  if (urlNormalizada) fotosArray.push(urlNormalizada);

  if (fotosArray.length === 0) fotosArray.push('img/sin-imagen.png');

  const imgPrincipal = document.getElementById('imgPrincipal');
  imgPrincipal.src = fotosArray[0];
  imgPrincipal.alt = plato.nombre_plato || "Foto del plato";
  imgPrincipal.onerror = function () { this.src = 'img/sin-imagen.png'; };

  const thumbnailsContainer = document.getElementById('thumbnailsContainer');
  thumbnailsContainer.innerHTML = '';

  // Solo mostramos thumbnails si hay más de 1 imagen (en v1 casi siempre será 1)
  if (fotosArray.length <= 1) return;

  fotosArray.forEach((foto, index) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');

    const img = document.createElement('img');
    img.src     = foto;
    img.alt     = `Foto ${index + 1}`;
    img.loading = 'lazy';
    img.onerror = function () { this.src = 'img/sin-imagen.png'; };

    thumbnail.appendChild(img);
    thumbnail.addEventListener('click', () => {
      document.getElementById('imgPrincipal').src = foto;
      document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
      thumbnail.classList.add('active');
    });

    thumbnailsContainer.appendChild(thumbnail);
  });
}

// ===== ERROR =====
function mostrarError(mensaje) {
  document.getElementById('mensajeCarga').innerHTML = `
    <div class="mensaje-error">
      <h2>⚠️ ${mensaje}</h2>
      <p>El plato que buscas no está disponible.</p>
      <a href="menu.html" class="btn-volver"
         style="display:inline-flex; position:static; margin:20px auto 0;">
        ← Volver al menú
      </a>
    </div>
  `;
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', cargarPlato);
