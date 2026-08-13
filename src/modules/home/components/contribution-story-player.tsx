import { Player } from "@remotion/player";
import { useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { ContributionStory } from "../remotion/contribution-story";

export default function ContributionStoryPlayer() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <div
      className="overflow-hidden rounded-card border border-border bg-card"
      aria-describedby="contribution-story-description"
    >
      <Player
        acknowledgeRemotionLicense
        component={ContributionStory}
        durationInFrames={400}
        compositionWidth={1280}
        compositionHeight={880}
        fps={30}
        autoPlay={!shouldReduceMotion}
        loop={!shouldReduceMotion}
        controls={!shouldReduceMotion}
        initiallyMuted
        showVolumeControls={false}
        allowFullscreen
        clickToPlay={!shouldReduceMotion}
        initialFrame={shouldReduceMotion ? 399 : 0}
        className="aspect-[16/11] w-full"
        style={{ width: "100%" }}
      />
      <p id="contribution-story-description" className="sr-only">
        {t("landing.storyPlayerDescription")}
      </p>
    </div>
  );
}
