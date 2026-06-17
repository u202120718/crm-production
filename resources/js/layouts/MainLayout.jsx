import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
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
  BellRing,
  FileText,
  Trophy,
} from "lucide-react";
import {
  getVisibleMenus,
  applyServerRoleMenuConfig,
} from "../lib/rbac";

const menuItems = [
  { key: "Dashboard", label: "Dashboard", icon: LayoutDashboard, color: "violet" },
  { key: "Leads", label: "Leads", icon: Target, color: "cyan" },
  { key: "Clientes", label: "Clientes", icon: Users, color: "emerald" },
  { key: "Campanas", label: "Campañas", icon: BriefcaseBusiness, color: "amber" },
  { key: "Seguimiento", label: "Seguimiento", icon: PhoneCall, color: "sky" },
  { key: "Ventas", label: "Ventas", icon: CircleDollarSign, color: "green" },
  { key: "Cargar Venta", label: "Nuevo Contrato", icon: ClipboardPlus, color: "pink" },
  { key: "Comunicados", label: "Comunicados", icon: BellRing, color: "indigo" },
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
      app: "bg-[#eef3fa] text-slate-800",
      sidebar:
        "bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)] border-slate-200/80 text-slate-800 shadow-[0_12px_34px_rgba(15,23,42,0.06)]",
      panelSoft:
        "bg-[linear-gradient(180deg,#ffffff_0%,#f6f9fd_100%)] border-slate-200/80 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.05)]",
      muted: "text-slate-500",
      main: "bg-[linear-gradient(180deg,#edf2f9_0%,#e8eef7_100%)]",
      topbar:
        "bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] border-slate-200/80 shadow-[0_8px_18px_rgba(15,23,42,0.04)]",
      button: "bg-white hover:bg-slate-50 border-slate-200 text-slate-600",
      userBox: "bg-white/90 border-slate-200/80",
      activityBox: "bg-white/90 border-slate-200/80",
      kpiBox: "bg-white/90 border-slate-200/80",
      overlay: "bg-black/30",
      glow1: "bg-sky-300/25",
      glow2: "bg-violet-300/18",
      divider: "from-transparent via-slate-300/50 to-transparent",
      activeLine: "bg-cyan-500",
      brandGlow: "from-cyan-400 via-blue-500 to-violet-500",
      cardInner: "bg-slate-50/80 border-slate-200/70",
    };
  }

  if (theme === "silver") {
    return {
      app: "bg-[linear-gradient(180deg,#dfe7f1_0%,#cfd9e6_100%)] text-slate-800",
      sidebar:
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(240,245,252,0.72)_100%)] border-white/45 text-slate-800 shadow-[0_12px_34px_rgba(15,23,42,0.06)]",
      panelSoft:
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.64)_0%,rgba(241,245,249,0.58)_100%)] border-white/45 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.05)]",
      muted: "text-slate-500",
      main: "bg-transparent",
      topbar:
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(244,247,252,0.66)_100%)] border-white/45 shadow-[0_8px_18px_rgba(15,23,42,0.04)]",
      button: "bg-white/70 hover:bg-white/90 border-white/50 text-slate-600",
      userBox: "bg-white/58 border-white/40",
      activityBox: "bg-white/58 border-white/40",
      kpiBox: "bg-white/58 border-white/40",
      overlay: "bg-black/25",
      glow1: "bg-cyan-200/20",
      glow2: "bg-fuchsia-200/16",
      divider: "from-transparent via-white/55 to-transparent",
      activeLine: "bg-cyan-500",
      brandGlow: "from-cyan-400 via-blue-500 to-violet-500",
      cardInner: "bg-white/55 border-white/45",
    };
  }

  return {
    app: "bg-[radial-gradient(circle_at_top,#0c2554_0%,#081733_28%,#040d22_68%,#030816_100%)] text-white",
    sidebar:
      "bg-[linear-gradient(180deg,rgba(5,12,29,0.99)_0%,rgba(7,15,37,0.99)_40%,rgba(5,10,24,1)_100%)] border-[#193864] text-white shadow-[0_18px_44px_rgba(2,8,23,0.34)]",
    panelSoft:
      "bg-[linear-gradient(180deg,rgba(9,22,52,0.94)_0%,rgba(8,18,42,0.98)_100%)] border-[#24477d] text-white shadow-[0_14px_30px_rgba(2,8,23,0.26)]",
    muted: "text-slate-400",
    main: "bg-transparent",
    topbar:
      "bg-[linear-gradient(180deg,rgba(5,12,29,0.98)_0%,rgba(6,13,31,0.98)_100%)] border-[#193864] shadow-[0_10px_22px_rgba(2,8,23,0.18)]",
    button: "bg-[#0e224f] hover:bg-[#143166] border-[#29508e] text-slate-100",
    userBox: "bg-[linear-gradient(180deg,rgba(8,19,45,0.95)_0%,rgba(7,16,36,0.98)_100%)] border-[#22467a]",
    activityBox: "bg-[linear-gradient(180deg,rgba(8,19,45,0.95)_0%,rgba(7,16,36,0.98)_100%)] border-[#22467a]",
    kpiBox: "bg-[linear-gradient(180deg,rgba(8,19,45,0.95)_0%,rgba(7,16,36,0.98)_100%)] border-[#22467a]",
    overlay: "bg-black/55",
    glow1: "bg-cyan-500/14",
    glow2: "bg-violet-500/12",
    divider: "from-transparent via-cyan-400/10 to-transparent",
    activeLine: "bg-cyan-400",
    brandGlow: "from-cyan-400 via-blue-500 to-violet-500",
    cardInner: "bg-white/5 border-white/10",
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
    violet: active ? "text-violet-100" : "text-slate-200",
    cyan: active ? "text-cyan-100" : "text-slate-200",
    emerald: active ? "text-emerald-100" : "text-slate-200",
    amber: active ? "text-amber-100" : "text-slate-200",
    sky: active ? "text-sky-100" : "text-slate-200",
    green: active ? "text-green-100" : "text-slate-200",
    pink: active ? "text-pink-100" : "text-slate-200",
    indigo: active ? "text-indigo-100" : "text-slate-200",
    teal: active ? "text-teal-100" : "text-slate-200",
    orange: active ? "text-orange-100" : "text-slate-200",
    purple: active ? "text-purple-100" : "text-slate-200",
    slate: active ? "text-white" : "text-slate-200",
    yellow: active ? "text-yellow-100" : "text-slate-200",
  };

  return darkMap[color];
}

function getActivePill(color, theme) {
  if (theme === "light" || theme === "silver") {
    const map = {
      violet: "bg-violet-100/95 border-violet-300/80 shadow-[0_8px_20px_rgba(139,92,246,0.12)]",
      cyan: "bg-cyan-100/95 border-cyan-300/80 shadow-[0_8px_20px_rgba(6,182,212,0.12)]",
      emerald: "bg-emerald-100/95 border-emerald-300/80 shadow-[0_8px_20px_rgba(16,185,129,0.12)]",
      amber: "bg-amber-100/95 border-amber-300/80 shadow-[0_8px_20px_rgba(245,158,11,0.12)]",
      sky: "bg-sky-100/95 border-sky-300/80 shadow-[0_8px_20px_rgba(14,165,233,0.12)]",
      green: "bg-green-100/95 border-green-300/80 shadow-[0_8px_20px_rgba(34,197,94,0.12)]",
      pink: "bg-pink-100/95 border-pink-300/80 shadow-[0_8px_20px_rgba(236,72,153,0.12)]",
      indigo: "bg-indigo-100/95 border-indigo-300/80 shadow-[0_8px_20px_rgba(99,102,241,0.12)]",
      teal: "bg-teal-100/95 border-teal-300/80 shadow-[0_8px_20px_rgba(20,184,166,0.12)]",
      orange: "bg-orange-100/95 border-orange-300/80 shadow-[0_8px_20px_rgba(249,115,22,0.12)]",
      purple: "bg-purple-100/95 border-purple-300/80 shadow-[0_8px_20px_rgba(168,85,247,0.12)]",
      slate: "bg-slate-200/95 border-slate-300/80 shadow-sm",
      yellow: "bg-yellow-100/95 border-yellow-300/80 shadow-[0_8px_20px_rgba(234,179,8,0.12)]",
    };
    return map[color];
  }

  const darkMap = {
    violet:
      "bg-[linear-gradient(90deg,rgba(139,92,246,0.26)_0%,rgba(139,92,246,0.08)_100%)] border-violet-400/30 shadow-[0_10px_22px_rgba(139,92,246,0.18)]",
    cyan:
      "bg-[linear-gradient(90deg,rgba(34,211,238,0.24)_0%,rgba(34,211,238,0.08)_100%)] border-cyan-400/30 shadow-[0_10px_22px_rgba(34,211,238,0.18)]",
    emerald:
      "bg-[linear-gradient(90deg,rgba(16,185,129,0.24)_0%,rgba(16,185,129,0.08)_100%)] border-emerald-400/30 shadow-[0_10px_22px_rgba(16,185,129,0.18)]",
    amber:
      "bg-[linear-gradient(90deg,rgba(245,158,11,0.24)_0%,rgba(245,158,11,0.08)_100%)] border-amber-400/30 shadow-[0_10px_22px_rgba(245,158,11,0.18)]",
    sky:
      "bg-[linear-gradient(90deg,rgba(56,189,248,0.24)_0%,rgba(56,189,248,0.08)_100%)] border-sky-400/30 shadow-[0_10px_22px_rgba(56,189,248,0.18)]",
    green:
      "bg-[linear-gradient(90deg,rgba(34,197,94,0.24)_0%,rgba(34,197,94,0.08)_100%)] border-green-400/30 shadow-[0_10px_22px_rgba(34,197,94,0.18)]",
    pink:
      "bg-[linear-gradient(90deg,rgba(236,72,153,0.24)_0%,rgba(236,72,153,0.08)_100%)] border-pink-400/30 shadow-[0_10px_22px_rgba(236,72,153,0.18)]",
    indigo:
      "bg-[linear-gradient(90deg,rgba(99,102,241,0.24)_0%,rgba(99,102,241,0.08)_100%)] border-indigo-400/30 shadow-[0_10px_22px_rgba(99,102,241,0.18)]",
    teal:
      "bg-[linear-gradient(90deg,rgba(20,184,166,0.24)_0%,rgba(20,184,166,0.08)_100%)] border-teal-400/30 shadow-[0_10px_22px_rgba(20,184,166,0.18)]",
    orange:
      "bg-[linear-gradient(90deg,rgba(249,115,22,0.24)_0%,rgba(249,115,22,0.08)_100%)] border-orange-400/30 shadow-[0_10px_22px_rgba(249,115,22,0.18)]",
    purple:
      "bg-[linear-gradient(90deg,rgba(168,85,247,0.24)_0%,rgba(168,85,247,0.08)_100%)] border-purple-400/30 shadow-[0_10px_22px_rgba(168,85,247,0.18)]",
    slate:
      "bg-[linear-gradient(90deg,rgba(148,163,184,0.18)_0%,rgba(148,163,184,0.06)_100%)] border-slate-400/20 shadow-[0_8px_20px_rgba(148,163,184,0.08)]",
    yellow:
      "bg-[linear-gradient(90deg,rgba(234,179,8,0.24)_0%,rgba(234,179,8,0.08)_100%)] border-yellow-400/30 shadow-[0_10px_22px_rgba(234,179,8,0.18)]",
  };

  return darkMap[color];
}

function ComunicadosCard({ theme, onOpen, collapsed }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const data = await apiFetch("/comunicados/summary");
        if (!mounted) return;
        setUnreadCount(data?.unread_count || 0);
        setRecent(data?.recent || []);
      } catch {
        if (!mounted) return;
        setUnreadCount(0);
        setRecent([]);
      }
    }

    loadSummary();
    const interval = setInterval(loadSummary, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (collapsed) {
    return (
      <button
        onClick={onOpen}
        className={`w-full rounded-[24px] border p-4 transition ${theme.activityBox}`}
        title="Comunicados"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <BellRing className="h-5 w-5 text-sky-400" />
          <p className="text-lg font-bold" style={{ color: "inherit" }}>
            {unreadCount}
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className={`w-full rounded-[24px] border p-4 text-left transition hover:brightness-110 ${theme.activityBox}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="crm-label">Comunicados</p>
          <p className="text-2xl font-bold" style={{ color: "inherit" }}>
            {unreadCount}
          </p>
          <p className="crm-muted text-sm">
            {unreadCount === 1 ? "mensaje sin leer" : "mensajes sin leer"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/12">
          <BellRing className="h-5 w-5 text-sky-400" />
        </div>
      </div>

      {recent.length > 0 ? (
        <div className="mt-3 space-y-2">
          {recent.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border px-3 py-2 ${theme.cardInner}`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <p className="truncate text-xs font-medium" style={{ color: "inherit" }}>
                  {item.titulo}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="crm-muted mt-2 text-xs">No hay comunicados recientes.</p>
      )}
    </button>
  );
}

export default function MainLayout({
  children,
  active,
  setActive,
  onLogout,
  currentUser,
}) {
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
      } catch {
        //
      }
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
    } catch {
      //
    }
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

  useEffect(() => {
    let mounted = true;

    async function loadVentasSidebar() {
      try {
        const data = await apiFetch("/ventas/list");
        if (!mounted) return;

        setVentasSidebar((prev) => {
          const map = new Map();

          prev.forEach((item) => {
            if (item?.id != null) {
              map.set(item.id, item);
            }
          });

          (data?.ventas || []).forEach((item) => {
            if (item?.id != null) {
              map.set(item.id, {
                ...(map.get(item.id) || {}),
                ...item,
              });
            }
          });

          return Array.from(map.values()).sort(
            (a, b) => Number(b?.id || 0) - Number(a?.id || 0)
          );
        });
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
    theme === "night"
      ? "Modo noche"
      : theme === "silver"
      ? "Modo gris"
      : "Modo claro";

  const visibleMenus = useMemo(() => {
    return getVisibleMenus(currentUser);
  }, [currentUser, roleMenuVersion]);

  useEffect(() => {
    if (!visibleMenus.length) return;
    if (!visibleMenus.includes(active)) {
      setActive(visibleMenus[0]);
    }
  }, [visibleMenus, active, setActive]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => visibleMenus.includes(item.key));
  }, [visibleMenus]);

  const conversionMes = useMemo(() => {
    const now = new Date();
    const favorables = new Set([
      "TRAMITADA",
      "ACTIVADA",
      "ACTIVO PARCIAL",
      "ACTIVO TOTAL",
      "FINALIZADO",
    ]);

    const ventasMes = ventasSidebar.filter((venta) => {
      const d = getVentaDate(venta);
      if (!d) return false;
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });

    if (!ventasMes.length) return 0;

    const buenas = ventasMes.filter((venta) =>
      favorables.has(String(venta.estado || "").toUpperCase())
    ).length;

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
          } ${collapsed ? "w-[96px]" : "w-[278px]"} ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="relative flex h-full flex-col overflow-hidden p-4">
            <div
              className={`pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full blur-3xl ${t.glow1}`}
            />
            <div
              className={`pointer-events-none absolute -right-10 bottom-24 h-36 w-36 rounded-full blur-3xl ${t.glow2}`}
            />

            <div
              className={`relative shrink-0 rounded-[28px] border p-3 ${t.panelSoft}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r ${t.brandGlow} text-slate-950 shadow-[0_10px_25px_rgba(34,211,238,0.18)]`}
                >
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
                <div className={collapsed ? "hidden" : "min-w-0 flex-1"}>
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
                    type="button"
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
                    onClick={() => setCollapsed((prev) => !prev)}
                    className={`hidden shrink-0 rounded-2xl border p-3 transition lg:block ${t.button}`}
                    title={collapsed ? "Expandir menú" : "Contraer menú"}
                    type="button"
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
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative mt-4 shrink-0">
              <ComunicadosCard
                theme={t}
                collapsed={collapsed}
                onOpen={() => {
                  setActive("Comunicados");
                  setMobileOpen(false);
                }}
              />
            </div>

            <div className="crm-menu-divider mt-4 mb-3" />

            <div className="relative mt-4 min-h-0 flex-1 overflow-hidden">
              <div
                className={`pointer-events-none absolute left-0 right-2 top-0 z-10 h-8 bg-gradient-to-b ${t.divider}`}
              />
              <div
                className={`pointer-events-none absolute bottom-0 left-0 right-2 z-10 h-8 bg-gradient-to-t ${t.divider}`}
              />

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
                      type="button"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarPill"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                          className={`absolute inset-0 rounded-2xl border ${getActivePill(
                            item.color,
                            theme
                          )}`}
                        />
                      )}

                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="activeSidebarLine"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                          className={`absolute left-0 top-[14%] h-[72%] w-1 rounded-r-full ${t.activeLine}`}
                        />
                      )}

                      <span className="relative z-10">
                        <Icon className="h-5 w-5 shrink-0" />
                      </span>

                      {!collapsed && (
                        <span className="relative z-10 font-medium tracking-[0.01em]">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="relative mt-4 shrink-0 space-y-4">
              <div className={`rounded-[24px] border p-4 ${t.kpiBox}`}>
                {collapsed ? (
                  <p className="crm-kpi text-center">
                    {formatPercent(conversionMes)}
                  </p>
                ) : (
                  <>
                    <p className="crm-label">Conversión</p>
                    <p className="crm-heading">
                      {formatPercent(conversionMes)} este mes
                    </p>
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
                type="button"
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Cerrar sesión</span>}
              </button>
            </div>
          </div>
        </aside>

        <main
          className={`relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden ${t.main}`}
        >
          <div className={`shrink-0 border-b px-6 py-4 ${t.topbar}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className={`rounded-2xl border p-3 transition lg:hidden ${t.button}`}
                  type="button"
                >
                  <Menu className="h-4 w-4" />
                </button>

                <div>
                  <h1 className="crm-title text-3xl">{active}</h1>
                  <p className="crm-muted text-sm">{themeLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`hidden rounded-2xl border px-4 py-2 lg:block ${t.userBox}`}
                >
                  <p className="text-sm font-semibold" style={{ color: "inherit" }}>
                    {displayName}
                  </p>
                  <p className="crm-muted text-xs">{displayRole}</p>
                </div>

                <button
                  onClick={cycleTheme}
                  className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${t.button}`}
                  type="button"
                >
                  Cambiar tema
                </button>
              </div>
            </div>
          </div>

          <div className="crm-scroll flex-1 overflow-y-auto">
            <div className="crm-page p-5">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
