export interface StylePreset {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  prompt: string;
  gradient: string;
  icon: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "logo",
    name: "Logo Design",
    nameZh: "Logo 设计",
    description: "Clean, professional logo with modern aesthetics",
    prompt: "minimalist vector logo design, clean lines, professional branding, flat design, modern corporate identity, high contrast, scalable",
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
    icon: "✦",
  },
  {
    id: "realistic",
    name: "Ultra Realistic",
    nameZh: "超写实摄影",
    description: "Photorealistic imagery with stunning detail",
    prompt: "ultra realistic photography, 8k resolution, cinematic lighting, professional DSLR quality, hyperrealistic, photorealistic, detailed textures",
    gradient: "from-amber-400 via-orange-500 to-red-600",
    icon: "◎",
  },
  {
    id: "flat-icon",
    name: "Flat SVG Icon",
    nameZh: "扁平化图标",
    description: "Simple, colorful flat design icons",
    prompt: "flat design icon, SVG style, minimal shapes, bold colors, geometric, clean vector art, material design inspired",
    gradient: "from-green-400 via-emerald-500 to-teal-600",
    icon: "◆",
  },
  {
    id: "ghibli",
    name: "Ghibli Style",
    nameZh: "吉卜力动漫",
    description: "Magical anime style inspired by Studio Ghibli",
    prompt: "studio ghibli anime style, hayao miyazaki inspired, soft watercolor, dreamy atmosphere, whimsical, hand-drawn animation, magical realism",
    gradient: "from-pink-400 via-rose-500 to-purple-600",
    icon: "❋",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    nameZh: "赛博朋克",
    description: "Futuristic neon-lit dystopian aesthetic",
    prompt: "cyberpunk aesthetic, neon lights, futuristic cityscape, high tech low life, blade runner inspired, holographic, dystopian future, rain reflections",
    gradient: "from-violet-400 via-purple-500 to-fuchsia-600",
    icon: "⬡",
  },
  {
    id: "3d-render",
    name: "3D Render",
    nameZh: "3D 渲染",
    description: "Polished 3D rendered objects with perfect lighting",
    prompt: "3D render, octane render, blender, cinema 4D, glossy materials, studio lighting, product visualization, isometric view, soft shadows",
    gradient: "from-blue-400 via-indigo-500 to-violet-600",
    icon: "◇",
  },
];

export type CanvasTool = "pen" | "eraser";

export interface GenerationResult {
  id: string;
  sketchDataUrl: string;
  generatedImageUrl: string;
  prompt: string;
  style: StylePreset;
  createdAt: Date;
}

export type GenerationStatus = "idle" | "analyzing" | "generating" | "complete" | "error";
