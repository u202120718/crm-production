import { useEffect, useMemo, useRef, useState } from "react";
import {
  Settings,
  UserRound,
  ShieldCheck,
  Palette,
  Save,
  RefreshCcw,
  Upload,
  Download,
  Trash2,
  Building2,
  Mail,
  Phone,
  MonitorCog,
  LayoutDashboard,
  CheckSquare,
  Square,
  LockKeyhole,
} from "lucide-react";
import {
  ALL_MENUS,
  DEFAULT_ROLE_MENUS,
  getRoleMenuConfig,
  saveRoleMenuConfig,
  resetRoleMenuConfig,
} from "../lib/rbac";

const APP_SETTINGS_KEY = "crm_app_settings_v1";
const COMPANY_SETTINGS_KEY = "crm_company_settings_v1";

const defaultAppSettings = {
  theme: "night",
  rememberLastSection: true,
  showWelcomePhrase: true,
  compactCards: false,
  defaultVentaEstado: "Pendiente",
};

const defaultCompanySettings = {
  brandName: "CRM Solutions",
  slogan: "Tecnología Avanzada",
  supportEmail: "",
  supportPhone: "",
};

const ROLE_ORDER = ["Gerente", "Admin", "Supervisor", "Backoffice", "Comercial"];

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function RoleMenuCard({
  role,
  menus,
  onToggle,
  onSelectAll,
  onClearAll,
  onResetDefault,
}) {
  return (
    <div className="crm-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="crm-heading text-lg">{role}</p>
          <p className="crm-muted text-sm">
            Menús activos: {menus.length}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectAll(role)}
            className="rounded-xl border border-emerald-400/30 bg-emerald-200 px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-emerald-300"
          >
            Todos
          </button>

          <button
            onClick={() => onClearAll(role)}
            className="rounded-xl border border-rose-400/30 bg-rose-200 px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-rose-300"
          >
            Ninguno
          </button>

          <button
            onClick={() => onResetDefault(role)}
            className="rounded-xl border border-slate-300 bg-slate-200 px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-slate-300"
          >
            Default
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ALL_MENUS.map((menu) => {
          const checked = menus.includes(menu);

          return (
            <button
              key={menu}
              type="button"
              onClick={() => onToggle(role, menu)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                checked
                  ? "border-cyan-400/30 bg-cyan-100"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "inherit" }}
              >
                {menu}
              </span>

              {checked ? (
                <CheckSquare className="h-4 w-4 text-cyan-700" />
              ) : (
                <Square className="h-4 w-4 opacity-60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Configuracion({
  currentUser,
  users = [],
  setUsers,
  campaigns = [],
  leads = [],
  setLeads,
  ventas = [],
  setVentas,
}) {
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [profileForm, setProfileForm] = useState({
    nombre: currentUser?.nombre || "",
    email: currentUser?.email || "",
    dni: currentUser?.dni || "",
    password: currentUser?.password || "",
  });

  const [appSettings, setAppSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(APP_SETTINGS_KEY);
      return saved ? { ...defaultAppSettings, ...JSON.parse(saved) } : defaultAppSettings;
    } catch {
      return defaultAppSettings;
    }
  });

  const [companySettings, setCompanySettings] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPANY_SETTINGS_KEY);
      return saved ? { ...defaultCompanySettings, ...JSON.parse(saved) } : defaultCompanySettings;
    } catch {
      return defaultCompanySettings;
    }
  });

  const [roleMenus, setRoleMenus] = useState(() => getRoleMenuConfig());

  useEffect(() => {
    setProfileForm({
      nombre: currentUser?.nombre || "",
      email: currentUser?.email || "",
      dni: currentUser?.dni || "",
      password: currentUser?.password || "",
    });
  }, [currentUser]);

  const resumen = useMemo(() => {
    return {
      usuarios: users.length,
      campañas: campaigns.length,
      leads: leads.length,
      ventas: ventas.length,
    };
  }, [users, campaigns, leads, ventas]);

  const puedeGestionarMenus = ["Gerente", "Admin"].includes(currentUser?.rol);

  const limpiarMensajes = () => {
    setMessage("");
    setError("");
  };

  const guardarPerfil = () => {
    limpiarMensajes();

    if (!currentUser?.id) {
      setError("No se encontró el usuario actual.");
      return;
    }

    if (!profileForm.nombre.trim() || !profileForm.email.trim()) {
      setError("Completa nombre y correo.");
      return;
    }

    if (typeof setUsers === "function") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                nombre: profileForm.nombre.trim(),
                email: profileForm.email.trim(),
                dni: profileForm.dni.trim(),
                password: profileForm.password.trim(),
              }
            : u
        )
      );
    }

    setMessage("Perfil actualizado. Se reflejará completamente al volver a iniciar sesión.");
  };

  const guardarPreferencias = () => {
    limpiarMensajes();

    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(appSettings));
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(companySettings));

    window.dispatchEvent(
      new CustomEvent("crm-theme-change", {
        detail: appSettings.theme,
      })
    );

    setMessage("Configuración guardada correctamente.");
  };

  const restaurarPreferencias = () => {
    limpiarMensajes();

    setAppSettings(defaultAppSettings);
    setCompanySettings(defaultCompanySettings);

    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(defaultAppSettings));
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(defaultCompanySettings));

    window.dispatchEvent(
      new CustomEvent("crm-theme-change", {
        detail: defaultAppSettings.theme,
      })
    );

    setMessage("Configuración restablecida.");
  };

  const exportarBackup = () => {
    limpiarMensajes();

    const backup = {
      exportedAt: new Date().toISOString(),
      appSettings,
      companySettings,
      roleMenus,
      users,
      campaigns,
      leads,
      ventas,
    };

    downloadJson("crm_backup_local.json", backup);
    setMessage("Backup exportado.");
  };

  const importarBackup = async (event) => {
    limpiarMensajes();

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (Array.isArray(data.users) && typeof setUsers === "function") {
        setUsers(data.users);
        localStorage.setItem("crm_users_v1", JSON.stringify(data.users));
      }

      if (Array.isArray(data.leads) && typeof setLeads === "function") {
        setLeads(data.leads);
        localStorage.setItem("crm_leads_v1", JSON.stringify(data.leads));
      }

      if (Array.isArray(data.ventas) && typeof setVentas === "function") {
        setVentas(data.ventas);
        localStorage.setItem("crm_ventas_v1", JSON.stringify(data.ventas));
      }

      if (data.appSettings) {
        const nextAppSettings = { ...defaultAppSettings, ...data.appSettings };
        setAppSettings(nextAppSettings);
        localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(nextAppSettings));

        window.dispatchEvent(
          new CustomEvent("crm-theme-change", {
            detail: nextAppSettings.theme,
          })
        );
      }

      if (data.companySettings) {
        const nextCompanySettings = { ...defaultCompanySettings, ...data.companySettings };
        setCompanySettings(nextCompanySettings);
        localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(nextCompanySettings));
      }

      if (data.roleMenus) {
        const nextRoleMenus = saveRoleMenuConfig(data.roleMenus);
        setRoleMenus(nextRoleMenus);
        window.dispatchEvent(new CustomEvent("crm-role-menus-updated"));
      }

      setMessage("Backup importado correctamente.");
    } catch {
      setError("No se pudo importar el archivo.");
    } finally {
      event.target.value = "";
    }
  };

  const resetearDataLocal = () => {
    limpiarMensajes();

    const ok = window.confirm(
      "Esto borrará los datos locales guardados de usuarios, leads, ventas y configuración. ¿Deseas continuar?"
    );

    if (!ok) return;

    localStorage.removeItem("crm_users_v1");
    localStorage.removeItem("crm_leads_v1");
    localStorage.removeItem("crm_ventas_v1");
    localStorage.removeItem(APP_SETTINGS_KEY);
    localStorage.removeItem(COMPANY_SETTINGS_KEY);
    localStorage.removeItem("crm_role_menu_config_v1");

    setMessage("Datos locales eliminados. Recarga la aplicación para volver al estado inicial.");
  };

  const toggleRoleMenu = (role, menu) => {
    setRoleMenus((prev) => {
      const current = prev[role] || [];
      const exists = current.includes(menu);

      return {
        ...prev,
        [role]: exists
          ? current.filter((m) => m !== menu)
          : [...current, menu],
      };
    });
  };

  const selectAllRoleMenus = (role) => {
    setRoleMenus((prev) => ({
      ...prev,
      [role]: [...ALL_MENUS],
    }));
  };

  const clearAllRoleMenus = (role) => {
    setRoleMenus((prev) => ({
      ...prev,
      [role]: [],
    }));
  };

  const resetRoleMenusToDefault = (role) => {
    setRoleMenus((prev) => ({
      ...prev,
      [role]: [...DEFAULT_ROLE_MENUS[role]],
    }));
  };

  const guardarMenusPorRol = () => {
    limpiarMensajes();

    if (!puedeGestionarMenus) {
      setError("No tienes permisos para modificar accesos por rol.");
      return;
    }

    const saved = saveRoleMenuConfig(roleMenus);
    setRoleMenus(saved);

    window.dispatchEvent(new CustomEvent("crm-role-menus-updated"));
    setMessage("Accesos por rol guardados correctamente.");
  };

  const restaurarMenusPorRol = () => {
    limpiarMensajes();

    const restored = resetRoleMenuConfig();
    setRoleMenus(restored);

    window.dispatchEvent(new CustomEvent("crm-role-menus-updated"));
    setMessage("Accesos por rol restablecidos a su valor por defecto.");
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <div className="flex items-start gap-3">
          <Settings className="mt-1 h-5 w-5 text-cyan-500" />
          <div>
            <p className="crm-label">Configuración</p>
            <h2 className="crm-title mt-1 text-2xl">Ajustes del sistema</h2>
            <p className="crm-muted mt-2 text-sm">
              Configura perfil, tema visual, empresa, backups y accesos por rol de manera más profesional.
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
        <div className="crm-panel p-5">
          <p className="crm-label">Usuarios</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: "inherit" }}>
            {resumen.usuarios}
          </p>
        </div>

        <div className="crm-panel p-5">
          <p className="crm-label">Campañas</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: "inherit" }}>
            {resumen.campañas}
          </p>
        </div>

        <div className="crm-panel p-5">
          <p className="crm-label">Leads</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: "inherit" }}>
            {resumen.leads}
          </p>
        </div>

        <div className="crm-panel p-5">
          <p className="crm-label">Ventas</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: "inherit" }}>
            {resumen.ventas}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="crm-panel p-5">
          <div className="mb-4 flex items-center gap-3">
            <UserRound className="h-5 w-5 text-fuchsia-500" />
            <h3 className="crm-heading text-lg">Perfil del usuario</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="crm-label mb-2 block">Nombre</label>
              <input
                value={profileForm.nombre}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, nombre: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Correo</label>
              <input
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">DNI</label>
              <input
                value={profileForm.dni}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, dni: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Contraseña</label>
              <input
                type="text"
                value={profileForm.password}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
              />
            </div>
          </div>

          <button
            onClick={guardarPerfil}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-cyan-300"
          >
            <Save className="h-4 w-4" />
            Guardar perfil
          </button>
        </div>

        <div className="crm-panel p-5">
          <div className="mb-4 flex items-center gap-3">
            <Palette className="h-5 w-5 text-amber-500" />
            <h3 className="crm-heading text-lg">Preferencias visuales y operativas</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="crm-label mb-2 block">Tema</label>
              <select
                value={appSettings.theme}
                onChange={(e) =>
                  setAppSettings((prev) => ({ ...prev, theme: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
              >
                <option className="text-black" value="night">Noche</option>
                <option className="text-black" value="silver">Gris</option>
                <option className="text-black" value="light">Claro</option>
              </select>
            </div>

            <div>
              <label className="crm-label mb-2 block">Estado por defecto al crear venta</label>
              <select
                value={appSettings.defaultVentaEstado}
                onChange={(e) =>
                  setAppSettings((prev) => ({
                    ...prev,
                    defaultVentaEstado: e.target.value,
                  }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
              >
                <option className="text-black">Pendiente</option>
                <option className="text-black">Validación</option>
                <option className="text-black">Tramitada</option>
                <option className="text-black">Activada</option>
              </select>
            </div>

            <label className="crm-panel-soft flex items-center justify-between rounded-2xl p-4">
              <span className="crm-label">Recordar última sección</span>
              <input
                type="checkbox"
                checked={appSettings.rememberLastSection}
                onChange={(e) =>
                  setAppSettings((prev) => ({
                    ...prev,
                    rememberLastSection: e.target.checked,
                  }))
                }
              />
            </label>

            <label className="crm-panel-soft flex items-center justify-between rounded-2xl p-4">
              <span className="crm-label">Mostrar frase de bienvenida</span>
              <input
                type="checkbox"
                checked={appSettings.showWelcomePhrase}
                onChange={(e) =>
                  setAppSettings((prev) => ({
                    ...prev,
                    showWelcomePhrase: e.target.checked,
                  }))
                }
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={guardarPreferencias}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-300"
            >
              <ShieldCheck className="h-4 w-4" />
              Guardar configuración
            </button>

            <button
              onClick={restaurarPreferencias}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300"
            >
              <RefreshCcw className="h-4 w-4" />
              Restablecer
            </button>
          </div>
        </div>
      </div>

      <div className="crm-panel p-5">
        <div className="mb-4 flex items-center gap-3">
          <LayoutDashboard className="h-5 w-5 text-cyan-500" />
          <h3 className="crm-heading text-lg">Accesos por rol</h3>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-1 h-5 w-5 text-fuchsia-500" />
            <div>
              <p className="crm-label">Control centralizado de menús</p>
              <p className="crm-muted mt-1 text-sm">
                Desde aquí puedes decidir qué menús verá cada rol. Por ejemplo, puedes dar Dashboard al Comercial o quitar cualquier módulo al Gerente.
              </p>
            </div>
          </div>
        </div>

        {puedeGestionarMenus ? (
          <>
            <div className="grid gap-6">
              {ROLE_ORDER.map((role) => (
                <RoleMenuCard
                  key={role}
                  role={role}
                  menus={roleMenus[role] || []}
                  onToggle={toggleRoleMenu}
                  onSelectAll={selectAllRoleMenus}
                  onClearAll={clearAllRoleMenus}
                  onResetDefault={resetRoleMenusToDefault}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={guardarMenusPorRol}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-cyan-300"
              >
                <Save className="h-4 w-4" />
                Guardar accesos por rol
              </button>

              <button
                onClick={restaurarMenusPorRol}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300"
              >
                <RefreshCcw className="h-4 w-4" />
                Restaurar menús por defecto
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-100 px-4 py-3 text-sm text-amber-800">
            Solo Gerente o Admin pueden modificar accesos por rol.
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="crm-panel p-5">
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-cyan-500" />
            <h3 className="crm-heading text-lg">Datos de empresa</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="crm-label mb-2 block">Nombre comercial</label>
              <input
                value={companySettings.brandName}
                onChange={(e) =>
                  setCompanySettings((prev) => ({
                    ...prev,
                    brandName: e.target.value,
                  }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="crm-label mb-2 block">Slogan</label>
              <input
                value={companySettings.slogan}
                onChange={(e) =>
                  setCompanySettings((prev) => ({
                    ...prev,
                    slogan: e.target.value,
                  }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
                style={{ color: "inherit" }}
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Correo de soporte</label>
              <div className="crm-input flex items-center gap-2 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  value={companySettings.supportEmail}
                  onChange={(e) =>
                    setCompanySettings((prev) => ({
                      ...prev,
                      supportEmail: e.target.value,
                    }))
                  }
                  className="w-full bg-transparent outline-none"
                  style={{ color: "inherit" }}
                />
              </div>
            </div>

            <div>
              <label className="crm-label mb-2 block">Teléfono de soporte</label>
              <div className="crm-input flex items-center gap-2 px-4 py-3">
                <Phone className="h-4 w-4 text-slate-500" />
                <input
                  value={companySettings.supportPhone}
                  onChange={(e) =>
                    setCompanySettings((prev) => ({
                      ...prev,
                      supportPhone: e.target.value,
                    }))
                  }
                  className="w-full bg-transparent outline-none"
                  style={{ color: "inherit" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="crm-panel p-5">
          <div className="mb-4 flex items-center gap-3">
            <MonitorCog className="h-5 w-5 text-fuchsia-500" />
            <h3 className="crm-heading text-lg">Backup y mantenimiento local</h3>
          </div>

          <div className="grid gap-3">
            <button
              onClick={exportarBackup}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-cyan-300"
            >
              <Download className="h-4 w-4" />
              Exportar backup JSON
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-amber-300"
            >
              <Upload className="h-4 w-4" />
              Importar backup JSON
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={importarBackup}
            />

            <button
              onClick={resetearDataLocal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-rose-300"
            >
              <Trash2 className="h-4 w-4" />
              Borrar datos locales
            </button>
          </div>

          <div className="crm-panel-soft mt-4 p-4">
            <p className="crm-label">Nota</p>
            <p className="crm-muted mt-2 text-sm">
              Aquí ya puedes guardar configuración real, manejar accesos por rol y exportar/importar backup local.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
