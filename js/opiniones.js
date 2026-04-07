document.addEventListener("DOMContentLoaded", function () {

  const urlReal = "https://menumaster.com";
  const mensaje = "Mira este restaurante en MenuMaster 👉 " + urlReal;

  const enlaceWA = "https://wa.me/?text=" + encodeURIComponent(mensaje);

  const boton = document.getElementById("btnCompartirWA");

  if (boton) {
    boton.href = enlaceWA;
  }

});