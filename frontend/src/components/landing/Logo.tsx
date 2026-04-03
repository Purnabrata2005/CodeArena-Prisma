export default function Logo({ w, h }: { w?: number; h?: number }) {
  return (
    <img
      src="/logo.svg"
      width={w ?? 30}
      height={h ?? 13}
      alt="Logo"
      className="rounded"
    />
  );
}
