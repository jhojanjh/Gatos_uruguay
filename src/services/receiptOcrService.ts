/** Lee el texto de una foto de factura en el propio dispositivo. Carga el motor solo cuando se usa. */
export const receiptOcrService = {
  async readText(image: Blob): Promise<string> {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('spa');
    try {
      const { data } = await worker.recognize(image);
      return data.text;
    } finally {
      await worker.terminate();
    }
  },
};
