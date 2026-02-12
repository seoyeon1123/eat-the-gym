import type { RoutineData, DayRoutine } from '@/widgets/routine-results'
import { equipmentCategories } from '@/entities/equipment'

interface GenerateInput {
  selectedEquipment: string[]
  frequency: string
  split: string
  goal: string
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
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = JSON.parse(data.candidates[0].content.parts[0].text)
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
  const { selectedEquipment, frequency, split, goal } = input
  
  // 선택한 기구 이름 가져오기 (기본 기구 + 커스텀 기구)
  const equipmentNames = selectedEquipment
    .map((id) => {
      // 커스텀 기구인 경우 (custom-{categoryId}-{equipmentName} 형식)
      if (id.startsWith('custom-')) {
        const parts = id.split('-')
        // custom-{categoryId}-{equipmentName} 형식에서 equipmentName 추출
        return parts.slice(2).join('-')
      }
      // 기본 기구인 경우
      for (const cat of equipmentCategories) {
        const eq = cat.equipment.find((e) => e.id === id)
        if (eq) return eq.name
      }
      return null
    })
    .filter(Boolean)
    .join(', ')

  const goalLabels: Record<string, string> = {
    hypertrophy: '근비대',
    'fat-loss': '체지방 감량',
    beginner: '초보자 루틴',
    maintenance: '유지 운동',
  }

  const splitLabels: Record<string, string> = {
    '2': '2분할 (상체/하체)',
    '3': '3분할 (가슴+어깨+삼두 / 등+이두+코어 / 하체+코어)',
    '5': '5분할 (가슴 / 등 / 어깨 / 하체 / 팔+코어)',
  }

  return `당신은 전문 헬스 트레이너입니다. 다음 조건에 맞는 맞춤형 운동 루틴을 생성해주세요.

**사용 가능한 기구**: ${equipmentNames || '없음 (기구를 선택해주세요)'}
**운동 빈도**: 주 ${frequency}회
**분할 방식**: ${splitLabels[split] || split + '분할'}
**운동 목표**: ${goalLabels[goal] || goal}

**요구사항**:
1. 반드시 위에 나열된 기구만 사용하세요. 다른 기구는 사용하지 마세요.
2. ${split}분할 방식에 맞춰 근육 그룹을 적절히 배분하세요.
3. 주 ${frequency}회 운동하므로, ${split}분할을 반복하세요.
4. 목표(${goalLabels[goal]})에 맞는 세트수, 반복수, 휴식시간을 설정하세요:
   - 근비대: 3-4세트, 8-12회, 60-90초 휴식
   - 체지방 감량: 3-4세트, 12-15회, 30-45초 휴식
   - 초보자: 3세트, 10-12회, 60-90초 휴식
   - 유지: 3세트, 10-12회, 60초 휴식

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
 */
export async function generateRoutineWithAI(
  input: GenerateInput,
  config?: AIConfig
): Promise<RoutineData> {
  // 환경 변수에서 설정 가져오기
  const provider = (config?.provider || 
    (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 
    'groq') as AIProvider
  
  const apiKey = config?.apiKey || import.meta.env.VITE_AI_API_KEY

  if (!apiKey) {
    throw new Error('AI API 키가 설정되지 않았습니다. VITE_AI_API_KEY 환경 변수를 설정하세요.')
  }

  try {
    switch (provider) {
      case 'groq':
        return await generateWithGroq(input, apiKey, config?.model)
      case 'openai':
        return await generateWithOpenAI(input, apiKey, config?.model)
      case 'claude':
        return await generateWithClaude(input, apiKey, config?.model)
      case 'gemini':
        return await generateWithGemini(input, apiKey)
      case 'together':
        return await generateWithTogether(input, apiKey)
      default:
        throw new Error(`지원하지 않는 AI 제공자: ${provider}`)
    }
  } catch (error) {
    console.error('AI 루틴 생성 실패:', error)
    throw error
  }
}
