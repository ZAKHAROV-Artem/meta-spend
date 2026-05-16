export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #fff8f2 0%, #fef3e8 50%, #fff 100%)' }}
    >
      {children}
    </div>
  );
}
