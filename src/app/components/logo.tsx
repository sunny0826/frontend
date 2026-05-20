export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="OpenShare"
      className={className}
      draggable={false}
    />
  );
}
