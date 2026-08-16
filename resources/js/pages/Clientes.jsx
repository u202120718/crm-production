import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Users,
  Save,
  Pencil,
  X,
  Plus,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  MessageCircle,
  Send,
  CheckCheck,
  Clock3,
  Smartphone,
  RefreshCw,
} from "lucide-react";

function estadoBadge(estado) {
  const value = String(estado || "").toUpperCase();

  if (["ACTIVO", "ACTIVO TOTAL", "ACTIVO PARCIAL", "FINALIZADO"].includes(value)) {
    return "border-emerald-700/40 bg-emerald-950 text-emerald-200";
  }

  if (["PENDIENTE", "VALIDANDO...", "VALIDADO PERU"].includes(value)) {
    return "border-amber-700/40 bg-amber-950 text-amber-200";
  }

  if (["BAJA", "CANCELADO", "RECHAZADO COMERCIAL", "NO COMISIONABLE"].includes(value)) {
    return "border-rose-700/40 bg-rose-950 text-rose-200";
  }

  return "border-slate-700/40 bg-slate-900 text-slate-200";
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(data?.message || `Error ${response.status}`);
  }

  return data;
}

function normalizePhone(value = "") {
  return String(value || "").replace(/\D/g, "");
}

function phoneForWhatsapp(value = "") {
  const digits = normalizePhone(value);
  if (!digits) return "";
  if (digits.startsWith("34") && digits.length >= 11) return digits;
  if (digits.length === 9) return `34${digits}`;
  return digits;
}

function mapVentaToCliente(venta) {
  const ficha = venta?.ficha && typeof venta.ficha === "object" ? venta.ficha : {};

  const telefono =
    venta?.telefono ||
    ficha?.movil_contacto ||
    ficha?.telefono_contacto_adicional ||
    ficha?.telefono_fijo_contacto ||
    "";

  const direccion = [
    ficha?.direccion,
    ficha?.numero_direccion,
    ficha?.portal ? `Portal ${ficha.portal}` : "",
    ficha?.escalera ? `Esc. ${ficha.escalera}` : "",
    ficha?.piso ? `Piso ${ficha.piso}` : "",
    ficha?.puerta ? `Puerta ${ficha.puerta}` : "",
    ficha?.codigo_postal,
    ficha?.localidad,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    id: `venta-${venta.id}`,
    ventaId: venta.id,
    nombre: venta?.cliente || ficha?.nombre || "Cliente sin nombre",
    documento: venta?.documento || ficha?.nif_nie_cif || "",
    telefono,
    email: ficha?.correo || "",
    direccion,
    provincia: ficha?.provincia || "",
    campana: venta?.campana || "",
    producto: venta?.producto || "",
    estado: venta?.estado || "Pendiente",
    comercial: venta?.comercial || "",
    supervisor: venta?.supervisor || "",
    source: "venta",
  };
}

function mergeClientesByPhone(base = [], ventas = []) {
  const map = new Map();

  [...base, ...ventas].forEach((cliente) => {
    const phone = normalizePhone(cliente?.telefono);
    const key = phone || String(cliente?.documento || cliente?.id || Math.random());

    if (!map.has(key)) {
      map.set(key, cliente);
      return;
    }

    const prev = map.get(key);
    map.set(key, {
      ...prev,
      ...cliente,
      id: prev?.id || cliente?.id,
      ventaId: cliente?.ventaId || prev?.ventaId,
      source: cliente?.source === "venta" ? "venta" : prev?.source,
    });
  });

  return [...map.values()];
}

const initialClientes = [
  {
    id: 1,
    nombre: "María Gómez",
    documento: "12345678X",
    telefono: "612345678",
    email: "maria@email.com",
    direccion: "Calle Mayor 14",
    provincia: "Madrid",
    campana: "Vodafone Fibra",
    producto: "Fibra + Móvil",
    estado: "Activo",
    source: "manual",
  },
  {
    id: 2,
    nombre: "Carlos Ruiz",
    documento: "87654321A",
    telefono: "698221145",
    email: "carlos@email.com",
    direccion: "Av. Valencia 222",
    provincia: "Valencia",
    campana: "Naturgy Luz",
    producto: "Luz Hogar",
    estado: "Pendiente",
    source: "manual",
  },
];

const emptyForm = {
  nombre: "",
  documento: "",
  telefono: "",
  email: "",
  direccion: "",
  provincia: "",
  campana: "",
  producto: "",
  estado: "Activo",
};

export default function Clientes({ campaigns = [] }) {
  const [clientes, setClientes] = useState(initialClientes);
  const [ventasClientes, setVentasClientes] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(false);

  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [campanaFiltro, setCampanaFiltro] = useState("Todas");
  const [selectedId, setSelectedId] = useState(initialClientes[0]?.id || null);
  const [form, setForm] = useState(emptyForm);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);

  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappCliente, setWhatsappCliente] = useState(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState("");
  const [whatsappHistory, setWhatsappHistory] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadVentas = async () => {
      setLoadingVentas(true);
      try {
        const data = await apiFetch("/ventas/list");
        const rows = Array.isArray(data?.ventas) ? data.ventas : Array.isArray(data) ? data : [];
        if (!mounted) return;
        setVentasClientes(rows.map(mapVentaToCliente));
      } catch (error) {
        console.warn("No se pudieron cargar ventas en Clientes:", error.message);
      } finally {
        if (mounted) setLoadingVentas(false);
      }
    };

    loadVentas();
    const timer = window.setInterval(loadVentas, 15000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const clientesCombinados = useMemo(
    () => mergeClientesByPhone(clientes, ventasClientes),
    [clientes, ventasClientes]
  );

  const campañasDisponibles = useMemo(() => {
    const fromCampaigns = campaigns.map((c) => c.nombre);
    const fromClientes = clientesCombinados.map((c) => c.campana).filter(Boolean);
    return ["Todas", ...new Set([...fromCampaigns, ...fromClientes])];
  }, [campaigns, clientesCombinados]);

  const filteredClientes = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clientesCombinados.filter((cliente) => {
      const coincideBusqueda =
        !q ||
        [
          cliente.nombre,
          cliente.documento,
          cliente.telefono,
          cliente.email,
          cliente.campana,
          cliente.producto,
          cliente.provincia,
          cliente.estado,
          cliente.comercial,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const coincideEstado = estadoFiltro === "Todos" ? true : cliente.estado === estadoFiltro;
      const coincideCampana = campanaFiltro === "Todas" ? true : cliente.campana === campanaFiltro;

      return coincideBusqueda && coincideEstado && coincideCampana;
    });
  }, [clientesCombinados, search, estadoFiltro, campanaFiltro]);

  const selectedCliente =
    clientesCombinados.find((c) => c.id === selectedId) || filteredClientes[0] || null;

  useEffect(() => {
    if (selectedCliente && !createMode) {
      setForm({
        nombre: selectedCliente.nombre || "",
        documento: selectedCliente.documento || "",
        telefono: selectedCliente.telefono || "",
        email: selectedCliente.email || "",
        direccion: selectedCliente.direccion || "",
        provincia: selectedCliente.provincia || "",
        campana: selectedCliente.campana || "",
        producto: selectedCliente.producto || "",
        estado: selectedCliente.estado || "Activo",
      });
    }
  }, [selectedCliente, createMode]);

  const resumen = useMemo(() => {
    return {
      total: clientesCombinados.length,
      activos: clientesCombinados.filter((c) =>
        ["ACTIVO", "ACTIVO TOTAL", "ACTIVO PARCIAL", "FINALIZADO"].includes(
          String(c.estado || "").toUpperCase()
        )
      ).length,
      pendientes: clientesCombinados.filter((c) =>
        ["PENDIENTE", "VALIDANDO...", "VALIDADO PERU"].includes(
          String(c.estado || "").toUpperCase()
        )
      ).length,
      bajas: clientesCombinados.filter((c) =>
        ["BAJA", "CANCELADO", "RECHAZADO COMERCIAL", "NO COMISIONABLE"].includes(
          String(c.estado || "").toUpperCase()
        )
      ).length,
    };
  }, [clientesCombinados]);

  const startCreate = () => {
    setCreateMode(true);
    setEditMode(false);
    setSelectedId(null);
    setForm(emptyForm);
  };

  const startEdit = () => {
    if (!selectedCliente) return;
    setCreateMode(false);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setCreateMode(false);
    setEditMode(false);
    if (selectedCliente) setSelectedId(selectedCliente.id);
    setForm(emptyForm);
  };

  const guardarCliente = () => {
    if (!form.nombre.trim() || !form.telefono.trim()) {
      alert("Completa al menos nombre y teléfono.");
      return;
    }

    if (createMode) {
      const nuevoCliente = {
        id: Date.now(),
        nombre: form.nombre.trim(),
        documento: form.documento.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        direccion: form.direccion.trim(),
        provincia: form.provincia.trim(),
        campana: form.campana.trim(),
        producto: form.producto.trim(),
        estado: form.estado,
        source: "manual",
      };

      setClientes((prev) => [nuevoCliente, ...prev]);
      setSelectedId(nuevoCliente.id);
      setCreateMode(false);
      alert("Cliente creado en modo local.");
      return;
    }

    if (!selectedCliente || selectedCliente.source === "venta") {
      setEditMode(false);
      return;
    }

    setClientes((prev) =>
      prev.map((cliente) =>
        cliente.id === selectedCliente.id
          ? {
              ...cliente,
              nombre: form.nombre.trim(),
              documento: form.documento.trim(),
              telefono: form.telefono.trim(),
              email: form.email.trim(),
              direccion: form.direccion.trim(),
              provincia: form.provincia.trim(),
              campana: form.campana.trim(),
              producto: form.producto.trim(),
              estado: form.estado,
            }
          : cliente
      )
    );

    setEditMode(false);
    alert("Cliente actualizado.");
  };

  const openWhatsapp = (cliente) => {
    if (!cliente) return;

    setWhatsappCliente(cliente);
    setWhatsappOpen(true);
    setWhatsappStatus("");

    if (!whatsappHistory[cliente.id]) {
      setWhatsappHistory((prev) => ({
        ...prev,
        [cliente.id]: [
          {
            id: `system-${Date.now()}`,
            direction: "system",
            text: `Conversación preparada para ${cliente.nombre}.`,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    }
  };

  const closeWhatsapp = () => {
    setWhatsappOpen(false);
    setWhatsappCliente(null);
    setWhatsappMessage("");
    setWhatsappStatus("");
  };

  const sendWhatsapp = async () => {
    const cliente = whatsappCliente;
    const message = whatsappMessage.trim();
    const phone = phoneForWhatsapp(cliente?.telefono);

    if (!cliente || !phone || !message || whatsappSending) return;

    setWhatsappSending(true);
    setWhatsappStatus("");

    try {
      const data = await apiFetch("/whatsapp/send", {
        method: "POST",
        body: JSON.stringify({
          phone,
          message,
          cliente_id: cliente.id,
          venta_id: cliente.ventaId || null,
          campaign: cliente.campana || null,
        }),
      });

      const sent = {
        id: data?.message_id || `local-${Date.now()}`,
        direction: "out",
        text: message,
        createdAt: new Date().toISOString(),
        status: "sent",
      };

      setWhatsappHistory((prev) => ({
        ...prev,
        [cliente.id]: [...(prev[cliente.id] || []), sent],
      }));

      setWhatsappMessage("");
      setWhatsappStatus("Mensaje enviado por WhatsApp Business.");
    } catch (error) {
      setWhatsappStatus(
        "La interfaz está lista. Falta conectar /whatsapp/send con la API oficial de WhatsApp Business."
      );
    } finally {
      setWhatsappSending(false);
    }
  };

  return (
    <div className="space-y-6 clientes-whatsapp-page">
      <div className="crm-panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="crm-label">Clientes</p>
            <h2 className="crm-title mt-1 text-2xl">Gestión de clientes</h2>
            <p className="crm-muted mt-2">
              Clientes y ventas centralizados, con acceso directo a WhatsApp Business desde el CRM.
            </p>
          </div>

          <div className="wa-sync-chip">
            <RefreshCw className={`h-4 w-4 ${loadingVentas ? "animate-spin" : ""}`} />
            <span>{loadingVentas ? "Actualizando ventas" : "Ventas sincronizadas"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5" />
            <p className="crm-label">Total clientes</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{resumen.total}</p>
        </div>

        <div className="crm-panel p-5">
          <p className="crm-label">Activos</p>
          <p className="crm-kpi mt-3 text-3xl">{resumen.activos}</p>
        </div>

        <div className="crm-panel p-5">
          <p className="crm-label">Pendientes</p>
          <p className="crm-kpi mt-3 text-3xl">{resumen.pendientes}</p>
        </div>

        <div className="crm-panel p-5">
          <p className="crm-label">Bajas / cancelados</p>
          <p className="crm-kpi mt-3 text-3xl">{resumen.bajas}</p>
        </div>
      </div>

      <div className="crm-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_220px_220px_auto]">
          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Search className="h-4 w-4 crm-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="Buscar por nombre, documento, teléfono, campaña o producto"
            />
          </div>

          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Filter className="h-4 w-4 crm-muted" />
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full bg-transparent outline-none"
            >
              <option className="text-black">Todos</option>
              {[...new Set(clientesCombinados.map((c) => c.estado).filter(Boolean))].map((estado) => (
                <option key={estado} className="text-black">{estado}</option>
              ))}
            </select>
          </div>

          <div className="crm-input px-4 py-3">
            <select
              value={campanaFiltro}
              onChange={(e) => setCampanaFiltro(e.target.value)}
              className="w-full bg-transparent outline-none"
            >
              {campañasDisponibles.map((campana) => (
                <option key={campana} className="text-black">{campana}</option>
              ))}
            </select>
          </div>

          <button
            onClick={startCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-300 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="crm-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="crm-heading text-lg">Listado de clientes</h3>
            <span className="crm-muted text-xs">{filteredClientes.length} visible(s)</span>
          </div>

          <div className="mt-4 space-y-3">
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => {
                const active = selectedCliente?.id === cliente.id && !createMode;

                return (
                  <button
                    key={cliente.id}
                    onClick={() => {
                      setSelectedId(cliente.id);
                      setCreateMode(false);
                      setEditMode(false);
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active ? "border-cyan-400/70 bg-slate-900" : "crm-panel-soft hover:opacity-90"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="crm-heading truncate">{cliente.nombre}</p>
                          {cliente.source === "venta" ? <span className="wa-sale-badge">VENTA</span> : null}
                        </div>
                        <p className="crm-muted text-sm">
                          {cliente.telefono || "Sin teléfono"} · {cliente.documento || "Sin documento"}
                        </p>
                        <p className="crm-muted mt-1 text-xs">
                          {cliente.campana || "Sin campaña"} · {cliente.provincia || "Sin provincia"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="wa-mini-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            openWhatsapp(cliente);
                          }}
                          title="Abrir WhatsApp Business dentro del CRM"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>

                        <span className="crm-badge-text rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                          {cliente.producto || "-"}
                        </span>
                        <span className={`crm-badge-text rounded-full border px-4 py-2 text-sm ${estadoBadge(cliente.estado)}`}>
                          {cliente.estado}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="crm-panel-soft p-4">
                <p className="crm-muted">No hay clientes para mostrar.</p>
              </div>
            )}
          </div>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="crm-heading text-lg">
              {createMode ? "Crear cliente" : editMode ? "Editar cliente" : "Detalle de cliente"}
            </h3>

            {!createMode && !editMode && selectedCliente && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => openWhatsapp(selectedCliente)} className="wa-primary-btn">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>

                <button
                  onClick={startEdit}
                  disabled={selectedCliente.source === "venta"}
                  title={selectedCliente.source === "venta" ? "Esta ficha viene de Ventas; edítala desde la venta." : "Editar cliente"}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-300 disabled:opacity-40"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
              </div>
            )}
          </div>

          {createMode || editMode ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="crm-label mb-2 block">Nombre</label>
                  <input value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Documento</label>
                  <input value={form.documento} onChange={(e) => setForm((p) => ({ ...p, documento: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Teléfono</label>
                  <input value={form.telefono} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Correo</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Campaña</label>
                  <select value={form.campana} onChange={(e) => setForm((p) => ({ ...p, campana: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none">
                    <option value="">Selecciona campaña</option>
                    {campaigns.map((campaign) => <option key={campaign.id} value={campaign.nombre}>{campaign.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="crm-label mb-2 block">Producto</label>
                  <input value={form.producto} onChange={(e) => setForm((p) => ({ ...p, producto: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Provincia</label>
                  <input value={form.provincia} onChange={(e) => setForm((p) => ({ ...p, provincia: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Estado</label>
                  <input value={form.estado} onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="crm-label mb-2 block">Dirección</label>
                  <input value={form.direccion} onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))} className="crm-input w-full px-4 py-3 outline-none" />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={guardarCliente} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-300 px-4 py-3 font-medium text-slate-900">
                  <Save className="h-4 w-4" /> Guardar
                </button>
                <button onClick={cancelEdit} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900">
                  <X className="h-4 w-4" /> Cancelar
                </button>
              </div>
            </div>
          ) : selectedCliente ? (
            <div className="mt-4 space-y-4">
              <div className="crm-panel-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="crm-label">Cliente</p>
                    <p className="crm-title mt-1 text-lg">{selectedCliente.nombre}</p>
                    <p className="crm-muted mt-1 text-sm">{selectedCliente.documento || "-"}</p>
                  </div>
                  {selectedCliente.source === "venta" ? <span className="wa-sale-badge large">CLIENTE DE VENTA</span> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="crm-panel-soft p-4">
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 crm-muted" /><p className="crm-label">Teléfono</p></div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="crm-body">{selectedCliente.telefono || "-"}</p>
                    <button type="button" className="wa-inline-link" onClick={() => openWhatsapp(selectedCliente)}>
                      <MessageCircle className="h-4 w-4" /> Hablar
                    </button>
                  </div>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 crm-muted" /><p className="crm-label">Correo</p></div>
                  <p className="crm-body mt-1">{selectedCliente.email || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 crm-muted" /><p className="crm-label">Producto</p></div>
                  <p className="crm-body mt-1">{selectedCliente.producto || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4"><p className="crm-label">Campaña</p><p className="crm-body mt-1">{selectedCliente.campana || "-"}</p></div>

                <div className="crm-panel-soft p-4">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 crm-muted" /><p className="crm-label">Provincia</p></div>
                  <p className="crm-body mt-1">{selectedCliente.provincia || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4"><p className="crm-label">Estado</p><p className="crm-body mt-1">{selectedCliente.estado || "-"}</p></div>

                {selectedCliente.comercial ? (
                  <div className="crm-panel-soft p-4"><p className="crm-label">Comercial</p><p className="crm-body mt-1">{selectedCliente.comercial}</p></div>
                ) : null}

                {selectedCliente.supervisor ? (
                  <div className="crm-panel-soft p-4"><p className="crm-label">Supervisor</p><p className="crm-body mt-1">{selectedCliente.supervisor}</p></div>
                ) : null}

                <div className="crm-panel-soft p-4 md:col-span-2"><p className="crm-label">Dirección</p><p className="crm-body mt-1">{selectedCliente.direccion || "-"}</p></div>
              </div>
            </div>
          ) : (
            <div className="crm-panel-soft mt-4 p-4"><p className="crm-muted">Selecciona un cliente para ver el detalle.</p></div>
          )}
        </div>
      </div>

      {whatsappOpen && whatsappCliente ? (
        <div className="wa-overlay">
          <div className="wa-drawer">
            <div className="wa-header">
              <div className="wa-brand">
                <div className="wa-logo"><MessageCircle className="h-5 w-5" /></div>
                <div>
                  <span>WHATSAPP BUSINESS</span>
                  <strong>{whatsappCliente.nombre}</strong>
                  <small>{whatsappCliente.telefono || "Sin teléfono"}{whatsappCliente.campana ? ` · ${whatsappCliente.campana}` : ""}</small>
                </div>
              </div>
              <button type="button" className="wa-close-btn" onClick={closeWhatsapp}><X className="h-5 w-5" /></button>
            </div>

            <div className="wa-context">
              <div><span>Venta</span><strong>{whatsappCliente.ventaId ? `#${whatsappCliente.ventaId}` : "Cliente CRM"}</strong></div>
              <div><span>Producto</span><strong>{whatsappCliente.producto || "-"}</strong></div>
              <div><span>Estado</span><strong>{whatsappCliente.estado || "-"}</strong></div>
            </div>

            <div className="wa-chat">
              <div className="wa-day-pill">Hoy</div>
              {(whatsappHistory[whatsappCliente.id] || []).map((item) => (
                <div key={item.id} className={`wa-message ${item.direction === "out" ? "out" : item.direction === "system" ? "system" : "in"}`}>
                  <p>{item.text}</p>
                  <small>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {item.direction === "out" ? <CheckCheck className="h-3.5 w-3.5" /> : null}
                  </small>
                </div>
              ))}

              {(whatsappHistory[whatsappCliente.id] || []).length <= 1 ? (
                <div className="wa-empty">
                  <Smartphone className="h-8 w-8" />
                  <strong>Conversación lista</strong>
                  <span>Escribe abajo para contactar al cliente sin salir del CRM.</span>
                </div>
              ) : null}
            </div>

            {whatsappStatus ? <div className={`wa-status ${whatsappStatus.includes("enviado") ? "ok" : "warn"}`}>{whatsappStatus}</div> : null}

            <div className="wa-composer">
              <textarea
                value={whatsappMessage}
                onChange={(event) => setWhatsappMessage(event.target.value)}
                placeholder={`Escribe un mensaje para ${whatsappCliente.nombre}...`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendWhatsapp();
                  }
                }}
              />
              <button type="button" onClick={sendWhatsapp} disabled={!whatsappMessage.trim() || whatsappSending} className="wa-send-btn">
                {whatsappSending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>

            <div className="wa-footer-note"><Clock3 className="h-3.5 w-3.5" /> Conversación dentro del CRM · no abre otra página</div>
          </div>
        </div>
      ) : null}

      <style>{`
        .wa-sync-chip { display:inline-flex; align-items:center; gap:7px; border:1px solid #bbf7d0; border-radius:999px; background:#ecfdf5; color:#166534; padding:8px 11px; font-size:10px; font-weight:850; }
        .wa-sale-badge { display:inline-flex; align-items:center; border:1px solid #bfdbfe; border-radius:999px; background:#eff6ff; color:#1d4ed8; padding:3px 7px; font-size:8px; font-weight:900; letter-spacing:.06em; }
        .wa-sale-badge.large { padding:5px 9px; font-size:9px; }
        .wa-mini-btn { width:38px; height:38px; display:inline-flex; align-items:center; justify-content:center; border:1px solid #86efac; border-radius:12px; background:#dcfce7; color:#15803d; transition:.18s ease; }
        .wa-mini-btn:hover { transform:translateY(-1px); background:#bbf7d0; }
        .wa-primary-btn { display:inline-flex; align-items:center; gap:7px; border:1px solid #22c55e; border-radius:14px; background:#16a34a; color:#fff; padding:9px 13px; font-weight:800; }
        .wa-inline-link { display:inline-flex; align-items:center; gap:6px; border:1px solid #86efac; border-radius:10px; background:#ecfdf5; color:#15803d; padding:6px 9px; font-size:11px; font-weight:850; }
        .wa-overlay { position:fixed; inset:0; z-index:100; display:flex; justify-content:flex-end; background:rgba(2,6,23,.46); backdrop-filter:blur(3px); }
        .wa-drawer { width:min(460px,94vw); height:100vh; display:grid; grid-template-rows:auto auto minmax(0,1fr) auto auto auto; background:#f0f2f5; box-shadow:-24px 0 60px rgba(2,6,23,.26); animation:waSlide .22s ease-out; }
        @keyframes waSlide { from { transform:translateX(28px); opacity:.7; } to { transform:translateX(0); opacity:1; } }
        .wa-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 15px; background:#075e54; color:#fff; }
        .wa-brand { display:flex; align-items:center; gap:11px; min-width:0; }
        .wa-logo { width:42px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#25d366; color:#fff; flex:none; }
        .wa-brand span,.wa-brand strong,.wa-brand small { display:block; }
        .wa-brand span { font-size:9px; font-weight:900; letter-spacing:.12em; opacity:.82; }
        .wa-brand strong { margin-top:2px; font-size:15px; }
        .wa-brand small { margin-top:2px; font-size:10px; opacity:.82; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:290px; }
        .wa-close-btn { width:38px; height:38px; display:flex; align-items:center; justify-content:center; border-radius:12px; background:rgba(255,255,255,.10); color:#fff; }
        .wa-context { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; background:#d1d5db; border-bottom:1px solid #d1d5db; }
        .wa-context > div { background:#fff; padding:9px 10px; }
        .wa-context span,.wa-context strong { display:block; }
        .wa-context span { color:#64748b; font-size:8px; font-weight:900; text-transform:uppercase; }
        .wa-context strong { margin-top:2px; color:#0f172a; font-size:10px; line-height:1.25; }
        .wa-chat { min-height:0; overflow-y:auto; padding:16px 14px 22px; background:linear-gradient(rgba(255,255,255,.72),rgba(255,255,255,.72)),radial-gradient(circle at 20% 20%,#d9fdd3 1px,transparent 1px); background-size:auto,18px 18px; }
        .wa-day-pill { width:fit-content; margin:0 auto 14px; border-radius:999px; background:rgba(255,255,255,.92); color:#64748b; padding:5px 9px; font-size:9px; font-weight:800; box-shadow:0 2px 5px rgba(15,23,42,.08); }
        .wa-message { width:fit-content; max-width:82%; margin-bottom:8px; border-radius:12px; padding:8px 9px 6px; box-shadow:0 1px 2px rgba(15,23,42,.08); }
        .wa-message p { margin:0; color:#111827; font-size:12px; line-height:1.42; white-space:pre-wrap; }
        .wa-message small { display:flex; justify-content:flex-end; align-items:center; gap:3px; margin-top:3px; color:#64748b; font-size:8px; }
        .wa-message.out { margin-left:auto; background:#d9fdd3; border-bottom-right-radius:4px; }
        .wa-message.in { background:#fff; border-bottom-left-radius:4px; }
        .wa-message.system { max-width:92%; margin-left:auto; margin-right:auto; background:#fff7c2; text-align:center; }
        .wa-empty { min-height:250px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#64748b; text-align:center; }
        .wa-empty strong { margin-top:9px; color:#334155; font-size:13px; }
        .wa-empty span { max-width:250px; margin-top:5px; font-size:10px; line-height:1.35; }
        .wa-status { margin:8px 12px 0; border-radius:11px; padding:8px 10px; font-size:10px; font-weight:800; }
        .wa-status.ok { background:#dcfce7; color:#166534; }
        .wa-status.warn { background:#fff7ed; color:#9a3412; }
        .wa-composer { display:grid; grid-template-columns:minmax(0,1fr) 48px; gap:8px; align-items:end; padding:10px 12px; background:#f0f2f5; border-top:1px solid #d1d5db; }
        .wa-composer textarea { min-height:48px; max-height:110px; resize:none; border:1px solid #d1d5db; border-radius:18px; background:#fff; color:#111827; padding:13px 14px; outline:none; font-size:12px; }
        .wa-composer textarea:focus { border-color:#25d366; box-shadow:0 0 0 3px rgba(37,211,102,.10); }
        .wa-send-btn { width:48px; height:48px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#25d366; color:#fff; }
        .wa-send-btn:disabled { opacity:.45; cursor:not-allowed; }
        .wa-footer-note { display:flex; align-items:center; justify-content:center; gap:5px; padding:7px 10px 10px; background:#f0f2f5; color:#64748b; font-size:9px; font-weight:700; }
      `}</style>
    </div>
  );
}
