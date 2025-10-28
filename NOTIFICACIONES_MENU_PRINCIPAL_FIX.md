# ✅ Corrección: Notificaciones en Menu Principal

## Problema Identificado

Las notificaciones no se mostraban correctamente en el menú principal porque el servicio de notificaciones no estaba siendo inicializado ni verificado en esa página.

## Causa del Problema

1. `NotificationService` no estaba siendo importado ni inyectado en `menu-principal.page.ts`
2. No se estaba verificando ni programando notificaciones al entrar al menú principal
3. El servicio solo se inicializaba en `app.component.ts` pero no se revisaban documentos pendientes al abrir el menú

## Solución Implementada

### Cambios Realizados en `menu-principal.page.ts`

#### 1. Importar el servicio
```typescript
import { NotificationService } from '../../services/notification.service';
```

#### 2. Inyectar el servicio en el constructor
```typescript
constructor(
  private router: Router,
  private documentStorageService: DocumentStorageService,
  private notificationService: NotificationService  // ✅ NUEVO
) {
```

#### 3. Inicializar notificaciones en ngOnInit
```typescript
async ngOnInit() {
  // Inicializar y verificar notificaciones
  await this.inicializarNotificaciones();  // ✅ NUEVO
  
  await this.cargarDocumentos();
  this.calcularEstadisticas();
  this.totalPaginas = Math.ceil(this.documentos.length / this.documentosPorPagina);
}
```

#### 4. Nueva función para inicializar notificaciones
```typescript
/**
 * Inicializar y verificar notificaciones para documentos próximos a vencer
 */
async inicializarNotificaciones() {
  try {
    console.log('Inicializando notificaciones en menu-principal...');
    
    // Verificar permisos
    const tienePermisos = await this.notificationService.solicitarPermisos();
    
    if (!tienePermisos) {
      console.warn('Permisos de notificación no concedidos');
      return;
    }
    
    // Verificar y programar notificaciones para todos los documentos
    await this.notificationService.verificarYProgramarNotificaciones();
    
    // Obtener y mostrar documentos próximos a vencer
    const documentosProximos = await this.notificationService.verificarDocumentosProximosAVencer(7);
    console.log('Documentos próximos a vencer (7 días):', documentosProximos.length);
    
    if (documentosProximos.length > 0) {
      console.log('Documentos próximos a vencer:', documentosProximos);
    }
  } catch (error) {
    console.error('Error inicializando notificaciones:', error);
  }
}
```

## Beneficios

✅ **Notificaciones verificadas al abrir el menú**: Cada vez que se entra al menú principal, se verifican y reprograman las notificaciones

✅ **Documentos próximos a vencer detectados**: El sistema detecta automáticamente documentos que vencen en 7 días

✅ **Permisos gestionados correctamente**: Se solicitan permisos si no están concedidos

✅ **Logs informativos**: Se registran en consola los documentos próximos a vencer

## Flujo Ahora Corregido

1. **Usuario abre la aplicación** → `app.component.ts` inicializa el servicio
2. **Usuario navega al menú principal** → Se verifican y reprograman notificaciones
3. **Sistema detecta documentos próximos a vencer** → Programa notificaciones push
4. **Notificaciones se envían 7 días antes** → Alarma local del dispositivo

## Pruebas Recomendadas

1. **Crear un documento** con fecha de expiración en 8 días (mañana)
2. **Abrir el menú principal** y verificar en consola que se programe la notificación
3. **Verificar permisos** en configuración de Android
4. **Esperar** hasta que llegue la notificación

## Archivos Modificados

- ✅ `src/app/pages/menu-principal/menu-principal.page.ts` - Inicialización de notificaciones

---

**Fecha de corrección**: $(date)
**Estado**: ✅ Corregido

