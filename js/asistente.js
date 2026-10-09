/* Asistente de cotización IMEX: preguntas básicas guiadas (sin inteligencia artificial, 100 % editable).
   Orienta al cliente, arma el resumen y lo envía por WhatsApp, formulario o correo. */
(function () {
  "use strict";
  var C = window.IMEX_CONFIG || {};
  var RAIZ = document.documentElement.getAttribute("data-raiz") || "./";
  var TEL = "(02) 2396 4622";

  // ---------- Flujo de preguntas ----------
  // Cada opción: [texto visible, siguiente nodo, clave opcional para recomendar]
  var PLAZO = { q: "¿Para cuándo lo necesitas?", key: "Plazo", opts: [["Lo antes posible", "extra"], ["Para la temporada 2027 (marzo)", "extra"], ["En los próximos meses", "extra"], ["Solo estoy averiguando", "extra"]] };
  var F = {
    inicio: { q: "¡Hola! Soy el asistente de Imex. Te hago unas preguntas rápidas para orientarte y que tu solicitud llegue completa a la persona correcta. ¿Qué necesitas?", key: "Necesidad", opts: [
      ["Surtir mi tienda o librería (material escolar y de oficina)", "cli", "esc"], ["Hacerme distribuidor de Imex", "dist_zona", "dist"], ["Material didáctico para colegio, jardín o institución", "did_tipo", "did"],
      ["Importar o distribuir Dactic en el extranjero", "exp_pais", "exp"], ["Equipos HSM, cuchillos Olfa o arriendo de equipos", "ind_prod", "ind"], ["Regalos para colaboradores o clientes", "reg_cant", "reg"],
      ["Una licitación o compra pública", "lic", "lic"], ["Saber dónde comprar un producto", "donde", "donde"], ["Otra consulta", "plazo", "otro"]] },
    cli: { q: "¿Qué tipo de cliente eres?", key: "Tipo de cliente", opts: [["Tienda o librería independiente", "esc_lin"], ["Cadena o canal moderno", "esc_lin"], ["Distribuidor o mayorista", "esc_lin"], ["Empresa o institución", "esc_lin"]] },
    esc_lin: { q: "¿Qué líneas te interesan?", key: "Líneas", opts: [["Escritura (Pilot, Adix)", "esc_vol"], ["Escolar, arte y manualidades", "esc_vol"], ["Oficina, carpetas y pizarras", "esc_vol"], ["Surtido completo", "esc_vol"]] },
    esc_vol: { q: "¿Qué volumen estimas por pedido?", key: "Volumen", opts: [["Pequeño (algunas cajas)", "plazo"], ["Mediano (pallets)", "plazo"], ["Grande (varios pallets o contenedor)", "plazo"], ["No lo sé aún", "plazo"]] },
    dist_zona: { q: "¿En qué ciudad o región atiendes?", key: "Zona", input: "text", next: "dist_neg", ph: "Ej.: Concepción, Biobío" },
    dist_neg: { q: "¿Qué tipo de negocio tienes?", key: "Negocio", opts: [["Librería o papelería", "plazo"], ["Juguetería o tienda de didácticos", "plazo"], ["Ferretería", "plazo"], ["Venta online", "plazo"], ["Otro", "plazo"]] },
    did_tipo: { q: "¿Para quién es?", key: "Cliente", opts: [["Colegio o jardín infantil", "did_lin"], ["Compra pública o licitación", "did_lin"], ["Tienda o distribuidor", "did_lin"], ["Otro", "did_lin"]] },
    did_lin: { q: "¿Qué área te interesa?", key: "Área", opts: [["Estimulación temprana y motricidad", "plazo"], ["Juegos de salón y matemáticos (Dactic, Smart Games)", "plazo"], ["Instrumentos musicales y juego de roles", "plazo"], ["Mobiliario y espacios", "plazo"], ["No lo sé, necesito orientación", "plazo"]] },
    exp_pais: { q: "¿Desde qué país nos escribes?", key: "País", input: "text", next: "exp_tipo", ph: "País y ciudad" },
    exp_tipo: { q: "¿Qué buscas?", key: "Interés", opts: [["Importar Dactic Games", "plazo"], ["Distribuir o representar Dactic", "plazo"], ["Otras marcas de Imex", "plazo"]] },
    ind_prod: { q: "¿Qué te interesa?", key: "Producto industrial", opts: [["Destructoras, prensas o ProfiPack (HSM)", "ind_mod"], ["Cuchillos y repuestos (Olfa)", "ind_mod"], ["Arriendo de equipos HSM", "ind_mod"], ["Línea de seguridad industrial", "ind_mod"]] },
    ind_mod: { q: "¿Compras para tu empresa o para revender?", key: "Uso", opts: [["Para mi empresa", "plazo"], ["Para revender", "plazo"], ["No lo sé aún", "plazo"]] },
    reg_cant: { q: "¿Para cuántas personas son los regalos?", key: "Cantidad", opts: [["Hasta 50", "reg_pres"], ["Entre 50 y 300", "reg_pres"], ["Más de 300", "reg_pres"]] },
    reg_pres: { q: "¿Cuánto quieres invertir por persona?", key: "Presupuesto por persona", opts: [["Hasta $10.000", "plazo"], ["De $10.000 a $20.000", "plazo"], ["De $20.000 a $40.000", "plazo"], ["Más de $40.000", "plazo"]] },
    lic: { q: "¿Cuál es el ID de la licitación o qué producto piden? (opcional)", key: "Licitación", input: "text", next: "plazo", ph: "ID de Mercado Público o descripción", opcional: true },
    donde: { q: "¿Qué producto o marca buscas?", key: "Producto buscado", input: "text", next: "donde_ciudad", ph: "Ej.: lápices gel Pilot" },
    donde_ciudad: { q: "¿En qué ciudad lo necesitas?", key: "Ciudad", input: "text", next: "extra", ph: "Ciudad o comuna" },
    plazo: PLAZO,
    extra: { q: "¿Algo más que debamos saber? (opcional)", key: "Comentarios", input: "text", next: "nombre", ph: "Escribe aquí o deja vacío", opcional: true },
    nombre: { q: "Para responderte, ¿cuál es tu nombre?", key: "Nombre", input: "text", next: "empresa", ph: "Nombre y apellido" },
    empresa: { q: "¿De qué empresa o institución eres?", key: "Empresa", input: "text", next: "correo", ph: "Empresa (opcional)", opcional: true },
    correo: { q: "¿A qué correo te respondemos?", key: "Correo", input: "email", next: "fono", ph: "tucorreo@empresa.cl" },
    fono: { q: "¿Y un teléfono para coordinar? (opcional)", key: "Teléfono", input: "tel", next: "fin", ph: "+56 9 …", opcional: true }
  };

  // ---------- Recomendación referencial ----------
  function recomendar(t) {
    var m = {
      esc: ["Te orientaría a nuestra línea de material escolar y de oficina.", "soluciones/material-escolar-y-oficina/", "Ver material escolar y de oficina"],
      dist: ["Cuéntanos tu zona y tu tipo de negocio y te explicamos cómo trabajar con Imex.", "distribuidores/", "Ver cómo ser distribuidor"],
      did: ["Para colegios, jardines e instituciones tenemos la línea de aprendizaje y entretenimiento (Dactic).", "soluciones/aprendizaje-y-entretenimiento/", "Ver aprendizaje y entretenimiento"],
      exp: ["Exportamos Dactic y Dactic Games; te enviamos el catálogo de exportación.", "exportacion/", "Ver exportación"],
      ind: ["Para HSM y Olfa, revisa la unidad industrial y B2B.", "soluciones/industrial-y-b2b/", "Ver industrial y B2B"],
      reg: ["Para regalos por presupuesto trabajamos con Imex Regalos.", "soluciones/regalos-corporativos/", "Ver regalos corporativos"],
      lic: ["Participamos en compras públicas; revisa cómo trabajamos con Mercado Público.", "licitaciones/", "Ver licitaciones"],
      donde: ["Estos son los canales donde encuentras nuestras marcas.", "donde-comprar/", "Ver dónde comprar"]
    }[t];
    return m ? { txt: m[0], ruta: m[1], etiqueta: m[2] } : null;
  }
  var INTERES = { esc: "escolar", dist: "distribuidor", did: "didactico", exp: "exportacion", ind: "industrial", reg: "regalos", lic: "licitacion", donde: "donde-comprar", otro: "otro" };

  // ---------- Interfaz ----------
  var raiz = document.createElement("div");
  raiz.innerHTML =
    '<button type="button" class="asesor-btn" aria-expanded="false" aria-controls="asesor-panel"><span aria-hidden="true">💬</span> ¿Te ayudo a cotizar?</button>' +
    '<section class="asesor-panel" id="asesor-panel" role="dialog" aria-label="Asistente de cotización Imex" hidden>' +
    '<header><strong>Asistente Imex</strong><button type="button" class="asesor-cerrar" aria-label="Cerrar asistente">×</button></header>' +
    '<div class="asesor-msgs" aria-live="polite"></div><div class="asesor-ctl"></div></section>';
  document.body.appendChild(raiz);
  var btn = raiz.querySelector(".asesor-btn"), panel = raiz.querySelector(".asesor-panel");
  var msgs = raiz.querySelector(".asesor-msgs"), ctl = raiz.querySelector(".asesor-ctl");
  var estado = null, iniciado = false;

  function nuevo() { estado = { tema: "", c: {}, resp: [], datos: {} }; }
  function burbuja(texto, tipo) {
    var d = document.createElement("div"); d.className = "asesor-b " + (tipo || "bot"); d.textContent = texto; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
  }
  function evento(n, d) { if (window.gtag) { window.gtag("event", n, d || {}); } }

  function preguntar(id) {
    var n = F[id]; if (!n) { return resumen(); }
    burbuja(n.q, "bot"); ctl.innerHTML = "";
    if (n.opts) {
      n.opts.forEach(function (o) {
        var b = document.createElement("button"); b.type = "button"; b.className = "asesor-op"; b.textContent = o[0];
        b.addEventListener("click", function () { responder(n, id, o[0], o[1], o[2]); }); ctl.appendChild(b);
      });
    } else {
      var f = document.createElement("form"); f.className = "asesor-in";
      var i = document.createElement("input"); i.type = n.input; i.placeholder = n.ph || ""; i.setAttribute("aria-label", n.q); i.autocomplete = n.input === "email" ? "email" : (id === "nombre" ? "name" : "off");
      var s = document.createElement("button"); s.type = "submit"; s.className = "asesor-env"; s.textContent = "Enviar";
      f.appendChild(i); f.appendChild(s);
      if (n.opcional) { var sk = document.createElement("button"); sk.type = "button"; sk.className = "asesor-saltar"; sk.textContent = "Saltar"; sk.addEventListener("click", function () { responder(n, id, "", n.next); }); f.appendChild(sk); }
      f.addEventListener("submit", function (e) {
        e.preventDefault(); var v = i.value.trim();
        if (!v && !n.opcional) { i.focus(); return; }
        if (n.input === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { burbuja("Revisa el correo, parece incompleto.", "bot"); i.focus(); return; }
        responder(n, id, v, n.next);
      });
      ctl.appendChild(f); i.focus();
    }
  }
  function responder(n, id, texto, sig, clave) {
    if (id === "inicio") { estado.tema = clave; }
    if (clave && id !== "inicio") { estado.c[clave.charAt(0)] = clave; }
    if (texto) { burbuja(texto, "yo"); estado.resp.push([n.key, texto]); }
    ctl.innerHTML = "";
    if (n.key === "Nombre" || n.key === "Empresa" || n.key === "Correo" || n.key === "Teléfono") { estado.datos[n.key] = texto; }
    setTimeout(function () { sig === "fin" ? resumen() : preguntar(sig); }, 250);
  }
  function textoResumen() {
    var l = ["Hola, soy " + (estado.datos["Nombre"] || "") + (estado.datos["Empresa"] ? " (" + estado.datos["Empresa"] + ")" : "") + ". Quiero contactar a Imex:"];
    estado.resp.forEach(function (r) { if (["Nombre", "Empresa", "Correo", "Teléfono"].indexOf(r[0]) < 0) { l.push("• " + r[0] + ": " + r[1]); } });
    var rc = recomendar(estado.tema); if (rc) { l.push("• Orientación del asistente: " + rc.txt); }
    l.push("Correo: " + (estado.datos["Correo"] || "-")); l.push("Teléfono: " + (estado.datos["Teléfono"] || "-"));
    return l.join("\n");
  }
  function resumen() {
    var rc = recomendar(estado.tema);
    burbuja("¡Gracias, " + (estado.datos["Nombre"] || "") + "! Esto es lo que entendí:", "bot");
    burbuja(textoResumen().split("\n").slice(1).join("\n"), "bot");
    if (rc) {
      var d = burbuja(rc.txt + " ", "bot"); var a = document.createElement("a"); a.href = RAIZ + rc.ruta; a.textContent = rc.etiqueta; d.appendChild(a);
    }
    ctl.innerHTML = "";
    var lab = document.createElement("label"); lab.className = "asesor-acepto";
    lab.innerHTML = '<input type="checkbox"> <span>Acepto que Imex use estos datos para responder mi solicitud (<a href="' + RAIZ + 'politica-de-privacidad/">política de privacidad</a>).</span>';
    ctl.appendChild(lab); var chk = lab.querySelector("input");
    function exigir() { if (!chk.checked) { burbuja("Para enviar necesito que aceptes el uso de tus datos.", "bot"); chk.focus(); return false; } return true; }
    if (C.WHATSAPP) {
      var w = document.createElement("a"); w.className = "btn btn-wsp asesor-enviar"; w.href = "#"; w.innerHTML = '<span>Enviar por WhatsApp</span>';
      w.addEventListener("click", function (e) { e.preventDefault(); if (!exigir()) { return; } evento("asistente_whatsapp", { tema: estado.tema }); window.open("https://wa.me/" + C.WHATSAPP + "?text=" + encodeURIComponent(textoResumen()), "_blank", "noopener"); fin(); });
      ctl.appendChild(w);
    }
    var m = document.createElement("button"); m.type = "button"; m.className = "btn btn-sec asesor-enviar"; m.textContent = C.FORM_ENDPOINT ? "Enviar solicitud" : "Enviar por correo";
    m.addEventListener("click", function () { if (!exigir()) { return; } evento("asistente_correo", { tema: estado.tema }); enviarCorreo(); });
    ctl.appendChild(m);
  }
  function fin() { burbuja("¡Listo! Un ejecutivo te contactará. Si es urgente, llámanos al " + TEL + ".", "bot"); }
  function enviarCorreo() {
    var d = { nombre: estado.datos["Nombre"], empresa: estado.datos["Empresa"] || "", correo: estado.datos["Correo"], telefono: estado.datos["Teléfono"] || "", interes: INTERES[estado.tema] || "otro", equipo: "", mensaje: textoResumen(), pagina: location.href, origen: "asistente" };
    if (C.FORM_ENDPOINT) {
      fetch(C.FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { if (!r.ok) { throw new Error(); } ctl.innerHTML = ""; fin(); })
        .catch(function () { burbuja("No pudimos enviar la solicitud. Escríbenos a " + C.CORREO_COTIZACIONES + " o llama al " + TEL + ".", "bot"); });
    } else {
      window.location.href = "mailto:" + C.CORREO_COTIZACIONES + "?subject=" + encodeURIComponent("Contacto web Imex (asistente): " + (INTERES[estado.tema] || "consulta")) + "&body=" + encodeURIComponent(textoResumen());
      ctl.innerHTML = ""; fin();
    }
  }
  function abrir() {
    panel.hidden = false; btn.setAttribute("aria-expanded", "true"); btn.hidden = true;
    if (!iniciado) { iniciado = true; nuevo(); preguntar("inicio"); evento("asistente_abierto"); }
  }
  function cerrar() { panel.hidden = true; btn.hidden = false; btn.setAttribute("aria-expanded", "false"); btn.focus(); }
  btn.addEventListener("click", abrir);
  raiz.querySelector(".asesor-cerrar").addEventListener("click", cerrar);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { cerrar(); } });
})();
