import { useEffect, useMemo, useState } from "react";
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
  CheckCircle2,
} from "lucide-react";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Campanas from "./pages/Campanas";
import Usuarios from "./pages/Usuarios";
import Clientes from "./pages/Clientes";
import Comunicados from "./pages/Comunicados";
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
  applyServerRoleMenuConfig,
} from "./lib/rbac";

const UPC_LOGO = "/img/upc-logo.png";

const mensajesLogin = [
  {
    titulo: "Bienvenido a CRM Solutions",
    texto: "Accede a una experiencia más clara, profesional y ordenada para dirigir tu operación comercial.",
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
      data?.errors?.login?.[0] ||
      data?.errors?.email?.[0] ||
      data?.errors?.password?.[0] ||
      "No se pudo completar la solicitud.";
    throw new Error(message);
  }

  return data;
}

function compactWrap(children) {
  return <div className="w-full min-h-[100dvh] bg-[#02040a]">{children}</div>;
}

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#172554_0%,#0f172a_32%,#05070d_76%,#02040a_100%)]" />
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
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.18, 0.9, 0.22],
            scale: [1, 1.35, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function UpcBanner() {
  return (
    <div className="w-full max-w-[760px] rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center justify-center rounded-[22px] bg-white px-4 py-3 shadow-md">
          <img
            src={UPC_LOGO}
            alt="UPC"
            className="h-16 w-auto object-contain sm:h-20"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="hidden h-16 w-24 items-center justify-center text-2xl font-black text-[#d61f26] sm:flex">
            UPC
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Alianza académica / soporte institucional
          </p>

          <h3 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
            Desarrollo Tecnológico - Centro de Laboratorios - UPC
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-[15px]">
            Plataforma presentada con enfoque profesional y académico, orientada
            a la gestión comercial, visibilidad operativa, control de procesos y
            mejora continua del entorno CRM.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Proyecto aplicado",
              "Soporte académico",
              "Entorno profesional",
              "Gestión comercial",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-2xl border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-slate-200"
              >
                <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-300" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingScreen({ onEnter }) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % frasesLanding.length);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const phrase = frasesLanding[phraseIndex];

  return compactWrap(
    <div className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#02040a] text-white">
      <StarField />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-center px-6 py-8 lg:px-10">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
                  CRM Solutions
                </p>
                <p className="text-2xl font-bold text-white">
                  Plataforma comercial
                </p>
              </div>
            </div>

            <UpcBanner />

            <AnimatePresence mode="wait">
              <motion.div
                key={phrase.titulo}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45 }}
                className="space-y-5"
              >
                <h1 className="max-w-[760px] text-[clamp(2.5rem,5vw,5rem)] font-black leading-[1.03]">
                  <span
                    className={`bg-gradient-to-r ${phrase.color} bg-clip-text text-transparent`}
                  >
                    {phrase.titulo}
                  </span>
                </h1>

                <p className="max-w-[700px] text-[clamp(1rem,1.2vw,1.15rem)] leading-8 text-slate-300">
                  {phrase.texto}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-500 px-6 py-3 text-base font-semibold text-slate-950"
              >
                Ingresar al CRM
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-5 py-3 text-sm text-slate-300 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                En producción
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-[34px] border border-white/10 bg-white/8 p-7 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
              <div className="mb-5 flex items-center gap-3">
                <MoonStar className="h-5 w-5 text-cyan-300" />
                <p className="text-lg font-semibold text-white">
                  Visión comercial integrada
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    icon: BriefcaseBusiness,
                    title: "Campañas y responsables",
                    text: "Visualiza líneas activas, responsables y estado operativo en un solo entorno.",
                    color: "text-amber-300",
                  },
                  {
                    icon: BarChart3,
                    title: "Ventas y seguimiento",
                    text: "Conecta actividad comercial, evolución y control interno con una vista más clara.",
                    color: "text-cyan-300",
                  },
                  {
                    icon: Users,
                    title: "Usuarios y estructura",
                    text: "Gestiona equipos, roles y visibilidad según cada nivel de acceso.",
                    color: "text-fuchsia-300",
                  },
                  {
                    icon: Sparkles,
                    title: "Entorno académico y profesional",
                    text: "Presentación reforzada con apoyo visual e institucional para una imagen más sólida.",
                    color: "text-emerald-300",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-[26px] border border-white/10 bg-white/6 p-5"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${item.color}`} />
                        <p className="text-lg font-semibold text-white">
                          {item.title}
                        </p>
                      </div>
                      <p className="text-sm leading-7 text-slate-300">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onBack }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % mensajesLogin.length);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const message = mensajesLogin[slide];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (data?.user) {
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return compactWrap(
    <div className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#02040a] text-white">
      <StarField />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1380px] items-center justify-center px-6 py-8">
        <div className="grid w-full max-w-[1220px] items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="hidden lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={message.titulo}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45 }}
                className="space-y-5"
              >
                <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md">
                  <Headphones className="h-5 w-5 text-cyan-300" />
                  <p className="text-sm text-slate-200">
                    Plataforma comercial interna
                  </p>
                </div>

                <h2 className="max-w-[650px] text-5xl font-black leading-[1.08]">
                  <span
                    className={`bg-gradient-to-r ${message.color} bg-clip-text text-transparent`}
                  >
                    {message.titulo}
                  </span>
                </h2>

                <p className="max-w-[640px] text-lg leading-8 text-slate-300">
                  {message.texto}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mx-auto w-full max-w-[520px]">
            <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.22)_0%,rgba(217,70,239,0.16)_45%,rgba(168,85,247,0.24)_100%)] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/10">
                  <MoonStar className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-5xl font-black leading-none text-white">
                    Bienvenido
                  </h2>
                  <p className="mt-2 text-base text-slate-100">
                    Ingresa con tus credenciales corporativas
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-base font-semibold text-slate-100">
                    Correo o DNI
                  </label>
                  <input
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full rounded-[20px] border border-white/10 bg-[#061127] px-5 py-4 text-lg text-white outline-none placeholder:text-slate-400"
                    placeholder="usuario@empresa.com"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-base font-semibold text-slate-100">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-[20px] border border-white/10 bg-[#061127] px-5 py-4 text-lg text-white outline-none placeholder:text-slate-400"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 text-base font-semibold text-white transition hover:bg-white/15"
                  >
                    Volver
                  </button>

                  <button
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-teal-400 via-fuchsia-500 to-violet-500 py-3 text-base font-semibold text-white transition duration-300 hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Validando..." : "Iniciar sesión"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ text = "Cargando CRM..." }) {
  return compactWrap(
    <div className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#02040a] text-white">
      <StarField />
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="rounded-[30px] border border-white/10 bg-white/8 px-8 py-7 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-300/30 border-t-cyan-300" />
          <p className="text-lg font-semibold text-white">{text}</p>
        </div>
      </div>
    </div>
  );
}

export default function CrmApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authStep, setAuthStep] = useState("landing");
  const [active, setActive] = useState("Dashboard");
  const [currentUser, setCurrentUser] = useState(null);

  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [ventas, setVentas] = useState([]);

  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    let activeSession = true;

    async function bootstrap() {
      try {
        const me = await apiFetch("/me");

        if (!activeSession) return;

        const user = me?.user || me;
        if (user?.id) {
          setCurrentUser(user);
          setLoggedIn(true);
          setAuthStep("login");
          setActive(user.rol === "Comercial" ? "Ventas" : "Dashboard");
        }
      } catch {
        if (!activeSession) return;
        setLoggedIn(false);
        setCurrentUser(null);
      } finally {
        if (activeSession) {
          setBootLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      activeSession = false;
    };
  }, []);

  useEffect(() => {
    if (!loggedIn || !currentUser) return;

    let mounted = true;

    async function hydrateRoleMenus() {
      try {
        const data = await apiFetch("/settings/role-menus");
        if (!mounted) return;

        if (data?.config) {
          applyServerRoleMenuConfig(data.config);
        }
      } catch {
        //
      }
    }

    hydrateRoleMenus();

    return () => {
      mounted = false;
    };
  }, [loggedIn, currentUser]);

  useEffect(() => {
    if (!loggedIn || !currentUser) return;

    let mounted = true;

    async function loadBaseData() {
      const results = await Promise.allSettled([
        apiFetch("/campaigns/list"),
        apiFetch("/users/list"),
        apiFetch("/leads/list"),
        apiFetch("/ventas/list"),
      ]);

      if (!mounted) return;

      const [campaignsRes, usersRes, leadsRes, ventasRes] = results;

      if (campaignsRes.status === "fulfilled") {
        setCampaigns(campaignsRes.value?.campaigns || []);
      }

      if (usersRes.status === "fulfilled") {
        setUsers(usersRes.value?.users || []);
      }

      if (leadsRes.status === "fulfilled") {
        setLeads(leadsRes.value?.leads || []);
      }

      if (ventasRes.status === "fulfilled") {
        setVentas(ventasRes.value?.ventas || []);
      }
    }

    loadBaseData();

    return () => {
      mounted = false;
    };
  }, [loggedIn, currentUser]);

  const scopedCampaigns = useMemo(() => {
    if (!currentUser) return campaigns;
    return filterCampaignsByUser(campaigns, currentUser);
  }, [campaigns, currentUser]);

  const scopedUsers = useMemo(() => {
    if (!currentUser) return users;
    return filterUsersByUser(users, currentUser);
  }, [users, currentUser]);

  const scopedLeads = useMemo(() => {
    if (!currentUser) return leads;
    return filterLeadsByUser(leads, currentUser);
  }, [leads, currentUser]);

  const scopedVentas = useMemo(() => {
    if (!currentUser) return ventas;
    return filterVentasByUser(ventas, currentUser);
  }, [ventas, currentUser]);

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
      case "Comunicados":
        return <Comunicados {...pageProps} />;
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
    setActive(user?.rol === "Comercial" ? "Ventas" : "Dashboard");
    setLoggedIn(true);
    setAuthStep("login");
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/logout", {
        method: "POST",
      });
    } catch {
      //
    }

    setLoggedIn(false);
    setCurrentUser(null);
    setCampaigns([]);
    setUsers([]);
    setLeads([]);
    setVentas([]);
    setActive("Dashboard");
    setAuthStep("landing");
  };

  if (bootLoading) {
    return <LoadingScreen text="Cargando sesión..." />;
  }

  if (loggedIn && currentUser) {
    return compactWrap(
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
