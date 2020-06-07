type TileSetType = "color" | "blackandwhite";

type TilesetSrc = {
  type: TileSetType;
  filename: string;
  dimensions: { width: number; height: number };
};

export type TilesetInfo = {
  type: TileSetType;
  pixels: Uint8ClampedArray[];
  pixels32: Uint32Array[];
  dimensions: { width: number; height: number };
};

const tilesets = new Map<string, TilesetSrc>([
  [
    "floor",
    {
      type: "color",
      filename: "floor.png",
      dimensions: { width: 16, height: 16 },
    },
  ],
  [
    "font16x16",
    {
      type: "blackandwhite",
      filename: "font16x16.png",
      dimensions: { width: 16, height: 16 },
    },
  ],
  [
    "princess",
    {
      type: "color",
      filename: "princess.png",
      dimensions: { width: 64, height: 64 },
    },
  ],
]);

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = "res/" + src;
  });
}

export async function initTilesets(): Promise<Map<string, TilesetInfo>> {
  const map = new Map<string, TilesetInfo>();
  for (var kv of tilesets) {
    const id = kv[0];
    const tileset = kv[1];

    const image = await loadImage(tileset.filename);

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.drawImage(image, 0, 0);

    const pixels: Uint8ClampedArray[] = [];
    const pixels32: Uint32Array[] = [];

    for (let y = 0; y < image.height / tileset.dimensions.width; y++) {
      for (let x = 0; x < image.width / tileset.dimensions.height; x++) {
        const pxs = ctx.getImageData(
          x * tileset.dimensions.width,
          y * tileset.dimensions.height,
          tileset.dimensions.width,
          tileset.dimensions.height,
        ).data;

        const pxs32 = new Uint32Array(pxs.buffer);

        if (tileset.type === "blackandwhite") {
          for (let i = 0; i < pxs32.length; i++) {
            pxs32[i] = ((pxs32[i] & 0xFFFFFF) === 0) ? 0 : 1;
          }
        }

        pixels.push(pxs);
        pixels32.push(pxs32);
      }
    }

    map.set(id, {
      type: tileset.type,
      pixels,
      pixels32,
      dimensions: tileset.dimensions,
    });
  }

  return map;
}
