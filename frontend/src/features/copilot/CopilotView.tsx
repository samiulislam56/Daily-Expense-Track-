import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Bot,
  User as UserIcon,
  HelpCircle,
  TrendingDown,
  Target,
  PiggyBank,
  Receipt,
  Check,
  X,
  Wallet,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { CopilotChatMessage, CopilotDraftTransaction } from '../../types/index.js';
import { formatBDT } from '../../lib/utils.js';

interface CopilotViewProps {
  onConfirmDraftTransaction: (draft: CopilotDraftTransaction) => Promise<any>;
}

export const CopilotView: React.FC<CopilotViewProps> = ({ onConfirmDraftTransaction }) => {
  const [messages, setMessages] = useState<CopilotChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "👋 Hello! I am your **DailyFlow Finance Copilot**.\n\nI analyze your live verified accounts, budgets, and transactions using deterministic accounting calculations with zero hallucination.\n\nTry tapping one of the suggested questions below, or tell me something like: *\"Spent 450 on lunch today\"* to prepare a draft transaction!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'deterministic_copilot',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedDraftIds, setConfirmedDraftIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'How much did I spend today?',
    'What are my biggest spending categories this month?',
    'How much budget remains?',
    'Compare my spending with last month',
    'Suggest a realistic savings plan for my goal',
    'Spent 350 BDT on Groceries today',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: CopilotChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.askCopilot(text);

      const assistantMsg: CopilotChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
        draftTransaction: res.draftTransaction || null,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Unable to process query right now: ${err.message || 'Please check network connection'}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'deterministic_copilot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDraft = async (msgId: string, draft: CopilotDraftTransaction) => {
    try {
      await onConfirmDraftTransaction(draft);
      setConfirmedDraftIds((prev) => new Set([...prev, msgId]));
    } catch (err: any) {
      alert(`Failed to save draft: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] sm:h-[calc(100vh-14rem)] bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
      {/* Copilot Header */}
      <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-ink)] flex items-center gap-1.5">
              DailyFlow AI Finance Copilot
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                Grounded & Secure
              </span>
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Deterministic calculations based on your live application records
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Zero Hallucination Source-of-Truth</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isConfirmed = confirmedDraftIds.has(msg.id);

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isUser
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--accent)]'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[var(--accent)] text-white rounded-tr-none'
                      : 'bg-[var(--surface-elevated)] text-[var(--text-ink)] border border-[var(--border)] rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  <div
                    className={`mt-2 text-[10px] text-right font-mono ${
                      isUser ? 'text-white/70' : 'text-[var(--text-faint)]'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* Draft Proposal Card */}
                {msg.draftTransaction && (
                  <div className="p-4 rounded-2xl bg-[var(--surface)] border-2 border-[var(--accent)]/40 shadow-md animate-in fade-in space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                      <span className="text-xs font-bold text-[var(--text-ink)] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                        Proposed Transaction Draft
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          msg.draftTransaction.type === 'income'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {msg.draftTransaction.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Amount</span>
                        <strong className="text-sm font-mono text-[var(--text-ink)]">
                          {msg.draftTransaction.amountFormatted}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Category</span>
                        <strong className="text-xs text-[var(--text-ink)]">
                          {msg.draftTransaction.categoryName}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Date</span>
                        <span className="text-xs font-mono text-[var(--text-ink)]">
                          {msg.draftTransaction.date}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Account</span>
                        <span className="text-xs text-[var(--text-ink)] flex items-center gap-1">
                          <Wallet className="w-3 h-3 text-[var(--accent)]" />
                          {msg.draftTransaction.accountName || 'Default'}
                        </span>
                      </div>
                    </div>

                    {msg.draftTransaction.note && (
                      <p className="text-[11px] text-[var(--text-muted)] italic bg-[var(--surface-elevated)] p-2 rounded-lg border border-[var(--border)]">
                        {msg.draftTransaction.note}
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-end gap-2">
                      {isConfirmed ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                          <Check className="w-4 h-4" />
                          <span>Confirmed & Added to Transactions</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConfirmDraft(msg.id, msg.draftTransaction!)}
                          className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm & Add Transaction</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--accent)]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
              <span>Analyzing verified accounts and calculating grounded figures...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[11px] font-medium text-[var(--text-faint)] shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Quick:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            disabled={isLoading}
            className="px-2.5 py-1 text-[11px] font-medium bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--text-ink)] rounded-lg transition-all shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3.5 sm:p-4 border-t border-[var(--border)] bg-[var(--surface)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about your spending, budget, or draft a transaction..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
