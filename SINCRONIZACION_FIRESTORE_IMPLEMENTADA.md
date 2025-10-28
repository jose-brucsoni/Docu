# Implementación de Sincronización con Firebase Firestore

## Resumen

Se ha implementado un sistema completo de sincronización bidireccional entre el almacenamiento local y Firebase Firestore Database para los documentos de los usuarios.

## Archivos Creados

### 1. `src/app/services/document-firestore.service.ts`
Nuevo servicio encargado de manejar todas las operaciones con Firebase Firestore.

**Funcionalidades principales:**
- `guardarDocumento()`: Guarda un documento en Firestore
- `obtenerDocumento()`: Obtiene un documento por ID y userId
- `obtenerDocumentosPorUsuario()`: Obtiene todos los documentos de un usuario
- `actualizarDocumento()`: Actualiza un documento en Firestore
- `eliminarDocumento()`: Elimina un documento de Firestore
- `sincronizarTodosLosDocumentos()`: Sincroniza todos los documentos entre local y Firestore

## Archivos Modificados

### 2. `src/app/services/document-storage.service.ts`
Modificado para integrar la sincronización con Firestore en todas las operaciones de almacenamiento.

**Cambios realizados:**
- Se agregó dependencia de `DocumentFirestoreService`
- Método `guardarDocumento()`: Ahora sincroniza con Firestore después de guardar localmente
- Método `actualizarDocumento()`: Ahora actualiza también en Firestore
- Método `eliminarDocumento()`: Ahora elimina también de Firestore
- Nuevo método `sincronizarDocumentosConFirestore()`: Sincroniza todos los documentos

### 3. `src/app/pages/menu-principal/menu-principal.page.ts`
Modificado para sincronizar documentos al cargar la página.

**Cambios realizados:**
- En `cargarDocumentos()`: Se llama a `sincronizarDocumentosConFirestore()` antes de cargar documentos locales

## Flujo de Sincronización

### 1. Guardar Documento
```
Usuario guarda documento
    ↓
Guardar en almacenamiento local (Preferences + Filesystem para imagen)
    ↓
Sincronizar con Firestore (metadata sin imagen)
    ↓
Si Firestore falla, solo se guarda localmente (modo offline)
```

### 2. Actualizar Documento
```
Usuario actualiza documento
    ↓
Actualizar en almacenamiento local
    ↓
Actualizar en Firestore
    ↓
Si Firestore falla, solo se actualiza localmente
```

### 3. Eliminar Documento
```
Usuario elimina documento
    ↓
Eliminar imagen del Filesystem
    ↓
Eliminar de almacenamiento local
    ↓
Eliminar de Firestore
    ↓
Si Firestore falla, solo se elimina localmente
```

### 4. Cargar Documentos (Sincronización)
```
Usuario abre menú principal
    ↓
Obtener documentos de Firestore
    ↓
Comparar con documentos locales
    ↓
Usar versión más reciente (comparando fechaActualizacion)
    ↓
Actualizar Firestore con documentos locales que no existen en Firestore
    ↓
Agregar documentos de Firestore que no existen localmente
    ↓
Guardar resultado sincronizado en almacenamiento local
    ↓
Mostrar documentos al usuario
```

## Estructura de Datos en Firestore

### Colección: `documents`
Los documentos se guardan con la siguiente estructura:

```javascript
{
  id: string,              // ID único del documento
  userId: string,          // ID del usuario propietario
  nombre: string,           // Nombre del documento
  fechaEmision: string,     // DD/MM/YYYY
  fechaExpiracion: string,  // DD/MM/YYYY
  tipoDocumento: string,     // 'Cedula de identidad' | 'Licencia de Conducir' | 'Otros'
  numeroDocumento: string,
  nombres: string,
  apellidos: string,
  fechaNacimiento: string,  // DD/MM/YYYY
  lugarNacimiento: string,
  domicilio: string,
  estadoCivil: string,
  grupoSanguineo: string,
  profesion: string,
  // imagenPath: NO se guarda (se mantiene solo localmente)
  fechaCreacion: Timestamp,
  fechaActualizacion: Timestamp
}
```

## Características de Sincronización

### Sincronización Bidireccional
- Los documentos se sincronizan automáticamente entre local y Firestore
- Si se agrega localmente, se agrega en Firestore
- Si se elimina localmente, se elimina en Firestore
- Si Firestore falla, la operación local se completa exitosamente (modo offline)

### Resolución de Conflictos
- Se usa `fechaActualizacion` para determinar la versión más reciente
- Si hay conflicto, se prioriza la versión local
- Los documentos en Firestore que no existen localmente se descargan

### Modo Offline
- El sistema funciona completamente offline
- Los documentos se guardan localmente incluso si Firestore falla
- Las operaciones fallan de forma silenciosa para Firestore
- Al reconectar, los documentos se sincronizan automáticamente

## Configuración de Firebase

Firebase ya está configurado con:
- **Proyecto:** docu-8dce5
- **Firestore:** Configurado y disponible
- **Autenticación:** Ya funcionando

No se requiere configuración adicional en Firebase Console.

## Seguridad

### Reglas de Firestore
Se recomienda implementar reglas de seguridad en Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para documentos
    match /documents/{documentId} {
      // Solo el propietario puede leer y escribir
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
      
      // El propietario puede crear su propio documento
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Ventajas de la Implementación

1. **Sincronización Automática:** Los documentos se sincronizan automáticamente
2. **Modo Offline:** Funciona completamente sin conexión
3. **Resolución de Conflictos:** Usa timestamps para decidir la versión más reciente
4. **Tolerante a Fallos:** Las operaciones no fallan por errores de Firestore
5. **Seguridad por Usuario:** Cada usuario solo puede acceder a sus documentos

## Notas Importantes

1. **Imágenes:** Las imágenes se guardan solo localmente (en Filesystem). Las rutas de imagen no se sincronizan con Firestore.
2. **Fechas:** Las fechas se convierten automáticamente entre formatos Date (local) y Timestamp (Firestore)
3. **IDs:** Se usan IDs únicos generados localmente para evitar conflictos
4. **Logs:** Todas las operaciones se registran en consola para debugging

## Uso

La sincronización funciona automáticamente:
1. Al abrir el menú principal, los documentos se sincronizan
2. Al guardar/actualizar/eliminar, se sincroniza con Firestore
3. No se requiere acción manual del usuario

## Próximos Pasos (Opcional)

1. **Implementar Firebase Storage:** Para sincronizar las imágenes también
2. **Notificaciones Push:** Notificar al usuario cuando se complete la sincronización
3. **Indicador de Sincronización:** Mostrar estado de sincronización en la UI
4. **Sincronización Manual:** Botón para forzar sincronización

