"use client";

import { ChevronRight } from "lucide-react";

interface HeroSectionProps {
  onStart: () => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-[#0a0a0a] px-6 pb-10 pt-12 safe-bottom">
      {/* Subtle radial noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Single centered glow — deep, not distracting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12">
        {/* Logo — bare, centered, no card */}
        <div className="relative flex items-center justify-center">
          {/* faint halo behind logo only */}
          <div
            className="absolute h-48 w-48 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 70%)",
            }}
          />
          <img
            src="/logo.png"
            alt="헬스장 파먹기 로고"
            className="relative h-36 w-36 object-contain sm:h-44 sm:w-44"
            style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.7))" }}
          />
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1
            className="text-[3.25rem] font-black tracking-[-0.03em] text-white sm:text-[4rem]"
            style={{ fontFeatureSettings: "'ss01' on" }}
          >
            헬스장{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-primary to-emerald-300 bg-clip-text text-transparent">
              파먹기
            </span>
          </h1>

          <p className="max-w-[17rem] text-[0.9rem] leading-[1.75] text-white/40">
            내 기구에 맞는 루틴,{" "}
            <span className="font-medium text-emerald-200">
              AI가 대신 짜드립니다
            </span>
          </p>
        </div>

        {/* Divider rule */}
        <div className="h-px w-16 bg-white/10 rounded-full" />

        {/* Feature pills — refined, subdued */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["기구 기반 루틴", "분할 자동 배분", "AI 맞춤 생성"].map((f) => (
            <span
              key={f}
              className="rounded-full px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-wide uppercase text-emerald-200/80"
              style={{
                border: "1px solid rgba(16,185,129,0.45)",
                background: "rgba(6,78,59,0.25)",
                letterSpacing: "0.08em",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={onStart}
          className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-primary py-4 text-[0.95rem] font-bold tracking-wide text-primary-foreground  transition-all active:scale-[0.98] active:shadow-[0_8px_26px_rgba(34,197,94,0.4)]"
        >
          <span className="relative z-10">시작하기</span>
          <ChevronRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        <p className="text-center text-[0.7rem] tracking-wide text-white/20">
          AI가 당신만의 루틴을 생성합니다
        </p>
      </div>
    </div>
  );
}
