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
    description: "KPIs, hallazgos, riesgos y prioridades.",
    prompt:
      "Genera un resumen ejecutivo del CRM con total de ventas, tasa de gestión, campañas, estados, riesgos y tres acciones prioritarias para hoy.",
  },
  {
    icon: AlertTriangle,
    title: "Ventas en riesgo",
    description: "Pendientes, caídas y rechazos.",
    prompt:
      "Analiza las ventas pendientes, caídas, canceladas y rechazadas. Ordénalas por prioridad, identifica patrones y recomienda qué debe revisar backoffice hoy.",
  },
  {
    icon: TrendingUp,
    title: "Rendimiento comercial",
    description: "Compara comerciales y campañas.",
    prompt:
      "Compara el rendimiento de comerciales y campañas. Indica líderes, personas con baja conversión, causas probables y acciones de mejora.",
  },
  {
    icon: Target,
    title: "Plan operativo de hoy",
    description: "Responsables, prioridades y seguimiento.",
    prompt:
      "Crea un plan operativo para hoy basado en las ventas visibles. Divide por prioridad alta, media y baja, asigna responsables sugeridos y define el resultado esperado.",
  },
  {
    icon: CheckCircle2,
    title: "Ventas activas recientes",
    description: "Activadas, finalizadas y seguimiento.",
    prompt:
      "Resume las ventas activas, activadas o finalizadas más recientes. Señala cuáles aún necesitan seguimiento y por qué.",
  },
  {
    icon: TrendingDown,
    title: "Causas de caída",
    description: "Patrones y prevención.",
    prompt:
      "Analiza ventas caídas, canceladas o rechazadas. Detecta patrones por campaña, comercial y estado, y propone medidas concretas para reducir nuevas caídas.",
  },
  {
    icon: BellRing,
    title: "Pendientes Vodafone",
    description: "Prioriza pendientes de Vodafone.",
    prompt:
      "Muéstrame y analiza las ventas pendientes de Vodafone. Resume cantidades, comerciales involucrados, antigüedad aproximada y prioridad de seguimiento.",
  },
  {
    icon: UserRound,
    title: "Supervisores y equipos",
    description: "Compara desempeño por supervisión.",
    prompt:
      "Compara el desempeño de los supervisores y sus equipos según ventas, gestionadas, pendientes y riesgos. Da recomendaciones específicas por supervisor.",
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


function normalizeThemeName(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (["claro", "light", "blanco", "white"].includes(raw)) return "light";
  if (["gris", "gray", "grey", "silver"].includes(raw)) return "gray";
  if (["noche", "dark", "oscuro", "night"].includes(raw)) return "dark";
  if (["neon", "purple", "violeta"].includes(raw)) return "neon";
  return "dark";
}

function detectCurrentTheme() {
  const html = document.documentElement;
  const body = document.body;

  const direct = [
    html?.dataset?.crmTheme,
    html?.dataset?.theme,
    body?.dataset?.crmTheme,
    body?.dataset?.theme,
    localStorage.getItem("crm_theme"),
    localStorage.getItem("theme"),
  ];

  for (const value of direct) {
    if (value) return normalizeThemeName(value);
  }

  for (const key of ["crm_app_settings_v1", "crm_settings_v1", "crm_config_v1", "app_settings"]) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      const value = parsed?.theme || parsed?.tema || parsed?.appearance || parsed?.modo;
      if (value) return normalizeThemeName(value);
    } catch {
      //
    }
  }

  const classes = `${html?.className || ""} ${body?.className || ""}`.toLowerCase();
  if (classes.includes("light") || classes.includes("claro")) return "light";
  if (classes.includes("gray") || classes.includes("grey") || classes.includes("gris")) return "gray";
  if (classes.includes("neon") || classes.includes("violet")) return "neon";
  return "dark";
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
  const [alertsAvailable, setAlertsAvailable] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const messagesEndRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState(() => detectCurrentTheme());

  useEffect(() => {
    const refreshTheme = () => setCurrentTheme(detectCurrentTheme());

    window.addEventListener("crm-theme-change", refreshTheme);
    window.addEventListener("storage", refreshTheme);

    const observer = new MutationObserver(refreshTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-crm-theme"],
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "data-theme", "data-crm-theme"],
      });
    }

    return () => {
      window.removeEventListener("crm-theme-change", refreshTheme);
      window.removeEventListener("storage", refreshTheme);
      observer.disconnect();
    };
  }, []);

  const unreadAlerts = useMemo(
    () => alerts.filter((item) => !item.read_at).length,
    [alerts]
  );

  const loadAlerts = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoadingAlerts(true);

      const data = await apiFetch("/ai/alerts");

      setAlertsAvailable(true);
      setAlerts(Array.isArray(data?.alerts) ? data.alerts : []);
      setSummary({
        total: Number(data?.summary?.total || 0),
        activas: Number(data?.summary?.activas || 0),
        caidas: Number(data?.summary?.caidas || 0),
        pendientes: Number(data?.summary?.pendientes || 0),
      });
    } catch (requestError) {
      setAlertsAvailable(false);
      if (!silent && !String(requestError.message || "").toLowerCase().includes("route")) {
        setError(requestError.message);
      }
    } finally {
      setLastUpdated(new Date());
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
          generatedAt: data.generated_at || new Date().toISOString(),
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
    <div className={`ai-page ai-theme-${currentTheme}`}>
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

        .ai-tab:disabled { opacity: .45; cursor: not-allowed; }

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

        .ai-suggestion span { display: grid; gap: 2px; }
        .ai-suggestion strong { font-size: 11.5px; }
        .ai-suggestion small { color: #8fa2c2; font-size: 9.5px; line-height: 1.25; }

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

        /* Tema profesional y adaptable */
        .ai-page {
          --ai-bg: #07111f;
          --ai-panel-bg: rgba(15,23,42,.78);
          --ai-panel-soft: rgba(255,255,255,.045);
          --ai-border-color: rgba(148,163,184,.18);
          --ai-title-color: #ffffff;
          --ai-text-color: #e5eefc;
          --ai-muted-color: #93a6c5;
          --ai-input-bg: rgba(15,23,42,.88);
          --ai-button-bg: #0f172a;
          --ai-button-color: #ffffff;
          --ai-shadow-color: rgba(2,6,23,.27);
          --ai-assistant-bubble: rgba(255,255,255,.055);
        }

        .ai-page.ai-theme-light {
          --ai-bg: linear-gradient(135deg,#f8fafc,#edf2f7 52%,#f8fafc);
          --ai-panel-bg: rgba(255,255,255,.97);
          --ai-panel-soft: #f8fafc;
          --ai-border-color: #d8e0eb;
          --ai-title-color: #0f172a;
          --ai-text-color: #1e293b;
          --ai-muted-color: #52647a;
          --ai-input-bg: #ffffff;
          --ai-button-bg: #0f172a;
          --ai-button-color: #ffffff;
          --ai-shadow-color: rgba(15,23,42,.10);
          --ai-assistant-bubble: #f1f5f9;
        }

        .ai-page.ai-theme-gray {
          --ai-bg: linear-gradient(135deg,#e2e8f0,#d7dee7 52%,#eef2f6);
          --ai-panel-bg: rgba(248,250,252,.97);
          --ai-panel-soft: #edf2f7;
          --ai-border-color: #c7d0db;
          --ai-title-color: #111827;
          --ai-text-color: #273449;
          --ai-muted-color: #5b687a;
          --ai-input-bg: #ffffff;
          --ai-button-bg: #334155;
          --ai-button-color: #ffffff;
          --ai-shadow-color: rgba(51,65,85,.13);
          --ai-assistant-bubble: #e9eef4;
        }

        .ai-page.ai-theme-neon {
          --ai-bg:
            radial-gradient(circle at 8% 0%, rgba(6,182,212,.24), transparent 28%),
            radial-gradient(circle at 92% 10%, rgba(168,85,247,.28), transparent 32%),
            linear-gradient(135deg,#050816,#0b1022 48%,#12071f);
          --ai-panel-bg: rgba(13,18,40,.84);
          --ai-panel-soft: rgba(255,255,255,.05);
          --ai-border-color: rgba(139,92,246,.30);
          --ai-title-color: #ffffff;
          --ai-text-color: #edf3ff;
          --ai-muted-color: #a5b4d4;
          --ai-input-bg: rgba(8,12,29,.92);
          --ai-button-bg: #6d28d9;
          --ai-button-color: #ffffff;
          --ai-shadow-color: rgba(76,29,149,.25);
          --ai-assistant-bubble: rgba(255,255,255,.055);
        }

        .ai-page {
          background: var(--ai-bg) !important;
          color: var(--ai-text-color) !important;
          transition: background .25s ease, color .25s ease;
        }

        .ai-hero,
        .ai-panel {
          background: var(--ai-panel-bg) !important;
          border-color: var(--ai-border-color) !important;
          box-shadow: 0 18px 46px var(--ai-shadow-color) !important;
        }

        .ai-hero h1,
        .ai-header h3,
        .ai-alert-card h4,
        .ai-suggestion strong {
          color: var(--ai-title-color) !important;
        }

        .ai-hero p,
        .ai-header p,
        .ai-alert-card p,
        .ai-alert-date,
        .ai-suggestion small,
        .ai-bubble small {
          color: var(--ai-muted-color) !important;
        }

        .ai-status span,
        .ai-tab,
        .ai-suggestion,
        .ai-alert-card {
          color: var(--ai-text-color) !important;
          background: var(--ai-panel-soft) !important;
          border-color: var(--ai-border-color) !important;
        }

        .ai-tab.active,
        .ai-icon-btn,
        .ai-send {
          color: var(--ai-button-color) !important;
          background: var(--ai-button-bg) !important;
          border-color: var(--ai-button-bg) !important;
        }

        .ai-suggestion:hover,
        .ai-alert-card:hover {
          transform: translateY(-1px);
          border-color: #0ea5e9 !important;
          box-shadow: 0 10px 24px var(--ai-shadow-color);
        }

        .ai-inputbox textarea {
          color: var(--ai-text-color) !important;
          background: var(--ai-input-bg) !important;
          border-color: var(--ai-border-color) !important;
        }

        .ai-inputbox textarea::placeholder {
          color: var(--ai-muted-color) !important;
        }

        .ai-bubble {
          color: var(--ai-text-color) !important;
          background: var(--ai-assistant-bubble) !important;
          border-color: var(--ai-border-color) !important;
        }

        .ai-message.user .ai-bubble {
          color: #ffffff !important;
          background: linear-gradient(135deg,var(--ai-button-bg),#334155) !important;
          border-color: transparent !important;
        }

        .ai-composer,
        .ai-header {
          border-color: var(--ai-border-color) !important;
        }

        .ai-page.ai-theme-light .ai-composer,
        .ai-page.ai-theme-gray .ai-composer {
          background: rgba(255,255,255,.82);
        }

        .ai-page.ai-theme-light .ai-alert-icon.success,
        .ai-page.ai-theme-gray .ai-alert-icon.success { color:#047857; }
        .ai-page.ai-theme-light .ai-alert-icon.danger,
        .ai-page.ai-theme-gray .ai-alert-icon.danger { color:#be123c; }
        .ai-page.ai-theme-light .ai-alert-icon.warning,
        .ai-page.ai-theme-gray .ai-alert-icon.warning { color:#b45309; }
        .ai-page.ai-theme-light .ai-alert-icon.info,
        .ai-page.ai-theme-gray .ai-alert-icon.info { color:#0369a1; }

        .ai-page.ai-theme-light .ai-error,
        .ai-page.ai-theme-gray .ai-error {
          color:#be123c;
          background:#fff1f2;
          border-color:#fecdd3;
        }

        @media(max-width:640px) {
          .ai-page { padding: 10px; border-radius: 18px; }
          .ai-hero { align-items: flex-start; flex-direction: column; }
          .ai-status { justify-content: flex-start; }
          .ai-metrics { grid-template-columns: 1fr; }
          .ai-layout { grid-template-columns: 1fr; }
          .ai-bubble { max-width: 92%; }
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
            <span><Sparkles size={13} /> Asistente comercial activo</span>
            <span><ShieldCheck size={13} /> Datos filtrados por rol</span>
            <span><BellRing size={13} /> {alertsAvailable ? `${unreadAlerts} nuevas` : "Alertas pendientes de API"}</span>
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
                onClick={() => alertsAvailable && setActiveTab("alerts")}
                disabled={!alertsAvailable}
                title={!alertsAvailable ? "Faltan las rutas backend de alertas" : "Ver alertas"}
              >
                Alertas ({alertsAvailable ? unreadAlerts : "—"})
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
                  <span>
                    <strong>{title}</strong>
                    <small>{SUGGESTIONS.find((item) => item.title === title)?.description}</small>
                  </span>
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
                    <p>
                      Pregunta por ventas, campañas, riesgos o recomendaciones.
                      {lastUpdated ? ` · Actualizado ${formatDate(lastUpdated)}` : ""}
                    </p>
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
                      <div className="ai-bubble">
                        {item.content}
                        {item.generatedAt ? (
                          <small style={{ display: "block", marginTop: 8, color: "#8fa2c2" }}>
                            Generado: {formatDate(item.generatedAt)}
                          </small>
                        ) : null}
                      </div>
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

                  {!alertsAvailable ? (
                    <div style={{ textAlign: "center", padding: 50, color: "#8fa2c2" }}>
                      <AlertTriangle size={38} />
                      <h3 style={{ color: "var(--ai-title-color)" }}>Alertas aún no conectadas</h3>
                      <p>El chat funciona, pero faltan las rutas /ai/alerts en Laravel.</p>
                    </div>
                  ) : !alerts.length && (
                    <div style={{ textAlign: "center", padding: 50, color: "#8fa2c2" }}>
                      <ShieldCheck size={38} />
                      <h3 style={{ color: "var(--ai-title-color)" }}>Sin alertas pendientes</h3>
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
