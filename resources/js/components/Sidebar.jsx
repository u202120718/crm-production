

import { useState } from "react";
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
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Leads", icon: Target },
  { label: "Clientes", icon: Users },
  { label: "Campanas", icon: BriefcaseBusiness },
  { label: "Seguimiento", icon: Phone },
  { label: "Ventas", icon: CircleDollarSign },
  { label: "Cargar Venta", icon: FilePlus2 },
  { label: "Agenda", icon: CalendarDays },
  { label: "Calidad", icon: ShieldCheck },
  { label: "Reportes", icon: BarChart3 },
  { label: "Usuarios", icon: ClipboardList },
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
}) {
  const [themeOpen, setThemeOpen] = useState(false);
  const currentTheme = themeMap[themeMode];

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
            <p className="text-xs text-slate-400">Actividad</p>
            <p className="text-sm font-medium">9 tareas pendientes</p>
          </div>
        )}

        <nav className="space-y-2 overflow-y-auto pr-1">
          {menuItems.map((item) => {
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

        {!collapsed && (
          <>
            <div className={`mt-6 rounded-3xl p-4 ${currentTheme.card}`}>
              <p className="text-xs text-slate-400">Conversión</p>
              <p className="text-sm font-semibold">18.2% este mes</p>
            </div>

            <div className={`mt-4 rounded-3xl p-4 ${currentTheme.card}`}>
              <p className="font-medium">Julián</p>
              <p className="text-sm text-slate-400">Director Comercial</p>
            </div>
          </>
        )}

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
