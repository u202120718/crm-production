import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Search,
  Filter,
  Plus,
  Save,
  RefreshCcw,
  Trash2,
  CheckCircle2,
  PauseCircle,
  UserRound,
  Users,
  Target,
  Layers3,
} from "lucide-react";

const ESTADOS = ["Activa", "Pausada"];

function buildEmptyCampaign() {
  return {
    id: null,
    nombre: "",
    responsable: "",
    estado: "Activa",
    descripcion: "",
    canal: "",
    objetivo: "",
  };
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

export default function Campanas({
  currentUser,
  campaigns = [],
  setCampaigns,
  users = [],
}) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || null);
  const [mode, setMode] = useState("edit");
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(buildEmptyCampaign());

  const puedeGestionar = ["Gerente", "Admin"].includes(currentUser?.rol);

  const responsablesDisponibles = useMemo(() => {
    return users.filter(
      (u) =>
        u.estado === "Activo" &&
        ["Gerente", "Admin", "Supervisor"].includes(u.rol)
    );
  }, [users]);

  const campañasFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase();

    return campaigns.filter((campaña) => {
      const matchSearch =
        !q ||
        [
          campaña.nombre,
          campaña.responsable,
          campaña.estado,
          campaña.descripcion,
          campaña.canal,
          campaña.objetivo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchEstado =
        estadoFiltro === "Todos" ? true : campaña.estado === estadoFiltro;

      return matchSearch && matchEstado;
    });
  }, [campaigns, search, estadoFiltro]);

  const selectedCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campañasFiltradas[0] || null;

  useEffect(() => {
    if (mode !== "edit") return;
    if (!selectedCampaign) return;

    setForm({
      id: selectedCampaign.id,
      nombre: selectedCampaign.nombre || "",
      responsable: selectedCampaign.responsable || "",
      estado: selectedCampaign.estado || "Activa",
      descripcion: selectedCampaign.descripcion || "",
      canal: selectedCampaign.canal || "",
      objetivo: selectedCampaign.objetivo || "",
    });
  }, [selectedCampaignId, selectedCampaign, mode]);

  const usuariosRelacionados = useMemo(() => {
    if (!selectedCampaign?.nombre) return [];

    return users.filter((u) => {
      if (Array.isArray(u.allowedCampaigns) && u.allowedCampaigns.length > 0) {
        return u.allowedCampaigns.includes(selectedCampaign.nombre);
      }

      return u.campana === selectedCampaign.nombre;
    });
  }, [users, selectedCampaign]);

  const resumen = useMemo(() => {
    return {
      total: campaigns.length,
      activas: campaigns.filter((c) => c.estado === "Activa").length,
      pausadas: campaigns.filter((c) => c.estado === "Pausada").length,
      responsables: new Set(campaigns.map((c) => c.responsable).filter(Boolean)).size,
    };
  }, [campaigns]);

  const limpiarMensajes = () => {
    setMessage("");
    setError("");
  };

  const handleNuevaCampana = () => {
    limpiarMensajes();
    setMode("create");
    setSelectedCampaignId(null);
    setForm(buildEmptyCampaign());
  };

  const handleSeleccionarCampana = (campaignId) => {
    limpiarMensajes();
    setMode("edit");
    setSelectedCampaignId(campaignId);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const guardarCampana = () => {
    limpiarMensajes();

    if (!puedeGestionar) {
      setError("No tienes permisos para gestionar campañas.");
      return;
    }

    if (!form.nombre.trim()) {
      setError("El nombre de la campaña es obligatorio.");
      return;
    }

    const existeNombre = campaigns.some(
      (c) =>
        c.nombre?.trim().toLowerCase() === form.nombre.trim().toLowerCase() &&
        c.id !== form.id
    );

    if (existeNombre) {
      setError("Ya existe una campaña con ese nombre.");
      return;
    }

    const payload = {
      ...form,
      nombre: form.nombre.trim(),
      responsable: form.responsable.trim(),
      descripcion: form.descripcion.trim(),
      canal: form.canal.trim(),
      objetivo: form.objetivo.trim(),
    };

    if (mode === "create") {
      const nueva = {
        ...payload,
        id: Date.now(),
      };

      setCampaigns?.((prev) => [nueva, ...prev]);
      setSelectedCampaignId(nueva.id);
      setMode("edit");
      setMessage("Campaña creada correctamente.");
      return;
    }

    setCampaigns?.((prev) =>
      prev.map((c) => (c.id === payload.id ? payload : c))
    );
    setMessage("Campaña actualizada correctamente.");
  };

  const eliminarCampana = (id, nombre) => {
    limpiarMensajes();

    if (!puedeGestionar) {
      setError("No tienes permisos para eliminar campañas.");
      return;
    }

    const ok = window.confirm(`¿Seguro que deseas eliminar la campaña ${nombre}?`);
    if (!ok) return;

    setCampaigns?.((prev) => prev.filter((c) => c.id !== id));
    setSelectedCampaignId(null);
    setMode("create");
    setForm(buildEmptyCampaign());
    setMessage("Campaña eliminada.");
  };

  const toggleEstadoCampana = (campaign) => {
    limpiarMensajes();

    if (!puedeGestionar) {
      setError("No tienes permisos para cambiar el estado.");
      return;
    }

    const nextEstado = campaign.estado === "Activa" ? "Pausada" : "Activa";

    setCampaigns?.((prev) =>
      prev.map((c) =>
        c.id === campaign.id
          ? {
              ...c,
              estado: nextEstado,
            }
          : c
      )
    );

    if (selectedCampaignId === campaign.id) {
      setForm((prev) => ({ ...prev, estado: nextEstado }));
    }

    setMessage(`Campaña ${nextEstado === "Activa" ? "activada" : "pausada"}.`);
  };

  const resetForm = () => {
    limpiarMensajes();

    if (mode === "edit" && selectedCampaign) {
      setForm({
        id: selectedCampaign.id,
        nombre: selectedCampaign.nombre || "",
        responsable: selectedCampaign.responsable || "",
        estado: selectedCampaign.estado || "Activa",
        descripcion: selectedCampaign.descripcion || "",
        canal: selectedCampaign.canal || "",
        objetivo: selectedCampaign.objetivo || "",
      });
      return;
    }

    setForm(buildEmptyCampaign());
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <div className="flex items-start gap-3">
          <BriefcaseBusiness className="mt-1 h-5 w-5 text-cyan-500" />
          <div>
            <p className="crm-label">Campañas</p>
            <h2 className="crm-title mt-1 text-2xl">Gestión de campañas</h2>
            <p className="crm-muted mt-2 text-sm">
              Organiza campañas, responsables, estado y usuarios vinculados de forma más clara.
            </p>
          </div>
        </div>
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
          icon={BriefcaseBusiness}
          title="Campañas"
          value={resumen.total}
          subtitle="Total registradas"
          iconColor="text-cyan-500"
        />
        <StatCard
          icon={CheckCircle2}
          title="Activas"
          value={resumen.activas}
          subtitle="En operación"
          iconColor="text-emerald-500"
        />
        <StatCard
          icon={PauseCircle}
          title="Pausadas"
          value={resumen.pausadas}
          subtitle="Detenidas"
          iconColor="text-amber-500"
        />
        <StatCard
          icon={UserRound}
          title="Responsables"
          value={resumen.responsables}
          subtitle="Distintos líderes"
          iconColor="text-fuchsia-500"
        />
      </div>

      <div className="crm-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_220px_auto]">
          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
              style={{ color: "inherit" }}
              placeholder="Buscar por nombre, responsable, canal, objetivo o estado"
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

          <button
            onClick={handleNuevaCampana}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-cyan-300"
          >
            <Plus className="h-4 w-4" />
            Nueva campaña
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">Listado de campañas</h3>

          <div className="mt-4 space-y-3">
            {campañasFiltradas.length > 0 ? (
              campañasFiltradas.map((campaña) => {
                const active = selectedCampaign?.id === campaña.id && mode === "edit";

                return (
                  <button
                    key={campaña.id}
                    onClick={() => handleSeleccionarCampana(campaña.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-slate-400 bg-slate-200/80 dark:border-white/20 dark:bg-slate-900"
                        : "crm-panel-soft hover:opacity-90"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="crm-heading">{campaña.nombre || "-"}</p>
                        <p className="crm-muted text-sm">
                          {campaña.responsable || "Sin responsable"} · {campaña.canal || "Sin canal"}
                        </p>
                        <p className="mt-1 text-xs opacity-80">
                          {campaña.objetivo || "Sin objetivo definido"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-2 text-xs font-medium ${
                            campaña.estado === "Activa"
                              ? "border-emerald-700/40 bg-emerald-100 text-emerald-800"
                              : "border-amber-700/40 bg-amber-100 text-amber-800"
                          }`}
                        >
                          {campaña.estado}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="crm-panel-soft p-4">
                <p className="crm-muted">No hay campañas para mostrar.</p>
              </div>
            )}
          </div>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="crm-heading text-lg">
              {mode === "create" ? "Nueva campaña" : "Detalle de campaña"}
            </h3>
          </div>

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
                <label className="crm-label mb-2 block">Responsable</label>
                <select
                  value={form.responsable}
                  onChange={(e) => handleChange("responsable", e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                >
                  <option className="text-black" value="">
                    Sin responsable
                  </option>
                  {responsablesDisponibles.map((u) => (
                    <option key={u.id} className="text-black" value={u.nombre}>
                      {u.nombre}
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

              <div>
                <label className="crm-label mb-2 block">Canal</label>
                <input
                  value={form.canal}
                  onChange={(e) => handleChange("canal", e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                  placeholder="Televenta, presencial, online..."
                />
              </div>

              <div>
                <label className="crm-label mb-2 block">Objetivo</label>
                <input
                  value={form.objetivo}
                  onChange={(e) => handleChange("objetivo", e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                  placeholder="Captación, cierre, fidelización..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="crm-label mb-2 block">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  className="crm-input min-h-[110px] w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                />
              </div>
            </div>

            <div className="crm-panel-soft p-4">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-500" />
                <p className="crm-label">Usuarios vinculados a esta campaña</p>
              </div>

              {selectedCampaign ? (
                usuariosRelacionados.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {usuariosRelacionados.map((u) => (
                      <div
                        key={u.id}
                        className="rounded-2xl border border-slate-300 bg-slate-100 p-3 dark:border-white/10 dark:bg-white/5"
                      >
                        <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                          {u.nombre}
                        </p>
                        <p className="crm-muted text-xs mt-1">
                          {u.rol} · {u.estado}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="crm-muted">No hay usuarios vinculados a esta campaña.</p>
                )
              ) : (
                <p className="crm-muted">Selecciona o crea una campaña para ver usuarios vinculados.</p>
              )}
            </div>

            <div className="crm-panel-soft p-4">
              <div className="mb-3 flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-fuchsia-500" />
                <p className="crm-label">Resumen rápido</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-300 bg-slate-100 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="crm-label">Responsable</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "inherit" }}>
                    {form.responsable || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-300 bg-slate-100 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="crm-label">Estado</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "inherit" }}>
                    {form.estado || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-300 bg-slate-100 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="crm-label">Canal</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "inherit" }}>
                    {form.canal || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-300 bg-slate-100 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="crm-label">Objetivo</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "inherit" }}>
                    {form.objetivo || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={guardarCampana}
                disabled={!puedeGestionar}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${
                  puedeGestionar
                    ? "border-emerald-400/30 bg-emerald-200 text-slate-900 hover:bg-emerald-300"
                    : "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500"
                }`}
              >
                <Save className="h-4 w-4" />
                {mode === "create" ? "Crear campaña" : "Guardar cambios"}
              </button>

              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300"
              >
                <RefreshCcw className="h-4 w-4" />
                Restaurar
              </button>

              {mode === "edit" && selectedCampaign ? (
                <>
                  <button
                    onClick={() => toggleEstadoCampana(selectedCampaign)}
                    disabled={!puedeGestionar}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${
                      !puedeGestionar
                        ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500"
                        : selectedCampaign.estado === "Activa"
                        ? "border-amber-500/30 bg-amber-200 text-slate-900 hover:bg-amber-300"
                        : "border-emerald-500/30 bg-emerald-200 text-slate-900 hover:bg-emerald-300"
                    }`}
                  >
                    {selectedCampaign.estado === "Activa" ? (
                      <PauseCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {selectedCampaign.estado === "Activa" ? "Pausar" : "Activar"}
                  </button>

                  <button
                    onClick={() =>
                      eliminarCampana(selectedCampaign.id, selectedCampaign.nombre)
                    }
                    disabled={!puedeGestionar}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${
                      !puedeGestionar
                        ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500"
                        : "border-red-950 bg-red-950 text-red-100 hover:bg-red-900"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </>
              ) : null}
            </div>

            {!puedeGestionar ? (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-100 px-4 py-3 text-sm text-amber-800">
                Solo Gerente o Admin pueden gestionar campañas.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
