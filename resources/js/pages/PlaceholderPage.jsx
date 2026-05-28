

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="text-2xl font-semibold mt-1">{title}</h2>
      <p className="text-slate-300 mt-2">{description}</p>
    </div>
  );
}
