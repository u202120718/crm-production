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
};

const STATUS_COLOR_MAP = {
  Pendiente: COLORS.amber,
  Validación: COLORS.cyan,
  "Validando...": COLORS.sky,
  "Validado Peru": COLORS.teal,
  Tramitada: COLORS.emerald,
  Activada: COLORS.violet,
  "Activo Parcial": COLORS.fuchsia,
  "Activo Total": COLORS.emerald,
  Finalizado: COLORS.teal,
  "Proceso de cancelacion": COLORS.orange,
  Cancelado: COLORS.rose,
  Desconexion: COLORS.rose,
  Fallida: COLORS.rose,
  Rechazada: COLORS.rose,
  "RECHAZADO COMERCIAL": COLORS.rose,
  "NO COMISIONABLE": COLORS.slate,
  Contactado: COLORS.sky,
  Rellamada: COLORS.fuchsia,
  Cerrado: COLORS.emerald,
  "Sin datos": COLORS.slate,
};

const HERO_BACKGROUNDS = [
  {
    bg: "bg-[linear-gradient(135deg,#071226_0%,#111827_38%,#1d1458_100%)]",
    glowA: "bg-cyan-400/25",
    glowB: "bg-fuchsia-400/25",
    glowC: "bg-violet-400/25",
  },
  {
    bg: "bg-[linear-gradient(135deg,#0b1320_0%,#10243d_38%,#064e3b_100%)]",
    glowA: "bg-emerald-400/25",
    glowB: "bg-cyan-400/25",
    glowC: "bg-teal-400/25",
  },
  {
    bg: "bg-[linear-gradient(135deg,#140f1f_0%,#1e1b4b_36%,#7c2d12_100%)]",
    glowA: "bg-amber-400/25",
    glowB: "bg-fuchsia-400/25",
    glowC: "bg-orange-400/25",
  },
  {
    bg: "bg-[linear-gradient(135deg,#08111f_0%,#172554_36%,#4a044e_100%)]",
    glowA: "bg-sky-400/25",
    glowB: "bg-violet-400/25",
    glowC: "bg-pink-400/25",
  },
];

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
    safeDate(
      [venta?.fecha, venta?.hora].filter(Boolean).join(" ")
    ) ||
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

function glowCardClass(extra = "") {
  return `relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,28,0.95)_0%,rgba(10,20,39,0.96)_100%)] p-4 text-white shadow-[0_14px_40px_rgba(0,0,0,0.18)] ${extra}`;
}

function StatCard({ icon: Icon, title, value, subtitle, color, trendData, dataKey }) {
  return (
    <div className={glowCardClass()}>
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-3xl"
        style={{ background: `${color}2a` }}
      />
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-slate-300">
            {title}
          </p>
          <p className="mt-2 text-[2rem] font-bold leading-none text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-300">{subtitle}</p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10"
          style={{ background: `${color}20` }}
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
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                background: "#08111f",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                color: "#fff",
              }}
            />
            <Area
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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#08111f] px-3 py-2 text-xs text-white shadow-xl">
      <p className="mb-1 font-semibold text-slate-200">{label}</p>
      {payload.map((item, idx) => (
        <p key={idx} style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

function MiniList({ title, rows, icon: Icon, color = COLORS.cyan, emptyText }) {
  return (
    <div className={glowCardClass()}>
      <div
        className="pointer-events-none absolute -left-6 top-6 h-20 w-20 rounded-full blur-3xl"
        style={{ background: `${color}1f` }}
      />
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10"
          style={{ background: `${color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>

      <div className="space-y-2.5">
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <div
              key={`${row.label}-${index}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{row.label}</p>
                {row.subLabel ? (
                  <p className="mt-1 truncate text-[11px] text-slate-400">{row.subLabel}</p>
                ) : null}
              </div>
              <span className="ml-3 text-sm font-bold text-white">{row.value}</span>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-sm text-slate-400">{emptyText}</p>
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
  const [bgIndex, setBgIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dashboardCampaigns, setDashboardCampaigns] = useState(campaigns);
  const [dashboardUsers, setDashboardUsers] = useState(users);
  const [dashboardVentas, setDashboardVentas] = useState(ventas);
  const [dashboardLeads, setDashboardLeads] = useState(leads);

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
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

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
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  const heroTheme = HERO_BACKGROUNDS[bgIndex];

  const metrics = useMemo(() => {
    const campañasActivas = dashboardCampaigns.filter((c) => c.estado === "Activa").length;
    const usuariosActivos = dashboardUsers.filter((u) => u.estado === "Activo").length;

    const pendientes = dashboardVentas.filter((v) => v.estado === "Pendiente").length;
    const validacion = dashboardVentas.filter((v) =>
      ["Validación", "Validando...", "Validado Peru"].includes(v.estado)
    ).length;
    const tramitadas = dashboardVentas.filter((v) => v.estado === "Tramitada").length;
    const activadas = dashboardVentas.filter((v) =>
      ["Activada", "Activo Parcial", "Activo Total", "Finalizado"].includes(v.estado)
    ).length;
    const rechazadas = dashboardVentas.filter((v) =>
      [
        "Rechazada",
        "RECHAZADO COMERCIAL",
        "Cancelado",
        "Desconexion",
        "Fallida",
        "NO COMISIONABLE",
      ].includes(v.estado)
    ).length;

    const leadsPendientes = dashboardLeads.filter((l) => l.estado === "Pendiente").length;
    const leadsContactados = dashboardLeads.filter((l) => l.estado === "Contactado").length;
    const leadsRellamada = dashboardLeads.filter((l) => l.estado === "Rellamada").length;
    const leadsCerrados = dashboardLeads.filter((l) => l.estado === "Cerrado").length;

    const totalVentas = dashboardVentas.length;
    const totalLeads = dashboardLeads.length;

    const tasaCierreVentas =
      totalVentas > 0 ? ((tramitadas + activadas) / totalVentas) * 100 : 0;

    const tasaConversionLeads =
      totalLeads > 0 ? (leadsCerrados / totalLeads) * 100 : 0;

    return {
      campañasActivas,
      usuariosActivos,
      pendientes,
      validacion,
      tramitadas,
      activadas,
      rechazadas,
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
        tramitadas: 0,
        activadas: 0,
      });
    }

    dashboardVentas.forEach((v) => {
      const d = getVentaDate(v);
      if (!d) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const target = months.find((m) => m.key === key);
      if (!target) return;

      target.ventas += 1;
      if (v.estado === "Tramitada") target.tramitadas += 1;
      if (["Activada", "Activo Parcial", "Activo Total", "Finalizado"].includes(v.estado)) {
        target.activadas += 1;
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
        leads: 0,
        cierres: 0,
      });
    }

    dashboardVentas.forEach((v) => {
      const d = getVentaDate(v);
      if (!d) return;

      const key = d.toISOString().slice(0, 10);
      const target = days.find((x) => x.key === key);
      if (!target) return;

      target.ventas += 1;
      if (["Tramitada", "Activada", "Activo Parcial", "Activo Total", "Finalizado"].includes(v.estado)) {
        target.cierres += 1;
      }
    });

    dashboardLeads.forEach((l) => {
      const d = getLeadDate(l);
      if (!d) return;

      const key = d.toISOString().slice(0, 10);
      const target = days.find((x) => x.key === key);
      if (!target) return;

      target.leads += 1;
    });

    return days;
  }, [dashboardVentas, dashboardLeads]);

  const estadoVentasData = useMemo(() => {
    const rows = [
      { name: "Pendiente", value: metrics.pendientes },
      { name: "Validación", value: metrics.validacion },
      { name: "Tramitada", value: metrics.tramitadas },
      { name: "Activada", value: metrics.activadas },
      { name: "Rechazada", value: metrics.rechazadas },
    ].filter((x) => x.value > 0);

    return rows.length ? rows : [{ name: "Sin datos", value: 1 }];
  }, [metrics]);

  const estadoLeadsData = useMemo(() => {
    const rows = [
      { name: "Pendiente", value: metrics.leadsPendientes },
      { name: "Contactado", value: metrics.leadsContactados },
      { name: "Rellamada", value: metrics.leadsRellamada },
      { name: "Cerrado", value: metrics.leadsCerrados },
    ].filter((x) => x.value > 0);

    return rows.length ? rows : [{ name: "Sin datos", value: 1 }];
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

    if (metrics.pendientes > 0) {
      rows.push({
        label: "Ventas pendientes",
        subLabel: "Requieren avance comercial",
        value: metrics.pendientes,
      });
    }

    if (metrics.validacion > 0) {
      rows.push({
        label: "Ventas en validación",
        subLabel: "Operaciones en revisión",
        value: metrics.validacion,
      });
    }

    if (metrics.rechazadas > 0) {
      rows.push({
        label: "Ventas rechazadas",
        subLabel: "Conviene revisar calidad o argumentario",
        value: metrics.rechazadas,
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
        label: "Leads visibles",
        value: metrics.totalLeads,
        icon: Users,
        color: COLORS.cyan,
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
        color: COLORS.amber,
      },
    ];
  }, [metrics]);

  return (
    <div className="space-y-5 text-[14px]">
      {error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div
        className={`relative overflow-hidden rounded-[26px] border border-white/10 p-4 text-white shadow-[0_20px_70px_rgba(6,11,20,0.22)] transition-all duration-1000 ${heroTheme.bg}`}
      >
        <div className={`pointer-events-none absolute -left-12 top-0 h-44 w-44 rounded-full blur-3xl transition-all duration-1000 ${heroTheme.glowA}`} />
        <div className={`pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full blur-3xl transition-all duration-1000 ${heroTheme.glowB}`} />
        <div className={`pointer-events-none absolute bottom-0 left-[35%] h-40 w-40 rounded-full blur-3xl transition-all duration-1000 ${heroTheme.glowC}`} />

        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            {loading ? "Actualizando resumen..." : "Resumen ejecutivo"}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {executiveStrip.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-[20px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-200">
                      {item.label}
                    </p>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10"
                      style={{ background: `${item.color}25` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>
                  </div>

                  <p className="text-[2rem] font-bold leading-none text-white">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CircleDollarSign}
          title="Ventas visibles"
          value={metrics.totalVentas}
          subtitle="Operaciones registradas"
          color={COLORS.violet}
          trendData={weeklyTrend}
          dataKey="ventas"
        />
        <StatCard
          icon={Users}
          title="Leads visibles"
          value={metrics.totalLeads}
          subtitle="Prospectos disponibles"
          color={COLORS.cyan}
          trendData={weeklyTrend}
          dataKey="leads"
        />
        <StatCard
          icon={TrendingUp}
          title="Tasa de cierre"
          value={formatPercent(metrics.tasaCierreVentas)}
          subtitle="Tramitadas + activadas"
          color={COLORS.emerald}
          trendData={weeklyTrend}
          dataKey="cierres"
        />
        <StatCard
          icon={BriefcaseBusiness}
          title="Campañas activas"
          value={metrics.campañasActivas}
          subtitle="En operación"
          color={COLORS.amber}
          trendData={monthlyTrend}
          dataKey="ventas"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className={glowCardClass()}>
          <div className="mb-4 flex items-center gap-3">
            <Activity className="h-4.5 w-4.5 text-cyan-300" />
            <h3 className="text-base font-semibold text-white">Evolución mensual de ventas</h3>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="ventas" name="Ventas" fill={COLORS.violet} radius={[8, 8, 0, 0]} />
                <Bar dataKey="tramitadas" name="Tramitadas" fill={COLORS.emerald} radius={[8, 8, 0, 0]} />
                <Bar dataKey="activadas" name="Activadas" fill={COLORS.cyan} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={glowCardClass()}>
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="h-4.5 w-4.5 text-fuchsia-300" />
            <h3 className="text-base font-semibold text-white">Estado de ventas</h3>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
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
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className={glowCardClass()}>
          <div className="mb-4 flex items-center gap-3">
            <Target className="h-4.5 w-4.5 text-amber-300" />
            <h3 className="text-base font-semibold text-white">Top campañas</h3>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCampañas} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#cbd5e1"
                  width={100}
                  fontSize={11}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  name="Ventas"
                  fill={COLORS.cyan}
                  radius={[0, 10, 10, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={glowCardClass()}>
          <div className="mb-4 flex items-center gap-3">
            <PhoneCall className="h-4.5 w-4.5 text-emerald-300" />
            <h3 className="text-base font-semibold text-white">Estado de leads</h3>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
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
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
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
        />

        <MiniList
          title="Últimas ventas"
          rows={ultimasVentas}
          icon={LayoutDashboard}
          color={COLORS.cyan}
          emptyText="No hay ventas recientes."
        />

        <MiniList
          title="Alertas rápidas"
          rows={alertas}
          icon={BellRing}
          color={COLORS.amber}
          emptyText="No hay alertas inmediatas."
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className={glowCardClass()}>
          <div className="mb-3 flex items-center gap-3">
            <Clock3 className="h-4.5 w-4.5 text-amber-300" />
            <h3 className="text-base font-semibold text-white">Pendientes</h3>
          </div>
          <p className="text-3xl font-bold text-white">{metrics.pendientes}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Operaciones que aún no avanzan y requieren seguimiento comercial.
          </p>
        </div>

        <div className={glowCardClass()}>
          <div className="mb-3 flex items-center gap-3">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-300" />
            <h3 className="text-base font-semibold text-white">Tramitadas + activadas</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {metrics.tramitadas + metrics.activadas}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Es la parte más sana de la producción visible del sistema.
          </p>
        </div>

        <div className={glowCardClass()}>
          <div className="mb-3 flex items-center gap-3">
            <XCircle className="h-4.5 w-4.5 text-rose-300" />
            <h3 className="text-base font-semibold text-white">Rechazadas</h3>
          </div>
          <p className="text-3xl font-bold text-white">{metrics.rechazadas}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Si suben demasiado, conviene revisar calidad de lead, validación o argumentario.
          </p>
        </div>
      </div>
    </div>
  );
}
