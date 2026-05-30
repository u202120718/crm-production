import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Headphones,
  MoonStar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Users,
  Target,
  CheckCircle2,
} from "lucide-react";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Campanas from "./pages/Campanas";
import Usuarios from "./pages/Usuarios";
import Clientes from "./pages/Clientes";
import Seguimiento from "./pages/Seguimiento";
import Ventas from "./pages/Ventas";
import FichasVenta from "./pages/FichasVenta";
import Agenda from "./pages/Agenda";
import Calidad from "./pages/Calidad";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";
import Ranking from "./pages/Ranking";

import {
  filterCampaignsByUser,
  filterLeadsByUser,
  filterUsersByUser,
  filterVentasByUser,
} from "./lib/rbac";

const USERS_STORAGE_KEY = "crm_users_v1";
const VENTAS_STORAGE_KEY = "crm_ventas_v1";
const LEADS_STORAGE_KEY = "crm_leads_v1";

const EMPTY_SCOPE_USER = {
  id: null,
  nombre: "",
  email: "",
  dni: "",
  rol: "Gerente",
  campana: "",
  coordinador: "",
  supervisor: "",
  estado: "Activo",
  allowedMenus: [],
  allowedCampaigns: [],
};

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

  return fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });
}

function mergeAuthUser(apiUser, users) {
  const localUser =
    users.find(
      (u) =>
        (u.email || "").trim().toLowerCase() ===
          (apiUser.email || "").trim().toLowerCase() ||
        (((u.dni || "").trim() !== "") &&
          (u.dni || "").trim() === (apiUser.dni || "").trim())
    ) || {};

  return {
    ...EMPTY_SCOPE_USER,
    ...localUser,
    id: apiUser.id,
    nombre: apiUser.name,
    email: apiUser.email,
    dni: apiUser.dni || localUser.dni || "",
    rol: apiUser.rol || localUser.rol || "Comercial",
    estado: apiUser.estado || localUser.estado || "Activo",
    campana: localUser.campana || "",
    coordinador: localUser.coordinador || "",
    supervisor: localUser.supervisor || "",
    allowedMenus: localUser.allowedMenus || [],
    allowedCampaigns:
      localUser.allowedCampaigns || (localUser.campana ? [localUser.campana] : []),
  };
}

const initialCampaigns = [];
const initialUsers = [];
const initialLeads = [];
const initialVentas = [];

const mensajesLogin = [
  {
    titulo: "Gestión comercial con visión empresarial",
    texto: "Accede a una plataforma diseñada para dirigir equipos, controlar operaciones y tomar decisiones con mayor criterio.",
    color: "from-cyan-300 via-sky-300 to-blue-400",
  },
  {
    titulo: "Estructura, control y seguimiento",
    texto: "Supervisa campañas, usuarios, ventas y procesos desde un entorno más sólido, ordenado y profesional.",
    color: "from-fuchsia-300 via-pink-300 to-rose-400",
  },
  {
    titulo: "Una operación mejor organizada",
    texto: "Trabaja con una base preparada para validar accesos, medir resultados y fortalecer la gestión diaria.",
    color: "from-emerald-300 via-teal-300 to-cyan-400",
  },
];

const frasesLanding = [
  {
    titulo: "Una plataforma comercial con enfoque empresarial",
    texto: "Diseñada para aportar orden, trazabilidad y una imagen más profesional en la gestión operativa.",
    color: "from-cyan-300 via-sky-300 to-blue-400",
  },
  {
    titulo: "Más control para una operación más sólida",
    texto: "Centraliza campañas, usuarios, ventas y seguimiento en un entorno mejor estructurado y más útil para dirigir.",
    color: "from-fuchsia-300 via-pink-300 to-rose-400",
  },
  {
    titulo: "Visibilidad para tomar mejores decisiones",
    texto: "Una base preparada para validar procesos, detectar avances y mantener una operación más controlada.",
    color: "from-amber-300 via-orange-300 to-red-400",
  },
  {
    titulo: "Imagen profesional desde el primer acceso",
    texto: "Un entorno visual pensado para transmitir estructura, orden y seriedad en cada interacción.",
    color: "from-emerald-300 via-teal-300 to-cyan-400",
  },
];

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1.5 + Math.random() * 4,
        delay: Math.random() * 2,
        duration: 1.2 + Math.random() * 2.6,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#172554_0%,#0f172a_30%,#05070d_75%,#02040a_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:48px_48px] opacity-15" />

      <motion.div
        className="absolute left-[-8%] top-[3%] h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "rgba(34,211,238,0.16)" }}
        animate={{ x: [0, 24, 0], y: [0, -18, 0], opacity: [0.18, 0.36, 0.18] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-[-8%] top-[8%] h-[24rem] w-[24rem] rounded-full blur-3xl"
        style={{ background: "rgba(168,85,247,0.18)" }}
        animate={{ x: [0, -26, 0], y: [0, 18, 0], opacity: [0.16, 0.34, 0.16] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[-8%] left-[24%] h-[22rem] w-[22rem] rounded-full blur-3xl"
        style={{ background: "rgba(251,191,36,0.12)" }}
        animate={{ x: [0, 16, 0], y: [0, -16, 0], opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.95)]"
          style={{ left: star.left, top: star.top, width: star.size, height: star.size }}
          animate={{ opacity: [0.15, 1, 0.22], scale: [1, 1.8, 1], y: [0, -8, 0] }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function LandingScreen({ onEnter }) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % frasesLanding.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fraseActual = frasesLanding[phraseIndex];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070d] text-white">
      <StarField />

      <div className="absolute left-8 top-8 z-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <Headphones className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">CRM Solutions</p>
          <p className="text-xl font-semibold text-white">Solutions</p>
        </div>
      </div>

      <div className="relative z-10 grid min-h-screen items-center gap-12 px-6 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Plataforma de gestión interna
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-tight text-white lg:text-6xl">
              Una plataforma comercial más
              <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(125,211,252,0.35)]">
                {" "}sólida, empresarial y profesional
              </span>
              {" "}para dirigir tu operación.
            </h1>

            <div className="mt-8 min-h-[128px] max-w-2xl rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
                  transition={{ duration: 0.75, ease: "easeInOut" }}
                >
                  <h3 className={`bg-gradient-to-r ${fraseActual.color} bg-clip-text text-2xl font-bold text-transparent`}>
                    {fraseActual.titulo}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-slate-100">
                    {fraseActual.texto}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-300 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Ingresar a la plataforma
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Entorno validado antes de producción
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="grid gap-4"
        >
          <div className="rounded-[28px] border border-cyan-400/10 bg-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-cyan-300" />
              <p className="text-lg font-semibold text-white">Mayor visibilidad operativa</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Controla campañas, ventas, usuarios y seguimiento desde una vista más clara, ejecutiva y ordenada.
            </p>
          </div>

          <div className="rounded-[28px] border border-fuchsia-400/10 bg-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-fuchsia-300" />
              <p className="text-lg font-semibold text-white">Estructura y gobierno comercial</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Organiza accesos, campañas y responsabilidades con una experiencia más seria y mejor definida.
            </p>
          </div>

          <div className="rounded-[28px] border border-amber-400/10 bg-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-amber-300" />
              <p className="text-lg font-semibold text-white">Enfoque en gestión y resultados</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Una base visual más sólida para supervisar procesos, medir avances y sostener decisiones con más criterio.
            </p>
          </div>

          <div className="rounded-[28px] border border-emerald-400/10 bg-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <p className="text-lg font-semibold text-white">Presencia corporativa más fuerte</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Un acceso inicial más alineado con una operación profesional, moderna y preparada para crecer.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onBack }) {
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [fraseIndex, setFraseIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFraseIndex((prev) => (prev + 1) % mensajesLogin.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const mensajeActual = mensajesLogin[fraseIndex];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await onLogin({
      login: loginValue.trim(),
      password: password.trim(),
    });

    if (!result?.ok) {
      setError(result?.message || "No se pudo iniciar sesión.");
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070d] text-white">
      <StarField />

      <div className="absolute left-8 top-8 z-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <Headphones className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">CRM Solutions</p>
          <p className="text-xl font-semibold text-white">Solutions</p>
        </div>
      </div>

      <div className="relative z-10 grid min-h-screen items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16">
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Acceso a la plataforma
            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-tight text-white">
              Ingresa a un entorno empresarial con más orden, control y presencia profesional.
            </h1>

            <div className="mt-8 min-h-[120px] rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={fraseIndex}
                  initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                  <h3 className={`bg-gradient-to-r ${mensajeActual.color} bg-clip-text text-2xl font-bold text-transparent`}>
                    {mensajeActual.titulo}
                  </h3>
                  <p className="mt-3 max-w-xl text-base leading-7 text-slate-100">
                    {mensajeActual.texto}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <motion.div
            className="absolute -inset-[2px] rounded-[34px] bg-gradient-to-r from-teal-400 via-fuchsia-500 to-violet-500 opacity-70 blur-md"
            animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.015, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <MoonStar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white">Bienvenido</h2>
                <p className="text-sm text-slate-100">Ingresa con tus credenciales corporativas</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-center lg:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={fraseIndex}
                  initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                  <p className={`bg-gradient-to-r ${mensajeActual.color} bg-clip-text text-sm font-semibold text-transparent`}>
                    {mensajeActual.titulo}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-100">
                    {mensajeActual.texto}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-100">Correo o DNI</label>
                <input
                  type="text"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0a1020] px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/40 focus:bg-[#0c1428]"
                  placeholder="correo@empresa.com o DNI"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-100">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0a1020] px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-fuchsia-400/40 focus:bg-[#0c1428]"
                  placeholder="••••••••"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 font-semibold text-white transition hover:bg-white/15"
                >
                  Volver
                </button>

                <button
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-teal-400 via-fuchsia-500 to-violet-500 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(168,85,247,0.35)] transition duration-300 hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Validando..." : "Iniciar sesión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrmApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authStep, setAuthStep] = useState("landing");
  const [active, setActive] = useState("Dashboard");
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [authLoading, setAuthLoading] = useState(true);

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialUsers;
      }
    }
    return initialUsers;
  });

  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem(LEADS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialLeads;
      }
    }
    return initialLeads;
  });

  const [ventas, setVentas] = useState(() => {
    const saved = localStorage.getItem(VENTAS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialVentas;
      }
    }
    return initialVentas;
  });

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(VENTAS_STORAGE_KEY, JSON.stringify(ventas));
  }, [ventas]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await apiFetch("/me");

        if (!res.ok) {
          setAuthLoading(false);
          return;
        }

        const apiUser = await res.json();
        const mergedUser = mergeAuthUser(apiUser, users);

        setCurrentUser(mergedUser);
        setLoggedIn(true);
        setActive(mergedUser.rol === "Comercial" ? "Ventas" : "Dashboard");
      } catch (error) {
        console.error("Error restaurando sesión:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, [users]);

  const scopeUser = currentUser || EMPTY_SCOPE_USER;

  const scopedCampaigns = filterCampaignsByUser(campaigns, scopeUser);
  const scopedUsers = filterUsersByUser(users, scopeUser);
  const scopedLeads = filterLeadsByUser(leads, scopeUser);
  const scopedVentas = filterVentasByUser(ventas, scopeUser);

  const pageProps = {
    currentUser,
    campaigns: scopedCampaigns,
    setCampaigns,
    users: scopedUsers,
    setUsers,
    leads: scopedLeads,
    setLeads,
    ventas: scopedVentas,
    setVentas,
  };

  const renderPage = () => {
    switch (active) {
      case "Leads":
        return <Leads {...pageProps} />;
      case "Clientes":
        return <Clientes {...pageProps} />;
      case "Campanas":
        return <Campanas {...pageProps} />;
      case "Seguimiento":
        return <Seguimiento {...pageProps} />;
      case "Ventas":
        return <Ventas {...pageProps} />;
      case "Cargar Venta":
        return <FichasVenta {...pageProps} />;
      case "Agenda":
        return <Agenda {...pageProps} />;
      case "Calidad":
        return <Calidad {...pageProps} />;
      case "Reportes":
        return <Reportes {...pageProps} />;
      case "Usuarios":
        return <Usuarios {...pageProps} />;
      case "Configuracion":
        return <Configuracion {...pageProps} />;
      case "Ranking":
        return <Ranking {...pageProps} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  const handleLogin = async ({ login, password }) => {
    try {
      const res = await apiFetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          ok: false,
          message:
            data?.errors?.login?.[0] ||
            data?.errors?.email?.[0] ||
            data?.message ||
            "Credenciales incorrectas.",
        };
      }

      const authUser = data?.user || null;

      if (!authUser) {
        return { ok: false, message: "No se pudo obtener el usuario autenticado." };
      }

      const mergedUser = mergeAuthUser(authUser, users);

      setCurrentUser(mergedUser);
      setActive(mergedUser.rol === "Comercial" ? "Ventas" : "Dashboard");
      setLoggedIn(true);

      return { ok: true };
    } catch (error) {
      console.error("Error en login:", error);
      return { ok: false, message: "Error de conexión con el servidor." };
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    } finally {
      setLoggedIn(false);
      setCurrentUser(null);
      setActive("Dashboard");
      setAuthStep("landing");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070d] text-white">
        Cargando...
      </div>
    );
  }

  if (loggedIn) {
    return (
      <MainLayout
        active={active}
        setActive={setActive}
        onLogout={handleLogout}
        currentUser={currentUser}
      >
        {renderPage()}
      </MainLayout>
    );
  }

  return authStep === "landing" ? (
    <LandingScreen onEnter={() => setAuthStep("login")} />
  ) : (
    <LoginScreen
      onLogin={handleLogin}
      onBack={() => setAuthStep("landing")}
    />
  );
}
