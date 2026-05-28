import { useMemo } from "react";
import {
  Medal,
  Award,
  UserRound,
  BriefcaseBusiness,
  TrendingUp,
  Star,
  Crown,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
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
};

function glowCardClass(extra = "") {
  return `relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,28,0.95)_0%,rgba(10,20,39,0.96)_100%)] p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] ${extra}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#08111f] px-4 py-3 text-sm text-white shadow-xl">
      <p className="mb-2 font-semibold text-slate-200">{label}</p>
      {payload.map((item, idx) => (
        <p key={idx} style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

function PodiumCard({ position, title, subtitle, value, color, icon: Icon }) {
  return (
    <div className={glowCardClass("text-center")}>
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: `${color}30` }}
      />
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10"
        style={{ background: `${color}20` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
        Puesto {position}
      </p>
      <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function RankingList({ title, rows, icon: Icon, color, emptyText }) {
  return (
    <div className={glowCardClass()}>
      <div
        className="pointer-events-none absolute -left-8 top-8 h-24 w-24 rounded-full blur-3xl"
        style={{ background: `${color}24` }}
      />
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10"
          style={{ background: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <div
              key={`${row.label}-${index}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  #{index + 1} {row.label}
                </p>
                {row.subLabel ? (
                  <p className="mt-1 truncate text-xs text-slate-400">{row.subLabel}</p>
                ) : null}
              </div>
              <span className="ml-3 text-sm font-bold text-white">{row.value}</span>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-sm text-slate-400">{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Ranking({ ventas = [] }) {
  const topComerciales = useMemo(() => {
    const counts = {};

    ventas.forEach((v) => {
      const key = v.comercial || "Sin comercial";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        subLabel: "Ventas registradas",
      }))
      .sort((a, b) => b.value - a.value);
  }, [ventas]);

  const topCampañas = useMemo(() => {
    const counts = {};

    ventas.forEach((v) => {
      const key = v.campana || "Sin campaña";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        subLabel: "Producción acumulada",
      }))
      .sort((a, b) => b.value - a.value);
  }, [ventas]);

  const topEstados = useMemo(() => {
    const counts = {};

    ventas.forEach((v) => {
      const key = v.estado || "Sin estado";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [ventas]);

  const comparativoComerciales = useMemo(() => {
    return topComerciales.slice(0, 8).map((item) => ({
      name: item.label,
      Ventas: item.value,
    }));
  }, [topComerciales]);

  const comparativoCampañas = useMemo(() => {
    return topCampañas.slice(0, 6).map((item) => ({
      name: item.label,
      Ventas: item.value,
    }));
  }, [topCampañas]);

  const totalVentas = ventas.length;

  const top1 = topComerciales[0];
  const top2 = topComerciales[1];
  const top3 = topComerciales[2];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#071226_0%,#111827_40%,#3b0764_100%)] p-6 text-white shadow-[0_30px_90px_rgba(6,11,20,0.32)]">
        <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[35%] h-44 w-44 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Ranking ejecutivo
          </div>

          <h1 className="max-w-4xl text-3xl font-bold leading-tight md:text-4xl">
            Rendimiento comercial, campañas y producción visible
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200">
            Una vista más clara y profesional del desempeño de tu operación según las ventas cargadas en el sistema.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90">
              Ventas visibles:{" "}
              <span className="font-semibold text-white">{totalVentas}</span>
            </span>
            <span className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90">
              Comerciales rankeados:{" "}
              <span className="font-semibold text-white">{topComerciales.length}</span>
            </span>
            <span className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90">
              Campañas rankeadas:{" "}
              <span className="font-semibold text-white">{topCampañas.length}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <PodiumCard
          position={1}
          title={top1?.label || "Sin datos"}
          subtitle="Mejor producción visible"
          value={top1?.value || 0}
          color={COLORS.amber}
          icon={Crown}
        />
        <PodiumCard
          position={2}
          title={top2?.label || "Sin datos"}
          subtitle="Segundo mejor rendimiento"
          value={top2?.value || 0}
          color={COLORS.cyan}
          icon={Medal}
        />
        <PodiumCard
          position={3}
          title={top3?.label || "Sin datos"}
          subtitle="Tercera mejor marca"
          value={top3?.value || 0}
          color={COLORS.violet}
          icon={Award}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={glowCardClass()}>
          <div className="mb-5 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-cyan-300" />
            <h3 className="text-lg font-semibold text-white">Top comerciales</h3>
          </div>

          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativoComerciales}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Ventas" fill={COLORS.cyan} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <RankingList
          title="Listado comercial"
          rows={topComerciales.slice(0, 8)}
          icon={UserRound}
          color={COLORS.violet}
          emptyText="No hay comerciales con ventas visibles."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <RankingList
          title="Top campañas"
          rows={topCampañas.slice(0, 8)}
          icon={BriefcaseBusiness}
          color={COLORS.emerald}
          emptyText="No hay campañas con ventas visibles."
        />

        <div className={glowCardClass()}>
          <div className="mb-5 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Comparativo por campañas</h3>
          </div>

          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativoCampañas} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#cbd5e1" width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Ventas" fill={COLORS.emerald} radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className={glowCardClass()}>
          <div className="mb-5 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-fuchsia-300" />
            <h3 className="text-lg font-semibold text-white">Distribución por estado</h3>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topEstados}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {topEstados.map((entry, index) => {
                    const colorMap = {
                      Pendiente: COLORS.amber,
                      Validación: COLORS.cyan,
                      Tramitada: COLORS.emerald,
                      Activada: COLORS.violet,
                      Rechazada: COLORS.rose,
                    };

                    return (
                      <Cell
                        key={index}
                        fill={colorMap[entry.name] || COLORS.slate}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={glowCardClass()}>
          <div className="mb-5 flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-300" />
            <h3 className="text-lg font-semibold text-white">Lectura rápida del ranking</h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Top 1 comercial</p>
              <p className="mt-2 text-2xl font-bold text-white">{top1?.label || "Sin datos"}</p>
              <p className="mt-2 text-sm text-slate-300">
                Con {top1?.value || 0} ventas visibles registradas.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Top campaña</p>
              <p className="mt-2 text-2xl font-bold text-white">{topCampañas[0]?.label || "Sin datos"}</p>
              <p className="mt-2 text-sm text-slate-300">
                Con {topCampañas[0]?.value || 0} ventas acumuladas visibles.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Enfoque recomendado</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Usa este ranking para detectar quién produce más, qué campañas empujan el volumen
                y dónde conviene reforzar seguimiento o calidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
