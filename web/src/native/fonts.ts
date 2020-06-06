type FontSrc = {
  data: string;
  dimensions: { width: number; height: number };
};

export type FontInfo = {
  pixels: Uint8ClampedArray[];
  dimensions: { width: number; height: number };
};

export const DEFAULT_FONT = "font16x16";

const fonts = new Map<string, FontSrc>([
  [
    "font16x16",
    {
      data:
        "data:image/png;base64,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",
      dimensions: { width: 16, height: 16 },
    },
  ],
]);

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function initFonts(): Promise<Map<string, FontInfo>> {
  const map = new Map<string, FontInfo>();
  for (var kv of fonts) {
    const id = kv[0];
    const font = kv[1];

    const image = await loadImage(font.data);

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.drawImage(image, 0, 0);
    const pixels: Uint8ClampedArray[] = [];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const pxs = ctx.getImageData(
          x * font.dimensions.width,
          y * font.dimensions.height,
          font.dimensions.width,
          font.dimensions.height,
        ).data;

        const solidPixels = new Uint8ClampedArray(pxs.length / 4);

        let solidIndex = 0;

        for (let i = 0; i < pxs.length; i += 4) {
          solidPixels[solidIndex++] = pxs[i] + pxs[i + 1] + pxs[i + 2] > 0
            ? 1
            : 0;
        }

        pixels.push(solidPixels);
      }
    }

    map.set(id, {
      pixels,
      dimensions: font.dimensions,
    });
  }

  return map;
}
