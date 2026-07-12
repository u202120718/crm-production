import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  Bot,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MessageSquareText,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserRound,
  XCircle,
} from "lucide-react";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(";").shift() : "";
}

async function apiFetch(url, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(options.headers || {}),
  };

  const token = getCookie("XSRF-TOKEN");
  if (token) headers["X-XSRF-TOKEN"] = decodeURIComponent(token);

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo completar la solicitud.");
  }

  return data;
}

const SUGGESTIONS = [
  {
    icon: BarChart3,
    title: "Resumen ejecutivo",
    prompt:
      "Dame un resumen ejecutivo de las ventas visibles. Incluye cifras, hallazgos, riesgos y tres recomendaciones concretas.",
  },
  {
    icon: AlertTriangle,
    title: "Ventas en riesgo",
    prompt:
      "Analiza las ventas pendientes, caídas y no favorables. Ordénalas por prioridad y recomienda qué debe revisar backoffice.",
  },
  {
    icon: TrendingUp,
    title: "Rendimiento comercial",
    prompt:
      "Compara campañas y comerciales. Explica quién tiene mejor rendimiento y quién necesita apoyo.",
  },
  {
    icon: Target,
    title: "Plan de acción",
    prompt:
      "Crea un plan de acción operativo para hoy basado en las ventas visibles, con responsables y prioridades.",
  },
  {
    icon: CheckCircle2,
    title: "Ventas activas",
    prompt:
      "Resume las ventas activas o finalizadas recientes y señala cuáles necesitan seguimiento.",
  },
  {
    icon: TrendingDown,
    title: "Ventas caídas",
    prompt:
      "Analiza ventas caídas, canceladas o rechazadas. Busca patrones y recomienda cómo prevenir nuevas caídas.",
  },
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAlertPresentation(type) {
  const normalized = String(type || "").toUpperCase();

  if (normalized.includes("ACTIVA")) {
    return { icon: CheckCircle2, tone: "success" };
  }

  if (
    normalized.includes("CAIDA") ||
    normalized.includes("CANCEL") ||
    normalized.includes("RECHAZ")
  ) {
    return { icon: XCircle, tone: "danger" };
  }

  if (normalized.includes("PEND")) {
    return { icon: Clock3, tone: "warning" };
  }

  return { icon: BellRing, tone: "info" };
}

function MetricCard({ icon: Icon, label, value, tone, subtitle }) {
  return (
    <div className={`ai-metric ${tone}`}>
      <div className="ai-metric-icon">
        <Icon size={18} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

export default function AsistenteIA({ currentUser }) {
  const initialMessages = useMemo(
    () => [
      {
        role: "assistant",
        content:
          `Hola ${currentUser?.nombre || currentUser?.name || ""}. ` +
          "Puedo analizar ventas, campañas, estados, riesgos y rendimiento. También te mostraré alertas automáticas de ventas activas, pendientes o caídas.",
      },
    ],
    [currentUser]
  );

  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    activas: 0,
    caidas: 0,
    pendientes: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const unreadAlerts = useMemo(
    () => alerts.filter((item) => !item.read_at).length,
    [alerts]
  );

  const loadAlerts = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoadingAlerts(true);

      const data = await apiFetch("/ai/alerts");

      setAlerts(Array.isArray(data?.alerts) ? data.alerts : []);
      setSummary({
        total: Number(data?.summary?.total || 0),
        activas: Number(data?.summary?.activas || 0),
        caidas: Number(data?.summary?.caidas || 0),
        pendientes: Number(data?.summary?.pendientes || 0),
      });
    } catch (requestError) {
      if (!silent) setError(requestError.message);
    } finally {
      if (!silent) setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    const interval = window.setInterval(() => {
      loadAlerts({ silent: true });
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages, loading]);

  const sendMessage = async (customMessage = null) => {
    const question = String(customMessage ?? message).trim();

    if (!question || loading) return;

    setError("");
    setMessage("");
    setMessages((previous) => [
      ...previous,
      { role: "user", content: question },
    ]);

    try {
      setLoading(true);

      const data = await apiFetch("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: question }),
      });

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer || "No se obtuvo respuesta.",
        },
      ]);
    } catch (requestError) {
      setError(requestError.message || "No se pudo consultar la IA.");
    } finally {
      setLoading(false);
    }
  };

  const markAlertRead = async (alertId) => {
    await apiFetch(`/ai/alerts/${alertId}/read`, {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    setAlerts((previous) =>
      previous.map((item) =>
        item.id === alertId
          ? { ...item, read_at: new Date().toISOString() }
          : item
      )
    );
  };

  const markAllRead = async () => {
    await apiFetch("/ai/alerts/read-all", {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    setAlerts((previous) =>
      previous.map((item) => ({
        ...item,
        read_at: item.read_at || new Date().toISOString(),
      }))
    );
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
          min-height: calc(100vh - 105px);
          padding: 14px;
          color: #eaf2ff;
          border-radius: 26px;
          background:
            radial-gradient(circle at 8% 0%, rgba(34,211,238,.20), transparent 28%),
            radial-gradient(circle at 92% 12%, rgba(139,92,246,.22), transparent 31%),
            linear-gradient(135deg,#040a16,#081329 48%,#070817);
        }

        .ai-page * { box-sizing: border-box; }

        .ai-main {
          max-width: 1480px;
          margin: auto;
          display: grid;
          gap: 12px;
        }

        .ai-hero,
        .ai-panel {
          border: 1px solid rgba(148,163,184,.17);
          background: rgba(15,23,42,.70);
          border-radius: 22px;
          box-shadow: 0 18px 46px rgba(2,6,23,.27);
          backdrop-filter: blur(18px);
        }

        .ai-hero {
          position: relative;
          overflow: hidden;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .ai-hero:after {
          content: "";
          position: absolute;
          width: 380px;
          height: 180px;
          right: -110px;
          top: -90px;
          border-radius: 999px;
          background: linear-gradient(135deg,rgba(34,211,238,.27),rgba(139,92,246,.23));
          filter: blur(35px);
        }

        .ai-hero-left,
        .ai-status {
          position: relative;
          z-index: 2;
        }

        .ai-hero-left {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .ai-logo {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
          border-radius: 17px;
          background: linear-gradient(135deg,#06b6d4,#7c3aed);
          box-shadow: 0 12px 30px rgba(124,58,237,.30);
          animation: aiPulse 2.8s ease-in-out infinite;
        }

        @keyframes aiPulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .ai-hero h1 {
          margin: 0;
          color: white;
          font-size: 22px;
          font-weight: 950;
        }

        .ai-hero p {
          margin: 4px 0 0;
          color: #a8b8d4;
          font-size: 12px;
        }

        .ai-status {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
        }

        .ai-status span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          border: 1px solid rgba(103,232,249,.23);
          background: rgba(8,145,178,.12);
          color: #bae6fd;
          padding: 7px 10px;
          font-size: 10px;
          font-weight: 900;
        }

        .ai-metrics {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 10px;
        }

        .ai-metric {
          min-height: 78px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.09);
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .ai-metric.info { background: linear-gradient(135deg,rgba(37,99,235,.64),rgba(30,41,59,.68)); }
        .ai-metric.success { background: linear-gradient(135deg,rgba(5,150,105,.62),rgba(20,83,45,.52)); }
        .ai-metric.danger { background: linear-gradient(135deg,rgba(190,18,60,.60),rgba(88,28,35,.50)); }
        .ai-metric.warning { background: linear-gradient(135deg,rgba(217,119,6,.63),rgba(120,53,15,.50)); }

        .ai-metric-icon {
          width: 39px;
          height: 39px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.15);
        }

        .ai-metric p {
          margin: 0;
          color: #dbeafe;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .ai-metric strong {
          display: block;
          margin-top: 3px;
          color: white;
          font-size: 22px;
          line-height: 1;
        }

        .ai-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(255,255,255,.72);
          font-size: 10px;
        }

        .ai-layout {
          display: grid;
          grid-template-columns: 285px minmax(0,1fr);
          gap: 12px;
        }

        .ai-sidebar { padding: 14px; }

        .ai-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 13px;
        }

        .ai-tab {
          min-height: 38px;
          border-radius: 13px;
          border: 1px solid rgba(148,163,184,.16);
          background: rgba(255,255,255,.035);
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .ai-tab.active {
          color: white;
          border-color: rgba(34,211,238,.40);
          background: linear-gradient(135deg,rgba(8,145,178,.28),rgba(124,58,237,.25));
        }

        .ai-suggestions {
          display: grid;
          gap: 8px;
        }

        .ai-suggestion {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px;
          border-radius: 15px;
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(255,255,255,.035);
          color: #e2e8f0;
          text-align: left;
          cursor: pointer;
          transition: .2s ease;
        }

        .ai-suggestion:hover {
          transform: translateY(-1px);
          border-color: rgba(34,211,238,.40);
          background: rgba(34,211,238,.075);
        }

        .ai-suggestion strong { font-size: 11.5px; }

        .ai-content {
          min-height: 650px;
          overflow: hidden;
        }

        .ai-chat,
        .ai-alerts-view {
          height: 650px;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        .ai-alerts-view {
          grid-template-rows: auto 1fr;
        }

        .ai-header {
          padding: 13px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(148,163,184,.13);
        }

        .ai-header h3 {
          margin: 0;
          color: white;
          font-size: 15px;
          font-weight: 950;
        }

        .ai-header p {
          margin: 4px 0 0;
          color: #8fa2c2;
          font-size: 10.5px;
        }

        .ai-header-actions {
          display: flex;
          gap: 7px;
        }

        .ai-icon-btn {
          width: 37px;
          height: 37px;
          border: 1px solid rgba(148,163,184,.16);
          background: rgba(255,255,255,.04);
          color: #cbd5e1;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .ai-messages,
        .ai-alerts-list {
          padding: 16px;
          overflow-y: auto;
        }

        .ai-message {
          margin-bottom: 12px;
          display: flex;
          gap: 9px;
          align-items: flex-start;
        }

        .ai-message.user { flex-direction: row-reverse; }

        .ai-avatar {
          width: 32px;
          height: 32px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: linear-gradient(135deg,#0891b2,#7c3aed);
        }

        .ai-message.user .ai-avatar {
          background: linear-gradient(135deg,#2563eb,#1d4ed8);
        }

        .ai-bubble {
          max-width: min(800px,84%);
          padding: 11px 13px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(255,255,255,.04);
          white-space: pre-wrap;
          color: #e5eefc;
          font-size: 12.5px;
          line-height: 1.55;
        }

        .ai-composer {
          padding: 12px;
          border-top: 1px solid rgba(148,163,184,.13);
        }

        .ai-inputbox {
          display: grid;
          grid-template-columns: 1fr 45px;
          gap: 8px;
        }

        .ai-inputbox textarea {
          min-height: 52px;
          max-height: 130px;
          resize: vertical;
          border-radius: 15px;
          border: 1px solid rgba(148,163,184,.22);
          background: rgba(15,23,42,.76);
          color: white;
          padding: 11px;
          outline: none;
          font-size: 12.5px;
        }

        .ai-send {
          border: 0;
          border-radius: 15px;
          color: white;
          background: linear-gradient(135deg,#06b6d4,#7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .ai-alerts-list {
          display: grid;
          align-content: start;
          gap: 9px;
        }

        .ai-alert-card {
          width: 100%;
          display: grid;
          grid-template-columns: 38px 1fr auto;
          gap: 10px;
          align-items: start;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(255,255,255,.035);
          color: #e5eefc;
          padding: 11px;
          text-align: left;
          cursor: pointer;
        }

        .ai-alert-card.unread {
          border-color: rgba(34,211,238,.34);
          background: linear-gradient(135deg,rgba(8,145,178,.12),rgba(124,58,237,.09));
        }

        .ai-alert-icon {
          width: 36px;
          height: 36px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-alert-icon.success { background: rgba(16,185,129,.18); color: #6ee7b7; }
        .ai-alert-icon.danger { background: rgba(244,63,94,.16); color: #fda4af; }
        .ai-alert-icon.warning { background: rgba(245,158,11,.17); color: #fcd34d; }
        .ai-alert-icon.info { background: rgba(14,165,233,.17); color: #7dd3fc; }

        .ai-alert-card h4 {
          margin: 0;
          color: white;
          font-size: 12px;
          font-weight: 950;
        }

        .ai-alert-card p {
          margin: 4px 0 0;
          color: #b6c5dd;
          font-size: 11px;
          line-height: 1.45;
        }

        .ai-alert-meta {
          margin-top: 7px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .ai-alert-meta span {
          border-radius: 999px;
          background: rgba(255,255,255,.055);
          color: #9fb1cf;
          padding: 4px 7px;
          font-size: 9.5px;
          font-weight: 800;
        }

        .ai-alert-date {
          color: #8fa2c2;
          font-size: 10px;
          white-space: nowrap;
        }

        .ai-error {
          margin-bottom: 8px;
          padding: 9px 11px;
          border-radius: 13px;
          border: 1px solid rgba(244,63,94,.28);
          background: rgba(244,63,94,.11);
          color: #fecdd3;
          font-size: 11.5px;
        }

        @media(max-width:980px) {
          .ai-layout { grid-template-columns: 1fr; }
          .ai-metrics { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      <div className="ai-main">
        <section className="ai-hero">
          <div className="ai-hero-left">
            <div className="ai-logo">
              <Bot size={25} />
            </div>
            <div>
              <h1>OMC Intelligence</h1>
              <p>
                Analista comercial, recomendaciones y alertas automáticas.
              </p>
            </div>
          </div>

          <div className="ai-status">
            <span><Sparkles size={13} /> IA conectada</span>
            <span><ShieldCheck size={13} /> Laravel protegido</span>
            <span><BellRing size={13} /> {unreadAlerts} nuevas</span>
          </div>
        </section>

        <section className="ai-metrics">
          <MetricCard icon={BellRing} label="Alertas" value={summary.total} subtitle="Alertas visibles" tone="info" />
          <MetricCard icon={CheckCircle2} label="Activas" value={summary.activas} subtitle="Ventas activadas" tone="success" />
          <MetricCard icon={XCircle} label="Caídas" value={summary.caidas} subtitle="Revisión inmediata" tone="danger" />
          <MetricCard icon={Clock3} label="Pendientes" value={summary.pendientes} subtitle="Seguimiento requerido" tone="warning" />
        </section>

        <div className="ai-layout">
          <aside className="ai-panel ai-sidebar">
            <div className="ai-tabs">
              <button
                type="button"
                className={`ai-tab ${activeTab === "chat" ? "active" : ""}`}
                onClick={() => setActiveTab("chat")}
              >
                Consultar IA
              </button>

              <button
                type="button"
                className={`ai-tab ${activeTab === "alerts" ? "active" : ""}`}
                onClick={() => setActiveTab("alerts")}
              >
                Alertas ({unreadAlerts})
              </button>
            </div>

            <div className="ai-suggestions">
              {SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
                <button
                  key={title}
                  type="button"
                  className="ai-suggestion"
                  onClick={() => {
                    setActiveTab("chat");
                    sendMessage(prompt);
                  }}
                  disabled={loading}
                >
                  <Icon size={17} />
                  <strong>{title}</strong>
                </button>
              ))}
            </div>
          </aside>

          <section className="ai-panel ai-content">
            {activeTab === "chat" ? (
              <div className="ai-chat">
                <header className="ai-header">
                  <div>
                    <h3>Analista comercial inteligente</h3>
                    <p>Pregunta por ventas, campañas, riesgos o recomendaciones.</p>
                  </div>

                  <div className="ai-header-actions">
                    <button
                      type="button"
                      className="ai-icon-btn"
                      onClick={() => loadAlerts()}
                      title="Actualizar"
                    >
                      <RefreshCcw
                        size={16}
                        className={loadingAlerts ? "animate-spin" : ""}
                      />
                    </button>

                    <button
                      type="button"
                      className="ai-icon-btn"
                      onClick={() => {
                        setMessages(initialMessages);
                        setError("");
                      }}
                      title="Limpiar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </header>

                <div className="ai-messages">
                  {messages.map((item, index) => (
                    <div
                      key={`${item.role}-${index}`}
                      className={`ai-message ${item.role}`}
                    >
                      <div className="ai-avatar">
                        {item.role === "assistant" ? (
                          <Sparkles size={16} />
                        ) : (
                          <UserRound size={16} />
                        )}
                      </div>
                      <div className="ai-bubble">{item.content}</div>
                    </div>
                  ))}

                  {loading && (
                    <div className="ai-message">
                      <div className="ai-avatar">
                        <LoaderCircle size={16} className="animate-spin" />
                      </div>
                      <div className="ai-bubble">
                        Analizando datos y preparando recomendaciones...
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
                      placeholder="Ejemplo: ¿Qué ventas caídas debo revisar hoy y qué recomiendas?"
                    />

                    <button
                      type="button"
                      className="ai-send"
                      onClick={() => sendMessage()}
                      disabled={loading || !message.trim()}
                    >
                      {loading ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </footer>
              </div>
            ) : (
              <div className="ai-alerts-view">
                <header className="ai-header">
                  <div>
                    <h3>Alertas automáticas de ventas</h3>
                    <p>Gerente, admin, backoffice y supervisor.</p>
                  </div>

                  <div className="ai-header-actions">
                    <button
                      type="button"
                      className="ai-icon-btn"
                      onClick={() => loadAlerts()}
                    >
                      <RefreshCcw
                        size={16}
                        className={loadingAlerts ? "animate-spin" : ""}
                      />
                    </button>

                    <button
                      type="button"
                      className="ai-icon-btn"
                      onClick={markAllRead}
                    >
                      <MessageSquareText size={16} />
                    </button>
                  </div>
                </header>

                <div className="ai-alerts-list">
                  {alerts.map((alert) => {
                    const presentation = getAlertPresentation(alert.type);
                    const Icon = presentation.icon;

                    return (
                      <button
                        key={alert.id}
                        type="button"
                        className={`ai-alert-card ${
                          alert.read_at ? "" : "unread"
                        }`}
                        onClick={() => {
                          if (!alert.read_at) markAlertRead(alert.id);
                        }}
                      >
                        <div
                          className={`ai-alert-icon ${presentation.tone}`}
                        >
                          <Icon size={18} />
                        </div>

                        <div>
                          <h4>{alert.title}</h4>
                          <p>{alert.message}</p>

                          <div className="ai-alert-meta">
                            {alert.campaign && <span>{alert.campaign}</span>}
                            {alert.sale_id && <span>Venta #{alert.sale_id}</span>}
                            {alert.status && <span>{alert.status}</span>}
                          </div>
                        </div>

                        <span className="ai-alert-date">
                          {formatDate(alert.created_at)}
                        </span>
                      </button>
                    );
                  })}

                  {!alerts.length && (
                    <div style={{ textAlign: "center", padding: 50, color: "#8fa2c2" }}>
                      <ShieldCheck size={38} />
                      <h3 style={{ color: "white" }}>Sin alertas pendientes</h3>
                      <p>
                        Las activaciones, caídas y pendientes aparecerán aquí automáticamente.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
