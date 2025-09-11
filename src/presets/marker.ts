import { SvgMarker } from "../svg/SvgMarker.js";

export const predefinedMarkers: {
  [mkrName: string]: SvgMarker | undefined;
} = {
  // Solid triangle arrow
  "arrow1": SvgMarker.buildArrowHead("solid-angle", 6, 42),
  "arrow2": SvgMarker.buildArrowHead("solid-angle", 8, 38),
  "arrow3": SvgMarker.buildArrowHead("solid-angle", 10, 38),
  "arrow4": SvgMarker.buildArrowHead("solid-angle", 12, 38),
  "arrow5": SvgMarker.buildArrowHead("solid-angle", 12, 36),
  "arrow6": SvgMarker.buildArrowHead("solid-angle", 12, 32),
  "arrow7": SvgMarker.buildArrowHead("solid-angle", 15, 32),
  "arrow8": SvgMarker.buildArrowHead("solid-angle", 18, 30),
  "arrow9": SvgMarker.buildArrowHead("solid-angle", 24, 28),
  "arrow10": SvgMarker.buildArrowHead("solid-angle", 24, 24, undefined, true),
  // Solid two angle arrow
  "arrow11": SvgMarker.buildArrowHead("solid-two-angle", 10, 40, 0.2),
  "arrow12": SvgMarker.buildArrowHead("solid-two-angle", 12, 40, 0.25),
  "arrow13": SvgMarker.buildArrowHead("solid-two-angle", 12, 40, 0.3),
  "arrow14": SvgMarker.buildArrowHead("solid-two-angle", 15, 40, 0.25),
  "arrow15": SvgMarker.buildArrowHead("solid-two-angle", 15, 40, 0.3),
  "arrow16": SvgMarker.buildArrowHead("solid-two-angle", 16, 40, 0.25),
  "arrow17": SvgMarker.buildArrowHead("solid-two-angle", 16, 38, 0.35),
  "arrow18": SvgMarker.buildArrowHead("solid-two-angle", 18, 36, 0.2),
  "arrow19": SvgMarker.buildArrowHead("solid-two-angle", 18, 34, 0.3, true),
  "arrow20": SvgMarker.buildArrowHead("solid-two-angle", 20, 32, 0.2, true),
  // Simple angle arrow
  "arrow21": SvgMarker.buildArrowHead("simple", 6,  42, undefined, true),
  "arrow22": SvgMarker.buildArrowHead("simple", 8,  41, undefined, true),
  "arrow23": SvgMarker.buildArrowHead("simple", 10, 40, undefined, true),
  "arrow24": SvgMarker.buildArrowHead("simple", 12, 38, undefined, true),
  "arrow25": SvgMarker.buildArrowHead("simple", 16, 36, undefined, true),
  "arrow26": SvgMarker.buildArrowHead("simple", 6,  42, undefined, true, true),
  "arrow27": SvgMarker.buildArrowHead("simple", 8,  41, undefined, true, true),
  "arrow28": SvgMarker.buildArrowHead("simple", 10, 40, undefined, true, true),
  "arrow29": SvgMarker.buildArrowHead("simple", 12, 38, undefined, true, true),
  "arrow30": SvgMarker.buildArrowHead("simple", 16, 36, undefined, true, true),
  
  // TODO: make more as you develop this
}

