"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function ChurchLogo() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex justify-center items-center py-4">
            <div className="flex items-center justify-center transition-all duration-500 hover:scale-105">
                {!isError ? (
                    <a
                        href="http://mokposarang.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative flex items-center justify-center group cursor-pointer"
                    >
                        <img
                            src="/logo-final.png?v=11"
                            alt="사랑의교회"
                            className="h-11 w-auto object-contain transition-opacity group-hover:opacity-80"
                            style={{
                                filter: mounted && theme === 'dark'
                                    ? 'brightness(1.5) saturate(0) contrast(2) invert(1)'
                                    : 'brightness(0.3) saturate(4) contrast(1.1) hue-rotate(-10deg) drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                            }}
                            onError={() => setIsError(true)}
                        />
                    </a>
                ) : (
                    <a
                        href="http://mokposarang.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 font-bold text-sm tracking-tight opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        사랑의교회
                    </a>
                )}
            </div>
        </div>
    );
}
