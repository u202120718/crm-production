
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  PhoneCall,
  BellRing,
  Users,
  Plus,
  Save,
} from "lucide-react";

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(dateA, dateB) {
  return toISO(new Date(dateA)) === toISO(new Date(dateB));
}

function isWithinNext7Days(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const target = new Date(dateStr);
  const start = new Date(toISO(today));
  const end = addDays(start, 7);
  return target >= start && target <= end;
}

function tipoClase(tipo) {
  if (tipo === "Llamada programada") {
    return "border-cyan-700/40 bg-cyan-950 text-cyan-200";
  }
  if (tipo === "Rellamada") {
    return "border-violet-700/40 bg-violet-950 text-violet-200";
  }
  if (tipo === "Validación") {
    return "border-amber-700/40 bg-amber-950 text-amber-200";
  }
  if (tipo === "Reunión") {
    return "border-emerald-700/40 bg-emerald-950 text-emerald-200";
  }
  if (tipo === "Activación") {
    return "border-fuchsia-700/40 bg-fuchsia-950 text-fuchsia-200";
  }
  return "border-slate-700/40 bg-slate-900 text-slate-200";
}

function estadoClase(estado) {
  if (estado === "Pendiente") {
    return "border-amber-700/40 bg-amber-950 text-amber-200";
  }
  if (estado === "Confirmado") {
    return "border-emerald-700/40 bg-emerald-950 text-emerald-200";
  }
  if (estado === "Realizado") {
    return "border-cyan-700/40 bg-cyan-950 text-cyan-200";
  }
  if (estado === "Cancelado") {
    return "border-rose-700/40 bg-rose-950 text-rose-200";
  }
  return "border-slate-700/40 bg-slate-900 text-slate-200";
}

function buildInitialEvents(leads = [], ventas = []) {
  const today = new Date();

  const leadEvents = leads.slice(0, 3).map((lead, index) => ({
    id: `lead-${lead.id ?? index}`,
    titulo: index === 0 ? "Primer contacto" : "Rellamada comercial",
    cliente: lead.nombre || "Cliente",
    tipo: index === 0 ? "Llamada programada" : "Rellamada",
    fecha: toISO(addDays(today, index)),
    hora: index === 0 ? "10:00" : "16:30",
    responsable: "Comercial",
    campana: lead.campana || "",
    estado: "Pendiente",
    notas: "",
  }));

  const salesEvents = ventas.slice(0, 4).map((venta, index) => ({
    id: `venta-${venta.id ?? index}`,
    titulo: index % 2 === 0 ? "Seguimiento de validación" : "Control de activación",
    cliente: venta.cliente || "Cliente",
    tipo: index % 2 === 0 ? "Validación" : "Activación",
    fecha: toISO(addDays(today, index + 1)),
    hora: index % 2 === 0 ? "12:00" : "18:00",
    responsable: venta.comercial || "Comercial",
    campana: venta.campana || "",
    estado: "Confirmado",
    notas: "",
  }));

  const internalEvents = [
    {
      id: "interno-1",
      titulo: "Reunión de seguimiento",
      cliente: "Equipo comercial",
      tipo: "Reunión",
      fecha: toISO(today),
      hora: "09:00",
      responsable: "Supervisor",
      campana: "General",
      estado: "Confirmado",
      notas: "Revisión de objetivos diarios",
    },
  ];

  return [...internalEvents, ...leadEvents, ...salesEvents];
}

export default function Agenda({ leads = [], ventas = [] }) {
  const [events, setEvents] = useState(buildInitialEvents(leads, ventas));
  const [form, setForm] = useState({
    titulo: "",
    cliente: "",
    tipo: "Llamada programada",
    fecha: toISO(new Date()),
    hora: "10:00",
    responsable: "",
    campana: "",
    estado: "Pendiente",
    notas: "",
  });

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const aKey = `${a.fecha} ${a.hora}`;
      const bKey = `${b.fecha} ${b.hora}`;
      return aKey.localeCompare(bKey);
    });
  }, [events]);

  const today = new Date();
  const tomorrow = addDays(today, 1);

  const todayEvents = useMemo(
    () => sortedEvents.filter((e) => e.fecha && isSameDay(e.fecha, today)),
    [sortedEvents]
  );

  const tomorrowEvents = useMemo(
    () => sortedEvents.filter((e) => e.fecha && isSameDay(e.fecha, tomorrow)),
    [sortedEvents]
  );

  const weekEvents = useMemo(
    () =>
      sortedEvents.filter(
        (e) =>
          e.fecha &&
          isWithinNext7Days(e.fecha) &&
          !isSameDay(e.fecha, today) &&
          !isSameDay(e.fecha, tomorrow)
      ),
    [sortedEvents]
  );

  const guardarEvento = () => {
    if (!form.titulo.trim() || !form.fecha || !form.hora) return;

    const nuevoEvento = {
      id: Date.now().toString(),
      titulo: form.titulo.trim(),
      cliente: form.cliente.trim(),
      tipo: form.tipo,
      fecha: form.fecha,
      hora: form.hora,
      responsable: form.responsable.trim(),
      campana: form.campana.trim(),
      estado: form.estado,
      notas: form.notas.trim(),
    };

    setEvents((prev) => [nuevoEvento, ...prev]);

    setForm({
      titulo: "",
      cliente: "",
      tipo: "Llamada programada",
      fecha: toISO(new Date()),
      hora: "10:00",
      responsable: "",
      campana: "",
      estado: "Pendiente",
      notas: "",
    });
  };

  const renderEventList = (items, emptyText) => {
    if (!items.length) {
      return (
        <div className="crm-panel-soft p-4">
          <p className="crm-muted">{emptyText}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((event) => (
          <div key={event.id} className="crm-panel-soft p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="crm-heading">{event.titulo}</p>
                <p className="crm-muted text-sm">
                  {event.cliente || "-"} · {event.campana || "-"}
                </p>
                <p className="crm-muted mt-1 text-xs">
                  {event.fecha} · {event.hora} · {event.responsable || "Sin responsable"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`crm-badge-text rounded-full border px-4 py-2 text-sm ${tipoClase(
                    event.tipo
                  )}`}
                >
                  {event.tipo}
                </span>

                <span
                  className={`crm-badge-text rounded-full border px-4 py-2 text-sm ${estadoClase(
                    event.estado
                  )}`}
                >
                  {event.estado}
                </span>
              </div>
            </div>

            {event.notas ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                {event.notas}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Agenda</p>
        <h2 className="crm-title mt-1 text-2xl">Agenda operativa</h2>
        <p className="crm-muted mt-2">
          Organiza llamadas, rellamadas, validaciones, reuniones y activaciones.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5" />
            <p className="crm-label">Hoy</p>
          </div>
          <p className="crm-kpi mt-2 text-3xl">{todayEvents.length}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5" />
            <p className="crm-label">Mañana</p>
          </div>
          <p className="crm-kpi mt-2 text-3xl">{tomorrowEvents.length}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <BellRing className="h-5 w-5" />
            <p className="crm-label">Próximos 7 días</p>
          </div>
          <p className="crm-kpi mt-2 text-3xl">{weekEvents.length}</p>
        </div>

        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5" />
            <p className="crm-label">Total eventos</p>
          </div>
          <p className="crm-kpi mt-2 text-3xl">{events.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="crm-panel p-5">
          <div className="flex items-center gap-3">
            <Plus className="h-5 w-5" />
            <h3 className="crm-heading text-lg">Crear evento</h3>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="crm-label mb-2 block">Título</label>
              <input
                value={form.titulo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, titulo: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
                placeholder="Ejemplo: Rellamada cliente interesado"
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Cliente</label>
              <input
                value={form.cliente}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cliente: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tipo: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
              >
                <option>Llamada programada</option>
                <option>Rellamada</option>
                <option>Validación</option>
                <option>Reunión</option>
                <option>Activación</option>
              </select>
            </div>

            <div>
              <label className="crm-label mb-2 block">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fecha: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Hora</label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hora: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Responsable</label>
              <input
                value={form.responsable}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, responsable: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
                placeholder="Comercial / Supervisor"
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Campaña</label>
              <input
                value={form.campana}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, campana: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="crm-label mb-2 block">Estado</label>
              <select
                value={form.estado}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, estado: e.target.value }))
                }
                className="crm-input w-full px-4 py-3 outline-none"
              >
                <option>Pendiente</option>
                <option>Confirmado</option>
                <option>Realizado</option>
                <option>Cancelado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="crm-label mb-2 block">Notas</label>
              <textarea
                value={form.notas}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notas: e.target.value }))
                }
                className="crm-input min-h-[120px] w-full px-4 py-3 outline-none"
              />
            </div>
          </div>

          <button
            onClick={guardarEvento}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-3 text-emerald-200 transition hover:bg-emerald-500/20"
          >
            <Save className="h-4 w-4" />
            Guardar evento
          </button>
        </div>

        <div className="space-y-6">
          <div className="crm-panel p-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5" />
              <h3 className="crm-heading text-lg">Hoy</h3>
            </div>
            <div className="mt-4">
              {renderEventList(todayEvents, "No tienes eventos para hoy.")}
            </div>
          </div>

          <div className="crm-panel p-5">
            <div className="flex items-center gap-3">
              <PhoneCall className="h-5 w-5" />
              <h3 className="crm-heading text-lg">Mañana</h3>
            </div>
            <div className="mt-4">
              {renderEventList(tomorrowEvents, "No tienes eventos para mañana.")}
            </div>
          </div>

          <div className="crm-panel p-5">
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5" />
              <h3 className="crm-heading text-lg">Próximos 7 días</h3>
            </div>
            <div className="mt-4">
              {renderEventList(
                weekEvents,
                "No tienes eventos programados para los próximos 7 días."
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
