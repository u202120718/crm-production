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
  Wrench,
  AlertTriangle,
  Power,
  Eye,
  Clock3,
  Sparkles,
  Server,
  CircleCheckBig,
  ChevronRight,
} from "lucide-react";
import {
  ALL_MENUS,
  DEFAULT_ROLE_MENUS,
  applyServerRoleMenuConfig,
} from "../lib/rbac";

const APP_SETTINGS_KEY = "crm_app_settings_v1";
const COMPANY_SETTINGS_KEY = "crm_company_settings_v1";
const ROLE_MENU_CONFIG_VERSION_STORAGE_KEY = "crm_role_menu_config_version_v1";

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

const defaultMaintenanceSettings = {
  enabled: false,
  title: "Sistema temporalmente en mantenimiento",
  message:
    "Estamos realizando mejoras programadas para optimizar el rendimiento y la estabilidad del CRM. Algunas funciones pueden estar temporalmente no disponibles.",
  level: "maintenance",
  showToRoles: ["Supervisor General", "Supervisor", "Backoffice", "Comercial"],
  expectedReturn: "",
  blockNavigation: false,
  blockMessage:
    "FUERA DE SERVICIO. El sistema se encuentra temporalmente bloqueado mientras realizamos trabajos de mantenimiento. Inténtalo nuevamente cuando finalice la intervención.",
};

const ROLE_ORDER = ["Gerente", "Admin", "Supervisor General", "Supervisor", "Backoffice", "Comercial"];

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
    throw new Error(data?.message || "No se pudo completar la solicitud.");
  }

  return data;
}

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
  disabled = false,
}) {
  return (
    <div className="crm-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="crm-heading text-lg">{role}</p>
          <p className="crm-muted text-sm">Menús activos: {menus.length}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectAll(role)}
            className="rounded-xl border border-emerald-400/30 bg-emerald-200 px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Todos
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onClearAll(role)}
            className="rounded-xl border border-rose-400/30 bg-rose-200 px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Ninguno
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onResetDefault(role)}
            className="rounded-xl border border-slate-300 bg-slate-200 px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
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
              disabled={disabled}
              onClick={() => onToggle(role, menu)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                checked
                  ? "border-cyan-400/30 bg-cyan-100"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className="text-sm font-medium" style={{ color: "inherit" }}>
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

      <style>{`
        .config-saas-hero {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border: 1px solid rgba(56,189,248,.18);
          border-radius: 24px;
          background:
            radial-gradient(circle at 80% 10%, rgba(34,211,238,.15), transparent 28%),
            radial-gradient(circle at 20% 120%, rgba(139,92,246,.16), transparent 30%),
            linear-gradient(135deg,#07111f,#0f1d35 56%,#132448);
          padding: 26px 28px;
          color: #fff;
          box-shadow: 0 18px 45px rgba(2,6,23,.14);
        }
        .config-saas-hero-copy { max-width: 760px; }
        .config-saas-eyebrow { display:flex; align-items:center; gap:7px; color:#67e8f9; font-size:10px; font-weight:950; letter-spacing:.16em; }
        .config-saas-hero h2 { margin:8px 0 0; font-size:28px; line-height:1.05; font-weight:950; letter-spacing:-.03em; }
        .config-saas-hero p { margin:9px 0 0; max-width:720px; color:#cbd5e1; font-size:12px; line-height:1.55; }
        .config-saas-health { min-width:210px; display:flex; align-items:center; gap:10px; border:1px solid rgba(255,255,255,.12); border-radius:17px; background:rgba(255,255,255,.06); padding:12px 14px; backdrop-filter:blur(12px); }
        .config-saas-health > div:nth-child(2) { flex:1; }
        .config-saas-health span,.config-saas-health strong { display:block; }
        .config-saas-health span { color:#94a3b8; font-size:9px; font-weight:800; text-transform:uppercase; }
        .config-saas-health strong { margin-top:2px; color:#fff; font-size:13px; }
        .config-health-dot { width:10px; height:10px; border-radius:50%; background:#22c55e; box-shadow:0 0 0 5px rgba(34,197,94,.12); }
        .config-health-dot.warning { background:#f59e0b; box-shadow:0 0 0 5px rgba(245,158,11,.14); }
        .config-kpi-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px; }
        .config-kpi-card { position:relative; overflow:hidden; min-height:110px; }
        .config-kpi-card::after { content:""; position:absolute; width:70px; height:70px; right:-20px; bottom:-30px; border-radius:50%; background:rgba(34,211,238,.08); }
        .config-kpi-card span { display:block; margin-top:6px; color:var(--crm-muted, #64748b); font-size:10px; font-weight:700; }
        .config-kpi-card.maintenance-on { border-color:rgba(245,158,11,.42)!important; background:linear-gradient(135deg,rgba(245,158,11,.10),rgba(251,146,60,.05)); }
        .maintenance-saas-panel { border:1px solid rgba(148,163,184,.18); border-radius:24px; background:var(--crm-panel, rgba(255,255,255,.98)); overflow:hidden; box-shadow:0 14px 35px rgba(15,23,42,.07); }
        .maintenance-saas-head { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:20px 22px; border-bottom:1px solid rgba(148,163,184,.14); background:linear-gradient(135deg,rgba(14,165,233,.05),rgba(139,92,246,.04)); }
        .maintenance-title-wrap { display:flex; align-items:flex-start; gap:12px; }
        .maintenance-icon { width:44px; height:44px; display:flex; align-items:center; justify-content:center; border:1px solid #cbd5e1; border-radius:14px; background:#f8fafc; color:#475569; }
        .maintenance-icon.active { border-color:#fbbf24; background:#fffbeb; color:#b45309; }
        .maintenance-title-wrap h3 { margin:4px 0 0; color:inherit; font-size:18px; font-weight:950; }
        .maintenance-title-wrap span { display:block; margin-top:3px; color:var(--crm-muted, #64748b); font-size:11px; }
        .maintenance-switch { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .maintenance-switch input { display:none; }
        .maintenance-switch-track { width:46px; height:26px; position:relative; border-radius:999px; background:#cbd5e1; transition:.2s ease; }
        .maintenance-switch-track i { position:absolute; top:4px; left:4px; width:18px; height:18px; border-radius:50%; background:#fff; box-shadow:0 2px 5px rgba(15,23,42,.18); transition:.2s ease; }
        .maintenance-switch.on .maintenance-switch-track { background:#f59e0b; }
        .maintenance-switch.on .maintenance-switch-track i { transform:translateX(20px); }
        .maintenance-switch strong { font-size:11px; }
        .maintenance-saas-grid { display:grid; grid-template-columns:minmax(0,1.22fr) minmax(340px,.78fr); gap:18px; padding:20px; }
        .maintenance-config-card,.maintenance-preview-card { border:1px solid rgba(148,163,184,.18); border-radius:18px; background:rgba(148,163,184,.035); padding:16px; }
        .maintenance-field { margin-bottom:14px; }
        .maintenance-field label,.maintenance-roles > label { display:block; margin-bottom:6px; color:var(--crm-muted,#64748b); font-size:10px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; }
        .maintenance-field input,.maintenance-field textarea,.maintenance-field select { width:100%; border:1px solid rgba(148,163,184,.32); border-radius:12px; background:var(--crm-input,#fff); color:inherit; padding:11px 12px; outline:none; font-size:12px; }
        .maintenance-field textarea { resize:vertical; min-height:118px; line-height:1.5; }
        .maintenance-field input:focus,.maintenance-field textarea:focus,.maintenance-field select:focus { border-color:#0ea5e9; box-shadow:0 0 0 3px rgba(14,165,233,.10); }
        .maintenance-field small { display:block; margin-top:5px; color:#94a3b8; font-size:9px; text-align:right; }
        .maintenance-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .maintenance-role-chips { display:flex; flex-wrap:wrap; gap:7px; }
        .maintenance-role-chips button { display:inline-flex; align-items:center; gap:6px; border:1px solid rgba(148,163,184,.28); border-radius:999px; background:rgba(148,163,184,.06); padding:7px 10px; font-size:10px; font-weight:800; }
        .maintenance-role-chips button.selected { border-color:#38bdf8; background:#e0f2fe; color:#075985; }
        .maintenance-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }
        .maintenance-save-btn,.maintenance-off-btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:40px; border-radius:12px; padding:0 13px; font-size:11px; font-weight:900; }
        .maintenance-save-btn { border:1px solid #22c55e; background:#16a34a; color:#fff; }
        .maintenance-off-btn { border:1px solid #fecaca; background:#fff1f2; color:#be123c; }
        .maintenance-preview-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px; }
        .maintenance-preview-head > div { display:flex; align-items:center; gap:7px; font-size:11px; font-weight:900; }
        .maintenance-status-pill { border:1px solid #cbd5e1; border-radius:999px; background:#f8fafc; color:#64748b; padding:5px 8px; font-size:8px; font-weight:950; letter-spacing:.08em; }
        .maintenance-status-pill.active { border-color:#fbbf24; background:#fffbeb; color:#92400e; }
        .maintenance-preview-alert { display:flex; align-items:flex-start; gap:12px; border:1px solid #fde68a; border-radius:16px; background:linear-gradient(135deg,#fffbeb,#fff7ed); padding:16px; color:#78350f; }
        .maintenance-preview-alert.info { border-color:#bae6fd; background:linear-gradient(135deg,#f0f9ff,#eff6ff); color:#075985; }
        .maintenance-preview-alert.critical { border-color:#fecaca; background:linear-gradient(135deg,#fff1f2,#fef2f2); color:#881337; }
        .maintenance-preview-icon { width:38px; height:38px; display:flex; align-items:center; justify-content:center; border-radius:12px; background:rgba(255,255,255,.60); flex:none; }
        .maintenance-preview-alert small { display:block; font-size:8px; font-weight:950; letter-spacing:.13em; }
        .maintenance-preview-alert h4 { margin:5px 0 0; font-size:15px; font-weight:950; line-height:1.15; }
        .maintenance-preview-alert p { margin:7px 0 0; font-size:11px; line-height:1.5; }
        .maintenance-return { display:flex; align-items:center; gap:6px; margin-top:10px; border-top:1px solid currentColor; padding-top:9px; font-size:9px; font-weight:850; opacity:.75; }
        .maintenance-preview-note { display:flex; align-items:flex-start; gap:9px; margin-top:12px; border:1px dashed rgba(148,163,184,.35); border-radius:14px; padding:12px; }
        .maintenance-preview-note strong,.maintenance-preview-note span { display:block; }
        .maintenance-preview-note strong { font-size:10px; }
        .maintenance-preview-note span { margin-top:2px; color:var(--crm-muted,#64748b); font-size:9px; line-height:1.4; }
        [data-crm-theme="night"] .maintenance-config-card,[data-crm-theme="night"] .maintenance-preview-card,[data-crm-theme="dark"] .maintenance-config-card,[data-crm-theme="dark"] .maintenance-preview-card { background:rgba(15,23,42,.50); }
        [data-crm-theme="night"] .maintenance-field input,[data-crm-theme="night"] .maintenance-field textarea,[data-crm-theme="night"] .maintenance-field select,[data-crm-theme="dark"] .maintenance-field input,[data-crm-theme="dark"] .maintenance-field textarea,[data-crm-theme="dark"] .maintenance-field select { background:#0f172a; color:#f8fafc; border-color:#334155; }
        [data-crm-theme="night"] .maintenance-role-chips button.selected,[data-crm-theme="dark"] .maintenance-role-chips button.selected { background:rgba(14,165,233,.14); color:#bae6fd; }
        @media (max-width:1350px) { .config-kpi-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } .maintenance-saas-grid { grid-template-columns:1fr; } }
        @media (max-width:900px) { .config-saas-hero { align-items:flex-start; flex-direction:column; } .config-saas-health { width:100%; } .config-kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .maintenance-saas-head { align-items:flex-start; flex-direction:column; } .maintenance-form-grid { grid-template-columns:1fr; } }
        @media (max-width:560px) { .config-kpi-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}


function MaintenancePreview({ settings }) {
  if (!settings?.enabled) return null;

  const tone =
    settings.level === "critical"
      ? "maintenance-preview critical"
      : settings.level === "maintenance"
        ? "maintenance-preview maintenance"
        : "maintenance-preview info";

  return (
    <div className={tone}>
      <div className="maintenance-preview-icon">
        <MonitorCog className="h-5 w-5" />
      </div>

      <div className="maintenance-preview-copy">
        <span className="maintenance-preview-kicker">
          {settings.level === "critical"
            ? "INCIDENCIA CRÍTICA"
            : settings.level === "maintenance"
              ? "MODO MANTENIMIENTO"
              : "AVISO DEL SISTEMA"}
        </span>

        <strong>{settings.title || "Sistema temporalmente en mantenimiento"}</strong>

        <p>
          {settings.message ||
            "Estamos realizando mejoras en la plataforma. Algunas funcionalidades pueden no estar disponibles temporalmente."}
        </p>

        {settings.estimatedReturn ? (
          <small>Disponibilidad estimada: {settings.estimatedReturn}</small>
        ) : null}
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
  const [menusLoading, setMenusLoading] = useState(false);

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

  const [maintenanceSettings, setMaintenanceSettings] = useState(
    defaultMaintenanceSettings
  );
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);

  const [roleMenus, setRoleMenus] = useState(DEFAULT_ROLE_MENUS);

  useEffect(() => {
    setProfileForm({
      nombre: currentUser?.nombre || "",
      email: currentUser?.email || "",
      dni: currentUser?.dni || "",
      password: currentUser?.password || "",
    });
  }, [currentUser]);

  const syncRoleMenus = (config) => {
    const normalized = applyServerRoleMenuConfig(config || DEFAULT_ROLE_MENUS);
    setRoleMenus(normalized);
    return normalized;
  };

  useEffect(() => {
    let mounted = true;

    async function cargarMenusRol() {
      try {
        setMenusLoading(true);
        const data = await apiFetch("/settings/role-menus");
        if (!mounted) return;

        syncRoleMenus(data?.config || DEFAULT_ROLE_MENUS);
      } catch {
        if (!mounted) return;
        syncRoleMenus(DEFAULT_ROLE_MENUS);
      } finally {
        if (mounted) setMenusLoading(false);
      }
    }

    if (currentUser) {
      cargarMenusRol();
    }

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;

    async function cargarMantenimiento() {
      try {
        setMaintenanceLoading(true);
        const data = await apiFetch("/settings/maintenance");
        if (!mounted) return;

        setMaintenanceSettings({
          ...defaultMaintenanceSettings,
          ...(data?.settings || {}),
        });
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.message ||
            "No se pudo cargar la configuración global de mantenimiento."
        );
      } finally {
        if (mounted) setMaintenanceLoading(false);
      }
    }

    if (currentUser) {
      cargarMantenimiento();
    }

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const resumen = useMemo(() => {
    return {
      usuarios: users.length,
      campañas: campaigns.length,
      leads: leads.length,
      ventas: ventas.length,
      mantenimiento: maintenanceSettings.enabled,
    };
  }, [users, campaigns, leads, ventas, maintenanceSettings.enabled]);

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
    localStorage.setItem(MAINTENANCE_SETTINGS_KEY, JSON.stringify(maintenanceSettings));

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
    setMaintenanceSettings(defaultMaintenanceSettings);

    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(defaultAppSettings));
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(defaultCompanySettings));
    localStorage.setItem(MAINTENANCE_SETTINGS_KEY, JSON.stringify(defaultMaintenanceSettings));

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
      maintenanceSettings,
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

      if (data.maintenanceSettings) {
        const nextMaintenanceSettings = {
          ...defaultMaintenanceSettings,
          ...data.maintenanceSettings,
        };
        setMaintenanceSettings(nextMaintenanceSettings);
        localStorage.setItem(
          MAINTENANCE_SETTINGS_KEY,
          JSON.stringify(nextMaintenanceSettings)
        );

        window.dispatchEvent(
          new CustomEvent("crm-maintenance-change", {
            detail: nextMaintenanceSettings,
          })
        );
      }

      if (data.roleMenus && puedeGestionarMenus) {
        const response = await apiFetch("/settings/role-menus", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ config: data.roleMenus }),
        });

        syncRoleMenus(response?.config || DEFAULT_ROLE_MENUS);
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
    localStorage.removeItem(ROLE_MENU_CONFIG_VERSION_STORAGE_KEY);

    setMessage("Datos locales eliminados. Recarga la aplicación para volver al estado inicial.");
  };

  const toggleMaintenanceRole = (role) => {
    setMaintenanceSettings((prev) => {
      const current = Array.isArray(prev.showToRoles) ? prev.showToRoles : [];
      return {
        ...prev,
        showToRoles: current.includes(role)
          ? current.filter((item) => item !== role)
          : [...current, role],
      };
    });
  };

  const persistirMantenimiento = async (nextSettings) => {
    const data = await apiFetch("/settings/maintenance", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextSettings),
    });

    const saved = {
      ...defaultMaintenanceSettings,
      ...(data?.settings || nextSettings),
    };

    setMaintenanceSettings(saved);

    window.dispatchEvent(
      new CustomEvent("crm-maintenance-change", {
        detail: saved,
      })
    );

    return saved;
  };

  const guardarMantenimiento = async () => {
    limpiarMensajes();

    if (!["Gerente", "Admin"].includes(currentUser?.rol)) {
      setError("Solo Gerente o Admin pueden modificar el modo mantenimiento.");
      return;
    }

    if (maintenanceSettings.enabled && !maintenanceSettings.message.trim()) {
      setError("Escribe el motivo o mensaje que verá el equipo.");
      return;
    }

    if (
      maintenanceSettings.blockNavigation &&
      !maintenanceSettings.blockMessage.trim()
    ) {
      setError("Escribe el mensaje que aparecerá cuando los menús estén bloqueados.");
      return;
    }

    if (!maintenanceSettings.showToRoles?.length) {
      setError("Selecciona al menos un rol que recibirá el mantenimiento.");
      return;
    }

    try {
      setMaintenanceSaving(true);

      const payload = {
        ...maintenanceSettings,
        title:
          maintenanceSettings.title.trim() ||
          defaultMaintenanceSettings.title,
        message: maintenanceSettings.message.trim(),
        blockMessage:
          maintenanceSettings.blockMessage.trim() ||
          defaultMaintenanceSettings.blockMessage,
      };

      const saved = await persistirMantenimiento(payload);

      setMessage(
        saved.enabled
          ? saved.blockNavigation
            ? "Mantenimiento activado en producción. El aviso y el bloqueo de navegación ya están activos para los roles seleccionados."
            : "Mantenimiento activado en producción. El aviso ya está visible para los roles seleccionados."
          : "Modo mantenimiento desactivado en producción."
      );
    } catch (err) {
      setError(
        err?.message ||
          "No se pudo guardar la configuración global de mantenimiento."
      );
    } finally {
      setMaintenanceSaving(false);
    }
  };

  const desactivarMantenimiento = async () => {
    limpiarMensajes();

    try {
      setMaintenanceSaving(true);
      const saved = await persistirMantenimiento({
        ...maintenanceSettings,
        enabled: false,
        blockNavigation: false,
      });

      setMessage("Modo mantenimiento y bloqueo desactivados en producción.");
      return saved;
    } catch (err) {
      setError(err?.message || "No se pudo desactivar el mantenimiento.");
    } finally {
      setMaintenanceSaving(false);
    }
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
      [role]: [...(DEFAULT_ROLE_MENUS[role] || [])],
    }));
  };

  const guardarMenusPorRol = async () => {
    limpiarMensajes();

    if (!puedeGestionarMenus) {
      setError("No tienes permisos para modificar accesos por rol.");
      return;
    }

    try {
      setMenusLoading(true);

      const data = await apiFetch("/settings/role-menus", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config: roleMenus }),
      });

      syncRoleMenus(data?.config || DEFAULT_ROLE_MENUS);
      setMessage("Accesos por rol guardados correctamente.");
    } catch (err) {
      setError(err.message || "No se pudieron guardar los accesos por rol.");
    } finally {
      setMenusLoading(false);
    }
  };

  const restaurarMenusPorRol = async () => {
    limpiarMensajes();

    if (!puedeGestionarMenus) {
      setError("No tienes permisos para modificar accesos por rol.");
      return;
    }

    try {
      setMenusLoading(true);

      const data = await apiFetch("/settings/role-menus/reset", {
        method: "POST",
      });

      syncRoleMenus(data?.config || DEFAULT_ROLE_MENUS);
      setMessage("Accesos por rol restablecidos a su valor por defecto.");
    } catch (err) {
      setError(err.message || "No se pudieron restablecer los accesos por rol.");
    } finally {
      setMenusLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="config-saas-hero">
        <div className="config-saas-hero-copy">
          <div className="config-saas-eyebrow">
            <Sparkles className="h-4 w-4" />
            SYSTEM CONTROL CENTER
          </div>
          <h2>Configuración y control operativo</h2>
          <p>
            Administra identidad, experiencia visual, permisos, mantenimiento, seguridad y respaldo desde un único centro de control.
          </p>
        </div>

        <div className="config-saas-health">
          <div className={`config-health-dot ${maintenanceSettings.enabled ? "warning" : "online"}`} />
          <div>
            <span>Estado de plataforma</span>
            <strong>{maintenanceSettings.enabled ? "Mantenimiento" : "Operativa"}</strong>
          </div>
          <Server className="h-5 w-5" />
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

      <div className="config-kpi-grid">
        <div className="crm-panel config-kpi-card p-5">
          <p className="crm-label">Usuarios</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: "inherit" }}>
            {resumen.usuarios}
          </p>
        </div>

        <div className="crm-panel config-kpi-card p-5">
          <p className="crm-label">Campañas</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: "inherit" }}>
            {resumen.campañas}
          </p>
        </div>

        <div className="crm-panel config-kpi-card p-5">
          <p className="crm-label">Leads</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: "inherit" }}>
            {resumen.leads}
          </p>
        </div>

        <div className="crm-panel config-kpi-card p-5">
          <p className="crm-label">Ventas</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: "inherit" }}>
            {resumen.ventas}
          </p>
          <span>Registros operativos</span>
        </div>

        <div className={`crm-panel config-kpi-card p-5 ${resumen.mantenimiento ? "maintenance-on" : ""}`}>
          <p className="crm-label">Sistema</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xl font-black" style={{ color: "inherit" }}>
              {resumen.mantenimiento ? "Mantenimiento" : "Operativo"}
            </p>
            {resumen.mantenimiento ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <CircleCheckBig className="h-5 w-5 text-emerald-500" />
            )}
          </div>
          <span>Estado general</span>
        </div>
      </div>

      <section className="maintenance-saas-panel">
        <div className="maintenance-saas-head">
          <div className="maintenance-title-wrap">
            <div className={`maintenance-icon ${maintenanceSettings.enabled ? "active" : ""}`}>
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="config-saas-eyebrow">OPERACIÓN Y CONTINUIDAD</p>
              <h3>Modo mantenimiento</h3>
              <span>Publica un aviso controlado cuando el CRM esté en cambios, actualización o intervención técnica.</span>
            </div>
          </div>

          <label className={`maintenance-switch ${maintenanceSettings.enabled ? "on" : ""}`}>
            <input
              type="checkbox"
              checked={Boolean(maintenanceSettings.enabled)}
              onChange={(e) =>
                setMaintenanceSettings((prev) => ({
                  ...prev,
                  enabled: e.target.checked,
                }))
              }
            />
            <span className="maintenance-switch-track"><i /></span>
            <strong>{maintenanceSettings.enabled ? "Activado" : "Desactivado"}</strong>
          </label>
        </div>

        {maintenanceLoading ? (
          <div className="maintenance-production-loading">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            Sincronizando configuración con el servidor...
          </div>
        ) : null}

        <div className="maintenance-saas-grid">
          <div className="maintenance-config-card">
            <div className="maintenance-field">
              <label>Título del aviso</label>
              <input
                value={maintenanceSettings.title}
                onChange={(e) =>
                  setMaintenanceSettings((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ej.: Actualización programada del sistema"
              />
            </div>

            <div className="maintenance-field">
              <label>Motivo / mensaje visible para el equipo</label>
              <textarea
                value={maintenanceSettings.message}
                onChange={(e) =>
                  setMaintenanceSettings((prev) => ({ ...prev, message: e.target.value }))
                }
                rows={5}
                placeholder="Escribe aquí por qué el sistema no se encuentra operativo, qué trabajos se están realizando y cuándo estimas restablecerlo..."
              />
              <small>{maintenanceSettings.message.length}/600 caracteres recomendados</small>
            </div>

            <div className="maintenance-form-grid">
              <div className="maintenance-field">
                <label>Nivel del aviso</label>
                <select
                  value={maintenanceSettings.level}
                  onChange={(e) =>
                    setMaintenanceSettings((prev) => ({ ...prev, level: e.target.value }))
                  }
                >
                  <option value="info">Informativo</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="critical">Interrupción crítica</option>
                </select>
              </div>

              <div className="maintenance-field">
                <label>Retorno estimado (opcional)</label>
                <input
                  type="datetime-local"
                  value={maintenanceSettings.expectedReturn || ""}
                  onChange={(e) =>
                    setMaintenanceSettings((prev) => ({
                      ...prev,
                      expectedReturn: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="maintenance-roles">
              <label>Mostrar aviso a</label>
              <div className="maintenance-role-chips">
                {ROLE_ORDER.map((role) => {
                  const checked = maintenanceSettings.showToRoles.includes(role);
                  return (
                    <button
                      type="button"
                      key={role}
                      onClick={() => toggleMaintenanceRole(role)}
                      className={checked ? "selected" : ""}
                    >
                      {checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="maintenance-lock-card">
              <div className="maintenance-lock-head">
                <div>
                  <span className="maintenance-lock-kicker">BLOQUEO OPERATIVO</span>
                  <strong>Bloquear navegación durante el mantenimiento</strong>
                  <p>
                    Cuando esté activo, los roles seleccionados no podrán utilizar los menús del CRM.
                  </p>
                </div>

                <label
                  className={`maintenance-switch ${
                    maintenanceSettings.blockNavigation ? "on" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(maintenanceSettings.blockNavigation)}
                    onChange={(e) =>
                      setMaintenanceSettings((prev) => ({
                        ...prev,
                        blockNavigation: e.target.checked,
                      }))
                    }
                  />
                  <span className="maintenance-switch-track">
                    <i />
                  </span>
                  <strong>
                    {maintenanceSettings.blockNavigation
                      ? "Bloqueado"
                      : "Permitido"}
                  </strong>
                </label>
              </div>

              {maintenanceSettings.blockNavigation ? (
                <div className="maintenance-field maintenance-block-message">
                  <label>Mensaje cuando intenten acceder</label>
                  <textarea
                    rows={3}
                    value={maintenanceSettings.blockMessage || ""}
                    onChange={(e) =>
                      setMaintenanceSettings((prev) => ({
                        ...prev,
                        blockMessage: e.target.value,
                      }))
                    }
                    placeholder="Ej.: FUERA DE SERVICIO. Estamos realizando una actualización del sistema..."
                  />
                  <small>
                    Este texto reemplazará el contenido de los módulos bloqueados.
                  </small>
                </div>
              ) : null}
            </div>

            <div className="maintenance-actions">
              <button
                type="button"
                onClick={guardarMantenimiento}
                disabled={maintenanceSaving}
                className="maintenance-save-btn"
              >
                <Save className="h-4 w-4" />
                {maintenanceSaving ? "Guardando..." : "Guardar configuración"}
              </button>

              {maintenanceSettings.enabled ? (
                <button
                  type="button"
                  onClick={desactivarMantenimiento}
                  className="maintenance-off-btn"
                >
                  <Power className="h-4 w-4" />
                  Desactivar mantenimiento
                </button>
              ) : null}
            </div>
          </div>

          <div className="maintenance-preview-card">
            <div className="maintenance-preview-head">
              <div>
                <Eye className="h-4 w-4" />
                Vista previa
              </div>
              <span className={`maintenance-status-pill ${maintenanceSettings.enabled ? "active" : ""}`}>
                {maintenanceSettings.enabled ? "VISIBLE" : "BORRADOR"}
              </span>
            </div>

            <div className={`maintenance-preview-alert ${maintenanceSettings.level}`}>
              <div className="maintenance-preview-icon">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <small>AVISO DEL SISTEMA</small>
                <h4>{maintenanceSettings.title || "Sistema temporalmente en mantenimiento"}</h4>
                <p>{maintenanceSettings.message || "Escribe el mensaje que verá el equipo."}</p>

                {maintenanceSettings.expectedReturn ? (
                  <div className="maintenance-return">
                    <Clock3 className="h-4 w-4" />
                    Retorno estimado: {new Date(maintenanceSettings.expectedReturn).toLocaleString()}
                  </div>
                ) : null}
              </div>
            </div>

            {maintenanceSettings.blockNavigation ? (
              <div className="maintenance-block-preview">
                <LockKeyhole className="h-5 w-5" />
                <div>
                  <strong>Menús bloqueados</strong>
                  <span>
                    {maintenanceSettings.blockMessage ||
                      defaultMaintenanceSettings.blockMessage}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="maintenance-preview-note">
              <ShieldCheck className="h-4 w-4" />
              <div>
                <strong>Recomendación</strong>
                <span>En producción, Gerente y Admin conservarán únicamente acceso a Configuración para poder desactivar el bloqueo. El resto de menús quedará fuera de servicio cuando actives el bloqueo.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                Desde aquí puedes decidir qué menús verá cada rol.
              </p>
            </div>
          </div>
        </div>

        {puedeGestionarMenus ? (
          <>
            {menusLoading ? (
              <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700">
                Cargando accesos por rol...
              </div>
            ) : null}

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
                  disabled={menusLoading}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={guardarMenusPorRol}
                disabled={menusLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {menusLoading ? "Guardando..." : "Guardar accesos por rol"}
              </button>

              <button
                onClick={restaurarMenusPorRol}
                disabled={menusLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
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
              Los accesos por rol ahora se guardan en backend y se sincronizan con el frontend.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .maintenance-admin-panel {
          padding: 20px;
          overflow: hidden;
        }

        .maintenance-admin-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .maintenance-admin-title {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .maintenance-admin-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: linear-gradient(135deg,#0ea5e9,#7c3aed);
          color: #fff;
          box-shadow: 0 8px 24px rgba(14,165,233,.18);
        }

        .maintenance-switch {
          min-width: 116px;
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(148,163,184,.28);
          border-radius: 999px;
          background: rgba(148,163,184,.10);
          padding: 0 14px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 900;
        }

        .maintenance-switch input {
          accent-color: #10b981;
        }

        .maintenance-switch.active {
          border-color: rgba(16,185,129,.35);
          background: rgba(16,185,129,.12);
          color: #047857;
        }

        .maintenance-form-grid {
          display: grid;
          grid-template-columns: minmax(0,1.35fr) minmax(220px,.65fr);
          gap: 14px;
        }

        .maintenance-role-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .maintenance-role-chip {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(148,163,184,.28);
          border-radius: 12px;
          background: rgba(148,163,184,.08);
          padding: 0 11px;
          font-size: 10px;
          font-weight: 850;
          transition: .18s ease;
        }

        .maintenance-role-chip.active {
          border-color: rgba(6,182,212,.35);
          background: rgba(6,182,212,.12);
          color: #0891b2;
        }

        .maintenance-preview-wrap {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid rgba(148,163,184,.16);
        }

        .maintenance-preview {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-radius: 16px;
          padding: 14px 16px;
        }

        .maintenance-preview.info {
          border: 1px solid #93c5fd;
          background: #eff6ff;
          color: #1e3a8a;
        }

        .maintenance-preview.maintenance {
          border: 1px solid #fbbf24;
          background: #fffbeb;
          color: #92400e;
        }

        .maintenance-preview.critical {
          border: 1px solid #fda4af;
          background: #fff1f2;
          color: #9f1239;
        }

        .maintenance-preview-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
          border-radius: 12px;
          background: rgba(255,255,255,.65);
        }

        .maintenance-preview-copy {
          min-width: 0;
        }

        .maintenance-preview-kicker,
        .maintenance-preview-copy strong,
        .maintenance-preview-copy p,
        .maintenance-preview-copy small {
          display: block;
        }

        .maintenance-preview-kicker {
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .12em;
        }

        .maintenance-preview-copy strong {
          margin-top: 3px;
          font-size: 14px;
          font-weight: 950;
        }

        .maintenance-preview-copy p {
          margin-top: 5px;
          font-size: 11px;
          line-height: 1.45;
        }

        .maintenance-preview-copy small {
          margin-top: 6px;
          font-size: 9px;
          font-weight: 800;
          opacity: .78;
        }

        .maintenance-preview-empty {
          border: 1px dashed rgba(148,163,184,.30);
          border-radius: 14px;
          padding: 14px;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }

        .maintenance-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 15px;
        }

        .maintenance-save-btn,
        .maintenance-disable-btn {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border-radius: 12px;
          padding: 0 14px;
          font-size: 11px;
          font-weight: 900;
        }

        .maintenance-save-btn {
          border: 1px solid #34d399;
          background: #059669;
          color: #fff;
        }

        .maintenance-disable-btn {
          border: 1px solid #cbd5e1;
          background: #f1f5f9;
          color: #334155;
        }

        [data-crm-theme="night"] .maintenance-preview.maintenance,
        [data-crm-theme="dark"] .maintenance-preview.maintenance {
          background: rgba(120,53,15,.35);
          border-color: rgba(251,191,36,.45);
          color: #fde68a;
        }

        [data-crm-theme="night"] .maintenance-preview.info,
        [data-crm-theme="dark"] .maintenance-preview.info {
          background: rgba(30,64,175,.28);
          border-color: rgba(96,165,250,.45);
          color: #dbeafe;
        }

        [data-crm-theme="night"] .maintenance-preview.critical,
        [data-crm-theme="dark"] .maintenance-preview.critical {
          background: rgba(136,19,55,.28);
          border-color: rgba(251,113,133,.45);
          color: #ffe4e6;
        }

        @media (max-width: 900px) {
          .maintenance-admin-head {
            flex-direction: column;
          }

          .maintenance-form-grid {
            grid-template-columns: 1fr;
          }
        }

        .maintenance-production-loading {
          display:flex;
          align-items:center;
          gap:8px;
          margin:0 0 12px;
          border:1px solid rgba(56,189,248,.24);
          border-radius:12px;
          background:rgba(56,189,248,.08);
          padding:9px 11px;
          color:var(--crm-text,#334155);
          font-size:10px;
          font-weight:800;
        }

        .maintenance-lock-card {
          margin-top:14px;
          border:1px solid rgba(244,63,94,.22);
          border-radius:16px;
          background:linear-gradient(135deg,rgba(244,63,94,.06),rgba(245,158,11,.05));
          padding:14px;
        }

        .maintenance-lock-head {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:14px;
        }

        .maintenance-lock-kicker {
          display:block;
          color:#e11d48;
          font-size:9px;
          font-weight:950;
          letter-spacing:.13em;
        }

        .maintenance-lock-head > div > strong {
          display:block;
          margin-top:4px;
          font-size:12px;
          font-weight:950;
        }

        .maintenance-lock-head > div > p {
          margin:4px 0 0;
          color:var(--crm-muted,#64748b);
          font-size:10px;
          line-height:1.4;
        }

        .maintenance-block-message {
          margin-top:12px;
          margin-bottom:0 !important;
        }

        .maintenance-block-preview {
          display:flex;
          align-items:flex-start;
          gap:9px;
          margin-top:12px;
          border:1px solid rgba(244,63,94,.26);
          border-radius:14px;
          background:rgba(244,63,94,.08);
          padding:12px;
        }

        .maintenance-block-preview svg {
          flex:none;
          color:#e11d48;
        }

        .maintenance-block-preview strong,
        .maintenance-block-preview span {
          display:block;
        }

        .maintenance-block-preview strong {
          color:#be123c;
          font-size:10px;
          font-weight:950;
        }

        .maintenance-block-preview span {
          margin-top:3px;
          color:var(--crm-muted,#64748b);
          font-size:9px;
          line-height:1.4;
        }

        [data-crm-theme="night"] .maintenance-lock-card,
        [data-crm-theme="neon"] .maintenance-lock-card {
          background:linear-gradient(135deg,rgba(159,18,57,.18),rgba(120,53,15,.14));
          border-color:rgba(251,113,133,.28);
        }

        [data-crm-theme="night"] .maintenance-lock-kicker,
        [data-crm-theme="neon"] .maintenance-lock-kicker,
        [data-crm-theme="night"] .maintenance-block-preview strong,
        [data-crm-theme="neon"] .maintenance-block-preview strong {
          color:#fda4af;
        }

        @media(max-width:760px) {
          .maintenance-lock-head {
            flex-direction:column;
          }
        }

      `}</style>

    </div>
  );
}
