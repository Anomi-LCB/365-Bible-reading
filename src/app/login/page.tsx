"use client";

import { signInWithGoogle, signInWithKakao, signInWithPhone, verifyOTP, signInAsGuest } from "@/actions/auth";
import { BookOpen, ShieldCheck, Heart, MessageCircle, Phone, User, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import ChurchLogo from "@/components/ChurchLogo";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'none' | 'phone'>('none');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(true);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const handleKakaoLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithKakao();
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithPhone(phone);
            setIsOtpSent(true);
        } catch (error) {
            alert("번호를 확인해 주세요.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await verifyOTP(phone, otp);
        } catch (error) {
            alert("인증번호가 일치하지 않습니다.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = () => {
        setIsLoading(true);
        signInAsGuest(keepLoggedIn);
    };

    return (
        <main className="min-h-screen bg-[#FBFAF8] flex flex-col items-center justify-center p-6 font-sans pb-32">
            <div className="w-full max-w-sm space-y-10">
                {/* 브랜드 섹션 */}
                <div className="text-center space-y-5">
                    <div className="inline-flex bg-[#4E56D1] p-4 rounded-[2rem] shadow-2xl shadow-indigo-100 mb-2 rotate-1 transform transition-all hover:rotate-0 cursor-default">
                        <BookOpen className="text-white" size={32} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter text-[#1E293B]">
                            Bible 365
                        </h1>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] leading-none">
                            Spiritual Journey
                        </p>
                    </div>
                </div>

                {/* 프리미엄 로그인 카드 */}
                <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-white space-y-6 relative overflow-hidden">
                    <div className="space-y-6 relative z-10">
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-black text-[#1E293B]">환영합니다</h2>
                            <p className="text-xs font-bold text-[#64748B]">매일 주님과 동행하는 성경 읽기</p>
                        </div>

                        {loginMethod === 'none' ? (
                            <div className="space-y-3">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-4 bg-white border border-slate-100 py-4 rounded-2xl font-black text-sm text-[#475569] hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                    Google 계정으로 로그인
                                </button>

                                <button
                                    onClick={handleKakaoLogin}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-4 bg-[#FEE500] py-4 rounded-2xl font-black text-sm text-[#3C1E1E] hover:bg-[#FADA0A] transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
                                >
                                    <MessageCircle className="w-5 h-5 fill-[#3C1E1E]" />
                                    카카오톡으로 로그인
                                </button>

                                <button
                                    onClick={() => setLoginMethod('phone')}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-4 bg-[#4E56D1] py-4 rounded-2xl font-black text-sm text-white hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md"
                                >
                                    <Phone className="w-5 h-5" />
                                    휴대폰 번호로 로그인
                                </button>

                                <div className="pt-2">
                                    <button
                                        onClick={handleGuestLogin}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-4 bg-slate-100/50 py-3.5 rounded-2xl font-bold text-xs text-[#64748B] hover:bg-slate-100 transition-all disabled:opacity-50"
                                    >
                                        <User className="w-4 h-4" />
                                        {isLoading ? "입장 중..." : "게스트로 입장하기"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {!isOtpSent ? (
                                    <form onSubmit={handlePhoneLogin} className="space-y-3">
                                        <input
                                            type="tel"
                                            placeholder="휴대폰 번호 (예: 01012345678)"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 border text-sm font-bold transition-all outline-none"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-[#4E56D1] py-4 rounded-2xl font-black text-sm text-white hover:bg-indigo-700 transition-all"
                                        >
                                            인증번호 전송
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="인증번호 6자리"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 border text-sm font-bold transition-all outline-none"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-emerald-500 py-4 rounded-2xl font-black text-sm text-white hover:bg-emerald-600 transition-all"
                                        >
                                            인증 및 로그인
                                        </button>
                                    </form>
                                )}
                                <button
                                    onClick={() => { setLoginMethod('none'); setIsOtpSent(false); }}
                                    className="w-full py-2 text-xs font-bold text-[#94A3B8] hover:text-[#64748B] transition-colors"
                                >
                                    다른 방식으로 로그인하기
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div
                                    onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                                    className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${keepLoggedIn ? 'bg-[#4E56D1] border-[#4E56D1]' : 'bg-transparent border-slate-200 group-hover:border-slate-300'}`}
                                >
                                    {keepLoggedIn && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                <span className="text-xs font-bold text-[#64748B]">로그인 상태 유지</span>
                            </label>

                            <div className="flex items-center gap-3 px-2">
                                <ShieldCheck className="text-emerald-500" size={16} strokeWidth={3} />
                                <p className="text-[11px] text-[#94A3B8] font-bold">
                                    보안 인증을 통해 안전하게 로그인합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#4E56D1]/5 rounded-full blur-3xl"></div>
                </div>

                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-6 bg-slate-200"></div>
                        <Heart size={12} className="text-pink-300 fill-pink-300" />
                        <div className="h-px w-6 bg-slate-200"></div>
                    </div>
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest italic">
                        Start your 365 days today
                    </p>
                </div>
            </div>

            <ChurchLogo />
        </main>
    );
}
