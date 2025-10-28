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
   * Inicializar el servicio de notificaciones
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
   * Solicitar permisos para enviar notificaciones
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
   * Cancelar notificación para un documento específico
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
   * Verificar y programar notificaciones para documentos próximos a vencer
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
   * Programar verificación periódica de documentos
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
   * Obtener todas las notificaciones programadas
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
   * Cancelar todas las notificaciones
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
   * Obtener ID de notificación a partir del ID del documento
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
   * Convertir fecha string DD/MM/YYYY a Date
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
   * Obtener notificaciones de documentos vencidos o próximos a vencer
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

