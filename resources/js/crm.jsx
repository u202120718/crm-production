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
  Zap,
  Rocket,
  LockKeyhole,
  Activity,
  Layers3,
  Gauge,
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
  applyServerRoleMenuConfig,
} from "./lib/rbac";

const OMC_LOGO = "/img/omc-logo.png";
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

const mensajesLogin = [
  {
    titulo: "Bienvenido a OMC CRM",
    texto: "Accede a una plataforma comercial más clara, visual y preparada para operar con campañas, ventas y validación.",
    color: "from-cyan-300 via-teal-300 to-emerald-400",
  },
  {
    titulo: "Control comercial en tiempo real",
    texto: "Gestiona usuarios, ventas, campañas y seguimiento desde un entorno moderno y ordenado.",
    color: "from-fuchsia-300 via-pink-300 to-rose-400",
  },
  {
    titulo: "Más velocidad para decidir mejor",
    texto: "Visualiza indicadores, operaciones y validaciones con una experiencia más profesional.",
    color: "from-amber-300 via-orange-300 to-red-400",
  },
];

const frasesLanding = [
  {
    titulo: "Más claridad para operar mejor",
    texto: "Una plataforma diseñada para controlar campañas, ventas, equipos y validaciones desde una experiencia visual más profesional.",
    color: "from-cyan-300 via-teal-300 to-emerald-400",
  },
  {
    titulo: "Tu operación comercial en una sola pantalla",
    texto: "Centraliza gestión, seguimiento y resultados con una interfaz moderna, rápida y preparada para crecer.",
    color: "from-fuchsia-300 via-pink-300 to-violet-400",
  },
  {
    titulo: "De call center a centro de control",
    texto: "Convierte cada campaña en un flujo ordenado, medible y fácil de supervisar para todo tu equipo.",
    color: "from-amber-300 via-orange-300 to-red-400",
  },
  {
    titulo: "Un CRM con imagen de software profesional",
    texto: "Diseño moderno, módulos claros, indicadores útiles y una navegación preparada para operación diaria.",
    color: "from-sky-300 via-blue-300 to-indigo-400",
  },
];

const featureCards = [
  {
    icon: BriefcaseBusiness,
    title: "Campañas",
    text: "Catálogos, responsables, productos y configuración por línea comercial.",
    color: "text-amber-300",
    glow: "rgba(245,158,11,.28)",
  },
  {
    icon: BarChart3,
    title: "Ventas",
    text: "Visualización, validación, edición, estados y exportación operativa.",
    color: "text-cyan-300",
    glow: "rgba(34,211,238,.28)",
  },
  {
    icon: Users,
    title: "Equipos",
    text: "Roles, permisos, supervisión, comerciales y backoffice centralizados.",
    color: "text-fuchsia-300",
    glow: "rgba(217,70,239,.28)",
  },
  {
    icon: ShieldCheck,
    title: "Control",
    text: "Seguimiento, calidad, reportes y trazabilidad de cada gestión.",
    color: "text-emerald-300",
    glow: "rgba(16,185,129,.28)",
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
  if (token) headers["X-XSRF-TOKEN"] = decodeURIComponent(token);

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
      Array.from({ length: 170 }, (_, i) => {
        const palette = [
          "rgba(34,211,238,.95)",
          "rgba(45,212,191,.95)",
          "rgba(217,70,239,.90)",
          "rgba(251,191,36,.90)",
          "rgba(255,255,255,.95)",
          "rgba(96,165,250,.90)",
        ];

        return {
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: 1.1 + Math.random() * 3.5,
          color: palette[Math.floor(Math.random() * palette.length)],
          delay: Math.random() * 2.4,
          duration: 0.9 + Math.random() * 1.9,
          drift: 10 + Math.random() * 28,
        };
      }),
    []
  );

  const shootingStars = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        top: `${8 + Math.random() * 70}%`,
        delay: Math.random() * 4,
        duration: 2.2 + Math.random() * 1.4,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 12% 12%, rgba(34,211,238,.22), transparent 28%), radial-gradient(circle at 86% 16%, rgba(168,85,247,.20), transparent 30%), radial-gradient(circle at 55% 80%, rgba(16,185,129,.16), transparent 28%), linear-gradient(135deg,#02040a 0%,#071126 44%,#02040a 100%)",
            "radial-gradient(circle at 20% 18%, rgba(217,70,239,.22), transparent 30%), radial-gradient(circle at 82% 26%, rgba(251,191,36,.16), transparent 26%), radial-gradient(circle at 52% 82%, rgba(34,211,238,.18), transparent 28%), linear-gradient(135deg,#02040a 0%,#0b1029 44%,#02040a 100%)",
            "radial-gradient(circle at 14% 18%, rgba(16,185,129,.20), transparent 30%), radial-gradient(circle at 88% 18%, rgba(59,130,246,.20), transparent 28%), radial-gradient(circle at 50% 82%, rgba(244,63,94,.14), transparent 28%), linear-gradient(135deg,#02040a 0%,#071126 44%,#02040a 100%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:46px_46px] opacity-20" />

      <motion.div
        className="absolute left-[-10%] top-[3%] h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: "rgba(34,211,238,0.18)" }}
        animate={{ x: [0, 38, 0], y: [0, -28, 0], opacity: [0.18, 0.42, 0.18] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-[-8%] top-[10%] h-[24rem] w-[24rem] rounded-full blur-3xl"
        style={{ background: "rgba(217,70,239,0.18)" }}
        animate={{ x: [0, -36, 0], y: [0, 28, 0], opacity: [0.16, 0.38, 0.16] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[-12%] left-[36%] h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "rgba(16,185,129,0.16)" }}
        animate={{ x: [0, 28, -18, 0], y: [0, -30, 20, 0], opacity: [0.14, 0.35, 0.2, 0.14] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: star.color,
            boxShadow: `0 0 16px ${star.color}`,
          }}
          animate={{
            opacity: [0.15, 1, 0.28],
            scale: [0.75, 1.65, 0.9],
            x: [0, star.drift, 0],
            y: [0, -star.drift / 2, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {shootingStars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute left-[-12%] h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
          style={{ top: star.top }}
          animate={{
            x: ["0vw", "125vw"],
            y: ["0vh", "22vh"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            repeatDelay: 4.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function OmcLogoBlock() {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.92, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 rounded-[38px] bg-cyan-300/10 blur-3xl"
        animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative rounded-[34px] border border-white/14 bg-white/[0.08] px-8 py-7 shadow-[0_28px_80px_rgba(0,0,0,.28)] backdrop-blur-2xl">
        <motion.img
          src={OMC_LOGO}
          alt="OMC Contact Center BPO"
          className="h-auto w-[min(420px,78vw)] object-contain drop-shadow-[0_14px_38px_rgba(45,212,191,.35)]"
          animate={{ y: [0, -8, 0], scale: [1, 1.018, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

function OmcBanner() {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.08] p-5 shadow-[0_22px_60px_rgba(0,0,0,.22)] backdrop-blur-xl">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-cyan-300/14 blur-3xl" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center">
        <div className="shrink-0">
          <OmcLogoBlock />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-200">
            Infraestructura comercial / soporte operativo
          </p>

          <h3 className="mt-2 text-[clamp(1.25rem,2vw,2rem)] font-black leading-tight text-white">
            Contact Center BPO para gestión comercial
          </h3>

          <p className="mt-3 max-w-[720px] text-sm leading-7 text-slate-300">
            Plataforma orientada a controlar campañas, ventas, responsables, validaciones y visibilidad operativa desde un entorno moderno, rápido y profesional.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Operación comercial",
              "Control de ventas",
              "Supervisión continua",
              "Backoffice y validación",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-3 py-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimatedButton({ children, onClick, variant = "primary", icon: Icon = ArrowRight }) {
  const variants = {
    primary:
      "from-teal-300 via-cyan-400 to-violet-500 text-slate-950 shadow-[0_14px_32px_rgba(34,211,238,.22)]",
    hot:
      "from-amber-300 via-orange-400 to-rose-500 text-slate-950 shadow-[0_14px_32px_rgba(249,115,22,.22)]",
    green:
      "from-emerald-300 via-teal-400 to-cyan-500 text-slate-950 shadow-[0_14px_32px_rgba(16,185,129,.22)]",
  };

  return (
    <motion.button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r px-6 py-3 text-sm font-black ${variants[variant]}`}
      whileHover={{ scale: 1.035, y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.span
        className="absolute inset-0 bg-white/35"
        initial={{ x: "-120%" }}
        whileHover={{ x: "120%" }}
        transition={{ duration: 0.65 }}
        style={{ transform: "skewX(-18deg)" }}
      />
      <span className="relative z-10">{children}</span>
      <Icon className="relative z-10 h-4 w-4 transition group-hover:translate-x-1" />
    </motion.button>
  );
}

function FeatureCard({ item, index }) {
  const Icon = item.icon;

  return (
    <motion.div
      className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.12, duration: 0.55 }}
      whileHover={{ y: -6, scale: 1.015 }}
    >
      <div
        className="absolute -right-12 -top-12 h-28 w-28 rounded-full blur-3xl transition group-hover:opacity-100"
        style={{ background: item.glow, opacity: 0.45 }}
      />

      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">
            <Icon className={`h-5 w-5 ${item.color}`} />
          </div>
          <p className="text-lg font-black text-white">{item.title}</p>
        </div>

        <p className="text-sm leading-7 text-slate-300">{item.text}</p>
      </div>
    </motion.div>
  );
}

function LandingScreen({ onEnter }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [buttonVariant, setButtonVariant] = useState("primary");

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % frasesLanding.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const variants = ["primary", "hot", "green"];
    const interval = setInterval(() => {
      setButtonVariant((prev) => {
        const index = variants.indexOf(prev);
        return variants[(index + 1) % variants.length];
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const phrase = frasesLanding[phraseIndex];

  return compactWrap(
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#02040a] text-white">
      <StarField />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1440px] items-center px-5 py-8 lg:px-10">
        <div className="grid w-full items-center gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <motion.div
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,.22)] backdrop-blur-xl"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Headphones className="h-5 w-5 text-cyan-200" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.26em] text-slate-300">
                  CRM Commercial Platform
                </p>
                <p className="text-[clamp(1.25rem,1.75vw,1.75rem)] font-black text-white">
                  OMC Contact Center BPO
                </p>
              </div>
            </motion.div>

            <OmcBanner />

            <AnimatePresence mode="wait">
              <motion.div
                key={phrase.titulo}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                transition={{ duration: 0.48 }}
                className="space-y-4"
              >
                <h1 className="max-w-[760px] text-[clamp(2.8rem,5.2vw,6.4rem)] font-black leading-[0.96] tracking-[-0.06em]">
                  <span className={`bg-gradient-to-r ${phrase.color} bg-clip-text text-transparent`}>
                    {phrase.titulo}
                  </span>
                </h1>

                <p className="max-w-[710px] text-[clamp(1rem,1.25vw,1.2rem)] leading-8 text-slate-300">
                  {phrase.texto}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-3">
              <AnimatedButton onClick={onEnter} variant={buttonVariant}>
                Ingresar al CRM
              </AnimatedButton>

              <motion.div
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-slate-200 backdrop-blur-xl"
                animate={{ borderColor: ["rgba(255,255,255,.10)", "rgba(34,211,238,.35)", "rgba(255,255,255,.10)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                En producción
              </motion.div>
            </div>
          </div>

          <div className="space-y-5">
            <motion.div
              className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.08] p-5 shadow-[0_30px_90px_rgba(0,0,0,.28)] backdrop-blur-2xl"
              initial={{ opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65 }}
            >
              <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-cyan-300/18 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-fuchsia-300/14 blur-3xl" />

              <div className="relative z-10 mb-5 flex items-center gap-3">
                <MoonStar className="h-5 w-5 text-cyan-200" />
                <p className="text-lg font-black text-white">Visión comercial integrada</p>
              </div>

              <div className="relative z-10 grid gap-4 sm:grid-cols-2">
                {featureCards.map((item, index) => (
                  <FeatureCard key={item.title} item={item} index={index} />
                ))}
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Gauge, label: "Velocidad", value: "Alta", color: "text-cyan-300" },
                { icon: LockKeyhole, label: "Acceso", value: "Seguro", color: "text-emerald-300" },
                { icon: Layers3, label: "Módulos", value: "CRM", color: "text-fuchsia-300" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4 text-center backdrop-blur-xl"
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.13, duration: 0.45 }}
                    whileHover={{ y: -5, scale: 1.03 }}
                  >
                    <Icon className={`mx-auto mb-2 h-5 w-5 ${item.color}`} />
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-lg font-black text-white">{item.value}</p>
                  </motion.div>
                );
              })}
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
  const [buttonVariant, setButtonVariant] = useState("primary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % mensajesLogin.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const variants = ["primary", "hot", "green"];
    const interval = setInterval(() => {
      setButtonVariant((prev) => {
        const index = variants.indexOf(prev);
        return variants[(index + 1) % variants.length];
      });
    }, 1800);

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

      if (data?.user) onLogin(data.user);
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return compactWrap(
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#02040a] text-white">
      <StarField />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1220px] items-center justify-center px-6 py-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_0.86fr]">
          <div className="hidden space-y-6 lg:block">
            <OmcLogoBlock />

            <AnimatePresence mode="wait">
              <motion.div
                key={message.titulo}
                initial={{ opacity: 0, y: 18, filter: "blur(7px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -18, filter: "blur(7px)" }}
                transition={{ duration: 0.45 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur-xl">
                  <Rocket className="h-5 w-5 text-cyan-300" />
                  <p className="text-sm font-semibold text-slate-200">Plataforma comercial interna</p>
                </div>

                <h2 className="max-w-[620px] text-[clamp(2.4rem,4.2vw,4.8rem)] font-black leading-[0.98] tracking-[-0.05em]">
                  <span className={`bg-gradient-to-r ${message.color} bg-clip-text text-transparent`}>
                    {message.titulo}
                  </span>
                </h2>

                <p className="max-w-[560px] text-[1rem] leading-8 text-slate-300">
                  {message.texto}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            className="mx-auto w-full max-w-[470px]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55 }}
          >
            <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.09] p-6 shadow-[0_30px_90px_rgba(0,0,0,.34)] backdrop-blur-2xl">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/18 blur-3xl" />
              <div className="absolute -bottom-16 left-12 h-40 w-40 rounded-full bg-fuchsia-300/15 blur-3xl" />

              <div className="relative z-10 mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/10">
                  <MoonStar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-black leading-none text-white">Bienvenido</h2>
                  <p className="mt-2 text-sm text-slate-200">Ingresa con tus credenciales corporativas</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-100">Correo o DNI</label>
                  <input
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full rounded-[18px] border border-white/12 bg-[#061127]/90 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
                    placeholder="usuario@empresa.com"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-100">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-[18px] border border-white/12 bg-[#061127]/90 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <motion.button
                    type="button"
                    onClick={onBack}
                    className="rounded-2xl border border-white/10 bg-white/10 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Volver
                  </motion.button>

                  <button
                    disabled={loading}
                    className={`rounded-2xl bg-gradient-to-r py-3 text-sm font-black transition duration-300 hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 ${
                      buttonVariant === "hot"
                        ? "from-amber-300 via-orange-400 to-rose-500 text-slate-950"
                        : buttonVariant === "green"
                        ? "from-emerald-300 via-teal-400 to-cyan-500 text-slate-950"
                        : "from-teal-300 via-cyan-400 to-violet-500 text-slate-950"
                    }`}
                  >
                    {loading ? "Validando..." : "Iniciar sesión"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ text = "Cargando CRM..." }) {
  return compactWrap(
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#02040a] text-white">
      <StarField />
      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-6">
        <div className="rounded-[26px] border border-white/10 bg-white/[0.08] px-8 py-7 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-300/30 border-t-cyan-300" />
          <p className="text-lg font-semibold text-white">{text}</p>
        </div>
      </div>
    </div>
  );
}

function mergeById(prevItems = [], nextItems = []) {
  const map = new Map();

  prevItems.forEach((item) => {
    if (item?.id != null) map.set(item.id, item);
  });

  nextItems.forEach((item) => {
    if (item?.id != null) {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    }
  });

  return Array.from(map.values()).sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
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
        if (activeSession) setBootLoading(false);
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

        if (data?.config) applyServerRoleMenuConfig(data.config);
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
        setCampaigns((prev) => mergeById(prev, campaignsRes.value?.campaigns || []));
      }

      if (usersRes.status === "fulfilled") {
        setUsers((prev) => mergeById(prev, usersRes.value?.users || []));
      }

      if (leadsRes.status === "fulfilled") {
        setLeads((prev) => mergeById(prev, leadsRes.value?.leads || []));
      }

      if (ventasRes.status === "fulfilled") {
        setVentas((prev) => mergeById(prev, ventasRes.value?.ventas || []));
      }
    }

    loadBaseData();

    return () => {
      mounted = false;
    };
  }, [loggedIn, currentUser]);

  useEffect(() => {
    if (!loggedIn || !currentUser) return;

    let timeoutId = null;

    const expireSession = async () => {
      try {
        await apiFetch("/logout", { method: "POST" });
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
      setAuthStep("login");
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(expireSession, IDLE_TIMEOUT_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
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

  const scopedVentas = useMemo(() => ventas || [], [ventas]);

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
      await apiFetch("/logout", { method: "POST" });
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

  if (bootLoading) return <LoadingScreen text="Cargando sesión..." />;

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
    <LoginScreen onLogin={handleLogin} onBack={() => setAuthStep("landing")} />
  );
}
