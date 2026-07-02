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
  PlayCircle,
  PauseCircle,
  Users,
  Wifi,
  Smartphone,
  MonitorPlay,
  Layers3,
  Settings,
  Tag,
  Workflow,
  SlidersHorizontal,
} from "lucide-react";

const ESTADOS = ["Activa", "Pausada", "Cerrada"];

const TABS = [
  { key: "general", label: "General", icon: BriefcaseBusiness },
  { key: "flujo", label: "Flujo", icon: Workflow },
  { key: "fibra", label: "Fibra", icon: Wifi },
  { key: "moviles", label: "Móviles", icon: Smartphone },
  { key: "tv", label: "TV", icon: MonitorPlay },
  { key: "promos", label: "Promociones", icon: Tag },
  { key: "config", label: "Configuración", icon: Settings },
  { key: "campos", label: "Campos", icon: Layers3 },
];

const STEP_OPTIONS = [
  { key: "cliente", label: "Cliente" },
  { key: "oferta", label: "Oferta" },
  { key: "facturacion_banco", label: "Facturación y banco" },
  { key: "complementarios", label: "Complementarios" },
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

const DEFAULT_STEPS = STEP_OPTIONS.map((step, index) => ({
  ...step,
  enabled: true,
  order: index + 1,
}));

const DEFAULT_FIBRA = [
  { key: "FIBRA_600_MB", title: "Fibra 600 Mb", subtitle: "600 MB", price: "", image: "", enabled: true },
  { key: "FIBRA_1_GB", title: "Fibra 1 Gb", subtitle: "1 GB", price: "", image: "", enabled: true },
  { key: "FIBRA_600_MB_NEBA", title: "Fibra 600 Mb", subtitle: "600 MB NEBA", price: "", image: "", enabled: true },
  { key: "FIBRA_1_GB_NEBA", title: "Fibra 1 Gb", subtitle: "1 GB NEBA", price: "", image: "", enabled: true },
];

const DEFAULT_MOVILES = [
  { key: "MOVIL_30GB", title: "Móvil 30GB", subtitle: "30GB", price: "", maxQty: 10, image: "", enabled: true },
  { key: "MOVIL_60GB", title: "Móvil 60GB", subtitle: "60GB", price: "", maxQty: 10, image: "", enabled: true },
  { key: "MOVIL_160GB", title: "Móvil 160GB", subtitle: "160GB", price: "", maxQty: 10, image: "", enabled: true },
  { key: "MOVIL_ILIMITADA", title: "Móvil ilimitada", subtitle: "ILIMITADA", price: "", maxQty: 10, image: "", enabled: true },
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
].map(([title, price]) => ({
  key: slugify(title).toUpperCase(),
  title,
  subtitle: "",
  price,
  image: "",
  enabled: true,
}));

const DEFAULT_FIELDS = [
  { key: "tipo_documento_vodafone", label: "Tipo documento", type: "select", step: "cliente", options: ["N.I.F.", "N.I.E.", "C.I.F.", "PASAPORTE"], required: true },
  { key: "nif_nie_cif", label: "NIF", type: "nif_nie_cif", step: "cliente", required: true },
  { key: "nombre", label: "Nombre", type: "text", step: "cliente", required: true },
  { key: "apellidos", label: "Apellidos", type: "text", step: "cliente", required: true },
  { key: "correo", label: "Email", type: "email", step: "cliente" },
  { key: "movil_contacto", label: "Tlf móvil comunicaciones", type: "movil_contacto", step: "cliente" },
  { key: "segmento_vodafone", label: "Segmento Vodafone", type: "select", step: "cliente", options: ["PARTICULAR", "MICRO"], required: true },
  { key: "direccion", label: "Dirección", type: "text", step: "cliente", required: true },
  { key: "promo_codigo", label: "Promoción", type: "text", step: "facturacion_banco" },
  { key: "tipo_factura_vodafone", label: "Tipo de facturación", type: "select", step: "facturacion_banco", options: ["Factura electrónica", "Factura en papel"], required: true },
  { key: "iban", label: "IBAN de la cuenta", type: "iban", step: "facturacion_banco", required: true },
  { key: "comentario", label: "Observaciones", type: "textarea", step: "complementarios" },
];

const DEFAULT_CONFIG = {
  maxMoviles: 10,
  mostrarCliente: true,
  mostrarDireccion: true,
  mostrarOferta: true,
  mostrarBanco: true,
  mostrarComplementarios: true,
  mostrarDescuento: true,
  requiereIban: true,
  nombreBotonSmart: "Aplicar descuento",
};

const EMPTY_PROMO = {
  key: "",
  title: "",
  discount: "",
  enabled: true,
};

const EMPTY_FIELD = {
  key: "",
  label: "",
  type: "text",
  step: "cliente",
  required: false,
  optionsText: "",
};

const EMPTY_PRODUCT = {
  key: "",
  title: "",
  subtitle: "",
  price: "",
  image: "",
  maxQty: 10,
  enabled: true,
};

const emptyCampaign = {
  nombre: "",
  responsable: "",
  estado: "Activa",
  descripcion: "",
  arquitectura: "wizard_offer_v1",
  steps: DEFAULT_STEPS,
  fibraOptions: DEFAULT_FIBRA,
  mobileOptions: DEFAULT_MOVILES,
  tvOptions: DEFAULT_TV,
  promociones: [],
  configuracion: DEFAULT_CONFIG,
  dynamicFields: DEFAULT_FIELDS,
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeProduct(item = {}, index = 0, prefix = "ITEM") {
  const title = item.title || item.nombre || item.label || "";
  return {
    key: item.key || slugify(title || `${prefix}_${index + 1}`).toUpperCase(),
    title,
    subtitle: item.subtitle || item.plan || item.velocidad || "",
    price: item.price || item.precio || "",
    image: item.image || item.imagen || "",
    maxQty: Number(item.maxQty ?? item.max_qty ?? 10),
    enabled: item.enabled !== false,
  };
}

function normalizeStep(step = {}, index = 0) {
  return {
    key: step.key || `step_${index + 1}`,
    label: step.label || `Paso ${index + 1}`,
    enabled: step.enabled !== false,
    order: Number(step.order || index + 1),
  };
}

function normalizeField(field = {}, index = 0) {
  const label = field.label || field.nombre || "";
  return {
    key: field.key || slugify(label || `field_${index + 1}`),
    label,
    type: field.type || "text",
    step: field.step || field.tab || "cliente",
    required: Boolean(field.required),
    options: asArray(field.options || field.opciones),
  };
}

function normalizePromo(item = {}, index = 0) {
  const title = item.title || item.nombre || item.label || "";
  return {
    key: item.key || slugify(title || `PROMO_${index + 1}`).toUpperCase(),
    title,
    discount: item.discount || item.descuento || item.price || "",
    enabled: item.enabled !== false,
  };
}

function normalizeCampaign(campaign) {
  if (!campaign) return clone(emptyCampaign);

  const productos = campaign.productos || {};
  const configuracion = {
    ...DEFAULT_CONFIG,
    ...(campaign.configuracion || {}),
  };

  return {
    id: campaign.id ?? null,
    nombre: campaign.nombre ?? "",
    responsable: campaign.responsable ?? "",
    estado: campaign.estado ?? "Activa",
    descripcion: campaign.descripcion ?? "",
    arquitectura: campaign.arquitectura || configuracion.arquitectura || "wizard_offer_v1",
    steps: asArray(campaign.steps || configuracion.steps).length
      ? asArray(campaign.steps || configuracion.steps).map(normalizeStep)
      : clone(DEFAULT_STEPS),
    fibraOptions: asArray(campaign.fibraOptions || productos.fibra).length
      ? asArray(campaign.fibraOptions || productos.fibra).map((x, i) => normalizeProduct(x, i, "FIBRA"))
      : clone(DEFAULT_FIBRA),
    mobileOptions: asArray(campaign.mobileOptions || productos.moviles).length
      ? asArray(campaign.mobileOptions || productos.moviles).map((x, i) => normalizeProduct(x, i, "MOVIL"))
      : clone(DEFAULT_MOVILES),
    tvOptions: asArray(campaign.tvOptions || productos.tv).length
      ? asArray(campaign.tvOptions || productos.tv).map((x, i) => normalizeProduct(x, i, "TV"))
      : clone(DEFAULT_TV),
    promociones: asArray(campaign.promociones).map(normalizePromo),
    configuracion,
    dynamicFields: asArray(campaign.dynamicFields || campaign.customFields).length
      ? asArray(campaign.dynamicFields || campaign.customFields).map(normalizeField)
      : clone(DEFAULT_FIELDS),
  };
}

function buildPayload(form) {
  const steps = asArray(form.steps).map((step, index) => ({
    key: step.key || `step_${index + 1}`,
    label: step.label || `Paso ${index + 1}`,
    enabled: step.enabled !== false,
    order: index + 1,
  }));

  const fibraOptions = asArray(form.fibraOptions).map((item, index) => ({
    key: item.key || slugify(item.title || `fibra_${index + 1}`).toUpperCase(),
    title: item.title || "",
    subtitle: item.subtitle || "",
    price: item.price || "",
    image: item.image || "",
    enabled: item.enabled !== false,
  }));

  const mobileOptions = asArray(form.mobileOptions).map((item, index) => ({
    key: item.key || slugify(item.title || `movil_${index + 1}`).toUpperCase(),
    title: item.title || "",
    subtitle: item.subtitle || "",
    price: item.price || "",
    image: item.image || "",
    maxQty: Number(item.maxQty ?? 10),
    enabled: item.enabled !== false,
  }));

  const tvOptions = asArray(form.tvOptions).map((item, index) => ({
    key: item.key || slugify(item.title || `tv_${index + 1}`).toUpperCase(),
    title: item.title || "",
    subtitle: item.subtitle || "",
    price: item.price || "",
    image: item.image || "",
    enabled: item.enabled !== false,
  }));

  const dynamicFields = asArray(form.dynamicFields).map((field, index) => ({
    key: field.key || slugify(field.label || `field_${index + 1}`),
    label: field.label || "",
    type: field.type || "text",
    step: field.step || "cliente",
    tab: field.step || "cliente",
    required: Boolean(field.required),
    options: field.type === "select" ? asArray(field.options) : [],
  }));

  const promociones = asArray(form.promociones).map((promo, index) => ({
    key: promo.key || slugify(promo.title || `promo_${index + 1}`).toUpperCase(),
    title: promo.title || "",
    discount: promo.discount || "",
    enabled: promo.enabled !== false,
  }));

  return {
    nombre: form.nombre,
    responsable: form.responsable,
    estado: form.estado,
    descripcion: form.descripcion,
    arquitectura: form.arquitectura,
    steps,
    fibraOptions,
    mobileOptions,
    tvOptions,
    dynamicFields,
    customFields: dynamicFields,
    productos: {
      fibra: fibraOptions,
      moviles: mobileOptions,
      tv: tvOptions,
    },
    promociones,
    configuracion: {
      ...(form.configuracion || DEFAULT_CONFIG),
      arquitectura: form.arquitectura,
      steps,
    },
  };
}

function estadoBadge(estado) {
  if (estado === "Activa") return "border-emerald-700/40 bg-emerald-100 text-emerald-800";
  if (estado === "Pausada") return "border-amber-700/40 bg-amber-100 text-amber-800";
  if (estado === "Cerrada") return "border-rose-700/40 bg-rose-100 text-rose-800";
  return "border-slate-400 bg-slate-100 text-slate-800";
}

function TextInput({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="crm-label mb-2 block">{label}</label>
      <input
        value={value || ""}
        onChange={onChange}
        className="crm-input w-full px-4 py-3 outline-none"
        style={{ color: "inherit" }}
        placeholder={placeholder}
      />
    </div>
  );
}

function ProductEditor({ title, icon: Icon, items, setItems, kind }) {
  const safeItems = asArray(items);

  const addItem = () => {
    const nuevo = {
      ...EMPTY_PRODUCT,
      key: `${kind}_${Date.now()}`.toUpperCase(),
      enabled: true,
    };
    setItems([...safeItems, nuevo]);
  };

  const updateItem = (index, patch) => {
    setItems(safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index) => {
    setItems(safeItems.filter((_, i) => i !== index));
  };

  return (
    <div className="crm-panel-soft p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-cyan-500" />
          <p className="crm-heading">{title}</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-900 transition hover:bg-cyan-200"
        >
          <Plus className="h-4 w-4" />
          Añadir
        </button>
      </div>

      <div className="space-y-3">
        {safeItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/30 p-5 text-sm text-slate-500">
            No hay elementos. Pulsa Añadir para crear uno.
          </div>
        ) : null}

        {safeItems.map((item, index) => (
          <div
            key={item.key || index}
            className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.1fr_0.9fr_0.8fr_1fr_110px_80px]"
          >
            <input
              value={item.title || ""}
              onChange={(e) => {
                const title = e.target.value;
                updateItem(index, {
                  title,
                  key: item.key || slugify(title).toUpperCase(),
                });
              }}
              className="crm-input w-full px-4 py-3 outline-none"
              placeholder="Nombre"
              style={{ color: "inherit" }}
            />

            <input
              value={item.subtitle || ""}
              onChange={(e) => updateItem(index, { subtitle: e.target.value })}
              className="crm-input w-full px-4 py-3 outline-none"
              placeholder={kind === "tv" ? "Descripción" : "Velocidad / GB"}
              style={{ color: "inherit" }}
            />

            <input
              value={item.price || ""}
              onChange={(e) => updateItem(index, { price: e.target.value })}
              className="crm-input w-full px-4 py-3 outline-none"
              placeholder="Precio"
              style={{ color: "inherit" }}
            />

            <input
              value={item.image || ""}
              onChange={(e) => updateItem(index, { image: e.target.value })}
              className="crm-input w-full px-4 py-3 outline-none"
              placeholder="URL imagen"
              style={{ color: "inherit" }}
            />

            {kind === "movil" ? (
              <input
                type="number"
                min="1"
                max="10"
                value={item.maxQty ?? 10}
                onChange={(e) => updateItem(index, { maxQty: Number(e.target.value || 10) })}
                className="crm-input w-full px-4 py-3 outline-none"
                placeholder="Máx"
                style={{ color: "inherit" }}
              />
            ) : (
              <input
                value={item.key || ""}
                onChange={(e) => updateItem(index, { key: slugify(e.target.value).toUpperCase() })}
                className="crm-input w-full px-4 py-3 outline-none"
                placeholder="KEY"
                style={{ color: "inherit" }}
              />
            )}

            <div className="flex items-center justify-end gap-2">
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium">
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
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromoEditor({ promociones, setPromociones }) {
  const safePromos = asArray(promociones);

  const addPromo = () => {
    setPromociones([...safePromos, { ...EMPTY_PROMO, key: `PROMO_${Date.now()}` }]);
  };

  const updatePromo = (index, patch) => {
    setPromociones(safePromos.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removePromo = (index) => {
    setPromociones(safePromos.filter((_, i) => i !== index));
  };

  return (
    <div className="crm-panel-soft p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-cyan-500" />
          <p className="crm-heading">Promociones y descuentos</p>
        </div>
        <button onClick={addPromo} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-900">
          <Plus className="h-4 w-4" /> Añadir promo
        </button>
      </div>

      <div className="space-y-3">
        {safePromos.length === 0 ? <p className="crm-muted text-sm">No hay promociones configuradas.</p> : null}
        {safePromos.map((promo, index) => (
          <div key={promo.key || index} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_160px_120px_70px]">
            <input
              value={promo.title || ""}
              onChange={(e) => {
                const title = e.target.value;
                updatePromo(index, { title, key: promo.key || slugify(title).toUpperCase() });
              }}
              className="crm-input w-full px-4 py-3 outline-none"
              placeholder="Nombre de promoción"
              style={{ color: "inherit" }}
            />
            <input
              value={promo.discount || ""}
              onChange={(e) => updatePromo(index, { discount: e.target.value })}
              className="crm-input w-full px-4 py-3 outline-none"
              placeholder="Descuento"
              style={{ color: "inherit" }}
            />
            <label className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium">
              <input type="checkbox" checked={promo.enabled !== false} onChange={(e) => updatePromo(index, { enabled: e.target.checked })} /> On
            </label>
            <button onClick={() => removePromo(index)} className="rounded-2xl border border-rose-300 bg-rose-100 px-3 py-3 text-rose-900">
              <Trash2 className="mx-auto h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfigEditor({ config, setConfig }) {
  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) };
  const update = (key, value) => setConfig({ ...cfg, [key]: value });

  return (
    <div className="crm-panel-soft p-4">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-cyan-500" />
        <p className="crm-heading">Configuración de ficha</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TextInput label="Máximo de móviles" value={cfg.maxMoviles} onChange={(e) => update("maxMoviles", Number(e.target.value || 10))} />
        <TextInput label="Nombre botón descuento" value={cfg.nombreBotonSmart} onChange={(e) => update("nombreBotonSmart", e.target.value)} />

        {[
          ["mostrarCliente", "Mostrar cliente"],
          ["mostrarDireccion", "Mostrar dirección"],
          ["mostrarOferta", "Mostrar oferta"],
          ["mostrarBanco", "Mostrar banco"],
          ["mostrarComplementarios", "Mostrar complementarios"],
          ["mostrarDescuento", "Mostrar descuento"],
          ["requiereIban", "IBAN obligatorio"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium">
            {label}
            <input type="checkbox" checked={Boolean(cfg[key])} onChange={(e) => update(key, e.target.checked)} />
          </label>
        ))}
      </div>
    </div>
  );
}

function FieldsEditor({ fields, setFields, steps }) {
  const safeFields = asArray(fields);
  const safeSteps = asArray(steps).length ? asArray(steps) : DEFAULT_STEPS;
  const [newField, setNewField] = useState(EMPTY_FIELD);

  const addField = () => {
    if (!newField.label.trim()) return;
    const key = slugify(newField.key || newField.label).toLowerCase() || `field_${Date.now()}`;
    setFields([
      ...safeFields,
      {
        key,
        label: newField.label.trim(),
        type: newField.type,
        step: newField.step,
        required: Boolean(newField.required),
        options: newField.type === "select" ? newField.optionsText.split(",").map((x) => x.trim()).filter(Boolean) : [],
      },
    ]);
    setNewField(EMPTY_FIELD);
  };

  const updateField = (key, patch) => {
    setFields(safeFields.map((field) => (field.key === key ? { ...field, ...patch } : field)));
  };

  const removeField = (key) => {
    setFields(safeFields.filter((field) => field.key !== key));
  };

  return (
    <div className="crm-panel-soft p-4">
      <div className="mb-4 flex items-center gap-2">
        <Layers3 className="h-4 w-4 text-cyan-500" />
        <p className="crm-heading">Campos dinámicos por paso</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_150px_170px_1fr_auto]">
        <input value={newField.label} onChange={(e) => setNewField((p) => ({ ...p, label: e.target.value, key: p.key || slugify(e.target.value) }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Nombre del campo" />
        <select value={newField.type} onChange={(e) => setNewField((p) => ({ ...p, type: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }}>
          {FIELD_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select value={newField.step} onChange={(e) => setNewField((p) => ({ ...p, step: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }}>
          {safeSteps.map((step) => <option key={step.key} value={step.key}>{step.label}</option>)}
        </select>
        <input value={newField.optionsText} onChange={(e) => setNewField((p) => ({ ...p, optionsText: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Opciones separadas por coma" disabled={newField.type !== "select"} />
        <button onClick={addField} className="rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900">Añadir</button>
      </div>

      <div className="mt-4 space-y-3">
        {safeFields.map((field) => (
          <div key={field.key} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_150px_170px_90px_1fr_70px]">
            <input value={field.label || ""} onChange={(e) => updateField(field.key, { label: e.target.value })} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Etiqueta" />
            <select value={field.type || "text"} onChange={(e) => updateField(field.key, { type: e.target.value })} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }}>
              {FIELD_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <select value={field.step || "cliente"} onChange={(e) => updateField(field.key, { step: e.target.value })} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }}>
              {safeSteps.map((step) => <option key={step.key} value={step.key}>{step.label}</option>)}
            </select>
            <label className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium">
              <input type="checkbox" checked={Boolean(field.required)} onChange={(e) => updateField(field.key, { required: e.target.checked })} /> Req.
            </label>
            <input value={asArray(field.options).join(", ")} onChange={(e) => updateField(field.key, { options: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} placeholder="Opciones" disabled={field.type !== "select"} />
            <button onClick={() => removeField(field.key)} className="rounded-2xl border border-rose-300 bg-rose-100 px-3 py-3 text-rose-900">
              <Trash2 className="mx-auto h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowEditor({ steps, setSteps }) {
  const safeSteps = asArray(steps).length ? asArray(steps) : DEFAULT_STEPS;
  return (
    <div className="crm-panel-soft p-4">
      <div className="mb-4 flex items-center gap-2">
        <Workflow className="h-4 w-4 text-cyan-500" />
        <p className="crm-heading">Pasos del flujo</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {safeSteps.map((step, index) => (
          <div key={step.key || index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-medium">{index + 1}. {step.label}</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={step.enabled !== false} onChange={(e) => setSteps(safeSteps.map((item, i) => i === index ? { ...item, enabled: e.target.checked } : item))} /> On
              </label>
            </div>
            <input value={step.label || ""} onChange={(e) => setSteps(safeSteps.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Campanas({ campaigns = [], setCampaigns, users = [] }) {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todas");
  const [selectedId, setSelectedId] = useState(campaigns[0]?.id || null);
  const [form, setForm] = useState(clone(emptyCampaign));
  const [activeTab, setActiveTab] = useState("general");
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const responsablesDisponibles = useMemo(
    () => users.filter((u) => ["Gerente", "Admin", "Supervisor", "Backoffice"].includes(u.rol) && u.estado === "Activo"),
    [users]
  );

  const campañasFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return asArray(campaigns).filter((c) => {
      const coincideBusqueda = !q || [c.nombre, c.responsable, c.estado, c.descripcion].join(" ").toLowerCase().includes(q);
      const coincideEstado = estadoFiltro === "Todas" ? true : c.estado === estadoFiltro;
      return coincideBusqueda && coincideEstado;
    });
  }, [campaigns, search, estadoFiltro]);

  const selectedCampaign = asArray(campaigns).find((c) => c.id === selectedId) || campañasFiltradas[0] || null;

  useEffect(() => {
    if (selectedCampaign && !createMode) setForm(normalizeCampaign(selectedCampaign));
  }, [selectedCampaign, createMode]);

  const resumen = useMemo(() => ({
    total: asArray(campaigns).length,
    activas: asArray(campaigns).filter((c) => c.estado === "Activa").length,
    pausadas: asArray(campaigns).filter((c) => c.estado === "Pausada").length,
    cerradas: asArray(campaigns).filter((c) => c.estado === "Cerrada").length,
  }), [campaigns]);

  const limpiarMensajes = () => { setMessage(""); setError(""); };

  const startCreate = () => {
    setCreateMode(true);
    setEditMode(false);
    setSelectedId(null);
    setForm(clone(emptyCampaign));
    setActiveTab("general");
    limpiarMensajes();
  };

  const startEdit = () => {
    if (!selectedCampaign) return;
    setCreateMode(false);
    setEditMode(true);
    setForm(normalizeCampaign(selectedCampaign));
    setActiveTab("general");
    limpiarMensajes();
  };

  const cancelEdit = () => {
    setEditMode(false);
    setCreateMode(false);
    setForm(selectedCampaign ? normalizeCampaign(selectedCampaign) : clone(emptyCampaign));
    limpiarMensajes();
  };

  const saveCampaign = async () => {
    if (!setCampaigns) return;
    try {
      setLoading(true);
      limpiarMensajes();
      const payload = buildPayload(form);
      if (createMode) {
        const data = await apiFetch("/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const nueva = normalizeCampaign(data?.campaign || payload);
        setCampaigns((prev) => [nueva, ...asArray(prev)]);
        setSelectedId(nueva.id);
        setCreateMode(false);
        setMessage("Campaña creada.");
      } else if (editMode && selectedCampaign) {
        const data = await apiFetch(`/campaigns/${selectedCampaign.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const actualizada = normalizeCampaign(data?.campaign || { ...selectedCampaign, ...payload });
        setCampaigns((prev) => asArray(prev).map((c) => (c.id === actualizada.id ? actualizada : c)));
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
    const ok = window.confirm(`¿Seguro que deseas eliminar la campaña ${selectedCampaign.nombre}?`);
    if (!ok) return;
    try {
      setLoading(true);
      limpiarMensajes();
      await apiFetch(`/campaigns/${selectedCampaign.id}`, { method: "DELETE" });
      setCampaigns((prev) => asArray(prev).filter((c) => c.id !== selectedCampaign.id));
      setSelectedId(null);
      setCreateMode(false);
      setEditMode(false);
      setForm(clone(emptyCampaign));
      setMessage("Campaña eliminada.");
    } catch (err) {
      setError(err.message || "No se pudo eliminar la campaña.");
    } finally {
      setLoading(false);
    }
  };

  const quickStatus = async (estado) => {
    if (!selectedCampaign || !setCampaigns) return;
    try {
      setLoading(true);
      limpiarMensajes();
      const data = await apiFetch(`/campaigns/${selectedCampaign.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado }) });
      const actualizada = normalizeCampaign(data?.campaign || { ...selectedCampaign, estado });
      setCampaigns((prev) => asArray(prev).map((c) => (c.id === actualizada.id ? actualizada : c)));
      setForm((prev) => ({ ...prev, estado }));
      setMessage("Estado actualizado.");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado.");
    } finally {
      setLoading(false);
    }
  };

  const isEditing = createMode || editMode;

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Campañas</p>
        <h2 className="crm-title mt-1 text-2xl">Centro de configuración comercial</h2>
        <p className="crm-muted mt-2 text-sm">Administra productos, promociones, flujo, campos y diseño de cada ficha comercial.</p>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm text-rose-800">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={BriefcaseBusiness} label="Total campañas" value={resumen.total} color="text-cyan-500" />
        <Kpi icon={PlayCircle} label="Activas" value={resumen.activas} color="text-emerald-500" />
        <Kpi icon={PauseCircle} label="Pausadas" value={resumen.pausadas} color="text-amber-500" />
        <Kpi icon={Users} label="Cerradas" value={resumen.cerradas} color="text-rose-500" />
      </div>

      <div className="crm-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_220px_auto]">
          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent outline-none placeholder:text-slate-500" style={{ color: "inherit" }} placeholder="Buscar campaña" />
          </div>
          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Filter className="h-4 w-4 text-slate-500" />
            <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className="w-full bg-transparent outline-none" style={{ color: "inherit" }}>
              <option className="text-black">Todas</option>
              {ESTADOS.map((estado) => <option key={estado} className="text-black">{estado}</option>)}
            </select>
          </div>
          <button onClick={startCreate} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-3 font-medium text-cyan-900 transition hover:bg-cyan-200">
            <Plus className="h-4 w-4" /> Nueva campaña
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">Campañas registradas</h3>
          <div className="mt-4 space-y-3">
            {campañasFiltradas.length > 0 ? campañasFiltradas.map((campaign) => {
              const active = selectedCampaign?.id === campaign.id;
              return (
                <button key={campaign.id} onClick={() => { setSelectedId(campaign.id); setEditMode(false); setCreateMode(false); }} className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-slate-400 bg-slate-200/80 dark:border-white/20 dark:bg-slate-900" : "crm-panel-soft hover:opacity-90"}`}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="crm-heading">{campaign.nombre}</p>
                      <p className="crm-muted text-sm">{campaign.responsable || "Sin responsable"}</p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{campaign.arquitectura || "wizard_offer_v1"}</p>
                    </div>
                    <span className={`rounded-full border px-4 py-2 text-sm font-medium ${estadoBadge(campaign.estado)}`}>{campaign.estado}</span>
                  </div>
                </button>
              );
            }) : <div className="crm-panel-soft p-4"><p className="crm-muted text-sm">No hay campañas para mostrar.</p></div>}
          </div>
        </div>

        <div className="crm-panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="crm-heading text-lg">{createMode ? "Nueva campaña" : isEditing ? "Editar campaña" : "Detalle de campaña"}</h3>
            <div className="flex flex-wrap gap-2">
              {!createMode && !editMode && selectedCampaign ? (
                <>
                  <button onClick={startEdit} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-300"><Pencil className="h-4 w-4" /> Editar</button>
                  <button onClick={deleteCampaign} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-100 px-4 py-2 font-medium text-rose-900 transition hover:bg-rose-200"><Trash2 className="h-4 w-4" /> Eliminar</button>
                </>
              ) : null}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                {TABS.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setActiveTab(key)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === key ? "bg-cyan-100 text-cyan-900" : "hover:bg-white/10"}`}>
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>

              {activeTab === "general" ? <GeneralEditor form={form} setForm={setForm} responsables={responsablesDisponibles} /> : null}
              {activeTab === "flujo" ? <FlowEditor steps={form.steps} setSteps={(steps) => setForm((p) => ({ ...p, steps }))} /> : null}
              {activeTab === "fibra" ? <ProductEditor title="Productos de fibra" icon={Wifi} items={form.fibraOptions} setItems={(fibraOptions) => setForm((p) => ({ ...p, fibraOptions }))} kind="fibra" /> : null}
              {activeTab === "moviles" ? <ProductEditor title="Productos móviles" icon={Smartphone} items={form.mobileOptions} setItems={(mobileOptions) => setForm((p) => ({ ...p, mobileOptions }))} kind="movil" /> : null}
              {activeTab === "tv" ? <ProductEditor title="Productos TV" icon={MonitorPlay} items={form.tvOptions} setItems={(tvOptions) => setForm((p) => ({ ...p, tvOptions }))} kind="tv" /> : null}
              {activeTab === "promos" ? <PromoEditor promociones={form.promociones} setPromociones={(promociones) => setForm((p) => ({ ...p, promociones }))} /> : null}
              {activeTab === "config" ? <ConfigEditor config={form.configuracion} setConfig={(configuracion) => setForm((p) => ({ ...p, configuracion }))} /> : null}
              {activeTab === "campos" ? <FieldsEditor fields={form.dynamicFields} setFields={(dynamicFields) => setForm((p) => ({ ...p, dynamicFields }))} steps={form.steps} /> : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={saveCampaign} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 font-medium text-emerald-900 transition hover:bg-emerald-200 disabled:opacity-60"><Save className="h-4 w-4" /> Guardar</button>
                <button onClick={cancelEdit} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300 disabled:opacity-60"><X className="h-4 w-4" /> Cancelar</button>
              </div>
            </div>
          ) : selectedCampaign ? (
            <CampaignDetail campaign={normalizeCampaign(selectedCampaign)} quickStatus={quickStatus} deleteCampaign={deleteCampaign} loading={loading} />
          ) : (
            <div className="crm-panel-soft mt-4 p-4"><p className="crm-muted">Selecciona una campaña para ver el detalle.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, color }) {
  return (
    <div className="crm-panel p-5">
      <div className="flex items-center gap-3"><Icon className={`h-5 w-5 ${color}`} /><p className="crm-label">{label}</p></div>
      <p className="crm-kpi mt-3 text-3xl">{value}</p>
    </div>
  );
}

function GeneralEditor({ form, setForm, responsables }) {
  return (
    <div className="crm-panel-soft p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Nombre" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
        <div>
          <label className="crm-label mb-2 block">Responsable</label>
          <select value={form.responsable || ""} onChange={(e) => setForm((p) => ({ ...p, responsable: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }}>
            <option value="">Selecciona responsable</option>
            {responsables.map((u) => <option key={u.id} value={u.nombre || u.name}>{u.nombre || u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="crm-label mb-2 block">Estado</label>
          <select value={form.estado} onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" style={{ color: "inherit" }}>
            {ESTADOS.map((estado) => <option key={estado}>{estado}</option>)}
          </select>
        </div>
        <TextInput label="Arquitectura" value={form.arquitectura} onChange={(e) => setForm((p) => ({ ...p, arquitectura: e.target.value }))} />
        <div className="md:col-span-2">
          <label className="crm-label mb-2 block">Descripción</label>
          <textarea value={form.descripcion || ""} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} className="crm-input min-h-[120px] w-full px-4 py-3 outline-none" style={{ color: "inherit" }} />
        </div>
      </div>
    </div>
  );
}

function CampaignDetail({ campaign, quickStatus }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="crm-panel-soft p-4">
        <p className="crm-label">Campaña</p>
        <p className="crm-title mt-1 text-lg">{campaign.nombre}</p>
        <p className="crm-muted mt-2 text-sm">{campaign.arquitectura}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <DetailBox label="Fibra" value={`${asArray(campaign.fibraOptions).length} producto(s)`} />
        <DetailBox label="Móviles" value={`${asArray(campaign.mobileOptions).length} producto(s)`} />
        <DetailBox label="TV" value={`${asArray(campaign.tvOptions).length} producto(s)`} />
      </div>
      <div className="crm-panel-soft p-4">
        <p className="crm-label mb-3">Cambio rápido de estado</p>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((estado) => <button key={estado} onClick={() => quickStatus(estado)} className={`rounded-full border px-4 py-2 text-sm font-medium ${estadoBadge(estado)}`}>{estado}</button>)}
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }) {
  return <div className="crm-panel-soft p-4"><p className="crm-label">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}
