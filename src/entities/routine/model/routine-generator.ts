import { equipmentCategories, exercisesByCategory } from '@/entities/equipment'
import type { RoutineData, DayRoutine, Exercise } from '@/widgets/routine-results'

interface GenerateInput {
  selectedEquipment: string[]
  frequency: string
  split: string
  goal: string
}

// Exercise database: each equipment maps to possible exercises with metadata
interface ExerciseTemplate {
  name: string
  equipmentId: string
  muscleGroup: string
  isCompound: boolean
}

const exerciseDB: ExerciseTemplate[] = [
  // Chest - Machine
  { name: '체스트프레스', equipmentId: 'chest-press', muscleGroup: 'chest', isCompound: true },
  { name: '펙덱 플라이', equipmentId: 'pec-deck', muscleGroup: 'chest', isCompound: false },
  { name: '딥스 머신', equipmentId: 'dip-machine', muscleGroup: 'chest', isCompound: true },
  { name: '케이블 플라이', equipmentId: 'cable-fly', muscleGroup: 'chest', isCompound: false },
  // Chest - Barbell
  { name: '벤치프레스', equipmentId: 'bench-press', muscleGroup: 'chest', isCompound: true },
  { name: '인클라인 벤치프레스', equipmentId: 'incline-bench', muscleGroup: 'chest', isCompound: true },
  { name: '디클라인 벤치프레스', equipmentId: 'decline-bench', muscleGroup: 'chest', isCompound: true },
  // Chest - Dumbbell
  { name: '덤벨 벤치프레스', equipmentId: 'db-bench-press', muscleGroup: 'chest', isCompound: true },
  { name: '덤벨 인클라인 프레스', equipmentId: 'db-incline-press', muscleGroup: 'chest', isCompound: true },
  { name: '덤벨 플라이', equipmentId: 'db-fly', muscleGroup: 'chest', isCompound: false },
  { name: '덤벨 풀오버', equipmentId: 'db-pullover', muscleGroup: 'chest', isCompound: false },

  // Shoulder - Machine
  { name: '숄더프레스 머신', equipmentId: 'shoulder-press', muscleGroup: 'shoulder', isCompound: true },
  { name: '레터럴 레이즈 머신', equipmentId: 'lateral-raise-machine', muscleGroup: 'shoulder', isCompound: false },
  { name: '케이블 레터럴 레이즈', equipmentId: 'cable-lateral', muscleGroup: 'shoulder', isCompound: false },
  { name: '페이스 풀', equipmentId: 'face-pull', muscleGroup: 'shoulder', isCompound: false },
  // Shoulder - Barbell
  { name: '바벨 숄더프레스', equipmentId: 'bb-shoulder-press', muscleGroup: 'shoulder', isCompound: true },
  { name: '바벨 업라이트 로우', equipmentId: 'bb-upright-row', muscleGroup: 'shoulder', isCompound: true },
  { name: '바벨 프론트 레이즈', equipmentId: 'bb-front-raise', muscleGroup: 'shoulder', isCompound: false },
  // Shoulder - Dumbbell
  { name: '덤벨 숄더프레스', equipmentId: 'db-shoulder-press', muscleGroup: 'shoulder', isCompound: true },
  { name: '덤벨 레터럴 레이즈', equipmentId: 'db-lateral-raise', muscleGroup: 'shoulder', isCompound: false },
  { name: '덤벨 리어 델트 플라이', equipmentId: 'db-rear-delt-fly', muscleGroup: 'shoulder', isCompound: false },
  { name: '덤벨 프론트 레이즈', equipmentId: 'db-front-raise', muscleGroup: 'shoulder', isCompound: false },

  // Back - Machine
  { name: '랫풀다운', equipmentId: 'lat-pulldown', muscleGroup: 'back', isCompound: true },
  { name: '시티드 로우', equipmentId: 'seated-row', muscleGroup: 'back', isCompound: true },
  { name: '케이블 로우', equipmentId: 'cable-row', muscleGroup: 'back', isCompound: true },
  { name: '백 익스텐션', equipmentId: 'back-extension', muscleGroup: 'back', isCompound: false },
  // Back - Barbell
  { name: '바벨 벤트오버 로우', equipmentId: 'bb-bent-over-row', muscleGroup: 'back', isCompound: true },
  { name: '바벨 데드리프트', equipmentId: 'bb-deadlift', muscleGroup: 'back', isCompound: true },
  { name: '티바 로우', equipmentId: 't-bar-row', muscleGroup: 'back', isCompound: true },
  // Back - Dumbbell
  { name: '덤벨 로우', equipmentId: 'db-row', muscleGroup: 'back', isCompound: true },
  { name: '덤벨 풀오버', equipmentId: 'db-pullover', muscleGroup: 'back', isCompound: false },
  { name: '덤벨 슈러그', equipmentId: 'db-shrug', muscleGroup: 'back', isCompound: false },
  { name: '풀업', equipmentId: 'pull-up-bar', muscleGroup: 'back', isCompound: true },

  // Legs - Machine
  { name: '레그 프레스', equipmentId: 'leg-press', muscleGroup: 'legs', isCompound: true },
  { name: '레그 익스텐션', equipmentId: 'leg-extension', muscleGroup: 'legs', isCompound: false },
  { name: '레그 컬', equipmentId: 'leg-curl', muscleGroup: 'legs', isCompound: false },
  { name: '핵 스쿼트', equipmentId: 'hack-squat', muscleGroup: 'legs', isCompound: true },
  { name: '카프 레이즈', equipmentId: 'calf-raise', muscleGroup: 'legs', isCompound: false },
  // Legs - Barbell
  { name: '바벨 스쿼트', equipmentId: 'squat-rack', muscleGroup: 'legs', isCompound: true },
  { name: '바벨 루마니안 데드리프트', equipmentId: 'bb-romanian-deadlift', muscleGroup: 'legs', isCompound: true },
  { name: '바벨 런지', equipmentId: 'bb-lunge', muscleGroup: 'legs', isCompound: true },
  // Legs - Dumbbell
  { name: '덤벨 스쿼트', equipmentId: 'db-squat', muscleGroup: 'legs', isCompound: true },
  { name: '덤벨 런지', equipmentId: 'db-lunge', muscleGroup: 'legs', isCompound: true },
  { name: '덤벨 루마니안 데드리프트', equipmentId: 'db-romanian-deadlift', muscleGroup: 'legs', isCompound: true },
  { name: '힙 쓰러스트', equipmentId: 'hip-thrust', muscleGroup: 'legs', isCompound: true },

  // Arms - Machine
  { name: '바이셉 컬 머신', equipmentId: 'bicep-curl-machine', muscleGroup: 'arms-bicep', isCompound: false },
  { name: '트라이셉 푸시다운', equipmentId: 'tricep-pushdown', muscleGroup: 'arms-tricep', isCompound: false },
  { name: '케이블 컬', equipmentId: 'cable-curl', muscleGroup: 'arms-bicep', isCompound: false },
  // Arms - Barbell
  { name: '바벨 바이셉 컬', equipmentId: 'bb-bicep-curl', muscleGroup: 'arms-bicep', isCompound: false },
  { name: 'EZ바 컬', equipmentId: 'ez-bar', muscleGroup: 'arms-bicep', isCompound: false },
  { name: '바벨 트라이셉 익스텐션', equipmentId: 'bb-tricep-extension', muscleGroup: 'arms-tricep', isCompound: false },
  // Arms - Dumbbell
  { name: '덤벨 바이셉 컬', equipmentId: 'db-bicep-curl', muscleGroup: 'arms-bicep', isCompound: false },
  { name: '덤벨 트라이셉 익스텐션', equipmentId: 'db-tricep-extension', muscleGroup: 'arms-tricep', isCompound: false },
  { name: '프리처 컬', equipmentId: 'preacher-curl', muscleGroup: 'arms-bicep', isCompound: false },
  { name: '덤벨 랙', equipmentId: 'dumbbell-rack', muscleGroup: 'arms-bicep', isCompound: false },

  // Core
  { name: '복근 크런치 머신', equipmentId: 'ab-crunch', muscleGroup: 'core', isCompound: false },
  { name: '케이블 크런치', equipmentId: 'cable-crunch', muscleGroup: 'core', isCompound: false },
  { name: '로만 체어 백 익스텐션', equipmentId: 'roman-chair', muscleGroup: 'core', isCompound: false },
  { name: 'AB 롤아웃', equipmentId: 'ab-roller', muscleGroup: 'core', isCompound: false },
  { name: '행잉 레그 레이즈', equipmentId: 'hanging-leg-raise', muscleGroup: 'core', isCompound: false },
]

// Goal-specific parameters
const goalParams: Record<string, { sets: [number, number]; reps: [number, number]; restSec: [number, number] }> = {
  hypertrophy: { sets: [3, 4], reps: [8, 12], restSec: [60, 90] },
  'fat-loss': { sets: [3, 4], reps: [12, 15], restSec: [30, 45] },
  beginner: { sets: [3, 3], reps: [10, 12], restSec: [60, 90] },
  maintenance: { sets: [3, 3], reps: [10, 12], restSec: [60, 60] },
}

const goalLabels: Record<string, string> = {
  hypertrophy: '근비대',
  'fat-loss': '체지방 감량',
  beginner: '초보자',
  maintenance: '유지',
}

// Split definitions: which muscle groups go on which day
const splitTemplates: Record<string, string[][]> = {
  '2': [
    ['chest', 'shoulder', 'arms-tricep', 'core'],
    ['back', 'legs', 'arms-bicep', 'core'],
  ],
  '3': [
    ['chest', 'shoulder', 'arms-tricep'],
    ['back', 'arms-bicep', 'core'],
    ['legs', 'core'],
  ],
  '5': [
    ['chest'],
    ['back'],
    ['shoulder'],
    ['legs'],
    ['arms-bicep', 'arms-tricep', 'core'],
  ],
}

const splitFocusLabels: Record<string, string[]> = {
  '2': ['가슴 + 어깨 + 삼두', '등 + 하체 + 이두'],
  '3': ['가슴 + 어깨 + 삼두', '등 + 이두 + 코어', '하체 + 코어'],
  '5': ['가슴', '등', '어깨', '하체', '팔 + 코어'],
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function randBetween(min: number, max: number, seed: number): number {
  const s = (seed * 1103515245 + 12345) & 0x7fffffff
  return min + (s % (max - min + 1))
}

function getAvailableExercises(selectedEquipment: string[], muscleGroups: string[]): ExerciseTemplate[] {
  return exerciseDB.filter(
    (ex) => selectedEquipment.includes(ex.equipmentId) && muscleGroups.includes(ex.muscleGroup)
  )
}

function buildExercisesForDay(
  available: ExerciseTemplate[],
  goal: string,
  maxExercises: number,
  seed: number,
): Exercise[] {
  const params = goalParams[goal] || goalParams.hypertrophy

  // Sort: compounds first, then isolations
  const compounds = available.filter((e) => e.isCompound)
  const isolations = available.filter((e) => !e.isCompound)

  const shuffledCompounds = seededShuffle(compounds, seed)
  const shuffledIsolations = seededShuffle(isolations, seed + 1)

  const selected = [...shuffledCompounds, ...shuffledIsolations].slice(0, maxExercises)

  // Remove duplicates by name
  const seen = new Set<string>()
  const unique = selected.filter((e) => {
    if (seen.has(e.name)) return false
    seen.add(e.name)
    return true
  })

  return unique.map((ex, i) => {
    const sets = randBetween(params.sets[0], params.sets[1], seed + i * 7)
    const reps = randBetween(params.reps[0], params.reps[1], seed + i * 13)
    const rest = randBetween(params.restSec[0], params.restSec[1], seed + i * 19)
    return {
      name: ex.name,
      sets,
      reps,
      rest: `${rest}초`,
    }
  })
}

function generateTips(goal: string): string[] {
  const baseTips: Record<string, string[]> = {
    hypertrophy: [
      '점진적 과부하를 적용해 매주 무게나 반복수를 조금씩 늘려보세요.',
      '운동 중 근육의 수축과 이완을 의식하며 마인드-머슬 커넥션을 유지하세요.',
      '단백질 섭취는 체중 1kg당 1.6~2.2g을 목표로 하세요.',
      '충분한 수면(7-9시간)은 근성장에 필수적입니다.',
      '세트 간 휴식 시간을 지켜 운동 강도를 유지하세요.',
    ],
    'fat-loss': [
      '휴식 시간을 짧게 유지하여 심박수를 높은 상태로 유지하세요.',
      '칼로리 적자를 유지하되, 단백질 섭취는 줄이지 마세요.',
      '유산소 운동을 병행하면 체지방 감량에 더 효과적입니다.',
      '운동 후 스트레칭으로 회복을 도와주세요.',
      '수분 섭취를 충분히 하여 신진대사를 활발하게 유지하세요.',
    ],
    beginner: [
      '올바른 자세를 먼저 익히고, 무게는 천천히 늘려가세요.',
      '처음에는 가벼운 무게로 시작하여 부상을 예방하세요.',
      '운동 전 5-10분의 워밍업을 반드시 하세요.',
      '통증이 느껴지면 즉시 운동을 중단하고 자세를 점검하세요.',
      '꾸준함이 가장 중요합니다. 무리하지 말고 지속 가능한 루틴을 만드세요.',
    ],
    maintenance: [
      '현재 근력을 유지하는 것이 목표이므로 무게를 급격히 올리지 마세요.',
      '운동 빈도와 강도를 일정하게 유지하세요.',
      '균형 잡힌 식단으로 영양 상태를 유지하세요.',
      '스트레스 관리와 충분한 수면도 유지에 중요합니다.',
      '주기적으로 루틴을 약간 변형하여 자극을 달리해보세요.',
    ],
  }
  return baseTips[goal] || baseTips.hypertrophy
}

export function generateRoutine(input: GenerateInput): RoutineData {
  const { selectedEquipment, frequency, split, goal } = input
  const freq = parseInt(frequency)
  const template = splitTemplates[split] || splitTemplates['3']
  const focusLabels = splitFocusLabels[split] || splitFocusLabels['3']

  const seed = selectedEquipment.reduce((acc, id) => acc + id.charCodeAt(0) * 31, 0) + freq * 7 + parseInt(split) * 13

  // Calculate how many exercises per day based on goal and split
  const maxPerDay = goal === 'beginner' ? 4 : split === '5' ? 5 : 5

  // Build days based on frequency
  // If frequency > split days, repeat the split cycle
  const days: DayRoutine[] = []

  for (let i = 0; i < freq; i++) {
    const templateIndex = i % template.length
    const muscleGroups = template[templateIndex]
    const available = getAvailableExercises(selectedEquipment, muscleGroups)

    const exercises = buildExercisesForDay(available, goal, maxPerDay, seed + i * 100)

    // If no exercises available for this muscle group, add bodyweight alternatives
    if (exercises.length === 0) {
      const fallbackExercise: Exercise = {
        name: '해당 부위 기구를 추가로 선택해주세요',
        sets: 0,
        reps: 0,
        rest: '-',
      }
      exercises.push(fallbackExercise)
    }

    days.push({
      day: `Day ${i + 1}`,
      focus: focusLabels[templateIndex] || muscleGroups.join(' + '),
      exercises,
    })
  }

  // Count selected equipment names for the description
  const equipNames = selectedEquipment
    .map((id) => {
      // 모든 부위 운동을 exercisesByCategory에서 찾기
      for (const categoryExercises of Object.values(exercisesByCategory)) {
        for (const subCategoryExercises of Object.values(categoryExercises)) {
          const eq = subCategoryExercises.find((e) => e.id === id)
          if (eq) return eq.name
        }
      }
      return null
    })
    .filter(Boolean)

  const goalLabel = goalLabels[goal] || '근비대'

  return {
    routineName: `${goalLabel} ${split}분할 루틴`,
    description: `${equipNames.length}개 기구를 활용한 주 ${frequency}회 ${split}분할 ${goalLabel} 프로그램입니다.`,
    days,
    tips: generateTips(goal),
  }
}
