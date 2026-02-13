"use client";

import { useState } from "react";
import { cn } from "@/shared/lib";
import {
  equipmentCategories,
  exercisesByCategory,
  type EquipmentSubCategory,
} from "@/entities/equipment";
import { ChevronRight, Check, Plus, X } from "lucide-react";

interface EquipmentSelectorProps {
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  onNext: () => void;
}

const subCategoryLabels: Record<EquipmentSubCategory, string> = {
  machine: "머신",
  barbell: "바벨",
  dumbbell: "덤벨",
};

export function EquipmentSelector({
  selected,
  onSelectionChange,
  onNext,
}: EquipmentSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    equipmentCategories[0].id
  );
  const [activeSubCategory, setActiveSubCategory] =
    useState<EquipmentSubCategory | null>(null);
  const [customEquipmentInput, setCustomEquipmentInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // 현재 활성 카테고리의 커스텀 기구 목록 추출 (서브 카테고리별)
  const getCustomEquipmentsForSubCategory = (
    categoryId: string,
    subCategory: EquipmentSubCategory | null
  ) => {
    if (subCategory === null) {
      // 서브 카테고리가 선택되지 않았을 때는 모든 커스텀 기구 반환
      return selected
        .filter((id) => id.startsWith(`custom-${categoryId}-`))
        .map((id) => {
          const parts = id.split("-");
          // custom-{categoryId}-{subCategory}-{equipmentName} 또는 custom-{categoryId}-{equipmentName} 형식
          if (
            parts.length >= 4 &&
            ["machine", "barbell", "dumbbell"].includes(parts[2])
          ) {
            // 서브 카테고리가 포함된 경우
            return {
              name: parts.slice(3).join("-"),
              subCategory: parts[2] as EquipmentSubCategory,
            };
          } else {
            // 기존 형식 (서브 카테고리 없음)
            return {
              name: parts.slice(2).join("-"),
              subCategory: null,
            };
          }
        });
    } else {
      // 특정 서브 카테고리의 커스텀 기구만 반환
      return selected
        .filter((id) => id.startsWith(`custom-${categoryId}-${subCategory}-`))
        .map((id) => {
          const parts = id.split("-");
          return {
            name: parts.slice(3).join("-"),
            subCategory: parts[2] as EquipmentSubCategory,
          };
        });
    }
  };

  const customEquipments = getCustomEquipmentsForSubCategory(
    activeCategory,
    activeSubCategory
  );

  const addCustomEquipment = () => {
    const trimmed = customEquipmentInput.trim();
    if (!trimmed) return;

    // 같은 이름의 커스텀 기구가 이미 있는지 확인
    const existingNames = customEquipments.map((e) => e.name);
    if (existingNames.includes(trimmed)) return;

    // 서브 카테고리가 선택되어 있으면 서브 카테고리 포함, 없으면 부위만
    let customId: string;
    if (activeSubCategory) {
      customId = `custom-${activeCategory}-${activeSubCategory}-${trimmed}`;
    } else {
      customId = `custom-${activeCategory}-${trimmed}`;
    }

    onSelectionChange([...selected, customId]);
    setCustomEquipmentInput("");
    setShowCustomInput(false);
  };

  const removeCustomEquipment = (
    equipmentName: string,
    subCategory: EquipmentSubCategory | null
  ) => {
    let customId: string;
    if (subCategory) {
      customId = `custom-${activeCategory}-${subCategory}-${equipmentName}`;
    } else {
      customId = `custom-${activeCategory}-${equipmentName}`;
    }
    onSelectionChange(selected.filter((id) => id !== customId));
  };

  const toggleEquipment = (equipmentId: string) => {
    if (selected.includes(equipmentId)) {
      onSelectionChange(selected.filter((id) => id !== equipmentId));
    } else {
      onSelectionChange([...selected, equipmentId]);
    }
  };

  // 서브 카테고리 전체 선택/해제
  const toggleSubCategoryAll = (
    categoryId: string,
    subCategory: EquipmentSubCategory
  ) => {
    const exercises = exercisesByCategory[categoryId]?.[subCategory] || [];
    const exerciseIds = exercises.map((e) => e.id);
    const allSelected = exerciseIds.every((id) => selected.includes(id));
    if (allSelected) {
      onSelectionChange(selected.filter((id) => !exerciseIds.includes(id)));
    } else {
      onSelectionChange([...new Set([...selected, ...exerciseIds])]);
    }
  };

  const activeCategoryData = equipmentCategories.find(
    (c) => c.id === activeCategory
  );

  // 카테고리별 선택된 운동 개수
  const getCategoryCount = (categoryId: string) => {
    const categoryExercises = exercisesByCategory[categoryId];
    if (!categoryExercises) return 0;

    let count = 0;
    Object.values(categoryExercises).forEach((exercises) => {
      count += exercises.filter((e) => selected.includes(e.id)).length;
    });
    // 커스텀 기구 개수 (서브 카테고리 포함/미포함 모두)
    const customCount = selected.filter((id) =>
      id.startsWith(`custom-${categoryId}-`)
    ).length;
    return count + customCount;
  };

  // 서브 카테고리별 선택된 운동 개수
  const getSubCategoryCount = (
    categoryId: string,
    subCategory: EquipmentSubCategory
  ) => {
    const exercises = exercisesByCategory[categoryId]?.[subCategory] || [];
    return exercises.filter((e) => selected.includes(e.id)).length;
  };

  // 부위 선택 시 서브 카테고리 초기화
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveSubCategory(null);
  };

  // 서브 카테고리 선택 (하나만 선택)
  const handleSubCategoryClick = (subCategory: EquipmentSubCategory) => {
    // 같은 버튼을 다시 클릭하면 닫기
    if (activeSubCategory === subCategory) {
      setActiveSubCategory(null);
    } else {
      setActiveSubCategory(subCategory);
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Title area */}
      <div className="px-1 pb-4 shrink-0">
        <h2 className="text-xl font-bold text-foreground">
          어떤 기구가 있나요?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          헬스장에서 사용 가능한 기구를 선택하세요
        </p>
      </div>

      {/* Category pills - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide shrink-0">
        {equipmentCategories.map((category) => {
          const count = getCategoryCount(category.id);
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all active:scale-95",
                isActive
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {category.name}
              {count > 0 && (
                <span
                  className={cn(
                    "flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/20 text-primary"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 서브 카테고리 선택 및 운동 목록 */}
      {activeCategoryData && (
        <div className="flex flex-1 flex-col min-h-0">
          <div className="px-1 pb-2 shrink-0">
            <h3 className="text-base font-semibold text-foreground">
              {activeCategoryData.name} 운동 타입을 선택하세요
            </h3>
          </div>

          {/* 머신/바벨/덤벨 버튼 한 줄 */}
          <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
            {(["machine", "barbell", "dumbbell"] as EquipmentSubCategory[]).map(
              (subCategory) => {
                const count = getSubCategoryCount(activeCategory, subCategory);
                const isActive = activeSubCategory === subCategory;
                return (
                  <button
                    key={subCategory}
                    onClick={() => handleSubCategoryClick(subCategory)}
                    className={cn(
                      "flex flex-row items-center justify-center gap-2 rounded-2xl px-4 py-4 text-center transition-all active:scale-[0.98]",
                      isActive
                        ? "bg-primary/10 ring-2 ring-primary"
                        : count > 0
                        ? "bg-primary/5 ring-1 ring-primary/30"
                        : "bg-card hover:bg-secondary"
                    )}
                  >
                    <span className="text-base font-semibold text-foreground">
                      {subCategoryLabels[subCategory]}
                    </span>
                    {count > 0 && (
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                        {count}개
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* 선택된 서브 카테고리의 운동 목록 */}
          {activeSubCategory !== null && (
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
              {/* 서브 카테고리 제목 및 전체 선택, 직접 추가 */}
              <div className="flex items-center justify-between px-1 shrink-0 mb-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {subCategoryLabels[activeSubCategory]}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      toggleSubCategoryAll(activeCategory, activeSubCategory)
                    }
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-colors active:bg-primary/10"
                  >
                    {(
                      exercisesByCategory[activeCategory]?.[
                        activeSubCategory
                      ] || []
                    ).every((e) => selected.includes(e.id))
                      ? "전체 해제"
                      : "전체 선택"}
                  </button>
                  {!showCustomInput && (
                    <button
                      onClick={() => setShowCustomInput(true)}
                      className="flex items-center justify-center rounded-lg p-1.5 text-primary transition-colors active:bg-primary/10"
                      aria-label="직접 추가"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 커스텀 기구 입력 필드 */}
              {showCustomInput && (
                <div className="mb-2 flex gap-2 shrink-0 px-1">
                  <input
                    type="text"
                    value={customEquipmentInput}
                    onChange={(e) => setCustomEquipmentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomEquipment();
                      } else if (e.key === "Escape") {
                        setShowCustomInput(false);
                        setCustomEquipmentInput("");
                      }
                    }}
                    placeholder={`${subCategoryLabels[activeSubCategory]} 운동 이름을 입력하세요`}
                    className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                  <button
                    onClick={addCustomEquipment}
                    disabled={!customEquipmentInput.trim()}
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-95",
                      customEquipmentInput.trim()
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    추가
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomEquipmentInput("");
                    }}
                    className="rounded-xl border border-input bg-background px-3 py-2.5 text-muted-foreground transition-colors active:bg-secondary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* 운동 목록 - 스크롤 가능 영역 */}
              <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0 -mx-1 px-1">
                {(
                  exercisesByCategory[activeCategory]?.[activeSubCategory] || []
                ).map((equipment) => {
                  const isSelected = selected.includes(equipment.id);
                  return (
                    <button
                      key={equipment.id}
                      onClick={() => toggleEquipment(equipment.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition-all active:scale-[0.98]",
                        isSelected
                          ? "bg-primary/10  ring-primary/30"
                          : "bg-card active:bg-secondary"
                      )}
                    >
                      {/* Checkbox */}
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "border border-muted-foreground/30"
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        )}
                      </div>
                      <span
                        className={cn(
                          "flex-1 text-sm font-medium transition-colors",
                          isSelected
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {equipment.name}
                      </span>
                    </button>
                  );
                })}

                {/* 해당 서브 카테고리의 커스텀 운동 목록 */}
                {customEquipments
                  .filter((e) => e.subCategory === activeSubCategory)
                  .map((customEquipment) => {
                    const customId = `custom-${activeCategory}-${activeSubCategory}-${customEquipment.name}`;
                    const isSelected = selected.includes(customId);
                    return (
                      <button
                        key={customId}
                        onClick={() => toggleEquipment(customId)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98]",
                          isSelected
                            ? "bg-primary/10 ring-1 ring-primary/30"
                            : "bg-card active:bg-secondary"
                        )}
                      >
                        {/* Checkbox */}
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "border border-muted-foreground/30"
                          )}
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          )}
                        </div>
                        <span
                          className={cn(
                            "flex-1 text-sm font-medium transition-colors",
                            isSelected
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {customEquipment.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomEquipment(
                              customEquipment.name,
                              activeSubCategory
                            );
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/20 active:bg-primary/30"
                          aria-label="제거"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sticky bottom CTA */}
      <div className="sticky bottom-0 -mx-5 mt-auto border-t border-border bg-background/80 px-5 pb-2 pt-3 backdrop-blur-xl safe-bottom shrink-0">
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-all active:scale-[0.98]",
            selected.length > 0
              ? "bg-primary text-primary-foreground shadow-[0_0_30px_rgba(34,197,94,0.2)]"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {selected.length > 0
            ? `${selected.length}개 선택 완료`
            : "기구를 선택하세요"}
          {selected.length > 0 && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
