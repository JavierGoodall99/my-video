import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig, Audio, staticFile } from 'remotion';
import { Intro } from '../ProjectShowcase/Intro';
import { Outro } from '../ProjectShowcase/Outro';
import { projects } from '../ProjectShowcase/projectsData';
import { ProjectCard } from '../ProjectShowcase/ProjectCard';
import { About } from './About';
import { Services } from './Services';
import { spring, interpolate, useCurrentFrame } from 'remotion';

export const AgencyPromo: React.FC = () => {
    const { fps } = useVideoConfig();

    // Durations
    const INTRO_DURATION = 40;
    const ABOUT_DURATION = 240; // 8 seconds for manifesto (extended from 180)
    const SERVICES_DURATION = 4 * 90; // 4 services * 90 frames each = 360

    // Project Showcase settings (faster for promo)
    const SLIDE_DURATION = 2 * fps; // 2 seconds per project
    const TRANSITION_DURATION = 10;

    const WORK_START = INTRO_DURATION + ABOUT_DURATION + SERVICES_DURATION;
    const WORK_DURATION = (projects.length * (SLIDE_DURATION - TRANSITION_DURATION)) + TRANSITION_DURATION; // approximate

    const OUTRO_START = WORK_START;
    const OUTRO_DURATION = 150; // 5 seconds for outro (extended from 120)

    return (
        <AbsoluteFill className="bg-brand-dark">
            <Audio src={staticFile("audio/logosoundtrack.mp3")} volume={0.6} loop />

            {/* 1. INTRO */}
            <Sequence from={0} durationInFrames={INTRO_DURATION}>
                <Intro />
            </Sequence>

            {/* 2. ABOUT (Manifesto) */}
            <Sequence from={INTRO_DURATION} durationInFrames={ABOUT_DURATION}>
                <About />
            </Sequence>

            {/* 3. SERVICES */}
            <Sequence from={INTRO_DURATION + ABOUT_DURATION} durationInFrames={SERVICES_DURATION}>
                <Services />
            </Sequence>

            {/* 5. OUTRO */}
            <Sequence from={OUTRO_START} durationInFrames={OUTRO_DURATION}>
                <Outro />
            </Sequence>

            {/* Overlay */}
            <AbsoluteFill className="pointer-events-none z-50">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        filter: 'contrast(150%) brightness(100%)'
                    }}
                />
                <div className="absolute top-0 left-0 right-0 h-[10%] bg-black z-50" />
                <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black z-50" />
            </AbsoluteFill>

        </AbsoluteFill>
    );
};

// Simplified Slide for Promo (faster, no ken burns to keep it punchy?)
// Actually keeping the same style is good for consistency.
const PromoSlide: React.FC<{ project: typeof projects[0] }> = ({ project }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const scale = spring({
        frame,
        fps,
        config: { stiffness: 100, damping: 10 },
        from: 1.1,
        to: 1
    });

    const opacity = interpolate(
        frame,
        [0, 10, durationInFrames - 10, durationInFrames],
        [0, 1, 1, 0]
    );

    return (
        <ProjectCard
            project={project}
            opacity={opacity}
            scale={scale}
            translateY={0}
        />
    );
}
