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
  BellRing,
  MessageSquareText,
  AlertTriangle,
  Activity,
  ChevronDown,
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
  "fecha_activacion_fibra",
  "fecha_activacion_movil",
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
  { header: "Fecha activación fibra", width: 20, value: (venta, ficha) => formatExcelDate(getFichaValue(ficha, ["fecha_activacion_fibra", "fecha_activacion_fijo"])) },
  { header: "Fecha activación móvil", width: 20, value: (venta, ficha) => formatExcelDate(getFichaValue(ficha, ["fecha_activacion_movil"])) },
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

// Mantiene los espacios mientras el usuario escribe. La normalización final se hace al guardar.
function upperWhileTyping(value) {
  return String(value ?? "").toUpperCase();
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


function getUserCampaignNames(currentUser = {}) {
  const raw =
    currentUser?.campanas ||
    currentUser?.campaigns ||
    currentUser?.campanasAsignadas ||
    currentUser?.campaignsAssigned ||
    currentUser?.campana ||
    currentUser?.campaign ||
    "";

  if (Array.isArray(raw)) {
    return raw
      .map((item) => normalizeUpper(item?.nombre || item?.name || item))
      .filter(Boolean);
  }

  if (typeof raw === "string") {
    return raw
      .split(/[,\|;]/)
      .map((item) => normalizeUpper(item))
      .filter(Boolean);
  }

  return [];
}

function userCanSeeVenta() {
  // Los permisos se controlan desde Laravel (VentaManagementController).
  // React solamente muestra las ventas autorizadas por la API.
  return true;
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
  const rawFicha =
    venta?.ficha && typeof venta.ficha === "object" && !Array.isArray(venta.ficha)
      ? venta.ficha
      : {};

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
    ficha: upperDeep(cleanFichaObject(rawFicha)),
    fichaProductos: {
      fibraSeleccionada:
        rawFicha.fibraSeleccionada ||
        rawFicha.fibra_seleccionada ||
        rawFicha.fibra ||
        "",
      movilesSeleccionados: Array.isArray(rawFicha.movilesSeleccionados)
        ? rawFicha.movilesSeleccionados
        : Array.isArray(rawFicha.moviles_seleccionados)
          ? rawFicha.moviles_seleccionados
          : [],
      tvSeleccionada: Array.isArray(rawFicha.tvSeleccionada)
        ? rawFicha.tvSeleccionada
        : Array.isArray(rawFicha.tv_seleccionada)
          ? rawFicha.tv_seleccionada
          : [],
    },
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
  const fichaProductos = venta?.fichaProductos || {};

  const fibra =
    fichaProductos.fibraSeleccionada ||
    ficha.fibraSeleccionada ||
    ficha.fibra ||
    ficha.fibra_seleccionada ||
    "";

  const movilesRaw =
    fichaProductos.movilesSeleccionados ||
    ficha.movilesSeleccionados ||
    ficha.moviles_seleccionados ||
    ficha.moviles ||
    [];

  const tvRaw =
    fichaProductos.tvSeleccionada ||
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
            numeros: Array.isArray(item.numeros)
              ? item.numeros.map((numero) => String(numero || "").replace(/\D/g, "").slice(0, 9))
              : [],
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

  const { moviles } = parseSelectedProducts(venta);
  let mobileIndex = 1;

  moviles.forEach((item) => {
    const numeros = Array.isArray(item.numeros) ? item.numeros : [];

    if (numeros.length) {
      numeros.forEach((numero) => {
        row[`MÓVIL ${mobileIndex} - TARIFA`] = normalizeUpper(item.title || item.subtitle || "");
        row[`MÓVIL ${mobileIndex} - NÚMERO`] = normalizeUpper(numero || "");
        mobileIndex += 1;
      });
      return;
    }

    for (let i = 0; i < Number(item.cantidad || 0); i += 1) {
      row[`MÓVIL ${mobileIndex} - TARIFA`] = normalizeUpper(item.title || item.subtitle || "");
      row[`MÓVIL ${mobileIndex} - NÚMERO`] = "";
      mobileIndex += 1;
    }
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
  const customBlocks = Array.isArray(campaign?.customBlocks)
    ? campaign.customBlocks
    : Array.isArray(campaign?.custom_blocks)
      ? campaign.custom_blocks
      : [];

  const customFields = Array.isArray(campaign?.dynamicFields)
    ? campaign.dynamicFields
    : Array.isArray(campaign?.customFields)
      ? campaign.customFields
      : Array.isArray(campaign?.custom_fields)
        ? campaign.custom_fields
        : [];

  return {
    customBlocks,
    customFields,
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
      label: normalizeUpper(field.label || field.nombre || labelFromKey(field.key)),
      tab: field.tab || field.step || field.zone || inferBlockFromKey(field.key),
      required: Boolean(field.required),
      type: field.type || "text",
      options: Array.isArray(field.options)
        ? field.options
        : Array.isArray(field.opciones)
          ? field.opciones
          : [],
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
      required: Boolean(fieldMeta?.required),
      type: fieldMeta?.type || "text",
      options: fieldMeta?.options || [],
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


function isCancelledState(value) {
  const state = normalizeUpper(normalizeEstado(value));
  return (
    state.includes("CANCEL") ||
    state.includes("CAIDA") ||
    state.includes("CAÍDA") ||
    state.includes("RECHAZ") ||
    state.includes("NO FAVORABLE") ||
    state.includes("FALLIDA") ||
    state.includes("DESCONEX")
  );
}

function getVentaAlertReason(venta = {}) {
  const ficha = venta?.ficha || {};

  return (
    ficha.motivo_alerta_comercial ||
    ficha.comentario_backoffice ||
    ficha.comentario_seguimiento ||
    ficha.comentario_final ||
    ficha.comentario ||
    ""
  );
}

function getVentaAlertTitle(venta = {}) {
  const state = normalizeUpper(venta?.estado || "VENTA EN REVISIÓN");

  if (state.includes("CANCEL")) return "Venta cancelada";
  if (state.includes("CAIDA") || state.includes("CAÍDA")) return "Venta caída";
  if (state.includes("RECHAZ")) return "Venta rechazada";
  if (state.includes("NO FAVORABLE")) return "Venta no favorable";
  if (state.includes("FALLIDA")) return "Venta fallida";

  return "Alerta de venta";
}

function VentaAlertsPanel({
  alerts = [],
  readIds = [],
  onOpen,
  onMarkAll,
  currentUser,
  collapsed = false,
  onToggle,
}) {
  if (!alerts.length) return null;

  const unread = alerts.filter((item) => !readIds.includes(String(item.id))).length;
  const isCommercial = currentUser?.rol === "Comercial";

  return (
    <section className="ventas-message-center">
      <div className="ventas-message-head">
        <button
          type="button"
          className="ventas-message-toggle"
          onClick={onToggle}
          aria-expanded={!collapsed}
          title={collapsed ? "Mostrar alertas" : "Ocultar alertas"}
        >
          <div className="ventas-message-title">
            <div className="ventas-message-icon">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p>{isCommercial ? "Mensajes de Backoffice" : "Alertas de ventas"}</p>
              <span>
                {unread
                  ? `${unread} alerta(s) nueva(s)`
                  : "Todas las alertas revisadas"}
              </span>
            </div>
          </div>

          <span className="ventas-message-collapse-label">
            {collapsed ? "Mostrar" : "Ocultar"}
            <ChevronDown
              className={`h-4 w-4 ${collapsed ? "" : "ventas-chevron-open"}`}
            />
          </span>
        </button>

        {!collapsed && unread > 0 ? (
          <button type="button" className="ventas-message-readall" onClick={onMarkAll}>
            <MessageSquareText className="h-4 w-4" />
            Marcar leídas
          </button>
        ) : null}
      </div>

      {!collapsed ? (
      <div className="ventas-message-list">
        {alerts.slice(0, 8).map((alert) => {
          const isRead = readIds.includes(String(alert.id));
          const reason = getVentaAlertReason(alert);

          return (
            <button
              key={alert.id}
              type="button"
              className={`ventas-message-item ${isRead ? "read" : "unread"}`}
              onClick={() => onOpen?.(alert)}
            >
              <div className="ventas-message-dot">
                <AlertTriangle className="h-4 w-4" />
              </div>

              <div className="ventas-message-copy">
                <div>
                  <strong>{getVentaAlertTitle(alert)}</strong>
                  {!isRead ? <span>NUEVO</span> : null}
                </div>
                <p>
                  {alert.cliente || "-"} · {alert.campana || "-"} · {alert.estado || "-"}
                </p>
                <small>
                  {reason ||
                    "La venta requiere revisión. Backoffice todavía no ha indicado un motivo."}
                </small>
              </div>

              <div className="ventas-message-date">
                {alert.fecha || "-"}
                <br />
                {alert.hora || ""}
              </div>
            </button>
          );
        })}
      </div>
      ) : null}
    </section>
  );
}

function VentaFichaPreview({ venta }) {
  const ficha = venta?.ficha || {};
  const { fibra, moviles, tv } = parseSelectedProducts(venta);
  const logo = getCampaignLogo(venta?.campana);
  const direccion = getReadableAddress(ficha);

  return (
    <div className="crm-panel-soft overflow-hidden p-0">
      <div className="ventas-preview-hero relative border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white">
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

            <div className="ventas-selected-identity">
              <p className="ventas-selected-kicker">
                Ficha de venta
              </p>
              <h3 className="ventas-selected-campaign">
                {venta?.campana || "SIN CAMPAÑA"}
              </h3>
              <p className="ventas-selected-client">
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
                <div key={item.key} className="ventas-mobile-preview">
                  <p className="text-sm font-semibold">
                    {item.title} {item.subtitle ? `· ${item.subtitle}` : ""} x{item.cantidad}
                  </p>
                  {item.numeros?.length ? (
                    <div className="ventas-mobile-numbers">
                      {item.numeros.map((numero, index) => (
                        <span key={`${item.key}-${index}`}>
                          Línea {index + 1}: {numero || "SIN NÚMERO"}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
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

      <div className="ventas-activation-summary ventas-theme-surface">
        <div className="ventas-activation-title">
          <BadgeCheck className="h-5 w-5" />
          <div>
            <p>FECHAS DE ACTIVACIÓN</p>
            <span>Información visible.</span>
          </div>
        </div>

        <div className="ventas-activation-grid">
          <div className="ventas-activation-card fibra">
            <Wifi className="h-5 w-5" />
            <div>
              <span>Fecha activación fibra</span>
              <strong>
                {formatExcelDate(
                  getFichaValue(ficha, ["fecha_activacion_fibra", "fecha_activacion_fijo"])
                ) || "PENDIENTE"}
              </strong>
            </div>
          </div>

          <div className="ventas-activation-card movil">
            <Smartphone className="h-5 w-5" />
            <div>
              <span>Fecha activación móvil</span>
              <strong>
                {formatExcelDate(
                  getFichaValue(ficha, ["fecha_activacion_movil"])
                ) || "PENDIENTE"}
              </strong>
            </div>
          </div>
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
  estadosDisponibles = ESTADOS,
}) {
  const updateFichaValue = (key, value) => {
    setEditForm((prev) => ({
      ...prev,
      ficha: {
        ...prev.ficha,
        [key]: upperWhileTyping(value),
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
                  {estadosDisponibles.map((estado) => (
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
                      [item.key]: upperWhileTyping(e.target.value),
                    }))
                  }
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                />
              </div>
            );
          }

          const label = `${item.label}${item.required ? " *" : ""}`;

          if (item.type === "textarea") {
            return (
              <div key={item.key} className="md:col-span-2">
                <label className="crm-label mb-2 block">{label}</label>
                <textarea
                  value={editForm.ficha?.[item.key] ?? ""}
                  onChange={(e) => updateFichaValue(item.key, e.target.value)}
                  className="crm-input min-h-[110px] w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                  required={item.required}
                />
              </div>
            );
          }

          if (item.type === "select") {
            return (
              <div key={item.key}>
                <label className="crm-label mb-2 block">{label}</label>
                <select
                  value={editForm.ficha?.[item.key] ?? ""}
                  onChange={(e) => updateFichaValue(item.key, e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                  required={item.required}
                >
                  <option value="">SELECCIONA</option>
                  {(item.options || []).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div key={item.key}>
              <label className="crm-label mb-2 block">{label}</label>
              <input
                type={item.type === "number" || item.type === "date" || item.type === "email" || item.type === "tel" ? item.type : "text"}
                value={editForm.ficha?.[item.key] ?? ""}
                onChange={(e) => updateFichaValue(item.key, e.target.value)}
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
                required={item.required}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BackofficeValidationPanel({ editForm, setEditForm, validadoresDisponibles = [] }) {
  const ficha = editForm?.ficha || {};

  const setFicha = (key, value) => {
    setEditForm((prev) => ({
      ...prev,
      ficha: {
        ...(prev.ficha || {}),
        [key]: upperWhileTyping(value),
      },
    }));
  };

  const today = getTodayInputValue();

  const addDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  const DatePicker = ({ label, field }) => (
    <div className="bo-field">
      <label>{label}</label>
      <div className="bo-date-row">
        <input
          type="date"
          value={String(ficha?.[field] || "").slice(0, 10)}
          onChange={(e) => setFicha(field, e.target.value)}
        />
        <button type="button" onClick={() => setFicha(field, today)}>Hoy</button>
        <button type="button" onClick={() => setFicha(field, addDays(1))}>Mañana</button>
      </div>
    </div>
  );

  return (
    <div className="bo-validation-panel">
      <div className="bo-validation-header">
        <div>
          <p>Validación backoffice</p>
          <h4>Seguimiento, activación, OT y liquidación</h4>
          <span>Panel visible.</span>
        </div>

        <div className="bo-validation-badges">
          <span>Auto fecha</span>
          <span>Control OT</span>
          <span>Liquidación</span>
        </div>
      </div>

      <div className="bo-section blue">
        <div className="bo-section-title">
          <span>01</span>
          Seguimiento
        </div>

        <div className="bo-grid">
          <div className="bo-field bo-wide">
            <label>Comentario seguimiento</label>
            <textarea
              value={ficha.comentario_seguimiento || ""}
              onChange={(e) => setFicha("comentario_seguimiento", e.target.value)}
              placeholder="Agrega observación de seguimiento..."
            />
          </div>

          <div className="bo-field">
            <label>Seguimiento</label>
            <select
              value={ficha.seguimiento || ""}
              onChange={(e) => setFicha("seguimiento", e.target.value)}
            >
              <option value="">SELECCIONA</option>
              <option value="CONTACTADO">CONTACTADO</option>
              <option value="NO CONTESTA">NO CONTESTA</option>
              <option value="RELLAMAR">RELLAMAR</option>
              <option value="VALIDANDO">VALIDANDO</option>
              <option value="INCIDENCIA">INCIDENCIA</option>
            </select>
          </div>

          <div className="bo-field">
            <label># tlf seguimiento 1</label>
            <input
              value={ficha.tlf_seguimiento_1 || ""}
              onChange={(e) => setFicha("tlf_seguimiento_1", e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="9 dígitos"
            />
          </div>

          <div className="bo-field">
            <label># tlf seguimiento 2</label>
            <input
              value={ficha.tlf_seguimiento_2 || ""}
              onChange={(e) => setFicha("tlf_seguimiento_2", e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="9 dígitos"
            />
          </div>

          <div className="bo-field">
            <label>Prioridad seguimiento</label>
            <select
              value={ficha.p_seguimiento || ""}
              onChange={(e) => setFicha("p_seguimiento", e.target.value)}
            >
              <option value="">SELECCIONA</option>
              <option value="BAJA">BAJA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="ALTA">ALTA</option>
              <option value="URGENTE">URGENTE</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bo-section slate">
        <div className="bo-section-title">
          <span>02</span>
          Backoffice / Activación
        </div>

        <div className="bo-grid">
          <div className="bo-field">
            <label>Usuario carga</label>
            <select
              value={ficha.usuario_carga || ""}
              onChange={(e) => setFicha("usuario_carga", e.target.value)}
            >
              <option value="">SELECCIONA</option>
              <option value="TRAMITE NUEVO VPN">TRAMITE NUEVO VPN</option>
              <option value="TRAMITE RETENCION">TRAMITE RETENCION</option>
              <option value="BACKOFFICE">BACKOFFICE</option>
              <option value="CALIDAD">CALIDAD</option>
            </select>
          </div>

          <DatePicker label="Fecha activación fibra" field="fecha_activacion_fibra" />
          <DatePicker label="Fecha activación móvil" field="fecha_activacion_movil" />

          <div className="bo-field bo-wide">
            <label>Comentario backoffice</label>
            <textarea
              value={ficha.comentario_backoffice || ficha.comentario || ""}
              onChange={(e) => setFicha("comentario_backoffice", e.target.value)}
              placeholder="Comentario operativo de activación..."
            />
          </div>

          <div className="bo-field bo-wide bo-alert-reason">
            <label>Motivo de caída / alerta al comercial</label>
            <textarea
              value={ficha.motivo_alerta_comercial || ""}
              onChange={(e) => setFicha("motivo_alerta_comercial", e.target.value)}
              placeholder="Ejemplo: Cliente canceló por precio, documentación incompleta, instalación rechazada..."
            />
            <small>
              Este mensaje será visible para el comercial como alerta dentro de sus ventas.
            </small>
          </div>

          <div className="bo-field">
            <label>Validador</label>
            <select
              value={ficha.validador || ""}
              onChange={(e) => setFicha("validador", e.target.value)}
            >
              <option value="">SELECCIONA VALIDADOR</option>
              {validadoresDisponibles.map((u) => (
                <option key={u.id} value={normalizeUpper(u.nombre || u.name)}>
                  {normalizeUpper(u.nombre || u.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="bo-field">
            <label>Venta recuperada</label>
            <select
              value={ficha.venta_recuperada || ""}
              onChange={(e) => setFicha("venta_recuperada", e.target.value)}
            >
              <option value="">SELECCIONA</option>
              <option value="SI">SI</option>
              <option value="NO">NO</option>
            </select>
          </div>

          <div className="bo-field">
            <label>ID Cliente</label>
            <input
              value={ficha.id_cliente || ""}
              onChange={(e) => setFicha("id_cliente", e.target.value.replace(/\D/g, "").slice(0, 14))}
              placeholder="ID cliente"
            />
          </div>

          <div className="bo-field">
            <label>N° OT</label>
            <input
              value={ficha.numero_ot || ficha.n_ot || ""}
              onChange={(e) => setFicha("numero_ot", e.target.value.replace(/\D/g, "").slice(0, 14))}
              placeholder="Orden de trabajo"
            />
          </div>

          <div className="bo-field">
            <label>ID OT Padre</label>
            <input
              value={ficha.id_ot_padre || ""}
              onChange={(e) => setFicha("id_ot_padre", e.target.value.replace(/\D/g, "").slice(0, 14))}
              placeholder="OT padre"
            />
          </div>
        </div>
      </div>

      <div className="bo-section purple">
        <div className="bo-section-title">
          <span>03</span>
          Liquidación y alerta
        </div>

        <div className="bo-grid compact">
          <div className="bo-field">
            <label>Liquidado</label>
            <select
              value={ficha.liquidado || ""}
              onChange={(e) => setFicha("liquidado", e.target.value)}
            >
              <option value="">SELECCIONA</option>
              <option value="SI">SI</option>
              <option value="NO">NO</option>
              <option value="OBSERVADO">OBSERVADO</option>
            </select>
          </div>

          <div className="bo-field">
            <label>¿Agendar alerta?</label>
            <select
              value={ficha.agendar_alerta || ""}
              onChange={(e) => setFicha("agendar_alerta", e.target.value)}
            >
              <option value="">SELECCIONA</option>
              <option value="NO">NO</option>
              <option value="SI">SI</option>
            </select>
          </div>

          <div className="bo-field bo-wide">
            <label>Notas del día</label>
            <textarea
              value={ficha.notas_dia || ""}
              onChange={(e) => setFicha("notas_dia", e.target.value)}
              placeholder="Notas internas para seguimiento del día..."
            />
          </div>
        </div>
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
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comercialFiltro, setComercialFiltro] = useState("TODOS");
  const [productoFiltro, setProductoFiltro] = useState("TODOS");
  const [coordinadorFiltro, setCoordinadorFiltro] = useState("TODOS");
  const [supervisorFiltro, setSupervisorFiltro] = useState("TODOS");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState(buildEditForm(null, currentUser));
  const alertStorageKey = `crm_sales_alerts_read_${currentUser?.id || currentUser?.email || currentUser?.dni || "user"}`;
  const [alertsCollapsed, setAlertsCollapsed] = useState(true);
  const [readAlertIds, setReadAlertIds] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(alertStorageKey) || "[]");
      return Array.isArray(stored) ? stored.map(String) : [];
    } catch {
      return [];
    }
  });

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

  const comercialesFiltroDisponibles = useMemo(
    () => ["TODOS", ...new Set(ventas.map((v) => normalizeUpper(v.comercial)).filter(Boolean))],
    [ventas]
  );

  const productosFiltroDisponibles = useMemo(
    () => ["TODOS", ...new Set(ventas.map((v) => normalizeUpper(v.producto)).filter(Boolean))],
    [ventas]
  );

  const coordinadoresFiltroDisponibles = useMemo(
    () => ["TODOS", ...new Set(ventas.map((v) => normalizeUpper(v.coordinador)).filter(Boolean))],
    [ventas]
  );

  const supervisoresFiltroDisponibles = useMemo(
    () => ["TODOS", ...new Set(ventas.map((v) => normalizeUpper(v.supervisor)).filter(Boolean))],
    [ventas]
  );

  const ventasFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase();

    return ventas.filter((venta) => {
      if (!userCanSeeVenta(venta, currentUser, users)) return false;

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

      const coincideComercial =
        comercialFiltro === "TODOS" ? true : normalizeUpper(venta.comercial) === comercialFiltro;

      const coincideProducto =
        productoFiltro === "TODOS" ? true : normalizeUpper(venta.producto) === productoFiltro;

      const coincideCoordinador =
        coordinadorFiltro === "TODOS" ? true : normalizeUpper(venta.coordinador) === coordinadorFiltro;

      const coincideSupervisor =
        supervisorFiltro === "TODOS" ? true : normalizeUpper(venta.supervisor) === supervisorFiltro;

      const fechaVenta = String(venta.fecha || "").slice(0, 10);
      const coincideFechaInicio = !fechaInicio || fechaVenta >= fechaInicio;
      const coincideFechaFin = !fechaFin || fechaVenta <= fechaFin;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideCampaña &&
        coincideComercial &&
        coincideProducto &&
        coincideCoordinador &&
        coincideSupervisor &&
        coincideFechaInicio &&
        coincideFechaFin
      );
    });
  }, [
    ventas,
    users,
    currentUser,
    search,
    estadoFiltro,
    campanaFiltro,
    comercialFiltro,
    productoFiltro,
    coordinadorFiltro,
    supervisorFiltro,
    fechaInicio,
    fechaFin,
  ]);

  const selectedVenta = useMemo(() => {
    if (!selectedVentaId) return null;
    return ventas.find((venta) => venta.id === selectedVentaId) || null;
  }, [ventas, selectedVentaId]);

  const estadosDisponibles = useMemo(() => {
    const campaign = campaigns.find(
      (item) => normalizeUpper(item?.nombre) === normalizeUpper(selectedVenta?.campana)
    );
    const custom = campaign?.configuracion?.estadosVenta;
    return Array.from(new Set([...(Array.isArray(custom) ? custom : []), ...ESTADOS].map(normalizeEstado).filter(Boolean)));
  }, [campaigns, selectedVenta?.campana]);

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

  const ventasVisiblesPorRol = useMemo(
    () => ventas,
    [ventas, currentUser, users]
  );

  const totalVentas = ventasVisiblesPorRol.length;
  const activoTotal = ventasVisiblesPorRol.filter(
    (v) => normalizeUpper(normalizeEstado(v.estado)) === "ACTIVO TOTAL"
  ).length;
  const activoParcial = ventasVisiblesPorRol.filter(
    (v) => normalizeUpper(normalizeEstado(v.estado)) === "ACTIVO PARCIAL"
  ).length;
  const pendientes = ventasVisiblesPorRol.filter(
    (v) => PENDIENTES_SET.has(normalizeEstado(v.estado))
  ).length;
  const canceladas = ventasVisiblesPorRol.filter(
    (v) => normalizeUpper(normalizeEstado(v.estado)).includes("CANCEL")
  ).length;

  const ventaAlerts = useMemo(
    () =>
      ventasVisiblesPorRol
        .filter((venta) => isCancelledState(venta.estado))
        .sort((a, b) => Number(b.id || 0) - Number(a.id || 0)),
    [ventasVisiblesPorRol]
  );

  const unreadVentaAlerts = ventaAlerts.filter(
    (venta) => !readAlertIds.includes(String(venta.id))
  ).length;

  const persistReadAlertIds = (nextIds) => {
    const unique = Array.from(new Set(nextIds.map(String)));
    setReadAlertIds(unique);
    try {
      localStorage.setItem(alertStorageKey, JSON.stringify(unique));
    } catch {
      // almacenamiento local no disponible
    }
  };

  const openVentaAlert = (venta) => {
    persistReadAlertIds([...readAlertIds, String(venta.id)]);
    setSelectedVentaId(venta.id);
    setEditMode(false);
    limpiarMensajes();
  };

  const markAllVentaAlertsRead = () => {
    persistReadAlertIds([
      ...readAlertIds,
      ...ventaAlerts.map((venta) => String(venta.id)),
    ]);
  };

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

    const campaign = campaigns.find(
      (item) => normalizeUpper(item?.nombre) === normalizeUpper(selectedVenta?.campana)
    );
    const requiredFields = Array.isArray(campaign?.dynamicFields || campaign?.customFields)
      ? (campaign.dynamicFields || campaign.customFields).filter((field) => field?.required)
      : [];
    const missingFields = requiredFields.filter((field) => {
      const value = editForm?.ficha?.[field.key];
      return value === undefined || value === null || String(value).trim() === "";
    });

    if (missingFields.length) {
      setError(`COMPLETA LOS CAMPOS REQUERIDOS: ${missingFields.map((field) => normalizeUpper(field.label || labelFromKey(field.key))).join(", ")}`);
      return;
    }

    try {
      setLoading(true);
      limpiarMensajes();

      const fechaEdicionActual = getNowStampDisplay();

      const fichaPayload = {
        ...editForm.ficha,
        ...(selectedVenta?.fichaProductos?.fibraSeleccionada
          ? { fibraSeleccionada: selectedVenta.fichaProductos.fibraSeleccionada }
          : {}),
        ...(Array.isArray(selectedVenta?.fichaProductos?.movilesSeleccionados)
          ? { movilesSeleccionados: selectedVenta.fichaProductos.movilesSeleccionados }
          : {}),
        ...(Array.isArray(selectedVenta?.fichaProductos?.tvSeleccionada)
          ? { tvSeleccionada: selectedVenta.fichaProductos.tvSeleccionada }
          : {}),
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
    const baseRows = ventasFiltradas.map((venta) => flattenVentaForExport(venta));
    const allHeaders = Array.from(
      baseRows.reduce((set, row) => {
        Object.keys(row).forEach((key) => set.add(key));
        return set;
      }, new Set())
    );

    if (!allHeaders.length) {
      allHeaders.push("ID", "FECHA", "CLIENTE", "DOCUMENTO", "TELÉFONO", "CAMPAÑA", "ESTADO");
    }

    const normalizedRows = baseRows.map((row) => {
      const completed = {};
      allHeaders.forEach((header) => {
        completed[header] = row[header] ?? "";
      });
      return completed;
    });

    const worksheet = XLSX.utils.json_to_sheet(normalizedRows, { header: allHeaders });
    worksheet["!cols"] = allHeaders.map((header) => ({
      wch: Math.min(45, Math.max(14, header.length + 2)),
    }));

    if (normalizedRows.length && allHeaders.length) {
      worksheet["!autofilter"] = {
        ref: XLSX.utils.encode_range({
          s: { r: 0, c: 0 },
          e: { r: normalizedRows.length, c: allHeaders.length - 1 },
        }),
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, getExcelSheetName());
    XLSX.writeFile(workbook, "VENTAS_COMPLETAS_TODOS_LOS_DATOS.xlsx");
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

  const limpiarFiltros = () => {
    setSearch("");
    setEstadoFiltro("TODOS");
    setCampanaFiltro("TODAS");
    setFechaInicio("");
    setFechaFin("");
    setComercialFiltro("TODOS");
    setProductoFiltro("TODOS");
    setCoordinadorFiltro("TODOS");
    setSupervisorFiltro("TODOS");
  };

  return (
    <div className="ventas-pro">
      <VentasProStyle />

      {message ? <div className="ventas-alert ok">{message}</div> : null}
      {error ? <div className="ventas-alert error">{error}</div> : null}

      <div className="ventas-metrics">
        <MetricCard icon={CircleDollarSign} label="Total ventas" value={totalVentas} hint="Ventas visibles" tone="blue" />
        <MetricCard icon={CheckCircle2} label="Activo total" value={activoTotal} hint="Estado ACTIVO TOTAL" tone="green" />
        <MetricCard icon={Activity} label="Activo parcial" value={activoParcial} hint="Estado ACTIVO PARCIAL" tone="cyan" />
        <MetricCard icon={Clock3} label="Pendientes" value={pendientes} hint="Requieren gestión" tone="amber" />
        <MetricCard icon={XCircle} label="Cancelado" value={canceladas} hint="Ventas canceladas" tone="rose" />
        <MetricCard icon={BellRing} label="Alertas" value={unreadVentaAlerts} hint="Mensajes pendientes" tone="purple" />
      </div>

      <VentaAlertsPanel
        alerts={ventaAlerts}
        readIds={readAlertIds}
        onOpen={openVentaAlert}
        onMarkAll={markAllVentaAlertsRead}
        currentUser={currentUser}
        collapsed={alertsCollapsed}
        onToggle={() => setAlertsCollapsed((prev) => !prev)}
      />

      <div className="ventas-filters">
        <div className="ventas-filter-head">
          <div>
            <p>Filtros avanzados</p>
            <span>Filtra por fecha, campaña, estado, comercial y responsables.</span>
          </div>
          <button onClick={limpiarFiltros} className="ventas-soft-btn">
            <X className="h-4 w-4" />
            Limpiar filtros
          </button>
        </div>

        <div className="ventas-filter-grid">
          <FilterField label="Desde">
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </FilterField>

          <FilterField label="Hasta">
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </FilterField>

          <FilterField label="Campaña">
            <select value={campanaFiltro} onChange={(e) => setCampanaFiltro(e.target.value)}>
              {campañasDisponibles.map((campaña) => <option key={campaña}>{campaña}</option>)}
            </select>
          </FilterField>

          <FilterField label="Estado">
            <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
              <option>TODOS</option>
              {ESTADOS.map((estado) => <option key={estado}>{estado}</option>)}
            </select>
          </FilterField>

          <FilterField label="Comercial">
            <select value={comercialFiltro} onChange={(e) => setComercialFiltro(e.target.value)}>
              {comercialesFiltroDisponibles.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterField>

          <FilterField label="Producto">
            <select value={productoFiltro} onChange={(e) => setProductoFiltro(e.target.value)}>
              {productosFiltroDisponibles.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterField>

          <FilterField label="Coordinador">
            <select value={coordinadorFiltro} onChange={(e) => setCoordinadorFiltro(e.target.value)}>
              {coordinadoresFiltroDisponibles.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterField>

          <FilterField label="Supervisor">
            <select value={supervisorFiltro} onChange={(e) => setSupervisorFiltro(e.target.value)}>
              {supervisoresFiltroDisponibles.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterField>

          <FilterField label="Buscar" wide>
            <div className="ventas-searchbox">
              <Search className="h-4 w-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cliente, documento, teléfono, campaña o comercial..."
              />
            </div>
          </FilterField>

          <div className="ventas-filter-actions">
            <button onClick={cargarVentas} disabled={loading} className="ventas-action-btn blue">
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Recargar
            </button>

            {canSeeExportButtons ? (
              <>
                <button onClick={exportarExcel} className="ventas-action-btn green">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </button>
                <button onClick={exportarPDF} className="ventas-action-btn rose">
                  <FileText className="h-4 w-4" />
                  PDF
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`ventas-workspace ${editMode ? "ventas-workspace-editing" : ""}`}>
        {!editMode ? (
        <div className="ventas-list-card">
          <div className="ventas-card-head">
            <div>
              <h3>Listado de ventas</h3>
              <p>{ventasFiltradas.length} resultado(s)</p>
            </div>
          </div>

          <div className="ventas-table-head">
            <span>Cliente</span>
            <span>Campaña</span>
            <span>Producto</span>
            <span>Estado</span>
            <span>Fecha</span>
          </div>

          <div className="ventas-list">
            {ventasFiltradas.length > 0 ? (
              ventasFiltradas.map((venta) => {
                const active = selectedVenta?.id === venta.id;
                const logo = getCampaignLogo(venta.campana);

                return (
                  <button
                    key={venta.id}
                    onClick={() => {
                      setSelectedVentaId(venta.id);
                      setEditMode(false);
                      limpiarMensajes();
                    }}
                    className={`ventas-row ${active ? "active" : ""}`}
                  >
                    <div className="ventas-client">
                      <div className="ventas-avatar">
                        {venta.campana ? (
                          <img src={logo} alt={venta.campana} onError={(e) => (e.currentTarget.style.display = "none")} />
                        ) : (
                          <span>{String(venta.cliente || "V").slice(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <strong>{venta.cliente || "-"}</strong>
                        <small>{venta.documento || "-"} · {venta.telefono || "-"}</small>
                      </div>
                    </div>

                    <span className="ventas-chip">{venta.campana || "-"}</span>
                    <span className="ventas-product">{venta.producto || "-"}</span>
                    <span className={`ventas-status ${estadoClase(venta.estado)}`}>{venta.estado || "-"}</span>
                    <span className="ventas-date">{venta.fecha || "-"}<br />{venta.hora || "-"}</span>
                  </button>
                );
              })
            ) : (
              <div className="ventas-empty">
                <p>No hay ventas para mostrar con los filtros seleccionados.</p>
              </div>
            )}
          </div>
        </div>
        ) : null}

        <div className={`ventas-detail-card ${editMode ? "ventas-detail-card-full" : ""}`}>
          <div className="ventas-card-head">
            <div>
              <h3>Detalle de venta</h3>
              <p>{selectedVenta ? "Revisión y validación backoffice" : "Selecciona una venta"}</p>
            </div>

            {selectedVenta && !editMode && canEditVentas ? (
              <div className="ventas-detail-actions">
                <button onClick={abrirEdicion} className="ventas-action-btn purple">
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button onClick={() => cambiarEstado("FINALIZADO")} disabled={loading} className="ventas-action-btn green">
                  <CheckCircle2 className="h-4 w-4" />
                  Validar
                </button>
                <button onClick={() => cambiarEstado("NO FAVORABLE")} disabled={loading} className="ventas-action-btn rose">
                  <XCircle className="h-4 w-4" />
                  No favorable
                </button>
              </div>
            ) : null}
          </div>

          {selectedVenta ? (
            <div className="ventas-detail-content">
              {isCancelledState(selectedVenta.estado) ? (
                <div className="ventas-inline-alert">
                  <div className="ventas-inline-alert-icon">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <strong>{getVentaAlertTitle(selectedVenta)}</strong>
                    <p>
                      {getVentaAlertReason(selectedVenta) ||
                        "Esta venta requiere revisión. Backoffice todavía no ha registrado el motivo."}
                    </p>
                  </div>
                </div>
              ) : null}

              {editMode && canEditVentas ? (
                <>
                  <div className="ventas-edit-banner">
                    <div>
                      <p>Edicion del Contrato</p>
                      <h4>Actualiza la venta</h4>
                      <span className="ventas-edit-dynamic-note">
                        Una información actualizada permite gestionar cada contrato de manera más eficiente.
                      </span>
                    </div>
                    <div className="ventas-edit-buttons">
                      <button onClick={guardarEdicion} disabled={loading} className="ventas-action-btn green">
                        <Save className="h-4 w-4" />
                        Guardar
                      </button>
                      <button onClick={cancelarEdicion} disabled={loading} className="ventas-action-btn slate">
                        <X className="h-4 w-4" />
                        Cancelar
                      </button>
                    </div>
                  </div>

                  <BackofficeValidationPanel
                    editForm={editForm}
                    setEditForm={setEditForm}
                    validadoresDisponibles={validadoresDisponibles}
                  />

                  <div className="ventas-edit-grid">
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
                        estadosDisponibles={estadosDisponibles}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <VentaFichaPreview venta={selectedVenta} />

                  <div className="ventas-tabs">
                    <span className="active">Resumen</span>
                    <span>Cliente</span>
                    <span>Dirección</span>
                    <span>Oferta</span>
                    <span>Cierre</span>
                    <span>Historial</span>
                  </div>

                  <div className="ventas-detail-grid">
                    <div className="ventas-sections">
                      {detailSections.map((section) => (
                        <DetailSection key={section.key} title={section.title} entries={section.entries} />
                      ))}
                    </div>

                    <div className="ventas-timeline">
                      <p className="ventas-timeline-title">Historial de estado</p>
                      {[
                        { label: selectedVenta.estado || "PENDIENTE", text: "Estado actual", tone: "green" },
                        { label: "REGISTRADO", text: selectedVenta.fechaRegistro || selectedVenta.fecha || "-", tone: "blue" },
                        { label: "EDICIÓN", text: selectedVenta.fechaEdicion || "-", tone: "purple" },
                      ].map((item) => (
                        <div key={item.label + item.text} className={`ventas-time-item ${item.tone}`}>
                          <span />
                          <div>
                            <strong>{item.label}</strong>
                            <p>{item.text}</p>
                          </div>
                        </div>
                      ))}

                      <div className="ventas-quick-state">
                        <p>Cambio rápido</p>
                        <div>
                          {estadosDisponibles.map((estado) => (
                            <button
                              key={estado}
                              onClick={() => cambiarEstado(estado)}
                              disabled={loading}
                              className={`ventas-status ${estadoClase(estado)}`}
                            >
                              {estado}
                            </button>
                          ))}
                        </div>
                      </div>

                      {canEditVentas ? (
                        <button onClick={eliminarVenta} disabled={loading} className="ventas-delete-btn">
                          <Trash2 className="h-4 w-4" />
                          Eliminar venta
                        </button>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="ventas-empty detail">
              <Eye className="h-7 w-7" />
              <p>Pulsa VER o selecciona una venta para mostrar su detalle aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniHeroKpi({ label, value }) {
  return (
    <div className="ventas-mini-kpi">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className={`ventas-metric ${tone}`}>
      <div className="ventas-metric-icon">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{hint}</span>
      </div>
    </div>
  );
}

function FilterField({ label, children, wide = false }) {
  return (
    <label className={`ventas-filter-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function VentasProStyle() {
  return (
    <style>{`
      .ventas-pro {
        min-height: calc(100vh - 80px);
        padding: 14px;
        border-radius: 24px;
        color: #e5eefc;
        font-size: 12px;
        background: linear-gradient(135deg, #08111f 0%, #0d1728 55%, #0a1020 100%);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
      }

      .ventas-pro * {
        box-sizing: border-box;
      }

      /* Rendimiento: evita repintados pesados al mover el mouse */
      .ventas-pro button,
      .ventas-pro .ventas-row,
      .ventas-pro .ventas-message-item {
        -webkit-tap-highlight-color: transparent;
      }

      .ventas-pro .ventas-row,
      .ventas-pro .ventas-message-item,
      .ventas-pro .ventas-metric {
      }

      .ventas-hero,
      .ventas-filters,
      .ventas-list-card,
      .ventas-detail-card {
        border: 1px solid rgba(148, 163, 184, .18);
        background: #111c31;
        border-radius: 22px;
        box-shadow: none;
      }

      .ventas-hero {
        min-height: 108px;
        padding: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        overflow: hidden;
        position: relative;
      }

      .ventas-hero:before {
        content: "";
        position: absolute;
        right: -90px;
        top: -90px;
        width: 340px;
        height: 200px;
        border-radius: 999px;
        background: linear-gradient(135deg, rgba(34,211,238,.22), rgba(168,85,247,.20));
        opacity: .35;
      }

      .ventas-pill {
        width: max-content;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border-radius: 999px;
        border: 1px solid rgba(103, 232, 249, .36);
        background: rgba(8, 145, 178, .20);
        color: #a5f3fc;
        padding: 7px 12px;
        font-size: 11px;
        font-weight: 950;
        letter-spacing: .12em;
      }

      .ventas-eyebrow {
        margin: 12px 0 0;
        color: #94a3b8;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .18em;
        text-transform: uppercase;
      }

      .ventas-hero h2 {
        margin: 3px 0 0;
        font-size: 24px;
        line-height: 1.05;
        font-weight: 950;
        color: #ffffff;
      }

      .ventas-subtitle {
        margin: 6px 0 0;
        color: #cbd5e1;
        font-size: 12px;
      }

      .ventas-hero-kpis,
      .ventas-mini-kpi {
        display: none !important;
      }

      .ventas-alert {
        margin-top: 10px;
        border-radius: 15px;
        padding: 10px 13px;
        font-weight: 800;
        font-size: 12px;
      }

      .ventas-alert.ok {
        background: rgba(16,185,129,.14);
        border: 1px solid rgba(16,185,129,.35);
        color: #a7f3d0;
      }

      .ventas-alert.error {
        background: rgba(244,63,94,.14);
        border: 1px solid rgba(244,63,94,.35);
        color: #fecdd3;
      }

      .ventas-metrics {
        margin-top: 0;
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 10px;
        align-items: stretch;
      }

      .ventas-metric {
        position: relative;
        overflow: hidden;
        min-height: 82px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,.10);
        padding: 13px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: none;
      }

      .ventas-metric.blue { background: #2947b8; }
      .ventas-metric.green { background: #08775c; }
      .ventas-metric.cyan { background: #0b7891; }
      .ventas-metric.amber { background: #a85a12; }
      .ventas-metric.rose { background: #9d2148; }
      .ventas-metric.purple { background: #6236b5; }

      .ventas-metric-icon {
        width: 42px;
        height: 42px;
        border-radius: 15px;
        background: rgba(255,255,255,.16);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ventas-metric p {
        margin: 0;
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .15em;
        color: #dbeafe;
        text-transform: uppercase;
      }

      .ventas-metric strong {
        display: block;
        margin-top: 3px;
        color: white;
        font-size: 22px;
        line-height: 1;
      }

      .ventas-metric span {
        display: block;
        margin-top: 4px;
        color: rgba(255,255,255,.78);
        font-size: 11px;
      }

      .ventas-filters {
        margin-top: 12px;
        padding: 14px;
      }

      .ventas-filter-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .ventas-filter-head p,
      .ventas-card-head h3,
      .ventas-timeline-title {
        margin: 0;
        color: #fff;
        font-size: 13px;
        font-weight: 950;
        letter-spacing: .04em;
        text-transform: uppercase;
      }

      .ventas-filter-head span,
      .ventas-card-head p {
        color: #94a3b8;
        font-size: 11px;
      }

      .ventas-filter-grid {
        display: grid;
        grid-template-columns: repeat(8, minmax(105px, 1fr));
        gap: 9px;
      }

      .ventas-filter-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .ventas-filter-field.wide {
        grid-column: span 3;
      }

      .ventas-filter-field span {
        color: #cbd5e1;
        font-size: 11px;
        font-weight: 850;
      }

      .ventas-filter-field input,
      .ventas-filter-field select,
      .ventas-searchbox {
        height: 38px;
        width: 100%;
        border-radius: 12px;
        border: 1px solid rgba(148,163,184,.26);
        background: rgba(15,23,42,.78);
        color: #e2e8f0;
        padding: 0 10px;
        outline: none;
        font-size: 11px;
      }

      .ventas-filter-field option {
        color: #0f172a;
      }

      .ventas-searchbox {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ventas-searchbox input {
        border: 0;
        background: transparent;
        color: #e2e8f0;
        outline: none;
        width: 100%;
      }

      .ventas-filter-actions {
        grid-column: span 3;
        display: flex;
        gap: 8px;
        align-items: flex-end;
        justify-content: flex-end;
      }

      .ventas-action-btn,
      .ventas-soft-btn {
        height: 38px;
        border: 0;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 0 13px;
        color: white;
        font-weight: 900;
        font-size: 12px;
        cursor: pointer;
        transition: none;
      }

      .ventas-action-btn:hover,
      .ventas-soft-btn:hover {
        opacity: .92;
      }

      .ventas-soft-btn { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); }
      .ventas-action-btn.blue { background: #2563eb; }
      .ventas-action-btn.green { background: #059669; }
      .ventas-action-btn.rose { background: #e11d48; }
      .ventas-action-btn.purple { background: #7c3aed; }
      .ventas-action-btn.slate { background: #475569; }

      .ventas-workspace {
        margin-top: 12px;
        display: grid;
        grid-template-columns: minmax(430px, .96fr) minmax(560px, 1.04fr);
        gap: 12px;
      }

      .ventas-list-card,
      .ventas-detail-card {
        padding: 14px;
        min-height: 520px;
      }

      .ventas-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 11px;
      }

      .ventas-table-head {
        display: grid;
        grid-template-columns: minmax(210px, 1.55fr) minmax(92px, .65fr) minmax(160px, 1.05fr) minmax(118px, .72fr) minmax(76px, .48fr);
        gap: 8px;
        border-bottom: 1px solid rgba(148,163,184,.18);
        padding: 0 10px 10px;
        color: #cbd5e1;
        font-size: 10px;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: .08em;
      }

      .ventas-list {
        max-height: 640px;
        overflow: auto;
        padding-right: 4px;
        overscroll-behavior: contain;
      }

      .ventas-list::-webkit-scrollbar {
        width: 8px;
      }

      .ventas-list::-webkit-scrollbar-track {
        background: rgba(15,23,42,.65);
        border-radius: 999px;
      }

      .ventas-list::-webkit-scrollbar-thumb {
        background: #64748b;
        border-radius: 999px;
      }

      .ventas-row {
        width: 100%;
        min-height: 68px;
        margin-top: 8px;
        display: grid;
        grid-template-columns: minmax(210px, 1.55fr) minmax(92px, .65fr) minmax(160px, 1.05fr) minmax(118px, .72fr) minmax(76px, .48fr);
        gap: 8px;
        align-items: center;
        border: 1px solid rgba(148,163,184,.14);
        background: rgba(23,34,55,.92);
        color: #e2e8f0;
        border-radius: 17px;
        padding: 9px 10px;
        text-align: left;
        cursor: pointer;
        transition: none;
      }

      .ventas-row:hover {
        border-color: rgba(148,163,184,.22);
        background: #172237;
      }

      .ventas-row.active {
        border-color: rgba(139,92,246,.78);
        background: rgba(41,51,82,.98);
        box-shadow: none;
        border-left: 3px solid #8b5cf6;
      }

      .ventas-client {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .ventas-avatar {
        width: 36px;
        height: 36px;
        border-radius: 14px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: none;
        overflow: hidden;
        box-shadow: none;
      }

      .ventas-avatar img {
        max-width: 25px;
        max-height: 25px;
        object-fit: contain;
      }

      .ventas-avatar span {
        color: #0f172a;
        font-weight: 950;
      }

      .ventas-client strong {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        color: white;
        font-size: 11.5px;
        line-height: 1.12;
      }

      .ventas-client small {
        display: block;
        color: #94a3b8;
        font-size: 10px;
        margin-top: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ventas-chip {
        width: max-content;
        max-width: 100%;
        border-radius: 999px;
        background: rgba(59,130,246,.14);
        border: 1px solid rgba(96,165,250,.32);
        color: #bfdbfe;
        padding: 5px 8px;
        font-size: 10px;
        font-weight: 950;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ventas-product {
        color: #e2e8f0;
        font-size: 10.5px;
        font-weight: 850;
        line-height: 1.22;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .ventas-date {
        color: #dbeafe;
        font-size: 11px;
        font-weight: 850;
        text-align: right;
        line-height: 1.35;
      }

      .ventas-status {
        width: max-content;
        max-width: 100%;
        border-radius: 999px !important;
        padding: 5px 8px !important;
        font-size: 10px !important;
        font-weight: 950 !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }


      .ventas-row > * {
        min-width: 0;
      }

      .ventas-client > div {
        min-width: 0;
      }

      .ventas-chip,
      .ventas-product,
      .ventas-status,
      .ventas-date {
        align-self: center;
      }

      .ventas-product {
        max-width: 100%;
        word-break: break-word;
      }

      .ventas-status {
        justify-self: center;
      }

      .ventas-date {
        justify-self: end;
      }

      .ventas-list-card {
        overflow: hidden;
      }

      .ventas-detail-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ventas-detail-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .ventas-ficha-pro {
        overflow: hidden;
        border-radius: 22px;
        border: 1px solid rgba(148,163,184,.18);
        background:
          linear-gradient(135deg, rgba(15,23,42,.92), rgba(30,41,59,.72)),
          radial-gradient(circle at 92% 10%, rgba(34,211,238,.18), transparent 30%);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
      }

      .ventas-ficha-head {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 16px;
        border-bottom: 1px solid rgba(148,163,184,.16);
        background:
          radial-gradient(circle at 0% 0%, rgba(239,68,68,.22), transparent 24%),
          linear-gradient(135deg, rgba(15,23,42,.88), rgba(17,24,39,.70));
      }

      .ventas-ficha-brand {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
      }

      .ventas-ficha-logo {
        width: 68px;
        height: 68px;
        border-radius: 22px;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 9px 10px;
        box-shadow: 0 14px 28px rgba(2,6,23,.26);
        flex: none;
      }

      .ventas-ficha-logo img {
        max-width: 52px;
        max-height: 52px;
        object-fit: contain;
      }

      .ventas-ficha-brand p {
        margin: 0;
        color: #67e8f9;
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .26em;
        text-transform: uppercase;
      }

      .ventas-ficha-brand h4 {
        margin: 5px 0 0;
        color: #fff;
        font-size: 20px;
        font-weight: 950;
        line-height: 1;
      }

      .ventas-ficha-brand span {
        display: block;
        margin-top: 5px;
        color: #cbd5e1;
        font-size: 11px;
      }

      .ventas-ficha-body {
        padding: 14px;
      }

      .ventas-ficha-summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }

      .ventas-summary-card {
        min-height: 72px;
        border-radius: 16px;
        border: 1px solid rgba(148,163,184,.16);
        background: rgba(255,255,255,.04);
        padding: 11px;
      }

      .ventas-summary-card p {
        display: flex;
        align-items: center;
        gap: 7px;
        margin: 0;
        color: #93c5fd;
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .16em;
        text-transform: uppercase;
      }

      .ventas-summary-card strong {
        display: block;
        margin-top: 7px;
        color: #fff;
        font-size: 12px;
        line-height: 1.35;
      }

      .ventas-ficha-bottom {
        margin-top: 10px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .ventas-info-block {
        border-radius: 16px;
        border: 1px solid rgba(148,163,184,.16);
        background: rgba(255,255,255,.035);
        padding: 12px;
      }

      .ventas-info-block p {
        margin: 0;
        color: #93c5fd;
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .16em;
        text-transform: uppercase;
      }

      .ventas-info-block strong {
        display: block;
        margin-top: 7px;
        color: #fff;
        font-size: 11.5px;
        line-height: 1.45;
      }

      .ventas-tabs {
        display: flex;
        gap: 16px;
        border-bottom: 1px solid rgba(148,163,184,.16);
        padding: 0 2px;
        overflow-x: auto;
      }

      .ventas-tab {
        position: relative;
        padding: 0 0 9px;
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 900;
        white-space: nowrap;
      }

      .ventas-tab.active {
        color: #c084fc;
      }

      .ventas-tab.active:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 3px;
        border-radius: 999px;
        background: linear-gradient(90deg,#8b5cf6,#22d3ee);
      }

      .ventas-detail-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 260px;
        gap: 12px;
      }

      .ventas-section-card,
      .crm-panel-soft {
        border-radius: 18px !important;
        border: 1px solid rgba(148,163,184,.18) !important;
        background: rgba(15,23,42,.64) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.05) !important;
        color: #e2e8f0 !important;
      }

      .ventas-section-card {
        padding: 13px;
      }

      .ventas-section-title,
      .crm-label {
        color: #93c5fd !important;
        font-size: 10px !important;
        font-weight: 950 !important;
        letter-spacing: .18em !important;
        text-transform: uppercase !important;
      }

      .ventas-section-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 9px;
      }

      .ventas-section-item,
      .crm-panel-soft .rounded-xl {
        border-radius: 14px !important;
        border: 1px solid rgba(148,163,184,.18) !important;
        background: rgba(255,255,255,.04) !important;
        color: #e2e8f0 !important;
        padding: 10px !important;
      }

      .ventas-section-item strong,
      .crm-panel-soft p {
        color: #fff !important;
      }

      .ventas-timeline {
        border-radius: 18px;
        border: 1px solid rgba(148,163,184,.18);
        background: rgba(15,23,42,.58);
        padding: 14px;
      }

      .ventas-timeline-list {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        position: relative;
      }

      .ventas-timeline-list:before {
        content: "";
        position: absolute;
        left: 11px;
        top: 5px;
        bottom: 5px;
        width: 2px;
        background: linear-gradient(180deg,#22c55e,#3b82f6,#f59e0b,#8b5cf6);
      }

      .ventas-timeline-item {
        display: grid;
        grid-template-columns: 24px 1fr;
        gap: 10px;
        position: relative;
      }

      .ventas-timeline-dot {
        width: 24px;
        height: 24px;
        border-radius: 999px;
        border: 4px solid rgba(15,23,42,.92);
        background: #22c55e;
        z-index: 2;
      }

      .ventas-timeline-item p {
        margin: 0;
        color: #fff;
        font-size: 12px;
        font-weight: 950;
      }

      .ventas-timeline-item span {
        color: #94a3b8;
        font-size: 11px;
      }


      .ventas-workspace-editing {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      .ventas-detail-card-full {
        width: 100%;
        min-width: 0;
      }

      .ventas-detail-card-full .ventas-detail-content {
        width: 100%;
      }

      .ventas-detail-card-full .ventas-edit-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .ventas-activation-summary {
        margin: 0 20px 20px;
        border: 1px solid rgba(34,197,94,.20);
        border-radius: 18px;
        background:
          linear-gradient(135deg, rgba(34,197,94,.08), rgba(14,165,233,.05)),
          rgba(255,255,255,.04);
        padding: 14px;
      }

      .ventas-activation-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .ventas-activation-title svg {
        color: #22c55e;
        flex: none;
      }

      .ventas-activation-title p {
        margin: 0;
        color: inherit;
        font-size: 11px;
        font-weight: 950;
        letter-spacing: .10em;
      }

      .ventas-activation-title span {
        display: block;
        margin-top: 2px;
        color: #64748b;
        font-size: 10px;
        font-weight: 700;
      }

      .ventas-activation-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .ventas-activation-card {
        display: flex;
        align-items: center;
        gap: 11px;
        min-height: 66px;
        border: 1px solid rgba(148,163,184,.22);
        border-radius: 14px;
        background: rgba(255,255,255,.72);
        padding: 12px 14px;
      }

      .ventas-activation-card.fibra svg {
        color: #0284c7;
      }

      .ventas-activation-card.movil svg {
        color: #059669;
      }

      .ventas-activation-card span {
        display: block;
        color: #64748b;
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .04em;
      }

      .ventas-activation-card strong {
        display: block;
        margin-top: 3px;
        color: #0f172a;
        font-size: 14px;
        font-weight: 950;
      }

      [data-crm-theme="dark"] .ventas-activation-card,
      [data-crm-theme="night"] .ventas-activation-card,
      [data-crm-theme="neon"] .ventas-activation-card {
        background: rgba(15,23,42,.72);
      }

      [data-crm-theme="dark"] .ventas-activation-card strong,
      [data-crm-theme="night"] .ventas-activation-card strong,
      [data-crm-theme="neon"] .ventas-activation-card strong {
        color: #f8fafc;
      }

      [data-crm-theme="dark"] .ventas-activation-title span,
      [data-crm-theme="night"] .ventas-activation-title span,
      [data-crm-theme="neon"] .ventas-activation-title span {
        color: #94a3b8;
      }

      @media (max-width: 900px) {
        .ventas-activation-grid,
        .ventas-detail-card-full .ventas-edit-grid {
          grid-template-columns: 1fr;
        }
      }

      .ventas-edit-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border-radius: 20px;
        border: 1px solid rgba(139,92,246,.38);
        background:
          radial-gradient(circle at 0% 0%, rgba(139,92,246,.28), transparent 32%),
          rgba(15,23,42,.72);
        padding: 14px;
      }

      .ventas-edit-banner p {
        margin: 0;
        color: #c4b5fd;
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .18em;
        text-transform: uppercase;
      }

      .ventas-edit-banner h4 {
        margin: 5px 0 0;
        color: white;
        font-size: 16px;
        font-weight: 950;
      }

      .ventas-edit-dynamic-note {
        display: block;
        margin-top: 5px;
        color: #cbd5e1;
        font-size: 10px;
        font-weight: 700;
      }


      .ventas-edit-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .ventas-edit-grid {
        display: grid;
        gap: 10px;
      }

      .ventas-edit-grid input,
      .ventas-edit-grid select,
      .ventas-edit-grid textarea,
      .crm-input {
        background: rgba(15,23,42,.72) !important;
        border: 1px solid rgba(148,163,184,.28) !important;
        color: #ffffff !important;
        border-radius: 13px !important;
        font-size: 12px !important;
      }

      .ventas-edit-grid option {
        color: #0f172a;
      }

      .ventas-empty {
        border-radius: 18px;
        border: 1px dashed rgba(148,163,184,.22);
        padding: 24px;
        color: #94a3b8;
        text-align: center;
        background: rgba(15,23,42,.38);
      }

      .ventas-empty.detail {
        min-height: 360px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }


      .bo-validation-panel {
        border-radius: 22px;
        border: 1px solid rgba(148,163,184,.18);
        background:
          radial-gradient(circle at 0% 0%, rgba(34,211,238,.16), transparent 28%),
          radial-gradient(circle at 100% 20%, rgba(139,92,246,.18), transparent 30%),
          rgba(15,23,42,.68);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 16px 34px rgba(2,6,23,.22);
        padding: 14px;
      }

      .bo-validation-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 12px;
      }

      .bo-validation-header p {
        margin: 0;
        color: #67e8f9;
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .22em;
        text-transform: uppercase;
      }

      .bo-validation-header h4 {
        margin: 4px 0 0;
        color: white;
        font-size: 18px;
        font-weight: 950;
      }

      .bo-validation-header span {
        display: block;
        margin-top: 4px;
        color: #94a3b8;
        font-size: 11px;
      }

      .bo-validation-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        justify-content: flex-end;
      }

      .bo-validation-badges span {
        margin: 0;
        border-radius: 999px;
        border: 1px solid rgba(103,232,249,.22);
        background: rgba(14,165,233,.10);
        color: #bae6fd;
        padding: 6px 9px;
        font-size: 10px;
        font-weight: 900;
      }

      .bo-section {
        margin-top: 10px;
        overflow: hidden;
        border-radius: 18px;
        border: 1px solid rgba(148,163,184,.18);
        background: rgba(2,6,23,.28);
      }

      .bo-section-title {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 10px 12px;
        color: #fff;
        font-size: 12px;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: .10em;
      }

      .bo-section-title span {
        display: inline-flex;
        width: 24px;
        height: 24px;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: rgba(255,255,255,.14);
        color: #fff;
        font-size: 10px;
      }

      .bo-section.blue .bo-section-title {
        background: linear-gradient(90deg, rgba(14,116,144,.82), rgba(30,64,175,.55));
      }

      .bo-section.slate .bo-section-title {
        background: linear-gradient(90deg, rgba(71,85,105,.86), rgba(15,23,42,.58));
      }

      .bo-section.purple .bo-section-title {
        background: linear-gradient(90deg, rgba(88,28,135,.88), rgba(76,29,149,.58));
      }

      .bo-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        padding: 12px;
      }

      .bo-grid.compact {
        grid-template-columns: 220px 220px 1fr;
      }

      .bo-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }

      .bo-field.bo-wide {
        grid-column: span 2;
      }

      .bo-field label {
        color: #cbd5e1;
        font-size: 11px;
        font-weight: 900;
      }

      .bo-field input,
      .bo-field select,
      .bo-field textarea {
        width: 100%;
        min-height: 39px;
        border-radius: 13px;
        border: 1px solid rgba(148,163,184,.24);
        background: rgba(15,23,42,.74);
        color: #ffffff;
        outline: none;
        padding: 9px 10px;
        font-size: 12px;
      }

      .bo-field textarea {
        min-height: 74px;
        resize: vertical;
      }

      .bo-field option {
        color: #0f172a;
      }

      .bo-date-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: 6px;
      }

      .bo-date-row button {
        border: 1px solid rgba(34,211,238,.28);
        background: rgba(8,145,178,.20);
        color: #a5f3fc;
        border-radius: 12px;
        padding: 0 9px;
        font-size: 11px;
        font-weight: 900;
      }

      /* Fechas de activación: siempre oscuras, profesionales y legibles */
      .ventas-pro .bo-date-row input[type="date"] {
        min-height: 42px !important;
        background: linear-gradient(180deg,#111827,#0f172a) !important;
        border: 1px solid #334155 !important;
        color: #f8fafc !important;
        color-scheme: dark;
        font-weight: 800;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
      }

      .ventas-pro .bo-date-row input[type="date"]:focus {
        border-color: #22d3ee !important;
        box-shadow: 0 0 0 3px rgba(34,211,238,.12) !important;
      }

      .ventas-pro .bo-date-row button {
        min-height: 42px;
        background: linear-gradient(180deg,#172554,#0f172a) !important;
        border-color: #334155 !important;
        color: #e0f2fe !important;
        transition: transform .15s ease, border-color .15s ease, background .15s ease;
      }

      .ventas-pro .bo-date-row button:hover {
        transform: translateY(-1px);
        border-color: #22d3ee !important;
        background: linear-gradient(180deg,#164e63,#0f172a) !important;
      }

      /* El encabezado oscuro de la ficha conserva texto blanco en todos los temas */
      .ventas-pro .ventas-preview-hero,
      .ventas-pro .ventas-preview-hero p,
      .ventas-pro .ventas-preview-hero h3,
      .ventas-pro .ventas-preview-hero span,
      [data-crm-theme="light"] .ventas-pro .ventas-preview-hero,
      [data-crm-theme="light"] .ventas-pro .ventas-preview-hero p,
      [data-crm-theme="light"] .ventas-pro .ventas-preview-hero h3,
      [data-crm-theme="light"] .ventas-pro .ventas-preview-hero span,
      [data-crm-theme="silver"] .ventas-pro .ventas-preview-hero,
      [data-crm-theme="silver"] .ventas-pro .ventas-preview-hero p,
      [data-crm-theme="silver"] .ventas-pro .ventas-preview-hero h3,
      [data-crm-theme="silver"] .ventas-pro .ventas-preview-hero span {
        color: #f8fafc !important;
      }

      .ventas-pro .ventas-preview-hero > div > div > div > p:first-child {
        color: #a5f3fc !important;
      }

      /* Tipografía del panel Backoffice por tema */
      .ventas-pro .bo-validation-panel,
      .ventas-pro .bo-section,
      .ventas-pro .bo-field {
        color: inherit;
      }

      [data-crm-theme="light"] .ventas-pro .bo-validation-header p,
      [data-crm-theme="silver"] .ventas-pro .bo-validation-header p {
        color: #0891b2 !important;
      }

      [data-crm-theme="light"] .ventas-pro .bo-section-title,
      [data-crm-theme="silver"] .ventas-pro .bo-section-title {
        color: #ffffff !important;
      }

      [data-crm-theme="light"] .ventas-pro .bo-section-title span,
      [data-crm-theme="silver"] .ventas-pro .bo-section-title span {
        color: #ffffff !important;
      }

      [data-crm-theme="dark"] .ventas-pro .bo-field label,
      [data-crm-theme="night"] .ventas-pro .bo-field label,
      [data-crm-theme="neon"] .ventas-pro .bo-field label {
        color: #e2e8f0 !important;
      }

      [data-crm-theme="dark"] .ventas-pro .bo-validation-header h4,
      [data-crm-theme="night"] .ventas-pro .bo-validation-header h4,
      [data-crm-theme="neon"] .ventas-pro .bo-validation-header h4 {
        color: #ffffff !important;
      }

      [data-crm-theme="dark"] .ventas-pro .bo-validation-header span,
      [data-crm-theme="night"] .ventas-pro .bo-validation-header span,
      [data-crm-theme="neon"] .ventas-pro .bo-validation-header span {
        color: #94a3b8 !important;
      }

      /* Tarjetas de fechas visibles para Comercial/Supervisor según tema */
      [data-crm-theme="light"] .ventas-pro .ventas-activation-summary,
      [data-crm-theme="silver"] .ventas-pro .ventas-activation-summary {
        background: linear-gradient(135deg,#f0fdf4,#eff6ff) !important;
        border-color: #bfdbfe !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-activation-card,
      [data-crm-theme="silver"] .ventas-pro .ventas-activation-card {
        background: #ffffff !important;
        border-color: #cbd5e1 !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-activation-title p,
      [data-crm-theme="silver"] .ventas-pro .ventas-activation-title p,
      [data-crm-theme="light"] .ventas-pro .ventas-activation-card strong,
      [data-crm-theme="silver"] .ventas-pro .ventas-activation-card strong {
        color: #0f172a !important;
      }

      [data-crm-theme="dark"] .ventas-pro .ventas-activation-title p,
      [data-crm-theme="night"] .ventas-pro .ventas-activation-title p,
      [data-crm-theme="neon"] .ventas-pro .ventas-activation-title p,
      [data-crm-theme="dark"] .ventas-pro .ventas-activation-card strong,
      [data-crm-theme="night"] .ventas-pro .ventas-activation-card strong,
      [data-crm-theme="neon"] .ventas-pro .ventas-activation-card strong {
        color: #f8fafc !important;
      }

      /* Mejora de contraste general en modo oscuro */
      [data-crm-theme="dark"] .ventas-pro .ventas-card-head h3,
      [data-crm-theme="night"] .ventas-pro .ventas-card-head h3,
      [data-crm-theme="neon"] .ventas-pro .ventas-card-head h3,
      [data-crm-theme="dark"] .ventas-pro .ventas-filter-head p,
      [data-crm-theme="night"] .ventas-pro .ventas-filter-head p,
      [data-crm-theme="neon"] .ventas-pro .ventas-filter-head p {
        color: #f8fafc !important;
      }

      [data-crm-theme="dark"] .ventas-pro .ventas-card-head p,
      [data-crm-theme="night"] .ventas-pro .ventas-card-head p,
      [data-crm-theme="neon"] .ventas-pro .ventas-card-head p,
      [data-crm-theme="dark"] .ventas-pro .ventas-filter-head span,
      [data-crm-theme="night"] .ventas-pro .ventas-filter-head span,
      [data-crm-theme="neon"] .ventas-pro .ventas-filter-head span {
        color: #94a3b8 !important;
      }




      [data-crm-theme="light"] .ventas-pro .ventas-section-card,
      [data-crm-theme="light"] .ventas-pro .crm-panel-soft,
      [data-crm-theme="light"] .ventas-pro .ventas-timeline,
      [data-crm-theme="light"] .ventas-pro .bo-validation-panel,
      [data-crm-theme="light"] .ventas-pro .bo-section,
      [data-crm-theme="silver"] .ventas-pro .ventas-section-card,
      [data-crm-theme="silver"] .ventas-pro .crm-panel-soft,
      [data-crm-theme="silver"] .ventas-pro .ventas-timeline,
      [data-crm-theme="silver"] .ventas-pro .bo-validation-panel,
      [data-crm-theme="silver"] .ventas-pro .bo-section {
        background: rgba(255,255,255,.94) !important;
        border-color: rgba(148,163,184,.38) !important;
        color: #0f172a !important;
        box-shadow: 0 8px 22px rgba(15,23,42,.06) !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-section-item,
      [data-crm-theme="light"] .ventas-pro .crm-panel-soft .rounded-xl,
      [data-crm-theme="light"] .ventas-pro .bo-field input,
      [data-crm-theme="light"] .ventas-pro .bo-field select,
      [data-crm-theme="light"] .ventas-pro .bo-field textarea,
      [data-crm-theme="light"] .ventas-pro .crm-input,
      [data-crm-theme="silver"] .ventas-pro .ventas-section-item,
      [data-crm-theme="silver"] .ventas-pro .crm-panel-soft .rounded-xl,
      [data-crm-theme="silver"] .ventas-pro .bo-field input,
      [data-crm-theme="silver"] .ventas-pro .bo-field select,
      [data-crm-theme="silver"] .ventas-pro .bo-field textarea,
      [data-crm-theme="silver"] .ventas-pro .crm-input {
        background: #ffffff !important;
        border-color: #cbd5e1 !important;
        color: #0f172a !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-section-item strong,
      [data-crm-theme="light"] .ventas-pro .crm-panel-soft p,
      [data-crm-theme="light"] .ventas-pro .bo-validation-header h4,
      [data-crm-theme="light"] .ventas-pro .bo-field label,
      [data-crm-theme="silver"] .ventas-pro .ventas-section-item strong,
      [data-crm-theme="silver"] .ventas-pro .crm-panel-soft p,
      [data-crm-theme="silver"] .ventas-pro .bo-validation-header h4,
      [data-crm-theme="silver"] .ventas-pro .bo-field label { color: #0f172a !important; }

      [data-crm-theme="light"] .ventas-pro .crm-label,
      [data-crm-theme="light"] .ventas-pro .ventas-section-title,
      [data-crm-theme="silver"] .ventas-pro .crm-label,
      [data-crm-theme="silver"] .ventas-pro .ventas-section-title { color: #0369a1 !important; }

      [data-crm-theme="light"] .ventas-pro .bo-validation-header span,
      [data-crm-theme="silver"] .ventas-pro .bo-validation-header span { color: #64748b !important; }

      [data-crm-theme="light"] .ventas-pro select option,
      [data-crm-theme="silver"] .ventas-pro select option { color: #0f172a; background: #fff; }

      .ventas-message-center {
        margin-top: 12px;
        overflow: hidden;
        border: 1px solid rgba(148,163,184,.18);
        border-radius: 18px;
        background: rgba(15,23,42,.70);
        box-shadow: 0 4px 14px rgba(2,6,23,.12);
      }

      .ventas-message-head {
        min-height: 58px;
        padding: 11px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border-bottom: 1px solid rgba(148,163,184,.14);
      }

      .ventas-message-toggle {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border: 0;
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
        padding: 0;
      }

      .ventas-message-collapse-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #cbd5e1;
        font-size: 10px;
        font-weight: 900;
        white-space: nowrap;
      }

      .ventas-message-collapse-label svg {
        transition: none !important;
      }

      .ventas-chevron-open {
        transform: rotate(180deg);
      }

      .ventas-message-title {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .ventas-message-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        color: #fef3c7;
        background: linear-gradient(135deg,#b45309,#be123c);
      }

      .ventas-message-title p {
        margin: 0;
        color: #fff;
        font-weight: 950;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: .08em;
      }

      .ventas-message-title span {
        display: block;
        margin-top: 2px;
        color: #94a3b8;
        font-size: 10px;
      }

      .ventas-message-readall {
        min-height: 34px;
        border: 1px solid rgba(148,163,184,.18);
        border-radius: 11px;
        padding: 0 11px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,255,255,.06);
        color: #e2e8f0;
        font-size: 10px;
        font-weight: 900;
        cursor: pointer;
      }

      .ventas-message-list {
        max-height: 230px;
        overflow-y: auto;
        display: grid;
      }

      .ventas-message-item {
        width: 100%;
        min-height: 72px;
        padding: 11px 14px;
        display: grid;
        grid-template-columns: 34px minmax(0,1fr) auto;
        gap: 10px;
        align-items: start;
        border: 0;
        border-bottom: 1px solid rgba(148,163,184,.10);
        background: transparent;
        color: #e5eefc;
        text-align: left;
        cursor: pointer;
      }

      .ventas-message-item:last-child { border-bottom: 0; }

      .ventas-message-item.unread {
        background: linear-gradient(90deg,rgba(190,18,60,.12),rgba(124,58,237,.07));
      }

      .ventas-message-item.read { opacity: .72; }

      .ventas-message-dot {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 11px;
        color: #fecdd3;
        background: rgba(190,18,60,.18);
      }

      .ventas-message-copy > div {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .ventas-message-copy strong {
        color: #fff;
        font-size: 11px;
      }

      .ventas-message-copy > div span {
        border-radius: 999px;
        padding: 3px 6px;
        background: #e11d48;
        color: #fff;
        font-size: 8px;
        font-weight: 950;
      }

      .ventas-message-copy p {
        margin: 3px 0 0;
        color: #cbd5e1;
        font-size: 10px;
        font-weight: 800;
      }

      .ventas-message-copy small {
        display: block;
        margin-top: 4px;
        color: #94a3b8;
        font-size: 10px;
        line-height: 1.4;
      }

      .ventas-message-date {
        color: #94a3b8;
        font-size: 9px;
        text-align: right;
        white-space: nowrap;
      }

      .ventas-inline-alert {
        margin-bottom: 12px;
        padding: 12px 14px;
        display: flex;
        gap: 10px;
        align-items: flex-start;
        border: 1px solid rgba(244,63,94,.30);
        border-radius: 15px;
        background: linear-gradient(135deg,rgba(190,18,60,.14),rgba(124,58,237,.07));
      }

      .ventas-inline-alert-icon {
        width: 34px;
        height: 34px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 11px;
        background: rgba(244,63,94,.16);
        color: #fda4af;
      }

      .ventas-inline-alert strong {
        color: #fff;
        font-size: 12px;
      }

      .ventas-inline-alert p {
        margin: 4px 0 0;
        color: #cbd5e1;
        font-size: 11px;
        line-height: 1.5;
      }

      .bo-alert-reason {
        padding: 11px;
        border-radius: 14px;
        border: 1px solid rgba(244,63,94,.22);
        background: rgba(244,63,94,.05);
      }

      .bo-alert-reason small {
        display: block;
        margin-top: 5px;
        color: #94a3b8;
        font-size: 9px;
      }

      .ventas-mobile-preview {
        margin-top: 5px;
      }

      .ventas-mobile-numbers {
        margin-top: 4px;
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .ventas-mobile-numbers span {
        border-radius: 999px;
        border: 1px solid rgba(16,185,129,.22);
        background: rgba(16,185,129,.10);
        color: #6ee7b7;
        padding: 3px 7px;
        font-size: 9px;
        font-weight: 800;
      }

      /* Compatibilidad visual con los cuatro temas del CRM */
      [data-crm-theme="light"] .ventas-pro {
        color: #0f172a;
        background: #f3f6fa;
        box-shadow: inset 0 0 0 1px #dbe3ec;
      }

      [data-crm-theme="silver"] .ventas-pro {
        color: #172033;
        background: #e7ecf2;
        box-shadow: inset 0 0 0 1px #cbd5e1;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-filters,
      [data-crm-theme="light"] .ventas-pro .ventas-list-card,
      [data-crm-theme="light"] .ventas-pro .ventas-detail-card,
      [data-crm-theme="light"] .ventas-pro .ventas-message-center,
      [data-crm-theme="silver"] .ventas-pro .ventas-filters,
      [data-crm-theme="silver"] .ventas-pro .ventas-list-card,
      [data-crm-theme="silver"] .ventas-pro .ventas-detail-card,
      [data-crm-theme="silver"] .ventas-pro .ventas-message-center {
        background: rgba(255,255,255,.94);
        border-color: #d4dce6;
        box-shadow: none;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-card-head h3,
      [data-crm-theme="light"] .ventas-pro .ventas-filter-head p,
      [data-crm-theme="light"] .ventas-pro .ventas-message-title p,
      [data-crm-theme="light"] .ventas-pro .ventas-message-copy strong,
      [data-crm-theme="light"] .ventas-pro .ventas-inline-alert strong,
      [data-crm-theme="silver"] .ventas-pro .ventas-card-head h3,
      [data-crm-theme="silver"] .ventas-pro .ventas-filter-head p,
      [data-crm-theme="silver"] .ventas-pro .ventas-message-title p,
      [data-crm-theme="silver"] .ventas-pro .ventas-message-copy strong,
      [data-crm-theme="silver"] .ventas-pro .ventas-inline-alert strong {
        color: #0f172a !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-card-head p,
      [data-crm-theme="light"] .ventas-pro .ventas-filter-head span,
      [data-crm-theme="light"] .ventas-pro .ventas-message-title span,
      [data-crm-theme="light"] .ventas-pro .ventas-message-copy p,
      [data-crm-theme="light"] .ventas-pro .ventas-message-copy small,
      [data-crm-theme="light"] .ventas-pro .ventas-message-date,
      [data-crm-theme="light"] .ventas-pro .ventas-inline-alert p,
      [data-crm-theme="silver"] .ventas-pro .ventas-card-head p,
      [data-crm-theme="silver"] .ventas-pro .ventas-filter-head span,
      [data-crm-theme="silver"] .ventas-pro .ventas-message-title span,
      [data-crm-theme="silver"] .ventas-pro .ventas-message-copy p,
      [data-crm-theme="silver"] .ventas-pro .ventas-message-copy small,
      [data-crm-theme="silver"] .ventas-pro .ventas-message-date,
      [data-crm-theme="silver"] .ventas-pro .ventas-inline-alert p {
        color: #64748b !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-message-item,
      [data-crm-theme="silver"] .ventas-pro .ventas-message-item {
        color: #0f172a;
        border-color: #e2e8f0;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-message-item.unread,
      [data-crm-theme="silver"] .ventas-pro .ventas-message-item.unread {
        background: linear-gradient(90deg,#fff1f2,#f5f3ff);
      }

      [data-crm-theme="light"] .ventas-pro .ventas-inline-alert,
      [data-crm-theme="silver"] .ventas-pro .ventas-inline-alert {
        background: #fff1f2;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-mobile-numbers span,
      [data-crm-theme="silver"] .ventas-pro .ventas-mobile-numbers span {
        color: #047857;
        background: #ecfdf5;
        border-color: #a7f3d0;
      }


      [data-crm-theme="light"] .ventas-pro .ventas-row,
      [data-crm-theme="silver"] .ventas-pro .ventas-row {
        background: #ffffff;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-row:hover,
      [data-crm-theme="silver"] .ventas-pro .ventas-row:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-row.active,
      [data-crm-theme="silver"] .ventas-pro .ventas-row.active {
        background: #eef2ff;
        border-color: #6366f1;
        box-shadow: none;
        border-left: 3px solid #6366f1;
      }

      /* =====================================================
         SELECCIONADOS: contraste fuerte por tema
         ===================================================== */

      .ventas-pro .ventas-row.active {
        position: relative;
        isolation: isolate;
        border-width: 1px;
        border-left-width: 4px;
      }

      .ventas-pro .ventas-row.active::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        pointer-events: none;
      }

      /* Claro */
      [data-crm-theme="light"] .ventas-pro .ventas-row.active {
        background: linear-gradient(135deg,#eef2ff,#f8fafc) !important;
        border-color: #4f46e5 !important;
        border-left-color: #4f46e5 !important;
        box-shadow: inset 0 0 0 1px rgba(79,70,229,.08) !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-row.active strong,
      [data-crm-theme="light"] .ventas-pro .ventas-row.active .ventas-product,
      [data-crm-theme="light"] .ventas-pro .ventas-row.active .ventas-date,
      [data-crm-theme="light"] .ventas-pro .ventas-row.active small {
        color: #0f172a !important;
      }

      /* Gris / silver */
      [data-crm-theme="silver"] .ventas-pro .ventas-row.active {
        background: linear-gradient(135deg,#e2e8f0,#f8fafc) !important;
        border-color: #475569 !important;
        border-left-color: #334155 !important;
        box-shadow: inset 0 0 0 1px rgba(51,65,85,.08) !important;
      }

      [data-crm-theme="silver"] .ventas-pro .ventas-row.active strong,
      [data-crm-theme="silver"] .ventas-pro .ventas-row.active .ventas-product,
      [data-crm-theme="silver"] .ventas-pro .ventas-row.active .ventas-date,
      [data-crm-theme="silver"] .ventas-pro .ventas-row.active small {
        color: #0f172a !important;
      }

      /* Dark / Night */
      [data-crm-theme="dark"] .ventas-pro .ventas-row.active,
      [data-crm-theme="night"] .ventas-pro .ventas-row.active {
        background: linear-gradient(135deg,#1e293b,#172033) !important;
        border-color: #38bdf8 !important;
        border-left-color: #22d3ee !important;
        box-shadow: inset 0 0 0 1px rgba(56,189,248,.10) !important;
      }

      [data-crm-theme="dark"] .ventas-pro .ventas-row.active strong,
      [data-crm-theme="dark"] .ventas-pro .ventas-row.active span,
      [data-crm-theme="dark"] .ventas-pro .ventas-row.active small,
      [data-crm-theme="night"] .ventas-pro .ventas-row.active strong,
      [data-crm-theme="night"] .ventas-pro .ventas-row.active span,
      [data-crm-theme="night"] .ventas-pro .ventas-row.active small {
        color: #f8fafc !important;
      }

      /* Neon */
      [data-crm-theme="neon"] .ventas-pro .ventas-row.active {
        background: linear-gradient(135deg,#15172d,#21143d) !important;
        border-color: #a78bfa !important;
        border-left-color: #22d3ee !important;
        box-shadow:
          inset 0 0 0 1px rgba(167,139,250,.12),
          0 0 18px rgba(34,211,238,.05) !important;
      }

      [data-crm-theme="neon"] .ventas-pro .ventas-row.active strong,
      [data-crm-theme="neon"] .ventas-pro .ventas-row.active span,
      [data-crm-theme="neon"] .ventas-pro .ventas-row.active small {
        color: #ffffff !important;
      }

      /* Chips dentro de una venta seleccionada conservan sus propios colores */
      .ventas-pro .ventas-row.active .ventas-chip,
      .ventas-pro .ventas-row.active .ventas-status {
        color: inherit;
      }

      /* Cabecera del detalle seleccionado: siempre legible */
      .ventas-pro .ventas-preview-hero {
        background:
          radial-gradient(circle at 92% 18%, rgba(34,211,238,.18), transparent 28%),
          linear-gradient(135deg,#07111f,#0f1b34 58%,#10223c) !important;
      }

      .ventas-pro .ventas-preview-identity {
        min-width: 0;
      }

      .ventas-pro .ventas-preview-kicker {
        margin: 0 !important;
        color: #67e8f9 !important;
        font-size: 10px !important;
        font-weight: 950 !important;
        letter-spacing: .18em !important;
        text-transform: uppercase;
      }

      .ventas-pro .ventas-preview-campaign {
        margin: 4px 0 0 !important;
        color: #ffffff !important;
        font-size: 20px !important;
        font-weight: 950 !important;
        line-height: 1.05;
        text-shadow: 0 1px 2px rgba(0,0,0,.28);
      }

      .ventas-pro .ventas-preview-client {
        margin: 4px 0 0 !important;
        color: #cbd5e1 !important;
        font-size: 11px !important;
        font-weight: 800 !important;
      }

      /* Estado de la ficha: texto siempre visible */
      .ventas-pro .ventas-preview-hero .ventas-status,
      .ventas-pro .ventas-preview-hero [class*="status"] {
        opacity: 1 !important;
        text-shadow: none !important;
      }

      [data-crm-theme="night"] .ventas-pro,
      [data-crm-theme="dark"] .ventas-pro {
        color: #e5eefc;
      }

      [data-crm-theme="neon"] .ventas-pro {
        background: linear-gradient(135deg,#070b18,#101329 55%,#160c24);
      }



      .ventas-pro,
      .ventas-pro input,
      .ventas-pro select,
      .ventas-pro textarea,
      .ventas-pro button {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }

      .ventas-pro .ventas-filter-label,
      .ventas-pro .ventas-table-head,
      .ventas-pro .crm-label,
      .ventas-pro .ventas-card-head p,
      .ventas-pro .ventas-filter-head span,
      .ventas-pro .ventas-message-copy small,
      .ventas-pro .ventas-message-date {
        opacity: 1 !important;
      }

      .ventas-pro .ventas-table-head {
        color: #cbd5e1 !important;
        font-weight: 900 !important;
      }

      .ventas-pro .ventas-row {
        color: #f1f5f9 !important;
      }

      .ventas-pro .ventas-row .ventas-row-main,
      .ventas-pro .ventas-row .ventas-row-sub,
      .ventas-pro .ventas-row strong,
      .ventas-pro .ventas-row span {
        text-shadow: none !important;
      }

      [data-crm-theme="light"] .ventas-pro,
      [data-crm-theme="light"] .ventas-pro input,
      [data-crm-theme="light"] .ventas-pro select,
      [data-crm-theme="light"] .ventas-pro textarea,
      [data-crm-theme="silver"] .ventas-pro,
      [data-crm-theme="silver"] .ventas-pro input,
      [data-crm-theme="silver"] .ventas-pro select,
      [data-crm-theme="silver"] .ventas-pro textarea {
        color: #0f172a !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-table-head,
      [data-crm-theme="silver"] .ventas-pro .ventas-table-head {
        color: #475569 !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-row,
      [data-crm-theme="silver"] .ventas-pro .ventas-row {
        color: #0f172a !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-row p,
      [data-crm-theme="light"] .ventas-pro .ventas-row span,
      [data-crm-theme="light"] .ventas-pro .ventas-row strong,
      [data-crm-theme="silver"] .ventas-pro .ventas-row p,
      [data-crm-theme="silver"] .ventas-pro .ventas-row span,
      [data-crm-theme="silver"] .ventas-pro .ventas-row strong {
        color: #0f172a;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-message-collapse-label,
      [data-crm-theme="silver"] .ventas-pro .ventas-message-collapse-label {
        color: #334155;
      }


      .ventas-pro .ventas-row:hover,
      .ventas-pro .ventas-message-item:hover,
      .ventas-pro button:hover {
        transform: none !important;
        box-shadow: none !important;
      }

      .ventas-pro .ventas-row:hover {
        background: inherit !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-row:hover,
      [data-crm-theme="silver"] .ventas-pro .ventas-row:hover {
        background: #ffffff !important;
      }

      .ventas-pro .ventas-message-center {
        contain: layout style;
      }

      /* ULTRA PERFORMANCE: Ventas no usa animaciones, filtros ni sombras dinámicas.
         Evita que Chromium repinte cientos de nodos al mover el mouse. */
      .ventas-pro,
      .ventas-pro *,
      .ventas-pro *::before,
      .ventas-pro *::after {
        animation: none !important;
        transition: none !important;
        filter: none !important;
        backdrop-filter: none !important;
      }

      .ventas-pro button:hover,
      .ventas-pro .ventas-row:hover,
      .ventas-pro .ventas-message-item:hover {
        transform: none !important;
        filter: none !important;
      }

      .ventas-pro .ventas-list-card,
      .ventas-pro .ventas-detail-card,
      .ventas-pro .ventas-filters,
      .ventas-pro .ventas-message-center,
      .ventas-pro .crm-panel-soft,
      .ventas-pro .bo-validation-panel,
      .ventas-pro .bo-section {
        box-shadow: none !important;
      }

      .ventas-pro .ventas-row,
      .ventas-pro .ventas-message-item {
        will-change: auto !important;
      }


      .ventas-message-center:has(.ventas-message-toggle[aria-expanded="false"]) {
        min-height: 58px;
      }

      @media (max-width: 1500px) {
        .ventas-metrics {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width: 1280px) {
        .ventas-hero,
        .ventas-filter-head {
          flex-direction: column;
          align-items: flex-start;
        }

        .ventas-workspace {
          width: 100%;
          grid-template-columns: 1fr;
        }

        .ventas-metrics {
          width: 100%;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .ventas-filter-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .ventas-filter-field.wide,
        .ventas-filter-actions {
          grid-column: span 2;
        }

        .ventas-table-head,
        .ventas-row {
          grid-template-columns: 1fr;
        }

        .ventas-message-item {
          grid-template-columns: 32px minmax(0,1fr);
        }

        .ventas-message-date {
          grid-column: 2;
          text-align: left;
        }

        .ventas-detail-grid,
        .ventas-ficha-summary,
        .ventas-ficha-bottom {
          grid-template-columns: 1fr;
        }
      }

      /* =========================================================
         CONTRASTE FINAL DE VENTA SELECCIONADA
         ========================================================= */

      .ventas-pro .ventas-selected-identity {
        min-width: 0;
        position: relative;
        z-index: 3;
      }

      .ventas-pro .ventas-selected-kicker {
        margin: 0 !important;
        color: #67e8f9 !important;
        opacity: 1 !important;
        font-size: 10px !important;
        line-height: 1.2 !important;
        font-weight: 950 !important;
        letter-spacing: .20em !important;
        text-transform: uppercase !important;
        text-shadow: none !important;
        filter: none !important;
      }

      .ventas-pro .ventas-selected-campaign {
        margin: 5px 0 0 !important;
        color: #ffffff !important;
        opacity: 1 !important;
        font-size: 21px !important;
        line-height: 1.05 !important;
        font-weight: 950 !important;
        text-shadow: 0 1px 2px rgba(0,0,0,.28) !important;
        filter: none !important;
      }

      .ventas-pro .ventas-selected-client {
        margin: 5px 0 0 !important;
        color: #e2e8f0 !important;
        opacity: 1 !important;
        font-size: 11px !important;
        line-height: 1.3 !important;
        font-weight: 800 !important;
        text-shadow: none !important;
        filter: none !important;
      }

      /* Tema claro */
      [data-crm-theme="light"] .ventas-pro .ventas-row.active {
        background: #eef2ff !important;
        border: 1px solid #6366f1 !important;
        border-left: 4px solid #4f46e5 !important;
        box-shadow: 0 2px 8px rgba(79,70,229,.08) !important;
        opacity: 1 !important;
        filter: none !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-row.active .ventas-client strong,
      [data-crm-theme="light"] .ventas-pro .ventas-row.active .ventas-product,
      [data-crm-theme="light"] .ventas-pro .ventas-row.active .ventas-date {
        color: #0f172a !important;
        opacity: 1 !important;
        text-shadow: none !important;
        filter: none !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-row.active .ventas-client small {
        color: #475569 !important;
        opacity: 1 !important;
        text-shadow: none !important;
        filter: none !important;
      }

      /* Tema gris / silver */
      [data-crm-theme="silver"] .ventas-pro .ventas-row.active {
        background: #e2e8f0 !important;
        border: 1px solid #64748b !important;
        border-left: 4px solid #334155 !important;
        box-shadow: 0 2px 8px rgba(51,65,85,.08) !important;
        opacity: 1 !important;
        filter: none !important;
      }

      [data-crm-theme="silver"] .ventas-pro .ventas-row.active .ventas-client strong,
      [data-crm-theme="silver"] .ventas-pro .ventas-row.active .ventas-product,
      [data-crm-theme="silver"] .ventas-pro .ventas-row.active .ventas-date {
        color: #0f172a !important;
        opacity: 1 !important;
        text-shadow: none !important;
        filter: none !important;
      }

      [data-crm-theme="silver"] .ventas-pro .ventas-row.active .ventas-client small {
        color: #475569 !important;
        opacity: 1 !important;
        text-shadow: none !important;
        filter: none !important;
      }

      /* El detalle seleccionado siempre debe leerse sobre fondo oscuro */
      [data-crm-theme="light"] .ventas-pro .ventas-selected-kicker,
      [data-crm-theme="silver"] .ventas-pro .ventas-selected-kicker,
      [data-crm-theme="dark"] .ventas-pro .ventas-selected-kicker,
      [data-crm-theme="night"] .ventas-pro .ventas-selected-kicker,
      [data-crm-theme="neon"] .ventas-pro .ventas-selected-kicker {
        color: #67e8f9 !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-selected-campaign,
      [data-crm-theme="silver"] .ventas-pro .ventas-selected-campaign,
      [data-crm-theme="dark"] .ventas-pro .ventas-selected-campaign,
      [data-crm-theme="night"] .ventas-pro .ventas-selected-campaign,
      [data-crm-theme="neon"] .ventas-pro .ventas-selected-campaign {
        color: #ffffff !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-selected-client,
      [data-crm-theme="silver"] .ventas-pro .ventas-selected-client,
      [data-crm-theme="dark"] .ventas-pro .ventas-selected-client,
      [data-crm-theme="night"] .ventas-pro .ventas-selected-client,
      [data-crm-theme="neon"] .ventas-pro .ventas-selected-client {
        color: #e2e8f0 !important;
      }

      /* Evita el efecto visual borroso por herencia de opacidad */
      .ventas-pro .ventas-row.active,
      .ventas-pro .ventas-row.active *,
      .ventas-pro .ventas-preview-hero,
      .ventas-pro .ventas-preview-hero * {
        -webkit-font-smoothing: antialiased;
        opacity: 1;
      }


      /* =========================================================
         MENSAJES DE ÉXITO / ERROR - CONTRASTE POR TEMA
         ========================================================= */

      [data-crm-theme="light"] .ventas-pro .ventas-alert.ok {
        background: #ecfdf5 !important;
        border: 1px solid #86efac !important;
        color: #166534 !important;
        opacity: 1 !important;
        text-shadow: none !important;
        filter: none !important;
      }

      [data-crm-theme="silver"] .ventas-pro .ventas-alert.ok {
        background: #dcfce7 !important;
        border: 1px solid #4ade80 !important;
        color: #14532d !important;
        opacity: 1 !important;
        text-shadow: none !important;
        filter: none !important;
      }

      [data-crm-theme="dark"] .ventas-pro .ventas-alert.ok,
      [data-crm-theme="night"] .ventas-pro .ventas-alert.ok {
        background: rgba(6,78,59,.88) !important;
        border: 1px solid #10b981 !important;
        color: #d1fae5 !important;
        opacity: 1 !important;
        text-shadow: none !important;
      }

      [data-crm-theme="neon"] .ventas-pro .ventas-alert.ok {
        background: rgba(6,78,59,.82) !important;
        border: 1px solid #34d399 !important;
        color: #ecfdf5 !important;
        box-shadow: 0 0 14px rgba(16,185,129,.10) !important;
        opacity: 1 !important;
        text-shadow: none !important;
      }

      [data-crm-theme="light"] .ventas-pro .ventas-alert.error {
        background: #fff1f2 !important;
        border: 1px solid #fda4af !important;
        color: #9f1239 !important;
        opacity: 1 !important;
        text-shadow: none !important;
      }

      [data-crm-theme="silver"] .ventas-pro .ventas-alert.error {
        background: #ffe4e6 !important;
        border: 1px solid #fb7185 !important;
        color: #881337 !important;
        opacity: 1 !important;
        text-shadow: none !important;
      }

    `}</style>
  );
}
