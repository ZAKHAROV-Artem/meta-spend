'use client';

import { useState, useEffect, useCallback } from 'react';
import Image, { type StaticImageData } from 'next/image';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Expand,
  LayoutDashboard,
  Plane,
  Settings,
  Tag,
  X,
} from 'lucide-react';

import dashboardDark     from '@/images/dark/dashboard.png';
import transactionsDark  from '@/images/dark/transactions.png';
import tripsDark         from '@/images/dark/trips.png';
import categoriesDark    from '@/images/dark/categories.png';
import settingsDark      from '@/images/dark/settings.png';
import dashboardLight    from '@/images/light/dashboard.png';
import transactionsLight from '@/images/light/transactions.png';
import tripsLight        from '@/images/light/trips.png';
import categoriesLight   from '@/images/light/categories.png';
import settingsLight     from '@/images/light/settings.png';

type TabKey = 'dashboard' | 'transactions' | 'trips' | 'categories' | 'settings';

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  dark: StaticImageData;
  light: StaticImageData;
}

const TABS: Tab[] = [
  { key: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, dark: dashboardDark,    light: dashboardLight    },
  { key: 'transactions', label: 'Transactions', icon: CreditCard,      dark: transactionsDark, light: transactionsLight },
  { key: 'trips',        label: 'Trips',        icon: Plane,           dark: tripsDark,        light: tripsLight        },
  { key: 'categories',   label: 'Categories',   icon: Tag,             dark: categoriesDark,   light: categoriesLight   },
  { key: 'settings',     label: 'Settings',     icon: Settings,        dark: settingsDark,     light: settingsLight     },
];

// ─── Custom cursor ─────────────────────────────────────────────────────────

function ScreenshotCursor({ visible }: { visible: boolean }) {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const smoothX = useSpring(x, { stiffness: 500, damping: 35 });
  const smoothY = useSpring(y, { stiffness: 500, damping: 35 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed z-50 flex items-center justify-center"
      style={{
        left: smoothX,
        top: smoothY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={visible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute h-20 w-20 rounded-full border-2 border-primary/60"
        animate={visible ? { scale: 1 } : { scale: 0.4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      />
      {/* Inner filled circle */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg shadow-primary/30 backdrop-blur-sm">
        <Expand className="h-4 w-4" />
      </div>
    </motion.div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────

function Lightbox({
  open,
  initialTab,
  onClose,
}: {
  open: boolean;
  initialTab: TabKey;
  onClose: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(() => TABS.findIndex((t) => t.key === initialTab));
  const reduced = useReducedMotion();

  // Sync initial tab when lightbox opens
  useEffect(() => {
    if (open) setActiveIdx(TABS.findIndex((t) => t.key === initialTab));
  }, [open, initialTab]);

  const prev = useCallback(() => setActiveIdx((i) => (i - 1 + TABS.length) % TABS.length), []);
  const next = useCallback(() => setActiveIdx((i) => (i + 1) % TABS.length), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, prev, next]);

  const current = TABS[activeIdx];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex h-full flex-col items-center justify-between py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Tab pills */}
          <motion.div
            className="relative z-10 mb-5 flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-muted/50 p-1.5"
            initial={reduced ? false : { y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
            onClick={(e) => e.stopPropagation()}
          >
            {TABS.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = i === activeIdx;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveIdx(i)}
                  className={`relative flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="lightbox-tab-bg"
                      className="absolute inset-0 rounded-xl bg-background shadow-sm ring-1 ring-border/60"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Image + side arrows */}
          <motion.div
            className="relative z-10 flex w-full flex-1 items-stretch gap-3 px-4"
            initial={reduced ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev arrow */}
            <button
              onClick={prev}
              className="flex w-10 shrink-0 cursor-pointer items-center justify-center self-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              style={{ height: 40 }}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Screenshot */}
            <div className="relative flex-1 overflow-hidden rounded-xl border border-border shadow-2xl" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <Image
                    src={current.dark}
                    alt={`${current.label} dark`}
                    className="hidden h-full w-full object-cover object-top dark:block"
                    placeholder="blur"
                    priority
                  />
                  <Image
                    src={current.light}
                    alt={`${current.label} light`}
                    className="block h-full w-full object-cover object-top dark:hidden"
                    placeholder="blur"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next arrow */}
            <button
              onClick={next}
              className="flex w-10 shrink-0 cursor-pointer items-center justify-center self-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              style={{ height: 40 }}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </motion.div>

          {/* Dot indicators */}
          <div className="relative z-10 mt-4 flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {TABS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                  i === activeIdx ? 'w-6 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main section ──────────────────────────────────────────────────────────

export function DashboardPreviewSection() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isHovering, setIsHovering] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const reduced = useReducedMotion();

  const current = TABS.find((t) => t.key === activeTab)!;

  return (
    <>
      <ScreenshotCursor visible={isHovering && !lightboxOpen} />
      <Lightbox open={lightboxOpen} initialTab={activeTab} onClose={() => setLightboxOpen(false)} />

      <section
        className="relative overflow-hidden py-28"
        style={{ background: 'color-mix(in srgb, var(--foreground) 3%, var(--background))' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          {/* Heading */}
          <motion.div
            className="mb-14 text-center"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="mb-3 inline-block font-mono-alt text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              The dashboard
            </span>
            <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Your finances, beautifully visualized
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              A clear, real-time view of where your money goes — organized, categorized, always up to date.
            </p>
          </motion.div>

          {/* Tabs — centered, above the browser frame */}
          <motion.div
            className="mb-6 flex justify-center"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-muted/50 p-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="tab-bg"
                        className="absolute inset-0 rounded-xl bg-background shadow-sm ring-1 ring-border/60"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="relative z-10 h-3.5 w-3.5" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Browser frame */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 48, rotateX: 5 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            style={{ perspective: 1400 }}
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10 ring-1 ring-border/40">
              {/* Browser chrome bar */}
              <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <span className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex flex-1 justify-center">
                  <div className="flex w-72 items-center gap-2 rounded-md bg-background/70 px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border/50">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-green-500/80" />
                    app.metaspend.xyz/{activeTab}
                  </div>
                </div>
              </div>

              {/* Screenshot — clickable with custom cursor */}
              <div
                className="relative max-h-[420px] overflow-hidden bg-background sm:max-h-[560px] lg:max-h-[720px]"
                style={{ cursor: 'none' }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => setLightboxOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <Image
                      src={current.dark}
                      alt={`${current.label} — dark mode`}
                      className="hidden w-full dark:block"
                      priority={activeTab === 'dashboard'}
                      placeholder="blur"
                    />
                    <Image
                      src={current.light}
                      alt={`${current.label} — light mode`}
                      className="block w-full dark:hidden"
                      priority={activeTab === 'dashboard'}
                      placeholder="blur"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Fade bottom edge */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
