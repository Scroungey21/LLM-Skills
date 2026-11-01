import React, {useMemo} from "react";
import {AbsoluteFill, Easing, Sequence, Video, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {DoodleIcon} from "./DoodleIcon";
import type {EditorialPackage, EditorialScene, HiddenSystemsVideoProps, TimedWord} from "./types";

const INK = "#171717";
const PAPER = "#FAF7EE";
const MUTED = "#625F59";
// Replaces the previous ~90%-opaque full-size card behind brainrot Shorts content
// (background: `${PAPER}E6`, i.e. ~90% opaque -- functionally solid, exactly the defect
// critics flagged: "large translucent white card" that hid most of the gameplay it was
// supposed to let show through). These give text/diagram legibility against arbitrary
// bright, dark, or busy footage WITHOUT any panel: a hard multi-directional paper-colored
// outline plus soft dark glow for headline-scale text, and a small tight-fit dark chip
// (matching CaptionBand's existing pill language) for smaller caption/label text where an
// outline alone reads as noisy against detailed footage.
const GAMEPLAY_TEXT_OUTLINE = `2px 0 0 ${PAPER}, -2px 0 0 ${PAPER}, 0 2px 0 ${PAPER}, 0 -2px 0 ${PAPER}, 2px 2px 0 ${PAPER}, -2px -2px 0 ${PAPER}, 2px -2px 0 ${PAPER}, -2px 2px 0 ${PAPER}, 0 4px 14px rgba(0,0,0,.45)`;
const gameplayChip = (onGameplay?: boolean): React.CSSProperties => onGameplay
  ? {background:"rgba(23,23,23,.82)", borderRadius:10, padding:"2px 10px", display:"inline-block", width:"fit-content"}
  : {};

// Geometry is exact and derived from one shared centerline constant (CROSS/2) --
// no independent width/border math per element, which is what let the line,
// chevron head, and moving dot drift out of alignment with each other before.
const ARROW_CROSS = 65; // thickness of the arrow's bounding box, perpendicular to travel
const ARROW_HEAD_LEN = 22; // chevron depth along the travel axis
const ARROW_HEAD_HALF_WIDTH = 13; // chevron half-span across the travel axis
const ARROW_LINE_WIDTH = 8;
// Round strokeLinejoin paints a half-circle of radius LINE_WIDTH/2 around the chevron's tip
// vertex, extending the true painted point that far past the geometric coordinate. The tip
// margin must be at least that much or the "tip" specified below is not where ink actually
// stops -- it was 2px, silently letting the painted tip sit 2px outside the container.
const ARROW_TIP_MARGIN = ARROW_LINE_WIDTH / 2; // gap from the chevron's true painted tip to the container's far edge
const ARROW_DASH_TARGET = 12; // desired on/off half-period; adjusted per-instance to tile `base` exactly
const ARROW_DOT_RADIUS = 13;
const ARROW_DOT_STROKE = 5;
const ARROW_DOT_OUTER_R = ARROW_DOT_RADIUS + ARROW_DOT_STROKE / 2; // true rendered edge, stroke straddles the path

const Arrow: React.FC<{progress: number; vertical?: boolean; accent: string}> = ({progress, vertical, accent}) => {
  const length = vertical ? 145 : 150;
  const width = vertical ? ARROW_CROSS : length;
  const height = vertical ? length : ARROW_CROSS;
  const center = ARROW_CROSS / 2; // the single centerline every element aligns to
  const tip = length - ARROW_TIP_MARGIN;
  const base = tip - ARROW_HEAD_LEN; // where the chevron's two legs start, and where the dashed line ends
  // Self-tiling dash: pick a whole number of on/off cycles so the pattern always ends exactly
  // at `base` with a complete segment -- never a partial dash cut off mid-stroke against the
  // chevron. The resulting half-period stays within a fraction of a pixel of ARROW_DASH_TARGET.
  const dashCycles = Math.max(1, Math.round(base / (ARROW_DASH_TARGET * 2)));
  const dashUnit = base / (dashCycles * 2);
  // Dot travel is clamped so its true rendered edge (radius + half the stroke) never crosses
  // the container bounds -- at progress=0/1 it used to sit exactly on the line's endpoints and
  // visually overflow into the neighboring icon/chevron by ARROW_DOT_OUTER_R.
  const dotTravel = ARROW_DOT_OUTER_R + progress * Math.max(0, base - 2 * ARROW_DOT_OUTER_R);
  const linePath = vertical ? `M ${center} 0 L ${center} ${base}` : `M 0 ${center} L ${base} ${center}`;
  const chevronPoints = vertical
    ? `${center - ARROW_HEAD_HALF_WIDTH},${base} ${center},${tip} ${center + ARROW_HEAD_HALF_WIDTH},${base}`
    : `${base},${center - ARROW_HEAD_HALF_WIDTH} ${tip},${center} ${base},${center + ARROW_HEAD_HALF_WIDTH}`;
  const dotCx = vertical ? center : dotTravel;
  const dotCy = vertical ? dotTravel : center;
  return <div style={{position:"relative",width,height,flex:"0 0 auto"}}>
    <svg width={width} height={height} style={{position:"absolute",left:0,top:0,overflow:"visible"}}>
      <path d={linePath} stroke={INK} strokeWidth={ARROW_LINE_WIDTH} strokeDasharray={`${dashUnit} ${dashUnit}`} strokeLinecap="butt" fill="none"/>
      <polyline points={chevronPoints} stroke={INK} strokeWidth={ARROW_LINE_WIDTH} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx={dotCx} cy={dotCy} r={ARROW_DOT_RADIUS} fill={accent} stroke={INK} strokeWidth={ARROW_DOT_STROKE}/>
    </svg>
  </div>;
};

const PaperBackground = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{backgroundColor: PAPER, backgroundImage: "radial-gradient(#D8D2C4 1.5px, transparent 1.5px)", backgroundSize: "30px 30px", backgroundPosition: `${(frame * .08) % 30}px ${(frame * .04) % 30}px`}}/>;
};

// The "brainrot" background layer: a muted, looping gameplay clip filling the
// frame, with a light dark scrim so foreground cards keep contrast against
// arbitrarily bright/busy footage. `startSec` is a deterministic trim offset
// into the source clip (see gameplay-library.json selection policy).
// Uses <Video> (browser-native HTML5 decode), not <OffthreadVideo> -- the
// latter routes frame extraction through the bundled native compositor
// binary, which crashes (0xC0000005) on this dev host for ANY input,
// independent of this composition (see remotion.config.ts's KNOWN ISSUE
// note). <Video> decodes through Chrome's own video pipeline instead, which
// is confirmed working on this host.
const GameplayBackground: React.FC<{src: string; startSec: number}> = ({src, startSec}) => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill>
    <Video
      src={staticFile(src)}
      muted
      loop
      startFrom={Math.round(startSec * fps)}
      style={{width:"100%",height:"100%",objectFit:"cover"}}
    />
    <AbsoluteFill style={{backgroundColor:"rgba(0,0,0,0.18)"}}/>
  </AbsoluteFill>;
};

const SceneDiagram: React.FC<{scene: EditorialScene; accent: string; vertical: boolean; frameOffset?: number; onGameplay?: boolean}> = ({scene, accent, vertical, frameOffset, onGameplay}) => {
  const frame = useCurrentFrame() + (frameOffset ?? 0);
  const {fps} = useVideoConfig();
  const icons = scene.visual.icons;
  const stack = vertical && icons.length > 1;
  // Soft, tightly-sized glow behind a hero icon on gameplay -- separates its thin black
  // linework from busy/detailed footage without a hard-edged panel (Part 13's "readable
  // against ... detailed scenes" requirement), unlike the old full-card approach which
  // solved this by hiding the footage entirely.
  const iconGlow = (size: number): React.CSSProperties => onGameplay
    ? {position:"absolute", width:size*1.35, height:size*1.35, borderRadius:"50%", background:`radial-gradient(circle, ${PAPER}A0 0%, ${PAPER}00 68%)`}
    : {display:"none"};

  if (icons.length === 0) {
    const details = scene.visual.labels.length ? scene.visual.labels : ["WATCH THE FULL VIDEO"];
    return (
      <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:26, width:"100%", height:"100%"}}>
        <div style={{width:vertical?220:250,height:vertical?220:250,borderRadius:999,background:accent,border:`7px solid ${INK}`,display:"flex",alignItems:"center",justifyContent:"center",rotate:`${Math.sin(frame/(fps*1.6))*2}deg`,scale:1+Math.sin(frame/(fps*2.1))*.02}}>
          <div style={{width:0,height:0,borderTop:"36px solid transparent",borderBottom:"36px solid transparent",borderLeft:`54px solid ${INK}`,marginLeft:14}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"38px 1fr",gap:"14px 16px",width:vertical?700:600,opacity:interpolate(frame,[.3*fps,.7*fps],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}}>
          {details.map((label,index)=><React.Fragment key={`${label}-${index}`}>
            <div style={{width:34,height:34,borderRadius:99,background:index===0?accent:"#FFFFFF",border:`5px solid ${INK}`,fontWeight:950,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>{index+1}</div>
            <div style={{borderLeft:onGameplay?"none":`5px solid ${INK}`,paddingLeft:onGameplay?0:18,fontFamily:"Arial, sans-serif",fontSize:vertical?30:28,fontWeight:900,letterSpacing:.7,color:onGameplay?"#FFFFFF":INK,...gameplayChip(onGameplay)}}>{label}</div>
          </React.Fragment>)}
        </div>
      </div>
    );
  }

  if (icons.length === 1) {
    const settleAt = 2.15 * fps;
    const details = scene.visual.labels.length > 1
      ? scene.visual.labels
      : [scene.visual.labels[0] ?? icons[0].toUpperCase(), "WHAT HAPPENS NEXT?", "FOLLOW THE HIDDEN PATH"];
    const heroSize = vertical?330:430;
    return (
      <div style={{display:"flex", flexDirection:vertical?"column":"row", justifyContent:"center", alignItems:"center", gap:vertical?28:75, width:"100%", height:"100%"}}>
        <div style={{width:vertical?380:470, display:"flex", flexDirection:"column", alignItems:"center", translate:interpolate(frame,[0,settleAt,settleAt+.55*fps],vertical?["0px 110px","0px 110px","0px -5px"]:["255px 0px","255px 0px","0px 0px"],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.bezier(.16,1,.3,1)}), rotate:`${Math.sin(frame/(fps*1.15))*1.8}deg`, scale:1+Math.sin(frame/(fps*1.7))*.018}}>
          <div style={{position:"relative", display:"flex", alignItems:"center", justifyContent:"center"}}>
            <div style={iconGlow(heroSize)}/>
            <DoodleIcon name={icons[0]} accent={accent} size={heroSize} progress={interpolate(frame,[0,.4*fps],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}/>
          </div>
          <div style={{fontFamily:"Arial, sans-serif",fontSize:vertical?34:32,fontWeight:950,color:onGameplay?"#FFFFFF":INK,textAlign:"center",letterSpacing:1.3,marginTop:-8,...gameplayChip(onGameplay)}}>{details[0]}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"38px 1fr",gap:"18px 16px",width:vertical?760:560,opacity:interpolate(frame,[settleAt,settleAt+.5*fps],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}),translate:interpolate(frame,[settleAt,settleAt+.5*fps],vertical?["0px 35px","0px 0px"]:["45px 0px","0px 0px"],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.bezier(.16,1,.3,1)})}}>
          {/* Start at details[1]: details[0] is already shown as the hero-icon caption
              directly above (line ~142) -- mapping the full array here duplicated it as
              bullet row 1 on every single-icon scene catalog-wide (visible once the row
              list fades in past `settleAt`, so earlier low-`frame` QA screenshots at this
              file's history missed it). Remaining rows renumber from 1 (badge, accent
              color) so the list still reads as a complete 1-based sequence rather than a
              continuation missing its first item; `index` (offset by 1) is kept only for
              the stagger `opacity` interpolation so per-item reveal timing is unchanged. */}
          {details.slice(1).map((label,i)=>{ const index = i + 1; return <React.Fragment key={`${label}-${index}`}>
            <div style={{width:34,height:34,borderRadius:99,background:i===0?accent:"#FFFFFF",border:`5px solid ${INK}`,fontWeight:950,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>{i+1}</div>
            <div style={{borderLeft:onGameplay?"none":`5px solid ${INK}`,paddingLeft:onGameplay?0:18,fontFamily:"Arial, sans-serif",fontSize:vertical?31:30,fontWeight:900,letterSpacing:.7,color:onGameplay?"#FFFFFF":INK,opacity:interpolate(frame,[settleAt+(index*.42)*fps,settleAt+(index*.42+.3)*fps],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}),...gameplayChip(onGameplay)}}>{label}</div>
          </React.Fragment>; })}
        </div>
      </div>
    );
  }

  return (
    <div style={{display:"flex", flexDirection:stack?"column":"row", justifyContent:"center", alignItems:"center", gap:stack?2:18, width:"100%", height:"100%"}}>
      {icons.map((icon, index) => {
        const revealAt = index * .9 * fps;
        const reveal = interpolate(frame, [revealAt, revealAt + .42 * fps], [0,1], {extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.bezier(.16,1,.3,1)});
        const iconSize = stack?220:Math.min(300, 700/icons.length+70);
        return <React.Fragment key={`${scene.id}-${icon}-${index}`}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:stack?380:Math.max(210, 680/icons.length),translate:`0px ${Math.sin(frame/(fps*1.05)+index*1.7)*7}px`,rotate:`${Math.sin(frame/(fps*1.32)+index*2.1)*1.7}deg`,scale:.96+reveal*.04}}>
            <div style={{position:"relative", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <div style={iconGlow(iconSize)}/>
              <DoodleIcon name={icon} accent={accent} size={iconSize} progress={reveal}/>
            </div>
            <div style={{fontFamily:"Arial, sans-serif",fontSize:stack?30:28,fontWeight:900,color:onGameplay?"#FFFFFF":INK,textAlign:"center",letterSpacing:1.2,marginTop:-6,maxWidth:300,opacity:reveal,...gameplayChip(onGameplay)}}>{scene.visual.labels[index] ?? icon.toUpperCase()}</div>
          </div>
          {index < icons.length-1 && <div style={{opacity:interpolate(frame,[revealAt+.48*fps,revealAt+.75*fps],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}}><Arrow vertical={stack} accent={accent} progress={(frame/(fps*1.4)+index*.22)%1}/></div>} 
        </React.Fragment>;
      })}
    </div>
  );
};

// A caption "page" never spans a pauseAfter boundary (a real measured silence in the audio, or
// a scene change): words are first split into pause-delimited runs, then each run is divided
// into roughly-equal pages capped at `pageSize` -- e.g. a 7-word run at pageSize=6 becomes
// [4, 3], not a greedy [6, 1] that would flash a lone orphan word for a fraction of a second.
// Mirrors `_split_run_sizes`/`write_srt` in hidden-everyday-systems/hidden_systems_production.py exactly, so the
// burned-in captions and the delivered .srt always agree. Computed once per words array.
function splitRunSizes(n: number, pageSize: number): number[] {
  if (n <= pageSize) return [n];
  const pages = Math.ceil(n / pageSize);
  const base = Math.floor(n / pages);
  const remainder = n % pages;
  return Array.from({length: pages}, (_, i) => base + (i < remainder ? 1 : 0));
}

function computePageBounds(words: TimedWord[], pageSize: number): Array<[number, number]> {
  const bounds: Array<[number, number]> = [];
  let runStart = 0;
  for (let index = 0; index < words.length; index++) {
    if (words[index].pauseAfter || index === words.length - 1) {
      const runLength = index - runStart + 1;
      let cursor = runStart;
      for (const size of splitRunSizes(runLength, pageSize)) {
        bounds.push([cursor, cursor + size]);
        cursor += size;
      }
      runStart = index + 1;
    }
  }
  return bounds;
}

const CaptionBand: React.FC<{words: TimedWord[]; vertical: boolean}> = ({words, vertical}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = frame / fps * 1000;
  const pageSize = vertical ? 6 : 10;
  const pageBounds = useMemo(() => computePageBounds(words, pageSize), [words, pageSize]);
  if (words.length === 0) return null;
  // Silent lead-in/tail-out padding (see hidden_systems_production.py's LONG_LEAD_IN_MS/
  // LONG_TAIL_OUT_MS) leaves gaps before the first word and after the last where nothing is
  // spoken -- without this guard `mostRecentIndex` below defaults to/settles on an edge word
  // index and the band would show page 0 before narration starts, or hold the final page
  // indefinitely after it ends.
  if (now < words[0].startMs || now >= words[words.length - 1].endMs) return null;
  let activeIndex = -1;
  let mostRecentIndex = 0;
  for (let index = 0; index < words.length; index++) {
    if (words[index].startMs <= now) mostRecentIndex = index;
    if (now >= words[index].startMs && now < words[index].endMs) activeIndex = index;
  }
  const activeBound = pageBounds.find(([s, e]) => mostRecentIndex >= s && mostRecentIndex < e) ?? pageBounds[pageBounds.length - 1];
  const [pageStart, pageEnd] = activeBound;
  const page = words.slice(pageStart, pageEnd);
  return <div style={{position:"absolute",left:vertical?54:170,right:vertical?54:170,bottom:vertical?220:54,display:"flex",justifyContent:"center",flexWrap:"wrap",gap:"0 12px",padding:vertical?"22px 26px":"15px 25px",background:"rgba(23,23,23,.94)",border:`6px solid ${INK}`,borderRadius:24,boxShadow:"8px 8px 0 rgba(23,23,23,.14)"}}>
    {page.map((word,i)=><span key={`${word.startMs}-${i}`} style={{fontFamily:"Arial, sans-serif",fontSize:vertical?48:37,lineHeight:1.22,fontWeight:900,color:pageStart+i===activeIndex?"#FFD85C":"#FFFFFF",whiteSpace:"pre"}}>{word.text}</span>)}
  </div>;
};

// `onGameplay` renders content directly over the gameplay background layer with no panel
// behind it -- legibility instead comes from GAMEPLAY_TEXT_OUTLINE (headline only) and
// gameplayChip (small tight-fit dark pills with light text, for every smaller caption/
// label in SceneDiagram). A previous revision used a ~90%-opaque full-size card here,
// which critics correctly flagged as functionally solid -- exactly the "large translucent
// white card hiding the gameplay" defect this format exists to avoid. The chapter-tag
// pill and GHOSTSYSTEM watermark already carry their own solid background fill and stay
// legible unchanged against any footage.
const Scene: React.FC<{scene: EditorialScene; accent: string; vertical: boolean; onGameplay?: boolean; frameOffset?: number}> = ({scene, accent, vertical, onGameplay, frameOffset}) => {
  const frame = useCurrentFrame() + (frameOffset ?? 0);
  const {fps} = useVideoConfig();
  const body = <>
    <div style={{display:"flex",alignItems:"center",gap:18,opacity:interpolate(frame,[0,.3*fps],[0,1],{extrapolateRight:"clamp"})}}>
      <div style={{background:accent,border:`5px solid ${INK}`,borderRadius:999,padding:"9px 18px",fontSize:vertical?25:22,fontWeight:900,letterSpacing:1.6,textTransform:"uppercase"}}>{scene.chapter}</div>
      <div style={{height:5,background:INK,flex:1,borderRadius:9,boxShadow:onGameplay?`0 0 0 3px ${PAPER}CC`:"none"}}/>
    </div>
    <div style={{fontSize:vertical?78:76,lineHeight:.98,fontWeight:950,letterSpacing:-2.5,maxWidth:vertical?920:1450,marginTop:vertical?36:25,color:INK,textShadow:onGameplay?GAMEPLAY_TEXT_OUTLINE:"none",opacity:interpolate(frame,[.1*fps,.55*fps],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.bezier(.16,1,.3,1)}),translate:`0 ${interpolate(frame,[.1*fps,.55*fps],[30,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}px`}}>{scene.headline}</div>
    <div style={{flex:1,marginTop:vertical?30:12,minHeight:0,translate:`${Math.sin(frame/(fps*2.4))*5}px ${Math.cos(frame/(fps*2.05))*4}px`,scale:1+Math.sin(frame/(fps*2.8))*.006}}><SceneDiagram scene={scene} accent={accent} vertical={vertical} frameOffset={frameOffset} onGameplay={onGameplay}/></div>
  </>;
  if (onGameplay) {
    return <AbsoluteFill style={{padding:vertical?"96px 40px 370px":"64px 90px 170px",fontFamily:"Arial, sans-serif",color:INK,alignItems:"stretch"}}>
      <div style={{position:"absolute",right:vertical?40:90,top:vertical?48:40,fontSize:18,fontWeight:900,color:MUTED,letterSpacing:2,background:`${PAPER}E6`,padding:"4px 10px",borderRadius:8}}>GHOSTSYSTEM</div>
      <div style={{display:"flex",flexDirection:"column"}}>
        {body}
      </div>
    </AbsoluteFill>;
  }
  return <AbsoluteFill style={{padding:vertical?"110px 64px 370px":"72px 110px 170px",fontFamily:"Arial, sans-serif",color:INK}}>
    {body}
    <div style={{position:"absolute",right:vertical?58:90,top:vertical?62:48,fontSize:20,fontWeight:900,color:MUTED,letterSpacing:2}}>GHOSTSYSTEM</div>
  </AbsoluteFill>;
};

export const HiddenSystemsVideo: React.FC<HiddenSystemsVideoProps> = ({content,timing,variant,backgroundVideo,backgroundStartSec}) => {
  const {fps} = useVideoConfig();
  const vertical = variant === "short";
  const editorial = content.variants[variant];
  const byId = new Map(editorial.scenes.map((s)=>[s.id,s]));
  const onGameplay = !!backgroundVideo;
  return <AbsoluteFill>
    {onGameplay
      ? <GameplayBackground src={backgroundVideo!} startSec={backgroundStartSec ?? 0}/>
      : <PaperBackground/>}
    {timing.scenes.map((timed, index) => {
      const scene = byId.get(timed.id);
      if (!scene) return null;
      const rawFrom = Math.round(timed.startMs / 1000 * fps);
      const rawDuration = Math.max(1, Math.round((timed.endMs - timed.startMs) / 1000 * fps));
      // LONG_LEAD_IN_MS pads narration with silence before scene 0 starts speaking, which
      // otherwise left frame 0 on a bare background for ~0.9s before any composition
      // mounted (the #1 systemic retention defect flagged across every long-form audit).
      // Pull only the FIRST scene's mount to frame 0 and grow its duration to compensate,
      // so the full hook composition is already visible the instant playback starts while
      // narration timing and every later scene's boundaries stay untouched. Clamping `from`
      // alone isn't enough on its own -- Scene/SceneDiagram's entry animations (chapter tag,
      // headline, icon reveal) key off their OWN local frame 0, so without also pre-advancing
      // that clock via `frameOffset`, global frame 0 would still show those elements mid-fade
      // (verified: rendered frame 0 showed only the static detail label, no headline/icon).
      // `frameOffset` also applies (at a minimum) to Shorts' scene 0, which has no lead-in
      // pad (rawFrom already ~0) but suffers the identical mid-fade defect at true local
      // frame 0 -- Shorts' first frame is the entire swipe decision, so it gets the same
      // treatment via a small fixed settle floor, independent of `from`/`duration`: passing
      // a larger `frameOffset` only pre-advances the animation clock and never moves where
      // the Sequence itself mounts or ends, so this cannot encroach on the next scene.
      const firstSceneSettleFrames = Math.max(rawFrom, Math.round(0.6 * fps));
      const from = index === 0 ? 0 : rawFrom;
      const duration = index === 0 ? rawDuration + rawFrom : rawDuration;
      return <Sequence key={timed.id} name={scene.chapter} from={from} durationInFrames={duration} premountFor={fps}>
        <Scene scene={scene} accent={content.thumbnail.accent} vertical={vertical} onGameplay={onGameplay} frameOffset={index === 0 ? firstSceneSettleFrames : 0}/>
      </Sequence>;
    })}
    <CaptionBand words={timing.words} vertical={vertical}/>
  </AbsoluteFill>;
};

export const HiddenSystemsThumbnail: React.FC<{content: EditorialPackage}> = ({content}) => (
  <AbsoluteFill style={{backgroundColor:PAPER,backgroundImage:"radial-gradient(#D8D2C4 1.8px, transparent 1.8px)",backgroundSize:"28px 28px",fontFamily:"Arial, sans-serif",color:INK,padding:"60px 70px"}}>
    <div style={{position:"absolute",left:60,top:50,bottom:50,width:17,background:content.thumbnail.accent,border:`5px solid ${INK}`,borderRadius:20}}/>
    <div style={{width:"62%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",paddingLeft:42}}>
      <div style={{fontSize:93,lineHeight:.92,fontWeight:950,letterSpacing:-4,maxWidth:740}}>{content.thumbnail.text}</div>
      <div style={{fontSize:36,fontWeight:900,letterSpacing:2,marginTop:26,color:MUTED}}>{content.thumbnail.subtext}</div>
    </div>
    <div style={{position:"absolute",right:55,top:72,width:430,height:520,display:"flex",alignItems:"center",justifyContent:"center",background:content.thumbnail.accent,border:`9px solid ${INK}`,borderRadius:"47% 53% 46% 54% / 52% 40% 60% 48%",rotate:"-3deg",boxShadow:"16px 18px 0 rgba(23,23,23,.18)"}}>
      <DoodleIcon name={content.thumbnail.icon} accent="#FFFFFF" size={365}/>
    </div>
    <div style={{position:"absolute",right:74,bottom:37,fontWeight:950,fontSize:22,letterSpacing:2}}>GHOSTSYSTEM</div>
  </AbsoluteFill>
);
