'use client';

import { useState } from 'react';
import { Bot, Mail, Lock, LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type Mode = 'login' | 'signup';

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const supabase = createSupabaseBrowserClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                window.location.href = '/';
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccessMsg('注册成功！请查收邮件并点击验证链接，然后返回登录。');
                setMode('login');
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '操作失败，请重试';
            // 转换常见英文错误为中文
            if (msg.includes('Invalid login credentials')) {
                setError('邮箱或密码错误，请重试');
            } else if (msg.includes('Email not confirmed')) {
                setError('邮箱尚未验证，请查收验证邮件');
            } else if (msg.includes('User already registered')) {
                setError('该邮箱已注册，请直接登录');
            } else if (msg.includes('Password should be at least')) {
                setError('密码至少需要 6 位');
            } else {
                setError(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center px-4">
            {/* Glow background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-apple-blue/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-button-gradient flex items-center justify-center shadow-button-glow">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-apple-text tracking-tight">AI 简历助手</h1>
                        <p className="text-[13px] text-gray-400 mt-1">
                            {mode === 'login' ? '登录你的账号' : '创建新账号'}
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-paper border border-gray-100 p-8">
                    {/* Tabs */}
                    <div className="flex bg-gray-100/80 rounded-xl p-1 mb-6">
                        {(['login', 'signup'] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(null); setSuccessMsg(null); }}
                                className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${mode === m
                                        ? 'bg-white text-apple-text shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {m === 'login' ? '登录' : '注册'}
                            </button>
                        ))}
                    </div>

                    {/* Success banner */}
                    {successMsg && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-[13px] flex items-start gap-2">
                            <span className="mt-0.5">✓</span>
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Error banner */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-[13px] flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">
                                邮箱
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] outline-none focus:border-apple-blue focus:bg-white transition-all placeholder:text-gray-300 text-apple-text"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">
                                密码
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={mode === 'signup' ? '至少 6 位字符' : '••••••••'}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] outline-none focus:border-apple-blue focus:bg-white transition-all placeholder:text-gray-300 text-apple-text"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="glossy-button bg-button-gradient text-white py-3 rounded-xl font-medium text-[15px] shadow-button-glow hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : mode === 'login' ? (
                                <><LogIn className="w-5 h-5" /><span>登录</span></>
                            ) : (
                                <><UserPlus className="w-5 h-5" /><span>创建账号</span></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[12px] text-gray-400 mt-6">
                    注册即表示同意
                    <a href="#" className="text-apple-blue hover:underline mx-1">服务条款</a>
                    和
                    <a href="#" className="text-apple-blue hover:underline ml-1">隐私政策</a>
                </p>
            </div>
        </div>
    );
}
