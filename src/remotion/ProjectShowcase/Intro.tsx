import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, spring } from 'remotion';

export const Intro: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames, fps } = useVideoConfig();

    // Spring scale for "POP" effect
    const scale = spring({
        frame,
        fps,
        config: {
            stiffness: 200,
            damping: 10,
        },
        from: 0.5,
        to: 1,
    });

    const opacity = interpolate(frame, [0, 10], [0, 1]);

    // Fade out at end
    const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0]);

    return (
        <AbsoluteFill className="bg-brand-dark items-center justify-center">
            <div
                className="flex items-baseline"
                style={{
                    opacity: opacity * fadeOut,
                    transform: `scale(${scale})`,
                }}
            >
                <h1 className="font-display font-bold text-9xl text-white tracking-tighter">
                    JAYGOOD
                </h1>
                <span className="font-display font-bold text-9xl text-brand-lime animate-pulse">
                    .
                </span>
            </div>

            <div
                className="absolute bottom-20 font-mono text-sm tracking-[0.5em] text-gray-500 uppercase"
                style={{
                    opacity: interpolate(frame, [20, 50], [0, 1]) * fadeOut
                }}
            >
                Digital Experience Agency
            </div>
        </AbsoluteFill>
    );
};
