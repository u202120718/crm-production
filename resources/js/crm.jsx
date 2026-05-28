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
  BriefcaseBusiness,
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

const initialCampaigns = [
  { id: 1, nombre: "Vodafone Fibra", responsable: "Elena P.", estado: "Activa" },
  { id: 2, nombre: "Naturgy Luz", responsable: "Julián", estado: "Activa" },
  { id: 3, nombre: "MasMovil Movil", responsable: "Elena P.", estado: "Activa" },
  { id: 4, nombre: "Alarmas", responsable: "Julián", estado: "Pausada" },
];

const initialUsers = [
  {
    id: 1,
    nombre: "Julián",
    email: "julian@crm.com",
    password: "123456",
    dni: "12345678A",
    rol: "Gerente",
    campana: "",
    coordinador: "",
    supervisor: "",
    estado: "Activo",
    allowedMenus: [],
    allowedCampaigns: [],
  },
  {
    id: 2,
    nombre: "Admin Vodafone",
    email: "admin.vf@crm.com",
    password: "123456",
    dni: "87654321B",
    rol: "Admin",
    campana: "",
    coordinador: "",
    supervisor: "",
    estado: "Activo",
    allowedMenus: ["Dashboard", "Leads", "Ventas", "Reportes", "Usuarios", "Ranking"],
    allowedCampaigns: ["Vodafone Fibra"],
  },
  {
    id: 3,
    nombre: "Elena P.",
    email: "elena@crm.com",
    password: "123456",
    dni: "44556677C",
    rol: "Supervisor",
    campana: "Vodafone Fibra",
    coordinador: "",
    supervisor: "",
    estado: "Activo",
    allowedMenus: [],
    allowedCampaigns: ["Vodafone Fibra"],
  },
  {
    id: 4,
    nombre: "Paola R.",
    email: "paola@crm.com",
    password: "123456",
    dni: "99887766D",
    rol: "Backoffice",
    campana: "Vodafone Fibra",
    coordinador: "",
    supervisor: "",
    estado: "Activo",
    allowedMenus: [],
    allowedCampaigns: ["Vodafone Fibra"],
  },
  {
    id: 5,
    nombre: "Luis A.",
    email: "luis@crm.com",
    password: "123456",
    dni: "11223344E",
    rol: "Comercial",
    campana: "Vodafone Fibra",
    coordinador: "Elena P.",
    supervisor: "Elena P.",
    estado: "Activo",
    allowedMenus: [],
    allowedCampaigns: ["Vodafone Fibra"],
  },
];

const initialLeads = [
  {
    id: 1,
    nombre: "Maria Gomez",
    telefono: "612345678",
    campana: "Vodafone Fibra",
    estado: "Pendiente",
    provincia: "Madrid",
  },
  {
    id: 2,
    nombre: "Carlos Ruiz",
    telefono: "698221145",
    campana: "Naturgy Luz",
    estado: "Contactado",
    provincia: "Valencia",
  },
  {
    id: 3,
    nombre: "Lucia Perez",
    telefono: "611406772",
    campana: "MasMovil Movil",
    estado: "Rellamada",
    provincia: "Sevilla",
  },
  {
    id: 4,
    nombre: "David Leon",
    telefono: "645781219",
    campana: "Alarmas",
    estado: "Pendiente",
    provincia: "Zaragoza",
  },
];

const initialVentas = [
  {
    id: 1,
    fecha: "2026-04-28",
    hora: "10:30",
    cliente: "María Gómez",
    documento: "12345678X",
    telefono: "612345678",
    campana: "Vodafone Fibra",
    comercial: "Luis A.",
    coordinador: "Elena P.",
    supervisor: "Elena P.",
    producto: "Fibra + Móvil",
    estado: "Tramitada",
    serviciosTv: ["Netflix", "Fútbol"],
    ficha: {},
  },
];

const mensajesLogin = [
  {
    titulo: "Bienvenido a CRM Solutions",
    texto: "Accede a una experiencia más clara, elegante y profesional para dirigir tu operación comercial.",
    color: "from-cyan-300 via-sky-300 to-blue-400",
  },
  {
    titulo: "Cada acceso abre una oportunidad",
    texto: "Supervisa campañas, usuarios, ventas y seguimiento desde un entorno mejor organizado.",
    color: "from-fuchsia-300 via-pink-300 to-rose-400",
  },
  {
    titulo: "Más control, más enfoque, mejores decisiones",
    texto: "Trabaja con una plataforma preparada para validar, ordenar y hacer crecer tu gestión.",
    color: "from-emerald-300 via-teal-300 to-cyan-400",
  },
];

const frasesLanding = [
  {
    titulo: "Un CRM con presencia, orden y visión",
    texto: "Diseñado para que la gestión comercial se sienta más seria, más clara y mucho más profesional desde el primer acceso.",
    color: "from-cyan-300 via-sky-300 to-blue-400",
  },
  {
    titulo: "Haz que cada acción tenga más valor",
    texto: "Centraliza campañas, ventas, usuarios y seguimiento en un entorno visualmente más atractivo y mejor estructurado.",
    color: "from-fuchsia-300 via-pink-300 to-rose-400",
  },
  {
    titulo: "Más claridad para operar mejor",
    texto: "Una plataforma pensada para validar procesos, mejorar el control operativo y proyectar una imagen más sólida.",
    color: "from-amber-300 via-orange-300 to-red-400",
  },
  {
    titulo: "Profesional desde el primer vistazo",
    texto: "Orden, control, visibilidad y una experiencia visual que transmite estructura y crecimiento.",
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
              Plataforma comercial interna
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-tight text-white lg:text-6xl">
              Un CRM más
              <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(125,211,252,0.35)]">
                {" "}llamativo, elegante y profesional
              </span>
              {" "}para validar tu operación.
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
                Ingresar al CRM
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Validación local antes de VPS
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
              <p className="text-lg font-semibold text-white">Más visibilidad operativa</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Controla campañas, ventas, usuarios y seguimiento con una vista más limpia y ejecutiva.
            </p>
          </div>

          <div className="rounded-[28px] border border-fuchsia-400/10 bg-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-fuchsia-300" />
              <p className="text-lg font-semibold text-white">Roles y estructura</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Organiza accesos, campañas y visibilidad con una experiencia más seria y ordenada.
            </p>
          </div>

          <div className="rounded-[28px] border border-amber-400/10 bg-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-amber-300" />
              <p className="text-lg font-semibold text-white">Enfoque en resultados</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Una base visual más sólida para validar procesos y proyectar mejor tu CRM antes de producción.
            </p>
          </div>

          <div className="rounded-[28px] border border-emerald-400/10 bg-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <p className="text-lg font-semibold text-white">Imagen con más impacto</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Un acceso inicial más atractivo para que el sistema se sienta más premium desde el primer vistazo.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoginScreen({ users, onLogin, onBack }) {
  const [loginValue, setLoginValue] = useState("julian@crm.com");
  const [password, setPassword] = useState("123456");
  const [fraseIndex, setFraseIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setFraseIndex((prev) => (prev + 1) % mensajesLogin.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const mensajeActual = mensajesLogin[fraseIndex];

  const handleSubmit = (e) => {
    e.preventDefault();

    const value = loginValue.trim().toLowerCase();
    const pass = password.trim();

    const foundUser = users.find((u) => {
      const emailMatch = (u.email || "").trim().toLowerCase() === value;
      const dniMatch = (u.dni || "").trim().toLowerCase() === value;
      const passMatch = (u.password || "").trim() === pass;
      const activeMatch = (u.estado || "") === "Activo";
      return (emailMatch || dniMatch) && passMatch && activeMatch;
    });

    if (!foundUser) {
      setError("Usuario, DNI o contraseña incorrectos.");
      return;
    }

    setError("");
    onLogin(foundUser);
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
              Acceso al panel comercial
            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-tight text-white">
              Entra a un panel con una presencia más sólida, clara y profesional.
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
                <p className="text-sm text-slate-100">Accede a tu panel comercial</p>
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

                <button className="w-full rounded-2xl bg-gradient-to-r from-teal-400 via-fuchsia-500 to-violet-500 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(168,85,247,0.35)] transition duration-300 hover:scale-[1.02] hover:brightness-110">
                  Iniciar sesión
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

  const scopedCampaigns = filterCampaignsByUser(campaigns, currentUser || initialUsers[0]);
  const scopedUsers = filterUsersByUser(users, currentUser || initialUsers[0]);
  const scopedLeads = filterLeadsByUser(leads, currentUser || initialUsers[0]);
  const scopedVentas = filterVentasByUser(ventas, currentUser || initialUsers[0]);

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

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActive(user.rol === "Comercial" ? "Ventas" : "Dashboard");
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser(null);
    setActive("Dashboard");
    setAuthStep("landing");
  };

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
      users={users}
      onLogin={handleLogin}
      onBack={() => setAuthStep("landing")}
    />
  );
}
