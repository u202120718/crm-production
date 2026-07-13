import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Search,
  Filter,
  Plus,
  Save,
  Pencil,
  X,
  Trash2,
  Layers3,
  Smartphone,
  MonitorPlay,
  Wifi,
  GripVertical,
  Settings,
  Sparkles,
  LayoutGrid,
  Tag,
  ToggleLeft,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Users,
} from "lucide-react";

const ESTADOS = ["Activa", "Pausada", "Cerrada"];

const TABS = [
  { key: "general", label: "General", icon: BriefcaseBusiness },
  { key: "flujo", label: "Flujo", icon: GripVertical },
  { key: "bloques", label: "Bloques oferta", icon: LayoutGrid },
  { key: "fibra", label: "Fibra", icon: Wifi },
  { key: "moviles", label: "Móviles", icon: Smartphone },
  { key: "tv", label: "TV", icon: MonitorPlay },
  { key: "promos", label: "Promos", icon: Tag },
  { key: "diseno", label: "Diseño", icon: LayoutGrid },
  { key: "validacion", label: "Validación", icon: CheckCircle2 },
  { key: "preview", label: "Vista previa", icon: Sparkles },
  { key: "campos", label: "Campos", icon: Layers3 },
];

const STEP_OPTIONS = [
  { key: "cliente_direccion", label: "Cliente y dirección" },
  { key: "oferta", label: "Oferta" },
  { key: "facturacion", label: "Facturación" },
  { key: "bancarios", label: "Datos bancarios" },
  { key: "complementarios", label: "Datos complementarios" },
];

const DEFAULT_STEPS = STEP_OPTIONS.map((item, index) => ({
  key: item.key,
  label: item.label,
  enabled: true,
  order: index + 1,
}));

const DEFAULT_FIBRA = [
  { key: "FIBRA_600_MB", title: "Fibra 600 Mb", subtitle: "600 MB", price: "", image: "/img/vodafone/fibra.png", enabled: true },
  { key: "FIBRA_1_GB", title: "Fibra 1 Gb", subtitle: "1 GB", price: "", image: "/img/vodafone/fibra.png", enabled: true },
  { key: "FIBRA_600_MB_NEBA", title: "Fibra 600 Mb", subtitle: "600 MB NEBA", price: "", image: "/img/vodafone/fibra.png", enabled: true },
  { key: "FIBRA_1_GB_NEBA", title: "Fibra 1 Gb", subtitle: "1 GB NEBA", price: "", image: "/img/vodafone/fibra.png", enabled: true },
];

const DEFAULT_MOVILES = [
  { key: "MOVIL_30GB", title: "Móvil 30GB", subtitle: "30GB", price: "", maxQty: 10, image: "/img/vodafone/movil.png", enabled: true },
  { key: "MOVIL_60GB", title: "Móvil 60GB", subtitle: "60GB", price: "", maxQty: 10, image: "/img/vodafone/movil.png", enabled: true },
  { key: "MOVIL_160GB", title: "Móvil 160GB", subtitle: "160GB", price: "", maxQty: 10, image: "/img/vodafone/movil.png", enabled: true },
  { key: "MOVIL_ILIMITADA", title: "Móvil ilimitada", subtitle: "ILIMITADA", price: "", maxQty: 10, image: "/img/vodafone/movil.png", enabled: true },
];

const DEFAULT_TV = [
  ["Vodafone TV con HBO Max", "11,00 € / mes"],
  ["Disney+ Estándar con Anuncios", "6,99 € / mes"],
  ["TV con Disney+ Estándar", "12,00 € / mes"],
  ["Netflix Estándar con anuncios", "8,99 € / mes"],
  ["Netflix Estándar", "14,99 € / mes"],
  ["Netflix Premium", "21,99 € / mes"],
  ["Vodafone TV con Prime", "6,99 € / mes"],
  ["Vodafone TV con HBO Max y Prime", "15,00 € / mes"],
  ["TV con Disney+ Estándar y Prime", "16,00 € / mes"],
  ["TV con HBO Max y Disney+ Estándar", "20,00 € / mes"],
  ["TV con HBO Max, Disney+ Estándar y Prime", "23,00 € / mes"],
  ["TV con Disney+ Estándar, Prime y Filmin", "22,00 € / mes"],
  ["Vodafone TV", "5,00 € / mes"],
  ["Plan Futbol de DAZN", "19,99 € / mes"],
  ["Plan Motor de DAZN", "19,99 € / mes"],
  ["Deportes", "6,00 € / mes"],
  ["Vodafone TV con Filmin", "5,00 € / mes"],
  ["Documentales", "8,00 € / mes"],
  ["Onetoro TV", "14,99 € / mes"],
  ["Caza y Pesca", "6,99 € / mes"],
  ["+18", "9,99 € / mes"],
  ["AMC+", "4,99 € / mes"],
  ["Más Series", "6,00 € / mes"],
  ["Plan Premium de DAZN", "31,99 € / mes"],
].map(([title, price], index) => ({
  key: slugify(title).toUpperCase() || `TV_${index + 1}`,
  title,
  subtitle: "",
  price,
  image: "/img/vodafone/tv.png",
  enabled: true,
}));


const DEFAULT_TV_BLOCKS = [
  { key: "TV_SIN_DECO", title: "Vodafone TV sin decodificador", enabled: true, mode: "seleccion" },
  { key: "DECO_4K", title: "Alquiler Decodificador 4K", enabled: true, mode: "seleccion" },
  { key: "DECO_4K_PRO", title: "Alquiler Decodificador 4K Pro", enabled: true, mode: "seleccion" },
  { key: "VODAFONE_TV", title: "Vodafone TV", enabled: true, mode: "catalogo_tv" },
  { key: "TV_NEGOCIO", title: "Vodafone TV en Tu Negocio", enabled: true, mode: "seleccion" },
];

const DEFAULT_OFFER_BLOCKS = [
  { key: "fibra", title: "Fibra + Fijo", enabled: true },
  { key: "moviles", title: "Línea móvil", enabled: true },
  { key: "tv", title: "Vodafone TV", enabled: true },
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

const DEFAULT_FIELDS = [
  { key: "tipo_documento_vodafone", label: "Tipo documento", type: "select", step: "cliente_direccion", options: ["N.I.F.", "N.I.E.", "C.I.F.", "PASAPORTE"], required: true },
  { key: "nif_nie_cif", label: "NIF", type: "nif_nie_cif", step: "cliente_direccion", required: true },
  { key: "nombre", label: "Nombre", type: "text", step: "cliente_direccion", required: true },
  { key: "apellidos", label: "Apellidos", type: "text", step: "cliente_direccion", required: true },
  { key: "correo", label: "Email", type: "email", step: "cliente_direccion" },
  { key: "movil_contacto", label: "Tlf móvil comunicaciones", type: "movil_contacto", step: "cliente_direccion" },
  { key: "fecha_nacimiento_creacion", label: "Fecha de nacimiento", type: "date", step: "cliente_direccion" },
  { key: "segmento_vodafone", label: "Segmento Vodafone", type: "select", step: "cliente_direccion", options: ["PARTICULAR", "MICRO"] },
  { key: "direccion", label: "Dirección", type: "text", step: "cliente_direccion", required: true },
  { key: "promo_codigo", label: "Promoción", type: "text", step: "facturacion" },
  { key: "tipo_factura_vodafone", label: "Tipo de facturación", type: "select", step: "facturacion", options: ["Factura electrónica", "Factura en papel"], required: true },
  { key: "iban", label: "IBAN de la cuenta", type: "iban", step: "bancarios", required: true },
  { key: "comentario", label: "Observaciones", type: "textarea", step: "complementarios" },
];

const DEFAULT_CONFIG = {
  arquitectura: "wizard_offer_v1",
  tipoCampana: "telefonia",
  maxMoviles: 10,
  mostrarCliente: true,
  mostrarDireccion: true,
  mostrarOferta: true,
  mostrarBanco: true,
  mostrarComplementarios: true,
  mostrarDescuento: true,
  mostrarTv: true,
  mostrarFibra: true,
  mostrarMoviles: true,
  requiereIban: true,
  offerBlocks: DEFAULT_OFFER_BLOCKS,
  tvBlocks: DEFAULT_TV_BLOCKS,
  estadosVenta: ["PENDIENTE", "EN PROCESO", "FINALIZADO", "NO FAVORABLE"],
  validationRules: {
    requiereDocumento: true,
    requiereTelefono: true,
    requiereDireccion: true,
    requiereIBAN: true,
    permitirSinMovil: true,
    validarDuplicadoDocumento: true,
    validarDuplicadoTelefono: true,
    estadoInicial: "PENDIENTE",
  },
  steps: DEFAULT_STEPS,
};

const emptyCampaign = {
  nombre: "",
  responsable: "",
  estado: "Activa",
  descripcion: "",
  canal: "",
  objetivo: "",
  productos: {
    fibra: DEFAULT_FIBRA,
    moviles: DEFAULT_MOVILES,
    tv: DEFAULT_TV,
  },
  promociones: [],
  configuracion: DEFAULT_CONFIG,
  dynamicFields: DEFAULT_FIELDS,
  customBlocks: [],
  steps: DEFAULT_STEPS,
};

const emptyBlock = {
  key: "",
  label: "",
};

const emptyField = {
  key: "",
  label: "",
  type: "text",
  step: "cliente_direccion",
  required: false,
  optionsText: "",
};

const emptyPromo = {
  key: "",
  title: "",
  value: "",
  type: "importe",
  enabled: true,
};

const emptyProduct = {
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
  if (token) headers["X-XSRF-TOKEN"] = decodeURIComponent(token);

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

function slugify(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function estadoBadge(estado) {
  if (estado === "Activa") return "border-emerald-700/40 bg-emerald-100 text-emerald-800";
  if (estado === "Pausada") return "border-amber-700/40 bg-amber-100 text-amber-800";
  if (estado === "Cerrada") return "border-rose-700/40 bg-rose-100 text-rose-800";
  return "border-slate-400 bg-slate-100 text-slate-800";
}

function asArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function normalizeStep(step, index = 0) {
  return {
    key: step?.key || `step_${index + 1}`,
    label: step?.label || `Paso ${index + 1}`,
    enabled: step?.enabled !== false,
    order: step?.order || index + 1,
  };
}

function normalizeProduct(item, index = 0) {
  return {
    key: item?.key || slugify(item?.title || item?.nombre || `item_${index + 1}`).toUpperCase(),
    title: item?.title || item?.nombre || item?.label || "",
    subtitle: item?.subtitle || item?.plan || "",
    price: item?.price || item?.precio || "",
    image: item?.image || item?.imagen || "",
    maxQty: Number(item?.maxQty ?? item?.max_qty ?? 10),
    enabled: item?.enabled !== false,
  };
}

function normalizeField(field, index = 0) {
  return {
    key: field?.key || slugify(field?.label || field?.nombre || `field_${index + 1}`),
    label: field?.label || field?.nombre || "",
    type: field?.type || "text",
    step: field?.step || field?.tab || "cliente_direccion",
    tab: field?.tab || field?.step || "cliente_direccion",
    required: Boolean(field?.required),
    options: asArray(field?.options || field?.opciones, []),
  };
}

function normalizePromo(item, index = 0) {
  return {
    key: item?.key || slugify(item?.title || item?.nombre || `promo_${index + 1}`).toUpperCase(),
    title: item?.title || item?.nombre || "",
    value: item?.value || item?.valor || "",
    type: item?.type || item?.tipo || "importe",
    enabled: item?.enabled !== false,
  };
}

function normalizeBlock(item, index = 0) {
  return {
    key: item?.key || slugify(item?.title || item?.nombre || `block_${index + 1}`),
    title: item?.title || item?.nombre || item?.label || `Bloque ${index + 1}`,
    enabled: item?.enabled !== false,
  };
}

function normalizeTvBlock(item, index = 0) {
  return {
    key: item?.key || slugify(item?.title || item?.nombre || `tv_block_${index + 1}`).toUpperCase(),
    title: item?.title || item?.nombre || item?.label || `Bloque TV ${index + 1}`,
    mode: item?.mode || item?.modo || "seleccion",
    enabled: item?.enabled !== false,
  };
}

function normalizeCampaign(campaign) {
  const productos = campaign?.productos || {};
  const configuracion = campaign?.configuracion || {};
  const steps = asArray(campaign?.steps || configuracion?.steps, DEFAULT_STEPS).map(normalizeStep);

  return {
    id: campaign?.id ?? null,
    nombre: campaign?.nombre ?? "",
    responsable: campaign?.responsable ?? "",
    estado: campaign?.estado ?? "Activa",
    descripcion: campaign?.descripcion ?? "",
    canal: campaign?.canal ?? "",
    objetivo: campaign?.objetivo ?? "",
    productos: {
      fibra: asArray(campaign?.fibraOptions || productos?.fibra, DEFAULT_FIBRA).map(normalizeProduct),
      moviles: asArray(campaign?.mobileOptions || productos?.moviles, DEFAULT_MOVILES).map(normalizeProduct),
      tv: asArray(campaign?.tvOptions || productos?.tv, DEFAULT_TV).map(normalizeProduct),
    },
    promociones: asArray(campaign?.promociones, []).map(normalizePromo),
    configuracion: {
      ...DEFAULT_CONFIG,
      ...configuracion,
      arquitectura: campaign?.arquitectura || configuracion?.arquitectura || "wizard_offer_v1",
      tipoCampana: configuracion?.tipoCampana || "telefonia",
      offerBlocks: asArray(configuracion?.offerBlocks, DEFAULT_OFFER_BLOCKS).map(normalizeBlock),
      tvBlocks: asArray(configuracion?.tvBlocks, DEFAULT_TV_BLOCKS).map(normalizeTvBlock),
      steps,
    },
    steps,
    dynamicFields: asArray(campaign?.dynamicFields || campaign?.customFields, DEFAULT_FIELDS).map(normalizeField),
    customBlocks: asArray(campaign?.customBlocks, []).map((block, index) => ({
      key: block?.key || slugify(block?.label || `bloque_${index + 1}`),
      label: block?.label || block?.title || `Bloque ${index + 1}`,
    })),
  };
}

function buildForm(campaign = null) {
  if (!campaign) return JSON.parse(JSON.stringify(emptyCampaign));
  return normalizeCampaign(campaign);
}

function buildPayload(form) {
  const fibra = asArray(form.productos?.fibra).map(normalizeProduct);
  const moviles = asArray(form.productos?.moviles).map(normalizeProduct);
  const tv = asArray(form.productos?.tv).map(normalizeProduct);
  const steps = asArray(form.steps).map((step, index) => ({
    key: step.key || `step_${index + 1}`,
    label: step.label || `Paso ${index + 1}`,
    enabled: step.enabled !== false,
    order: index + 1,
  }));

  const dynamicFields = asArray(form.dynamicFields).map((field, index) => ({
    key: field.key || `field_${index + 1}`,
    label: field.label || "",
    type: field.type || "text",
    step: field.step || field.tab || "cliente_direccion",
    tab: field.step || field.tab || "cliente_direccion",
    required: Boolean(field.required),
    options: field.type === "select" ? asArray(field.options) : [],
  }));

  const configuracion = {
    ...DEFAULT_CONFIG,
    ...(form.configuracion || {}),
    arquitectura: form.configuracion?.arquitectura || "wizard_offer_v1",
    maxMoviles: Number(form.configuracion?.maxMoviles ?? 10),
    offerBlocks: asArray(form.configuracion?.offerBlocks, DEFAULT_OFFER_BLOCKS).map(normalizeBlock),
    tvBlocks: asArray(form.configuracion?.tvBlocks, DEFAULT_TV_BLOCKS).map(normalizeTvBlock),
    steps,
  };

  return {
    nombre: form.nombre,
    responsable: form.responsable,
    estado: form.estado,
    descripcion: form.descripcion,
    canal: form.canal,
    objetivo: form.objetivo,
    arquitectura: configuracion.arquitectura,
    steps,
    fibraOptions: fibra,
    mobileOptions: moviles,
    tvOptions: tv,
    dynamicFields,
    productos: { fibra, moviles, tv },
    promociones: asArray(form.promociones).map(normalizePromo),
    configuracion,
    customFields: dynamicFields,
    customBlocks: asArray(form.customBlocks).map((block, index) => ({
      key: block?.key || slugify(block?.label || `bloque_${index + 1}`),
      label: block?.label || block?.title || `Bloque ${index + 1}`,
    })),
    sections: {
      cliente: configuracion.mostrarCliente !== false,
      direccion: configuracion.mostrarDireccion !== false,
      oferta: configuracion.mostrarOferta !== false,
      lineas: configuracion.mostrarMoviles !== false,
      cierre: true,
    },
  };
}

export default function Campanas({ campaigns = [], setCampaigns, users = [] }) {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todas");
  const [selectedId, setSelectedId] = useState(campaigns[0]?.id || null);
  const [form, setForm] = useState(buildForm());
  const [activeTab, setActiveTab] = useState("general");
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const responsablesDisponibles = useMemo(
    () =>
      users.filter(
        (u) =>
          ["Gerente", "Admin", "Supervisor", "Backoffice"].includes(u.rol) &&
          u.estado === "Activo"
      ),
    [users]
  );

  const campaignsNormalizadas = useMemo(
    () => asArray(campaigns).map(normalizeCampaign),
    [campaigns]
  );

  const campañasFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaignsNormalizadas.filter((c) => {
      const coincideBusqueda =
        !q ||
        [c.nombre, c.responsable, c.estado, c.descripcion, c.canal]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const coincideEstado = estadoFiltro === "Todas" ? true : c.estado === estadoFiltro;
      return coincideBusqueda && coincideEstado;
    });
  }, [campaignsNormalizadas, search, estadoFiltro]);

  const selectedCampaign =
    campaignsNormalizadas.find((c) => c.id === selectedId) || campañasFiltradas[0] || null;

  useEffect(() => {
    if (selectedCampaign && !createMode && !editMode) {
      setForm(buildForm(selectedCampaign));
    }
  }, [selectedCampaign, createMode, editMode]);

  useEffect(() => {
    if (!selectedId && campaignsNormalizadas[0]?.id) {
      setSelectedId(campaignsNormalizadas[0].id);
    }
  }, [campaignsNormalizadas, selectedId]);

  const resumen = useMemo(
    () => ({
      total: campaignsNormalizadas.length,
      activas: campaignsNormalizadas.filter((c) => c.estado === "Activa").length,
      pausadas: campaignsNormalizadas.filter((c) => c.estado === "Pausada").length,
      cerradas: campaignsNormalizadas.filter((c) => c.estado === "Cerrada").length,
    }),
    [campaignsNormalizadas]
  );

  const limpiarMensajes = () => {
    setMessage("");
    setError("");
  };

  const startCreate = () => {
    setCreateMode(true);
    setEditMode(false);
    setSelectedId(null);
    setActiveTab("general");
    setForm(buildForm());
    limpiarMensajes();
  };

  const startEdit = () => {
    if (!selectedCampaign) return;
    setCreateMode(false);
    setEditMode(true);
    setActiveTab("general");
    setForm(buildForm(selectedCampaign));
    limpiarMensajes();
  };

  const cancelEdit = () => {
    setEditMode(false);
    setCreateMode(false);
    setForm(selectedCampaign ? buildForm(selectedCampaign) : buildForm());
    limpiarMensajes();
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
        setCampaigns((prev) => [nueva, ...(prev || [])]);
        setSelectedId(nueva.id);
        setCreateMode(false);
        setEditMode(false);
        setMessage("Campaña creada.");
      } else if (editMode && selectedCampaign) {
        const data = await apiFetch(`/campaigns/${selectedCampaign.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const actualizada = normalizeCampaign(data?.campaign || { ...selectedCampaign, ...payload });
        setCampaigns((prev) =>
          (prev || []).map((c) => (c.id === actualizada.id ? actualizada : c))
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

  const deleteCampaign = async () => {
    if (!selectedCampaign || !setCampaigns) return;

    const ok = window.confirm(
      `¿Seguro que deseas eliminar la campaña "${selectedCampaign.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!ok) return;

    try {
      setDeleting(true);
      limpiarMensajes();

      await apiFetch(`/campaigns/${selectedCampaign.id}`, {
        method: "DELETE",
      });

      setCampaigns((prev) => (prev || []).filter((c) => c.id !== selectedCampaign.id));
      setSelectedId(null);
      setEditMode(false);
      setCreateMode(false);
      setMessage("Campaña eliminada.");
    } catch (err) {
      setError(err.message || "No se pudo eliminar la campaña.");
    } finally {
      setDeleting(false);
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
      setCampaigns((prev) =>
        (prev || []).map((c) => (c.id === actualizada.id ? actualizada : c))
      );
      setForm((prev) => ({ ...prev, estado }));
      setMessage("Estado actualizado.");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado.");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const setProductItems = (kind, nextItems) => {
    setForm((prev) => ({
      ...prev,
      productos: {
        ...(prev.productos || {}),
        [kind]: asArray(nextItems),
      },
    }));
  };

  const setConfig = (patch) => {
    setForm((prev) => ({
      ...prev,
      configuracion: {
        ...(prev.configuracion || DEFAULT_CONFIG),
        ...patch,
      },
    }));
  };

  const setSteps = (steps) => {
    setForm((prev) => ({
      ...prev,
      steps,
      configuracion: {
        ...(prev.configuracion || DEFAULT_CONFIG),
        steps,
      },
    }));
  };

  const isEditing = createMode || editMode;

  return (
    <div className="space-y-6 campanas-page">
      <style>{`
        [data-crm-theme="light"] .campanas-page .crm-panel,
        [data-crm-theme="light"] .campanas-page .crm-panel-soft,
        [data-crm-theme="light"] .campanas-page .bg-white\/5,
        [data-crm-theme="silver"] .campanas-page .crm-panel,
        [data-crm-theme="silver"] .campanas-page .crm-panel-soft,
        [data-crm-theme="silver"] .campanas-page .bg-white\/5 {
          background: rgba(255,255,255,.92) !important;
          border-color: rgba(148,163,184,.35) !important;
          color: #0f172a !important;
        }
        [data-crm-theme="light"] .campanas-page .crm-title,
        [data-crm-theme="light"] .campanas-page .crm-heading,
        [data-crm-theme="light"] .campanas-page p,
        [data-crm-theme="light"] .campanas-page label,
        [data-crm-theme="silver"] .campanas-page .crm-title,
        [data-crm-theme="silver"] .campanas-page .crm-heading,
        [data-crm-theme="silver"] .campanas-page p,
        [data-crm-theme="silver"] .campanas-page label { color: #0f172a; }
        [data-crm-theme="light"] .campanas-page .crm-muted,
        [data-crm-theme="silver"] .campanas-page .crm-muted { color: #64748b !important; }
        [data-crm-theme="light"] .campanas-page .crm-label,
        [data-crm-theme="silver"] .campanas-page .crm-label { color: #0369a1 !important; }
        [data-crm-theme="light"] .campanas-page .crm-input,
        [data-crm-theme="silver"] .campanas-page .crm-input {
          background: #ffffff !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
        [data-crm-theme="light"] .campanas-page select option,
        [data-crm-theme="silver"] .campanas-page select option { color: #0f172a; background: #fff; }
      `}</style>
      <HeaderResumen resumen={resumen} />

      {message ? <Alert type="ok" text={message} /> : null}
      {error ? <Alert type="error" text={error} /> : null}

      <div className="crm-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_220px_auto]">
          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
              style={{ color: "inherit" }}
              placeholder="Buscar campaña"
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
                <option key={estado} className="text-black">{estado}</option>
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

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <CampaignList
          campaigns={campañasFiltradas}
          selectedId={selectedCampaign?.id}
          onSelect={(campaign) => {
            setSelectedId(campaign.id);
            setEditMode(false);
            setCreateMode(false);
            setActiveTab("general");
          }}
        />

        <div className="crm-panel overflow-hidden p-0">
          <div className="border-b border-white/10 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="crm-label">{isEditing ? "Constructor de campaña" : "Detalle de campaña"}</p>
                <h3 className="crm-title mt-1 text-xl">
                  {createMode ? "Nueva campaña" : selectedCampaign?.nombre || "Sin campaña"}
                </h3>
                <p className="crm-muted mt-1 text-sm">
                  Productos, flujo, diseño y campos dinámicos para FichasVenta.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!isEditing && selectedCampaign ? (
                  <>
                    <button
                      onClick={startEdit}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-300"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={deleteCampaign}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-100 px-4 py-2 font-medium text-rose-900 transition hover:bg-rose-200 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </>
                ) : null}

                {isEditing ? (
                  <>
                    <button
                      onClick={saveCampaign}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-2 font-medium text-emerald-900 transition hover:bg-emerald-200 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-300 disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {isEditing ? (
            <>
              <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

              <div className="p-5">
                {activeTab === "general" ? (
                  <GeneralTab
                    form={form}
                    setForm={updateForm}
                    responsables={responsablesDisponibles}
                  />
                ) : null}

                {activeTab === "flujo" ? (
                  <FlujoTab steps={form.steps} setSteps={setSteps} />
                ) : null}

                {activeTab === "bloques" ? (
                  <BloquesOfertaTab config={form.configuracion} setConfig={setConfig} />
                ) : null}

                {activeTab === "fibra" ? (
                  <ProductTab
                    title="Fibra"
                    icon={Wifi}
                    kind="fibra"
                    items={form.productos?.fibra}
                    setItems={(items) => setProductItems("fibra", items)}
                  />
                ) : null}

                {activeTab === "moviles" ? (
                  <ProductTab
                    title="Móviles"
                    icon={Smartphone}
                    kind="moviles"
                    items={form.productos?.moviles}
                    setItems={(items) => setProductItems("moviles", items)}
                    hasMaxQty
                  />
                ) : null}

                {activeTab === "tv" ? (
                  <ProductTab
                    title="Televisión"
                    icon={MonitorPlay}
                    kind="tv"
                    items={form.productos?.tv}
                    setItems={(items) => setProductItems("tv", items)}
                    compact
                  />
                ) : null}

                {activeTab === "promos" ? (
                  <PromosTab
                    items={form.promociones}
                    setItems={(items) => updateForm({ promociones: items })}
                  />
                ) : null}

                {activeTab === "diseno" ? (
                  <DisenoTab config={form.configuracion} setConfig={setConfig} />
                ) : null}

                {activeTab === "validacion" ? (
                  <ValidacionTab config={form.configuracion} setConfig={setConfig} />
                ) : null}

                {activeTab === "preview" ? (
                  <PreviewTab form={form} />
                ) : null}

                {activeTab === "campos" ? (
                  <CamposTab
                    fields={form.dynamicFields}
                    setFields={(fields) => updateForm({ dynamicFields: fields })}
                    blocks={form.customBlocks}
                    setBlocks={(customBlocks) => updateForm({ customBlocks })}
                    steps={form.steps}
                  />
                ) : null}
              </div>
            </>
          ) : selectedCampaign ? (
            <ReadOnlyDetail
              campaign={selectedCampaign}
              quickStatus={quickStatus}
            />
          ) : (
            <div className="p-5">
              <div className="crm-panel-soft p-4">
                <p className="crm-muted">Selecciona una campaña o crea una nueva.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeaderResumen({ resumen }) {
  const cards = [
    { label: "Total campañas", value: resumen.total, icon: BriefcaseBusiness, color: "text-cyan-500" },
    { label: "Activas", value: resumen.activas, icon: PlayCircle, color: "text-emerald-500" },
    { label: "Pausadas", value: resumen.pausadas, icon: PauseCircle, color: "text-amber-500" },
    { label: "Cerradas", value: resumen.cerradas, icon: Users, color: "text-rose-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="crm-panel p-6">
        <p className="crm-label">Campañas</p>
        <h2 className="crm-title mt-1 text-2xl">Constructor visual de campañas</h2>
        <p className="crm-muted mt-2 text-sm">
          Administra productos, promociones, flujo, diseño y campos dinámicos sin tocar código.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="crm-panel p-5">
            <div className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <p className="crm-label">{label}</p>
            </div>
            <p className="crm-kpi mt-3 text-3xl">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Alert({ type, text }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        type === "ok"
          ? "border-emerald-300 bg-emerald-100 text-emerald-800"
          : "border-rose-300 bg-rose-100 text-rose-800"
      }`}
    >
      {text}
    </div>
  );
}

function CampaignList({ campaigns, selectedId, onSelect }) {
  return (
    <div className="crm-panel p-5">
      <h3 className="crm-heading text-lg">Campañas registradas</h3>

      <div className="mt-4 space-y-3">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => {
            const active = selectedId === campaign.id;

            return (
              <button
                key={campaign.id}
                onClick={() => onSelect(campaign)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-slate-400 bg-slate-200/80 dark:border-white/20 dark:bg-slate-900"
                    : "crm-panel-soft hover:opacity-90"
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="crm-heading">{campaign.nombre || "Sin nombre"}</p>
                      <p className="crm-muted text-sm">{campaign.responsable || "Sin responsable"}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${estadoBadge(campaign.estado)}`}>
                      {campaign.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <MiniCount label="Fibra" value={campaign.productos?.fibra?.length || 0} />
                    <MiniCount label="Móvil" value={campaign.productos?.moviles?.length || 0} />
                    <MiniCount label="TV" value={campaign.productos?.tv?.length || 0} />
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
  );
}

function MiniCount({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
      <p className="font-semibold">{value}</p>
      <p className="crm-muted">{label}</p>
    </div>
  );
}

function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-5 py-3">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
            activeTab === key
              ? "border-cyan-300 bg-cyan-100 text-cyan-900"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

function GeneralTab({ form, setForm, responsables }) {
  return (
    <div className="space-y-5">
      <SectionTitle icon={BriefcaseBusiness} title="Datos generales" text="Información base de la campaña." />

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Nombre campaña" value={form.nombre} onChange={(v) => setForm({ nombre: v })} />

        <div>
          <label className="crm-label mb-2 block">Responsable</label>
          <select
            value={form.responsable}
            onChange={(e) => setForm({ responsable: e.target.value })}
            className="crm-input w-full px-4 py-3 outline-none"
            style={{ color: "inherit" }}
          >
            <option value="">Selecciona responsable</option>
            {responsables.map((u) => (
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
            onChange={(e) => setForm({ estado: e.target.value })}
            className="crm-input w-full px-4 py-3 outline-none"
            style={{ color: "inherit" }}
          >
            {ESTADOS.map((estado) => (
              <option key={estado}>{estado}</option>
            ))}
          </select>
        </div>

        <TextInput label="Canal" value={form.canal} onChange={(v) => setForm({ canal: v })} />
        <TextInput label="Objetivo" value={form.objetivo} onChange={(v) => setForm({ objetivo: v })} />
        <TextInput label="Arquitectura" value={form.configuracion?.arquitectura || ""} onChange={(v) => setForm({ configuracion: { ...(form.configuracion || {}), arquitectura: v } })} />

        <div>
          <label className="crm-label mb-2 block">Tipo campaña</label>
          <select
            value={form.configuracion?.tipoCampana || "telefonia"}
            onChange={(e) => {
              const tipo = e.target.value;
              setForm({
                configuracion: {
                  ...(form.configuracion || {}),
                  tipoCampana: tipo,
                  mostrarOferta: tipo === "telefonia",
                  mostrarFibra: tipo === "telefonia",
                  mostrarMoviles: tipo === "telefonia",
                  mostrarTv: tipo === "telefonia",
                  mostrarDescuento: tipo === "telefonia",
                },
              });
            }}
            className="crm-input w-full px-4 py-3 outline-none"
            style={{ color: "inherit" }}
          >
            <option value="telefonia">Telefonía / Telco</option>
            <option value="energia">Energía</option>
            <option value="seguros">Seguros</option>
            <option value="otros">Otros</option>
          </select>
        </div>


        <div className="md:col-span-2">
          <label className="crm-label mb-2 block">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ descripcion: e.target.value })}
            className="crm-input min-h-[110px] w-full px-4 py-3 outline-none"
            style={{ color: "inherit" }}
          />
        </div>
      </div>
    </div>
  );
}

function FlujoTab({ steps, setSteps }) {
  const safeSteps = asArray(steps, DEFAULT_STEPS);

  const updateStep = (index, patch) => {
    setSteps(safeSteps.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  };

  return (
    <div className="space-y-5">
      <SectionTitle icon={GripVertical} title="Flujo de ficha" text="Activa, desactiva o renombra pasos de FichasVenta." />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {safeSteps.map((step, index) => (
          <div key={step.key || index} className="crm-panel-soft p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-medium">{step.label}</p>
              <Toggle enabled={step.enabled !== false} onChange={(enabled) => updateStep(index, { enabled })} />
            </div>

            <input
              value={step.label || ""}
              onChange={(e) => updateStep(index, { label: e.target.value })}
              className="crm-input w-full px-4 py-3 outline-none"
              style={{ color: "inherit" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


function readImageAsDataUrl(file, onDone) {
  if (!file || !file.type?.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => onDone(reader.result);
  reader.readAsDataURL(file);
}


function BloquesOfertaTab({ config, setConfig }) {
  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) };
  const offerBlocks = asArray(cfg.offerBlocks, DEFAULT_OFFER_BLOCKS).map(normalizeBlock);
  const tvBlocks = asArray(cfg.tvBlocks, DEFAULT_TV_BLOCKS).map(normalizeTvBlock);

  const updateOfferBlock = (index, patch) => {
    setConfig({
      offerBlocks: offerBlocks.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  };

  const updateTvBlock = (index, patch) => {
    setConfig({
      tvBlocks: tvBlocks.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  };

  const addTvBlock = () => {
    setConfig({
      tvBlocks: [
        ...tvBlocks,
        {
          key: `TV_BLOCK_${Date.now()}`,
          title: "",
          mode: "seleccion",
          enabled: true,
        },
      ],
    });
  };

  const removeTvBlock = (index) => {
    setConfig({
      tvBlocks: tvBlocks.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={LayoutGrid}
        title="Bloques del configurador de oferta"
        text="Activa estos bloques solo para campañas de telefonía. Para Endesa, Naturgy o energía puedes desactivar Oferta completa desde Diseño."
      />

      <div className="crm-panel-soft p-4">
        <p className="crm-heading mb-3">Bloques principales de oferta</p>

        <div className="grid gap-3 md:grid-cols-3">
          {offerBlocks.map((item, index) => (
            <div key={item.key || index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-medium">{item.title || "Bloque"}</p>
                <Toggle enabled={item.enabled !== false} onChange={(enabled) => updateOfferBlock(index, { enabled })} />
              </div>

              <input
                value={item.title || ""}
                onChange={(e) => updateOfferBlock(index, { title: e.target.value })}
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
                placeholder="Nombre del bloque"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="crm-panel-soft p-4">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="crm-heading">Subbloques Vodafone TV</p>
            <p className="crm-muted text-sm">
              Solo el bloque marcado como catálogo TV abrirá las 24 promociones de TV en FichasVenta.
            </p>
          </div>

          <button
            onClick={addTvBlock}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900 transition hover:bg-cyan-200"
          >
            <Plus className="h-4 w-4" />
            Añadir bloque TV
          </button>
        </div>

        <div className="space-y-3">
          {tvBlocks.map((item, index) => (
            <div key={item.key || index} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_190px_90px_auto]">
              <input
                value={item.title || ""}
                onChange={(e) => updateTvBlock(index, { title: e.target.value })}
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
                placeholder="Nombre bloque TV"
              />

              <select
                value={item.mode || "seleccion"}
                onChange={(e) => updateTvBlock(index, { mode: e.target.value })}
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
              >
                <option value="seleccion">Solo selección</option>
                <option value="catalogo_tv">Abrir catálogo TV</option>
              </select>

              <Toggle enabled={item.enabled !== false} onChange={(enabled) => updateTvBlock(index, { enabled })} />

              <button
                onClick={() => removeTvBlock(index)}
                className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 font-medium text-rose-900 transition hover:bg-rose-200"
              >
                <Trash2 className="mx-auto h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductTab({ title, icon, kind, items, setItems, hasMaxQty = false, compact = false }) {
  const Icon = icon;
  const safeItems = asArray(items);

  const addItem = () => {
    setItems([
      ...safeItems,
      {
        ...emptyProduct,
        key: `${kind}_${Date.now()}`.toUpperCase(),
        title: "",
        subtitle: "",
        price: "",
        image: "",
        maxQty: 10,
        enabled: true,
      },
    ]);
  };

  const updateItem = (index, patch) => {
    setItems(safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index) => {
    setItems(safeItems.filter((_, i) => i !== index));
  };

  const moveItem = (index, direction) => {
    const next = [...safeItems];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SectionTitle
          icon={Icon}
          title={title}
          text="Productos editables que verá FichasVenta. El campo Precio se mostrará en la tarjeta de la ficha."
        />

        <button
          onClick={addItem}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900 transition hover:bg-cyan-200"
        >
          <Plus className="h-4 w-4" />
          Añadir producto
        </button>
      </div>

      <div className={`grid gap-4 ${compact ? "xl:grid-cols-2" : ""}`}>
        {safeItems.map((item, index) => (
          <div key={item.key || index} className="crm-panel-soft p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || "Producto"}
                      className="h-10 w-10 object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <Icon className="h-8 w-8 text-cyan-500" />
                  )}
                </div>

                <div>
                  <p className="crm-heading">
                    {item.title || `Producto ${index + 1}`}
                  </p>
                  <p className="crm-muted text-xs">
                    {item.price ? `Precio visible: ${item.price}` : "Precio pendiente"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Toggle enabled={item.enabled !== false} onChange={(enabled) => updateItem(index, { enabled })} />

                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  className="rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 font-medium text-slate-900"
                  title="Subir"
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  className="rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 font-medium text-slate-900"
                  title="Bajar"
                >
                  ↓
                </button>

                <button
                  onClick={() => removeItem(index)}
                  className="rounded-2xl border border-rose-300 bg-rose-100 px-3 py-2 font-medium text-rose-900 transition hover:bg-rose-200"
                  title="Eliminar"
                >
                  <Trash2 className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>

            <div className={`grid gap-3 ${hasMaxQty ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
              <LabeledProductInput
                label="Nombre"
                value={item.title || ""}
                placeholder={kind === "tv" ? "Vodafone TV con HBO Max" : "Nombre del producto"}
                onChange={(v) =>
                  updateItem(index, {
                    title: v,
                    key: item.key || slugify(v).toUpperCase(),
                  })
                }
              />

              <LabeledProductInput
                label="Detalle / velocidad"
                value={item.subtitle || ""}
                placeholder={kind === "fibra" ? "600 MB / 1 GB" : kind === "moviles" ? "30GB / 160GB" : "Descripción opcional"}
                onChange={(v) => updateItem(index, { subtitle: v })}
              />

              <LabeledProductInput
                label="Precio"
                value={item.price || ""}
                placeholder={kind === "tv" ? "11,00 € / mes" : "Precio"}
                onChange={(v) => updateItem(index, { price: v })}
              />

              {hasMaxQty ? (
                <LabeledProductInput
                  label="Máximo"
                  type="number"
                  value={item.maxQty ?? 10}
                  placeholder="10"
                  onChange={(v) => updateItem(index, { maxQty: Number(v || 10) })}
                />
              ) : null}
            </div>

            <div
              className="mt-4 rounded-2xl border border-dashed border-cyan-300/50 bg-cyan-50/10 p-3 text-sm"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                readImageAsDataUrl(e.dataTransfer.files?.[0], (image) => updateItem(index, { image }));
              }}
            >
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <LabeledProductInput
                  label="Imagen / logo"
                  value={item.image || ""}
                  placeholder="Ruta logo o imagen base64"
                  onChange={(v) => updateItem(index, { image: v })}
                />

                <div className="flex items-end">
                  <label className="inline-flex h-[46px] cursor-pointer items-center justify-center rounded-2xl border border-cyan-300 bg-cyan-100 px-4 font-medium text-cyan-900 transition hover:bg-cyan-200">
                    Subir imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => readImageAsDataUrl(e.target.files?.[0], (image) => updateItem(index, { image }))}
                    />
                  </label>
                </div>
              </div>

              <p className="crm-muted mt-2 text-xs">
                Puedes arrastrar una imagen aquí, subirla o pegar una ruta. El precio guardado aparecerá en FichasVenta.
              </p>
            </div>
          </div>
        ))}

        {!safeItems.length ? (
          <div className="crm-panel-soft p-4">
            <p className="crm-muted">No hay productos. Añade el primero.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LabeledProductInput({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div>
      <label className="crm-label mb-2 block">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="crm-input w-full px-4 py-3 outline-none"
        style={{ color: "inherit" }}
        placeholder={placeholder}
      />
    </div>
  );
}


function PromosTab({ items, setItems }) {
  const safeItems = asArray(items);

  const addPromo = () => {
    setItems([
      ...safeItems,
      {
        ...emptyPromo,
        key: `PROMO_${Date.now()}`,
      },
    ]);
  };

  const updatePromo = (index, patch) => {
    setItems(safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removePromo = (index) => {
    setItems(safeItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SectionTitle icon={Sparkles} title="Promociones" text="Descuentos y promociones disponibles para la ficha." />
        <button onClick={addPromo} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900 transition hover:bg-cyan-200">
          <Plus className="h-4 w-4" />
          Añadir promo
        </button>
      </div>

      <div className="space-y-3">
        {safeItems.map((item, index) => (
          <div key={item.key || index} className="grid gap-3 crm-panel-soft p-4 md:grid-cols-[1fr_160px_160px_90px_auto]">
            <input value={item.title || ""} onChange={(e) => updatePromo(index, { title: e.target.value, key: item.key || slugify(e.target.value).toUpperCase() })} className="crm-input px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Nombre promoción" />
            <input value={item.value || ""} onChange={(e) => updatePromo(index, { value: e.target.value })} className="crm-input px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Valor" />
            <select value={item.type || "importe"} onChange={(e) => updatePromo(index, { type: e.target.value })} className="crm-input px-4 py-3 outline-none" style={{ color: "inherit" }}>
              <option value="importe">Importe</option>
              <option value="porcentaje">Porcentaje</option>
              <option value="texto">Texto</option>
            </select>
            <Toggle enabled={item.enabled !== false} onChange={(enabled) => updatePromo(index, { enabled })} />
            <button onClick={() => removePromo(index)} className="rounded-2xl border border-rose-300 bg-rose-100 px-3 py-3 font-medium text-rose-900 transition hover:bg-rose-200">
              <Trash2 className="mx-auto h-4 w-4" />
            </button>
          </div>
        ))}

        {!safeItems.length ? (
          <div className="crm-panel-soft p-4">
            <p className="crm-muted">No hay promociones.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DisenoTab({ config, setConfig }) {
  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) };

  const options = [
    ["mostrarCliente", "Mostrar cliente"],
    ["mostrarDireccion", "Mostrar dirección"],
    ["mostrarOferta", "Mostrar oferta"],
    ["mostrarFibra", "Mostrar fibra"],
    ["mostrarMoviles", "Mostrar móviles"],
    ["mostrarTv", "Mostrar TV"],
    ["mostrarDescuento", "Mostrar descuento"],
    ["mostrarBanco", "Mostrar datos bancarios"],
    ["requiereIban", "Requiere IBAN"],
    ["mostrarComplementarios", "Mostrar complementarios"],
  ];

  return (
    <div className="space-y-5">
      <SectionTitle icon={Settings} title="Diseño y comportamiento" text="Controla qué bloques aparecen en FichasVenta. Para Endesa/Naturgy deja Oferta desactivada." />

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Máximo de móviles" value={cfg.maxMoviles} onChange={(v) => setConfig({ maxMoviles: Number(v || 10) })} />
        <TextInput label="Arquitectura" value={cfg.arquitectura} onChange={(v) => setConfig({ arquitectura: v })} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {options.map(([key, label]) => (
          <div key={key} className="crm-panel-soft flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{label}</p>
              <p className="crm-muted text-xs">Control visible en ficha</p>
            </div>
            <Toggle enabled={cfg[key] !== false} onChange={(enabled) => setConfig({ [key]: enabled })} />
          </div>
        ))}
      </div>
    </div>
  );
}


function ValidacionTab({ config, setConfig }) {
  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) };
  const rules = { ...(DEFAULT_CONFIG.validationRules || {}), ...(cfg.validationRules || {}) };

  const setRule = (key, value) => {
    setConfig({
      validationRules: {
        ...rules,
        [key]: value,
      },
    });
  };

  const ruleToggles = [
    ["requiereDocumento", "Documento obligatorio"],
    ["requiereTelefono", "Teléfono obligatorio"],
    ["requiereDireccion", "Dirección obligatoria"],
    ["requiereIBAN", "IBAN obligatorio"],
    ["permitirSinMovil", "Permitir cliente sin móvil"],
    ["validarDuplicadoDocumento", "Validar documento duplicado"],
    ["validarDuplicadoTelefono", "Validar teléfono duplicado"],
  ];

  return (
    <div className="space-y-5">
      <SectionTitle icon={CheckCircle2} title="Validación de ventas" text="Reglas que luego usará FichasVenta y el módulo Ventas para validar registros." />

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="Estado inicial de la venta"
          value={rules.estadoInicial || "PENDIENTE"}
          onChange={(v) => setRule("estadoInicial", String(v || "PENDIENTE").toUpperCase())}
        />
        <TextInput
          label="Máximo de móviles por venta"
          value={cfg.maxMoviles ?? 10}
          onChange={(v) => setConfig({ maxMoviles: Number(v || 10) })}
        />
        <div className="md:col-span-2">
          <TextInput
            label="Estados disponibles en Ventas (separados por coma)"
            value={asArray(cfg.estadosVenta, DEFAULT_CONFIG.estadosVenta).join(", ")}
            onChange={(v) => setConfig({ estadosVenta: String(v || "").split(",").map((x) => x.trim().toUpperCase()).filter(Boolean) })}
            placeholder="PENDIENTE, EN PROCESO, FINALIZADO, NO FAVORABLE"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ruleToggles.map(([key, label]) => (
          <div key={key} className="crm-panel-soft flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{label}</p>
              <p className="crm-muted text-xs">Regla para carga y validación</p>
            </div>
            <Toggle enabled={rules[key] !== false} onChange={(enabled) => setRule(key, enabled)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTab({ form }) {
  const fibra = asArray(form.productos?.fibra).filter((x) => x.enabled !== false);
  const moviles = asArray(form.productos?.moviles).filter((x) => x.enabled !== false);
  const tv = asArray(form.productos?.tv).filter((x) => x.enabled !== false);
  const cfg = { ...DEFAULT_CONFIG, ...(form.configuracion || {}) };

  return (
    <div className="space-y-5">
      <SectionTitle icon={Sparkles} title="Vista previa FichasVenta" text="Así se verá la campaña cuando el comercial cargue una ficha." />

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Campaña</p>
            <h3 className="mt-2 text-3xl font-black">{form.nombre || "Nueva campaña"}</h3>
            <p className="mt-1 text-slate-300">{form.descripcion || "Configuración de ficha dinámica"}</p>
          </div>
          <span className="rounded-full border border-emerald-300/40 bg-emerald-300/15 px-4 py-2 text-sm font-bold text-emerald-200">
            {form.estado || "Activa"}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <PreviewBox label="Fibra" value={fibra.length} items={fibra.slice(0, 3).map((x) => x.subtitle || x.title)} />
          <PreviewBox label="Móviles" value={moviles.length} items={moviles.slice(0, 3).map((x) => x.subtitle || x.title)} />
          <PreviewBox label="TV" value={tv.length} items={tv.slice(0, 3).map((x) => x.title)} />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Cliente", cfg.mostrarCliente],
            ["Dirección", cfg.mostrarDireccion],
            ["Oferta", cfg.mostrarOferta],
            ["Banco", cfg.mostrarBanco],
          ].map(([label, enabled]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold">{label}</p>
              <p className="mt-1 text-sm text-slate-300">{enabled !== false ? "Visible" : "Oculto"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewBox({ label, value, items }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
      <div className="mt-3 space-y-1 text-xs text-slate-300">
        {items.length ? items.map((x) => <p key={x}>• {x}</p>) : <p>Sin elementos</p>}
      </div>
    </div>
  );
}

function CamposTab({ fields, setFields, blocks, setBlocks, steps }) {
  const safeFields = asArray(fields);
  const safeBlocks = asArray(blocks);
  const safeSteps = asArray(steps, DEFAULT_STEPS);
  const [newField, setNewField] = useState(emptyField);
  const [newBlock, setNewBlock] = useState(emptyBlock);

  const destinations = [
    ...safeSteps.map((step) => ({ key: step.key, label: step.label, kind: "Paso" })),
    ...safeBlocks.map((block) => ({ key: block.key, label: block.label, kind: "Bloque" })),
  ];

  const addBlock = () => {
    const label = String(newBlock.label || "").trim();
    if (!label) return;
    const key = slugify(newBlock.key || label).toLowerCase();
    if (!key || destinations.some((item) => item.key === key)) return;
    setBlocks([...safeBlocks, { key, label }]);
    setNewBlock(emptyBlock);
  };

  const updateBlock = (index, patch) => {
    const previous = safeBlocks[index];
    const nextBlocks = safeBlocks.map((block, i) => (i === index ? { ...block, ...patch } : block));
    setBlocks(nextBlocks);

    if (patch.key && previous?.key && patch.key !== previous.key) {
      setFields(
        safeFields.map((field) =>
          (field.tab || field.step) === previous.key
            ? { ...field, step: patch.key, tab: patch.key }
            : field
        )
      );
    }
  };

  const removeBlock = (index) => {
    const removed = safeBlocks[index];
    setBlocks(safeBlocks.filter((_, i) => i !== index));
    setFields(
      safeFields.map((field) =>
        (field.tab || field.step) === removed?.key
          ? { ...field, step: "complementarios", tab: "complementarios" }
          : field
      )
    );
  };

  const addField = () => {
    if (!newField.label.trim()) return;
    const key = slugify(newField.key || newField.label).toLowerCase();
    const destination = newField.step || destinations[0]?.key || "complementarios";

    setFields([
      ...safeFields,
      {
        key,
        label: newField.label.trim(),
        type: newField.type,
        step: destination,
        tab: destination,
        required: Boolean(newField.required),
        options:
          newField.type === "select"
            ? newField.optionsText.split(",").map((x) => x.trim()).filter(Boolean)
            : [],
      },
    ]);

    setNewField(emptyField);
  };

  const updateField = (index, patch) => {
    setFields(safeFields.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  };

  const removeField = (index) => {
    setFields(safeFields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5 campaign-fields-builder">
      <SectionTitle icon={Layers3} title="Bloques y campos dinámicos" text="Crea bloques como Servicios, Luz o Gas y agrega CUPS, IBAN y cualquier otro campo requerido." />

      <div className="crm-panel-soft p-4">
        <p className="crm-label mb-3">Crear bloque</p>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input value={newBlock.label} onChange={(e) => setNewBlock((p) => ({ ...p, label: e.target.value, key: p.key || slugify(e.target.value) }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Ej.: Servicios de luz" />
          <input value={newBlock.key} onChange={(e) => setNewBlock((p) => ({ ...p, key: slugify(e.target.value) }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Clave: servicios_luz" />
          <button type="button" onClick={addBlock} className="rounded-2xl border border-violet-300 bg-violet-100 px-4 py-3 font-medium text-violet-900 transition hover:bg-violet-200">
            Crear bloque
          </button>
        </div>

        {safeBlocks.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {safeBlocks.map((block, index) => (
              <div key={block.key || index} className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 md:grid-cols-[1fr_1fr_auto]">
                <input value={block.label || ""} onChange={(e) => updateBlock(index, { label: e.target.value })} className="crm-input px-3 py-2 outline-none" style={{ color: "inherit" }} />
                <input value={block.key || ""} onChange={(e) => updateBlock(index, { key: slugify(e.target.value) })} className="crm-input px-3 py-2 outline-none" style={{ color: "inherit" }} />
                <button type="button" onClick={() => removeBlock(index)} className="rounded-xl border border-rose-300 bg-rose-100 px-3 text-rose-900">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="crm-panel-soft p-4">
        <p className="crm-label mb-3">Crear campo</p>
        <div className="grid gap-4 xl:grid-cols-[1fr_170px_210px_1fr_110px_auto]">
          <input value={newField.label} onChange={(e) => setNewField((p) => ({ ...p, label: e.target.value, key: p.key || slugify(e.target.value) }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Nombre del campo" />

          <select value={newField.type} onChange={(e) => setNewField((p) => ({ ...p, type: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }}>
            {FIELD_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>

          <select value={newField.step || destinations[0]?.key || ""} onChange={(e) => setNewField((p) => ({ ...p, step: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }}>
            {destinations.map((item) => <option key={item.key} value={item.key}>{item.kind}: {item.label}</option>)}
          </select>

          <input value={newField.optionsText} onChange={(e) => setNewField((p) => ({ ...p, optionsText: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Opciones separadas por coma" disabled={newField.type !== "select"} />

          <label className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium">
            <input type="checkbox" checked={Boolean(newField.required)} onChange={(e) => setNewField((p) => ({ ...p, required: e.target.checked }))} />
            Requerido
          </label>

          <button type="button" onClick={addField} className="rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900 transition hover:bg-cyan-200">
            Añadir
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {safeFields.map((field, index) => (
          <div key={field.key || index} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 xl:grid-cols-[1fr_160px_220px_110px_1fr_auto]">
            <input value={field.label || ""} onChange={(e) => updateField(index, { label: e.target.value })} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Etiqueta" />

            <select value={field.type || "text"} onChange={(e) => updateField(index, { type: e.target.value })} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }}>
              {FIELD_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>

            <select value={field.tab || field.step || "complementarios"} onChange={(e) => updateField(index, { step: e.target.value, tab: e.target.value })} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }}>
              {destinations.map((item) => <option key={item.key} value={item.key}>{item.kind}: {item.label}</option>)}
            </select>

            <label className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium">
              <input type="checkbox" checked={Boolean(field.required)} onChange={(e) => updateField(index, { required: e.target.checked })} />
              Requerido
            </label>

            <input value={asArray(field.options).join(", ")} onChange={(e) => updateField(index, { options: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Opciones" disabled={field.type !== "select"} />

            <button type="button" onClick={() => removeField(index)} className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 font-medium text-rose-900 transition hover:bg-rose-200">
              <Trash2 className="mx-auto h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadOnlyDetail({ campaign, quickStatus }) {
  return (
    <div className="space-y-4 p-5">
      <div className="crm-panel-soft p-4">
        <p className="crm-label">Campaña</p>
        <p className="crm-title mt-1 text-lg">{campaign.nombre}</p>
        <p className="crm-muted mt-2 text-sm">{campaign.configuracion?.arquitectura || "wizard_offer_v1"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoBox label="Responsable" value={campaign.responsable || "-"} />
        <InfoBox label="Estado" value={campaign.estado || "-"} />
      </div>

      <div className="crm-panel-soft p-4">
        <p className="crm-label mb-3">Catálogos</p>
        <div className="grid gap-3 md:grid-cols-3">
          <CatalogCount label="Fibra" value={campaign.productos?.fibra?.length || 0} />
          <CatalogCount label="Móviles" value={campaign.productos?.moviles?.length || 0} />
          <CatalogCount label="TV" value={campaign.productos?.tv?.length || 0} />
        </div>
      </div>

      <div className="crm-panel-soft p-4">
        <p className="crm-label mb-3">Cambio rápido de estado</p>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((estado) => (
            <button key={estado} onClick={() => quickStatus(estado)} className={`rounded-full border px-4 py-2 text-sm font-medium ${estadoBadge(estado)}`}>
              {estado}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="crm-panel-soft p-4">
      <p className="crm-label">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

function CatalogCount({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="font-medium">{label}</p>
      <p className="crm-muted mt-1 text-sm">{value} elemento(s)</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, text }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-cyan-500" />
        <h3 className="crm-heading text-lg">{title}</h3>
      </div>
      {text ? <p className="crm-muted mt-1 text-sm">{text}</p> : null}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="crm-label mb-2 block">{label}</label>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="crm-input w-full px-4 py-3 outline-none"
        style={{ color: "inherit" }}
        placeholder={placeholder}
      />
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
        enabled
          ? "border-emerald-300 bg-emerald-100 text-emerald-800"
          : "border-slate-300 bg-slate-100 text-slate-700"
      }`}
    >
      {enabled ? <CheckCircle2 className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
      {enabled ? "Activo" : "Off"}
    </button>
  );
}
