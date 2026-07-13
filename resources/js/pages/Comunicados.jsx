import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Send,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  Megaphone,
  Inbox,
  Users,
  Building2,
  Paperclip,
  Clock3,
} from "lucide-react";

const ROLES_PUBLICADORES = ["Gerente", "Admin", "Supervisor", "Backoffice"];
const ROLES_DESTINO = ["Comercial", "Backoffice", "Supervisor", "Admin", "Gerente", "Todos"];

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

export default function Comunicados({ currentUser, campaigns = [] }) {
  const [comunicados, setComunicados] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titulo: "",
    mensaje: "",
    dirigido_a: ["Comercial"],
    dirigido_a_campanas: [],
    archivo: null,
  });

  const canPublish = useMemo(
    () => ROLES_PUBLICADORES.includes(currentUser?.rol),
    [currentUser]
  );

  const selected = useMemo(
    () => comunicados.find((x) => x.id === selectedId) || null,
    [comunicados, selectedId]
  );

  const canDeleteSelected = useMemo(() => {
    if (!selected || !currentUser) return false;

    if (["Gerente", "Admin"].includes(currentUser.rol)) return true;

    return Number(selected.enviado_por_user_id) === Number(currentUser.id);
  }, [selected, currentUser]);

  const loadComunicados = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/comunicados/list");
      const list = data?.comunicados || [];

      setComunicados(list);

      if (!list.length) {
        setSelectedId(null);
        return;
      }

      if (!selectedId || !list.some((x) => x.id === selectedId)) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      setError(err.message || "No se pudieron cargar los comunicados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComunicados();
  }, []);

  const markRead = async (item) => {
    setSelectedId(item.id);

    if (item.is_read) return;

    try {
      await apiFetch(`/comunicados/${item.id}/read`, {
        method: "PATCH",
      });

      setComunicados((prev) =>
        prev.map((x) =>
          x.id === item.id
            ? {
                ...x,
                is_read: true,
                read_at: "Leído",
              }
            : x
        )
      );
    } catch {
      //
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const body = new FormData();
      body.append("titulo", form.titulo);
      body.append("mensaje", form.mensaje || "");

      form.dirigido_a.forEach((rol) => body.append("dirigido_a[]", rol));
      form.dirigido_a_campanas.forEach((campana) =>
        body.append("dirigido_a_campanas[]", campana)
      );

      if (form.archivo) {
        body.append("archivo", form.archivo);
      }

      await apiFetch("/comunicados", {
        method: "POST",
        body,
      });

      setForm({
        titulo: "",
        mensaje: "",
        dirigido_a: ["Comercial"],
        dirigido_a_campanas: [],
        archivo: null,
      });

      setMessage("Comunicado enviado correctamente.");
      await loadComunicados();
    } catch (err) {
      setError(err.message || "No se pudo enviar el comunicado.");
    } finally {
      setSaving(false);
    }
  };

  const deleteComunicado = async () => {
    if (!selected) return;

    const ok = window.confirm(`¿Seguro que deseas eliminar el comunicado "${selected.titulo}"?`);
    if (!ok) return;

    try {
      setDeleting(true);
      setMessage("");
      setError("");

      await apiFetch(`/comunicados/${selected.id}`, {
        method: "DELETE",
      });

      const newList = comunicados.filter((x) => x.id !== selected.id);
      setComunicados(newList);
      setSelectedId(newList.length ? newList[0].id : null);
      setMessage("Comunicado eliminado correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo eliminar el comunicado.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleRol = (rol) => {
    setForm((prev) => {
      const exists = prev.dirigido_a.includes(rol);

      return {
        ...prev,
        dirigido_a: exists
          ? prev.dirigido_a.filter((x) => x !== rol)
          : [...prev.dirigido_a, rol],
      };
    });
  };

  const toggleCampana = (campana) => {
    setForm((prev) => {
      const exists = prev.dirigido_a_campanas.includes(campana);

      return {
        ...prev,
        dirigido_a_campanas: exists
          ? prev.dirigido_a_campanas.filter((x) => x !== campana)
          : [...prev.dirigido_a_campanas, campana],
      };
    });
  };

  return (
    <div className="comunicados-pro space-y-6">
      <ComunicadosStyles />
      <section className="comunicados-hero">
        <div className="comunicados-hero-icon">
          <Megaphone className="h-7 w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="comunicados-eyebrow">Comunicación interna</p>
          <h2>Centro de comunicados</h2>
          <p>
            Publica avisos, cambios de producto y documentación para todo el equipo comercial.
          </p>
        </div>

        <div className="comunicados-stats">
          <div>
            <span>Total</span>
            <strong>{comunicados.length}</strong>
          </div>
          <div>
            <span>Nuevos</span>
            <strong>{comunicados.filter((item) => !item.is_read).length}</strong>
          </div>
          <div>
            <span>Leídos</span>
            <strong>{comunicados.filter((item) => item.is_read).length}</strong>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-100 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="crm-panel comunicados-card overflow-hidden p-0">
          <div className="comunicados-card-head">
            <div className="comunicados-card-icon cyan"><Inbox className="h-5 w-5" /></div>
            <div>
              <h3 className="crm-heading text-lg">Bandeja</h3>
              <p className="crm-muted text-xs">{comunicados.length} comunicado(s)</p>
            </div>
          </div>
          <div className="comunicados-list">

          <div className="space-y-3">
            {loading ? (
              <p className="crm-muted text-sm">Cargando comunicados...</p>
            ) : comunicados.length > 0 ? (
              comunicados.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item)}
                  className={`comunicado-item w-full rounded-2xl border p-4 text-left transition ${
                    selected?.id === item.id
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.titulo}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.creado_por} · {item.created_at}
                      </p>

                      {item.dirigido_a_campanas?.length ? (
                        <p className="mt-2 truncate text-[11px] text-slate-600">
                          Campañas: {item.dirigido_a_campanas.join(", ")}
                        </p>
                      ) : (
                        <p className="mt-2 text-[11px] text-slate-500">
                          General para todas las campañas
                        </p>
                      )}
                    </div>

                    {!item.is_read ? (
                      <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-900">
                        Nuevo
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-900">
                        Leído
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <p className="crm-muted text-sm">No hay comunicados registrados.</p>
            )}
          </div>
          </div>
        </div>

        <div className="space-y-6">
          {canPublish ? (
            <form onSubmit={submit} className="crm-panel comunicados-card overflow-hidden p-0">
              <div className="comunicados-card-head">
                <div className="comunicados-card-icon emerald"><Send className="h-5 w-5" /></div>
                <div>
                  <h3 className="crm-heading text-lg">Nuevo comunicado</h3>
                  <p className="crm-muted text-xs">Envía avisos segmentados por rol o campaña.</p>
                </div>
              </div>

              <div className="grid gap-5 p-5">
                <div>
                  <label className="crm-label mb-2 block">Título</label>
                  <input
                    value={form.titulo}
                    onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                    placeholder="Ejemplo: Cambio de producto Vodafone"
                    required
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Mensaje</label>
                  <textarea
                    value={form.mensaje}
                    onChange={(e) => setForm((prev) => ({ ...prev, mensaje: e.target.value }))}
                    className="crm-input min-h-[130px] w-full px-4 py-3 outline-none"
                    placeholder="Escribe el comunicado..."
                  />
                </div>

                <div>
                  <label className="crm-label mb-2 block">Dirigido a</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES_DESTINO.map((rol) => {
                      const active = form.dirigido_a.includes(rol);

                      return (
                        <button
                          key={rol}
                          type="button"
                          onClick={() => toggleRol(rol)}
                          className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                            active
                              ? "border-cyan-300 bg-cyan-100 text-cyan-900"
                              : "border-slate-300 bg-slate-100 text-slate-700"
                          }`}
                        >
                          {rol}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="crm-label mb-2 block">Campañas</label>
                  <div className="flex flex-wrap gap-2">
                    {campaigns.length ? (
                      campaigns.map((camp) => {
                        const active = form.dirigido_a_campanas.includes(camp.nombre);

                        return (
                          <button
                            key={camp.id || camp.nombre}
                            type="button"
                            onClick={() => toggleCampana(camp.nombre)}
                            className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                              active
                                ? "border-violet-300 bg-violet-100 text-violet-900"
                                : "border-slate-300 bg-slate-100 text-slate-700"
                            }`}
                          >
                            {camp.nombre}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500">No hay campañas disponibles.</p>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Si no seleccionas campañas, el comunicado será general.
                  </p>
                </div>

                <div>
                  <label className="crm-label mb-2 block">Adjuntar PDF</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, archivo: e.target.files?.[0] || null }))
                    }
                    className="crm-input w-full px-4 py-3 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-200 px-4 py-3 font-medium text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {saving ? "Enviando..." : "Enviar comunicado"}
                </button>
              </div>
            </form>
          ) : null}

          <div className="crm-panel comunicados-card overflow-hidden p-0">
            <div className="comunicados-card-head">
              <div className="comunicados-card-icon violet"><FileText className="h-5 w-5" /></div>
              <div>
                <h3 className="crm-heading text-lg">Detalle</h3>
                <p className="crm-muted text-xs">Vista completa del comunicado seleccionado.</p>
              </div>
            </div>
            <div className="p-5">

            {selected ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{selected.titulo}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {selected.creado_por} · {selected.created_at}
                      </p>
                    </div>

                    {selected.is_read ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Leído
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(selected.dirigido_a || []).map((rol) => (
                      <span
                        key={rol}
                        className="rounded-full border border-cyan-300 bg-cyan-100 px-2 py-1 text-[11px] font-medium text-cyan-900"
                      >
                        {rol}
                      </span>
                    ))}

                    {selected.dirigido_a_campanas?.length ? (
                      selected.dirigido_a_campanas.map((camp) => (
                        <span
                          key={camp}
                          className="rounded-full border border-violet-300 bg-violet-100 px-2 py-1 text-[11px] font-medium text-violet-900"
                        >
                          {camp}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                        Todas las campañas
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-slate-800">
                    {selected.mensaje || "Sin mensaje adicional."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {selected.archivo_url ? (
                    <a
                      href={selected.archivo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-200"
                    >
                      <Download className="h-4 w-4" />
                      {selected.archivo_nombre || "Ver PDF"}
                    </a>
                  ) : null}

                  {canDeleteSelected ? (
                    <button
                      type="button"
                      onClick={deleteComunicado}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-300 bg-red-100 px-4 py-3 font-medium text-red-900 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleting ? "Eliminando..." : "Eliminar comunicado"}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="comunicados-empty">
                <FileText className="h-9 w-9" />
                <strong>Selecciona un comunicado</strong>
                <span>Aquí aparecerá el detalle completo.</span>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



function ComunicadosStyles() {
  return (
    <style>{`
      .comunicados-pro {
        --com-card: rgba(255,255,255,.92);
        --com-border: rgba(148,163,184,.25);
      }

      [data-crm-theme="night"] .comunicados-pro,
      [data-crm-theme="neon"] .comunicados-pro {
        --com-card: rgba(15,23,42,.78);
        --com-border: rgba(255,255,255,.10);
      }

      .comunicados-hero {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 26px;
        border-radius: 28px;
        color: white;
        border: 1px solid rgba(103,232,249,.22);
        background:
          radial-gradient(circle at 85% 15%, rgba(34,211,238,.22), transparent 28%),
          radial-gradient(circle at 30% 110%, rgba(139,92,246,.28), transparent 38%),
          linear-gradient(135deg,#082f49 0%,#0f172a 52%,#4c1d95 100%);
        box-shadow: 0 22px 55px rgba(15,23,42,.20);
      }

      .comunicados-hero-icon {
        width: 58px;
        height: 58px;
        flex: 0 0 58px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        color: #a5f3fc;
        background: rgba(255,255,255,.11);
        border: 1px solid rgba(255,255,255,.15);
        backdrop-filter: blur(12px);
      }

      .comunicados-eyebrow {
        margin: 0;
        color: #a5f3fc;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .22em;
        text-transform: uppercase;
      }

      .comunicados-hero h2 {
        margin: 4px 0 0;
        font-size: clamp(25px,3vw,34px);
        line-height: 1.05;
        font-weight: 900;
      }

      .comunicados-hero p:last-child {
        margin: 9px 0 0;
        color: #cbd5e1;
        font-size: 14px;
      }

      .comunicados-stats {
        margin-left: auto;
        display: grid;
        grid-template-columns: repeat(3,minmax(88px,1fr));
        gap: 10px;
      }

      .comunicados-stats div {
        min-width: 92px;
        padding: 12px 14px;
        border-radius: 18px;
        background: rgba(255,255,255,.10);
        border: 1px solid rgba(255,255,255,.10);
        backdrop-filter: blur(12px);
      }

      .comunicados-stats span {
        display: block;
        color: #cbd5e1;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
      }

      .comunicados-stats strong {
        display: block;
        margin-top: 3px;
        font-size: 24px;
      }

      .comunicados-card {
        border: 1px solid var(--com-border);
        box-shadow: 0 14px 38px rgba(15,23,42,.08);
      }

      .comunicados-card-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 18px;
        border-bottom: 1px solid var(--com-border);
        background: linear-gradient(90deg,rgba(6,182,212,.08),transparent);
      }

      .comunicados-card-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 15px;
      }

      .comunicados-card-icon.cyan { color:#0e7490; background:#cffafe; }
      .comunicados-card-icon.emerald { color:#047857; background:#d1fae5; }
      .comunicados-card-icon.violet { color:#6d28d9; background:#ede9fe; }

      .comunicados-list {
        max-height: 720px;
        overflow-y: auto;
        padding: 16px;
      }

      .comunicado-item {
        position: relative;
        box-shadow: 0 5px 16px rgba(15,23,42,.04);
      }

      .comunicado-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(14,165,233,.10);
      }

      .comunicados-empty {
        min-height: 230px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        text-align: center;
        color: #94a3b8;
        border: 1px dashed rgba(148,163,184,.4);
        border-radius: 22px;
        background: rgba(148,163,184,.06);
      }

      .comunicados-empty strong {
        color: var(--crm-text-strong);
      }

      .comunicados-empty span {
        font-size: 13px;
      }

      @media (max-width: 900px) {
        .comunicados-hero {
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .comunicados-stats {
          width: 100%;
          margin-left: 0;
        }
      }

      @media (max-width: 560px) {
        .comunicados-hero {
          padding: 20px;
        }

        .comunicados-stats {
          grid-template-columns: repeat(3,1fr);
        }

        .comunicados-stats div {
          min-width: 0;
          padding: 10px;
        }
      }
    `}</style>
  );
}

