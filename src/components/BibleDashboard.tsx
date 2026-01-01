"use client";

import { useState, useMemo, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import {
    BookOpen, Trophy, Flame,
    Youtube, ExternalLink, PlayCircle,
    MapPin
} from "lucide-react";
import { BibleReadingPlan } from "@/types/bible";
import DateNavigator from "./DateNavigator";
import BibleCard from "./BibleCard";
import BibleProgressMap from "./BibleProgressMap";
import { calculateStreak } from "@/lib/stats";
import { createClient } from "@/lib/supabase-client";
import { useRouter, useSearchParams } from "next/navigation";
import ChurchLogo from "./ChurchLogo";
import { getOfficialCategory, generateKeywords, calculateReadingTime } from "@/lib/bible-utils";
import YoutubePlayer from "./YoutubePlayer";

interface BibleDashboardProps {
    user: any;
    allPlans: BibleReadingPlan[];
    initialProgress: any[];
    weather: any;
    appSettings: any;
    initialDate: string;
}

export default function BibleDashboard({
    user,
    allPlans,
    initialProgress,
    weather,
    appSettings,
    initialDate
}: BibleDashboardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const isGuest = !user;

    // 날짜 상태 관리
    const [selectedDate, setSelectedDate] = useState(initialDate);

    // 진행 상황 상태 관리 (Optimistic)
    const [userProgress, setUserProgress] = useState(initialProgress);

    // URL과 동기화 및 게스트 데이터 로드
    useEffect(() => {
        const dateFromUrl = searchParams.get("date");
        if (dateFromUrl && dateFromUrl !== selectedDate) {
            setSelectedDate(dateFromUrl);
        }

        // 게스트 모드일 때 로컬 스토리지에서 데이터 로드
        if (isGuest) {
            const savedProgress = localStorage.getItem('guest_bible_progress');
            if (savedProgress) {
                try {
                    const parsed = JSON.parse(savedProgress);
                    // plan_id와 reading_plan을 포함하는 객체 배열 형태로 복구
                    const progressWithData = parsed.map((planId: number) => ({
                        plan_id: planId,
                        reading_plan: allPlans.find(p => p.id === planId)
                    })).filter((p: any) => p.reading_plan);
                    setUserProgress(progressWithData);
                } catch (e) {
                    console.error("Failed to load guest progress", e);
                }
            }
        }
    }, [searchParams, isGuest, allPlans]);

    const handleDateChange = (newDateStr: string) => {
        setSelectedDate(newDateStr);
        // URL 조용히 업데이트 (서버 리렌더링 없이)
        const url = new URL(window.location.href);
        url.searchParams.set("date", newDateStr);
        window.history.pushState({}, "", url.toString());
    };

    // 통계 계산 (메모이제이션)
    const { streak, completedVerses, completedIds, progressPercent, daysLeft } = useMemo(() => {
        const progress = userProgress;
        const completedDates = progress.map((p: any) => p.reading_plan?.date).filter(Boolean);
        const streak = calculateStreak(completedDates);

        const completedVerses = progress.reduce((acc: string[], p: any) => {
            if (p.reading_plan?.verses) acc.push(...p.reading_plan.verses);
            return acc;
        }, []);

        const completedIds = progress.map((p: any) => p.plan_id);
        const progressPercent = Math.round((completedIds.length / 365) * 100);
        const daysLeft = 365 - completedIds.filter(id => id > 0).length;

        return { streak, completedVerses, completedIds, progressPercent, daysLeft };
    }, [userProgress]);

    // 현재 날짜의 플랜 찾기 + 지능형 가공 적용
    const rawTargetPlan = useMemo(() =>
        allPlans.find(p => p.date === selectedDate),
        [allPlans, selectedDate]);

    const targetPlan = useMemo(() => {
        if (!rawTargetPlan) return null;

        // DB 동기화 지연 대비: 시편 119편 분할 읽기 데이터 강제 보정
        let processedPlan = { ...rawTargetPlan };
        const day = processedPlan.day_of_year;

        const p119Mapping: Record<number, string> = {
            119: "시편 119편 1~32절", 274: "시편 119편 1~32절",
            120: "시편 119편 33-64절", 275: "시편 119편 33-64절",
            121: "시편 119편 65-96절", 276: "시편 119편 65-96절",
            122: "시편 119편 97-128절", 277: "시편 119편 97-128절",
            123: "시편 119편 129-152절", 278: "시편 119편 129-152절",
            124: "시편 119편 153-176절", 279: "시편 119편 153-176절"
        };

        const p119Text = p119Mapping[day];
        if (p119Text && !processedPlan.title.includes("시편 119편")) {
            processedPlan.title = `${processedPlan.title}, ${p119Text}`;
            if (!processedPlan.verses.includes(p119Text)) {
                processedPlan.verses = [...processedPlan.verses, p119Text];
            }
        }

        return {
            ...processedPlan,
            category: processedPlan.category || getOfficialCategory(processedPlan.verses),
            summary: processedPlan.summary || generateKeywords(processedPlan.verses),
            reading_time: processedPlan.reading_time || calculateReadingTime(processedPlan.verses)
        };
    }, [rawTargetPlan]);

    const isCompleted = targetPlan ? completedIds.includes(targetPlan.id) : false;

    const handleToggle = async (planId: number) => {
        const originalProgress = [...userProgress];

        if (isGuest) {
            // 게스트 모드 저장 로직
            let newProgress;
            if (isCompleted) {
                newProgress = userProgress.filter(p => p.plan_id !== planId);
            } else {
                const newEntry = {
                    plan_id: planId,
                    reading_plan: allPlans.find(p => p.id === planId)
                };
                newProgress = [...userProgress, newEntry];
            }

            setUserProgress(newProgress);
            // ID 배열만 로컬 스토리지에 저장
            localStorage.setItem('guest_bible_progress', JSON.stringify(newProgress.map(p => p.plan_id)));
            return;
        }

        // 로그인 사용자 저장 로직 (Existing)
        if (isCompleted) {
            // 제거
            setUserProgress(prev => prev.filter(p => p.plan_id !== planId));
            const { error } = await supabase
                .from("user_progress")
                .delete()
                .eq("user_id", user?.id)
                .eq("plan_id", planId);

            if (error) setUserProgress(originalProgress);
        } else {
            // 추가
            const newEntry = {
                plan_id: planId,
                reading_plan: allPlans.find(p => p.id === planId)
            };
            setUserProgress(prev => [...prev, newEntry]);

            const { error } = await supabase
                .from("user_progress")
                .insert({
                    user_id: user?.id,
                    plan_id: planId,
                    is_completed: true,
                });

            if (error) setUserProgress(originalProgress);
        }
    };

    // SignOut 로직 제거 (게스트 전용 모드)

    const introLink = appSettings?.find((s: any) => s.key === 'intro_video_url')?.value || "https://youtu.be/Sp71zxZjZIk?si=PJX1eyh59eILNc9D";
    const new365Link = appSettings?.find((s: any) => s.key === 'new_365_video_url')?.value || "https://www.youtube.com/playlist?list=PLVcVykBcFZTR4Q6cvmybjPgCklZlv-Ghj";
    const otLink = "https://www.youtube.com/playlist?list=PLVcVykBcFZTRw1ZxIhIQ9uuAU6lU_PvDB";
    const ntLink = "https://www.youtube.com/playlist?list=PLVcVykBcFZTSM0ueQRAzrlRw42mmaUL6U";

    return (
        <main className="min-h-screen bg-[#FBFAF8] text-[#334155] antialiased tracking-normal flex flex-col">
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/40 flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                    <div className="bg-[#4E56D1] p-1.5 rounded-lg shadow-sm">
                        <BookOpen className="text-white" size={15} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-base font-bold text-[#1E293B] tracking-tight">성경 365</h1>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={introLink}
                        target="_blank"
                        className="flex items-center gap-1.5 bg-[#F8FAFF] border border-indigo-50 px-3 py-1.5 rounded-full text-[10px] font-semibold text-[#4E56D1] hover:bg-white transition-all shadow-sm"
                    >
                        <PlayCircle size={12} strokeWidth={2} />
                        공동체 성경읽기란?
                    </a>
                </div>
            </header>

            <div className="max-w-md mx-auto px-5 py-6 pb-0 space-y-6 flex-grow w-full">
                <section className="space-y-4">
                    <DateNavigator
                        currentDate={selectedDate}
                        onDateChange={handleDateChange} // 이 함수를 통해 0.01초 전환 구현
                    />
                    {weather && (
                        <div className="flex justify-center items-center gap-4 text-[10px] font-medium tracking-wider text-[#94A3B8] uppercase">
                            <div className="flex items-center gap-1.5 border-r border-slate-200/60 pr-4">
                                <MapPin size={11} className="text-[#4E56D1]/30" strokeWidth={2.5} />
                                <span>Mokpo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-600 font-semibold">{weather.temp}°C</span>
                                <span className="text-slate-400">{weather.description}</span>
                            </div>
                        </div>
                    )}
                </section>

                <section className="flex gap-3">
                    <div className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-3.5 shadow-sm">
                        <div className="bg-orange-50 p-2 rounded-xl">
                            <Flame size={16} className="text-orange-500" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight leading-none mb-1">연속읽기</p>
                            <p className="text-base font-bold text-slate-800 leading-none">{streak}일</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-3.5 shadow-sm">
                        <div className="bg-[#E6F7F5] p-2 rounded-xl">
                            <Trophy size={16} className="text-[#3DAA9C]" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight leading-none mb-1">전체 진행상황</p>
                            <p className="text-base font-bold text-slate-800 leading-none">{progressPercent}%</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Plan</h3>
                        <div className="flex items-center gap-2 bg-indigo-50/50 px-2.5 py-1 rounded-full border border-indigo-100/30">
                            <span className="text-[9px] text-[#4E56D1] font-bold">D-{daysLeft} Left</span>
                        </div>
                    </div>
                    {targetPlan ? (
                        <BibleCard
                            plan={targetPlan}
                            isCompleted={isCompleted}
                            onToggle={() => handleToggle(targetPlan.id)}
                        />
                    ) : (
                        <div className="py-12 text-center bg-white/50 rounded-3xl border border-dashed border-slate-200">
                            <p className="text-xs font-medium text-slate-300">표시할 말씀이 없습니다.</p>
                        </div>
                    )}
                </section>

                <section className="space-y-3">
                    <YoutubePlayer selectedDate={selectedDate} />
                </section>

                <section className="space-y-3 pb-4">
                    <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-1">YouTube Guide</h3>
                    <div className="space-y-2.5">
                        <a
                            href={new365Link}
                            target="_blank"
                            className="group flex items-center justify-between bg-[#3DAA9C] px-5 py-4 rounded-2xl text-white shadow-xl shadow-teal-900/10 active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-3.5">
                                <Youtube size={22} strokeWidth={2} />
                                <span className="font-bold text-[13.5px] tracking-tight">NEW 365 성경 읽기 영상</span>
                            </div>
                            <ExternalLink size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                        </a>

                        <div className="flex gap-2.5">
                            <a
                                href={otLink}
                                target="_blank"
                                className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 hover:border-indigo-100 hover:shadow-md transition-all group"
                            >
                                <div className="bg-red-50 p-2 rounded-xl text-red-500 group-hover:scale-105 transition-transform">
                                    <Youtube size={16} strokeWidth={2} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600">구약 가이드</span>
                            </a>
                            <a
                                href={ntLink}
                                target="_blank"
                                className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 hover:border-indigo-100 hover:shadow-md transition-all group"
                            >
                                <div className="bg-red-50 p-2 rounded-xl text-red-500 group-hover:scale-105 transition-transform">
                                    <Youtube size={16} strokeWidth={2} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600">신약 가이드</span>
                            </a>
                        </div>
                    </div>
                </section>

                <section className="space-y-3 pb-8">
                    <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-1">Progress Map</h3>
                    <BibleProgressMap completedVerses={completedVerses} />
                </section>
            </div>

            <ChurchLogo />
        </main>
    );
}
