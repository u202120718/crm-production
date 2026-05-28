
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Search,
  Filter,
  Star,
} from "lucide-react";

const initialEvaluaciones = [
  {
    id: 1,
    comercial: "Luis A.",
    fecha: "2026-05-20",
    hora: "10:15",
    duracion: "04:32",
    telefono: "612345678",
    presentacion: "Buena",
    sondeo: "Buena",
    producto: "Regular",
    objeciones: "Buena",
    cierre: "Buena",
    resultado: "Buena",
    observaciones: "Buena actitud y cierre correcto.",
  },
  {
    id: 2,
    comercial: "Nadia C.",
    fecha: "2026-05-20",
    hora: "12:05",
    duracion: "03:18",
    telefono: "698221145",
    presentacion: "Regular",
    sondeo: "Regular",
    producto: "Regular",
    objeciones: "Mala",
    cierre: "Mala",
    resultado: "Regular",
    observaciones: "Debe mejorar manejo de objeciones.",
  },
];

const emptyForm = {
  comercial: "",
  fecha: "",
  hora: "",
  duracion: "",
  telefono: "",
  presentacion: "Buena",
  sondeo: "Buena",
  producto: "Buena",
  objeciones: "Buena",
  cierre: "Buena",
  resultado: "Buena",
  observaciones: "",
};

function notaBadge(valor) {
  if (valor === "Buena") {
    return "border-emerald-700/40 bg-emerald-950 text-emerald-200";
  }
  if (valor === "Regular") {
    return "border-amber-700/40 bg-amber-950 text-amber-200";
  }
  if (valor === "Mala") {
    return "border-rose-700/40 bg-rose-950 text-rose-200";
  }
  return "border-slate-700/40 bg-slate-900 text-slate-200";
}

export default function Calidad({ users = [] }) {
  const [evaluaciones, setEvaluaciones] = useState(initialEvaluaciones);
  const [search, setSearch] = useState("");
  const [resultadoFiltro, setResultadoFiltro] = useState("Todos");
  const [form, setForm] = useState(emptyForm);

  const comerciales = useMemo(() => {
    return users.filter((u) => u.rol === "Comercial");
  }, [users]);

  const filtradas = useMemo(() => {
    const q = search.trim().toLowerCase();

    return evaluaciones.filter((item) => {
      const coincideBusqueda =
        !q ||
        [
          item.comercial,
          item.fecha,
          item.hora,
          item.telefono,
          item.resultado,
          item.observaciones,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const coincideResultado =
        resultadoFiltro === "Todos" ? true : item.resultado === resultadoFiltro;

      return coincideBusqueda && coincideResultado;
    });
  }, [evaluaciones, search, resultadoFiltro]);

  const resumen = useMemo(() => {
    return {
      total: evaluaciones.length,
      buenas: evaluaciones.filter((e) => e.resultado === "Buena").length,
      regulares: evaluaciones.filter((e) => e.resultado === "Regular").length,
      malas: evaluaciones.filter((e) => e.resultado === "Mala").length,
    };
  }, [evaluaciones]);

  const guardarEvaluacion = () => {
    if (!form.comercial || !form.fecha || !form.telefono) {
      alert("Completa comercial, fecha y teléfono.");
      return;
    }

    const nueva = {
      id: Date.now(),
      ...form,
    };

    setEvaluaciones((prev) => [nueva, ...prev]);
    setForm(emptyForm);
    alert("Evaluación guardada en modo demo.");
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Calidad</p>
        <h2 className="crm-title mt-1 text-2xl">Control de calidad</h2>
        <p className="crm-muted mt-2">
          Evalúa llamadas comerciales por presentación, sondeo, producto, objeciones y cierre.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5" />
            <p className="crm-label">Evaluaciones</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{resumen.total}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <p className="crm-label">Buenas</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{resumen.buenas}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            <p className="crm-label">Regulares</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{resumen.regulares}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-rose-300" />
            <p className="crm-label">Malas</p>
          </div>
          <p className="crm-kpi mt-3 text-3xl">{resumen.malas}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <PhoneCall className="h-5 w-5" />
            <h3 className="crm-heading text-lg">Registrar evaluación</h3>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="crm-label mb-2 block">Comercial</label>
              <select
                value={form.comercial}
                onChange={(e) => setForm((prev) => ({ ...prev, comercial: e.target.value }))}
                className="crm-input w-full px-4 py-3 outline-none"
              >
                <option value="">Selecciona comercial</option>
                {comerciales.map((user) => (
                  <option key={user.id} value={user.nombre}>
                    {user.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="crm-label mb-2 block">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm((prev) => ({ ...prev, fecha: e.target.value }))}
                className="crm-input w-full px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Hora</label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm((prev) => ({ ...prev, hora: e.target.value }))}
                className="crm-input w-full px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Duración</label>
              <input
                value={form.duracion}
                onChange={(e) => setForm((prev) => ({ ...prev, duracion: e.target.value }))}
                className="crm-input w-full px-4 py-3 outline-none"
                placeholder="00:00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="crm-label mb-2 block">Teléfono</label>
              <input
                value={form.telefono}
                onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
                className="crm-input w-full px-4 py-3 outline-none"
              />
            </div>

            {[
              ["presentacion", "Presentación"],
              ["sondeo", "Sondeo"],
              ["producto", "Conocimiento producto"],
              ["objeciones", "Manejo de objeciones"],
              ["cierre", "Cierre"],
              ["resultado", "Resultado final"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="crm-label mb-2 block">{label}</label>
                <select
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="crm-input w-full px-4 py-3 outline-none"
                >
                  <option>Buena</option>
                  <option>Regular</option>
                  <option>Mala</option>
                </select>
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="crm-label mb-2 block">Observaciones</label>
              <textarea
                value={form.observaciones}
                onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))}
                className="crm-input min-h-[120px] w-full px-4 py-3 outline-none"
              />
            </div>
          </div>

          <button
            onClick={guardarEvaluacion}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-300 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-400"
          >
            <Save className="h-4 w-4" />
            Guardar evaluación
          </button>
        </div>

        <div className="crm-panel p-5">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_220px]">
            <div className="crm-input flex items-center gap-2 px-4 py-3">
              <Search className="h-4 w-4 crm-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="Buscar por comercial, teléfono o resultado"
              />
            </div>

            <div className="crm-input flex items-center gap-2 px-4 py-3">
              <Filter className="h-4 w-4 crm-muted" />
              <select
                value={resultadoFiltro}
                onChange={(e) => setResultadoFiltro(e.target.value)}
                className="w-full bg-transparent outline-none"
              >
                <option className="text-black">Todos</option>
                <option className="text-black">Buena</option>
                <option className="text-black">Regular</option>
                <option className="text-black">Mala</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {filtradas.length > 0 ? (
              filtradas.map((item) => (
                <div key={item.id} className="crm-panel-soft p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="crm-heading">{item.comercial}</p>
                      <p className="crm-muted text-sm">
                        {item.fecha} · {item.hora} · {item.telefono}
                      </p>
                      <p className="crm-muted mt-1 text-xs">
                        Duración: {item.duracion || "-"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`crm-badge-text rounded-full border px-4 py-2 text-sm ${notaBadge(
                          item.resultado
                        )}`}
                      >
                        {item.resultado}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    <span className={`crm-badge-text rounded-full border px-3 py-2 text-xs ${notaBadge(item.presentacion)}`}>
                      Presentación: {item.presentacion}
                    </span>
                    <span className={`crm-badge-text rounded-full border px-3 py-2 text-xs ${notaBadge(item.sondeo)}`}>
                      Sondeo: {item.sondeo}
                    </span>
                    <span className={`crm-badge-text rounded-full border px-3 py-2 text-xs ${notaBadge(item.producto)}`}>
                      Producto: {item.producto}
                    </span>
                    <span className={`crm-badge-text rounded-full border px-3 py-2 text-xs ${notaBadge(item.objeciones)}`}>
                      Objeciones: {item.objeciones}
                    </span>
                    <span className={`crm-badge-text rounded-full border px-3 py-2 text-xs ${notaBadge(item.cierre)}`}>
                      Cierre: {item.cierre}
                    </span>
                    <span className={`crm-badge-text rounded-full border px-3 py-2 text-xs ${notaBadge(item.resultado)}`}>
                      Final: {item.resultado}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-300" />
                      <p className="crm-label">Observaciones</p>
                    </div>
                    <p className="crm-body text-sm">{item.observaciones || "-"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="crm-panel-soft p-4">
                <p className="crm-muted">No hay evaluaciones para mostrar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
