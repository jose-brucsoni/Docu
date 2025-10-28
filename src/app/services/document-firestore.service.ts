import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { DocumentoGeneral } from '../models/documento-general.model';

/**
 * Servicio para manejar la sincronización de documentos con Firebase Firestore
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentFirestoreService {
  private db = inject(Firestore);
  private readonly COLLECTION_NAME = 'documents';

  /**
   * Guardar un documento en Firestore
   */
  async guardarDocumento(documento: DocumentoGeneral): Promise<void> {
    try {
      if (!documento.id || !documento.userId) {
        throw new Error('El documento debe tener ID y userId');
      }

      const docRef = doc(this.db, this.COLLECTION_NAME, documento.id);
      
      // Preparar el documento para Firestore (convertir fechas)
      const documentoParaFirestore = this.prepararDocumentoParaFirestore(documento);
      
      await setDoc(docRef, documentoParaFirestore, { merge: true });

      console.log('Documento guardado en Firestore:', documento.id);
    } catch (error) {
      console.error('Error al guardar documento en Firestore:', error);
      throw error;
    }
  }

  /**
   * Obtener un documento por ID y userId
   */
  async obtenerDocumento(id: string, userId: string): Promise<DocumentoGeneral | null> {
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const datos = docSnap.data() as any;
      
      // Verificar que el documento pertenece al usuario
      if (datos.userId !== userId) {
        console.warn('Intento de acceso a documento de otro usuario');
        return null;
      }

      // Convertir fechas de Firestore a formato local
      const documento = this.convertirDocumentoDesdeFirestore(datos);
      return documento;
    } catch (error) {
      console.error('Error al obtener documento de Firestore:', error);
      return null;
    }
  }

  /**
   * Obtener todos los documentos de un usuario
   */
  async obtenerDocumentosPorUsuario(userId: string): Promise<DocumentoGeneral[]> {
    try {
      const collectionRef = collection(this.db, this.COLLECTION_NAME);
      const q = query(collectionRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const documentos: DocumentoGeneral[] = [];

      querySnapshot.forEach((docSnap) => {
        const datos = docSnap.data() as any;
        const documento = this.convertirDocumentoDesdeFirestore(datos);
        documentos.push(documento);
      });

      console.log(`Documentos obtenidos de Firestore para usuario ${userId}:`, documentos.length);
      return documentos;
    } catch (error) {
      console.error('Error al obtener documentos de Firestore:', error);
      return [];
    }
  }

  /**
   * Actualizar un documento en Firestore
   */
  async actualizarDocumento(documento: DocumentoGeneral): Promise<void> {
    try {
      if (!documento.id || !documento.userId) {
        throw new Error('El documento debe tener ID y userId');
      }

      const docRef = doc(this.db, this.COLLECTION_NAME, documento.id);
      
      // Verificar que el documento existe y pertenece al usuario
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Documento no encontrado en Firestore');
      }

      const datos = docSnap.data() as any;
      if (datos.userId !== documento.userId) {
        throw new Error('No tienes permisos para actualizar este documento');
      }

      // Preparar el documento para Firestore
      const documentoParaFirestore = this.prepararDocumentoParaFirestore(documento);
      
      await setDoc(docRef, documentoParaFirestore, { merge: true });

      console.log('Documento actualizado en Firestore:', documento.id);
    } catch (error) {
      console.error('Error al actualizar documento en Firestore:', error);
      throw error;
    }
  }

  /**
   * Eliminar un documento de Firestore
   */
  async eliminarDocumento(id: string, userId: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      
      // Verificar que el documento existe y pertenece al usuario
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.warn('Documento no encontrado en Firestore para eliminar');
        return;
      }

      const datos = docSnap.data() as any;
      if (datos.userId !== userId) {
        throw new Error('No tienes permisos para eliminar este documento');
      }

      await deleteDoc(docRef);
      console.log('Documento eliminado de Firestore:', id);
    } catch (error) {
      console.error('Error al eliminar documento de Firestore:', error);
      throw error;
    }
  }

  /**
   * Sincronizar documento local con Firestore
   * Este método compara las fechas de actualización y toma la versión más reciente
   */
  async sincronizarDocumento(documentoLocal: DocumentoGeneral, documentoFirestore: DocumentoGeneral): Promise<DocumentoGeneral> {
    try {
      // Comparar fechas de actualización
      const fechaLocal = documentoLocal.fechaActualizacion || documentoLocal.fechaCreacion;
      const fechaFirestore = documentoFirestore.fechaActualizacion || documentoFirestore.fechaCreacion;

      if (!fechaLocal || !fechaFirestore) {
        // Si no hay fechas, priorizar Firestore
        return documentoFirestore;
      }

      // Comparar timestamps
      const timestampLocal = fechaLocal instanceof Date ? fechaLocal.getTime() : fechaLocal;
      const timestampFirestore = fechaFirestore instanceof Date ? fechaFirestore.getTime() : fechaFirestore;

      if (timestampLocal >= timestampFirestore) {
        // La versión local es más reciente, actualizar Firestore
        await this.actualizarDocumento(documentoLocal);
        return documentoLocal;
      } else {
        // La versión de Firestore es más reciente, actualizar local
        return documentoFirestore;
      }
    } catch (error) {
      console.error('Error al sincronizar documento:', error);
      // En caso de error, retornar la versión local
      return documentoLocal;
    }
  }

  /**
   * Preparar documento para guardar en Firestore
   * Convierte fechas Date a Timestamp de Firestore
   */
  private prepararDocumentoParaFirestore(documento: DocumentoGeneral): any {
    // Convertir fechas a formato compatible con Firestore
    let fechaCreacionFirestore: any = serverTimestamp();
    let fechaActualizacionFirestore: any = serverTimestamp();

    if (documento.fechaCreacion instanceof Date) {
      fechaCreacionFirestore = Timestamp.fromDate(documento.fechaCreacion);
    } else if (documento.fechaCreacion) {
      fechaCreacionFirestore = documento.fechaCreacion;
    }

    if (documento.fechaActualizacion instanceof Date) {
      fechaActualizacionFirestore = Timestamp.fromDate(documento.fechaActualizacion);
    } else if (documento.fechaActualizacion) {
      fechaActualizacionFirestore = documento.fechaActualizacion;
    }

    // Preparar objeto sin imagenPath (no se puede guardar la imagen en Firestore)
    const { imagenPath, ...datosSinImagen } = documento;

    return {
      ...datosSinImagen,
      fechaCreacion: fechaCreacionFirestore,
      fechaActualizacion: fechaActualizacionFirestore
    };
  }

  /**
   * Convertir documento desde Firestore
   * Convierte Timestamps de Firestore a Date
   */
  private convertirDocumentoDesdeFirestore(datos: any): DocumentoGeneral {
    return {
      ...datos,
      fechaCreacion: datos.fechaCreacion instanceof Timestamp 
        ? datos.fechaCreacion.toDate() 
        : datos.fechaCreacion,
      fechaActualizacion: datos.fechaActualizacion instanceof Timestamp 
        ? datos.fechaActualizacion.toDate() 
        : datos.fechaActualizacion
    } as DocumentoGeneral;
  }

  /**
   * Sincronizar todos los documentos de un usuario
   */
  async sincronizarTodosLosDocumentos(userId: string, documentosLocales: DocumentoGeneral[]): Promise<DocumentoGeneral[]> {
    try {
      console.log('Iniciando sincronización de documentos...');
      
      // Intentar obtener documentos de Firestore
      let documentosFirestore: DocumentoGeneral[] = [];
      try {
        documentosFirestore = await this.obtenerDocumentosPorUsuario(userId);
      } catch (error) {
        console.warn('No se pudieron obtener documentos de Firestore, usando solo locales:', error);
        return documentosLocales;
      }

      const documentosSincronizados: DocumentoGeneral[] = [];

      // Crear mapas para búsqueda rápida
      const mapaLocal = new Map<string, DocumentoGeneral>();
      documentosLocales.forEach(doc => {
        if (doc.id) {
          mapaLocal.set(doc.id, doc);
        }
      });

      const mapaFirestore = new Map<string, DocumentoGeneral>();
      documentosFirestore.forEach(doc => {
        if (doc.id) {
          mapaFirestore.set(doc.id, doc);
        }
      });

      // Agregar todos los documentos locales (ya que es la fuente principal)
      mapaLocal.forEach((docLocal, id) => {
        // Si existe en Firestore, usar la versión más reciente
        const docFirestore = mapaFirestore.get(id);
        if (docFirestore) {
          // Comparar fechas de actualización
          const fechaLocal = docLocal.fechaActualizacion || docLocal.fechaCreacion;
          const fechaFirestore = docFirestore.fechaActualizacion || docFirestore.fechaCreacion;
          
          if (fechaLocal && fechaFirestore) {
            const tiempoLocal = fechaLocal instanceof Date ? fechaLocal.getTime() : new Date(fechaLocal as any).getTime();
            const tiempoFirestore = fechaFirestore instanceof Date ? fechaFirestore.getTime() : new Date(fechaFirestore as any).getTime();
            
            if (tiempoLocal >= tiempoFirestore) {
              documentosSincronizados.push(docLocal);
              // Actualizar en Firestore si la versión local es más reciente
              this.guardarDocumento(docLocal).catch(err => 
                console.error('Error al actualizar documento en Firestore:', err)
              );
            } else {
              documentosSincronizados.push(docFirestore);
            }
          } else {
            // Si no hay fechas, priorizar local
            documentosSincronizados.push(docLocal);
          }
        } else {
          // No existe en Firestore, agregarlo
          documentosSincronizados.push(docLocal);
          this.guardarDocumento(docLocal).catch(err => 
            console.error('Error al agregar documento en Firestore:', err)
          );
        }
      });

      // Agregar documentos que solo existen en Firestore
      mapaFirestore.forEach((docFirestore, id) => {
        if (!mapaLocal.has(id)) {
          documentosSincronizados.push(docFirestore);
        }
      });

      console.log('Sincronización completada. Documentos sincronizados:', documentosSincronizados.length);
      return documentosSincronizados;
    } catch (error) {
      console.error('Error al sincronizar documentos:', error);
      return documentosLocales;
    }
  }
}

