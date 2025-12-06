import { StretchMode, TextConfigItem } from '../types';

const TEXT_POSITION = [728, 355] as const;
const TEXT_OVER = [2339, 800] as const;
const SHADOW_OFFSET = [2, 2] as const;
const SHADOW_COLOR = [0, 0, 0] as const;

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  backgroundImage: HTMLImageElement | null;
  characterImage: HTMLImageElement | null;
  uiImage: HTMLImageElement | null;
  textConfigItems: TextConfigItem[];
  characterFont: string;
  userText: string;
  userFontSize: number;
  userFont: string;
  enableHighlight: boolean;
  stretchMode: StretchMode;
}

export function renderCanvas(options: RenderOptions): void {
  const {
    canvas,
    backgroundImage,
    characterImage,
    uiImage,
    textConfigItems,
    characterFont,
    userText,
    userFontSize,
    userFont,
    enableHighlight,
    stretchMode
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw background with stretch mode
  if (backgroundImage) {
    const { dest, size } = calculateStretchedDimensions(
      backgroundImage,
      canvas.width,
      canvas.height,
      stretchMode
    );
    ctx.drawImage(backgroundImage, dest[0], dest[1], size[0], size[1]);
  }

  // 2. Draw UI overlay
  if (uiImage) {
    ctx.drawImage(uiImage, 0, 0, canvas.width, canvas.height);
  }

  // 3. Draw character
  if (characterImage) {
    ctx.drawImage(characterImage, 0, 134);
  }

  // 4. Draw character name text from config
  textConfigItems.forEach((item) => {
    ctx.font = `${item.font_size}px ${characterFont}`;

    // Shadow
    ctx.fillStyle = `rgb(${SHADOW_COLOR[0]}, ${SHADOW_COLOR[1]}, ${SHADOW_COLOR[2]})`;
    ctx.fillText(
      item.text,
      item.position[0] + SHADOW_OFFSET[0],
      item.font_size + item.position[1] + SHADOW_OFFSET[1]
    );

    // Main text
    ctx.fillStyle = `rgb(${item.font_color[0]}, ${item.font_color[1]}, ${item.font_color[2]})`;
    ctx.fillText(item.text, item.position[0], item.font_size + item.position[1]);
  });

  // 5. Draw user input text with word wrapping
  if (userText) {
    ctx.font = `${userFontSize}px ${userFont}`;

    const maxWidth = TEXT_OVER[0] - TEXT_POSITION[0];
    const maxHeight = TEXT_OVER[1] - TEXT_POSITION[1];
    const lineHeight = Math.floor(userFontSize * 1.2);
    const maxLines = Math.floor(maxHeight / lineHeight) || 1;

    const lines = wrapText(ctx, userText, maxWidth, maxLines);

    // Draw each line (shadow first, then main)
    lines.forEach((line, i) => {
      const x = TEXT_POSITION[0];
      const y = userFontSize + TEXT_POSITION[1] + i * lineHeight;

      // Shadow
      ctx.fillStyle = `rgb(${SHADOW_COLOR[0]}, ${SHADOW_COLOR[1]}, ${SHADOW_COLOR[2]})`;
      ctx.fillText(line, x + SHADOW_OFFSET[0], y + SHADOW_OFFSET[1]);

      // Main text
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillText(line, x, y);
    });

    // Highlight text within 【】
    if (enableHighlight && textConfigItems.length > 0) {
      const highlightColor = textConfigItems[0].font_color;
      let isHighlight = false;

      lines.forEach((line, i) => {
        const x = TEXT_POSITION[0];
        const y = userFontSize + TEXT_POSITION[1] + i * lineHeight;
        const parts = line.split(/(【|】)/g);
        let currentX = x;

        parts.forEach((part) => {
          if (part === '【') {
            isHighlight = true;
          }
          if (isHighlight) {
            ctx.fillStyle = `rgb(${highlightColor[0]}, ${highlightColor[1]}, ${highlightColor[2]})`;
            ctx.fillText(part, currentX, y);
            currentX += ctx.measureText(part).width;
          } else {
            currentX += ctx.measureText(part).width;
          }
          if (part === '】') {
            isHighlight = false;
          }
        });
      });
    }
  }
}

function calculateStretchedDimensions(
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  mode: StretchMode
): { dest: [number, number]; size: [number, number] } {
  let dest: [number, number] = [0, 0];
  let size: [number, number] = [0, 0];
  let scale = 1;

  switch (mode) {
    case 'stretch_x':
      size[0] = canvasWidth;
      size[1] = image.naturalHeight;
      dest[1] = Math.round((canvasHeight - size[1]) / 2);
      break;
    case 'stretch_y':
      size[0] = image.naturalWidth;
      size[1] = canvasHeight;
      dest[0] = Math.round((canvasWidth - size[0]) / 2);
      break;
    case 'zoom_x':
      scale = canvasWidth / image.naturalWidth;
      size[0] = canvasWidth;
      size[1] = Math.round(image.naturalHeight * scale);
      dest[1] = Math.round((canvasHeight - size[1]) / 2);
      break;
    case 'zoom_y':
      scale = canvasHeight / image.naturalHeight;
      size[0] = Math.round(image.naturalWidth * scale);
      size[1] = canvasHeight;
      dest[0] = Math.round((canvasWidth - size[0]) / 2);
      break;
    case 'original':
      size[0] = image.naturalWidth;
      size[1] = image.naturalHeight;
      dest[0] = Math.round((canvasWidth - size[0]) / 2);
      dest[1] = Math.round((canvasHeight - size[1]) / 2);
      break;
    case 'stretch':
    default:
      size[0] = canvasWidth;
      size[1] = canvasHeight;
      break;
  }

  return { dest, size };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  for (const para of paragraphs) {
    if (lines.length >= maxLines) break;

    if (para.indexOf(' ') !== -1) {
      // English text with spaces
      const words = para.split(' ');
      let line = '';
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && line) {
          lines.push(line);
          line = word;
          if (lines.length >= maxLines) break;
        } else {
          line = testLine;
        }
      }
      if (lines.length < maxLines && line) {
        lines.push(line);
      }
    } else {
      // Chinese text or text without spaces
      let line = '';
      for (const ch of para) {
        const testLine = line + ch;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && line) {
          lines.push(line);
          line = ch;
          if (lines.length >= maxLines) break;
        } else {
          line = testLine;
        }
      }
      if (lines.length < maxLines && line) {
        lines.push(line);
      }
    }
  }

  return lines.slice(0, maxLines);
}

export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}
