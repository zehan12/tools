export type RGB = { r: number; g: number; b: number };

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function generatePleasingColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 70) + 30; // 30-100%
  const l = Math.floor(Math.random() * 60) + 20; // 20-80%
  return hslToHex(h, s, l);
}

export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
      .toUpperCase()
  );
}

export function hexToHsl(hex: string) {
  let { r, g, b } = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function generateShades(hex: string, steps: number = 25): string[] {
  const { h, s } = hexToHsl(hex);
  const shades = [];
  for (let i = 0; i < steps; i++) {
    const l = 96 - i * (92 / (steps - 1)); // From 96% to 4%
    shades.push(hslToHex(h, s, l));
  }
  return shades;
}

export function getContrastColor(hexcolor: string): string {
  const rgb = hexToRgb(hexcolor);
  if (!rgb) return 'text-black';
  return getContrastColorRGB(rgb.r, rgb.g, rgb.b) === 'text-black' 
    ? 'text-black/80 hover:text-black' 
    : 'text-white/80 hover:text-white';
}

export function getIconContrastClass(hexcolor: string): string {
  const rgb = hexToRgb(hexcolor);
  if (!rgb) return 'text-black';
  return getContrastColorRGB(rgb.r, rgb.g, rgb.b) === 'text-black'
    ? 'text-black/50 hover:text-black hover:bg-black/10'
    : 'text-white/50 hover:text-white hover:bg-white/10';
}

export function getContrastColorRGB(r: number, g: number, b: number): string {
  const yiq = r * 299 + g * 587 + b * 114;
  return yiq >= 128000 ? 'text-black' : 'text-white';
}

export type ColorMood = 'None' | 'Colorful' | 'Bright' | 'Muted' | 'Deep' | 'Dark';

export function extractColors(imgEl: HTMLImageElement, colorCount = 8, mood: ColorMood = 'None'): RGB[] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  // Scale down heavily for performance
  const scale = Math.min(1, 100 / Math.max(imgEl.width, imgEl.height));
  canvas.width = Math.floor(imgEl.width * scale);
  canvas.height = Math.floor(imgEl.height * scale);
  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();

  const step = 4 * 2; // Sample every 2nd pixel
  for (let i = 0; i < data.length; i += step) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3];
    if (a < 125) continue; // skip transparent
    if (r > 245 && g > 245 && b > 245) continue; // skip pure white

    // Quantize by rounding to group similar colors
    const qr = Math.floor(r / 16) * 16;
    const qg = Math.floor(g / 16) * 16;
    const qb = Math.floor(b / 16) * 16;
    const key = `${qr},${qg},${qb}`;

    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { r, g, b, count: 1 });
    }
  }

  let sorted = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);

  if (mood && mood !== 'None') {
    sorted = sorted.filter(c => {
      const { s, l } = hexToHsl(rgbToHex(c.r, c.g, c.b));
      switch (mood) {
        case 'Colorful': return s > 50;
        case 'Bright': return l > 60;
        case 'Muted': return s < 40;
        case 'Deep': return s > 50 && l < 50;
        case 'Dark': return l < 40;
        default: return true;
      }
    });
  }

  const result: RGB[] = [];
  for (const color of sorted) {
    if (result.length >= colorCount) break;
    const isTooSimilar = result.some(
      (rColor) =>
        Math.abs(rColor.r - color.r) < 40 &&
        Math.abs(rColor.g - color.g) < 40 &&
        Math.abs(rColor.b - color.b) < 40
    );
    if (!isTooSimilar) {
      result.push(color);
    }
  }

  // Fill the rest if we couldn't find enough distinct colors
  for (const color of sorted) {
    if (result.length >= colorCount) break;
    if (!result.includes(color)) {
      result.push(color);
    }
  }

  return result;
}
