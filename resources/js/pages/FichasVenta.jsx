
import { useEffect, useMemo, useState } from "react";
import {
  FilePlus2,
  Plus,
  Save,
  Trash2,
  Tv,
  Layers3,
  ChevronRight,
} from "lucide-react";

const STORAGE_KEY = "crm_ficha_venta_demo_tabs_v3";

const TAB_CONFIG = [
  { key: "control", label: "Control" },
  { key: "cliente", label: "Cliente" },
  { key: "direccion", label: "Dirección" },
  { key: "oferta", label: "Oferta" },
  { key: "lineas", label: "Líneas" },
  { key: "cierre", label: "Cierre" },
  { key: "custom", label: "Personalizados" },
];

const TV_SERVICES = [
  { key: "basico", name: "TV Básico", image: "/img/tv/basico.jpg", desc: "Canales esenciales" },
  { key: "esencial", name: "TV Esencial", image: "/img/tv/esencial.jpg", desc: "Entretenimiento diario" },
  { key: "futbol", name: "Fútbol", image: "/img/tv/futbol.jpg", desc: "Deportes en vivo" },
  { key: "netflix", name: "Netflix", image: "/img/tv/netflix.jpg", desc: "Streaming premium" },
  { key: "disney", name: "Disney+", image: "/img/tv/disney.jpg", desc: "Familia y series" },
  { key: "prime", name: "Amazon Prime", image: "/img/tv/prime.jpg", desc: "Películas y series" },
];

export const BASE_FIELDS = [
  { key: "fecha", label: "Fecha", type: "date", tab: "control" },
  { key: "hora", label: "Hora", type: "time", tab: "control" },
  { key: "edicion", label: "Edición", type: "text", tab: "control" },
  {
    key: "estado",
    label: "Estado",
    type: "select",
    tab: "control",
    options: ["Pendiente", "Validación", "Tramitada", "Rechazada", "Activada"],
  },
  {
    key: "subestado",
    label: "Subestado",
    type: "select",
    tab: "control",
    options: ["Documentación pendiente", "No contactado", "Revisión BO", "Error datos", "OK"],
  },
  { key: "comercial", label: "Comercial", type: "user_comercial", tab: "control" },
  { key: "coordinador", label: "Coordinador", type: "user_coord", tab: "control" },
  { key: "supervisor", label: "Supervisor", type: "user_supervisor", tab: "control" },

  { key: "cliente_razon_social", label: "Cliente / Razón Social", type: "text", tab: "cliente" },
  { key: "nif_nie_cif", label: "NIF/NIE/CIF", type: "text", tab: "cliente" },
  { key: "fecha_nacimiento_creacion", label: "Fecha nacimiento / creación", type: "date", tab: "cliente" },
  { key: "movil_contacto", label: "Móvil contacto", type: "tel", tab: "cliente" },
  { key: "iban", label: "IBAN", type: "text", tab: "cliente" },
  { key: "correo", label: "Correo", type: "email", tab: "cliente" },
  { key: "segmento", label: "Segmento", type: "text", tab: "cliente" },
  { key: "nacionalidad", label: "Nacionalidad", type: "text", tab: "cliente" },
  {
    key: "sexo",
    label: "Sexo",
    type: "select",
    tab: "cliente",
    options: ["Masculino", "Femenino", "Otro"],
  },
  { key: "ocupacion", label: "Ocupación", type: "text", tab: "cliente" },

  { key: "titular_responsable", label: "Titular / Responsable", type: "text", tab: "direccion" },
  { key: "titular_nif_nie", label: "NIF/NIE", type: "text", tab: "direccion" },
  { key: "titular_fecha_nacimiento", label: "Fecha de nacimiento", type: "date", tab: "direccion" },
  { key: "via", label: "Vía", type: "text", tab: "direccion" },
  { key: "direccion", label: "Dirección", type: "text", tab: "direccion" },
  { key: "numero_direccion", label: "Número", type: "text", tab: "direccion" },
  { key: "bloque", label: "Bloque", type: "text", tab: "direccion" },
  { key: "portal", label: "Portal", type: "text", tab: "direccion" },
  { key: "escalera", label: "Escalera", type: "text", tab: "direccion" },
  { key: "piso", label: "Piso", type: "text", tab: "direccion" },
  { key: "puerta", label: "Puerta", type: "text", tab: "direccion" },
  { key: "codigo_postal", label: "Código Postal", type: "text", tab: "direccion" },
  { key: "provincia", label: "Provincia", type: "text", tab: "direccion" },
  { key: "localidad", label: "Localidad", type: "text", tab: "direccion" },
  { key: "inmueble", label: "Inmueble", type: "text", tab: "direccion" },
  { key: "provincia_no_tocar", label: "Provincia (NO TOCAR)", type: "text", tab: "direccion" },

  { key: "producto", label: "Producto", type: "text", tab: "oferta" },
  { key: "fibra", label: "Fibra", type: "text", tab: "oferta" },
  { key: "television", label: "Televisión", type: "text", tab: "oferta" },
  { key: "promocion", label: "Promoción", type: "text", tab: "oferta" },
  { key: "cantidad_moviles", label: "Cantidad de móviles", type: "number", tab: "oferta" },
  { key: "precio_promo_luego", label: "Precio promo / luego", type: "text", tab: "oferta" },
  { key: "servicio_adicional", label: "Servicio adicional", type: "text", tab: "oferta" },
  { key: "campana", label: "Campaña", type: "campaign", tab: "oferta" },

  { key: "linea_principal_numero", label: "Número principal", type: "tel", tab: "lineas" },
  { key: "linea_principal_operador", label: "Operador principal", type: "text", tab: "lineas" },
  { key: "linea_principal_titular", label: "Titular principal", type: "text", tab: "lineas" },
  { key: "linea_principal_dni", label: "DNI principal", type: "text", tab: "lineas" },
  { key: "linea_principal_tarifa", label: "Tarifa principal", type: "text", tab: "lineas" },

  { key: "movil_1_numero", label: "Móvil 1", type: "tel", tab: "lineas" },
  { key: "movil_1_operador", label: "Operador 1", type: "text", tab: "lineas" },
  { key: "movil_1_titular", label: "Titular 1", type: "text", tab: "lineas" },
  { key: "movil_1_dni", label: "DNI 1", type: "text", tab: "lineas" },
  { key: "movil_1_icc", label: "ICC 1", type: "text", tab: "lineas" },
  { key: "movil_1_tarifa", label: "Tarifa 1", type: "text", tab: "lineas" },

  { key: "movil_2_numero", label: "Móvil 2", type: "tel", tab: "lineas" },
  { key: "movil_2_operador", label: "Operador 2", type: "text", tab: "lineas" },
  { key: "movil_2_titular", label: "Titular 2", type: "text", tab: "lineas" },
  { key: "movil_2_dni", label: "DNI 2", type: "text", tab: "lineas" },
  { key: "movil_2_icc", label: "ICC 2", type: "text", tab: "lineas" },
  { key: "movil_2_tarifa", label: "Tarifa 2", type: "text", tab: "lineas" },

  { key: "movil_3_numero", label: "Móvil 3", type: "tel", tab: "lineas" },
  { key: "movil_3_operador", label: "Operador 3", type: "text", tab: "lineas" },
  { key: "movil_3_titular", label: "Titular 3", type: "text", tab: "lineas" },
  { key: "movil_3_dni", label: "DNI 3", type: "text", tab: "lineas" },
  { key: "movil_3_icc", label: "ICC 3", type: "text", tab: "lineas" },
  { key: "movil_3_tarifa", label: "Tarifa 3", type: "text", tab: "lineas" },

  { key: "movil_4_numero", label: "Móvil 4", type: "tel", tab: "lineas" },
  { key: "movil_4_operador", label: "Operador 4", type: "text", tab: "lineas" },
  { key: "movil_4_titular", label: "Titular 4", type: "text", tab: "lineas" },
  { key: "movil_4_dni", label: "DNI 4", type: "text", tab: "lineas" },
  { key: "movil_4_icc", label: "ICC 4", type: "text", tab: "lineas" },
  { key: "movil_4_tarifa", label: "Tarifa 4", type: "text", tab: "lineas" },

  { key: "movil_5_numero", label: "Móvil 5", type: "tel", tab: "lineas" },
  { key: "movil_5_operador", label: "Operador 5", type: "text", tab: "lineas" },
  { key: "movil_5_titular", label: "Titular 5", type: "text", tab: "lineas" },
  { key: "movil_5_dni", label: "DNI 5", type: "text", tab: "lineas" },
  { key: "movil_5_icc", label: "ICC 5", type: "text", tab: "lineas" },
  { key: "movil_5_tarifa", label: "Tarifa 5", type: "text", tab: "lineas" },

  { key: "comentario", label: "Comentario", type: "textarea", tab: "cierre" },
  { key: "documentacion", label: "Documentación", type: "text", tab: "cierre" },
  { key: "coordinador_operacion", label: "Coordinador operación", type: "user_coord", tab: "cierre" },
  { key: "comercial_cierre", label: "Comercial cierre", type: "user_comercial", tab: "cierre" },
  { key: "seleccionar_equipo", label: "Seleccionar equipo", type: "text", tab: "cierre" },
  { key: "estado_fijo", label: "Estado fijo", type: "text", tab: "cierre" },
  { key: "estado_movil_principal", label: "Est. móvil principal", type: "text", tab: "cierre" },
  { key: "estado_movil_1", label: "Est. móvil 1", type: "text", tab: "cierre" },
  { key: "estado_movil_2", label: "Est. móvil 2", type: "text", tab: "cierre" },
  { key: "estado_movil_3", label: "Est. móvil 3", type: "text", tab: "cierre" },
  { key: "estado_movil_4", label: "Est. móvil 4", type: "text", tab: "cierre" },
  { key: "estado_tv", label: "Estado TV", type: "text", tab: "cierre" },
  { key: "comentario_final", label: "Comentario final", type: "textarea", tab: "cierre" },
  { key: "crm_carga", label: "CRM Carga", type: "text", tab: "cierre" },
  { key: "fecha_activacion_fijo", label: "Fecha activación fijo", type: "date", tab: "cierre" },
  { key: "fecha_activacion_total", label: "Fecha activación total", type: "date", tab: "cierre" },
  { key: "venta_recuperada", label: "Venta recuperada", type: "select", tab: "cierre", options: ["Sí", "No"] },
  { key: "sondeo_auto_presencial", label: "Sondeo auto/presencial", type: "select", tab: "cierre", options: ["Auto", "Presencial"] },
  { key: "validador", label: "Validador", type: "text", tab: "cierre" },
  { key: "liquidado", label: "Liquidado", type: "select", tab: "cierre", options: ["Sí", "No"] },
];

function buildInitialValues(fields) {
  return fields.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});
}

export default function FichasVenta({
  users = [],
  campaigns = [],
  setVentas,
  setLeads,
  currentUser,
}) {
  const [activeTab, setActiveTab] = useState("control");
  const [customFields, setCustomFields] = useState([]);
  const [selectedTv, setSelectedTv] = useState([]);
  const [formValues, setFormValues] = useState(buildInitialValues(BASE_FIELDS));
  const [newField, setNewField] = useState({
    label: "",
    type: "text",
    optionsText: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.formValues) setFormValues(parsed.formValues);
      if (parsed.customFields) setCustomFields(parsed.customFields);
      if (parsed.selectedTv) setSelectedTv(parsed.selectedTv);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ formValues, customFields, selectedTv })
    );
  }, [formValues, customFields, selectedTv]);

  useEffect(() => {
    if (!currentUser) return;

    setFormValues((prev) => ({
      ...prev,
      comercial:
        prev.comercial ||
        (currentUser.rol === "Comercial" ? currentUser.nombre : prev.comercial),
      coordinador:
        prev.coordinador ||
        currentUser.coordinador ||
        prev.coordinador,
      supervisor:
        prev.supervisor ||
        currentUser.supervisor ||
        (currentUser.rol === "Supervisor" ? currentUser.nombre : prev.supervisor),
      campana:
        prev.campana ||
        currentUser.campana ||
        (Array.isArray(currentUser.allowedCampaigns) && currentUser.allowedCampaigns[0]) ||
        prev.campana,
    }));
  }, [currentUser]);

  const allFields = [...BASE_FIELDS, ...customFields];

  const fieldsByTab = useMemo(() => {
    return TAB_CONFIG.reduce((acc, tab) => {
      acc[tab.key] = allFields.filter((field) => field.tab === tab.key);
      return acc;
    }, {});
  }, [allFields]);

  const comerciales = users.filter((u) => u.rol === "Comercial" && u.estado === "Activo");
  const coordinadores = users.filter(
    (u) => ["Supervisor", "Admin", "Gerente"].includes(u.rol) && u.estado === "Activo"
  );
  const supervisores = users.filter(
    (u) => ["Supervisor", "Gerente"].includes(u.rol) && u.estado === "Activo"
  );

  const handleFieldChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const addCustomField = () => {
    if (!newField.label.trim()) return;

    const options =
      newField.type === "select"
        ? newField.optionsText
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : [];

    const field = {
      key: `custom_${Date.now()}`,
      label: newField.label.trim(),
      type: newField.type,
      tab: "custom",
      options,
    };

    setCustomFields((prev) => [...prev, field]);
    setFormValues((prev) => ({ ...prev, [field.key]: "" }));
    setNewField({ label: "", type: "text", optionsText: "" });
    setActiveTab("custom");
  };

  const removeCustomField = (key) => {
    setCustomFields((prev) => prev.filter((f) => f.key !== key));
    setFormValues((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const saveDraft = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ formValues, customFields, selectedTv })
    );
    alert("Borrador guardado.");
  };

  const clearForm = () => {
    setFormValues(buildInitialValues(BASE_FIELDS));
    setCustomFields([]);
    setSelectedTv([]);
    setActiveTab("control");
  };

  const submitDemo = () => {
    if (!formValues.cliente_razon_social || !formValues.campana || !formValues.comercial) {
      alert("Completa al menos cliente, campaña y comercial.");
      return;
    }

    const fichaCompleta = {
      ...formValues,
      customFields,
      servicios_tv: selectedTv,
    };

    const telefonoLead =
      formValues.movil_contacto ||
      formValues.linea_principal_numero ||
      "";

    const nombreLead = formValues.cliente_razon_social || "";
    const provinciaLead = formValues.provincia || "";
    const campanaLead = formValues.campana || "";

    const nuevaVenta = {
      id: Date.now(),
      fecha: formValues.fecha || new Date().toISOString().slice(0, 10),
      hora: formValues.hora || new Date().toLocaleTimeString().slice(0, 5),
      cliente: formValues.cliente_razon_social || "",
      documento: formValues.nif_nie_cif || "",
      telefono: telefonoLead,
      campana: campanaLead,
      comercial: formValues.comercial || currentUser?.nombre || "",
      coordinador:
        formValues.coordinador ||
        formValues.coordinador_operacion ||
        currentUser?.coordinador ||
        "",
      supervisor:
        formValues.supervisor ||
        currentUser?.supervisor ||
        (currentUser?.rol === "Supervisor" ? currentUser.nombre : ""),
      producto: formValues.producto || "",
      estado: formValues.estado || "Pendiente",
      serviciosTv: selectedTv,
      ficha: fichaCompleta,
    };

    if (setVentas) {
      setVentas((prev) => [nuevaVenta, ...prev]);
    }

    if (setLeads) {
      setLeads((prev) => {
        const index = prev.findIndex((lead) => {
          const samePhone =
            telefonoLead &&
            String(lead.telefono || "").trim() === String(telefonoLead).trim();

          const sameName =
            nombreLead &&
            String(lead.nombre || "").trim().toLowerCase() ===
              String(nombreLead).trim().toLowerCase();

          return samePhone || sameName;
        });

        const leadActualizado = {
          id: Date.now() + 1,
          nombre: nombreLead,
          telefono: telefonoLead,
          campana: campanaLead,
          estado: "Cerrado",
          provincia: provinciaLead,
        };

        if (index >= 0) {
          return prev.map((lead, i) =>
            i === index
              ? {
                  ...lead,
                  nombre: nombreLead || lead.nombre,
                  telefono: telefonoLead || lead.telefono,
                  campana: campanaLead || lead.campana,
                  provincia: provinciaLead || lead.provincia,
                  estado: "Cerrado",
                }
              : lead
          );
        }

        return [leadActualizado, ...prev];
      });
    }

    alert("Venta registrada y lead actualizado.");
    clearForm();
  };

  const renderOptions = (field) => {
    if (field.type === "campaign") {
      return (
        <>
          <option value="">Selecciona campaña</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.nombre}>
              {c.nombre}
            </option>
          ))}
        </>
      );
    }

    if (field.type === "user_comercial") {
      return (
        <>
          <option value="">Selecciona comercial</option>
          {comerciales.map((u) => (
            <option key={u.id} value={u.nombre}>
              {u.nombre}
            </option>
          ))}
        </>
      );
    }

    if (field.type === "user_coord") {
      return (
        <>
          <option value="">Selecciona coordinador</option>
          {coordinadores.map((u) => (
            <option key={u.id} value={u.nombre}>
              {u.nombre} - {u.rol}
            </option>
          ))}
        </>
      );
    }

    if (field.type === "user_supervisor") {
      return (
        <>
          <option value="">Selecciona supervisor</option>
          {supervisores.map((u) => (
            <option key={u.id} value={u.nombre}>
              {u.nombre}
            </option>
          ))}
        </>
      );
    }

    return (
      <>
        <option value="">Selecciona</option>
        {(field.options || []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </>
    );
  };

  const renderField = (field) => {
    if (
      ["select", "campaign", "user_comercial", "user_coord", "user_supervisor"].includes(field.type)
    ) {
      return (
        <select
          value={formValues[field.key] || ""}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          className="crm-input w-full px-4 py-3 outline-none"
        >
          {renderOptions(field)}
        </select>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          value={formValues[field.key] || ""}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          className="crm-input min-h-[110px] w-full px-4 py-3 outline-none"
          placeholder={field.label}
        />
      );
    }

    return (
      <input
        type={field.type}
        value={formValues[field.key] || ""}
        onChange={(e) => handleFieldChange(field.key, e.target.value)}
        className="crm-input w-full px-4 py-3 outline-none"
        placeholder={field.label}
      />
    );
  };

  const tabCount = (tabKey) => fieldsByTab[tabKey]?.length || 0;

  return (
    <div className="space-y-6">
      <div className="crm-panel p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="crm-label">Ventas</p>
            <h2 className="crm-title mt-1 text-2xl">Nuevo contrato / ficha</h2>
            <p className="crm-muted mt-2">
              Ficha amplia, ordenada por pestañas y relacionada con leads y seguimiento.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={saveDraft}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15"
            >
              <Save className="h-4 w-4" />
              Guardar borrador
            </button>

            <button
              onClick={submitDemo}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-3 text-emerald-200 transition hover:bg-emerald-500/20"
            >
              <FilePlus2 className="h-4 w-4" />
              Registrar contrato
            </button>

            <button
              onClick={clearForm}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              Limpiar ficha
            </button>
          </div>
        </div>
      </div>

      <div className="crm-panel p-4">
        <div className="flex flex-wrap gap-2">
          {TAB_CONFIG.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  active
                    ? "border-white/20 bg-white/15"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {tab.label} ({tabCount(tab.key)})
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "custom" && (
        <div className="crm-panel p-5">
          <h3 className="crm-heading text-lg">Agregar campo personalizado</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input
              value={newField.label}
              onChange={(e) => setNewField((prev) => ({ ...prev, label: e.target.value }))}
              className="crm-input w-full px-4 py-3 outline-none"
              placeholder="Nombre del nuevo campo"
            />

            <select
              value={newField.type}
              onChange={(e) => setNewField((prev) => ({ ...prev, type: e.target.value }))}
              className="crm-input w-full px-4 py-3 outline-none"
            >
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="date">Fecha</option>
              <option value="email">Email</option>
              <option value="tel">Teléfono</option>
              <option value="textarea">Texto largo</option>
              <option value="select">Lista desplegable</option>
            </select>

            <input
              value={newField.optionsText}
              onChange={(e) => setNewField((prev) => ({ ...prev, optionsText: e.target.value }))}
              className="crm-input w-full px-4 py-3 outline-none"
              placeholder="Opciones con coma si es lista"
            />

            <button
              onClick={addCustomField}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15"
            >
              <Plus className="h-4 w-4" />
              Añadir campo
            </button>
          </div>
        </div>
      )}

      {activeTab === "oferta" && (
        <div className="crm-panel p-5">
          <div className="flex items-center gap-2">
            <Tv className="h-5 w-5" />
            <h3 className="crm-heading text-lg">Servicios TV</h3>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {TV_SERVICES.map((item) => {
              const checked = selectedTv.includes(item.name);

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setSelectedTv((prev) =>
                      checked ? prev.filter((x) => x !== item.name) : [...prev, item.name]
                    )
                  }
                  className={`group overflow-hidden rounded-[24px] border text-left transition ${
                    checked
                      ? "border-white/20 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute right-3 top-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          checked ? "bg-white text-black" : "bg-black/50 text-white backdrop-blur"
                        }`}
                      >
                        {checked ? "Seleccionado" : "Elegir"}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-lg font-semibold text-white">{item.name}</p>
                      <p className="text-sm text-slate-200">{item.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="crm-panel p-5">
        <div className="flex items-center gap-2">
          <Layers3 className="h-5 w-5" />
          <h3 className="crm-heading text-lg">
            {TAB_CONFIG.find((t) => t.key === activeTab)?.label}
          </h3>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(fieldsByTab[activeTab] || []).map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="crm-label block">{field.label}</label>

                {field.key.startsWith("custom_") && (
                  <button
                    type="button"
                    onClick={() => removeCustomField(field.key)}
                    className="text-rose-300 transition hover:text-rose-200"
                    title="Eliminar campo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {renderField(field)}
            </div>
          ))}
        </div>

        {activeTab === "custom" && !(fieldsByTab.custom || []).length && (
          <p className="crm-muted mt-4 text-sm">No hay campos personalizados todavía.</p>
        )}
      </div>

      <div className="crm-panel p-5">
        <div className="flex items-center gap-2">
          <ChevronRight className="h-5 w-5" />
          <h3 className="crm-heading text-lg">Resumen rápido</h3>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="crm-panel-soft p-4">
            <p className="crm-label">Campaña</p>
            <p className="crm-heading mt-1">{formValues.campana || "-"}</p>
          </div>

          <div className="crm-panel-soft p-4">
            <p className="crm-label">Comercial</p>
            <p className="crm-heading mt-1">{formValues.comercial || "-"}</p>
          </div>

          <div className="crm-panel-soft p-4">
            <p className="crm-label">Cliente</p>
            <p className="crm-heading mt-1">{formValues.cliente_razon_social || "-"}</p>
          </div>

          <div className="crm-panel-soft p-4">
            <p className="crm-label">Servicios TV</p>
            <p className="crm-heading mt-1">
              {selectedTv.length ? selectedTv.join(", ") : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
