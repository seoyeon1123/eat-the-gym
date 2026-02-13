import type { RoutineData, DayRoutine } from '@/widgets/routine-results'
import { exercisesByCategory } from '@/entities/equipment'

interface GenerateInput {
  selectedEquipment: string[]
  frequency: string
  split: string
  focus: string
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
}

export type AIProvider = 'groq' | 'gemini' | 'openai' | 'claude' | 'together'

interface AIConfig {
  provider: AIProvider
  apiKey: string
  model?: string
}

// ─────────────────────────────────────────────────────────
//  API 호출 함수들
// ─────────────────────────────────────────────────────────

async function generateWithGroq(input: GenerateInput, apiKey: string, model?: string): Promise<RoutineData> {
  const prompt = buildPrompt(input)
  const selectedModel = model || import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: '당신은 전문 헬스 트레이너입니다. 반드시 유효한 JSON만 응답하세요.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        }),
      })
      if (!response.ok) {
        const e = await response.json().catch(() => ({ error: { message: response.statusText } }))
        throw new Error(`Groq API error (${response.status}): ${e.error?.message || response.statusText}`)
      }
      const data = await response.json()
      if (!data.choices?.[0]?.message) throw new Error('Groq API 응답 형식이 올바르지 않습니다.')
      return extractAndParseJSON(data.choices[0].message.content, input)
    } catch (error) {
      if (attempt === 2) throw error
      console.warn(`[Groq] 시도 ${attempt + 1}/3 실패, 재시도 중...`, error)
    }
  }
  throw new Error('Groq API 재시도 실패')
}

async function generateWithOpenAI(input: GenerateInput, apiKey: string, model?: string): Promise<RoutineData> {
  const prompt = buildPrompt(input)
  const selectedModel = model || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: '당신은 전문 헬스 트레이너입니다. 반드시 유효한 JSON만 응답하세요.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      })
      if (!response.ok) {
        const e = await response.json().catch(() => ({ error: { message: response.statusText } }))
        throw new Error(`OpenAI API error (${response.status}): ${e.error?.message || response.statusText}`)
      }
      const data = await response.json()
      if (!data.choices?.[0]?.message) throw new Error('OpenAI API 응답 형식이 올바르지 않습니다.')
      return extractAndParseJSON(data.choices[0].message.content, input)
    } catch (error) {
      if (attempt === 2) throw error
      console.warn(`[OpenAI] 시도 ${attempt + 1}/3 실패, 재시도 중...`, error)
    }
  }
  throw new Error('OpenAI API 재시도 실패')
}

async function generateWithClaude(input: GenerateInput, apiKey: string, model?: string): Promise<RoutineData> {
  const prompt = buildPrompt(input)
  const selectedModel = model || import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: selectedModel,
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: `당신은 전문 헬스 트레이너입니다.\n\n${prompt}\n\n반드시 유효한 JSON 형식으로만 응답하세요.`,
          }],
          temperature: 0.7,
        }),
      })
      if (!response.ok) {
        const e = await response.json().catch(() => ({ error: { message: response.statusText } }))
        throw new Error(`Claude API error (${response.status}): ${e.error?.message || response.statusText}`)
      }
      const data = await response.json()
      if (!data.content?.[0]?.text) throw new Error('Claude API 응답 형식이 올바르지 않습니다.')
      return extractAndParseJSON(data.content[0].text, input)
    } catch (error) {
      if (attempt === 2) throw error
      console.warn(`[Claude] 시도 ${attempt + 1}/3 실패, 재시도 중...`, error)
    }
  }
  throw new Error('Claude API 재시도 실패')
}

async function generateWithGemini(input: GenerateInput, apiKey: string): Promise<RoutineData> {
  const prompt = buildPrompt(input)
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `당신은 전문 헬스 트레이너입니다.\n\n${prompt}\n\n반드시 유효한 JSON 형식으로만 응답하세요.`,
              }],
            }],
            generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
          }),
        },
      )
      if (!response.ok) {
        const e = await response.json().catch(() => ({ error: { message: response.statusText } }))
        if (response.status === 429) throw new Error('Gemini API 할당량 초과 (429): 잠시 후 다시 시도하거나 다른 AI를 사용해주세요.')
        throw new Error(`Gemini API error (${response.status}): ${e.error?.message || response.statusText}`)
      }
      const data = await response.json()
      if (!data.candidates?.[0]?.content) throw new Error('Gemini API 응답 형식이 올바르지 않습니다.')
      return extractAndParseJSON(data.candidates[0].content.parts[0].text, input)
    } catch (error) {
      if (attempt === 2) throw error
      console.warn(`[Gemini] 시도 ${attempt + 1}/3 실패, 재시도 중...`, error)
    }
  }
  throw new Error('Gemini API 재시도 실패')
}

async function generateWithTogether(input: GenerateInput, apiKey: string): Promise<RoutineData> {
  const prompt = buildPrompt(input)
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3-70b-chat-hf',
          messages: [
            { role: 'system', content: '당신은 전문 헬스 트레이너입니다.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      })
      if (!response.ok) throw new Error(`Together AI API error: ${response.statusText}`)
      const data = await response.json()
      return extractAndParseJSON(data.choices[0].message.content, input)
    } catch (error) {
      if (attempt === 2) throw error
      console.warn(`[Together] 시도 ${attempt + 1}/3 실패, 재시도 중...`, error)
    }
  }
  throw new Error('Together AI API 재시도 실패')
}

// ─────────────────────────────────────────────────────────
//  JSON 파싱 유틸
// ─────────────────────────────────────────────────────────

function extractAndParseJSON(text: string, input: GenerateInput): RoutineData {
  let content: Record<string, unknown>
  try {
    content = JSON.parse(text)
  } catch {
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonBlock = codeBlock ? codeBlock[1] : text.match(/\{[\s\S]*\}/)?.[0]
    if (!jsonBlock) throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.')
    try {
      content = JSON.parse(jsonBlock)
    } catch {
      throw new Error('AI 응답에서 유효한 JSON을 파싱할 수 없습니다.')
    }
  }
  return validateRoutine(parseAIResponse(content, input))
}

// ─────────────────────────────────────────────────────────
//  루틴 검증
// ─────────────────────────────────────────────────────────

function validateRoutine(routine: RoutineData): RoutineData {
  for (const day of routine.days) {
    if (day.exercises.length > 6) {
      throw new Error(`${day.day}: 운동 6개 초과`)
    }

    const names = new Set<string>()

    for (const ex of day.exercises) {
      if (names.has(ex.name)) {
        throw new Error(`${day.day}: 중복 운동 감지`)
      }
      names.add(ex.name)

      if (ex.sets > 6) {
        throw new Error(`${day.day}: 비정상 세트 수`)
      }
    }
  }

  return routine
}

// ─────────────────────────────────────────────────────────
//  상수
// ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  chest: '가슴', shoulder: '어깨', back: '등', legs: '하체', arms: '팔',
}
const SUB_LABELS: Record<string, string> = {
  machine: '머신', barbell: '바벨', dumbbell: '덤벨',
}
// 부위 표시 순서
const CATEGORY_ORDER = ['가슴', '어깨', '등', '하체', '팔'] as const

// ─────────────────────────────────────────────────────────
//  기구 맵 생성
//  { '가슴': { '바벨': ['벤치프레스'], '머신': ['체스트프레스'], '덤벨': [] }, ... }
// ─────────────────────────────────────────────────────────

function buildEquipmentMap(selectedEquipment: string[]): Record<string, Record<string, string[]>> {
  const result: Record<string, Record<string, string[]>> = {}
  const ensure = (cat: string) => {
    if (!result[cat]) result[cat] = { 머신: [], 바벨: [], 덤벨: [] }
  }

  selectedEquipment.forEach((id) => {
    if (id.startsWith('custom-')) {
      const parts = id.split('-')
      const catLabel = CATEGORY_LABELS[parts[1]] ?? parts[1]
      ensure(catLabel)
      if (parts.length >= 4 && ['machine', 'barbell', 'dumbbell'].includes(parts[2])) {
        result[catLabel][SUB_LABELS[parts[2]]].push(parts.slice(3).join('-'))
      } else {
        result[catLabel]['머신'].push(parts.slice(2).join('-'))
      }
      return
    }
    for (const [categoryId, categoryExercises] of Object.entries(exercisesByCategory)) {
      for (const [subCategory, exercises] of Object.entries(categoryExercises)) {
        const eq = (exercises as Array<{ id: string; name: string }>).find((e) => e.id === id)
        if (eq) {
          const catLabel = CATEGORY_LABELS[categoryId] ?? categoryId
          const subLabel = SUB_LABELS[subCategory] ?? subCategory
          ensure(catLabel)
          result[catLabel][subLabel].push(eq.name)
          return
        }
      }
    }
  })

  return result
}

// ─────────────────────────────────────────────────────────
//  선택된 부위 추출 (기구가 1개 이상 있는 부위만)
// ─────────────────────────────────────────────────────────

function getSelectedCategories(equipMap: Record<string, Record<string, string[]>>): string[] {
  return CATEGORY_ORDER.filter(
    (cat) => equipMap[cat] && Object.values(equipMap[cat]).some((names) => names.length > 0),
  )
}

// ─────────────────────────────────────────────────────────
//  Day 플랜 생성 — 선택된 부위만으로 사이클 조립
// ─────────────────────────────────────────────────────────

function buildSplitDayPlan(
  split: string,
  focus: string,
  frequency: number,
  selectedCats: string[],
): { dayPlans: Array<{ dayLabel: string; muscles: string; note?: string }>; cycleLength: number } {

  const splitNum = parseInt(split)

  if (selectedCats.length === 0) {
    return { dayPlans: [{ dayLabel: 'Day 1', muscles: '기구 없음' }], cycleLength: 1 }
  }

  const upper = selectedCats.filter((c) => ['가슴', '어깨', '등', '팔'].includes(c))
  const lower = selectedCats.filter((c) => c === '하체')

  // ─────────────────────────────
  // 기본 사이클 생성
  // ─────────────────────────────

  let cycleTemplate: string[] = []

  if (splitNum === 0) {
    cycleTemplate = [selectedCats.join(' + ')]

  } else if (splitNum === 2) {
    if (upper.length) cycleTemplate.push(upper.join(' + '))
    if (lower.length) cycleTemplate.push(lower.join(' + '))

  } else if (splitNum === 3) {
    const g1 = selectedCats.filter(c => ['가슴', '어깨'].includes(c)).join(' + ')
    const g2 = selectedCats.filter(c => ['등', '팔'].includes(c)).join(' + ')
    const g3 = lower.join(' + ')
    cycleTemplate = [g1, g2, g3].filter(Boolean)

  } else if (splitNum === 4) {
    const g1 = selectedCats.filter(c => c === '가슴').join(' + ')
    const g2 = selectedCats.filter(c => c === '등').join(' + ')
    const g3 = selectedCats.filter(c => ['어깨', '팔'].includes(c)).join(' + ')
    const g4 = lower.join(' + ')
    cycleTemplate = [g1, g2, g3, g4].filter(Boolean)

  } else {
    cycleTemplate = selectedCats.slice()
  }

  // ─────────────────────────────
  // 🔥 중심 로직: Day 빈도 증가
  // ─────────────────────────────

  const focusMap: Record<string, string[]> = {
    upper: ['가슴', '어깨', '등', '팔'],
    lower: ['하체'],
    glutes: ['하체'],
  }

  const focusTargets = focusMap[focus] || []

  const focusDays = cycleTemplate.filter(day =>
    focusTargets.some(target => day.includes(target))
  )

  // 중심 Day가 1개뿐이면 → 하나 더 복제
  if (focusDays.length === 1 && cycleTemplate.length >= 2) {
    cycleTemplate.push(focusDays[0])
  }

  // ─────────────────────────────
  // Day 구성
  // ─────────────────────────────

  const cycleLength = cycleTemplate.length

  const dayPlans: Array<{ dayLabel: string; muscles: string; note?: string }> = []

  for (let i = 0; i < frequency; i++) {
    const muscles = cycleTemplate[i % cycleLength]
    const cycleRound = Math.floor(i / cycleLength) + 1

    const note = cycleRound > 1
      ? `사이클 ${cycleRound}회차: 이전과 다른 변형 동작`
      : undefined

    dayPlans.push({
      dayLabel: `Day ${i + 1}`,
      muscles,
      note,
    })
  }

  return { dayPlans, cycleLength }
}


// ─────────────────────────────────────────────────────────
//  프롬프트 생성
// ─────────────────────────────────────────────────────────

const EXPERIENCE_CONFIG = {
  beginner: {
    label: '초보',
    baseCount: '3~4',
    setRange: '3세트',
    focusSet: '4세트',
    compoundLimit: 1,
    description: '헬스 입문 단계 — 머신 위주, 폼 안정, 낮은 볼륨',
  },
  intermediate: {
    label: '중급',
    baseCount: '4~6',
    setRange: '3~4세트',
    focusSet: '4~5세트',
    compoundLimit: 2,
    description: '운동 경험 있음 — 균형 잡힌 볼륨과 바벨 포함',
  },
  advanced: {
    label: '고급',
    baseCount: '5~6',
    setRange: '4세트',
    focusSet: '5세트',
    compoundLimit: 3,
    description: '고강도 훈련 가능 — 높은 볼륨과 복합 운동 중심',
  },
} as const

function buildPrompt(input: GenerateInput): string {
  const { selectedEquipment, frequency, split, focus, experienceLevel } = input
  const frequencyNum = parseInt(frequency)
  const splitNum = parseInt(split)

  const exp = EXPERIENCE_CONFIG[experienceLevel]

  const equipMap = buildEquipmentMap(selectedEquipment)
  const selectedCats = getSelectedCategories(equipMap)
  const { dayPlans, cycleLength } = buildSplitDayPlan(split, focus, frequencyNum, selectedCats)

  const equipText = selectedCats
    .map((cat) => {
      const subs = equipMap[cat]
      const lines = Object.entries(subs)
        .filter(([, names]) => names.length > 0)
        .map(([type, names]) => `  ${type}: ${names.join(', ')}`)
        .join('\n')
      return lines ? `[${cat}]\n${lines}` : null
    })
    .filter(Boolean)
    .join('\n\n') || '선택된 기구 없음'

  const focusLabel: Record<string, string> = {
    lower: '하체',
    upper: '상체',
    glutes: '둔근(엉덩이)',
  }

  const focusKr = focusLabel[focus] ?? focus

  const cycleNote =
    frequencyNum > cycleLength
      ? `주 ${frequencyNum}회 → ${cycleLength}일 사이클 반복`
      : `총 ${frequencyNum}일`

  const dayPlanText = dayPlans
    .map(({ dayLabel, muscles, note }) =>
      note
        ? `  ${dayLabel}: ${muscles}\n     (${note})`
        : `  ${dayLabel}: ${muscles}`,
    )
    .join('\n')

  return `
당신은 전문 헬스 트레이너입니다.
사용자의 헬스장 기구 목록을 보고, 그 기구들로만 운동 루틴을 JSON으로 작성하세요.

═══════════════════════════════════════
  사용자 경험 수준
═══════════════════════════════════════
  수준: ${exp.label}
  설명: ${exp.description}

═══════════════════════════════════════
  사용자가 선택한 기구 목록
═══════════════════════════════════════
${equipText}

중요: 위 목록에 있는 기구로 할 수 있는 운동만 포함하세요.
목록에 없는 기구가 필요한 운동은 절대 넣지 마세요.

═══════════════════════════════════════
  운동 조건
═══════════════════════════════════════
  빈도: 주 ${frequencyNum}회 (${cycleNote})
  분할: ${splitNum}분할
  중점 부위: ${focusKr}

═══════════════════════════════════════
  Day별 부위 배정
═══════════════════════════════════════
${dayPlanText}

★ 중점 부위 Day:
해당 부위 운동 1~2개 추가 + 세트 1개 추가

═══════════════════════════════════════
  작성 규칙
═══════════════════════════════════════
1. 운동 이름 형식:
   "기구이름 [부위] (타입)"

2. 하루 운동 수:
   ${exp.baseCount}개 (최대 6개 초과 금지)

3. 세트:
   기본 ${exp.setRange}
   중점 부위 ${exp.focusSet}

4. 반복:
   복합 운동 6~10회
   고립 운동 10~15회

5. 휴식:
   복합 운동 90초
   고립 운동 60초

6. 복합 운동은 하루 ${exp.compoundLimit}개까지만 허용

7. 같은 Day 안에서 동일 운동 반복 금지

8. 사이클 반복 시 변형 동작 사용

9. 코어/복근 운동 포함 금지

═══════════════════════════════════════
  루틴 설계 규칙 (절대 위반 금지)
═══════════════════════════════════════
1. 하루 최대 운동 6개 초과 금지
2. 한 부위당 하루 최대 3개 운동
3. 상체 Day에 3부위 이상 과도하게 몰지 말 것
4. 같은 부위를 연속 Day에 고강도로 반복 금지
5. 데드리프트는 주 1회만 허용
6. 스쿼트와 데드리프트 같은 Day 금지

═══════════════════════════════════════
  운동 과학 규칙 (절대 위반 금지)
═══════════════════════════════════════
AI는 실제 트레이너처럼 균형을 맞춰야 합니다.

1. 한 부위 하루 총 세트 6세트 초과 금지
   (예: 가슴 운동 3개 × 4세트 = 12세트 ❌ 금지)

2. 가슴 운동 3개 이상 같은 날 금지
   (가슴은 하루 최대 2개까지만)

3. 등 운동은 같은 로우 패턴 2개 초과 금지
   (예: 시티드 로우 + 케이블 로우 + 바벨 로우 ❌ 금지)

4. 상체 Day는 최소 2부위 이상 포함
   (가슴만 또는 어깨만 같은 날 ❌ 금지)

5. 하체 2일이면:
   - 첫날 = 쿼드(앞벅지) 중심
   - 두번째 = 햄스트링/둔근 중심
   (같은 패턴 반복 금지)

6. 복합 운동은 항상 먼저 배치
   (예: 벤치프레스 → 덤벨 플라이 순서)

7. 같은 자극 패턴 반복 금지
   예: 벤치프레스 + 체스트프레스 + 스미스벤치 ❌
   (모두 가슴 수평 프레스 패턴)

8. 머신/바벨/덤벨 자극 섞기
   (같은 타입만 사용하지 말고 다양하게)

9. 과도한 볼륨 금지 — 중급 기준 회복 가능 수준 유지
   (초보자는 더 낮은 볼륨, 고급자는 적절한 볼륨)

10. 루틴은 실제 사람이 수행 가능해야 함
    (비현실적인 루틴 생성 시 실패로 간주)

AI는 보기 좋은 루틴이 아니라
실제로 성장 가능한 루틴을 만들어야 합니다.

비현실적인 루틴 생성 시 실패로 간주됩니다.

═══════════════════════════════════════
  선택된 기구 강제 규칙 (절대 위반 금지)
═══════════════════════════════════════

1. AI는 반드시 사용자가 선택한 기구 목록에서만 운동을 선택해야 합니다.

2. 목록에 없는 운동이 1개라도 포함되면
   전체 루틴은 실패로 간주됩니다.

3. 각 Day는 배정된 부위(muscles)에 해당하는 기구만 사용해야 합니다.

   예:
   Day = "가슴 + 어깨"
   → 가슴/어깨 기구만 허용
   → 등/하체 운동 절대 금지

4. 특정 부위에 기구가 부족하면:
   - 다른 부위를 추가하지 말고
   - 가능한 범위 내에서 반복/변형 운동 사용

5. 존재하지 않는 기구를 상상해서 만들지 마세요.

6. 운동 이름은 반드시 아래 형식 유지:
   "운동명 [부위] (기구타입)"

7. 부위 라벨은 다음 중 하나만 허용:
   가슴 / 어깨 / 등 / 하체 / 팔

8. 기구 타입은 다음 중 하나만 허용:
   머신 / 바벨 / 덤벨

9. JSON에 존재하지 않는 부위나 타입이 나오면 실패

10. 규칙 위반 시:
    👉 루틴 생성 실패로 간주

═══════════════════════════════════════
  Day 구조 강제 규칙
═══════════════════════════════════════

AI는 먼저 Day 구조를 이해한 후 운동을 채워야 합니다.

1. Day에 명시된 부위 외 운동 추가 금지
2. Day 구조를 임의로 변경 금지
3. Day 개수 변경 금지
4. 순서 변경 금지
5. 없는 Day 생성 금지
6. Day 누락 금지

Day 구조는 절대 수정할 수 없습니다.
AI는 Day 구조를 채우는 역할만 합니다.

═══════════════════════════════════════
  응답 형식 (JSON만)
═══════════════════════════════════════
{
  "routineName": "${exp.label} ${splitNum}분할 ${frequencyNum}일 ${focusKr} 중점 루틴",
  "description": "루틴 설명 한두 문장",
  "days": [
    {
      "day": "Day 1",
      "focus": "가슴 + 어깨",
      "exercises": [
        { "name": "벤치프레스 [가슴] (바벨)", "sets": 4, "reps": 8, "rest": "90초" }
      ]
    }
  ],
  "tips": [
    "점진적 과부하를 적용하세요",
    "워밍업 필수",
    "자세 우선"
  ]
}

반드시 유효한 JSON만 출력하세요.
마크다운 코드 블록 사용 금지.
`.trim()
}

// ─────────────────────────────────────────────────────────
//  AI 응답 파싱
// ─────────────────────────────────────────────────────────

function parseAIResponse(content: Record<string, unknown>, input: GenerateInput): RoutineData {
  const days: DayRoutine[] = ((content.days as unknown[]) || []).map((day: unknown) => {
    const dayObj = day as Record<string, unknown>
    return {
      day: String(dayObj.day || `Day ${dayObj.dayNumber || 1}`),
      focus: String(dayObj.focus || dayObj.muscleGroups || ''),
      exercises: ((dayObj.exercises as unknown[]) || []).map((ex: unknown) => {
        const exObj = ex as Record<string, unknown>
        return {
          name: String(exObj.name || exObj.exercise || ''),
          sets: parseInt(String(exObj.sets)) || 3,
          reps: parseInt(String(exObj.reps)) || 10,
          rest: String(exObj.rest || exObj.restTime || '60초'),
        }
      }),
    }
  })
  return {
    routineName: (content.routineName as string) || `${input.split}분할 루틴`,
    description: (content.description as string) || '',
    days,
    tips: (content.tips as string[]) || [],
  }
}

// ─────────────────────────────────────────────────────────
//  메인 export
// ─────────────────────────────────────────────────────────

export async function generateRoutineWithAI(
  input: GenerateInput,
  config?: AIConfig,
): Promise<RoutineData> {
  const primaryProvider = (
    config?.provider ||
    (import.meta.env.VITE_AI_PROVIDER as AIProvider) ||
    'gemini'
  ) as AIProvider

  const apiKey = config?.apiKey || import.meta.env.VITE_AI_API_KEY
  const hasAnyKey =
    apiKey ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_OPENAI_API_KEY ||
    import.meta.env.VITE_GROQ_API_KEY

  if (!hasAnyKey) {
    throw new Error('AI API 키가 설정되지 않았습니다. VITE_AI_API_KEY 또는 각 제공자별 API 키를 설정하세요.')
  }

  const fallbackProviders: AIProvider[] = ['gemini', 'openai', 'groq']
  const providers = fallbackProviders.includes(primaryProvider)
    ? [primaryProvider, ...fallbackProviders.filter((p) => p !== primaryProvider)]
    : [primaryProvider, ...fallbackProviders]

  let lastError: Error | null = null

  for (const provider of providers) {
    try {
      let providerApiKey = apiKey
      if (provider === 'openai' && import.meta.env.VITE_OPENAI_API_KEY) providerApiKey = import.meta.env.VITE_OPENAI_API_KEY
      else if (provider === 'groq' && import.meta.env.VITE_GROQ_API_KEY) providerApiKey = import.meta.env.VITE_GROQ_API_KEY
      else if (provider === 'gemini' && import.meta.env.VITE_GEMINI_API_KEY) providerApiKey = import.meta.env.VITE_GEMINI_API_KEY

      console.log(`[AI] ${provider}로 루틴 생성 시도 중...`)

      switch (provider) {
        case 'groq': return await generateWithGroq(input, providerApiKey, config?.model)
        case 'openai': return await generateWithOpenAI(input, providerApiKey, config?.model)
        case 'claude': return await generateWithClaude(input, providerApiKey, config?.model)
        case 'gemini': return await generateWithGemini(input, providerApiKey)
        case 'together': return await generateWithTogether(input, providerApiKey)
        default: continue
      }
    } catch (error) {
      console.error(`[AI] ${provider} 실패:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))
      continue
    }
  }

  throw lastError || new Error('모든 AI 제공자에서 루틴 생성에 실패했습니다.')
}