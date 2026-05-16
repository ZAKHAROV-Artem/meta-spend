export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex items-center justify-center gap-2">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'linear-gradient(135deg, #F6851B, #E2761B)' }}
        >
          🦊
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">MetaSpend</span>
      </div>
      <div className="rounded-2xl border bg-card shadow-lg p-8">{children}</div>
    </div>
  );
}
