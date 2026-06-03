import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Search,
  Filter,
  Plus,
  Save,
  Pencil,
  X,
  Users,
  PlayCircle,
  PauseCircle,
  Trash2,
  Layers3,
  LayoutTemplate,
  Blocks,
  Power,
} from "lucide-react";

const ESTADOS = ["Activa", "Pausada", "Cerrada"];

const BASE_SECTIONS = [
  { key: "control", label: "Control" },
  { key: "cliente", label: "Cliente" },
  { key: "direccion", label: "Dirección" },
  { key: "oferta", label: "Oferta" },
  { key: "lineas", label: "Líneas" },
  { key: "cierre", label: "Cierre" },
];

const DEFAULT_SECTIONS = {
  control: true,
  cliente: true,
  direccion: true,
  oferta: true,
  lineas: true,
  cierre: true,
};

const emptyForm = {
  nombre: "",
  responsable: "",
  estado: "Activa",
  descripcion: "",
  canal: "",
  objetivo: "",
  sections: { ...DEFAULT_SECTIONS },
  customBlocks: [],
  customFields: [],
};

const emptyCustomField = {
  label: "",
  type: "text",
  tab: "cliente",
  optionsText: "",
};

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
      data?.errors?.estado?.[0] ||
      data?.errors?.responsable?.[0] ||
      "No se pudo completar la solicitud.";
    throw new Error(message);
  }

  return data;
}

function estadoBadge(estado) {
  if (estado === "Activa") return "border-emerald-700/40 bg-emerald-100 text-emerald-800";
  if (estado === "Pausada") return "border-amber-700/40 bg-amber-100 text-amber-800";
  if (estado === "Cerrada") return "border-rose-700/40 bg-rose-100 text-rose-800";
  return "border-slate-400 bg-slate-100 text-slate-800";
}

function normalizeBlock(block, index = 0) {
  return {
    key: block?.key || `bloque_${index + 1}`,
    label: block?.label || `Bloque ${index + 1}`,
    enabled: block?.enabled !== false,
  };
}

function normalizeField(field, index = 0) {
  return {
    key: field?.key || `campo_${index + 1}`,
    label: field?.label || field?.nombre || "",
    type: field?.type || "text",
    tab: field?.tab || "cliente",
    options: Array.isArray(field?.options)
      ? field.options
      : Array.isArray(field?.opciones)
      ? field.opciones
      : [],
  };
}

function normalizeCampaign(campaign) {
  return {
    id: campaign?.id ?? null,
    nombre: campaign?.nombre ?? "",
    responsable: campaign?.responsable ?? "",
    estado: campaign?.estado ?? "Activa",
    descripcion: campaign?.descripcion ?? "",
    canal: campaign?.canal ?? "",
    objetivo: campaign?.objetivo ?? "",
    sections: {
      control: campaign?.sections?.control ?? true,
      cliente: campaign?.sections?.cliente ?? true,
      direccion: campaign?.sections?.direccion ?? true,
      oferta: campaign?.sections?.oferta ?? true,
      lineas: campaign?.sections?.lineas ?? true,
      cierre: campaign?.sections?.cierre ?? true,
    },
    customBlocks: Array.isArray(campaign?.customBlocks)
      ? campaign.customBlocks.map(normalizeBlock)
      : [],
    customFields: Array.isArray(campaign?.customFields)
      ? campaign.customFields.map(normalizeField)
      : [],
  };
}

function buildForm(campaign = null) {
  if (!campaign) return { ...emptyForm, sections: { ...DEFAULT_SECTIONS } };

  return {
    nombre: campaign?.nombre || "",
    responsable: campaign?.responsable || "",
    estado: campaign?.estado || "Activa",
    descripcion: campaign?.descripcion || "",
    canal: campaign?.canal || "",
    objetivo: campaign?.objetivo || "",
    sections: {
      control: campaign?.sections?.control ?? true,
      cliente: campaign?.sections?.cliente ?? true,
      direccion: campaign?.sections?.direccion ?? true,
      oferta: campaign?.sections?.oferta ?? true,
      lineas: campaign?.sections?.lineas ?? true,
      cierre: campaign?.sections?.cierre ?? true,
    },
    customBlocks: Array.isArray(campaign?.customBlocks)
      ? campaign.customBlocks.map(normalizeBlock)
      : [],
    customFields: Array.isArray(campaign?.customFields)
      ? campaign.customFields.map(normalizeField)
      : [],
  };
}

function buildAssignableTabs(form) {
  const baseTabs = BASE_SECTIONS.map((section) => ({
    key: section.key,
    label: section.label,
    enabled: form?.sections?.[section.key] !== false,
    kind: "base",
  }));

  const customTabs = (form?.customBlocks || []).map((block) => ({
    key: block.key,
    label: block.label,
    enabled: block.enabled !== false,
    kind: "custom",
  }));

  return [...baseTabs, ...customTabs];
}

export default function Campanas({
  campaigns = [],
  setCampaigns,
  users = [],
}) {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todas");
  const [selectedId, setSelectedId] = useState(campaigns[0]?.id || null);
  const [form, setForm] = useState(buildForm());
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newField, setNewField] = useState(emptyCustomField);
  const [newBlockLabel, setNewBlockLabel] = useState("");

  const responsablesDisponibles = useMemo(() => {
    return users.filter(
      (u) =>
        ["Gerente", "Admin", "Supervisor", "Backoffice"].includes(u.rol) &&
        u.estado === "Activo"
    );
  }, [users]);

  const assignableTabs = useMemo(() => buildAssignableTabs(form), [form]);

  const campañasFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase();

    return campaigns.filter((c) => {
      const coincideBusqueda =
        !q ||
        [
          c.nombre,
          c.responsable,
          c.estado,
          c.descripcion,
          c.canal,
          c.objetivo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const coincideEstado =
        estadoFiltro === "Todas" ? true : c.estado === estadoFiltro;

      return coincideBusqueda && coincideEstado;
    });
  }, [campaigns, search, estadoFiltro]);

  const selectedCampaign =
    campaigns.find((c) => c.id === selectedId) || campañasFiltradas[0] || null;

  useEffect(() => {
    if (selectedCampaign && !createMode) {
      setForm(buildForm(selectedCampaign));
    }
  }, [selectedCampaign, createMode]);

  const resumen = useMemo(() => {
    return {
      total: campaigns.length,
      activas: campaigns.filter((c) => c.estado === "Activa").length,
      pausadas: campaigns.filter((c) => c.estado === "Pausada").length,
      cerradas: campaigns.filter((c) => c.estado === "Cerrada").length,
    };
  }, [campaigns]);

  const limpiarMensajes = () => {
    setMessage("");
    setError("");
  };

  const startCreate = () => {
    setCreateMode(true);
    setEditMode(false);
    setSelectedId(null);
    setForm(buildForm());
    setNewField(emptyCustomField);
    setNewBlockLabel("");
    limpiarMensajes();
  };

  const startEdit = () => {
    if (!selectedCampaign) return;
    setCreateMode(false);
    setEditMode(true);
    setForm(buildForm(selectedCampaign));
    limpiarMensajes();
  };

  const cancelEdit = () => {
    setEditMode(false);
    setCreateMode(false);
    setNewField(emptyCustomField);
    setNewBlockLabel("");
    if (selectedCampaign) {
      setForm(buildForm(selectedCampaign));
    } else {
      setForm(buildForm());
    }
    limpiarMensajes();
  };

  const addCustomBlock = () => {
    const label = newBlockLabel.trim();
    if (!label) return;

    const keyBase = label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    let key = keyBase || `bloque_${Date.now()}`;
    let counter = 1;

    while (
      BASE_SECTIONS.some((s) => s.key === key) ||
      (form.customBlocks || []).some((b) => b.key === key)
    ) {
      key = `${keyBase || "bloque"}_${counter++}`;
    }

    setForm((prev) => ({
      ...prev,
      customBlocks: [
        ...(prev.customBlocks || []),
        { key, label, enabled: true },
      ],
    }));

    setNewBlockLabel("");
  };

  const removeCustomBlock = (blockKey) => {
    setForm((prev) => ({
      ...prev,
      customBlocks: (prev.customBlocks || []).filter((block) => block.key !== blockKey),
      customFields: (prev.customFields || []).map((field) =>
        field.tab === blockKey ? { ...field, tab: "cliente" } : field
      ),
    }));
  };

  const toggleCustomBlock = (blockKey) => {
    setForm((prev) => ({
      ...prev,
      customBlocks: (prev.customBlocks || []).map((block) =>
        block.key === blockKey ? { ...block, enabled: !block.enabled } : block
      ),
    }));
  };

  const addCustomField = () => {
    if (!newField.label.trim()) return;

    const options =
      newField.type === "select"
        ? newField.optionsText
            .split(",")
            .map((opt) => opt.trim())
            .filter(Boolean)
        : [];

    const item = {
      key: `campo_${Date.now()}`,
      label: newField.label.trim(),
      type: newField.type,
      tab: newField.tab,
      options,
    };

    setForm((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), item],
    }));

    setNewField({
      ...emptyCustomField,
      tab: assignableTabs[0]?.key || "cliente",
    });
  };

  const removeCustomField = (key) => {
    setForm((prev) => ({
      ...prev,
      customFields: (prev.customFields || []).filter((field) => field.key !== key),
    }));
  };

  const updateCustomField = (key, patch) => {
    setForm((prev) => ({
      ...prev,
      customFields: (prev.customFields || []).map((field) =>
        field.key === key ? { ...field, ...patch } : field
      ),
    }));
  };

  const buildPayload = () => ({
    nombre: form.nombre,
    responsable: form.responsable,
    estado: form.estado,
    descripcion: form.descripcion,
    canal: form.canal,
    objetivo: form.objetivo,
    sections: form.sections,
    customBlocks: (form.customBlocks || []).map((block) => ({
      key: block.key,
      label: block.label,
      enabled: block.enabled !== false,
    })),
    customFields: (form.customFields || []).map((field, index) => ({
      key: field.key || `campo_${index + 1}`,
      label: field.label || "",
      type: field.type || "text",
      tab: field.tab || "cliente",
      options:
        field.type === "select"
          ? Array.isArray(field.options)
            ? field.options.filter(Boolean)
            : []
          : [],
    })),
  });

  const saveCampaign = async () => {
    if (!setCampaigns) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const payload = buildPayload();

      if (createMode) {
        const data = await apiFetch("/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const nueva = normalizeCampaign(data?.campaign || payload);
        setCampaigns((prev) => [nueva, ...prev]);
        setSelectedId(nueva.id);
        setCreateMode(false);
        setMessage("Campaña creada.");
      } else if (editMode && selectedCampaign) {
        const data = await apiFetch(`/campaigns/${selectedCampaign.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const actualizada = normalizeCampaign(
          data?.campaign || { ...selectedCampaign, ...payload }
        );

        setCampaigns((prev) =>
          prev.map((c) => (c.id === actualizada.id ? actualizada : c))
        );
        setEditMode(false);
        setMessage("Campaña actualizada.");
      }
    } catch (err) {
      setError(err.message || "No se pudo guardar la campaña.");
    } finally {
      setLoading(false);
    }
  };

  const quickStatus = async (estado) => {
    if (!selectedCampaign || !setCampaigns) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const data = await apiFetch(`/campaigns/${selectedCampaign.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });

      const actualizada = normalizeCampaign(
        data?.campaign || { ...selectedCampaign, estado }
      );

      setCampaigns((prev) =>
        prev.map((c) => (c.id === actualizada.id ? actualizada : c))
      );

      setForm((prev) => ({ ...prev, estado }));
      setMessage("Estado actualizado.");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Campañas</p>
        <h2 className="crm-title mt-1 text-2xl">Gestión de campañas</h2>
        <p className="crm-muted mt-2 text-sm">
          Aquí diseñas la ficha completa de cada campaña: bloques visibles, bloques nuevos y campos.
        </p>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="h-5 w-5 text-cyan-500" />
            <p className="crm-label">Total campañas</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{resumen.total}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <PlayCircle className="h-5 w-5 text-emerald-500" />
            <p className="crm-label">Activas</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{resumen.activas}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <PauseCircle className="h-5 w-5 text-amber-500" />
            <p className="crm-label">Pausadas</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{resumen.pausadas}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-rose-500" />
            <p className="crm-label">Cerradas</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{resumen.cerradas}</p>
        </div>
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
              placeholder="Buscar por nombre, responsable o descripción"
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
              <option className="text-black">Todas</option>
              {ESTADOS.map((estado) => (
                <option key={estado} className="text-black">
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={startCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900 transition hover:bg-cyan-200"
          >
            <Plus className="h-4 w-4" />
            Nueva campaña
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">Campañas registradas</h3>

          <div className="mt-4 space-y-3">
            {campañasFiltradas.length > 0 ? (
              campañasFiltradas.map((campaign) => {
                const active = selectedCampaign?.id === campaign.id;

                return (
                  <button
                    key={campaign.id}
                    onClick={() => {
                      setSelectedId(campaign.id);
                      setEditMode(false);
                      setCreateMode(false);
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-slate-400 bg-slate-200/80 dark:border-white/20 dark:bg-slate-900"
                        : "crm-panel-soft hover:opacity-90"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="crm-heading">{campaign.nombre}</p>
                        <p className="crm-muted text-sm">
                          {campaign.responsable || "Sin responsable"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {(campaign.customFields || []).length} campo(s) ·{" "}
                          {(campaign.customBlocks || []).length} bloque(s) nuevo(s)
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-4 py-2 text-sm font-medium ${estadoBadge(
                            campaign.estado
                          )}`}
                        >
                          {campaign.estado}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="crm-panel-soft p-4">
                <p className="crm-muted text-sm">No hay campañas para mostrar.</p>
              </div>
            )}
          </div>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="crm-heading text-lg">
              {createMode ? "Nueva campaña" : "Detalle de campaña"}
            </h3>

            {!createMode && !editMode && selectedCampaign && (
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-300"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>
            )}
          </div>

          {(createMode || editMode) ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="crm-label mb-2 block">Nombre</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Responsable</label>
                  <select
                    value={form.responsable}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, responsable: e.target.value }))
                    }
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  >
                    <option value="">Selecciona responsable</option>
                    {responsablesDisponibles.map((u) => (
                      <option key={u.id} value={u.nombre || u.name}>
                        {u.nombre || u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="crm-label mb-2 block">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="crm-label mb-2 block">Canal</label>
                  <input
                    value={form.canal}
                    onChange={(e) => setForm((prev) => ({ ...prev, canal: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="crm-label mb-2 block">Objetivo</label>
                  <input
                    value={form.objetivo}
                    onChange={(e) => setForm((prev) => ({ ...prev, objetivo: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="crm-label mb-2 block">Descripción</label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, descripcion: e.target.value }))
                    }
                    className="crm-input min-h-[110px] w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <div className="mb-4 flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-cyan-500" />
                  <p className="crm-heading">Bloques base visibles</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {BASE_SECTIONS.map((section) => (
                    <label
                      key={section.key}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="font-medium">{section.label}</span>
                      <input
                        type="checkbox"
                        checked={!!form.sections?.[section.key]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              [section.key]: e.target.checked,
                            },
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Blocks className="h-4 w-4 text-cyan-500" />
                  <p className="crm-heading">Bloques nuevos</p>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <input
                    value={newBlockLabel}
                    onChange={(e) => setNewBlockLabel(e.target.value)}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                    placeholder="Nombre del bloque nuevo"
                  />

                  <button
                    onClick={addCustomBlock}
                    className="rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900 transition hover:bg-cyan-200"
                  >
                    Añadir bloque
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {(form.customBlocks || []).length > 0 ? (
                    form.customBlocks.map((block) => (
                      <div
                        key={block.key}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-medium">{block.label}</p>
                          <p className="text-xs text-slate-500">{block.key}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCustomBlock(block.key)}
                            className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium ${
                              block.enabled
                                ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                                : "border-slate-300 bg-slate-200 text-slate-900"
                            }`}
                          >
                            <Power className="h-4 w-4" />
                            {block.enabled ? "Activo" : "Oculto"}
                          </button>

                          <button
                            onClick={() => removeCustomBlock(block.key)}
                            className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-2 font-medium text-rose-900 transition hover:bg-rose-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="crm-muted text-sm">No hay bloques nuevos creados.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-cyan-500" />
                  <p className="crm-heading">Campos por campaña</p>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_170px_170px_1fr_auto]">
                  <input
                    value={newField.label}
                    onChange={(e) =>
                      setNewField((prev) => ({ ...prev, label: e.target.value }))
                    }
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                    placeholder="Nombre del campo"
                  />

                  <select
                    value={newField.type}
                    onChange={(e) =>
                      setNewField((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  >
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                    <option value="email">Correo</option>
                    <option value="tel">Teléfono</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Lista</option>
                  </select>

                  <select
                    value={newField.tab}
                    onChange={(e) =>
                      setNewField((prev) => ({ ...prev, tab: e.target.value }))
                    }
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  >
                    {assignableTabs.map((tab) => (
                      <option key={tab.key} value={tab.key}>
                        {tab.label} {tab.enabled ? "" : "(oculto)"}
                      </option>
                    ))}
                  </select>

                  <input
                    value={newField.optionsText}
                    onChange={(e) =>
                      setNewField((prev) => ({ ...prev, optionsText: e.target.value }))
                    }
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                    placeholder="Opciones separadas por coma"
                    disabled={newField.type !== "select"}
                  />

                  <button
                    onClick={addCustomField}
                    className="rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900 transition hover:bg-cyan-200"
                  >
                    Añadir
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {(form.customFields || []).length > 0 ? (
                    form.customFields.map((field) => (
                      <div
                        key={field.key}
                        className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_170px_170px_1fr_auto]"
                      >
                        <input
                          value={field.label}
                          onChange={(e) =>
                            updateCustomField(field.key, { label: e.target.value })
                          }
                          className="crm-input w-full px-4 py-3 outline-none"
                          style={{ color: "inherit" }}
                          placeholder="Etiqueta"
                        />

                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateCustomField(field.key, {
                              type: e.target.value,
                              options: e.target.value === "select" ? field.options || [] : [],
                            })
                          }
                          className="crm-input w-full px-4 py-3 outline-none"
                          style={{ color: "inherit" }}
                        >
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="date">Fecha</option>
                          <option value="email">Correo</option>
                          <option value="tel">Teléfono</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Lista</option>
                        </select>

                        <select
                          value={field.tab || "cliente"}
                          onChange={(e) =>
                            updateCustomField(field.key, { tab: e.target.value })
                          }
                          className="crm-input w-full px-4 py-3 outline-none"
                          style={{ color: "inherit" }}
                        >
                          {assignableTabs.map((tab) => (
                            <option key={tab.key} value={tab.key}>
                              {tab.label} {tab.enabled ? "" : "(oculto)"}
                            </option>
                          ))}
                        </select>

                        <input
                          value={(field.options || []).join(", ")}
                          onChange={(e) =>
                            updateCustomField(field.key, {
                              options: e.target.value
                                .split(",")
                                .map((opt) => opt.trim())
                                .filter(Boolean),
                            })
                          }
                          className="crm-input w-full px-4 py-3 outline-none"
                          style={{ color: "inherit" }}
                          placeholder="Opciones separadas por coma"
                          disabled={field.type !== "select"}
                        />

                        <button
                          onClick={() => removeCustomField(field.key)}
                          className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 font-medium text-rose-900 transition hover:bg-rose-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="crm-muted text-sm">
                        Esta campaña aún no tiene campos extra.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveCampaign}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 font-medium text-emerald-900 transition hover:bg-emerald-200 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </button>

                <button
                  onClick={cancelEdit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300 disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : selectedCampaign ? (
            <div className="mt-4 space-y-4">
              <div className="crm-panel-soft p-4">
                <p className="crm-label">Campaña</p>
                <p className="crm-title mt-1 text-lg">{selectedCampaign.nombre}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="crm-panel-soft p-4">
                  <p className="crm-label">Responsable</p>
                  <p className="crm-body mt-1">{selectedCampaign.responsable || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4">
                  <p className="crm-label">Estado</p>
                  <p className="crm-body mt-1">{selectedCampaign.estado || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4">
                  <p className="crm-label">Canal</p>
                  <p className="crm-body mt-1">{selectedCampaign.canal || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4">
                  <p className="crm-label">Objetivo</p>
                  <p className="crm-body mt-1">{selectedCampaign.objetivo || "-"}</p>
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label">Bloques base activos</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {BASE_SECTIONS.filter((section) => selectedCampaign.sections?.[section.key]).map((section) => (
                    <span
                      key={section.key}
                      className="rounded-full border border-cyan-300 bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-900"
                    >
                      {section.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label">Bloques nuevos</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedCampaign.customBlocks || []).length > 0 ? (
                    selectedCampaign.customBlocks.map((block) => (
                      <span
                        key={block.key}
                        className={`rounded-full border px-3 py-1 text-sm font-medium ${
                          block.enabled
                            ? "border-violet-300 bg-violet-100 text-violet-900"
                            : "border-slate-300 bg-slate-200 text-slate-700"
                        }`}
                      >
                        {block.label}
                      </span>
                    ))
                  ) : (
                    <p className="crm-muted text-sm">No hay bloques nuevos.</p>
                  )}
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label mb-3">Campos que pedirá la ficha</p>
                {(selectedCampaign.customFields || []).length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedCampaign.customFields.map((field) => (
                      <div
                        key={field.key}
                        className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                      >
                        <p className="font-medium">{field.label}</p>
                        <p className="crm-muted mt-1 text-sm">
                          Tipo: {field.type} · Bloque: {field.tab}
                          {field.type === "select" && field.options?.length
                            ? ` · ${field.options.join(", ")}`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="crm-muted text-sm">
                    Esta campaña no tiene campos extra configurados.
                  </p>
                )}
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label mb-3">Cambio rápido de estado</p>
                <div className="flex flex-wrap gap-2">
                  {ESTADOS.map((estado) => (
                    <button
                      key={estado}
                      onClick={() => quickStatus(estado)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium ${estadoBadge(
                        estado
                      )}`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="crm-panel-soft mt-4 p-4">
              <p className="crm-muted">
                Selecciona una campaña para ver el detalle.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
