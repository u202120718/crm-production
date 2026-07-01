import { useEffect, useMemo, useState } from "react";
import {
  FilePlus2,
  Save,
  Tv,
  Layers3,
  ChevronRight,
  RotateCcw,
  Sparkles,
  FolderOpen,
  CheckCircle2,
  Search,
  Wifi,
  Smartphone,
  MonitorPlay,
  Plus,
  Minus,
  MapPin,
  CreditCard,
  ChevronLeft,
} from "lucide-react";

const BASE_STORAGE_KEY = "crm_ficha_venta_v14";
const PHRASE_META_PREFIX = "crm_daily_sales_phrase_v1";
const PRIVILEGED_CLOSE_ROLES = ["Backoffice", "Admin", "Gerente"];
const LIMITED_CLOSE_KEYS = ["comentario", "documentacion", "comercial_cierre"];

const SALES_PHRASES = [
  "Cada llamada es una puerta abierta: hoy puede salir tu mejor venta.",
  "Tu voz transmite confianza; úsala para cerrar con seguridad.",
  "Vender bien no es insistir, es conectar con la necesidad correcta.",
  "Hoy no cargues una ficha más, carga una oportunidad real.",
  "Cada cliente que atiendes puede convertirse en tu mejor resultado del día.",
  "La constancia en ventas siempre termina dejando huella en los números.",
  "Tu energía comercial también se refleja en cada ficha que completas.",
  "Una buena venta empieza con atención y termina con orden en la gestión.",
  "Detrás de cada ficha bien hecha hay una venta mejor defendida.",
  "No subestimes una nueva gestión: puede convertirse en tu cierre estrella.",
  "Las grandes metas comerciales se construyen una ficha a la vez.",
  "Tu disciplina comercial vale tanto como tu capacidad de persuadir.",
  "Una venta bien cargada es una venta con más posibilidades de avanzar.",
  "La actitud correcta también vende, incluso antes de hablar.",
  "Hoy puede ser el día en que conviertas esfuerzo en resultados.",
  "Cada contacto bien trabajado te acerca al objetivo del mes.",
  "Tu mejor argumento sigue siendo la seguridad con la que comunicas.",
  "Las ventas fuertes nacen de procesos claros y bien ejecutados.",
  "Gestionar con orden también es parte del talento comercial.",
  "Confía en tu criterio, en tu experiencia y en tu capacidad para cerrar.",
];

const CAMPAIGN_BRANDS = [
  {
    key: "VODAFONE",
    label: "VODAFONE",
    images: [
      "/img/campaigns/vodafone.png",
      "/img/campaigns/vodafone.jpg",
      "/img/campaigns/vodafone.jpeg",
      "/img/campaigns/vodafone.webp",
    ],
    accent: "rgba(225, 29, 72, 0.18)",
    border: "rgba(225, 29, 72, 0.35)",
  },
  {
    key: "MASMOVIL",
    label: "MASMOVIL",
    images: [
      "/img/campaigns/masmovil.png",
      "/img/campaigns/masmovil.jpg",
      "/img/campaigns/masmovil.jpeg",
      "/img/campaigns/masmovil.webp",
    ],
    accent: "rgba(245, 158, 11, 0.18)",
    border: "rgba(245, 158, 11, 0.35)",
  },
  {
    key: "POPULOS",
    label: "POPULOS",
    images: [
      "/img/campaigns/populos.png",
      "/img/campaigns/populos.jpg",
      "/img/campaigns/populos.jpeg",
      "/img/campaigns/populos.webp",
    ],
    accent: "rgba(34, 197, 94, 0.18)",
    border: "rgba(34, 197, 94, 0.35)",
  },
  {
    key: "NATURGY",
    label: "NATURGY",
    images: [
      "/img/campaigns/naturgy.png",
      "/img/campaigns/naturgy.jpg",
      "/img/campaigns/naturgy.jpeg",
      "/img/campaigns/naturgy.webp",
    ],
    accent: "rgba(59, 130, 246, 0.18)",
    border: "rgba(59, 130, 246, 0.35)",
  },
  {
    key: "ENDESA",
    label: "ENDESA",
    images: [
      "/img/campaigns/endesa.png",
      "/img/campaigns/endesa.jpg",
      "/img/campaigns/endesa.jpeg",
      "/img/campaigns/endesa.webp",
    ],
    accent: "rgba(168, 85, 247, 0.18)",
    border: "rgba(168, 85, 247, 0.35)",
  },
  {
    key: "NORDY",
    label: "NORDY",
    images: [
      "/img/campaigns/nordy.png",
      "/img/campaigns/nordy.jpg",
      "/img/campaigns/nordy.jpeg",
      "/img/campaigns/nordy.webp",
    ],
    accent: "rgba(20, 184, 166, 0.18)",
    border: "rgba(20, 184, 166, 0.35)",
  },
];

const BASE_TAB_CONFIG = [
  { key: "control", label: "Control" },
  { key: "cliente", label: "Cliente" },
  { key: "direccion", label: "Dirección" },
  { key: "oferta", label: "Oferta" },
  { key: "lineas", label: "Líneas" },
  { key: "cierre", label: "Cierre" },
];

const TV_SERVICES = [
  { key: "basico", name: "TV Básico", image: "/img/tv/basico.jpg", desc: "Canales esenciales" },
  { key: "esencial", name: "TV Esencial", image: "/img/tv/esencial.jpg", desc: "Entretenimiento diario" },
  { key: "futbol", name: "Fútbol", image: "/img/tv/futbol.jpg", desc: "Deportes en vivo" },
  { key: "netflix", name: "Netflix", image: "/img/tv/netflix.jpg", desc: "Streaming premium" },
  { key: "disney", name: "Disney+", image: "/img/tv/disney.jpg", desc: "Familia y series" },
  { key: "prime", name: "Amazon Prime", image: "/img/tv/prime.jpg", desc: "Películas y series" },
];

const VODAFONE_SFID_OPTIONS = [
  { value: "ESPC0231", label: "ESPC0231" },
  { value: "ESPC0450", label: "ESPC0450" },
  { value: "ESPC1088", label: "ESPC1088" },
];

const VODAFONE_DOCUMENT_OPTIONS = ["N.I.F.", "N.I.E.", "C.I.F.", "PASAPORTE"];

const VODAFONE_CATEGORY_OPTIONS = [
  {
    key: "fibra",
    title: "Fibra + Fijo",
    subtitle: "Configurar fibra",
    icon: Wifi,
    accent: "from-rose-500/20 to-orange-500/10",
  },
  {
    key: "linea",
    title: "Línea móvil",
    subtitle: "Configurar líneas",
    icon: Smartphone,
    accent: "from-cyan-500/20 to-sky-500/10",
  },
  {
    key: "tv",
    title: "Vodafone TV",
    subtitle: "Seleccionar TV",
    icon: MonitorPlay,
    accent: "from-violet-500/20 to-fuchsia-500/10",
  },
];

const VODAFONE_FIBRA_OPTIONS = [
  { key: "600 MB NEBA", title: "Fibra 600 Mb", subtitle: "600 MB NEBA" },
  { key: "1 GB NEBA", title: "Fibra 1 Gb", subtitle: "1 GB NEBA" },
];

const DEFAULT_VODAFONE_TV_OPTIONS = [
  { key: "VODAFONE TV CON HBO MAX", title: "Vodafone TV con HBO Max", price: "11,00 € / mes" },
  { key: "DISNEY+ ESTÁNDAR CON ANUNCIOS", title: "Disney+ Estándar con Anuncios", price: "6,99 € / mes" },
  { key: "TV CON DISNEY+ ESTÁNDAR", title: "TV con Disney+ Estándar", price: "12,00 € / mes" },
  { key: "NETFLIX ESTÁNDAR CON ANUNCIOS", title: "Netflix - Estandar con anuncios", price: "8,99 € / mes" },
  { key: "NETFLIX ESTÁNDAR", title: "Netflix - Estandar", price: "14,99 € / mes" },
  { key: "NETFLIX PREMIUM", title: "Netflix - Premium", price: "21,99 € / mes" },
  { key: "VODAFONE TV CON PRIME", title: "Vodafone TV con Prime", price: "6,99 € / mes" },
  { key: "VODAFONE TV CON HBO MAX Y PRIME", title: "Vodafone TV con HBO Max y Prime", price: "15,00 € / mes" },
  { key: "TV CON DISNEY+ ESTÁNDAR Y PRIME", title: "TV con Disney+ Estándar y Prime", price: "16,00 € / mes" },
  { key: "TV CON HBO MAX Y DISNEY+ ESTÁNDAR", title: "TV con HBO Max y Disney+ Estándar", price: "20,00 € / mes" },
  { key: "TV CON HBO MAX, DISNEY+ ESTÁNDAR Y PRIME", title: "TV con HBO Max, Disney+ Estándar y Prime", price: "23,00 € / mes" },
  { key: "TV CON DISNEY+ ESTÁNDAR, PRIME Y FILMIN", title: "TV con Disney+ Estándar, Prime y Filmin", price: "22,00 € / mes" },
  { key: "VODAFONE TV", title: "Vodafone TV", price: "5,00 € / mes" },
  { key: "PLAN FUTBOL DE DAZN", title: "Plan Futbol de DAZN", price: "19,99 € / mes" },
  { key: "PLAN MOTOR DE DAZN", title: "Plan Motor de DAZN", price: "19,99 € / mes" },
  { key: "DEPORTES", title: "Deportes", price: "6,00 € / mes" },
  { key: "VODAFONE TV CON FILMIN", title: "Vodafone TV con Filmin", price: "5,00 € / mes" },
  { key: "DOCUMENTALES", title: "Documentales", price: "8,00 € / mes" },
  { key: "ONETORO TV", title: "Onetoro TV", price: "14,99 € / mes" },
  { key: "CAZA Y PESCA", title: "Caza y Pesca", price: "6,99 € / mes" },
  { key: "+18", title: "+18", price: "9,99 € / mes" },
  { key: "AMC+", title: "AMC+", price: "4,99 € / mes" },
  { key: "MÁS SERIES", title: "Más Series", price: "6,00 € / mes" },
  { key: "PLAN PREMIUM DE DAZN", title: "Plan Premium de DAZN", price: "31,99 € / mes" },
];

function normalizeVodafoneTvOptions(rawOptions = []) {
  return rawOptions
    .filter(Boolean)
    .map((item, index) => ({
      key: upperText(item?.key || item?.title || item?.nombre || `TV ${index + 1}`),
      title: item?.title || item?.nombre || item?.label || `TV ${index + 1}`,
      price: item?.price || item?.precio || item?.importe || "",
      image: item?.image || item?.imagen || "",
    }));
}

function resolveVodafoneTvOptions(campaign) {
  const runtime =
    campaign?.vodafoneTvOptions ||
    campaign?.vodafoneConfig?.tvOptions ||
    campaign?.configuracionVodafone?.tvOptions ||
    campaign?.configuracion?.tvOptions ||
    campaign?.catalogos?.tvOptions ||
    [];

  const parsed = normalizeVodafoneTvOptions(runtime);
  return parsed.length ? parsed : DEFAULT_VODAFONE_TV_OPTIONS;
}

const VODAFONE_MOBILE_OPTIONS = [
  { key: "movil_30gb", title: "Móvil 30GB", plan: "30GB" },
  { key: "movil_60gb", title: "Móvil 60GB", plan: "60GB" },
  { key: "movil_160gb", title: "Móvil 160GB", plan: "160GB" },
  { key: "movil_ilimitada", title: "Móvil ilimitada", plan: "ILIMITADA" },
];

const BASE_FIELDS = [
  { key: "comercial", label: "Comercial", type: "user_comercial", tab: "control" },
  { key: "coordinador", label: "Coordinador", type: "user_coord", tab: "control" },
  { key: "supervisor", label: "Supervisor", type: "user_supervisor", tab: "control" },

  { key: "cliente_razon_social", label: "Cliente / Razón Social", type: "text", tab: "cliente" },
  { key: "nif_nie_cif", label: "NIF/NIE/CIF", type: "text", tab: "cliente" },
  { key: "fecha_nacimiento_creacion", label: "Fecha nacimiento / creación", type: "date", tab: "cliente" },
  { key: "movil_contacto", label: "Móvil contacto", type: "tel", tab: "cliente" },
  { key: "iban", label: "IBAN", type: "text", tab: "cliente" },
  { key: "correo", label: "Correo", type: "email", tab: "cliente" },
  { key: "nacionalidad", label: "Nacionalidad", type: "text", tab: "cliente" },
  { key: "sexo", label: "Sexo", type: "select", tab: "cliente", options: ["Masculino", "Femenino", "Otro"] },

  { key: "direccion", label: "Dirección", type: "text", tab: "direccion" },
  { key: "numero_direccion", label: "Número", type: "text", tab: "direccion" },
  { key: "bloque", label: "Bloque", type: "text", tab: "direccion" },
  { key: "portal", label: "Portal", type: "text", tab: "direccion" },
  { key: "escalera", label: "Escalera", type: "text", tab: "direccion" },
  { key: "piso", label: "Piso", type: "text", tab: "direccion" },
  { key: "puerta", label: "Puerta", type: "text", tab: "direccion" },
  { key: "codigo_postal", label: "Código Postal", type: "text", tab: "direccion" },
  { key: "localidad", label: "Localidad", type: "text", tab: "direccion" },

  { key: "cantidad_moviles", label: "Cantidad de móviles", type: "number", tab: "oferta" },
  { key: "precio_promo_luego", label: "Precio promo / luego", type: "text", tab: "oferta" },

  { key: "linea_principal_numero", label: "Número principal", type: "tel", tab: "lineas" },
  { key: "linea_principal_operador", label: "Operador principal", type: "text", tab: "lineas" },

  { key: "comentario", label: "Comentario", type: "textarea", tab: "cierre" },
  { key: "documentacion", label: "Documentación", type: "file", tab: "cierre" },
  { key: "coordinador_operacion", label: "Coordinador operación", type: "user_coord", tab: "cierre" },
  { key: "comercial_cierre", label: "Comercial cierre", type: "user_comercial", tab: "cierre" },
  { key: "comentario_final", label: "Comentario final", type: "textarea", tab: "cierre" },
  { key: "fecha_activacion_fijo", label: "Fecha activación fijo", type: "date", tab: "cierre" },
  { key: "fecha_activacion_total", label: "Fecha activación total", type: "date", tab: "cierre" },
  { key: "venta_recuperada", label: "Venta recuperada", type: "select", tab: "cierre", options: ["Sí", "No"] },
  { key: "sondeo_auto_presencial", label: "Sondeo auto/presencial", type: "select", tab: "cierre", options: ["Auto", "Presencial"] },
  { key: "validador", label: "Validador", type: "user_backoffice", tab: "cierre" },
  { key: "liquidado", label: "Liquidado", type: "select", tab: "cierre", options: ["Sí", "No"] },
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
      data?.errors?.cliente?.[0] ||
      data?.errors?.campana?.[0] ||
      data?.errors?.comercial?.[0] ||
      "No se pudo completar la solicitud.";
    throw new Error(message);
  }

  return data;
}

function getThemeValue() {
  try {
    const saved = localStorage.getItem("crm_app_settings_v1");
    if (!saved) return "night";
    return JSON.parse(saved)?.theme || "night";
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
      saveBtn: "border-indigo-300 bg-indigo-100 text-indigo-900 hover:bg-indigo-200",
      submitBtn: "border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
      clearBtn: "border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200",
      tvIdle: "border-slate-200 bg-white hover:bg-slate-50",
      tvActive: "border-cyan-300 bg-cyan-50",
      tvFrame: "bg-slate-100",
      phrase: "border-fuchsia-200 bg-fuchsia-50 text-slate-800",
      changeBtn: "border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200",
      campaignCard: "border-slate-200 bg-white hover:bg-slate-50",
      campaignCardActive: "border-cyan-300 bg-cyan-50 shadow-sm",
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
      saveBtn: "border-sky-300 bg-sky-100/90 text-sky-900 hover:bg-sky-200",
      submitBtn: "border-emerald-300 bg-emerald-100/90 text-emerald-900 hover:bg-emerald-200",
      clearBtn: "border-orange-300 bg-orange-100/90 text-orange-900 hover:bg-orange-200",
      tvIdle: "border-white/45 bg-white/70 hover:bg-white/85",
      tvActive: "border-cyan-300 bg-cyan-50/90",
      tvFrame: "bg-slate-100",
      phrase: "border-violet-200 bg-violet-50 text-slate-800",
      changeBtn: "border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200",
      campaignCard: "border-white/45 bg-white/70 hover:bg-white/85",
      campaignCardActive: "border-cyan-300 bg-cyan-50/90 shadow-sm",
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
    saveBtn: "border-violet-400/25 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25",
    submitBtn: "border-emerald-400/25 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25",
    clearBtn: "border-amber-400/25 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25",
    tvIdle: "border-white/10 bg-white/5 hover:bg-white/10",
    tvActive: "border-cyan-400/30 bg-cyan-500/10",
    tvFrame: "bg-slate-900",
    phrase: "border-fuchsia-400/20 bg-fuchsia-500/10 text-slate-100",
    changeBtn: "border-white/10 bg-white/10 text-slate-100 hover:bg-white/15",
    campaignCard: "border-white/10 bg-white/5 hover:bg-white/10",
    campaignCardActive: "border-cyan-400/30 bg-cyan-500/10 shadow-[0_8px_24px_rgba(34,211,238,0.12)]",
  };
}

function buildInitialValues(fields) {
  return fields.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});
}

const SPECIAL_FIELD_RULES = {
  nif_nie_cif: {
    maxLength: 9,
    inputType: "text",
    sanitize: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9),
    validate: (value) => {
      if (!value) return "";
      return /^\d{8}[A-Z]$/.test(value)
        ? ""
        : "NIF/NIE/CIF debe tener 8 números y 1 letra (9 caracteres).";
    },
  },
  movil_contacto: {
    maxLength: 9,
    inputType: "tel",
    sanitize: (value) => value.replace(/\D/g, "").slice(0, 9),
    validate: (value) => {
      if (!value) return "";
      return /^\d{9}$/.test(value)
        ? ""
        : "Móvil contacto debe tener exactamente 9 dígitos.";
    },
  },
  iban: {
    maxLength: 24,
    inputType: "text",
    sanitize: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24),
    validate: (value) => {
      if (!value) return "";
      return /^[A-Z0-9]{24}$/.test(value)
        ? ""
        : "IBAN debe tener exactamente 24 caracteres entre letras y números.";
    },
  },
};

function getFieldRule(field) {
  if (!field) return null;

  if (SPECIAL_FIELD_RULES[field.key]) {
    return SPECIAL_FIELD_RULES[field.key];
  }

  if (field.type && SPECIAL_FIELD_RULES[field.type]) {
    return SPECIAL_FIELD_RULES[field.type];
  }

  return null;
}

function upperText(value) {
  return String(value || "").toUpperCase().trim();
}

function buildVodafoneMockData() {
  return {};
}

function clampVodafoneQty(value) {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(10, num));
}

function getVodafoneMobileTotal(values) {
  return VODAFONE_MOBILE_OPTIONS.reduce(
    (acc, option) => acc + clampVodafoneQty(values?.[option.key]),
    0
  );
}

function getVodafoneProductSummary(values) {
  const parts = [];
  if (values?.fibra) parts.push(values.fibra);

  const mobileParts = VODAFONE_MOBILE_OPTIONS
    .map((option) => {
      const qty = clampVodafoneQty(values?.[option.key]);
      return qty > 0 ? `${option.title} x${qty}` : "";
    })
    .filter(Boolean);

  if (mobileParts.length) parts.push(mobileParts.join(" | "));

  const tvParts = Array.isArray(values?.vodafone_tv_pack)
    ? values.vodafone_tv_pack.filter(Boolean)
    : values?.television
    ? [values.television]
    : [];

  if (tvParts.length) parts.push(tvParts.join(" | "));

  return parts.join(" + ");
}

function getDraftKey(currentUser) {
  const id =
    currentUser?.id ||
    currentUser?.email ||
    currentUser?.dni ||
    currentUser?.nombre ||
    "anon";
  return `${BASE_STORAGE_KEY}_${id}`;
}

function getCurrentUserName(currentUser) {
  return currentUser?.nombre || currentUser?.name || "";
}

function getPhraseMetaKey(currentUser) {
  const id =
    currentUser?.id ||
    currentUser?.email ||
    currentUser?.dni ||
    currentUser?.nombre ||
    "anon";
  return `${PHRASE_META_PREFIX}_${id}`;
}

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
  let pool = SALES_PHRASES.filter(
    (phrase) => phrase !== lastPhrase && !recent.includes(phrase)
  );

  if (!pool.length) {
    pool = SALES_PHRASES.filter((phrase) => phrase !== lastPhrase);
  }

  if (!pool.length) {
    pool = SALES_PHRASES;
  }

  return pool[Math.floor(Math.random() * pool.length)] || SALES_PHRASES[0] || "";
}

function resolveDailyPhrase(currentUser) {
  const today = getTodayKey();
  const meta = readPhraseMeta(currentUser);

  if (meta?.date === today && meta?.phrase) {
    return meta.phrase;
  }

  const nextPhrase = choosePhrase(meta?.phrase || "", meta?.recent || []);
  const nextRecent = [nextPhrase, ...(meta?.recent || []).filter((x) => x !== nextPhrase)].slice(0, 5);

  writePhraseMeta(currentUser, {
    date: today,
    phrase: nextPhrase,
    recent: nextRecent,
  });

  return nextPhrase;
}

function rotatePhraseForToday(currentUser, currentPhrase = "") {
  const today = getTodayKey();
  const meta = readPhraseMeta(currentUser);
  const nextPhrase = choosePhrase(currentPhrase || meta?.phrase || "", meta?.recent || []);
  const nextRecent = [nextPhrase, ...(meta?.recent || []).filter((x) => x !== nextPhrase)].slice(0, 5);

  writePhraseMeta(currentUser, {
    date: today,
    phrase: nextPhrase,
    recent: nextRecent,
  });

  return nextPhrase;
}

function normalizeCustomBlocks(campaign) {
  if (!Array.isArray(campaign?.customBlocks)) return [];
  return campaign.customBlocks.filter((block) => block?.enabled !== false);
}

function normalizeSections(campaign) {
  const base = {
    control: true,
    cliente: true,
    direccion: true,
    oferta: true,
    lineas: true,
    cierre: true,
  };

  if (!campaign?.sections) return base;

  return {
    control: campaign.sections.control ?? true,
    cliente: campaign.sections.cliente ?? true,
    direccion: campaign.sections.direccion ?? true,
    oferta: campaign.sections.oferta ?? true,
    lineas: campaign.sections.lineas ?? true,
    cierre: campaign.sections.cierre ?? true,
  };
}

function normalizeCampaignFields(campaign) {
  if (!campaign) return [];

  const raw =
    campaign.customFields ||
    campaign.camposPersonalizados ||
    campaign.campos ||
    campaign.extraFields ||
    [];

  if (!Array.isArray(raw)) return [];

  return raw
    .filter(Boolean)
    .map((field, index) => ({
      key: field.key || `campaign_field_${index}`,
      label: field.label || field.nombre || `Campo ${index + 1}`,
      type: field.type || "text",
      options: field.options || field.opciones || [],
      tab: field.tab || "cliente",
    }));
}

function normalizeVentaResponse(venta) {
  return {
    id: venta?.id ?? Date.now(),
    fecha: venta?.fecha ?? "",
    hora: venta?.hora ?? "",
    cliente: venta?.cliente ?? "",
    documento: venta?.documento ?? "",
    telefono: venta?.telefono ?? "",
    campana: venta?.campana ?? "",
    comercial: venta?.comercial ?? "",
    coordinador: venta?.coordinador ?? "",
    supervisor: venta?.supervisor ?? "",
    producto: venta?.producto ?? "",
    estado: venta?.estado ?? "Pendiente",
    serviciosTv: Array.isArray(venta?.serviciosTv) ? venta.serviciosTv : [],
    ficha: venta?.ficha ?? {},
    fechaRegistro: venta?.fechaRegistro ?? "",
    fechaEdicion: venta?.fechaEdicion ?? "",
  };
}

function applyUserDefaults(baseValues, currentUser) {
  const currentName = getCurrentUserName(currentUser);

  return {
    ...baseValues,
    comercial:
      currentUser?.rol === "Comercial"
        ? currentName
        : baseValues.comercial || "",
    coordinador:
      baseValues.coordinador ||
      currentUser?.coordinador ||
      "",
    supervisor:
      baseValues.supervisor ||
      currentUser?.supervisor ||
      (currentUser?.rol === "Supervisor" ? currentName : ""),
    campana:
      baseValues.campana ||
      currentUser?.campana ||
      (Array.isArray(currentUser?.allowedCampaigns) && currentUser.allowedCampaigns.length
        ? currentUser.allowedCampaigns[0]
        : ""),
    validador:
      currentUser?.rol === "Backoffice"
        ? currentName
        : baseValues.validador || "",
  };
}

function SummaryChip({ label, value, styles }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles.soft}`}>
      <p className={`text-xs font-medium uppercase tracking-[0.12em] ${styles.muted}`}>{label}</p>
      <p className={`mt-1 text-sm font-semibold ${styles.text}`}>{value || "-"}</p>
    </div>
  );
}

function TvCard({ item, active, onToggle, styles }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.key)}
      className={`overflow-hidden rounded-2xl border text-left transition ${
        active ? styles.tvActive : styles.tvIdle
      }`}
    >
      <div className={`flex h-24 w-full items-center justify-center overflow-hidden ${styles.tvFrame}`}>
        <img
          src={item.image}
          alt={item.name}
          className="max-h-full max-w-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div className="p-3">
        <div className="mb-1 flex items-center gap-2">
          <Tv className="h-4 w-4 text-cyan-400" />
          <p className={`font-semibold ${styles.text}`}>{item.name}</p>
        </div>
        <p className={`text-sm ${styles.muted}`}>{item.desc}</p>
      </div>
    </button>
  );
}

function CampaignLogoCard({ item, active, onClick, styles, theme }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  const currentImage = item.images?.[imgIndex] || "";

  const handleError = () => {
    if (imgIndex < (item.images?.length || 0) - 1) {
      setImgIndex((prev) => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  useEffect(() => {
    setImgIndex(0);
    setAllFailed(false);
  }, [item.key]);

  return (
    <>
      <style>{`
        @keyframes logoMove {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>

      <button
        type="button"
        onClick={onClick}
        className={`group relative overflow-hidden rounded-[24px] border p-4 transition-all duration-200 ${
          active ? styles.campaignCardActive : styles.campaignCard
        }`}
        style={{
          borderColor: active ? item.border : undefined,
          boxShadow: active ? `0 0 0 1px ${item.border}` : undefined,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(circle at top right, ${item.accent} 0%, transparent 55%)`,
          }}
        />

        <div className="relative z-10 flex min-h-[220px] flex-col gap-4">
          {!allFailed && currentImage ? (
            <div className="relative h-[160px] w-full overflow-hidden rounded-2xl">
              <img
                src={currentImage}
                alt={item.label}
                className="h-full w-full object-cover"
                style={{
                  animation: "logoMove 3s ease-in-out infinite",
                  transformOrigin: "center center",
                }}
                onError={handleError}
              />
            </div>
          ) : (
            <div
              className="flex h-[160px] w-full items-center justify-center rounded-2xl border px-6 text-base font-bold tracking-[0.18em]"
              style={{
                borderColor: item.border,
                background:
                  theme === "night" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.82)",
                color: theme === "night" ? "#f8fafc" : "#0f172a",
              }}
            >
              {item.label}
            </div>
          )}

          <div className="text-center">
            <p className={`text-base font-semibold ${styles.text}`}>{item.label}</p>
            <p className={`mt-1 text-sm ${styles.muted}`}>
              {active ? "Campaña seleccionada" : "Seleccionar campaña"}
            </p>
          </div>
        </div>
      </button>
    </>
  );
}

export default function FichasVenta({
  users = [],
  campaigns = [],
  setVentas,
  setLeads,
  currentUser,
}) {
  const [theme, setTheme] = useState(getThemeValue());
  const [activeTab, setActiveTab] = useState("control");
  const [selectedTv, setSelectedTv] = useState([]);
  const [formValues, setFormValues] = useState(buildInitialValues(BASE_FIELDS));
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [motivationalPhrase, setMotivationalPhrase] = useState("");
  const [campaignSelection, setCampaignSelection] = useState("");
  const [campaignConfirmed, setCampaignConfirmed] = useState(false);
  const [vodafoneLookupDone, setVodafoneLookupDone] = useState(false);
  const [vodafoneStage, setVodafoneStage] = useState("cliente");

  const styles = useMemo(() => getThemeStyles(theme), [theme]);
  const draftKey = useMemo(() => getDraftKey(currentUser), [currentUser]);
  const currentCommercialName = useMemo(() => getCurrentUserName(currentUser), [currentUser]);
  const isVodafoneFlow = useMemo(() => upperText(formValues.campana) === "VODAFONE", [formValues.campana]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event?.detail) {
        setTheme(event.detail);
      } else {
        setTheme(getThemeValue());
      }
    };

    window.addEventListener("crm-theme-change", handleThemeChange);
    return () => window.removeEventListener("crm-theme-change", handleThemeChange);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    const dailyPhrase = resolveDailyPhrase(currentUser);
    setMotivationalPhrase(dailyPhrase);

    if (!saved) {
      const initial = applyUserDefaults(buildInitialValues(BASE_FIELDS), currentUser);
      setFormValues(initial);

      const defaultCampaign =
        initial.campana ||
        currentUser?.campana ||
        (Array.isArray(currentUser?.allowedCampaigns) && currentUser.allowedCampaigns.length
          ? currentUser.allowedCampaigns[0]
          : "");

      setCampaignSelection(defaultCampaign || "");
      setCampaignConfirmed(Boolean(defaultCampaign));
      setSelectedTv([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      const merged = applyUserDefaults(
        parsed.formValues || buildInitialValues(BASE_FIELDS),
        currentUser
      );

      setFormValues(merged);
      setSelectedTv(parsed.selectedTv || []);
      setCampaignSelection(parsed.campaignSelection || merged.campana || "");
      setCampaignConfirmed(Boolean(parsed.campaignConfirmed || merged.campana));
    } catch {
      const initial = applyUserDefaults(buildInitialValues(BASE_FIELDS), currentUser);
      setFormValues(initial);

      const defaultCampaign =
        initial.campana ||
        currentUser?.campana ||
        (Array.isArray(currentUser?.allowedCampaigns) && currentUser.allowedCampaigns.length
          ? currentUser.allowedCampaigns[0]
          : "");

      setCampaignSelection(defaultCampaign || "");
      setCampaignConfirmed(Boolean(defaultCampaign));
      setSelectedTv([]);
    }
  }, [currentUser, draftKey]);

  const selectedCampaign = useMemo(() => {
    return campaigns.find((c) => c.nombre === formValues.campana) || null;
  }, [campaigns, formValues.campana]);

  const campaignSections = useMemo(() => normalizeSections(selectedCampaign), [selectedCampaign]);
  const campaignCustomBlocks = useMemo(
    () => normalizeCustomBlocks(selectedCampaign),
    [selectedCampaign]
  );
  const campaignFields = useMemo(() => normalizeCampaignFields(selectedCampaign), [selectedCampaign]);

  const vodafoneTvOptions = useMemo(
    () => resolveVodafoneTvOptions(selectedCampaign),
    [selectedCampaign]
  );

  useEffect(() => {
    if (!campaignFields.length) return;

    setFormValues((prev) => {
      const next = { ...prev };
      campaignFields.forEach((field) => {
        if (typeof next[field.key] === "undefined") {
          next[field.key] = "";
        }
      });
      return applyUserDefaults(next, currentUser);
    });
  }, [campaignFields, currentUser]);

  useEffect(() => {
    if (!isVodafoneFlow) {
      setVodafoneLookupDone(false);
      setVodafoneStage("cliente");
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      tipo_documento_vodafone: prev.tipo_documento_vodafone || VODAFONE_DOCUMENT_OPTIONS[0],
      segmento_vodafone: prev.segmento_vodafone || "PARTICULAR",
      producto: prev.producto || "ONE",
    }));

    if (formValues.cliente_razon_social || formValues.nombre) {
      setVodafoneLookupDone(true);
    }
  }, [isVodafoneFlow]);

  useEffect(() => {
    const safeValues =
      currentUser?.rol === "Comercial"
        ? { ...formValues, comercial: currentCommercialName }
        : formValues;

    localStorage.setItem(
      draftKey,
      JSON.stringify({
        formValues: safeValues,
        selectedTv,
        campaignSelection,
        campaignConfirmed,
      })
    );
  }, [
    formValues,
    selectedTv,
    draftKey,
    currentUser,
    currentCommercialName,
    campaignSelection,
    campaignConfirmed,
  ]);

  const allFields = [...BASE_FIELDS, ...campaignFields];

  const fieldMap = useMemo(() => {
    return allFields.reduce((acc, field) => {
      acc[field.key] = field;
      return acc;
    }, {});
  }, [allFields]);

  const tabConfig = useMemo(() => {
    const baseTabs = BASE_TAB_CONFIG.filter((tab) => campaignSections[tab.key] !== false);
    const extraTabs = campaignCustomBlocks.map((block) => ({
      key: block.key,
      label: block.label,
    }));
    return [...baseTabs, ...extraTabs];
  }, [campaignSections, campaignCustomBlocks]);

  const fieldsByTab = useMemo(() => {
    return tabConfig.reduce((acc, tab) => {
      let fields = allFields.filter((field) => field.tab === tab.key);

      if (tab.key === "cierre" && !PRIVILEGED_CLOSE_ROLES.includes(currentUser?.rol)) {
        fields = fields.filter((field) => {
          const isBaseCloseField = BASE_FIELDS.some(
            (base) => base.key === field.key && base.tab === "cierre"
          );

          if (!isBaseCloseField) return true;
          return LIMITED_CLOSE_KEYS.includes(field.key);
        });
      }

      fields = fields.filter((field) => field.key !== "campana");

      acc[tab.key] = fields;
      return acc;
    }, {});
  }, [allFields, tabConfig, currentUser]);

  useEffect(() => {
    if (!tabConfig.find((t) => t.key === activeTab)) {
      setActiveTab(tabConfig[0]?.key || "control");
    }
  }, [tabConfig, activeTab]);

  const comerciales = users.filter((u) => u.rol === "Comercial" && u.estado === "Activo");
  const coordinadores = users.filter(
    (u) => ["Supervisor", "Admin", "Gerente"].includes(u.rol) && u.estado === "Activo"
  );
  const supervisores = users.filter(
    (u) => ["Supervisor", "Gerente"].includes(u.rol) && u.estado === "Activo"
  );
  const backoffices = users.filter((u) => u.rol === "Backoffice" && u.estado === "Activo");

  const brandedCampaigns = useMemo(() => {
    const brandMap = new Map(CAMPAIGN_BRANDS.map((item) => [item.key, item]));

    let baseCampaigns = campaigns;

    if (currentUser && !["Gerente", "Admin", "Backoffice"].includes(currentUser.rol)) {
      const allowed = new Set();

      if (currentUser.campana) allowed.add(String(currentUser.campana).toUpperCase());
      if (Array.isArray(currentUser?.allowedCampaigns)) {
        currentUser.allowedCampaigns.forEach((c) => allowed.add(String(c).toUpperCase()));
      }

      if (allowed.size > 0) {
        baseCampaigns = campaigns.filter((c) =>
          allowed.has(String(c.nombre || "").toUpperCase())
        );
      }
    }

    const merged = baseCampaigns
      .map((campaign) => {
        const brand = brandMap.get(String(campaign.nombre || "").toUpperCase());
        if (!brand) return null;

        return {
          ...brand,
          nombre: campaign.nombre,
          campaign,
        };
      })
      .filter(Boolean);

    return merged;
  }, [campaigns, currentUser]);

  const handleFieldChange = (key, value) => {
    if (key === "comercial" && currentUser?.rol === "Comercial") {
      setFormValues((prev) => ({ ...prev, comercial: currentCommercialName }));
      return;
    }

    const field = fieldMap[key];
    const rule = getFieldRule(field);
    const nextValue = rule ? rule.sanitize(String(value || "")) : value;
    const error = rule ? rule.validate(nextValue) : "";

    setFormValues((prev) => ({ ...prev, [key]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [key]: error }));
  };

  const handleFileChange = (key, file) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: file ? file.name : "",
    }));
  };

  const toggleTv = (key) => {
    setSelectedTv((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const rotatePhrase = () => {
    setMotivationalPhrase((prev) => rotatePhraseForToday(currentUser, prev));
  };

  const confirmCampaignSelection = () => {
    if (!campaignSelection) {
      alert("Selecciona una campaña para abrir la ficha.");
      return;
    }

    setFormValues((prev) =>
      applyUserDefaults(
        {
          ...prev,
          campana: campaignSelection,
          tipo_documento_vodafone:
            upperText(campaignSelection) === "VODAFONE"
              ? prev.tipo_documento_vodafone || VODAFONE_DOCUMENT_OPTIONS[0]
              : prev.tipo_documento_vodafone,
        },
        currentUser
      )
    );
    setCampaignConfirmed(true);
    setVodafoneLookupDone(false);
    setVodafoneStage(upperText(campaignSelection) === "VODAFONE" ? "cliente" : "control");
    setActiveTab("control");
  };

  const changeCampaign = () => {
    setCampaignConfirmed(false);
    setVodafoneLookupDone(false);
    setVodafoneStage("cliente");
  };

  const handleVodafoneSearch = () => {
    const docType = formValues.tipo_documento_vodafone || VODAFONE_DOCUMENT_OPTIONS[0];
    const documentNumber = upperText(formValues.nif_nie_cif || formValues.vodafone_numero_documento);

    if (!documentNumber) {
      alert("Ingresa el número de documento.");
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      tipo_documento_vodafone: docType,
      vodafone_numero_documento: documentNumber,
      nif_nie_cif: documentNumber,
    }));

    setVodafoneLookupDone(true);
    setVodafoneStage("cliente");
  };

  const openVodafoneOffer = (stage) => {
    setFormValues((prev) => ({ ...prev, vodafone_categoria: stage }));
    setVodafoneStage(stage);
  };

  const updateVodafoneQty = (key, delta) => {
    setFormValues((prev) => {
      const nextQty = clampVodafoneQty((prev[key] || 0) + delta);
      const next = {
        ...prev,
        [key]: nextQty,
      };
      next.cantidad_moviles = getVodafoneMobileTotal(next);
      next.producto = getVodafoneProductSummary(next) || "ONE";
      return next;
    });
  };

  const selectVodafoneFiber = (fiberKey) => {
    setFormValues((prev) => {
      const next = {
        ...prev,
        fibra: fiberKey,
        producto: getVodafoneProductSummary({ ...prev, fibra: fiberKey }) || "ONE",
      };
      return next;
    });
  };

  const selectVodafoneTv = (tvKey) => {
    setSelectedTv((prev) => {
      const nextTv = prev.includes(tvKey)
        ? prev.filter((item) => item !== tvKey)
        : [...prev, tvKey];

      setFormValues((current) => ({
        ...current,
        vodafone_tv_pack: nextTv,
        television: nextTv.join(" | "),
        producto: getVodafoneProductSummary({
          ...current,
          vodafone_tv_pack: nextTv,
          television: nextTv.join(" | "),
        }) || "ONE",
      }));

      return nextTv;
    });
  };

  const continueVodafoneClient = () => {
    if (!formValues.nif_nie_cif) {
      alert("Ingresa el documento del cliente.");
      return;
    }
    if (!formValues.cliente_razon_social && !(formValues.nombre || formValues.apellidos)) {
      alert("Completa el nombre o razón social del cliente.");
      return;
    }
    if (!formValues.direccion) {
      alert("Completa la dirección antes de continuar.");
      return;
    }
    setVodafoneStage("categorias");
  };

  const continueVodafoneCategorias = () => {
    const hasFibra = !!formValues.fibra;
    const hasMoviles = getVodafoneMobileTotal(formValues) > 0;
    const hasTv = selectedTv.length > 0 || !!formValues.television;
    if (!hasFibra && !hasMoviles && !hasTv) {
      alert("Selecciona al menos una opción comercial antes de continuar.");
      return;
    }
    setVodafoneStage("facturacion");
  };

  const continueVodafoneFacturacion = () => {
    if (!formValues.tipo_factura_vodafone) {
      alert("Selecciona el tipo de facturación.");
      return;
    }
    setVodafoneStage("complementarios");
  };

  const continueVodafoneComplementarios = () => {
    setVodafoneStage("bancarios");
  };

  const saveDraft = () => {
    const safeValues =
      currentUser?.rol === "Comercial"
        ? { ...formValues, comercial: currentCommercialName }
        : formValues;

    localStorage.setItem(
      draftKey,
      JSON.stringify({
        formValues: safeValues,
        selectedTv,
        campaignSelection,
        campaignConfirmed,
      })
    );
    alert("Borrador guardado.");
  };

  const clearForm = () => {
    const initial = applyUserDefaults(buildInitialValues(BASE_FIELDS), currentUser);

    setFormValues(initial);
    setFieldErrors({});
    setSelectedTv([]);
    setActiveTab("control");
    setCampaignConfirmed(false);
    setCampaignSelection("");
    setVodafoneLookupDone(false);
    setVodafoneStage("cliente");
    localStorage.removeItem(draftKey);
  };

  const submitDemo = async () => {
    const comercialFinal =
      currentUser?.rol === "Comercial"
        ? currentCommercialName
        : formValues.comercial;

    if (!campaignConfirmed || !formValues.campana) {
      alert("Primero selecciona una campaña.");
      return;
    }

    if (!formValues.cliente_razon_social || !formValues.campana || !comercialFinal) {
      alert("Completa al menos cliente, campaña y comercial.");
      return;
    }

    const validationErrors = {};

    allFields.forEach((field) => {
      const rule = getFieldRule(field);
      if (!rule) return;

      const currentValue = String(formValues[field.key] || "");
      const error = rule.validate(currentValue);
      if (error) {
        validationErrors[field.key] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...validationErrors }));
      alert(Object.values(validationErrors)[0]);
      return;
    }

    try {
      setSaving(true);

      const now = new Date();
      const nowDate = now.toISOString().slice(0, 10);
      const nowTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const fichaCompleta = {
        ...formValues,
        comercial: comercialFinal,
        servicios_tv: selectedTv,
      };

      const telefonoLead =
        formValues.movil_contacto ||
        formValues.linea_principal_numero ||
        "";

      const nombreLead = formValues.cliente_razon_social || "";
      const provinciaLead = formValues.provincia || "";
      const campanaLead = formValues.campana || "";

      const payload = {
        fecha: nowDate,
        hora: nowTime,
        cliente: formValues.cliente_razon_social || "",
        documento: formValues.nif_nie_cif || "",
        telefono: telefonoLead,
        campana: campanaLead,
        comercial: comercialFinal,
        coordinador:
          formValues.coordinador ||
          formValues.coordinador_operacion ||
          currentUser?.coordinador ||
          "",
        supervisor:
          formValues.supervisor ||
          currentUser?.supervisor ||
          (currentUser?.rol === "Supervisor" ? currentCommercialName : ""),
        producto: formValues.producto || getVodafoneProductSummary(formValues) || "",
        estado: "Pendiente",
        serviciosTv: selectedTv,
        ficha: fichaCompleta,
      };

      const data = await apiFetch("/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const nuevaVenta = normalizeVentaResponse(data?.venta || payload);

      if (setVentas) {
        setVentas((prev) => [nuevaVenta, ...prev]);
      }

      if (setLeads) {
        setLeads((prev) => {
          const index = prev.findIndex((lead) => {
            const samePhone =
              telefonoLead &&
              String(lead.telefono || "").trim() === String(telefonoLead).trim();

            const sameName =
              nombreLead &&
              String(lead.nombre || "").trim().toLowerCase() ===
                String(nombreLead).trim().toLowerCase();

            return samePhone || sameName;
          });

          const leadActualizado = {
            id: Date.now() + 1,
            nombre: nombreLead,
            telefono: telefonoLead,
            campana: campanaLead,
            estado: "Cerrado",
            provincia: provinciaLead,
          };

          if (index >= 0) {
            return prev.map((lead, i) =>
              i === index
                ? {
                    ...lead,
                    nombre: nombreLead || lead.nombre,
                    telefono: telefonoLead || lead.telefono,
                    campana: campanaLead || lead.campana,
                    provincia: provinciaLead || lead.provincia,
                    estado: "Cerrado",
                  }
                : lead
            );
          }

          return [leadActualizado, ...prev];
        });
      }

      alert("Contrato registrado correctamente.");
      localStorage.removeItem(draftKey);

      const initial = applyUserDefaults(buildInitialValues(BASE_FIELDS), currentUser);
      setFormValues(initial);
      setFieldErrors({});
      setSelectedTv([]);
      setCampaignConfirmed(false);
      setCampaignSelection("");
      setVodafoneLookupDone(false);
      setVodafoneStage("cliente");
      setMotivationalPhrase(resolveDailyPhrase(currentUser));
    } catch (error) {
      alert(error.message || "No se pudo registrar la venta.");
    } finally {
      setSaving(false);
    }
  };

  const renderOptions = (field) => {
    if (field.type === "user_comercial") {
      if (currentUser?.rol === "Comercial") {
        return <option value={currentCommercialName}>{currentCommercialName}</option>;
      }

      return (
        <>
          <option value="">Selecciona comercial</option>
          {comerciales.map((u) => (
            <option key={u.id} value={u.nombre || u.name}>
              {u.nombre || u.name}
            </option>
          ))}
        </>
      );
    }

    if (field.type === "user_coord") {
      return (
        <>
          <option value="">Selecciona coordinador</option>
          {coordinadores.map((u) => (
            <option key={u.id} value={u.nombre || u.name}>
              {u.nombre || u.name} - {u.rol}
            </option>
          ))}
        </>
      );
    }

    if (field.type === "user_supervisor") {
      return (
        <>
          <option value="">Selecciona supervisor</option>
          {supervisores.map((u) => (
            <option key={u.id} value={u.nombre || u.name}>
              {u.nombre || u.name}
            </option>
          ))}
        </>
      );
    }

    if (field.type === "user_backoffice") {
      return (
        <>
          <option value="">Selecciona validador</option>
          {backoffices.map((u) => (
            <option key={u.id} value={u.nombre || u.name}>
              {u.nombre || u.name}
            </option>
          ))}
        </>
      );
    }

    return (
      <>
        <option value="">Selecciona</option>
        {(field.options || []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </>
    );
  };

  const renderField = (field) => {
    if (field.type === "file") {
      return (
        <div className="space-y-2">
          <input
            type="file"
            onChange={(e) => handleFileChange(field.key, e.target.files?.[0] || null)}
            className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`}
          />
          {formValues[field.key] ? (
            <p className={`text-xs ${styles.muted}`}>Archivo: {formValues[field.key]}</p>
          ) : null}
        </div>
      );
    }

    if (
      ["select", "user_comercial", "user_coord", "user_supervisor", "user_backoffice"].includes(
        field.type
      )
    ) {
      const isLockedCommercial =
        field.type === "user_comercial" && currentUser?.rol === "Comercial";

      return (
        <select
          value={isLockedCommercial ? currentCommercialName : formValues[field.key] || ""}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          disabled={isLockedCommercial}
          className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input} ${
            isLockedCommercial ? "cursor-not-allowed opacity-80" : ""
          }`}
        >
          {renderOptions(field)}
        </select>
      );
    }

    if (field.type === "textarea") {
      return (
        <div className="space-y-2">
          <textarea
            value={formValues[field.key] || ""}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`min-h-[110px] w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input} ${
              fieldErrors[field.key] ? "border-rose-400" : ""
            }`}
            placeholder={field.label}
          />
          {fieldErrors[field.key] ? (
            <p className="text-xs text-rose-400">{fieldErrors[field.key]}</p>
          ) : null}
        </div>
      );
    }

    const rule = getFieldRule(field);

    return (
      <div className="space-y-2">
        <input
          type={rule?.inputType || field.type}
          value={formValues[field.key] || ""}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          maxLength={rule?.maxLength}
          className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input} ${
            fieldErrors[field.key] ? "border-rose-400" : ""
          }`}
          placeholder={field.label}
        />
        {fieldErrors[field.key] ? (
          <p className="text-xs text-rose-400">{fieldErrors[field.key]}</p>
        ) : null}
      </div>
    );
  };


  const renderVodafoneConfigurator = () => {
    const selectedCategory = formValues.vodafone_categoria || "";
    const totalMoviles = getVodafoneMobileTotal(formValues);
    const categoryReady =
      !!formValues.fibra || totalMoviles > 0 || selectedTv.length > 0 || !!formValues.television;

    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryChip
            label="Cliente"
            value={formValues.cliente_razon_social || `${formValues.nombre || ""} ${formValues.apellidos || ""}`.trim()}
            styles={styles}
          />
          <SummaryChip
            label="Documento"
            value={formValues.nif_nie_cif || formValues.vodafone_numero_documento}
            styles={styles}
          />
          <SummaryChip label="Campaña" value={formValues.campana} styles={styles} />
          <SummaryChip
            label="Producto"
            value={getVodafoneProductSummary(formValues) || "ONE"}
            styles={styles}
          />
        </div>

        <div className={`rounded-[28px] border p-6 ${styles.panel}`}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className={`text-xs font-medium uppercase tracking-[0.12em] ${styles.muted}`}>Ficha Vodafone</p>
              <h3 className={`mt-1 text-xl font-bold ${styles.title}`}>Configurador de ofertas | ONE</h3>
              <p className={`mt-2 text-sm ${styles.muted}`}>
                Flujo guiado por pasos para cliente, dirección, oferta, facturación y datos bancarios.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button
                onClick={saveDraft}
                className={`inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${styles.saveBtn}`}
              >
                <Save className="h-4 w-4" />
                Guardar borrador
              </button>

              <button
                onClick={submitDemo}
                disabled={saving}
                className={`inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${styles.submitBtn} ${
                  saving ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                <FilePlus2 className="h-4 w-4" />
                {saving ? "Registrando..." : "Registrar contrato"}
              </button>

              <button
                onClick={clearForm}
                className={`inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${styles.clearBtn}`}
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar ficha
              </button>
            </div>
          </div>
        </div>

        <div className={`rounded-[28px] border p-6 ${styles.panel}`}>
          <div className="mb-5 flex flex-wrap gap-2">
            {[
              ["cliente", "Cliente y dirección"],
              ["categorias", "Oferta"],
              ["facturacion", "Facturación"],
              ["complementarios", "Datos complementarios"],
              ["bancarios", "Datos bancarios"],
            ].map(([key, label], index) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === "categorias" && !vodafoneLookupDone) return;
                  setVodafoneStage(key);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  vodafoneStage === key ? styles.tabActive : styles.tabIdle
                }`}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>

          <div className="grid gap-6">
            {["cliente", "categorias", "facturacion", "complementarios", "bancarios"].includes(vodafoneStage) ? (
              <>
                <div className={`rounded-[24px] border p-6 ${styles.soft}`}>
                  <div className="mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-rose-500" />
                    <h4 className={`text-xl font-bold ${styles.title}`}>Editar datos de cliente</h4>
                  </div>

                  <div className="mb-5 grid gap-3 md:grid-cols-[190px_1fr_140px]">
                    <div>
                      <label className={`mb-2 block text-xs font-semibold uppercase tracking-[0.18em] ${styles.muted}`}>Tipo documento</label>
                      <select
                        value={formValues.tipo_documento_vodafone || VODAFONE_DOCUMENT_OPTIONS[0]}
                        onChange={(e) => handleFieldChange("tipo_documento_vodafone", e.target.value)}
                        className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`}
                      >
                        {VODAFONE_DOCUMENT_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`mb-2 block text-xs font-semibold uppercase tracking-[0.18em] ${styles.muted}`}>Nº documento</label>
                      <input
                        value={formValues.nif_nie_cif || ""}
                        onChange={(e) => handleFieldChange("nif_nie_cif", e.target.value)}
                        placeholder="Nº DOCUMENTO"
                        maxLength={9}
                        className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input} ${fieldErrors.nif_nie_cif ? "border-rose-400" : ""}`}
                      />
                      {fieldErrors.nif_nie_cif ? <p className="mt-2 text-xs text-rose-400">{fieldErrors.nif_nie_cif}</p> : null}
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleVodafoneSearch}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-700 bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700"
                      >
                        <Search className="h-4 w-4" />
                        Guardar
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Tipo de documento</label>
                      <select value={formValues.tipo_documento_vodafone || VODAFONE_DOCUMENT_OPTIONS[0]} onChange={(e) => handleFieldChange("tipo_documento_vodafone", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`}>
                        {VODAFONE_DOCUMENT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>NIF</label>
                      {renderField(fieldMap.nif_nie_cif)}
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Nombre</label>
                      <input value={formValues.nombre || ""} onChange={(e) => handleFieldChange("nombre", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Apellidos</label>
                      <input value={formValues.apellidos || ""} onChange={(e) => handleFieldChange("apellidos", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Email</label>
                      <input value={formValues.correo || ""} onChange={(e) => handleFieldChange("correo", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Tlf móvil comunicaciones</label>
                      {renderField(fieldMap.movil_contacto)}
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Tlf fijo contacto</label>
                      <input value={formValues.telefono_fijo_contacto || ""} onChange={(e) => handleFieldChange("telefono_fijo_contacto", e.target.value)} maxLength={9} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Tlf. contacto adicional</label>
                      <input value={formValues.telefono_contacto_adicional || ""} onChange={(e) => handleFieldChange("telefono_contacto_adicional", e.target.value)} maxLength={9} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Fecha de nacimiento</label>
                      <input type="date" value={formValues.fecha_nacimiento_creacion || ""} onChange={(e) => handleFieldChange("fecha_nacimiento_creacion", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Segmento Vodafone</label>
                      <select value={formValues.segmento_vodafone || "PARTICULAR"} onChange={(e) => handleFieldChange("segmento_vodafone", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`}>
                        {["PARTICULAR", "AUTÓNOMO", "EMPRESA"].map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>
                    <div className="xl:col-span-2">
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Cliente / Razón Social</label>
                      <input value={formValues.cliente_razon_social || ""} onChange={(e) => handleFieldChange("cliente_razon_social", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                  </div>
                </div>

                <div className={`rounded-[24px] border p-6 ${styles.soft}`}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-cyan-500" />
                      <h4 className={`text-xl font-bold ${styles.title}`}>Seleccione la dirección</h4>
                    </div>
                    <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-300">
                      <Plus className="h-4 w-4" />
                      Añadir dirección
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1.4fr_120px_120px_120px_180px_160px]">
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Dirección</label>
                      <input value={formValues.direccion || ""} onChange={(e) => handleFieldChange("direccion", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Número</label>
                      <input value={formValues.numero_direccion || ""} onChange={(e) => handleFieldChange("numero_direccion", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Piso</label>
                      <input value={formValues.piso || ""} onChange={(e) => handleFieldChange("piso", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Puerta</label>
                      <input value={formValues.puerta || ""} onChange={(e) => handleFieldChange("puerta", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Localidad</label>
                      <input value={formValues.localidad || ""} onChange={(e) => handleFieldChange("localidad", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Código postal</label>
                      <input value={formValues.codigo_postal || ""} onChange={(e) => handleFieldChange("codigo_postal", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                  </div>

                  {vodafoneStage === "cliente" ? (
                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={continueVodafoneClient}
                        className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-2xl border border-rose-700 bg-rose-600 px-5 py-3 font-bold text-white transition hover:bg-rose-700"
                      >
                        Continuar
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}

            {["categorias", "fibra", "linea", "tv"].includes(vodafoneStage) ? (
              <div className={`rounded-[24px] border p-6 ${styles.soft}`}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${styles.muted}`}>Configurador de ofertas | ONE</p>
                    <h4 className={`mt-1 text-xl font-bold ${styles.title}`}>Selecciona la categoría comercial</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCategory && ["fibra", "linea", "tv"].includes(vodafoneStage) ? (
                      <button type="button" onClick={() => setVodafoneStage("categorias")} className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 ${styles.changeBtn}`}>
                        <ChevronLeft className="h-4 w-4" />
                        Volver categorías
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={continueVodafoneCategorias}
                      className={`inline-flex min-w-[220px] items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-bold ${
                        categoryReady
                          ? "border-rose-700 bg-rose-600 text-white hover:bg-rose-700"
                          : "border-slate-300 bg-slate-200 text-slate-500"
                      }`}
                    >
                      Continuar
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {VODAFONE_CATEGORY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = selectedCategory === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => openVodafoneOffer(option.key)}
                        className={`rounded-[28px] border p-5 text-left transition ${active ? styles.tabActive : styles.tvIdle}`}
                      >
                        <div className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${option.accent} p-5`}>
                          <Icon className="h-14 w-14 text-rose-500" />
                        </div>
                        <p className={`mt-4 text-xl font-bold ${styles.title}`}>{option.title}</p>
                        <p className={`mt-2 text-sm ${styles.muted}`}>{option.subtitle}</p>
                        <div className={`mt-4 inline-flex rounded-2xl border px-4 py-2 text-sm font-semibold ${active ? styles.submitBtn : styles.changeBtn}`}>
                          Seleccionar
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedCategory === "fibra" ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {VODAFONE_FIBRA_OPTIONS.map((option) => {
                      const active = formValues.fibra === option.key;
                      return (
                        <button key={option.key} type="button" onClick={() => selectVodafoneFiber(option.key)} className={`rounded-[26px] border p-5 text-left transition ${active ? styles.tabActive : styles.tvIdle}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                              <div className="rounded-[20px] border border-white/10 bg-white/10 p-4"><Wifi className="h-10 w-10 text-rose-500" /></div>
                              <div>
                                <p className={`text-2xl font-bold ${styles.title}`}>{option.title}</p>
                                <p className={`mt-1 text-sm ${styles.muted}`}>{option.subtitle}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {selectedCategory === "linea" ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                    {VODAFONE_MOBILE_OPTIONS.map((option) => {
                      const qty = clampVodafoneQty(formValues[option.key]);
                      return (
                        <div key={option.key} className={`rounded-[26px] border p-5 ${styles.tvIdle}`}>
                          <div className="flex items-center gap-4">
                            <div className="rounded-[20px] border border-white/10 bg-white/10 p-4"><Smartphone className="h-10 w-10 text-rose-500" /></div>
                            <div className="flex-1">
                              <p className={`text-2xl font-bold ${styles.title}`}>{option.title}</p>
                              <p className={`mt-1 text-sm ${styles.muted}`}>Cantidad máxima 10</p>
                            </div>
                          </div>
                          <div className="mt-5 flex items-center gap-4">
                            <button type="button" onClick={() => updateVodafoneQty(option.key, -1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 transition hover:bg-slate-200"><Minus className="h-5 w-5" /></button>
                            <div className={`inline-flex h-14 min-w-[74px] items-center justify-center rounded-2xl border px-4 text-2xl font-bold ${styles.input}`}>{qty}</div>
                            <button type="button" onClick={() => updateVodafoneQty(option.key, 1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/15 text-cyan-100 transition hover:bg-cyan-500/25"><Plus className="h-5 w-5" /></button>
                          </div>
                        </div>
                      );
                    })}
                    <div className={`rounded-[24px] border p-4 md:col-span-2 ${styles.panel}`}>
                      <p className={`text-sm font-semibold ${styles.text}`}>Total líneas seleccionadas: {totalMoviles}</p>
                    </div>
                  </div>
                ) : null}

                {selectedCategory === "tv" ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {vodafoneTvOptions.map((option) => {
                      const active = selectedTv.includes(option.key);
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => selectVodafoneTv(option.key)}
                          className={`rounded-[26px] border p-5 text-left transition ${active ? styles.tabActive : styles.tvIdle}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[18px] border border-white/10 bg-white/10">
                              {option.image ? (
                                <img src={option.image} alt={option.title} className="h-[56px] w-[56px] object-contain" />
                              ) : (
                                <MonitorPlay className="h-11 w-11 text-rose-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-[1.35rem] font-bold ${styles.title}`}>{option.title}</p>
                              {option.price ? (
                                <p className="mt-3 text-[1.2rem] font-black text-slate-900 dark:text-white">{option.price}</p>
                              ) : null}
                            </div>
                          </div>
                          <div className={`mt-4 inline-flex rounded-2xl border px-4 py-2 text-sm font-semibold ${active ? styles.submitBtn : styles.changeBtn}`}>
                            {active ? "Seleccionado" : "Seleccionar TV"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

              </div>
            ) : null}

            {vodafoneStage === "facturacion" ? (
              <div className={`rounded-[24px] border p-6 ${styles.soft}`}>
                <div className="mb-5">
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${styles.muted}`}>Paso 3</p>
                  <h4 className={`mt-1 text-xl font-bold ${styles.title}`}>Promoción y tipo de facturación</h4>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                  <div>
                    <p className={`mb-2 text-lg font-semibold ${styles.title}`}>¡Promoción disponible!</p>
                    <input
                      value={formValues.vodafone_promocion || "T&P + RESTO PROMOS COMP (-14,01 €)"}
                      onChange={(e) => handleFieldChange("vodafone_promocion", e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`}
                    />
                  </div>
                  <div className="flex items-end">
                    <button type="button" className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-800">
                      Aplicar descuento
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <button type="button" className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-800 px-4 py-4 text-lg font-semibold text-white hover:bg-slate-900">
                    Guardar datos complementarios
                  </button>
                </div>

                <div className="mt-6">
                  <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${styles.muted}`}>Tipo de facturación</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {[
                      {
                        key: "ELECTRÓNICA",
                        title: "Factura electrónica",
                        text: "Para seguir con la contratación, verifica con el cliente que está de acuerdo con que Vodafone le envíe la factura por vía electrónica.",
                      },
                      {
                        key: "PAPEL",
                        title: "Factura en papel",
                        text: "Selecciona esta opción solo si el cliente prefiere recibir la factura en formato papel.",
                      },
                    ].map((item) => {
                      const active = formValues.tipo_factura_vodafone === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleFieldChange("tipo_factura_vodafone", item.key)}
                          className={`rounded-[24px] border p-5 text-left transition ${active ? "border-emerald-500 bg-emerald-50 text-slate-900" : styles.tvIdle}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 h-5 w-5 rounded-full border ${active ? "border-emerald-600 bg-emerald-500" : "border-slate-400"}`} />
                            <div>
                              <p className={`text-lg font-bold ${active ? "text-slate-900" : styles.title}`}>{item.title}</p>
                              <p className={`mt-3 text-sm leading-7 ${active ? "text-slate-700" : styles.muted}`}>{item.text}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setVodafoneStage("categorias")} className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 ${styles.changeBtn}`}>
                    <ChevronLeft className="h-4 w-4" />
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={continueVodafoneFacturacion}
                    className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-2xl border border-rose-700 bg-rose-600 px-5 py-3 font-bold text-white transition hover:bg-rose-700"
                  >
                    Continuar
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {vodafoneStage === "complementarios" ? (
              <div className={`rounded-[24px] border p-6 ${styles.soft}`}>
                <div className="mb-5 rounded-[20px] bg-red-600 px-6 py-4 text-center">
                  <p className="text-3xl font-bold text-white">Datos complementarios</p>
                </div>

                <div className={`rounded-[24px] border p-5 ${styles.panel}`}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Comentario</label>
                      <textarea value={formValues.comentario || ""} onChange={(e) => handleFieldChange("comentario", e.target.value)} className={`min-h-[110px] w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Comentario final</label>
                      <textarea value={formValues.comentario_final || ""} onChange={(e) => handleFieldChange("comentario_final", e.target.value)} className={`min-h-[110px] w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Venta recuperada</label>
                      <select value={formValues.venta_recuperada || ""} onChange={(e) => handleFieldChange("venta_recuperada", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`}>
                        <option value="">Selecciona</option>
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                      </select>
                    </div>
                    <div>
                      <label className={`mb-2 block text-sm font-medium ${styles.text}`}>Sondeo auto/presencial</label>
                      <select value={formValues.sondeo_auto_presencial || ""} onChange={(e) => handleFieldChange("sondeo_auto_presencial", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`}>
                        <option value="">Selecciona</option>
                        <option value="AUTO">Auto</option>
                        <option value="PRESENCIAL">Presencial</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setVodafoneStage("facturacion")} className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 ${styles.changeBtn}`}>
                    <ChevronLeft className="h-4 w-4" />
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={continueVodafoneComplementarios}
                    className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-2xl border border-rose-700 bg-rose-600 px-5 py-3 font-bold text-white transition hover:bg-rose-700"
                  >
                    Continuar
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {vodafoneStage === "bancarios" ? (
              <div className={`rounded-[24px] border p-6 ${styles.soft}`}>
                <div className={`rounded-[24px] border p-5 ${styles.panel}`}>
                  <h4 className={`text-2xl font-bold ${styles.title}`}>Datos bancarios</h4>

                  <label className="mt-4 flex items-center gap-3 text-sm font-medium" style={{ color: "inherit" }}>
                    <input
                      type="checkbox"
                      checked={!!formValues.vodafone_mismo_titular}
                      onChange={(e) => handleFieldChange("vodafone_mismo_titular", e.target.checked ? "SI" : "")}
                    />
                    Mismo titular
                  </label>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <input value={formValues.titular_nombre || ""} onChange={(e) => handleFieldChange("titular_nombre", e.target.value)} placeholder="Nombre" className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    <input value={formValues.titular_apellido_1 || ""} onChange={(e) => handleFieldChange("titular_apellido_1", e.target.value)} placeholder="Primer apellido" className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                    <input value={formValues.titular_apellido_2 || ""} onChange={(e) => handleFieldChange("titular_apellido_2", e.target.value)} placeholder="Segundo apellido" className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[280px_1fr]">
                    <select value={formValues.tipo_documento_bancario || VODAFONE_DOCUMENT_OPTIONS[0]} onChange={(e) => handleFieldChange("tipo_documento_bancario", e.target.value)} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`}>
                      {VODAFONE_DOCUMENT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <input value={formValues.documento_bancario || ""} onChange={(e) => handleFieldChange("documento_bancario", e.target.value)} placeholder="Nº DOCUMENTO" className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`} />
                  </div>

                  <div className="mt-4">
                    <input value={formValues.iban || ""} onChange={(e) => handleFieldChange("iban", e.target.value)} placeholder="IBAN de la cuenta" maxLength={24} className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input} ${fieldErrors.iban ? "border-rose-400" : ""}`} />
                    {fieldErrors.iban ? <p className="mt-2 text-xs text-rose-400">{fieldErrors.iban}</p> : null}
                  </div>

                  <p className={`mt-5 text-lg font-semibold ${styles.title}`}>Tipo de factura: {formValues.tipo_factura_vodafone === "PAPEL" ? "En papel" : "Electrónica"}</p>

                  <div className="mt-5 flex justify-end">
                    <button type="button" className="inline-flex min-w-[260px] items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-5 py-4 text-lg font-semibold text-white hover:bg-black">
                      Guardar datos bancarios
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setVodafoneStage("complementarios")} className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 ${styles.changeBtn}`}>
                    <ChevronLeft className="h-4 w-4" />
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={submitDemo}
                    disabled={saving}
                    className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-2xl border border-emerald-700 bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FilePlus2 className="h-4 w-4" />
                    {saving ? "Registrando..." : "Finalizar y registrar"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  };

  const tabCount = (tabKey) => fieldsByTab[tabKey]?.length || 0;
  const comercialResumen =
    currentUser?.rol === "Comercial" ? currentCommercialName : formValues.comercial;

  return (
    <div className="space-y-6">
      <div className={`rounded-[28px] border p-6 ${styles.panel}`}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className={`text-xs font-medium uppercase tracking-[0.12em] ${styles.muted}`}>Ventas</p>
            <h2 className={`mt-1 text-2xl font-bold ${styles.title}`}>Nuevo contrato / ficha</h2>
            <p className={`mt-2 text-sm ${styles.muted}`}>
              Selecciona una campaña con logo y luego se abrirá la ficha para cargar ventas.
            </p>
          </div>

          {campaignConfirmed ? (
            <button
              onClick={changeCampaign}
              className={`inline-flex min-w-[190px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${styles.changeBtn}`}
            >
              <FolderOpen className="h-4 w-4" />
              Cambiar campaña
            </button>
          ) : null}
        </div>
      </div>

      <div className={`rounded-[28px] border p-5 ${styles.phrase}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-fuchsia-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">
                Mensaje del día
              </p>
              <p className="mt-1 text-sm font-medium leading-6">{motivationalPhrase}</p>
            </div>
          </div>

          <button
            onClick={rotatePhrase}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${styles.changeBtn}`}
          >
            <Sparkles className="h-4 w-4" />
            Otra frase
          </button>
        </div>
      </div>

      {!campaignConfirmed ? (
        <div className={`rounded-[28px] border p-6 ${styles.panel}`}>
          <div className="mb-6 text-center">
            <p className={`text-xs font-medium uppercase tracking-[0.12em] ${styles.muted}`}>
              Selección inicial
            </p>
            <h3 className={`mt-2 text-xl font-bold ${styles.title}`}>
              Selecciona una campaña
            </h3>
            <p className={`mt-2 text-sm ${styles.muted}`}>
              Solo podrás cargar fichas de las campañas visibles con logo.
            </p>
          </div>

          {brandedCampaigns.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {brandedCampaigns.map((item) => (
                  <CampaignLogoCard
                    key={item.key}
                    item={item}
                    active={campaignSelection === item.nombre}
                    onClick={() => setCampaignSelection(item.nombre)}
                    styles={styles}
                    theme={theme}
                  />
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={confirmCampaignSelection}
                  className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-medium transition"
                  style={{
                    borderColor: "rgba(34,211,238,0.35)",
                    background:
                      theme === "night"
                        ? "rgba(34,211,238,0.12)"
                        : "rgba(186,230,253,0.95)",
                    color: theme === "night" ? "#cffafe" : "#0c4a6e",
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Abrir ficha
                </button>
              </div>
            </>
          ) : (
            <div className={`rounded-2xl border p-5 text-center ${styles.soft}`}>
              <p className={`text-sm ${styles.text}`}>
                No hay campañas con logo disponibles para este usuario.
              </p>
            </div>
          )}
        </div>
      ) : isVodafoneFlow ? (
        renderVodafoneConfigurator()
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryChip label="Cliente" value={formValues.cliente_razon_social} styles={styles} />
            <SummaryChip label="Documento" value={formValues.nif_nie_cif} styles={styles} />
            <SummaryChip label="Campaña" value={formValues.campana} styles={styles} />
            <SummaryChip label="Comercial" value={comercialResumen} styles={styles} />
          </div>

          <div className={`rounded-[28px] border p-6 ${styles.panel}`}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className={`text-xs font-medium uppercase tracking-[0.12em] ${styles.muted}`}>Ficha activa</p>
                <h3 className={`mt-1 text-xl font-bold ${styles.title}`}>{formValues.campana}</h3>
                <p className={`mt-2 text-sm ${styles.muted}`}>
                  Completa la información de la venta y registra el contrato.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 xl:justify-end">
                <button
                  onClick={saveDraft}
                  className={`inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${styles.saveBtn}`}
                >
                  <Save className="h-4 w-4" />
                  Guardar borrador
                </button>

                <button
                  onClick={submitDemo}
                  disabled={saving}
                  className={`inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${styles.submitBtn} ${
                    saving ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  <FilePlus2 className="h-4 w-4" />
                  {saving ? "Registrando..." : "Registrar contrato"}
                </button>

                <button
                  onClick={clearForm}
                  className={`inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${styles.clearBtn}`}
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpiar ficha
                </button>
              </div>
            </div>
          </div>

          <div className={`rounded-[28px] border p-4 ${styles.panel}`}>
            <div className="flex flex-wrap gap-2">
              {tabConfig.map((tab) => {
                const active = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      active ? styles.tabActive : styles.tabIdle
                    }`}
                  >
                    {tab.label} ({tabCount(tab.key)})
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "oferta" && campaignSections.oferta !== false && (
            <div className={`rounded-[28px] border p-5 ${styles.panel}`}>
              <div className="mb-4 flex items-center gap-2">
                <Tv className="h-5 w-5 text-cyan-400" />
                <h3 className={`text-lg font-semibold ${styles.title}`}>Servicios TV</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {TV_SERVICES.map((item) => (
                  <TvCard
                    key={item.key}
                    item={item}
                    active={selectedTv.includes(item.key)}
                    onToggle={toggleTv}
                    styles={styles}
                  />
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-[28px] border p-5 ${styles.panel}`}>
            <div className="mb-5 flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-cyan-400" />
              <h3 className={`text-lg font-semibold ${styles.title}`}>
                {tabConfig.find((t) => t.key === activeTab)?.label || "Ficha"}
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(fieldsByTab[activeTab] || []).map((field) => (
                <div
                  key={field.key}
                  className={field.type === "textarea" ? "md:col-span-2 xl:col-span-3" : ""}
                >
                  <label className={`mb-2 block text-sm font-medium ${styles.text}`}>{field.label}</label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[28px] border p-5 ${styles.panel}`}>
            <div className="mb-4 flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-cyan-400" />
              <h3 className={`text-lg font-semibold ${styles.title}`}>Resumen rápido</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryChip label="Producto" value={formValues.producto} styles={styles} />
              <SummaryChip label="Fibra" value={formValues.fibra} styles={styles} />
              <SummaryChip label="Televisión" value={formValues.television} styles={styles} />
              <SummaryChip
                label="Servicios TV"
                value={selectedTv.length ? selectedTv.join(", ") : ""}
                styles={styles}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
