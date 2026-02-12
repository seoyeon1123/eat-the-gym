"use client";

import { ChevronRight } from "lucide-react";

interface HeroSectionProps {
  onStart: () => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden px-6 pb-10 pt-12 safe-bottom">
      {/* Background Glow Effects - 중립 톤으로 은은하게 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/10 blur-[140px]" />
        <div className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 translate-x-1/4 rounded-full bg-foreground/5 blur-[110px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/4 rounded-full bg-foreground/5 blur-[90px]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10">
        {/* Logo */}
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-foreground/15 blur-3xl" />
          <div className="relative flex items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-background via-background to-background p-6 sm:p-8 ring-1 ring-border/60 shadow-[0_18px_55px_rgba(0,0,0,0.6)]">
            <img
              src="/logo.png"
              alt="헬스장 파먹기 로고"
              className="h-40 w-40 sm:h-48 sm:w-48 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            />
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            <span className="text-balance">
              {"헬스장 "}
              <span className="text-primary">{"파먹기"}</span>
            </span>
          </h1>
          <p className="max-w-sm text-balance text-lg leading-relaxed text-muted-foreground">
            내 헬스장 기구에 맞춘{" "}
            <span className="font-semibold text-foreground">맞춤 루틴</span>
            <br />
            <span className="text-muted-foreground">생각 없이 운동하세요</span>
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {["기구 기반 루틴", "분할 자동 배분", "AI 맞춤 생성"].map((f) => (
            <span
              key={f}
              className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm ring-1 ring-border/40"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={onStart}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-foreground py-4.5 text-base font-bold text-background shadow-[0_0_30px_rgba(0,0,0,0.35)] transition-all active:scale-[0.98] active:shadow-[0_0_18px_rgba(0,0,0,0.4)]"
        >
          <span className="relative z-10">시작하기</span>
          <ChevronRight className="relative z-10 h-5 w-5 transition-transform group-active:translate-x-0.5" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
        <p className="text-center text-xs text-muted-foreground/70">
          AI가 당신만의 루틴을 생성합니다
        </p>
      </div>
    </div>
  );
}
