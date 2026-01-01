"use client";

import { BIBLE_BOOKS, BibleBook } from "@/lib/bible-metadata";
import { ChevronRight, Grid3X3, List } from "lucide-react";
import { useState } from "react";

interface BibleProgressMapProps {
    completedVerses: string[]; // e.g., ["창세기 1장", "창세기 2장"]
}

export default function BibleProgressMap({ completedVerses }: BibleProgressMapProps) {
    const [filter, setFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const filteredBooks = BIBLE_BOOKS.filter(book =>
        filter === 'ALL' ? true : book.category === filter
    );

    const formatBookName = (name: string) => {
        // 특정 도서명에 대한 정밀 줄바꿈 규칙
        if (name === '예레미야 애가') {
            return (
                <>
                    <span className="block text-[8px]">예레미야</span>
                    <span className="block">애가</span>
                </>
            );
        }
        if (name.includes('데살로니가')) {
            const suffix = name.slice(-2); // '전서' 또는 '후서'
            return (
                <>
                    <span className="block text-[7px] tracking-tighter">데살로니가</span>
                    <span className="block">{suffix}</span>
                </>
            );
        }
        if (name === '요한계시록') {
            return (
                <>
                    <span className="block">요한</span>
                    <span className="block">계시록</span>
                </>
            );
        }

        const len = name.length;
        if (len >= 5) {
            return (
                <>
                    <span className="block">{name.slice(0, 3)}</span>
                    <span className="block">{name.slice(3)}</span>
                </>
            );
        }
        if (len === 4) {
            return (
                <>
                    <span className="block">{name.slice(0, 2)}</span>
                    <span className="block">{name.slice(2)}</span>
                </>
            );
        }
        return name;
    };

    const getBookProgress = (book: BibleBook) => {
        const completedChapters = completedVerses.filter(v => v.startsWith(book.name)).length;
        return (completedChapters / book.chapters) * 100;
    };

    return (
        <div className="bg-card rounded-[2.5rem] border border-border dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/10">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-3 group"
                >
                    <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        <Grid3X3 size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-black dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                            성경 읽기표
                            <ChevronRight size={14} className={`text-slate-400 dark:text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{isExpanded ? '상세 보기 접기' : '전체 목록 펼치기'}</p>
                    </div>
                </button>

                {isExpanded && (
                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm animate-in fade-in zoom-in duration-300">
                        {(['ALL', 'OT', 'NT'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFilter(f);
                                }}
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${filter === f
                                    ? 'bg-indigo-500 text-white shadow-premium dark:shadow-none'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                {f === 'ALL' ? '전체' : f === 'OT' ? '구약' : '신약'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {filteredBooks.map((book) => {
                            const progress = getBookProgress(book);
                            return (
                                <button
                                    key={book.name}
                                    onClick={() => setSelectedBook(book)}
                                    className={`relative group aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-1.5 ${progress === 100
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                                        : progress > 0
                                            ? 'bg-card border-indigo-100 dark:border-indigo-900/50'
                                            : 'bg-card border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                        }`}
                                >
                                    <div className={`text-[9px] font-bold leading-[1.1] text-center ${progress > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-600'
                                        }`}>
                                        {formatBookName(book.name)}
                                    </div>

                                    {progress > 0 && (
                                        <div className="mt-1 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                            <div
                                                className="bg-indigo-500 dark:bg-indigo-400 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    )}

                                    {/* 툴팁 효과 */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        {book.name} ({Math.round(progress)}%)
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 상세 뷰 모달 (또는 슬라이드업) */}
            {selectedBook && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBook(null)} />
                    <div className="relative w-full max-w-md bg-card/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[3rem] overflow-hidden animate-in slide-in-from-bottom duration-500 ring-1 ring-border dark:ring-slate-700">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-1">{selectedBook.name}</h4>
                                <button onClick={() => setSelectedBook(null)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                                    <ChevronRight className="rotate-90" size={20} />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-500 dark:bg-indigo-400 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${getBookProgress(selectedBook)}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{Math.round(getBookProgress(selectedBook))}%</span>
                            </div>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-5 gap-3">
                                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => {
                                    const isRead = completedVerses.includes(`${selectedBook.name} ${ch}장`);
                                    return (
                                        <div
                                            key={ch}
                                            className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${isRead
                                                ? 'bg-indigo-500 dark:bg-indigo-600 text-white shadow-premium dark:shadow-none'
                                                : 'bg-slate-100 dark:bg-slate-950/40 text-slate-300 dark:text-slate-600'
                                                }`}
                                        >
                                            {ch}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
