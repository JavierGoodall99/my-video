import { Composition } from "remotion";
import {
  COMP_NAME,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  VIDEO_VERTICAL_WIDTH,
  VIDEO_VERTICAL_HEIGHT,
} from "../../types/constants";
import { Main } from "./MyComp/Main";
import { NextLogo } from "./MyComp/NextLogo";

import { ProjectShowcase } from "./ProjectShowcase/Main";
import { projects } from "./ProjectShowcase/projectsData";

export const RemotionRoot: React.FC = () => {
  const FPS = 30;
  const INTRO_DURATION = 40;
  const OUTRO_DURATION = 45;
  const SLIDE_DURATION = 2.5 * FPS;
  const TRANSITION_DURATION = 15;

  // Total duration: Intro + Sequence of overlapping slides + Outro
  // N slides mean (N-1) overlaps. 
  // Last slide plays full duration minus overlap with outro? No, simplest is sequential overlap.
  // Let's match Main.tsx logic:
  // Starts at: INTRO + index * (SLIDE - TRANSITION)
  // Last slide ends at: Start + SLIDE
  const LAST_SLIDE_END = INTRO_DURATION + (projects.length - 1) * (SLIDE_DURATION - TRANSITION_DURATION) + SLIDE_DURATION;
  const SHOWCASE_DURATION = LAST_SLIDE_END + OUTRO_DURATION;

  return (
    <>
      <Composition
        id="ProjectShowcase"
        component={ProjectShowcase}
        durationInFrames={SHOWCASE_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id={`${COMP_NAME}Vertical`}
        component={Main}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_VERTICAL_WIDTH}
        height={VIDEO_VERTICAL_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="NextLogo"
        component={NextLogo}
        durationInFrames={300}
        fps={30}
        width={140}
        height={140}
        defaultProps={{
          outProgress: 0,
        }}
      />
    </>
  );
};
