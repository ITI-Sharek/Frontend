import { Composition, registerRoot } from "remotion";

import { ContributionStory } from "./contribution-story";

function SharekRemotionRoot() {
  return (
    <Composition
      id="SharekContributionStory"
      component={ContributionStory}
      durationInFrames={400}
      fps={30}
      width={1280}
      height={880}
    />
  );
}

registerRoot(SharekRemotionRoot);
