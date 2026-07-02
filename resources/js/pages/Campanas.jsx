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
  Smartphone,
  MonitorPlay,
  Wifi,
  GripVertical,
} from "lucide-react";

const ESTADOS = ["Activa", "Pausada", "Cerrada"];

const STEP_OPTIONS = [
  { key: "cliente_direccion", label: "Cliente y dirección" },
  { key: "oferta", label: "Oferta" },
  { key: "facturacion", label: "Facturación" },
  { key: "complementarios", label: "Datos complementarios" },
  { key: "bancarios", label: "Datos bancarios" },
];

const DEFAULT_STEPS = STEP_OPTIONS.map((item, index) => ({
  key: item.key,
  label: item.label,
  enabled: true,
  order: index + 1,
}));

const DEFAULT_FIBRA_OPTIONS = [
  {
    key: "FIBRA_600_MB_NEBA",
    title: "Fibra 600 Mb",
    subtitle: "600 MB NEBA",
    image: "/img/vodafone/fibra.png",
    enabled: true,
  },
  {
    key: "FIBRA_1_GB_NEBA",
    title: "Fibra 1 Gb",
    subtitle: "1 GB NEBA",
    image: "/img/vodafone/fibra.png",
    enabled: true,
  },
];

const DEFAULT_MOBILE_OPTIONS = [
  {
    key: "MOVIL_30GB",
    title: "Móvil 30GB",
    subtitle: "30GB",
    maxQty: 10,
    image: "/img/vodafone/movil.png",
    enabled: true,
  },
  {
    key: "MOVIL_60GB",
    title: "Móvil 60GB",
    subtitle: "60GB",
    maxQty: 10,
    image: "/img/vodafone/movil.png",
    enabled: true,
  },
  {
    key: "MOVIL_160GB",
    title: "Móvil 160GB",
    subtitle: "160GB",
    maxQty: 10,
    image: "/img/vodafone/movil.png",
    enabled: true,
  },
  {
    key: "MOVIL_ILIMITADA",
    title: "Móvil ilimitada",
    subtitle: "ILIMITADA",
    maxQty: 10,
    image: "/img/vodafone/movil.png",
    enabled: true,
  },
];

const DEFAULT_TV_OPTIONS = [
  {
    key: "VODAFONE_TV_HBO_MAX",
    title: "Vodafone TV con HBO Max",
    price: "11,00 € / mes",
    image: "/img/vodafone/tv.png",
    enabled: true,
  },
  {
    key: "DISNEY_ESTANDAR_ANUNCIOS",
    title: "Disney+ Estándar con Anuncios",
    price: "6,99 € / mes",
    image: "/img/vodafone/tv.png",
    enabled: true,
  },
  {
    key: "TV_DISNEY_ESTANDAR",
    title: "TV con Disney+ Estándar",
    price: "12,00 € / mes",
    image: "/img/vodafone/tv.png",
    enabled: true,
  },
];

const FIELD_TYPES = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "email", label: "Correo" },
  { value: "tel", label: "Teléfono" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Lista" },
  { value: "iban", label: "IBAN" },
  { value: "nif_nie_cif", label: "NIF/NIE/CIF" },
  { value: "movil_contacto", label: "Móvil contacto" },
];

const DEFAULT_CLIENT_FIELDS = [
  { key: "tipo_documento_vodafone", label: "Tipo documento", type: "select", step: "cliente_direccion", options: ["N.I.F.", "N.I.E.", "C.I.F.", "PASAPORTE"], required: true },
  { key: "nif_nie_cif", label: "NIF", type: "nif_nie_cif", step: "cliente_direccion", required: true },
  { key: "nombre", label: "Nombre", type: "text", step: "cliente_direccion", required: true },
  { key: "apellidos", label: "Apellidos", type: "text", step: "cliente_direccion", required: true },
  { key: "correo", label: "Email", type: "email", step: "cliente_direccion" },
  { key: "movil_contacto", label: "Tlf móvil comunicaciones", type: "movil_contacto", step: "cliente_direccion" },
  { key: "telefono_fijo_contacto", label: "Tlf fijo contacto", type: "tel", step: "cliente_direccion" },
  { key: "telefono_contacto_adicional", label: "Tlf. contacto adicional", type: "tel", step: "cliente_direccion" },
  { key: "fecha_nacimiento_creacion", label: "Fecha de nacimiento", type: "date", step: "cliente_direccion" },
  { key: "segmento_vodafone", label: "Segmento Vodafone", type: "select", step: "cliente_direccion", options: ["PARTICULAR", "AUTÓNOMO", "EMPRESA"] },
  { key: "cliente_razon_social", label: "Cliente / Razón Social", type: "text", step: "cliente_direccion", required: true },
  { key: "direccion", label: "Dirección", type: "text", step: "cliente_direccion", required: true },
  { key: "numero_direccion", label: "Número", type: "text", step: "cliente_direccion" },
  { key: "piso", label: "Piso", type: "text", step: "cliente_direccion" },
  { key: "puerta", label: "Puerta", type: "text", step: "cliente_direccion" },
  { key: "localidad", label: "Localidad", type: "text", step: "cliente_direccion" },
  { key: "codigo_postal", label: "Código postal", type: "text", step: "cliente_direccion" },
];

const DEFAULT_FACTURACION_FIELDS = [
  { key: "promo_codigo", label: "Promoción", type: "text", step: "facturacion" },
  { key: "tipo_factura_vodafone", label: "Tipo de facturación", type: "select", step: "facturacion", options: ["Factura electrónica", "Factura en papel"], required: true },
];

const DEFAULT_COMPLEMENTARY_FIELDS = [
  { key: "comentario", label: "Observaciones", type: "textarea", step: "complementarios" },
];

const DEFAULT_BANK_FIELDS = [
  { key: "banco_mismo_titular", label: "Mismo titular", type: "select", step: "bancarios", options: ["Sí", "No"] },
  { key: "banco_nombre", label: "Nombre", type: "text", step: "bancarios" },
  { key: "banco_primer_apellido", label: "Primer apellido", type: "text", step: "bancarios" },
  { key: "banco_segundo_apellido", label: "Segundo apellido", type: "text", step: "bancarios" },
  { key: "banco_tipo_documento", label: "Tipo documento", type: "select", step: "bancarios", options: ["N.I.F.", "N.I.E.", "C.I.F.", "PASAPORTE"] },
  { key: "banco_numero_documento", label: "Nº documento", type: "text", step: "bancarios" },
  { key: "iban", label: "IBAN de la cuenta", type: "iban", step: "bancarios", required: true },
];

const emptyCampaign = {
  nombre: "",
  responsable: "",
  estado: "Activa",
  descripcion: "",
  arquitectura: "wizard_offer_v1",
  steps: DEFAULT_STEPS,
  fibraOptions: DEFAULT_FIBRA_OPTIONS,
  mobileOptions: DEFAULT_MOBILE_OPTIONS,
  tvOptions: DEFAULT_TV_OPTIONS,
  dynamicFields: [
    ...DEFAULT_CLIENT_FIELDS,
    ...DEFAULT_FACTURACION_FIELDS,
    ...DEFAULT_COMPLEMENTARY_FIELDS,
    ...DEFAULT_BANK_FIELDS,
  ],
};

const emptyDynamicField = {
  key: "",
  label: "",
  type: "text",
  step: "cliente_direccion",
  required: false,
  optionsText: "",
};

const emptyCatalogItem = {
  key: "",
  title: "",
  subtitle: "",
  price: "",
  image: "",
  maxQty: 10,
  enabled: true,
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
    throw new Error(
      data?.message ||
        data?.errors?.nombre?.[0] ||
        data?.errors?.responsable?.[0] ||
        "No se pudo completar la solicitud."
    );
  }

  return data;
}

function estadoBadge(estado) {
  if (estado === "Activa") return "border-emerald-700/40 bg-emerald-100 text-emerald-800";
  if (estado === "Pausada") return "border-amber-700/40 bg-amber-100 text-amber-800";
  if (estado === "Cerrada") return "border-rose-700/40 bg-rose-100 text-rose-800";
  return "border-slate-400 bg-slate-100 text-slate-800";
}

function slugify(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeStep(step, index = 0) {
  return {
    key: step?.key || `step_${index + 1}`,
    label: step?.label || `Paso ${index + 1}`,
    enabled: step?.enabled !== false,
    order: step?.order || index + 1,
  };
}

function normalizeField(field, index = 0) {
  return {
    key: field?.key || `field_${index + 1}`,
    label: field?.label || "",
    type: field?.type || "text",
    step: field?.step || "cliente_direccion",
    required: Boolean(field?.required),
    options: Array.isArray(field?.options) ? field.options : [],
  };
}

function normalizeCatalogItem(item, index = 0) {
  return {
    key: item?.key || `item_${index + 1}`,
    title: item?.title || "",
    subtitle: item?.subtitle || "",
    price: item?.price || "",
    image: item?.image || "",
    maxQty: Number(item?.maxQty ?? 10),
    enabled: item?.enabled !== false,
  };
}

function normalizeCampaign(campaign) {
  return {
    id: campaign?.id ?? null,
    nombre: campaign?.nombre ?? "",
    responsable: campaign?.responsable ?? "",
    estado: campaign?.estado ?? "Activa",
    descripcion: campaign?.descripcion ?? "",
    arquitectura: campaign?.arquitectura || "wizard_offer_v1",
    steps: Array.isArray(campaign?.steps) ? campaign.steps.map(normalizeStep) : DEFAULT_STEPS,
    fibraOptions: Array.isArray(campaign?.fibraOptions)
      ? campaign.fibraOptions.map(normalizeCatalogItem)
      : DEFAULT_FIBRA_OPTIONS,
    mobileOptions: Array.isArray(campaign?.mobileOptions)
      ? campaign.mobileOptions.map(normalizeCatalogItem)
      : DEFAULT_MOBILE_OPTIONS,
    tvOptions: Array.isArray(campaign?.tvOptions)
      ? campaign.tvOptions.map(normalizeCatalogItem)
      : DEFAULT_TV_OPTIONS,
    dynamicFields: Array.isArray(campaign?.dynamicFields)
      ? campaign.dynamicFields.map(normalizeField)
      : [
          ...DEFAULT_CLIENT_FIELDS,
          ...DEFAULT_FACTURACION_FIELDS,
          ...DEFAULT_COMPLEMENTARY_FIELDS,
          ...DEFAULT_BANK_FIELDS,
        ],
  };
}

function buildForm(campaign = null) {
  if (!campaign) return JSON.parse(JSON.stringify(emptyCampaign));
  return normalizeCampaign(campaign);
}

function buildPayload(form) {
  return {
    nombre: form.nombre,
    responsable: form.responsable,
    estado: form.estado,
    descripcion: form.descripcion,
    arquitectura: form.arquitectura,
    steps: (form.steps || []).map((step, index) => ({
      key: step.key || `step_${index + 1}`,
      label: step.label || `Paso ${index + 1}`,
      enabled: step.enabled !== false,
      order: index + 1,
    })),
    fibraOptions: (form.fibraOptions || []).map((item, index) => ({
      key: item.key || `fibra_${index + 1}`,
      title: item.title || "",
      subtitle: item.subtitle || "",
      image: item.image || "",
      enabled: item.enabled !== false,
    })),
    mobileOptions: (form.mobileOptions || []).map((item, index) => ({
      key: item.key || `movil_${index + 1}`,
      title: item.title || "",
      subtitle: item.subtitle || "",
      image: item.image || "",
      maxQty: Number(item.maxQty ?? 10),
      enabled: item.enabled !== false,
    })),
    tvOptions: (form.tvOptions || []).map((item, index) => ({
      key: item.key || `tv_${index + 1}`,
      title: item.title || "",
      price: item.price || "",
      image: item.image || "",
      enabled: item.enabled !== false,
    })),
    dynamicFields: (form.dynamicFields || []).map((field, index) => ({
      key: field.key || `field_${index + 1}`,
      label: field.label || "",
      type: field.type || "text",
      step: field.step || "cliente_direccion",
      required: Boolean(field.required),
      options: field.type === "select" ? field.options || [] : [],
    })),
  };
}

function TextInput({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="crm-label mb-2 block">{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="crm-input w-full px-4 py-3 outline-none"
        style={{ color: "inherit" }}
        placeholder={placeholder}
      />
    </div>
  );
}

function CatalogEditor({ title, icon: Icon, items, setItems, kind = "fibra" }) {
  const safeItems = Array.isArray(items) ? items : [];

  const addItem = () => {
    const nuevoItem = {
      ...emptyCatalogItem,
      key: `${kind}_${Date.now()}`,
      title: "",
      subtitle: "",
      price: "",
      image: "",
      maxQty: 10,
      enabled: true,
    };

    setItems([...safeItems, nuevoItem]);
  };

  const updateItem = (index, patch) => {
    setItems(
      safeItems.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      )
    );
  };

  const removeItem = (index) => {
    setItems(safeItems.filter((_, i) => i !== index));
  };

  return (
    <div className="crm-panel-soft p-4">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-500" />
        <p className="crm-heading">{title}</p>
      </div>

      <div className="space-y-3">
        {safeItems.map((item, index) => (
          <div
            key={item.key || index}
            className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.2fr_1fr_1fr_120px_90px_60px]"
          >
            <input
              value={item.title || ""}
              onChange={(e) => updateItem(index, { title: e.target.value })}
              className="crm-input w-full px-4 py-3 outline-none"
              placeholder="Título"
              style={{ color: "inherit" }}
            />

            <input
              value={item.subtitle || ""}
              onChange={(e) => updateItem(index, { subtitle: e.target.value })}
              className="crm-input w-full px-4 py-3 outline-none"
              placeholder={kind === "tv" ? "Descripción" : "Subtítulo"}
              style={{ color: "inherit" }}
            />

            {kind === "tv" ? (
              <input
                value={item.price || ""}
                onChange={(e) => updateItem(index, { price: e.target.value })}
                className="crm-input w-full px-4 py-3 outline-none"
                placeholder="Precio"
                style={{ color: "inherit" }}
              />
            ) : (
              <input
                value={item.image || ""}
                onChange={(e) => updateItem(index, { image: e.target.value })}
                className="crm-input w-full px-4 py-3 outline-none"
                placeholder="Ruta imagen"
                style={{ color: "inherit" }}
              />
            )}

            {kind === "movil" ? (
              <input
                type="number"
                min="1"
                max="10"
                value={item.maxQty ?? 10}
                onChange={(e) => updateItem(index, { maxQty: Number(e.target.value || 10) })}
                className="crm-input w-full px-4 py-3 outline-none"
                placeholder="Max"
                style={{ color: "inherit" }}
              />
            ) : (
              <input
                value={item.key || ""}
                onChange={(e) =>
                  updateItem(index, {
                    key: slugify(e.target.value).toUpperCase(),
                  })
                }
                className="crm-input w-full px-4 py-3 outline-none"
                placeholder="KEY"
                style={{ color: "inherit" }}
              />
            )}

            <label className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={item.enabled !== false}
                onChange={(e) => updateItem(index, { enabled: e.target.checked })}
              />
              On
            </label>

            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded-2xl border border-rose-300 bg-rose-100 px-3 py-3 font-medium text-rose-900 transition hover:bg-rose-200"
            >
              <Trash2 className="mx-auto h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900 transition hover:bg-cyan-200"
        >
          <Plus className="h-4 w-4" />
          Añadir elemento
        </button>
      </div>
    </div>
  );
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
  const [newField, setNewField] = useState(emptyDynamicField);

  const responsablesDisponibles = useMemo(
    () =>
      users.filter(
        (u) =>
          ["Gerente", "Admin", "Supervisor", "Backoffice"].includes(u.rol) &&
          u.estado === "Activo"
      ),
    [users]
  );

  const campañasFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const coincideBusqueda =
        !q || [c.nombre, c.responsable, c.estado, c.descripcion].join(" ").toLowerCase().includes(q);
      const coincideEstado = estadoFiltro === "Todas" ? true : c.estado === estadoFiltro;
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

  const resumen = useMemo(
    () => ({
      total: campaigns.length,
      activas: campaigns.filter((c) => c.estado === "Activa").length,
      pausadas: campaigns.filter((c) => c.estado === "Pausada").length,
      cerradas: campaigns.filter((c) => c.estado === "Cerrada").length,
    }),
    [campaigns]
  );

  const limpiarMensajes = () => {
    setMessage("");
    setError("");
  };

  const startCreate = () => {
    setCreateMode(true);
    setEditMode(false);
    setSelectedId(null);
    setForm(buildForm());
    setNewField(emptyDynamicField);
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
    setNewField(emptyDynamicField);
    setForm(selectedCampaign ? buildForm(selectedCampaign) : buildForm());
    limpiarMensajes();
  };

  const addDynamicField = () => {
    if (!newField.label.trim()) return;

    const key = slugify(newField.key || newField.label).toLowerCase() || `field_${Date.now()}`;

    const item = {
      key,
      label: newField.label.trim(),
      type: newField.type,
      step: newField.step,
      required: Boolean(newField.required),
      options:
        newField.type === "select"
          ? newField.optionsText
              .split(",")
              .map((opt) => opt.trim())
              .filter(Boolean)
          : [],
    };

    setForm((prev) => ({
      ...prev,
      dynamicFields: [...(prev.dynamicFields || []), item],
    }));

    setNewField(emptyDynamicField);
  };

  const updateDynamicField = (key, patch) => {
    setForm((prev) => ({
      ...prev,
      dynamicFields: (prev.dynamicFields || []).map((field) =>
        field.key === key ? { ...field, ...patch } : field
      ),
    }));
  };

  const removeDynamicField = (key) => {
    setForm((prev) => ({
      ...prev,
      dynamicFields: (prev.dynamicFields || []).filter((field) => field.key !== key),
    }));
  };

  const saveCampaign = async () => {
    if (!setCampaigns) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const payload = buildPayload(form);

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

        const actualizada = normalizeCampaign(data?.campaign || { ...selectedCampaign, ...payload });

        setCampaigns((prev) => prev.map((c) => (c.id === actualizada.id ? actualizada : c)));
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

      const actualizada = normalizeCampaign(data?.campaign || { ...selectedCampaign, estado });

      setCampaigns((prev) => prev.map((c) => (c.id === actualizada.id ? actualizada : c)));
      setForm((prev) => ({ ...prev, estado }));
      setMessage("Estado actualizado.");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async () => {
    if (!selectedCampaign || !setCampaigns) return;

    const ok = window.confirm(
      `¿Seguro que deseas eliminar la campaña "${selectedCampaign.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!ok) return;

    try {
      setLoading(true);
      limpiarMensajes();

      await apiFetch(`/campaigns/${selectedCampaign.id}`, {
        method: "DELETE",
      });

      setCampaigns((prev) => prev.filter((c) => c.id !== selectedCampaign.id));
      setSelectedId(null);
      setEditMode(false);
      setCreateMode(false);
      setForm(buildForm());
      setMessage("Campaña eliminada.");
    } catch (err) {
      setError(err.message || "No se pudo eliminar la campaña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Campañas</p>
        <h2 className="crm-title mt-1 text-2xl">Nueva arquitectura de campañas</h2>
        <p className="crm-muted mt-2 text-sm">
          Se quitó la arquitectura antigua y quedó una estructura tipo Vodafone:
          pasos, catálogos de fibra, móviles, TV y campos dinámicos por paso.
        </p>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm text-rose-800">{error}</div> : null}

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
                        <p className="crm-muted text-sm">{campaign.responsable || "Sin responsable"}</p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {campaign.arquitectura || "wizard_offer_v1"} · {(campaign.dynamicFields || []).length} campo(s)
                        </p>
                      </div>
                      <span className={`rounded-full border px-4 py-2 text-sm font-medium ${estadoBadge(campaign.estado)}`}>
                        {campaign.estado}
                      </span>
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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={startEdit}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-300"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>

                <button
                  onClick={deleteCampaign}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-100 px-4 py-2 font-medium text-rose-900 transition hover:bg-rose-200 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>

          {createMode || editMode ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  label="Nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                />

                <div>
                  <label className="crm-label mb-2 block">Responsable</label>
                  <select
                    value={form.responsable}
                    onChange={(e) => setForm((prev) => ({ ...prev, responsable: e.target.value }))}
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

                <TextInput
                  label="Arquitectura"
                  value={form.arquitectura}
                  onChange={(e) => setForm((prev) => ({ ...prev, arquitectura: e.target.value }))}
                />

                <div className="md:col-span-2">
                  <label className="crm-label mb-2 block">Descripción</label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                    className="crm-input min-h-[110px] w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <div className="mb-4 flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-cyan-500" />
                  <p className="crm-heading">Pasos del flujo</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {form.steps.map((step, index) => (
                    <div key={step.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="font-medium">{step.label}</p>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={step.enabled !== false}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                steps: prev.steps.map((item, i) =>
                                  i === index ? { ...item, enabled: e.target.checked } : item
                                ),
                              }))
                            }
                          />
                          On
                        </label>
                      </div>

                      <input
                        value={step.label}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            steps: prev.steps.map((item, i) =>
                              i === index ? { ...item, label: e.target.value } : item
                            ),
                          }))
                        }
                        className="crm-input w-full px-4 py-3 outline-none"
                        style={{ color: "inherit" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <CatalogEditor
                title="Catálogo de fibra"
                icon={Wifi}
                items={form.fibraOptions}
                setItems={(items) => setForm((prev) => ({ ...prev, fibraOptions: items }))}
                kind="fibra"
              />

              <CatalogEditor
                title="Catálogo de móviles"
                icon={Smartphone}
                items={form.mobileOptions}
                setItems={(items) => setForm((prev) => ({ ...prev, mobileOptions: items }))}
                kind="movil"
              />

              <CatalogEditor
                title="Catálogo de TV"
                icon={MonitorPlay}
                items={form.tvOptions}
                setItems={(items) => setForm((prev) => ({ ...prev, tvOptions: items }))}
                kind="tv"
              />

              <div className="crm-panel-soft p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-cyan-500" />
                  <p className="crm-heading">Campos dinámicos por paso</p>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_170px_170px_1fr_auto]">
                  <input
                    value={newField.label}
                    onChange={(e) =>
                      setNewField((prev) => ({
                        ...prev,
                        label: e.target.value,
                        key: prev.key || slugify(e.target.value),
                      }))
                    }
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                    placeholder="Nombre del campo"
                  />

                  <select
                    value={newField.type}
                    onChange={(e) => setNewField((prev) => ({ ...prev, type: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  >
                    {FIELD_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newField.step}
                    onChange={(e) => setNewField((prev) => ({ ...prev, step: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                  >
                    {form.steps.map((step) => (
                      <option key={step.key} value={step.key}>
                        {step.label}
                      </option>
                    ))}
                  </select>

                  <input
                    value={newField.optionsText}
                    onChange={(e) => setNewField((prev) => ({ ...prev, optionsText: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                    style={{ color: "inherit" }}
                    placeholder="Opciones separadas por coma"
                    disabled={newField.type !== "select"}
                  />

                  <button
                    onClick={addDynamicField}
                    className="rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900 transition hover:bg-cyan-200"
                  >
                    Añadir
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {(form.dynamicFields || []).map((field) => (
                    <div
                      key={field.key}
                      className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_160px_180px_90px_1fr_auto]"
                    >
                      <input
                        value={field.label}
                        onChange={(e) => updateDynamicField(field.key, { label: e.target.value })}
                        className="crm-input w-full px-4 py-3 outline-none"
                        style={{ color: "inherit" }}
                        placeholder="Etiqueta"
                      />

                      <select
                        value={field.type}
                        onChange={(e) => updateDynamicField(field.key, { type: e.target.value })}
                        className="crm-input w-full px-4 py-3 outline-none"
                        style={{ color: "inherit" }}
                      >
                        {FIELD_TYPES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={field.step}
                        onChange={(e) => updateDynamicField(field.key, { step: e.target.value })}
                        className="crm-input w-full px-4 py-3 outline-none"
                        style={{ color: "inherit" }}
                      >
                        {form.steps.map((step) => (
                          <option key={step.key} value={step.key}>
                            {step.label}
                          </option>
                        ))}
                      </select>

                      <label className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={Boolean(field.required)}
                          onChange={(e) => updateDynamicField(field.key, { required: e.target.checked })}
                        />
                        Req.
                      </label>

                      <input
                        value={(field.options || []).join(", ")}
                        onChange={(e) =>
                          updateDynamicField(field.key, {
                            options: e.target.value.split(",").map((opt) => opt.trim()).filter(Boolean),
                          })
                        }
                        className="crm-input w-full px-4 py-3 outline-none"
                        style={{ color: "inherit" }}
                        placeholder="Opciones separadas por coma"
                        disabled={field.type !== "select"}
                      />

                      <button
                        onClick={() => removeDynamicField(field.key)}
                        className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 font-medium text-rose-900 transition hover:bg-rose-200"
                      >
                        <Trash2 className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                  ))}
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
                <p className="crm-muted mt-2 text-sm">{selectedCampaign.arquitectura}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="crm-panel-soft p-4">
                  <p className="crm-label">Responsable</p>
                  <p className="mt-1">{selectedCampaign.responsable || "-"}</p>
                </div>
                <div className="crm-panel-soft p-4">
                  <p className="crm-label">Estado</p>
                  <p className="mt-1">{selectedCampaign.estado || "-"}</p>
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label mb-3">Pasos habilitados</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedCampaign.steps || []).filter((step) => step.enabled !== false).map((step) => (
                    <span
                      key={step.key}
                      className="rounded-full border border-cyan-300 bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-900"
                    >
                      {step.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label mb-3">Catálogos</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-medium">Fibra</p>
                    <p className="crm-muted mt-1 text-sm">{(selectedCampaign.fibraOptions || []).length} elemento(s)</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-medium">Móviles</p>
                    <p className="crm-muted mt-1 text-sm">{(selectedCampaign.mobileOptions || []).length} elemento(s)</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-medium">TV</p>
                    <p className="crm-muted mt-1 text-sm">{(selectedCampaign.tvOptions || []).length} elemento(s)</p>
                  </div>
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label mb-3">Campos dinámicos</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {(selectedCampaign.dynamicFields || []).map((field) => (
                    <div key={field.key} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="font-medium">{field.label}</p>
                      <p className="crm-muted mt-1 text-sm">
                        Tipo: {field.type} · Paso: {field.step}
                        {field.required ? " · Obligatorio" : ""}
                        {field.type === "select" && field.options?.length
                          ? ` · ${field.options.join(", ")}`
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label mb-3">Cambio rápido de estado</p>
                <div className="flex flex-wrap gap-2">
                  {ESTADOS.map((estado) => (
                    <button
                      key={estado}
                      onClick={() => quickStatus(estado)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium ${estadoBadge(estado)}`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4">
                <p className="font-semibold text-rose-900">Eliminar campaña</p>
                <p className="mt-1 text-sm text-rose-700">
                  Esta acción eliminará la campaña seleccionada del sistema.
                </p>
                <button
                  onClick={deleteCampaign}
                  disabled={loading}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 font-medium text-rose-900 transition hover:bg-rose-200 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar campaña
                </button>
              </div>
            </div>
          ) : (
            <div className="crm-panel-soft mt-4 p-4">
              <p className="crm-muted">Selecciona una campaña para ver el detalle.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
