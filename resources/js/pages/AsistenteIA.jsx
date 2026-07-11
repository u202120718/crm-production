
import { useMemo, useRef, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  UserRound,
  LoaderCircle,
  Trash2,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }

  return "";
}

async function apiFetch(url, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(options.headers || {}),
  };

  const token = getCookie("XSRF-TOKEN");

  if (token) {
    headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message || "No se pudo consultar el asistente."
    );
  }

  return data;
}

const SUGGESTIONS = [
  {
    icon: BarChart3,
    title: "Resumen comercial",
    prompt: "Dame un resumen ejecutivo del rendimiento comercial actual.",
  },
  {
    icon: AlertTriangle,
    title: "Riesgos operativos",
    prompt: "Analiza los principales riesgos y ventas pendientes.",
  },
  {
    icon: TrendingUp,
    title: "Mejores campañas",
    prompt: "¿Qué campañas y comerciales tienen mejor rendimiento?",
  },
  {
    icon: ShieldCheck,
    title: "Recomendaciones",
    prompt: "Dame recomendaciones concretas para mejorar la tasa de gestión.",
  },
];

export default function AsistenteIA({ currentUser }) {
  const initialMessages = useMemo(
    () => [
      {
        role: "assistant",
        content:
          `Hola ${currentUser?.nombre || currentUser?.name || ""}. ` +
          "Puedo analizar las ventas visibles, campañas, estados y rendimiento comercial.",
      },
    ],
    [currentUser]
  );

  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const sendMessage = async (customMessage = null) => {
    const question = String(customMessage ?? message).trim();

    if (!question || loading) return;

    setError("");
    setMessage("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: question,
      },
    ]);

    try {
      setLoading(true);

      const data = await apiFetch("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: question,
        }),
      });

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer || "No se obtuvo respuesta.",
        },
      ]);

      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "No se pudo conectar con el asistente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-page">
      <style>{`
        .ai-page {
          min-height: calc(100vh - 110px);
          padding: 16px;
          color: #eaf2ff;
          border-radius: 26px;
          background:
            radial-gradient(circle at 8% 0%, rgba(34,211,238,.22), transparent 30%),
            radial-gradient(circle at 92% 12%, rgba(139,92,246,.24), transparent 32%),
            linear-gradient(135deg,#050b18,#08142b 48%,#070918);
        }

        .ai-shell {
          max-width: 1380px;
          margin: auto;
          display: grid;
          grid-template-columns: 300px minmax(0,1fr);
          gap: 14px;
        }

        .ai-panel {
          border: 1px solid rgba(148,163,184,.18);
          background: rgba(15,23,42,.72);
          border-radius: 22px;
          box-shadow: 0 18px 46px rgba(2,6,23,.28);
          backdrop-filter: blur(18px);
        }

        .ai-sidebar {
          padding: 16px;
        }

        .ai-logo {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          color: white;
          background: linear-gradient(135deg,#06b6d4,#7c3aed);
          box-shadow: 0 12px 30px rgba(124,58,237,.32);
        }

        .ai-sidebar h2 {
          margin: 14px 0 5px;
          font-size: 20px;
          font-weight: 950;
        }

        .ai-sidebar > p {
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.5;
        }

        .ai-suggestions {
          margin-top: 18px;
          display: grid;
          gap: 9px;
        }

        .ai-suggestion {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px;
          border-radius: 15px;
          border: 1px solid rgba(148,163,184,.16);
          background: rgba(255,255,255,.04);
          color: #e2e8f0;
          text-align: left;
          cursor: pointer;
          transition: .2s ease;
        }

        .ai-suggestion:hover {
          transform: translateY(-1px);
          border-color: rgba(34,211,238,.42);
          background: rgba(34,211,238,.08);
        }

        .ai-suggestion strong {
          font-size: 12px;
        }

        .ai-chat {
          min-height: 690px;
          overflow: hidden;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        .ai-header {
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(148,163,184,.14);
        }

        .ai-header h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 950;
        }

        .ai-header p {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 11px;
        }

        .ai-clear {
          width: 38px;
          height: 38px;
          border: 1px solid rgba(244,63,94,.25);
          background: rgba(244,63,94,.10);
          color: #fda4af;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-messages {
          padding: 18px;
          overflow-y: auto;
          max-height: 580px;
        }

        .ai-message {
          margin-bottom: 14px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .ai-message.user {
          flex-direction: row-reverse;
        }

        .ai-avatar {
          width: 34px;
          height: 34px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: linear-gradient(135deg,#0891b2,#7c3aed);
        }

        .ai-message.user .ai-avatar {
          background: linear-gradient(135deg,#2563eb,#1d4ed8);
        }

        .ai-bubble {
          max-width: min(760px,82%);
          padding: 12px 14px;
          border-radius: 17px;
          border: 1px solid rgba(148,163,184,.16);
          background: rgba(255,255,255,.045);
          white-space: pre-wrap;
          font-size: 13px;
          line-height: 1.6;
        }

        .ai-message.user .ai-bubble {
          background: linear-gradient(135deg,rgba(37,99,235,.35),rgba(124,58,237,.28));
          border-color: rgba(96,165,250,.32);
        }

        .ai-composer {
          padding: 14px;
          border-top: 1px solid rgba(148,163,184,.14);
        }

        .ai-inputbox {
          display: grid;
          grid-template-columns: 1fr 46px;
          gap: 9px;
        }

        .ai-inputbox textarea {
          min-height: 54px;
          max-height: 140px;
          resize: vertical;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,.24);
          background: rgba(15,23,42,.78);
          color: white;
          padding: 12px;
          outline: none;
          font-size: 13px;
        }

        .ai-send {
          border: 0;
          border-radius: 16px;
          color: white;
          background: linear-gradient(135deg,#06b6d4,#7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-error {
          margin-bottom: 9px;
          padding: 9px 11px;
          border-radius: 13px;
          border: 1px solid rgba(244,63,94,.30);
          background: rgba(244,63,94,.12);
          color: #fecdd3;
          font-size: 12px;
        }

        @media(max-width:900px) {
          .ai-shell {
            grid-template-columns: 1fr;
          }

          .ai-chat {
            min-height: 600px;
          }
        }
      `}</style>

      <div className="ai-shell">
        <aside className="ai-panel ai-sidebar">
          <div className="ai-logo">
            <Bot size={26} />
          </div>

          <h2>Asistente IA</h2>

          <p>
            Analiza ventas, campañas, estados, riesgos y rendimiento
            usando la información visible para tu usuario.
          </p>

          <div className="ai-suggestions">
            {SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
              <button
                key={title}
                className="ai-suggestion"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
              >
                <Icon size={18} />
                <strong>{title}</strong>
              </button>
            ))}
          </div>
        </aside>

        <section className="ai-panel ai-chat">
          <header className="ai-header">
            <div>
              <h3>Analista comercial inteligente</h3>
              <p>Información actual del CRM · Laravel protegido</p>
            </div>

            <button
              className="ai-clear"
              title="Limpiar conversación"
              onClick={() => {
                setMessages(initialMessages);
                setError("");
              }}
            >
              <Trash2 size={17} />
            </button>
          </header>

          <div className="ai-messages">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`ai-message ${item.role}`}
              >
                <div className="ai-avatar">
                  {item.role === "assistant" ? (
                    <Sparkles size={17} />
                  ) : (
                    <UserRound size={17} />
                  )}
                </div>

                <div className="ai-bubble">{item.content}</div>
              </div>
            ))}

            {loading && (
              <div className="ai-message">
                <div className="ai-avatar">
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                </div>

                <div className="ai-bubble">
                  Analizando datos del CRM...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <footer className="ai-composer">
            {error && <div className="ai-error">{error}</div>}

            <div className="ai-inputbox">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta por ventas, campañas, comerciales o riesgos..."
              />

              <button
                className="ai-send"
                onClick={() => sendMessage()}
                disabled={loading || !message.trim()}
              >
                {loading ? (
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={19} />
                )}
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
