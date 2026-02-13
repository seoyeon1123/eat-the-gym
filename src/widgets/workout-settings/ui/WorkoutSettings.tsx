"use client";

import { cn } from "@/shared/lib";
import {
  frequencyOptions,
  splitOptions,
  focusOptions,
  experienceLevelOptions,
} from "@/entities/equipment";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  LayoutGrid,
  Target,
  User,
} from "lucide-react";

export interface WorkoutConfig {
  frequency: string;
  split: string;
  focus: string;
  experienceLevel: string;
}

interface WorkoutSettingsProps {
  config: WorkoutConfig;
  onConfigChange: (config: WorkoutConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

function SliderOption({
  label,
  icon: Icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const currentIndex = options.findIndex((opt) => opt.value === value);
  const sliderValue = currentIndex >= 0 ? currentIndex : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value);
    onChange(options[newIndex].value);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-base font-bold text-primary">
          {options[currentIndex]?.label || options[0].label}
        </span>
      </div>
      <div className="relative px-2">
        <input
          type="range"
          min="0"
          max={options.length - 1}
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
              (sliderValue / (options.length - 1)) * 100
            }%, hsl(var(--secondary)) ${
              (sliderValue / (options.length - 1)) * 100
            }%, hsl(var(--secondary)) 100%)`,
          }}
        />
        <div className="flex justify-between mt-2 px-1">
          {options.map((option, index) => (
            <span
              key={option.value}
              className={cn(
                "text-base font-semibold",
                index === sliderValue ? "text-primary" : "text-muted-foreground"
              )}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function OptionGroup({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  scrollable = false,
}: {
  label: string;
  icon: React.ElementType;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  scrollable?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5 px-1">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      {scrollable ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-95",
                value === option.value
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground ring-1 ring-border active:bg-secondary"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-95",
                value === option.value
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground ring-1 ring-border active:bg-secondary"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkoutSettings({
  config,
  onConfigChange,
  onNext,
  onBack,
}: WorkoutSettingsProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Title */}
      <div className="px-1 pb-6">
        <h2 className="text-xl font-bold text-foreground">운동 설정</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          루틴에 반영할 설정을 선택하세요
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-8">
        <SliderOption
          label="운동 빈도"
          icon={Calendar}
          options={frequencyOptions}
          value={config.frequency}
          onChange={(value) => onConfigChange({ ...config, frequency: value })}
        />

        <OptionGroup
          label="분할 방식"
          icon={LayoutGrid}
          options={splitOptions}
          value={config.split}
          onChange={(value) => onConfigChange({ ...config, split: value })}
        />

        <OptionGroup
          label="중심"
          icon={Target}
          options={focusOptions}
          value={config.focus}
          onChange={(value) => onConfigChange({ ...config, focus: value })}
        />

        <OptionGroup
          label="경험 수준"
          icon={User}
          options={experienceLevelOptions}
          value={config.experienceLevel}
          onChange={(value) =>
            onConfigChange({ ...config, experienceLevel: value })
          }
        />
      </div>

      {/* Bottom actions */}
      <div className="sticky bottom-0 -mx-5 mt-6 flex items-center gap-3 border-t border-border bg-background/80 px-5 pb-2 pt-3 backdrop-blur-xl safe-bottom">
        <button
          onClick={onBack}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-secondary text-muted-foreground transition-all active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onNext}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-bold text-primary-foreground shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all active:scale-[0.98]"
        >
          루틴 생성
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
