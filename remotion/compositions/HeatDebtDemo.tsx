/**
 * HeatDebtDemo — Main composition assembling all scenes sequentially.
 */
import { AbsoluteFill, Series } from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { MapScene } from "./scenes/MapScene";
import { AIScene } from "./scenes/AIScene";
import { ReportScene } from "./scenes/ReportScene";
import { GrantScene } from "./scenes/GrantScene";
import { TechStackScene } from "./scenes/TechStackScene";
import { TeamScene } from "./scenes/TeamScene";
import { OutroScene } from "./scenes/OutroScene";

const FPS = 30;

export const HeatDebtDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#09090b" }}>
      <Series>
        <Series.Sequence durationInFrames={FPS * 8}>
          <IntroScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={FPS * 7}>
          <ProblemScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={FPS * 8}>
          <SolutionScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={FPS * 10}>
          <MapScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={FPS * 8}>
          <AIScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={FPS * 8}>
          <ReportScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={FPS * 7}>
          <GrantScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={FPS * 6}>
          <TechStackScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={FPS * 6}>
          <TeamScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={FPS * 7}>
          <OutroScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
