import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Sequence,
} from 'remotion';

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND_LIME = '#C8FF00';
const BRAND_DARK = '#0A0A0A';
const MUTED = '#333333';
const DURATION_PER_ITEM = 90; // frames

const services = [
    'DIGITAL DIRECTION',
    'INTERFACE DESIGN',
    'CREATIVE DEV',
    'ARCHITECTURE',
];

// ─── Shared overlays (same as About) ─────────────────────────────────────────

const GrainOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => (
    <svg
        style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
            opacity,
            zIndex: 100,
        }}
    >
        <filter id="grain-s">
            <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-s)" />
    </svg>
);

const Vignette: React.FC = () => (
    <div
        style={{
            position: 'absolute',
            inset: 0,
            background:
                'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)',
            pointerEvents: 'none',
            zIndex: 99,
        }}
    />
);

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar: React.FC<{ totalFrame: number }> = ({ totalFrame }) => {
    const totalFrames = services.length * DURATION_PER_ITEM;
    const progress = totalFrame / totalFrames;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 48,
                left: '10%',
                right: '10%',
                height: 1,
                backgroundColor: MUTED,
                zIndex: 10,
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${progress * 100}%`,
                    backgroundColor: BRAND_LIME,
                    transition: 'none',
                }}
            />
        </div>
    );
};

// ─── Service index label ──────────────────────────────────────────────────────

const IndexLabel: React.FC<{ index: number; frame: number; fps: number }> = ({
    index,
    frame,
    fps,
}) => {
    const y = spring({
        frame,
        fps,
        config: { stiffness: 200, damping: 22 },
        from: 20,
        to: 0,
    });

    const opacity = interpolate(frame, [0, 8], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <div
            style={{
                position: 'absolute',
                top: 48,
                left: '10%',
                transform: `translateY(${y}px)`,
                opacity,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                zIndex: 10,
            }}
        >
            <span
                style={{
                    color: BRAND_LIME,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                }}
            >
                {String(index + 1).padStart(2, '0')}
            </span>
            <div style={{ width: 32, height: 1, backgroundColor: MUTED }} />
            <span
                style={{
                    color: MUTED,
                    fontSize: 11,
                    fontWeight: 400,
                    letterSpacing: '0.25em',
                    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                }}
            >
                {String(services.length).padStart(2, '0')}
            </span>
        </div>
    );
};

// ─── Char-level split text ────────────────────────────────────────────────────

const SplitChars: React.FC<{
    text: string;
    frame: number;
    fps: number;
    entryDone: number;   // frame at which entry finishes
    exitStart: number;   // frame at which exit begins
    color: string;
    fontSize: number;
    strokeOnly?: boolean;
    scaleOffset?: number;
    opacityScale?: number;
    charStagger?: number;
}> = ({
    text,
    frame,
    fps,
    exitStart,
    color,
    fontSize,
    strokeOnly = false,
    scaleOffset = 1,
    opacityScale = 1,
    charStagger = 3,
}) => {
        const chars = text.split('');

        // Exit: upward blur-out
        const exitProgress = interpolate(frame, [exitStart, exitStart + 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
        const exitBlur = exitProgress * 16;
        const exitOpacityFade = 1 - exitProgress;
        const exitY = exitProgress * -40;

        return (
            <span
                style={{
                    display: 'inline-flex',
                    filter: `blur(${exitBlur}px)`,
                    transform: `translateY(${exitY}px)`,
                    opacity: exitOpacityFade,
                    willChange: 'transform, opacity, filter',
                }}
            >
                {chars.map((char, i) => {
                    const delay = i * charStagger;
                    const localFrame = frame - delay;

                    const y = spring({
                        frame: localFrame,
                        fps,
                        config: { stiffness: 300, damping: 24 },
                        from: 80,
                        to: 0,
                    });

                    const opacity =
                        interpolate(localFrame, [0, 6], [0, 1], {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                        }) * opacityScale;

                    const charScale = spring({
                        frame: localFrame,
                        fps,
                        config: { stiffness: 200, damping: 18 },
                        from: 0.85,
                        to: scaleOffset,
                    });

                    if (localFrame < 0) {
                        return (
                            <span
                                key={i}
                                style={{ opacity: 0, display: 'inline-block', fontSize }}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        );
                    }

                    return (
                        <span
                            key={i}
                            style={{
                                display: 'inline-block',
                                transform: `translateY(${y}px) scale(${charScale})`,
                                opacity,
                                color: strokeOnly ? 'transparent' : color,
                                WebkitTextStroke: strokeOnly ? `1.5px ${color}` : undefined,
                                fontSize,
                                fontWeight: 900,
                                letterSpacing: '-0.03em',
                                lineHeight: 1,
                                fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                            }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    );
                })}
            </span>
        );
    };

// ─── Background glow per item ─────────────────────────────────────────────────

const ItemGlow: React.FC<{ frame: number; exitStart: number }> = ({
    frame,
    exitStart,
}) => {
    const entry = interpolate(frame, [0, 20], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const exit = interpolate(frame, [exitStart - 5, exitStart + 10], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const opacity = Math.min(entry, exit) * 0.06;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse 70% 40% at 50% 55%, ${BRAND_LIME}, transparent)`,
                opacity,
                pointerEvents: 'none',
            }}
        />
    );
};

// ─── Single service item ──────────────────────────────────────────────────────

const ServiceItem: React.FC<{ text: string; index: number }> = ({
    text,
    index,
}) => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();

    const EXIT_START = DURATION_PER_ITEM - 12;
    const fontSize = width * 0.095;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: BRAND_DARK,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Per-item bg glow */}
            <ItemGlow frame={frame} exitStart={EXIT_START} />

            {/* Index counter */}
            <IndexLabel index={index} frame={frame} fps={fps} />

            {/* Text stack */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Outline layer */}
                <SplitChars
                    text={text}
                    frame={frame}
                    fps={fps}
                    entryDone={text.length * 3 + 20}
                    exitStart={EXIT_START}
                    color="white"
                    fontSize={fontSize}
                    strokeOnly
                    charStagger={3}
                    opacityScale={1}
                />

                {/* Lime filled overlay — slightly larger, mix-blend-screen */}
                <span
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mixBlendMode: 'screen',
                    }}
                >
                    <SplitChars
                        text={text}
                        frame={frame}
                        fps={fps}
                        entryDone={text.length * 3 + 20}
                        exitStart={EXIT_START}
                        color={BRAND_LIME}
                        fontSize={fontSize * 1.018}
                        strokeOnly={false}
                        scaleOffset={1.018}
                        opacityScale={0.45}
                        charStagger={3}
                    />
                </span>
            </div>

            {/* Thin accent rule under text */}
            <AccentRule frame={frame} exitStart={EXIT_START} />

            {/* Vignette */}
            <Vignette />

            {/* Grain */}
            <GrainOverlay />
        </AbsoluteFill>
    );
};

// ─── Accent rule ──────────────────────────────────────────────────────────────

const AccentRule: React.FC<{ frame: number; exitStart: number }> = ({
    frame,
    exitStart,
}) => {
    const entry = interpolate(frame, [12, 28], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const exit = interpolate(frame, [exitStart, exitStart + 8], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const progress = Math.min(entry, exit);

    return (
        <div
            style={{
                marginTop: 20,
                width: `${progress * 60}px`,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${BRAND_LIME}, transparent)`,
                opacity: 0.6,
            }}
        />
    );
};

// ─── Root component ───────────────────────────────────────────────────────────

export const Services: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <AbsoluteFill style={{ backgroundColor: BRAND_DARK, fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' }}>
            {services.map((service, i) => (
                <Sequence
                    key={i}
                    from={i * DURATION_PER_ITEM}
                    durationInFrames={DURATION_PER_ITEM}
                >
                    <ServiceItem text={service} index={i} />
                </Sequence>
            ))}

            {/* Global progress bar sits above all sequences */}
            <ProgressBar totalFrame={frame} />
        </AbsoluteFill>
    );
};