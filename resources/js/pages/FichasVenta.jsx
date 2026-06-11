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
  const [saving, setSaving] = useState(false);
  const [motivationalPhrase, setMotivationalPhrase] = useState("");
  const [campaignSelection, setCampaignSelection] = useState("");
  const [campaignConfirmed, setCampaignConfirmed] = useState(false);

  const styles = useMemo(() => getThemeStyles(theme), [theme]);
  const draftKey = useMemo(() => getDraftKey(currentUser), [currentUser]);
  const currentCommercialName = useMemo(() => getCurrentUserName(currentUser), [currentUser]);

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
      if (Array.isArray(currentUser.allowedCampaigns)) {
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

    setFormValues((prev) => ({ ...prev, [key]: value }));
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
        },
        currentUser
      )
    );
    setCampaignConfirmed(true);
    setActiveTab("control");
  };

  const changeCampaign = () => {
    setCampaignConfirmed(false);
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
    setSelectedTv([]);
    setActiveTab("control");
    setCampaignConfirmed(false);
    setCampaignSelection("");
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
        producto: formValues.producto || "",
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
      setSelectedTv([]);
      setCampaignConfirmed(false);
      setCampaignSelection("");
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
        <textarea
          value={formValues[field.key] || ""}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          className={`min-h-[110px] w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`}
          placeholder={field.label}
        />
      );
    }

    return (
      <input
        type={field.type}
        value={formValues[field.key] || ""}
        onChange={(e) => handleFieldChange(field.key, e.target.value)}
        className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${styles.input}`}
        placeholder={field.label}
      />
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
