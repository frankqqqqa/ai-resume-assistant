'use client';


import { useState, useCallback, useEffect } from 'react';
import {
  Bot,
  Bell,
  FileText,
  Briefcase,
  Wand2,
  Copy,
  MinusCircle,
  CheckCircle2,
  Plus,
  History,
  X,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  LogOut,
} from 'lucide-react';
import type { Suggestion, OptimizationRecord } from '@/lib/supabase';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

const KEYWORD_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-green-500',
  'bg-red-400',
];

function KeywordBadge({ keyword, index }: { keyword: string; index: number }) {
  const colorClass = KEYWORD_COLORS[index % KEYWORD_COLORS.length];
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-white text-gray-600 border border-gray-200 shadow-sm hover:border-gray-300 transition-colors cursor-default">
      <span className={`w-1.5 h-1.5 rounded-full ${colorClass} mr-2 opacity-80`} />
      {keyword}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-gray-400 hover:text-apple-blue transition-colors px-3 py-1.5 rounded-full hover:bg-blue-50 text-[12px] font-medium group/btn"
      title="复制优化版本"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${copied ? 'w-auto ml-0 opacity-100' : 'opacity-0 -ml-2 w-0 group-hover/btn:opacity-100 group-hover/btn:ml-0 group-hover/btn:w-auto'}`}>
        {copied ? '已复制' : '复制'}
      </span>
    </button>
  );
}

function SuggestionCard({ suggestion, index }: { suggestion: Suggestion; index: number }) {
  const optimizedText = suggestion.optimized;
  const highlight = suggestion.highlight;

  let displayContent: React.ReactNode = optimizedText;
  if (highlight && optimizedText.includes(highlight)) {
    const parts = optimizedText.split(highlight);
    displayContent = (
      <>
        {parts[0]}
        <span className="bg-green-100/50 text-green-800 px-1.5 py-0.5 rounded text-[14px] mx-0.5 border border-green-200/30 font-medium">
          {highlight}
        </span>
        {parts.slice(1).join(highlight)}
      </>
    );
  }

  return (
    <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card hover:shadow-xl transition-all duration-500 group relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-apple-blue/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="p-6 flex items-center justify-between border-b border-gray-50">
        <span className="text-[13px] font-medium text-gray-400">建议 #{index + 1}</span>
        <CopyButton text={optimizedText} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 bg-gray-50/30 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex items-center gap-2 mb-4 opacity-60">
            <MinusCircle className="text-red-400 w-[18px] h-[18px]" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">原句</span>
          </div>
          <p className="text-[15px] text-gray-500 leading-relaxed font-light">{suggestion.original}</p>
        </div>
        <div className="p-8 bg-[#f5faf7]/40 relative">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-green-600/70 w-[18px] h-[18px]" />
            <span className="text-[11px] font-bold text-green-700/60 uppercase tracking-widest">优化后</span>
          </div>
          <p className="text-[15px] text-gray-800 font-normal leading-relaxed">{displayContent}</p>
        </div>
      </div>
      {suggestion.keywords && suggestion.keywords.length > 0 && (
        <div className="px-8 py-4 bg-white border-t border-gray-50 flex flex-wrap gap-3 items-center">
          <span className="text-[11px] text-gray-400 font-medium mr-1 uppercase tracking-wider">关键词</span>
          {suggestion.keywords.map((kw, i) => (
            <KeywordBadge key={i} keyword={kw} index={i} />
          ))}
        </div>
      )}
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card animate-pulse">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div className="h-4 bg-gray-100 rounded w-20" />
        <div className="h-8 bg-gray-100 rounded-full w-16" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 bg-gray-50/30 border-r border-gray-100 space-y-3">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
        </div>
        <div className="p-8 space-y-3">
          <div className="h-3 bg-green-50 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
          <div className="h-4 bg-gray-100 rounded w-3/5" />
        </div>
      </div>
      <div className="px-8 py-4 border-t border-gray-50 flex gap-3">
        <div className="h-7 bg-gray-100 rounded-full w-16" />
        <div className="h-7 bg-gray-100 rounded-full w-20" />
        <div className="h-7 bg-gray-100 rounded-full w-14" />
      </div>
    </div>
  );
}

function HistoryPanel({
  records,
  onSelect,
  onClose,
}: {
  records: OptimizationRecord[];
  onSelect: (r: OptimizationRecord) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-semibold text-[17px] text-apple-text flex items-center gap-2">
            <Clock className="w-5 h-5 text-apple-blue" />
            历史记录
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-400 py-12">
              <History className="w-10 h-10 opacity-30" />
              <p className="text-[14px]">暂无历史记录</p>
            </div>
          ) : (
            records.map((r) => (
              <button
                key={r.id}
                onClick={() => { onSelect(r); onClose(); }}
                className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-apple-blue/30 hover:bg-blue-50/30 transition-all group"
              >
                <p className="text-[13px] font-medium text-gray-700 truncate group-hover:text-apple-blue transition-colors">
                  {r.resume_text.slice(0, 50)}{r.resume_text.length > 50 ? '...' : ''}
                </p>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {new Date(r.created_at).toLocaleString('zh-CN', {
                    month: 'numeric', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                  <span className="ml-auto bg-apple-blue/10 text-apple-blue px-2 py-0.5 rounded-full text-[10px] font-medium">
                    {r.suggestions.length} 条建议
                  </span>
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<OptimizationRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleOptimize = async () => {
    if (!resumeText.trim() || !jdText.trim()) {
      setError('请填写简历经历和目标岗位 JD');
      return;
    }
    setError(null);
    setIsLoading(true);
    setSuggestions([]);

    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jdText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'AI 优化失败，请重试');
      }

      setSuggestions(data.suggestions ?? []);
      setHasResult(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误，请重试';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSuggestions([]);
    setHasResult(false);
    setError(null);
  };

  const handleOpenHistory = useCallback(async () => {
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistoryRecords(data.records ?? []);
    } catch {
      setHistoryRecords([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleSelectHistory = (record: OptimizationRecord) => {
    setResumeText(record.resume_text);
    setJdText(record.jd_text);
    setSuggestions(record.suggestions);
    setHasResult(true);
    setError(null);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-black/5 glass-nav transition-all duration-300">
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-apple-text/90 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h1 className="font-semibold text-[17px] tracking-tight text-apple-text flex items-center">
              AI 简历助手
              <span className="text-[11px] font-normal text-gray-500 ml-2 border border-gray-200 px-2 py-0.5 rounded-full bg-white/50">
                工作台
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={handleOpenHistory}
              className="flex items-center justify-center text-gray-400 hover:text-apple-blue transition-colors duration-300"
              title="历史记录"
            >
              <History className="w-[22px] h-[22px]" />
            </button>
            <button className="flex items-center justify-center text-gray-400 hover:text-apple-blue transition-colors duration-300">
              <Bell className="w-[22px] h-[22px]" />
            </button>
            <div className="h-4 w-[1px] bg-gray-300" />
            {userEmail && (
              <span className="text-[12px] text-gray-400 hidden sm:block max-w-[120px] truncate">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              title="退出登录"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-12 flex flex-col gap-12">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-[14px] animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Section */}
        <section className="flex flex-col gap-6 relative">
          <div className="flex flex-col md:flex-row gap-8 relative items-stretch">
            {/* Resume Input */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <label
                  className="text-[13px] font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2"
                  htmlFor="resume-input"
                >
                  <FileText className="w-[18px] h-[18px] text-gray-400" />
                  简历经历
                </label>
                <span className="text-[11px] text-gray-400 font-medium bg-gray-100/80 px-2 py-0.5 rounded-md">
                  支持 Markdown
                </span>
              </div>
              <div className="relative group h-full">
                <textarea
                  className="w-full h-[360px] p-6 bg-white border-none rounded-2xl resize-none focus:ring-0 outline-none transition-all custom-scrollbar placeholder:text-gray-300 text-[15px] leading-7 shadow-paper group-hover:shadow-lg duration-500 text-gray-700"
                  id="resume-input"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  disabled={isLoading}
                  placeholder={`粘贴你的简历经历...\n例如：\n- 使用 Excel 分析销售数据\n- 为营销团队制作数据看板`}
                />
              </div>
            </div>

            {/* Center Button (Desktop) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center justify-center pointer-events-none h-full w-20">
              <button
                onClick={handleOptimize}
                disabled={isLoading}
                className="pointer-events-auto glossy-button bg-button-gradient text-white shadow-button-glow hover:scale-105 active:scale-95 transition-all duration-300 rounded-full h-14 w-14 flex items-center justify-center group relative border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Wand2 className="w-7 h-7 group-hover:rotate-12 transition-transform duration-500" />
                )}
              </button>
              <span className="mt-3 text-xs font-medium text-apple-blue/80 pointer-events-auto bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-white/50">
                {isLoading ? '优化中...' : '执行优化'}
              </span>
            </div>

            {/* JD Input */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <label
                  className="text-[13px] font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2"
                  htmlFor="jd-input"
                >
                  <Briefcase className="w-[18px] h-[18px] text-gray-400" />
                  目标岗位 (JD)
                </label>
                <span className="text-[11px] text-gray-400 font-medium bg-gray-100/80 px-2 py-0.5 rounded-md">
                  数据分析师
                </span>
              </div>
              <div className="relative group h-full">
                <textarea
                  className="w-full h-[360px] p-6 bg-white border-none rounded-2xl resize-none focus:ring-0 outline-none transition-all custom-scrollbar placeholder:text-gray-300 text-[15px] leading-7 shadow-paper group-hover:shadow-lg duration-500 text-gray-700"
                  id="jd-input"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  disabled={isLoading}
                  placeholder={`粘贴目标数据分析岗位 JD...\n例如：\n我们正在寻找一位精通 SQL 和 Python 的数据分析师，以驱动产品洞察...`}
                />
              </div>
            </div>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex justify-center py-4">
            <button
              onClick={handleOptimize}
              disabled={isLoading}
              className="w-full glossy-button bg-button-gradient text-white shadow-lg hover:shadow-xl active:scale-95 transition-all rounded-xl h-14 px-6 flex items-center justify-center gap-2 font-medium text-[17px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
              <span>{isLoading ? '优化中...' : '执行深度优化'}</span>
            </button>
          </div>
        </section>

        {/* Results Section */}
        {(hasResult || isLoading) && (
          <section className="flex flex-col gap-8">
            <div className="flex items-end justify-between px-1 border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-semibold text-apple-text tracking-tight flex items-center gap-3">
                优化建议
                {isLoading && (
                  <span className="text-[14px] font-normal text-gray-400 flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI 分析中
                  </span>
                )}
                {!isLoading && suggestions.length > 0 && (
                  <span className="text-[13px] font-normal text-apple-blue bg-blue-50 px-3 py-1 rounded-full">
                    共 {suggestions.length} 条
                  </span>
                )}
              </h2>
              {!isLoading && hasResult && (
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="text-[13px] font-medium text-gray-400 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    重置
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-8">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  {suggestions.map((s, i) => (
                    <SuggestionCard key={s.id ?? i} suggestion={s} index={i} />
                  ))}

                  {/* Add more placeholder */}
                  <article className="bg-transparent rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group p-12">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-apple-blue group-hover:scale-110 transition-all duration-300">
                        <Plus className="w-6 h-6" />
                      </div>
                      <p className="text-[14px] text-gray-400 font-medium group-hover:text-gray-500 transition-colors">
                        添加更多经历以进行分析
                      </p>
                    </div>
                  </article>
                </>
              )}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!hasResult && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-apple-blue opacity-60" />
            </div>
            <div>
              <p className="text-[16px] font-medium text-gray-400">填写简历经历和目标 JD</p>
              <p className="text-[13px] text-gray-300 mt-1">点击中间的魔法棒按钮，AI 将为你生成优化建议</p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200/60 bg-white/50 backdrop-blur-sm py-10 mt-12">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-[12px] text-gray-400">
          <p>© 2024 AI 简历助手. 保留所有权利.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a className="hover:text-apple-blue transition-colors" href="#">隐私政策</a>
            <a className="hover:text-apple-blue transition-colors" href="#">服务条款</a>
            <a className="hover:text-apple-blue transition-colors" href="#">支持</a>
          </div>
        </div>
      </footer>

      {/* History Sidebar */}
      {showHistory && (
        <HistoryPanel
          records={historyLoading ? [] : historyRecords}
          onSelect={handleSelectHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}
