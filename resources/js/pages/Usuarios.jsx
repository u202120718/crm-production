import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserRound,
  Search,
  Filter,
  Plus,
  Save,
  Trash2,
  RefreshCcw,
  ShieldCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Ban,
  Mail,
  KeyRound,
  IdCard,
} from "lucide-react";
import { getVisibleMenus } from "../lib/rbac";

const ROLES = ["Gerente", "Admin", "Supervisor", "Backoffice", "Comercial"];
const ESTADOS = ["Activo", "Inactivo"];

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
      data?.errors?.email?.[0] ||
      data?.errors?.dni?.[0] ||
      data?.errors?.name?.[0] ||
      data?.errors?.password?.[0] ||
      "No se pudo completar la solicitud.";
    throw new Error(message);
  }

  return data;
}

function normalizeUser(user) {
  return {
    id: user.id ?? null,
    nombre: user.name ?? user.nombre ?? "",
    email: user.email ?? "",
    password: "",
    dni: user.dni ?? "",
    rol: user.rol ?? "Comercial",
    campana: user.campana ?? "",
    coordinador: user.coordinador ?? "",
    supervisor: user.supervisor ?? "",
    estado: user.estado ?? "Activo",
    allowedMenus: Array.isArray(user.allowedMenus) ? user.allowedMenus : [],
    allowedCampaigns: Array.isArray(user.allowedCampaigns) ? user.allowedCampaigns : [],
  };
}

function buildEmptyUser() {
  return {
    id: null,
    nombre: "",
    email: "",
    password: "",
    dni: "",
    rol: "Comercial",
    campana: "",
    coordinador: "",
    supervisor: "",
    estado: "Activo",
    allowedMenus: [],
    allowedCampaigns: [],
  };
}

function StatCard({ icon: Icon, title, value, subtitle, iconColor }) {
  return (
    <div className="crm-panel p-5">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <p className="crm-label">{title}</p>
      </div>
      <p className="crm-kpi mt-3 text-3xl">{value}</p>
      <p className="crm-muted mt-2 text-sm">{subtitle}</p>
    </div>
  );
}

export default function Usuarios({
  currentUser,
  users = [],
  setUsers,
  campaigns = [],
}) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || null);
  const [mode, setMode] = useState("edit");
  const [search, setSearch] = useState("");
  const [rolFiltro, setRolFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(buildEmptyUser());

  const puedeGestionar = ["Gerente", "Admin"].includes(currentUser?.rol);

  const campaignNames = useMemo(
    () => campaigns.map((c) => c.nombre).filter(Boolean),
    [campaigns]
  );

  const coordinadoresDisponibles = useMemo(() => {
    return users.filter(
      (u) =>
        u.estado === "Activo" &&
        ["Gerente", "Admin", "Supervisor"].includes(u.rol)
    );
  }, [users]);

  const supervisoresDisponibles = useMemo(() => {
    return users.filter(
      (u) =>
        u.estado === "Activo" &&
        ["Gerente", "Supervisor"].includes(u.rol)
    );
  }, [users]);

  const usersFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users.filter((u) => {
      const matchSearch =
        !q ||
        [
          u.nombre,
          u.email,
          u.dni,
          u.rol,
          u.estado,
          ...(u.allowedCampaigns || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchRol = rolFiltro === "Todos" ? true : u.rol === rolFiltro;
      const matchEstado = estadoFiltro === "Todos" ? true : u.estado === estadoFiltro;

      return matchSearch && matchRol && matchEstado;
    });
  }, [users, search, rolFiltro, estadoFiltro]);

  const selectedUser =
    users.find((u) => u.id === selectedUserId) || usersFiltrados[0] || null;

  const resumen = useMemo(() => {
    return {
      total: users.length,
      activos: users.filter((u) => u.estado === "Activo").length,
      comerciales: users.filter((u) => u.rol === "Comercial").length,
      supervisores: users.filter((u) => u.rol === "Supervisor").length,
    };
  }, [users]);

  const menusPreview = useMemo(() => {
    return getVisibleMenus({ rol: form.rol });
  }, [form.rol]);

  const limpiarMensajes = () => {
    setMessage("");
    setError("");
  };

  const cargarUsuarios = async () => {
    if (!puedeGestionar || !setUsers) return;

    try {
      setLoading(true);
      limpiarMensajes();

      const data = await apiFetch("/users/list");
      const list = Array.isArray(data?.users) ? data.users.map(normalizeUser) : [];

      setUsers(list);

      if (list.length > 0 && !selectedUserId) {
        setSelectedUserId(list[0].id);
      }
    } catch (err) {
      setError(err.message || "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "edit") return;
    if (!selectedUser) return;

    setForm({
      id: selectedUser.id,
      nombre: selectedUser.nombre || "",
      email: selectedUser.email || "",
      password: "",
      dni: selectedUser.dni || "",
      rol: selectedUser.rol || "Comercial",
      campana: selectedUser.campana || "",
      coordinador: selectedUser.coordinador || "",
      supervisor: selectedUser.supervisor || "",
      estado: selectedUser.estado || "Activo",
      allowedMenus: selectedUser.allowedMenus || [],
      allowedCampaigns: Array.isArray(selectedUser.allowedCampaigns)
        ? selectedUser.allowedCampaigns
        : selectedUser.campana
          ? [selectedUser.campana]
          : [],
    });
  }, [selectedUserId, selectedUser, mode]);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleNuevoUsuario = () => {
    limpiarMensajes();
    setMode("create");
    setSelectedUserId(null);
    setForm(buildEmptyUser());
  };

  const handleSeleccionarUsuario = (userId) => {
    limpiarMensajes();
    setMode("edit");
    setSelectedUserId(userId);
  };

  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "rol" && value === "Gerente") {
        next.allowedCampaigns = [];
        next.campana = "";
        next.coordinador = "";
        next.supervisor = "";
      }

      return next;
    });
  };

  const toggleCampaign = (campaña) => {
    setForm((prev) => {
      const exists = prev.allowedCampaigns.includes(campaña);
      const nextCampaigns = exists
        ? prev.allowedCampaigns.filter((c) => c !== campaña)
        : [...prev.allowedCampaigns, campaña];

      return {
        ...prev,
        allowedCampaigns: nextCampaigns,
        campana: nextCampaigns[0] || "",
      };
    });
  };

  const guardarUsuario = async () => {
    limpiarMensajes();

    if (!puedeGestionar) {
      setError("No tienes permisos para gestionar usuarios.");
      return;
    }

    if (!form.nombre.trim() || !form.email.trim() || !form.rol.trim()) {
      setError("Completa al menos nombre, correo y rol.");
      return;
    }

    const emailExiste = users.some(
      (u) =>
        u.email?.trim().toLowerCase() === form.email.trim().toLowerCase() &&
        u.id !== form.id
    );

    if (emailExiste) {
      setError("Ya existe un usuario con ese correo.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.nombre.trim(),
        email: form.email.trim(),
        dni: form.dni.trim(),
        rol: form.rol,
        estado: form.estado,
        password: form.password.trim() || undefined,
        campana:
          form.rol === "Gerente"
            ? ""
            : (form.allowedCampaigns?.[0] || form.campana || ""),
        coordinador: form.coordinador || "",
        supervisor: form.supervisor || "",
        allowedCampaigns:
          form.rol === "Gerente"
            ? []
            : Array.from(new Set(form.allowedCampaigns || [])),
      };

      let data;

      if (mode === "create") {
        data = await apiFetch("/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const newUser = normalizeUser(data.user || payload);

        setUsers?.((prev) => [newUser, ...prev]);
        setSelectedUserId(newUser.id);
        setMode("edit");
        setMessage("Usuario creado correctamente.");
        return;
      }

      data = await apiFetch(`/users/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const updatedUser = normalizeUser(data.user || { ...payload, id: form.id });

      setUsers?.((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
      );

      setMessage("Usuario actualizado correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo guardar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id, nombre) => {
    limpiarMensajes();

    if (!puedeGestionar) {
      setError("No tienes permisos para eliminar usuarios.");
      return;
    }

    if (currentUser?.id === id) {
      setError("No puedes eliminar tu propio usuario.");
      return;
    }

    const ok = window.confirm(`¿Seguro que deseas eliminar al usuario ${nombre}?`);
    if (!ok) return;

    try {
      setLoading(true);

      await apiFetch(`/users/${id}`, {
        method: "DELETE",
      });

      setUsers?.((prev) => prev.filter((u) => u.id !== id));
      setSelectedUserId(null);
      setMode("create");
      setForm(buildEmptyUser());
      setMessage("Usuario eliminado.");
    } catch (err) {
      setError(err.message || "No se pudo eliminar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const toggleEstadoUsuario = async (user) => {
    limpiarMensajes();

    if (!puedeGestionar) {
      setError("No tienes permisos para cambiar el estado.");
      return;
    }

    if (currentUser?.id === user.id) {
      setError("No puedes desactivar tu propio usuario.");
      return;
    }

    const nextEstado = user.estado === "Activo" ? "Inactivo" : "Activo";

    try {
      setLoading(true);

      const data = await apiFetch(`/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nextEstado }),
      });

      const updatedUser = normalizeUser(data.user || { ...user, estado: nextEstado });

      setUsers?.((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
      );

      if (selectedUserId === user.id) {
        setForm((prev) => ({ ...prev, estado: nextEstado }));
      }

      setMessage(`Usuario ${nextEstado === "Activo" ? "activado" : "desactivado"}.`);
    } catch (err) {
      setError(err.message || "No se pudo cambiar el estado.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    limpiarMensajes();

    if (mode === "edit" && selectedUser) {
      setForm({
        id: selectedUser.id,
        nombre: selectedUser.nombre || "",
        email: selectedUser.email || "",
        password: "",
        dni: selectedUser.dni || "",
        rol: selectedUser.rol || "Comercial",
        campana: selectedUser.campana || "",
        coordinador: selectedUser.coordinador || "",
        supervisor: selectedUser.supervisor || "",
        estado: selectedUser.estado || "Activo",
        allowedMenus: selectedUser.allowedMenus || [],
        allowedCampaigns: Array.isArray(selectedUser.allowedCampaigns)
          ? selectedUser.allowedCampaigns
          : selectedUser.campana
            ? [selectedUser.campana]
            : [],
      });
      return;
    }

    setForm(buildEmptyUser());
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <div className="flex items-start gap-3">
          <Users className="mt-1 h-5 w-5 text-cyan-500" />
          <div>
            <p className="crm-label">Usuarios</p>
            <h2 className="crm-title mt-1 text-2xl">Gestión de usuarios</h2>
            <p className="crm-muted mt-2 text-sm">
              Crea, edita, elimina y asigna campañas de forma más clara y profesional.
            </p>
          </div>
        </div>
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
        <StatCard
          icon={Users}
          title="Usuarios"
          value={resumen.total}
          subtitle="Total registrados"
          iconColor="text-cyan-500"
        />
        <StatCard
          icon={CheckCircle2}
          title="Activos"
          value={resumen.activos}
          subtitle="Con acceso disponible"
          iconColor="text-emerald-500"
        />
        <StatCard
          icon={UserRound}
          title="Comerciales"
          value={resumen.comerciales}
          subtitle="Equipo comercial"
          iconColor="text-fuchsia-500"
        />
        <StatCard
          icon={ShieldCheck}
          title="Supervisores"
          value={resumen.supervisores}
          subtitle="Control operativo"
          iconColor="text-amber-500"
        />
      </div>

      <div className="crm-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_220px_220px_auto]">
          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
              style={{ color: "inherit" }}
              placeholder="Buscar por nombre, correo, DNI, rol o campaña"
            />
          </div>

          <div className="crm-input flex items-center gap-2 px-4 py-3">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={rolFiltro}
              onChange={(e) => setRolFiltro(e.target.value)}
              className="w-full bg-transparent outline-none"
              style={{ color: "inherit" }}
            >
              <option className="text-black">Todos</option>
              {ROLES.map((rol) => (
                <option key={rol} className="text-black">
                  {rol}
                </option>
              ))}
            </select>
          </div>

          <div className="crm-input px-4 py-3">
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

          <button
            onClick={handleNuevoUsuario}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-cyan-300"
          >
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </button>
        </div>
      </div>

      <div className="crm-panel p-4">
        <button
          onClick={cargarUsuarios}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Actualizando..." : "Recargar usuarios"}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">Listado de usuarios</h3>

          <div className="mt-4 space-y-3">
            {usersFiltrados.length > 0 ? (
              usersFiltrados.map((usuario) => {
                const active = selectedUser?.id === usuario.id && mode === "edit";

                return (
                  <button
                    key={usuario.id}
                    onClick={() => handleSeleccionarUsuario(usuario.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-slate-400 bg-slate-200/80 dark:border-white/20 dark:bg-slate-900"
                        : "crm-panel-soft hover:opacity-90"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="crm-heading">{usuario.nombre || "-"}</p>
                        <p className="crm-muted text-sm">
                          {usuario.email || "-"} · {usuario.dni || "Sin DNI"}
                        </p>
                        <p className="mt-1 text-xs opacity-80">
                          {usuario.rol || "-"} · {(usuario.allowedCampaigns || []).join(", ") || "Sin campañas"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-2 text-xs font-medium ${
                            usuario.estado === "Activo"
                              ? "border-emerald-700/40 bg-emerald-100 text-emerald-800"
                              : "border-slate-500/40 bg-slate-200 text-slate-700"
                          }`}
                        >
                          {usuario.estado}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="crm-panel-soft p-4">
                <p className="crm-muted">No hay usuarios para mostrar.</p>
              </div>
            )}
          </div>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="crm-heading text-lg">
              {mode === "create" ? "Nuevo usuario" : "Detalle del usuario"}
            </h3>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="crm-label mb-2 block">Nombre</label>
                <div className="crm-input flex items-center gap-2 px-4 py-3">
                  <UserRound className="h-4 w-4 text-slate-500" />
                  <input
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    className="w-full bg-transparent outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>
              </div>

              <div>
                <label className="crm-label mb-2 block">Correo</label>
                <div className="crm-input flex items-center gap-2 px-4 py-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <input
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full bg-transparent outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>
              </div>

              <div>
                <label className="crm-label mb-2 block">DNI</label>
                <div className="crm-input flex items-center gap-2 px-4 py-3">
                  <IdCard className="h-4 w-4 text-slate-500" />
                  <input
                    value={form.dni}
                    onChange={(e) => handleChange("dni", e.target.value)}
                    className="w-full bg-transparent outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>
              </div>

              <div>
                <label className="crm-label mb-2 block">
                  Contraseña {mode === "edit" ? "(solo si deseas cambiarla)" : ""}
                </label>
                <div className="crm-input flex items-center gap-2 px-4 py-3">
                  <KeyRound className="h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full bg-transparent outline-none"
                    style={{ color: "inherit" }}
                  />
                </div>
              </div>

              <div>
                <label className="crm-label mb-2 block">Rol</label>
                <select
                  value={form.rol}
                  onChange={(e) => handleChange("rol", e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                >
                  {ROLES.map((rol) => (
                    <option key={rol} className="text-black">
                      {rol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="crm-label mb-2 block">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} className="text-black">
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="crm-label mb-2 block">Coordinador</label>
                <select
                  value={form.coordinador}
                  onChange={(e) => handleChange("coordinador", e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                >
                  <option className="text-black" value="">
                    Sin coordinador
                  </option>
                  {coordinadoresDisponibles.map((u) => (
                    <option key={u.id} className="text-black" value={u.nombre}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="crm-label mb-2 block">Supervisor</label>
                <select
                  value={form.supervisor}
                  onChange={(e) => handleChange("supervisor", e.target.value)}
                  className="crm-input w-full px-4 py-3 outline-none"
                  style={{ color: "inherit" }}
                >
                  <option className="text-black" value="">
                    Sin supervisor
                  </option>
                  {supervisoresDisponibles.map((u) => (
                    <option key={u.id} className="text-black" value={u.nombre}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="crm-panel-soft p-4">
              <div className="mb-3 flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-amber-500" />
                <p className="crm-label">Campañas asignadas</p>
              </div>

              {form.rol === "Gerente" ? (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-100 px-4 py-3 text-sm text-amber-800">
                  El rol Gerente tiene acceso global, no necesita campañas asignadas.
                </div>
              ) : campaignNames.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {campaignNames.map((campaña) => {
                    const checked = form.allowedCampaigns.includes(campaña);

                    return (
                      <button
                        key={campaña}
                        type="button"
                        onClick={() => toggleCampaign(campaña)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          checked
                            ? "border-cyan-400/30 bg-cyan-100"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-sm font-medium" style={{ color: "inherit" }}>
                          {campaña}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: "inherit" }}>
                          {checked ? "Asignada" : "Agregar"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="crm-muted">No hay campañas disponibles.</p>
              )}
            </div>

            <div className="crm-panel-soft p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-500" />
                <p className="crm-label">Menús visibles por rol</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {menusPreview.length > 0 ? (
                  menusPreview.map((menu) => (
                    <span
                      key={menu}
                      className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5"
                      style={{ color: "inherit" }}
                    >
                      {menu}
                    </span>
                  ))
                ) : (
                  <p className="crm-muted">Este rol no tiene menús visibles en este momento.</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={guardarUsuario}
                disabled={!puedeGestionar || loading}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${
                  puedeGestionar
                    ? "border-emerald-400/30 bg-emerald-200 text-slate-900 hover:bg-emerald-300"
                    : "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <Save className="h-4 w-4" />
                {mode === "create" ? "Crear usuario" : "Guardar cambios"}
              </button>

              <button
                onClick={resetForm}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className="h-4 w-4" />
                Restaurar
              </button>

              {mode === "edit" && selectedUser ? (
                <>
                  <button
                    onClick={() => toggleEstadoUsuario(selectedUser)}
                    disabled={!puedeGestionar || currentUser?.id === selectedUser.id || loading}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${
                      !puedeGestionar || currentUser?.id === selectedUser.id
                        ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500"
                        : selectedUser.estado === "Activo"
                          ? "border-amber-500/30 bg-amber-200 text-slate-900 hover:bg-amber-300"
                          : "border-emerald-500/30 bg-emerald-200 text-slate-900 hover:bg-emerald-300"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {selectedUser.estado === "Activo" ? (
                      <Ban className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {selectedUser.estado === "Activo" ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    onClick={() => eliminarUsuario(selectedUser.id, selectedUser.nombre)}
                    disabled={!puedeGestionar || currentUser?.id === selectedUser.id || loading}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-medium transition ${
                      !puedeGestionar || currentUser?.id === selectedUser.id
                        ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500"
                        : "border-red-950 bg-red-950 text-red-100 hover:bg-red-900"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </>
              ) : null}
            </div>

            {!puedeGestionar ? (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-100 px-4 py-3 text-sm text-amber-800">
                Solo Gerente o Admin pueden gestionar usuarios.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
