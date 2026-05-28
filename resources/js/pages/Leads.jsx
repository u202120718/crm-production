
import { useMemo, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Phone,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  CheckCircle2,
  Eye,
} from "lucide-react";

function estadoBadge(estado) {
  if (estado === "Pendiente") {
    return "border-amber-700/40 bg-amber-100 text-amber-800";
  }
  if (estado === "Contactado") {
    return "border-cyan-700/40 bg-cyan-100 text-cyan-800";
  }
  if (estado === "Rellamada") {
    return "border-violet-700/40 bg-violet-100 text-violet-800";
  }
  if (estado === "Cerrado") {
    return "border-emerald-700/40 bg-emerald-100 text-emerald-800";
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

export default function Leads({ leads = [], campaigns = [] }) {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [campanaFiltro, setCampanaFiltro] = useState("Todas");
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || null);

  const campañasDisponibles = useMemo(() => {
    return ["Todas", ...new Set(campaigns.map((c) => c.nombre).filter(Boolean))];
  }, [campaigns]);

  const provinciasDisponibles = useMemo(() => {
    return [...new Set(leads.map((l) => l.provincia).filter(Boolean))];
  }, [leads]);

  const leadsFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const coincideBusqueda =
        !q ||
        [lead.nombre, lead.telefono, lead.campana, lead.estado, lead.provincia]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const coincideEstado =
        estadoFiltro === "Todos" ? true : lead.estado === estadoFiltro;

      const coincideCampaña =
        campanaFiltro === "Todas" ? true : lead.campana === campanaFiltro;

      return coincideBusqueda && coincideEstado && coincideCampaña;
    });
  }, [leads, search, estadoFiltro, campanaFiltro]);

  const selectedLead =
    leads.find((lead) => lead.id === selectedLeadId) || leadsFiltrados[0] || null;

  const resumen = useMemo(() => {
    return {
      total: leadsFiltrados.length,
      pendientes: leadsFiltrados.filter((l) => l.estado === "Pendiente").length,
      contactados: leadsFiltrados.filter((l) => l.estado === "Contactado").length,
      rellamadas: leadsFiltrados.filter((l) => l.estado === "Rellamada").length,
    };
  }, [leadsFiltrados]);

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Leads</p>
        <h2 className="crm-title mt-1 text-2xl">Gestión de leads</h2>
        <p className="crm-muted mt-2 text-sm">
          Revisa, filtra y consulta los leads visibles según tu acceso.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total leads"
          value={resumen.total}
          subtitle="Leads visibles"
          iconColor="text-cyan-500"
        />
        <StatCard
          icon={Clock3}
          title="Pendientes"
          value={resumen.pendientes}
          subtitle="Sin trabajar"
          iconColor="text-amber-500"
        />
        <StatCard
          icon={CheckCircle2}
          title="Contactados"
          value={resumen.contactados}
          subtitle="Ya gestionados"
          iconColor="text-emerald-500"
        />
        <StatCard
          icon={Phone}
          title="Rellamadas"
          value={resumen.rellamadas}
          subtitle="Seguimiento pendiente"
          iconColor="text-violet-500"
        />
      </div>

      <div className="crm-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_220px_220px]">
          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
              style={{ color: "inherit" }}
              placeholder="Buscar por nombre, teléfono, campaña o provincia"
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
              <option className="text-black">Contactado</option>
              <option className="text-black">Rellamada</option>
              <option className="text-black">Cerrado</option>
            </select>
          </div>

          <div className="crm-input px-4 py-3">
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
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">Listado de leads</h3>

          <div className="mt-4 space-y-3">
            {leadsFiltrados.length > 0 ? (
              leadsFiltrados.map((lead) => {
                const active = selectedLead?.id === lead.id;

                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-slate-400 bg-slate-200/80 dark:border-white/20 dark:bg-slate-900"
                        : "crm-panel-soft hover:opacity-90"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="crm-heading">{lead.nombre}</p>
                        <p className="crm-muted text-sm">
                          {lead.telefono} · {lead.provincia || "Sin provincia"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs dark:border-white/10 dark:bg-white/5"
                          style={{ color: "inherit" }}
                        >
                          {lead.campana || "-"}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-2 text-xs font-medium ${estadoBadge(
                            lead.estado
                          )}`}
                        >
                          {lead.estado}
                        </span>

                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs dark:border-white/10 dark:bg-white/5"
                          style={{ color: "inherit" }}
                        >
                          <Eye className="h-3 w-3" />
                          Ver
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="crm-panel-soft p-4">
                <p className="crm-muted">No hay leads para mostrar.</p>
              </div>
            )}
          </div>
        </div>

        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">Detalle del lead</h3>

          {selectedLead ? (
            <div className="mt-4 space-y-4">
              <div className="crm-panel-soft p-4">
                <p className="crm-label">Nombre</p>
                <p className="mt-1 text-lg font-bold" style={{ color: "inherit" }}>
                  {selectedLead.nombre}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="crm-panel-soft p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-cyan-500" />
                    <p className="crm-label">Teléfono</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                    {selectedLead.telefono || "-"}
                  </p>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-amber-500" />
                    <p className="crm-label">Campaña</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                    {selectedLead.campana || "-"}
                  </p>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-fuchsia-500" />
                    <p className="crm-label">Provincia</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                    {selectedLead.provincia || "-"}
                  </p>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-violet-500" />
                    <p className="crm-label">Estado</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-2 text-xs font-medium ${estadoBadge(
                      selectedLead.estado
                    )}`}
                  >
                    {selectedLead.estado || "-"}
                  </span>
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label mb-3">Resumen de provincias visibles</p>
                <div className="flex flex-wrap gap-2">
                  {provinciasDisponibles.length > 0 ? (
                    provinciasDisponibles.map((provincia) => (
                      <span
                        key={provincia}
                        className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5"
                        style={{ color: "inherit" }}
                      >
                        {provincia}
                      </span>
                    ))
                  ) : (
                    <p className="crm-muted">No hay provincias disponibles.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="crm-panel-soft mt-4 p-4">
              <p className="crm-muted">Selecciona un lead para ver el detalle.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
