'use client';

import React, { useEffect, useState } from 'react';
import { YoutubeVideo, fetchYoutubePlaylist, getDayOfYear, getVideoForDay, parseDurationToMinutes } from '@/lib/youtube';
import { Play, Loader2, Youtube } from 'lucide-react';

interface YoutubePlayerProps {
    selectedDate?: string;
}

export default function YoutubePlayer({ selectedDate }: YoutubePlayerProps) {
    const [videos, setVideos] = useState<YoutubeVideo[]>([]);
    const [currentVideo, setCurrentVideo] = useState<YoutubeVideo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 초기 데이터 로딩
    useEffect(() => {
        const initYoutube = async () => {
            try {
                setLoading(true);
                const fetchedVideos = await fetchYoutubePlaylist();
                setVideos(fetchedVideos);
            } catch (err) {
                setError('유튜브 영상을 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        initYoutube();
    }, []);

    // 날짜 변경 시 영상 업데이트
    useEffect(() => {
        if (videos.length > 0) {
            const dateObj = selectedDate ? new Date(selectedDate) : new Date();
            const day = getDayOfYear(dateObj);
            const todayVideo = getVideoForDay(videos, day);
            setCurrentVideo(todayVideo);
        }
    }, [videos, selectedDate]);

    if (loading) {
        return (
            <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800/50 rounded-3xl flex flex-col items-center justify-center gap-3 animate-pulse">
                <Loader2 className="w-8 h-8 text-[#4E56D1] dark:text-indigo-400 animate-spin" />
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">오늘의 성경 읽기 영상을 불러오는 중...</p>
            </div>
        );
    }

    const dayOfYear = selectedDate ? getDayOfYear(new Date(selectedDate)) : getDayOfYear();

    if (error || (!currentVideo && dayOfYear !== 246)) {
        return (
            <div className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center">
                    <Youtube className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <div>
                    <h3 className="text-slate-600 dark:text-slate-400 font-semibold mb-1">영상을 찾을 수 없습니다</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm leading-relaxed">
                        해당 날짜의 영상이 재생목록에 없거나<br />
                        API 키 설정이 필요합니다.
                    </p>
                </div>
            </div>
        );
    }

    // 246회 예외 처리 (영상 없음)
    if (dayOfYear === 246) {
        return (
            <div className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-3">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-full">
                    <Youtube className="w-6 h-6 text-[#4E56D1] dark:text-indigo-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{dayOfYear}일차는 영상이 제공되지 않습니다.</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <Youtube className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none">오늘의 성경 읽기</h2>
                        {currentVideo?.duration && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                                소요시간 약 {parseDurationToMinutes(currentVideo.duration)}분
                            </span>
                        )}
                    </div>
                </div>
                <span className="text-sm font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-[#4E56D1] dark:text-indigo-400 rounded-full">
                    {dayOfYear}일차
                </span>
            </div>

            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-15 group-hover:opacity-25 transition duration-500"></div>
                <div className="relative overflow-hidden rounded-3xl bg-black aspect-video shadow-2xl">
                    <iframe
                        src={`https://www.youtube.com/embed/${currentVideo!.videoId}?rel=0&modestbranding=1`}
                        title={currentVideo!.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>

            <div className="px-2">
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 line-clamp-1">
                    {currentVideo!.title}
                </h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                    매일 차곡차곡 쌓이는 하나님 나라의 이야기
                </p>
            </div>
        </div>
    );
}
