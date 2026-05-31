import { useEffect, useMemo, useState } from "react";
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
  Plus,
  Save,
  RefreshCcw,
  Trash2,
  Pencil,
} from "lucide-react";

const ESTADOS = ["Pendiente", "Contactado", "Rellamada", "Cerrado"];

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
    const message =
      data?.message ||
      data?.errors?.nombre?.[0] ||
      data?.errors?.telefono?.[0] ||
      data?.errors?.campana?.[0] ||
      data?.errors?.estado?.[0] ||
      data?.errors?.provincia?.[0] ||
      "No se pudo completar la solicitud.";
    throw new Error(message);
  }

  return data;
}

function normalizeLead(lead) {
  return {
    id: lead.id ?? null,
    nombre: lead.nombre ?? "",
    telefono: lead.telefono ?? "",
    campana: lead.campana ?? "",
    estado: lead.estado ?? "Pendiente",
    provincia: lead.provincia ?? "",
    observaciones: lead.observaciones ?? "",
  };
}

function buildEmptyLead() {
  return {
    id: null,
    nombre: "",
    telefono: "",
    campana: "",
    estado: "Pendiente",
    provincia: "",
    observaciones: "",
  };
}

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

export default function Leads({
  currentUser,
  leads = [],
  setLeads,
  campaigns = [],
}) {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [campanaFiltro, setCampanaFiltro] = useState("Todas");
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || null);
  const [mode, setMode] = useState(leads.length > 0 ? "detail" : "create");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(buildEmptyLead());

  const puedeGestionar =
    !!currentUser &&
    ["Gerente", "Admin", "Supervisor", "Backoffice"].includes(currentUser.rol);

  const campañasDisponibles = useMemo(() => {
    return ["Todas", ...new Set(campaigns.map((c) => c.nombre).filter(Boolean))];
  }, [campaigns]);

  const campañasFormulario = useMemo(() => {
    return [...new Set(campaigns.map((c) => c.nombre).filter(Boolean))];
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

  const limpiarMensajes = () => {
    setMessage("");
    setError("");
  };

  const cargarLeads = async () => {
    if (!setLeads) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const data = await apiFetch("/leads/list");
      const list = Array.isArray(data?.leads) ? data.leads.map(normalizeLead) : [];

      setLeads(list);

      if (list.length > 0) {
        setSelectedLeadId(list[0].id);
        setMode("detail");
      } else {
        setSelectedLeadId(null);
        setMode("create");
        setForm(buildEmptyLead());
      }
    } catch (err) {
      setError(err.message || "No se pudieron cargar los leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLeads();
  }, []);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!selectedLead) return;

    setForm({
      id: selectedLead.id,
      nombre: selectedLead.nombre || "",
      telefono: selectedLead.telefono || "",
      campana: selectedLead.campana || "",
      estado: selectedLead.estado || "Pendiente",
      provincia: selectedLead.provincia || "",
      observaciones: selectedLead.observaciones || "",
    });
  }, [selectedLeadId, selectedLead, mode]);

  const handleSeleccionarLead = (id) => {
    limpiarMensajes();
    setSelectedLeadId(id);
    setMode("detail");
  };

  const handleNuevoLead = () => {
    limpiarMensajes();
    setSelectedLeadId(null);
    setMode("create");
    setForm(buildEmptyLead());
  };

  const handleEditarLead = () => {
    if (!selectedLead) {
      setError("No hay un lead seleccionado.");
      return;
    }

    limpiarMensajes();
    setMode("edit");
    setForm({
      id: selectedLead.id,
      nombre: selectedLead.nombre || "",
      telefono: selectedLead.telefono || "",
      campana: selectedLead.campana || "",
      estado: selectedLead.estado || "Pendiente",
      provincia: selectedLead.provincia || "",
      observaciones: selectedLead.observaciones || "",
    });
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const guardarLead = async () => {
    limpiarMensajes();

    if (!puedeGestionar) {
      setError("No tienes permisos para gestionar leads.");
      return;
    }

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!form.telefono.trim()) {
      setError("El teléfono es obligatorio.");
      return;
    }

    if (mode !== "create" && !form.id) {
      setError("No hay un lead válido seleccionado.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        campana: form.campana.trim(),
        estado: form.estado,
        provincia: form.provincia.trim(),
        observaciones: form.observaciones.trim(),
      };

      let data;

      if (mode === "create") {
        data = await apiFetch("/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const nuevo = normalizeLead(data.lead || payload);

        setLeads?.((prev) => [nuevo, ...prev]);
        setSelectedLeadId(nuevo.id);
        setMode("detail");
        setMessage("Lead creado correctamente.");
        return;
      }

      data = await apiFetch(`/leads/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const actualizado = normalizeLead(data.lead || { ...payload, id: form.id });

      setLeads?.((prev) =>
        prev.map((l) => (l.id === actualizado.id ? { ...l, ...actualizado } : l))
      );
      setSelectedLeadId(actualizado.id);
      setMode("detail");
      setMessage("Lead actualizado correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo guardar el lead.");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoLead = async (lead, estado) => {
    limpiarMensajes();

    if (!lead?.id) {
      setError("No hay un lead válido seleccionado.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch(`/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });

      const actualizado = normalizeLead(data.lead || { ...lead, estado });

      setLeads?.((prev) =>
        prev.map((l) => (l.id === actualizado.id ? { ...l, ...actualizado } : l))
      );

      if (selectedLeadId === lead.id) {
        setForm((prev) => ({ ...prev, estado }));
      }

      setMessage("Estado del lead actualizado.");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado.");
    } finally {
      setLoading(false);
    }
  };

  const eliminarLead = async (lead) => {
    limpiarMensajes();

    if (!puedeGestionar) {
      setError("No tienes permisos para eliminar leads.");
      return;
    }

    if (!lead?.id) {
      setError("No hay un lead válido seleccionado.");
      return;
    }

    const ok = window.confirm(`¿Seguro que deseas eliminar a ${lead.nombre}?`);
    if (!ok) return;

    try {
      setLoading(true);

      await apiFetch(`/leads/${lead.id}`, {
        method: "DELETE",
      });

      setLeads?.((prev) => prev.filter((l) => l.id !== lead.id));
      setSelectedLeadId(null);
      setMode("create");
      setForm(buildEmptyLead());
      setMessage("Lead eliminado.");
    } catch (err) {
      setError(err.message || "No se pudo eliminar el lead.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    limpiarMensajes();

    if (mode === "edit" && selectedLead) {
      setForm({
        id: selectedLead.id,
        nombre: selectedLead.nombre || "",
        telefono: selectedLead.telefono || "",
        campana: selectedLead.campana || "",
        estado: selectedLead.estado || "Pendiente",
        provincia: selectedLead.provincia || "",
        observaciones: selectedLead.observaciones || "",
      });
      return;
    }

    setForm(buildEmptyLead());
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Leads</p>
        <h2 className="crm-title mt-1 text-2xl">Gestión de leads</h2>
        <p className="crm-muted mt-2 text-sm">
          Revisa, filtra y consulta los leads visibles según tu acceso.
        </p>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-100 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

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
        <div className="grid gap-4 xl:grid-cols-[1.2fr_220px_220px_auto_auto]">
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
              {ESTADOS.map((estado) => (
                <option key={estado} className="text-black">
                  {estado}
                </option>
              ))}
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

          <button
            onClick={cargarLeads}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recargar
          </button>

          {puedeGestionar ? (
            <button
              onClick={handleNuevoLead}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-cyan-300"
            >
              <Plus className="h-4 w-4" />
              Nuevo lead
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">Listado de leads</h3>

          <div className="mt-4 space-y-3">
            {leadsFiltrados.length > 0 ? (
              leadsFiltrados.map((lead) => {
                const active = selectedLead?.id === lead.id && mode !== "create";

                return (
                  <button
                    key={lead.id}
                    onClick={() => handleSeleccionarLead(lead.id)}
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
          <div className="flex items-center justify-between gap-3">
            <h3 className="crm-heading text-lg">
              {mode === "create"
                ? "Nuevo lead"
                : mode === "edit"
                ? "Editar lead"
                : "Detalle del lead"}
            </h3>

            {mode === "detail" && selectedLead && puedeGestionar ? (
              <button
                onClick={handleEditarLead}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>
            ) : null}
          </div>

          {mode === "create" || mode === "edit" ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="crm-label mb-2 block">Nombre</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Teléfono</label>
                  <input
                    value={form.telefono}
                    onChange={(e) => handleChange("telefono", e.target.value)}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Provincia</label>
                  <input
                    value={form.provincia}
                    onChange={(e) => handleChange("provincia", e.target.value)}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Campaña</label>
                  <select
                    value={form.campana}
                    onChange={(e) => handleChange("campana", e.target.value)}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  >
                    <option className="text-black" value="">
                      Sin campaña
                    </option>
                    {campañasFormulario.map((campaña) => (
                      <option key={campaña} className="text-black" value={campaña}>
                        {campaña}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="crm-label mb-2 block">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => handleChange("estado", e.target.value)}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} className="text-black">
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="crm-label mb-2 block">Observaciones</label>
                  <textarea
                    value={form.observaciones}
                    onChange={(e) => handleChange("observaciones", e.target.value)}
                    className="crm-input min-h-[110px] w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={guardarLead}
                  disabled={!puedeGestionar || loading}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${
                    puedeGestionar
                      ? "border-emerald-400/30 bg-emerald-200 text-slate-900 hover:bg-emerald-300"
                      : "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <Save className="h-4 w-4" />
                  {mode === "create" ? "Crear lead" : "Guardar cambios"}
                </button>

                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Restaurar
                </button>
              </div>
            </div>
          ) : selectedLead ? (
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
                <p className="crm-label mb-3">Cambio rápido de estado</p>
                <div className="flex flex-wrap gap-2">
                  {ESTADOS.map((estado) => (
                    <button
                      key={estado}
                      onClick={() => cambiarEstadoLead(selectedLead, estado)}
                      disabled={loading}
                      className={`rounded-full border px-4 py-2 text-sm font-medium ${estadoBadge(
                        estado
                      )} disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {estado}
                    </button>
                  ))}
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

              {selectedLead.observaciones ? (
                <div className="crm-panel-soft p-4">
                  <p className="crm-label mb-2">Observaciones</p>
                  <p className="text-sm" style={{ color: "inherit" }}>
                    {selectedLead.observaciones}
                  </p>
                </div>
              ) : null}

              {puedeGestionar ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => eliminarLead(selectedLead)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-950 bg-red-950 px-4 py-3 font-medium text-red-100 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              ) : null}
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
