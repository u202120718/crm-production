import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Search,
  Filter,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
  XCircle,
  FileSpreadsheet,
  FileText,
  Pencil,
  Save,
  X,
  RefreshCcw,
  Trash2,
  LayoutList,
  FolderKanban,
  Wifi,
  Smartphone,
  MonitorPlay,
  BadgeCheck,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ESTADOS,
  FAVORABLES_SET,
  PENDIENTES_SET,
  NO_FAVORABLES_SET,
  normalizeUpper,
  normalizeEstado,
  upperDeep,
  getTodayInputValue,
  getNowTimeDisplay,
  getNowStampDisplay,
  estadoClase,
} from "../config/ventasestados";

const PRIVILEGED_ROLES = ["Gerente", "Admin", "Backoffice"];
const CIERRE_VISIBLE_NO_PRIVILEGED = new Set([
  "comentario",
  "documentacion",
  "comercial_cierre",
]);

const BLOCK_LABELS = {
  principal: "DATOS PRINCIPALES",
  meta_auto: "DATOS AUTOMÁTICOS",
  principal_editable: "DATOS PRINCIPALES EDITABLES",
  control: "CONTROL",
  cliente: "CLIENTE",
  direccion: "DIRECCIÓN",
  oferta: "OFERTA",
  lineas: "LÍNEAS",
  cierre: "CIERRE",
  adicionales: "CAMPOS ADICIONALES",
};

const CAMPAIGN_LOGOS = {
  VODAFONE: "/img/campaigns/vodafone.jpg",
  YOIGO: "/img/campaigns/yoigo.png",
  MASMOVIL: "/img/campaigns/masmovil.png",
  "MÁSMÓVIL": "/img/campaigns/masmovil.png",
  LOWI: "/img/campaigns/vodafone.jpg",
  FINETWORK: "/img/campaigns/masmovil.png",
  NATURGY: "/img/campaigns/naturgy.jpg",
  ENDESA: "/img/campaigns/endesa.jpg",
  NORDY: "/img/campaigns/nordy.png",
};


const BASE_BLOCK_ORDER = [
  "principal",
  "control",
  "cliente",
  "direccion",
  "oferta",
  "lineas",
  "cierre",
  "adicionales",
];

const PRINCIPAL_FIELDS = [
  ["fecha", "FECHA"],
  ["hora", "HORA"],
  ["fechaRegistro", "REGISTRO"],
  ["fechaEdicion", "EDICIÓN"],
  ["cliente", "CLIENTE"],
  ["documento", "DOCUMENTO"],
  ["telefono", "TELÉFONO"],
  ["campana", "CAMPAÑA"],
  ["producto", "PRODUCTO"],
  ["comercial", "COMERCIAL"],
  ["coordinador", "COORDINADOR"],
  ["supervisor", "SUPERVISOR"],
  ["estado", "ESTADO"],
  ["serviciosTv", "SERVICIOS TV"],
];


const EXCEL_TEMPLATE_COLUMNS = [
  { header: "Fecha", width: 12, value: (venta, ficha) => formatExcelDate(venta?.fecha || getFichaValue(ficha, ["fecha"])) },
  { header: "Hora", width: 10, value: (venta, ficha) => formatExcelTime(venta?.hora || getFichaValue(ficha, ["hora"])) },
  { header: "Edicion", width: 18, value: (venta, ficha) => formatExcelDateTime(venta?.fechaEdicion || venta?.fechaRegistro || getFichaValue(ficha, ["fecha_edicion", "edicion"])) },
  { header: "Estado", width: 14, value: (venta, ficha) => normalizeUpper(venta?.estado || getFichaValue(ficha, ["estado"])) },
  { header: "Comercial", width: 26, value: (venta, ficha) => normalizeUpper(venta?.comercial || getFichaValue(ficha, ["comercial"])) },
  { header: "Coordinador", width: 22, value: (venta, ficha) => normalizeUpper(venta?.coordinador || getFichaValue(ficha, ["coordinador", "coordinador_operacion"])) },
  { header: "Supervisor", width: 24, value: (venta, ficha) => normalizeUpper(venta?.supervisor || getFichaValue(ficha, ["supervisor"])) },
  { header: "Cliente/Razón Social", width: 34, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["cliente_razon_social", "cliente"], venta?.cliente || "")) },
  { header: "DNI/NIE/CIF", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["dni_nie_cif", "nif_nie_cif", "documento"], venta?.documento || "")) },
  { header: "Fecha de nacimiento/Creación", width: 22, value: (venta, ficha) => formatExcelDate(getFichaValue(ficha, ["fecha_nacimiento_creacion", "fecha_nacimiento", "fecha_creacion"])) },
  { header: "Tlf. contacto", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["movil_contacto", "telefono_contacto", "telefono"], venta?.telefono || "")) },
  { header: "IBAN", width: 28, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["iban"])) },
  { header: "Correo", width: 28, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["correo", "email"])) },
  { header: "Segmento", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["segmento"])) },
  { header: "Nacionalidad", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["nacionalidad"])) },
  { header: "Sexo", width: 12, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["sexo"])) },
  { header: "Ocupacion", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["ocupacion"])) },
  { header: "# de llamada de venta", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["numero_llamada_venta", "numero_de_llamada_de_venta", "llamada_venta"])) },
  { header: "ONG", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["ong"])) },
  { header: "Titular / Responsable", width: 26, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["titular_responsable", "titular"])) },
  { header: "NIF/NIE", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["nif_nie", "titular_nif_nie"])) },
  { header: "Rubro de la empresa", width: 22, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["rubro_empresa", "rubro_de_la_empresa"])) },
  { header: "Via", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["via"])) },
  { header: "Dirección", width: 26, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["direccion"])) },
  { header: "Número", width: 12, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["numero_direccion", "numero"])) },
  { header: "Bloque", width: 12, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["bloque"])) },
  { header: "Portal", width: 12, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["portal"])) },
  { header: "Escalera", width: 12, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["escalera"])) },
  { header: "Piso", width: 10, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["piso"])) },
  { header: "Puerta", width: 12, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["puerta"])) },
  { header: "Código Postal", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["codigo_postal"])) },
  { header: "Provincia", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["provincia"])) },
  { header: "Localidad", width: 22, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["localidad"])) },
  { header: "Inmueble", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["inmueble"])) },
  { header: "Producto", width: 18, value: (venta, ficha) => normalizeUpper(venta?.producto || getFichaValue(ficha, ["producto"])) },
  { header: "Fibra", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["fibra"])) },
  { header: "Televisión", width: 16, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["television"])) },
  { header: "Promo", width: 16, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["promocion", "promo"])) },
  { header: "Servicios TV", width: 22, value: (venta, ficha) => normalizeUpper(formatServiciosTv(venta?.serviciosTv, ficha)) },
  { header: "Cantidad de móviles", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["cantidad_moviles"])) },
  { header: "Número", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["linea_principal_numero", "numero_principal", "numero_linea_1"])) },
  { header: "Operador", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["linea_principal_operador", "operador_principal", "operador_linea_1"])) },
  { header: "ICC", width: 22, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["icc_linea_1", "icc1", "icc_principal"])) },
  { header: "Tarifa", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["tarifa_linea_1", "tarifa1", "tarifa_principal"])) },
  { header: "Número", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["numero_linea_2", "linea_2_numero"])) },
  { header: "Operador", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["operador_linea_2", "linea_2_operador"])) },
  { header: "ICC", width: 22, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["icc_linea_2", "icc2"])) },
  { header: "Tarifa", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["tarifa_linea_2", "tarifa2"])) },
  { header: "Número", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["numero_linea_3", "linea_3_numero"])) },
  { header: "Operador", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["operador_linea_3", "linea_3_operador"])) },
  { header: "ICC", width: 22, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["icc_linea_3", "icc3"])) },
  { header: "Tarifa", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["tarifa_linea_3", "tarifa3"])) },
  { header: "Precio promo/luego", width: 18, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["precio_promo_luego"])) },
  { header: "Comentarios", width: 36, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["comentario", "comentario_final"])) },
  { header: "Documentación", width: 24, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["documentacion"])) },
  { header: "CRM de carga", width: 16, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["crm_carga"])) },
  { header: "Fecha activación fijo", width: 18, value: (venta, ficha) => formatExcelDate(getFichaValue(ficha, ["fecha_activacion_fijo"])) },
  { header: "Fecha activación total", width: 18, value: (venta, ficha) => formatExcelDate(getFichaValue(ficha, ["fecha_activacion_total"])) },
  { header: "Venta recuperada", width: 16, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["venta_recuperada"])) },
  { header: "Sondeo auto/presencial", width: 20, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["sondeo_auto_presencial"])) },
  { header: "Validador", width: 22, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["validador"])) },
  { header: "Liquidado", width: 14, value: (venta, ficha) => normalizeUpper(getFichaValue(ficha, ["liquidado"])) },
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
      data?.errors?.documento?.[0] ||
      data?.errors?.telefono?.[0] ||
      data?.errors?.campana?.[0] ||
      data?.errors?.producto?.[0] ||
      data?.errors?.estado?.[0] ||
      "NO SE PUDO COMPLETAR LA SOLICITUD.";
    throw new Error(message);
  }

  return data;
}

function labelFromKey(key) {
  return String(key || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanFichaObject(ficha = {}) {
  const result = {};
  Object.entries(ficha || {}).forEach(([key, value]) => {
    if (key === "customFields") return;
    result[key] = Array.isArray(value) ? value.join(", ") : value ?? "";
  });
  return result;
}

function getCurrentUserName(currentUser) {
  return (
    currentUser?.nombre ||
    currentUser?.name ||
    currentUser?.email ||
    currentUser?.dni ||
    ""
  );
}

function getFichaValue(ficha = {}, keys = [], fallback = "") {
  for (const key of keys) {
    const value = ficha?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
}

function formatServiciosTv(serviciosTv = [], ficha = {}) {
  if (Array.isArray(serviciosTv) && serviciosTv.length > 0) {
    return serviciosTv.map((x) => normalizeUpper(x)).join(", ");
  }

  return getFichaValue(ficha, ["servicios_tv", "serviciosTv", "television_servicios"], "");
}

function formatExcelDate(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-");
    return `${d}/${m}/${y}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("es-ES");
  }

  return raw;
}

function formatExcelTime(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  const match = raw.match(/(\d{1,2}:\d{2})(?::\d{2})?/);
  return match ? match[1] : raw;
}

function formatExcelDateTime(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
    return raw.replace(/:(\d{2})$/, "");
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const date = parsed.toLocaleDateString("es-ES");
    const time = parsed.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} ${time}`;
  }

  return raw;
}

function getExcelSheetName() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `Reporte_${dd}_${mm}_${yyyy}_${hh}_${min}_${ss}`.slice(0, 31);
}

function buildExcelRow(venta) {
  const ficha = upperDeep(cleanFichaObject(venta?.ficha || {}));
  return EXCEL_TEMPLATE_COLUMNS.map((column) => column.value(venta, ficha));
}

function normalizeVenta(venta) {
  return {
    id: venta?.id ?? null,
    fecha: venta?.fecha ?? "",
    hora: venta?.hora ?? "",
    cliente: normalizeUpper(venta?.cliente),
    documento: normalizeUpper(venta?.documento),
    telefono: normalizeUpper(venta?.telefono),
    campana: normalizeUpper(venta?.campana),
    comercial: normalizeUpper(venta?.comercial),
    coordinador: normalizeUpper(venta?.coordinador),
    supervisor: normalizeUpper(venta?.supervisor),
    producto: normalizeUpper(venta?.producto),
    estado: normalizeEstado(venta?.estado || "PENDIENTE"),
    serviciosTv: Array.isArray(venta?.serviciosTv)
      ? venta.serviciosTv.map((x) => normalizeUpper(x))
      : [],
    ficha: upperDeep(cleanFichaObject(venta?.ficha || {})),
    fechaRegistro: venta?.fechaRegistro ?? "",
    fechaEdicion: venta?.fechaEdicion ?? "",
  };
}


function getCampaignLogo(campana = "") {
  const name = normalizeUpper(campana);
  if (CAMPAIGN_LOGOS[name]) return CAMPAIGN_LOGOS[name];

  const key = Object.keys(CAMPAIGN_LOGOS).find((item) => name.includes(item));
  return key ? CAMPAIGN_LOGOS[key] : "/img/campaigns/vodafone.jpg";
}

function parseSelectedProducts(venta = {}) {
  const ficha = venta?.ficha || {};

  const fibra =
    ficha.fibraSeleccionada ||
    ficha.fibra ||
    ficha.fibra_seleccionada ||
    "";

  const movilesRaw =
    ficha.movilesSeleccionados ||
    ficha.moviles_seleccionados ||
    ficha.moviles ||
    [];

  const tvRaw =
    ficha.tvSeleccionada ||
    ficha.tv_seleccionada ||
    ficha.serviciosTv ||
    venta.serviciosTv ||
    [];

  const moviles = Array.isArray(movilesRaw)
    ? movilesRaw
        .map((item, index) => {
          if (typeof item === "string") {
            return { key: `movil_${index}`, title: item, cantidad: 1 };
          }

          return {
            key: item.key || `movil_${index}`,
            title: item.title || item.nombre || item.plan || "MÓVIL",
            subtitle: item.subtitle || item.tarifa || "",
            cantidad: Number(item.cantidad || item.qty || item.quantity || 1),
          };
        })
        .filter((item) => item.cantidad > 0)
    : [];

  const tv = Array.isArray(tvRaw)
    ? tvRaw.map((item, index) => {
        if (typeof item === "string") {
          return { key: `tv_${index}`, title: item, price: "" };
        }

        return {
          key: item.key || `tv_${index}`,
          title: item.title || item.nombre || item.label || "TV",
          price: item.price || item.precio || "",
        };
      })
    : [];

  return { fibra, moviles, tv };
}

function getReadableAddress(ficha = {}) {
  return [
    ficha.direccion,
    ficha.numero_direccion,
    ficha.piso ? `PISO ${ficha.piso}` : "",
    ficha.puerta ? `PUERTA ${ficha.puerta}` : "",
    ficha.codigo_postal,
    ficha.localidad,
    ficha.provincia,
  ]
    .filter(Boolean)
    .join(" · ");
}

function flattenVentaForExport(venta) {
  const ficha = upperDeep(cleanFichaObject(venta?.ficha || {}));

  const row = {
    ID: venta?.id || "",
    FECHA: normalizeUpper(venta?.fecha || ""),
    HORA: normalizeUpper(venta?.hora || ""),
    FECHAREGISTRO: normalizeUpper(venta?.fechaRegistro || ""),
    FECHAEDICION: normalizeUpper(venta?.fechaEdicion || ""),
    CLIENTE: normalizeUpper(venta?.cliente || ""),
    DOCUMENTO: normalizeUpper(venta?.documento || ""),
    TELEFONO: normalizeUpper(venta?.telefono || ""),
    CAMPANA: normalizeUpper(venta?.campana || ""),
    COMERCIAL: normalizeUpper(venta?.comercial || ""),
    COORDINADOR: normalizeUpper(venta?.coordinador || ""),
    SUPERVISOR: normalizeUpper(venta?.supervisor || ""),
    PRODUCTO: normalizeUpper(venta?.producto || ""),
    ESTADO: normalizeUpper(venta?.estado || ""),
    SERVICIOSTV: Array.isArray(venta?.serviciosTv)
      ? venta.serviciosTv.map((x) => normalizeUpper(x)).join(", ")
      : "",
  };

  Object.entries(ficha).forEach(([key, value]) => {
    row[`FICHA - ${labelFromKey(key).toUpperCase()}`] = normalizeUpper(value ?? "");
  });

  return row;
}

function buildEditForm(venta = null, currentUser = null) {
  const currentUserName = normalizeUpper(getCurrentUserName(currentUser));
  const originalFicha = upperDeep(cleanFichaObject(venta?.ficha || {}));
  const ficha = { ...originalFicha };

  if (PRIVILEGED_ROLES.includes(currentUser?.rol)) {
    if (!ficha.validador && currentUserName) {
      ficha.validador = currentUserName;
    }

    if (!ficha.coordinador_operacion && (venta?.coordinador || currentUser?.coordinador)) {
      ficha.coordinador_operacion = normalizeUpper(
        venta?.coordinador || currentUser?.coordinador || ""
      );
    }

    if (!ficha.comercial_cierre && venta?.comercial) {
      ficha.comercial_cierre = normalizeUpper(venta.comercial);
    }
  }

  return {
    cliente: normalizeUpper(venta?.cliente || ""),
    documento: normalizeUpper(venta?.documento || ""),
    telefono: normalizeUpper(venta?.telefono || ""),
    campana: normalizeUpper(venta?.campana || ""),
    comercial: normalizeUpper(venta?.comercial || ""),
    coordinador: normalizeUpper(venta?.coordinador || currentUser?.coordinador || ""),
    supervisor: normalizeUpper(venta?.supervisor || currentUser?.supervisor || ""),
    producto: normalizeUpper(venta?.producto || ""),
    estado: normalizeEstado(venta?.estado || "PENDIENTE"),
    fecha: venta?.fecha || getTodayInputValue(),
    hora: venta?.hora || getNowTimeDisplay(),
    fechaRegistro: venta?.fechaRegistro || getNowStampDisplay(),
    fechaEdicion: getNowStampDisplay(),
    usuarioEdicion: currentUserName || "",
    serviciosTv: Array.isArray(venta?.serviciosTv)
      ? venta.serviciosTv.map((x) => normalizeUpper(x)).join(", ")
      : "",
    ficha,
  };
}

function normalizeCampaignMeta(campaign) {
  return {
    customBlocks: Array.isArray(campaign?.customBlocks) ? campaign.customBlocks : [],
    customFields: Array.isArray(campaign?.customFields) ? campaign.customFields : [],
  };
}

function inferBlockFromKey(key) {
  const normalized = String(key || "").toLowerCase();

  if (
    [
      "comercial",
      "coordinador",
      "supervisor",
      "coordinador_operacion",
      "comercial_cierre",
      "validador",
    ].some((x) => normalized.includes(x))
  ) {
    return "control";
  }

  if (
    [
      "cliente",
      "razon_social",
      "nif",
      "nie",
      "cif",
      "nacimiento",
      "movil_contacto",
      "iban",
      "correo",
      "segmento",
      "nacionalidad",
      "sexo",
      "ocupacion",
    ].some((x) => normalized.includes(x))
  ) {
    return "cliente";
  }

  if (
    [
      "titular_",
      "via",
      "direccion",
      "numero_direccion",
      "bloque",
      "portal",
      "escalera",
      "piso",
      "puerta",
      "codigo_postal",
      "provincia",
      "localidad",
      "inmueble",
    ].some((x) => normalized.includes(x))
  ) {
    return "direccion";
  }

  if (
    [
      "producto",
      "fibra",
      "television",
      "promocion",
      "cantidad_moviles",
      "precio_promo_luego",
      "servicio_adicional",
      "campana",
    ].some((x) => normalized.includes(x))
  ) {
    return "oferta";
  }

  if (
    normalized.startsWith("linea_") ||
    normalized.startsWith("movil_") ||
    normalized.includes("icc") ||
    normalized.includes("tarifa")
  ) {
    return "lineas";
  }

  if (
    [
      "comentario",
      "documentacion",
      "crm_carga",
      "fecha_activacion",
      "venta_recuperada",
      "sondeo_auto_presencial",
      "liquidado",
      "seleccionar_equipo",
    ].some((x) => normalized.includes(x))
  ) {
    return "cierre";
  }

  return "adicionales";
}

function buildFieldMetaMap(selectedVenta, campaigns) {
  const campaign = campaigns.find((c) => c?.nombre === selectedVenta?.campana);
  const meta = normalizeCampaignMeta(campaign);
  const fieldMap = {};
  const blockMap = {};

  meta.customBlocks.forEach((block) => {
    blockMap[block.key] = normalizeUpper(block.label || labelFromKey(block.key));
  });

  meta.customFields.forEach((field) => {
    fieldMap[field.key] = {
      label: normalizeUpper(field.label || labelFromKey(field.key)),
      tab: field.tab || inferBlockFromKey(field.key),
    };
  });

  return { fieldMap, blockMap };
}

function buildPrincipalEntries(venta) {
  return PRINCIPAL_FIELDS.map(([key, label]) => {
    let value = venta?.[key];

    if (key === "serviciosTv") {
      value = Array.isArray(value) ? value.join(", ") : "";
    }

    return {
      key,
      label,
      value: value || "-",
      isEstado: key === "estado",
    };
  });
}

function buildFichaSections(venta, campaigns, currentUser) {
  if (!venta) return [];

  const ficha = upperDeep(cleanFichaObject(venta.ficha || {}));
  const { fieldMap, blockMap } = buildFieldMetaMap(venta, campaigns);
  const grouped = {};

  Object.entries(ficha).forEach(([key, value]) => {
    const fieldMeta = fieldMap[key];
    const blockKey = fieldMeta?.tab || inferBlockFromKey(key);

    if (
      blockKey === "cierre" &&
      !PRIVILEGED_ROLES.includes(currentUser?.rol) &&
      !CIERRE_VISIBLE_NO_PRIVILEGED.has(key)
    ) {
      return;
    }

    if (!grouped[blockKey]) grouped[blockKey] = [];

    grouped[blockKey].push({
      key,
      label: fieldMeta?.label || normalizeUpper(labelFromKey(key)),
      value: value || "-",
    });
  });

  const customBlockKeys = Object.keys(blockMap);
  const order = [
    ...BASE_BLOCK_ORDER.filter((b) => b !== "principal"),
    ...customBlockKeys.filter((b) => !BASE_BLOCK_ORDER.includes(b)),
  ];

  return order
    .filter((blockKey) => grouped[blockKey]?.length)
    .map((blockKey) => ({
      key: blockKey,
      title: blockMap[blockKey] || BLOCK_LABELS[blockKey] || normalizeUpper(labelFromKey(blockKey)),
      entries: grouped[blockKey],
    }));
}


function VentaFichaPreview({ venta }) {
  const ficha = venta?.ficha || {};
  const { fibra, moviles, tv } = parseSelectedProducts(venta);
  const logo = getCampaignLogo(venta?.campana);
  const direccion = getReadableAddress(ficha);

  return (
    <div className="crm-panel-soft overflow-hidden p-0">
      <div className="relative border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-24 w-24 rounded-full bg-rose-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white p-3 shadow-xl">
              <img
                src={logo}
                alt={venta?.campana || "Campaña"}
                className="max-h-14 max-w-14 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                Ficha de venta
              </p>
              <h3 className="mt-1 text-2xl font-black">{venta?.campana || "SIN CAMPAÑA"}</h3>
              <p className="mt-1 text-sm text-slate-300">
                {venta?.cliente || "-"} · {venta?.documento || "-"}
              </p>
            </div>
          </div>

          <span className={`rounded-full border px-4 py-2 text-sm font-bold ${estadoClase(venta?.estado)}`}>
            {venta?.estado || "PENDIENTE"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-cyan-500" />
            <p className="crm-label">FIBRA</p>
          </div>
          <p className="mt-2 text-lg font-bold">{fibra || "NO SELECCIONADA"}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-500" />
            <p className="crm-label">MÓVILES</p>
          </div>
          {moviles.length ? (
            <div className="mt-2 space-y-1">
              {moviles.map((item) => (
                <p key={item.key} className="text-sm font-semibold">
                  {item.title} {item.subtitle ? `· ${item.subtitle}` : ""} x{item.cantidad}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-lg font-bold">SIN MÓVILES</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <MonitorPlay className="h-5 w-5 text-violet-500" />
            <p className="crm-label">TV</p>
          </div>
          {tv.length ? (
            <div className="mt-2 space-y-1">
              {tv.slice(0, 4).map((item) => (
                <p key={item.key} className="text-sm font-semibold">
                  {item.title} {item.price ? `· ${item.price}` : ""}
                </p>
              ))}
              {tv.length > 4 ? <p className="crm-muted text-xs">+{tv.length - 4} servicio(s)</p> : null}
            </div>
          ) : (
            <p className="mt-2 text-lg font-bold">SIN TV</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 px-5 pb-5 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="crm-label">DIRECCIÓN</p>
          <p className="mt-2 text-sm font-semibold">{direccion || "-"}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="crm-label">DATOS COMERCIALES</p>
          <p className="mt-2 text-sm font-semibold">COMERCIAL: {venta?.comercial || "-"}</p>
          <p className="text-sm font-semibold">PRODUCTO: {venta?.producto || "-"}</p>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, entries }) {
  return (
    <div className="crm-panel-soft p-4">
      <div className="mb-3 flex items-center gap-2">
        <FolderKanban className="h-4 w-4 text-cyan-500" />
        <p className="crm-label">{title}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-slate-300 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5"
          >
            <p className="crm-label">{item.label}</p>
            {item.isEstado ? (
              <span
                className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${estadoClase(
                  item.value
                )}`}
              >
                {item.value}
              </span>
            ) : (
              <p className="mt-1 text-sm font-semibold" style={{ color: "inherit" }}>
                {item.value || "-"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditSection({
  title,
  entries,
  editForm,
  setEditForm,
  coordinadoresDisponibles = [],
  comercialesDisponibles = [],
  validadoresDisponibles = [],
}) {
  const updateFichaValue = (key, value) => {
    setEditForm((prev) => ({
      ...prev,
      ficha: {
        ...prev.ficha,
        [key]: normalizeUpper(value),
      },
    }));
  };

  return (
    <div className="crm-panel-soft p-4">
      <div className="mb-3 flex items-center gap-2">
        <LayoutList className="h-4 w-4 text-cyan-500" />
        <p className="crm-label">{title}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((item) => {
          if (item.readOnly) {
            return (
              <div
                key={item.key}
                className="rounded-xl border border-slate-300 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5"
              >
                <p className="crm-label">{item.label}</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: "inherit" }}>
                  {item.value || "-"}
                </p>
              </div>
            );
          }

          if (item.from === "main" && item.key === "estado") {
            return (
              <div key={item.key}>
                <label className="crm-label mb-2 block">{item.label}</label>
                <select
                  value={editForm.estado}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, estado: normalizeEstado(e.target.value) }))
                  }
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            );
          }

          if (item.key === "coordinador_operacion") {
            return (
              <div key={item.key}>
                <label className="crm-label mb-2 block">{item.label}</label>
                <select
                  value={editForm.ficha?.[item.key] ?? ""}
                  onChange={(e) => updateFichaValue(item.key, e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                >
                  <option value="">SELECCIONA COORDINADOR</option>
                  {coordinadoresDisponibles.map((u) => (
                    <option key={u.id} value={normalizeUpper(u.nombre || u.name)}>
                      {normalizeUpper(u.nombre || u.name)}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (item.key === "comercial_cierre") {
            return (
              <div key={item.key}>
                <label className="crm-label mb-2 block">{item.label}</label>
                <select
                  value={editForm.ficha?.[item.key] ?? ""}
                  onChange={(e) => updateFichaValue(item.key, e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                >
                  <option value="">SELECCIONA COMERCIAL</option>
                  {comercialesDisponibles.map((u) => (
                    <option key={u.id} value={normalizeUpper(u.nombre || u.name)}>
                      {normalizeUpper(u.nombre || u.name)}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (item.key === "validador") {
            return (
              <div key={item.key}>
                <label className="crm-label mb-2 block">{item.label}</label>
                <select
                  value={editForm.ficha?.[item.key] ?? ""}
                  onChange={(e) => updateFichaValue(item.key, e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                >
                  <option value="">SELECCIONA VALIDADOR</option>
                  {validadoresDisponibles.map((u) => (
                    <option key={u.id} value={normalizeUpper(u.nombre || u.name)}>
                      {normalizeUpper(u.nombre || u.name)}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (
            item.key === "venta_recuperada" ||
            item.key === "sondeo_auto_presencial" ||
            item.key === "liquidado"
          ) {
            const optionsMap = {
              venta_recuperada: ["SI", "NO"],
              sondeo_auto_presencial: ["AUTO", "PRESENCIAL"],
              liquidado: ["SI", "NO"],
            };

            return (
              <div key={item.key}>
                <label className="crm-label mb-2 block">{item.label}</label>
                <select
                  value={editForm.ficha?.[item.key] ?? ""}
                  onChange={(e) => updateFichaValue(item.key, e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                >
                  <option value="">SELECCIONA</option>
                  {optionsMap[item.key].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (item.key === "comentario" || item.key === "comentario_final") {
            return (
              <div key={item.key} className="md:col-span-2">
                <label className="crm-label mb-2 block">{item.label}</label>
                <textarea
                  value={editForm.ficha?.[item.key] ?? ""}
                  onChange={(e) => updateFichaValue(item.key, e.target.value)}
                  className="crm-input min-h-[110px] w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                />
              </div>
            );
          }

          if (item.from === "main") {
            return (
              <div key={item.key}>
                <label className="crm-label mb-2 block">{item.label}</label>
                <input
                  value={editForm[item.key] ?? ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      [item.key]: normalizeUpper(e.target.value),
                    }))
                  }
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                />
              </div>
            );
          }

          return (
            <div key={item.key}>
              <label className="crm-label mb-2 block">{item.label}</label>
              <input
                value={editForm.ficha?.[item.key] ?? ""}
                onChange={(e) => updateFichaValue(item.key, e.target.value)}
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Ventas({
  ventas = [],
  setVentas,
  currentUser,
  campaigns = [],
  users = [],
}) {
  const [selectedVentaId, setSelectedVentaId] = useState(null);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [campanaFiltro, setCampanaFiltro] = useState("TODAS");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState(buildEditForm(null, currentUser));

  const canSeeExportButtons = PRIVILEGED_ROLES.includes(currentUser?.rol);
  const canEditVentas = PRIVILEGED_ROLES.includes(currentUser?.rol);
  const currentUserName = normalizeUpper(getCurrentUserName(currentUser));

  const comercialesDisponibles = users.filter(
    (u) => u.estado === "Activo" && u.rol === "Comercial"
  );

  const coordinadoresDisponibles = users.filter(
    (u) =>
      u.estado === "Activo" &&
      ["Supervisor", "Admin", "Gerente"].includes(u.rol)
  );

  const validadoresDisponibles = users.filter(
    (u) =>
      u.estado === "Activo" &&
      ["Backoffice", "Admin", "Gerente"].includes(u.rol)
  );

  const campañasDisponibles = useMemo(() => {
    const fromVentas = ventas.map((v) => normalizeUpper(v.campana)).filter(Boolean);
    const fromCampaigns = campaigns.map((c) => normalizeUpper(c.nombre)).filter(Boolean);
    return ["TODAS", ...new Set([...fromVentas, ...fromCampaigns])];
  }, [ventas, campaigns]);

  const ventasFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase();

    return ventas.filter((venta) => {
      const coincideBusqueda =
        !q ||
        [
          venta.cliente,
          venta.documento,
          venta.telefono,
          venta.campana,
          venta.comercial,
          venta.coordinador,
          venta.supervisor,
          venta.producto,
          venta.estado,
          venta.fechaRegistro,
          venta.fechaEdicion,
          venta.fecha,
          venta.hora,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const coincideEstado =
        estadoFiltro === "TODOS" ? true : normalizeEstado(venta.estado) === estadoFiltro;

      const coincideCampaña =
        campanaFiltro === "TODAS" ? true : normalizeUpper(venta.campana) === campanaFiltro;

      return coincideBusqueda && coincideEstado && coincideCampaña;
    });
  }, [ventas, search, estadoFiltro, campanaFiltro]);

  const selectedVenta = useMemo(() => {
    if (!selectedVentaId) return null;
    return ventas.find((venta) => venta.id === selectedVentaId) || null;
  }, [ventas, selectedVentaId]);

  useEffect(() => {
    if (selectedVenta) {
      setEditForm(buildEditForm(selectedVenta, currentUser));
    } else {
      setEditForm(buildEditForm(null, currentUser));
    }
  }, [selectedVentaId, selectedVenta, currentUser]);

  const limpiarMensajes = () => {
    setMessage("");
    setError("");
  };

  const cargarVentas = async () => {
    if (!setVentas) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const data = await apiFetch(`/ventas/list`);
      const list = Array.isArray(data?.ventas) ? data.ventas.map(normalizeVenta) : [];

      setVentas(list);
      setSelectedVentaId(null);
      setEditMode(false);
    } catch (err) {
      setError(err.message || "NO SE PUDIERON CARGAR LAS VENTAS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const totalVentas = ventas.length;
  const gestionadas = ventas.filter((v) => FAVORABLES_SET.has(normalizeEstado(v.estado))).length;
  const pendientes = ventas.filter((v) => PENDIENTES_SET.has(normalizeEstado(v.estado))).length;
  const rechazadas = ventas.filter((v) => NO_FAVORABLES_SET.has(normalizeEstado(v.estado))).length;

  const cambiarEstado = async (nuevoEstado) => {
    if (!selectedVenta || !setVentas) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const estadoNormalizado = normalizeEstado(nuevoEstado);

      const data = await apiFetch(`/ventas/${selectedVenta.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: estadoNormalizado }),
      });

      const actualizada = normalizeVenta(
        data.venta || { ...selectedVenta, estado: estadoNormalizado }
      );

      setVentas((prev) =>
        prev.map((venta) => (venta.id === actualizada.id ? { ...venta, ...actualizada } : venta))
      );

      setEditForm((prev) => ({
        ...prev,
        estado: estadoNormalizado,
        fechaEdicion: getNowStampDisplay(),
        usuarioEdicion: currentUserName,
      }));
      setMessage("ESTADO ACTUALIZADO CORRECTAMENTE.");
    } catch (err) {
      setError(err.message || "NO SE PUDO ACTUALIZAR EL ESTADO.");
    } finally {
      setLoading(false);
    }
  };

  const abrirEdicion = () => {
    if (!selectedVenta) return;
    setEditForm(buildEditForm(selectedVenta, currentUser));
    setEditMode(true);
    limpiarMensajes();
  };

  const guardarEdicion = async () => {
    if (!selectedVenta || !setVentas) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const fechaEdicionActual = getNowStampDisplay();

      const fichaPayload = {
        ...editForm.ficha,
      };

      if (PRIVILEGED_ROLES.includes(currentUser?.rol)) {
        if (currentUserName) {
          fichaPayload.validador = fichaPayload.validador || currentUserName;
        }

        if (!fichaPayload.coordinador_operacion) {
          fichaPayload.coordinador_operacion =
            normalizeUpper(editForm.coordinador || selectedVenta.coordinador || currentUser?.coordinador || "");
        }

        if (!fichaPayload.comercial_cierre) {
          fichaPayload.comercial_cierre =
            normalizeUpper(editForm.comercial || selectedVenta.comercial || "");
        }
      }

      const payload = {
        cliente: normalizeUpper(editForm.cliente),
        documento: normalizeUpper(editForm.documento),
        telefono: normalizeUpper(editForm.telefono),
        campana: normalizeUpper(editForm.campana),
        comercial: normalizeUpper(editForm.comercial),
        coordinador: normalizeUpper(editForm.coordinador),
        supervisor: normalizeUpper(editForm.supervisor),
        producto: normalizeUpper(editForm.producto),
        estado: normalizeEstado(editForm.estado),
        fecha: editForm.fecha,
        hora: editForm.hora,
        serviciosTv: String(editForm.serviciosTv || "")
          .split(",")
          .map((x) => normalizeUpper(x))
          .filter(Boolean),
        ficha: upperDeep(fichaPayload),
        fechaEdicion: fechaEdicionActual,
      };

      const data = await apiFetch(`/ventas/${selectedVenta.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const actualizada = normalizeVenta(
        data.venta || {
          ...selectedVenta,
          ...payload,
          fechaEdicion: fechaEdicionActual,
          ficha: {
            ...upperDeep(cleanFichaObject(selectedVenta.ficha || {})),
            ...upperDeep(fichaPayload),
          },
        }
      );

      setVentas((prev) =>
        prev.map((venta) => (venta.id === actualizada.id ? { ...venta, ...actualizada } : venta))
      );

      setSelectedVentaId(actualizada.id);
      setEditMode(false);
      setMessage("VENTA ACTUALIZADA.");
    } catch (err) {
      setError(err.message || "NO SE PUDO ACTUALIZAR LA VENTA.");
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    if (selectedVenta) {
      setEditForm(buildEditForm(selectedVenta, currentUser));
    } else {
      setEditForm(buildEditForm(null, currentUser));
    }
    setEditMode(false);
    limpiarMensajes();
  };

  const eliminarVenta = async () => {
    if (!selectedVenta || !setVentas) return;

    const ok = window.confirm(
      `¿SEGURO QUE DESEAS ELIMINAR LA VENTA DE ${selectedVenta.cliente}?`
    );
    if (!ok) return;

    try {
      setLoading(true);
      limpiarMensajes();

      await apiFetch(`/ventas/${selectedVenta.id}`, {
        method: "DELETE",
      });

      setVentas((prev) => prev.filter((venta) => venta.id !== selectedVenta.id));
      setSelectedVentaId(null);
      setEditMode(false);
      setMessage("VENTA ELIMINADA.");
    } catch (err) {
      setError(err.message || "NO SE PUDO ELIMINAR LA VENTA.");
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    const rows = [
      EXCEL_TEMPLATE_COLUMNS.map((column) => column.header),
      ...ventasFiltradas.map((venta) => buildExcelRow(venta)),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    worksheet["!cols"] = EXCEL_TEMPLATE_COLUMNS.map((column) => ({
      wch: column.width || 18,
    }));

    if (rows.length > 1 && EXCEL_TEMPLATE_COLUMNS.length > 0) {
      worksheet["!autofilter"] = {
        ref: XLSX.utils.encode_range({
          s: { r: 0, c: 0 },
          e: { r: rows.length - 1, c: EXCEL_TEMPLATE_COLUMNS.length - 1 },
        }),
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, getExcelSheetName());
    XLSX.writeFile(workbook, "VENTAS_COMPLETAS_CRM.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    let currentY = 14;

    doc.setFontSize(16);
    doc.text("REPORTE COMPLETO DE VENTAS CRM", 14, currentY);
    currentY += 8;

    ventasFiltradas.forEach((venta, index) => {
      if (index > 0) currentY += 4;

      const ventaInfo = [
        ["ID", String(venta?.id || "")],
        ["FECHA", normalizeUpper(venta?.fecha || "")],
        ["HORA", normalizeUpper(venta?.hora || "")],
        ["FECHA REGISTRO", normalizeUpper(venta?.fechaRegistro || "")],
        ["FECHA EDICIÓN", normalizeUpper(venta?.fechaEdicion || "")],
        ["CLIENTE", normalizeUpper(venta?.cliente || "")],
        ["DOCUMENTO", normalizeUpper(venta?.documento || "")],
        ["TELÉFONO", normalizeUpper(venta?.telefono || "")],
        ["CAMPAÑA", normalizeUpper(venta?.campana || "")],
        ["COMERCIAL", normalizeUpper(venta?.comercial || "")],
        ["COORDINADOR", normalizeUpper(venta?.coordinador || "")],
        ["SUPERVISOR", normalizeUpper(venta?.supervisor || "")],
        ["PRODUCTO", normalizeUpper(venta?.producto || "")],
        ["ESTADO", normalizeUpper(venta?.estado || "")],
        [
          "SERVICIOS TV",
          Array.isArray(venta?.serviciosTv)
            ? venta.serviciosTv.map((x) => normalizeUpper(x)).join(", ")
            : "",
        ],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [[`VENTA ${index + 1}`, "VALOR"]],
        body: ventaInfo,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 41, 59] },
        bodyStyles: { textColor: [20, 20, 20] },
        margin: { left: 14, right: 14 },
      });

      currentY = doc.lastAutoTable.finalY + 4;

      const ficha = upperDeep(cleanFichaObject(venta?.ficha || {}));
      const fichaRows = Object.entries(ficha).map(([key, value]) => [
        labelFromKey(key).toUpperCase(),
        normalizeUpper(value ?? ""),
      ]);

      if (fichaRows.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["CAMPO FICHA", "VALOR"]],
          body: fichaRows,
          styles: { fontSize: 7.5, cellPadding: 2 },
          headStyles: { fillColor: [67, 56, 202] },
          bodyStyles: { textColor: [20, 20, 20] },
          margin: { left: 14, right: 14 },
        });

        currentY = doc.lastAutoTable.finalY + 8;
      }

      if (currentY > 260 && index < ventasFiltradas.length - 1) {
        doc.addPage();
        currentY = 14;
      }
    });

    doc.save("VENTAS_COMPLETAS_CRM.pdf");
  };

  const detailSections = useMemo(() => {
    if (!selectedVenta) return [];

    const principal = {
      key: "principal",
      title: BLOCK_LABELS.principal,
      entries: buildPrincipalEntries(selectedVenta),
    };

    const fichaSections = buildFichaSections(selectedVenta, campaigns, currentUser);

    return [principal, ...fichaSections];
  }, [selectedVenta, campaigns, currentUser]);

  const editSections = useMemo(() => {
    if (!selectedVenta) return [];

    const metaSection = {
      key: "meta_auto",
      title: BLOCK_LABELS.meta_auto,
      entries: [
        { key: "fecha", label: "FECHA", value: editForm.fecha || "-", readOnly: true },
        { key: "hora", label: "HORA", value: editForm.hora || "-", readOnly: true },
        { key: "fechaRegistro", label: "REGISTRO", value: editForm.fechaRegistro || "-", readOnly: true },
        { key: "fechaEdicion", label: "EDICIÓN", value: editForm.fechaEdicion || "-", readOnly: true },
        { key: "usuarioEdicion", label: "USUARIO EDICIÓN", value: editForm.usuarioEdicion || "-", readOnly: true },
        { key: "comercial_auto", label: "COMERCIAL", value: editForm.comercial || "-", readOnly: true },
        { key: "coordinador_auto", label: "COORDINADOR", value: editForm.coordinador || "-", readOnly: true },
        { key: "supervisor_auto", label: "SUPERVISOR", value: editForm.supervisor || "-", readOnly: true },
      ],
    };

    const mainEditable = {
      key: "principal_editable",
      title: BLOCK_LABELS.principal_editable,
      entries: [
        { key: "cliente", label: "CLIENTE", from: "main" },
        { key: "documento", label: "DOCUMENTO", from: "main" },
        { key: "telefono", label: "TELÉFONO", from: "main" },
        { key: "campana", label: "CAMPAÑA", from: "main" },
        { key: "producto", label: "PRODUCTO", from: "main" },
        { key: "estado", label: "ESTADO", from: "main" },
        { key: "serviciosTv", label: "SERVICIOS TV", from: "main" },
      ],
    };

    const fichaSections = buildFichaSections(selectedVenta, campaigns, currentUser).map((section) => ({
      ...section,
      entries: section.entries.map((item) => ({ ...item, from: "ficha" })),
    }));

    return [metaSection, mainEditable, ...fichaSections];
  }, [selectedVenta, campaigns, currentUser, editForm]);

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">VENTAS</p>
        <h2 className="crm-title mt-1 text-2xl">GESTIÓN DE VENTAS</h2>
        <p className="crm-muted mt-2 text-sm">
          TODO QUEDA NORMALIZADO EN MAYÚSCULA Y CON HORA PERÚ PARA REGISTRO Y EDICIÓN.
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
        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="h-5 w-5 text-cyan-500" />
            <p className="crm-label">TOTAL VENTAS</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{totalVentas}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="crm-label">GESTIONADAS</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{gestionadas}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-amber-500" />
            <p className="crm-label">PENDIENTES</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{pendientes}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-rose-500" />
            <p className="crm-label">NO FAVORABLES</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{rechazadas}</p>
        </div>
      </div>

      <div className="crm-panel p-5">
        <div
          className={`grid gap-4 ${
            canSeeExportButtons
              ? "xl:grid-cols-[1.2fr_220px_220px_auto_auto_auto]"
              : "xl:grid-cols-[1.2fr_220px_220px_auto]"
          }`}
        >
          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
              style={{ color: "inherit" }}
              placeholder="BUSCAR POR CLIENTE, DOCUMENTO, TELÉFONO, CAMPAÑA O COMERCIAL"
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
              <option className="text-black">TODOS</option>
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
            onClick={cargarVentas}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            RECARGAR
          </button>

          {canSeeExportButtons && (
            <>
              <button
                onClick={exportarExcel}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-300"
              >
                <FileSpreadsheet className="h-4 w-4" />
                EXCEL
              </button>

              <button
                onClick={exportarPDF}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-rose-300"
              >
                <FileText className="h-4 w-4" />
                PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">VENTAS REGISTRADAS</h3>

          <div className="mt-4 space-y-3">
            {ventasFiltradas.length > 0 ? (
              ventasFiltradas.map((venta) => {
                const active = selectedVenta?.id === venta.id;

                return (
                  <div
                    key={venta.id}
                    className={`rounded-2xl border p-4 transition ${
                      active
                        ? "border-slate-400 bg-slate-200/80 dark:border-white/20 dark:bg-slate-900"
                        : "crm-panel-soft"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="crm-heading">{venta.cliente}</p>
                        <p className="crm-muted text-sm">
                          {venta.telefono} · {venta.documento || "SIN DOCUMENTO"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          FECHA: {venta.fecha || "-"} · HORA: {venta.hora || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          EDICIÓN: {venta.fechaEdicion || "-"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
                          {venta.campana || "-"}
                        </span>

                        <span
                          className={`rounded-full border px-4 py-2 text-sm font-bold ${estadoClase(
                            venta.estado
                          )}`}
                        >
                          {venta.estado}
                        </span>

                        <button
                          onClick={() => {
                            setSelectedVentaId(venta.id);
                            setEditMode(false);
                            limpiarMensajes();
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                        >
                          <Eye className="h-3 w-3" />
                          VER
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="crm-panel-soft p-4">
                <p className="crm-muted text-sm">NO HAY VENTAS PARA MOSTRAR.</p>
              </div>
            )}
          </div>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="crm-heading text-lg">DETALLE DE VENTA</h3>

            {selectedVenta && !editMode && canEditVentas && (
              <button
                onClick={abrirEdicion}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-300"
              >
                <Pencil className="h-4 w-4" />
                EDITAR
              </button>
            )}
          </div>

          {selectedVenta ? (
            <div className="mt-4 space-y-4">
              {editMode && canEditVentas ? (
                <>
                  {editSections.map((section) => (
                    <EditSection
                      key={section.key}
                      title={section.title}
                      entries={section.entries}
                      editForm={editForm}
                      setEditForm={setEditForm}
                      coordinadoresDisponibles={coordinadoresDisponibles}
                      comercialesDisponibles={comercialesDisponibles}
                      validadoresDisponibles={validadoresDisponibles}
                    />
                  ))}

                  <div className="flex gap-2">
                    <button
                      onClick={guardarEdicion}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      GUARDAR
                    </button>

                    <button
                      onClick={cancelarEdicion}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                      CANCELAR
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <VentaFichaPreview venta={selectedVenta} />

                  {detailSections.map((section) => (
                    <DetailSection
                      key={section.key}
                      title={section.title}
                      entries={section.entries}
                    />
                  ))}

                  <div className="crm-panel-soft p-4">
                    <p className="crm-label mb-3">CAMBIO RÁPIDO DE ESTADO</p>
                    <div className="flex flex-wrap gap-2">
                      {ESTADOS.map((estado) => (
                        <button
                          key={estado}
                          onClick={() => cambiarEstado(estado)}
                          disabled={loading}
                          className={`rounded-full border px-3 py-2 text-xs font-bold transition ${estadoClase(
                            estado
                          )} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {estado}
                        </button>
                      ))}
                    </div>
                  </div>

                  {canEditVentas && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={eliminarVenta}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-950 bg-red-950 px-4 py-3 font-medium text-red-100 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        ELIMINAR
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="crm-panel-soft mt-4 p-6">
              <p className="crm-muted text-sm">
                PULSA <strong>VER</strong> EN UNA VENTA PARA MOSTRAR SU DETALLE AQUÍ.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
