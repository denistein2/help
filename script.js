/* A rolagem por âncoras considera a altura REAL do cabeçalho fixo,
   inclusive a navegação que quebra em duas linhas em telas menores. */
(() => {
  "use strict";
  const header = document.querySelector(".site-header");
  if (!header) return;

  const updateHeaderOffset = () => {
    const height = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--help-header-offset", `${height + 8}px`);
  };

  updateHeaderOffset();
  if ("ResizeObserver" in window) {
    new ResizeObserver(updateHeaderOffset).observe(header);
  } else {
    window.addEventListener("resize", updateHeaderOffset, { passive: true });
  }
  window.addEventListener("pageshow", updateHeaderOffset);
})();

(() => {
  "use strict";

  const form = document.getElementById("lead-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const submitButton = document.getElementById("submit-lead");
  const fields = ["nome", "empresa", "email", "whatsapp", "lojas", "sistema", "necessidade", "consent"];
  const errors = {
    nome: { id: "e-nome", msg: "Informe o nome do responsável." },
    empresa: { id: "e-empresa", msg: "Informe o nome da empresa." },
    email: { id: "e-email", msg: "Informe um e-mail válido." },
    whatsapp: { id: "e-whats", msg: "Informe WhatsApp com DDD (10 ou 11 dígitos)." },
    lojas: { id: "e-lojas", msg: "Selecione a quantidade aproximada de lojas." },
    sistema: { id: "e-sistema", msg: "Selecione o sistema utilizado." },
    necessidade: { id: "e-need", msg: "Descreva a necessidade com pelo menos 10 caracteres." },
    consent: { id: "e-consent", msg: "Confirme a leitura das informações de privacidade." }
  };

  let attempted = false;

  function fieldIsValid(name, field) {
    const value = field.type === "checkbox" ? field.checked : field.value.trim();
    switch (name) {
      case "nome": return value.length >= 2;
      case "empresa": return value.length >= 2;
      case "email": return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      case "whatsapp": return /^\d{10,11}$/.test(value.replace(/\D/g, ""));
      case "lojas":
      case "sistema": return value.length > 0;
      case "necessidade": return value.length >= 10;
      case "consent": return value === true;
      default: return true;
    }
  }

  function validate() {
    let firstInvalid = null;
    for (const name of fields) {
      const input = form.elements.namedItem(name);
      const valid = fieldIsValid(name, input);
      const error = document.getElementById(errors[name].id);
      error.textContent = valid ? "" : errors[name].msg;
      input.setAttribute("aria-invalid", String(!valid));
      if (!valid && !firstInvalid) firstInvalid = input;
    }
    return firstInvalid;
  }

  function showStatus(message, type = "info") {
    status.textContent = message;
    status.style.color = type === "error" ? "#B91C1C" : "#475569";
    status.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  }

  function handleContact(event) {
    if (event) event.preventDefault();
    attempted = true;
    const firstInvalid = validate();
    if (firstInvalid) {
      showStatus("Confira os campos destacados antes de continuar.", "error");
      firstInvalid.focus();
      return;
    }

    const get = name => form.elements.namedItem(name).value.trim();
    const storeLabels = { "1": "1 loja", "2-5": "2 a 5 lojas", "6-20": "6 a 20 lojas", "21+": "Mais de 20 lojas" };
    const message = [
      "Olá, Help! Gostaria de solicitar contato comercial pelo site.",
      "",
      "Responsável: " + get("nome"),
      "Empresa: " + get("empresa"),
      "E-mail: " + get("email"),
      "WhatsApp: " + get("whatsapp"),
      "Lojas: " + (storeLabels[get("lojas")] || get("lojas")),
      "Sistema: " + get("sistema"),
      "Necessidade: " + get("necessidade").slice(0, 2000)
    ].join("\n");

    // Prepara o contato: envio somente após confirmação do visitante no WhatsApp.
    showStatus("Abrindo o WhatsApp. Confirme o envio da mensagem para concluir.");
    window.location.assign("https://wa.me/5551981483515?text=" + encodeURIComponent(message));
  }

  submitButton.addEventListener("click", handleContact);
  form.addEventListener("submit", handleContact);
  form.addEventListener("input", () => { if (attempted) validate(); });
  form.addEventListener("change", () => { if (attempted) validate(); });
})();

/* Contador de atendimentos: uma animação ao entrar em tela, com acessibilidade. */
(() => {
  "use strict";

  const counter = document.querySelector(".help-attendances-value[data-count-to]");
  if (!counter) return;

  const target = Number(counter.getAttribute("data-count-to"));
  if (!Number.isSafeInteger(target) || target <= 0) return;

  // Sem JavaScript, APIs de animação ou com movimento reduzido, o HTML já mostra 30.000+.
  if (
    !("IntersectionObserver" in window) ||
    !("requestAnimationFrame" in window) ||
    (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  ) return;

  const format = new Intl.NumberFormat("pt-BR");
  const durationMs = 1250;
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;

    observer.disconnect();
    let startTime = null;
    counter.textContent = "0";

    const tick = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      counter.textContent = format.format(value) + (progress === 1 ? "+" : "");

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    window.requestAnimationFrame(tick);
  }, { threshold: 0.3 });

  observer.observe(counter);
})();
