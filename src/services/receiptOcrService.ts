import type { ReceiptOcrLine } from '@/utils/receiptParser';

async function preprocessReceipt(image: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(image);
  try {
    // Mantiene detalle fino de la impresión térmica y evita canvases enormes en móviles.
    const scale = Math.min(1.35, 4200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('No se pudo preparar la foto');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    // Convierte la luz amarilla de la foto a gris y estira el contraste con percentiles,
    // evitando que unos pocos píxeles oscuros del fondo apaguen el texto del ticket.
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = pixels;
    const histogram = new Uint32Array(256);
    const sampleStep = 16;
    for (let pixel = 0; pixel < data.length; pixel += sampleStep * 4) {
      const gray = Math.round(data[pixel] * 0.299 + data[pixel + 1] * 0.587 + data[pixel + 2] * 0.114);
      histogram[gray] += 1;
    }
    const samples = histogram.reduce((sum, count) => sum + count, 0);
    function percentile(target: number): number {
      let count = 0;
      for (let value = 0; value < histogram.length; value += 1) {
        count += histogram[value];
        if (count >= samples * target) return value;
      }
      return 255;
    }
    const low = percentile(0.04);
    const high = Math.max(low + 1, percentile(0.96));
    const range = high - low;
    for (let pixel = 0; pixel < data.length; pixel += 4) {
      const gray = data[pixel] * 0.299 + data[pixel + 1] * 0.587 + data[pixel + 2] * 0.114;
      const contrasted = Math.max(0, Math.min(255, Math.round(((gray - low) / range) * 255)));
      data[pixel] = contrasted;
      data[pixel + 1] = contrasted;
      data[pixel + 2] = contrasted;
    }
    context.putImageData(pixels, 0, 0);
    return canvas;
  } finally {
    bitmap.close();
  }
}

/** Lee la factura localmente y conserva coordenadas para asociar las columnas de nombre y precio. */
export const receiptOcrService = {
  async readReceipt(image: Blob): Promise<{ text: string; lines: ReceiptOcrLine[]; width: number }> {
    const canvas = await preprocessReceipt(image);
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('spa');
    try {
      const { data } = await worker.recognize(canvas, {}, { blocks: true });
      const lines = (data.blocks ?? []).flatMap((block) => block.paragraphs.flatMap((paragraph) =>
        paragraph.lines.map((line) => ({
          text: line.text,
          confidence: line.confidence,
          bbox: line.bbox,
          words: line.words.map((word) => ({ text: word.text, confidence: word.confidence, bbox: word.bbox })),
        })),
      ));
      return { text: data.text, lines, width: canvas.width };
    } finally {
      await worker.terminate();
    }
  },
};

