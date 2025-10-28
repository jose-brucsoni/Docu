// src/app/services/capture-ocr.service.ts
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { createWorker, PSM } from 'tesseract.js';


@Injectable({
  providedIn: 'root',
})
export class CaptureOcrService {
  constructor() {}

  /**
   * Abre la galería de imágenes del dispositivo para seleccionar una imagen
   * @returns Data URL de la imagen seleccionada (formato base64)
   * @throws Error si no se seleccionó ninguna imagen o se canceló la operación
   * 
   * @description
   * Permite al usuario elegir una imagen desde su galería de fotos.
   * Retorna la imagen en formato Data URL para procesamiento directo.
   */
  async pickFromGallery(): Promise<string> {
    const photo = await Camera.getPhoto({
      source: CameraSource.Photos,
      resultType: CameraResultType.DataUrl,
      quality: 90,
    });
    if (!photo.dataUrl) throw new Error('No se obtuvo imagen desde la galería');
    return photo.dataUrl;
  }

  /**
   * Abre la cámara del dispositivo para capturar una nueva foto
   * @returns Data URL de la imagen capturada (formato base64)
   * @throws Error si no se capturó la imagen o se canceló la operación
   * 
   * @description
   * Inicia la cámara del dispositivo y permite al usuario tomar una foto.
   * La foto se retorna en formato Data URL para procesamiento inmediato.
   * No se permite edición de la foto para mantener la calidad original.
   */
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

  /**
   * Procesa una imagen con OCR (Reconocimiento Óptico de Caracteres) usando Tesseract.js
   * Extrae todo el texto visible de la imagen
   * @param dataUrl - Imagen en formato Data URL (base64)
   * @returns Texto extraído de la imagen
   * @throws Error si hay problemas con el procesamiento OCR o la imagen es inválida
   * 
   * @description
   * Esta función:
   * 1. Inicializa el worker de Tesseract con idioma español
   * 2. Configura parámetros optimizados para documentos móviles
   * 3. Procesa la imagen y extrae el texto
   * 4. Limpia y normaliza el texto extraído
   * 5. Retorna el texto procesado
   * 
   * Optimizado para rendimiento en dispositivos móviles.
   */
  async runOcrFromDataUrl(dataUrl: string): Promise<string> {
    try {
      console.log('Iniciando OCR...');
      const { createWorker } = await import('tesseract.js');

      // Configuración optimizada para móvil
      const worker = await createWorker('spa', 1, {
        logger: (m: any) => {
          console.log('OCR Progress:', m);
        },
        // Configuraciones específicas para móvil
        gzip: false, // Deshabilitar compresión para mejor rendimiento en móvil
        cachePath: undefined, // No usar cache para evitar problemas de memoria
      });

      // Configurar parámetros de reconocimiento para mejor precisión en móvil
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,/-: ',
        tessedit_pageseg_mode: 6 as any, // Modo de segmentación de página uniforme (SINGLE_UNIFORM_BLOCK)
      });

      console.log('Procesando imagen con OCR...');
      const result = await worker.recognize(dataUrl);
      
      console.log('OCR completado. Texto detectado:', result.data.text);
      console.log('Confianza promedio:', result.data.confidence);

      await worker.terminate();
      
      // Limpiar el texto detectado para mejor procesamiento
      const cleanedText = this.cleanOcrText(result.data.text);
      console.log('Texto limpio:', cleanedText);
      
      return cleanedText;
    } catch (err) {
      console.error('Error en OCR:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido en OCR';
      throw new Error(`Error en el reconocimiento de texto: ${errorMessage}`);
    }
  }

  /**
   * Limpia y normaliza el texto extraído por OCR
   * Remueve espacios y saltos de línea excesivos para mejorar la legibilidad
   * @param text - Texto crudo extraído por OCR
   * @returns Texto normalizado
   * @private
   */
  private cleanOcrText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalizar espacios
      .replace(/\n+/g, '\n') // Normalizar saltos de línea
      .trim();
  }

  /**
   * Convierte una imagen a documento PDF
   * @param dataUrl - Imagen en formato Data URL
   * @param footerText - Texto opcional para el pie de página del PDF
   * @returns Array de bytes que representa el PDF generado
   * @throws Error si hay problemas al crear el PDF
   * 
   * @description
   * Crea un documento PDF a partir de una imagen:
   * 1. Convierte la imagen a bytes
   * 2. Crea un nuevo documento PDF
   * 3. Redimensiona la imagen para ajustarse a la página
   * 4. Centra la imagen en el PDF
   * 5. Agrega texto opcional en el pie de página
   * 6. Retorna el PDF como array de bytes
   */
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

  /**
   * Guarda un archivo PDF en el sistema de archivos del dispositivo
   * @param bytes - Contenido del PDF como array de bytes
   * @param fileName - Nombre del archivo PDF a guardar
   * @returns Objeto con la ruta relativa y URI completa del archivo guardado
   * @throws Error si no se puede escribir el archivo
   * 
   * @description
   * Guarda el PDF en el directorio de documentos del dispositivo en:
   * - Ruta: `docu/{fileName}`
   * - Crea directorios automáticamente si no existen
   * - Retorna la ruta y URI para acceso posterior
   */
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

  /**
   * Convierte una imagen Data URL a array de bytes
   * @param dataUrl - Imagen en formato Data URL (data:image/...;base64,...)
   * @returns Array de bytes de la imagen
   * @private
   */
  private dataUrlToBytes(dataUrl: string): Uint8Array {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  /**
   * Convierte un array de bytes a string base64
   * Maneja archivos grandes procesándolos en chunks
   * @param bytes - Array de bytes a convertir
   * @returns String en formato base64
   * @private
   */
  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as any);
    }
    return btoa(binary);
  }
}
