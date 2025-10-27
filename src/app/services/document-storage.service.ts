import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { DocumentoGeneral } from '../models/documento-general.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentStorageService {
  private readonly STORAGE_KEY = 'docu_documents';

  constructor() {}

  /**
   * Guardar un documento con su imagen
   */
  async guardarDocumento(documento: DocumentoGeneral, imagenDataUrl: string): Promise<void> {
    try {
      // Generar ID único para el documento
      const documentoId = documento.id || this.generarIdUnico();
      
      // Guardar la imagen en el sistema de archivos
      const imagenPath = await this.guardarImagen(documentoId, imagenDataUrl);
      
      // Actualizar el documento con la información de la imagen
      documento.id = documentoId;
      documento.imagenPath = imagenPath;
      documento.fechaCreacion = new Date();
      documento.fechaActualizacion = new Date();
      
      // Guardar los metadatos en Preferences
      await this.guardarMetadatos(documento);
      
      console.log('Documento guardado exitosamente:', documentoId);
    } catch (error) {
      console.error('Error al guardar documento:', error);
      throw new Error('No se pudo guardar el documento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  /**
   * Guardar la imagen del documento en el sistema de archivos
   */
  private async guardarImagen(documentoId: string, imagenDataUrl: string): Promise<string> {
    try {
      // Convertir base64 a bytes
      const base64Data = imagenDataUrl.split(',')[1]; // Remover el prefijo data:image/jpeg;base64,
      
      // Crear el directorio si no existe
      const dirPath = 'docu/images';
      const fileName = `${documentoId}.jpg`;
      const filePath = `${dirPath}/${fileName}`;
      
      // Guardar la imagen
      await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.Data, // Directorio de datos de la aplicación
        recursive: true
      });
      
      console.log('Imagen guardada en:', filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error al guardar imagen:', error);
      throw error;
    }
  }

  /**
   * Guardar metadatos del documento en Preferences (almacenamiento local)
   */
  private async guardarMetadatos(documento: DocumentoGeneral): Promise<void> {
    try {
      // Obtener documentos existentes
      const documentos = await this.obtenerTodosLosDocumentos();
      
      // Actualizar o agregar el nuevo documento
      const indice = documentos.findIndex(doc => doc.id === documento.id);
      if (indice >= 0) {
        documentos[indice] = documento;
      } else {
        documentos.push(documento);
      }
      
      // Guardar en Preferences
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(documentos)
      });
    } catch (error) {
      console.error('Error al guardar metadatos:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los documentos guardados
   */
  async obtenerTodosLosDocumentos(): Promise<DocumentoGeneral[]> {
    try {
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      
      if (!value) {
        return [];
      }
      
      const documentos = JSON.parse(value) as DocumentoGeneral[];
      return documentos;
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      return [];
    }
  }

  /**
   * Obtener un documento por su ID
   */
  async obtenerDocumentoPorId(id: string): Promise<DocumentoGeneral | null> {
    try {
      const documentos = await this.obtenerTodosLosDocumentos();
      return documentos.find(doc => doc.id === id) || null;
    } catch (error) {
      console.error('Error al obtener documento:', error);
      return null;
    }
  }

  /**
   * Obtener la imagen de un documento
   */
  async obtenerImagenDocumento(imagenPath: string): Promise<string> {
    try {
      const { data } = await Filesystem.readFile({
        path: imagenPath,
        directory: Directory.Data
      });
      
      // Convertir a data URL para mostrar en la UI
      return `data:image/jpeg;base64,${data}`;
    } catch (error) {
      console.error('Error al leer imagen:', error);
      throw error;
    }
  }

  /**
   * Eliminar un documento
   */
  async eliminarDocumento(id: string): Promise<void> {
    try {
      // Obtener el documento para encontrar la ruta de la imagen
      const documento = await this.obtenerDocumentoPorId(id);
      
      if (documento && documento.imagenPath) {
        // Eliminar la imagen
        try {
          await Filesystem.deleteFile({
            path: documento.imagenPath,
            directory: Directory.Data
          });
        } catch (error) {
          console.warn('No se pudo eliminar la imagen:', error);
        }
      }
      
      // Eliminar de los metadatos
      const documentos = await this.obtenerTodosLosDocumentos();
      const documentosFiltrados = documentos.filter(doc => doc.id !== id);
      
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(documentosFiltrados)
      });
      
      console.log('Documento eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      throw error;
    }
  }

  /**
   * Actualizar un documento existente
   */
  async actualizarDocumento(documento: DocumentoGeneral): Promise<void> {
    try {
      documento.fechaActualizacion = new Date();
      await this.guardarMetadatos(documento);
      console.log('Documento actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      throw error;
    }
  }

  /**
   * Generar ID único para documentos
   */
  private generarIdUnico(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener estadísticas de documentos guardados
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    porTipo: Record<string, number>;
    proximosAVencer: number;
  }> {
    try {
      const documentos = await this.obtenerTodosLosDocumentos();
      const hoy = new Date();
      
      const porTipo: Record<string, number> = {};
      let proximosAVencer = 0;
      
      documentos.forEach(doc => {
        // Contar por tipo
        porTipo[doc.tipoDocumento] = (porTipo[doc.tipoDocumento] || 0) + 1;
        
        // Contar próximos a vencer (próximos 30 días)
        if (doc.fechaExpiracion) {
          const fechaExpiracion = this.convertirFechaADate(doc.fechaExpiracion);
          if (fechaExpiracion) {
            const diasRestantes = Math.ceil((fechaExpiracion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
            if (diasRestantes >= 0 && diasRestantes <= 30) {
              proximosAVencer++;
            }
          }
        }
      });
      
      return {
        total: documentos.length,
        porTipo,
        proximosAVencer
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { total: 0, porTipo: {}, proximosAVencer: 0 };
    }
  }

  /**
   * Convertir fecha string a Date
   */
  private convertirFechaADate(fecha: string): Date | null {
    try {
      const [dia, mes, año] = fecha.split('/').map(Number);
      const fechaDate = new Date(año, mes - 1, dia);
      
      if (isNaN(fechaDate.getTime())) {
        return null;
      }
      
      return fechaDate;
    } catch (error) {
      console.error('Error convirtiendo fecha:', error);
      return null;
    }
  }

  /**
   * Buscar documentos por tipo
   */
  async buscarDocumentosPorTipo(tipoDocumento: string): Promise<DocumentoGeneral[]> {
    try {
      const documentos = await this.obtenerTodosLosDocumentos();
      return documentos.filter(doc => doc.tipoDocumento === tipoDocumento);
    } catch (error) {
      console.error('Error al buscar documentos:', error);
      return [];
    }
  }

  /**
   * Limpiar todos los documentos (útil para testing o reset)
   */
  async limpiarTodosLosDocumentos(): Promise<void> {
    try {
      await Preferences.remove({ key: this.STORAGE_KEY });
      console.log('Todos los documentos fueron eliminados');
    } catch (error) {
      console.error('Error al limpiar documentos:', error);
      throw error;
    }
  }
}
