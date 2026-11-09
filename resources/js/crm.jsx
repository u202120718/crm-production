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

// Editor de demostración: escritura continua, mensajes rotativos y partículas ligeras.
const LIVE_CODE = [
  'const CRM = () => {',
  '  iniciarCampanas({ ventas: true });',
  '  validarBackoffice({ calidad: "alta" });',
  '  generarReportes({ tiempoReal: true });',
  '  activarIA({ inteligencia: "OMC" });',
  '  console.log("🚀 ¡Bienvenido a OMC CRM!");',
  '  // ✨ Cada línea es una nueva oportunidad',
  '  // 🌸 Que hoy florezcan tus mejores ideas',
  '  // ⭐ Sigue creando, sigue creciendo',
  '  // 💜 El éxito se construye paso a paso',
  '  console.log("💫 Tu esfuerzo hace la diferencia");',
  '  // 🌷 Innovar también es disfrutar el camino',
  '  // ⚡ Convierte tus ideas en resultados',
  '  return "¡Vamos por más! 🌟";',
  '};',
];

function CodeColorLine({ value }) {
  const parts = value.split(/(const|return|console|true|false|CRM|iniciarCampanas|validarBackoffice|generarReportes|activarIA|\"[^\"]*\"|\{[^}]*\}|\/\/.*|\d+)/g);
  return <>{parts.map((part, index) => {
    let cls = 'text-slate-200';
    if (/^\/\//.test(part)) cls = 'text-emerald-300';
    else if (/^(const|return|true|false)$/.test(part)) cls = 'text-fuchsia-300';
    else if (/^(CRM|iniciarCampanas|validarBackoffice|generarReportes|activarIA|console)$/.test(part)) cls = 'text-cyan-300';
    else if (/^\"/.test(part)) cls = 'text-amber-300';
    else if (/^\{/.test(part)) cls = 'text-violet-300';
    return <span key={index} className={cls}>{part}</span>;
  })}</>;
}

function LiveCodeEditor() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [burst, setBurst] = useState(0);
  const [paused, setPaused] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationCount, setCelebrationCount] = useState(0);

  useEffect(() => {
    if (paused || celebrating) return;
    const line = LIVE_CODE[lineIndex];
    const finished = charIndex >= line.length;
    const timer = setTimeout(() => {
      if (!finished) { setCharIndex((n) => n + 1); return; }
      setHistory((previous) => [...previous, line].slice(-8));
      setCharIndex(0);
      if (lineIndex === LIVE_CODE.length - 1) {
        setCelebrating(true);
        setCelebrationCount((n) => n + 1);
      } else {
        setLineIndex((n) => n + 1);
      }
      if (/🌸|⭐|✨|🌷|🚀|💫/.test(line)) setBurst((n) => n + 1);
    }, finished ? 650 : 38);
    return () => clearTimeout(timer);
  }, [lineIndex, charIndex, paused, celebrating]);

  useEffect(() => {
    if (!celebrating || paused) return;
    const timer = setTimeout(() => {
      setCelebrating(false);
      setHistory([]);
      setLineIndex(0);
      setCharIndex(0);
    }, 4200);
    return () => clearTimeout(timer);
  }, [celebrating, paused]);

  const shown = [...history, LIVE_CODE[lineIndex].slice(0, charIndex)];
  return (
    <div className="relative mt-7 max-w-[760px] overflow-hidden rounded-[22px] border border-cyan-400/40 bg-[#050d1d]/95 shadow-[0_0_32px_rgba(0,229,255,.12)]" aria-label="Editor de código decorativo con escritura continua">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.045] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-400" /><span className="h-3 w-3 rounded-full bg-amber-300" /><span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-3 rounded-lg bg-cyan-300/10 px-3 py-1 font-mono text-xs text-cyan-200">&lt;/&gt; OMC-Live.jsx</span>
        <button type="button" onClick={() => setPaused((v) => !v)} className="ml-auto rounded-md border border-cyan-400/30 px-2 py-1 font-mono text-xs text-cyan-200" aria-label={paused ? 'Reanudar animación' : 'Pausar animación'}>{paused ? '▶ Reanudar' : 'Ⅱ Pausar'}</button>
      </div>
      <div className="relative h-[288px] overflow-hidden px-4 py-4 font-mono text-[clamp(11px,1.12vw,14px)] leading-7 sm:px-6" aria-live="off">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_90%_70%,rgba(139,92,246,.09),transparent_45%)]" />
        <div className="relative flex h-full flex-col justify-end overflow-hidden">
          {shown.map((line, i) => <div key={`${lineIndex}-${i}`} className="flex shrink-0 gap-3 whitespace-pre"><span className="w-5 shrink-0 select-none text-right text-slate-600">{String((lineIndex - history.length + i + LIVE_CODE.length * 10) % LIVE_CODE.length + 1).padStart(2, '0')}</span><span><CodeColorLine value={line} />{i === shown.length - 1 && <span className="omc-live-cursor ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-cyan-300" />}</span></div>)}
        </div>
        {celebrating && <div key={`show-${celebrationCount}`} className="omc-celebration pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden bg-[#07112b]/95 text-center">
          <div className="omc-celebration-title relative z-10 px-3 text-2xl font-black text-white sm:text-3xl">✨ ¡Bienvenido a OMC CRM! ✨</div>
          <p className="relative z-10 mt-3 px-4 text-sm font-semibold text-cyan-200 sm:text-base">🌸 Tus ideas florecen cuando las conviertes en acción 🌸</p>
          <p className="relative z-10 mt-2 text-xs text-emerald-300">🚀 Sigue creando, sigue creciendo</p>
          {Array.from({length: 22}, (_, i) => <span key={i} className="omc-celebration-flower absolute text-xl" style={{left:`${(i*47+13)%96}%`,top:`${(i*31+7)%88}%`,color:['#22d3ee','#f472b6','#c084fc','#facc15','#34d399'][i%5],animationDelay:`${(i%9)*.16}s`,fontSize:`${15+(i%4)*6}px`}}>{['✿','✦','❀','★','🌸','✧'][i%6]}</span>)}
        </div>}
        <div key={burst} className="omc-live-particles pointer-events-none absolute bottom-8 right-14" aria-hidden="true">
          {['✦','✿','★','✧','❀','✦'].map((symbol, i) => <span key={i} style={{'--i':i}} className="omc-live-particle absolute text-lg text-fuchsia-300">{symbol}</span>)}
        </div>
      </div>
      <div className="flex justify-between border-t border-white/10 px-4 py-2 font-mono text-[11px] text-slate-400"><span>React · creatividad en ejecución</span><span className="text-emerald-300">● {paused ? 'En pausa' : 'Escribiendo...'}</span></div>
      <style>{`@keyframes omc-celebration-in{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}.omc-celebration-title{animation:omc-celebration-in .65s ease-out both;text-shadow:0 0 24px rgba(34,211,238,.7)}@keyframes omc-celebration-float{0%{opacity:0;transform:translateY(40px) rotate(-30deg) scale(.5)}30%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translateY(-90px) rotate(80deg) scale(1.35)}}.omc-celebration-flower{animation:omc-celebration-float 3.1s ease-in-out infinite;filter:drop-shadow(0 0 7px currentColor)}@keyframes omc-live-blink{50%{opacity:0}}.omc-live-cursor{animation:omc-live-blink .8s steps(1) infinite}@keyframes omc-live-float{0%{opacity:0;transform:translate(0,0) scale(.4)}25%{opacity:1}100%{opacity:0;transform:translate(calc((var(--i) - 2.5)*22px),-105px) scale(1.3)}}.omc-live-particle{opacity:0;animation:omc-live-float 1.5s ease-out both;animation-delay:calc(var(--i)*.09s)}@media(prefers-reduced-motion:reduce){.omc-live-cursor,.omc-live-particle,.omc-celebration-flower,.omc-celebration-title{animation:none}}`}</style>
    </div>
  );
}

function LandingScreen({ onEnter }) {
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
            <LiveCodeEditor />
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onEnter} className="inline-flex items-center gap-3 rounded-full bg-cyan-300 px-7 py-3.5 text-base font-bold text-slate-950 transition hover:bg-teal-300">
                Acceder al CRM <ArrowRight className="h-5 w-5" />
              </button>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-slate-200">
                <ShieldCheck className="h-5 w-5 text-teal-300" /> Acceso seguro
              </span>
            </div>
          </section>
          <section aria-label="Presentación visual de la plataforma" className="relative flex min-h-[360px] flex-col items-center justify-center gap-7 py-6">
            <div className="relative w-full max-w-[490px]">
              <div className="absolute -inset-8 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative mx-auto w-[85%] -rotate-2 rounded-2xl border border-cyan-300/60 bg-[#09152b] p-3 shadow-[0_0_36px_rgba(34,211,238,.2),15px_18px_45px_rgba(139,92,246,.2)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-2"><span className="text-xs font-black text-cyan-200">OMC CRM</span><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /></div>
                <div className="mt-3 grid grid-cols-[.55fr_1fr] gap-3"><div className="space-y-2">{['Campañas','Ventas','Reportes','IA'].map((x,i)=><div key={x} className="rounded-md bg-white/5 px-2 py-2 text-[10px] text-slate-300">{x}</div>)}</div><div className="flex flex-col justify-between rounded-lg bg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-3"><span className="text-xs font-bold text-white">Control comercial</span><div className="flex h-28 items-end justify-around gap-2">{[40,65,48,78,60,94].map((v,i)=><div key={i} className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-violet-400" style={{height:`${v}%`}} />)}</div><span className="text-[10px] text-emerald-300">● Sistema conectado</span></div></div>
              </div>
              <div className="relative mx-auto h-3 w-[94%] rounded-b-3xl border border-cyan-300/40 bg-gradient-to-r from-cyan-500/40 via-slate-500/30 to-violet-500/50 shadow-[0_12px_25px_rgba(0,229,255,.2)]" />
              <div className="absolute -right-2 -top-12 text-6xl text-cyan-300 drop-shadow-[0_0_15px_#22d3ee]">☁</div>
              <div className="absolute -bottom-7 -left-2 text-3xl text-fuchsia-300 drop-shadow-[0_0_12px_#d946ef]">✦</div>
            </div>
            <div className="grid w-full max-w-[540px] grid-cols-2 gap-3 text-sm font-semibold text-slate-200 sm:grid-cols-2">
              {['✓ CRM integral','✓ Ventas y Backoffice','✓ Reportes en tiempo real','✓ IA para tu operación','✓ Seguro y escalable'].map((item)=><div key={item} className="rounded-xl border border-cyan-300/15 bg-white/[0.035] px-4 py-3">{item}</div>)}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// Simulador visual del login: escribe código de ejemplo en bucle, sin ejecutar llamadas.
const LOGIN_DEMO_CODE = [
  "import React, { useState, useEffect } from 'react';",
  "import { BarChart3, Users, Shield } from 'lucide-react';",
  "",
  "export default function CRM() {",
  "  const [data, setData] = useState(null);",
  "",
  "  useEffect(() => {",
  "    // Conectando módulos del sistema...",
  "    const fetchData = async () => {",
  "      const res = await api.get('/dashboard/metrics');",
  "      setData(res.data);",
  "    };",
  "    fetchData();",
  "  }, []);",
  "",
  "  return <Dashboard data={data} />;",
  "}",
  "// ✓ CRM Core · Base de Datos · APIs · Seguridad",
];

function LoginCodeSimulator() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (paused) return;
    const line = LOGIN_DEMO_CODE[lineIndex];
    const done = charIndex >= line.length;
    const timer = setTimeout(() => {
      if (!done) {
        setCharIndex((value) => value + 1);
      } else if (lineIndex === LOGIN_DEMO_CODE.length - 1) {
        setLineIndex(0);
        setCharIndex(0);
        setHistory([]);
        setCycle((value) => value + 1);
      } else {
        setHistory((value) => [...value, { number: lineIndex + 1, text: line }].slice(-12));
        setLineIndex((value) => value + 1);
        setCharIndex(0);
      }
    }, done ? (lineIndex === LOGIN_DEMO_CODE.length - 1 ? 1500 : 230) : 32);
    return () => clearTimeout(timer);
  }, [paused, lineIndex, charIndex]);

  const progress = Math.round(((lineIndex + charIndex / Math.max(1, LOGIN_DEMO_CODE[lineIndex].length)) / LOGIN_DEMO_CODE.length) * 100);
  const visible = [...history, { number: lineIndex + 1, text: LOGIN_DEMO_CODE[lineIndex].slice(0, charIndex) }];
  const modules = [
    { label: "CRM Core", icon: Layers3 },
    { label: "Base de Datos", icon: Gauge },
    { label: "APIs", icon: Activity },
    { label: "Seguridad", icon: ShieldCheck },
  ];

  return (
    <div className="max-w-[720px]" aria-label="Simulador decorativo de código con escritura continua">
      <div className="overflow-hidden rounded-[25px] border border-cyan-400/65 bg-[#050d1d]/95 shadow-[0_0_32px_rgba(0,229,255,.15),9px_8px_35px_rgba(192,38,211,.15)]">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.045] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="ml-3 font-mono text-xs font-bold text-cyan-100">⚛ crm-system.jsx</span>
          <button type="button" onClick={() => setPaused((v) => !v)} className="ml-auto rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 font-mono text-[10px] text-emerald-300" aria-label={paused ? "Reanudar simulador" : "Pausar simulador"}>
            ● {paused ? "En pausa · ▶" : "Compilando... · Ⅱ"}
          </button>
        </div>
        <div className="relative flex h-[350px] flex-col justify-end overflow-hidden px-4 py-4 font-mono text-[clamp(10px,1vw,13px)] leading-[1.65] sm:px-5" aria-live="off">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_75%,rgba(168,85,247,.13),transparent_55%)]" />
          {visible.map((line, i) => (
            <div key={`${cycle}-${line.number}`} className="relative flex shrink-0 gap-3 whitespace-pre">
              <span className="w-5 shrink-0 select-none text-right text-slate-600">{line.number}</span>
              <span><CodeColorLine value={line.text} />{i === visible.length - 1 && <span className="omc-live-cursor ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-cyan-300" />}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-cyan-400/30 bg-[#07111f]/90 px-4 py-3">
        <Gauge className="h-5 w-5 shrink-0 text-cyan-300" />
        <span className="whitespace-nowrap text-xs font-bold text-slate-200">Compilando módulos...</span>
        <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-500 transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
        <span className="w-9 text-right font-mono text-xs font-bold text-white">{progress}%</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {modules.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between gap-1 rounded-xl border border-cyan-400/35 bg-[#07111f]/90 px-2.5 py-3 text-[10px] font-bold text-slate-200">
            <Icon className="h-4 w-4 shrink-0 text-cyan-300" />
            <span className="truncate">{label}</span>
            <span className="text-emerald-400">✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onBack }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [buttonVariant, setButtonVariant] = useState("primary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        <section className="hidden min-w-0 lg:block">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-400/[0.07] px-4 py-2 text-xs font-black uppercase tracking-[0.13em] text-violet-200">
            <Rocket className="h-4 w-4" /> Plataforma CRM comercial
          </div>
          <LoginCodeSimulator />
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
