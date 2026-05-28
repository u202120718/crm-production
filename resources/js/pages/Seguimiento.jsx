
import { useMemo, useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Clock3,
  CheckCircle2,
  XCircle,
  PhoneCall,
  CircleDollarSign,
  UserRound,
  BriefcaseBusiness,
  Save,
} from "lucide-react";

function estadoBadge(estado) {
  if (estado === "Pendiente") {
    return "border-amber-700/40 bg-amber-100 text-amber-800";
  }
  if (estado === "Validación") {
    return "border-cyan-700/40 bg-cyan-100 text-cyan-800";
  }
  if (estado === "Tramitada") {
    return "border-emerald-700/40 bg-emerald-100 text-emerald-800";
  }
  if (estado === "Activada") {
    return "border-violet-700/40 bg-violet-100 text-violet-800";
  }
  if (estado === "Rechazada") {
    return "border-rose-700/40 bg-rose-100 text-rose-800";
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

export default function Seguimiento({ ventas = [], setVentas }) {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [selectedVentaId, setSelectedVentaId] = useState(ventas[0]?.id || null);

  const ventasSeguimiento = useMemo(() => {
    return ventas.filter((v) =>
      ["Pendiente", "Validación", "Tramitada", "Activada", "Rechazada"].includes(v.estado)
    );
  }, [ventas]);

  const itemsFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    return ventasSeguimiento.filter((venta) => {
      const coincideBusqueda =
        !q ||
        [
          venta.cliente,
          venta.telefono,
          venta.documento,
          venta.campana,
          venta.comercial,
          venta.coordinador,
          venta.supervisor,
          venta.estado,
          venta.producto,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const coincideEstado =
        estadoFiltro === "Todos" ? true : venta.estado === estadoFiltro;

      return coincideBusqueda && coincideEstado;
    });
  }, [ventasSeguimiento, search, estadoFiltro]);

  const selectedVenta =
    ventasSeguimiento.find((v) => v.id === selectedVentaId) || itemsFiltrados[0] || null;

  const resumen = useMemo(() => {
    return {
      total: ventasSeguimiento.length,
      pendientes: ventasSeguimiento.filter((v) => v.estado === "Pendiente").length,
      validacion: ventasSeguimiento.filter((v) => v.estado === "Validación").length,
      tramitadas: ventasSeguimiento.filter((v) => v.estado === "Tramitada").length,
      rechazadas: ventasSeguimiento.filter((v) => v.estado === "Rechazada").length,
    };
  }, [ventasSeguimiento]);

  const actualizarEstado = (nuevoEstado) => {
    if (!selectedVenta || !setVentas) return;

    setVentas((prev) =>
      prev.map((venta) =>
        venta.id === selectedVenta.id
          ? {
              ...venta,
              estado: nuevoEstado,
            }
          : venta
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Seguimiento</p>
        <h2 className="crm-title mt-1 text-2xl">Control y seguimiento</h2>
        <p className="crm-muted mt-2 text-sm">
          Revisa el avance de las operaciones y mueve estados de forma rápida.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={ClipboardList}
          title="En seguimiento"
          value={resumen.total}
          subtitle="Ventas visibles"
          iconColor="text-cyan-500"
        />
        <StatCard
          icon={Clock3}
          title="Pendientes"
          value={resumen.pendientes}
          subtitle="Requieren gestión"
          iconColor="text-amber-500"
        />
        <StatCard
          icon={PhoneCall}
          title="Validación"
          value={resumen.validacion}
          subtitle="En revisión"
          iconColor="text-cyan-500"
        />
        <StatCard
          icon={CheckCircle2}
          title="Tramitadas"
          value={resumen.tramitadas}
          subtitle="Ya avanzadas"
          iconColor="text-emerald-500"
        />
        <StatCard
          icon={XCircle}
          title="Rechazadas"
          value={resumen.rechazadas}
          subtitle="No avanzaron"
          iconColor="text-rose-500"
        />
      </div>

      <div className="crm-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_220px]">
          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
              style={{ color: "inherit" }}
              placeholder="Buscar por cliente, campaña, comercial, documento o estado"
            />
          </div>

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
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">Operaciones en seguimiento</h3>

          <div className="mt-4 space-y-3">
            {itemsFiltrados.length > 0 ? (
              itemsFiltrados.map((venta) => {
                const active = selectedVenta?.id === venta.id;

                return (
                  <button
                    key={venta.id}
                    onClick={() => setSelectedVentaId(venta.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-slate-400 bg-slate-200/80 dark:border-white/20 dark:bg-slate-900"
                        : "crm-panel-soft hover:opacity-90"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="crm-heading">{venta.cliente}</p>
                        <p className="crm-muted text-sm">
                          {venta.campana || "-"} · {venta.comercial || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {venta.fecha || "-"} · {venta.telefono || "-"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-2 text-xs font-medium ${estadoBadge(
                          venta.estado
                        )}`}
                      >
                        {venta.estado}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="crm-panel-soft p-4">
                <p className="crm-muted">No hay operaciones para mostrar.</p>
              </div>
            )}
          </div>
        </div>

        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">Detalle del seguimiento</h3>

          {selectedVenta ? (
            <div className="mt-4 space-y-4">
              <div className="crm-panel-soft p-4">
                <p className="crm-label">Cliente</p>
                <p className="mt-1 text-lg font-bold" style={{ color: "inherit" }}>
                  {selectedVenta.cliente}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="crm-panel-soft p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4 text-cyan-500" />
                    <p className="crm-label">Producto</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                    {selectedVenta.producto || "-"}
                  </p>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-amber-500" />
                    <p className="crm-label">Campaña</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                    {selectedVenta.campana || "-"}
                  </p>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-fuchsia-500" />
                    <p className="crm-label">Comercial</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                    {selectedVenta.comercial || "-"}
                  </p>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-violet-500" />
                    <p className="crm-label">Teléfono</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                    {selectedVenta.telefono || "-"}
                  </p>
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label mb-3">Estado actual</p>
                <span
                  className={`inline-flex rounded-full border px-3 py-2 text-xs font-medium ${estadoBadge(
                    selectedVenta.estado
                  )}`}
                >
                  {selectedVenta.estado}
                </span>
              </div>

              <div className="crm-panel-soft p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Save className="h-4 w-4 text-emerald-500" />
                  <p className="crm-label">Cambio rápido de estado</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["Pendiente", "Validación", "Tramitada", "Activada", "Rechazada"].map(
                    (estado) => (
                      <button
                        key={estado}
                        onClick={() => actualizarEstado(estado)}
                        className={`rounded-full border px-3 py-2 text-xs font-medium transition ${estadoBadge(
                          estado
                        )}`}
                      >
                        {estado}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="crm-panel-soft mt-4 p-4">
              <p className="crm-muted">Selecciona una operación para ver el detalle.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
