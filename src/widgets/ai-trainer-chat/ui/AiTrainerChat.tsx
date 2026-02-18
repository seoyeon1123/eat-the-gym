'use client';

import { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

import { askTrainerWithAI, type TrainerMessage } from '@/entities/trainer/api';

interface AiTrainerChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage extends TrainerMessage {
  id: string;
}

export function AiTrainerChat({ open, onOpenChange }: AiTrainerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    onOpenChange(false);
    setError(null);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    const historyForApi: TrainerMessage[] = [...messages, newUserMessage].map(
      ({ role, content }) => ({ role, content })
    );

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const answer = await askTrainerWithAI(trimmed, historyForApi);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI 트레이너 응답 실패:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'AI 트레이너 응답 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 px-4 pb-5 pt-10 sm:items-center sm:bg-black/50">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-[#050807]/98 ring-1 ring-white/5 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wide text-white/90">
                AI 트레이너
              </span>
              <span className="text-[0.65rem] text-emerald-200/80">
                운동 · 통증 · 자세에 대해 뭐든 물어보세요
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-white/5 hover:text-white/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex max-h-[360px] flex-col gap-3 overflow-y-auto px-4 py-3 text-[0.8rem] text-white/85">
          {messages.length === 0 && (
            <div className="rounded-2xl bg-white/2 px-3.5 py-3 text-[0.75rem] text-white/55">
              예시 질문:
              <ul className="mt-1.5 space-y-1.5">
                <li>- 벤치프레스 하는데 어깨가 아파요. 어떻게 해야 하나요?</li>
                <li>- 스쿼트할 때 무릎 통증이 덜하게 하는 방법이 있을까요?</li>
                <li>- 3분할 루틴에서 어깨가 너무 피곤한데 조정할 수 있나요?</li>
              </ul>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-500 text-emerald-950'
                    : 'bg-white/4 text-white/90'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white/3 px-3 py-2 text-[0.75rem] text-white/70">
                생각 중이에요...
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-[0.75rem] text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/10 bg-black/20 px-3 py-2.5">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="예: 벤치프레스 할 때 어깨가 아플 땐 어떻게 해야 하나요?"
              className="flex-1 rounded-2xl border border-white/12 bg-black/40 px-3 py-2 text-[0.8rem] text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-emerald-400/80"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/60"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
