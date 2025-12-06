export interface CharacterMeta {
  full_name: string;
  emotion_count: number;
  font: string;
}

export interface BackgroundVariant {
  name: string;
  file: string;
}

export interface Background {
  name: string;
  file: string;
  variants?: Record<string, BackgroundVariant>;
}

export interface Font {
  name: string;
  file: string;
}

export interface TextConfigItem {
  text: string;
  position: [number, number];
  font_color: [number, number, number];
  font_size: number;
}

export interface AppConfig {
  characters: Record<string, CharacterMeta>;
  backgrounds: Record<string, Background>;
  fonts: Record<string, Font>;
  text_configs: Record<string, TextConfigItem[]>;
}

export type StretchMode = "stretch" | "stretch_x" | "stretch_y" | "zoom_x" | "zoom_y" | "original";
