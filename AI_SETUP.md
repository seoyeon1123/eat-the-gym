# AI 루틴 생성 설정 가이드

## 무료 AI API 옵션

### 1. Groq (추천) ⚡

- **무료 티어**: 월 14,400 요청
- **속도**: 매우 빠름 (초당 수백 토큰)
- **모델**: Llama 3.1, Mixtral 등
- **가입**: https://console.groq.com/keys

### 2. Google Gemini

- **무료 티어**: 분당 15 요청, 일일 1,500 요청
- **속도**: 빠름
- **모델**: Gemini Pro
- **가입**: https://makersuite.google.com/app/apikey

### 3. Together AI

- **무료 크레딧**: $25 (충분함)
- **속도**: 보통
- **모델**: Llama 3, Mistral 등
- **가입**: https://api.together.xyz/settings/api-keys

## 설정 방법

### 1. 환경 변수 파일 생성

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
# AI 사용 여부 (true/false)
VITE_USE_AI=true

# AI 제공자 선택 (groq, gemini, together)
VITE_AI_PROVIDER=groq

# API 키 (발급받은 키로 교체)
VITE_AI_API_KEY=your-api-key-here
```

### 2. OpenAI GPT-4o 사용 예시 (가장 정확) ⭐ 추천

```env
VITE_USE_AI=true
VITE_AI_PROVIDER=openai
VITE_AI_API_KEY=sk-your_openai_api_key_here
# 선택사항: gpt-4o (더 정확하지만 비쌈), gpt-4o-mini (저렴하고 빠름)
VITE_OPENAI_MODEL=gpt-4o-mini
```

### 3. Anthropic Claude 사용 예시 (매우 정확) ⭐ 추천

```env
VITE_USE_AI=true
VITE_AI_PROVIDER=claude
VITE_AI_API_KEY=sk-ant-your_claude_api_key_here
# 선택사항: claude-3-5-sonnet-20241022 (최신), claude-3-5-haiku-20241022 (저렴)
VITE_CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### 4. Google Gemini 사용 예시 (무료 + 좋은 성능)

```env
VITE_USE_AI=true
VITE_AI_PROVIDER=gemini
VITE_AI_API_KEY=your_gemini_api_key_here
```

### 5. Groq 사용 예시 (빠른 속도)

```env
VITE_USE_AI=true
VITE_AI_PROVIDER=groq
VITE_AI_API_KEY=gsk_your_groq_api_key_here
VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

### 6. Together AI 사용 예시

```env
VITE_USE_AI=true
VITE_AI_PROVIDER=together
VITE_AI_API_KEY=your_together_api_key_here
```

## 사용 방법

1. 위의 AI 서비스 중 하나에서 API 키를 발급받습니다
2. `.env` 파일을 생성하고 API 키를 설정합니다
3. `VITE_USE_AI=true`로 설정합니다
4. 개발 서버를 재시작합니다: `yarn dev`

## 폴백 동작

- AI API 호출이 실패하면 자동으로 기존 로컬 생성 방식으로 폴백됩니다
- API 키가 없으면 자동으로 로컬 생성 방식을 사용합니다

## 보안 주의사항

⚠️ **중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

`.gitignore`에 다음이 포함되어 있는지 확인하세요:

```
.env
.env.local
.env.*.local
```

## 코드 구조

- AI 생성 함수: `src/entities/routine/api/ai-routine-generator.ts`
- 로컬 생성 함수: `src/entities/routine/model/routine-generator.ts`
- 사용 위치: `src/pages/home/ui/HomePage.tsx`
