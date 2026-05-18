"use client";

export function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < value ? "text-yellow-400" : "text-gray-200"}>
          ★
        </span>
      ))}
    </div>
  );
}
