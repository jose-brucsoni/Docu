import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { DocumentStorageService } from './document-storage.service';
import { DocumentoGeneral } from '../models/documento-general.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly NOTIFICACION_PREFIX = 'docu_expira_';
  private permisoConcedido: boolean = false;

  constructor(private documentStorageService: DocumentStorageService) {}

  /**
   * Inicializa el servicio de notificaciones
   * Solicita permisos y programa verificaciones periódicas de documentos
   * @description
   * Se debe llamar al inicio de la aplicación para:
   * - Verificar/conceder permisos de notificaciones
   * - Programar verificación automática de documentos próximos a vencer
   */
  async inicializar(): Promise<void> {
    try {
      await this.solicitarPermisos();
      
      // Programar verificación periódica de documentos próximos a vencer
      await this.programarVerificacionPeriodica();
      
      console.log('Servicio de notificaciones inicializado');
    } catch (error) {
      console.error('Error inicializando servicio de notificaciones:', error);
    }
  }

  /**
   * Solicita permisos del usuario para mostrar notificaciones
   * Verifica primero si ya tiene permisos concedidos
   * @returns true si se concedieron los permisos, false si fueron denegados
   * @description
   * En Android e iOS, las notificaciones requieren permiso explícito del usuario.
   * Esta función:
   * 1. Verifica si ya hay permisos concedidos
   * 2. Si no, solicita permisos al usuario
   * 3. Guarda el estado de los permisos en memoria
   */
  async solicitarPermisos(): Promise<boolean> {
    try {
      const status = await LocalNotifications.checkPermissions();
      
      if (status.display === 'granted') {
        this.permisoConcedido = true;
        return true;
      }
      
      const result = await LocalNotifications.requestPermissions();
      this.permisoConcedido = result.display === 'granted';
      
      return this.permisoConcedido;
    } catch (error) {
      console.error('Error solicitando permisos de notificaciones:', error);
      return false;
    }
  }

  /**
   * Programar una notificación para un documento que está por vencer
   */
  async programarNotificacionParaDocumento(documento: DocumentoGeneral): Promise<void> {
    try {
      // Verificar permisos
      if (!this.permisoConcedido) {
        const tienePermiso = await this.solicitarPermisos();
        if (!tienePermiso) {
          console.warn('Permisos de notificación no concedidos');
          return;
        }
      }

      if (!documento.id || !documento.fechaExpiracion) {
        console.warn('Documento no tiene ID o fecha de expiración');
        return;
      }

      const fechaExpiracion = this.convertirFechaADate(documento.fechaExpiracion);
      
      if (!fechaExpiracion) {
        console.warn('Fecha de expiración inválida');
        return;
      }

      // Calcular fecha de notificación (7 días antes de expirar)
      const fechaNotificacion = new Date(fechaExpiracion);
      fechaNotificacion.setDate(fechaNotificacion.getDate() - 7);

      // Verificar que la fecha de notificación no haya pasado
      const ahora = new Date();
      if (fechaNotificacion <= ahora) {
        console.log('La fecha de notificación ya pasó, no se programará');
        return;
      }

      // Cancelar notificación existente para este documento si existe
      await this.cancelarNotificacionDocumento(documento.id);

      // Crear ID único para la notificación
      const notificationId = this.obtenerNotificationId(documento.id);

      // Preparar la notificación
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `⚠️ Documento por Vencer`,
            body: `${documento.nombre || documento.tipoDocumento} vence el ${documento.fechaExpiracion}`,
            id: notificationId,
            schedule: {
              at: fechaNotificacion
            },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: 'DOCUMENTO_VENCE',
            extra: {
              documentoId: documento.id,
              fechaExpiracion: documento.fechaExpiracion
            }
          }
        ]
      });

      console.log(`Notificación programada para documento ${documento.id} el ${fechaNotificacion.toISOString()}`);
    } catch (error) {
      console.error('Error programando notificación:', error);
    }
  }

  /**
   * Cancela una notificación programada para un documento específico
   * @param documentoId - ID del documento cuya notificación se cancelará
   * @description
   * Se usa cuando:
   * - Se elimina un documento
   * - Se actualiza la fecha de expiración de un documento
   * - Se necesita cancelar una notificación programada
   */
  async cancelarNotificacionDocumento(documentoId: string): Promise<void> {
    try {
      const notificationId = this.obtenerNotificationId(documentoId);
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      console.log(`Notificación cancelada para documento ${documentoId}`);
    } catch (error) {
      console.error('Error cancelando notificación:', error);
    }
  }

  /**
   * Verifica todos los documentos y programa notificaciones para los que estén próximos a vencer
   * @description
   * Itera sobre todos los documentos y programa notificaciones si tienen fecha de expiración.
   * Se llama automáticamente al inicializar el servicio.
   */
  async verificarYProgramarNotificaciones(): Promise<void> {
    try {
      const documentos = await this.documentStorageService.obtenerTodosLosDocumentos();
      
      for (const documento of documentos) {
        if (documento.fechaExpiracion) {
          await this.programarNotificacionParaDocumento(documento);
        }
      }
      
      console.log('Verificación de notificaciones completada');
    } catch (error) {
      console.error('Error verificando notificaciones:', error);
    }
  }

  /**
   * Programa verificación periódica de documentos
   * @private
   * @description
   * Sistema de verificación que se ejecuta cuando la aplicación está activa.
   * Verifica todos los documentos y reprograma notificaciones si es necesario.
   * En el futuro podría extenderse con un servicio en background.
   */
  private async programarVerificacionPeriodica(): Promise<void> {
    // Esta función se ejecutará cuando la aplicación esté activa
    // En producción, podrías usar un servicio en background
    try {
      // Verificar inmediatamente
      await this.verificarYProgramarNotificaciones();
      
      // También puedes agregar un listener para cuando la app se abre
    } catch (error) {
      console.error('Error en verificación periódica:', error);
    }
  }

  /**
   * Obtiene la lista de todas las notificaciones programadas que aún no se han mostrado
   * @returns Array de notificaciones pendientes
   */
  async obtenerNotificacionesProgramadas(): Promise<any[]> {
    try {
      const { notifications } = await LocalNotifications.getPending();
      return notifications || [];
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      return [];
    }
  }

  /**
   * Cancela todas las notificaciones programadas por la aplicación
   * @description
   * Útil para:
   * - Limpieza de notificaciones antiguas
   * - Reset del sistema de notificaciones
   * - Testing y desarrollo
   */
  async cancelarTodasLasNotificaciones(): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [] });
      console.log('Todas las notificaciones han sido canceladas');
    } catch (error) {
      console.error('Error cancelando notificaciones:', error);
    }
  }

  /**
   * Genera un ID numérico único para una notificación a partir del ID del documento
   * Usa un hash simple para convertir el ID de string a número
   * @param documentoId - ID del documento
   * @returns ID numérico para la notificación (rango 100000-1099999)
   * @private
   */
  private obtenerNotificationId(documentoId: string): number {
    // Convertir el ID del documento a un número
    // Usar hash simple basado en el ID del documento
    let hash = 0;
    for (let i = 0; i < documentoId.length; i++) {
      const char = documentoId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    // Asegurar que el ID sea positivo y único
    return Math.abs(hash) % 1000000 + 100000; // Rango de 100000-1099999
  }

  /**
   * Convierte una fecha en formato string DD/MM/YYYY a objeto Date
   * @param fecha - Fecha en formato DD/MM/YYYY
   * @returns Objeto Date o null si el formato es inválido
   * @private
   */
  private convertirFechaADate(fecha: string): Date | null {
    try {
      const partes = fecha.split('/');
      
      if (partes.length !== 3) {
        console.error('Formato de fecha inválido:', fecha);
        return null;
      }
      
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Los meses son 0-indexed
      const año = parseInt(partes[2], 10);
      
      const fechaDate = new Date(año, mes, dia);
      
      if (isNaN(fechaDate.getTime())) {
        console.error('Fecha inválida:', fecha);
        return null;
      }
      
      return fechaDate;
    } catch (error) {
      console.error('Error convirtiendo fecha:', error);
      return null;
    }
  }

  /**
   * Identifica documentos que están próximos a vencer o ya vencidos
   * @param diasAntes - Número de días antes de la expiración para considerar "próximo a vencer" (default: 7)
   * @returns Array de documentos que están próximos a vencer o ya vencidos
   * @description
   * Busca documentos cuya fecha de expiración está dentro del rango especificado:
   * - 0 días: Vencido
   * - 0 a diasAntes días: Próximo a vencer
   * - Más de diasAntes días: No está próximo a vencer
   */
  async verificarDocumentosProximosAVencer(diasAntes: number = 7): Promise<DocumentoGeneral[]> {
    try {
      const documentos = await this.documentStorageService.obtenerTodosLosDocumentos();
      const documentosProximos: DocumentoGeneral[] = [];
      const hoy = new Date();
      
      for (const doc of documentos) {
        if (!doc.fechaExpiracion) continue;
        
        const fechaExpiracion = this.convertirFechaADate(doc.fechaExpiracion);
        if (!fechaExpiracion) continue;
        
        const diasRestantes = Math.ceil((fechaExpiracion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes >= 0 && diasRestantes <= diasAntes) {
          documentosProximos.push(doc);
        }
      }
      
      return documentosProximos;
    } catch (error) {
      console.error('Error verificando documentos próximos a vencer:', error);
      return [];
    }
  }
}

