import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import { getVisibleMenus } from "../lib/rbac";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  PhoneCall,
  CircleDollarSign,
  CalendarDays,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserRound,
  ClipboardPlus,
  Target,
  Moon,
  Sun,
  Palette,
  Menu,
  X,
  FolderKanban,
} from "lucide-react";

const menuItems = [
  { key: "Dashboard", label: "Dashboard", icon: LayoutDashboard, color: "violet" },
  { key: "Leads", label: "Leads", icon: Target, color: "cyan" },
  { key: "Clientes", label: "Clientes", icon: Users, color: "emerald" },
  { key: "Campanas", label: "Campañas", icon: BriefcaseBusiness, color: "amber" },
  { key: "Seguimiento", label: "Seguimiento", icon: PhoneCall, color: "sky" },
  { key: "Ventas", label: "Ventas", icon: CircleDollarSign, color: "green" },
  { key: "Cargar Venta", label: "Nuevo Contrato", icon: ClipboardPlus, color: "pink" },
  { key: "Agenda", label: "Agenda", icon: CalendarDays, color: "indigo" },
  { key: "Calidad", label: "Calidad", icon: ShieldCheck, color: "teal" },
  { key: "Reportes", label: "Reportes", icon: BarChart3, color: "orange" },
  { key: "Usuarios", label: "Usuarios", icon: UserRound, color: "purple" },
  { key: "Ranking", label: "Ranking", icon: Trophy, color: "yellow" },
  { key: "Configuracion", label: "Configuración", icon: Settings, color: "slate" },
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
    throw new Error(data?.message || `Error cargando ${url}`);
  }

  return data;
}

function safeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const str = String(value).trim();
  if (!str) return null;

  const iso = new Date(str);
  if (!Number.isNaN(iso.getTime())) return iso;

  const match = str.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (match) {
    const [, d, m, y, hh = "0", mm = "0", ss = "0"] = match;
    const year = y.length === 2 ? `20${y}` : y;
    const parsed = new Date(
      Number(year),
      Number(m) - 1,
      Number(d),
      Number(hh),
      Number(mm),
      Number(ss)
    );
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function getVentaDate(venta) {
  return (
    safeDate(venta?.fechaRegistro) ||
    safeDate([venta?.fecha, venta?.hora].filter(Boolean).join(" ")) ||
    safeDate(venta?.fecha) ||
    safeDate(venta?.created_at) ||
    null
  );
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "0.00%";
  return `${value.toFixed(2)}%`;
}

function getTheme(theme) {
  if (theme === "light") {
    return {
      app: "bg-[#f3f4f6] text-slate-900",
      sidebar: "bg-white/85 border-slate-200/80 text-slate-900 backdrop-blur-2xl",
      panelSoft: "bg-white/70 border-slate-200/80 text-slate-900",
      muted: "text-slate-500",
      main: "bg-[#eef1f5]",
      topbar: "bg-white/90 border-slate-200/80 backdrop-blur-2xl",
      button: "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700",
      userBox: "bg-white/70 border-slate-200/80",
      activityBox: "bg-white/70 border-slate-200/80",
      kpiBox: "bg-white/70 border-slate-200/80",
      overlay: "bg-black/30",
      glow1: "bg-sky-200/40",
      glow2: "bg-violet-200/30",
      divider: "from-transparent via-slate-300/70 to-transparent",
      activeLine: "bg-slate-700/80",
    };
  }

  if (theme === "silver") {
    return {
      app: "bg-[linear-gradient(180deg,#dfe4ea_0%,#cfd6dd_100%)] text-slate-900",
      sidebar:
        "bg-[rgba(255,255,255,0.62)] border-white/40 text-slate-900 backdrop-blur-2xl",
      panelSoft: "bg-[rgba(255,255,255,0.48)] border-white/35 text-slate-900",
      muted: "text-slate-600",
      main: "bg-transparent",
      topbar:
        "bg-[rgba(255,255,255,0.55)] border-white/40 backdrop-blur-2xl",
      button: "bg-white/45 hover:bg-white/65 border-white/40 text-slate-700",
      userBox: "bg-white/40 border-white/35",
      activityBox: "bg-white/40 border-white/35",
      kpiBox: "bg-white/40 border-white/35",
      overlay: "bg-black/25",
      glow1: "bg-cyan-200/30",
      glow2: "bg-fuchsia-200/20",
      divider: "from-transparent via-white/60 to-transparent",
      activeLine: "bg-slate-700/75",
    };
  }

  return {
    app: "bg-[linear-gradient(180deg,#04070d_0%,#08101c_45%,#0b1730_100%)] text-white",
    sidebar:
      "bg-[linear-gradient(180deg,rgba(6,11,20,0.92)_0%,rgba(8,14,26,0.94)_100%)] border-white/10 text-white backdrop-blur-2xl",
    panelSoft: "bg-white/5 border-white/10 text-white",
    muted: "text-slate-400",
    main: "bg-transparent",
    topbar: "bg-[#0b0f17]/85 border-white/10 backdrop-blur-2xl",
    button: "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200",
    userBox: "bg-white/5 border-white/10",
    activityBox: "bg-white/5 border-white/10",
    kpiBox: "bg-white/5 border-white/10",
    overlay: "bg-black/50",
    glow1: "bg-cyan-500/10",
    glow2: "bg-violet-500/10",
    divider: "from-transparent via-white/10 to-transparent",
    activeLine: "bg-white/85",
  };
}

function getMenuTextColor(color, active, theme) {
  if (theme === "light" || theme === "silver") {
    const map = {
      violet: active ? "text-violet-700" : "text-slate-700",
      cyan: active ? "text-cyan-700" : "text-slate-700",
      emerald: active ? "text-emerald-700" : "text-slate-700",
      amber: active ? "text-amber-700" : "text-slate-700",
      sky: active ? "text-sky-700" : "text-slate-700",
      green: active ? "text-green-700" : "text-slate-700",
      pink: active ? "text-pink-700" : "text-slate-700",
      indigo: active ? "text-indigo-700" : "text-slate-700",
      teal: active ? "text-teal-700" : "text-slate-700",
      orange: active ? "text-orange-700" : "text-slate-700",
      purple: active ? "text-purple-700" : "text-slate-700",
      slate: active ? "text-slate-800" : "text-slate-700",
      yellow: active ? "text-yellow-700" : "text-slate-700",
    };
    return map[color];
  }

  const darkMap = {
    violet: active ? "text-violet-200" : "text-slate-200",
    cyan: active ? "text-cyan-200" : "text-slate-200",
    emerald: active ? "text-emerald-200" : "text-slate-200",
    amber: active ? "text-amber-200" : "text-slate-200",
    sky: active ? "text-sky-200" : "text-slate-200",
    green: active ? "text-green-200" : "text-slate-200",
    pink: active ? "text-pink-200" : "text-slate-200",
    indigo: active ? "text-indigo-200" : "text-slate-200",
    teal: active ? "text-teal-200" : "text-slate-200",
    orange: active ? "text-orange-200" : "text-slate-200",
    purple: active ? "text-purple-200" : "text-slate-200",
    slate: active ? "text-slate-100" : "text-slate-200",
    yellow: active ? "text-yellow-200" : "text-slate-200",
  };

  return darkMap[color];
}

function getActivePill(color, theme) {
  if (theme === "light" || theme === "silver") {
    const map = {
      violet: "bg-violet-100/90 border-violet-300/80 shadow-[0_6px_20px_rgba(139,92,246,0.18)]",
      cyan: "bg-cyan-100/90 border-cyan-300/80 shadow-[0_6px_20px_rgba(6,182,212,0.18)]",
      emerald: "bg-emerald-100/90 border-emerald-300/80 shadow-[0_6px_20px_rgba(16,185,129,0.18)]",
      amber: "bg-amber-100/90 border-amber-300/80 shadow-[0_6px_20px_rgba(245,158,11,0.18)]",
      sky: "bg-sky-100/90 border-sky-300/80 shadow-[0_6px_20px_rgba(14,165,233,0.18)]",
      green: "bg-green-100/90 border-green-300/80 shadow-[0_6px_20px_rgba(34,197,94,0.18)]",
      pink: "bg-pink-100/90 border-pink-300/80 shadow-[0_6px_20px_rgba(236,72,153,0.18)]",
      indigo: "bg-indigo-100/90 border-indigo-300/80 shadow-[0_6px_20px_rgba(99,102,241,0.18)]",
      teal: "bg-teal-100/90 border-teal-300/80 shadow-[0_6px_20px_rgba(20,184,166,0.18)]",
      orange: "bg-orange-100/90 border-orange-300/80 shadow-[0_6px_20px_rgba(249,115,22,0.18)]",
      purple: "bg-purple-100/90 border-purple-300/80 shadow-[0_6px_20px_rgba(168,85,247,0.18)]",
      slate: "bg-slate-200/90 border-slate-300/80 shadow-sm",
      yellow: "bg-yellow-100/90 border-yellow-300/80 shadow-[0_6px_20px_rgba(234,179,8,0.18)]",
    };
    return map[color];
  }

  const darkMap = {
    violet:
      "bg-gradient-to-r from-violet-500/20 to-violet-400/10 border-violet-400/30 shadow-[0_8px_24px_rgba(139,92,246,0.18)]",
    cyan:
      "bg-gradient-to-r from-cyan-500/20 to-cyan-400/10 border-cyan-400/30 shadow-[0_8px_24px_rgba(6,182,212,0.18)]",
    emerald:
      "bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 border-emerald-400/30 shadow-[0_8px_24px_rgba(16,185,129,0.18)]",
    amber:
      "bg-gradient-to-r from-amber-500/20 to-amber-400/10 border-amber-400/30 shadow-[0_8px_24px_rgba(245,158,11,0.18)]",
    sky:
      "bg-gradient-to-r from-sky-500/20 to-sky-400/10 border-sky-400/30 shadow-[0_8px_24px_rgba(14,165,233,0.18)]",
    green:
      "bg-gradient-to-r from-green-500/20 to-green-400/10 border-green-400/30 shadow-[0_8px_24px_rgba(34,197,94,0.18)]",
    pink:
      "bg-gradient-to-r from-pink-500/20 to-pink-400/10 border-pink-400/30 shadow-[0_8px_24px_rgba(236,72,153,0.18)]",
    indigo:
      "bg-gradient-to-r from-indigo-500/20 to-indigo-400/10 border-indigo-400/30 shadow-[0_8px_24px_rgba(99,102,241,0.18)]",
    teal:
      "bg-gradient-to-r from-teal-500/20 to-teal-400/10 border-teal-400/30 shadow-[0_8px_24px_rgba(20,184,166,0.18)]",
    orange:
      "bg-gradient-to-r from-orange-500/20 to-orange-400/10 border-orange-400/30 shadow-[0_8px_24px_rgba(249,115,22,0.18)]",
    purple:
      "bg-gradient-to-r from-purple-500/20 to-purple-400/10 border-purple-400/30 shadow-[0_8px_24px_rgba(168,85,247,0.18)]",
    slate:
      "bg-gradient-to-r from-slate-500/20 to-slate-400/10 border-slate-400/30 shadow-[0_8px_24px_rgba(148,163,184,0.12)]",
    yellow:
      "bg-gradient-to-r from-yellow-500/20 to-yellow-400/10 border-yellow-400/30 shadow-[0_8px_24px_rgba(234,179,8,0.18)]",
  };

  return darkMap[color];
}

export default function MainLayout({ children, active, setActive, onLogout, currentUser }) {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_app_settings_v1");
      return saved ? JSON.parse(saved).theme || "night" : "night";
    } catch {
      return "night";
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuVersion, setRoleMenuVersion] = useState(0);
  const [ventasSidebar, setVentasSidebar] = useState([]);

  const t = useMemo(() => getTheme(theme), [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("crm_app_settings_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.theme) {
          setTheme(parsed.theme);
        }
      } catch {}
    }

    const handleThemeChange = (event) => {
      if (event?.detail) {
        setTheme(event.detail);
      }
    };

    window.addEventListener("crm-theme-change", handleThemeChange);
    return () => window.removeEventListener("crm-theme-change", handleThemeChange);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crm_app_settings_v1");
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        "crm_app_settings_v1",
        JSON.stringify({
          ...parsed,
          theme,
        })
      );
    } catch {}
  }, [theme]);

  useEffect(() => {
    const handleRoleMenusUpdate = () => {
      setRoleMenuVersion((prev) => prev + 1);
    };

    window.addEventListener("crm-role-menus-updated", handleRoleMenusUpdate);
    return () =>
      window.removeEventListener("crm-role-menus-updated", handleRoleMenusUpdate);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadVentasSidebar() {
      try {
        const data = await apiFetch("/ventas/list");
        if (!mounted) return;
        setVentasSidebar(data?.ventas || []);
      } catch {
        if (!mounted) return;
        setVentasSidebar([]);
      }
    }

    if (currentUser) {
      loadVentasSidebar();
    }

    return () => {
      mounted = false;
    };
  }, [currentUser, active]);

  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === "night") return "silver";
      if (prev === "silver") return "light";
      return "night";
    });
  };

  const themeLabel =
    theme === "night" ? "Modo noche" : theme === "silver" ? "Modo gris" : "Modo claro";

  const visibleMenus = useMemo(() => {
    return getVisibleMenus(currentUser);
  }, [currentUser, roleMenuVersion]);

  useEffect(() => {
    if (!visibleMenus.length) return;
    if (!visibleMenus.includes(active)) {
      setActive(visibleMenus[0]);
    }
  }, [visibleMenus, active, setActive]);

  const filteredMenuItems = menuItems.filter((item) => visibleMenus.includes(item.key));

  const conversionMes = useMemo(() => {
    const now = new Date();
    const favorables = new Set([
      "Tramitada",
      "Activada",
      "Activo Parcial",
      "Activo Total",
      "Finalizado",
    ]);

    const ventasMes = ventasSidebar.filter((venta) => {
      const d = getVentaDate(venta);
      if (!d) return false;
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    if (!ventasMes.length) return 0;

    const buenas = ventasMes.filter((venta) => favorables.has(venta.estado)).length;
    return (buenas / ventasMes.length) * 100;
  }, [ventasSidebar]);

  const displayName = currentUser?.nombre || currentUser?.name || "Usuario";
  const displayRole = currentUser?.rol || "-";

  return (
    <div className={`h-screen overflow-hidden ${t.app} theme-${theme}`}>
      <div className="flex h-screen overflow-hidden">
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className={`fixed inset-0 z-40 lg:hidden ${t.overlay}`}
          />
        )}

        <aside
          className={`crm-glass-sidebar fixed left-0 top-0 z-50 h-screen border-r transition-all duration-300 lg:static lg:z-auto ${
            t.sidebar
          } ${collapsed ? "w-[92px]" : "w-[270px]"} ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="relative flex h-full flex-col overflow-hidden p-4">
            <div className={`pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full blur-3xl ${t.glow1}`} />
            <div className={`pointer-events-none absolute -right-10 bottom-24 h-36 w-36 rounded-full blur-3xl ${t.glow2}`} />

            <div className={`relative shrink-0 rounded-[28px] border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${t.panelSoft}`}>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 text-slate-950 shadow-[0_10px_25px_rgba(34,211,238,0.18)]">
                  <FolderKanban className="h-5 w-5" />
                </div>

                {!collapsed && (
                  <div className="min-w-0">
                    <p className="crm-label">CRM Comercial</p>
                    <h2 className="crm-title truncate text-2xl">Solutions</h2>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className={`${collapsed ? "hidden" : "min-w-0 flex-1"}`}>
                  <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                    {displayName}
                  </p>
                  <p className="crm-muted text-xs">{displayRole}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={cycleTheme}
                    className={`shrink-0 rounded-2xl border p-3 transition ${t.button}`}
                    title={themeLabel}
                  >
                    {theme === "night" ? (
                      <Moon className="h-4 w-4" />
                    ) : theme === "silver" ? (
                      <Palette className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`hidden shrink-0 rounded-2xl border p-3 transition lg:block ${t.button}`}
                    title={collapsed ? "Expandir menú" : "Contraer menú"}
                  >
                    {collapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setMobileOpen(false)}
                    className={`shrink-0 rounded-2xl border p-3 transition lg:hidden ${t.button}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className={`relative mt-4 shrink-0 rounded-[24px] border p-4 ${t.activityBox}`}>
              {collapsed ? (
                <div className="text-center">
                  <p className="crm-kpi text-lg">9</p>
                </div>
              ) : (
                <>
                  <p className="crm-label">Actividad</p>
                  <p className="crm-heading">9 tareas pendientes</p>
                </>
              )}
            </div>

            <div className="crm-menu-divider mt-4 mb-3" />

            <div className="relative mt-4 min-h-0 flex-1 overflow-hidden">
              <div className={`pointer-events-none absolute left-0 right-2 top-0 z-10 h-8 bg-gradient-to-b ${t.divider}`} />
              <div className={`pointer-events-none absolute bottom-0 left-0 right-2 z-10 h-8 bg-gradient-to-t ${t.divider}`} />

              <nav className="crm-scroll h-full space-y-1.5 overflow-y-auto pr-1">
                {filteredMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.key;

                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActive(item.key);
                        setMobileOpen(false);
                      }}
                      className={`relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-transparent px-4 py-3 text-left transition duration-200 ${
                        collapsed ? "justify-center" : ""
                      } ${getMenuTextColor(item.color, isActive, theme)}`}
                      title={collapsed ? item.label : ""}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarPill"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className={`absolute inset-0 rounded-2xl border ${getActivePill(
                            item.color,
                            theme
                          )}`}
                        />
                      )}

                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="activeSidebarLine"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className={`absolute left-0 top-[14%] h-[72%] w-1 rounded-r-full ${t.activeLine}`}
                        />
                      )}

                      <span className="relative z-10">
                        <Icon className="h-5 w-5 shrink-0" />
                      </span>

                      {!collapsed && (
                        <span className="relative z-10 font-medium">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="relative mt-4 shrink-0 space-y-4">
              <div className={`rounded-[24px] border p-4 ${t.kpiBox}`}>
                {collapsed ? (
                  <p className="crm-kpi text-center">{formatPercent(conversionMes)}</p>
                ) : (
                  <>
                    <p className="crm-label">Conversión</p>
                    <p className="crm-heading">{formatPercent(conversionMes)} este mes</p>
                  </>
                )}
              </div>

              <div className={`rounded-[24px] border p-4 ${t.userBox}`}>
                {collapsed ? (
                  <div className="flex justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-500/20 text-sm font-bold">
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-500/20 font-bold">
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="crm-heading truncate">{displayName}</p>
                      <p className="crm-muted text-sm">{displayRole}</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300 bg-red-200/90 px-4 py-3 font-medium text-red-950 transition hover:bg-red-300"
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Cerrar sesión</span>}
              </button>
            </div>
          </div>
        </aside>

        <main className={`relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden ${t.main}`}>
          <div className={`shrink-0 border-b px-6 py-4 ${t.topbar}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className={`rounded-2xl border p-3 transition lg:hidden ${t.button}`}
                >
                  <Menu className="h-4 w-4" />
                </button>

                <div>
                  <h1 className="crm-title text-2xl">{active}</h1>
                  <div className="crm-muted text-sm">{themeLabel}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`hidden rounded-2xl border px-4 py-2 md:block ${t.userBox}`}>
                  <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                    {displayName}
                  </p>
                  <p className="crm-muted text-xs">{displayRole}</p>
                </div>

                <button
                  onClick={cycleTheme}
                  className={`hidden rounded-2xl border px-4 py-2 text-sm transition sm:inline-flex ${t.button}`}
                >
                  Cambiar tema
                </button>
              </div>
            </div>
          </div>

          <div className="crm-scroll relative min-h-0 flex-1 overflow-y-auto">
            <div className={`pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full blur-3xl ${t.glow1}`} />
            <div className={`pointer-events-none absolute bottom-10 left-10 h-44 w-44 rounded-full blur-3xl ${t.glow2}`} />

            <motion.div
              key={`${active}-${theme}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="relative"
            >
              <div className="crm-page p-6">{children}</div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
