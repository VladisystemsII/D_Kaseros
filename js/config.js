// config.js — Configuración central de MenuMaster
// Cargar SIEMPRE antes que menu.js, detalle-plato.js y reservas.html

const MENUMASTER_CONFIG = {

  // Endpoint del menú (Google Apps Script — ya activo)
  MENU_ENDPOINT: "https://script.google.com/macros/s/AKfycbwgBbbBJciQ1ZYHejWY1ohJDPSZW5HprWct_0eVtScyUfwT4tKxGSaLAGwtgCjdvCJF/exec",

  // Endpoint de pedidos (pegar aquí la URL del Apps Script Code.gs una vez implementado)
  // ⚠️ Mientras no esté listo, el pedido igual llega por WhatsApp
  PEDIDOS_ENDPOINT: "https://script.google.com/macros/s/AKfycbz9Vt7OvURVRs11SJyJdfKHQ81h2Toy8CqFQ0_qxdFBNBU9ovYGFe4eA-bObUtGBro/exec",

  // Blog
  BLOG_ENDPOINT: "https://script.google.com/macros/s/AKfycbwFQePSqC94ZZXc-60HsusUKNWUuIqEsPOmtpPoZHlrFKzXv0d7ckE5mkl7_LjP_suwCg/exec",

  // WhatsApp del restaurante (número de cocina/encargado)
  WHATSAPP_NUMBER: "573058134079"

};
