import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const Outro: React.FC = () => {
    const frame = useCurrentFrame();

    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 15], [0, 1]);

    const titleY = spring({
        frame,
        fps,
        config: { damping: 12 },
        from: 50,
        to: 0
    });

    const subtileY = spring({
        frame,
        fps,
        delay: 5,
        config: { damping: 12 },
        from: 50,
        to: 0
    });

    return (
        <AbsoluteFill className="bg-brand-dark items-center justify-center">
            <div className="text-center">
                <h2
                    className="font-display font-bold text-6xl text-white mb-6"
                    style={{
                        opacity,
                        transform: `translateY(${titleY}px)`
                    }}
                >
                    READY TO <span className="text-brand-lime">OUTPERFORM?</span>
                </h2>
                <p
                    className="font-mono text-xl text-gray-400 tracking-widest"
                    style={{
                        opacity,
                        transform: `translateY(${subtileY}px)`
                    }}
                >
                    WWW.JAYGOOD.AGENCY
                </p>
            </div>
        </AbsoluteFill>
    );
};
