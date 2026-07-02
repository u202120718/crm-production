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

  if (FAVORABLES.has(s)) {
    return "border-emerald-400/30 bg-emerald-500/20 text-emerald-200";
  }

  if (NO_FAVORABLES.has(s)) {
    return "border-rose-400/30 bg-rose-500/20 text-rose-200";
  }

  if (s === "PENDIENTE") {
    return "border-amber-400/30 bg-amber-500/20 text-amber-200";
  }

  if (s === "VALIDANDO...") {
    return "border-sky-400/30 bg-sky-500/20 text-sky-200";
  }

  return "border-slate-400/25 bg-slate-500/15 text-slate-200";
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
    <div
      className={`rounded-[18px] border border-[#1b3763] bg-[linear-gradient(180deg,rgba(9,21,48,.98),rgba(5,14,34,.98))] shadow-[0_12px_35px_rgba(0,0,0,.22)] ${className}`}
    >
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
      className="group relative overflow-hidden rounded-[18px] border p-4 transition duration-300 hover:-translate-y-1"
      style={{
        borderColor: `${color}55`,
        background: `linear-gradient(135deg, ${color}20 0%, rgba(8,18,42,.94) 55%, rgba(5,12,30,.98) 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
        style={{ background: `${color}28` }}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: `${color}c8` }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300">
              {title}
            </p>
            <p className="mt-1 text-[1.6rem] font-black leading-none text-white">
              {compactNumber(value)}
            </p>
            <p className="mt-1.5 text-xs text-slate-300">{subtitle}</p>
          </div>
        </div>

        <Sparkline data={data} color={color} />
      </div>

      <div className="relative z-10 mt-3 border-t border-white/7 pt-2">
        <p className={`text-xs font-bold ${bad ? "text-rose-300" : "text-emerald-300"}`}>
          {bad ? "↓" : "↑"} {trend} <span className="font-medium text-slate-400">vs ayer</span>
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
          <p className="text-xs text-slate-300">Total</p>
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

function GaugeCard({ value, total }) {
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
            <b className="text-white">{Math.round((displayed * total) / 100)}</b>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              Pendientes
            </span>
            <b className="text-white">{Math.max(0, total - Math.round((displayed * total) / 100))}</b>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              No favorables
            </span>
            <b className="text-rose-300">-</b>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/7 pt-3 text-xs">
        <span className="text-slate-400">Objetivo mensual: 75%</span>
        <span className="font-black text-emerald-300">+1.6%</span>
      </div>
    </PageCard>
  );
}

function RecentSales({ rows }) {
  return (
    <PageCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-black uppercase text-white">Ventas recientes</h3>
        <button className="rounded-xl border border-[#214675] px-3 py-2 text-xs font-bold text-sky-300">
          Ver todas
        </button>
      </div>

      <div className="space-y-2">
        {rows.length ? (
          rows.map((venta, index) => (
            <div
              key={venta.id || `${venta.cliente}-${index}`}
              className="grid grid-cols-[44px_1.4fr_.9fr_.9fr_.8fr_70px] items-center gap-3 rounded-2xl border border-white/7 bg-white/[0.035] px-3 py-2.5"
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
        <LegendItem color={COLORS.emerald} label="Finalizadas" value={`${favorables} (${favorablePct}%)`} />
        <LegendItem color={COLORS.amber} label="Pendientes" value={`${pendientes} (${pendientesPct}%)`} />
        <LegendItem color={COLORS.rose} label="No favorables" value={`${noFavorables} (${noFavPct}%)`} />
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

function QuickActions({ pending }) {
  const actions = [
    { label: "Registrar venta", sub: "Crear nueva ficha", icon: Plus, color: COLORS.blue },
    { label: "Validar pendientes", sub: `${pending} pendientes`, icon: CheckCircle2, color: COLORS.emerald },
    { label: "Exportar reporte", sub: "Excel / PDF", icon: FileText, color: COLORS.violet },
    { label: "Ver reportes", sub: "Análisis completo", icon: TrendingUp, color: COLORS.orange },
    { label: "Enviar comunicado", sub: "A comerciales", icon: Megaphone, color: COLORS.rose },
  ];

  return (
    <PageCard className="p-4">
      <h3 className="mb-3 text-base font-black uppercase text-white">Acciones rápidas</h3>
      <div className="grid gap-3 md:grid-cols-5">
        {actions.map(({ label, sub, icon: Icon, color }) => (
          <button
            key={label}
            type="button"
            className="group flex items-center gap-3 rounded-2xl border border-white/7 bg-white/[0.035] p-3 text-left transition hover:-translate-y-1 hover:bg-white/[0.06]"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: `${color}d0` }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{label}</p>
              <p className="truncate text-xs text-slate-400">{sub}</p>
            </div>
          </button>
        ))}
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

  useEffect(() => {
    const id = setInterval(() => setNowText(formatDateHeader()), 30000);
    return () => clearInterval(id);
  }, []);

  const normalizedVentas = useMemo(() => {
    return (Array.isArray(ventas) ? ventas : []).map((venta) => ({
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

  const userName = currentUser?.nombre || currentUser?.name || "Usuario";

  return (
    <div className="mx-auto max-w-[1540px] space-y-3.5 bg-[#050b18] px-1 pb-4 text-[12.5px] leading-tight text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.6rem] font-black tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Resumen comercial y validación operativa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-[#1b3763] bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 md:flex">
            <CalendarDays className="h-4 w-4 text-slate-300" />
            {nowText}
          </div>
          <button className="rounded-xl border border-[#1b3763] bg-white/[0.04] p-2.5">
            <Moon className="h-4 w-4 text-slate-300" />
          </button>
          <button className="relative rounded-xl border border-[#1b3763] bg-white/[0.04] p-2.5">
            <BellRing className="h-4 w-4 text-slate-300" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
              3
            </span>
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-black">
            {getInitials(userName)}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total ventas"
          value={stats.totalVentas}
          subtitle="Todas las ventas registradas"
          icon={LayoutDashboard}
          color={COLORS.blue}
          trend="+18.2%"
          data={sparkline}
        />
        <KpiCard
          title="Gestionadas"
          value={stats.gestionadas}
          subtitle={`${stats.tasaGestion}% del total`}
          icon={CheckCircle2}
          color={COLORS.emerald}
          trend="+12.4%"
          data={weeklyTrend.map((d) => ({ value: d.gestionadas }))}
        />
        <KpiCard
          title="Pendientes"
          value={stats.pendientes}
          subtitle="Ventas por validar"
          icon={Clock3}
          color={COLORS.amber}
          trend="5.2%"
          bad
          data={weeklyTrend.map((d) => ({ value: d.pendientes }))}
        />
        <KpiCard
          title="No favorables"
          value={stats.noFavorables}
          subtitle="Caídas o rechazadas"
          icon={ShieldX}
          color={COLORS.rose}
          trend="3.1%"
          bad
          data={weeklyTrend.map((d) => ({ value: d.noFavorables }))}
        />
      </div>

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
          <GaugeCard value={stats.tasaGestion} total={stats.totalVentas} />

          <PageCard className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.20em] text-slate-300">
                  Tiempo promedio validación
                </p>
                <p className="mt-1 text-[1.55rem] font-black text-white">01:45</p>
              </div>
            </div>
            <div className="h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend}>
                  <Area type="monotone" dataKey="total" stroke={COLORS.violet} fill={`${COLORS.violet}22`} strokeWidth={2.2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-slate-400">vs ayer</span>
              <b className="text-emerald-300">-15 min</b>
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

      <QuickActions pending={stats.pendientes} />

      <div className="grid gap-3 md:grid-cols-4">
        <MiniMetric icon={BriefcaseBusiness} label="Campañas activas" value={stats.campaignsActivas} color={COLORS.cyan} />
        <MiniMetric icon={Users} label="Usuarios activos" value={stats.usersActivos} color={COLORS.violet} />
        <MiniMetric icon={PhoneCall} label="Leads visibles" value={stats.totalLeads} color={COLORS.amber} />
        <MiniMetric icon={TrendingUp} label="Conversión" value={`${stats.tasaGestion}%`} color={COLORS.emerald} />
      </div>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value, color }) {
  return (
    <PageCard className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color}25` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-1 text-[1.35rem] font-black text-white">{value}</p>
        </div>
      </div>
    </PageCard>
  );
}
