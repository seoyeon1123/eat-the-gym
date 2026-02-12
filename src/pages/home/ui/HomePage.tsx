"use client";

import { useState, useCallback } from "react";
import { HeroSection } from "@/widgets/hero-section";
import { StepIndicator } from "@/widgets/step-indicator";
import { EquipmentSelector } from "@/widgets/equipment-selector";
import {
  WorkoutSettings,
  type WorkoutConfig,
} from "@/widgets/workout-settings";
import { RoutineResults, type RoutineData } from "@/widgets/routine-results";
import { generateRoutineWithAI } from "@/entities/routine/api";
import { Dumbbell } from "lucide-react";

type AppStep = "landing" | "equipment" | "settings" | "results";

const stepLabels = ["기구 선택", "운동 설정", "결과"];

export function HomePage() {
  const [step, setStep] = useState<AppStep>("landing");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [workoutConfig, setWorkoutConfig] = useState<WorkoutConfig>({
    frequency: "3",
    split: "3",
    goal: "hypertrophy",
  });
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setStep("results");
    setIsLoading(true);
    setRoutine(null);
    setError(null);

    try {
      // AI를 사용한 루틴 생성
      const result = await generateRoutineWithAI({
        selectedEquipment,
        frequency: workoutConfig.frequency,
        split: workoutConfig.split,
        goal: workoutConfig.goal,
      });

      setRoutine(result);
    } catch (err) {
      console.error("AI 루틴 생성 실패:", err);
      setError(
        err instanceof Error ? err.message : "AI 루틴 생성에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedEquipment, workoutConfig]);

  const handleReset = () => {
    setStep("landing");
    setSelectedEquipment([]);
    setWorkoutConfig({ frequency: "3", split: "3", goal: "hypertrophy" });
    setRoutine(null);
  };

  const getStepNumber = () => {
    switch (step) {
      case "equipment":
        return 1;
      case "settings":
        return 2;
      case "results":
        return 3;
      default:
        return 0;
    }
  };

  if (step === "landing") {
    return (
      <main className="relative min-h-dvh">
        <HeroSection onStart={() => setStep("equipment")} />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col">
      {/* App bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-5 pb-3 pt-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          {/* Logo row */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 transition-opacity active:opacity-70"
            >
              <Dumbbell className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                {"헬스장 "}
                <span className="text-primary">{"파먹기"}</span>
              </span>
            </button>
            <span className="text-xs text-muted-foreground">
              {getStepNumber()}/3
            </span>
          </div>
          {/* Progress */}
          <StepIndicator
            currentStep={getStepNumber()}
            totalSteps={3}
            labels={stepLabels}
          />
        </div>
      </header>

      {/* Content area */}
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-5">
        <div
          key={step}
          className="flex flex-1 flex-col animate-in fade-in slide-in-from-right-4 duration-200"
        >
          {step === "equipment" && (
            <EquipmentSelector
              selected={selectedEquipment}
              onSelectionChange={setSelectedEquipment}
              onNext={() => setStep("settings")}
            />
          )}

          {step === "settings" && (
            <WorkoutSettings
              config={workoutConfig}
              onConfigChange={setWorkoutConfig}
              onNext={handleGenerate}
              onBack={() => setStep("equipment")}
            />
          )}

          {step === "results" && (
            <RoutineResults
              routine={routine}
              isLoading={isLoading}
              error={error}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </main>
  );
}
