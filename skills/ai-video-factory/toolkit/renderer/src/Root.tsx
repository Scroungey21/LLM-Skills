import { Composition, Still } from "remotion";
import { Placeholder } from "./Placeholder";
import { MasterSequence } from "./compositions";
import { calculateMasterSequenceMetadata, type MasterSequenceProps } from "./components/MasterSequence";
import { ChannelAvatar, ChannelBanner } from "./ChannelIdentity";

// Minimal, schema-valid default — Remotion Studio/CLI need *some* defaultProps to register the
// composition; real verification (tasks.md 5.15) always supplies a real BuildJson via --props.
const DEFAULT_BUILD: MasterSequenceProps = {
  build: {
    script_id: 0,
    niche_key: "cyberattacks-zerodays",
    component: "cyber-terminal",
    scenes: [
      {
        index: 0,
        is_hook: true,
        is_pattern_interrupt: false,
        narration: "Default placeholder scene — replaced by real --props at render time.",
        word_budget: 10,
        duration_ms: 4000,
        cues: { typing_chars: 60, node_count: 0 },
        start: 0,
        end: 4,
      },
    ],
    audio: { wav_path: "", duration_seconds: 4 },
    words: [],
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Placeholder"
        component={Placeholder}
        durationInFrames={150}
        fps={30}
        width={2560}
        height={1440}
      />
      <Composition
        id="MasterSequence"
        component={MasterSequence}
        calculateMetadata={calculateMasterSequenceMetadata}
        width={2560}
        height={1440}
        defaultProps={DEFAULT_BUILD}
      />
      <Still id="ChannelAvatar" component={ChannelAvatar} width={800} height={800} />
      <Still
        id="ChannelBanner"
        component={ChannelBanner}
        width={2560}
        height={1440}
        defaultProps={{ channelName: "LITMUS", tagline: "Every claim, traced to the source" }}
      />
    </>
  );
};
