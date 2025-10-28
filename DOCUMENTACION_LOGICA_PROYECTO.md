# 📄 DOCU - Documentación Completa de la Lógica del Proyecto

## 📋 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Modelos de Datos](#modelos-de-datos)
4. [Servicios y Lógica de Negocio](#servicios-y-lógica-de-negocio)
5. [Páginas y Flujos de Usuario](#páginas-y-flujos-de-usuario)
6. [Funcionalidades Principales](#funcionalidades-principales)
7. [Tecnologías Utilizadas](#tecnologías-utilizadas)

---

## 📖 Descripción General

**DOCU** es una aplicación móvil híbrida diseñada para gestionar documentos físicos y digitales. La aplicación permite a los usuarios:

- **Escanear documentos** usando la cámara del dispositivo
- **Aplicar OCR (Reconocimiento Óptico de Caracteres)** para extraer información automáticamente
- **Detectar fechas de expiración** de documentos automáticamente
- **Gestionar documentos** con clasificación por tipo
- **Recibir notificaciones** cuando los documentos están próximos a vencer
- **Sincronizar datos** entre almacenamiento local y Firebase Firestore
- **Organizar y buscar** documentos de forma eficiente

### Características Principales
- ✅ Autenticación de usuarios con Firebase
- ✅ Captura de imágenes con cámara
- ✅ OCR con Tesseract.js
- ✅ Detección inteligente de fechas
- ✅ Almacenamiento local con Capacitor Preferences
- ✅ Sincronización con Firebase Firestore
- ✅ Notificaciones locales programadas
- ✅ Interfaz moderna con Ionic + Angular

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
src/app/
├── models/                    # Modelos de datos
│   ├── documento-general.model.ts
│   └── usuario.model.ts
├── services/                  # Servicios de lógica de negocio
│   ├── login.ts
│   ├── registro-u.ts
│   ├── capture-io.ts
│   ├── document-firestore.service.ts
│   ├── document-storage.service.ts
│   └── notification.service.ts
├── pages/                     # Páginas de la aplicación
│   ├── login/
│   ├── registro-usuario/
│   ├── menu-principal/
│   ├── capture/
│   └── gestion-docu/
├── core/                      # Código central
│   └── auth-guard.ts
└── utils/                     # Utilidades
    └── date-detector.ts
```

### Patrón de Arquitectura
El proyecto sigue una **arquitectura MVC (Model-View-Controller)**:

- **Model**: Interfaces TypeScript en `models/`
- **View**: Templates HTML en `pages/`
- **Controller**: Components TypeScript en `pages/` y servicios en `services/`

---

## 📊 Modelos de Datos

### 1. DocumentoGeneral

```typescript
interface DocumentoGeneral {
  id?: string;                    // ID único del documento
  userId?: string;                // ID del usuario propietario
  nombre?: string;               // Nombre del documento
  fechaEmision: string;          // Fecha de emisión
  fechaExpiracion: string;       // Fecha de vencimiento
  tipoDocumento: TipoDocumento;   // Tipo: 'Cedula...' | 'Licencia...' | 'Otros'
  numeroDocumento?: string;      // Número de documento
  nombres?: string;              // Nombres de la persona
  apellidos?: string;           // Apellidos
  fechaNacimiento?: string;      // Fecha de nacimiento
  lugarNacimiento?: string;      // Lugar de nacimiento
  domicilio?: string;            // Domicilio
  estadoCivil?: string;          // Estado civil
  grupoSanguineo?: string;      // Grupo sanguíneo
  profesion?: string;           // Profesión
  imagenPath?: string;          // Ruta de la imagen guardada
  fechaCreacion?: Date;         // Fecha de creación
  fechaActualizacion?: Date;    // Fecha de última actualización
}
```

**Características principales:**
- Cada documento está asociado a un usuario (`userId`)
- Se almacena la ruta de la imagen, no la imagen completa
- Soporta metadatos amplios para diferentes tipos de documentos

### 2. Usuario

```typescript
interface Usuario {
  id: string;           // UID de Firebase Auth
  nombre: string;
  apellido: string;
  email: string;
  creadoEn: any;        // serverTimestamp()
  actualizadoEn: any;   // serverTimestamp()
}
```

### 3. TipoDocumento

```typescript
type TipoDocumento = 'Cedula de identidad' | 'Licencia de Conducir' | 'Otros';
```

---

## 🔧 Servicios y Lógica de Negocio

### 1. Login Service (`login.ts`)

**Responsabilidad**: Manejo de autenticación de usuarios con Firebase

**Funciones principales:**
- `loginEmail(email, password)`: Inicio de sesión con email
- `registerEmail(email, password)`: Registro de nuevos usuarios
- `logout()`: Cerrar sesión
- `resetPassword(email)`: Recuperar contraseña
- `user$`: Observable del estado de autenticación
- `userDoc$`: Observable del perfil en Firestore

**Flujo de autenticación:**
1. Usuario ingresa credenciales
2. Se valida con Firebase Auth
3. Se crea/actualiza perfil en Firestore
4. Se guarda estado de sesión
5. Guard de rutas protege rutas privadas

### 2. RegistroUService (`registro-u.ts`)

**Responsabilidad**: Registro de nuevos usuarios

**Flujo:**
1. Crear usuario en Firebase Auth
2. Actualizar `displayName` en Auth
3. Crear registro en Firestore (`users/{uid}`)
4. Redirigir a login

### 3. CaptureOcrService (`capture-io.ts`)

**Responsabilidad**: Captura de imágenes y procesamiento OCR

**Funciones principales:**
- `pickFromGallery()`: Importar imagen desde galería
- `captureWithCamera()`: Capturar desde cámara
- `runOcrFromDataUrl(dataUrl)`: Procesar OCR con Tesseract.js
- `createPdfFromDataUrl(dataUrl)`: Convertir imagen a PDF
- `savePdf(bytes, fileName)`: Guardar PDF localmente

**Configuración OCR:**
- Idioma: Español (`spa`)
- Filtrado de caracteres permitidos
- Modo de segmentación ajustado
- Procesamiento optimizado para móvil

### 4. DocumentFirestoreService (`document-firestore.service.ts`)

**Responsabilidad**: Sincronización de documentos con Firebase Firestore

**Funciones principales:**
- `guardarDocumento(documento)`: Guardar en Firestore
- `obtenerDocumento(id, userId)`: Obtener documento específico
- `obtenerDocumentosPorUsuario(userId)`: Listar documentos del usuario
- `actualizarDocumento(documento)`: Actualizar documento
- `eliminarDocumento(id, userId)`: Eliminar documento
- `sincronizarTodosLosDocumentos(userId, locales)`: Sincronizar local con remoto

**Estrategia de sincronización:**
1. Compara `fechaActualizacion` entre local y remoto
2. Versión más reciente toma precedencia
3. Previene conflictos de datos

### 5. DocumentStorageService (`document-storage.service.ts`)

**Responsabilidad**: Gestión de almacenamiento local de documentos

**Funciones principales:**
- `guardarDocumento(documento, imagenDataUrl)`: Guardar documento completo
- `obtenerDocumentosPorUsuario(userId)`: Obtener documentos del usuario
- `obtenerImagenDocumento(imagenPath)`: Cargar imagen guardada
- `eliminarDocumento(id, userId)`: Eliminar documento e imagen
- `actualizarDocumento(documento)`: Actualizar existente
- `sincronizarDocumentosConFirestore(userId)`: Sincronizar con nube

**Almacenamiento:**
- **Metadatos**: Capacitor Preferences (almacenamiento clave-valor)
- **Imágenes**: Capacitor Filesystem (directorio de datos)
- **Estructura**: `docu/images/{documentoId}.jpg`

**Flujo de guardado:**
1. Generar ID único para documento
2. Guardar imagen en Filesystem
3. Guardar metadatos en Preferences
4. Sincronizar con Firestore (paralelo)
5. Programar notificación si tiene fecha de expiración

### 6. NotificationService (`notification.service.ts`)

**Responsabilidad**: Gestión de notificaciones locales

**Funciones principales:**
- `inicializar()`: Inicializar servicio de notificaciones
- `solicitarPermisos()`: Solicitar permisos de notificaciones
- `programarNotificacionParaDocumento(documento)`: Programar notificación
- `cancelarNotificacionDocumento(documentoId)`: Cancelar notificación
- `verificarYProgramarNotificaciones()`: Verificar todos los documentos

**Lógica de notificaciones:**
- Se programan 7 días antes de la fecha de expiración
- Cada documento tiene un ID de notificación único
- Se pueden cancelar al actualizar o eliminar documentos

---

## 📱 Páginas y Flujos de Usuario

### 1. Login Page

**Archivo**: `src/app/pages/login/login.page.ts`

**Responsabilidad**: Autenticación de usuarios existentes

**Características:**
- Formulario reactivo con validaciones
- Login con email/password
- Recuperación de contraseña
- Manejo de errores personalizado
- Redirección a menú principal al iniciar sesión

**Flujo:**
```
Login → Validación → Firebase Auth → Menú Principal
```

### 2. Registro Usuario Page

**Archivo**: `src/app/pages/registro-usuario/registro-usuario.page.ts`

**Responsabilidad**: Registro de nuevos usuarios

**Características:**
- Formulario con nombre, apellido, email, password
- Validaciones de formulario
- Indicador de contraseña visible/oculta
- Redirección a login después del registro

### 3. Menu Principal Page

**Archivo**: `src/app/pages/menu-principal/menu-principal.page.ts`

**Responsabilidad**: Dashboard principal con lista de documentos

**Características:**
- Vista de documentos en grid o lista
- Estadísticas (total, activos, por vencer, vencidos)
- Filtros por categoría y estado
- Búsqueda por nombre
- Ordenamiento por nombre, fecha, categoría
- Paginación
- Pull-to-refresh para sincronizar

**Funcionalidades clave:**
- Carga documentos del usuario autenticado
- Sincroniza con Firestore al iniciar
- Calcula estados (activo, por vencer, vencido) basado en fechas
- Permite agregar, editar, ver, eliminar documentos
- Cerrar sesión

### 4. Capture Page

**Archivo**: `src/app/pages/capture/capture.page.ts`

**Responsabilidad**: Captura de imágenes y OCR básico

**Características:**
- Importar desde galería
- Capturar con cámara
- Procesar OCR con Tesseract
- Extraer fechas del texto
- Guardar como PDF

### 5. Gestión Documento Page

**Archivo**: `src/app/pages/gestion-docu/gestion-docu.page.ts`

**Responsabilidad**: Captura y gestión completa de documentos

**Funciones principales:**
- Captura con cámara
- Procesamiento OCR avanzado
- Extracción automática de fechas
- Extracción de datos del documento (nombres, apellidos, etc.)
- Edición de documentos existentes
- Guardado con validaciones

**Flujo de captura:**
```
1. Seleccionar tipo de documento
2. Capturar imagen
3. Procesar OCR
4. Extraer fechas automáticamente
5. Mostrar formulario con datos extraídos
6. Usuario edita/confirma datos
7. Guardar documento
```

**Modo edición:**
- Carga documento existente por ID
- Muestra imagen y datos actuales
- Permite modificar información
- Actualiza documento en almacenamiento

---

## 🎯 Funcionalidades Principales

### 1. OCR con Detección de Fechas

**Utilidad**: `src/app/utils/date-detector.ts`

**Funciones:**
- `extractExpiryDates(text)`: Extrae todas las fechas del texto
- `pickBestExpiryDate(text, dates)`: Selecciona la mejor fecha de expiración

**Algoritmo de selección:**
1. Busca palabras clave cercanas a fechas (expira, vence, caduca)
2. Prioriza fechas futuras
3. Prioriza fechas cercanas (próximos meses)
4. Penaliza fechas pasadas muy antiguas
5. Bonus por formato estructurado (con separadores)

**Soporte de formatos:**
- DD/MM/YYYY
- DD-MM-YYYY
- DD.MM.YYYY
- MM/DD/YYYY
- Nombres de meses en español
- Fechas con texto: "15 de enero de 2024"

### 2. Sincronización de Datos

**Estrategia de dos capas:**

**Capa 1: Local (Capa principal)**
- Almacena metadatos en Capacitor Preferences
- Almacena imágenes en Capacitor Filesystem
- Disponible sin conexión
- Síncrono y rápido

**Capa 2: Firestore (Backup y multi-dispositivo)**
- Sincroniza metadatos con Firestore
- No sincroniza imágenes (se mantienen localmente)
- Facilita acceso desde múltiples dispositivos
- Funciona como backup

**Flujo de sincronización:**
1. Al guardar: Local primero, luego Firestore
- Al cargar: Local primero, luego sincronizar con Firestore
- Resolución de conflictos: La versión más reciente prevalece

### 3. Notificaciones Inteligentes

**Cómo funciona:**
1. Al guardar documento con fecha de expiración
2. Calcular fecha de notificación (7 días antes)
3. Programar notificación local
4. Si se edita la fecha, reprogramar
5. Si se elimina documento, cancelar notificación

**Características:**
- Solo se programan para fechas futuras
- Validación de permisos antes de programar
- ID único para evitar duplicados
- Sonido personalizado

### 4. Extracción de Datos del Documento

**Campos extraídos automáticamente:**
- Número de documento
- Nombres y apellidos
- Fecha de nacimiento
- Fecha de emisión
- Fecha de expiración
- Domicilio
- Estado civil
- Grupo sanguíneo
- Profesión

**Utiliza regex y OCR con:**
- Post-procesamiento para corregir errores comunes
- Detección contextual (reconocer si un carácter es O o 0)
- Normalización de texto
- Validación de formatos

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Ionic 8**: Framework móvil con componentes UI
- **Angular 20**: Framework web para lógica y estructura
- **TypeScript**: Lenguaje de programación
- **Capacitor 7**: Puente nativo-móvil

### Backend/Cloud
- **Firebase Authentication**: Autenticación de usuarios
- **Firebase Firestore**: Base de datos en tiempo real
- **Firebase Rules**: Seguridad de datos

### Almacenamiento Local
- **Capacitor Preferences**: Almacenamiento clave-valor
- **Capacitor Filesystem**: Sistema de archivos
- **Capacitor Camera**: Acceso a cámara

### OCR y Procesamiento
- **Tesseract.js**: Motor de OCR (JavaScript)
- **pdf-lib**: Generación de PDFs

### Notificaciones
- **Capacitor Local Notifications**: Notificaciones locales programadas

### Rutas y Navegación
- **Angular Router**: Sistema de navegación
- **AuthGuard**: Protección de rutas

---

## 🔐 Seguridad

### Protección de Datos
1. **Autenticación obligatoria**: Guard protector en rutas privadas
2. **Separación de usuarios**: Cada documento tiene `userId`
3. **Validación de permisos**: No se puede acceder a documentos de otros usuarios
4. **Imágenes locales**: No se suben a Firestore (tamaño)

### Seguridad en Firestore
- Rules configuradas para solo permitir acceso a propios documentos
- Validación de `userId` en todos los queries
- Uso de `serverTimestamp()` para consistencia de fechas

---

## 📈 Flujos Principales

### Flujo de Registro
```
Usuario → Registro → Firebase Auth → Perfil Firestore → Login
```

### Flujo de Captura de Documento
```
Usuario → Seleccionar tipo → Capturar imagen → OCR → Extraer datos → 
Editar/confirmar → Guardar (local + Firestore) → Programar notificación
```

### Flujo de Sincronización
```
Al iniciar → Obtener locales → Obtener Firestore → Comparar versiones → 
Tomar más reciente → Actualizar si necesario
```

### Flujo de Notificaciones
```
Al guardar → Verificar fecha expiración → Calcular 7 días antes → 
Programar notificación → Usuario recibe alerta
```

---

## 🎨 Interfaz de Usuario

### Componentes Principales
- **IonContent**: Contenedor principal
- **IonButton**: Botones de acción
- **IonCard**: Tarjetas de documentos
- **IonSearchbar**: Búsqueda de documentos
- **IonRefresher**: Pull-to-refresh
- **IonFab**: Botón flotante de acción rápida
- **IonAlert**: Alertas de confirmación

### Temas y Estilos
- **Material Design**: Inspiración en diseño Material
- **Ionicons**: Biblioteca de iconos
- **CSS personalizado**: Estilos específicos por página

---

## 📝 Notas de Desarrollo

### Optimizaciones Implementadas
1. **Lazy Loading**: Componentes cargados bajo demanda
2. **Preprocesamiento de imágenes**: Redimensionado para mejor OCR
3. **Post-procesamiento de texto**: Corrección de errores comunes de OCR
4. **Caching de documentos**: Reducción de lecturas de almacenamiento
5. **Manejo de errores**: Mensajes descriptivos para el usuario

### Mejoras Futuras Sugeridas
1. Sincronización de imágenes con Firebase Storage
2. Búsqueda por contenido extraído (OCR)
3. Exportar documentos como PDF
4. Compartir documentos con otros usuarios
5. Categorías personalizadas
6. Etiquetas/tags para documentos
7. Modo oscuro
8. Soporte multi-idioma

---

## 🚀 Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# Compilar para producción
npm run build

# Ejecutar en Android
npm run android:live:bash
```

---

## 📚 Archivos de Documentación Existentes

El proyecto incluye documentación adicional en archivos markdown:
- `CAMBIOS_APLICADOS.md`
- `GUARDADO_LOCAL_IMPLEMENTADO.md`
- `MEJORAS_RECONOCIMIENTO.md`
- `MENU_PRINCIPAL_ACTUALIZADO.md`
- `NOTIFICACIONES_IMPLEMENTADO.md`
- `SEPARACION_DOCUMENTOS_POR_USUARIO.md`
- `SINCRONIZACION_FIRESTORE_IMPLEMENTADA.md`
- `SISTEMA_NOTIFICACIONES.md`

---

## 💬 Comentarios y Documentación del Código

### Estado de Documentación

Todos los servicios en `src/app/services/` están completamente documentados con comentarios JSDoc en español:

- ✅ **login.ts**: Comentarios detallados en todas las funciones de autenticación
- ✅ **registro-u.ts**: Documentación completa del proceso de registro
- ✅ **capture-io.ts**: Comentarios explicativos en funciones de captura y OCR
- ✅ **document-firestore.service.ts**: Ya tenía comentarios detallados
- ✅ **document-storage.service.ts**: Ya tenía comentarios detallados
- ✅ **notification.service.ts**: Comentarios añadidos a todas las funciones

### Formato de Comentarios

Los comentarios siguen el estándar **JSDoc** con:
- Descripción de la función
- `@param` para parámetros
- `@returns` para valores de retorno
- `@throws` para errores posibles
- `@description` para explicaciones detalladas
- `@private` para métodos privados

### Ejemplo de Comentario

```typescript
/**
 * Procesa una imagen con OCR usando Tesseract.js
 * @param dataUrl - Imagen en formato Data URL
 * @returns Texto extraído de la imagen
 * @throws Error si hay problemas con el procesamiento OCR
 * @description
 * Esta función:
 * 1. Inicializa el worker de Tesseract con idioma español
 * 2. Configura parámetros optimizados para móviles
 * 3. Procesa la imagen y extrae el texto
 * 4. Retorna el texto procesado
 */
async runOcrFromDataUrl(dataUrl: string): Promise<string> {
  // ... código ...
}
```

---

**Autor**: José Carlo Suárez Brucsoni & Marcelo Quito  
**Fecha**: 2025  
**Tecnología**: Ionic + Angular + Firebase

