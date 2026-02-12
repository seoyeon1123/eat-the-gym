'use client'

import { cn } from '@/shared/lib'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex w-full items-center gap-1.5 px-1">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isCompleted = step < currentStep
        const isCurrent = step === currentStep

        return (
          <div key={step} className="flex flex-1 flex-col gap-1.5">
            {/* Progress bar */}
            <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  (isCompleted || isCurrent) ? 'w-full bg-primary' : 'w-0'
                )}
              />
            </div>
            {/* Label */}
            <div className="flex items-center justify-center gap-1">
              {isCompleted && <Check className="h-3 w-3 text-primary" />}
              <span
                className={cn(
                  'text-[11px] font-medium transition-colors',
                  isCurrent ? 'text-foreground' : isCompleted ? 'text-primary' : 'text-muted-foreground/50'
                )}
              >
                {labels[i]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
