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
 * Gemini 2.5 Flash-Lite를 사용한 AI 트레이너 챗봇
 * (현재 챗봇은 Gemini provider에서만 동작하도록 구현)
 */
export async function askTrainerWithAI(
  question: string,
  history: TrainerMessage[] = [],
  options?: AskTrainerOptions,
): Promise<string> {
  const provider = (options?.provider ||
    (import.meta.env.VITE_AI_PROVIDER as AIProvider) ||
    'gemini') as AIProvider

  const apiKey = options?.apiKey || import.meta.env.VITE_AI_API_KEY

  if (!apiKey) {
    throw new Error('AI API 키가 설정되지 않았습니다. VITE_AI_API_KEY를 설정하세요.')
  }

  const prompt = buildChatPrompt(question, history)

  if (provider !== 'gemini') {
    throw new Error('현재 AI 트레이너 챗봇은 Gemini provider에서만 동작하도록 설정되어 있습니다.')
  }

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
    throw new Error(`Gemini AI 트레이너 API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text || typeof text !== 'string') {
    throw new Error('Gemini 응답 형식이 올바르지 않습니다.')
  }

  return text.trim()
}

