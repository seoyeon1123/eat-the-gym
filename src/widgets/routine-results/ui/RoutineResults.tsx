"use client";

import { cn } from "@/shared/lib";
import {
  Copy,
  RotateCcw,
  Check,
  Loader2,
  Timer,
  Repeat,
  Share2,
} from "lucide-react";
import { useState, useEffect } from "react";

// 카카오톡 SDK 타입 정의
declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: {
          objectType: string;
          text?: string;
          content?: {
            title: string;
            description: string;
            imageUrl: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          };
          link?: {
            mobileWebUrl: string;
            webUrl: string;
          };
        }) => void;
      };
    };
  }
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: string;
  type?: string; // 머신/바벨/덤벨
}

export interface DayRoutine {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface RoutineData {
  routineName: string;
  description: string;
  days: DayRoutine[];
  tips: string[];
}

interface RoutineResultsProps {
  routine: RoutineData | null;
  isLoading: boolean;
  error?: string | null;
  onReset: () => void;
}

function ExerciseRow({
  exercise,
  index,
}: {
  exercise: Exercise;
  index: number;
}) {
  // 운동 이름에서 타입 추출 (예: "벤치프레스 (바벨)" -> "벤치프레스", "바벨")
  const extractType = (name: string): { name: string; type: string | null } => {
    const match = name.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (match) {
      return { name: match[1].trim(), type: match[2].trim() };
    }
    return { name, type: null };
  };

  const { name: exerciseName, type } = extractType(exercise.name);
  const displayType = type || exercise.type;

  const typeLabels: Record<string, string> = {
    머신: "머신",
    바벨: "바벨",
    덤벨: "덤벨",
    machine: "머신",
    barbell: "바벨",
    dumbbell: "덤벨",
  };

  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-[11px] font-bold text-muted-foreground">
        {index + 1}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{exerciseName}</p>
          {displayType && (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {typeLabels[displayType] || displayType}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Repeat className="h-3 w-3" />
          {exercise.sets}x{exercise.reps}
        </span>
        <span className="flex items-center gap-1">
          <Timer className="h-3 w-3" />
          {exercise.rest}
        </span>
      </div>
    </div>
  );
}

function DayCard({
  dayRoutine,
  index,
}: {
  dayRoutine: DayRoutine;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `${dayRoutine.day} - ${
      dayRoutine.focus
    }\n${dayRoutine.exercises
      .map((e) => `${e.name} ${e.sets}x${e.reps} (${e.rest})`)
      .join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dayColors = [
    "from-primary/15 to-primary/5",
    "from-primary/10 to-transparent",
    "from-primary/8 to-transparent",
    "from-primary/6 to-transparent",
    "from-primary/5 to-transparent",
  ];

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      {/* Day header with gradient */}
      <div
        className={cn(
          "flex items-center justify-between bg-gradient-to-r px-4 py-3",
          dayColors[index % dayColors.length]
        )}
      >
        <div>
          <h3 className="text-[15px] font-bold text-foreground">
            {dayRoutine.day}
          </h3>
          <p className="text-xs font-medium text-primary">{dayRoutine.focus}</p>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded-lg bg-background/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-primary" />
              <span className="text-primary">복사됨</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              복사
            </>
          )}
        </button>
      </div>

      {/* Exercise list */}
      <div className="flex flex-col divide-y divide-border/50 px-3 py-1">
        {dayRoutine.exercises.map((exercise, i) => (
          <ExerciseRow key={i} exercise={exercise} index={i} />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/50 px-4 py-2.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          {dayRoutine.exercises.length}개 운동
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          총 {dayRoutine.exercises.reduce((acc, e) => acc + e.sets, 0)} 세트
        </span>
      </div>
    </div>
  );
}

export function RoutineResults({
  routine,
  isLoading,
  error,
  onReset,
}: RoutineResultsProps) {
  const [allCopied, setAllCopied] = useState(false);

  // 카카오톡 SDK 초기화
  useEffect(() => {
    if (typeof window !== "undefined" && window.Kakao) {
      const Kakao = window.Kakao;
      if (!Kakao.isInitialized()) {
        // ⚠️ 중요: REST API 키가 아닌 JavaScript 키를 사용해야 합니다!
        // 카카오 개발자 콘솔 > 앱 설정 > 앱 키 > JavaScript 키를 복사하세요.
        // .env 파일에 VITE_KAKAO_JS_KEY=your_javascript_key_here 형식으로 추가하세요.
        const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || "";
        if (KAKAO_JS_KEY) {
          Kakao.init(KAKAO_JS_KEY);
          console.log("카카오톡 SDK 초기화 완료");
        } else {
          console.warn(
            "카카오톡 JavaScript 키가 설정되지 않았습니다. .env 파일에 VITE_KAKAO_JS_KEY를 추가하세요."
          );
        }
      } else {
        console.log("카카오톡 SDK 이미 초기화됨");
      }
    } else {
      console.warn("카카오톡 SDK를 로드할 수 없습니다.");
    }
  }, []);

  const copyAll = () => {
    if (!routine) return;
    const text = routine.days
      .map(
        (day) =>
          `${day.day} - ${day.focus}\n${day.exercises
            .map((e) => `  ${e.name} ${e.sets}x${e.reps} (${e.rest})`)
            .join("\n")}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  const shareToKakao = () => {
    if (!routine) {
      console.warn("루틴 데이터가 없습니다.");
      return;
    }

    const Kakao = window.Kakao;

    // 카카오톡 SDK 확인
    if (!Kakao || !Kakao.isInitialized()) {
      alert(
        "카카오톡 공유 기능을 사용할 수 없습니다.\n개발 서버를 재시작한 후 다시 시도해주세요."
      );
      console.error("카카오톡 SDK가 초기화되지 않았습니다.");
      return;
    }

    try {
      // 루틴 내용을 텍스트로 포맷팅
      const routineText = `${routine.routineName}\n\n${
        routine.description
      }\n\n${routine.days
        .map(
          (day) =>
            `${day.day} - ${day.focus}\n${day.exercises
              .map((e) => `  ${e.name} ${e.sets}x${e.reps} (${e.rest})`)
              .join("\n")}`
        )
        .join("\n\n")}`;

      const currentUrl = window.location.href;

      Kakao.Share.sendDefault({
        objectType: "text",
        text: routineText,
        link: {
          mobileWebUrl: currentUrl,
          webUrl: currentUrl,
        },
      });
    } catch (error) {
      console.error("카카오톡 공유 실패:", error);
      alert("카카오톡 공유에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-24">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h3 className="text-lg font-bold text-foreground">
            AI가 루틴을 생성 중입니다
          </h3>
          <p className="text-sm text-muted-foreground">
            최적의 루틴을 만들고 있어요
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-24">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <h3 className="text-lg font-bold text-destructive">루틴 생성 실패</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={onReset}
            className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all active:scale-95"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!routine) return null;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="px-1 pb-5">
        <h2 className="text-xl font-bold text-foreground">
          {routine.routineName}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {routine.description}
        </p>
      </div>

      {/* Day Cards */}
      <div className="flex flex-col gap-3">
        {routine.days.map((day, index) => (
          <DayCard key={index} dayRoutine={day} index={index} />
        ))}
      </div>

      {/* Tips */}
      {routine.tips && routine.tips.length > 0 && (
        <div className="mt-4 rounded-2xl bg-primary/5 px-4 py-4 ring-1 ring-primary/15">
          <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-primary">
            Tips
          </h3>
          <ul className="flex flex-col gap-2">
            {routine.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground/80"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom actions */}
      <div className="sticky bottom-0 -mx-5 mt-6 flex items-center gap-3 border-t border-border bg-background/80 px-5 pb-2 pt-3 backdrop-blur-xl safe-bottom">
        <button
          onClick={onReset}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-secondary text-muted-foreground transition-all active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={copyAll}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-bold text-primary-foreground shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all active:scale-[0.98]"
        >
          {allCopied ? (
            <>
              <Check className="h-4 w-4" />
              {"복사 완료!"}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {"전체 루틴 복사"}
            </>
          )}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("카카오톡 공유 버튼 클릭");
            shareToKakao();
          }}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#FEE500] text-[#000000] transition-all active:scale-95 hover:bg-[#FEE500]/90 cursor-pointer"
          title="카카오톡으로 공유"
          type="button"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
