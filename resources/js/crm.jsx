import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Headphones,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Users,
  BriefcaseBusiness,
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

// Lluvia multicolor: animación CSS con transform (sin renders de React).
const rainDrops = Array.from({ length: 36 }, (_, i) => ({
  left: `${(i * 37.7) % 100}%`,
  delay: `${-((i * 1.73) % 8).toFixed(2)}s`,
  duration: `${(4.2 + (i % 7) * 0.52).toFixed(2)}s`,
  height: `${45 + (i * 19) % 95}px`,
  color: ["#00e5ff", "#14b8a6", "#a855f7", "#3b82f6", "#d946ef"][i % 5],
}));

function StarField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_12%,rgba(0,220,210,.13),transparent_40%),radial-gradient(ellipse_at_88%_70%,rgba(123,58,237,.16),transparent_45%),linear-gradient(120deg,#020b16,#071124_55%,#090b1f)]" />
      {rainDrops.map((drop, i) => (
        <span key={i} className="omc-rain-drop absolute top-0 rounded-full" style={{
          left: drop.left,
          height: drop.height,
          width: i % 4 === 0 ? 2 : 1,
          background: `linear-gradient(to bottom, transparent, ${drop.color})`,
          boxShadow: `0 0 8px ${drop.color}`,
          animationDelay: drop.delay,
          animationDuration: drop.duration,
        }} />
      ))}
      <style>{`@keyframes omc-rain-fall {from {transform: translate3d(0,-180px,0);opacity:0} 12% {opacity:.85} 85% {opacity:.7} to {transform:translate3d(0,110vh,0);opacity:0}}
      .omc-rain-drop {animation-name:omc-rain-fall;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform;}
      @media (prefers-reduced-motion:reduce){.omc-rain-drop{animation:none;opacity:.25;}}`}</style>
    </div>
  );
}

function OmcLogoBlock({ compact = false }) {
  return (
    <div className="inline-flex shrink-0 items-center" aria-label="OMC Contact Center BPO">
      <img
        src={OMC_LOGO}
        alt="OMC Contact Center BPO"
        width={compact ? 145 : 190}
        height={compact ? 70 : 90}
        decoding="async"
        className={`${compact ? "w-36" : "w-44"} h-auto max-h-24 object-contain rounded-xl`}
      />
    </div>
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

function FeatureCard({ item }) {
  const Icon = item.icon;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition-colors hover:border-cyan-300/30 hover:bg-white/[0.08]">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10">
        <Icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
      </span>
      <h3 className="text-base font-bold text-white sm:text-lg">{item.title}</h3>
    </div>
  );
}

function LandingScreen({ onEnter }) {
  const modules = [
    { icon: Headphones, title: "Ventas" },
    { icon: Users, title: "Backoffice" },
    { icon: BarChart3, title: "Reportes" },
    { icon: Sparkles, title: "IA" },
  ];
  return compactWrap(
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden bg-[#020713] text-white">
      <StarField />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div aria-hidden="true" className="h-10 w-1" />
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-teal-400/30 px-4 py-2 text-xs font-semibold text-teal-200 md:inline-flex">Plataforma operativa</span>
            <button type="button" onClick={onEnter} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100">
              Iniciar sesión <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.1fr_.9fr] xl:gap-14">
          <section>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/5 px-4 py-2 text-sm font-semibold text-cyan-200">
              <Zap className="h-4 w-4" /> Gestión comercial en tiempo real
            </p>
            {/* Editor decorativo: sustituye el titular por código con escritura CSS ligera. */}
            <div className="omc-code-editor mt-7 max-w-[760px] overflow-hidden rounded-[22px] border border-cyan-400/40 bg-[#050d1d]/95 shadow-[0_0_32px_rgba(0,229,255,.12)]" aria-label="Código animado de presentación del CRM">
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.045] px-5 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-4 rounded-lg bg-cyan-300/10 px-3 py-1 font-mono text-xs text-cyan-200">&lt;/&gt; CRM.jsx</span>
                <span className="ml-auto flex items-center gap-2 font-mono text-xs text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> ONLINE</span>
              </div>
              <div className="omc-code-body space-y-1.5 overflow-x-auto px-4 py-5 font-mono text-[clamp(12px,1.25vw,16px)] leading-[1.65] sm:px-6" role="img" aria-label="Simulación de programación: ventas, backoffice, reportes e inteligencia artificial conectados">
                {[
                  <><span className="text-fuchsia-400">const</span> <span className="text-cyan-300">CRM</span> <span className="text-slate-200">=</span> <span className="text-amber-300">()</span> <span className="text-slate-200">=&gt; {'{'}</span></>,
                  <><span className="text-fuchsia-400">  return</span> <span className="text-slate-200">(</span></>,
                  <><span className="text-amber-300">    &lt;Plataforma</span></>,
                  <><span className="text-emerald-300">      ventas</span><span className="text-white">={'{'}true{'}'}</span></>,
                  <><span className="text-cyan-300">      backoffice</span><span className="text-white">={'{'}true{'}'}</span></>,
                  <><span className="text-violet-300">      reportes</span><span className="text-white">={'{'}true{'}'}</span></>,
                  <><span className="text-pink-300">      inteligenciaIA</span><span className="text-white">={'{'}true{'}'}</span></>,
                  <><span className="text-amber-300">    /&gt;</span></>,
                  <><span className="text-slate-200">  );</span></>,
                  <><span className="text-slate-200">{'}'};</span><span className="omc-code-caret ml-1 inline-block h-5 w-[2px] translate-y-1 bg-cyan-300" /></>,
                ].map((line, index) => (
                  <div key={index} className="omc-code-line flex min-w-max gap-3" style={{ animationDelay: `${index * 0.24}s` }}>
                    <span className="w-5 select-none text-right text-slate-600">{String(index + 1).padStart(2, '0')}</span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.025] px-5 py-2 font-mono text-[11px] text-slate-400">
                <span>React · CRM Intelligence</span><span className="text-emerald-300">● Sistema conectado</span>
              </div>
            </div>
            <style>{`@keyframes omc-code-enter {from{opacity:1;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
              @keyframes omc-caret-blink {50%{opacity:0}}
              .omc-code-line{opacity:0;animation:omc-code-enter .48s steps(18,end) forwards}
              .omc-code-caret{animation:omc-caret-blink .9s steps(1,end) infinite}
              @media(prefers-reduced-motion:reduce){.omc-code-line{opacity:1;animation:none}.omc-code-caret{animation:none}}
            `}</style>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onEnter} className="inline-flex items-center gap-3 rounded-full bg-cyan-300 px-7 py-3.5 text-base font-bold text-slate-950 transition hover:bg-teal-300">
                Acceder al CRM <ArrowRight className="h-5 w-5" />
              </button>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-slate-200">
                <ShieldCheck className="h-5 w-5 text-teal-300" /> Acceso seguro
              </span>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {modules.map(({ icon: Icon, title }) => (
                <div key={title} className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                  <Icon className="h-7 w-7 text-teal-300" aria-hidden="true" />
                  <span className="font-bold">{title}</span>
                </div>
              ))}
            </div>
          </section>
          <section aria-label="Funciones del CRM" className="rounded-[28px] border border-cyan-300/20 bg-[#071526]/90 p-5 shadow-[0_18px_55px_rgba(0,0,0,.2)] sm:p-7">
            <h2 className="mb-6 text-xl font-extrabold sm:text-2xl">Todo tu equipo, una plataforma</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {featureCards.map((item) => <FeatureCard key={item.title} item={item} />)}
            </div>
            <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/20 py-5 text-center">
              <div><Gauge className="mx-auto mb-2 h-6 w-6 text-cyan-300" /><span className="text-xs font-semibold sm:text-sm">Tiempo real</span></div>
              <div><LockKeyhole className="mx-auto mb-2 h-6 w-6 text-emerald-300" /><span className="text-xs font-semibold sm:text-sm">Seguridad</span></div>
              <div><Activity className="mx-auto mb-2 h-6 w-6 text-violet-300" /><span className="text-xs font-semibold sm:text-sm">Control</span></div>
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
