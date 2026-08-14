const MAX = 256;
const TARGET_BYTES = 40_000;

export async function compressAvatar(file: File): Promise<{ blob: Blob; ext: "webp" | "jpg" }> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Yalnızca görsel yükleyebilirsiniz");
  }
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const out = Math.min(MAX, side);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Görsel işlenemedi");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, out, out);
  bitmap.close();

  const webp = await encodeShrinking(canvas, "image/webp");
  if (webp) return { blob: webp, ext: "webp" };
  const jpg = await encodeShrinking(canvas, "image/jpeg");
  if (!jpg) throw new Error("Görsel küçültülemedi");
  return { blob: jpg, ext: "jpg" };
}

async function encodeShrinking(canvas: HTMLCanvasElement, type: string) {
  let quality = 0.72;
  let blob = await canvasToBlob(canvas, type, quality);
  while (blob && blob.size > TARGET_BYTES && quality > 0.4) {
    quality -= 0.12;
    blob = await canvasToBlob(canvas, type, quality);
  }
  return blob && blob.size > 0 ? blob : null;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}
