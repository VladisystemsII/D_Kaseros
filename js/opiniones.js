document.addEventListener("DOMContentLoaded", function () {

  const urlReal = "https://vladisystemsii.github.io/MasterMenu/";
  const mensaje = "Mira este restaurante en MenuMaster 👉 " + urlReal;

  const enlaceWA = "https://wa.me/?text=" + encodeURIComponent(mensaje);

  const boton = document.getElementById("btnCompartirWA");

  if (boton) {
    boton.href = enlaceWA;
  }

});