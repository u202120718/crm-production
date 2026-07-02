import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  CircleDollarSign,
  Users,
  BriefcaseBusiness,
  TrendingUp,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  BellRing,
  Target,
  UserRound,
  PhoneCall,
  Activity,
  AlertTriangle,
  TimerReset,
  FileSpreadsheet,
  Send,
  Plus,
  CalendarDays,
  ArrowRight,
  Eye,
  Zap,
  Trophy,
  RefreshCcw,
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
  LineChart,
  Line,
} from "recharts";

const COLORS = {
  blue: "#2563eb",
  cyan: "#22d3ee",
  sky: "#38bdf8",
  violet: "#8b5cf6",
  purple: "#7c3aed",
  fuchsia: "#d946ef",
  emerald: "#10b981",
  green: "#22c55e",
  amber: "#f59e0b",
  orange: "#f97316",
  rose: "#f43f5e",
  red: "#ef4444",
  slate: "#94a3b8",
};

const STATUS_COLOR_MAP = {
  PENDIENTE: COLORS.amber,
  "VALIDANDO...": COLORS.sky,
  "VALIDADO PERU": COLORS.cyan,
  "ACTIVO PARCIAL": COLORS.violet,
  "ACTIVO TOTAL": COLORS.emerald,
  FINALIZADO: COLORS.green,
  "PROCESO DE CANCELACION": COLORS.orange,
  CANCELADO: COLORS.red,
  DESCONEXION: COLORS.rose,
  FALLIDA: COLORS.rose,
  "RECHAZADO COMERCIAL": COLORS.rose,
  "NO COMISIONABLE": COLORS.slate,
  CONTACTADO: COLORS.sky,
  RELLAMADA: COLORS.violet,
  CERRADO: COLORS.emerald,
  "SIN DATOS": COLORS.slate,
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
  if (token) headers["X-XSRF-TOKEN"] = decodeURIComponent(token);

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

function normalizeUpper(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeStatus(value) {
  return normalizeUpper(value || "PENDIENTE");
}

function safeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const raw = String(value).trim();
  if (!raw) return null;

  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) return iso;

  const match = raw.match(
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
    safeDate(venta?.created_at) ||
    safeDate([venta?.fecha, venta?.hora].filter(Boolean).join(" ")) ||
    safeDate(venta?.fecha) ||
    null
  );
}

function getDateKey(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(1)}%`;
}

function getCampaignLogo(campana = "") {
  const name = normalizeUpper(campana);
  if (CAMPAIGN_LOGOS[name]) return CAMPAIGN_LOGOS[name];
  const key = Object.keys(CAMPAIGN_LOGOS).find((item) => name.includes(item));
  return key ? CAMPAIGN_LOGOS[key] : "/img/campaigns/vodafone.jpg";
}

function isFavorable(status) {
  return ["ACTIVO PARCIAL", "ACTIVO TOTAL", "FINALIZADO"].includes(normalizeStatus(status));
}

function isNoFavorable(status) {
  return [
    "CANCELADO",
    "DESCONEXION",
    "FALLIDA",
    "RECHAZADO COMERCIAL",
    "NO COMISIONABLE",
  ].includes(normalizeStatus(status));
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="dash-tooltip">
      <p className="dash-tooltip-label">{label}</p>
      {payload.map((item, idx) => (
        <p key={idx} style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, subtitle, color, percent, sparkData = [], dataKey = "value" }) {
  return (
    <div className="dash-metric-card" style={{ "--metric-color": color }}>
      <div className="dash-metric-glow" />
      <div className="dash-metric-top">
        <div className="dash-metric-icon">
          <Icon size={24} />
        </div>
        <div className="dash-metric-spark">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.55} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fill={`url(#spark-${title})`}
                strokeWidth={2.4}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="dash-metric-title">{title}</p>
      <div className="dash-metric-value-row">
        <h3>{value}</h3>
        {percent ? <span>{percent}</span> : null}
      </div>
      <p className="dash-metric-subtitle">{subtitle}</p>
    </div>
  );
}

function StatusBadge({ estado }) {
  const status = normalizeStatus(estado);
  const color = STATUS_COLOR_MAP[status] || COLORS.slate;

  return (
    <span className="dash-status-badge" style={{ "--status-color": color }}>
      {status}
    </span>
  );
}

function RecentSalesTable({ ventas }) {
  return (
    <div className="dash-card dash-recent">
      <div className="dash-section-head">
        <div>
          <p>LISTADO RÁPIDO</p>
          <h3>Ventas recientes</h3>
        </div>
        <span>{ventas.length} visible(s)</span>
      </div>

      <div className="dash-sales-list">
        {ventas.length ? (
          ventas.map((venta, index) => {
            const logo = getCampaignLogo(venta?.campana);
            const initials = String(venta?.cliente || "SN")
              .split(" ")
              .slice(0, 2)
              .map((x) => x[0])
              .join("")
              .toUpperCase();

            return (
              <div key={venta?.id || `${venta?.cliente}-${index}`} className="dash-sale-row">
                <div className="dash-client-avatar">
                  {logo ? (
                    <img src={logo} alt={venta?.campana || "Campaña"} onError={(e) => (e.currentTarget.style.display = "none")} />
                  ) : (
                    initials
                  )}
                </div>

                <div className="dash-sale-main">
                  <strong>{venta?.cliente || "Cliente sin nombre"}</strong>
                  <span>{venta?.documento || "-"} · {venta?.telefono || "-"}</span>
                </div>

                <div className="dash-sale-campaign">
                  <small>Campaña</small>
                  <strong>{venta?.campana || "-"}</strong>
                </div>

                <div className="dash-sale-product">
                  <small>Producto</small>
                  <strong>{venta?.producto || "-"}</strong>
                </div>

                <StatusBadge estado={venta?.estado} />

                <div className="dash-sale-date">
                  <strong>{venta?.fecha || "-"}</strong>
                  <span>{venta?.hora || "-"}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="dash-empty">Todavía no hay ventas recientes.</div>
        )}
      </div>
    </div>
  );
}

function TopCommercials({ rows }) {
  const max = Math.max(...rows.map((x) => x.value), 1);

  return (
    <div className="dash-card">
      <div className="dash-section-head">
        <div>
          <p>RANKING</p>
          <h3>Top comerciales</h3>
        </div>
        <Trophy size={20} />
      </div>

      <div className="dash-ranking-list">
        {rows.length ? (
          rows.map((row, index) => (
            <div key={row.label} className="dash-ranking-row">
              <span className="dash-ranking-number">{index + 1}</span>
              <div>
                <strong>{row.label}</strong>
                <div className="dash-ranking-bar">
                  <span style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }} />
                </div>
              </div>
              <em>{row.value}</em>
            </div>
          ))
        ) : (
          <div className="dash-empty">Sin ranking disponible.</div>
        )}
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, text, color }) {
  return (
    <button className="dash-action-card" style={{ "--action-color": color }}>
      <div>
        <Icon size={22} />
      </div>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <ArrowRight size={18} />
    </button>
  );
}

function ValidationRing({ total, favorable, pendientes, noFavorables }) {
  const rate = total ? (favorable / total) * 100 : 0;
  const data = [
    { name: "Favorables", value: favorable || 0, color: COLORS.green },
    { name: "Pendientes", value: pendientes || 0, color: COLORS.amber },
    { name: "No favorables", value: noFavorables || 0, color: COLORS.rose },
  ].filter((x) => x.value > 0);

  const safeData = data.length ? data : [{ name: "Sin datos", value: 1, color: COLORS.slate }];

  return (
    <div className="dash-card dash-ring-card">
      <div className="dash-section-head">
        <div>
          <p>VALIDACIÓN</p>
          <h3>Estados de validación</h3>
        </div>
        <ShieldCheck size={20} />
      </div>

      <div className="dash-ring-layout">
        <div className="dash-ring">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safeData}
                dataKey="value"
                innerRadius={58}
                outerRadius={78}
                paddingAngle={4}
                isAnimationActive
              >
                {safeData.map((item, index) => (
                  <Cell key={index} fill={item.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="dash-ring-center">
            <strong>{formatPercent(rate)}</strong>
            <span>Tasa favorable</span>
          </div>
        </div>

        <div className="dash-ring-legend">
          {safeData.map((item) => (
            <div key={item.name}>
              <span style={{ background: item.color }} />
              <p>{item.name}</p>
              <strong>{item.name === "Sin datos" ? 0 : item.value}</strong>
            </div>
          ))}
        </div>
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

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event?.detail) setTheme(event.detail);
      else setTheme(getThemeValue());
    };

    window.addEventListener("crm-theme-change", handleThemeChange);
    return () => window.removeEventListener("crm-theme-change", handleThemeChange);
  }, []);

  useEffect(() => setDashboardCampaigns(campaigns), [campaigns]);
  useEffect(() => setDashboardUsers(users), [users]);
  useEffect(() => setDashboardVentas(ventas), [ventas]);
  useEffect(() => setDashboardLeads(leads), [leads]);

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
        if (active) setError("No se pudieron cargar los datos del dashboard.");
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
    const totalVentas = dashboardVentas.length;
    const campañasActivas = dashboardCampaigns.filter(
      (c) => normalizeStatus(c.estado) === "ACTIVA"
    ).length;
    const usuariosActivos = dashboardUsers.filter(
      (u) => normalizeStatus(u.estado) === "ACTIVO"
    ).length;

    const pendientes = dashboardVentas.filter((v) => normalizeStatus(v.estado) === "PENDIENTE").length;
    const validando = dashboardVentas.filter((v) => normalizeStatus(v.estado) === "VALIDANDO...").length;
    const validadas = dashboardVentas.filter((v) => normalizeStatus(v.estado) === "VALIDADO PERU").length;
    const activoTotal = dashboardVentas.filter((v) => normalizeStatus(v.estado) === "ACTIVO TOTAL").length;
    const finalizadas = dashboardVentas.filter((v) => normalizeStatus(v.estado) === "FINALIZADO").length;
    const favorables = dashboardVentas.filter((v) => isFavorable(v.estado)).length;
    const noFavorables = dashboardVentas.filter((v) => isNoFavorable(v.estado)).length;

    const leadsPendientes = dashboardLeads.filter((l) => normalizeStatus(l.estado) === "PENDIENTE").length;
    const leadsCerrados = dashboardLeads.filter((l) => normalizeStatus(l.estado) === "CERRADO").length;

    return {
      totalVentas,
      campañasActivas,
      usuariosActivos,
      pendientes,
      validando,
      validadas,
      activoTotal,
      finalizadas,
      favorables,
      noFavorables,
      totalLeads: dashboardLeads.length,
      leadsPendientes,
      leadsCerrados,
      cierreVentas: totalVentas ? (favorables / totalVentas) * 100 : 0,
      conversionLeads: dashboardLeads.length ? (leadsCerrados / dashboardLeads.length) * 100 : 0,
    };
  }, [dashboardCampaigns, dashboardUsers, dashboardVentas, dashboardLeads]);

  const weeklyTrend = useMemo(() => {
    const now = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({
        key: getDateKey(d),
        label: d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
        total: 0,
        gestionadas: 0,
        pendientes: 0,
        noFavorables: 0,
      });
    }

    dashboardVentas.forEach((venta) => {
      const d = getVentaDate(venta);
      if (!d) return;
      const target = days.find((item) => item.key === getDateKey(d));
      if (!target) return;

      target.total += 1;
      if (isFavorable(venta.estado)) target.gestionadas += 1;
      if (normalizeStatus(venta.estado) === "PENDIENTE") target.pendientes += 1;
      if (isNoFavorable(venta.estado)) target.noFavorables += 1;
    });

    return days;
  }, [dashboardVentas]);

  const campaignData = useMemo(() => {
    const counts = {};
    dashboardVentas.forEach((venta) => {
      const key = normalizeUpper(venta.campana || "OTROS");
      counts[key] = (counts[key] || 0) + 1;
    });

    const rows = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return rows.length ? rows : [{ name: "SIN DATOS", value: 1 }];
  }, [dashboardVentas]);

  const statusData = useMemo(() => {
    const counts = {};
    dashboardVentas.forEach((venta) => {
      const key = normalizeStatus(venta.estado || "PENDIENTE");
      counts[key] = (counts[key] || 0) + 1;
    });

    const rows = Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLOR_MAP[name] || COLORS.slate,
      }))
      .sort((a, b) => b.value - a.value);

    return rows.length ? rows : [{ name: "SIN DATOS", value: 1, color: COLORS.slate }];
  }, [dashboardVentas]);

  const latestSales = useMemo(() => {
    return [...dashboardVentas]
      .sort((a, b) => (getVentaDate(b)?.getTime() || 0) - (getVentaDate(a)?.getTime() || 0))
      .slice(0, 6);
  }, [dashboardVentas]);

  const topComerciales = useMemo(() => {
    const counts = {};
    dashboardVentas.forEach((venta) => {
      const key = venta.comercial || "Sin comercial";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [dashboardVentas]);

  const todayLabel = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const welcomeName =
    currentUser?.nombre ||
    currentUser?.name ||
    "Equipo Comercial";

  const campaignColors = [COLORS.blue, COLORS.sky, COLORS.green, COLORS.orange, COLORS.rose, COLORS.slate];

  return (
    <div className={`dash-pro dash-theme-${theme || "night"}`}>
      <DashboardStyle />

      {error ? (
        <div className="dash-alert-error">{error}</div>
      ) : null}

      <div className="dash-topbar">
        <div>
          <h1>¡Bienvenido, {welcomeName}!</h1>
          <p>Aquí tienes el resumen general de la gestión comercial.</p>
        </div>

        <div className="dash-topbar-actions">
          <span>
            <CalendarDays size={17} />
            {todayLabel}
          </span>
          <button title="Actualizar" onClick={() => window.location.reload()}>
            <RefreshCcw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="dash-metrics-grid">
        <MetricCard
          icon={LayoutDashboard}
          title="Total ventas"
          value={metrics.totalVentas}
          subtitle="Todas las ventas registradas"
          color={COLORS.blue}
          sparkData={weeklyTrend}
          dataKey="total"
        />
        <MetricCard
          icon={CheckCircle2}
          title="Gestionadas"
          value={metrics.favorables}
          subtitle={`${formatPercent(metrics.cierreVentas)} del total`}
          color={COLORS.emerald}
          sparkData={weeklyTrend}
          dataKey="gestionadas"
        />
        <MetricCard
          icon={Clock3}
          title="Pendientes"
          value={metrics.pendientes}
          subtitle="Ventas por validar"
          color={COLORS.amber}
          sparkData={weeklyTrend}
          dataKey="pendientes"
        />
        <MetricCard
          icon={ShieldCheck}
          title="No favorables"
          value={metrics.noFavorables}
          subtitle="Caídas o rechazadas"
          color={COLORS.rose}
          sparkData={weeklyTrend}
          dataKey="noFavorables"
        />
      </div>

      <div className="dash-main-grid">
        <div className="dash-card dash-chart-card dash-wide">
          <div className="dash-section-head">
            <div>
              <p>EVOLUCIÓN</p>
              <h3>Evolución de ventas</h3>
            </div>
            <span>Últimos 7 días</span>
          </div>

          <div className="dash-chart-xl">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <CartesianGrid stroke="rgba(148,163,184,.14)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--dash-muted)" fontSize={12} />
                <YAxis stroke="var(--dash-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total" stroke={COLORS.blue} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="gestionadas" name="Gestionadas" stroke={COLORS.emerald} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pendientes" name="Pendientes" stroke={COLORS.amber} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="noFavorables" name="No favorables" stroke={COLORS.rose} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-card dash-campaign-card">
          <div className="dash-section-head">
            <div>
              <p>CAMPAÑAS</p>
              <h3>Ventas por campaña</h3>
            </div>
            <BriefcaseBusiness size={20} />
          </div>

          <div className="dash-donut-layout">
            <div className="dash-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={campaignData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={92} paddingAngle={4}>
                    {campaignData.map((entry, index) => (
                      <Cell key={entry.name} fill={campaignColors[index % campaignColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dash-donut-center">
                <strong>{metrics.totalVentas}</strong>
                <span>Total</span>
              </div>
            </div>

            <div className="dash-campaign-list">
              {campaignData.map((item, index) => (
                <div key={item.name}>
                  <span style={{ background: campaignColors[index % campaignColors.length] }} />
                  <p>{item.name}</p>
                  <strong>{item.name === "SIN DATOS" ? 0 : item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ValidationRing
          total={metrics.totalVentas}
          favorable={metrics.favorables}
          pendientes={metrics.pendientes}
          noFavorables={metrics.noFavorables}
        />

        <RecentSalesTable ventas={latestSales} />

        <div className="dash-card dash-status-card">
          <div className="dash-section-head">
            <div>
              <p>ESTADOS</p>
              <h3>Distribución por estado</h3>
            </div>
            <Activity size={20} />
          </div>

          <div className="dash-gauge">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData.slice(0, 6)} layout="vertical" margin={{ left: 16, right: 20 }}>
                <CartesianGrid stroke="rgba(148,163,184,.14)" horizontal vertical={false} />
                <XAxis type="number" stroke="var(--dash-muted)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="var(--dash-muted)" width={120} fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Ventas" radius={[0, 10, 10, 0]}>
                  {statusData.slice(0, 6).map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <TopCommercials rows={topComerciales} />
      </div>

      <div className="dash-quick-actions">
        <ActionCard icon={Plus} title="Registrar venta" text="Crear nueva ficha" color={COLORS.blue} />
        <ActionCard icon={CheckCircle2} title="Validar pendientes" text={`${metrics.pendientes} pendientes`} color={COLORS.emerald} />
        <ActionCard icon={FileSpreadsheet} title="Exportar reporte" text="Excel / PDF" color={COLORS.violet} />
        <ActionCard icon={Eye} title="Ver reportes" text="Análisis completo" color={COLORS.orange} />
        <ActionCard icon={Send} title="Enviar comunicado" text="A comerciales" color={COLORS.rose} />
      </div>

      <div className="dash-footer-kpis">
        <div>
          <Users size={20} />
          <span>Usuarios activos</span>
          <strong>{metrics.usuariosActivos}</strong>
        </div>
        <div>
          <BriefcaseBusiness size={20} />
          <span>Campañas activas</span>
          <strong>{metrics.campañasActivas}</strong>
        </div>
        <div>
          <TimerReset size={20} />
          <span>Leads visibles</span>
          <strong>{metrics.totalLeads}</strong>
        </div>
        <div>
          <TrendingUp size={20} />
          <span>Conversión leads</span>
          <strong>{formatPercent(metrics.conversionLeads)}</strong>
        </div>
      </div>
    </div>
  );
}

function DashboardStyle() {
  return (
    <style>{`
      .dash-pro {
        --dash-bg: #071126;
        --dash-panel: rgba(10, 24, 55, .92);
        --dash-panel-2: rgba(13, 29, 65, .78);
        --dash-border: rgba(119, 155, 255, .16);
        --dash-text: #f8fbff;
        --dash-muted: #9fb3d9;
        --dash-soft: rgba(255,255,255,.05);
        --dash-input: rgba(5, 16, 36, .78);
        color: var(--dash-text);
        position: relative;
        min-height: 100%;
        padding: 6px 8px 28px;
      }

      .dash-theme-light {
        --dash-bg: #f4f7fb;
        --dash-panel: rgba(255,255,255,.95);
        --dash-panel-2: rgba(255,255,255,.86);
        --dash-border: rgba(148,163,184,.32);
        --dash-text: #0f172a;
        --dash-muted: #64748b;
        --dash-soft: rgba(15,23,42,.04);
        --dash-input: rgba(255,255,255,.88);
      }

      .dash-theme-silver {
        --dash-bg: #e8edf5;
        --dash-panel: rgba(255,255,255,.78);
        --dash-panel-2: rgba(241,245,249,.74);
        --dash-border: rgba(255,255,255,.62);
        --dash-text: #0f172a;
        --dash-muted: #64748b;
        --dash-soft: rgba(15,23,42,.045);
        --dash-input: rgba(255,255,255,.8);
      }

      .dash-theme-neon {
        --dash-bg: #03081d;
        --dash-panel: rgba(8, 18, 47, .94);
        --dash-panel-2: rgba(13, 25, 61, .82);
        --dash-border: rgba(89, 123, 255, .28);
        --dash-text: #ffffff;
        --dash-muted: #b7c8ff;
        --dash-soft: rgba(99,102,241,.08);
        --dash-input: rgba(4, 12, 32, .86);
      }

      .dash-pro::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 12% 8%, rgba(37,99,235,.16), transparent 28%),
          radial-gradient(circle at 82% 18%, rgba(217,70,239,.14), transparent 26%),
          radial-gradient(circle at 52% 86%, rgba(16,185,129,.10), transparent 30%);
        z-index: 0;
      }

      .dash-pro > * {
        position: relative;
        z-index: 1;
      }

      .dash-alert-error {
        margin-bottom: 16px;
        border: 1px solid rgba(244,63,94,.35);
        background: rgba(244,63,94,.12);
        color: #fecdd3;
        border-radius: 18px;
        padding: 13px 16px;
        font-weight: 700;
      }

      .dash-topbar {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: center;
        margin-bottom: 18px;
      }

      .dash-topbar h1 {
        margin: 0;
        font-size: clamp(24px, 2.2vw, 34px);
        line-height: 1.05;
        font-weight: 950;
        letter-spacing: -0.04em;
      }

      .dash-topbar p {
        margin: 6px 0 0;
        color: var(--dash-muted);
        font-weight: 600;
      }

      .dash-topbar-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .dash-topbar-actions span,
      .dash-topbar-actions button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 46px;
        border-radius: 14px;
        border: 1px solid var(--dash-border);
        background: var(--dash-panel);
        color: var(--dash-text);
        padding: 0 16px;
        font-weight: 800;
        box-shadow: 0 14px 34px rgba(2,8,23,.18);
      }

      .dash-topbar-actions button {
        width: 46px;
        justify-content: center;
        cursor: pointer;
        padding: 0;
      }

      .dash-metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 14px;
      }

      .dash-metric-card {
        position: relative;
        overflow: hidden;
        min-height: 156px;
        border-radius: 22px;
        border: 1px solid color-mix(in srgb, var(--metric-color) 42%, transparent);
        background:
          linear-gradient(135deg, color-mix(in srgb, var(--metric-color) 36%, transparent), transparent 70%),
          var(--dash-panel);
        padding: 20px;
        box-shadow: 0 20px 44px rgba(2,8,23,.22);
        transition: transform .22s ease, border-color .22s ease;
      }

      .dash-metric-card:hover {
        transform: translateY(-4px);
        border-color: color-mix(in srgb, var(--metric-color) 64%, transparent);
      }

      .dash-metric-glow {
        position: absolute;
        right: -44px;
        top: -48px;
        width: 140px;
        height: 140px;
        background: var(--metric-color);
        opacity: .18;
        filter: blur(34px);
        border-radius: 999px;
      }

      .dash-metric-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
      }

      .dash-metric-icon {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        color: white;
        background: color-mix(in srgb, var(--metric-color) 70%, #111827);
        box-shadow: 0 16px 30px color-mix(in srgb, var(--metric-color) 20%, transparent);
      }

      .dash-metric-spark {
        width: 104px;
        height: 42px;
      }

      .dash-metric-title {
        margin: 15px 0 0;
        color: var(--dash-muted);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: .18em;
        font-weight: 900;
      }

      .dash-metric-value-row {
        margin-top: 7px;
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 8px;
      }

      .dash-metric-value-row h3 {
        margin: 0;
        font-size: 31px;
        line-height: 1;
        font-weight: 950;
      }

      .dash-metric-value-row span {
        font-size: 13px;
        font-weight: 900;
        color: var(--metric-color);
      }

      .dash-metric-subtitle {
        margin: 7px 0 0;
        color: var(--dash-muted);
        font-size: 13px;
        font-weight: 600;
      }

      .dash-main-grid {
        display: grid;
        grid-template-columns: 1.25fr .82fr .68fr;
        gap: 14px;
        align-items: stretch;
      }

      .dash-card {
        border: 1px solid var(--dash-border);
        background: var(--dash-panel);
        border-radius: 22px;
        box-shadow: 0 18px 42px rgba(2,8,23,.20);
        overflow: hidden;
        padding: 18px;
      }

      .dash-wide {
        grid-column: span 2;
      }

      .dash-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .dash-section-head p {
        margin: 0;
        color: var(--dash-muted);
        font-size: 11px;
        font-weight: 950;
        letter-spacing: .16em;
      }

      .dash-section-head h3 {
        margin: 4px 0 0;
        font-size: 17px;
        font-weight: 950;
        letter-spacing: -.02em;
      }

      .dash-section-head span {
        color: var(--dash-muted);
        border: 1px solid var(--dash-border);
        background: var(--dash-soft);
        padding: 8px 12px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 12px;
      }

      .dash-chart-xl {
        height: 305px;
      }

      .dash-donut-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        align-items: center;
        min-height: 300px;
      }

      .dash-donut,
      .dash-ring {
        position: relative;
        height: 230px;
      }

      .dash-donut-center,
      .dash-ring-center {
        position: absolute;
        inset: 0;
        display: grid;
        place-content: center;
        text-align: center;
        pointer-events: none;
      }

      .dash-donut-center strong,
      .dash-ring-center strong {
        font-size: 34px;
        font-weight: 950;
      }

      .dash-donut-center span,
      .dash-ring-center span {
        color: var(--dash-muted);
        font-weight: 700;
        font-size: 13px;
      }

      .dash-campaign-list,
      .dash-ring-legend {
        display: grid;
        gap: 11px;
      }

      .dash-campaign-list div,
      .dash-ring-legend div {
        display: grid;
        grid-template-columns: 12px 1fr auto;
        align-items: center;
        gap: 10px;
        color: var(--dash-text);
        font-size: 13px;
      }

      .dash-campaign-list span,
      .dash-ring-legend span {
        width: 11px;
        height: 11px;
        border-radius: 999px;
      }

      .dash-campaign-list p,
      .dash-ring-legend p {
        margin: 0;
        color: var(--dash-muted);
        font-weight: 800;
      }

      .dash-campaign-list strong,
      .dash-ring-legend strong {
        font-weight: 950;
      }

      .dash-ring-card {
        grid-row: span 1;
      }

      .dash-ring-layout {
        display: grid;
        gap: 6px;
      }

      .dash-ring {
        height: 210px;
      }

      .dash-recent {
        grid-column: span 2;
        padding: 0;
      }

      .dash-recent .dash-section-head {
        padding: 18px 18px 0;
      }

      .dash-sales-list {
        display: grid;
      }

      .dash-sale-row {
        display: grid;
        grid-template-columns: 44px 1.3fr .8fr .8fr auto .7fr;
        gap: 12px;
        align-items: center;
        border-top: 1px solid var(--dash-border);
        padding: 13px 18px;
        transition: background .2s ease, transform .2s ease;
      }

      .dash-sale-row:hover {
        background: var(--dash-soft);
      }

      .dash-client-avatar {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        background: white;
        display: grid;
        place-items: center;
        overflow: hidden;
        color: #0f172a;
        font-weight: 950;
      }

      .dash-client-avatar img {
        width: 34px;
        height: 34px;
        object-fit: contain;
      }

      .dash-sale-main,
      .dash-sale-campaign,
      .dash-sale-product,
      .dash-sale-date {
        display: grid;
        gap: 3px;
        min-width: 0;
      }

      .dash-sale-main strong,
      .dash-sale-campaign strong,
      .dash-sale-product strong,
      .dash-sale-date strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
        font-weight: 950;
      }

      .dash-sale-main span,
      .dash-sale-campaign small,
      .dash-sale-product small,
      .dash-sale-date span {
        color: var(--dash-muted);
        font-size: 11px;
        font-weight: 700;
      }

      .dash-status-badge {
        border: 1px solid color-mix(in srgb, var(--status-color) 60%, transparent);
        background: color-mix(in srgb, var(--status-color) 20%, transparent);
        color: color-mix(in srgb, var(--status-color) 92%, white);
        border-radius: 999px;
        padding: 7px 11px;
        font-size: 11px;
        font-weight: 950;
        text-align: center;
        white-space: nowrap;
      }

      .dash-status-card {
        grid-column: span 2;
      }

      .dash-gauge {
        height: 300px;
      }

      .dash-ranking-list {
        display: grid;
        gap: 15px;
      }

      .dash-ranking-row {
        display: grid;
        grid-template-columns: 34px 1fr auto;
        gap: 12px;
        align-items: center;
      }

      .dash-ranking-number {
        width: 30px;
        height: 30px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #2563eb, #8b5cf6);
        color: white;
        font-weight: 950;
        font-size: 13px;
      }

      .dash-ranking-row strong {
        font-size: 13px;
        font-weight: 950;
      }

      .dash-ranking-row em {
        color: var(--dash-muted);
        font-style: normal;
        font-weight: 900;
      }

      .dash-ranking-bar {
        margin-top: 6px;
        height: 7px;
        border-radius: 999px;
        background: var(--dash-soft);
        overflow: hidden;
      }

      .dash-ranking-bar span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #2563eb, #8b5cf6, #d946ef);
      }

      .dash-quick-actions {
        margin-top: 14px;
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 14px;
      }

      .dash-action-card {
        border: 1px solid var(--dash-border);
        background: var(--dash-panel-2);
        border-radius: 20px;
        min-height: 86px;
        padding: 15px;
        display: grid;
        grid-template-columns: 44px 1fr 20px;
        gap: 12px;
        align-items: center;
        color: var(--dash-text);
        text-align: left;
        cursor: pointer;
        transition: transform .2s ease, border-color .2s ease;
      }

      .dash-action-card:hover {
        transform: translateY(-3px);
        border-color: color-mix(in srgb, var(--action-color) 52%, transparent);
      }

      .dash-action-card > div {
        width: 44px;
        height: 44px;
        border-radius: 15px;
        display: grid;
        place-items: center;
        background: color-mix(in srgb, var(--action-color) 72%, #111827);
        color: white;
      }

      .dash-action-card span {
        display: grid;
        gap: 4px;
      }

      .dash-action-card strong {
        font-size: 13px;
        font-weight: 950;
      }

      .dash-action-card small {
        color: var(--dash-muted);
        font-weight: 700;
      }

      .dash-footer-kpis {
        margin-top: 14px;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .dash-footer-kpis div {
        border: 1px solid var(--dash-border);
        background: var(--dash-panel-2);
        border-radius: 18px;
        padding: 15px;
        display: grid;
        grid-template-columns: 24px 1fr auto;
        gap: 10px;
        align-items: center;
      }

      .dash-footer-kpis span {
        color: var(--dash-muted);
        font-weight: 900;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: .12em;
      }

      .dash-footer-kpis strong {
        font-size: 22px;
        font-weight: 950;
      }

      .dash-tooltip {
        border: 1px solid var(--dash-border);
        background: rgba(7, 17, 38, .96);
        color: white;
        border-radius: 14px;
        padding: 10px 12px;
        box-shadow: 0 20px 42px rgba(2,8,23,.28);
        font-size: 12px;
      }

      .dash-tooltip-label {
        margin: 0 0 6px;
        font-weight: 950;
      }

      .dash-empty {
        border-top: 1px solid var(--dash-border);
        padding: 18px;
        color: var(--dash-muted);
        font-weight: 800;
      }

      @media (max-width: 1400px) {
        .dash-main-grid {
          grid-template-columns: 1fr 1fr;
        }

        .dash-wide,
        .dash-recent,
        .dash-status-card {
          grid-column: span 2;
        }

        .dash-metrics-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .dash-quick-actions {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .dash-footer-kpis {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 900px) {
        .dash-main-grid,
        .dash-metrics-grid,
        .dash-quick-actions,
        .dash-footer-kpis {
          grid-template-columns: 1fr;
        }

        .dash-wide,
        .dash-recent,
        .dash-status-card {
          grid-column: span 1;
        }

        .dash-topbar {
          align-items: flex-start;
          flex-direction: column;
        }

        .dash-sale-row {
          grid-template-columns: 42px 1fr;
        }

        .dash-sale-campaign,
        .dash-sale-product,
        .dash-status-badge,
        .dash-sale-date {
          grid-column: 2;
        }

        .dash-donut-layout {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}
