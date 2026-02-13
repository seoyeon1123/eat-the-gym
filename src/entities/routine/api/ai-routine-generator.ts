import type { RoutineData, DayRoutine } from '@/widgets/routine-results'
import { exercisesByCategory } from '@/entities/equipment'

interface GenerateInput {
  selectedEquipment: string[]
  frequency: string
  split: string
  focus: string
}

// AI API 타입 정의
export type AIProvider = 'groq' | 'gemini' | 'openai' | 'claude' | 'together'

interface AIConfig {
  provider: AIProvider
  apiKey: string
  model?: string
}

/**
 * Groq API를 사용한 루틴 생성
 * 무료 티어: 월 14,400 요청 (매우 빠름)
 */
async function generateWithGroq(
  input: GenerateInput,
  apiKey: string,
  model?: string
): Promise<RoutineData> {
  const prompt = buildPrompt(input)
  
  // 환경 변수에서 모델 선택, 없으면 기본값 사용
  const selectedModel = model || 
    import.meta.env.VITE_GROQ_MODEL || 
    'llama-3.3-70b-versatile' // 최신 모델 (llama-3.1-70b-versatile은 deprecated됨)
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: '당신은 전문 헬스 트레이너입니다. 사용자의 요구사항에 맞는 운동 루틴을 JSON 형식으로 제공하세요. 반드시 유효한 JSON만 응답하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      // response_format은 일부 모델에서만 지원되므로 제거
      // response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: { message: response.statusText } }
    }
    const errorMessage = errorData.error?.message || errorData.message || response.statusText
    console.error('Groq API 에러 상세:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    })
    throw new Error(`Groq API error (${response.status}): ${errorMessage}`)
  }

  const data = await response.json()
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Groq API 응답 형식이 올바르지 않습니다.')
  }

  const contentText = data.choices[0].message.content
  
  // JSON 파싱 시도
  let content
  try {
    content = JSON.parse(contentText)
  } catch {
    // JSON이 아닌 경우, JSON 부분만 추출 시도
    const jsonMatch = contentText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        content = JSON.parse(jsonMatch[0])
      } catch {
        throw new Error('AI 응답에서 유효한 JSON을 파싱할 수 없습니다.')
      }
    } else {
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.')
    }
  }

  return parseAIResponse(content, input)
}

/**
 * OpenAI API를 사용한 루틴 생성
 * 가장 정확하고 유명한 AI (GPT-4o)
 * 무료 크레딧: $5 (신규 가입 시)
 */
async function generateWithOpenAI(
  input: GenerateInput,
  apiKey: string,
  model?: string
): Promise<RoutineData> {
  const prompt = buildPrompt(input)
  
  const selectedModel = model || 
    import.meta.env.VITE_OPENAI_MODEL || 
    'gpt-4o-mini' // 무료 크레딧으로 테스트 가능한 모델 (gpt-4o는 더 정확하지만 비쌈)
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: '당신은 전문 헬스 트레이너입니다. 사용자의 요구사항에 맞는 운동 루틴을 JSON 형식으로 제공하세요. 반드시 유효한 JSON만 응답하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: { message: response.statusText } }
    }
    const errorMessage = errorData.error?.message || errorData.message || response.statusText
    console.error('OpenAI API 에러 상세:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    })
    throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`)
  }

  const data = await response.json()
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('OpenAI API 응답:', data)
    throw new Error('OpenAI API 응답 형식이 올바르지 않습니다.')
  }

  const contentText = data.choices[0].message.content
  
  // JSON 파싱 시도
  let content
  try {
    content = JSON.parse(contentText)
  } catch {
    const jsonMatch = contentText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        content = JSON.parse(jsonMatch[0])
      } catch {
        throw new Error('AI 응답에서 유효한 JSON을 파싱할 수 없습니다.')
      }
    } else {
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.')
    }
  }

  return parseAIResponse(content, input)
}

/**
 * Anthropic Claude API를 사용한 루틴 생성
 * 매우 정확하고 신뢰성 높은 AI
 * 무료 크레딧: $5 (신규 가입 시)
 */
async function generateWithClaude(
  input: GenerateInput,
  apiKey: string,
  model?: string
): Promise<RoutineData> {
  const prompt = buildPrompt(input)
  
  const selectedModel = model || 
    import.meta.env.VITE_CLAUDE_MODEL || 
    'claude-3-5-sonnet-20241022' // 최신 Claude 모델 (claude-3-5-haiku는 더 저렴)
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: selectedModel,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `당신은 전문 헬스 트레이너입니다. 사용자의 요구사항에 맞는 운동 루틴을 JSON 형식으로 제공하세요.\n\n${prompt}\n\n반드시 유효한 JSON 형식으로만 응답하세요.`,
        },
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: { message: response.statusText } }
    }
    const errorMessage = errorData.error?.message || errorData.message || response.statusText
    console.error('Claude API 에러 상세:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    })
    throw new Error(`Claude API error (${response.status}): ${errorMessage}`)
  }

  const data = await response.json()
  
  if (!data.content || !data.content[0] || !data.content[0].text) {
    console.error('Claude API 응답:', data)
    throw new Error('Claude API 응답 형식이 올바르지 않습니다.')
  }

  const contentText = data.content[0].text
  
  // JSON 파싱 시도
  let content
  try {
    content = JSON.parse(contentText)
  } catch {
    const jsonMatch = contentText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        content = JSON.parse(jsonMatch[0])
      } catch {
        throw new Error('AI 응답에서 유효한 JSON을 파싱할 수 없습니다.')
      }
    } else {
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.')
    }
  }

  return parseAIResponse(content, input)
}

/**
 * Google Gemini API를 사용한 루틴 생성
 * 무료 티어: 분당 15 요청, 일일 1,500 요청
 */
async function generateWithGemini(
  input: GenerateInput,
  apiKey: string
): Promise<RoutineData> {
  const prompt = buildPrompt(input)
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `당신은 전문 헬스 트레이너입니다. 다음 요구사항에 맞는 운동 루틴을 JSON 형식으로 제공하세요.\n\n${prompt}\n\n반드시 유효한 JSON 형식으로만 응답하세요.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    }
  )

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: { message: response.statusText } }
    }
    
    const errorMessage = errorData.error?.message || errorData.message || response.statusText
    
    // 429 에러인 경우 특별한 메시지
    if (response.status === 429) {
      throw new Error(`Gemini API 할당량 초과 (429): 요청이 너무 많습니다. 잠시 후 다시 시도하거나 다른 AI 제공자(Groq, OpenAI 등)를 사용해주세요.`)
    }
    
    console.error('Gemini API 에러 상세:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    })
    throw new Error(`Gemini API error (${response.status}): ${errorMessage}`)
  }

  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    console.error('Gemini API 응답:', data)
    throw new Error('Gemini API 응답 형식이 올바르지 않습니다.')
  }
  
  const contentText = data.candidates[0].content.parts[0].text
  
  // JSON 파싱 시도
  let content
  try {
    content = JSON.parse(contentText)
  } catch {
    // JSON이 아닌 경우, JSON 부분만 추출 시도
    const jsonMatch = contentText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        content = JSON.parse(jsonMatch[0])
      } catch {
        throw new Error('AI 응답에서 유효한 JSON을 파싱할 수 없습니다.')
      }
    } else {
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.')
    }
  }
  
  return parseAIResponse(content, input)
}

/**
 * Together AI를 사용한 루틴 생성
 * 무료 크레딧: $25 (충분함)
 */
async function generateWithTogether(
  input: GenerateInput,
  apiKey: string
): Promise<RoutineData> {
  const prompt = buildPrompt(input)
  
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3-70b-chat-hf',
      messages: [
        {
          role: 'system',
          content: '당신은 전문 헬스 트레이너입니다. 사용자의 요구사항에 맞는 운동 루틴을 JSON 형식으로 제공하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    throw new Error(`Together AI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = JSON.parse(data.choices[0].message.content)
  return parseAIResponse(content, input)
}

/**
 * AI 프롬프트 생성
 */
function buildPrompt(input: GenerateInput): string {
  const { selectedEquipment, frequency, split, focus } = input
  
  // 부위별, 서브카테고리별로 기구 정리
  const equipmentByCategory: Record<string, Record<string, string[]>> = {}
  
  selectedEquipment.forEach((id) => {
    // 커스텀 기구인 경우
    if (id.startsWith('custom-')) {
      const parts = id.split('-')
      if (parts.length >= 4 && ['machine', 'barbell', 'dumbbell'].includes(parts[2])) {
        // custom-{categoryId}-{subCategory}-{equipmentName}
        const categoryId = parts[1]
        const subCategory = parts[2]
        const equipmentName = parts.slice(3).join('-')
        
        if (!equipmentByCategory[categoryId]) {
          equipmentByCategory[categoryId] = { machine: [], barbell: [], dumbbell: [] }
        }
        if (!equipmentByCategory[categoryId][subCategory]) {
          equipmentByCategory[categoryId][subCategory] = []
        }
        equipmentByCategory[categoryId][subCategory].push(equipmentName)
      } else {
        // custom-{categoryId}-{equipmentName} (서브카테고리 없음)
        const categoryId = parts[1]
        const equipmentName = parts.slice(2).join('-')
        
        if (!equipmentByCategory[categoryId]) {
          equipmentByCategory[categoryId] = { machine: [], barbell: [], dumbbell: [] }
        }
        // 서브카테고리 없으면 machine에 추가
        equipmentByCategory[categoryId].machine.push(equipmentName)
      }
    } else {
      // 기본 기구인 경우
      for (const [categoryId, categoryExercises] of Object.entries(exercisesByCategory)) {
        for (const [subCategory, exercises] of Object.entries(categoryExercises)) {
          const eq = exercises.find((e) => e.id === id)
          if (eq) {
            if (!equipmentByCategory[categoryId]) {
              equipmentByCategory[categoryId] = { machine: [], barbell: [], dumbbell: [] }
            }
            equipmentByCategory[categoryId][subCategory].push(eq.name)
            break
          }
        }
      }
    }
  })

  // 부위별로 정리된 기구를 텍스트로 변환
  const categoryLabels: Record<string, string> = {
    chest: '가슴',
    shoulder: '어깨',
    back: '등',
    legs: '하체',
    arms: '팔',
  }

  const subCategoryLabels: Record<string, string> = {
    machine: '머신',
    barbell: '바벨',
    dumbbell: '덤벨',
  }

  const equipmentDetails = Object.entries(equipmentByCategory)
    .map(([categoryId, subCategories]) => {
      const categoryName = categoryLabels[categoryId] || categoryId
      const subCategoryList = Object.entries(subCategories)
        .filter(([, exercises]) => exercises.length > 0)
        .map(([subCategory, exercises]) => {
          const subCategoryName = subCategoryLabels[subCategory] || subCategory
          return `${subCategoryName}: ${exercises.join(', ')}`
        })
        .join(' | ')
      return `${categoryName} - ${subCategoryList}`
    })
    .join('\n')

  // focus에 따라 3분할 방식 조정
  const getSplitLabel = (split: string, focus: string): string => {
    if (split === '3') {
      if (focus === 'upper') {
        return '3분할 (가슴+삼두 / 등+이두 / 하체+어깨)'
      } else {
        // lower 또는 glutes: 하체 위주
        return '3분할 (가슴+어깨+삼두 / 등+이두 / 하체)'
      }
    }
    
    const splitLabels: Record<string, string> = {
      '0': '무분할 (전신)',
      '2': '2분할 (상체/하체)',
      '4': '4분할',
      '5': '5분할 (가슴 / 등 / 어깨 / 하체 / 팔)',
    }
    return splitLabels[split] || split + '분할'
  }

  const splitLabel = getSplitLabel(split, focus)

  const focusLabels: Record<string, string> = {
    'lower': '하체',
    'upper': '상체',
    'glutes': '엉덩이',
  }

  // 디버깅: 전달되는 값 확인
  console.log('[AI 프롬프트] 사용자 선택 값:', {
    selectedEquipmentCount: selectedEquipment.length,
    frequency,
    split,
    focus,
    equipmentDetails,
  })

  return `당신은 전문 헬스 트레이너입니다. 다음 조건에 **정확히** 맞는 맞춤형 운동 루틴을 생성해주세요.

**사용 가능한 기구** (부위별, 타입별로 정리):
${equipmentDetails || '없음 (기구를 선택해주세요)'}

**운동 빈도**: 주 ${frequency}회 (총 ${frequency}일)
**분할 방식**: ${splitLabel}
**중심**: ${focusLabels[focus] || focus}

**요구사항**:
1. 반드시 위에 나열된 기구만 사용하세요. 다른 기구는 사용하지 마세요. 각 운동의 이름은 정확히 위에 나열된 이름을 사용하세요.
2. **코어 운동은 절대 포함하지 마세요.** 코어 카테고리는 제거되었으므로 코어 관련 운동을 추가하지 마세요.
3. ${split === '0' ? '무분할 (전신)' : split + '분할'} 방식에 맞춰 근육 그룹을 배분하세요.
   ${split === '0' 
     ? '- 무분할: 매일 전신 운동 (가슴, 어깨, 등, 하체, 팔을 모두 포함)'
     : split === '2'
     ? '- 2분할: 상체/하체로 나눔 (Day 1: 상체, Day 2: 하체)'
     : split === '3'
     ? focus === 'upper'
       ? '- 3분할: 가슴+삼두 / 등+이두 / 하체+어깨로 나눔 (Day 1: 가슴+삼두, Day 2: 등+이두, Day 3: 하체+어깨) - 상체 중심이므로 어깨를 하체와 묶어 상체를 더 많이 건드립니다.'
       : '- 3분할: 가슴+어깨+삼두 / 등+이두 / 하체로 나눔 (Day 1: 가슴+어깨+삼두, Day 2: 등+이두, Day 3: 하체) - 하체 중심이므로 하체를 별도로 분리합니다.'
     : split === '4'
     ? '- 4분할: 가슴 / 등 / 어깨 / 하체로 나눔'
     : split === '5'
     ? '- 5분할: 가슴 / 등 / 어깨 / 하체 / 팔로 나눔'
     : ''}
4. 주 ${frequency}회 운동하므로, ${split === '0' 
  ? '매일 전신 운동을 하세요'
  : parseInt(split) >= parseInt(frequency)
  ? `${split}분할을 ${frequency}일 동안 반복하세요 (예: 3분할이면 Day 1, 2, 3을 반복)`
  : `${split}분할을 반복하되 총 ${frequency}일이 되도록 하세요`}.
5. **중심(${focusLabels[focus] || focus})**: 
   ${focus === 'lower' 
     ? '- 하체 중심: 하체 운동의 비중을 높이되, 분할 방식에 맞춰 다른 부위도 포함하세요. 예를 들어 3분할이면 Day 3(하체)에 더 많은 하체 운동을 배치하고, Day 1, 2에도 하체 보조 운동을 포함할 수 있습니다.'
     : focus === 'upper'
     ? '- 상체 중심: 상체 운동의 비중을 높이되, 분할 방식에 맞춰 하체도 포함하세요.'
     : focus === 'glutes'
     ? '- 엉덩이 중심: 엉덩이 운동의 비중을 높이되, 분할 방식에 맞춰 다른 부위도 포함하세요.'
     : ''}
6. 세트수, 반복수, 휴식시간: 3-4세트, 8-12회, 60-90초 휴식 (근비대 기준)
7. 각 운동 이름 옆에 타입(머신/바벨/덤벨)을 표시하세요. 예: "벤치프레스 (바벨)", "체스트프레스 (머신)"

**응답 형식** (반드시 유효한 JSON만 응답):
{
  "routineName": "루틴 이름 (예: 근비대 3분할 루틴)",
  "description": "이 루틴에 대한 간단한 설명",
  "days": [
    {
      "day": "Day 1",
      "focus": "가슴 + 어깨 + 삼두",
      "exercises": [
        {
          "name": "벤치프레스",
          "sets": 4,
          "reps": 10,
          "rest": "90초"
        },
        {
          "name": "숄더프레스 머신",
          "sets": 3,
          "reps": 12,
          "rest": "60초"
        }
      ]
    }
  ],
  "tips": [
    "점진적 과부하를 적용해 매주 무게나 반복수를 조금씩 늘려보세요.",
    "운동 전 충분한 워밍업을 하세요.",
    "올바른 자세를 유지하는 것이 가장 중요합니다."
  ]
}

중요: 반드시 유효한 JSON 형식으로만 응답하고, 다른 설명이나 텍스트는 포함하지 마세요.`
}

/**
 * AI 응답을 RoutineData로 파싱
 */
function parseAIResponse(content: Record<string, unknown>, input: GenerateInput): RoutineData {
  // AI 응답 검증 및 변환
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

/**
 * AI를 사용한 루틴 생성 (메인 함수)
 * Fallback: Gemini → OpenAI → Groq 순서로 시도
 */
export async function generateRoutineWithAI(
  input: GenerateInput,
  config?: AIConfig
): Promise<RoutineData> {
  // 환경 변수에서 설정 가져오기
  const primaryProvider = (config?.provider || 
    (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 
    'gemini') as AIProvider
  
  const apiKey = config?.apiKey || import.meta.env.VITE_AI_API_KEY

  // 각 제공자별 API 키 확인
  const hasGeminiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY
  const hasOpenAIKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY
  const hasGroqKey = apiKey || import.meta.env.VITE_GROQ_API_KEY

  // 최소한 하나의 API 키는 있어야 함
  if (!apiKey && !hasGeminiKey && !hasOpenAIKey && !hasGroqKey) {
    throw new Error('AI API 키가 설정되지 않았습니다. VITE_AI_API_KEY 또는 각 제공자별 API 키(VITE_GEMINI_API_KEY, VITE_OPENAI_API_KEY, VITE_GROQ_API_KEY)를 설정하세요.')
  }

  // Fallback 순서: Gemini → OpenAI → Groq
  const fallbackProviders: AIProvider[] = ['gemini', 'openai', 'groq']
  
  // 기본 제공자가 fallback 목록에 없으면 맨 앞에 추가
  const providers = fallbackProviders.includes(primaryProvider)
    ? [primaryProvider, ...fallbackProviders.filter(p => p !== primaryProvider)]
    : [primaryProvider, ...fallbackProviders]

  let lastError: Error | null = null

  for (const provider of providers) {
    try {
      // 각 제공자별로 별도의 API 키가 있으면 사용, 없으면 기본 키 사용
      let providerApiKey = apiKey
      if (provider === 'openai' && import.meta.env.VITE_OPENAI_API_KEY) {
        providerApiKey = import.meta.env.VITE_OPENAI_API_KEY
      } else if (provider === 'groq' && import.meta.env.VITE_GROQ_API_KEY) {
        providerApiKey = import.meta.env.VITE_GROQ_API_KEY
      } else if (provider === 'gemini' && import.meta.env.VITE_GEMINI_API_KEY) {
        providerApiKey = import.meta.env.VITE_GEMINI_API_KEY
      }

      console.log(`[AI] ${provider}로 루틴 생성 시도 중...`)
      
      switch (provider) {
        case 'groq':
          return await generateWithGroq(input, providerApiKey, config?.model)
        case 'openai':
          return await generateWithOpenAI(input, providerApiKey, config?.model)
        case 'claude':
          return await generateWithClaude(input, providerApiKey, config?.model)
        case 'gemini':
          return await generateWithGemini(input, providerApiKey)
        case 'together':
          return await generateWithTogether(input, providerApiKey)
        default:
          continue // 다음 제공자 시도
      }
    } catch (error) {
      console.error(`[AI] ${provider} 실패:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // 429 에러나 할당량 초과 에러가 아니면 계속 시도
      const errorMessage = lastError.message.toLowerCase()
      if (errorMessage.includes('429') || errorMessage.includes('할당량') || errorMessage.includes('quota')) {
        console.log(`[AI] ${provider} 할당량 초과, 다음 제공자로 전환...`)
        continue // 다음 제공자 시도
      }
      
      // 다른 에러도 일단 다음 제공자 시도
      continue
    }
  }

  // 모든 제공자가 실패한 경우
  throw lastError || new Error('모든 AI 제공자에서 루틴 생성에 실패했습니다.')
}
