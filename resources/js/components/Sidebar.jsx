import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Target,
  Users,
  BriefcaseBusiness,
  Phone,
  CircleDollarSign,
  CalendarDays,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MoonStar,
  FilePlus2,
  BellRing,
  Trophy,
} from "lucide-react";
import {
  getVisibleMenus,
  applyServerRoleMenuConfig,
} from "../lib/rbac";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Leads", icon: Target },
  { label: "Clientes", icon: Users },
  { label: "Campanas", icon: BriefcaseBusiness },
  { label: "Seguimiento", icon: Phone },
  { label: "Ventas", icon: CircleDollarSign },
  { label: "Cargar Venta", icon: FilePlus2 },
  { label: "Comunicados", icon: BellRing },
  { label: "Agenda", icon: CalendarDays },
  { label: "Calidad", icon: ShieldCheck },
  { label: "Reportes", icon: BarChart3 },
  { label: "Usuarios", icon: ClipboardList },
  { label: "Ranking", icon: Trophy },
  { label: "Configuracion", icon: Settings },
];

const themeMap = {
  executive: {
    aside: "border-r border-white/10 bg-[#141414]/90",
    card: "border border-white/10 bg-white/5",
    active: "bg-white/10 border border-white/15 text-white",
  },
  graphite: {
    aside: "border-r border-white/10 bg-[#252A31]/90",
    card: "border border-white/10 bg-white/10",
    active: "bg-white/12 border border-white/15 text-white",
  },
  midnight: {
    aside: "border-r border-white/10 bg-[#162033]/90",
    card: "border border-white/10 bg-white/6",
    active: "bg-sky-400/15 border border-sky-300/20 text-sky-100",
  },
};

const themeOptions = [
  { key: "executive", label: "Executive Black", dot: "bg-black border border-white/20" },
  { key: "graphite", label: "Corporate Graphite", dot: "bg-[#3A404A]" },
  { key: "midnight", label: "Midnight Blue", dot: "bg-[#25324A]" },
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

export default function Sidebar({
  active,
  setActive,
  onLogout,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  themeMode,
  setThemeMode,
  currentUser,
}) {
  const [themeOpen, setThemeOpen] = useState(false);
  const [roleMenuVersion, setRoleMenuVersion] = useState(0);
  const currentTheme = themeMap[themeMode] || themeMap.midnight;

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

    async function hydrateRoleMenus() {
      try {
        const data = await apiFetch("/settings/role-menus");
        if (!mounted) return;

        if (data?.config) {
          applyServerRoleMenuConfig(data.config);
          setRoleMenuVersion((prev) => prev + 1);
        }
      } catch {
        //
      }
    }

    if (currentUser) {
      hydrateRoleMenus();
    }

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const visibleMenus = useMemo(() => {
    return getVisibleMenus(currentUser);
  }, [currentUser, roleMenuVersion]);

  useEffect(() => {
    if (!visibleMenus.length) return;
    if (!visibleMenus.includes(active)) {
      setActive(visibleMenus[0]);
    }
  }, [visibleMenus, active, setActive]);

  const filteredMenuItems = menuItems.filter((item) => visibleMenus.includes(item.label));

  const displayName = currentUser?.nombre || currentUser?.name || "Usuario";
  const displayRole = currentUser?.rol || "-";

  return (
    <aside
      className={`
        fixed lg:static top-0 left-0 z-40 h-screen
        backdrop-blur transition-all duration-300 ease-in-out
        ${collapsed ? "w-24" : "w-72"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${currentTheme.aside}
      `}
    >
      <div className="h-full flex flex-col p-4">
        <div className={`rounded-3xl p-4 mb-4 flex items-center justify-between gap-3 ${currentTheme.card}`}>
          <div className="min-w-0">
            {!collapsed ? (
              <>
                <p className="text-sm text-slate-300">CRM Comercial</p>
                <h2 className="text-lg font-semibold mt-1 truncate">Solutions</h2>
                <p className="mt-2 text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs text-slate-400">{displayRole}</p>
              </>
            ) : (
              <div className="text-center font-semibold text-white">CRM</div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2 relative">
            <button
              onClick={() => setThemeOpen((prev) => !prev)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10"
              title="Cambiar tema"
            >
              <MoonStar className="h-4 w-4" />
            </button>

            {themeOpen && !collapsed && (
              <div className="absolute right-12 top-0 w-56 rounded-2xl border border-white/10 bg-black/80 p-2 shadow-2xl backdrop-blur-xl">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.key}
                    onClick={() => {
                      setThemeMode(theme.key);
                      setThemeOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                      themeMode === theme.key
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:bg-white/8"
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full ${theme.dot}`} />
                    {theme.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className={`rounded-3xl p-4 mb-4 ${currentTheme.card}`}>
            <p className="text-xs text-slate-400">Accesos visibles</p>
            <p className="text-sm font-medium">{filteredMenuItems.length} módulos habilitados</p>
          </div>
        )}

        <nav className="space-y-2 overflow-y-auto pr-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.label;

            return (
              <button
                key={item.label}
                onClick={() => {
                  setActive(item.label);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center" : "gap-3"
                } rounded-2xl px-4 py-3 text-left transition ${
                  isActive ? currentTheme.active : "bg-white/5 border border-transparent text-slate-200 hover:bg-white/10"
                }`}
                title={collapsed ? item.label : ""}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <button
          onClick={onLogout}
          className={`mt-4 w-full flex items-center ${
            collapsed ? "justify-center" : "justify-center gap-2"
          } rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 hover:bg-white/10`}
          title={collapsed ? "Cerrar sesión" : ""}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}
