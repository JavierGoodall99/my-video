import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { ProjectItem } from './projectsData';

interface ProjectCardProps {
    project: ProjectItem;
    opacity: number;
    scale: number;
    translateY: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, opacity, scale, translateY }) => {
    return (
        <AbsoluteFill className="items-center justify-center bg-brand-dark">
            <div
                className="relative w-[90%] md:w-[80%] aspect-video border border-white/10 overflow-hidden bg-brand-dark"
                style={{
                    opacity,
                    transform: `scale(${scale}) translateY(${translateY}px)`,
                }}
            >
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Img
                        src={project.image}
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-90" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
                    <div className="border-l-2 border-brand-lime pl-6">
                        <h2 className="text-brand-lime font-mono text-xl md:text-2xl mb-2 tracking-widest">
                            /{project.id} — {project.category}
                        </h2>
                        <h1 className="text-white font-display text-5xl md:text-7xl font-bold uppercase leading-none">
                            {project.title}
                        </h1>
                    </div>

                    <div className="absolute top-8 right-8">
                        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                            >
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
