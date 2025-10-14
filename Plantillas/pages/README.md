# Páginas de la Aplicación Docu

Esta carpeta contiene todas las páginas HTML de la aplicación.

## Estructura

```
pages/
├── dashboard.html          # Panel principal
├── documents.html          # Gestión de documentos
├── document-detail.html    # Detalle de documento
├── add-document.html       # Agregar nuevo documento
├── edit-document.html      # Editar documento
├── profile.html            # Perfil de usuario
├── settings.html           # Configuración
├── notifications.html      # Centro de notificaciones
├── search.html             # Página de búsqueda
├── register.html           # Registro de usuario
├── forgot-password.html    # Recuperar contraseña
└── about.html              # Acerca de la aplicación
```

## Convenciones

### Nombres de Archivos
- **Formato:** kebab-case (ej: `document-detail.html`)
- **Descriptivo:** El nombre debe describir claramente la página
- **Consistente:** Mantener el mismo patrón en todos los archivos

### Estructura HTML
Cada página debe seguir esta estructura base:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nombre de la Página - Docu</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <!-- Contenido de la página -->
    
    <!-- Scripts -->
    <script src="../config/app-config.js"></script>
    <script src="../utils/constants.js"></script>
    <script src="../utils/helpers.js"></script>
    <script src="../assets/js/script.js"></script>
</body>
</html>
```

### Navegación
- **Rutas relativas:** Usar `../` para acceder a assets desde páginas
- **Enlaces internos:** Usar rutas relativas entre páginas
- **Enlaces externos:** Usar URLs absolutas

### Responsive Design
- **Mobile First:** Diseñar primero para móviles
- **Breakpoints:** Usar los definidos en `styles.css`
- **Touch Friendly:** Botones y elementos táctiles apropiados

## Páginas Principales

### Dashboard (`dashboard.html`)
- Resumen de documentos
- Documentos próximos a vencer
- Accesos rápidos
- Estadísticas

### Documentos (`documents.html`)
- Lista de todos los documentos
- Filtros y búsqueda
- Categorías
- Acciones masivas

### Perfil (`profile.html`)
- Información del usuario
- Configuración de cuenta
- Preferencias
- Seguridad

### Configuración (`settings.html`)
- Configuración de la aplicación
- Notificaciones
- Tema y apariencia
- Datos y privacidad

## Componentes Reutilizables

Las páginas pueden incluir componentes de la carpeta `components/`:

```html
<!-- Incluir header -->
<div id="header-container"></div>

<!-- Incluir sidebar -->
<div id="sidebar-container"></div>

<!-- Incluir footer -->
<div id="footer-container"></div>
```

## Estado de Desarrollo

- [x] `index.html` - Página de login (completada)
- [ ] `dashboard.html` - Panel principal (pendiente)
- [ ] `documents.html` - Gestión de documentos (pendiente)
- [ ] `profile.html` - Perfil de usuario (pendiente)
- [ ] `settings.html` - Configuración (pendiente)
- [ ] Otras páginas (pendientes)
