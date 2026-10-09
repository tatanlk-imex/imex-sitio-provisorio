/* IMEX - comportamiento mínimo. El sitio funciona completo sin JavaScript (salvo filtros y envío del formulario). */
(function () {
  "use strict";
  var C = window.IMEX_CONFIG || {};
  var RAIZ = document.documentElement.getAttribute("data-raiz") || "./";

  // Menú móvil
  var btn = document.querySelector(".btn-menu");
  var nav = document.getElementById("menu-principal");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var abierto = nav.classList.toggle("abierto");
      btn.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  }

  // WhatsApp (solo si está configurado)
  if (C.WHATSAPP) {
    document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
      var texto = a.getAttribute("data-whatsapp") || "Hola, quiero cotizar con Imex.";
      a.href = "https://wa.me/" + C.WHATSAPP + "?text=" + encodeURIComponent(texto);
      a.hidden = false;
    });
  }

  // Google Analytics: solo si está configurado y la persona aceptó las cookies de medición
  function cargarGA() {
    if (!C.GA4_ID || window.gtag) { return; }
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(C.GA4_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", C.GA4_ID, { anonymize_ip: true });
  }
  function leerConsentimiento() { try { return localStorage.getItem("imex_cookies"); } catch (e) { return null; } }
  function guardarConsentimiento(v) { try { localStorage.setItem("imex_cookies", v); } catch (e) {} }
  if (C.GA4_ID) {
    var cons = leerConsentimiento();
    if (cons === "si") { cargarGA(); }
    else if (cons !== "no") {
      var av = document.createElement("div");
      av.className = "aviso-cookies"; av.setAttribute("role", "dialog"); av.setAttribute("aria-label", "Uso de cookies");
      av.innerHTML = '<p>Usamos cookies de medición (Google Analytics) para saber qué páginas sirven más. No usamos cookies de publicidad. <a href="' + RAIZ + 'politica-de-privacidad/">Política de privacidad</a>.</p><div><button type="button" class="btn btn-peq" data-cookies="si">Aceptar</button><button type="button" class="btn btn-peq btn-sec" data-cookies="no">Rechazar</button></div>';
      document.body.appendChild(av);
      av.addEventListener("click", function (e) {
        var b = e.target.closest("[data-cookies]"); if (!b) { return; }
        guardarConsentimiento(b.getAttribute("data-cookies"));
        if (b.getAttribute("data-cookies") === "si") { cargarGA(); }
        av.remove();
      });
    }
  }
  function evento(nombre, datos) { if (window.gtag) { window.gtag("event", nombre, datos || {}); } }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) { return; }
    var h = a.getAttribute("href") || "";
    if (h.indexOf("tel:") === 0) { evento("llamar", { numero: h }); }
    if (h.indexOf("wa.me") > -1) { evento("whatsapp"); }
    if (h.indexOf("cotizar") > -1) { evento("clic_cotizar", { destino: h }); }
  });

  // Cuenta regresiva a marzo de 2027 (referencial: el calendario escolar lo fija el Mineduc)
  var diasT = Math.ceil((new Date(2027, 2, 1) - new Date()) / 86400000);
  document.querySelectorAll("[data-cuenta-temporada]").forEach(function (el) {
    el.textContent = diasT > 1 ? "faltan " + diasT + " días para marzo de 2027" : (diasT === 1 ? "falta 1 día para marzo de 2027" : "la temporada ya comenzó");
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-catalogo]");
    if (a) { evento("descargar_catalogo", { catalogo: a.getAttribute("data-catalogo") }); }
  });

  // Video de producto (YouTube se carga solo al hacer clic, para que la página sea rápida y no use cookies antes)
  document.querySelectorAll(".video").forEach(function (v) {
    var b = v.querySelector(".video-play");
    if (!b) { return; }
    b.addEventListener("click", function () {
      var id = v.getAttribute("data-video");
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
      f.title = "Video del producto";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      v.innerHTML = ""; v.appendChild(f);
      evento("video_producto", { video_id: id, pagina: location.pathname });
    });
  });

  // Pestañas de producto (sin JavaScript se ven todas las secciones seguidas)
  var pest = document.querySelector(".pestanas");
  if (pest) {
    var tabs = Array.prototype.slice.call(pest.querySelectorAll("[role=tab]"));
    var paneles = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    var activar = function (i) {
      tabs.forEach(function (t, j) { t.setAttribute("aria-selected", j === i ? "true" : "false"); t.tabIndex = j === i ? 0 : -1; });
      paneles.forEach(function (p, j) { p.hidden = j !== i; });
    };
    pest.classList.add("con-js");
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activar(i); if (i === 1) { evento("ver_caracteristicas", { pagina: location.pathname }); } });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var n = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length; activar(n); tabs[n].focus(); }
      });
    });
    activar(0);
    if (location.hash === "#ficha") { activar(1); }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (a && /\.pdf(\?|$)/i.test(a.getAttribute("href") || "")) { evento("descargar_ficha", { archivo: (a.getAttribute("href") || "").split("/").pop() }); }
  });

  // Galería de producto
  var principal = document.querySelector(".galeria .principal img");
  document.querySelectorAll(".galeria .miniaturas button").forEach(function (b) {
    b.addEventListener("click", function () {
      if (principal) { principal.src = b.getAttribute("data-src"); }
      document.querySelectorAll(".galeria .miniaturas button").forEach(function (x) { x.removeAttribute("aria-current"); });
      b.setAttribute("aria-current", "true");
    });
  });

  // Buscador de cabecera -> catálogo
  var fb = document.getElementById("buscar-cabecera");
  if (fb) {
    fb.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = fb.querySelector("input").value.trim();
      window.location.href = RAIZ + "catalogo/" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  // Búsqueda en el catálogo (índice liviano buscar.json; se carga solo al buscar)
  var caja = document.getElementById("resultados-busqueda");
  if (caja) {
    var inp = document.getElementById("filtro-texto"), cuenta = document.getElementById("contador"), indice = null;
    var norm = function (t) { return (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); };
    var filtro = { marca: "", uso: "" };
    var chipsM = Array.prototype.slice.call(document.querySelectorAll(".chip[data-marca-filtro]"));
    var chipsU = Array.prototype.slice.call(document.querySelectorAll(".chip[data-uso-filtro]"));
    function marcarChip(lista, attr, valor) { lista.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute(attr) === valor ? "true" : "false"); }); }
    var pintar = function (q) {
      caja.innerHTML = "";
      var palabras = norm(q).split(/\s+/).filter(Boolean);
      if (!palabras.length && !filtro.marca && !filtro.uso) { if (cuenta) { cuenta.textContent = ""; } return; }
      var hallados = indice.filter(function (p) {
        if (filtro.marca && norm(p.c) !== norm(filtro.marca)) { return false; }
        if (filtro.uso && p.s.indexOf(filtro.uso) < 0) { return false; }
        return palabras.every(function (w) { return p.b.indexOf(w) > -1; });
      });
      if (cuenta) { cuenta.textContent = hallados.length + (hallados.length === 1 ? " producto" : " productos") + (hallados.length > 60 ? " (se muestran los primeros 60)" : ""); }
      hallados.slice(0, 60).forEach(function (p) {
        var li = document.createElement("li"), a = document.createElement("a"), im = document.createElement("img"), s = document.createElement("span");
        a.href = RAIZ + p.u; im.src = RAIZ + p.i; im.alt = ""; im.width = 56; im.height = 56; im.loading = "lazy";
        s.textContent = p.n + (p.c ? " · " + p.c : ""); a.appendChild(im); a.appendChild(s); li.appendChild(a); caja.appendChild(li);
      });
      if (!hallados.length) { caja.innerHTML = "<li>No encontramos productos con esas palabras. Prueba con otro término o <a href=\"" + RAIZ + "cotizar/\">pídenos lo que buscas</a>.</li>"; }
      evento("buscar_producto", { resultados: hallados.length });
    };
    var buscar = function (q) {
      if (indice) { pintar(q); return; }
      fetch(RAIZ + "buscar.json").then(function (r) { return r.json(); }).then(function (d) {
        indice = d.map(function (x) { return { n: x[0], c: x[1], u: x[2], i: x[3], s: (x[5] || "").split(" "), b: norm(x[0] + " " + x[1] + " " + x[4]) }; }); pintar(q);
      });
    };
    chipsM.forEach(function (c) { c.addEventListener("click", function () { filtro.marca = c.getAttribute("data-marca-filtro"); marcarChip(chipsM, "data-marca-filtro", filtro.marca); buscar(inp.value); }); });
    chipsU.forEach(function (c) { c.addEventListener("click", function () { filtro.uso = c.getAttribute("data-uso-filtro"); marcarChip(chipsU, "data-uso-filtro", filtro.uso); buscar(inp.value); }); });
    var qs = new URLSearchParams(window.location.search);
    if (qs.get("marca")) { filtro.marca = qs.get("marca"); marcarChip(chipsM, "data-marca-filtro", filtro.marca); }
    if (qs.get("uso")) { filtro.uso = qs.get("uso"); marcarChip(chipsU, "data-uso-filtro", filtro.uso); }
    if (qs.get("q")) { inp.value = qs.get("q"); }
    if (qs.get("q") || filtro.marca || filtro.uso) { buscar(inp.value); }
    var t0;
    inp.addEventListener("input", function () { clearTimeout(t0); t0 = setTimeout(function () { buscar(inp.value); }, 200); });
    inp.form && inp.form.addEventListener("submit", function (e) { e.preventDefault(); buscar(inp.value); });
  }

  // Boletín (pie): mismo mecanismo que el formulario (servicio o correo)
  var bol = document.getElementById("form-boletin");
  if (bol) {
    bol.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!bol.checkValidity()) { bol.reportValidity(); return; }
      var d = { origen: "boletin", correo: bol.elements.correo.value, region: bol.elements.region.value, tipo: bol.elements.tipo.value, pagina: location.href };
      var m = document.getElementById("boletin-mensaje");
      function ok(t) { m.className = "aviso aviso-ok"; m.textContent = t; m.hidden = false; }
      evento("suscribir_boletin", { region: d.region, tipo: d.tipo });
      if (C.FORM_ENDPOINT) {
        fetch(C.FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
          .then(function (r) { if (!r.ok) { throw new Error(); } bol.reset(); ok("¡Listo! Te avisaremos de las novedades de tu zona."); })
          .catch(function () { m.className = "aviso aviso-error"; m.textContent = "No pudimos registrar tu correo. Escríbenos a " + C.CORREO_COTIZACIONES + "."; m.hidden = false; });
      } else {
        window.location.href = "mailto:" + C.CORREO_COTIZACIONES + "?subject=" + encodeURIComponent("Suscripción al boletín de Imex") + "&body=" + encodeURIComponent("Correo: " + d.correo + "\nRegión: " + d.region + "\nTipo de cliente: " + d.tipo);
        ok("Se abrió tu programa de correo con la suscripción lista. Solo debes presionar Enviar.");
      }
    });
  }

  // Formulario de cotización
  var form = document.getElementById("form-cotizacion");
  if (form) {
    var qs2 = new URLSearchParams(window.location.search);
    var eq = qs2.get("producto") || qs2.get("equipo");
    var interes = qs2.get("interes");
    if (eq && form.elements.equipo) { form.elements.equipo.value = eq; }
    if (interes && form.elements.interes) { form.elements.interes.value = interes; }
    var pm = qs2.get("msg");
    if (pm && form.elements.mensaje) { form.elements.mensaje.value = pm; }
    var msg = document.getElementById("form-mensaje");
    function aviso(clase, texto) { msg.className = "aviso " + clase; msg.textContent = texto; msg.hidden = false; msg.focus(); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements.sitio_web && form.elements.sitio_web.value) { return; } // trampa para robots
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = {};
      Array.prototype.forEach.call(form.elements, function (el) { if (el.name && el.type !== "checkbox") { d[el.name] = el.value; } });
      d.pagina = window.location.href;
      evento("enviar_cotizacion", { interes: d.interes });
      var asunto = "Cotización web Imex: " + (d.equipo || d.interes || "consulta");
      var cuerpo = "Nombre: " + d.nombre + "\nEmpresa: " + (d.empresa || "-") + "\nCorreo: " + d.correo + "\nTeléfono: " + (d.telefono || "-") +
        "\nInterés: " + d.interes + "\nProducto: " + (d.equipo || "-") + "\n\nMensaje:\n" + (d.mensaje || "-") + "\n\nEnviado desde: " + d.pagina;
      if (C.FORM_ENDPOINT) {
        fetch(C.FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
          .then(function (r) { if (!r.ok) { throw new Error("fallo"); } form.reset(); aviso("aviso-ok", "¡Gracias! Recibimos tu solicitud. Te responderemos dentro del horario de atención (lunes a viernes)."); })
          .catch(function () { aviso("aviso-error", "No pudimos enviar el formulario. Escríbenos a " + C.CORREO_COTIZACIONES + " o llama al (02) 2396 4622."); });
      } else {
        window.location.href = "mailto:" + C.CORREO_COTIZACIONES + "?subject=" + encodeURIComponent(asunto) + "&body=" + encodeURIComponent(cuerpo);
        aviso("aviso-ok", "Se abrió tu programa de correo con la solicitud lista. Solo debes presionar Enviar. Si no se abrió, escríbenos a " + C.CORREO_COTIZACIONES + ".");
      }
    });
  }
})();
