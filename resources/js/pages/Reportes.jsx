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
  Calculator,
  WalletCards,
  ReceiptText,
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
  const tone =
    iconColor?.includes("emerald") ? "green" :
    iconColor?.includes("amber") ? "amber" :
    iconColor?.includes("rose") ? "rose" :
    iconColor?.includes("fuchsia") ? "purple" :
    "blue";

  return (
    <div className={`report-stat-card ${tone}`}>
      <div className="report-stat-head">
        <span className="report-stat-icon">
          <Icon className="h-5 w-5" />
        </span>
        <p>{title}</p>
      </div>
      <strong>{value}</strong>
      <span>{subtitle}</span>
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

function getFicha(venta) {
  if (!venta?.ficha) return {};
  if (typeof venta.ficha === "object") return venta.ficha;
  try { return JSON.parse(venta.ficha); } catch { return {}; }
}

function getProductText(venta) {
  const ficha = getFicha(venta);
  return normalizeUpper([
    venta?.producto, ficha?.producto, ficha?.productos, ficha?.oferta,
    ficha?.ofertas, ficha?.resumenOferta, ficha?.resumen_oferta,
    ficha?.moviles, ficha?.lineas
  ].flat(Infinity).filter(Boolean).map(x => typeof x === "object" ? JSON.stringify(x) : String(x)).join(" "));
}

function isConvergente(venta) {
  const t = getProductText(venta);
  return /FIBRA|600\s*MB|1\s*GB|NEBA/.test(t) &&
         /MOVIL|MÓVIL|30\s*GB|60\s*GB|160\s*GB|ILIMITAD/.test(t);
}

function money(v) {
  return Number(v || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  const [mostrarComisiones, setMostrarComisiones] = useState(false);
  const [soloConvergentes, setSoloConvergentes] = useState(false);
  const [tarifas, setTarifas] = useState({
    "ACTIVO TOTAL": 0,
    "ACTIVO PARCIAL": 0,
    "FINALIZADO": 0,
    "VALIDADO PERU": 0,
  });

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

  const ventasLiquidables = useMemo(() => ventasFiltradas.filter((v) => {
    const estado = normalizeEstado(v.estado);
    if (!Object.prototype.hasOwnProperty.call(tarifas, estado)) return false;
    return !soloConvergentes || isConvergente(v);
  }), [ventasFiltradas, tarifas, soloConvergentes]);

  const planilla = useMemo(() => {
    const grupos = {};
    ventasLiquidables.forEach((v) => {
      const comercial = normalizeUpper(v.comercial) || "SIN COMERCIAL";
      const estado = normalizeEstado(v.estado);
      const comision = Number(tarifas[estado] || 0);
      if (!grupos[comercial]) grupos[comercial] = { comercial, ventas: 0, convergentes: 0, comision: 0, detalle: [] };
      grupos[comercial].ventas++;
      if (isConvergente(v)) grupos[comercial].convergentes++;
      grupos[comercial].comision += comision;
      grupos[comercial].detalle.push({ ...v, tipo: isConvergente(v) ? "CONVERGENTE" : "NO CONVERGENTE", comision });
    });
    return Object.values(grupos).sort((a,b) => b.comision-a.comision);
  }, [ventasLiquidables, tarifas]);

  const totalComisiones = useMemo(() => planilla.reduce((a,x) => a+x.comision,0), [planilla]);

  const exportarPlanillaExcel = () => {
    const resumen = planilla.map(x => ({
      COMERCIAL:x.comercial, VENTAS_LIQUIDABLES:x.ventas, CONVERGENTES:x.convergentes,
      COMISION_TOTAL:Number(x.comision.toFixed(2))
    }));
    const detalle = planilla.flatMap(x => x.detalle.map(v => toUpperExportRow({
      COMERCIAL:x.comercial, FECHA:v.fecha||"", CLIENTE:v.cliente||"", DOCUMENTO:v.documento||"",
      TELEFONO:v.telefono||"", CAMPANA:v.campana||"", PRODUCTO:v.producto||"", ESTADO:v.estado||"",
      TIPO:v.tipo, COMISION:Number(v.comision.toFixed(2)), FICHA_COMPLETA:JSON.stringify(getFicha(v))
    })));
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(resumen),"PLANILLA");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(detalle),"DETALLE");
    XLSX.writeFile(wb,"PLANILLA_COMISIONES_CRM.xlsx");
  };

  const exportarPlanillaPDF = () => {
    const doc=new jsPDF("p","mm","a4");
    doc.setFontSize(16); doc.text("PLANILLA DE COMISIONES",14,15);
    doc.setFontSize(9);
    doc.text(`CAMPAÑA: ${campanaFiltro}`,14,22);
    doc.text(`PERIODO: ${fechaDesde||"INICIO"} - ${fechaHasta||"HOY"}`,14,27);
    doc.text(`FILTRO: ${soloConvergentes?"SOLO CONVERGENTES":"TODAS LAS LIQUIDABLES"}`,14,32);
    autoTable(doc,{startY:38,head:[["COMERCIAL","VENTAS","CONVERGENTES","COMISIÓN"]],
      body:planilla.map(x=>[x.comercial,x.ventas,x.convergentes,`€ ${money(x.comision)}`]),
      styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[30,41,59]}});
    doc.setFontSize(11); doc.text(`TOTAL COMISIONES: € ${money(totalComisiones)}`,14,(doc.lastAutoTable?.finalY||38)+8);
    doc.save("PLANILLA_COMISIONES_CRM.pdf");
  };

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
        TIPO_VENTA: isConvergente(venta) ? "CONVERGENTE" : "NO CONVERGENTE",
        FICHA_COMPLETA: JSON.stringify(getFicha(venta)),
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
    <div className="reportes-pro space-y-6">
      <div className="report-hero">
        <div>
          <p className="report-eyebrow">REPORTES · LIQUIDACIONES</p>
          <h2>ANÁLISIS, COMISIONES Y PLANILLA COMERCIAL</h2>
          <p>
            Controla ventas, estados, convergentes y liquidaciones desde un único panel.
          </p>
        </div>
        <div className="report-hero-badge">
          <WalletCards className="h-5 w-5" />
          <span>CONTROL DE COMISIONES</span>
        </div>
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

      <div className="report-commission-panel">
        <div className="report-commission-head">
          <div>
            <div className="report-commission-title">
              <span className="report-commission-icon"><Calculator className="h-5 w-5" /></span>
              <h3>COMISIONES Y PLANILLA COMERCIAL</h3>
            </div>
            <p className="crm-muted mt-1 text-sm">Calcula pagos por comercial sobre las ventas filtradas y permite separar convergentes.</p>
          </div>
          <button type="button" onClick={() => setMostrarComisiones(v=>!v)}
            className="report-primary-btn">
            <WalletCards className="h-4 w-4" />{mostrarComisiones?"OCULTAR PLANILLA":"CALCULAR COMISIONES"}
          </button>
        </div>

        {mostrarComisiones && <div className="mt-5 space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Object.keys(tarifas).map(estado => <label key={estado} className="report-rate-card">
              <span className="crm-label block">{estado}</span>
              <div className="mt-2 flex items-center gap-2"><span className="font-bold">€</span>
                <input type="number" min="0" step="0.01" value={tarifas[estado]}
                  onChange={e=>setTarifas(p=>({...p,[estado]:Number(e.target.value||0)}))}
                  className="crm-input w-full px-3 py-2 outline-none" />
              </div>
            </label>)}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={()=>setSoloConvergentes(v=>!v)}
              className={`rounded-2xl border px-4 py-3 text-sm font-bold ${soloConvergentes?"bg-emerald-200 text-slate-900":"bg-slate-100 text-slate-900"}`}>
              {soloConvergentes?"✓ ":""}SOLO CONVERGENTES
            </button>
            <div className="report-summary-pill"><span className="crm-muted text-xs">LIQUIDABLES</span><strong className="ml-3">{ventasLiquidables.length}</strong></div>
            <div className="report-summary-pill"><span className="crm-muted text-xs">TOTAL</span><strong className="ml-3">€ {money(totalComisiones)}</strong></div>
            <button onClick={exportarPlanillaExcel} className="report-export-btn excel"><FileSpreadsheet className="h-4 w-4"/>PLANILLA EXCEL</button>
            <button onClick={exportarPlanillaPDF} className="report-export-btn pdf"><ReceiptText className="h-4 w-4"/>PLANILLA PDF</button>
          </div>

          <div className="report-payroll-table-wrap">
            <table className="report-payroll-table w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-900 text-white"><tr><th className="px-4 py-3">COMERCIAL</th><th className="px-4 py-3">LIQUIDABLES</th><th className="px-4 py-3">CONVERGENTES</th><th className="px-4 py-3">COMISIÓN</th></tr></thead>
              <tbody>{planilla.length ? planilla.map(x=><tr key={x.comercial} className="border-t border-slate-300/50"><td className="px-4 py-3 font-semibold">{x.comercial}</td><td className="px-4 py-3">{x.ventas}</td><td className="px-4 py-3">{x.convergentes}</td><td className="px-4 py-3 font-bold">€ {money(x.comision)}</td></tr>) : <tr><td colSpan="4" className="px-4 py-6 text-center crm-muted">NO HAY VENTAS LIQUIDABLES.</td></tr>}</tbody>
            </table>
          </div>
        </div>}
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

      <style>{`
        .reportes-pro {
          --rp-bg: #f4f7fb;
          --rp-panel: #ffffff;
          --rp-soft: #f8fafc;
          --rp-border: #d7e0ea;
          --rp-title: #0f172a;
          --rp-text: #1f2937;
          --rp-muted: #64748b;
          --rp-dark: #0f172a;
          --rp-shadow: 0 4px 14px rgba(15,23,42,.07);
          color: var(--rp-text);
        }

        .reportes-pro *,
        .reportes-pro *::before,
        .reportes-pro *::after {
          box-sizing: border-box;
          animation: none !important;
          transition: none !important;
          filter: none !important;
          backdrop-filter: none !important;
        }

        .reportes-pro button:hover,
        .reportes-pro [role="button"]:hover {
          transform: none !important;
          filter: none !important;
        }

        .reportes-pro {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .report-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 20px 22px;
          border: 1px solid var(--rp-border);
          border-radius: 20px;
          background: linear-gradient(135deg,#0f172a,#1e293b);
          color: #fff;
          box-shadow: var(--rp-shadow);
        }

        .report-eyebrow {
          margin: 0;
          color: #67e8f9;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .18em;
        }

        .report-hero h2 {
          margin: 5px 0 0;
          font-size: 22px;
          font-weight: 950;
          letter-spacing: -.02em;
        }

        .report-hero p:not(.report-eyebrow) {
          margin: 6px 0 0;
          color: #cbd5e1;
          font-size: 12px;
        }

        .report-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex: none;
          padding: 10px 13px;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 13px;
          background: rgba(255,255,255,.08);
          color: #f8fafc;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .06em;
        }

        .report-stat-card {
          min-height: 120px;
          padding: 17px;
          border-radius: 18px;
          color: #fff;
          box-shadow: none;
        }

        .report-stat-card.blue { background: #1d4ed8; }
        .report-stat-card.green { background: #047857; }
        .report-stat-card.amber { background: #b45309; }
        .report-stat-card.rose { background: #be123c; }
        .report-stat-card.purple { background: #7e22ce; }

        .report-stat-head {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .report-stat-icon {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255,255,255,.14);
        }

        .report-stat-head p {
          margin: 0;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .10em;
        }

        .report-stat-card strong {
          display: block;
          margin-top: 10px;
          font-size: 25px;
          line-height: 1;
        }

        .report-stat-card > span {
          display: block;
          margin-top: 8px;
          color: rgba(255,255,255,.82);
          font-size: 9px;
          font-weight: 700;
        }

        .report-commission-panel {
          padding: 18px;
          border: 1px solid var(--rp-border);
          border-radius: 20px;
          background: var(--rp-panel);
          box-shadow: var(--rp-shadow);
        }

        .report-commission-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .report-commission-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .report-commission-icon {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #dcfce7;
          color: #047857;
        }

        .report-commission-title h3 {
          margin: 0;
          color: var(--rp-title);
          font-size: 16px;
          font-weight: 950;
        }

        .report-primary-btn {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 12px;
          background: #0f172a;
          color: #fff;
          padding: 0 16px;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .report-rate-card {
          display: block;
          padding: 14px;
          border: 1px solid var(--rp-border);
          border-radius: 15px;
          background: var(--rp-soft);
        }

        .report-summary-pill {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--rp-border);
          border-radius: 12px;
          padding: 0 13px;
          background: var(--rp-soft);
        }

        .report-export-btn {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 0;
          border-radius: 12px;
          padding: 0 14px;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .report-export-btn.excel {
          background: #059669;
          color: #fff;
        }

        .report-export-btn.pdf {
          background: #e11d48;
          color: #fff;
        }

        .report-payroll-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--rp-border);
          border-radius: 15px;
          background: var(--rp-panel);
        }

        .report-payroll-table thead {
          background: #0f172a !important;
          color: #fff;
        }

        .report-payroll-table th,
        .report-payroll-table td {
          padding: 11px 13px !important;
        }

        .report-payroll-table tbody tr {
          border-top: 1px solid var(--rp-border);
        }

        .reportes-pro .crm-panel {
          box-shadow: none !important;
          border-color: var(--rp-border) !important;
        }

        .reportes-pro .crm-label,
        .reportes-pro .crm-heading,
        .reportes-pro .crm-title {
          color: var(--rp-title) !important;
          opacity: 1 !important;
        }

        .reportes-pro .crm-muted {
          color: var(--rp-muted) !important;
          opacity: 1 !important;
        }

        [data-crm-theme="light"] .reportes-pro,
        [data-crm-theme="silver"] .reportes-pro {
          --rp-bg: #f4f7fb;
          --rp-panel: #ffffff;
          --rp-soft: #f8fafc;
          --rp-border: #d7e0ea;
          --rp-title: #0f172a;
          --rp-text: #1f2937;
          --rp-muted: #64748b;
        }

        [data-crm-theme="dark"] .reportes-pro,
        [data-crm-theme="night"] .reportes-pro {
          --rp-bg: #0b1220;
          --rp-panel: #111827;
          --rp-soft: #172033;
          --rp-border: #26334a;
          --rp-title: #f8fafc;
          --rp-text: #e5e7eb;
          --rp-muted: #94a3b8;
          --rp-shadow: none;
        }

        [data-crm-theme="neon"] .reportes-pro {
          --rp-bg: #090c18;
          --rp-panel: #111426;
          --rp-soft: #171b31;
          --rp-border: #323a5b;
          --rp-title: #ffffff;
          --rp-text: #edf2ff;
          --rp-muted: #aab6d3;
          --rp-shadow: none;
        }

        [data-crm-theme="dark"] .reportes-pro .crm-panel,
        [data-crm-theme="night"] .reportes-pro .crm-panel,
        [data-crm-theme="neon"] .reportes-pro .crm-panel,
        [data-crm-theme="dark"] .report-commission-panel,
        [data-crm-theme="night"] .report-commission-panel,
        [data-crm-theme="neon"] .report-commission-panel {
          background: var(--rp-panel) !important;
          color: var(--rp-text) !important;
        }

        [data-crm-theme="dark"] .reportes-pro input,
        [data-crm-theme="dark"] .reportes-pro select,
        [data-crm-theme="night"] .reportes-pro input,
        [data-crm-theme="night"] .reportes-pro select,
        [data-crm-theme="neon"] .reportes-pro input,
        [data-crm-theme="neon"] .reportes-pro select {
          color: #f8fafc !important;
          background: #111827 !important;
        }

        [data-crm-theme="dark"] .reportes-pro select option,
        [data-crm-theme="night"] .reportes-pro select option,
        [data-crm-theme="neon"] .reportes-pro select option {
          color: #0f172a;
          background: #fff;
        }

        @media (max-width: 900px) {
          .report-hero,
          .report-commission-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .report-hero-badge {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
