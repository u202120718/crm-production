import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  ShieldX,
  BriefcaseBusiness,
  Users,
  TrendingUp,
  BellRing,
  CalendarDays,
  Moon,
  Plus,
  FileText,
  Megaphone,
  Trophy,
  ExternalLink,
  ArrowUpRight,
  Activity,
  PhoneCall,
  ShieldCheck,
  Zap,
  Target,
  AlertTriangle,
  Medal,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const COLORS = {
  blue: "#2563eb",
  sky: "#0ea5e9",
  cyan: "#22d3ee",
  emerald: "#22c55e",
  green: "#16a34a",
  amber: "#f59e0b",
  orange: "#f97316",
  rose: "#f43f5e",
  red: "#ef4444",
  violet: "#7c3aed",
  purple: "#9333ea",
  slate: "#94a3b8",
};

const CAMPAIGN_LOGOS = {
  VODAFONE: "/img/campaigns/vodafone.jpg",
  YOIGO: "/img/campaigns/yoigo.png",
  MASMOVIL: "/img/campaigns/masmovil.png",
  "MÁSMÓVIL": "/img/campaigns/masmovil.png",
  LOWI: "/img/campaigns/vodafone.jpg",
  FINETWORK: "/img/campaigns/masmovil.png",
  NATURGY: "/img/campaigns/naturgy.jpg",
  ENDESA: "/img/campaigns/endesa.jpg",
  NORDY: "/img/campaigns/nordy.png",
  POPULOS: "/img/campaigns/populos.png",
};

const FAVORABLES = new Set(["FINALIZADO", "ACTIVO TOTAL", "ACTIVO PARCIAL", "VALIDADO PERU"]);
const PENDIENTES = new Set(["PENDIENTE", "VALIDANDO..."]);
const NO_FAVORABLES = new Set([
  "CANCELADO",
  "DESCONEXION",
  "FALLIDA",
  "RECHAZADO COMERCIAL",
  "NO COMISIONABLE",
]);

function upper(value) {
  return String(value || "").trim().toUpperCase();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function percent(part, total) {
  if (!total) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
}

async function apiFetch(url) {
  const headers = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };

  const token = getCookie("XSRF-TOKEN");
  if (token) headers["X-XSRF-TOKEN"] = decodeURIComponent(token);

  const response = await fetch(url, {
    credentials: "include",
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "No se pudo actualizar el dashboard.");
  return data;
}

function diffPercent(current, previous) {
  if (!previous && !current) return 0;
  if (!previous) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function formatDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "--";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function safeDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const raw = String(value).trim();
  if (!raw) return null;

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (match) {
    const [, d, m, y, hh = "0", mm = "0"] = match;
    const year = y.length === 2 ? `20${y}` : y;
    const date = new Date(Number(year), Number(m) - 1, Number(d), Number(hh), Number(mm));
    if (!Number.isNaN(date.getTime())) return date;
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

function formatDateHeader() {
  const now = new Date();
  return now.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getCampaignLogo(campaign = "") {
  const name = upper(campaign);
  if (CAMPAIGN_LOGOS[name]) return CAMPAIGN_LOGOS[name];

  const found = Object.keys(CAMPAIGN_LOGOS).find((key) => name.includes(key));
  return found ? CAMPAIGN_LOGOS[found] : "/img/campaigns/vodafone.jpg";
}

function getInitials(name = "") {
  const parts = String(name || "AB").trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase() || "AB";
}

function statusClass(status = "") {
  const s = upper(status);

  if (s === "ACTIVO TOTAL") return "dashboard-status status-active-total";
  if (s === "ACTIVO PARCIAL") return "dashboard-status status-active-partial";
  if (s === "FINALIZADO") return "dashboard-status status-finalized";
  if (s === "VALIDADO PERU") return "dashboard-status status-validated";
  if (s === "PENDIENTE") return "dashboard-status status-pending";
  if (s === "VALIDANDO...") return "dashboard-status status-validating";
  if (NO_FAVORABLES.has(s)) return "dashboard-status status-bad";

  return "dashboard-status status-neutral";
}

function compactNumber(value) {
  return Number(value || 0).toLocaleString("es-ES");
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#081225]/95 px-3 py-2 text-xs text-white shadow-2xl backdrop-blur-xl">
      <p className="mb-1 font-black">{label}</p>
      {payload.map((item, idx) => (
        <p key={idx} style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

function PageCard({ children, className = "" }) {
  return (
    <div className={`dashboard-panel rounded-[18px] border ${className}`}>
      {children}
    </div>
  );
}

function Sparkline({ data, color, dataKey = "value" }) {
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon, color, trend = "+ 0.0%", bad = false, data = [] }) {
  return (
    <div
      className="dashboard-kpi relative overflow-hidden rounded-[18px] border p-4"
      style={{
        borderColor: `${color}55`,
        background: `linear-gradient(135deg, ${color}DD 0%, ${color}A8 100%)`,
      }}
    >

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: `${color}c8` }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] dashboard-kpi-muted">
              {title}
            </p>
            <p className="mt-1 text-[1.6rem] font-black leading-none text-white">
              {compactNumber(value)}
            </p>
            <p className="mt-1.5 text-xs dashboard-kpi-muted">{subtitle}</p>
          </div>
        </div>

        <Sparkline data={data} color={color} />
      </div>

      <div className="relative z-10 mt-3 border-t border-white/7 pt-2">
        <p className={`text-xs font-bold ${bad ? "text-rose-100" : "text-emerald-100"}`}>
          {bad ? "↓" : "↑"} {trend} <span className="font-medium dashboard-kpi-subtle">vs ayer</span>
        </p>
      </div>
    </div>
  );
}

function DonutChart({ total, data }) {
  const safeData = data.length ? data : [{ name: "Sin datos", value: 1, color: COLORS.slate }];

  return (
    <div className="grid grid-cols-[150px_1fr] items-center gap-3">
      <div className="relative h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeData}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={70}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {safeData.map((item, index) => (
                <Cell key={index} fill={item.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[1.7rem] font-black leading-none text-white">{compactNumber(total)}</p>
          <p className="text-xs dashboard-kpi-muted">Total</p>
        </div>
      </div>

      <div className="space-y-2">
        {safeData.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
              <span className="truncate font-bold text-slate-300">{item.name}</span>
            </div>
            <span className="font-black text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GaugeCard({ value, total, gestionadas, pendientes, noFavorables }) {
  const displayed = clamp(value, 0, 100);
  const data = [
    { name: "Gestión", value: displayed, color: COLORS.emerald },
    { name: "Resto", value: Math.max(0, 100 - displayed), color: "rgba(148,163,184,.22)" },
  ];

  return (
    <PageCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300">
            Estados de validación
          </p>
          <h3 className="mt-1 text-base font-black text-white">Tasa de gestión</h3>
        </div>
        <ShieldCheck className="h-5 w-5 text-emerald-300" />
      </div>

      <div className="grid grid-cols-[130px_1fr] items-center gap-4">
        <div className="relative h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={44}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {data.map((item, index) => (
                  <Cell key={index} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[1.55rem] font-black text-white">{displayed}%</p>
            <p className="text-[10px] text-slate-400">Tasa</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              Gestionadas
            </span>
            <b className="text-white">{gestionadas}</b>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              Pendientes
            </span>
            <b className="text-white">{pendientes}</b>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              No favorables
            </span>
            <b className="text-rose-300">{noFavorables}</b>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/7 pt-3 text-xs">
        <span className="text-slate-400">Objetivo mensual: 75%</span>
        <span className={`font-black ${displayed >= 75 ? "text-emerald-300" : "text-amber-300"}`}>
          {displayed >= 75 ? "+" : ""}{Number((displayed - 75).toFixed(1))} pp
        </span>
      </div>
    </PageCard>
  );
}

function RecentSales({ rows }) {
  return (
    <PageCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-black uppercase text-white">Ventas recientes</h3>
        <span className="dashboard-chip">{rows.length} visibles</span>
      </div>

      <div className="space-y-2">
        {rows.length ? (
          rows.map((venta, index) => (
            <div
              key={venta.id || `${venta.cliente}-${index}`}
              className="grid grid-cols-[44px_1.4fr_.9fr_.9fr_110px_70px] items-center gap-3 rounded-2xl border border-white/7 bg-white/[0.035] px-3 py-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1">
                <img
                  src={getCampaignLogo(venta.campana)}
                  alt={venta.campana || "Campaña"}
                  className="max-h-7 max-w-7 object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-black text-white">{venta.cliente || "SIN CLIENTE"}</p>
                <p className="truncate text-[11px] text-slate-400">{venta.documento || venta.telefono || "-"}</p>
              </div>

              <p className="truncate text-xs font-bold text-slate-300">{venta.campana || "-"}</p>
              <p className="truncate text-xs font-bold text-slate-300">{venta.producto || "-"}</p>

              <span className={`rounded-lg border px-2 py-1 text-center text-[10px] font-black ${statusClass(venta.estado)}`}>
                {venta.estado || "-"}
              </span>

              <div className="text-right text-[11px] font-bold text-slate-300">
                <p>{venta.fecha || "-"}</p>
                <p>{venta.hora || ""}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/7 bg-white/[0.035] p-4 text-sm text-slate-400">
            No hay ventas recientes.
          </div>
        )}
      </div>
    </PageCard>
  );
}

function SemiGauge({ total, favorables, pendientes, noFavorables }) {
  const safeTotal = total || 1;
  const favorablePct = percent(favorables, safeTotal);
  const pendientesPct = percent(pendientes, safeTotal);
  const noFavPct = percent(noFavorables, safeTotal);

  return (
    <PageCard className="p-4">
      <h3 className="mb-3 text-base font-black uppercase text-white">Distribución por estado</h3>

      <div className="relative mx-auto h-[140px] max-w-[320px] overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: "Finalizadas", value: favorables || 0.0001, color: COLORS.emerald },
                { name: "Pendientes", value: pendientes || 0.0001, color: COLORS.amber },
                { name: "No favorables", value: noFavorables || 0.0001, color: COLORS.rose },
              ]}
              dataKey="value"
              startAngle={180}
              endAngle={0}
              innerRadius={68}
              outerRadius={94}
              cy="88%"
              isAnimationActive={false}
            >
              <Cell fill={COLORS.emerald} />
              <Cell fill={COLORS.amber} />
              <Cell fill={COLORS.rose} />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-x-0 bottom-2 text-center">
          <p className="text-[1.65rem] font-black text-white">{compactNumber(total)}</p>
          <p className="text-xs text-slate-300">Total ventas</p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <LegendItem color={kpiColor(1)} label="Finalizadas" value={`${favorables} (${favorablePct}%)`} />
        <LegendItem color={kpiColor(2)} label="Pendientes" value={`${pendientes} (${pendientesPct}%)`} />
        <LegendItem color={kpiColor(3)} label="No favorables" value={`${noFavorables} (${noFavPct}%)`} />
        <LegendItem color={COLORS.slate} label="Otros" value="0 (0%)" />
      </div>
    </PageCard>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
        <span className="truncate">{label}</span>
      </span>
      <b className="text-white">{value}</b>
    </div>
  );
}

function TopComerciales({ rows, total }) {
  return (
    <PageCard className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-300" />
        <h3 className="text-base font-black uppercase text-white">Top comerciales</h3>
      </div>

      <div className="space-y-3">
        {rows.length ? (
          rows.map((row, index) => {
            const width = total ? clamp((row.value / total) * 100, 8, 100) : 0;
            const palette = [COLORS.amber, COLORS.sky, COLORS.emerald, COLORS.orange, COLORS.rose];

            return (
              <div key={row.label} className="grid grid-cols-[26px_1fr_58px] items-center gap-3">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-slate-950"
                  style={{ background: palette[index % palette.length] }}
                >
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-white">{row.label}</p>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <div className="h-full rounded-full" style={{ width: `${width}%`, background: palette[index % palette.length] }} />
                  </div>
                </div>

                <p className="text-right text-xs text-slate-300">{row.value} ventas</p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-400">Sin datos de comerciales.</p>
        )}
      </div>
    </PageCard>
  );
}


function OperationalPulse({ insights = [], activeIndex = 0 }) {
  const item = insights[activeIndex] || insights[0];

  if (!item) return null;

  const Icon = item.icon || Activity;

  return (
    <PageCard className="dashboard-pulse p-4">
      <div className="dashboard-pulse-head">
        <div>
          <p className="dashboard-section-eyebrow">PULSO OPERATIVO</p>
          <h3>Lectura ejecutiva en tiempo real</h3>
          <span className="dashboard-pulse-refresh">Cambia cada 5 segundos</span>
        </div>

        <div className="dashboard-pulse-dots">
          {insights.map((_, index) => (
            <span
              key={index}
              className={index === activeIndex ? "active" : ""}
            />
          ))}
        </div>
      </div>

      <div className={`dashboard-pulse-card ${item.tone || "blue"}`}>
        <div className="dashboard-pulse-icon">
          <Icon className="h-6 w-6" />
        </div>

        <div className="dashboard-pulse-copy">
          <p>{item.label}</p>
          <strong>{item.value}</strong>
          <span>{item.detail}</span>
        </div>

        <div className="dashboard-pulse-badge">
          {item.badge}
        </div>
      </div>
    </PageCard>
  );
}

export default function Dashboard({
  currentUser,
  campaigns = [],
  users = [],
  ventas = [],
  leads = [],
}) {
  const [nowText, setNowText] = useState(formatDateHeader());
  const [liveVentas, setLiveVentas] = useState(Array.isArray(ventas) ? ventas : []);
  const [lastSync, setLastSync] = useState(new Date());
  const [syncError, setSyncError] = useState("");
  const [pulseIndex, setPulseIndex] = useState(0);
  const [kpiColorOffset, setKpiColorOffset] = useState(0);

  useEffect(() => {
    setLiveVentas(Array.isArray(ventas) ? ventas : []);
  }, [liveVentas]);

  useEffect(() => {
    const tickClock = setInterval(() => setNowText(formatDateHeader()), 30000);
    return () => clearInterval(tickClock);
  }, []);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const data = await apiFetch("/ventas/list");
        if (!active) return;

        if (Array.isArray(data?.ventas)) {
          setLiveVentas(data.ventas);
          setLastSync(new Date());
          setSyncError("");
        }
      } catch (error) {
        if (active) setSyncError(error.message || "Sin conexión en tiempo real.");
      }
    };

    refresh();
    const id = setInterval(refresh, 15000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setKpiColorOffset((prev) => (prev + 1) % 6);
    }, 3000);

    return () => clearInterval(id);
  }, []);

  const normalizedVentas = useMemo(() => {
    return (Array.isArray(liveVentas) ? liveVentas : []).map((venta) => ({
      ...venta,
      estado: upper(venta.estado || "PENDIENTE"),
      campana: upper(venta.campana || venta.campaign || ""),
      cliente: upper(venta.cliente || ""),
      producto: upper(venta.producto || ""),
      comercial: upper(venta.comercial || ""),
    }));
  }, [ventas]);

  const stats = useMemo(() => {
    const totalVentas = normalizedVentas.length;
    const gestionadas = normalizedVentas.filter((v) => FAVORABLES.has(upper(v.estado))).length;
    const pendientes = normalizedVentas.filter((v) => PENDIENTES.has(upper(v.estado))).length;
    const noFavorables = normalizedVentas.filter((v) => NO_FAVORABLES.has(upper(v.estado))).length;

    const campaignsActivas = (campaigns || []).filter((c) => upper(c.estado) === "ACTIVA").length;
    const usersActivos = (users || []).filter((u) => upper(u.estado) === "ACTIVO").length;
    const totalLeads = (leads || []).length;
    const tasaGestion = percent(gestionadas, totalVentas);

    return {
      totalVentas,
      gestionadas,
      pendientes,
      noFavorables,
      campaignsActivas,
      usersActivos,
      totalLeads,
      tasaGestion,
    };
  }, [normalizedVentas, campaigns, users, leads]);

  const weeklyTrend = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      days.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
        total: 0,
        gestionadas: 0,
        pendientes: 0,
        noFavorables: 0,
      });
    }

    normalizedVentas.forEach((venta) => {
      const d = getVentaDate(venta);
      if (!d) return;

      const key = d.toISOString().slice(0, 10);
      const target = days.find((x) => x.key === key);
      if (!target) return;

      target.total += 1;
      if (FAVORABLES.has(upper(venta.estado))) target.gestionadas += 1;
      if (PENDIENTES.has(upper(venta.estado))) target.pendientes += 1;
      if (NO_FAVORABLES.has(upper(venta.estado))) target.noFavorables += 1;
    });

    return days;
  }, [normalizedVentas]);

  const sparkline = useMemo(() => {
    return weeklyTrend.map((d) => ({ value: d.total }));
  }, [weeklyTrend]);

  const todayVsYesterday = useMemo(() => {
    const today = weeklyTrend[weeklyTrend.length - 1] || {};
    const yesterday = weeklyTrend[weeklyTrend.length - 2] || {};

    return {
      total: diffPercent(today.total || 0, yesterday.total || 0),
      gestionadas: diffPercent(today.gestionadas || 0, yesterday.gestionadas || 0),
      pendientes: diffPercent(today.pendientes || 0, yesterday.pendientes || 0),
      noFavorables: diffPercent(today.noFavorables || 0, yesterday.noFavorables || 0),
    };
  }, [weeklyTrend]);

  const validationMinutes = useMemo(() => {
    const durations = normalizedVentas
      .filter((venta) => FAVORABLES.has(upper(venta.estado)))
      .map((venta) => {
        const start =
          safeDate(venta?.fechaRegistro) ||
          safeDate([venta?.fecha, venta?.hora].filter(Boolean).join(" ")) ||
          safeDate(venta?.created_at);

        const end =
          safeDate(venta?.fechaEdicion) ||
          safeDate(venta?.updated_at);

        if (!start || !end) return null;

        const minutes = (end.getTime() - start.getTime()) / 60000;
        return minutes >= 0 && minutes <= 60 * 24 * 30 ? minutes : null;
      })
      .filter((value) => Number.isFinite(value));

    if (!durations.length) return null;
    return durations.reduce((sum, value) => sum + value, 0) / durations.length;
  }, [normalizedVentas]);

  const validationTrendData = useMemo(
    () =>
      weeklyTrend.map((day) => ({
        value: day.gestionadas,
      })),
    [weeklyTrend]
  );


  const campaignData = useMemo(() => {
    const map = {};

    normalizedVentas.forEach((venta) => {
      const key = venta.campana || "SIN CAMPAÑA";
      map[key] = (map[key] || 0) + 1;
    });

    const palette = [COLORS.blue, COLORS.sky, COLORS.emerald, COLORS.orange, COLORS.rose, COLORS.slate];

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], index) => ({
        name,
        value,
        color: palette[index % palette.length],
      }));
  }, [normalizedVentas]);

  const topComerciales = useMemo(() => {
    const map = {};

    normalizedVentas.forEach((venta) => {
      const key = venta.comercial || "SIN COMERCIAL";
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));
  }, [normalizedVentas]);

  const recentVentas = useMemo(() => {
    return [...normalizedVentas]
      .sort((a, b) => (getVentaDate(b)?.getTime() || 0) - (getVentaDate(a)?.getTime() || 0))
      .slice(0, 5);
  }, [normalizedVentas]);


  const operationalInsights = useMemo(() => {
    const latest24h = normalizedVentas.filter((venta) => {
      const date = getVentaDate(venta);
      return date && Date.now() - date.getTime() <= 24 * 60 * 60 * 1000;
    }).length;

    const bestCampaign = campaignData[0] || null;
    const bestCommercial = topComerciales[0] || null;
    const riskCount = stats.pendientes + stats.noFavorables;

    return [
      {
        label: "Actividad últimas 24 h",
        value: `${latest24h} venta${latest24h === 1 ? "" : "s"}`,
        detail: "Altas registradas durante las últimas 24 horas.",
        badge: latest24h > 0 ? "OPERATIVO" : "SIN ACTIVIDAD",
        tone: "blue",
        icon: Zap,
      },
      {
        label: "Mejor campaña",
        value: bestCampaign ? bestCampaign.name : "Sin datos",
        detail: bestCampaign
          ? `${bestCampaign.value} venta${bestCampaign.value === 1 ? "" : "s"} registradas.`
          : "Todavía no hay ventas para comparar campañas.",
        badge: bestCampaign ? "TOP CAMPAÑA" : "PENDIENTE",
        tone: "green",
        icon: Target,
      },
      {
        label: "Riesgo operativo",
        value: `${riskCount} caso${riskCount === 1 ? "" : "s"}`,
        detail:
          riskCount > 0
            ? `${stats.pendientes} pendientes y ${stats.noFavorables} no favorables requieren revisión.`
            : "No existen incidencias pendientes en este momento.",
        badge: riskCount > 0 ? "REVISAR" : "CONTROLADO",
        tone: riskCount > 0 ? "rose" : "green",
        icon: AlertTriangle,
      },
      {
        label: "Mejor comercial",
        value: bestCommercial ? bestCommercial.label : "Sin datos",
        detail: bestCommercial
          ? `${bestCommercial.value} venta${bestCommercial.value === 1 ? "" : "s"} acumuladas.`
          : "Todavía no hay producción comercial suficiente.",
        badge: bestCommercial ? "TOP COMERCIAL" : "PENDIENTE",
        tone: "purple",
        icon: Medal,
      },
    ];
  }, [normalizedVentas, campaignData, topComerciales, stats]);

  const rotatingKpiColors = [
    COLORS.blue,
    COLORS.emerald,
    COLORS.amber,
    COLORS.rose,
    COLORS.violet,
    COLORS.cyan,
  ];

  const kpiColor = (index) =>
    rotatingKpiColors[(index + kpiColorOffset) % rotatingKpiColors.length];

  const userName = currentUser?.nombre || currentUser?.name || "Usuario";

  return (
    <div className="dashboard-pro mx-auto max-w-[1540px] space-y-3.5 px-1 pb-4 text-[12.5px] leading-tight">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.6rem] font-black tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Resumen comercial y validación operativa.
          </p>
        </div>

        <div className="dashboard-livebar flex items-center gap-2">
          <div className="dashboard-live-item hidden md:flex">
            <CalendarDays className="h-4 w-4" />
            <span>{nowText}</span>
          </div>

          <div className="dashboard-live-item hidden lg:flex">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>Actualizado {lastSync.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>

          <div className="dashboard-live-item relative">
            <BellRing className="h-4 w-4" />
            <span>Alertas</span>
            {(stats.pendientes + stats.noFavorables) > 0 ? (
              <b className="dashboard-alert-count">{stats.pendientes + stats.noFavorables}</b>
            ) : null}
          </div>

          <div className="dashboard-avatar">
            {getInitials(userName)}
          </div>
        </div>
      </div>

      {syncError ? (
        <div className="dashboard-sync-error">
          {syncError} · Se muestran los últimos datos disponibles.
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total ventas"
          value={stats.totalVentas}
          subtitle="Todas las ventas registradas"
          icon={LayoutDashboard}
          color={kpiColor(0)}
          trend={`${Math.abs(todayVsYesterday.total)}%`}
          bad={todayVsYesterday.total < 0}
          data={sparkline}
        />
        <KpiCard
          title="Gestionadas"
          value={stats.gestionadas}
          subtitle={`${stats.tasaGestion}% del total`}
          icon={CheckCircle2}
          color={COLORS.emerald}
          trend={`${Math.abs(todayVsYesterday.gestionadas)}%`}
          bad={todayVsYesterday.gestionadas < 0}
          data={weeklyTrend.map((d) => ({ value: d.gestionadas }))}
        />
        <KpiCard
          title="Pendientes"
          value={stats.pendientes}
          subtitle="Ventas por validar"
          icon={Clock3}
          color={COLORS.amber}
          trend={`${Math.abs(todayVsYesterday.pendientes)}%`}
          bad={todayVsYesterday.pendientes > 0}
          data={weeklyTrend.map((d) => ({ value: d.pendientes }))}
        />
        <KpiCard
          title="No favorables"
          value={stats.noFavorables}
          subtitle="Caídas o rechazadas"
          icon={ShieldX}
          color={COLORS.rose}
          trend={`${Math.abs(todayVsYesterday.noFavorables)}%`}
          bad={todayVsYesterday.noFavorables > 0}
          data={weeklyTrend.map((d) => ({ value: d.noFavorables }))}
        />
      </div>

      <OperationalPulse
        insights={operationalInsights}
        activeIndex={pulseIndex}
      />

      <div className="grid gap-3 xl:grid-cols-[1.45fr_1fr_.95fr]">
        <PageCard className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300">Evolución de ventas</p>
              <h3 className="mt-1 text-base font-black text-white">Últimos 7 días</h3>
            </div>
            <button className="rounded-xl border border-[#214675] px-3 py-2 text-xs font-bold text-slate-300">
              Últimos 7 días
            </button>
          </div>

          <div className="h-[235px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <CartesianGrid stroke="rgba(148,163,184,.13)" vertical={false} />
                <XAxis dataKey="label" stroke="#93a4c4" fontSize={11} />
                <YAxis stroke="#93a4c4" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" name="Total" stroke={COLORS.blue} strokeWidth={2.6} dot={{ r: 3 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="gestionadas" name="Gestionadas" stroke={COLORS.emerald} strokeWidth={2.4} dot={{ r: 3 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="pendientes" name="Pendientes" stroke={COLORS.amber} strokeWidth={2.4} dot={{ r: 3 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="noFavorables" name="No favorables" stroke={COLORS.rose} strokeWidth={2.4} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PageCard>

        <PageCard className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300">Campañas</p>
              <h3 className="mt-1 text-base font-black text-white">Ventas por campaña</h3>
            </div>
            <BriefcaseBusiness className="h-5 w-5 text-slate-300" />
          </div>

          <DonutChart total={stats.totalVentas} data={campaignData} />

          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#214675] px-3 py-2 text-xs font-bold text-sky-300">
            Ver reporte completo
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </PageCard>

        <div className="grid gap-3">
          <GaugeCard
            value={stats.tasaGestion}
            total={stats.totalVentas}
            gestionadas={stats.gestionadas}
            pendientes={stats.pendientes}
            noFavorables={stats.noFavorables}
          />

          <PageCard className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.20em] text-slate-300">
                  Tiempo promedio validación
                </p>
                <p className="mt-1 text-[1.55rem] font-black text-white">
                  {validationMinutes === null ? "--" : formatDuration(validationMinutes)}
                </p>
              </div>
            </div>
            <div className="h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={validationTrendData}>
                  <Area type="monotone" dataKey="value" stroke={COLORS.violet} fill={`${COLORS.violet}22`} strokeWidth={2.2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="dashboard-muted">Promedio real</span>
              <b className="dashboard-strong">
                {validationMinutes === null ? "Sin datos suficientes" : "Registro → última edición"}
              </b>
            </div>
          </PageCard>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.25fr_1fr_.85fr]">
        <RecentSales rows={recentVentas} />

        <SemiGauge
          total={stats.totalVentas}
          favorables={stats.gestionadas}
          pendientes={stats.pendientes}
          noFavorables={stats.noFavorables}
        />

        <TopComerciales rows={topComerciales} total={stats.totalVentas} />
      </div>


      <style>{`
        .dashboard-pro {
          --dash-bg: #f4f7fb;
          --dash-panel: #ffffff;
          --dash-soft: #f8fafc;
          --dash-border: #d7e0ea;
          --dash-title: #0f172a;
          --dash-text: #334155;
          --dash-muted: #64748b;
          color: var(--dash-text);
          background: transparent;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .dashboard-pro *,
        .dashboard-pro *::before,
        .dashboard-pro *::after {
          box-sizing: border-box;
        }

        .dashboard-panel {
          background: var(--dash-panel);
          border-color: var(--dash-border);
          color: var(--dash-text);
          box-shadow: 0 3px 12px rgba(15,23,42,.06);
        }

        .dashboard-pro h1,
        .dashboard-pro h2,
        .dashboard-pro h3,
        .dashboard-pro .text-white {
          color: var(--dash-title) !important;
        }

        .dashboard-pro .text-slate-300,
        .dashboard-pro .text-slate-400,
        .dashboard-pro .dashboard-muted {
          color: var(--dash-muted) !important;
        }

        .dashboard-kpi,
        .dashboard-kpi .text-white {
          color: #fff !important;
        }

        .dashboard-kpi .dashboard-kpi-muted {
          color: rgba(255,255,255,.92) !important;
        }

        .dashboard-kpi .dashboard-kpi-subtle {
          color: rgba(255,255,255,.78) !important;
        }

        .dashboard-kpi {
          box-shadow: none;
          transition: background .65s ease, border-color .65s ease !important;
        }

        .dashboard-kpi > div,
        .dashboard-kpi p,
        .dashboard-kpi span,
        .dashboard-kpi strong {
          transition: color .25s ease !important;
        }

        .dashboard-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          border-radius: 9px;
          border: 1px solid transparent;
          padding: 5px 9px;
          color: #ffffff !important;
          font-size: 9px;
          font-weight: 950;
          line-height: 1.15;
          letter-spacing: .02em;
          text-align: center;
          text-shadow: none !important;
          opacity: 1 !important;
          white-space: normal;
        }

        .dashboard-status.status-active-total {
          background: #059669 !important;
          border-color: #047857 !important;
        }

        .dashboard-status.status-active-partial {
          background: #0891b2 !important;
          border-color: #0e7490 !important;
        }

        .dashboard-status.status-finalized {
          background: #16a34a !important;
          border-color: #15803d !important;
        }

        .dashboard-status.status-validated {
          background: #2563eb !important;
          border-color: #1d4ed8 !important;
        }

        .dashboard-status.status-pending {
          background: #d97706 !important;
          border-color: #b45309 !important;
        }

        .dashboard-status.status-validating {
          background: #0284c7 !important;
          border-color: #0369a1 !important;
        }

        .dashboard-status.status-bad {
          background: #e11d48 !important;
          border-color: #be123c !important;
        }

        .dashboard-status.status-neutral {
          background: #475569 !important;
          border-color: #334155 !important;
        }

        .dashboard-pulse {
          overflow: hidden;
        }

        .dashboard-pulse-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 12px;
        }

        .dashboard-section-eyebrow {
          margin: 0;
          color: #0284c7;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .18em;
        }

        .dashboard-pulse-head h3 {
          margin: 3px 0 0;
          color: var(--dash-title);
          font-size: 15px;
          font-weight: 950;
        }

        .dashboard-pulse-refresh {
          display: block;
          margin-top: 3px;
          color: var(--dash-muted);
          font-size: 9px;
          font-weight: 700;
        }

        .dashboard-pulse-dots {
          display: flex;
          gap: 5px;
        }

        .dashboard-pulse-dots span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #cbd5e1;
        }

        .dashboard-pulse-dots span.active {
          width: 22px;
          background: #2563eb;
        }

        .dashboard-pulse-card {
          min-height: 92px;
          display: grid;
          grid-template-columns: 48px minmax(0,1fr) auto;
          align-items: center;
          gap: 14px;
          border-radius: 16px;
          padding: 15px;
          color: #fff;
          animation: dashboardPulseIn .45s ease both !important;
        }

        .dashboard-pulse-card.blue { background: linear-gradient(135deg,#1d4ed8,#1e3a8a); }
        .dashboard-pulse-card.green { background: linear-gradient(135deg,#047857,#065f46); }
        .dashboard-pulse-card.rose { background: linear-gradient(135deg,#be123c,#881337); }
        .dashboard-pulse-card.purple { background: linear-gradient(135deg,#7e22ce,#581c87); }

        @keyframes dashboardPulseIn {
          0% {
            opacity: .15;
            transform: translateX(14px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .dashboard-pulse-icon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(255,255,255,.16);
        }

        .dashboard-pulse-copy p {
          margin: 0;
          color: rgba(255,255,255,.84);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .11em;
          text-transform: uppercase;
        }

        .dashboard-pulse-copy strong {
          display: block;
          margin-top: 4px;
          color: #fff !important;
          font-size: 20px;
          line-height: 1;
        }

        .dashboard-pulse-copy span {
          display: block;
          margin-top: 6px;
          color: rgba(255,255,255,.86);
          font-size: 10px;
        }

        .dashboard-pulse-badge {
          border: 1px solid rgba(255,255,255,.20);
          border-radius: 999px;
          background: rgba(255,255,255,.13);
          padding: 7px 10px;
          color: #fff;
          font-size: 9px;
          font-weight: 950;
          white-space: nowrap;
        }


        .dashboard-livebar {
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .dashboard-live-item {
          min-height: 38px;
          align-items: center;
          gap: 7px;
          padding: 0 11px;
          border: 1px solid var(--dash-border);
          border-radius: 12px;
          background: var(--dash-panel);
          color: var(--dash-text);
          font-size: 10px;
          font-weight: 850;
          box-shadow: 0 2px 7px rgba(15,23,42,.05);
        }

        .dashboard-alert-count {
          min-width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #e11d48;
          color: #fff;
          font-size: 9px;
        }

        .dashboard-avatar {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #4f46e5;
          color: #fff;
          font-size: 11px;
          font-weight: 950;
        }

        .dashboard-chip {
          display: inline-flex;
          align-items: center;
          min-height: 30px;
          border: 1px solid var(--dash-border);
          border-radius: 10px;
          padding: 0 10px;
          color: var(--dash-text);
          background: var(--dash-soft);
          font-size: 10px;
          font-weight: 850;
        }

        .dashboard-sync-error {
          border: 1px solid #fecaca;
          border-radius: 12px;
          background: #fff1f2;
          color: #be123c;
          padding: 9px 12px;
          font-size: 11px;
          font-weight: 800;
        }

        .dashboard-strong {
          color: var(--dash-title);
          font-weight: 900;
        }

        .dashboard-pro .recharts-cartesian-axis-tick-value {
          fill: var(--dash-muted) !important;
        }

        [data-crm-theme="silver"] .dashboard-pro {
          --dash-bg: #e7ecf2;
          --dash-panel: #f8fafc;
          --dash-soft: #eef2f6;
          --dash-border: #cbd5e1;
          --dash-title: #111827;
          --dash-text: #334155;
          --dash-muted: #64748b;
        }

        [data-crm-theme="dark"] .dashboard-pro,
        [data-crm-theme="night"] .dashboard-pro {
          --dash-bg: #08111f;
          --dash-panel: #101a2d;
          --dash-soft: #162238;
          --dash-border: #263753;
          --dash-title: #f8fafc;
          --dash-text: #e2e8f0;
          --dash-muted: #9fb0c9;
        }

        [data-crm-theme="neon"] .dashboard-pro {
          --dash-bg: #080b16;
          --dash-panel: #111426;
          --dash-soft: #181c33;
          --dash-border: #354067;
          --dash-title: #ffffff;
          --dash-text: #eef2ff;
          --dash-muted: #aab6d3;
        }

        [data-crm-theme="dark"] .dashboard-panel,
        [data-crm-theme="night"] .dashboard-panel,
        [data-crm-theme="neon"] .dashboard-panel {
          box-shadow: none;
        }

        [data-crm-theme="dark"] .dashboard-sync-error,
        [data-crm-theme="night"] .dashboard-sync-error,
        [data-crm-theme="neon"] .dashboard-sync-error {
          background: rgba(190,18,60,.14);
          color: #fecdd3;
          border-color: rgba(244,63,94,.3);
        }

        @media (max-width: 900px) {
          .dashboard-livebar {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
