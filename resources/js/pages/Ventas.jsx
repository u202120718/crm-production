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
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ESTADOS = [
  "Pendiente",
  "Validando...",
  "Validado Peru",
  "Activo Parcial",
  "Activo Total",
  "Finalizado",
  "Proceso de cancelacion",
  "Cancelado",
  "Desconexion",
  "Fallida",
  "Rechazado comercial",
  "No comisionable",
];

const BLOCK_LABELS = {
  principal: "Datos principales",
  control: "Control",
  cliente: "Cliente",
  direccion: "Dirección",
  oferta: "Oferta",
  lineas: "Líneas",
  cierre: "Cierre",
  adicionales: "Campos adicionales",
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
  ["fecha", "Fecha"],
  ["hora", "Hora"],
  ["fechaRegistro", "Registro"],
  ["fechaEdicion", "Edición"],
  ["cliente", "Cliente"],
  ["documento", "Documento"],
  ["telefono", "Teléfono"],
  ["campana", "Campaña"],
  ["producto", "Producto"],
  ["comercial", "Comercial"],
  ["coordinador", "Coordinador"],
  ["supervisor", "Supervisor"],
  ["estado", "Estado"],
  ["serviciosTv", "Servicios TV"],
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
      "No se pudo completar la solicitud.";
    throw new Error(message);
  }

  return data;
}

function estadoClase(estado) {
  const map = {
    Pendiente: "border-amber-500/50 bg-amber-200 text-slate-900",
    "Validando...": "border-cyan-500/50 bg-cyan-200 text-slate-900",
    "Validado Peru": "border-sky-500/50 bg-sky-200 text-slate-900",
    "Activo Parcial": "border-emerald-500/50 bg-emerald-200 text-slate-900",
    "Activo Total": "border-green-600/50 bg-green-300 text-slate-900",
    Finalizado: "border-lime-600/50 bg-lime-300 text-slate-900",
    "Proceso de cancelacion": "border-orange-500/50 bg-orange-200 text-slate-900",
    Cancelado: "border-red-500/50 bg-red-200 text-slate-900",
    Desconexion: "border-rose-500/50 bg-rose-200 text-slate-900",
    Fallida: "border-fuchsia-500/50 bg-fuchsia-200 text-slate-900",
    "Rechazado comercial": "border-pink-500/50 bg-pink-200 text-slate-900",
    "No comisionable": "border-slate-500/50 bg-slate-300 text-slate-900",
  };

  return map[estado] || "border-slate-400 bg-slate-100 text-slate-900";
}

function labelFromKey(key) {
  return key
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

function normalizeVenta(venta) {
  return {
    id: venta?.id ?? null,
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
    ficha: cleanFichaObject(venta?.ficha || {}),
    fechaRegistro: venta?.fechaRegistro ?? "",
    fechaEdicion: venta?.fechaEdicion ?? "",
  };
}

function flattenVentaForExport(venta) {
  const ficha = cleanFichaObject(venta?.ficha || {});
  const row = {
    ID: venta?.id || "",
    Fecha: venta?.fecha || "",
    Hora: venta?.hora || "",
    FechaRegistro: venta?.fechaRegistro || "",
    FechaEdicion: venta?.fechaEdicion || "",
    Cliente: venta?.cliente || "",
    Documento: venta?.documento || "",
    Telefono: venta?.telefono || "",
    Campana: venta?.campana || "",
    Comercial: venta?.comercial || "",
    Coordinador: venta?.coordinador || "",
    Supervisor: venta?.supervisor || "",
    Producto: venta?.producto || "",
    Estado: venta?.estado || "",
    ServiciosTV: Array.isArray(venta?.serviciosTv) ? venta.serviciosTv.join(", ") : "",
  };

  Object.entries(ficha).forEach(([key, value]) => {
    row[`Ficha - ${labelFromKey(key)}`] = value ?? "";
  });

  return row;
}

function buildEditForm(venta = null) {
  return {
    cliente: venta?.cliente || "",
    documento: venta?.documento || "",
    telefono: venta?.telefono || "",
    campana: venta?.campana || "",
    comercial: venta?.comercial || "",
    coordinador: venta?.coordinador || "",
    supervisor: venta?.supervisor || "",
    producto: venta?.producto || "",
    estado: venta?.estado || "Pendiente",
    fecha: venta?.fecha || "",
    hora: venta?.hora || "",
    serviciosTv: Array.isArray(venta?.serviciosTv) ? venta.serviciosTv.join(", ") : "",
    ficha: cleanFichaObject(venta?.ficha || {}),
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
    blockMap[block.key] = block.label || labelFromKey(block.key);
  });

  meta.customFields.forEach((field) => {
    fieldMap[field.key] = {
      label: field.label || labelFromKey(field.key),
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

function buildFichaSections(venta, campaigns) {
  if (!venta) return [];

  const ficha = cleanFichaObject(venta.ficha || {});
  const { fieldMap, blockMap } = buildFieldMetaMap(venta, campaigns);

  const grouped = {};

  Object.entries(ficha).forEach(([key, value]) => {
    const fieldMeta = fieldMap[key];
    const blockKey = fieldMeta?.tab || inferBlockFromKey(key);

    if (!grouped[blockKey]) grouped[blockKey] = [];

    grouped[blockKey].push({
      key,
      label: fieldMeta?.label || labelFromKey(key),
      value: value || "-",
    });
  });

  const customBlockKeys = Object.keys(blockMap);
  const order = [
    ...BASE_BLOCK_ORDER.filter((b) => b !== "principal"),
    ...customBlockKeys.filter((b) => !BASE_BLOCK_ORDER.includes(b)),
  ];

  const sections = order
    .filter((blockKey) => grouped[blockKey]?.length)
    .map((blockKey) => ({
      key: blockKey,
      title: blockMap[blockKey] || BLOCK_LABELS[blockKey] || labelFromKey(blockKey),
      entries: grouped[blockKey],
    }));

  return sections;
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

function EditSection({ title, entries, editForm, setEditForm }) {
  return (
    <div className="crm-panel-soft p-4">
      <div className="mb-3 flex items-center gap-2">
        <LayoutList className="h-4 w-4 text-cyan-500" />
        <p className="crm-label">{title}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((item) => {
          if (item.from === "main") {
            if (item.key === "estado") {
              return (
                <div key={item.key}>
                  <label className="crm-label mb-2 block">{item.label}</label>
                  <select
                    value={editForm.estado}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, estado: e.target.value }))
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

            return (
              <div key={item.key}>
                <label className="crm-label mb-2 block">{item.label}</label>
                <input
                  value={editForm[item.key] ?? ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, [item.key]: e.target.value }))
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
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    ficha: {
                      ...prev.ficha,
                      [item.key]: e.target.value,
                    },
                  }))
                }
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
}) {
  const [selectedVentaId, setSelectedVentaId] = useState(ventas[0]?.id || null);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [campanaFiltro, setCampanaFiltro] = useState("Todas");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState(buildEditForm());

  const canSeeExportButtons = ["Gerente", "Admin", "Backoffice"].includes(currentUser?.rol);
  const canEditVentas = ["Gerente", "Admin", "Backoffice"].includes(currentUser?.rol);

  const campañasDisponibles = useMemo(() => {
    const fromVentas = ventas.map((v) => v.campana).filter(Boolean);
    const fromCampaigns = campaigns.map((c) => c.nombre).filter(Boolean);
    return ["Todas", ...new Set([...fromVentas, ...fromCampaigns])];
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

      const coincideEstado = estadoFiltro === "Todos" ? true : venta.estado === estadoFiltro;
      const coincideCampaña = campanaFiltro === "Todas" ? true : venta.campana === campanaFiltro;

      return coincideBusqueda && coincideEstado && coincideCampaña;
    });
  }, [ventas, search, estadoFiltro, campanaFiltro]);

  const selectedVenta =
    ventas.find((venta) => venta.id === selectedVentaId) || ventasFiltradas[0] || null;

  useEffect(() => {
    if (selectedVenta) {
      setEditForm(buildEditForm(selectedVenta));
    }
  }, [selectedVentaId, selectedVenta]);

  const limpiarMensajes = () => {
    setMessage("");
    setError("");
  };

  const cargarVentas = async () => {
    if (!setVentas) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const data = await apiFetch("/ventas/list");
      const list = Array.isArray(data?.ventas) ? data.ventas.map(normalizeVenta) : [];

      setVentas(list);

      if (list.length > 0) {
        setSelectedVentaId(list[0].id);
      } else {
        setSelectedVentaId(null);
      }

      setEditMode(false);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las ventas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const totalVentas = ventas.length;
  const tramitadas = ventas.filter((v) =>
    ["Activo Parcial", "Activo Total", "Finalizado", "Validado Peru"].includes(v.estado)
  ).length;
  const pendientes = ventas.filter((v) =>
    ["Pendiente", "Validando...", "Proceso de cancelacion"].includes(v.estado)
  ).length;
  const rechazadas = ventas.filter((v) =>
    ["Rechazado comercial", "Cancelado", "Desconexion", "Fallida", "No comisionable"].includes(v.estado)
  ).length;

  const cambiarEstado = async (nuevoEstado) => {
    if (!selectedVenta || !setVentas) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const data = await apiFetch(`/ventas/${selectedVenta.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const actualizada = normalizeVenta(data.venta || { ...selectedVenta, estado: nuevoEstado });

      setVentas((prev) =>
        prev.map((venta) => (venta.id === actualizada.id ? { ...venta, ...actualizada } : venta))
      );

      setEditForm((prev) => ({ ...prev, estado: nuevoEstado }));
      setMessage("Estado actualizado correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado.");
    } finally {
      setLoading(false);
    }
  };

  const guardarEdicion = async () => {
    if (!selectedVenta || !setVentas) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const payload = {
        cliente: editForm.cliente,
        documento: editForm.documento,
        telefono: editForm.telefono,
        campana: editForm.campana,
        comercial: editForm.comercial,
        coordinador: editForm.coordinador,
        supervisor: editForm.supervisor,
        producto: editForm.producto,
        estado: editForm.estado,
        fecha: editForm.fecha,
        hora: editForm.hora,
        serviciosTv: String(editForm.serviciosTv || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        ficha: editForm.ficha,
      };

      const data = await apiFetch(`/ventas/${selectedVenta.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const actualizada = normalizeVenta(data.venta || { ...selectedVenta, ...payload });

      setVentas((prev) =>
        prev.map((venta) => (venta.id === actualizada.id ? { ...venta, ...actualizada } : venta))
      );

      setEditMode(false);
      setMessage("Venta actualizada.");
    } catch (err) {
      setError(err.message || "No se pudo actualizar la venta.");
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    if (selectedVenta) {
      setEditForm(buildEditForm(selectedVenta));
    }
    setEditMode(false);
    limpiarMensajes();
  };

  const eliminarVenta = async () => {
    if (!selectedVenta || !setVentas) return;

    const ok = window.confirm(`¿Seguro que deseas eliminar la venta de ${selectedVenta.cliente}?`);
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
      setMessage("Venta eliminada.");
    } catch (err) {
      setError(err.message || "No se pudo eliminar la venta.");
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    const data = ventasFiltradas.map((venta) => flattenVentaForExport(venta));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
    XLSX.writeFile(workbook, "ventas_completas_crm.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    let currentY = 14;

    doc.setFontSize(16);
    doc.text("Reporte completo de ventas CRM", 14, currentY);
    currentY += 8;

    ventasFiltradas.forEach((venta, index) => {
      if (index > 0) currentY += 4;

      const ventaInfo = [
        ["ID", String(venta?.id || "")],
        ["Fecha", venta?.fecha || ""],
        ["Hora", venta?.hora || ""],
        ["Fecha registro", venta?.fechaRegistro || ""],
        ["Fecha edición", venta?.fechaEdicion || ""],
        ["Cliente", venta?.cliente || ""],
        ["Documento", venta?.documento || ""],
        ["Teléfono", venta?.telefono || ""],
        ["Campaña", venta?.campana || ""],
        ["Comercial", venta?.comercial || ""],
        ["Coordinador", venta?.coordinador || ""],
        ["Supervisor", venta?.supervisor || ""],
        ["Producto", venta?.producto || ""],
        ["Estado", venta?.estado || ""],
        ["Servicios TV", Array.isArray(venta?.serviciosTv) ? venta.serviciosTv.join(", ") : ""],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [[`Venta ${index + 1}`, "Valor"]],
        body: ventaInfo,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 41, 59] },
        bodyStyles: { textColor: [20, 20, 20] },
        margin: { left: 14, right: 14 },
      });

      currentY = doc.lastAutoTable.finalY + 4;

      const ficha = cleanFichaObject(venta?.ficha || {});
      const fichaRows = Object.entries(ficha).map(([key, value]) => [
        labelFromKey(key),
        String(value ?? ""),
      ]);

      if (fichaRows.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Campo ficha", "Valor"]],
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

    doc.save("ventas_completas_crm.pdf");
  };

  const detailSections = useMemo(() => {
    if (!selectedVenta) return [];

    const principal = {
      key: "principal",
      title: BLOCK_LABELS.principal,
      entries: buildPrincipalEntries(selectedVenta),
    };

    const fichaSections = buildFichaSections(selectedVenta, campaigns);

    return [principal, ...fichaSections];
  }, [selectedVenta, campaigns]);

  const editSections = useMemo(() => {
    if (!selectedVenta) return [];

    const principal = {
      key: "principal",
      title: BLOCK_LABELS.principal,
      entries: [
        { key: "fecha", label: "Fecha", from: "main" },
        { key: "hora", label: "Hora", from: "main" },
        { key: "cliente", label: "Cliente", from: "main" },
        { key: "documento", label: "Documento", from: "main" },
        { key: "telefono", label: "Teléfono", from: "main" },
        { key: "campana", label: "Campaña", from: "main" },
        { key: "producto", label: "Producto", from: "main" },
        { key: "comercial", label: "Comercial", from: "main" },
        { key: "coordinador", label: "Coordinador", from: "main" },
        { key: "supervisor", label: "Supervisor", from: "main" },
        { key: "estado", label: "Estado", from: "main" },
        { key: "serviciosTv", label: "Servicios TV", from: "main" },
      ],
    };

    const fichaSections = buildFichaSections(selectedVenta, campaigns).map((section) => ({
      ...section,
      entries: section.entries.map((item) => ({ ...item, from: "ficha" })),
    }));

    return [principal, ...fichaSections];
  }, [selectedVenta, campaigns]);

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Ventas</p>
        <h2 className="crm-title mt-1 text-2xl">Gestión de ventas</h2>
        <p className="crm-muted mt-2 text-sm">
          Aquí Backoffice controla estado, edición y consulta completa de la ficha registrada.
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
            <p className="crm-label">Total ventas</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{totalVentas}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="crm-label">Gestionadas</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{tramitadas}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-amber-500" />
            <p className="crm-label">Pendientes</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{pendientes}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-rose-500" />
            <p className="crm-label">No favorables</p>
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
              placeholder="Buscar por cliente, documento, teléfono, campaña o comercial"
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
              <option className="text-black">Todos</option>
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
            Recargar
          </button>

          {canSeeExportButtons && (
            <>
              <button
                onClick={exportarExcel}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-300"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
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
          <h3 className="crm-heading text-lg">Ventas registradas</h3>

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
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedVentaId(venta.id);
                          setEditMode(false);
                        }}
                      >
                        <p className="crm-heading">{venta.cliente}</p>
                        <p className="crm-muted text-sm">
                          {venta.telefono} · {venta.documento || "Sin documento"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Fecha: {venta.fecha || "-"} · Hora: {venta.hora || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Edición: {venta.fechaEdicion || "-"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                        >
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
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                        >
                          <Eye className="h-3 w-3" />
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="crm-panel-soft p-4">
                <p className="crm-muted text-sm">No hay ventas para mostrar.</p>
              </div>
            )}
          </div>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="crm-heading text-lg">Detalle de venta</h3>

            {selectedVenta && !editMode && canEditVentas && (
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-300"
              >
                <Pencil className="h-4 w-4" />
                Editar
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
                    />
                  ))}

                  <div className="flex gap-2">
                    <button
                      onClick={guardarEdicion}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      Guardar
                    </button>

                    <button
                      onClick={cancelarEdicion}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {detailSections.map((section) => (
                    <DetailSection
                      key={section.key}
                      title={section.title}
                      entries={section.entries}
                    />
                  ))}

                  <div className="crm-panel-soft p-4">
                    <p className="crm-label mb-3">Cambio rápido de estado</p>
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
                        Eliminar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="crm-panel-soft mt-4 p-4">
              <p className="crm-muted text-sm">Selecciona una venta para ver el detalle.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
