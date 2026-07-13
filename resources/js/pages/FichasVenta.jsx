import { useMemo, useState } from "react";
import {
  Search,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from "lucide-react";

const DOCS = ["N.I.F.", "N.I.E.", "C.I.F.", "PASAPORTE"];
const DEFAULT_SEGMENTOS = ["PARTICULAR", "MICRO"];
const DEFAULT_SFID = ["ESPC0231", "ESPC0450", "ESPC1088"];

const CAMPAIGN_LOGOS = {
  VODAFONE: "/img/campaigns/vodafone.jpg",
  YOIGO: "/img/campaigns/yoigo.png",
  MASMOVIL: "/img/campaigns/masmovil.png",
  "MASMOVIL / YOIGO": "/img/campaigns/masmovil.png",
  "MÁSMÓVIL": "/img/campaigns/masmovil.png",
  NATURGY: "/img/campaigns/naturgy.jpg",
  NORDY: "/img/campaigns/nordy.png",
  LOWI: "/img/campaigns/vodafone.jpg",
  ENDESA: "/img/campaigns/endesa.jpg",
  POPULOS: "/img/campaigns/populos.png",
  FINETWORK: "/img/campaigns/masmovil.png",
};

const FRASES = [
  "Hoy puede ser tu mejor día comercial.",
  "Una ficha bien cargada protege una buena venta.",
  "Cada gestión correcta te acerca al objetivo.",
  "Orden, claridad y confianza: así se cierran mejores ventas.",
];

const DEFAULT_FIBRA = [
  { key: "FIBRA_600_MB", title: "Fibra 600 Mb", subtitle: "600 MB", image: "", enabled: true },
  { key: "FIBRA_1_GB", title: "Fibra 1 Gb", subtitle: "1 GB", image: "", enabled: true },
  { key: "FIBRA_600_MB_NEBA", title: "Fibra 600 Mb", subtitle: "600 MB NEBA", image: "", enabled: true },
  { key: "FIBRA_1_GB_NEBA", title: "Fibra 1 Gb", subtitle: "1 GB NEBA", image: "", enabled: true },
];

const DEFAULT_MOVILES = [
  { key: "MOVIL_30GB", title: "Movil 30GB", subtitle: "30GB", maxQty: 10, image: "", enabled: true },
  { key: "MOVIL_60GB", title: "Movil 60GB", subtitle: "60GB", maxQty: 10, image: "", enabled: true },
  { key: "MOVIL_160GB", title: "Movil 160GB", subtitle: "160GB", maxQty: 10, image: "", enabled: true },
  { key: "MOVIL_ILIMITADA", title: "Movil Ilimitada", subtitle: "ILIMITADA", maxQty: 10, image: "", enabled: true },
];

const DEFAULT_TV = [
  ["Vodafone TV con HBO Max", "11,00 € / mes"],
  ["Disney+ Estándar con Anuncios", "6,99 € / mes"],
  ["TV con Disney+ Estándar", "12,00 € / mes"],
  ["Netflix - Estandar con anuncios", "8,99 € / mes"],
  ["Netflix - Estandar", "14,99 € / mes"],
  ["Netflix - Premium", "21,99 € / mes"],
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
  key: `TV_${index + 1}`,
  title,
  price,
  image: "",
  enabled: true,
}));


const DEFAULT_TV_BLOCKS = [
  { key: "TV_SIN_DECO", title: "Vodafone TV sin decodificador", enabled: true, mode: "seleccion" },
  { key: "DECO_4K", title: "Alquiler Decodificador 4K", enabled: true, mode: "seleccion" },
  { key: "DECO_4K_PRO", title: "Alquiler Decodificador 4K Pro", enabled: true, mode: "seleccion" },
  { key: "VODAFONE_TV", title: "Vodafone TV", enabled: true, mode: "catalogo_tv" },
  { key: "TV_NEGOCIO", title: "Vodafone TV en Tu Negocio", enabled: true, mode: "seleccion" },
];

const TELEFONIA_KEYWORDS = ["VODAFONE", "LOWI", "MASMOVIL", "MÁSMÓVIL", "YOIGO", "FINETWORK", "JAZZTEL", "ORANGE"];
const ENERGIA_KEYWORDS = ["ENDESA", "NATURGY", "NORDY", "REPSOL", "LUZ", "GAS"];

const BASE_FORM = {
  sfid: "ESPC0231",
  tipo_documento_vodafone: "N.I.F.",
  nif_nie_cif: "",
  nombre: "",
  apellidos: "",
  correo: "",
  movil_contacto: "",
  telefono_fijo_contacto: "",
  telefono_contacto_adicional: "",
  fecha_nacimiento_creacion: "",
  segmento_vodafone: "PARTICULAR",
  sin_movil: false,

  direccion: "",
  numero_direccion: "",
  piso: "",
  puerta: "",
  localidad: "",
  codigo_postal: "",

  fibra: "",
  tvBloque: "",
  promo_codigo: "",
  tipo_factura_vodafone: "Factura electrónica",

  banco_mismo_titular: "Sí",
  banco_nombre: "",
  banco_primer_apellido: "",
  banco_segundo_apellido: "",
  banco_tipo_documento: "N.I.F.",
  banco_numero_documento: "",
  iban: "",

  comentario: "",
};

const BUILTIN_FIELD_KEYS = new Set([
  "sfid", "tipo_documento_vodafone", "nif_nie_cif", "nombre", "apellidos",
  "correo", "movil_contacto", "telefono_fijo_contacto", "telefono_contacto_adicional",
  "fecha_nacimiento_creacion", "segmento_vodafone", "sin_movil", "direccion",
  "numero_direccion", "piso", "puerta", "localidad", "codigo_postal", "fibra",
  "tvBloque", "promo_codigo", "tipo_factura_vodafone", "banco_mismo_titular",
  "banco_nombre", "banco_primer_apellido", "banco_segundo_apellido",
  "banco_tipo_documento", "banco_numero_documento", "iban", "comentario"
]);

const FLOW_INDEX = {
  cliente_direccion: 0,
  oferta: 1,
  facturacion: 2,
  bancarios: 2,
  complementarios: 3,
};


function upper(value) {
  return String(value || "").toUpperCase().trim();
}

function onlyDigits(value, max = 9) {
  return String(value || "").replace(/\D/g, "").slice(0, max);
}

function cleanDoc(value) {
  return upper(value).replace(/[^A-Z0-9]/g, "").slice(0, 9);
}

function cleanIban(value) {
  return upper(value).replace(/[^A-Z0-9]/g, "").slice(0, 24);
}

function onlyPostal(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 5);
}

function cleanMobile(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 9);
}

function cleanFixedPhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 9);
}

function isValidDni(value) {
  return /^\d{8}[A-Z]$/.test(cleanDoc(value));
}

function isValidMobile(value) {
  return /^[67]\d{8}$/.test(String(value || ""));
}

function isValidFixedPhone(value) {
  return /^[89]\d{8}$/.test(String(value || ""));
}

function isValidPostal(value) {
  return /^\d{5}$/.test(String(value || ""));
}

function isValidIban(value) {
  return /^[A-Z]{2}\d{22}$/.test(cleanIban(value));
}

function validateVenta(form, options = {}) {
  const step = options.step;
  const all = options.all === true;
  const errors = {};

  const shouldValidateClient = all || step === 0;
  const shouldValidateBank = all || step === 2;

  if (shouldValidateClient) {
    if (!isValidDni(form.nif_nie_cif)) {
      errors.nif_nie_cif = "El DNI debe tener 8 dígitos y 1 letra. Ejemplo: 12345678A";
    }

    if (!form.sin_movil && !isValidMobile(form.movil_contacto)) {
      errors.movil_contacto = "El móvil debe tener 9 dígitos y empezar por 6 o 7.";
    }

    if (form.telefono_fijo_contacto && !isValidFixedPhone(form.telefono_fijo_contacto)) {
      errors.telefono_fijo_contacto = "El fijo debe tener 9 dígitos y empezar por 8 o 9.";
    }

    if (form.telefono_contacto_adicional && !/^\d{9}$/.test(form.telefono_contacto_adicional)) {
      errors.telefono_contacto_adicional = "El teléfono adicional debe tener 9 dígitos.";
    }

    if (!isValidPostal(form.codigo_postal)) {
      errors.codigo_postal = "El código postal debe tener exactamente 5 dígitos.";
    }
  }

  if (shouldValidateBank) {
    if (form.banco_numero_documento && !isValidDni(form.banco_numero_documento)) {
      errors.banco_numero_documento = "El documento bancario debe tener 8 dígitos y 1 letra.";
    }

    if (!isValidIban(form.iban)) {
      errors.iban = "El IBAN debe tener 2 letras y 22 dígitos. Ejemplo: ES1234567890123456789012";
    }
  }

  return errors;
}

function hasErrors(errors) {
  return Object.keys(errors || {}).length > 0;
}

function normalizeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function normalizeCatalog(raw, fallback) {
  const source = normalizeArray(raw, fallback);
  return source
    .filter(Boolean)
    .filter((item) => item.enabled !== false)
    .map((item, index) => ({
      key: item.key || item.id || item.subtitle || item.title || `ITEM_${index + 1}`,
      title: item.title || item.nombre || item.label || `Item ${index + 1}`,
      subtitle: item.subtitle || item.plan || item.velocidad || "",
      price: item.price || item.precio || item.importe || "",
      image: item.image || item.imagen || "",
      maxQty: Number(item.maxQty || item.max_qty || 10),
      enabled: item.enabled !== false,
    }));
}

function getProducts(campaign) {
  return campaign?.productos && typeof campaign.productos === "object" ? campaign.productos : {};
}

function getFieldOptions(campaign, key, fallback) {
  const fields = normalizeArray(campaign?.dynamicFields || campaign?.customFields, []);
  const field = fields.find((f) => f.key === key);

  if (Array.isArray(field?.options) && field.options.length) {
    if (key === "segmento_vodafone") {
      const filtered = field.options.filter((x) => ["PARTICULAR", "MICRO"].includes(upper(x)));
      return filtered.length ? filtered : fallback;
    }
    return field.options;
  }

  return fallback;
}

function logoByCampaign(campaign) {
  const name = upper(campaign?.nombre);
  if (!name) return "/img/campaigns/vodafone.jpg";

  if (CAMPAIGN_LOGOS[name]) return CAMPAIGN_LOGOS[name];

  const matchKey = Object.keys(CAMPAIGN_LOGOS).find((key) => name.includes(key));
  if (matchKey) return CAMPAIGN_LOGOS[matchKey];

  return "/img/campaigns/vodafone.jpg";
}


function getConfig(campaign) {
  return campaign?.configuracion && typeof campaign.configuracion === "object" ? campaign.configuracion : {};
}

function isTelephonyCampaign(campaign) {
  const name = upper(campaign?.nombre);
  if (!name) return true;
  if (ENERGIA_KEYWORDS.some((key) => name.includes(key))) return false;
  return TELEFONIA_KEYWORDS.some((key) => name.includes(key));
}

function getCampaignSteps(campaign, showOferta) {
  const configured = normalizeArray(campaign?.steps || campaign?.configuracion?.steps, []);
  const fallback = [
    { key: "cliente_direccion", label: "Cliente", enabled: true, order: 1 },
    { key: "oferta", label: "Oferta", enabled: true, order: 2 },
    { key: "facturacion", label: "Facturación y banco", enabled: true, order: 3 },
    { key: "complementarios", label: "Complementarios", enabled: true, order: 4 },
  ];

  const source = configured.length ? configured : fallback;
  const used = new Set();
  const result = [];

  source
    .filter((item) => item?.enabled !== false)
    .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
    .forEach((item) => {
      const index = FLOW_INDEX[item?.key];
      if (index === undefined || used.has(index)) return;
      if (index === 1 && !showOferta) return;
      used.add(index);
      result.push({ index, key: item.key, label: item.label || "Paso" });
    });

  if (!used.has(0)) result.unshift({ index: 0, key: "cliente_direccion", label: "Cliente" });
  if (!used.has(2)) result.push({ index: 2, key: "facturacion", label: "Facturación y banco" });
  if (!used.has(3)) result.push({ index: 3, key: "complementarios", label: "Complementarios" });

  return result;
}

function nextWizardStep(current, visibleSteps) {
  const steps = visibleSteps.map((item) => item.index);
  const pos = steps.indexOf(current);
  return steps[Math.min(Math.max(pos, 0) + 1, steps.length - 1)] ?? current;
}

function prevWizardStep(current, visibleSteps) {
  const steps = visibleSteps.map((item) => item.index);
  const pos = steps.indexOf(current);
  return steps[Math.max(pos - 1, 0)] ?? current;
}

function getCampaignFields(campaign) {
  return normalizeArray(campaign?.dynamicFields || campaign?.customFields, []).filter(
    (field) => field?.key && !BUILTIN_FIELD_KEYS.has(field.key)
  );
}

function getCampaignBlocks(campaign) {
  return normalizeArray(campaign?.customBlocks, []);
}

function buildInitialForm(campaign) {
  const next = { ...BASE_FORM };
  getCampaignFields(campaign).forEach((field) => {
    if (next[field.key] === undefined) next[field.key] = field?.defaultValue ?? "";
  });
  return next;
}

function validateDynamicFields(form, campaign, step = null, all = false) {
  const errors = {};
  const customBlockKeys = new Set(getCampaignBlocks(campaign).map((block) => block.key));

  getCampaignFields(campaign).forEach((field) => {
    const destination = field.step || field.tab || "complementarios";
    const effectiveStep = customBlockKeys.has(destination) ? "complementarios" : destination;
    if (!all && step !== null && FLOW_INDEX[effectiveStep] !== step) return;

    const value = form?.[field.key];
    const empty = value === undefined || value === null || String(value).trim() === "";
    if (field.required && empty) {
      errors[field.key] = `${field.label || field.key} es obligatorio.`;
      return;
    }
    if (empty) return;

    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      errors[field.key] = "Ingresa un correo válido.";
    }
    if (field.type === "iban" && !isValidIban(value)) {
      errors[field.key] = "El IBAN debe tener 2 letras y 22 dígitos.";
    }
    if ((field.type === "tel" || field.type === "movil_contacto") && !/^\d{9}$/.test(String(value))) {
      errors[field.key] = "El teléfono debe tener 9 dígitos.";
    }
  });

  return errors;
}

function apiHeaders() {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };

  const token = getCookie("XSRF-TOKEN");
  if (token) headers["X-XSRF-TOKEN"] = decodeURIComponent(token);

  return headers;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
}

async function postVenta(payload) {
  const response = await fetch("/ventas", {
    method: "POST",
    credentials: "include",
    headers: apiHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo guardar la venta.");
  }

  return data;
}

export default function FichasVenta({
  campaigns = [],
  setVentas,
  currentUser,
}) {
  const activeCampaigns = useMemo(() => {
    const list = normalizeArray(campaigns, []);
    const active = list.filter((c) => !c.estado || c.estado === "Activa");
    return active.length ? active : list;
  }, [campaigns]);

  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const selectedCampaign = useMemo(() => {
    const list = activeCampaigns;
    if (!list.length) return null;
    return list.find((c) => String(c.id) === String(selectedCampaignId)) || list[0];
  }, [activeCampaigns, selectedCampaignId]);

  const productos = useMemo(() => getProducts(selectedCampaign), [selectedCampaign]);
  const campaignConfig = useMemo(() => getConfig(selectedCampaign), [selectedCampaign]);
  const showOferta = campaignConfig.mostrarOferta !== false && isTelephonyCampaign(selectedCampaign);
  const showDescuento = campaignConfig.mostrarDescuento !== false && showOferta;
  const visibleSteps = useMemo(() => getCampaignSteps(selectedCampaign, showOferta), [selectedCampaign, showOferta]);
  const tvBlockOptions = useMemo(() => {
    return normalizeCatalog(campaignConfig.tvBlocks, DEFAULT_TV_BLOCKS);
  }, [campaignConfig.tvBlocks]);

  const fibraOptions = useMemo(() => {
    const raw = selectedCampaign?.fibraOptions || productos.fibra;
    return normalizeCatalog(raw, DEFAULT_FIBRA);
  }, [productos.fibra, selectedCampaign]);

  const mobileOptions = useMemo(() => {
    const raw = selectedCampaign?.mobileOptions || productos.moviles || productos.mobileOptions;
    return normalizeCatalog(raw, DEFAULT_MOVILES);
  }, [productos.moviles, productos.mobileOptions, selectedCampaign]);

  const tvOptions = useMemo(() => {
    const raw = selectedCampaign?.tvOptions || productos.tv || productos.television;
    return normalizeCatalog(raw, DEFAULT_TV);
  }, [productos.tv, productos.television, selectedCampaign]);

  const segmentoOptions = useMemo(
    () => getFieldOptions(selectedCampaign, "segmento_vodafone", DEFAULT_SEGMENTOS),
    [selectedCampaign]
  );

  const sfidOptions = useMemo(
    () => getFieldOptions(selectedCampaign, "sfid", DEFAULT_SFID),
    [selectedCampaign]
  );

  const [form, setForm] = useState(() => buildInitialForm(selectedCampaign));
  const [dniInput, setDniInput] = useState("");
  const [campaignSelected, setCampaignSelected] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [offerView, setOfferView] = useState("menu");
  const [mobileQty, setMobileQty] = useState({});
  const [selectedTv, setSelectedTv] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);
  const totalMobiles = Object.values(mobileQty).reduce((acc, n) => acc + Number(n || 0), 0);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setValidationErrors((prev) => {
      if (!prev?.[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const chooseCampaign = (campaign) => {
    setSelectedCampaignId(campaign.id);
    setForm(buildInitialForm(campaign));
    setCampaignSelected(true);
    setStarted(false);
    setStep(0);
    setOfferView("menu");
    setMobileQty({});
    setSelectedTv([]);
    setMessage("");
    setError("");
    setValidationErrors({});
  };

  const changeCampaign = () => {
    setCampaignSelected(false);
    setStarted(false);
    setStep(0);
    setValidationErrors({});
  };

  const ingresar = () => {
    const dni = cleanDoc(dniInput);
    if (!dni) {
      setError("Ingresa el documento para continuar.");
      setValidationErrors({ nif_nie_cif: "El DNI debe tener 8 dígitos y 1 letra." });
      return;
    }

    if (!isValidDni(dni)) {
      setError("El DNI debe tener 8 dígitos y 1 letra. Ejemplo: 12345678A");
      setValidationErrors({ nif_nie_cif: "El DNI debe tener 8 dígitos y 1 letra. Ejemplo: 12345678A" });
      return;
    }

    setError("");
    setValidationErrors({});
    setForm((prev) => ({ ...prev, nif_nie_cif: dni }));
    setDniInput(dni);
    setStarted(true);
    setStep(0);
  };

  const goNext = () => {
    const errors = {
      ...validateVenta(form, { step }),
      ...validateDynamicFields(form, selectedCampaign, step, false),
    };
    if (hasErrors(errors)) {
      setValidationErrors(errors);
      setError("Corrige los campos marcados antes de continuar.");
      return;
    }

    setError("");
    setValidationErrors({});
    setStep((prev) => nextWizardStep(prev, visibleSteps));
  };

  const goBack = () => {
    setError("");
    setValidationErrors({});
    setStep((prev) => prevWizardStep(prev, visibleSteps));
  };

  const changeMobile = (key, mode, maxQty = 10) => {
    setMobileQty((prev) => {
      const current = Number(prev[key] || 0);

      if (mode === "plus") {
        const maxByItem = Math.min(10, Number(maxQty || 10));
        if (totalMobiles >= 10 || current >= maxByItem) return prev;
        return { ...prev, [key]: current + 1 };
      }

      return { ...prev, [key]: Math.max(0, current - 1) };
    });
  };

  const toggleTv = (key) => {
    setSelectedTv((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const productSummary = useMemo(() => {
    const parts = [];

    if (form.fibra) parts.push(form.fibra);
    if (form.tvBloque) parts.push(form.tvBloque);

    mobileOptions.forEach((item) => {
      const qty = Number(mobileQty[item.key] || 0);
      if (qty > 0) parts.push(`${item.title} x${qty}`);
    });

    tvOptions.forEach((item) => {
      if (selectedTv.includes(item.key)) parts.push(item.title);
    });

    return parts.join(" + ");
  }, [form.fibra, form.tvBloque, mobileOptions, mobileQty, selectedTv, tvOptions]);

  const selectedMobileServices = useMemo(() => {
    return mobileOptions
      .map((item) => ({
        key: item.key,
        title: item.title,
        subtitle: item.subtitle,
        cantidad: Number(mobileQty[item.key] || 0),
      }))
      .filter((item) => item.cantidad > 0);
  }, [mobileOptions, mobileQty]);

  const selectedTvServices = useMemo(() => {
    return tvOptions.filter((item) => selectedTv.includes(item.key));
  }, [selectedTv, tvOptions]);

  const guardar = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const errors = {
        ...validateVenta(form, { all: true }),
        ...validateDynamicFields(form, selectedCampaign, null, true),
      };
      if (hasErrors(errors)) {
        setValidationErrors(errors);
        setError("No se puede guardar. Corrige los campos marcados en la ficha.");
        setStep(errors.iban || errors.banco_numero_documento ? 2 : 0);
        return;
      }

      setValidationErrors({});
      const campaignName = selectedCampaign?.nombre || "SIN CAMPAÑA";

      const payload = {
        campana: upper(campaignName),
        cliente: `${form.nombre} ${form.apellidos}`.trim() || form.nif_nie_cif,
        documento: form.nif_nie_cif,
        telefono: form.movil_contacto || form.telefono_fijo_contacto,
        comercial: currentUser?.nombre || currentUser?.name || "",
        coordinador: currentUser?.coordinador || "",
        supervisor: currentUser?.supervisor || "",
        producto: productSummary || campaignName,
        estado: "PENDIENTE",
        serviciosTv: selectedTvServices.map((x) => x.title),
        ficha: {
          ...form,
          fibraSeleccionada: form.fibra,
          movilesSeleccionados: selectedMobileServices,
          tvSeleccionada: selectedTvServices,
          campaign_id: selectedCampaign?.id || null,
          campaign_nombre: campaignName,
        },
      };

      const data = await postVenta(payload);
      const venta = data?.venta || {
        id: Date.now(),
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        ...payload,
      };

      setVentas?.((prev) => [venta, ...(prev || [])]);
      setMessage(`Ficha ${campaignName} guardada correctamente.`);
    } catch (err) {
      setError(err.message || "No se pudo guardar la venta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vf-page">
      <Style />

      <div className="vf-shell">
        {message ? <div className="vf-alert ok">{message}</div> : null}
        {error ? <div className="vf-alert error">{error}</div> : null}

        {!campaignSelected ? (
          <CampaignSelector
            campaigns={activeCampaigns}
            selectedCampaign={selectedCampaign}
            onSelect={chooseCampaign}
          />
        ) : !started ? (
          <section className="vf-start vf-fade-slide">
            <div className="vf-selected-head">
              <div className="vf-selected-logo">
                <img src={logoByCampaign(selectedCampaign)} alt={selectedCampaign?.nombre || "Campaña"} />
              </div>
              <div>
                <p>Campaña seleccionada</p>
                <h2>{selectedCampaign?.nombre || "Campaña"}</h2>
              </div>
              <button onClick={changeCampaign}>
                <RotateCcw size={16} />
                Cambiar campaña
              </button>
            </div>

            <h1>Bienvenido al configurador de oferta {selectedCampaign?.nombre || ""}</h1>
            <div className="vf-phrase">{frase}</div>

            <div className="vf-ingreso">
              <FieldSelect
                label="Tipo documento"
                value={form.tipo_documento_vodafone}
                options={DOCS}
                onChange={(v) => update("tipo_documento_vodafone", v)}
              />

              <Field
                label="Nº Documento"
                value={dniInput}
                placeholder="Nº DOCUMENTO"
                onChange={(v) => setDniInput(cleanDoc(v))}
                onEnter={ingresar}
              />

              <button className="vf-red-btn" onClick={ingresar}>
                <Search size={18} />
                Ingresar
              </button>
            </div>
          </section>
        ) : (
          <section className="vf-wizard vf-fade-slide">
            <div className="vf-selected-mini">
              <div>
                <img src={logoByCampaign(selectedCampaign)} alt={selectedCampaign?.nombre || "Campaña"} />
                <strong>{selectedCampaign?.nombre || "Campaña"}</strong>
                <span>Activa</span>
              </div>
              <button onClick={changeCampaign}>
                Cambiar campaña
              </button>
            </div>

            <div className="vf-stepbar">
              {visibleSteps.map((item, visibleIndex) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setStep(item.index)}
                  className={`vf-step-dot ${step === item.index ? "active" : ""} ${step > item.index ? "done" : ""}`}
                >
                  <span>{visibleIndex + 1}</span>
                  <p>{item.label}</p>
                </button>
              ))}
            </div>

            <div className="vf-slider">
              <div className="vf-track" style={{ transform: `translateX(-${step * 25}%)` }}>
                <div className="vf-slide">
                  <ClientStep
                    form={form}
                    update={update}
                    segmentoOptions={segmentoOptions}
                    sfidOptions={sfidOptions}
                    validationErrors={validationErrors}
                    dynamicFields={getCampaignFields(selectedCampaign).filter((field) => (field.step || field.tab) === "cliente_direccion")}
                    onNext={goNext}
                  />
                </div>

                <div className="vf-slide">
                  <OfferStep
                    form={form}
                    update={update}
                    offerView={offerView}
                    setOfferView={setOfferView}
                    fibraOptions={fibraOptions}
                    mobileOptions={mobileOptions}
                    tvOptions={tvOptions}
                    tvBlockOptions={tvBlockOptions}
                    mobileQty={mobileQty}
                    selectedTv={selectedTv}
                    totalMobiles={totalMobiles}
                    changeMobile={changeMobile}
                    toggleTv={toggleTv}
                    dynamicFields={getCampaignFields(selectedCampaign).filter((field) => (field.step || field.tab) === "oferta")}
                    validationErrors={validationErrors}
                    onBack={goBack}
                    onNext={goNext}
                  />
                </div>

                <div className="vf-slide">
                  <BillingStep
                    form={form}
                    update={update}
                    showDescuento={showDescuento}
                    validationErrors={validationErrors}
                    dynamicFields={getCampaignFields(selectedCampaign).filter((field) => ["facturacion", "bancarios"].includes(field.step || field.tab))}
                    onBack={goBack}
                    onNext={goNext}
                  />
                </div>

                <div className="vf-slide">
                  <ComplementStep
                    form={form}
                    update={update}
                    productSummary={productSummary}
                    selectedCampaign={selectedCampaign}
                    selectedMobileServices={selectedMobileServices}
                    selectedTvServices={selectedTvServices}
                    fibraOptions={fibraOptions}
                    dynamicFields={getCampaignFields(selectedCampaign).filter((field) => {
                      const destination = field.step || field.tab || "complementarios";
                      const customKeys = new Set(getCampaignBlocks(selectedCampaign).map((block) => block.key));
                      return destination === "complementarios" || customKeys.has(destination);
                    })}
                    customBlocks={getCampaignBlocks(selectedCampaign)}
                    validationErrors={validationErrors}
                    onBack={goBack}
                    onSave={guardar}
                    saving={saving}
                    campaignName={selectedCampaign?.nombre || "Campaña"}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function CampaignSelector({ campaigns, selectedCampaign, onSelect }) {
  const safeCampaigns = normalizeArray(campaigns, []);

  return (
    <section className="vf-campaign-hero vf-fade-slide">
      <div className="vf-hero-title">
        <div>
          <p>Fichas de Venta</p>
          <h1>Selecciona una campaña <Sparkles size={30} /></h1>
          <span>Elige la campaña con la que quieres trabajar para cargar la ficha.</span>
        </div>
      </div>

      <div className="vf-campaign-stage">
        <div className="vf-glow red" />
        <div className="vf-glow blue" />
        <div className="vf-campaign-row">
          {safeCampaigns.map((campaign, index) => {
            const active = String(campaign.id) === String(selectedCampaign?.id);
            const logo = logoByCampaign(campaign);
            const fibraCount = normalizeCatalog(campaign?.fibraOptions || campaign?.productos?.fibra, []).length;
            const movilCount = normalizeCatalog(campaign?.mobileOptions || campaign?.productos?.moviles, []).length;
            const tvCount = normalizeCatalog(campaign?.tvOptions || campaign?.productos?.tv, []).length;
            const totalProducts = fibraCount + movilCount + tvCount;

            return (
              <button
                key={campaign.id || campaign.nombre || index}
                className={`vf-campaign-card ${active ? "active" : ""}`}
                onClick={() => onSelect(campaign)}
                style={{ animationDelay: `${index * 130}ms` }}
              >
                {active ? (
                  <div className="vf-check-selected">
                    <CheckCircle2 size={24} />
                  </div>
                ) : null}

                <div className="vf-card-light" />
                <div className="vf-campaign-logo-wrap">
                  <img className="vf-campaign-logo" src={logo} alt={campaign.nombre} />
                </div>

                <div className="vf-campaign-info">
                  <h3>{campaign.nombre || "Campaña"}</h3>
                  <p>Campaña activa</p>

                  <div className="vf-campaign-product-chip">
                    <strong>{totalProducts}</strong>
                    <span>productos</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="vf-dots">
          {safeCampaigns.slice(0, 7).map((campaign, index) => (
            <span
              key={campaign.id || index}
              className={String(campaign.id) === String(selectedCampaign?.id) ? "active" : ""}
            />
          ))}
        </div>
      </div>

      <div className="vf-campaign-note">
        <Sparkles size={16} />
        Centraliza el proceso comercial seleccionando <strong>una Campaña</strong>y gestionando las ventas desde un único entorno.
      </div>
    </section>
  );
}

function ClientStep({ form, update, segmentoOptions, sfidOptions, validationErrors = {}, dynamicFields = [], onNext }) {
  return (
    <div className="vf-panel">
      <h2>Editar datos de cliente</h2>

      <div className="vf-grid cols-4">
        <FieldSelect label="SFID" value={form.sfid} options={sfidOptions} onChange={(v) => update("sfid", v)} />
        <FieldSelect label="Tipo de documento" value={form.tipo_documento_vodafone} options={DOCS} onChange={(v) => update("tipo_documento_vodafone", v)} />
        <Field label="NIF" value={form.nif_nie_cif} disabled error={validationErrors.nif_nie_cif} />
        <Field label="Nombre" value={form.nombre} onChange={(v) => update("nombre", v)} />

        <Field label="Apellidos" value={form.apellidos} onChange={(v) => update("apellidos", v)} />
        <Field label="Email" value={form.correo} onChange={(v) => update("correo", v)} />
        <Field label="Tlf Móvil Comunicaciones" value={form.movil_contacto} onChange={(v) => update("movil_contacto", cleanMobile(v))} error={validationErrors.movil_contacto} />
        <Field label="Tlf Fijo Contacto" value={form.telefono_fijo_contacto} onChange={(v) => update("telefono_fijo_contacto", cleanFixedPhone(v))} error={validationErrors.telefono_fijo_contacto} />

        <Field label="Tlf. Contacto Adicional" value={form.telefono_contacto_adicional} onChange={(v) => update("telefono_contacto_adicional", onlyDigits(v))} error={validationErrors.telefono_contacto_adicional} />
        <Field label="Fecha de Nacimiento" type="date" value={form.fecha_nacimiento_creacion} onChange={(v) => update("fecha_nacimiento_creacion", v)} />
        <FieldSelect label="Segmento Vodafone" value={form.segmento_vodafone} options={segmentoOptions} onChange={(v) => update("segmento_vodafone", v)} />

        <label className="vf-check">
          <input type="checkbox" checked={Boolean(form.sin_movil)} onChange={(e) => update("sin_movil", e.target.checked)} />
          No tiene teléfono móvil
        </label>
      </div>

      <div className="vf-address-box">
        <div className="vf-address-head">
          <h3>Seleccione la Dirección</h3>
          <button type="button">Añadir dirección</button>
        </div>

        <div className="vf-grid cols-6">
          <Field className="span-2" label="Dirección" value={form.direccion} onChange={(v) => update("direccion", v)} />
          <Field label="Número" value={form.numero_direccion} onChange={(v) => update("numero_direccion", v)} />
          <Field label="Piso" value={form.piso} onChange={(v) => update("piso", v)} />
          <Field label="Puerta" value={form.puerta} onChange={(v) => update("puerta", v)} />
          <Field label="C. Postal" value={form.codigo_postal} onChange={(v) => update("codigo_postal", onlyPostal(v))} error={validationErrors.codigo_postal} />
          <Field className="span-2" label="Localidad" value={form.localidad} onChange={(v) => update("localidad", v)} />
        </div>
      </div>

      <DynamicFieldsSection
        title="Campos de campaña"
        fields={dynamicFields}
        form={form}
        update={update}
        validationErrors={validationErrors}
      />

      <div className="vf-actions right">
        <button className="vf-red-btn big" onClick={onNext}>
          Continuar
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function OfferStep({
  form,
  update,
  offerView,
  setOfferView,
  fibraOptions,
  mobileOptions,
  tvOptions,
  tvBlockOptions,
  mobileQty,
  selectedTv,
  totalMobiles,
  changeMobile,
  toggleTv,
  dynamicFields = [],
  validationErrors = {},
  onBack,
  onNext,
}) {
  return (
    <div className="vf-panel">
      <h2>Configurador de Ofertas | ONE</h2>

      {offerView === "menu" ? (
        <div className="vf-categories">
          <CategoryCard type="fibra" title="Fibra + Fijo" button="Seleccionar" red onClick={() => setOfferView("fibra")} />
          <CategoryCard type="movil" title="Línea móvil" button="Seleccionar Fibra + Fijo" onClick={() => setOfferView("movil")} />
          <CategoryCard type="tv" title="Vodafone TV" button="Seleccionar TV" onClick={() => setOfferView("tvBlocks")} />
        </div>
      ) : null}

      {offerView === "fibra" ? (
        <>
          <BackRound onClick={() => setOfferView("menu")} />
          <div className="vf-product-grid two">
            {fibraOptions.map((item) => (
              <ProductCard
                key={item.key}
                item={item}
                type="fibra"
                active={form.fibra === (item.subtitle || item.title)}
                onClick={() => update("fibra", item.subtitle || item.title)}
              />
            ))}
          </div>
        </>
      ) : null}

      {offerView === "movil" ? (
        <>
          <BackRound onClick={() => setOfferView("menu")} />
          <p className="vf-limit">Móviles seleccionados: {totalMobiles}/10</p>

          <div className="vf-product-grid two">
            {mobileOptions.map((item) => (
              <MobileCard
                key={item.key}
                item={item}
                qty={Number(mobileQty[item.key] || 0)}
                onMinus={() => changeMobile(item.key, "minus", item.maxQty)}
                onPlus={() => changeMobile(item.key, "plus", item.maxQty)}
              />
            ))}
          </div>
        </>
      ) : null}


      {offerView === "tvBlocks" ? (
        <>
          <BackRound onClick={() => setOfferView("menu")} />
          <div className="vf-tv-block-grid">
            {tvBlockOptions.map((item) => (
              <button
                key={item.key}
                className={`vf-tv-block ${form.tvBloque === item.title ? "active" : ""}`}
                onClick={() => {
                  update("tvBloque", item.title);
                  if (item.mode === "catalogo_tv" || item.key === "VODAFONE_TV") {
                    setOfferView("tv");
                  }
                }}
              >
                {item.title}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {offerView === "tv" ? (
        <>
          <BackRound onClick={() => setOfferView("tvBlocks")} />
          <div className="vf-product-grid three">
            {tvOptions.map((item, index) => (
              <TvCard
                key={item.key}
                item={item}
                active={selectedTv.includes(item.key)}
                onClick={() => toggleTv(item.key)}
                index={index}
              />
            ))}
          </div>
        </>
      ) : null}

      <DynamicFieldsSection
        title="Campos de oferta"
        fields={dynamicFields}
        form={form}
        update={update}
        validationErrors={validationErrors}
      />

      <div className="vf-actions split">
        <button className="vf-gray-btn big" onClick={onBack}>
          <ChevronLeft size={20} />
          Volver
        </button>

        <button className="vf-red-btn big" onClick={onNext}>
          Continuar
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function BillingStep({ form, update, showDescuento = true, validationErrors = {}, dynamicFields = [], onBack, onNext }) {
  return (
    <div className="vf-two">
      <div className="vf-panel">
        {showDescuento ? (
          <>
            <h3>¡Promoción disponible!</h3>

            <div className="vf-discount">
              <input
                value={form.promo_codigo}
                onChange={(e) => update("promo_codigo", e.target.value)}
                placeholder="T&P + Resto Promos Comp (-14,01 €)"
              />
              <button>Aplicar descuento</button>
            </div>
          </>
        ) : null}

        <h3 className="vf-subtitle">Tipo de facturación</h3>

        <div className="vf-invoices">
          <InvoiceCard
            title="Factura electrónica"
            active={form.tipo_factura_vodafone === "Factura electrónica"}
            onClick={() => update("tipo_factura_vodafone", "Factura electrónica")}
          />
          <InvoiceCard
            title="Factura en papel"
            active={form.tipo_factura_vodafone === "Factura en papel"}
            onClick={() => update("tipo_factura_vodafone", "Factura en papel")}
          />
        </div>
      </div>

      <div className="vf-panel">
        <h2>Datos bancarios</h2>

        <label className="vf-check bank">
          <input
            type="checkbox"
            checked={form.banco_mismo_titular === "Sí"}
            onChange={(e) => update("banco_mismo_titular", e.target.checked ? "Sí" : "No")}
          />
          Mismo titular
        </label>

        <div className="vf-grid cols-3">
          <Field placeholder="Nombre" value={form.banco_nombre} onChange={(v) => update("banco_nombre", v)} />
          <Field placeholder="Primer apellido" value={form.banco_primer_apellido} onChange={(v) => update("banco_primer_apellido", v)} />
          <Field placeholder="Segundo apellido" value={form.banco_segundo_apellido} onChange={(v) => update("banco_segundo_apellido", v)} />
        </div>

        <div className="vf-grid cols-2 top">
          <FieldSelect value={form.banco_tipo_documento} options={DOCS} onChange={(v) => update("banco_tipo_documento", v)} />
          <Field placeholder="Nº DOCUMENTO" value={form.banco_numero_documento} onChange={(v) => update("banco_numero_documento", cleanDoc(v))} error={validationErrors.banco_numero_documento} />
        </div>

        <div className="top">
          <Field placeholder="IBAN de la cuenta" value={form.iban} onChange={(v) => update("iban", cleanIban(v))} error={validationErrors.iban} />
        </div>

        <p className="vf-invoice-text">
          Tipo de factura: {form.tipo_factura_vodafone.replace("Factura ", "")}
        </p>
      </div>

      <div className="span">
        <DynamicFieldsSection
          title="Campos de facturación"
          fields={dynamicFields}
          form={form}
          update={update}
          validationErrors={validationErrors}
        />
      </div>

      <div className="vf-actions span split">
        <button className="vf-gray-btn big" onClick={onBack}>
          <ChevronLeft size={20} />
          Volver
        </button>

        <button className="vf-red-btn big" onClick={onNext}>
          Continuar
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function SaleHistoryInvoice({ form, productSummary, selectedCampaign, selectedMobileServices, selectedTvServices, fibraOptions }) {
  const campaignName = selectedCampaign?.nombre || form.campaign_nombre || "Campaña";
  const logo = logoByCampaign(selectedCampaign);
  const fibraSelected = normalizeArray(fibraOptions, []).find(
    (item) => (item.subtitle || item.title) === form.fibra
  );

  const cliente = `${form.nombre || ""} ${form.apellidos || ""}`.trim();
  const direccion = [
    form.direccion,
    form.numero_direccion,
    form.piso ? `Piso ${form.piso}` : "",
    form.puerta ? `Puerta ${form.puerta}` : "",
    form.codigo_postal,
    form.localidad,
  ].filter(Boolean).join(" · ");

  const rowsCliente = [
    ["Cliente", cliente || "Pendiente"],
    ["Documento", `${form.tipo_documento_vodafone || ""} ${form.nif_nie_cif || ""}`.trim() || "Pendiente"],
    ["Email", form.correo || "Pendiente"],
    ["Móvil", form.movil_contacto || "Pendiente"],
    ["Fijo", form.telefono_fijo_contacto || "Pendiente"],
    ["Segmento", form.segmento_vodafone || "Pendiente"],
  ];

  const rowsBanco = [
    ["Tipo factura", form.tipo_factura_vodafone || "Pendiente"],
    ["Mismo titular", form.banco_mismo_titular || "Pendiente"],
    ["Titular banco", [form.banco_nombre, form.banco_primer_apellido, form.banco_segundo_apellido].filter(Boolean).join(" ") || "Pendiente"],
    ["Documento banco", `${form.banco_tipo_documento || ""} ${form.banco_numero_documento || ""}`.trim() || "Pendiente"],
    ["IBAN", form.iban || "Pendiente"],
  ];

  return (
    <div className="vf-sale-history">
      <div className="vf-invoice-paper">
        <div className="vf-invoice-head">
          <div className="vf-invoice-brand">
            <div className="vf-invoice-logo">
              <img src={logo} alt={campaignName} />
            </div>
            <div>
              <p>Historial de venta</p>
              <h3>{campaignName}</h3>
              <span>Resumen previo al guardado</span>
            </div>
          </div>

          <div className="vf-invoice-status">
            <strong>PENDIENTE</strong>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="vf-invoice-grid">
          <InvoiceBox title="Datos del cliente" rows={rowsCliente} />
          <InvoiceBox title="Dirección de servicio" rows={[["Dirección", direccion || "Pendiente"]]} large />
        </div>

        <div className="vf-invoice-section">
          <div className="vf-invoice-section-title">Oferta seleccionada</div>
          <div className="vf-lines">
            {form.fibra ? (
              <div className="vf-line-item">
                <span>Fibra</span>
                <strong>{fibraSelected?.title || form.fibra}</strong>
                <em>{fibraSelected?.price || form.fibra}</em>
              </div>
            ) : null}

            {form.tvBloque ? (
              <div className="vf-line-item">
                <span>Bloque TV</span>
                <strong>{form.tvBloque}</strong>
                <em>Seleccionado</em>
              </div>
            ) : null}

            {selectedMobileServices.map((item) => (
              <div className="vf-line-item" key={item.key}>
                <span>Móvil</span>
                <strong>{item.title}</strong>
                <em>x{item.cantidad}</em>
              </div>
            ))}

            {selectedTvServices.map((item) => (
              <div className="vf-line-item" key={item.key}>
                <span>TV</span>
                <strong>{item.title}</strong>
                <em>{item.price || "Sin precio"}</em>
              </div>
            ))}

            {!form.fibra && !form.tvBloque && !selectedMobileServices.length && !selectedTvServices.length ? (
              <div className="vf-line-empty">Sin productos seleccionados</div>
            ) : null}
          </div>
        </div>

        <div className="vf-invoice-grid bottom">
          <InvoiceBox title="Facturación y banco" rows={rowsBanco} />
          <div className="vf-invoice-total">
            <span>Resumen comercial</span>
            <strong>{productSummary || "Pendiente"}</strong>
            {form.promo_codigo ? <p>Promoción: {form.promo_codigo}</p> : <p>Sin promoción aplicada</p>}
          </div>
        </div>

        {form.comentario ? (
          <div className="vf-invoice-notes">
            <strong>Datos complementarios</strong>
            <p>{form.comentario}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InvoiceBox({ title, rows, large = false }) {
  return (
    <div className={`vf-invoice-box ${large ? "large" : ""}`}>
      <h4>{title}</h4>
      {rows.map(([label, value]) => (
        <div className="vf-invoice-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function ComplementStep({
  form,
  update,
  productSummary,
  selectedCampaign,
  selectedMobileServices = [],
  selectedTvServices = [],
  fibraOptions = [],
  dynamicFields = [],
  customBlocks = [],
  validationErrors = {},
  onBack,
  onSave,
  saving,
  campaignName,
}) {
  return (
    <div className="vf-panel">
      <div className="vf-complement-title">Datos complementarios</div>

      <textarea
        value={form.comentario}
        onChange={(e) => update("comentario", e.target.value)}
        placeholder="Observaciones / datos complementarios"
      />

      <DynamicFieldsSection
        title="Campos adicionales"
        fields={dynamicFields.filter((field) => !customBlocks.some((block) => block.key === (field.step || field.tab)))}
        form={form}
        update={update}
        validationErrors={validationErrors}
      />

      {customBlocks.map((block) => (
        <DynamicFieldsSection
          key={block.key}
          title={block.label || block.key}
          fields={dynamicFields.filter((field) => (field.step || field.tab) === block.key)}
          form={form}
          update={update}
          validationErrors={validationErrors}
        />
      ))}

      <div className="vf-summary">
        <strong>Resumen de producto:</strong>
        <p>{productSummary || "Sin productos seleccionados"}</p>
      </div>

      <SaleHistoryInvoice
        form={form}
        productSummary={productSummary}
        selectedCampaign={selectedCampaign}
        selectedMobileServices={selectedMobileServices}
        selectedTvServices={selectedTvServices}
        fibraOptions={fibraOptions}
      />

      <div className="vf-actions split">
        <button className="vf-gray-btn big" onClick={onBack}>
          <ChevronLeft size={20} />
          Volver
        </button>

        <button className="vf-red-btn big" onClick={onSave} disabled={saving}>
          <Save size={20} />
          {saving ? "Guardando..." : `Guardar ficha ${campaignName}`}
        </button>
      </div>
    </div>
  );
}

function DynamicFieldsSection({ title, fields = [], form, update, validationErrors = {} }) {
  if (!fields.length) return null;

  return (
    <div className="vf-dynamic-section">
      <h3>{title}</h3>
      <div className="vf-grid cols-2">
        {fields.map((field) => (
          <DynamicField
            key={field.key}
            field={field}
            value={form?.[field.key] ?? ""}
            error={validationErrors?.[field.key]}
            onChange={(value) => update(field.key, value)}
          />
        ))}
      </div>
    </div>
  );
}

function DynamicField({ field, value, onChange, error }) {
  const label = `${field.label || field.key}${field.required ? " *" : ""}`;
  const options = normalizeArray(field.options, []);

  if (field.type === "textarea") {
    return (
      <div className="span-2">
        <label>{label}</label>
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className={error ? "vf-input-error" : ""} />
        {error ? <small className="vf-error-text">{error}</small> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label>{label}</label>
        <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={error ? "vf-input-error" : ""}>
          <option value="">SELECCIONA</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        {error ? <small className="vf-error-text">{error}</small> : null}
      </div>
    );
  }

  const type = ["date", "email", "number", "tel"].includes(field.type) ? field.type : "text";
  return (
    <Field
      label={label}
      type={type}
      value={value}
      onChange={(next) => {
        if (field.type === "iban") return onChange(cleanIban(next));
        if (field.type === "movil_contacto" || field.type === "tel") return onChange(onlyDigits(next));
        onChange(next);
      }}
      error={error}
    />
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text", disabled = false, className = "", onEnter, error = "" }) {
  return (
    <div className={className}>
      {label ? <label>{label}</label> : null}
      <input
        type={type}
        value={value || ""}
        disabled={disabled}
        placeholder={placeholder}
        className={error ? "vf-input-error" : ""}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
      />
      {error ? <small className="vf-error-text">{error}</small> : null}
    </div>
  );
}

function FieldSelect({ label, value, onChange, options = [] }) {
  const safeOptions = Array.isArray(options) && options.length ? options : [value || ""];
  return (
    <div>
      {label ? <label>{label}</label> : null}
      <select value={value || ""} onChange={(e) => onChange?.(e.target.value)}>
        {safeOptions.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}

function BackRound({ onClick }) {
  return (
    <button className="vf-back-round" onClick={onClick}>
      <ChevronLeft size={28} />
    </button>
  );
}

function CategoryCard({ type, title, button, red, onClick }) {
  return (
    <div className="vf-category">
      <button className="vf-category-box" onClick={onClick}>
        <VodafoneIcon type={type} />
        <p>{title}</p>
      </button>
      <button className={red ? "red" : ""} onClick={onClick}>{button}</button>
    </div>
  );
}

function ProductCard({ item, type, active, onClick }) {
  return (
    <button className={`vf-product-card ${active ? "active" : ""}`} onClick={onClick}>
      <Visual image={item.image} title={item.title} type={type} />
      <div className="vf-card-content">
        <div className="vf-card-title">
          <strong>{item.title}</strong>
          <ChevronDown size={30} />
        </div>
        <p>{item.subtitle}</p>
      </div>
    </button>
  );
}

function MobileCard({ item, qty, onMinus, onPlus }) {
  return (
    <div className="vf-product-card">
      <Visual image={item.image} title={item.title} type="movil" />
      <div className="vf-card-content">
        <div className="vf-card-title">
          <strong>{item.title}</strong>
          <ChevronDown size={30} />
        </div>

        <div className="vf-counter">
          <button onClick={onMinus}><Minus size={18} /></button>
          <span>{qty}</span>
          <button className="plus" onClick={onPlus}><Plus size={20} /></button>
        </div>
      </div>
    </div>
  );
}

function TvCard({ item, active, onClick, index = 0 }) {
  return (
    <button
      className={`vf-tv-card vf-tv-animate ${active ? "active" : ""}`}
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index, 12) * 70}ms` }}
    >
      <Visual image={item.image} title={item.title} type="tv" />
      <div className="vf-card-content">
        <div className="vf-card-title small">
          <strong>{item.title}</strong>
          <ChevronDown size={20} />
        </div>
        <p className="price">{item.price}</p>
      </div>
    </button>
  );
}

function InvoiceCard({ title, active, onClick }) {
  return (
    <button className={`vf-invoice ${active ? "active" : ""}`} onClick={onClick}>
      <div className="vf-radio-row">
        <span />
        <strong>{title}</strong>
      </div>

      {active ? (
        <p>
          Para seguir con la contratación, verifica con el cliente que está de acuerdo
          con que Vodafone le envíe la factura por vía electrónica.
        </p>
      ) : null}
    </button>
  );
}

function Visual({ image, title, type }) {
  if (image) {
    return (
      <div className={`vf-image-wrap ${type || ""}`}>
        <img
          src={image}
          alt={title}
          onError={(e) => {
            e.currentTarget.closest(".vf-image-wrap")?.classList.add("image-error");
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="vf-image-fallback">
          <VodafoneIcon type={type} />
        </div>
      </div>
    );
  }

  return <VodafoneIcon type={type} />;
}

function VodafoneIcon({ type }) {
  if (type === "fibra") {
    return (
      <div className="vf-icon fibra">
        <div className="wifi a" />
        <div className="wifi b" />
        <div className="dot" />
        <div className="router" />
      </div>
    );
  }

  if (type === "movil") {
    return (
      <div className="vf-icon phone">
        <span />
      </div>
    );
  }

  return (
    <div className="vf-icon tv">
      <div>TV</div>
      <span />
    </div>
  );
}

function Style() {
  return (
    <style>{`
      .vf-page {
        min-height: 100vh;
        background: #f1f1f1;
        padding: 24px;
        color: #3f3f46;
        font-family: Arial, Helvetica, sans-serif;
      }

      .vf-shell {
        max-width: 1280px;
        margin: 0 auto;
      }

      .vf-alert {
        margin-bottom: 16px;
        padding: 14px 18px;
        border-radius: 12px;
        font-weight: 700;
      }

      .vf-alert.ok {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #86efac;
      }

      .vf-alert.error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }

      .vf-fade-slide {
        animation: vfEnter .58s cubic-bezier(.22,.75,.2,1) both;
      }

      @keyframes vfEnter {
        from { opacity: 0; transform: translateX(46px) scale(.985); }
        to { opacity: 1; transform: translateX(0) scale(1); }
      }

      .vf-campaign-hero {
        border-radius: 26px;
        background:
          radial-gradient(circle at 50% 0%, rgba(230,0,0,.20), transparent 34%),
          radial-gradient(circle at 20% 45%, rgba(168,85,247,.22), transparent 30%),
          radial-gradient(circle at 80% 40%, rgba(14,165,233,.20), transparent 32%),
          linear-gradient(135deg, #07111f 0%, #0d1425 48%, #111827 100%);
        color: #fff;
        padding: 38px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 22px 55px rgba(15,23,42,.32);
      }

      .vf-hero-title {
        text-align: center;
        margin-bottom: 28px;
      }

      .vf-hero-title p {
        margin: 0;
        color: #a5b4fc;
        font-weight: 800;
        letter-spacing: .16em;
        text-transform: uppercase;
        font-size: 12px;
      }

      .vf-hero-title h1 {
        margin: 8px 0;
        font-size: 34px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .vf-hero-title span {
        color: #cbd5e1;
      }

      .vf-campaign-stage {
        position: relative;
        padding: 26px 6px 16px;
      }

      .vf-glow {
        position: absolute;
        width: 320px;
        height: 320px;
        filter: blur(42px);
        opacity: .42;
        border-radius: 999px;
        pointer-events: none;
      }

      .vf-glow.red {
        background: #e60000;
        left: 45%;
        top: -70px;
      }

      .vf-glow.blue {
        background: #2563eb;
        right: 5%;
        top: 60px;
      }

      .vf-campaign-row {
        position: relative;
        z-index: 2;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 20px;
        align-items: stretch;
      }

      .vf-campaign-card {
        position: relative;
        min-height: 245px;
        border: 1px solid rgba(255,255,255,.18);
        background:
          linear-gradient(180deg, rgba(255,255,255,.13), rgba(255,255,255,.04)),
          rgba(2,6,23,.42);
        border-radius: 20px;
        color: white;
        padding: 18px;
        cursor: pointer;
        overflow: hidden;
        box-shadow: 0 14px 34px rgba(0,0,0,.32);
        transform: translateY(22px);
        opacity: 0;
        animation: cardFloatIn .72s cubic-bezier(.22,.75,.2,1) forwards;
        transition: transform .35s ease, box-shadow .35s ease, border-color .35s ease;
      }

      @keyframes cardFloatIn {
        to { opacity: 1; transform: translateY(0); }
      }

      .vf-campaign-card:hover {
        transform: translateY(-8px) scale(1.025);
        border-color: rgba(255,255,255,.42);
      }

      .vf-campaign-card.active {
        background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.86));
        color: #0f172a;
        border-color: #e60000;
        box-shadow: 0 0 0 2px rgba(230,0,0,.44), 0 0 42px rgba(230,0,0,.36), 0 24px 46px rgba(0,0,0,.36);
        transform: translateY(-10px) scale(1.055);
      }

      .vf-card-light {
        position: absolute;
        inset: auto -30px 0 -30px;
        height: 90px;
        background: linear-gradient(135deg, rgba(230,0,0,.42), rgba(168,85,247,.25), rgba(14,165,233,.22));
        filter: blur(18px);
        opacity: .70;
      }

      .vf-campaign-logo-wrap {
        height: 112px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
      }

      .vf-campaign-logo {
        max-width: 138px;
        max-height: 88px;
        object-fit: contain;
        filter: drop-shadow(0 12px 18px rgba(0,0,0,.28));
        animation: logoZoomPulse 2s ease-in-out infinite;
        transform-origin: center;
      }

      @keyframes logoZoomPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.14); }
      }

      .vf-campaign-info {
        position: relative;
        z-index: 3;
        text-align: center;
        margin-top: 12px;
      }

      .vf-campaign-info h3 {
        margin: 0;
        font-size: 21px;
        font-weight: 900;
      }

      .vf-campaign-info p {
        margin: 6px 0 14px;
        color: inherit;
        opacity: .78;
        font-size: 14px;
      }

      .vf-campaign-product-chip {
        margin: 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 999px;
        background: rgba(15,23,42,.78);
        color: white;
        padding: 8px 12px;
        font-size: 13px;
      }

      .vf-campaign-product-chip strong {
        font-size: 17px;
      }

      .vf-check-selected {
        position: absolute;
        right: 14px;
        top: 14px;
        z-index: 4;
        width: 38px;
        height: 38px;
        border-radius: 999px;
        background: #e60000;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 24px rgba(230,0,0,.36);
      }

      .vf-dots {
        position: relative;
        z-index: 3;
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 26px;
      }

      .vf-dots span {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: rgba(255,255,255,.34);
      }

      .vf-dots span.active {
        width: 28px;
        background: #e60000;
      }

      .vf-campaign-note {
        margin-top: 26px;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
      }

      .vf-campaign-note strong {
        color: #fff;
      }

      .vf-start,
      .vf-panel {
        background: #fff;
        border-radius: 12px;
        padding: 28px;
        box-shadow: 0 4px 14px rgba(0,0,0,.10);
      }

      .vf-selected-head {
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        border: 1px solid #fee2e2;
        background: linear-gradient(90deg, #fff1f2, #ffffff);
        border-radius: 18px;
        padding: 16px;
      }

      .vf-selected-logo {
        width: 70px;
        height: 70px;
        border-radius: 18px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 22px rgba(0,0,0,.10);
      }

      .vf-selected-logo img {
        max-width: 56px;
        max-height: 56px;
        object-fit: contain;
        animation: logoZoomPulse 2s ease-in-out infinite;
      }

      .vf-selected-head p {
        margin: 0;
        color: #6b7280;
        font-size: 13px;
        font-weight: 700;
      }

      .vf-selected-head h2 {
        margin: 4px 0 0;
        color: #e60000;
        font-size: 24px;
      }

      .vf-selected-head button {
        margin-left: auto;
        border: 1px solid #fecaca;
        background: white;
        color: #b91c1c;
        border-radius: 12px;
        height: 42px;
        padding: 0 14px;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .vf-selected-mini {
        margin-bottom: 14px;
        background: #fff;
        border-radius: 16px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 3px 12px rgba(0,0,0,.08);
      }

      .vf-selected-mini div {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .vf-selected-mini img {
        width: 38px;
        height: 38px;
        object-fit: contain;
        animation: logoZoomPulse 2s ease-in-out infinite;
      }

      .vf-selected-mini strong {
        font-size: 17px;
      }

      .vf-selected-mini span {
        border-radius: 999px;
        background: #dcfce7;
        color: #166534;
        padding: 5px 10px;
        font-size: 12px;
        font-weight: 800;
      }

      .vf-selected-mini button {
        border: 1px solid #bfdbfe;
        background: #eff6ff;
        color: #1d4ed8;
        border-radius: 12px;
        height: 40px;
        padding: 0 14px;
        font-weight: 800;
        cursor: pointer;
      }

      .vf-start h1 {
        text-align: center;
        margin: 0 0 18px;
        color: #444;
        font-size: 23px;
      }

      .vf-phrase {
        max-width: 720px;
        margin: 0 auto 28px;
        background: #fff0f0;
        border: 1px solid #ffcaca;
        color: #b30000;
        border-radius: 14px;
        padding: 16px 20px;
        text-align: center;
        font-weight: 700;
      }

      .vf-ingreso {
        display: grid;
        grid-template-columns: 210px 1fr 160px;
        gap: 18px;
        align-items: end;
      }

      .vf-page label {
        display: block;
        margin-bottom: 6px;
        color: #626262;
        font-size: 14px;
        font-weight: 600;
      }

      .vf-page input,
      .vf-page select,
      .vf-page textarea {
        width: 100%;
        height: 47px;
        border: 1px solid #9ca3af;
        border-radius: 6px;
        background: #fff;
        color: #333;
        padding: 0 12px;
        outline: none;
        font-size: 15px;
      }

      .vf-page input:disabled {
        background: #e5e7eb;
        color: #555;
      }

      .vf-page input.vf-input-error {
        border-color: #e60000;
        background: #fff5f5;
        box-shadow: 0 0 0 3px rgba(230, 0, 0, .10);
      }

      .vf-error-text {
        display: block;
        margin-top: 6px;
        color: #b91c1c;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.3;
      }

      .vf-page textarea {
        height: 150px;
        padding: 14px;
        resize: vertical;
      }

      .vf-red-btn,
      .vf-gray-btn {
        border: 0;
        border-radius: 8px;
        height: 47px;
        padding: 0 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        font-weight: 800;
      }

      .vf-red-btn {
        background: #e60000;
        color: #fff;
      }

      .vf-red-btn:hover {
        background: #c90000;
      }

      .vf-gray-btn {
        background: #555;
        color: #fff;
      }

      .vf-red-btn.big,
      .vf-gray-btn.big {
        height: 54px;
        min-width: 170px;
        font-size: 16px;
      }

      .vf-wizard {
        overflow: hidden;
      }

      .vf-stepbar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-bottom: 18px;
      }

      .vf-step-dot {
        background: #fff;
        border-radius: 12px;
        border: 1px solid #d1d5db;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #737373;
        cursor: pointer;
        text-align: left;
      }

      .vf-step-dot span {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
      }

      .vf-step-dot.active {
        border-color: #e60000;
        color: #e60000;
        box-shadow: 0 0 0 2px rgba(230,0,0,.12);
      }

      .vf-step-dot.active span,
      .vf-step-dot.done span {
        background: #e60000;
        color: #fff;
      }

      .vf-step-dot p {
        margin: 0;
        font-weight: 700;
        font-size: 14px;
      }

      .vf-slider {
        width: 100%;
        overflow: hidden;
      }

      .vf-track {
        display: flex;
        width: 400%;
        transition: transform .62s cubic-bezier(.22,.75,.2,1);
        will-change: transform;
      }

      .vf-slide {
        width: 25%;
        flex: 0 0 25%;
        padding-right: 2px;
      }

      .vf-panel h2 {
        color: #e60000;
        font-size: 30px;
        line-height: 1.15;
        margin: 0 0 24px;
        font-weight: 900;
      }

      .vf-panel h3 {
        margin: 0 0 16px;
        font-size: 18px;
        color: #404040;
      }

      .vf-grid {
        display: grid;
        gap: 16px;
      }

      .vf-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
      .vf-grid.cols-6 { grid-template-columns: repeat(6, 1fr); }
      .vf-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
      .vf-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
      .vf-grid .span-2 { grid-column: span 2; }

      .vf-check {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 29px;
        color: #444;
        font-weight: 600;
      }

      .vf-check input {
        width: 18px;
        height: 18px;
      }

      .vf-check.bank {
        margin-top: 0;
        margin-bottom: 20px;
      }

      .vf-address-box {
        margin-top: 24px;
        padding: 18px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: #fafafa;
      }

      .vf-address-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }

      .vf-address-head button,
      .vf-discount button {
        background: #555;
        color: #fff;
        border: 0;
        border-radius: 8px;
        height: 42px;
        padding: 0 16px;
        font-weight: 800;
        cursor: pointer;
      }

      .vf-actions {
        margin-top: 28px;
        display: flex;
        gap: 14px;
      }

      .vf-actions.right {
        justify-content: flex-end;
      }

      .vf-actions.split {
        justify-content: space-between;
      }

      .vf-actions.span {
        grid-column: 1 / -1;
      }

      .vf-categories {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 46px;
      }

      .vf-category {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .vf-category-box {
        width: 240px;
        height: 300px;
        background: #fff;
        border: 0;
        border-radius: 8px;
        box-shadow: 0 5px 14px rgba(0,0,0,.20);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .vf-category-box p {
        margin: 32px 0 0;
        color: #666;
        font-size: 22px;
      }

      .vf-category > button:last-child {
        width: 240px;
        height: 56px;
        margin-top: 18px;
        border: 0;
        border-radius: 8px;
        background: #e5e5e5;
        color: #555;
        font-size: 19px;
        font-weight: 800;
        cursor: pointer;
      }

      .vf-category > button.red {
        background: #e60000;
        color: #fff;
      }

      .vf-back-round {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 0;
        background: #555;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 22px;
        cursor: pointer;
      }


      .vf-tv-block-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(180px, 1fr));
        gap: 22px 52px;
        max-width: 940px;
      }

      .vf-tv-block {
        min-height: 66px;
        border: 2px solid #bcbcbc;
        border-radius: 8px;
        background: #fff;
        color: #777;
        font-size: 18px;
        font-weight: 700;
        padding: 10px 18px;
        cursor: pointer;
        transition: all .22s ease;
      }

      .vf-tv-block:hover,
      .vf-tv-block.active {
        border-color: #008da5;
        color: #555;
        box-shadow: 0 6px 16px rgba(0, 141, 165, .16);
        transform: translateY(-2px);
      }

      .vf-product-grid {
        display: grid;
        gap: 26px;
      }

      .vf-product-grid.two {
        grid-template-columns: repeat(2, 1fr);
      }

      .vf-product-grid.three {
        grid-template-columns: repeat(3, 1fr);
      }

      .vf-product-card,
      .vf-tv-card {
        min-height: 178px;
        background: #fff;
        border: 0;
        border-radius: 8px;
        box-shadow: 0 5px 14px rgba(0,0,0,.20);
        padding: 26px;
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 26px;
        align-items: center;
        text-align: left;
        cursor: pointer;
      }

      .vf-product-card.active,
      .vf-tv-card.active {
        box-shadow: 0 0 0 3px #e60000, 0 5px 14px rgba(0,0,0,.20);
      }

      .vf-card-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #d1d5db;
        padding-bottom: 12px;
      }

      .vf-card-title strong {
        color: #555;
        font-size: 25px;
      }

      .vf-card-title.small strong {
        font-size: 16px;
        color: #555;
      }

      .vf-card-content p {
        margin: 14px 0 0;
        color: #777;
        font-size: 18px;
      }

      .vf-card-content p.price {
        color: #111827;
        font-size: 27px;
        font-weight: 900;
        line-height: 1.05;
      }

      .vf-tv-card {
        min-height: 165px;
        grid-template-columns: 132px 1fr;
        padding: 22px;
        opacity: 0;
        transform: translateY(24px) scale(.985);
      }

      .vf-tv-card.vf-tv-animate {
        animation: vfTvCardEnter .62s cubic-bezier(.22,.75,.2,1) forwards;
      }

      @keyframes vfTvCardEnter {
        0% { opacity: 0; transform: translateY(26px) scale(.975); }
        65% { opacity: 1; transform: translateY(-4px) scale(1.012); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      .vf-limit {
        margin: 0 0 18px;
        color: #555;
        font-weight: 800;
      }

      .vf-counter {
        margin-top: 18px;
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .vf-counter button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid #d1d5db;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .vf-counter button.plus {
        background: #008aa6;
        border: 0;
        color: #fff;
      }

      .vf-counter span {
        width: 56px;
        height: 52px;
        border: 1px solid #9ca3af;
        border-radius: 6px;
        color: #444;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .vf-two {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .vf-discount {
        display: grid;
        grid-template-columns: 1fr 170px;
        gap: 14px;
      }

      .vf-subtitle {
        margin-top: 28px !important;
        text-transform: uppercase;
      }

      .vf-invoices {
        display: flex;
        gap: 26px;
      }

      .vf-invoice {
        width: 220px;
        min-height: 150px;
        background: #fff;
        border: 1px solid #d1d5db;
        border-radius: 12px;
        padding: 18px;
        text-align: left;
        cursor: pointer;
      }

      .vf-invoice.active {
        border-color: #008f8f;
        background: #ecfeff;
      }

      .vf-radio-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .vf-radio-row span {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid #008f8f;
        background: #008f8f;
      }

      .vf-radio-row strong {
        color: #333;
        font-size: 17px;
      }

      .vf-invoice p {
        margin: 16px 0 0;
        color: #008f8f;
        font-size: 13px;
        line-height: 1.5;
      }

      .top {
        margin-top: 16px;
      }

      .vf-invoice-text {
        margin: 22px 0 0;
        color: #333;
        font-size: 20px;
      }

      .vf-complement-title {
        background: #e60000;
        color: white;
        border-radius: 18px;
        padding: 30px;
        text-align: center;
        font-size: 34px;
        font-weight: 800;
        margin-bottom: 22px;
      }

      .vf-summary {
        margin-top: 18px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: #fafafa;
        padding: 16px;
      }

      .vf-summary p {
        margin: 8px 0 0;
        color: #555;
      }

      .vf-image-wrap {
        width: 118px;
        height: 118px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
        animation: vfImageSoftIn .55s cubic-bezier(.22,.75,.2,1) both;
      }

      .vf-image-wrap.tv {
        width: 132px;
        height: 132px;
        margin-left: -8px;
      }

      .vf-image-wrap img {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        position: absolute;
        z-index: 2;
        transform-origin: center;
        filter: drop-shadow(0 10px 16px rgba(0,0,0,.18));
        animation: vfImageFloat .95s cubic-bezier(.22,.75,.2,1) both;
        transition: transform .28s ease, filter .28s ease;
      }

      .vf-tv-card:hover .vf-image-wrap img,
      .vf-product-card:hover .vf-image-wrap img {
        transform: scale(1.08) translateY(-2px);
        filter: drop-shadow(0 14px 18px rgba(0,0,0,.22));
      }

      .vf-image-fallback {
        display: none;
      }

      .vf-image-wrap.image-error .vf-image-fallback {
        display: flex;
      }

      @keyframes vfImageSoftIn {
        from { opacity: 0; transform: translateX(-18px) scale(.94); }
        to { opacity: 1; transform: translateX(0) scale(1); }
      }

      @keyframes vfImageFloat {
        from { opacity: 0; transform: translateY(12px) scale(.88); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .vf-icon {
        width: 105px;
        height: 105px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .vf-icon.fibra .router {
        width: 82px;
        height: 45px;
        background: #e60000;
        border-radius: 8px;
        position: absolute;
        bottom: 5px;
      }

      .vf-icon.fibra .router:before,
      .vf-icon.fibra .router:after {
        content: "";
        position: absolute;
        width: 7px;
        height: 7px;
        background: white;
        border-radius: 50%;
        bottom: 12px;
      }

      .vf-icon.fibra .router:before { left: 18px; }
      .vf-icon.fibra .router:after { right: 18px; }

      .vf-icon.fibra .wifi {
        position: absolute;
        border: 5px solid #e60000;
        border-bottom: 0;
        border-left-color: transparent;
        border-right-color: transparent;
        border-radius: 90px 90px 0 0;
      }

      .vf-icon.fibra .wifi.a {
        width: 78px;
        height: 38px;
        top: 2px;
      }

      .vf-icon.fibra .wifi.b {
        width: 48px;
        height: 24px;
        top: 20px;
      }

      .vf-icon.fibra .dot {
        width: 12px;
        height: 12px;
        background: #e60000;
        border-radius: 50%;
        position: absolute;
        top: 46px;
      }

      .vf-icon.phone {
        width: 70px;
        height: 110px;
        border-radius: 16px;
        border: 8px solid #e60000;
        background: white;
      }

      .vf-icon.phone span {
        width: 22px;
        height: 5px;
        background: #e60000;
        border-radius: 10px;
        position: absolute;
        bottom: 12px;
      }

      .vf-icon.tv div {
        width: 100px;
        height: 65px;
        border: 7px solid #e60000;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e60000;
        font-weight: 900;
        font-size: 24px;
      }

      .vf-icon.tv span {
        position: absolute;
        bottom: 2px;
        width: 60px;
        height: 8px;
        background: #e60000;
        border-radius: 10px;
      }


      .vf-sale-history {
        margin-top: 22px;
        animation: vfInvoiceIn .58s cubic-bezier(.22,.75,.2,1) both;
      }

      @keyframes vfInvoiceIn {
        from { opacity: 0; transform: translateY(22px) scale(.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .vf-invoice-paper {
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
        padding: 22px;
        box-shadow: 0 14px 34px rgba(15, 23, 42, .10);
      }

      .vf-invoice-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding-bottom: 18px;
        border-bottom: 1px solid #e5e7eb;
      }

      .vf-invoice-brand {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .vf-invoice-logo {
        width: 82px;
        height: 82px;
        border-radius: 18px;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 24px rgba(0,0,0,.12);
        overflow: hidden;
      }

      .vf-invoice-logo img {
        width: 72px;
        height: 72px;
        object-fit: contain;
      }

      .vf-invoice-brand p {
        margin: 0;
        color: #e60000;
        font-weight: 900;
        letter-spacing: .14em;
        text-transform: uppercase;
        font-size: 12px;
      }

      .vf-invoice-brand h3 {
        margin: 5px 0 3px;
        color: #111827;
        font-size: 25px;
        font-weight: 900;
      }

      .vf-invoice-brand span {
        color: #6b7280;
        font-size: 13px;
        font-weight: 700;
      }

      .vf-invoice-status {
        min-width: 135px;
        border-radius: 16px;
        background: #fff7ed;
        color: #9a3412;
        border: 1px solid #fed7aa;
        padding: 12px 14px;
        text-align: center;
      }

      .vf-invoice-status strong {
        display: block;
        font-size: 14px;
      }

      .vf-invoice-status span {
        display: block;
        margin-top: 4px;
        font-size: 12px;
      }

      .vf-invoice-grid {
        margin-top: 18px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .vf-invoice-grid.bottom {
        align-items: stretch;
      }

      .vf-invoice-box,
      .vf-invoice-total {
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        background: #fff;
        padding: 16px;
      }

      .vf-invoice-box h4,
      .vf-invoice-section-title {
        margin: 0 0 12px;
        color: #111827;
        font-size: 17px;
        font-weight: 900;
      }

      .vf-invoice-row {
        display: grid;
        grid-template-columns: 145px 1fr;
        gap: 12px;
        padding: 9px 0;
        border-bottom: 1px dashed #e5e7eb;
      }

      .vf-invoice-row:last-child {
        border-bottom: 0;
      }

      .vf-invoice-row span {
        color: #6b7280;
        font-size: 13px;
        font-weight: 800;
      }

      .vf-invoice-row strong {
        color: #111827;
        font-size: 14px;
        font-weight: 800;
        word-break: break-word;
      }

      .vf-invoice-section {
        margin-top: 18px;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        background: #fff;
        padding: 16px;
      }

      .vf-lines {
        display: grid;
        gap: 10px;
      }

      .vf-line-item {
        display: grid;
        grid-template-columns: 100px 1fr auto;
        gap: 12px;
        align-items: center;
        border-radius: 12px;
        background: #f9fafb;
        padding: 12px 14px;
        border: 1px solid #eef2f7;
      }

      .vf-line-item span {
        color: #e60000;
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .vf-line-item strong {
        color: #111827;
        font-size: 15px;
      }

      .vf-line-item em {
        color: #111827;
        font-style: normal;
        font-size: 17px;
        font-weight: 900;
      }

      .vf-line-empty {
        border-radius: 12px;
        background: #f9fafb;
        color: #6b7280;
        padding: 14px;
        font-weight: 800;
      }

      .vf-invoice-total {
        background: linear-gradient(135deg, #111827, #1f2937);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .vf-invoice-total span {
        color: #fca5a5;
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .12em;
      }

      .vf-invoice-total strong {
        margin-top: 10px;
        font-size: 20px;
        line-height: 1.35;
      }

      .vf-invoice-total p {
        margin: 12px 0 0;
        color: #d1d5db;
        font-weight: 700;
      }

      .vf-invoice-notes {
        margin-top: 18px;
        border-radius: 16px;
        background: #fff7ed;
        border: 1px solid #fed7aa;
        padding: 16px;
      }

      .vf-invoice-notes strong {
        color: #9a3412;
      }

      .vf-invoice-notes p {
        margin: 8px 0 0;
        color: #7c2d12;
        line-height: 1.5;
      }

      @media (max-width: 980px) {
        .vf-ingreso,
        .vf-grid.cols-4,
        .vf-grid.cols-6,
        .vf-grid.cols-3,
        .vf-grid.cols-2,
        .vf-categories,
        .vf-product-grid.two,
        .vf-product-grid.three,
        .vf-tv-block-grid,
        .vf-two,
        .vf-stepbar {
          grid-template-columns: 1fr;
        }

        .vf-track {
          width: 400%;
        }

        .vf-slide {
          width: 25%;
          flex-basis: 25%;
        }

        .vf-category-box,
        .vf-category > button:last-child {
          width: 100%;
          max-width: 330px;
        }

        .vf-actions.split {
          flex-direction: column;
        }

        .vf-invoice-head,
        .vf-invoice-brand {
          align-items: flex-start;
          flex-direction: column;
        }

        .vf-invoice-grid,
        .vf-line-item {
          grid-template-columns: 1fr;
        }

        .vf-invoice-row {
          grid-template-columns: 1fr;
          gap: 4px;
        }
      }
    `}</style>
  );
}
