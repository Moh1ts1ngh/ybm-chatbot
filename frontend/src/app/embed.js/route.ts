import { clientEnv } from "@/env/client";

export const dynamic = "force-static";

const BACKEND_URL = clientEnv.NEXT_PUBLIC_BACKEND_URL;

const SCRIPT = `(() => {
  const BACKEND_URL = ${JSON.stringify(BACKEND_URL)};

  function createWidgetRoot() {
    const existing = document.getElementById("ybm-chatbot-root");
    if (existing) return existing;
    const root = document.createElement("div");
    root.id = "ybm-chatbot-root";
    document.body.appendChild(root);
    return root;
  }

  function getConfigFromScript() {
    const current = document.currentScript;
    const scriptEl = current || document.querySelector('script[data-embed-id][src*="embed.js"]');
    if (!scriptEl) return null;
    const dataset = scriptEl.dataset || {};
    return {
      embedId: dataset.embedId || "",
      embedToken: dataset.embedToken || "",
    };
  }

  async function createWidget() {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const config = getConfigFromScript();
    if (!config || !config.embedId) {
      console.warn("[YBM Chatbot] Missing data-embed-id on script tag");
      return;
    }

    const root = createWidgetRoot();

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "999999";
    container.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Chat";
    toggleButton.style.borderRadius = "999px";
    toggleButton.style.border = "none";
    toggleButton.style.padding = "10px 16px";
    toggleButton.style.background = "#111827";
    toggleButton.style.color = "#fff";
    toggleButton.style.fontSize = "13px";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";

    const panel = document.createElement("div");
    panel.style.position = "fixed";
    panel.style.bottom = "72px";
    panel.style.right = "20px";
    panel.style.width = "320px";
    panel.style.maxHeight = "480px";
    panel.style.borderRadius = "18px";
    panel.style.background = "#ffffff";
    panel.style.boxShadow = "0 18px 45px rgba(15,23,42,0.35)";
    panel.style.display = "none";
    panel.style.overflow = "hidden";

    const header = document.createElement("div");
    header.style.padding = "12px 16px";
    header.style.borderBottom = "1px solid #e5e7eb";
    header.style.background = "#f9fafb";
    header.innerHTML = "<div style=\\"font-size:13px;font-weight:600;color:#111827\\">Assistant</div><div style=\\"font-size:11px;color:#6b7280;margin-top:2px\\">Powered by YBM</div>";

    const messagesEl = document.createElement("div");
    messagesEl.style.flex = "1";
    messagesEl.style.overflowY = "auto";
    messagesEl.style.padding = "10px 10px 8px";
    messagesEl.style.display = "flex";
    messagesEl.style.flexDirection = "column";
    messagesEl.style.gap = "6px";

    const footer = document.createElement("form");
    footer.style.display = "flex";
    footer.style.alignItems = "center";
    footer.style.gap = "6px";
    footer.style.padding = "8px";
    footer.style.borderTop = "1px solid #e5e7eb";
    footer.style.background = "#f9fafb";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Ask a question...";
    input.style.flex = "1";
    input.style.fontSize = "12px";
    input.style.padding = "7px 9px";
    input.style.borderRadius = "999px";
    input.style.border = "1px solid #d1d5db";
    input.style.outline = "none";

    const sendBtn = document.createElement("button");
    sendBtn.type = "submit";
    sendBtn.textContent = "Send";
    sendBtn.style.fontSize = "11px";
    sendBtn.style.padding = "7px 10px";
    sendBtn.style.borderRadius = "999px";
    sendBtn.style.border = "none";
    sendBtn.style.background = "#111827";
    sendBtn.style.color = "#fff";
    sendBtn.style.cursor = "pointer";

    footer.appendChild(input);
    footer.appendChild(sendBtn);

    const body = document.createElement("div");
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.height = "100%";
    body.appendChild(header);
    body.appendChild(messagesEl);
    body.appendChild(footer);
    panel.appendChild(body);

    let isOpen = false;
    let isSending = false;
    let sessionId = null;

    function appendMessage(role, content) {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = role === "user" ? "flex-end" : "flex-start";

      const bubble = document.createElement("div");
      bubble.style.maxWidth = "80%";
      bubble.style.fontSize = "12px";
      bubble.style.lineHeight = "1.4";
      bubble.style.padding = "7px 10px";
      bubble.style.borderRadius = "14px";
      bubble.style.whiteSpace = "pre-wrap";
      bubble.textContent = content;
      if (role === "user") {
        bubble.style.background = "#111827";
        bubble.style.color = "#ffffff";
      } else {
        bubble.style.background = "#f3f4f6";
        bubble.style.color = "#111827";
      }

      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    toggleButton.addEventListener("click", () => {
      isOpen = !isOpen;
      panel.style.display = isOpen ? "block" : "none";
    });

    footer.addEventListener("submit", async (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value || isSending) return;

      appendMessage("user", value);
      input.value = "";
      isSending = true;

      try {
        const res = await fetch(BACKEND_URL + "/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: value,
            embedToken: config.embedToken || undefined,
            sessionId: sessionId || undefined,
          }),
        });

        if (!res.ok) {
          appendMessage("assistant", "Sorry, something went wrong.");
        } else {
          const json = await res.json();
          if (json.sessionId) {
            sessionId = json.sessionId;
          }
          appendMessage("assistant", json.answer || "");
        }
      } catch (error) {
        console.warn("[YBM Chatbot] Chat request failed", error);
        appendMessage("assistant", "Unable to reach the assistant right now.");
      } finally {
        isSending = false;
      }
    });

    container.appendChild(toggleButton);
    root.appendChild(container);
    document.body.appendChild(panel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createWidget);
  } else {
    createWidget();
  }
})();`;

export function GET() {
  return new Response(SCRIPT, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}


