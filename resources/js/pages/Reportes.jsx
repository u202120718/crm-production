import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarRange,
  Filter,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
  XCircle,
  Users,
  BriefcaseBusiness,
  CheckSquare,
  Square,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ESTADOS_CONFIG,
  FAVORABLES_SET,
  PENDIENTES_SET,
  NO_FAVORABLES_SET,
  normalizeUpper,
  normalizeEstado,
  estadoBadge,
  toUpperExportRow,
} from "../config/ventasestados";

function toDateValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "0.00%";
  return `${value.toFixed(2)}%`;
}

function StatCard({ icon: Icon, title, value, subtitle, iconColor }) {
  return (
    <div className="crm-panel p-5">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <p className="crm-label">{title}</p>
      </div>
      <p className="crm-kpi mt-3 text-3xl">{value}</p>
      <p className="crm-muted mt-2 text-sm">{subtitle}</p>
    </div>
  );
}

function RankingBlock({ title, rows, valueLabel, gradients }) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="crm-panel p-5">
      <h3 className="crm-heading text-lg">{title}</h3>

      <div className="mt-4 space-y-4">
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <div key={row.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                  {normalizeUpper(row.label)}
                </p>
                <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                  {row.value} {valueLabel}
                </p>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200/50">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    gradients[index % gradients.length]
                  }`}
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="crm-muted">NO HAY DATOS PARA MOSTRAR.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Reportes({
  ventas = [],
  campaigns = [],
  currentUser,
}) {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [campanaFiltro, setCampanaFiltro] = useState("TODAS");
  const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);

  const campañasDisponibles = useMemo(() => {
    const campañasVentas = ventas.map((v) => normalizeUpper(v.campana)).filter(Boolean);
    const campañasConfig = campaigns.map((c) => normalizeUpper(c.nombre)).filter(Boolean);
    return ["TODAS", ...new Set([...campañasVentas, ...campañasConfig])];
  }, [ventas, campaigns]);

  const toggleEstado = (estadoKey) => {
    setEstadosSeleccionados((prev) =>
      prev.includes(estadoKey)
        ? prev.filter((x) => x !== estadoKey)
        : [...prev, estadoKey]
    );
  };

  const limpiarEstados = () => setEstadosSeleccionados([]);

  const ventasFiltradas = useMemo(() => {
    const desde = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null;
    const hasta = fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : null;

    return ventas.filter((venta) => {
      const fechaVenta = toDateValue(venta.fecha);
      const estadoVenta = normalizeEstado(venta.estado);
      const campanaVenta = normalizeUpper(venta.campana);

      const cumpleDesde = !desde || (fechaVenta && fechaVenta >= desde);
      const cumpleHasta = !hasta || (fechaVenta && fechaVenta <= hasta);

      const cumpleCampana =
        campanaFiltro === "TODAS" ? true : campanaVenta === campanaFiltro;

      const cumpleEstado =
        estadosSeleccionados.length === 0
          ? true
          : estadosSeleccionados.includes(estadoVenta);

      return cumpleDesde && cumpleHasta && cumpleCampana && cumpleEstado;
    });
  }, [ventas, fechaDesde, fechaHasta, campanaFiltro, estadosSeleccionados]);

  const resumen = useMemo(() => {
    const total = ventasFiltradas.length;
    const favorables = ventasFiltradas.filter((v) =>
      FAVORABLES_SET.has(normalizeEstado(v.estado))
    ).length;
    const pendientes = ventasFiltradas.filter((v) =>
      PENDIENTES_SET.has(normalizeEstado(v.estado))
    ).length;
    const noFavorables = ventasFiltradas.filter((v) =>
      NO_FAVORABLES_SET.has(normalizeEstado(v.estado))
    ).length;
    const cierre = total > 0 ? (favorables / total) * 100 : 0;

    const porEstado = {};
    ESTADOS_CONFIG.forEach((estado) => {
      porEstado[estado.key] = ventasFiltradas.filter(
        (v) => normalizeEstado(v.estado) === estado.key
      ).length;
    });

    return {
      total,
      favorables,
      pendientes,
      noFavorables,
      cierre,
      porEstado,
    };
  }, [ventasFiltradas]);

  const rankingCampañas = useMemo(() => {
    const counts = {};

    ventasFiltradas.forEach((venta) => {
      const key = normalizeUpper(venta.campana) || "SIN CAMPAÑA";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [ventasFiltradas]);

  const rankingComerciales = useMemo(() => {
    const counts = {};

    ventasFiltradas.forEach((venta) => {
      const key = normalizeUpper(venta.comercial) || "SIN COMERCIAL";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [ventasFiltradas]);

  const ultimasVentas = useMemo(() => {
    return [...ventasFiltradas]
      .sort((a, b) => {
        const da = `${a.fecha || ""} ${a.hora || ""}`;
        const db = `${b.fecha || ""} ${b.hora || ""}`;
        return db.localeCompare(da);
      })
      .slice(0, 8);
  }, [ventasFiltradas]);

  const exportarExcel = () => {
    const data = ventasFiltradas.map((venta) =>
      toUpperExportRow({
        FECHA: venta.fecha || "",
        HORA: venta.hora || "",
        CLIENTE: venta.cliente || "",
        DOCUMENTO: venta.documento || "",
        TELEFONO: venta.telefono || "",
        CAMPANA: venta.campana || "",
        COMERCIAL: venta.comercial || "",
        COORDINADOR: venta.coordinador || "",
        SUPERVISOR: venta.supervisor || "",
        PRODUCTO: venta.producto || "",
        ESTADO: venta.estado || "",
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "REPORTES");
    XLSX.writeFile(workbook, "REPORTE_VENTAS_CRM.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(16);
    doc.text("REPORTE DE VENTAS CRM", 14, 14);

    doc.setFontSize(10);
    doc.text(`USUARIO: ${normalizeUpper(currentUser?.nombre || "-")}`, 14, 22);
    doc.text(`ROL: ${normalizeUpper(currentUser?.rol || "-")}`, 14, 28);
    doc.text(`CAMPAÑA FILTRO: ${campanaFiltro}`, 14, 34);
    doc.text(
      `ESTADOS: ${estadosSeleccionados.length ? estadosSeleccionados.join(", ") : "TODOS"}`,
      14,
      40
    );

    autoTable(doc, {
      startY: 48,
      head: [["INDICADOR", "VALOR"]],
      body: [
        ["TOTAL VENTAS", resumen.total],
        ["FAVORABLES", resumen.favorables],
        ["PENDIENTES", resumen.pendientes],
        ["NO FAVORABLES", resumen.noFavorables],
        ["TASA DE CIERRE", formatPercent(resumen.cierre)],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["FECHA", "HORA", "CLIENTE", "CAMPAÑA", "COMERCIAL", "ESTADO"]],
      body: ventasFiltradas.map((venta) => [
        normalizeUpper(venta.fecha || ""),
        normalizeUpper(venta.hora || ""),
        normalizeUpper(venta.cliente || ""),
        normalizeUpper(venta.campana || ""),
        normalizeUpper(venta.comercial || ""),
        normalizeUpper(venta.estado || ""),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [67, 56, 202] },
    });

    doc.save("REPORTE_VENTAS_CRM.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">REPORTES</p>
        <h2 className="crm-title mt-1 text-2xl">ANÁLISIS Y RENDIMIENTO</h2>
        <p className="crm-muted mt-2 text-sm">
          FILTRA VARIOS ESTADOS A LA VEZ, TODO EN MAYÚSCULA Y CON REPORTE MÁS VISUAL.
        </p>
      </div>

      <div className="crm-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[180px_180px_220px_auto_auto]">
          <div>
            <label className="crm-label mb-2 block">DESDE</label>
            <div className="crm-input flex items-center gap-2 px-4 py-3">
              <CalendarRange className="h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full bg-transparent outline-none"
                style={{ color: "inherit" }}
              />
            </div>
          </div>

          <div>
            <label className="crm-label mb-2 block">HASTA</label>
            <div className="crm-input flex items-center gap-2 px-4 py-3">
              <CalendarRange className="h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full bg-transparent outline-none"
                style={{ color: "inherit" }}
              />
            </div>
          </div>

          <div>
            <label className="crm-label mb-2 block">CAMPAÑA</label>
            <div className="crm-input flex items-center gap-2 px-4 py-3">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={campanaFiltro}
                onChange={(e) => setCampanaFiltro(e.target.value)}
                className="w-full bg-transparent outline-none"
                style={{ color: "inherit" }}
              >
                {campañasDisponibles.map((campaña) => (
                  <option key={campaña} className="text-black">
                    {campaña}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={exportarExcel}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-300"
          >
            <FileSpreadsheet className="h-4 w-4" />
            EXCEL
          </button>

          <button
            onClick={exportarPDF}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-rose-300"
          >
            <FileText className="h-4 w-4" />
            PDF
          </button>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="crm-label">ESTADOS</label>
            <button
              onClick={limpiarEstados}
              className="rounded-xl border border-slate-300 bg-slate-200 px-3 py-2 text-xs font-medium text-slate-900 hover:bg-slate-300"
            >
              VER TODOS
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
            {ESTADOS_CONFIG.map((item) => {
              const active = estadosSeleccionados.includes(item.key);

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleEstado(item.key)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? item.color
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm font-medium" style={{ color: "inherit" }}>
                    {item.key}
                  </span>

                  {active ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4 opacity-60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={CircleDollarSign}
          title="VENTAS"
          value={resumen.total}
          subtitle="TOTAL FILTRADO"
          iconColor="text-cyan-500"
        />
        <StatCard
          icon={CheckCircle2}
          title="FAVORABLES"
          value={resumen.favorables}
          subtitle="VALIDADO / ACTIVOS / FINALIZADO"
          iconColor="text-emerald-500"
        />
        <StatCard
          icon={Clock3}
          title="PENDIENTES"
          value={resumen.pendientes}
          subtitle="REQUIEREN GESTIÓN"
          iconColor="text-amber-500"
        />
        <StatCard
          icon={XCircle}
          title="NO FAVORABLES"
          value={resumen.noFavorables}
          subtitle="CANCELADAS / FALLIDAS / OTRAS"
          iconColor="text-rose-500"
        />
        <StatCard
          icon={TrendingUp}
          title="CIERRE"
          value={formatPercent(resumen.cierre)}
          subtitle="SOBRE VENTAS FILTRADAS"
          iconColor="text-fuchsia-500"
        />
      </div>

      <div className="crm-panel p-5">
        <div className="mb-4 flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-cyan-500" />
          <h3 className="crm-heading text-lg">RESUMEN POR ESTADO</h3>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {ESTADOS_CONFIG.map((item) => (
            <div key={item.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${item.color}`}>
                {item.key}
              </span>
              <p className="mt-3 text-2xl font-bold" style={{ color: "inherit" }}>
                {resumen.porEstado[item.key] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        <RankingBlock
          title="TOP CAMPAÑAS"
          rows={rankingCampañas}
          valueLabel="VENTAS"
          gradients={[
            "from-cyan-400 to-sky-500",
            "from-violet-400 to-fuchsia-500",
            "from-emerald-400 to-teal-500",
            "from-amber-400 to-orange-500",
            "from-pink-400 to-rose-500",
          ]}
        />

        <RankingBlock
          title="TOP COMERCIALES"
          rows={rankingComerciales}
          valueLabel="VENTAS"
          gradients={[
            "from-emerald-400 to-teal-500",
            "from-cyan-400 to-sky-500",
            "from-violet-400 to-fuchsia-500",
            "from-amber-400 to-orange-500",
            "from-pink-400 to-rose-500",
          ]}
        />

        <div className="crm-panel p-5">
          <div className="mb-4 flex items-center gap-3">
            <BriefcaseBusiness className="h-5 w-5 text-amber-500" />
            <h3 className="crm-heading text-lg">LECTURA RÁPIDA</h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm leading-7" style={{ color: "inherit", opacity: 0.82 }}>
                CAMPAÑA: {campanaFiltro}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm leading-7" style={{ color: "inherit", opacity: 0.82 }}>
                ESTADOS: {estadosSeleccionados.length ? estadosSeleccionados.join(", ") : "TODOS"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm leading-7" style={{ color: "inherit", opacity: 0.82 }}>
                USUARIO: {normalizeUpper(currentUser?.nombre || "-")} · {normalizeUpper(currentUser?.rol || "-")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="crm-panel p-5">
        <h3 className="crm-heading text-lg">ÚLTIMAS VENTAS DEL FILTRO</h3>

        <div className="mt-4 space-y-3">
          {ultimasVentas.length > 0 ? (
            ultimasVentas.map((venta) => (
              <div
                key={venta.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold" style={{ color: "inherit" }}>
                    {normalizeUpper(venta.cliente || "CLIENTE SIN NOMBRE")}
                  </p>
                  <p className="crm-muted text-sm">
                    {normalizeUpper(venta.campana || "-")} · {normalizeUpper(venta.comercial || "-")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5"
                    style={{ color: "inherit" }}
                  >
                    {normalizeUpper(venta.fecha || "-")} {normalizeUpper(venta.hora || "")}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-2 text-xs font-medium ${estadoBadge(
                      venta.estado
                    )}`}
                  >
                    {normalizeUpper(venta.estado || "-")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="crm-muted">NO HAY VENTAS CON ESOS FILTROS.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
