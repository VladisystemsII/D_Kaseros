// reservas.js — Lógica del módulo Reservas / Pedidos
// Readaptado de notificaciones.js — Portal33
// Responsabilidad: scroll del botón CTA hacia el formulario.

document.addEventListener("DOMContentLoaded", function () {
  const boton = document.getElementById("scrollToForm");
  const formulario = document.getElementById("googleForm");
  if (!boton || !formulario) return;
  boton.addEventListener("click", function () {
    formulario.scrollIntoView({ behavior: "smooth" });
  });
});
