/**
 * Remotion Root — registers all video compositions.
 */
import { Composition } from "remotion";
import { HeatDebtDemo } from "./compositions/HeatDebtDemo";

const FPS = 30;
const DURATION_SECONDS = 75;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeatDebtDemo"
        component={HeatDebtDemo}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
