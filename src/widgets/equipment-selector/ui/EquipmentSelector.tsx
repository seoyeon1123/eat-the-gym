'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib'
import { equipmentCategories, type EquipmentCategory } from '@/entities/equipment'
import { ChevronRight, Check, Plus, X } from 'lucide-react'

interface EquipmentSelectorProps {
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  onNext: () => void
}

export function EquipmentSelector({ selected, onSelectionChange, onNext }: EquipmentSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>(equipmentCategories[0].id)
  const [customEquipmentInput, setCustomEquipmentInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // 현재 활성 카테고리의 커스텀 기구 목록 추출 (custom-{categoryId}- 접두사로 시작하는 것들)
  const getCustomEquipmentsForCategory = (categoryId: string) => {
    return selected
      .filter((id) => id.startsWith(`custom-${categoryId}-`))
      .map((id) => {
        const parts = id.split('-')
        // custom-{categoryId}-{equipmentName} 형식에서 equipmentName 추출
        return parts.slice(2).join('-')
      })
  }

  const customEquipments = getCustomEquipmentsForCategory(activeCategory)

  const addCustomEquipment = () => {
    const trimmed = customEquipmentInput.trim()
    if (trimmed && !customEquipments.includes(trimmed)) {
      // 커스텀 기구 ID 형식: custom-{categoryId}-{equipmentName}
      const customId = `custom-${activeCategory}-${trimmed}`
      onSelectionChange([...selected, customId])
      setCustomEquipmentInput('')
      setShowCustomInput(false)
    }
  }

  const removeCustomEquipment = (equipmentName: string) => {
    const customId = `custom-${activeCategory}-${equipmentName}`
    onSelectionChange(selected.filter((id) => id !== customId))
  }

  const toggleEquipment = (equipmentId: string) => {
    if (selected.includes(equipmentId)) {
      onSelectionChange(selected.filter((id) => id !== equipmentId))
    } else {
      onSelectionChange([...selected, equipmentId])
    }
  }

  const toggleAll = (category: EquipmentCategory) => {
    const categoryIds = category.equipment.map((e) => e.id)
    const allSelected = categoryIds.every((id) => selected.includes(id))
    if (allSelected) {
      onSelectionChange(selected.filter((id) => !categoryIds.includes(id)))
    } else {
      onSelectionChange([...new Set([...selected, ...categoryIds])])
    }
  }

  const activeCategoryData = equipmentCategories.find((c) => c.id === activeCategory)

  const getCategoryCount = (categoryId: string) => {
    const category = equipmentCategories.find((c) => c.id === categoryId)
    if (!category) return 0
    const defaultCount = category.equipment.filter((e) => selected.includes(e.id)).length
    const customCount = getCustomEquipmentsForCategory(categoryId).length
    return defaultCount + customCount
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Title area */}
      <div className="px-1 pb-4">
        <h2 className="text-xl font-bold text-foreground">어떤 기구가 있나요?</h2>
        <p className="mt-1 text-sm text-muted-foreground">헬스장에서 사용 가능한 기구를 선택하세요</p>
      </div>

      {/* Category pills - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {equipmentCategories.map((category) => {
          const count = getCategoryCount(category.id)
          const isActive = activeCategory === category.id
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all active:scale-95',
                isActive
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {category.name}
              {count > 0 && (
                <span
                  className={cn(
                    'flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/20 text-primary'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Equipment list */}
      {activeCategoryData && (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {/* Select all */}
          <button
            onClick={() => toggleAll(activeCategoryData)}
            className="mb-1 self-end rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-colors active:bg-primary/10"
          >
            {activeCategoryData.equipment.every((e) => selected.includes(e.id))
              ? '전체 해제'
              : '전체 선택'}
          </button>

          <div className="flex flex-col gap-1.5">
            {/* 기본 기구 목록 */}
            {activeCategoryData.equipment.map((equipment) => {
              const isSelected = selected.includes(equipment.id)
              return (
                <button
                  key={equipment.id}
                  onClick={() => toggleEquipment(equipment.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98]',
                    isSelected
                      ? 'bg-primary/10 ring-1 ring-primary/30'
                      : 'bg-card active:bg-secondary'
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-muted-foreground/30'
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </div>
                  <span
                    className={cn(
                      'flex-1 text-sm font-medium transition-colors',
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {equipment.name}
                  </span>
                </button>
              )
            })}

            {/* 현재 카테고리의 커스텀 기구 목록 */}
            {customEquipments.length > 0 && (
              <>
                {customEquipments.map((equipmentName) => {
                  const customId = `custom-${activeCategory}-${equipmentName}`
                  const isSelected = selected.includes(customId)
                  return (
                    <button
                      key={customId}
                      onClick={() => toggleEquipment(customId)}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98]',
                        isSelected
                          ? 'bg-primary/10 ring-1 ring-primary/30'
                          : 'bg-card active:bg-secondary'
                      )}
                    >
                      {/* Checkbox */}
                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-muted-foreground/30'
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </div>
                      <span
                        className={cn(
                          'flex-1 text-sm font-medium transition-colors',
                          isSelected ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {equipmentName}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeCustomEquipment(equipmentName)
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/20 active:bg-primary/30"
                        aria-label="제거"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </button>
                  )
                })}
              </>
            )}
          </div>

          {/* 커스텀 기구 추가 섹션 */}
          <div className="mt-4 border-t border-border pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {activeCategoryData.name} 부위 직접 추가
              </h3>
              {!showCustomInput && (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-colors active:bg-primary/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  추가
                </button>
              )}
            </div>

            {/* 커스텀 기구 입력 필드 */}
            {showCustomInput && (
              <div className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={customEquipmentInput}
                  onChange={(e) => setCustomEquipmentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomEquipment()
                    } else if (e.key === 'Escape') {
                      setShowCustomInput(false)
                      setCustomEquipmentInput('')
                    }
                  }}
                  placeholder={`${activeCategoryData.name} 부위 기구 이름을 입력하세요`}
                  className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <button
                  onClick={addCustomEquipment}
                  disabled={!customEquipmentInput.trim()}
                  className={cn(
                    'rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-95',
                    customEquipmentInput.trim()
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false)
                    setCustomEquipmentInput('')
                  }}
                  className="rounded-xl border border-input bg-background px-3 py-2.5 text-muted-foreground transition-colors active:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky bottom CTA */}
      <div className="sticky bottom-0 -mx-5 mt-4 border-t border-border bg-background/80 px-5 pb-2 pt-3 backdrop-blur-xl safe-bottom">
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-all active:scale-[0.98]',
            selected.length > 0
              ? 'bg-primary text-primary-foreground shadow-[0_0_30px_rgba(34,197,94,0.2)]'
              : 'bg-secondary text-muted-foreground'
          )}
        >
          {selected.length > 0 ? `${selected.length}개 선택 완료` : '기구를 선택하세요'}
          {selected.length > 0 && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
