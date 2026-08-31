import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  cancelRender,
  getStaticFiles,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
  watchStaticFile,
  staticFile,
  interpolate,
  Img,
} from "remotion";
import { loadFont } from "../load-font";
import SubtitlePage from "./SubtitlePage";

export const calculateVideo1TOFUMetadata: CalculateMetadataFunction<{}> = async () => {
  return {
    fps: 30,
    durationInFrames: 2470,
  };
};

const getFileExists = (file: string) => {
  const normalizedFile = file.replace(/\\/g, "/");
  const files = getStaticFiles();
  return files.some((f) => {
    return f.src.replace(/\\/g, "/") === normalizedFile;
  });
};

const SWITCH_CAPTIONS_EVERY_MS = 1200;

const videoFilterStyle: React.CSSProperties = {
  objectFit: "cover",
  filter: "sepia(15%) contrast(105%) saturate(110%)",
  width: "100%",
  height: "100%",
};

export const Video1TOFU: React.FC = () => {
  const frame = useCurrentFrame();
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender());
  const { fps, durationInFrames } = useVideoConfig();

  const subtitlesFile = "video1/voz.json";

  const fetchSubtitles = useCallback(async () => {
    try {
      await loadFont();
      if (!getFileExists(subtitlesFile)) {
        setSubtitles([]);
        continueRender(handle);
        return;
      }

      const res = await fetch(staticFile(subtitlesFile));
      const data = await res.json() as Caption[];
      setSubtitles(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, handle, subtitlesFile]);

  useEffect(() => {
    fetchSubtitles();

    const c = watchStaticFile(subtitlesFile, () => {
      fetchSubtitles();
    });

    return () => {
      c.cancel();
    };
  }, [fetchSubtitles, subtitlesFile]);

  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      captions: subtitles ?? [],
    });
  }, [subtitles]);

  // Audio Music volume calculation with 1s fade-in and 2s fade-out
  const getMusicVolume = (currentFrame: number, totalFrames: number) => {
    const endFadeIn = 30; // 1s at 30fps
    const startFadeOut = totalFrames - 60; // last 2s
    
    if (currentFrame < endFadeIn) {
      return (currentFrame / endFadeIn) * 0.15;
    } else if (currentFrame > startFadeOut) {
      const progress = (currentFrame - startFadeOut) / (totalFrames - startFadeOut);
      return Math.max(0, 0.15 * (1 - progress));
    }
    return 0.15;
  };

  const musicVolume = getMusicVolume(frame, durationInFrames);

  // Scene Sequencer configuration in frames
  // esc1_pared_arcilla: 10.0s = 300 frames
  // Crudo1_: 28.67s = 860 frames
  // esc2_vuelo_valle: 10.0s = 300 frames
  // Crudo_2: 31.94s = 958 frames
  // esc3_altar: remaining frames (approx 52 frames)
  const scenes = [
    {
      src: staticFile("video1/esc1_pared_arcilla.mp4"),
      from: 0,
      duration: 300,
    },
    {
      src: staticFile("video1/Crudo1_.mp4"),
      from: 300,
      duration: 860,
    },
    {
      src: staticFile("video1/esc2_vuelo_valle.mp4"),
      from: 1160,
      duration: 300,
    },
    {
      src: staticFile("video1/Crudo_2.mp4"),
      from: 1460,
      duration: 958,
    },
    {
      src: staticFile("video1/esc3_altar.mp4"),
      from: 2418,
      duration: durationInFrames - 2418,
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Visual Sequence Layer */}
      <AbsoluteFill>
        {scenes.map((scene, idx) => {
          if (scene.duration <= 0) return null;
          return (
            <Sequence
              key={idx}
              from={scene.from}
              durationInFrames={scene.duration}
            >
              <OffthreadVideo
                style={videoFilterStyle}
                src={scene.src}
                muted
              />
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Audio Layer */}
      <Audio src={staticFile("video1/voz.m4a")} volume={1.0} />
      <Audio src={staticFile("video1/musica.m4a")} volume={musicVolume} />

      {/* Captions Subtitles Layer */}
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const subtitleStartFrame = (page.startMs / 1000) * fps;
        const subtitleEndFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          subtitleStartFrame + SWITCH_CAPTIONS_EVERY_MS,
        );
        const duration = subtitleEndFrame - subtitleStartFrame;
        if (duration <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={subtitleStartFrame}
            durationInFrames={duration}
          >
            <SubtitlePage page={page} />
          </Sequence>
        );
      })}

      {/* Closing Logo Layer */}
      <Sequence from={2410} durationInFrames={60}>
        <ClosingLogo />
      </Sequence>
    </AbsoluteFill>
  );
};

const ClosingLogo: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 60], [0.85, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <Img
        src={staticFile("video1/logo-seram.svg")}
        style={{
          width: "550px",
          height: "auto",
          transform: `scale(${scale})`,
        }}
        alt="SERAM Logo"
      />
    </AbsoluteFill>
  );
};
