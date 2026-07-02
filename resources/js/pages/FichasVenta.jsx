import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FilePlus2,
  MapPin,
  Minus,
  MonitorPlay,
  Plus,
  RotateCcw,
  Save,
  Search,
  Smartphone,
  Sparkles,
  Wifi,
} from "lucide-react";

const BASE_STORAGE_KEY = "crm_ficha_venta_vodafone_v1";
const PHRASE_META_PREFIX = "crm_daily_sales_phrase_vodafone_v1";

const SALES_PHRASES = [
  "Cada llamada es una puerta abierta: hoy puede salir tu mejor venta.",
  "Tu voz transmite confianza; úsala para cerrar con seguridad.",
  "Vender bien no es insistir, es conectar con la necesidad correcta.",
  "Hoy no cargues una ficha más, carga una oportunidad real.",
  "Una venta bien cargada es una venta con más posibilidades de avanzar.",
  "Las grandes metas comerciales se construyen una ficha a la vez.",
  "Tu disciplina comercial vale tanto como tu capacidad de persuadir.",
  "Hoy puede ser el día en que conviertas esfuerzo en resultados.",
];

const VODAFONE_DOCUMENT_OPTIONS = ["N.I.F.", "N.I.E.", "C.I.F.", "PASAPORTE"];

const DEFAULT_STEPS = [
  { key: "cliente_direccion", label: "Cliente y dirección", enabled: true, order: 1 },
  { key: "oferta", label: "Oferta", enabled: true, order: 2 },
  { key: "facturacion", label: "Facturación", enabled: true, order: 3 },
  { key: "complementarios", label: "Datos complementarios", enabled: true, order: 4 },
  { key: "bancarios", label: "Datos bancarios", enabled: true, order: 5 },
];

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
  { key: "MOVIL_30GB", title: "Móvil 30GB", subtitle: "30GB", maxQty: 10, image: "/img/vodafone/movil.png", enabled: true },
  { key: "MOVIL_60GB", title: "Móvil 60GB", subtitle: "60GB", maxQty: 10, image: "/img/vodafone/movil.png", enabled: true },
  { key: "MOVIL_160GB", title: "Móvil 160GB", subtitle: "160GB", maxQty: 10, image: "/img/vodafone/movil.png", enabled: true },
  { key: "MOVIL_ILIMITADA", title: "Móvil ilimitada", subtitle: "ILIMITADA", maxQty: 10, image: "/img/vodafone/movil.png", enabled: true },
];

const DEFAULT_TV_OPTIONS = [
  { key: "VODAFONE_TV_HBO_MAX", title: "Vodafone TV con HBO Max", price: "11,00 € / mes", image: "/img/vodafone/tv.png", enabled: true },
  { key: "DISNEY_ESTANDAR_ANUNCIOS", title: "Disney+ Estándar con Anuncios", price: "6,99 € / mes", image: "/img/vodafone/tv.png", enabled: true },
  { key: "TV_DISNEY_ESTANDAR", title: "TV con Disney+ Estándar", price: "12,00 € / mes", image: "/img/vodafone/tv.png", enabled: true },
];

const DEFAULT_DYNAMIC_FIELDS = [
  { key: "tipo_documento_vodafone", label: "Tipo documento", type: "select", step: "cliente_direccion", options: VODAFONE_DOCUMENT_OPTIONS, required: true },
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
  { key: "promo_codigo", label: "Promoción", type: "text", step: "facturacion" },
  { key: "tipo_factura_vodafone", label: "Tipo de facturación", type: "select", step: "facturacion", options: ["Factura electrónica", "Factura en papel"], required: true },
  { key: "comentario", label: "Observaciones", type: "textarea", step: "complementarios" },
  { key: "banco_mismo_titular", label: "Mismo titular", type: "select", step: "bancarios", options: ["Sí", "No"] },
  { key: "banco_nombre", label: "Nombre", type: "text", step: "bancarios" },
  { key: "banco_primer_apellido", label: "Primer apellido", type: "text", step: "bancarios" },
  { key: "banco_segundo_apellido", label: "Segundo apellido", type: "text", step: "bancarios" },
  { key: "banco_tipo_documento", label: "Tipo documento", type: "select", step: "bancarios", options: VODAFONE_DOCUMENT_OPTIONS },
  { key: "banco_numero_documento", label: "Nº documento", type: "text", step: "bancarios" },
  { key: "iban", label: "IBAN de la cuenta", type: "iban", step: "bancarios", required: true },
];

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
    throw new Error(data?.message || "No se pudo completar la solicitud.");
  }
  return data;
}

function upperText(value) {
  return String(value || "").toUpperCase().trim();
}

function getThemeValue() {
  try {
    const saved = localStorage.getItem("crm_app_settings_v1");
    return saved ? JSON.parse(saved)?.theme || "night" : "night";
  } catch {
    return "night";
  }
}

function getThemeStyles(theme) {
  if (theme === "light") {
    return {
      title: "text-slate-900",
      text: "text-slate-800",
      muted: "text-slate-600",
      panel: "border-slate-200 bg-white/95",
      soft: "border-slate-200 bg-slate-50/90",
      input: "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400",
      tabIdle: "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
      tabActive: "border-cyan-300 bg-cyan-100 text-cyan-900 shadow-sm",
      cardIdle: "border-slate-200 bg-white hover:bg-slate-50",
      cardActive: "border-cyan-300 bg-cyan-50 shadow-sm",
    };
  }

  if (theme === "silver") {
    return {
      title: "text-slate-900",
      text: "text-slate-800",
      muted: "text-slate-600",
      panel: "border-white/50 bg-white/70",
      soft: "border-white/45 bg-white/55",
      input: "border-slate-300 bg-white/95 text-slate-900 placeholder:text-slate-400",
      tabIdle: "border-white/50 bg-white/70 text-slate-700 hover:bg-white/90",
      tabActive: "border-violet-300 bg-violet-100/90 text-violet-900 shadow-sm",
      cardIdle: "border-white/45 bg-white/70 hover:bg-white/85",
      cardActive: "border-cyan-300 bg-cyan-50/90 shadow-sm",
    };
  }

  return {
    title: "text-white",
    text: "text-slate-100",
    muted: "text-slate-300",
    panel: "border-white/10 bg-white/5",
    soft: "border-white/10 bg-white/5",
    input: "border-white/10 bg-white/10 text-white placeholder:text-slate-400",
    tabIdle: "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
    tabActive: "border-cyan-400/30 bg-cyan-500/15 text-cyan-100 shadow-[0_8px_24px_rgba(34,211,238,0.12)]",
    cardIdle: "border-white/10 bg-white/5 hover:bg-white/10",
    cardActive: "border-cyan-400/30 bg-cyan-500/10 shadow-[0_8px_24px_rgba(34,211,238,0.12)]",
  };
}

function getCurrentUserName(currentUser) {
  return currentUser?.nombre || currentUser?.name || "";
}

function getDraftKey(currentUser) {
  const id = currentUser?.id || currentUser?.email || currentUser?.dni || currentUser?.nombre || "anon";
  return `${BASE_STORAGE_KEY}_${id}`;
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getPhraseMetaKey(currentUser) {
  const id = currentUser?.id || currentUser?.email || currentUser?.dni || currentUser?.nombre || "anon";
  return `${PHRASE_META_PREFIX}_${id}`;
}

function readPhraseMeta(currentUser) {
  try {
    const raw = localStorage.getItem(getPhraseMetaKey(currentUser));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writePhraseMeta(currentUser, meta) {
  try {
    localStorage.setItem(getPhraseMetaKey(currentUser), JSON.stringify(meta));
  } catch {}
}

function choosePhrase(lastPhrase = "", recent = []) {
  let pool = SALES_PHRASES.filter((phrase) => phrase !== lastPhrase && !recent.includes(phrase));
  if (!pool.length) pool = SALES_PHRASES.filter((phrase) => phrase !== lastPhrase);
  if (!pool.length) pool = SALES_PHRASES;
  return pool[Math.floor(Math.random() * pool.length)] || SALES_PHRASES[0];
}

function resolveDailyPhrase(currentUser) {
  const today = getTodayKey();
  const meta = readPhraseMeta(currentUser);
  if (meta?.date === today && meta?.phrase) return meta.phrase;

  const nextPhrase = choosePhrase(meta?.phrase || "", meta?.recent || []);
  const nextRecent = [nextPhrase, ...(meta?.recent || []).filter((x) => x !== nextPhrase)].slice(0, 5);
  writePhraseMeta(currentUser, { date: today, phrase: nextPhrase, recent: nextRecent });
  return nextPhrase;
}

function rotatePhraseForToday(currentUser, currentPhrase = "") {
  const today = getTodayKey();
  const meta = readPhraseMeta(currentUser);
  const nextPhrase = choosePhrase(currentPhrase || meta?.phrase || "", meta?.recent || []);
  const nextRecent = [nextPhrase, ...(meta?.recent || []).filter((x) => x !== nextPhrase)].slice(0, 5);
  writePhraseMeta(currentUser, { date: today, phrase: nextPhrase, recent: nextRecent });
  return nextPhrase;
}

function normalizeCatalogItem(item, index = 0) {
  return {
    key: item?.key || `item_${index + 1}`,
    title: item?.title || item?.nombre || item?.label || "",
    subtitle: item?.subtitle || item?.plan || "",
    price: item?.price || item?.precio || "",
    image: item?.image || item?.imagen || "",
    maxQty: Number(item?.maxQty ?? 10),
    enabled: item?.enabled !== false,
  };
}

function normalizeField(field, index = 0) {
  return {
    key: field?.key || `field_${index + 1}`,
    label: field?.label || field?.nombre || "",
    type: field?.type || "text",
    step: field?.step || "cliente_direccion",
    required: Boolean(field?.required),
    options: Array.isArray(field?.options) ? field.options : [],
  };
}

function resolveVodafoneCampaign(campaigns = [], currentUser) {
  const list = Array.isArray(campaigns) ? campaigns : [];
  return (
    list.find((c) => upperText(c?.nombre) === "VODAFONE") ||
    list.find((c) => upperText(c?.key) === "VODAFONE") ||
    { nombre: "VODAFONE" }
  );
}

function resolveCampaignConfig(campaign) {
  const steps = Array.isArray(campaign?.steps) && campaign.steps.length ? campaign.steps : DEFAULT_STEPS;
  const dynamicFields = Array.isArray(campaign?.dynamicFields) && campaign.dynamicFields.length ? campaign.dynamicFields : DEFAULT_DYNAMIC_FIELDS;

  return {
    steps: steps
      .map((step, index) => ({
        key: step?.key || `step_${index + 1}`,
        label: step?.label || `Paso ${index + 1}`,
        enabled: step?.enabled !== false,
        order: step?.order || index + 1,
      }))
      .filter((step) => step.enabled)
      .sort((a, b) => a.order - b.order),
    fibraOptions: (Array.isArray(campaign?.fibraOptions) && campaign.fibraOptions.length ? campaign.fibraOptions : DEFAULT_FIBRA_OPTIONS)
      .map(normalizeCatalogItem)
      .filter((item) => item.enabled !== false),
    mobileOptions: (Array.isArray(campaign?.mobileOptions) && campaign.mobileOptions.length ? campaign.mobileOptions : DEFAULT_MOBILE_OPTIONS)
      .map(normalizeCatalogItem)
      .filter((item) => item.enabled !== false),
    tvOptions: (Array.isArray(campaign?.tvOptions) && campaign.tvOptions.length ? campaign.tvOptions : DEFAULT_TV_OPTIONS)
      .map(normalizeCatalogItem)
      .filter((item) => item.enabled !== false),
    dynamicFields: dynamicFields.map(normalizeField),
  };
}

function buildInitialValues(fields, currentUser) {
  const base = fields.reduce((acc, field) => {
    acc[field.key] = field.type === "select" ? field.options?.[0] || "" : "";
    return acc;
  }, {});

  return {
    ...base,
    campana: "VODAFONE",
    comercial: currentUser?.rol === "Comercial" ? getCurrentUserName(currentUser) : "",
    coordinador: currentUser?.coordinador || "",
    supervisor: currentUser?.supervisor || (currentUser?.rol === "Supervisor" ? getCurrentUserName(currentUser) : ""),
    producto: "ONE",
    estado: "Pendiente",
  };
}

const SPECIAL_FIELD_RULES = {
  nif_nie_cif: {
    maxLength: 9,
    inputType: "text",
    sanitize: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9),
    validate: (value) => (!value || /^[A-Z0-9]{6,9}$/.test(value) ? "" : "Documento no válido."),
  },
  movil_contacto: {
    maxLength: 9,
    inputType: "tel",
    sanitize: (value) => value.replace(/\D/g, "").slice(0, 9),
    validate: (value) => (!value || /^\d{9}$/.test(value) ? "" : "Debe tener 9 dígitos."),
  },
  iban: {
    maxLength: 24,
    inputType: "text",
    sanitize: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24),
    validate: (value) => (!value || /^[A-Z0-9]{24}$/.test(value) ? "" : "IBAN debe tener 24 caracteres."),
  },
};

function getFieldRule(field) {
  if (!field) return null;
  return SPECIAL_FIELD_RULES[field.key] || SPECIAL_FIELD_RULES[field.type] || null;
}

function clampQty(value) {
  const n = Number(value || 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(10, n));
}

function buildProductSummary(values, config) {
  const parts = [];
  const fibra = config.fibraOptions.find((item) => item.key === values.fibra);
  if (fibra) parts.push(fibra.subtitle || fibra.title);

  const mobiles = config.mobileOptions
    .map((item) => {
      const qty = clampQty(values[item.key]);
      return qty > 0 ? `${item.title} x${qty}` : "";
    })
    .filter(Boolean);
  if (mobiles.length) parts.push(mobiles.join(" | "));

  const tvs = Array.isArray(values.vodafone_tv_pack) ? values.vodafone_tv_pack : [];
  if (tvs.length) parts.push(tvs.join(" | "));

  return parts.join(" + ");
}

function SummaryChip({ label, value, styles }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles.soft}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${styles.muted}`}>{label}</p>
      <p className={`mt-1 text-sm font-semibold ${styles.text}`}>{value || "-"}</p>
    </div>
  );
}

export default function FichasVenta({ users = [], campaigns = [], setVentas, setLeads, currentUser }) {
  const [theme, setTheme] = useState(getThemeValue());
  const [stage, setStage] = useState("inicio");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [motivationalPhrase, setMotivationalPhrase] = useState("");

  const selectedCampaign = useMemo(() => resolveVodafoneCampaign(campaigns, currentUser), [campaigns, currentUser]);
  const config = useMemo(() => resolveCampaignConfig(selectedCampaign), [selectedCampaign]);
  const draftKey = useMemo(() => getDraftKey(currentUser), [currentUser]);
  const styles = useMemo(() => getThemeStyles(theme), [theme]);

  const [formValues, setFormValues] = useState(() => buildInitialValues(DEFAULT_DYNAMIC_FIELDS, currentUser));

  const fieldMap = useMemo(
    () => config.dynamicFields.reduce((acc, field) => ({ ...acc, [field.key]: field }), {}),
    [config.dynamicFields]
  );

  useEffect(() => {
    const handleThemeChange = (event) => setTheme(event?.detail || getThemeValue());
    window.addEventListener("crm-theme-change", handleThemeChange);
    return () => window.removeEventListener("crm-theme-change", handleThemeChange);
  }, []);

  useEffect(() => {
    setMotivationalPhrase(resolveDailyPhrase(currentUser));
    const saved = localStorage.getItem(draftKey);
    if (!saved) {
      setFormValues(buildInitialValues(config.dynamicFields, currentUser));
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setFormValues({ ...buildInitialValues(config.dynamicFields, currentUser), ...(parsed.formValues || {}) });
      setStage(parsed.stage || "inicio");
    } catch {
      setFormValues(buildInitialValues(config.dynamicFields, currentUser));
    }
  }, [currentUser, draftKey, config.dynamicFields]);

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify({ formValues, stage }));
  }, [formValues, stage, draftKey]);

  const currentStepIndex = useMemo(() => {
    const idx = config.steps.findIndex((step) => step.key === stage);
    return idx >= 0 ? idx : 0;
  }, [config.steps, stage]);

  const currentStep = config.steps[currentStepIndex] || config.steps[0];

  const handleFieldChange = (key, value) => {
    const field = fieldMap[key] || { key };
    const rule = getFieldRule(field);
    const nextValue = rule ? rule.sanitize(String(value || "")) : value;
    const validation = rule ? rule.validate(nextValue) : "";

    setFormValues((prev) => ({ ...prev, [key]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [key]: validation }));
  };

  const startVodafone = () => {
    setMessage("");
    setError("");
    setFormValues((prev) => ({
      ...buildInitialValues(config.dynamicFields, currentUser),
      ...prev,
      campana: "VODAFONE",
      tipo_documento_vodafone: prev.tipo_documento_vodafone || VODAFONE_DOCUMENT_OPTIONS[0],
    }));
    setStage("cliente_direccion");
  };

  const handleDocumentSave = () => {
    const doc = upperText(formValues.nif_nie_cif || formValues.vodafone_numero_documento);
    if (!doc) {
      setFieldErrors((prev) => ({ ...prev, nif_nie_cif: "Ingresa el número de documento." }));
      return;
    }
    setFormValues((prev) => ({ ...prev, nif_nie_cif: doc, vodafone_numero_documento: doc }));
    setMessage("Documento guardado. Continúa completando la ficha.");
  };

  const updateMobileQty = (key, delta) => {
    setFormValues((prev) => {
      const next = { ...prev, [key]: clampQty((prev[key] || 0) + delta) };
      next.cantidad_moviles = config.mobileOptions.reduce((acc, item) => acc + clampQty(next[item.key]), 0);
      next.producto = buildProductSummary(next, config) || "ONE";
      return next;
    });
  };

  const selectFiber = (key) => {
    setFormValues((prev) => {
      const next = { ...prev, fibra: key };
      next.producto = buildProductSummary(next, config) || "ONE";
      return next;
    });
  };

  const toggleTv = (key) => {
    setFormValues((prev) => {
      const current = Array.isArray(prev.vodafone_tv_pack) ? prev.vodafone_tv_pack : [];
      const nextTv = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      const next = { ...prev, vodafone_tv_pack: nextTv };
      next.producto = buildProductSummary(next, config) || "ONE";
      return next;
    });
  };

  const goNext = () => {
    if (currentStepIndex < config.steps.length - 1) {
      setStage(config.steps[currentStepIndex + 1].key);
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setStage(config.steps[currentStepIndex - 1].key);
    }
  };

  const resetForm = () => {
    setFormValues(buildInitialValues(config.dynamicFields, currentUser));
    setFieldErrors({});
    setMessage("");
    setError("");
    setStage("inicio");
    localStorage.removeItem(draftKey);
  };

  const saveSale = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const now = new Date();
      const payload = {
        fecha: now.toLocaleDateString("es-ES"),
        hora: now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        cliente: formValues.cliente_razon_social || `${formValues.nombre || ""} ${formValues.apellidos || ""}`.trim(),
        documento: formValues.nif_nie_cif || "",
        telefono: formValues.movil_contacto || formValues.telefono_fijo_contacto || "",
        campana: "VODAFONE",
        comercial: formValues.comercial || getCurrentUserName(currentUser),
        coordinador: formValues.coordinador || "",
        supervisor: formValues.supervisor || "",
        producto: formValues.producto || buildProductSummary(formValues, config) || "ONE",
        estado: "Pendiente",
        ficha: formValues,
      };

      let ventaGuardada = payload;
      try {
        const data = await apiFetch("/ventas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        ventaGuardada = data?.venta || data?.sale || payload;
      } catch {
        ventaGuardada = { ...payload, id: Date.now() };
      }

      if (setVentas) setVentas((prev) => [ventaGuardada, ...(Array.isArray(prev) ? prev : [])]);
      if (setLeads) setLeads((prev) => (Array.isArray(prev) ? prev : []));

      localStorage.removeItem(draftKey);
      setMessage("Ficha Vodafone guardada correctamente.");
      setFormValues(buildInitialValues(config.dynamicFields, currentUser));
      setStage("inicio");
    } catch (err) {
      setError(err.message || "No se pudo guardar la ficha.");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    if (!field) return null;
    const rule = getFieldRule(field);
    const value = formValues[field.key] || "";
    const commonClass = `w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input} ${fieldErrors[field.key] ? "border-rose-400" : ""}`;

    if (field.type === "select") {
      return (
        <select value={value} onChange={(e) => handleFieldChange(field.key, e.target.value)} className={commonClass}>
          <option value="">Seleccionar</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (field.type === "textarea") {
      return <textarea value={value} onChange={(e) => handleFieldChange(field.key, e.target.value)} rows={4} className={commonClass} />;
    }

    return (
      <input
        type={rule?.inputType || field.type || "text"}
        value={value}
        onChange={(e) => handleFieldChange(field.key, e.target.value)}
        maxLength={rule?.maxLength}
        className={commonClass}
      />
    );
  };

  const renderDynamicFields = (stepKey) => {
    const fields = config.dynamicFields.filter((field) => field.step === stepKey);
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {fields.map((field) => (
          <div key={field.key} className={field.type === "textarea" ? "md:col-span-2 xl:col-span-4" : ""}>
            <label className={`mb-2 block text-sm font-medium ${styles.text}`}>
              {field.label}{field.required ? " *" : ""}
            </label>
            {renderField(field)}
            {fieldErrors[field.key] ? <p className="mt-2 text-xs text-rose-400">{fieldErrors[field.key]}</p> : null}
          </div>
        ))}
      </div>
    );
  };

  const renderClienteDireccion = () => (
    <div className="space-y-6">
      <div className={`rounded-[24px] border p-6 ${styles.soft}`}>
        <div className="mb-5 grid gap-3 md:grid-cols-[170px_1fr_140px]">
          <div>
            <label className={`mb-2 block text-xs font-semibold uppercase tracking-[0.18em] ${styles.muted}`}>Tipo documento</label>
            {renderField(fieldMap.tipo_documento_vodafone)}
          </div>
          <div>
            <label className={`mb-2 block text-xs font-semibold uppercase tracking-[0.18em] ${styles.muted}`}>Nº documento</label>
            {renderField(fieldMap.nif_nie_cif)}
            {fieldErrors.nif_nie_cif ? <p className="mt-2 text-xs text-rose-400">{fieldErrors.nif_nie_cif}</p> : null}
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleDocumentSave}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-700 bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700"
            >
              <Search className="h-4 w-4" />
              Guardar
            </button>
          </div>
        </div>

        {renderDynamicFields("cliente_direccion")}
      </div>
    </div>
  );

  const renderOferta = () => (
    <div className="space-y-6">
      <div className={`rounded-[24px] border p-6 ${styles.soft}`}>
        <div className="mb-4 flex items-center gap-2">
          <Wifi className="h-5 w-5 text-rose-500" />
          <h4 className={`text-xl font-bold ${styles.title}`}>Fibra + Fijo</h4>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {config.fibraOptions.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => selectFiber(item.key)}
              className={`rounded-[22px] border p-4 text-left transition ${formValues.fibra === item.key ? styles.cardActive : styles.cardIdle}`}
            >
              <div className="mb-3 flex h-20 items-center justify-center rounded-2xl bg-white/10">
                <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <p className={`font-bold ${styles.text}`}>{item.title}</p>
              <p className={`text-sm ${styles.muted}`}>{item.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      <div className={`rounded-[24px] border p-6 ${styles.soft}`}>
        <div className="mb-4 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-cyan-500" />
          <h4 className={`text-xl font-bold ${styles.title}`}>Línea móvil</h4>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {config.mobileOptions.map((item) => {
            const qty = clampQty(formValues[item.key]);
            return (
              <div key={item.key} className={`rounded-[22px] border p-4 ${qty > 0 ? styles.cardActive : styles.cardIdle}`}>
                <div className="mb-3 flex h-20 items-center justify-center rounded-2xl bg-white/10">
                  <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                </div>
                <p className={`font-bold ${styles.text}`}>{item.title}</p>
                <p className={`text-sm ${styles.muted}`}>{item.subtitle}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => updateMobileQty(item.key, -1)} className="rounded-xl border border-white/10 p-2"><Minus className="h-4 w-4" /></button>
                  <span className={`text-xl font-bold ${styles.text}`}>{qty}</span>
                  <button type="button" onClick={() => updateMobileQty(item.key, 1)} className="rounded-xl border border-white/10 p-2"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`rounded-[24px] border p-6 ${styles.soft}`}>
        <div className="mb-4 flex items-center gap-2">
          <MonitorPlay className="h-5 w-5 text-violet-500" />
          <h4 className={`text-xl font-bold ${styles.title}`}>Vodafone TV</h4>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {config.tvOptions.map((item) => {
            const selected = Array.isArray(formValues.vodafone_tv_pack) && formValues.vodafone_tv_pack.includes(item.key);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleTv(item.key)}
                className={`rounded-[22px] border p-4 text-left transition ${selected ? styles.cardActive : styles.cardIdle}`}
              >
                <p className={`font-bold ${styles.text}`}>{item.title}</p>
                <p className={`mt-1 text-sm ${styles.muted}`}>{item.price}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStage = () => {
    if (stage === "cliente_direccion") return renderClienteDireccion();
    if (stage === "oferta") return renderOferta();
    return <div className={`rounded-[24px] border p-6 ${styles.soft}`}>{renderDynamicFields(stage)}</div>;
  };

  if (stage === "inicio") {
    return (
      <div className="space-y-6">
        <div className={`overflow-hidden rounded-[28px] border p-8 ${styles.panel}`}>
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-center">
            <div>
              <p className={`mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] ${styles.muted}`}>
                <Sparkles className="h-4 w-4 text-rose-500" />
                Nueva ficha Vodafone
              </p>
              <h2 className={`text-3xl font-bold ${styles.title}`}>Empieza una nueva venta con orden y foco.</h2>
              <p className={`mt-4 text-lg ${styles.text}`}>{motivationalPhrase}</p>
              <button
                type="button"
                onClick={() => setMotivationalPhrase((prev) => rotatePhraseForToday(currentUser, prev))}
                className={`mt-4 inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold ${styles.tabIdle}`}
              >
                <RotateCcw className="h-4 w-4" />
                Cambiar frase
              </button>
            </div>

            <button
              type="button"
              onClick={startVodafone}
              className="group overflow-hidden rounded-[28px] border border-rose-500/30 bg-rose-600/10 p-6 text-left transition hover:bg-rose-600/20"
            >
              <div className="flex h-44 items-center justify-center rounded-3xl bg-white">
                <img src="/img/campaigns/vodafone.png" alt="Vodafone" className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <span className="text-2xl font-black tracking-[0.2em] text-rose-600">VODAFONE</span>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className={`text-xl font-bold ${styles.title}`}>Vodafone</p>
                  <p className={`text-sm ${styles.muted}`}>Abrir ficha de venta</p>
                </div>
                <ChevronRight className="h-6 w-6 text-rose-500 transition group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-[28px] border p-6 ${styles.panel}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] ${styles.muted}`}>
              <FilePlus2 className="h-4 w-4 text-rose-500" />
              Ficha de venta
            </p>
            <h2 className={`mt-1 text-2xl font-bold ${styles.title}`}>Vodafone</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resetForm} className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-semibold ${styles.tabIdle}`}>
              <ChevronLeft className="h-4 w-4" />
              Volver al inicio
            </button>
            <button type="button" onClick={saveSale} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500 bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar ficha"}
            </button>
          </div>
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm text-rose-800">{error}</div> : null}

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryChip label="Documento" value={formValues.nif_nie_cif} styles={styles} />
        <SummaryChip label="Cliente" value={formValues.cliente_razon_social || `${formValues.nombre || ""} ${formValues.apellidos || ""}`.trim()} styles={styles} />
        <SummaryChip label="Producto" value={formValues.producto} styles={styles} />
        <SummaryChip label="Campaña" value="VODAFONE" styles={styles} />
      </div>

      <div className="flex flex-wrap gap-2">
        {config.steps.map((step, index) => (
          <button
            key={step.key}
            type="button"
            onClick={() => setStage(step.key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${stage === step.key ? styles.tabActive : styles.tabIdle}`}
          >
            {index + 1}. {step.label}
          </button>
        ))}
      </div>

      {renderStage()}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-semibold disabled:opacity-50 ${styles.tabIdle}`}
        >
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </button>

        {currentStepIndex < config.steps.length - 1 ? (
          <button type="button" onClick={goNext} className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-semibold ${styles.tabActive}`}>
            Continuar
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={saveSale} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500 bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
            <CheckCircle2 className="h-4 w-4" />
            Finalizar y guardar
          </button>
        )}
      </div>
    </div>
  );
}
