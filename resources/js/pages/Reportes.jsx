
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
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function toDateValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "0.00%";
  return `${value.toFixed(2)}%`;
}

function estadoBadge(estado) {
  if (estado === "Tramitada") {
    return "border-emerald-700/40 bg-emerald-100 text-emerald-800";
  }
  if (estado === "Pendiente") {
    return "border-amber-700/40 bg-amber-100 text-amber-800";
  }
  if (estado === "Validación") {
    return "border-cyan-700/40 bg-cyan-100 text-cyan-800";
  }
  if (estado === "Rechazada") {
    return "border-rose-700/40 bg-rose-100 text-rose-800";
  }
  if (estado === "Activada") {
    return "border-violet-700/40 bg-violet-100 text-violet-800";
  }
  return "border-slate-400 bg-slate-100 text-slate-800";
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
                  {row.label}
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
            <p className="crm-muted">No hay datos para mostrar.</p>
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
  const [campanaFiltro, setCampanaFiltro] = useState("Todas");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  const campañasDisponibles = useMemo(() => {
    return ["Todas", ...new Set(campaigns.map((c) => c.nombre).filter(Boolean))];
  }, [campaigns]);

  const ventasFiltradas = useMemo(() => {
    const desde = toDateValue(fechaDesde);
    const hasta = toDateValue(fechaHasta);

    return ventas.filter((venta) => {
      const fechaVenta = toDateValue(venta.fecha);

      const cumpleDesde =
        !desde || (fechaVenta && fechaVenta >= new Date(desde.setHours(0, 0, 0, 0)));

      const cumpleHasta =
        !hasta || (fechaVenta && fechaVenta <= new Date(hasta.setHours(23, 59, 59, 999)));

      const cumpleCampana =
        campanaFiltro === "Todas" ? true : venta.campana === campanaFiltro;

      const cumpleEstado =
        estadoFiltro === "Todos" ? true : venta.estado === estadoFiltro;

      return cumpleDesde && cumpleHasta && cumpleCampana && cumpleEstado;
    });
  }, [ventas, fechaDesde, fechaHasta, campanaFiltro, estadoFiltro]);

  const resumen = useMemo(() => {
    const total = ventasFiltradas.length;
    const tramitadas = ventasFiltradas.filter((v) => v.estado === "Tramitada").length;
    const activadas = ventasFiltradas.filter((v) => v.estado === "Activada").length;
    const pendientes = ventasFiltradas.filter((v) => v.estado === "Pendiente").length;
    const rechazadas = ventasFiltradas.filter((v) => v.estado === "Rechazada").length;
    const validacion = ventasFiltradas.filter((v) => v.estado === "Validación").length;
    const cierre = total > 0 ? ((tramitadas + activadas) / total) * 100 : 0;

    return {
      total,
      tramitadas,
      activadas,
      pendientes,
      rechazadas,
      validacion,
      cierre,
    };
  }, [ventasFiltradas]);

  const rankingCampañas = useMemo(() => {
    const counts = {};

    ventasFiltradas.forEach((venta) => {
      const key = venta.campana || "Sin campaña";
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
      const key = venta.comercial || "Sin comercial";
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
    const data = ventasFiltradas.map((venta) => ({
      Fecha: venta.fecha || "",
      Hora: venta.hora || "",
      Cliente: venta.cliente || "",
      Documento: venta.documento || "",
      Telefono: venta.telefono || "",
      Campana: venta.campana || "",
      Comercial: venta.comercial || "",
      Coordinador: venta.coordinador || "",
      Supervisor: venta.supervisor || "",
      Producto: venta.producto || "",
      Estado: venta.estado || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reportes");
    XLSX.writeFile(workbook, "reporte_ventas_crm.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(16);
    doc.text("Reporte de ventas CRM", 14, 14);

    doc.setFontSize(10);
    doc.text(`Usuario: ${currentUser?.nombre || "-"}`, 14, 22);
    doc.text(`Rol: ${currentUser?.rol || "-"}`, 14, 28);
    doc.text(`Campaña filtro: ${campanaFiltro}`, 14, 34);
    doc.text(`Estado filtro: ${estadoFiltro}`, 14, 40);

    autoTable(doc, {
      startY: 48,
      head: [["Indicador", "Valor"]],
      body: [
        ["Total ventas", resumen.total],
        ["Tramitadas", resumen.tramitadas],
        ["Activadas", resumen.activadas],
        ["Pendientes", resumen.pendientes],
        ["Validación", resumen.validacion],
        ["Rechazadas", resumen.rechazadas],
        ["Tasa de cierre", formatPercent(resumen.cierre)],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [[
        "Fecha",
        "Hora",
        "Cliente",
        "Campaña",
        "Comercial",
        "Estado",
      ]],
      body: ventasFiltradas.map((venta) => [
        venta.fecha || "",
        venta.hora || "",
        venta.cliente || "",
        venta.campana || "",
        venta.comercial || "",
        venta.estado || "",
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [67, 56, 202] },
    });

    doc.save("reporte_ventas_crm.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Reportes</p>
        <h2 className="crm-title mt-1 text-2xl">Análisis y rendimiento</h2>
        <p className="crm-muted mt-2 text-sm">
          Filtra la operación y revisa indicadores clave, campañas y comerciales con mejor desempeño.
        </p>
      </div>

      <div className="crm-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[180px_180px_220px_220px_auto_auto]">
          <div>
            <label className="crm-label mb-2 block">Desde</label>
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
            <label className="crm-label mb-2 block">Hasta</label>
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
            <label className="crm-label mb-2 block">Campaña</label>
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

          <div>
            <label className="crm-label mb-2 block">Estado</label>
            <div className="crm-input flex items-center gap-2 px-4 py-3">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-full bg-transparent outline-none"
                style={{ color: "inherit" }}
              >
                <option className="text-black">Todos</option>
                <option className="text-black">Pendiente</option>
                <option className="text-black">Validación</option>
                <option className="text-black">Tramitada</option>
                <option className="text-black">Activada</option>
                <option className="text-black">Rechazada</option>
              </select>
            </div>
          </div>

          <button
            onClick={exportarExcel}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-300"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>

          <button
            onClick={exportarPDF}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-rose-300"
          >
            <FileText className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          icon={CircleDollarSign}
          title="Ventas"
          value={resumen.total}
          subtitle="Total filtrado"
          iconColor="text-cyan-500"
        />
        <StatCard
          icon={CheckCircle2}
          title="Tramitadas"
          value={resumen.tramitadas}
          subtitle="Operaciones avanzadas"
          iconColor="text-emerald-500"
        />
        <StatCard
          icon={CheckCircle2}
          title="Activadas"
          value={resumen.activadas}
          subtitle="Cierre final"
          iconColor="text-violet-500"
        />
        <StatCard
          icon={Clock3}
          title="Pendientes"
          value={resumen.pendientes}
          subtitle="Requieren gestión"
          iconColor="text-amber-500"
        />
        <StatCard
          icon={XCircle}
          title="Rechazadas"
          value={resumen.rechazadas}
          subtitle="No avanzadas"
          iconColor="text-rose-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Cierre"
          value={formatPercent(resumen.cierre)}
          subtitle="Sobre ventas filtradas"
          iconColor="text-fuchsia-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        <RankingBlock
          title="Top campañas"
          rows={rankingCampañas}
          valueLabel="ventas"
          gradients={[
            "from-cyan-400 to-sky-500",
            "from-violet-400 to-fuchsia-500",
            "from-emerald-400 to-teal-500",
            "from-amber-400 to-orange-500",
            "from-pink-400 to-rose-500",
          ]}
        />

        <RankingBlock
          title="Top comerciales"
          rows={rankingComerciales}
          valueLabel="ventas"
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
            <BarChart3 className="h-5 w-5 text-cyan-500" />
            <h3 className="crm-heading text-lg">Lectura rápida</h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-3">
                <BriefcaseBusiness className="h-5 w-5 text-amber-500" />
                <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                  Campañas
                </p>
              </div>
              <p className="text-sm leading-7" style={{ color: "inherit", opacity: 0.82 }}>
                {campanaFiltro === "Todas"
                  ? "Estás viendo el consolidado de todas las campañas visibles."
                  : `Estás analizando solo la campaña ${campanaFiltro}.`}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-3">
                <Users className="h-5 w-5 text-fuchsia-500" />
                <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                  Operativa
                </p>
              </div>
              <p className="text-sm leading-7" style={{ color: "inherit", opacity: 0.82 }}>
                Si el volumen pendiente sube y la tasa de cierre baja, conviene revisar seguimiento, argumentario o calidad del lead.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-3">
                <Filter className="h-5 w-5 text-emerald-500" />
                <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                  Filtros activos
                </p>
              </div>
              <p className="text-sm leading-7" style={{ color: "inherit", opacity: 0.82 }}>
                Desde: {fechaDesde || "-"} · Hasta: {fechaHasta || "-"} · Estado: {estadoFiltro}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="crm-panel p-5">
        <h3 className="crm-heading text-lg">Últimas ventas del filtro</h3>

        <div className="mt-4 space-y-3">
          {ultimasVentas.length > 0 ? (
            ultimasVentas.map((venta) => (
              <div
                key={venta.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold" style={{ color: "inherit" }}>
                    {venta.cliente || "Cliente sin nombre"}
                  </p>
                  <p className="crm-muted text-sm">
                    {venta.campana || "-"} · {venta.comercial || "-"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5"
                    style={{ color: "inherit" }}
                  >
                    {venta.fecha || "-"} {venta.hora || ""}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-2 text-xs font-medium ${estadoBadge(
                      venta.estado
                    )}`}
                  >
                    {venta.estado || "-"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="crm-muted">No hay ventas con esos filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
