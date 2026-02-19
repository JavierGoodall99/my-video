import React from 'react';
import { AbsoluteFill, useVideoConfig, Sequence, useCurrentFrame, spring, interpolate, Easing, Audio, staticFile } from 'remotion';
import { ProjectCard } from './ProjectCard';
import { projects } from './projectsData';
import { Intro } from './Intro';
import { Outro } from './Outro';

export const ProjectShowcase: React.FC = () => {
    const { fps } = useVideoConfig();

    const INTRO_DURATION = 40; // ~1.5 seconds
    const OUTRO_DURATION = 45; // ~1.5 seconds
    const SLIDE_DURATION = 2.5 * fps; // 75 frames
    const TRANSITION_DURATION = 15; // 0.5 seconds

    return (
        <AbsoluteFill className="bg-brand-dark">
            {/* Background Music */}
            <Audio src={staticFile("audio/logosoundtrack.mp3")} volume={0.5} loop />

            {/* Intro */}
            <Sequence from={0} durationInFrames={INTRO_DURATION}>
                <Audio src={staticFile("audio/cinematic_rise.mp3")} />
                <Intro />
            </Sequence>

            {/* Project Slides loop */}
            {projects.map((project, index) => {
                const startFrame = INTRO_DURATION + index * (SLIDE_DURATION - TRANSITION_DURATION);
                return (
                    <Sequence
                        key={project.id}
                        from={startFrame}
                        durationInFrames={SLIDE_DURATION}
                        layout="none"
                    >
                        {/* Slide Impact SFX */}
                        <Audio src={staticFile("audio/slam.mp3")} volume={0.4} />
                        <Slide project={project} />
                    </Sequence>
                );
            })}

            {/* Outro */}
            <Sequence
                from={INTRO_DURATION + (projects.length * (SLIDE_DURATION - TRANSITION_DURATION)) + TRANSITION_DURATION}
                durationInFrames={OUTRO_DURATION}
            >
                <Outro />
            </Sequence>

            {/* Cinematic Overlay (Grain + Letterbox) */}
            <AbsoluteFill className="pointer-events-none z-50">
                <FilmGrain />
                <Letterbox />
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

const Slide: React.FC<{ project: typeof projects[0] }> = ({ project }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Spring animation for entrance
    const scale = spring({
        frame,
        fps,
        config: {
            damping: 12,
            stiffness: 100,
        },
        from: 1.2,
        to: 1,
    });

    const translateY = interpolate(
        frame,
        [0, durationInFrames],
        [50, -20], // Slide up continuously
        {
            easing: Easing.out(Easing.ease),
        }
    );

    // Opacity with crossfade - faster fade in/out
    const opacity = interpolate(
        frame,
        [0, 15, durationInFrames - 15, durationInFrames],
        [0, 1, 1, 0]
    );

    return (
        <ProjectCard
            project={project}
            opacity={opacity}
            scale={scale}
            translateY={translateY}
        />
    );
}

const FilmGrain: React.FC = () => {
    return (
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                filter: 'contrast(150%) brightness(100%)'
            }}
        />
    )
}

const Letterbox: React.FC = () => {
    return (
        <>
            <div className="absolute top-0 left-0 right-0 h-[10%] bg-black z-50" />
            <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black z-50" />
        </>
    )
}
