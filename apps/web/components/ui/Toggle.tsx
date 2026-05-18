"use client";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-gray-300"}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
