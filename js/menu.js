// menu.js — Carta de restaurante por secciones
// MenuMaster v2 — Layout carta física + carrito localStorage
// Dependencia: config.js debe cargarse antes.

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
  if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  return url;
}

function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function formatearPrecio(precio, moneda) {
  if (!precio && precio !== 0) return "Consultar";
  const num = Number(precio);
  if (isNaN(num)) return sanitize(String(precio));
  const mon = String(moneda || "COP").toUpperCase();
  if (mon === "COP" || mon === "OPTION 1" || mon === "") {
    return "$ " + num.toLocaleString("es-CO");
  }
  try {
    return num.toLocaleString("en-US", { style: "currency", currency: mon });
  } catch {
    return "$ " + num.toLocaleString("es-CO");
  }
}

// ===== CARRITO (localStorage) =====
function getCarrito() {
  try {
    return JSON.parse(localStorage.getItem("mm_carrito")) || [];
  } catch { return []; }
}

function guardarCarrito(carrito) {
  localStorage.setItem("mm_carrito", JSON.stringify(carrito));
}

function agregarAlCarrito(plato) {
  const carrito = getCarrito();
  const existe = carrito.find(p => p.id === plato.id);
  if (existe) {
    existe.cantidad = (existe.cantidad || 1) + 1;
  } else {
    carrito.push({ ...plato, cantidad: 1 });
  }
  guardarCarrito(carrito);
  actualizarFlotante();
  mostrarFeedback(plato.nombre);
}

function actualizarFlotante() {
  const carrito = getCarrito();
  const total = carrito.reduce((acc, p) => acc + (p.cantidad || 1), 0);
  const flotante = document.getElementById("pedidoFlotante");
  const contador = document.getElementById("pedidoContador");
  if (total > 0) {
    flotante.style.display = "flex";
    contador.textContent = total;
  } else {
    flotante.style.display = "none";
  }
}

function mostrarFeedback(nombre) {
  const fb = document.createElement("div");
  fb.className = "carta-feedback";
  fb.textContent = `✓ "${nombre}" agregado`;
  document.body.appendChild(fb);
  setTimeout(() => fb.classList.add("visible"), 10);
  setTimeout(() => {
    fb.classList.remove("visible");
    setTimeout(() => fb.remove(), 300);
  }, 2000);
}

// ===== ESTADO GLOBAL =====
let todosLosPlatos = [];

// ===== SUBNAV DINÁMICO =====
function construirSubnav(categorias) {
  const subnav = document.querySelector(".carta-subnav-inner");
  if (!subnav) return;

  subnav.innerHTML = `<span class="subnav-pill active" data-categoria="todos">Todos</span>`;

  categorias.forEach(cat => {
    const span = document.createElement("span");
    span.className = "subnav-pill";
    span.setAttribute("data-categoria", cat.toLowerCase());
    span.textContent = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    subnav.appendChild(span);
  });

  subnav.querySelectorAll(".subnav-pill").forEach(pill => {
    pill.addEventListener("click", function () {
      subnav.querySelectorAll(".subnav-pill").forEach(p => p.classList.remove("active"));
      this.classList.add("active");
      filtrarCarta(this.getAttribute("data-categoria"));
    });
  });
}

// ===== FILTRAR CARTA =====
function filtrarCarta(categoria) {
  document.querySelectorAll(".carta-seccion").forEach(sec => {
    if (categoria === "todos") {
      sec.style.display = "block";
    } else {
      sec.style.display =
        sec.getAttribute("data-categoria").toLowerCase() === categoria
          ? "block" : "none";
    }
  });
}

// ===== RENDERIZAR CARTA =====
function renderizarCarta(platos) {
  const contenido = document.getElementById("cartaContenido");
  contenido.innerHTML = "";

  const grupos = {};
  const ordenCategorias = [];

  platos.forEach(plato => {
    const cat = String(plato.categoria || "Otros").trim();
    if (!grupos[cat]) {
      grupos[cat] = [];
      ordenCategorias.push(cat);
    }
    grupos[cat].push(plato);
  });

  construirSubnav(ordenCategorias);

  ordenCategorias.forEach((categoria, idx) => {
    const seccion = document.createElement("section");
    seccion.className = "carta-seccion";
    seccion.setAttribute("data-categoria", categoria.toLowerCase());
    seccion.style.animationDelay = `${idx * 0.08}s`;

    seccion.innerHTML = `
      <div class="carta-seccion-header">
        <div class="carta-seccion-linea"></div>
        <h2 class="carta-seccion-titulo">${sanitize(categoria)}</h2>
        <div class="carta-seccion-linea"></div>
      </div>
      <div class="carta-platos-lista"></div>
    `;

    contenido.appendChild(seccion);

    const lista = seccion.querySelector(".carta-platos-lista");

    const platosOrdenados = [...grupos[categoria]].sort((a, b) => {
      const oa = parseInt(String(a.orden || "").replace(/\D/g, "")) || 999;
      const ob = parseInt(String(b.orden || "").replace(/\D/g, "")) || 999;
      return oa - ob;
    });

    platosOrdenados.forEach((plato, pidx) => {
      lista.appendChild(renderizarItemPlato(plato, pidx));
    });
  });
}

// ===== ITEM DE PLATO EN LA CARTA =====
function renderizarItemPlato(plato, idx) {
  const id        = plato.id_plato || plato["column 1"] || "";
  const nombre    = plato.nombre_plato || "Sin nombre";
  const desc      = plato.descripcion || "";
  const precio    = formatearPrecio(plato.precio, plato.moneda);
  const destacado = String(plato.destacado || "").toLowerCase() === "si";
  const fotoUrl   = normalizarFoto(plato.imagen_url);

  const item = document.createElement("article");
  item.className = "carta-item" + (destacado ? " carta-item--destacado" : "");
  item.style.animationDelay = `${idx * 0.05}s`;

  item.innerHTML = `
    <div class="carta-item-info">
      ${destacado ? '<span class="carta-badge">Destacado</span>' : ''}
      <h3 class="carta-item-nombre">
        <a href="detalle-plato.html?id=${encodeURIComponent(id)}">${sanitize(nombre)}</a>
      </h3>
      ${desc ? `<p class="carta-item-desc">${sanitize(desc)}</p>` : ''}
      <div class="carta-item-pie">
        <span class="carta-item-precio">${precio}</span>
        <div class="carta-item-acciones">
          <a href="detalle-plato.html?id=${encodeURIComponent(id)}"
             class="carta-btn-ver">Ver detalle</a>
          <button class="carta-btn-agregar"
                  data-id="${sanitize(id)}"
                  data-nombre="${sanitize(nombre)}"
                  data-precio="${plato.precio || 0}"
                  data-moneda="${sanitize(plato.moneda || 'COP')}">
            + Agregar
          </button>
        </div>
      </div>
    </div>
    ${fotoUrl ? `
    <a href="detalle-plato.html?id=${encodeURIComponent(id)}"
       class="carta-item-foto-link" tabindex="-1">
      <div class="carta-item-foto">
        <img src="${fotoUrl}" alt="${sanitize(nombre)}" loading="lazy"
             onerror="this.closest('.carta-item-foto-link').style.display='none'">
      </div>
    </a>` : ''}
  `;

  item.querySelector(".carta-btn-agregar").addEventListener("click", function () {
    agregarAlCarrito({
      id:     this.dataset.id,
      nombre: this.dataset.nombre,
      precio: parseFloat(this.dataset.precio) || 0,
      moneda: this.dataset.moneda
    });
    this.textContent = "✓ Agregado";
    this.classList.add("agregado");
    setTimeout(() => {
      this.textContent = "+ Agregar";
      this.classList.remove("agregado");
    }, 1500);
  });

  return item;
}

// ===== CARGA PRINCIPAL =====
async function loadMenu() {
  const cargando  = document.getElementById("cartaCargando");
  const contenido = document.getElementById("cartaContenido");

  try {
    cargando.style.display = "flex";

    const response = await fetch(MENUMASTER_CONFIG.MENU_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    todosLosPlatos = data.filter(
      p => String(p.disponible || "").toLowerCase() === "si"
    );

    if (todosLosPlatos.length === 0) {
      contenido.innerHTML = `
        <p class="carta-vacia">No hay platos disponibles en este momento.</p>`;
      return;
    }

    renderizarCarta(todosLosPlatos);
    actualizarFlotante();

  } catch (err) {
    console.error("Error cargando carta:", err);
    contenido.innerHTML = `
      <p class="carta-error">Error al cargar la carta. Intenta más tarde.</p>`;
  } finally {
    cargando.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", loadMenu);
