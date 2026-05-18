export function Avatar({ src, name, size = 32 }: { src?: string; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} width={size} height={size} className="rounded-full" />;
  return (
    <div
      className="rounded-full bg-primary flex items-center justify-center text-white font-medium"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
