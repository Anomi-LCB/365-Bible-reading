"use client";

import { ChevronLeft, ChevronRight, Calendar, Sparkles, X, ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { useState, useTransition } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DateNavigatorProps {
    currentDate: string; // ISO string (YYYY-MM-DD)
    onDateChange?: (date: string) => void;
}

export default function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(currentDate));

    const dateObj = new Date(currentDate);

    const navigateTo = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        setIsModalOpen(false);
        setIsMonthSelectorOpen(false);

        if (onDateChange) {
            onDateChange(dateStr);
        } else {
            startTransition(() => {
                router.push(`?date=${dateStr}`);
            });
        }
    };

    const handlePrev = () => {
        const prevDate = subDays(dateObj, 1);
        navigateTo(prevDate);
    };

    const handleNext = () => {
        const nextDate = addDays(dateObj, 1);
        navigateTo(nextDate);
    };

    const isToday = format(new Date(), "yyyy-MM-dd") === currentDate;

    // 캘린더 관련 계산
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const selectMonth = (monthIndex: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(monthIndex);
        setViewDate(newDate);
        setIsMonthSelectorOpen(false);
    };

    const months = [
        "1월", "2월", "3월", "4월", "5월", "6월",
        "7월", "8월", "9월", "10월", "11월", "12월"
    ];

    return (
        <>
            <div className={`flex items-center justify-between bg-card rounded-[2.5rem] p-4 border border-border dark:border-slate-800 shadow-premium dark:shadow-premium-dark ring-1 ring-border/50 dark:ring-slate-800/50 transition-all hover:shadow-md ${isPending ? 'opacity-50' : ''}`}>
                <button
                    onClick={handlePrev}
                    disabled={isPending}
                    className="h-11 w-11 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-[#4E56D1] dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 rounded-full transition-all active:scale-90"
                >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                </button>

                <button
                    onClick={() => {
                        setViewDate(new Date(currentDate));
                        setIsModalOpen(true);
                        setIsMonthSelectorOpen(false);
                    }}
                    className="flex flex-col items-center group cursor-pointer"
                >
                    <div className={cn(
                        "flex items-center gap-2 transition-all duration-300 font-outfit",
                        isToday ? "text-[#4E56D1] dark:text-indigo-400 scale-105" : "text-slate-700 dark:text-slate-300 group-hover:text-[#4E56D1] dark:group-hover:text-indigo-400"
                    )}>
                        <Calendar size={14} className={cn("transition-colors", isToday ? "text-[#4E56D1] dark:text-indigo-400" : "text-[#4E56D1]/50 dark:text-indigo-400/50")} strokeWidth={2.5} />
                        <span className="text-[17px] font-bold tracking-tight">
                            {format(dateObj, "yyyy. MM. dd.", { locale: ko })}
                        </span>
                    </div>
                    {isToday && (
                        <div className="mt-1 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#4E56D1] to-[#3DAA9C] shadow-sm shadow-indigo-100 dark:shadow-none animate-in slide-in-from-top-1 duration-500">
                            <Sparkles size={8} className="text-white fill-white" />
                            <span className="text-[9px] font-extrabold text-white uppercase tracking-[0.2em] leading-none">Today</span>
                        </div>
                    )}
                </button>

                <button
                    onClick={handleNext}
                    disabled={isPending}
                    className="h-11 w-11 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-[#4E56D1] dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 rounded-full transition-all active:scale-90"
                >
                    <ChevronRight size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* 캘린더 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-6 pt-24 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-sm bg-card/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[3rem] shadow-premium dark:shadow-premium-dark overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col ring-1 ring-border dark:ring-slate-700">
                        {/* 헤더 */}
                        <div className="bg-[#4E56D1] dark:bg-indigo-600 p-6 pb-5 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium opacity-80 tracking-widest uppercase">Select Date</span>
                                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => changeMonth(-1)}
                                    className={cn("p-1 hover:bg-white/10 rounded-lg transition-colors", isMonthSelectorOpen && "invisible")}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setIsMonthSelectorOpen(!isMonthSelectorOpen)}
                                    className="flex items-center gap-1.5 px-4 py-1 hover:bg-white/10 rounded-full transition-all active:scale-95"
                                >
                                    <span className="text-2xl font-normal tracking-tight">
                                        {format(viewDate, "yyyy년 MM월")}
                                    </span>
                                    {isMonthSelectorOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                <button
                                    onClick={() => changeMonth(1)}
                                    className={cn("p-1 hover:bg-white/10 rounded-lg transition-colors", isMonthSelectorOpen && "invisible")}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </div>

                        {/* 달력 또는 월 선택 */}
                        <div className="p-6 transition-all duration-300 min-h-[340px]">
                            {isMonthSelectorOpen ? (
                                <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {months.map((m, idx) => (
                                        <button
                                            key={m}
                                            onClick={() => selectMonth(idx)}
                                            className={cn(
                                                "py-6 rounded-2xl text-xl transition-all",
                                                viewDate.getMonth() === idx
                                                    ? "bg-[#4E56D1] dark:bg-indigo-600 text-white shadow-md font-normal"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-normal"
                                            )}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid grid-cols-7 gap-1 mb-4">
                                        {['주일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                                            <div
                                                key={day}
                                                className={cn(
                                                    "h-8 flex items-center justify-center text-sm font-normal",
                                                    idx === 0 ? "text-red-400" : idx === 6 ? "text-blue-400" : "text-slate-400"
                                                )}
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {calendarDays.map((day) => {
                                            const isCurrentMonth = isSameMonth(day, monthStart);
                                            const isSelected = isSameDay(day, dateObj);
                                            const isTodayDay = isSameDay(day, new Date());
                                            const dayOfWeek = day.getDay(); // 0 is Sunday, 6 is Saturday

                                            return (
                                                <button
                                                    key={day.toString()}
                                                    onClick={() => navigateTo(day)}
                                                    className={cn(
                                                        "h-11 rounded-xl text-xl transition-all font-normal",
                                                        !isCurrentMonth ? "text-slate-100 dark:text-slate-800" :
                                                            isSelected ? "bg-[#4E56D1] dark:bg-indigo-600 text-white shadow-premium dark:shadow-none" :
                                                                "text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50",
                                                        isCurrentMonth && !isSelected && dayOfWeek === 0 && "text-red-500",
                                                        isCurrentMonth && !isSelected && dayOfWeek === 6 && "text-blue-500",
                                                        isTodayDay && !isSelected && "ring-1 ring-inset ring-indigo-200/50 dark:ring-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-900/10"
                                                    )}
                                                >
                                                    {format(day, "d")}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 오늘로 이동 버튼 */}
                        {!isMonthSelectorOpen && (
                            <div className="px-6 pb-8">
                                <button
                                    onClick={() => navigateTo(new Date())}
                                    className="w-full py-4 bg-muted hover:bg-slate-100 dark:hover:bg-slate-800 text-[#4E56D1] dark:text-indigo-400 text-base font-normal rounded-2xl transition-all active:scale-[0.98]"
                                >
                                    오늘로 이동하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
