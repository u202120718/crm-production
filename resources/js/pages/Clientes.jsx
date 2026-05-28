

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
} from "lucide-react";

function estadoBadge(estado) {
  if (estado === "Activo") {
    return "border-emerald-700/40 bg-emerald-950 text-emerald-200";
  }
  if (estado === "Pendiente") {
    return "border-amber-700/40 bg-amber-950 text-amber-200";
  }
  if (estado === "Baja") {
    return "border-rose-700/40 bg-rose-950 text-rose-200";
  }
  return "border-slate-700/40 bg-slate-900 text-slate-200";
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
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [campanaFiltro, setCampanaFiltro] = useState("Todas");
  const [selectedId, setSelectedId] = useState(initialClientes[0]?.id || null);
  const [form, setForm] = useState(emptyForm);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);

  const campañasDisponibles = useMemo(() => {
    const fromCampaigns = campaigns.map((c) => c.nombre);
    const fromClientes = clientes.map((c) => c.campana).filter(Boolean);
    return ["Todas", ...new Set([...fromCampaigns, ...fromClientes])];
  }, [campaigns, clientes]);

  const filteredClientes = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clientes.filter((cliente) => {
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
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const coincideEstado =
        estadoFiltro === "Todos" ? true : cliente.estado === estadoFiltro;

      const coincideCampana =
        campanaFiltro === "Todas" ? true : cliente.campana === campanaFiltro;

      return coincideBusqueda && coincideEstado && coincideCampana;
    });
  }, [clientes, search, estadoFiltro, campanaFiltro]);

  const selectedCliente =
    clientes.find((c) => c.id === selectedId) || filteredClientes[0] || null;

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
      total: clientes.length,
      activos: clientes.filter((c) => c.estado === "Activo").length,
      pendientes: clientes.filter((c) => c.estado === "Pendiente").length,
      bajas: clientes.filter((c) => c.estado === "Baja").length,
    };
  }, [clientes]);

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
      };

      setClientes((prev) => [nuevoCliente, ...prev]);
      setSelectedId(nuevoCliente.id);
      setCreateMode(false);
      alert("Cliente creado en modo demo.");
      return;
    }

    if (!selectedCliente) return;

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

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Clientes</p>
        <h2 className="crm-title mt-1 text-2xl">Gestión de clientes</h2>
        <p className="crm-muted mt-2">
          Consulta, crea y actualiza clientes por campaña, estado y producto.
        </p>
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
          <p className="crm-label">Bajas</p>
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
              placeholder="Buscar por nombre, documento, teléfono o producto"
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
              <option className="text-black">Activo</option>
              <option className="text-black">Pendiente</option>
              <option className="text-black">Baja</option>
            </select>
          </div>

          <div className="crm-input px-4 py-3">
            <select
              value={campanaFiltro}
              onChange={(e) => setCampanaFiltro(e.target.value)}
              className="w-full bg-transparent outline-none"
            >
              {campañasDisponibles.map((campana) => (
                <option key={campana} className="text-black">
                  {campana}
                </option>
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
          <h3 className="crm-heading text-lg">Listado de clientes</h3>

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
                      active
                        ? "border-white/20 bg-slate-900"
                        : "crm-panel-soft hover:opacity-90"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="crm-heading">{cliente.nombre}</p>
                        <p className="crm-muted text-sm">
                          {cliente.telefono} · {cliente.documento || "Sin documento"}
                        </p>
                        <p className="crm-muted mt-1 text-xs">
                          {cliente.campana || "Sin campaña"} · {cliente.provincia || "Sin provincia"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="crm-badge-text rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                          {cliente.producto || "-"}
                        </span>
                        <span
                          className={`crm-badge-text rounded-full border px-4 py-2 text-sm ${estadoBadge(
                            cliente.estado
                          )}`}
                        >
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
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-300"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>
            )}
          </div>

          {createMode || editMode ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="crm-label mb-2 block">Nombre</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Documento</label>
                  <input
                    value={form.documento}
                    onChange={(e) => setForm((prev) => ({ ...prev, documento: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Teléfono</label>
                  <input
                    value={form.telefono}
                    onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Correo</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Campaña</label>
                  <select
                    value={form.campana}
                    onChange={(e) => setForm((prev) => ({ ...prev, campana: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                  >
                    <option value="">Selecciona campaña</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.nombre}>
                        {campaign.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="crm-label mb-2 block">Producto</label>
                  <input
                    value={form.producto}
                    onChange={(e) => setForm((prev) => ({ ...prev, producto: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Provincia</label>
                  <input
                    value={form.provincia}
                    onChange={(e) => setForm((prev) => ({ ...prev, provincia: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                  >
                    <option>Activo</option>
                    <option>Pendiente</option>
                    <option>Baja</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="crm-label mb-2 block">Dirección</label>
                  <input
                    value={form.direccion}
                    onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={guardarCliente}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-300 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-400"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </button>

                <button
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : selectedCliente ? (
            <div className="mt-4 space-y-4">
              <div className="crm-panel-soft p-4">
                <p className="crm-label">Cliente</p>
                <p className="crm-title mt-1 text-lg">{selectedCliente.nombre}</p>
                <p className="crm-muted mt-1 text-sm">{selectedCliente.documento || "-"}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="crm-panel-soft p-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 crm-muted" />
                    <p className="crm-label">Teléfono</p>
                  </div>
                  <p className="crm-body mt-1">{selectedCliente.telefono || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 crm-muted" />
                    <p className="crm-label">Correo</p>
                  </div>
                  <p className="crm-body mt-1">{selectedCliente.email || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 crm-muted" />
                    <p className="crm-label">Producto</p>
                  </div>
                  <p className="crm-body mt-1">{selectedCliente.producto || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4">
                  <p className="crm-label">Campaña</p>
                  <p className="crm-body mt-1">{selectedCliente.campana || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 crm-muted" />
                    <p className="crm-label">Provincia</p>
                  </div>
                  <p className="crm-body mt-1">{selectedCliente.provincia || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4">
                  <p className="crm-label">Estado</p>
                  <p className="crm-body mt-1">{selectedCliente.estado || "-"}</p>
                </div>

                <div className="crm-panel-soft p-4 md:col-span-2">
                  <p className="crm-label">Dirección</p>
                  <p className="crm-body mt-1">{selectedCliente.direccion || "-"}</p>
                </div>
              </div>

              <div className="crm-panel-soft p-4">
                <p className="crm-label mb-3">Cambio rápido de estado</p>
                <div className="flex flex-wrap gap-2">
                  {["Activo", "Pendiente", "Baja"].map((estado) => (
                    <button
                      key={estado}
                      onClick={() =>
                        setClientes((prev) =>
                          prev.map((cliente) =>
                            cliente.id === selectedCliente.id ? { ...cliente, estado } : cliente
                          )
                        )
                      }
                      className={`crm-badge-text rounded-full border px-4 py-2 text-sm ${estadoBadge(
                        estado
                      )}`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="crm-panel-soft mt-4 p-4">
              <p className="crm-muted">Selecciona un cliente para ver el detalle.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
