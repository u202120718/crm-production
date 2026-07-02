import { useMemo, useState } from "react";
import {
  Search,
  Save,
  ChevronLeft,
  ChevronDown,
  Plus,
  Minus,
  CreditCard,
  FileText,
} from "lucide-react";

const DOCS = ["N.I.F.", "N.I.E.", "C.I.F.", "PASAPORTE"];
const SEGMENTOS = ["PARTICULAR", "MICRO"];
const SFIDS = ["ESPC0231", "ESPC0450", "ESPC1088"];

const FRASES = [
  "Hoy puede ser tu mejor día de ventas.",
  "Una ficha bien cargada protege una buena venta.",
  "Cada gestión correcta te acerca al objetivo.",
  "Vender también es ordenar bien la información.",
];

const FIBRAS = [
  { title: "Fibra 600 Mb", sub: "600 MB" },
  { title: "Fibra 1 Gb", sub: "1 GB" },
  { title: "Fibra 600 Mb", sub: "600 MB NEBA" },
  { title: "Fibra 1 Gb", sub: "1 GB NEBA" },
];

const MOVILES = [
  { key: "movil30", title: "Móvil 30GB" },
  { key: "movil60", title: "Móvil 60GB" },
  { key: "movil160", title: "Móvil 160GB" },
  { key: "movilIlimitada", title: "Móvil Ilimitada" },
];

const TV = [
  ["Vodafone TV con HBO Max", "11,00 € / mes"],
  ["Disney+ Estándar con Anuncios", "6,99 € / mes"],
  ["TV con Disney+ Estándar", "12,00 € / mes"],
  ["Netflix Estándar con anuncios", "8,99 € / mes"],
  ["Netflix Estándar", "14,99 € / mes"],
  ["Netflix Premium", "21,99 € / mes"],
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
].map(([title, price], i) => ({ key: `tv_${i}`, title, price }));

const emptyForm = {
  sfid: "ESPC0231",
  tipoDocumento: "N.I.F.",
  dni: "",
  nombre: "",
  apellidos: "",
  email: "",
  movil: "",
  fijo: "",
  adicional: "",
  nacimiento: "",
  segmento: "PARTICULAR",
  sinMovil: false,
  direccion: "",
  fibra: "",
  promocion: "",
  factura: "Factura electrónica",
  mismoTitular: false,
  bancoNombre: "",
  bancoApellido1: "",
  bancoApellido2: "",
  bancoTipoDocumento: "N.I.F.",
  bancoDocumento: "",
  iban: "",
  complementarios: "",
};

export default function FichasVenta({ setVentas, currentUser }) {
  const [form, setForm] = useState(emptyForm);
  const [dniInput, setDniInput] = useState("");
  const [iniciado, setIniciado] = useState(false);
  const [vista, setVista] = useState("menu");
  const [moviles, setMoviles] = useState({
    movil30: 0,
    movil60: 0,
    movil160: 0,
    movilIlimitada: 0,
  });
  const [tv, setTv] = useState([]);
  const [ok, setOk] = useState("");

  const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);

  const totalMoviles = Object.values(moviles).reduce((a, b) => a + b, 0);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const ingresar = () => {
    const clean = dniInput.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9);
    if (!clean) return;
    set("dni", clean);
    setDniInput(clean);
    setIniciado(true);
  };

  const changeMovil = (key, op) => {
    setMoviles((p) => {
      const current = p[key] || 0;
      if (op === "plus") {
        if (totalMoviles >= 10) return p;
        return { ...p, [key]: current + 1 };
      }
      return { ...p, [key]: Math.max(0, current - 1) };
    });
  };

  const toggleTv = (key) => {
    setTv((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
  };

  const producto = useMemo(() => {
    const arr = [];
    if (form.fibra) arr.push(form.fibra);
    MOVILES.forEach((m) => {
      if (moviles[m.key]) arr.push(`${m.title} x${moviles[m.key]}`);
    });
    TV.forEach((t) => {
      if (tv.includes(t.key)) arr.push(t.title);
    });
    return arr.join(" + ");
  }, [form.fibra, moviles, tv]);

  const guardar = () => {
    const venta = {
      id: Date.now(),
      campana: "VODAFONE",
      cliente: `${form.nombre} ${form.apellidos}`.trim(),
      documento: form.dni,
      telefono: form.movil || form.fijo,
      comercial: currentUser?.nombre || currentUser?.name || "",
      producto,
      estado: "Pendiente",
      fecha: new Date().toLocaleDateString(),
      hora: new Date().toLocaleTimeString(),
      ficha: { ...form, moviles, tv },
    };

    setVentas?.((prev) => [venta, ...(prev || [])]);
    setOk("Ficha Vodafone guardada correctamente.");
  };

  return (
    <div className="vf-page">
      <Style />

      <div className="vf-wrap">
        {ok && <div className="vf-ok">{ok}</div>}

        {!iniciado && (
          <div className="vf-start">
            <div className="vf-logo-big">vodafone</div>

            <h1>Bienvenido al configurador de oferta Vodafone</h1>

            <div className="vf-frase">{frase}</div>

            <div className="vf-search-row">
              <div>
                <label>Tipo documento</label>
                <select value={form.tipoDocumento} onChange={(e) => set("tipoDocumento", e.target.value)}>
                  {DOCS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Nº Documento</label>
                <input
                  value={dniInput}
                  onChange={(e) =>
                    setDniInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9))
                  }
                  placeholder="Nº DOCUMENTO"
                />
              </div>

              <button onClick={ingresar}>
                <Search size={18} />
                Ingresar
              </button>
            </div>
          </div>
        )}

        {iniciado && (
          <>
            <section className="vf-panel">
              <h2>Editar datos de cliente</h2>

              <div className="vf-grid vf-grid-4">
                <FieldSelect label="Tipo de documento" value={form.tipoDocumento} onChange={(v) => set("tipoDocumento", v)} options={DOCS} />
                <Field label="NIF" value={form.dni} disabled />
                <Field label="Nombre" value={form.nombre} onChange={(v) => set("nombre", v)} />
                <Field label="Apellidos" value={form.apellidos} onChange={(v) => set("apellidos", v)} />
                <Field label="Email" value={form.email} onChange={(v) => set("email", v)} />
                <Field label="Tlf Móvil Comunicaciones" value={form.movil} onChange={(v) => set("movil", v.replace(/\D/g, "").slice(0, 9))} />
                <Field label="Tlf Fijo Contacto" value={form.fijo} onChange={(v) => set("fijo", v.replace(/\D/g, "").slice(0, 9))} />
                <Field label="Tlf. Contacto Adicional" value={form.adicional} onChange={(v) => set("adicional", v.replace(/\D/g, "").slice(0, 9))} />
                <Field label="Fecha de Nacimiento" type="date" value={form.nacimiento} onChange={(v) => set("nacimiento", v)} />
                <FieldSelect label="Segmento Vodafone" value={form.segmento} onChange={(v) => set("segmento", v)} options={SEGMENTOS} />

                <label className="vf-check">
                  <input type="checkbox" checked={form.sinMovil} onChange={(e) => set("sinMovil", e.target.checked)} />
                  No tiene teléfono móvil
                </label>
              </div>
            </section>

            <section className="vf-panel">
              <div className="vf-address-head">
                <h3>Seleccione la Dirección</h3>
                <button>Añadir dirección</button>
              </div>

              <input
                className="vf-address"
                value={form.direccion}
                onChange={(e) => set("direccion", e.target.value)}
                placeholder="Dirección completa del cliente"
              />
            </section>

            <section className="vf-panel">
              <h2>Configurador de Ofertas | ONE</h2>

              {vista === "menu" && (
                <div className="vf-cards-3">
                  <Category
                    type="fibra"
                    title="Fibra + Fijo"
                    button="Seleccionar"
                    red
                    onClick={() => setVista("fibra")}
                  />
                  <Category
                    type="movil"
                    title="Línea móvil"
                    button="Seleccionar Fibra + Fijo"
                    onClick={() => setVista("movil")}
                  />
                  <Category
                    type="tv"
                    title="Vodafone TV"
                    button="Seleccionar TV"
                    onClick={() => setVista("tv")}
                  />
                </div>
              )}

              {vista === "fibra" && (
                <>
                  <Back onClick={() => setVista("menu")} />
                  <div className="vf-products vf-products-2">
                    {FIBRAS.map((f) => (
                      <Product
                        key={f.sub}
                        title={f.title}
                        sub={f.sub}
                        type="fibra"
                        active={form.fibra === f.sub}
                        onClick={() => set("fibra", f.sub)}
                      />
                    ))}
                  </div>
                </>
              )}

              {vista === "movil" && (
                <>
                  <Back onClick={() => setVista("menu")} />
                  <p className="vf-limit">Móviles seleccionados: {totalMoviles}/10</p>

                  <div className="vf-products vf-products-2">
                    {MOVILES.map((m) => (
                      <Mobile
                        key={m.key}
                        title={m.title}
                        qty={moviles[m.key]}
                        onMinus={() => changeMovil(m.key, "minus")}
                        onPlus={() => changeMovil(m.key, "plus")}
                      />
                    ))}
                  </div>
                </>
              )}

              {vista === "tv" && (
                <>
                  <Back onClick={() => setVista("menu")} />
                  <div className="vf-products vf-products-3">
                    {TV.map((t) => (
                      <TvCard
                        key={t.key}
                        item={t}
                        active={tv.includes(t.key)}
                        onClick={() => toggleTv(t.key)}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="vf-two">
              <div className="vf-panel">
                <h3>¡Promoción disponible!</h3>

                <div className="vf-discount">
                  <input
                    value={form.promocion}
                    onChange={(e) => set("promocion", e.target.value)}
                    placeholder="T&P + Resto Promos Comp (-14,01 €)"
                  />
                  <button>Aplicar descuento</button>
                </div>

                <h3 className="vf-mt">Tipo de facturación</h3>

                <div className="vf-invoice-row">
                  <Invoice
                    title="Factura electrónica"
                    active={form.factura === "Factura electrónica"}
                    onClick={() => set("factura", "Factura electrónica")}
                  />
                  <Invoice
                    title="Factura en papel"
                    active={form.factura === "Factura en papel"}
                    onClick={() => set("factura", "Factura en papel")}
                  />
                </div>
              </div>

              <div className="vf-panel">
                <h2>Datos bancarios</h2>

                <label className="vf-check vf-check-bank">
                  <input
                    type="checkbox"
                    checked={form.mismoTitular}
                    onChange={(e) => set("mismoTitular", e.target.checked)}
                  />
                  Mismo titular
                </label>

                <div className="vf-grid vf-grid-3">
                  <Field placeholder="Nombre" value={form.bancoNombre} onChange={(v) => set("bancoNombre", v)} />
                  <Field placeholder="Primer apellido" value={form.bancoApellido1} onChange={(v) => set("bancoApellido1", v)} />
                  <Field placeholder="Segundo apellido" value={form.bancoApellido2} onChange={(v) => set("bancoApellido2", v)} />
                </div>

                <div className="vf-grid vf-grid-2 vf-gap-top">
                  <FieldSelect value={form.bancoTipoDocumento} onChange={(v) => set("bancoTipoDocumento", v)} options={DOCS} />
                  <Field placeholder="Nº DOCUMENTO" value={form.bancoDocumento} onChange={(v) => set("bancoDocumento", v)} />
                </div>

                <div className="vf-gap-top">
                  <Field
                    placeholder="IBAN de la cuenta"
                    value={form.iban}
                    onChange={(v) => set("iban", v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24))}
                  />
                </div>

                <p className="vf-factura-text">Tipo de factura: {form.factura.replace("Factura ", "")}</p>
              </div>
            </section>

            <section className="vf-panel">
              <div className="vf-complement-title">Datos complementarios</div>

              <textarea
                value={form.complementarios}
                onChange={(e) => set("complementarios", e.target.value)}
                placeholder="Observaciones / datos complementarios"
              />
            </section>

            <div className="vf-save-row">
              <button onClick={guardar}>
                <Save size={20} />
                Guardar ficha Vodafone
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text", disabled = false }) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input
        type={type}
        value={value || ""}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options = [] }) {
  return (
    <div>
      {label && <label>{label}</label>}
      <select value={value || ""} onChange={(e) => onChange?.(e.target.value)}>
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </div>
  );
}

function Back({ onClick }) {
  return (
    <button className="vf-back" onClick={onClick}>
      <ChevronLeft size={26} />
    </button>
  );
}

function VodafoneIcon({ type }) {
  if (type === "fibra") {
    return (
      <div className="vf-icon vf-icon-fibra">
        <div className="vf-router"></div>
        <div className="vf-wifi a"></div>
        <div className="vf-wifi b"></div>
        <div className="vf-dot"></div>
      </div>
    );
  }

  if (type === "movil") {
    return (
      <div className="vf-phone">
        <div></div>
      </div>
    );
  }

  return (
    <div className="vf-tv">
      <div className="vf-tv-screen">TV</div>
      <div className="vf-tv-base"></div>
    </div>
  );
}

function Category({ type, title, button, red, onClick }) {
  return (
    <div className="vf-category">
      <div className="vf-category-box">
        <VodafoneIcon type={type} />
        <p>{title}</p>
      </div>
      <button className={red ? "red" : ""} onClick={onClick}>
        {button}
      </button>
    </div>
  );
}

function Product({ title, sub, type, active, onClick }) {
  return (
    <button className={`vf-product ${active ? "active" : ""}`} onClick={onClick}>
      <VodafoneIcon type={type} />
      <div>
        <div className="vf-product-title">
          <strong>{title}</strong>
          <ChevronDown size={30} />
        </div>
        <p>{sub}</p>
      </div>
    </button>
  );
}

function Mobile({ title, qty, onMinus, onPlus }) {
  return (
    <div className="vf-product vf-mobile-card">
      <VodafoneIcon type="movil" />
      <div>
        <div className="vf-product-title">
          <strong>{title}</strong>
          <ChevronDown size={30} />
        </div>

        <div className="vf-counter">
          <button onClick={onMinus}>
            <Minus size={18} />
          </button>
          <span>{qty}</span>
          <button className="plus" onClick={onPlus}>
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TvCard({ item, active, onClick }) {
  return (
    <button className={`vf-tv-card ${active ? "active" : ""}`} onClick={onClick}>
      <VodafoneIcon type="tv" />

      <div>
        <div className="vf-product-title">
          <strong>{item.title}</strong>
          <ChevronDown size={20} />
        </div>
        <p>{item.price}</p>
      </div>
    </button>
  );
}

function Invoice({ title, active, onClick }) {
  return (
    <button className={`vf-invoice ${active ? "active" : ""}`} onClick={onClick}>
      <div>
        <span />
        <strong>{title}</strong>
      </div>

      {active && (
        <p>
          Para seguir con la contratación, verifica con el cliente que está de acuerdo
          con que Vodafone le envíe la factura por vía electrónica.
        </p>
      )}
    </button>
  );
}

function Style() {
  return (
    <style>{`
      .vf-page {
        min-height: 100vh;
        background: #f1f1f1;
        padding: 24px;
        color: #3b3b3b;
        font-family: Arial, Helvetica, sans-serif;
      }

      .vf-wrap {
        max-width: 1240px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .vf-ok {
        background: #dcfce7;
        border: 1px solid #86efac;
        color: #166534;
        padding: 14px 18px;
        border-radius: 12px;
      }

      .vf-start,
      .vf-panel {
        background: #fff;
        border-radius: 12px;
        padding: 28px;
        box-shadow: 0 2px 12px rgba(0,0,0,.08);
      }

      .vf-logo-big {
        margin: 0 auto 20px;
        width: 180px;
        height: 70px;
        background: #e60000;
        border-radius: 20px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 700;
        text-transform: lowercase;
      }

      .vf-start h1 {
        text-align: center;
        font-size: 22px;
        color: #444;
        margin-bottom: 20px;
      }

      .vf-frase {
        background: #fff0f0;
        border: 1px solid #ffc9c9;
        color: #b30000;
        padding: 16px;
        border-radius: 12px;
        text-align: center;
        margin-bottom: 28px;
        font-weight: 600;
      }

      .vf-search-row {
        display: grid;
        grid-template-columns: 190px 1fr 150px;
        gap: 18px;
        align-items: end;
      }

      label {
        display: block;
        font-size: 14px;
        color: #666;
        margin-bottom: 6px;
      }

      input,
      select,
      textarea {
        width: 100%;
        height: 46px;
        border: 1px solid #9ca3af;
        border-radius: 6px;
        padding: 0 12px;
        background: #fff;
        color: #333;
        outline: none;
        font-size: 15px;
      }

      input:disabled {
        background: #e5e7eb;
        color: #555;
      }

      textarea {
        min-height: 130px;
        padding: 14px;
        resize: vertical;
      }

      .vf-search-row button,
      .vf-save-row button {
        height: 46px;
        border: 0;
        border-radius: 8px;
        background: #e60000;
        color: #fff;
        font-weight: 700;
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .vf-panel h2 {
        font-size: 30px;
        color: #e60000;
        margin: 0 0 24px;
        font-weight: 800;
      }

      .vf-panel h3 {
        font-size: 18px;
        margin: 0 0 16px;
        color: #404040;
      }

      .vf-grid {
        display: grid;
        gap: 16px;
      }

      .vf-grid-4 {
        grid-template-columns: repeat(4, 1fr);
      }

      .vf-grid-3 {
        grid-template-columns: repeat(3, 1fr);
      }

      .vf-grid-2 {
        grid-template-columns: repeat(2, 1fr);
      }

      .vf-check {
        margin-top: 29px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #444;
      }

      .vf-check input {
        width: 18px;
        height: 18px;
      }

      .vf-check-bank {
        margin-top: 0;
        margin-bottom: 22px;
      }

      .vf-address-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }

      .vf-address-head button {
        background: #555;
        color: #fff;
        border: 0;
        border-radius: 8px;
        padding: 10px 16px;
        cursor: pointer;
      }

      .vf-address {
        height: 48px;
      }

      .vf-cards-3 {
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
        border-radius: 8px;
        box-shadow: 0 5px 14px rgba(0,0,0,.18);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .vf-category-box p {
        font-size: 22px;
        color: #666;
        margin-top: 34px;
      }

      .vf-category button {
        width: 240px;
        height: 56px;
        margin-top: 18px;
        border-radius: 8px;
        border: 0;
        background: #e5e5e5;
        color: #555;
        font-size: 19px;
        font-weight: 700;
        cursor: pointer;
      }

      .vf-category button.red {
        background: #e60000;
        color: white;
      }

      .vf-back {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #555;
        color: #fff;
        border: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 22px;
        cursor: pointer;
      }

      .vf-products {
        display: grid;
        gap: 26px;
      }

      .vf-products-2 {
        grid-template-columns: repeat(2, 1fr);
      }

      .vf-products-3 {
        grid-template-columns: repeat(3, 1fr);
      }

      .vf-product,
      .vf-tv-card {
        min-height: 178px;
        background: #fff;
        border: 0;
        border-radius: 8px;
        box-shadow: 0 5px 14px rgba(0,0,0,.18);
        padding: 28px;
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 26px;
        align-items: center;
        text-align: left;
        cursor: pointer;
      }

      .vf-product.active,
      .vf-tv-card.active {
        box-shadow: 0 0 0 3px #e60000, 0 5px 14px rgba(0,0,0,.18);
      }

      .vf-product-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #d1d5db;
        padding-bottom: 12px;
        color: #555;
      }

      .vf-product-title strong {
        font-size: 25px;
        color: #4b5563;
      }

      .vf-product p {
        margin: 14px 0 0;
        color: #777;
        font-size: 18px;
      }

      .vf-tv-card {
        min-height: 155px;
        grid-template-columns: 90px 1fr;
        padding: 22px;
      }

      .vf-tv-card .vf-product-title strong {
        font-size: 16px;
        color: #555;
      }

      .vf-tv-card p {
        margin: 10px 0 0;
        font-size: 28px;
        font-weight: 800;
        color: #111827;
      }

      .vf-limit {
        margin-bottom: 18px;
        color: #555;
        font-weight: 700;
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
        color: white;
        border: 0;
      }

      .vf-counter span {
        width: 56px;
        height: 52px;
        border: 1px solid #9ca3af;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #444;
      }

      .vf-two {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .vf-discount {
        display: grid;
        grid-template-columns: 1fr 160px;
        gap: 14px;
      }

      .vf-discount button {
        background: #555;
        color: white;
        border: 0;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
      }

      .vf-mt {
        margin-top: 28px !important;
        text-transform: uppercase;
      }

      .vf-invoice-row {
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

      .vf-invoice div {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .vf-invoice span {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid #008f8f;
        background: #008f8f;
      }

      .vf-invoice strong {
        font-size: 17px;
        color: #333;
      }

      .vf-invoice p {
        margin-top: 16px;
        color: #008f8f;
        font-size: 13px;
        line-height: 1.5;
      }

      .vf-gap-top {
        margin-top: 16px;
      }

      .vf-factura-text {
        margin-top: 22px;
        font-size: 20px;
        color: #333;
      }

      .vf-complement-title {
        background: #e60000;
        color: white;
        border-radius: 18px;
        padding: 30px;
        text-align: center;
        font-size: 34px;
        font-weight: 700;
        margin-bottom: 22px;
      }

      .vf-save-row {
        display: flex;
        justify-content: flex-end;
      }

      .vf-save-row button {
        width: 260px;
        height: 56px;
      }

      .vf-icon-fibra,
      .vf-phone,
      .vf-tv {
        width: 95px;
        height: 95px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .vf-router {
        width: 82px;
        height: 45px;
        background: #e60000;
        border-radius: 8px;
        position: absolute;
        bottom: 5px;
      }

      .vf-router:before,
      .vf-router:after {
        content: "";
        position: absolute;
        width: 7px;
        height: 7px;
        background: white;
        border-radius: 50%;
        bottom: 12px;
      }

      .vf-router:before { left: 18px; }
      .vf-router:after { right: 18px; }

      .vf-wifi {
        position: absolute;
        border: 5px solid #e60000;
        border-bottom: 0;
        border-left-color: transparent;
        border-right-color: transparent;
        border-radius: 90px 90px 0 0;
      }

      .vf-wifi.a {
        width: 78px;
        height: 38px;
        top: 2px;
      }

      .vf-wifi.b {
        width: 48px;
        height: 24px;
        top: 20px;
      }

      .vf-dot {
        width: 12px;
        height: 12px;
        background: #e60000;
        border-radius: 50%;
        position: absolute;
        top: 46px;
      }

      .vf-phone {
        width: 70px;
        height: 110px;
        border-radius: 16px;
        border: 8px solid #e60000;
        background: white;
      }

      .vf-phone div {
        width: 22px;
        height: 5px;
        background: #e60000;
        border-radius: 10px;
        position: absolute;
        bottom: 12px;
      }

      .vf-tv-screen {
        width: 100px;
        height: 65px;
        border: 7px solid #e60000;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e60000;
        font-weight: 800;
        font-size: 24px;
      }

      .vf-tv-base {
        position: absolute;
        bottom: 2px;
        width: 60px;
        height: 8px;
        background: #e60000;
        border-radius: 10px;
      }

      @media (max-width: 900px) {
        .vf-search-row,
        .vf-grid-4,
        .vf-grid-3,
        .vf-grid-2,
        .vf-cards-3,
        .vf-products-2,
        .vf-products-3,
        .vf-two {
          grid-template-columns: 1fr;
        }

        .vf-category-box,
        .vf-category button {
          width: 100%;
          max-width: 320px;
        }
      }
    `}</style>
  );
}
