# Sistema de Notificaciones Push - DOCU

## Descripción

Se ha implementado un sistema completo de notificaciones push locales para la aplicación DOCU que avisa automáticamente cuando los documentos están por vencer dentro de una semana.

## Funcionalidades Implementadas

### 1. Notificaciones Programadas
- Las notificaciones se programan automáticamente **7 días antes** de la fecha de expiración del documento
- Cuando se guarda un nuevo documento con fecha de expiración, se crea una notificación automáticamente
- Cuando se elimina un documento, su notificación también se cancela automáticamente
- Cuando se actualiza un documento, su notificación se reprograma con la nueva fecha

### 2. Servicio de Notificaciones (`NotificationService`)

El servicio proporciona las siguientes funcionalidades:

#### Métodos principales:

```typescript
// Inicializar el servicio de notificaciones
async inicializar(): Promise<void>

// Solicitar permisos para enviar notificaciones
async solicitarPermisos(): Promise<boolean>

// Programar una notificación para un documento
async programarNotificacionParaDocumento(documento: DocumentoGeneral): Promise<void>

// Cancelar notificación de un documento específico
async cancelarNotificacionDocumento(documentoId: string): Promise<void>

// Verificar y programar notificaciones para todos los documentos
async verificarYProgramarNotificaciones(): Promise<void>

// Obtener documentos próximos a vencer
async verificarDocumentosProximosAVencer(diasAntes: number = 7): Promise<DocumentoGeneral[]>

// Cancelar todas las notificaciones
async cancelarTodasLasNotificaciones(): Promise<void>
```

## Componentes Modificados

### 1. `src/app/services/notification.service.ts` (NUEVO)
- Servicio principal para gestionar notificaciones push locales
- Utiliza el plugin `@capacitor/local-notifications`

### 2. `src/app/services/document-storage.service.ts` (ACTUALIZADO)
- Integración automática con el servicio de notificaciones
- Programación de notificaciones al guardar documentos
- Cancelación de notificaciones al eliminar documentos
- Reprogramación al actualizar documentos

### 3. `src/app/app.component.ts` (ACTUALIZADO)
- Inicializa el servicio de notificaciones al arrancar la aplicación

### 4. `capacitor.config.ts` (ACTUALIZADO)
- Configuración del plugin de notificaciones locales

### 5. `android/app/src/main/AndroidManifest.xml` (ACTUALIZADO)
- Permisos de notificaciones:
  - `POST_NOTIFICATIONS` - Permiso para enviar notificaciones
  - `SCHEDULE_EXACT_ALARM` - Permiso para alarmas exactas
  - `USE_EXACT_ALARM` - Permiso para usar alarmas exactas

## Instalación y Configuración

### Dependencias Instaladas

```json
{
  "@capacitor/local-notifications": "^7.0.3"
}
```

### Comandos Ejecutados

```bash
# Instalar el plugin
npm install @capacitor/local-notifications

# Sincronizar con Capacitor
npx cap sync
```

## Funcionamiento

### Flujo de Notificaciones

1. **Al guardar un documento**:
   - Se extrae la fecha de expiración
   - Se calcula la fecha de notificación (7 días antes)
   - Se programa la notificación
   - Si la fecha ya pasó, no se programa

2. **Al actualizar un documento**:
   - Se cancela la notificación anterior
   - Se programa una nueva notificación con la fecha actualizada

3. **Al eliminar un documento**:
   - Se cancela la notificación asociada

4. **Al abrir la aplicación**:
   - Se verifica automáticamente si hay documentos próximos a vencer
   - Se reprograman notificaciones si es necesario

### Formato de Fechas

Las fechas se manejan en formato `DD/MM/YYYY` (ejemplo: `25/12/2024`)

El servicio convierte automáticamente este formato a objetos `Date` de JavaScript para los cálculos.

## Estructura de Notificaciones

### ID de Notificación

Las notificaciones usan un ID único basado en el ID del documento usando un algoritmo de hash para evitar colisiones.

### Contenido de la Notificación

- **Título**: "⚠️ Documento por Vencer"
- **Mensaje**: Incluye el nombre del documento y la fecha de expiración
- **Sonido**: beep.wav
- **Datos adicionales**: 
  - `documentoId`: ID del documento
  - `fechaExpiracion`: Fecha de expiración

## Pruebas y Validación

### Probar el Sistema

1. **Crear un documento con fecha de expiración futura**:
   - La notificación debería programarse automáticamente

2. **Modificar la fecha de expiración**:
   - La notificación debería reprogramarse

3. **Eliminar un documento**:
   - La notificación debería cancelarse

### Ver Notificaciones Programadas

Puedes obtener la lista de notificaciones programadas usando:

```typescript
const notificaciones = await notificationService.obtenerNotificacionesProgramadas();
console.log('Notificaciones programadas:', notificaciones);
```

### Ver Documentos Próximos a Vencer

```typescript
const documentos = await notificationService.verificarDocumentosProximosAVencer(7);
console.log('Documentos próximos a vencer:', documentos);
```

## Consideraciones

### Permisos en Android

Desde Android 13 (API 33), se requiere el permiso `POST_NOTIFICATIONS` que se debe solicitar al usuario en tiempo de ejecución. El servicio gestiona esto automáticamente.

### Notificaciones en Background

- Las notificaciones locales funcionan incluso cuando la aplicación está cerrada
- No requiere conexión a internet
- Funciona offline completamente

### Rendimiento

- Las notificaciones se programan de forma asíncrona para no bloquear la UI
- El hash del ID de documento es rápido y determinista
- La verificación periódica se ejecuta solo cuando la app está activa

## Expansiones Futuras

Posibles mejoras al sistema:

1. **Notificaciones personalizables**: Permitir al usuario configurar cuántos días antes recibir notificaciones
2. **Múltiples recordatorios**: Notificaciones a los 30, 7 y 1 día antes
3. **Notificaciones por tipo de documento**: Diferenciar estilos según el tipo
4. **Historial de notificaciones**: Guardar qué notificaciones se han enviado
5. **Notificaciones en la app**: Badges o contadores de documentos próximos a vencer

## Soporte

Para problemas o preguntas relacionadas con el sistema de notificaciones:

1. Verificar permisos en configuración de la aplicación
2. Revisar logs de consola para errores del servicio
3. Verificar que las fechas de expiración estén en formato válido

---

**Última actualización**: $(date)
**Versión del plugin**: @capacitor/local-notifications@7.0.3

