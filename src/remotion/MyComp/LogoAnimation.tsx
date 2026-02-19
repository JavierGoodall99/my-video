import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    random,
    Audio,
    staticFile,
    Sequence,
} from "remotion";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import React, { useMemo } from "react";

const { fontFamily: sansFont } = loadSpaceGrotesk();
const { fontFamily: serifFont } = loadCormorant();

// ─── Brand Palette ──────────────────────────────────────────────────────────
const BRAND_LIME = "#ccff00";
const BRAND_DARK = "#070707";
const GLITCH_CYAN = "#00ffff";
const GLITCH_RED = "#ff0055";

// ─── Timeline (frames @ 30fps ≈ 12s total) ──────────────────────────────────
const T = {
    barsIn: 0,   // cinematic bars slide in
    dustStart: 15,  // ambient particles drift up
    taglineIn: 35,  // "A NEW EXPERIENCE IS COMING" fades in
    lineStart: 55,  // decorative line draws across
    logoIn: 110, // logo slams down
    glitchEnd: 125, // glitch settles
    subtitleIn: 135, // "WEB DESIGN AGENCY"
    comingSoonIn: 175, // "COMING SOON" rises
    dateIn: 215, // date/year appears
    hold: 270, // everything holds
    fadeOut: 320, // fade to black
    total: 360, // ~12 seconds at 30fps
};

// ─── Dust Particle ───────────────────────────────────────────────────────────
const DustParticle: React.FC<{ seed: number }> = ({ seed }) => {
    const frame = useCurrentFrame();
    const x = random(seed * 13) * 100;           // % across screen
    const speed = random(seed * 7) * 0.08 + 0.03;   // px/frame upward drift
    const size = random(seed * 3) * 2.5 + 0.5;
    const delay = random(seed * 5) * 60;

    const age = Math.max(0, frame - T.dustStart - delay);
    const y = 95 - age * speed * 100;             // drift up
    const opacity = interpolate(age, [0, 20, 200, 260], [0, 0.6, 0.4, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    if (y < -5) return null;

    return (
        <div
            style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: BRAND_LIME,
                opacity,
                boxShadow: `0 0 ${size * 3}px ${BRAND_LIME}`,
            }}
        />
    );
};

// ─── Glitch helper ───────────────────────────────────────────────────────────
function getGlitchStyle(
    color: string,
    offsetX: number,
    offsetY: number,
    clipPath: string,
    fontFamily: string,
    fontSize: number = 140
): React.CSSProperties {
    return {
        fontFamily,
        fontSize,
        fontWeight: 900,
        color,
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        opacity: 0.75,
        letterSpacing: "-0.04em",
        clipPath,
        margin: 0,
        lineHeight: 1,
        mixBlendMode: "screen",
    };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const LogoAnimation: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    const isVertical = height > width;

    // Particles — stable reference
    const particles = useMemo(
        () => Array.from({ length: 40 }, (_, i) => i),
        []
    );

    // ── 1. Cinematic bars ─────────────────────────────────────────────────────
    const barProgress = spring({
        frame,
        fps,
        config: { mass: 1, damping: 18, stiffness: 60 },
        durationInFrames: 40,
    });
    const barHeight = interpolate(barProgress, [0, 1], [0, height * (isVertical ? 0.05 : 0.1)]);

    // ── 2. Tagline ────────────────────────────────────────────────────────────
    const taglineProgress = spring({
        frame: frame - T.taglineIn,
        fps,
        config: { mass: 1, damping: 20, stiffness: 50 },
    });
    const taglineOpacity = interpolate(taglineProgress, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const taglineY = interpolate(taglineProgress, [0, 1], [15, 0]);

    // ── 3. Line draw ──────────────────────────────────────────────────────────
    const lineProgress = spring({
        frame: frame - T.lineStart,
        fps,
        config: { mass: 1, damping: 22, stiffness: 60 },
        durationInFrames: 55,
    });
    const lineWidth = interpolate(lineProgress, [0, 1], [0, width * (isVertical ? 0.8 : 0.6)]);

    // ── 4. Logo slam ──────────────────────────────────────────────────────────
    const logoSlam = spring({
        frame: frame - T.logoIn,
        fps,
        config: { mass: 2.2, damping: 14, stiffness: 280 },
    });
    const logoScale = interpolate(logoSlam, [0, 1], [5, 1]);
    const logoOpacity = frame >= T.logoIn ? 1 : 0;

    const isGlitching = frame >= T.logoIn && frame < T.glitchEnd;
    const glitchSkew = isGlitching ? random(frame + 2) * 20 - 10 : 0;
    const clipPath1 = isGlitching
        ? `inset(${random(frame + 3) * 70}% 0 ${random(frame + 4) * 70}% 0)`
        : "none";
    const clipPath2 = isGlitching
        ? `inset(${random(frame + 5) * 70}% 0 ${random(frame + 6) * 70}% 0)`
        : "none";
    const shakeX = isGlitching ? random(frame) * 24 - 12 : 0;
    const shakeY = isGlitching ? random(frame + 1) * 24 - 12 : 0;

    // ── 5. Impact flash ───────────────────────────────────────────────────────
    const flashOpacity = interpolate(frame - T.logoIn, [0, 2], [0.85, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // ── 6. Subtitle ───────────────────────────────────────────────────────────
    const subtitleProgress = spring({
        frame: frame - T.subtitleIn,
        fps,
        config: { mass: 1, damping: 18, stiffness: 55 },
    });
    const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const subtitleY = interpolate(subtitleProgress, [0, 1], [20, 0]);

    // ── 7. COMING SOON ────────────────────────────────────────────────────────
    const comingSoonProgress = spring({
        frame: frame - T.comingSoonIn,
        fps,
        config: { mass: 1, damping: 20, stiffness: 45 },
    });
    const comingSoonOpacity = interpolate(comingSoonProgress, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const comingSoonY = interpolate(comingSoonProgress, [0, 1], [30, 0]);
    const comingSoonScale = interpolate(comingSoonProgress, [0, 1], [0.92, 1]);

    // ── 8. Date ───────────────────────────────────────────────────────────────
    const dateProgress = spring({
        frame: frame - T.dateIn,
        fps,
        config: { mass: 1, damping: 22, stiffness: 50 },
    });
    const dateOpacity = interpolate(dateProgress, [0, 1], [0, 0.65], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // ── 9. Final fade to black ────────────────────────────────────────────────
    const finalFade = interpolate(frame, [T.fadeOut, T.total - 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // ── 10. Vignette pulse — subtle breathing after hold ──────────────────────
    const vignetteIntensity = interpolate(
        frame,
        [T.hold, T.hold + 40],
        [0.55, 0.7],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // responsive configs
    const mainFontSize = isVertical ? 120 : 140;
    const comingSoonSize = isVertical ? 60 : 72;
    const taglineSize = isVertical ? 24 : 13;
    const subtitleSize = isVertical ? 28 : 15;
    const dateSize = isVertical ? 24 : 12;


    return (
        <AbsoluteFill style={{ backgroundColor: BRAND_DARK, overflow: "hidden" }}>

            {/* ── AUDIO ──────────────────────────────────────────────────────── */}

            {/* Cinematic ambient swell, fades as logo hits */}
            <Sequence durationInFrames={T.logoIn + 15}>
                <Audio
                    src={staticFile("audio/cinematic_rise.mp3")}
                    volume={(f) =>
                        interpolate(
                            f,
                            [T.logoIn - 10, T.logoIn + 15],
                            [0.7, 0],
                            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                        )
                    }
                />
            </Sequence>

            {/* Glitch burst on logo slam */}
            <Sequence from={T.logoIn} durationInFrames={T.glitchEnd - T.logoIn}>
                <Audio src={staticFile("audio/glitch.mp3")} volume={0.55} />
            </Sequence>

            {/* Deep cinematic impact */}
            <Sequence from={T.logoIn - 2}>
                <Audio
                    src={staticFile("audio/slam.mp3")}
                    volume={(f) =>
                        interpolate(
                            f,
                            [T.fadeOut - (T.logoIn - 2), T.total - (T.logoIn - 2)],
                            [1, 0],
                            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                        )
                    }
                />
            </Sequence>

            {/* Subtle tension texture under "coming soon" reveal */}
            <Sequence from={T.comingSoonIn}>
                <Audio
                    src={staticFile("audio/tension.mp3")}
                    volume={(f) =>
                        interpolate(
                            f,
                            [0, 20, T.fadeOut - T.comingSoonIn, T.total - T.comingSoonIn],
                            [0, 0.3, 0.3, 0],
                            {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                            }
                        )
                    }
                />
            </Sequence>

            {/* ── FILM GRAIN OVERLAY ─────────────────────────────────────────── */}
            <AbsoluteFill
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundSize: "200px 200px",
                    opacity: 0.04 + (random(frame) * 0.02),
                    mixBlendMode: "overlay",
                    pointerEvents: "none",
                }}
            />

            {/* ── VIGNETTE ───────────────────────────────────────────────────── */}
            <AbsoluteFill
                style={{
                    background: `radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,${vignetteIntensity}) 100%)`,
                    pointerEvents: "none",
                }}
            />

            {/* ── DUST PARTICLES ─────────────────────────────────────────────── */}
            <AbsoluteFill style={{ pointerEvents: "none" }}>
                {particles.map((i) => (
                    <DustParticle key={i} seed={i} />
                ))}
            </AbsoluteFill>

            {/* ── MAIN CONTENT (with screen shake) ───────────────────────────── */}
            <AbsoluteFill
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    transform: `translate(${shakeX}px, ${shakeY}px)`,
                }}
            >
                {/* Tagline above line */}
                <div
                    style={{
                        fontFamily: serifFont,
                        fontSize: taglineSize,
                        fontWeight: 400,
                        letterSpacing: "0.55em",
                        color: "rgba(255,255,255,0.45)",
                        textTransform: "uppercase",
                        marginBottom: 22,
                        opacity: taglineOpacity,
                        transform: `translateY(${taglineY}px)`,
                        textAlign: "center",
                        width: "100%",
                    }}
                >
                    a new digital experience
                </div>

                {/* Decorative line */}
                <div style={{ position: "relative", marginBottom: 32 }}>
                    <div
                        style={{
                            width: lineWidth,
                            height: isGlitching ? 3 : 2,
                            backgroundColor: isGlitching && random(frame) > 0.5 ? "white" : BRAND_LIME,
                            boxShadow: `0 0 ${isGlitching ? 40 : 18}px ${BRAND_LIME}66`,
                            transition: "height 0.05s",
                        }}
                    />
                    {/* Line glow pulse after glitch settles */}
                    {!isGlitching && frame > T.glitchEnd && (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: `linear-gradient(90deg, transparent, ${BRAND_LIME}44, transparent)`,
                                opacity: interpolate(
                                    (frame - T.glitchEnd) % 90,
                                    [0, 45, 90],
                                    [0, 0.8, 0]
                                ),
                            }}
                        />
                    )}
                </div>

                {/* Logo block */}
                <div
                    style={{
                        position: "relative",
                        transform: `scale(${logoScale}) skewX(${glitchSkew}deg)`,
                        opacity: logoOpacity,
                    }}
                >
                    {isGlitching && (
                        <h1 style={getGlitchStyle(GLITCH_RED, -12, 4, clipPath1, sansFont, mainFontSize)} aria-hidden>
                            JAYGOOD
                        </h1>
                    )}
                    {isGlitching && (
                        <h1 style={getGlitchStyle(GLITCH_CYAN, 12, -4, clipPath2, sansFont, mainFontSize)} aria-hidden>
                            JAYGOOD
                        </h1>
                    )}
                    <h1
                        style={{
                            fontFamily: sansFont,
                            fontSize: mainFontSize,
                            fontWeight: 900,
                            color: isGlitching && random(frame) > 0.65 ? "white" : BRAND_LIME,
                            letterSpacing: "-0.04em",
                            textShadow: isGlitching
                                ? `0 0 60px ${BRAND_LIME}`
                                : `0 0 80px ${BRAND_LIME}33`,
                            margin: 0,
                            lineHeight: 1,
                        }}
                    >
                        JAYGOOD
                    </h1>
                </div>

                {/* Agency subtitle */}
                <div
                    style={{
                        fontFamily: sansFont,
                        fontSize: subtitleSize,
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "0.5em",
                        textTransform: "uppercase",
                        marginTop: 14,
                        opacity: subtitleOpacity,
                        transform: `translateY(${subtitleY}px)`,
                        textAlign: "center",
                    }}
                >
                    Web Design Agency
                </div>

                {/* Separator */}
                <div
                    style={{
                        width: 1,
                        height: interpolate(
                            comingSoonProgress,
                            [0, 1],
                            [0, 40],
                            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                        ),
                        backgroundColor: `rgba(204,255,0,0.3)`,
                        marginTop: 28,
                        marginBottom: 28,
                    }}
                />

                {/* COMING SOON */}
                <div
                    style={{
                        opacity: comingSoonOpacity,
                        transform: `translateY(${comingSoonY}px) scale(${comingSoonScale})`,
                    }}
                >
                    <div
                        style={{
                            fontFamily: serifFont,
                            fontSize: comingSoonSize,
                            fontWeight: 300,
                            fontStyle: "italic",
                            color: "white",
                            letterSpacing: "0.1em",
                            textAlign: "center",
                            lineHeight: 1,
                            textShadow: "0 0 60px rgba(255,255,255,0.15)",
                        }}
                    >
                        Coming Soon
                    </div>
                </div>

                {/* Date */}
                <div
                    style={{
                        fontFamily: sansFont,
                        fontSize: dateSize,
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.5)",
                        letterSpacing: "0.6em",
                        textTransform: "uppercase",
                        marginTop: 18,
                        opacity: dateOpacity,
                    }}
                >
                    2026
                </div>
            </AbsoluteFill>

            {/* ── CINEMATIC LETTERBOX BARS ────────────────────────────────────── */}
            {/* Top bar */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: barHeight,
                    backgroundColor: "#000",
                }}
            />
            {/* Bottom bar */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: barHeight,
                    backgroundColor: "#000",
                }}
            />

            {/* ── IMPACT FLASH ───────────────────────────────────────────────── */}
            {frame >= T.logoIn && (
                <AbsoluteFill
                    style={{
                        backgroundColor: "white",
                        opacity: flashOpacity,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* ── FINAL FADE TO BLACK ────────────────────────────────────────── */}
            <AbsoluteFill
                style={{
                    backgroundColor: "#000",
                    opacity: finalFade,
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};