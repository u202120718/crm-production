import { useMemo, useState } from "react";
import {
  Search,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";

const DOCS = ["N.I.F.", "N.I.E.", "C.I.F.", "PASAPORTE"];
const DEFAULT_SEGMENTOS = ["PARTICULAR", "MICRO"];
const DEFAULT_SFID = ["ESPC0231", "ESPC0450", "ESPC1088"];

const FRASES = [
  "Hoy puede ser tu mejor día comercial.",
  "Una ficha bien cargada protege una buena venta.",
  "Cada gestión correcta te acerca al objetivo.",
  "Orden, claridad y confianza: así se cierran mejores ventas.",
];

const DEFAULT_FIBRA = [
  { key: "FIBRA_600_MB", title: "Fibra 600 Mb", subtitle: "600 MB", image: "", enabled: true },
  { key: "FIBRA_1_GB", title: "Fibra 1 Gb", subtitle: "1 GB", image: "", enabled: true },
  { key: "FIBRA_600_MB_NEBA", title: "Fibra 600 Mb", subtitle: "600 MB NEBA", image: "", enabled: true },
  { key: "FIBRA_1_GB_NEBA", title: "Fibra 1 Gb", subtitle: "1 GB NEBA", image: "", enabled: true },
];

const DEFAULT_MOVILES = [
  { key: "MOVIL_30GB", title: "Movil 30GB", subtitle: "30GB", maxQty: 10, image: "", enabled: true },
  { key: "MOVIL_60GB", title: "Movil 60GB", subtitle: "60GB", maxQty: 10, image: "", enabled: true },
  { key: "MOVIL_160GB", title: "Movil 160GB", subtitle: "160GB", maxQty: 10, image: "", enabled: true },
  { key: "MOVIL_ILIMITADA", title: "Movil Ilimitada", subtitle: "ILIMITADA", maxQty: 10, image: "", enabled: true },
];

const DEFAULT_TV = [
  ["Vodafone TV con HBO Max", "11,00 € / mes"],
  ["Disney+ Estándar con Anuncios", "6,99 € / mes"],
  ["TV con Disney+ Estándar", "12,00 € / mes"],
  ["Netflix - Estandar con anuncios", "8,99 € / mes"],
  ["Netflix - Estandar", "14,99 € / mes"],
  ["Netflix - Premium", "21,99 € / mes"],
  ["Vodafone TV con Prime", "6,99 € / mes"],
  ["Vodafone TV con HBO Max y Prime", "15,00 € / mes"],
  ["TV con Disney+ Estándar y Prime", "16,00 € / mes"],
  ["TV con HBO Max y Disney+ Estándar", "20,00 € / mes"],
  ["TV con HBO Max, Disney+ Estándar y Prime", "23,00 € / mes"],
  ["TV con Disney+ Estándar, Prime y Filmin", "22,00 € / mes"],
  ["Vodafone TV", "5,00 € / mes"],
  ["Plan Futbol de DAZN", "19,99 € / mes"],
  ["Plan Motor de DAZN", "19,99 € / mes"],
  ["Deportes", "6,00 € / mes"],
  ["Vodafone TV con Filmin", "5,00 € / mes"],
  ["Documentales", "8,00 € / mes"],
  ["Onetoro TV", "14,99 € / mes"],
  ["Caza y Pesca", "6,99 € / mes"],
  ["+18", "9,99 € / mes"],
  ["AMC+", "4,99 € / mes"],
  ["Más Series", "6,00 € / mes"],
  ["Plan Premium de DAZN", "31,99 € / mes"],
].map(([title, price], index) => ({
  key: `TV_${index + 1}`,
  title,
  price,
  image: "",
  enabled: true,
}));

const BASE_FORM = {
  sfid: "ESPC0231",
  tipo_documento_vodafone: "N.I.F.",
  nif_nie_cif: "",
  nombre: "",
  apellidos: "",
  correo: "",
  movil_contacto: "",
  telefono_fijo_contacto: "",
  telefono_contacto_adicional: "",
  fecha_nacimiento_creacion: "",
  segmento_vodafone: "PARTICULAR",
  sin_movil: false,

  direccion: "",
  numero_direccion: "",
  piso: "",
  puerta: "",
  localidad: "",
  codigo_postal: "",

  fibra: "",
  promo_codigo: "",
  tipo_factura_vodafone: "Factura electrónica",

  banco_mismo_titular: "Sí",
  banco_nombre: "",
  banco_primer_apellido: "",
  banco_segundo_apellido: "",
  banco_tipo_documento: "N.I.F.",
  banco_numero_documento: "",
  iban: "",

  comentario: "",
};

function upper(value) {
  return String(value || "").toUpperCase().trim();
}

function onlyDigits(value, max = 9) {
  return String(value || "").replace(/\D/g, "").slice(0, max);
}

function cleanDoc(value) {
  return upper(value).replace(/[^A-Z0-9]/g, "").slice(0, 9);
}

function cleanIban(value) {
  return upper(value).replace(/[^A-Z0-9]/g, "").slice(0, 24);
}

function normalizeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function normalizeCatalog(raw, fallback) {
  const source = normalizeArray(raw, fallback);
  return source
    .filter(Boolean)
    .filter((item) => item.enabled !== false)
    .map((item, index) => ({
      key: item.key || item.id || item.subtitle || item.title || `ITEM_${index + 1}`,
      title: item.title || item.nombre || item.label || `Item ${index + 1}`,
      subtitle: item.subtitle || item.plan || item.velocidad || "",
      price: item.price || item.precio || item.importe || "",
      image: item.image || item.imagen || "",
      maxQty: Number(item.maxQty || item.max_qty || 10),
      enabled: item.enabled !== false,
    }));
}

function findVodafoneCampaign(campaigns = []) {
  const list = normalizeArray(campaigns, []);
  return (
    list.find((c) => upper(c?.nombre) === "VODAFONE") ||
    list.find((c) => upper(c?.nombre).includes("VODAFONE")) ||
    list[0] ||
    null
  );
}

function getProducts(campaign) {
  return campaign?.productos && typeof campaign.productos === "object"
    ? campaign.productos
    : {};
}

function getFieldOptions(campaign, key, fallback) {
  const fields = normalizeArray(campaign?.dynamicFields || campaign?.customFields, []);
  const field = fields.find((f) => f.key === key);
  if (Array.isArray(field?.options) && field.options.length) {
    if (key === "segmento_vodafone") {
      const filtered = field.options.filter((x) => ["PARTICULAR", "MICRO"].includes(upper(x)));
      return filtered.length ? filtered : fallback;
    }
    return field.options;
  }
  return fallback;
}

function apiHeaders() {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };

  const token = getCookie("XSRF-TOKEN");
  if (token) headers["X-XSRF-TOKEN"] = decodeURIComponent(token);

  return headers;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
}

async function postVenta(payload) {
  const response = await fetch("/ventas", {
    method: "POST",
    credentials: "include",
    headers: apiHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo guardar la venta.");
  }

  return data;
}

export default function FichasVenta({
  campaigns = [],
  setVentas,
  currentUser,
}) {
  const vodafoneCampaign = useMemo(() => findVodafoneCampaign(campaigns), [campaigns]);
  const productos = useMemo(() => getProducts(vodafoneCampaign), [vodafoneCampaign]);

  const fibraOptions = useMemo(() => {
    const raw = vodafoneCampaign?.fibraOptions || productos.fibra;
    return normalizeCatalog(raw, DEFAULT_FIBRA);
  }, [productos.fibra, vodafoneCampaign]);

  const mobileOptions = useMemo(() => {
    const raw = vodafoneCampaign?.mobileOptions || productos.moviles || productos.mobileOptions;
    return normalizeCatalog(raw, DEFAULT_MOVILES);
  }, [productos.moviles, productos.mobileOptions, vodafoneCampaign]);

  const tvOptions = useMemo(() => {
    const raw = vodafoneCampaign?.tvOptions || productos.tv || productos.television;
    return normalizeCatalog(raw, DEFAULT_TV);
  }, [productos.tv, productos.television, vodafoneCampaign]);

  const segmentoOptions = useMemo(
    () => getFieldOptions(vodafoneCampaign, "segmento_vodafone", DEFAULT_SEGMENTOS),
    [vodafoneCampaign]
  );

  const sfidOptions = useMemo(
    () => getFieldOptions(vodafoneCampaign, "sfid", DEFAULT_SFID),
    [vodafoneCampaign]
  );

  const [form, setForm] = useState(BASE_FORM);
  const [dniInput, setDniInput] = useState("");
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [offerView, setOfferView] = useState("menu");
  const [mobileQty, setMobileQty] = useState({});
  const [selectedTv, setSelectedTv] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);
  const totalMobiles = Object.values(mobileQty).reduce((acc, n) => acc + Number(n || 0), 0);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const ingresar = () => {
    const dni = cleanDoc(dniInput);
    if (!dni) {
      setError("Ingresa el documento para continuar.");
      return;
    }

    setError("");
    setForm((prev) => ({ ...prev, nif_nie_cif: dni }));
    setDniInput(dni);
    setStarted(true);
    setStep(0);
  };

  const goNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const goBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const changeMobile = (key, mode, maxQty = 10) => {
    setMobileQty((prev) => {
      const current = Number(prev[key] || 0);

      if (mode === "plus") {
        const maxByItem = Math.min(10, Number(maxQty || 10));
        if (totalMobiles >= 10 || current >= maxByItem) return prev;
        return { ...prev, [key]: current + 1 };
      }

      return { ...prev, [key]: Math.max(0, current - 1) };
    });
  };

  const toggleTv = (key) => {
    setSelectedTv((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const productSummary = useMemo(() => {
    const parts = [];

    if (form.fibra) parts.push(form.fibra);

    mobileOptions.forEach((item) => {
      const qty = Number(mobileQty[item.key] || 0);
      if (qty > 0) parts.push(`${item.title} x${qty}`);
    });

    tvOptions.forEach((item) => {
      if (selectedTv.includes(item.key)) parts.push(item.title);
    });

    return parts.join(" + ");
  }, [form.fibra, mobileOptions, mobileQty, selectedTv, tvOptions]);

  const selectedMobileServices = useMemo(() => {
    return mobileOptions
      .map((item) => ({
        key: item.key,
        title: item.title,
        subtitle: item.subtitle,
        cantidad: Number(mobileQty[item.key] || 0),
      }))
      .filter((item) => item.cantidad > 0);
  }, [mobileOptions, mobileQty]);

  const selectedTvServices = useMemo(() => {
    return tvOptions.filter((item) => selectedTv.includes(item.key));
  }, [selectedTv, tvOptions]);

  const guardar = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        campana: "VODAFONE",
        cliente: `${form.nombre} ${form.apellidos}`.trim() || form.nif_nie_cif,
        documento: form.nif_nie_cif,
        telefono: form.movil_contacto || form.telefono_fijo_contacto,
        comercial: currentUser?.nombre || currentUser?.name || "",
        coordinador: currentUser?.coordinador || "",
        supervisor: currentUser?.supervisor || "",
        producto: productSummary || "VODAFONE",
        estado: "PENDIENTE",
        serviciosTv: selectedTvServices.map((x) => x.title),
        ficha: {
          ...form,
          fibraSeleccionada: form.fibra,
          movilesSeleccionados: selectedMobileServices,
          tvSeleccionada: selectedTvServices,
          campaign_id: vodafoneCampaign?.id || null,
        },
      };

      const data = await postVenta(payload);
      const venta = data?.venta || {
        id: Date.now(),
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        ...payload,
      };

      setVentas?.((prev) => [venta, ...(prev || [])]);
      setMessage("Ficha Vodafone guardada correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo guardar la venta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vf-page">
      <Style />

      <div className="vf-shell">
        {message ? <div className="vf-alert ok">{message}</div> : null}
        {error ? <div className="vf-alert error">{error}</div> : null}

        {!started ? (
          <section className="vf-start vf-fade-slide">
            <div className="vf-brand">vodafone</div>
            <h1>Bienvenido al configurador de oferta Vodafone</h1>
            <div className="vf-phrase">{frase}</div>

            <div className="vf-ingreso">
              <FieldSelect
                label="Tipo documento"
                value={form.tipo_documento_vodafone}
                options={DOCS}
                onChange={(v) => update("tipo_documento_vodafone", v)}
              />

              <Field
                label="Nº Documento"
                value={dniInput}
                placeholder="Nº DOCUMENTO"
                onChange={(v) => setDniInput(cleanDoc(v))}
                onEnter={ingresar}
              />

              <button className="vf-red-btn" onClick={ingresar}>
                <Search size={18} />
                Ingresar
              </button>
            </div>
          </section>
        ) : (
          <section className="vf-wizard vf-fade-slide">
            <div className="vf-stepbar">
              {["Cliente", "Oferta", "Facturación y banco", "Complementarios"].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`vf-step-dot ${step === index ? "active" : ""} ${step > index ? "done" : ""}`}
                >
                  <span>{index + 1}</span>
                  <p>{label}</p>
                </button>
              ))}
            </div>

            <div className="vf-slider">
              <div
                className="vf-track"
                style={{ transform: `translateX(-${step * 25}%)` }}
              >
                <div className="vf-slide">
                  <ClientStep
                    form={form}
                    update={update}
                    segmentoOptions={segmentoOptions}
                    sfidOptions={sfidOptions}
                    onNext={goNext}
                  />
                </div>

                <div className="vf-slide">
                  <OfferStep
                    form={form}
                    update={update}
                    offerView={offerView}
                    setOfferView={setOfferView}
                    fibraOptions={fibraOptions}
                    mobileOptions={mobileOptions}
                    tvOptions={tvOptions}
                    mobileQty={mobileQty}
                    selectedTv={selectedTv}
                    totalMobiles={totalMobiles}
                    changeMobile={changeMobile}
                    toggleTv={toggleTv}
                    onBack={goBack}
                    onNext={goNext}
                  />
                </div>

                <div className="vf-slide">
                  <BillingStep
                    form={form}
                    update={update}
                    onBack={goBack}
                    onNext={goNext}
                  />
                </div>

                <div className="vf-slide">
                  <ComplementStep
                    form={form}
                    update={update}
                    productSummary={productSummary}
                    onBack={goBack}
                    onSave={guardar}
                    saving={saving}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ClientStep({ form, update, segmentoOptions, sfidOptions, onNext }) {
  return (
    <div className="vf-panel">
      <h2>Editar datos de cliente</h2>

      <div className="vf-grid cols-4">
        <FieldSelect label="SFID" value={form.sfid} options={sfidOptions} onChange={(v) => update("sfid", v)} />
        <FieldSelect label="Tipo de documento" value={form.tipo_documento_vodafone} options={DOCS} onChange={(v) => update("tipo_documento_vodafone", v)} />
        <Field label="NIF" value={form.nif_nie_cif} disabled />
        <Field label="Nombre" value={form.nombre} onChange={(v) => update("nombre", v)} />

        <Field label="Apellidos" value={form.apellidos} onChange={(v) => update("apellidos", v)} />
        <Field label="Email" value={form.correo} onChange={(v) => update("correo", v)} />
        <Field label="Tlf Móvil Comunicaciones" value={form.movil_contacto} onChange={(v) => update("movil_contacto", onlyDigits(v))} />
        <Field label="Tlf Fijo Contacto" value={form.telefono_fijo_contacto} onChange={(v) => update("telefono_fijo_contacto", onlyDigits(v))} />

        <Field label="Tlf. Contacto Adicional" value={form.telefono_contacto_adicional} onChange={(v) => update("telefono_contacto_adicional", onlyDigits(v))} />
        <Field label="Fecha de Nacimiento" type="date" value={form.fecha_nacimiento_creacion} onChange={(v) => update("fecha_nacimiento_creacion", v)} />
        <FieldSelect label="Segmento Vodafone" value={form.segmento_vodafone} options={segmentoOptions} onChange={(v) => update("segmento_vodafone", v)} />

        <label className="vf-check">
          <input type="checkbox" checked={Boolean(form.sin_movil)} onChange={(e) => update("sin_movil", e.target.checked)} />
          No tiene teléfono móvil
        </label>
      </div>

      <div className="vf-address-box">
        <div className="vf-address-head">
          <h3>Seleccione la Dirección</h3>
          <button type="button">Añadir dirección</button>
        </div>

        <div className="vf-grid cols-6">
          <Field className="span-2" label="Dirección" value={form.direccion} onChange={(v) => update("direccion", v)} />
          <Field label="Número" value={form.numero_direccion} onChange={(v) => update("numero_direccion", v)} />
          <Field label="Piso" value={form.piso} onChange={(v) => update("piso", v)} />
          <Field label="Puerta" value={form.puerta} onChange={(v) => update("puerta", v)} />
          <Field label="C. Postal" value={form.codigo_postal} onChange={(v) => update("codigo_postal", v)} />
          <Field className="span-2" label="Localidad" value={form.localidad} onChange={(v) => update("localidad", v)} />
        </div>
      </div>

      <div className="vf-actions right">
        <button className="vf-red-btn big" onClick={onNext}>
          Continuar
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function OfferStep({
  form,
  update,
  offerView,
  setOfferView,
  fibraOptions,
  mobileOptions,
  tvOptions,
  mobileQty,
  selectedTv,
  totalMobiles,
  changeMobile,
  toggleTv,
  onBack,
  onNext,
}) {
  return (
    <div className="vf-panel">
      <h2>Configurador de Ofertas | ONE</h2>

      {offerView === "menu" ? (
        <div className="vf-categories">
          <CategoryCard type="fibra" title="Fibra + Fijo" button="Seleccionar" red onClick={() => setOfferView("fibra")} />
          <CategoryCard type="movil" title="Línea móvil" button="Seleccionar Fibra + Fijo" onClick={() => setOfferView("movil")} />
          <CategoryCard type="tv" title="Vodafone TV" button="Seleccionar TV" onClick={() => setOfferView("tv")} />
        </div>
      ) : null}

      {offerView === "fibra" ? (
        <>
          <BackRound onClick={() => setOfferView("menu")} />
          <div className="vf-product-grid two">
            {fibraOptions.map((item) => (
              <ProductCard
                key={item.key}
                item={item}
                type="fibra"
                active={form.fibra === (item.subtitle || item.title)}
                onClick={() => update("fibra", item.subtitle || item.title)}
              />
            ))}
          </div>
        </>
      ) : null}

      {offerView === "movil" ? (
        <>
          <BackRound onClick={() => setOfferView("menu")} />
          <p className="vf-limit">Móviles seleccionados: {totalMobiles}/10</p>

          <div className="vf-product-grid two">
            {mobileOptions.map((item) => (
              <MobileCard
                key={item.key}
                item={item}
                qty={Number(mobileQty[item.key] || 0)}
                onMinus={() => changeMobile(item.key, "minus", item.maxQty)}
                onPlus={() => changeMobile(item.key, "plus", item.maxQty)}
              />
            ))}
          </div>
        </>
      ) : null}

      {offerView === "tv" ? (
        <>
          <BackRound onClick={() => setOfferView("menu")} />
          <div className="vf-product-grid three">
            {tvOptions.map((item) => (
              <TvCard
                key={item.key}
                item={item}
                active={selectedTv.includes(item.key)}
                onClick={() => toggleTv(item.key)}
              />
            ))}
          </div>
        </>
      ) : null}

      <div className="vf-actions split">
        <button className="vf-gray-btn big" onClick={onBack}>
          <ChevronLeft size={20} />
          Volver
        </button>

        <button className="vf-red-btn big" onClick={onNext}>
          Continuar
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function BillingStep({ form, update, onBack, onNext }) {
  return (
    <div className="vf-two">
      <div className="vf-panel">
        <h3>¡Promoción disponible!</h3>

        <div className="vf-discount">
          <input
            value={form.promo_codigo}
            onChange={(e) => update("promo_codigo", e.target.value)}
            placeholder="T&P + Resto Promos Comp (-14,01 €)"
          />
          <button>Aplicar descuento</button>
        </div>

        <h3 className="vf-subtitle">Tipo de facturación</h3>

        <div className="vf-invoices">
          <InvoiceCard
            title="Factura electrónica"
            active={form.tipo_factura_vodafone === "Factura electrónica"}
            onClick={() => update("tipo_factura_vodafone", "Factura electrónica")}
          />
          <InvoiceCard
            title="Factura en papel"
            active={form.tipo_factura_vodafone === "Factura en papel"}
            onClick={() => update("tipo_factura_vodafone", "Factura en papel")}
          />
        </div>
      </div>

      <div className="vf-panel">
        <h2>Datos bancarios</h2>

        <label className="vf-check bank">
          <input
            type="checkbox"
            checked={form.banco_mismo_titular === "Sí"}
            onChange={(e) => update("banco_mismo_titular", e.target.checked ? "Sí" : "No")}
          />
          Mismo titular
        </label>

        <div className="vf-grid cols-3">
          <Field placeholder="Nombre" value={form.banco_nombre} onChange={(v) => update("banco_nombre", v)} />
          <Field placeholder="Primer apellido" value={form.banco_primer_apellido} onChange={(v) => update("banco_primer_apellido", v)} />
          <Field placeholder="Segundo apellido" value={form.banco_segundo_apellido} onChange={(v) => update("banco_segundo_apellido", v)} />
        </div>

        <div className="vf-grid cols-2 top">
          <FieldSelect value={form.banco_tipo_documento} options={DOCS} onChange={(v) => update("banco_tipo_documento", v)} />
          <Field placeholder="Nº DOCUMENTO" value={form.banco_numero_documento} onChange={(v) => update("banco_numero_documento", cleanDoc(v))} />
        </div>

        <div className="top">
          <Field placeholder="IBAN de la cuenta" value={form.iban} onChange={(v) => update("iban", cleanIban(v))} />
        </div>

        <p className="vf-invoice-text">
          Tipo de factura: {form.tipo_factura_vodafone.replace("Factura ", "")}
        </p>
      </div>

      <div className="vf-actions span split">
        <button className="vf-gray-btn big" onClick={onBack}>
          <ChevronLeft size={20} />
          Volver
        </button>

        <button className="vf-red-btn big" onClick={onNext}>
          Continuar
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function ComplementStep({ form, update, productSummary, onBack, onSave, saving }) {
  return (
    <div className="vf-panel">
      <div className="vf-complement-title">Datos complementarios</div>

      <textarea
        value={form.comentario}
        onChange={(e) => update("comentario", e.target.value)}
        placeholder="Observaciones / datos complementarios"
      />

      <div className="vf-summary">
        <strong>Resumen de producto:</strong>
        <p>{productSummary || "Sin productos seleccionados"}</p>
      </div>

      <div className="vf-actions split">
        <button className="vf-gray-btn big" onClick={onBack}>
          <ChevronLeft size={20} />
          Volver
        </button>

        <button className="vf-red-btn big" onClick={onSave} disabled={saving}>
          <Save size={20} />
          {saving ? "Guardando..." : "Guardar ficha Vodafone"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text", disabled = false, className = "", onEnter }) {
  return (
    <div className={className}>
      {label ? <label>{label}</label> : null}
      <input
        type={type}
        value={value || ""}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options = [] }) {
  const safeOptions = Array.isArray(options) && options.length ? options : [value || ""];
  return (
    <div>
      {label ? <label>{label}</label> : null}
      <select value={value || ""} onChange={(e) => onChange?.(e.target.value)}>
        {safeOptions.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}

function BackRound({ onClick }) {
  return (
    <button className="vf-back-round" onClick={onClick}>
      <ChevronLeft size={28} />
    </button>
  );
}

function CategoryCard({ type, title, button, red, onClick }) {
  return (
    <div className="vf-category">
      <button className="vf-category-box" onClick={onClick}>
        <VodafoneIcon type={type} />
        <p>{title}</p>
      </button>
      <button className={red ? "red" : ""} onClick={onClick}>{button}</button>
    </div>
  );
}

function ProductCard({ item, type, active, onClick }) {
  return (
    <button className={`vf-product-card ${active ? "active" : ""}`} onClick={onClick}>
      <Visual image={item.image} title={item.title} type={type} />
      <div className="vf-card-content">
        <div className="vf-card-title">
          <strong>{item.title}</strong>
          <ChevronDown size={30} />
        </div>
        <p>{item.subtitle}</p>
      </div>
    </button>
  );
}

function MobileCard({ item, qty, onMinus, onPlus }) {
  return (
    <div className="vf-product-card">
      <Visual image={item.image} title={item.title} type="movil" />
      <div className="vf-card-content">
        <div className="vf-card-title">
          <strong>{item.title}</strong>
          <ChevronDown size={30} />
        </div>

        <div className="vf-counter">
          <button onClick={onMinus}><Minus size={18} /></button>
          <span>{qty}</span>
          <button className="plus" onClick={onPlus}><Plus size={20} /></button>
        </div>
      </div>
    </div>
  );
}

function TvCard({ item, active, onClick }) {
  return (
    <button className={`vf-tv-card ${active ? "active" : ""}`} onClick={onClick}>
      <Visual image={item.image} title={item.title} type="tv" />
      <div className="vf-card-content">
        <div className="vf-card-title small">
          <strong>{item.title}</strong>
          <ChevronDown size={20} />
        </div>
        <p className="price">{item.price}</p>
      </div>
    </button>
  );
}

function InvoiceCard({ title, active, onClick }) {
  return (
    <button className={`vf-invoice ${active ? "active" : ""}`} onClick={onClick}>
      <div className="vf-radio-row">
        <span />
        <strong>{title}</strong>
      </div>

      {active ? (
        <p>
          Para seguir con la contratación, verifica con el cliente que está de acuerdo
          con que Vodafone le envíe la factura por vía electrónica.
        </p>
      ) : null}
    </button>
  );
}

function Visual({ image, title, type }) {
  if (image) {
    return (
      <div className="vf-image-wrap">
        <img
          src={image}
          alt={title}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <VodafoneIcon type={type} />
      </div>
    );
  }

  return <VodafoneIcon type={type} />;
}

function VodafoneIcon({ type }) {
  if (type === "fibra") {
    return (
      <div className="vf-icon fibra">
        <div className="wifi a" />
        <div className="wifi b" />
        <div className="dot" />
        <div className="router" />
      </div>
    );
  }

  if (type === "movil") {
    return (
      <div className="vf-icon phone">
        <span />
      </div>
    );
  }

  return (
    <div className="vf-icon tv">
      <div>TV</div>
      <span />
    </div>
  );
}

function Style() {
  return (
    <style>{`
      .vf-page {
        min-height: 100vh;
        background: #f1f1f1;
        padding: 24px;
        color: #3f3f46;
        font-family: Arial, Helvetica, sans-serif;
      }

      .vf-shell {
        max-width: 1260px;
        margin: 0 auto;
      }

      .vf-alert {
        margin-bottom: 16px;
        padding: 14px 18px;
        border-radius: 12px;
        font-weight: 700;
      }

      .vf-alert.ok {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #86efac;
      }

      .vf-alert.error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }

      .vf-fade-slide {
        animation: vfEnter .55s cubic-bezier(.22,.75,.2,1) both;
      }

      @keyframes vfEnter {
        from { opacity: 0; transform: translateX(42px); }
        to { opacity: 1; transform: translateX(0); }
      }

      .vf-start,
      .vf-panel {
        background: #fff;
        border-radius: 12px;
        padding: 28px;
        box-shadow: 0 4px 14px rgba(0,0,0,.10);
      }

      .vf-brand {
        width: 190px;
        height: 74px;
        margin: 0 auto 20px;
        border-radius: 22px;
        background: #e60000;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        font-weight: 800;
        text-transform: lowercase;
      }

      .vf-start h1 {
        text-align: center;
        margin: 0 0 18px;
        color: #444;
        font-size: 23px;
      }

      .vf-phrase {
        max-width: 720px;
        margin: 0 auto 28px;
        background: #fff0f0;
        border: 1px solid #ffcaca;
        color: #b30000;
        border-radius: 14px;
        padding: 16px 20px;
        text-align: center;
        font-weight: 700;
      }

      .vf-ingreso {
        display: grid;
        grid-template-columns: 210px 1fr 160px;
        gap: 18px;
        align-items: end;
      }

      .vf-page label {
        display: block;
        margin-bottom: 6px;
        color: #626262;
        font-size: 14px;
        font-weight: 600;
      }

      .vf-page input,
      .vf-page select,
      .vf-page textarea {
        width: 100%;
        height: 47px;
        border: 1px solid #9ca3af;
        border-radius: 6px;
        background: #fff;
        color: #333;
        padding: 0 12px;
        outline: none;
        font-size: 15px;
      }

      .vf-page input:disabled {
        background: #e5e7eb;
        color: #555;
      }

      .vf-page textarea {
        height: 150px;
        padding: 14px;
        resize: vertical;
      }

      .vf-red-btn,
      .vf-gray-btn {
        border: 0;
        border-radius: 8px;
        height: 47px;
        padding: 0 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        font-weight: 800;
      }

      .vf-red-btn {
        background: #e60000;
        color: #fff;
      }

      .vf-red-btn:hover {
        background: #c90000;
      }

      .vf-gray-btn {
        background: #555;
        color: #fff;
      }

      .vf-red-btn.big,
      .vf-gray-btn.big {
        height: 54px;
        min-width: 170px;
        font-size: 16px;
      }

      .vf-wizard {
        overflow: hidden;
      }

      .vf-stepbar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-bottom: 18px;
      }

      .vf-step-dot {
        background: #fff;
        border-radius: 12px;
        border: 1px solid #d1d5db;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #737373;
        cursor: pointer;
        text-align: left;
      }

      .vf-step-dot span {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
      }

      .vf-step-dot.active {
        border-color: #e60000;
        color: #e60000;
        box-shadow: 0 0 0 2px rgba(230,0,0,.12);
      }

      .vf-step-dot.active span,
      .vf-step-dot.done span {
        background: #e60000;
        color: #fff;
      }

      .vf-step-dot p {
        margin: 0;
        font-weight: 700;
        font-size: 14px;
      }

      .vf-slider {
        width: 100%;
        overflow: hidden;
      }

      .vf-track {
        display: flex;
        width: 400%;
        transition: transform .62s cubic-bezier(.22,.75,.2,1);
        will-change: transform;
      }

      .vf-slide {
        width: 25%;
        flex: 0 0 25%;
        padding-right: 2px;
      }

      .vf-panel h2 {
        color: #e60000;
        font-size: 30px;
        line-height: 1.15;
        margin: 0 0 24px;
        font-weight: 900;
      }

      .vf-panel h3 {
        margin: 0 0 16px;
        font-size: 18px;
        color: #404040;
      }

      .vf-grid {
        display: grid;
        gap: 16px;
      }

      .vf-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
      .vf-grid.cols-6 { grid-template-columns: repeat(6, 1fr); }
      .vf-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
      .vf-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
      .vf-grid .span-2 { grid-column: span 2; }

      .vf-check {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 29px;
        color: #444;
        font-weight: 600;
      }

      .vf-check input {
        width: 18px;
        height: 18px;
      }

      .vf-check.bank {
        margin-top: 0;
        margin-bottom: 20px;
      }

      .vf-address-box {
        margin-top: 24px;
        padding: 18px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: #fafafa;
      }

      .vf-address-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }

      .vf-address-head button,
      .vf-discount button {
        background: #555;
        color: #fff;
        border: 0;
        border-radius: 8px;
        height: 42px;
        padding: 0 16px;
        font-weight: 800;
        cursor: pointer;
      }

      .vf-actions {
        margin-top: 28px;
        display: flex;
        gap: 14px;
      }

      .vf-actions.right {
        justify-content: flex-end;
      }

      .vf-actions.split {
        justify-content: space-between;
      }

      .vf-actions.span {
        grid-column: 1 / -1;
      }

      .vf-categories {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 46px;
      }

      .vf-category {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .vf-category-box {
        width: 240px;
        height: 300px;
        background: #fff;
        border: 0;
        border-radius: 8px;
        box-shadow: 0 5px 14px rgba(0,0,0,.20);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .vf-category-box p {
        margin: 32px 0 0;
        color: #666;
        font-size: 22px;
      }

      .vf-category > button:last-child {
        width: 240px;
        height: 56px;
        margin-top: 18px;
        border: 0;
        border-radius: 8px;
        background: #e5e5e5;
        color: #555;
        font-size: 19px;
        font-weight: 800;
        cursor: pointer;
      }

      .vf-category > button.red {
        background: #e60000;
        color: #fff;
      }

      .vf-back-round {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 0;
        background: #555;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 22px;
        cursor: pointer;
      }

      .vf-product-grid {
        display: grid;
        gap: 26px;
      }

      .vf-product-grid.two {
        grid-template-columns: repeat(2, 1fr);
      }

      .vf-product-grid.three {
        grid-template-columns: repeat(3, 1fr);
      }

      .vf-product-card,
      .vf-tv-card {
        min-height: 178px;
        background: #fff;
        border: 0;
        border-radius: 8px;
        box-shadow: 0 5px 14px rgba(0,0,0,.20);
        padding: 26px;
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 26px;
        align-items: center;
        text-align: left;
        cursor: pointer;
      }

      .vf-product-card.active,
      .vf-tv-card.active {
        box-shadow: 0 0 0 3px #e60000, 0 5px 14px rgba(0,0,0,.20);
      }

      .vf-card-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #d1d5db;
        padding-bottom: 12px;
      }

      .vf-card-title strong {
        color: #555;
        font-size: 25px;
      }

      .vf-card-title.small strong {
        font-size: 16px;
        color: #555;
      }

      .vf-card-content p {
        margin: 14px 0 0;
        color: #777;
        font-size: 18px;
      }

      .vf-card-content p.price {
        color: #111827;
        font-size: 27px;
        font-weight: 900;
      }

      .vf-tv-card {
        min-height: 155px;
        grid-template-columns: 90px 1fr;
        padding: 22px;
      }

      .vf-limit {
        margin: 0 0 18px;
        color: #555;
        font-weight: 800;
      }

      .vf-counter {
        margin-top: 18px;
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .vf-counter button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid #d1d5db;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .vf-counter button.plus {
        background: #008aa6;
        border: 0;
        color: #fff;
      }

      .vf-counter span {
        width: 56px;
        height: 52px;
        border: 1px solid #9ca3af;
        border-radius: 6px;
        color: #444;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .vf-two {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .vf-discount {
        display: grid;
        grid-template-columns: 1fr 170px;
        gap: 14px;
      }

      .vf-subtitle {
        margin-top: 28px !important;
        text-transform: uppercase;
      }

      .vf-invoices {
        display: flex;
        gap: 26px;
      }

      .vf-invoice {
        width: 220px;
        min-height: 150px;
        background: #fff;
        border: 1px solid #d1d5db;
        border-radius: 12px;
        padding: 18px;
        text-align: left;
        cursor: pointer;
      }

      .vf-invoice.active {
        border-color: #008f8f;
        background: #ecfeff;
      }

      .vf-radio-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .vf-radio-row span {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid #008f8f;
        background: #008f8f;
      }

      .vf-radio-row strong {
        color: #333;
        font-size: 17px;
      }

      .vf-invoice p {
        margin: 16px 0 0;
        color: #008f8f;
        font-size: 13px;
        line-height: 1.5;
      }

      .top {
        margin-top: 16px;
      }

      .vf-invoice-text {
        margin: 22px 0 0;
        color: #333;
        font-size: 20px;
      }

      .vf-complement-title {
        background: #e60000;
        color: white;
        border-radius: 18px;
        padding: 30px;
        text-align: center;
        font-size: 34px;
        font-weight: 800;
        margin-bottom: 22px;
      }

      .vf-summary {
        margin-top: 18px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: #fafafa;
        padding: 16px;
      }

      .vf-summary p {
        margin: 8px 0 0;
        color: #555;
      }

      .vf-image-wrap {
        width: 105px;
        height: 105px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .vf-image-wrap img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        position: absolute;
        z-index: 2;
      }

      .vf-icon {
        width: 105px;
        height: 105px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .vf-icon.fibra .router {
        width: 82px;
        height: 45px;
        background: #e60000;
        border-radius: 8px;
        position: absolute;
        bottom: 5px;
      }

      .vf-icon.fibra .router:before,
      .vf-icon.fibra .router:after {
        content: "";
        position: absolute;
        width: 7px;
        height: 7px;
        background: white;
        border-radius: 50%;
        bottom: 12px;
      }

      .vf-icon.fibra .router:before { left: 18px; }
      .vf-icon.fibra .router:after { right: 18px; }

      .vf-icon.fibra .wifi {
        position: absolute;
        border: 5px solid #e60000;
        border-bottom: 0;
        border-left-color: transparent;
        border-right-color: transparent;
        border-radius: 90px 90px 0 0;
      }

      .vf-icon.fibra .wifi.a {
        width: 78px;
        height: 38px;
        top: 2px;
      }

      .vf-icon.fibra .wifi.b {
        width: 48px;
        height: 24px;
        top: 20px;
      }

      .vf-icon.fibra .dot {
        width: 12px;
        height: 12px;
        background: #e60000;
        border-radius: 50%;
        position: absolute;
        top: 46px;
      }

      .vf-icon.phone {
        width: 70px;
        height: 110px;
        border-radius: 16px;
        border: 8px solid #e60000;
        background: white;
      }

      .vf-icon.phone span {
        width: 22px;
        height: 5px;
        background: #e60000;
        border-radius: 10px;
        position: absolute;
        bottom: 12px;
      }

      .vf-icon.tv div {
        width: 100px;
        height: 65px;
        border: 7px solid #e60000;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e60000;
        font-weight: 900;
        font-size: 24px;
      }

      .vf-icon.tv span {
        position: absolute;
        bottom: 2px;
        width: 60px;
        height: 8px;
        background: #e60000;
        border-radius: 10px;
      }

      @media (max-width: 980px) {
        .vf-ingreso,
        .vf-grid.cols-4,
        .vf-grid.cols-6,
        .vf-grid.cols-3,
        .vf-grid.cols-2,
        .vf-categories,
        .vf-product-grid.two,
        .vf-product-grid.three,
        .vf-two,
        .vf-stepbar {
          grid-template-columns: 1fr;
        }

        .vf-track {
          width: 400%;
        }

        .vf-slide {
          width: 25%;
          flex-basis: 25%;
        }

        .vf-category-box,
        .vf-category > button:last-child {
          width: 100%;
          max-width: 330px;
        }

        .vf-actions.split {
          flex-direction: column;
        }
      }
    `}</style>
  );
}
