// src/app/services/capture-ocr.service.ts
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { createWorker } from 'tesseract.js';


@Injectable({
  providedIn: 'root',
})
export class CaptureOcrService {
  constructor() {}

  // Importar imagen desde la galería
  async pickFromGallery(): Promise<string> {
    const photo = await Camera.getPhoto({
      source: CameraSource.Photos,
      resultType: CameraResultType.DataUrl,
      quality: 90,
    });
    if (!photo.dataUrl) throw new Error('No se obtuvo imagen desde la galería');
    return photo.dataUrl;
  }

  // Capturar imagen desde la cámara
  async captureWithCamera(): Promise<string> {
    const photo = await Camera.getPhoto({
      source: CameraSource.Camera,
      resultType: CameraResultType.DataUrl,
      quality: 90,
      allowEditing: false,
    });
    if (!photo.dataUrl) throw new Error('No se obtuvo imagen desde la cámara');
    return photo.dataUrl;
  }

  // OCR básico con Tesseract.js (funciona en Web y móvil)
  async runOcrFromDataUrl(dataUrl: string): Promise<string> {
     try {
    const { createWorker } = await import('tesseract.js');

    const worker = await createWorker('spa', 1, {
      logger: (m: any) => console.log(m), // opcional: muestra el progreso
    });

    const result = await worker.recognize(dataUrl);
    console.log('Texto detectado:', result.data.text);

    await worker.terminate();
    return result.data.text || '';
  } catch (err) {
    console.error('Error en OCR:', err);
    throw err;
  }
  }

  // Crear PDF a partir de la imagen
  async createPdfFromDataUrl(dataUrl: string, footerText?: string): Promise<Uint8Array> {
    const bytes = this.dataUrlToBytes(dataUrl);
    const pdf = await PDFDocument.create();
    const page = pdf.addPage();
    const image = dataUrl.startsWith('data:image/png')
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);

    const { width, height } = image;
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const scale = Math.min(pageWidth / width, (pageHeight - 40) / height);
    const w = width * scale;
    const h = height * scale;

    page.drawImage(image, {
      x: (pageWidth - w) / 2,
      y: (pageHeight - h) / 2,
      width: w,
      height: h,
    });

    if (footerText) {
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      page.drawText(footerText, { x: 20, y: 20, size: 10, font });
    }

    return await pdf.save();
  }

  // Guardar PDF localmente
  async savePdf(bytes: Uint8Array, fileName: string) {
    const base64 = this.bytesToBase64(bytes);
    const path = `docu/${fileName}`;
    await Filesystem.writeFile({
      path,
      data: base64,
      directory: Directory.Documents,
      recursive: true,
    });
    const { uri } = await Filesystem.getUri({ path, directory: Directory.Documents });
    return { path, uri };
  }

  //  Conversores auxiliares
  private dataUrlToBytes(dataUrl: string): Uint8Array {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as any);
    }
    return btoa(binary);
  }
}
