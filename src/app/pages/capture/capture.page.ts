import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {IonContent, IonButton, IonIcon, ToastController} from '@ionic/angular/standalone';
import { CaptureOcrService } from 'src/app/services/capture-io';
import { extractExpiryDates, pickBestExpiryDate } from 'src/app/utils/date-detector';
 

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon
  ],
})


export class CapturePage {
  imgDataUrl = signal<string | null>(null);
  ocrText = signal<string>('');
  detectedDates = signal<{ raw: string; iso: string }[]>([]);
  selectedDate = signal<string | null>(null);

  constructor(
    private ocrService: CaptureOcrService,
    private toast: ToastController,
    private router: Router
  ) {}

  async onImport() {
      try {
      const img = await this.ocrService.pickFromGallery(); // Abre la galería
      this.imgDataUrl.set(img); // Muestra la imagen en pantalla
      this.notify('Imagen importada correctamente');
        } catch (error) {
      console.error(error);
      this.notify('Error al importar la imagen ');
      }
  }

  async onScan() {
    try {
      const img = await this.ocrService.captureWithCamera(); //Toma una foto
      this.imgDataUrl.set(img);
      this.notify('Foto capturada correctamente ');
   } catch (error) {
      console.error(error);
      this.notify('Error al abrir la cámara ');
    }
  }

  async onOcr() {
    if (!this.imgDataUrl()) {
      this.notify('Primero selecciona una imagen');
      return;
    }

    try {
      this.notify('Procesando imagen...');
      console.log('Iniciando procesamiento OCR...');
      
      const text = await this.ocrService.runOcrFromDataUrl(this.imgDataUrl()!);
      console.log('Texto extraído:', text);
      
      this.ocrText.set(text);

      if (!text || text.trim().length === 0) {
        this.notify('No se pudo extraer texto de la imagen. Intenta con otra imagen más clara.');
        return;
      }

      console.log('Extrayendo fechas del texto...');
      const dates = extractExpiryDates(text);
      console.log('Fechas detectadas:', dates);
      this.detectedDates.set(dates);

      const best = pickBestExpiryDate(text, dates);
      console.log('Mejor fecha seleccionada:', best);
      this.selectedDate.set(best?.iso ?? null);

      if (best) {
        this.notify(`✅ Fecha de expiración detectada: ${new Date(best.iso).toLocaleDateString('es-BO')}`);
      } else if (dates.length > 0) {
        this.notify(`⚠️ Se detectaron ${dates.length} fechas, pero ninguna parece ser de expiración`);
      } else {
        this.notify('❌ No se encontraron fechas en el documento');
      }
    } catch (error) {
      console.error('Error en procesamiento OCR:', error);
      this.notify('Error al procesar la imagen. Verifica que la imagen sea clara y legible.');
    }
  }

  async onSavePdf() {
    try {
      if (!this.imgDataUrl()) {
      return this.notify('Primero importa o escanea una imagen');
    }

    // Pie opcional con la fecha seleccionada si la hubiera
    const footer = this.selectedDate()
      ? `DOCU • Vence: ${this.formatDateForFooter(this.selectedDate()!)}`
      : 'DOCU • Generado desde app';

    const bytes = await this.ocrService.createPdfFromDataUrl(this.imgDataUrl()!, footer);
    const fileName = `docu-${Date.now()}.pdf`;
    const { uri } = await this.ocrService.savePdf(bytes, fileName);

      this.notify(`PDF guardado \n${uri}`);
    } catch (e) {
      console.error(e);
      this.notify('No se pudo guardar el PDF ');
    }
  }


  private formatDateForFooter(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

  volverMenuPrincipal() {
    this.router.navigateByUrl('/menu-principal');
  }

  private async notify(message: string) {
    const toast = await this.toast.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}
