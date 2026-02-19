import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { CompositionProps } from "../../../types/constants";
import { LogoAnimation } from "./LogoAnimation";

export const Main = ({ title }: z.infer<typeof CompositionProps>) => {
  return (
    <AbsoluteFill className="bg-black">
      <LogoAnimation />
    </AbsoluteFill>
  );
};
