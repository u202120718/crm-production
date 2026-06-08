
import { useEffect, useMemo, useState } from "react";
import { BellRing, Send, FileText, Download } from "lucide-react";

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

export default function Comunicados({ currentUser }) {
  const [comunicados, setComunicados] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titulo: "",
    mensaje: "",
    dirigido_a: ["Comercial"],
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

  const loadComunicados = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/comunicados/list");
      const list = data?.comunicados || [];
      setComunicados(list);
      if (!selectedId && list.length) {
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
          x.id === item.id ? { ...x, is_read: true, read_at: "Leído" } : x
        )
      );
    } catch {}
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
        archivo: null,
      });

      setMessage("Comunicado enviado correctamente.");
      loadComunicados();
    } catch (err) {
      setError(err.message || "No se pudo enviar el comunicado.");
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <p className="crm-label">Comunicados</p>
        <h2 className="crm-title mt-1 text-2xl">Centro de comunicados</h2>
        <p className="crm-muted mt-2 text-sm">
          Aquí puedes publicar cambios de producto, procesos y documentos PDF para el equipo.
        </p>
      </div>

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
        <div className="crm-panel p-5">
          <div className="mb-4 flex items-center gap-3">
            <BellRing className="h-5 w-5 text-cyan-500" />
            <h3 className="crm-heading text-lg">Bandeja</h3>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="crm-muted text-sm">Cargando comunicados...</p>
            ) : comunicados.length > 0 ? (
              comunicados.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected?.id === item.id
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.titulo}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.creado_por} · {item.created_at}
                      </p>
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

        <div className="space-y-6">
          {canPublish ? (
            <form onSubmit={submit} className="crm-panel p-5">
              <div className="mb-4 flex items-center gap-3">
                <Send className="h-5 w-5 text-emerald-500" />
                <h3 className="crm-heading text-lg">Nuevo comunicado</h3>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="crm-label mb-2 block">Título</label>
                  <input
                    value={form.titulo}
                    onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
                    className="crm-input w-full px-4 py-3 outline-none"
                    placeholder="Ejemplo: Cambio de producto Vodafone"
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

          <div className="crm-panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-violet-500" />
              <h3 className="crm-heading text-lg">Detalle</h3>
            </div>

            {selected ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">{selected.titulo}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selected.creado_por} · {selected.created_at}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm whitespace-pre-wrap text-slate-800">
                    {selected.mensaje || "Sin mensaje adicional."}
                  </p>
                </div>

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
              </div>
            ) : (
              <p className="crm-muted text-sm">Selecciona un comunicado para ver el detalle.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
