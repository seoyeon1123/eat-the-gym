import type { AIProvider } from '@/entities/routine/api'

export interface TrainerMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AskTrainerOptions {
  provider?: AIProvider
  apiKey?: string
}

function buildChatPrompt(question: string, history: TrainerMessage[]): string {
  const historyText =
    history.length === 0
      ? ''
      : history
          .map((m) => `${m.role === 'user' ? '사용자' : '트레이너'}: ${m.content}`)
          .join('\n') + '\n\n'

  return (
    '당신은 한국어로 답변하는 최고 수준의 헬스 트레이너입니다.\n' +
    '다음 원칙을 지켜서 **짧고 간결하게**, 그리고 **마크다운 기호 없이 평문으로만** 답변하세요:\n' +
    '- 답변은 최대 3줄 이내로, 각 줄은 한두 문장만 사용합니다.\n' +
    '- 줄 앞에 *, -, 숫자. 같은 마크다운 기호를 절대 사용하지 않습니다.\n' +
    '- 불필요한 장황한 설명은 피하고, 사용자가 바로 적용할 수 있는 실전 팁 위주로 답합니다.\n' +
    '- 의학적 진단은 하지 말고, 통증이 심하거나 오래가면 전문의 상담을 권유합니다.\n' +
    '- 예시 형식: "첫째, ~입니다. 둘째, ~하세요. 셋째, ~을 주의하세요." 와 같이 자연스러운 문장으로만 작성합니다.\n\n' +
    (historyText ? `지금까지의 대화:\n${historyText}` : '') +
    `사용자 질문: ${question}\n\n` +
    '위 질문에 대해 한국어로 친절하게 답변하세요.'
  )
}

/**
 * Gemini를 사용한 AI 트레이너 챗봇
 */
async function askWithGemini(
  question: string,
  history: TrainerMessage[],
  apiKey: string,
): Promise<string> {
  const prompt = buildChatPrompt(question, history)

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
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
        },
      }),
    },
  )

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: { message: response.statusText } }
    }
    const errorMessage = errorData.error?.message || errorData.message || response.statusText
    
    if (response.status === 429) {
      throw new Error(`Gemini API 할당량 초과 (429): 요청이 너무 많습니다.`)
    }
    
    throw new Error(`Gemini API error (${response.status}): ${errorMessage}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text || typeof text !== 'string') {
    throw new Error('Gemini 응답 형식이 올바르지 않습니다.')
  }

  return text.trim()
}

/**
 * OpenAI를 사용한 AI 트레이너 챗봇
 */
async function askWithOpenAI(
  question: string,
  history: TrainerMessage[],
  apiKey: string,
): Promise<string> {
  const selectedModel = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'
  
  // OpenAI 형식으로 메시지 변환
  const messages = [
    {
      role: 'system' as const,
      content: '당신은 한국어로 답변하는 최고 수준의 헬스 트레이너입니다. 짧고 간결하게, 마크다운 기호 없이 평문으로만 답변하세요.',
    },
    ...history.map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user' as const,
      content: question,
    },
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: 0.6,
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
    throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content

  if (!text || typeof text !== 'string') {
    throw new Error('OpenAI 응답 형식이 올바르지 않습니다.')
  }

  return text.trim()
}

/**
 * Groq를 사용한 AI 트레이너 챗봇
 */
async function askWithGroq(
  question: string,
  history: TrainerMessage[],
  apiKey: string,
): Promise<string> {
  const selectedModel = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'
  
  // Groq 형식으로 메시지 변환
  const messages = [
    {
      role: 'system' as const,
      content: '당신은 한국어로 답변하는 최고 수준의 헬스 트레이너입니다. 짧고 간결하게, 마크다운 기호 없이 평문으로만 답변하세요.',
    },
    ...history.map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user' as const,
      content: question,
    },
  ]

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: 0.6,
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
    throw new Error(`Groq API error (${response.status}): ${errorMessage}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content

  if (!text || typeof text !== 'string') {
    throw new Error('Groq 응답 형식이 올바르지 않습니다.')
  }

  return text.trim()
}

/**
 * AI 트레이너 챗봇 (메인 함수)
 * Fallback: Gemini → OpenAI → Groq 순서로 시도
 */
export async function askTrainerWithAI(
  question: string,
  history: TrainerMessage[] = [],
  options?: AskTrainerOptions,
): Promise<string> {
  const primaryProvider = (options?.provider ||
    (import.meta.env.VITE_AI_PROVIDER as AIProvider) ||
    'gemini') as AIProvider

  const apiKey = options?.apiKey || import.meta.env.VITE_AI_API_KEY

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

      if (!providerApiKey) {
        continue // API 키가 없으면 다음 제공자 시도
      }

      console.log(`[AI 트레이너] ${provider}로 응답 생성 시도 중...`)
      
      switch (provider) {
        case 'groq':
          return await askWithGroq(question, history, providerApiKey)
        case 'openai':
          return await askWithOpenAI(question, history, providerApiKey)
        case 'gemini':
          return await askWithGemini(question, history, providerApiKey)
        default:
          continue // 다음 제공자 시도
      }
    } catch (error) {
      console.error(`[AI 트레이너] ${provider} 실패:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // 429 에러나 할당량 초과 에러가 아니면 계속 시도
      const errorMessage = lastError.message.toLowerCase()
      if (errorMessage.includes('429') || errorMessage.includes('할당량') || errorMessage.includes('quota')) {
        console.log(`[AI 트레이너] ${provider} 할당량 초과, 다음 제공자로 전환...`)
        continue // 다음 제공자 시도
      }
      
      // 다른 에러도 일단 다음 제공자 시도
      continue
    }
  }

  // 모든 제공자가 실패한 경우
  throw lastError || new Error('모든 AI 제공자에서 응답 생성에 실패했습니다.')
}
