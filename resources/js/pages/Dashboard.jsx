import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  CircleDollarSign,
  Users,
  BriefcaseBusiness,
  TrendingUp,
  CheckCircle2,
  Clock3,
  XCircle,
  ShieldCheck,
  BellRing,
  Target,
  UserRound,
  PhoneCall,
  Activity,
  Sparkles,
  AlertTriangle,
  TimerReset,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = {
  cyan: "#22d3ee",
  sky: "#38bdf8",
  violet: "#8b5cf6",
  fuchsia: "#d946ef",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  orange: "#f97316",
  slate: "#94a3b8",
  teal: "#14b8a6",
  green: "#22c55e",
  lime: "#84cc16",
  red: "#ef4444",
  pink: "#ec4899",
};

const STATUS_COLOR_MAP = {
  PENDIENTE: COLORS.amber,
  "VALIDANDO...": COLORS.sky,
  "VALIDADO PERU": COLORS.teal,
  "ACTIVO PARCIAL": COLORS.fuchsia,
  "ACTIVO TOTAL": COLORS.emerald,
  FINALIZADO: COLORS.green,
  "PROCESO DE CANCELACION": COLORS.orange,
  CANCELADO: COLORS.red,
  DESCONEXION: COLORS.rose,
  FALLIDA: COLORS.pink,
  "RECHAZADO COMERCIAL": COLORS.rose,
  "NO COMISIONABLE": COLORS.slate,
  CONTACTADO: COLORS.sky,
  RELLAMADA: COLORS.fuchsia,
  CERRADO: COLORS.emerald,
  "SIN DATOS": COLORS.slate,
};

function getThemeValue() {
  try {
    const saved = localStorage.getItem("crm_app_settings_v1");
    if (!saved) return "night";
    return JSON.parse(saved)?.theme || "night";
  } catch {
    return "night";
  }
}

function getThemeTokens(theme) {
  if (theme === "light") {
    return {
      shellText: "text-slate-800",
      mutedText: "text-slate-500",
      panel:
        "rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)]",
      panelSoft:
        "rounded-[20px] border border-slate-200 bg-slate-50 shadow-[0_8px_24px_rgba(15,23,42,0.05)]",
      hero:
        "rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#e0f2fe_0%,#eef2ff_45%,#f5f3ff_100%)] shadow-[0_16px_45px_rgba(15,23,42,0.07)]",
      heroGlowA: "bg-cyan-300/25",
      heroGlowB: "bg-violet-300/18",
      heroGlowC: "bg-sky-300/20",
      heroText: "text-slate-800",
      heroMuted: "text-slate-600",
      chip:
        "border border-slate-200 bg-white/90 text-slate-600 backdrop-blur-md",
      statCard:
        "rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_10px_26px_rgba(15,23,42,0.06)]",
      cardTitle: "text-slate-500",
      cardText: "text-slate-800",
      subText: "text-slate-500",
      gridStroke: "rgba(15,23,42,0.08)",
      axisColor: "#64748b",
      legendColor: "#475569",
      tooltipBg: "#ffffff",
      tooltipBorder: "1px solid rgba(148,163,184,0.35)",
      tooltipText: "#0f172a",
      listRow: "border-slate-200 bg-white",
    };
  }

  if (theme === "silver") {
    return {
      shellText: "text-slate-800",
      mutedText: "text-slate-500",
      panel:
        "rounded-[24px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(226,232,240,0.74)_100%)] shadow-[0_14px_38px_rgba(15,23,42,0.08)] backdrop-blur-md",
      panelSoft:
        "rounded-[20px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(241,245,249,0.66)_100%)] shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-md",
      hero:
        "rounded-[26px] border border-white/60 bg-[linear-gradient(135deg,#e2e8f0_0%,#dbe4ee_40%,#ddd6fe_100%)] shadow-[0_18px_48px_rgba(15,23,42,0.08)]",
      heroGlowA: "bg-cyan-300/22",
      heroGlowB: "bg-violet-300/16",
      heroGlowC: "bg-slate-300/26",
      heroText: "text-slate-800",
      heroMuted: "text-slate-600",
      chip:
        "border border-white/60 bg-white/75 text-slate-600 backdrop-blur-md",
      statCard:
        "rounded-[22px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.8)_0%,rgba(226,232,240,0.72)_100%)] shadow-[0_10px_26px_rgba(15,23,42,0.07)]",
      cardTitle: "text-slate-500",
      cardText: "text-slate-800",
      subText: "text-slate-500",
      gridStroke: "rgba(15,23,42,0.08)",
      axisColor: "#64748b",
      legendColor: "#475569",
      tooltipBg: "#f8fafc",
      tooltipBorder: "1px solid rgba(148,163,184,0.35)",
      tooltipText: "#0f172a",
      listRow: "border-white/50 bg-white/75",
    };
  }

  return {
    shellText: "text-white",
    mutedText: "text-slate-300",
    panel:
      "rounded-[24px] border border-[#23406d] bg-[linear-gradient(180deg,rgba(7,17,40,0.98)_0%,rgba(9,21,48,0.99)_100%)] shadow-[0_20px_50px_rgba(2,8,23,0.34)]",
    panelSoft:
      "rounded-[20px] border border-[#23406d] bg-[linear-gradient(180deg,rgba(9,22,48,0.92)_0%,rgba(9,20,42,0.96)_100%)] shadow-[0_12px_30px_rgba(2,8,23,0.24)]",
    hero:
      "rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,#071226_0%,#111827_38%,#1d1458_100%)] shadow-[0_20px_70px_rgba(6,11,20,0.22)]",
    heroGlowA: "bg-cyan-400/25",
    heroGlowB: "bg-fuchsia-400/20",
    heroGlowC: "bg-violet-400/20",
    heroText: "text-white",
    heroMuted: "text-slate-200",
    chip:
      "border border-[#2b4f88] bg-[#0d234d] text-slate-100",
    statCard:
      "rounded-[22px] border border-[#23406d] bg-[linear-gradient(180deg,rgba(8,19,43,0.98)_0%,rgba(9,22,48,0.99)_100%)] shadow-[0_18px_40px_rgba(2,8,23,0.32)]",
    cardTitle: "text-slate-300",
    cardText: "text-white",
    subText: "text-slate-300",
    gridStroke: "rgba(108,139,255,0.16)",
    axisColor: "#9fb3d9",
    legendColor: "#d7e2ff",
    tooltipBg: "#08111f",
    tooltipBorder: "1px solid rgba(255,255,255,0.1)",
    tooltipText: "#ffffff",
    listRow: "border-white/10 bg-white/5",
  };
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
}

async function apiFetch(url, options = {}) {
  const headers = {
    Accept: "application/json",
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
    throw new Error(data?.message || `Error cargando ${url}`);
  }

  return data;
}

function safeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const str = String(value).trim();
  if (!str) return null;

  const iso = new Date(str);
  if (!Number.isNaN(iso.getTime())) return iso;

  const match = str.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (match) {
    const [, d, m, y, hh = "0", mm = "0", ss = "0"] = match;
    const year = y.length === 2 ? `20${y}` : y;
    const parsed = new Date(
      Number(year),
      Number(m) - 1,
      Number(d),
      Number(hh),
      Number(mm),
      Number(ss)
    );
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function getVentaDate(venta) {
  return (
    safeDate(venta?.fechaRegistro) ||
    safeDate([venta?.fecha, venta?.hora].filter(Boolean).join(" ")) ||
    safeDate(venta?.fecha) ||
    safeDate(venta?.created_at) ||
    null
  );
}

function getLeadDate(lead) {
  return (
    safeDate(lead?.fechaRegistro) ||
    safeDate(lead?.createdAt) ||
    safeDate(lead?.created_at) ||
    safeDate(lead?.fecha) ||
    null
  );
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "0.00%";
  return `${value.toFixed(2)}%`;
}

function normalizeStatus(value) {
  return String(value || "").trim().toUpperCase();
}

function CustomTooltip({ active, payload, label, themeTokens }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-2xl px-3 py-2 text-xs shadow-xl"
      style={{
        background: themeTokens.tooltipBg,
        border: themeTokens.tooltipBorder,
        color: themeTokens.tooltipText,
      }}
    >
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((item, idx) => (
        <p key={idx} style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  trendData,
  dataKey,
  themeTokens,
}) {
  return (
    <div className={`relative overflow-hidden p-4 ${themeTokens.statCard}`}>
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-3xl"
        style={{ background: `${color}20` }}
      />
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className={`text-[11px] font-medium uppercase tracking-[0.20em] ${themeTokens.cardTitle}`}>
            {title}
          </p>
          <p className={`mt-2 text-[2rem] font-bold leading-none ${themeTokens.cardText}`}>
            {value}
          </p>
          <p className={`mt-2 text-xs ${themeTokens.subText}`}>{subtitle}</p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl border"
          style={{
            background: `${color}18`,
            borderColor: `${color}30`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>

      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.7} />
                <stop offset="95%" stopColor={color} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <Tooltip content={<CustomTooltip themeTokens={themeTokens} />} />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#grad-${title})`}
              strokeWidth={2.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MiniList({ title, rows, icon: Icon, color, emptyText, themeTokens }) {
  return (
    <div className={`relative overflow-hidden p-4 ${themeTokens.statCard}`}>
      <div
        className="pointer-events-none absolute -left-6 top-6 h-20 w-20 rounded-full blur-3xl"
        style={{ background: `${color}1f` }}
      />
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl border"
          style={{
            background: `${color}18`,
            borderColor: `${color}30`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <h3 className={`text-base font-semibold ${themeTokens.cardText}`}>{title}</h3>
      </div>

      <div className="space-y-2.5">
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <div
              key={`${row.label}-${index}`}
              className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 ${themeTokens.listRow}`}
            >
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${themeTokens.cardText}`}>
                  {row.label}
                </p>
                {row.subLabel ? (
                  <p className={`mt-1 truncate text-[11px] ${themeTokens.subText}`}>
                    {row.subLabel}
                  </p>
                ) : null}
              </div>
              <span className={`ml-3 text-sm font-bold ${themeTokens.cardText}`}>
                {row.value}
              </span>
            </div>
          ))
        ) : (
          <div className={`rounded-2xl border px-3 py-3 ${themeTokens.listRow}`}>
            <p className={`text-sm ${themeTokens.subText}`}>{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({
  currentUser,
  campaigns = [],
  users = [],
  ventas = [],
  leads = [],
}) {
  const [theme, setTheme] = useState(getThemeValue());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dashboardCampaigns, setDashboardCampaigns] = useState(campaigns);
  const [dashboardUsers, setDashboardUsers] = useState(users);
  const [dashboardVentas, setDashboardVentas] = useState(ventas);
  const [dashboardLeads, setDashboardLeads] = useState(leads);

  const themeTokens = useMemo(() => getThemeTokens(theme), [theme]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event?.detail) {
        setTheme(event.detail);
      } else {
        setTheme(getThemeValue());
      }
    };

    window.addEventListener("crm-theme-change", handleThemeChange);
    return () => window.removeEventListener("crm-theme-change", handleThemeChange);
  }, []);

  useEffect(() => {
    setDashboardCampaigns(campaigns);
  }, [campaigns]);

  useEffect(() => {
    setDashboardUsers(users);
  }, [users]);

  useEffect(() => {
    setDashboardVentas(ventas);
  }, [ventas]);

  useEffect(() => {
    setDashboardLeads(leads);
  }, [leads]);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          apiFetch("/campaigns/list"),
          apiFetch("/users/list"),
          apiFetch("/ventas/list"),
          apiFetch("/leads/list"),
        ]);

        if (!active) return;

        const [campaignsRes, usersRes, ventasRes, leadsRes] = results;

        if (campaignsRes.status === "fulfilled") {
          setDashboardCampaigns(campaignsRes.value?.campaigns || []);
        }

        if (usersRes.status === "fulfilled") {
          setDashboardUsers(usersRes.value?.users || []);
        }

        if (ventasRes.status === "fulfilled") {
          setDashboardVentas(ventasRes.value?.ventas || []);
        }

        if (leadsRes.status === "fulfilled") {
          setDashboardLeads(leadsRes.value?.leads || []);
        }

        const failedCount = results.filter((r) => r.status === "rejected").length;
        if (failedCount === results.length) {
          setError("No se pudieron cargar los datos del dashboard.");
        }
      } catch {
        if (active) {
          setError("No se pudieron cargar los datos del dashboard.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const campañasActivas = dashboardCampaigns.filter(
      (c) => String(c.estado || "").toUpperCase() === "ACTIVA"
    ).length;

    const usuariosActivos = dashboardUsers.filter(
      (u) => String(u.estado || "").toUpperCase() === "ACTIVO"
    ).length;

    const ventasPendientes = dashboardVentas.filter(
      (v) => normalizeStatus(v.estado) === "PENDIENTE"
    ).length;

    const ventasValidando = dashboardVentas.filter(
      (v) => normalizeStatus(v.estado) === "VALIDANDO..."
    ).length;

    const ventasValidadas = dashboardVentas.filter(
      (v) => normalizeStatus(v.estado) === "VALIDADO PERU"
    ).length;

    const ventasActivoParcial = dashboardVentas.filter(
      (v) => normalizeStatus(v.estado) === "ACTIVO PARCIAL"
    ).length;

    const ventasActivoTotal = dashboardVentas.filter(
      (v) => normalizeStatus(v.estado) === "ACTIVO TOTAL"
    ).length;

    const ventasFinalizadas = dashboardVentas.filter(
      (v) => normalizeStatus(v.estado) === "FINALIZADO"
    ).length;

    const ventasFavorables =
      ventasActivoParcial + ventasActivoTotal + ventasFinalizadas;

    const ventasCancelacion = dashboardVentas.filter(
      (v) => normalizeStatus(v.estado) === "PROCESO DE CANCELACION"
    ).length;

    const ventasNoFavorables = dashboardVentas.filter((v) =>
      [
        "CANCELADO",
        "DESCONEXION",
        "FALLIDA",
        "RECHAZADO COMERCIAL",
        "NO COMISIONABLE",
      ].includes(normalizeStatus(v.estado))
    ).length;

    const leadsPendientes = dashboardLeads.filter(
      (l) => String(l.estado || "").toUpperCase() === "PENDIENTE"
    ).length;

    const leadsContactados = dashboardLeads.filter(
      (l) => String(l.estado || "").toUpperCase() === "CONTACTADO"
    ).length;

    const leadsRellamada = dashboardLeads.filter(
      (l) => String(l.estado || "").toUpperCase() === "RELLAMADA"
    ).length;

    const leadsCerrados = dashboardLeads.filter(
      (l) => String(l.estado || "").toUpperCase() === "CERRADO"
    ).length;

    const totalVentas = dashboardVentas.length;
    const totalLeads = dashboardLeads.length;

    const tasaCierreVentas = totalVentas > 0 ? (ventasFavorables / totalVentas) * 100 : 0;
    const tasaConversionLeads = totalLeads > 0 ? (leadsCerrados / totalLeads) * 100 : 0;

    return {
      campañasActivas,
      usuariosActivos,
      ventasPendientes,
      ventasValidando,
      ventasValidadas,
      ventasActivoParcial,
      ventasActivoTotal,
      ventasFinalizadas,
      ventasFavorables,
      ventasCancelacion,
      ventasNoFavorables,
      leadsPendientes,
      leadsContactados,
      leadsRellamada,
      leadsCerrados,
      totalVentas,
      totalLeads,
      tasaCierreVentas,
      tasaConversionLeads,
    };
  }, [dashboardCampaigns, dashboardUsers, dashboardVentas, dashboardLeads]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      months.push({
        key,
        label: d.toLocaleDateString("es-ES", { month: "short" }),
        ventas: 0,
        pendientes: 0,
        validando: 0,
        validadas: 0,
        favorables: 0,
      });
    }

    dashboardVentas.forEach((v) => {
      const d = getVentaDate(v);
      if (!d) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const target = months.find((m) => m.key === key);
      if (!target) return;

      const estado = normalizeStatus(v.estado);

      target.ventas += 1;
      if (estado === "PENDIENTE") target.pendientes += 1;
      if (estado === "VALIDANDO...") target.validando += 1;
      if (estado === "VALIDADO PERU") target.validadas += 1;
      if (["ACTIVO PARCIAL", "ACTIVO TOTAL", "FINALIZADO"].includes(estado)) {
        target.favorables += 1;
      }
    });

    return months;
  }, [dashboardVentas]);

  const weeklyTrend = useMemo(() => {
    const now = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);

      days.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("es-ES", { weekday: "short" }),
        ventas: 0,
        pendientes: 0,
        validando: 0,
        validadas: 0,
        favorables: 0,
      });
    }

    dashboardVentas.forEach((v) => {
      const d = getVentaDate(v);
      if (!d) return;

      const key = d.toISOString().slice(0, 10);
      const target = days.find((x) => x.key === key);
      if (!target) return;

      const estado = normalizeStatus(v.estado);

      target.ventas += 1;
      if (estado === "PENDIENTE") target.pendientes += 1;
      if (estado === "VALIDANDO...") target.validando += 1;
      if (estado === "VALIDADO PERU") target.validadas += 1;
      if (["ACTIVO PARCIAL", "ACTIVO TOTAL", "FINALIZADO"].includes(estado)) {
        target.favorables += 1;
      }
    });

    return days;
  }, [dashboardVentas]);

  const estadoVentasData = useMemo(() => {
    const rows = [
      { name: "PENDIENTE", value: metrics.ventasPendientes },
      { name: "VALIDANDO...", value: metrics.ventasValidando },
      { name: "VALIDADO PERU", value: metrics.ventasValidadas },
      { name: "ACTIVO PARCIAL", value: metrics.ventasActivoParcial },
      { name: "ACTIVO TOTAL", value: metrics.ventasActivoTotal },
      { name: "FINALIZADO", value: metrics.ventasFinalizadas },
      { name: "PROCESO DE CANCELACION", value: metrics.ventasCancelacion },
      {
        name: "CANCELADO",
        value: dashboardVentas.filter((v) => normalizeStatus(v.estado) === "CANCELADO").length,
      },
      {
        name: "DESCONEXION",
        value: dashboardVentas.filter((v) => normalizeStatus(v.estado) === "DESCONEXION").length,
      },
      {
        name: "FALLIDA",
        value: dashboardVentas.filter((v) => normalizeStatus(v.estado) === "FALLIDA").length,
      },
      {
        name: "RECHAZADO COMERCIAL",
        value: dashboardVentas.filter((v) => normalizeStatus(v.estado) === "RECHAZADO COMERCIAL").length,
      },
      {
        name: "NO COMISIONABLE",
        value: dashboardVentas.filter((v) => normalizeStatus(v.estado) === "NO COMISIONABLE").length,
      },
    ].filter((x) => x.value > 0);

    return rows.length ? rows : [{ name: "SIN DATOS", value: 1 }];
  }, [metrics, dashboardVentas]);

  const estadoLeadsData = useMemo(() => {
    const rows = [
      { name: "PENDIENTE", value: metrics.leadsPendientes },
      { name: "CONTACTADO", value: metrics.leadsContactados },
      { name: "RELLAMADA", value: metrics.leadsRellamada },
      { name: "CERRADO", value: metrics.leadsCerrados },
    ].filter((x) => x.value > 0);

    return rows.length ? rows : [{ name: "SIN DATOS", value: 1 }];
  }, [metrics]);

  const topCampañas = useMemo(() => {
    const counts = {};

    dashboardVentas.forEach((v) => {
      const key = v.campana || "Sin campaña";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [dashboardVentas]);

  const topComerciales = useMemo(() => {
    const counts = {};

    dashboardVentas.forEach((v) => {
      const key = v.comercial || "Sin comercial";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, value]) => ({ label, value, subLabel: "Ventas registradas" }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [dashboardVentas]);

  const ultimasVentas = useMemo(() => {
    return [...dashboardVentas]
      .sort((a, b) => {
        const da = getVentaDate(a)?.getTime() || 0;
        const db = getVentaDate(b)?.getTime() || 0;
        return db - da;
      })
      .slice(0, 6)
      .map((v) => ({
        label: v.cliente || "Cliente sin nombre",
        subLabel: `${v.campana || "-"} · ${v.comercial || "-"}`,
        value: v.estado || "-",
      }));
  }, [dashboardVentas]);

  const alertas = useMemo(() => {
    const rows = [];

    if (metrics.ventasPendientes > 0) {
      rows.push({
        label: "Ventas pendientes",
        subLabel: "Aún no inician gestión",
        value: metrics.ventasPendientes,
      });
    }

    if (metrics.ventasValidando > 0) {
      rows.push({
        label: "Ventas validando",
        subLabel: "Operaciones en proceso",
        value: metrics.ventasValidando,
      });
    }

    if (metrics.ventasCancelacion > 0) {
      rows.push({
        label: "Proceso de cancelación",
        subLabel: "Conviene revisar causas",
        value: metrics.ventasCancelacion,
      });
    }

    if (metrics.ventasNoFavorables > 0) {
      rows.push({
        label: "Ventas no favorables",
        subLabel: "Caídas o no comisionables",
        value: metrics.ventasNoFavorables,
      });
    }

    if (metrics.leadsPendientes > 0) {
      rows.push({
        label: "Leads pendientes",
        subLabel: "Aún no trabajados",
        value: metrics.leadsPendientes,
      });
    }

    return rows.slice(0, 5);
  }, [metrics]);

  const executiveStrip = useMemo(() => {
    return [
      {
        label: "Ventas visibles",
        value: metrics.totalVentas,
        icon: CircleDollarSign,
        color: COLORS.violet,
      },
      {
        label: "Activo total",
        value: metrics.ventasActivoTotal,
        icon: CheckCircle2,
        color: COLORS.emerald,
      },
      {
        label: "Cierre",
        value: formatPercent(metrics.tasaCierreVentas),
        icon: TrendingUp,
        color: COLORS.emerald,
      },
      {
        label: "Campañas activas",
        value: metrics.campañasActivas,
        icon: BriefcaseBusiness,
        color: COLORS.cyan,
      },
    ];
  }, [metrics]);

  return (
    <div className={`space-y-5 text-[14px] ${themeTokens.shellText}`}>
      {error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className={`relative overflow-hidden p-4 transition-all duration-500 ${themeTokens.hero}`}>
        <div className={`pointer-events-none absolute -left-12 top-0 h-44 w-44 rounded-full blur-3xl ${themeTokens.heroGlowA}`} />
        <div className={`pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full blur-3xl ${themeTokens.heroGlowB}`} />
        <div className={`pointer-events-none absolute bottom-0 left-[35%] h-40 w-40 rounded-full blur-3xl ${themeTokens.heroGlowC}`} />

        <div className="relative z-10">
          <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${themeTokens.chip}`}>
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            {loading ? "Actualizando tablero comercial..." : "Radar comercial"}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {executiveStrip.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-[20px] border border-white/10 px-4 py-3 backdrop-blur-md"
                  style={{
                    background:
                      theme === "night"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.62)",
                    borderColor:
                      theme === "night"
                        ? "rgba(255,255,255,0.10)"
                        : "rgba(148,163,184,0.22)",
                  }}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className={`text-[11px] font-medium uppercase tracking-[0.18em] ${themeTokens.heroMuted}`}>
                      {item.label}
                    </p>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-2xl border"
                      style={{
                        background: `${item.color}25`,
                        borderColor: `${item.color}35`,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>
                  </div>

                  <p className={`text-[2rem] font-bold leading-none ${themeTokens.heroText}`}>
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clock3}
          title="Pendiente"
          value={metrics.ventasPendientes}
          subtitle="Estado pendiente"
          color={STATUS_COLOR_MAP.PENDIENTE}
          trendData={weeklyTrend}
          dataKey="pendientes"
          themeTokens={themeTokens}
        />
        <StatCard
          icon={Activity}
          title="Validando"
          value={metrics.ventasValidando}
          subtitle="Estado validando..."
          color={STATUS_COLOR_MAP["VALIDANDO..."]}
          trendData={weeklyTrend}
          dataKey="validando"
          themeTokens={themeTokens}
        />
        <StatCard
          icon={ShieldCheck}
          title="Validado Perú"
          value={metrics.ventasValidadas}
          subtitle="Estado validado peru"
          color={STATUS_COLOR_MAP["VALIDADO PERU"]}
          trendData={weeklyTrend}
          dataKey="validadas"
          themeTokens={themeTokens}
        />
        <StatCard
          icon={CheckCircle2}
          title="Favorables"
          value={metrics.ventasFavorables}
          subtitle="Activo parcial, total y finalizado"
          color={STATUS_COLOR_MAP["ACTIVO TOTAL"]}
          trendData={weeklyTrend}
          dataKey="favorables"
          themeTokens={themeTokens}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className={`p-4 ${themeTokens.panel}`}>
          <div className="mb-4 flex items-center gap-3">
            <Activity className="h-4.5 w-4.5 text-cyan-400" />
            <h3 className={`text-base font-semibold ${themeTokens.cardText}`}>
              Pulso mensual de ventas
            </h3>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid stroke={themeTokens.gridStroke} vertical={false} />
                <XAxis dataKey="label" stroke={themeTokens.axisColor} fontSize={11} />
                <YAxis stroke={themeTokens.axisColor} fontSize={11} />
                <Tooltip content={<CustomTooltip themeTokens={themeTokens} />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: themeTokens.legendColor }} />
                <Bar isAnimationActive={false} dataKey="favorables" name="Favorables" fill={STATUS_COLOR_MAP["ACTIVO TOTAL"]} radius={[8, 8, 0, 0]} />
                <Bar isAnimationActive={false} dataKey="pendientes" name="Pendiente" fill={STATUS_COLOR_MAP.PENDIENTE} radius={[8, 8, 0, 0]} />
                <Bar isAnimationActive={false} dataKey="validadas" name="Validado Peru" fill={STATUS_COLOR_MAP["VALIDADO PERU"]} radius={[8, 8, 0, 0]} />
                <Bar isAnimationActive={false} dataKey="validando" name="Validando..." fill={STATUS_COLOR_MAP["VALIDANDO..."]} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-4 ${themeTokens.panel}`}>
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="h-4.5 w-4.5 text-fuchsia-400" />
            <h3 className={`text-base font-semibold ${themeTokens.cardText}`}>
              Mix de estados de venta
            </h3>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  isAnimationActive={false}
                  data={estadoVentasData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {estadoVentasData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={STATUS_COLOR_MAP[entry.name] || COLORS.slate}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip themeTokens={themeTokens} />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: themeTokens.legendColor }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className={`p-4 ${themeTokens.panel}`}>
          <div className="mb-4 flex items-center gap-3">
            <Target className="h-4.5 w-4.5 text-amber-400" />
            <h3 className={`text-base font-semibold ${themeTokens.cardText}`}>
              Campañas con mayor tracción
            </h3>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCampañas} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke={themeTokens.gridStroke} horizontal vertical={false} />
                <XAxis type="number" stroke={themeTokens.axisColor} fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke={themeTokens.axisColor}
                  width={100}
                  fontSize={11}
                />
                <Tooltip content={<CustomTooltip themeTokens={themeTokens} />} />
                <Bar
                  isAnimationActive={false}
                  dataKey="value"
                  name="Ventas"
                  fill={COLORS.cyan}
                  radius={[0, 10, 10, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-4 ${themeTokens.panel}`}>
          <div className="mb-4 flex items-center gap-3">
            <PhoneCall className="h-4.5 w-4.5 text-emerald-400" />
            <h3 className={`text-base font-semibold ${themeTokens.cardText}`}>
              Embudo de leads
            </h3>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  isAnimationActive={false}
                  data={estadoLeadsData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {estadoLeadsData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={STATUS_COLOR_MAP[entry.name] || COLORS.slate}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip themeTokens={themeTokens} />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: themeTokens.legendColor }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <MiniList
          title="Top comerciales"
          rows={topComerciales}
          icon={UserRound}
          color={COLORS.violet}
          emptyText="No hay comerciales con ventas visibles."
          themeTokens={themeTokens}
        />

        <MiniList
          title="Últimas ventas"
          rows={ultimasVentas}
          icon={BellRing}
          color={COLORS.cyan}
          emptyText="No hay ventas recientes."
          themeTokens={themeTokens}
        />

        <MiniList
          title="Alertas operativas"
          rows={alertas}
          icon={AlertTriangle}
          color={COLORS.amber}
          emptyText="Sin alertas relevantes."
          themeTokens={themeTokens}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <div className={`p-4 ${themeTokens.statCard}`}>
          <div className="mb-3 flex items-center gap-3">
            <BriefcaseBusiness className="h-5 w-5 text-cyan-500" />
            <h3 className={`text-base font-semibold ${themeTokens.cardText}`}>Campañas activas</h3>
          </div>
          <p className={`text-4xl font-bold ${themeTokens.cardText}`}>{metrics.campañasActivas}</p>
          <p className={`mt-2 text-sm ${themeTokens.subText}`}>
            Campañas visibles en operación.
          </p>
        </div>

        <div className={`p-4 ${themeTokens.statCard}`}>
          <div className="mb-3 flex items-center gap-3">
            <Users className="h-5 w-5 text-violet-500" />
            <h3 className={`text-base font-semibold ${themeTokens.cardText}`}>Usuarios activos</h3>
          </div>
          <p className={`text-4xl font-bold ${themeTokens.cardText}`}>{metrics.usuariosActivos}</p>
          <p className={`mt-2 text-sm ${themeTokens.subText}`}>
            Usuarios disponibles para gestión.
          </p>
        </div>

        <div className={`p-4 ${themeTokens.statCard}`}>
          <div className="mb-3 flex items-center gap-3">
            <TimerReset className="h-5 w-5 text-amber-500" />
            <h3 className={`text-base font-semibold ${themeTokens.cardText}`}>Leads visibles</h3>
          </div>
          <p className={`text-4xl font-bold ${themeTokens.cardText}`}>{metrics.totalLeads}</p>
          <p className={`mt-2 text-sm ${themeTokens.subText}`}>
            Leads disponibles en tu alcance.
          </p>
        </div>

        <div className={`p-4 ${themeTokens.statCard}`}>
          <div className="mb-3 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h3 className={`text-base font-semibold ${themeTokens.cardText}`}>Conversión leads</h3>
          </div>
          <p className={`text-4xl font-bold ${themeTokens.cardText}`}>
            {formatPercent(metrics.tasaConversionLeads)}
          </p>
          <p className={`mt-2 text-sm ${themeTokens.subText}`}>
            Tasa de cierre desde leads visibles.
          </p>
        </div>
      </div>
    </div>
  );
}
