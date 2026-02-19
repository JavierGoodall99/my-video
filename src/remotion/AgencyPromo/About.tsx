import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';

// ─── Config ──────────────────────────────────────────────────────────────────

const BRAND_LIME = '#C8FF00';
const BRAND_DARK = '#0A0A0A';
const MUTED = '#444444';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function useSmoothProgress(frame: number, delay: number, duration: number) {
  const raw = Math.max(0, frame - delay);
  return Math.min(1, raw / duration);
}

// ─── Grain overlay (SVG-based, no external deps) ──────────────────────────────

const GrainOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => (
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
    <filter id="grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.65"
        numOctaves="3"
        stitchTiles="stitch"
      />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

// ─── Vignette ────────────────────────────────────────────────────────────────

const Vignette: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background:
        'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)',
      pointerEvents: 'none',
      zIndex: 99,
    }}
  />
);

// ─── Scanline ────────────────────────────────────────────────────────────────

const Scanline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // A single horizontal light band that sweeps down over ~1.5s then vanishes
  const duration = fps * 1.5;
  const progress = easeOutExpo(Math.min(1, frame / duration));
  const y = interpolate(progress, [0, 1], [-5, 105]);
  const opacity = interpolate(frame, [0, duration - 10, duration], [0.3, 0.3, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${y}%`,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${BRAND_LIME}55, transparent)`,
        opacity,
        zIndex: 98,
        pointerEvents: 'none',
      }}
    />
  );
};

// ─── Character-level animated word ───────────────────────────────────────────

const AnimatedChars: React.FC<{
  text: string;
  frame: number;
  fps: number;
  startFrame: number;
  color: string;
  fontSize: number;
  charStagger?: number;
}> = ({ text, frame, fps, startFrame, color, fontSize, charStagger = 3 }) => {
  return (
    <span style={{ display: 'inline-flex', overflow: 'hidden' }}>
      {text.split('').map((char, i) => {
        const delay = startFrame + i * charStagger;
        const localFrame = frame - delay;

        const y = spring({
          frame: localFrame,
          fps,
          config: { stiffness: 280, damping: 22 },
          from: 60,
          to: 0,
        });

        const opacity = interpolate(localFrame, [0, 6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        if (localFrame < 0) {
          return (
            <span key={i} style={{ opacity: 0, display: 'inline-block' }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        }

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}px)`,
              opacity,
              color,
              fontSize,
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
};

// ─── Glitch word ─────────────────────────────────────────────────────────────

const GlitchWord: React.FC<{
  text: string;
  frame: number;
  fps: number;
  startFrame: number;
  fontSize: number;
}> = ({ text, frame, fps, startFrame, fontSize }) => {
  const localFrame = frame - startFrame;

  const y = spring({
    frame: localFrame,
    fps,
    config: { stiffness: 240, damping: 18 },
    from: 80,
    to: 0,
  });

  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glitch pulses: brief offsets at specific frames after entry
  const glitchFrames = [8, 9, 22, 23, 40];
  const isGlitching = glitchFrames.includes(localFrame);
  const glitchX = isGlitching ? (Math.random() > 0.5 ? 4 : -4) : 0;
  const glitchOpacity = isGlitching ? 0.7 : 1;

  if (localFrame < 0) return null;

  const sharedStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize,
    fontWeight: 900,
    letterSpacing: '-0.04em',
    lineHeight: 0.9,
    userSelect: 'none',
  };

  return (
    <div
      style={{
        position: 'relative',
        transform: `translateY(${y}px)`,
        opacity,
        display: 'inline-block',
        overflow: 'visible',
      }}
    >
      {/* Chromatic aberration layers */}
      {isGlitching && (
        <>
          <span
            style={{
              ...sharedStyle,
              color: '#FF003C',
              transform: `translateX(${glitchX + 3}px)`,
              opacity: 0.6,
              mixBlendMode: 'screen',
            }}
          >
            {text}
          </span>
          <span
            style={{
              ...sharedStyle,
              color: '#00FFFF',
              transform: `translateX(${glitchX - 3}px)`,
              opacity: 0.6,
              mixBlendMode: 'screen',
            }}
          >
            {text}
          </span>
        </>
      )}
      {/* Main text */}
      <span
        style={{
          position: 'relative',
          color: BRAND_LIME,
          fontSize,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          transform: `translateX(${glitchX}px)`,
          display: 'inline-block',
          opacity: glitchOpacity,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── Slim word (supporting text) ─────────────────────────────────────────────

const SlimWord: React.FC<{
  text: string;
  frame: number;
  fps: number;
  startFrame: number;
  color?: string;
  fontSize?: number;
}> = ({ text, frame, fps, startFrame, color = MUTED, fontSize = 56 }) => {
  const localFrame = frame - startFrame;

  const x = spring({
    frame: localFrame,
    fps,
    config: { stiffness: 160, damping: 20 },
    from: -30,
    to: 0,
  });

  const opacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (localFrame < 0) return null;

  return (
    <div
      style={{
        transform: `translateX(${x}px)`,
        opacity,
        color,
        fontSize,
        fontWeight: 300,
        letterSpacing: '0.2em',
        lineHeight: 0.9,
        fontFamily: 'inherit',
      }}
    >
      {text}
    </div>
  );
};

// ─── Accent line ─────────────────────────────────────────────────────────────

const AccentLine: React.FC<{ frame: number; startFrame: number }> = ({
  frame,
  startFrame,
}) => {
  const localFrame = frame - startFrame;
  const progress = easeOutExpo(
    Math.min(1, Math.max(0, localFrame) / 20)
  );

  if (localFrame < 0) return null;

  return (
    <div
      style={{
        width: `${progress * 80}px`,
        height: 2,
        background: `linear-gradient(90deg, ${BRAND_LIME}, transparent)`,
        marginTop: 8,
        marginBottom: 8,
        alignSelf: 'flex-start',
      }}
    />
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

export const About: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Background subtle gradient shift
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_DARK,
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '0 10%',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial bg glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 20% 60%, ${BRAND_LIME}08, transparent)`,
          opacity: bgOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* Content stack */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          zIndex: 10,
        }}
      >
        {/* JAYGOOD — character-by-character pop */}
        <div style={{ overflow: 'hidden' }}>
          <AnimatedChars
            text="JAYGOOD"
            frame={frame}
            fps={fps}
            startFrame={0}
            color="#FFFFFF"
            fontSize={width * 0.11}
            charStagger={4}
          />
        </div>

        {/* IS A — slim, light weight, slide in */}
        <SlimWord
          text="IS A"
          frame={frame}
          fps={fps}
          startFrame={30}
          color={MUTED}
          fontSize={width * 0.042}
        />

        {/* Accent line */}
        <AccentLine frame={frame} startFrame={32} />

        {/* REBELLION — glitch hero */}
        <GlitchWord
          text="REBELLION"
          frame={frame}
          fps={fps}
          startFrame={38}
          fontSize={width * 0.13}
        />

        {/* AGAINST — slim */}
        <SlimWord
          text="AGAINST"
          frame={frame}
          fps={fps}
          startFrame={60}
          color={MUTED}
          fontSize={width * 0.042}
        />

        {/* THE TEMPLATE / ECONOMY — bold stacked, char animated */}
        <div style={{ overflow: 'hidden' }}>
          <AnimatedChars
            text="THE TEMPLATE"
            frame={frame}
            fps={fps}
            startFrame={68}
            color="#FFFFFF"
            fontSize={width * 0.072}
            charStagger={3}
          />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <AnimatedChars
            text="ECONOMY"
            frame={frame}
            fps={fps}
            startFrame={92}
            color="#FFFFFF"
            fontSize={width * 0.072}
            charStagger={4}
          />
        </div>
      </div>

      {/* Scanline sweep */}
      <Scanline frame={frame} fps={fps} />

      {/* Vignette */}
      <Vignette />

      {/* Film grain */}
      <GrainOverlay opacity={0.05} />
    </AbsoluteFill>
  );
};