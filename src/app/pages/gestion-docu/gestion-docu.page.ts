import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonButton, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle,
  IonImg,
  IonSpinner,
  IonAlert,
  IonIcon,
  IonFab,
  IonFabButton,
  IonInput
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { createWorker, PSM } from 'tesseract.js';
import { addIcons } from 'ionicons';
import { camera, documentText, save, card, car, document, arrowBack, trashOutline, informationCircle, create, close, calendarOutline, timeOutline, calendar } from 'ionicons/icons';
import { DocumentoGeneral, DocumentoGeneralForm, FechasExtraidas, TipoDocumento, OPCIONES_TIPO_DOCUMENTO } from '../../models/documento-general.model';
import { DocumentStorageService } from '../../services/document-storage.service';
import { Login } from '../../services/login';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-gestion-docu',
  templateUrl: './gestion-docu.page.html',
  styleUrls: ['./gestion-docu.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonButton, 
    IonCard, 
    IonCardContent, 
    IonCardHeader, 
    IonCardTitle,
    IonImg,
    IonSpinner,
    IonAlert,
    IonIcon,
    IonFab,
    IonFabButton,
    IonInput,
    CommonModule, 
    FormsModule
  ]
})
export class GestionDocuPage implements OnInit {
  // Servicios
  private auth = inject(Login);
  
  // Información del usuario
  userId: string | null = null;
  
  capturedImage: string | null = null;
  isProcessing: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  documentoExtraido: DocumentoGeneralForm | null = null;
  fechasExtraidas: FechasExtraidas | null = null;
  showEditCard: boolean = false;
  
  // Propiedades para el selector de tipo de documento
  tipoDocumentoSeleccionado: TipoDocumento | null = null;
  opcionesTipoDocumento = OPCIONES_TIPO_DOCUMENTO;
  showTipoSelector: boolean = true;
  
  // Propiedades para edición
  modoEdicion: boolean = false;
  documentoEditando: DocumentoGeneral | null = null;

  constructor(
    private documentStorageService: DocumentStorageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ camera, documentText, save, card, car, document, arrowBack, trashOutline, informationCircle, create, close, calendarOutline, timeOutline, calendar });
  }

  async ngOnInit() {
    console.log('Página de gestión de documentos inicializada');
    
    // Obtener usuario autenticado
    const user = await firstValueFrom(this.auth.user$);
    if (!user) {
      console.error('No hay usuario autenticado');
      this.router.navigateByUrl('/login');
      return;
    }
    
    this.userId = user.uid;
    console.log('Usuario autenticado:', this.userId);
    
    // Verificar si hay un ID en la ruta (modo edición)
    this.route.params.subscribe(async params => {
      const id = params['id'];
      if (id) {
        this.modoEdicion = true;
        await this.cargarDocumentoParaEdicion(id);
      }
    });
  }

  async cargarDocumentoParaEdicion(id: string) {
    try {
      if (!this.userId) {
        console.error('No hay usuario autenticado');
        this.modoEdicion = false;
        return;
      }
      
      console.log('Cargando documento para edición:', id);
      
      // Obtener documentos del usuario
      const documentos = await this.documentStorageService.obtenerDocumentosPorUsuario(this.userId);
      
      // Convertir id a número para comparación
      const idNumero = parseInt(id);
      
      // Buscar el documento por ID (compara el número extraído del ID con el ID de la ruta)
      const documento = documentos.find(doc => {
        const docIdNumero = parseInt(doc.id?.replace('doc_', '') || '0');
        return docIdNumero === idNumero;
      });
      
      if (documento) {
        console.log('Documento encontrado:', documento);
        this.documentoEditando = documento;
        
        // Cargar la imagen del documento
        if (documento.imagenPath) {
          try {
            const imagen = await this.documentStorageService.obtenerImagenDocumento(documento.imagenPath);
            this.capturedImage = imagen;
          } catch (error) {
            console.error('Error al cargar imagen:', error);
          }
        }
        
        // Convertir a formulario
        this.documentoExtraido = {
          nombre: documento.nombre || '',
          fechaEmision: documento.fechaEmision || '',
          fechaExpiracion: documento.fechaExpiracion || '',
          tipoDocumento: documento.tipoDocumento,
          numeroDocumento: documento.numeroDocumento || '',
          nombres: documento.nombres || '',
          apellidos: documento.apellidos || '',
          fechaNacimiento: documento.fechaNacimiento || '',
          lugarNacimiento: documento.lugarNacimiento || '',
          domicilio: documento.domicilio || '',
          estadoCivil: documento.estadoCivil || '',
          grupoSanguineo: documento.grupoSanguineo || '',
          profesion: documento.profesion || ''
        };
        
        this.tipoDocumentoSeleccionado = documento.tipoDocumento;
        this.showTipoSelector = false;
        this.showEditCard = true;
        
        console.log('Documento cargado para edición');
      } else {
        console.error('Documento no encontrado');
        this.modoEdicion = false;
      }
    } catch (error) {
      console.error('Error al cargar documento:', error);
      this.modoEdicion = false;
    }
  }

  async takePicture() {
    // Verificar que se haya seleccionado un tipo de documento
    if (!this.tipoDocumentoSeleccionado) {
      this.showAlertMessage('Por favor, selecciona un tipo de documento antes de capturar');
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 100, // Máxima calidad
        allowEditing: true, // Permitir edición para recortar
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        correctOrientation: true, // Corregir orientación automáticamente
        saveToGallery: false
      });

      if (image.dataUrl) {
        this.capturedImage = image.dataUrl;
        this.showTipoSelector = false; // Ocultar el selector después de capturar
        await this.extractTextWithFallback(image.dataUrl);
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      this.showAlertMessage('Error al acceder a la cámara');
    }
  }

  async extractTextFromImage(imageDataUrl: string) {
    this.isProcessing = true;

    try {
      // Validar que la imagen existe y es válida
      if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
        throw new Error('Formato de imagen inválido');
      }

      console.log('Iniciando procesamiento OCR...');
      console.log('Tamaño de imagen:', imageDataUrl.length, 'caracteres');
      
      // Verificar si Tesseract está disponible
      if (typeof Worker === 'undefined') {
        throw new Error('Web Workers no están disponibles en este navegador');
      }

      // Preprocesar la imagen para evitar errores de dimensiones
      const processedImageDataUrl = await this.preprocessImage(imageDataUrl);
      
      // Crear worker de Tesseract con configuración optimizada
      const worker = await createWorker('spa', 1, {
        logger: m => console.log('Tesseract:', m)
      });

      // Configuraciones que se pueden establecer después de la inicialización
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,/-:()',
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK, // Asumir un bloque uniforme de texto
        preserve_interword_spaces: '1',
        tessedit_create_hocr: '0',
        tessedit_create_tsv: '0',
        tessedit_create_boxfile: '0'
      });

      // Procesar la imagen preprocesada
      const { data: { text, confidence } } = await worker.recognize(processedImageDataUrl);
      
      console.log('Confianza del OCR:', confidence);
      
      // Post-procesamiento del texto para mejorar legibilidad
      let processedText = this.postProcessText(text.trim());
      
      // Extraer fechas específicas del documento
      this.fechasExtraidas = this.extraerFechasDocumento(processedText);
      
      // SIEMPRE mostrar el formulario para edición (independientemente de la confianza)
      this.documentoExtraido = this.extraerDatosDocumento(processedText);
      this.showEditCard = true;
      
      // Terminar el worker
      await worker.terminate();

      if (confidence < 30) {
        this.showAlertMessage('La calidad del reconocimiento es baja. Por favor, revisa y corrige los datos extraídos.');
      }
    } catch (error) {
      console.error('Error al procesar OCR:', error);
      
      // Diagnóstico específico del error
      let errorMessage = 'Error al procesar la imagen';
      
      if (error instanceof Error) {
        if (error.message.includes('Worker')) {
          errorMessage = 'Error al inicializar el motor de OCR. Intenta nuevamente.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (error.message.includes('memory') || error.message.includes('Memory')) {
          errorMessage = 'Memoria insuficiente. Intenta con una imagen más pequeña.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Tiempo de procesamiento agotado. Intenta nuevamente.';
        } else {
          errorMessage = `Error técnico: ${error.message}`;
        }
      }
      
      this.showAlertMessage(errorMessage);
    } finally {
      this.isProcessing = false;
    }
  }

  private postProcessText(text: string): string {
    // Limpiar y corregir texto común de OCR
    let processed = text
      // Corregir caracteres mal reconocidos
      .replace(/[|]/g, 'I') // | por I
      .replace(/[0O]/g, (match, offset, string) => {
        // Si está en contexto de números, mantener como 0, si no como O
        const before = string.substring(Math.max(0, offset - 2), offset);
        const after = string.substring(offset + 1, offset + 3);
        return /[0-9]/.test(before + after) ? '0' : 'O';
      })
      .replace(/[1l]/g, '1') // l por 1 en contexto numérico
      .replace(/[5S]/g, (match, offset, string) => {
        const before = string.substring(Math.max(0, offset - 2), offset);
        const after = string.substring(offset + 1, offset + 3);
        return /[0-9]/.test(before + after) ? '5' : 'S';
      })
      .replace(/[8B]/g, (match, offset, string) => {
        const before = string.substring(Math.max(0, offset - 2), offset);
        const after = string.substring(offset + 1, offset + 3);
        return /[0-9]/.test(before + after) ? '8' : 'B';
      })
      // Limpiar espacios múltiples
      .replace(/\s+/g, ' ')
      // Corregir fechas comunes
      .replace(/(\d{2})\/(\d{2})\/(\d{4})/g, '$1/$2/$3')
      // Corregir nombres propios (primera letra mayúscula)
      .replace(/\b([a-z])([a-z]+)\b/g, (match, first, rest) => {
        // Solo aplicar si parece un nombre (no números)
        if (!/[0-9]/.test(match)) {
          return first.toUpperCase() + rest.toLowerCase();
        }
        return match;
      })
      // Limpiar caracteres extraños al final de líneas
      .replace(/[^\w\s.,/-:()]+\s*$/gm, '')
      // Unir líneas que parecen estar divididas incorrectamente
      .replace(/([a-z])\s*\n\s*([a-z])/g, '$1$2')
      .replace(/([A-Z])\s*\n\s*([a-z])/g, '$1$2');

    return processed;
  }

  clearData() {
    this.capturedImage = null;
    this.documentoExtraido = null;
    this.showEditCard = false;
    this.tipoDocumentoSeleccionado = null;
    this.showTipoSelector = true;
    this.modoEdicion = false;
    this.documentoEditando = null;
  }

  // Método para seleccionar tipo de documento
  seleccionarTipoDocumento(tipo: TipoDocumento) {
    this.tipoDocumentoSeleccionado = tipo;
  }

  // Método para volver al selector de tipo
  volverASeleccionarTipo() {
    this.showTipoSelector = true;
    this.capturedImage = null;
    this.documentoExtraido = null;
    this.showEditCard = false;
  }

  async extractTextWithFallback(imageDataUrl: string) {
    try {
      // Intentar con configuración estándar primero
      await this.extractTextFromImage(imageDataUrl);
    } catch (error) {
      console.log('Intentando con configuración alternativa...');
      
      try {
        // Configuración alternativa más simple
        const worker = await createWorker('spa', 1, {
          logger: m => console.log('Fallback Tesseract:', m)
        });

        // Configuración mínima - solo parámetros seguros
        await worker.setParameters({
          tessedit_pageseg_mode: PSM.AUTO
        });

        const { data: { text, confidence } } = await worker.recognize(imageDataUrl);
        
        await worker.terminate();

        console.log('✅ Procesamiento exitoso con configuración alternativa');
      } catch (fallbackError) {
        console.error('Error en configuración alternativa:', fallbackError);
        this.showAlertMessage('Error crítico: No se pudo procesar la imagen con ninguna configuración');
      }
    }
  }


  showAlertMessage(message: string) {
    this.alertMessage = message;
    this.showAlert = true;
  }

  onAlertDismiss() {
    this.showAlert = false;
  }

  // Método para preprocesar la imagen
  async preprocessImage(imageDataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Verificar que estamos en el navegador
      if (typeof window === 'undefined' || !window.document) {
        resolve(imageDataUrl);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          console.log('Dimensiones originales:', img.width, 'x', img.height);
          
          // Crear canvas para redimensionar la imagen
          const canvas = window.document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('No se pudo obtener contexto del canvas'));
            return;
          }
          
          // Calcular nuevas dimensiones (máximo 1200px de ancho, mantener proporción)
          const maxWidth = 1200;
          const maxHeight = 1600;
          let { width, height } = img;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          // Asegurar dimensiones mínimas
          width = Math.max(width, 100);
          height = Math.max(height, 100);
          
          console.log('Dimensiones procesadas:', width, 'x', height);
          
          // Configurar canvas
          canvas.width = width;
          canvas.height = height;
          
          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a JPEG con calidad optimizada
          const processedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          
          console.log('Imagen preprocesada exitosamente');
          resolve(processedDataUrl);
        } catch (error) {
          console.error('Error en preprocesamiento:', error);
          // Si falla el preprocesamiento, usar imagen original
          resolve(imageDataUrl);
        }
      };
      
      img.onerror = () => {
        console.error('Error al cargar imagen para preprocesamiento');
        // Si falla la carga, usar imagen original
        resolve(imageDataUrl);
      };
      
      img.src = imageDataUrl;
    });
  }

  // Método para extraer fechas de emisión y expiración
  extraerFechasDocumento(texto: string): FechasExtraidas {
    console.log('Extrayendo fechas del documento...');
    
    // Obtener fecha actual en formato DD/MM/YYYY
    const hoy = new Date();
    const diaActual = hoy.getDate().toString().padStart(2, '0');
    const mesActual = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const añoActual = hoy.getFullYear();
    const fechaActualString = `${diaActual}/${mesActual}/${añoActual}`;
    
    // Patrones para buscar fechas en formato DD/MM/YYYY
    const patronFecha = /(\d{1,2})\/(\d{1,2})\/(\d{4})/g;
    const fechasEncontradas: string[] = [];
    let match;
    
    while ((match = patronFecha.exec(texto)) !== null) {
      const fecha = match[0];
      fechasEncontradas.push(fecha);
    }
    
    console.log('Fechas encontradas:', fechasEncontradas);
    
    // Buscar específicamente fechas por patrones de texto
    let fechaNacimiento: string | null = null;
    let fechaEmision: string | null = null;
    let fechaExpiracion: string | null = null;
    
    // Buscar patrón "FECHA DE NACIMIENTO"
    const patronNacimiento = /FECHA\s*DE\s*NACIMIENTO?\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;
    const matchNacimiento = texto.match(patronNacimiento);
    if (matchNacimiento) {
      fechaNacimiento = matchNacimiento[1];
    }
    
    // Buscar patrón "FECHA DE EMISIÓN" o "FECHA DE EMISION"
    const patronEmision = /FECHA\s*DE\s*EMISI[ÓO]N?\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;
    const matchEmision = texto.match(patronEmision);
    if (matchEmision) {
      fechaEmision = matchEmision[1];
    }
    
    // Buscar patrón "FECHA DE EXPIRACIÓN" o "FECHA DE EXPIRACION"
    const patronExpiracion = /FECHA\s*DE\s*EXPIRACI[ÓO]N?\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;
    const matchExpiracion = texto.match(patronExpiracion);
    if (matchExpiracion) {
      fechaExpiracion = matchExpiracion[1];
    }
    
    // Si no se encontraron con patrones específicos, usar lógica de ordenamiento
    if (!fechaEmision && !fechaExpiracion && fechasEncontradas.length >= 3) {
      // Ordenar fechas cronológicamente
      const fechasOrdenadas = this.ordenarFechasCronologicamente(fechasEncontradas);
      
      // Asignar por orden: nacimiento (más antigua), emisión (intermedia), expiración (más reciente)
      if (fechasOrdenadas.length >= 3) {
        fechaNacimiento = fechasOrdenadas[0]; // Más antigua
        fechaEmision = fechasOrdenadas[1];   // Intermedia
        fechaExpiracion = fechasOrdenadas[2]; // Más reciente
      } else if (fechasOrdenadas.length >= 2) {
        // Si solo hay 2 fechas, asumir que son emisión y expiración
        fechaEmision = fechasOrdenadas[0];
        fechaExpiracion = fechasOrdenadas[1];
      }
    }
    
    // Si no se encontró fecha de emisión, usar fecha actual
    if (!fechaEmision) {
      fechaEmision = fechaActualString;
      console.log('No se encontró fecha de emisión, usando fecha actual:', fechaEmision);
    }
    
    // Si no se encontró fecha de expiración, dejarla vacía (obligará al usuario a ingresarla)
    if (!fechaExpiracion) {
      console.log('No se encontró fecha de expiración, quedará vacía para que el usuario la ingrese');
    }
    
    // Siempre marcamos como válido para mostrar el formulario
    const esValida = true;
    
    const resultado: FechasExtraidas = {
      fechaEmision,
      fechaExpiracion: fechaExpiracion || '', // Dejar vacío si no se encontró
      esValida,
      mensajeError: undefined
    };
    
    console.log('Resultado extracción fechas:', resultado);
    console.log('Fecha nacimiento:', fechaNacimiento);
    console.log('Fecha emisión:', fechaEmision);
    console.log('Fecha expiración:', fechaExpiracion || '(vacía - el usuario debe ingresarla)');
    return resultado;
  }

  // Método para ordenar fechas cronológicamente
  ordenarFechasCronologicamente(fechas: string[]): string[] {
    return fechas.sort((a, b) => {
      try {
        const [diaA, mesA, añoA] = a.split('/').map(Number);
        const [diaB, mesB, añoB] = b.split('/').map(Number);
        
        const fechaA = new Date(añoA, mesA - 1, diaA);
        const fechaB = new Date(añoB, mesB - 1, diaB);
        
        return fechaA.getTime() - fechaB.getTime();
      } catch (error) {
        console.error('Error ordenando fechas:', error);
        return 0;
      }
    });
  }

  // Método para validar las tres fechas en orden correcto
  validarFechasCompletas(fechaNacimiento: string | null, fechaEmision: string | null, fechaExpiracion: string | null): boolean {
    // Si no tenemos emisión y expiración, no es válido
    if (!fechaEmision || !fechaExpiracion) {
      return false;
    }
    
    try {
      const fechaEmisionDate = this.convertirFechaADate(fechaEmision);
      const fechaExpiracionDate = this.convertirFechaADate(fechaExpiracion);
      
      // Verificar que las fechas sean válidas
      if (!fechaEmisionDate || !fechaExpiracionDate) {
        return false;
      }
      
      // Verificar que emisión < expiración
      const emisionMenorQueExpiracion = fechaEmisionDate < fechaExpiracionDate;
      
      // Si tenemos fecha de nacimiento, verificar que nacimiento < emisión
      if (fechaNacimiento) {
        const fechaNacimientoDate = this.convertirFechaADate(fechaNacimiento);
        if (!fechaNacimientoDate) {
          return false;
        }
        const nacimientoMenorQueEmision = fechaNacimientoDate < fechaEmisionDate;
        return nacimientoMenorQueEmision && emisionMenorQueExpiracion;
      }
      
      return emisionMenorQueExpiracion;
    } catch (error) {
      console.error('Error validando fechas completas:', error);
      return false;
    }
  }

  // Método auxiliar para convertir string de fecha a Date
  convertirFechaADate(fecha: string): Date | null {
    try {
      const [dia, mes, año] = fecha.split('/').map(Number);
      const fechaDate = new Date(año, mes - 1, dia);
      
      // Verificar que la fecha sea válida
      if (isNaN(fechaDate.getTime())) {
        return null;
      }
      
      return fechaDate;
    } catch (error) {
      console.error('Error convirtiendo fecha:', error);
      return null;
    }
  }

  // Método para validar fechas (mantener compatibilidad)
  validarFechas(fechaEmision: string | null, fechaExpiracion: string | null): boolean {
    return this.validarFechasCompletas(null, fechaEmision, fechaExpiracion);
  }

  // Método para extraer datos completos del documento
  extraerDatosDocumento(texto: string): DocumentoGeneralForm {
    console.log('Extrayendo datos completos del documento...');
    
    // Extraer fecha de nacimiento del texto si no se extrajo en el paso anterior
    let fechaNacimientoExtraida = '';
    const patronFechaNacExtraccion = /FECHA\s*DE\s*NACIMIENTO?\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;
    const matchFechaNacExtraccion = texto.match(patronFechaNacExtraccion);
    if (matchFechaNacExtraccion) {
      fechaNacimientoExtraida = matchFechaNacExtraccion[1];
    }
    
    const documento: DocumentoGeneralForm = {
      nombre: '', // Se generará automáticamente si está vacío
      fechaEmision: this.fechasExtraidas?.fechaEmision || '',
      fechaExpiracion: this.fechasExtraidas?.fechaExpiracion || '',
      tipoDocumento: this.tipoDocumentoSeleccionado || 'Otros',
      numeroDocumento: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: fechaNacimientoExtraida,
      lugarNacimiento: '',
      domicilio: '',
      estadoCivil: '',
      grupoSanguineo: '',
      profesion: ''
    };
    
    // Extraer número de documento
    const patronNumero = /N[°º]?\s*(\d+)/i;
    const matchNumero = texto.match(patronNumero);
    if (matchNumero) {
      documento.numeroDocumento = matchNumero[1];
    }
    
    // Extraer nombres
    const patronNombres = /NOMBRES?\s*:?\s*([A-ZÁÉÍÓÚÑ\s]+)/i;
    const matchNombres = texto.match(patronNombres);
    if (matchNombres) {
      documento.nombres = matchNombres[1].trim();
    }
    
    // La fecha de nacimiento ya se extrajo arriba
    if (fechaNacimientoExtraida) {
      documento.fechaNacimiento = fechaNacimientoExtraida;
    }
    
    // Extraer domicilio
    const patronDomicilio = /DOMICILIO?\s*:?\s*([A-ZÁÉÍÓÚÑ0-9\s\.,-]+)/i;
    const matchDomicilio = texto.match(patronDomicilio);
    if (matchDomicilio) {
      documento.domicilio = matchDomicilio[1].trim();
    }
    
    // Extraer estado civil
    const patronEstadoCivil = /ESTADO\s*CIVIL?\s*:?\s*([A-ZÁÉÍÓÚÑ\s]+)/i;
    const matchEstadoCivil = texto.match(patronEstadoCivil);
    if (matchEstadoCivil) {
      documento.estadoCivil = matchEstadoCivil[1].trim();
    }
    
    // Extraer grupo sanguíneo
    const patronGrupoSang = /GRUPO\s*SANGU[ÍI]NEO?\s*:?\s*([A-Z0-9+-]+)/i;
    const matchGrupoSang = texto.match(patronGrupoSang);
    if (matchGrupoSang) {
      documento.grupoSanguineo = matchGrupoSang[1].trim();
    }
    
    console.log('Datos extraídos:', documento);
    return documento;
  }

  // Método para generar nombre único automáticamente
  private async generarNombreUnico(tipoDocumento: string): Promise<string> {
    if (!this.userId) {
      throw new Error('No hay usuario autenticado');
    }
    
    const documentos = await this.documentStorageService.obtenerDocumentosPorUsuario(this.userId);
    
    // Filtrar documentos del mismo tipo
    const documentosDelMismoTipo = documentos.filter(doc => doc.tipoDocumento === tipoDocumento);
    
    // Contar cuántos hay sin nombre o con nombres que empiezan con el tipo
    let contador = 1;
    const nombresExistentes = new Set<string>();
    
    documentosDelMismoTipo.forEach(doc => {
      if (doc.nombre) {
        nombresExistentes.add(doc.nombre);
        // Extraer número si existe (ej: "Cedula de identidad 2")
        const match = doc.nombre.match(/^(.+?)\s*(\d+)$/);
        if (match && match[1] === tipoDocumento) {
          const num = parseInt(match[2]);
          if (num >= contador) {
            contador = num + 1;
          }
        }
      }
    });
    
    // Generar nombre único
    let nombreBase = tipoDocumento;
    while (nombresExistentes.has(nombreBase)) {
      if (contador === 1) {
        contador = 2; // El primer duplicado sería "Tipo 2"
      }
      nombreBase = `${tipoDocumento} ${contador}`;
      contador++;
    }
    
    return nombreBase;
  }

  // Método para guardar documento
  async guardarDocumento() {
    if (!this.documentoExtraido || !this.capturedImage) {
      this.showAlertMessage('No hay datos para guardar');
      return;
    }

    // Validar que la fecha de expiración esté presente
    if (!this.documentoExtraido.fechaExpiracion || this.documentoExtraido.fechaExpiracion.trim() === '') {
      this.showAlertMessage('La fecha de expiración es obligatoria. Por favor, ingresa una fecha válida.');
      return;
    }

    try {
      console.log('Iniciando guardado de documento...');
      console.log('Imagen capturada:', !!this.capturedImage);
      console.log('Datos del documento:', this.documentoExtraido);

      // Generar nombre único si está vacío
      let nombreFinal = this.documentoExtraido.nombre?.trim() || '';
      if (!nombreFinal) {
        nombreFinal = await this.generarNombreUnico(this.documentoExtraido.tipoDocumento);
        console.log('Nombre generado automáticamente:', nombreFinal);
      }

      // Convertir el formulario a DocumentoGeneral
      const documento: DocumentoGeneral = {
        id: this.modoEdicion ? this.documentoEditando?.id : undefined, // Mantener ID en edición
        userId: this.userId || undefined, // Asociar con el usuario autenticado
        nombre: nombreFinal,
        fechaEmision: this.documentoExtraido.fechaEmision,
        fechaExpiracion: this.documentoExtraido.fechaExpiracion,
        tipoDocumento: this.documentoExtraido.tipoDocumento,
        numeroDocumento: this.documentoExtraido.numeroDocumento || '',
        nombres: this.documentoExtraido.nombres || '',
        apellidos: this.documentoExtraido.apellidos || '',
        fechaNacimiento: this.documentoExtraido.fechaNacimiento || '',
        lugarNacimiento: this.documentoExtraido.lugarNacimiento || '',
        domicilio: this.documentoExtraido.domicilio || '',
        estadoCivil: this.documentoExtraido.estadoCivil || '',
        grupoSanguineo: this.documentoExtraido.grupoSanguineo || '',
        profesion: this.documentoExtraido.profesion || ''
      };

      console.log('Documento a guardar:', documento);
      console.log('Tamaño de imagen base64:', this.capturedImage.length, 'caracteres');

      if (this.modoEdicion && documento.id) {
        // Actualizar documento existente
        await this.documentStorageService.actualizarDocumento(documento);
        console.log('Documento actualizado exitosamente');
        this.showAlertMessage('Documento actualizado exitosamente');
      } else {
        // Guardar nuevo documento con imagen
        await this.documentStorageService.guardarDocumento(documento, this.capturedImage);
        console.log('Documento guardado exitosamente');
        this.showAlertMessage('Documento guardado exitosamente');
      }

      // Esperar un momento para mostrar el mensaje
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Limpiar datos de la vista
      this.clearData();

      // Navegar al menú principal
      this.router.navigateByUrl('/menu-principal');
    } catch (error) {
      console.error('Error detallado al guardar documento:', error);
      
      let mensajeError = 'Error al guardar el documento';
      if (error instanceof Error) {
        mensajeError += ': ' + error.message;
        console.error('Stack trace:', error.stack);
      }
      
      this.showAlertMessage(mensajeError);
    }
  }

  // Método para cancelar edición
  cancelarEdicion() {
    this.clearData();
    this.router.navigateByUrl('/menu-principal');
  }

  // Método para eliminar documento
  async eliminarDocumento() {
    if (!this.documentoEditando || !this.documentoEditando.id || !this.userId) {
      this.showAlertMessage('No se puede eliminar el documento');
      return;
    }

    try {
      await this.documentStorageService.eliminarDocumento(this.documentoEditando.id, this.userId);
      console.log('Documento eliminado exitosamente');
      this.showAlertMessage('Documento eliminado exitosamente');
      
      // Esperar un momento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navegar al menú principal
      this.router.navigateByUrl('/menu-principal');
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      this.showAlertMessage('Error al eliminar el documento');
    }
  }
}
