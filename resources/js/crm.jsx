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
import AsistenteIA from "./pages/AsistenteIA";
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

const OMC_LOGO = "/img/omc-logo.jpeg";
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

const mensajesLogin = [
  {
    titulo: "Bienvenido a OMC CRM",
    texto: "Accede al centro de control comercial para gestionar campañas, ventas, usuarios, validaciones y reportes desde una sola plataforma.",
    color: "from-cyan-300 via-teal-300 to-emerald-400",
  },
  {
    titulo: "Supervisa tu operación en tiempo real",
    texto: "Consulta ventas, estados, alertas, comerciales y rendimiento con acceso adaptado a cada rol.",
    color: "from-violet-300 via-fuchsia-300 to-pink-400",
  },
  {
    titulo: "Ventas, Backoffice y Reportes",
    texto: "Centraliza el alta de fichas, seguimiento, validación, liquidaciones y análisis operativo sin salir del CRM.",
    color: "from-amber-300 via-orange-300 to-rose-400",
  },
  {
    titulo: "Inteligencia comercial integrada",
    texto: "Utiliza OMC Intelligence para analizar ventas, campañas, usuarios, comunicados y reportes con información del CRM.",
    color: "from-sky-300 via-cyan-300 to-violet-400",
  },
];

const frasesLanding = [
  {
    titulo: "Opera mejor con OMC CRM",
    texto: "Controla campañas, ventas, usuarios, seguimiento y validaciones desde un único entorno comercial diseñado para la operación diaria.",
    color: "from-cyan-300 via-teal-300 to-emerald-400",
  },
  {
    titulo: "Ventas y Backoffice conectados",
    texto: "Cada ficha comercial fluye desde la carga de venta hasta la validación, seguimiento, alertas y cierre operativo.",
    color: "from-fuchsia-300 via-pink-300 to-violet-400",
  },
  {
    titulo: "Reportes y liquidaciones en un solo lugar",
    texto: "Analiza estados, convergentes, rendimiento comercial y comisiones con exportación directa a Excel y PDF.",
    color: "from-amber-300 via-orange-300 to-red-400",
  },
  {
    titulo: "OMC Intelligence para decidir mejor",
    texto: "Analiza ventas, campañas, usuarios, comunicados y reportes con IA integrada a la información real del CRM.",
    color: "from-sky-300 via-blue-300 to-indigo-400",
  },
];

const featureCards = [
  {
    icon: BriefcaseBusiness,
    title: "Gestión de campañas",
    text: "Configura campañas, responsables, productos, estados y campos dinámicos para cada operación.",
    color: "text-cyan-300",
    glow: "rgba(34,211,238,.28)",
  },
  {
    icon: BarChart3,
    title: "Ventas inteligentes",
    text: "Registra fichas, valida estados, controla móviles, convergentes y trazabilidad comercial.",
    color: "text-violet-300",
    glow: "rgba(139,92,246,.28)",
  },
  {
    icon: Users,
    title: "Equipos y permisos",
    text: "Administra usuarios por rol, campañas asignadas, supervisores, comerciales y Backoffice.",
    color: "text-blue-300",
    glow: "rgba(59,130,246,.28)",
  },
  {
    icon: ShieldCheck,
    title: "Control y calidad",
    text: "Supervisa alertas, comentarios de Backoffice, seguimiento, reportes y liquidaciones.",
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
  return <div className="w-full h-screen bg-[#02040a]">{children}</div>;
}

function StarField() {
  const rain = useMemo(
    () =>
      Array.from({ length: 92 }, (_, i) => {
        const colors = [
          "rgba(34,211,238,.95)",
          "rgba(45,212,191,.92)",
          "rgba(139,92,246,.92)",
          "rgba(217,70,239,.88)",
          "rgba(59,130,246,.88)",
          "rgba(16,185,129,.88)",
        ];

        return {
          id: i,
          left: `${Math.random() * 100}%`,
          height: 26 + Math.random() * 84,
          width: 1 + Math.random() * 1.4,
          delay: Math.random() * 4.8,
          duration: 2.4 + Math.random() * 3.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.18 + Math.random() * 0.48,
          drift: -18 + Math.random() * 36,
        };
      }),
    []
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 2.4,
        delay: Math.random() * 3.5,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 16% 18%, rgba(6,182,212,.18), transparent 28%), radial-gradient(circle at 84% 20%, rgba(124,58,237,.20), transparent 30%), linear-gradient(135deg,#020713 0%,#061426 48%,#020713 100%)",
            "radial-gradient(circle at 22% 22%, rgba(16,185,129,.16), transparent 28%), radial-gradient(circle at 78% 26%, rgba(217,70,239,.19), transparent 31%), linear-gradient(135deg,#020713 0%,#071226 48%,#020713 100%)",
            "radial-gradient(circle at 18% 16%, rgba(59,130,246,.18), transparent 29%), radial-gradient(circle at 86% 18%, rgba(34,211,238,.18), transparent 29%), linear-gradient(135deg,#020713 0%,#081128 48%,#020713 100%)",
          ],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:52px_52px]" />

      {rain.map((drop) => (
        <motion.span
          key={drop.id}
          className="absolute -top-24 rounded-full"
          style={{
            left: drop.left,
            width: `${drop.width}px`,
            height: `${drop.height}px`,
            background: `linear-gradient(to bottom, transparent, ${drop.color})`,
            boxShadow: `0 0 10px ${drop.color}`,
            opacity: drop.opacity,
          }}
          animate={{
            y: ["-15vh", "120vh"],
            x: [0, drop.drift],
            opacity: [0, drop.opacity, drop.opacity, 0],
          }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {stars.map((star) => (
        <motion.span
          key={`s-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.15, 0.9, 0.2],
            scale: [0.8, 1.5, 0.85],
          }}
          transition={{
            duration: 1.8 + (star.id % 4) * 0.5,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute -left-24 bottom-[-8rem] h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "rgba(6,182,212,.12)" }}
        animate={{ x: [0, 60, 0], opacity: [.12, .28, .12] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -right-24 top-[-8rem] h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: "rgba(124,58,237,.14)" }}
        animate={{ x: [0, -55, 0], opacity: [.14, .32, .14] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function OmcLogoBlock({ compact = false }) {
  return (
    <motion.div
      className="relative inline-flex items-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .55 }}
    >
      <motion.div
        className="absolute inset-0 rounded-[24px] bg-cyan-300/10 blur-2xl"
        animate={{ opacity: [.18, .5, .18] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className={`relative overflow-hidden rounded-[20px] border border-white/10 bg-[#06101f]/78 ${compact ? "px-3 py-2" : "px-4 py-3"} shadow-[0_18px_45px_rgba(0,0,0,.28)]`}>
        <img
          src={OMC_LOGO}
          alt="OMC Contact Center BPO"
          className={`${compact ? "w-[116px]" : "w-[155px]"} h-auto object-contain`}
        />
      </div>
    </motion.div>
  );
}

function OmcBanner() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-cyan-300/10 bg-[#07111f]/78 p-4 shadow-[0_18px_55px_rgba(0,0,0,.24)]">
      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <OmcLogoBlock compact />
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
            CRM Comercial · Contact Center BPO
          </p>
          <h3 className="mt-1 text-lg font-black text-white">
            Centro de control para ventas y operación
          </h3>
          <p className="mt-2 max-w-[680px] text-sm leading-6 text-slate-300">
            Gestiona campañas, fichas de venta, supervisión, Backoffice, comunicados, reportes y OMC Intelligence.
          </p>
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
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-black ${variants[variant]}`}
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
      className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl"
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
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">
            <Icon className={`h-5 w-5 ${item.color}`} />
          </div>
          <p className="text-base font-black text-white">{item.title}</p>
        </div>

        <p className="text-sm leading-6 text-slate-300">{item.text}</p>
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
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const variants = ["primary", "green", "hot"];
    const interval = setInterval(() => {
      setButtonVariant((prev) => {
        const index = variants.indexOf(prev);
        return variants[(index + 1) % variants.length];
      });
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const phrase = frasesLanding[phraseIndex];

  return compactWrap(
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden bg-[#020713] text-white">
      <StarField />

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[1580px] px-6 py-5 lg:px-8">
        <header className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <OmcLogoBlock compact />
            <div className="hidden lg:block">
              <p className="text-[10px] font-black uppercase tracking-[0.20em] text-cyan-300">
                OMC Comercial Platform
              </p>
              <p className="mt-1 text-xs text-slate-400">Contact Center BPO · CRM Operativo</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[10px] font-black text-emerald-300 md:inline-flex">
              ● SISTEMA OPERATIVO
            </span>
            <AnimatedButton onClick={onEnter} variant={buttonVariant}>
              Iniciar sesión
            </AnimatedButton>
          </div>
        </header>

        <main className="grid min-h-[calc(100vh-110px)] items-center gap-8 py-8 xl:grid-cols-[1.05fr_.95fr]">
          <section>
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/14 bg-cyan-300/[0.07] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles className="h-4 w-4" />
              Plataforma comercial interna
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={phrase.titulo}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: .45 }}
                className="mt-6"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                  CRM Contact Center BPO
                </p>

                <h1 className="mt-3 max-w-[760px] text-[clamp(2.6rem,5vw,5.5rem)] font-black leading-[.96] tracking-[-.055em] text-white">
                  <span className={`bg-gradient-to-r ${phrase.color} bg-clip-text text-transparent`}>
                    {phrase.titulo}
                  </span>
                </h1>

                <p className="mt-5 max-w-[710px] text-[clamp(.95rem,1.1vw,1.08rem)] leading-7 text-slate-300">
                  {phrase.texto}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex flex-wrap gap-3">
              <AnimatedButton onClick={onEnter} variant={buttonVariant}>
                Ingresar al CRM
              </AnimatedButton>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Acceso seguro por rol
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Ventas", "Carga y validación"],
                ["Campañas", "Configuración dinámica"],
                ["Reportes", "Excel, PDF y comisiones"],
                ["IA", "OMC Intelligence"],
              ].map(([title, sub]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-[#07111f]/72 p-4">
                  <p className="text-sm font-black text-white">{title}</p>
                  <p className="mt-1 text-xs text-slate-400">{sub}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f]/82 p-5 shadow-[0_30px_80px_rgba(0,0,0,.30)]">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="absolute -bottom-20 left-0 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative z-10 mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.20em] text-cyan-300">
                    Todo lo que necesitas
                  </p>
                  <h2 className="mt-1 text-xl font-black text-white">Una plataforma para toda tu operación</h2>
                </div>
                <Layers3 className="h-6 w-6 text-violet-300" />
              </div>

              <div className="relative z-10 grid gap-3 sm:grid-cols-2">
                {featureCards.map((item, index) => (
                  <FeatureCard key={item.title} item={item} index={index} />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Gauge, label: "Tiempo real", value: "Dashboard", color: "text-cyan-300" },
                { icon: LockKeyhole, label: "Acceso", value: "Por roles", color: "text-emerald-300" },
                { icon: Activity, label: "Backoffice", value: "Alertas", color: "text-fuchsia-300" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-[#07111f]/72 p-4 text-center">
                    <Icon className={`mx-auto h-5 w-5 ${item.color}`} />
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-black text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
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
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const variants = ["primary", "green", "hot"];
    const interval = setInterval(() => {
      setButtonVariant((prev) => {
        const index = variants.indexOf(prev);
        return variants[(index + 1) % variants.length];
      });
    }, 2600);
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
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden bg-[#020713] text-white">
      <StarField />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1320px] items-center gap-10 px-6 py-8 lg:grid-cols-[1.08fr_.92fr]">
        <section className="hidden lg:block">
          <OmcLogoBlock />

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.07] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">
            <Rocket className="h-4 w-4" />
            Plataforma CRM comercial
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={message.titulo}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 14 }}
              transition={{ duration: .42 }}
              className="mt-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.20em] text-cyan-300">
                OMC Contact Center BPO
              </p>
              <h1 className="mt-3 max-w-[650px] text-[clamp(2.8rem,5vw,5rem)] font-black leading-[.96] tracking-[-.055em]">
                <span className={`bg-gradient-to-r ${message.color} bg-clip-text text-transparent`}>
                  {message.titulo}
                </span>
              </h1>
              <p className="mt-5 max-w-[580px] text-[1rem] leading-7 text-slate-300">
                {message.texto}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-7 grid max-w-[650px] grid-cols-2 gap-3">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-[#07111f]/72 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{item.title}</p>
                      <p className="mt-1 line-clamp-1 text-[10px] text-slate-400">{item.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <motion.section
          className="mx-auto w-full max-w-[500px]"
          initial={{ opacity: 0, y: 18, scale: .98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: .5 }}
        >
          <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[#07111f]/88 p-6 shadow-[0_28px_80px_rgba(0,0,0,.34)]">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/12 blur-3xl" />
            <div className="absolute -bottom-20 left-4 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-300/20 bg-cyan-300/[0.08] shadow-[0_0_38px_rgba(34,211,238,.10)]">
                <LockKeyhole className="h-7 w-7 text-cyan-300" />
              </div>

              <h2 className="text-3xl font-black text-white">Bienvenido</h2>
              <p className="mt-2 text-sm text-slate-400">
                Ingresa con tus credenciales corporativas
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 mt-7 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-300">
                  Correo o DNI
                </label>
                <input
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full rounded-[16px] border border-white/10 bg-[#040c19] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
                  placeholder="usuario@empresa.com"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-300">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[16px] border border-white/10 bg-[#040c19] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <button
                disabled={loading}
                className={`w-full rounded-2xl bg-gradient-to-r py-3.5 text-sm font-black text-slate-950 shadow-[0_14px_35px_rgba(34,211,238,.12)] disabled:cursor-not-allowed disabled:opacity-70 ${
                  buttonVariant === "hot"
                    ? "from-amber-300 via-orange-400 to-rose-500"
                    : buttonVariant === "green"
                    ? "from-emerald-300 via-teal-400 to-cyan-500"
                    : "from-teal-300 via-cyan-400 to-violet-500"
                }`}
              >
                {loading ? "Validando..." : "Iniciar sesión"}
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.07]"
              >
                Volver
              </button>
            </form>

            <div className="relative z-10 mt-6 border-t border-white/8 pt-5 text-center">
              <p className="text-[10px] text-slate-500">
                Acceso protegido · Permisos por rol · Sesión corporativa
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function LoadingScreen({ text = "Cargando CRM..." }) {
  return compactWrap(
    <div className="relative h-screen w-full overflow-hidden bg-[#02040a] text-white">
      <StarField />
      <div className="relative z-10 flex h-screen items-center justify-center px-6">
        <div className="rounded-[26px] border border-white/10 bg-white/[0.08] px-8 py-7 text-center backdrop-blur-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-cyan-300/30 border-t-cyan-300" />
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
      case "Asistente IA":
           return (
                <AsistenteIA
                    {...pageProps}
                    currentUser={currentUser}
                />
            );
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
