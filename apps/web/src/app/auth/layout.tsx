export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center px-4 py-12">
      {/* auth-blob-*: same atmospheric pattern as HeroSection, dark-mode-aware */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="auth-blob-orange" cx="75%" cy="15%" r="55%">
            <stop offset="0%" stopColor="#F6851B" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F6851B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="auth-blob-amber" cx="25%" cy="85%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-blob-orange)" />
        <rect width="100%" height="100%" fill="url(#auth-blob-amber)" />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
