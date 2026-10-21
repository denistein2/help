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
  let sending = false;

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
    status.style.color = type === "error" ? "#B91C1C" : type === "success" ? "#0F766E" : "#475569";
    status.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  }

  function setSending(value) {
    sending = value;
    submitButton.disabled = value;
    submitButton.textContent = value ? "Enviando solicitação…" : "Solicitar contato comercial";
    submitButton.style.cursor = value ? "wait" : "pointer";
    submitButton.style.opacity = value ? "0.75" : "1";
  }

  function isActivationNeeded(message) {
    return /activat|ativar|ativa[cç][aã]o|confirm.*e.?mail|verify.*email/i.test(message);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;

    // Honeypot: não enviar para o provedor quando preenchido.
    if (String(form.elements.namedItem("_honey").value).trim()) {
      showStatus("Não foi possível processar sua solicitação.", "error");
      return;
    }

    attempted = true;
    const firstInvalid = validate();
    if (firstInvalid) {
      showStatus("Confira os campos destacados antes de enviar.", "error");
      firstInvalid.focus();
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    const values = new FormData(form);
    const payload = {};
    for (const [key, value] of values.entries()) {
      if (key !== "_honey" && key !== "_next") payload[key] = String(value);
    }
    payload.consent = "Concordou com o envio dos dados para contato comercial";
    payload._replyto = payload.email;

    setSending(true);
    showStatus("Enviando sua solicitação com segurança…");

    try {
      const response = await fetch("https://formsubmit.co/ajax/helpsolucoesemsuporte@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      let result;
      try {
        result = await response.json();
      } catch (_) {
        throw new Error("O serviço de formulários não retornou uma confirmação válida.");
      }

      const providerMessage = String(result && result.message || "");
      const accepted = response.ok && String(result && result.success).toLowerCase() === "true";
      if (isActivationNeeded(providerMessage)) {
        showStatus("O formulário ainda precisa ser ativado pela Help. Por enquanto, entre em contato pelo WhatsApp ou e-mail disponíveis nesta página.", "error");
        return;
      }
      if (!accepted) {
        showStatus("Não foi possível confirmar o envio. Você pode tentar novamente ou falar diretamente com a Help pelo WhatsApp ou e-mail.", "error");
        return;
      }

      showStatus("Solicitação recebida pelo serviço de envio! O retorno depende da entrega do e-mail à Help.", "success");
      form.reset();
      attempted = false;
      for (const name of fields) {
        const input = form.elements.namedItem(name);
        input.removeAttribute("aria-invalid");
        document.getElementById(errors[name].id).textContent = "";
      }
    } catch (error) {
      const message = error && error.name === "AbortError"
        ? "O envio demorou demais e não pôde ser confirmado. Tente novamente ou use o WhatsApp."
        : "Não foi possível conectar ao serviço de formulários. Tente novamente ou entre em contato pelo WhatsApp ou e-mail.";
      showStatus(message, "error");
    } finally {
      clearTimeout(timeout);
      setSending(false);
    }
  });

  form.addEventListener("input", () => {
    if (attempted && !sending) validate();
  });
  form.addEventListener("change", () => {
    if (attempted && !sending) validate();
  });
})();
