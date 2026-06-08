
import { useEffect, useState } from "react";
import { BellRing, FileText } from "lucide-react";

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

export default function ComunicadosCard({ onOpen }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await apiFetch("/comunicados/summary");
        if (!active) return;
        setUnreadCount(data?.unread_count || 0);
        setRecent(data?.recent || []);
      } catch {
        if (!active) return;
        setUnreadCount(0);
        setRecent([]);
      }
    }

    load();
    const interval = setInterval(load, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-[24px] border border-slate-200 bg-white/70 p-5 text-left transition hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Comunicados</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{unreadCount}</p>
          <p className="text-sm text-slate-700">
            {unreadCount === 1 ? "mensaje sin leer" : "mensajes sin leer"}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50">
          <BellRing className="h-5 w-5 text-sky-600" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {recent.slice(0, 2).map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <p className="truncate text-sm font-medium text-slate-800">
                {item.titulo}
              </p>
            </div>
          </div>
        ))}

        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">No hay comunicados recientes.</p>
        ) : null}
      </div>
    </button>
  );
}
