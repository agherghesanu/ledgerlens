export function Chip({ label, variant = "default" }: { label: string; variant?: "default" | "success" | "warn" | "error" }) {
  const colors = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warn: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>
      {label}
    </span>
  );
}
