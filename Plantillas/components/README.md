# Componentes de la Aplicación Docu

Esta carpeta contiene componentes HTML reutilizables para la aplicación.

## Estructura

```
components/
├── header.html              # Cabecera de la aplicación
├── sidebar.html             # Barra lateral de navegación
├── footer.html              # Pie de página
├── document-card.html       # Tarjeta de documento
├── document-list.html       # Lista de documentos
├── notification.html        # Componente de notificación
├── modal.html               # Ventanas modales
├── search-bar.html          # Barra de búsqueda
├── filter-panel.html        # Panel de filtros
├── pagination.html          # Paginación
├── loading-spinner.html     # Indicador de carga
├── empty-state.html         # Estado vacío
└── error-message.html       # Mensaje de error
```

## Uso de Componentes

### Inclusión Estática
```html
<!-- Incluir header -->
<div id="header-container">
    <!-- Contenido del header -->
</div>
```

### Inclusión Dinámica (JavaScript)
```javascript
// Cargar componente dinámicamente
async function loadComponent(componentName, containerId) {
    try {
        const response = await fetch(`../components/${componentName}.html`);
        const html = await response.text();
        document.getElementById(containerId).innerHTML = html;
    } catch (error) {
        console.error('Error al cargar componente:', error);
    }
}

// Usar el componente
loadComponent('header', 'header-container');
```

## Componentes Principales

### Header (`header.html`)
- Logo de la aplicación
- Navegación principal
- Perfil de usuario
- Notificaciones

### Sidebar (`sidebar.html`)
- Menú de navegación
- Categorías de documentos
- Accesos rápidos
- Configuración

### Document Card (`document-card.html`)
- Información del documento
- Imagen de vista previa
- Fecha de vencimiento
- Acciones rápidas

### Modal (`modal.html`)
- Ventana modal base
- Contenido personalizable
- Botones de acción
- Cierre automático

## Convenciones

### Nombres de Archivos
- **Formato:** kebab-case (ej: `document-card.html`)
- **Descriptivo:** El nombre debe describir claramente el componente
- **Consistente:** Mantener el mismo patrón en todos los archivos

### Estructura HTML
Cada componente debe ser autocontenido:

```html
<!-- Componente: document-card.html -->
<div class="document-card" data-document-id="">
    <div class="document-card__header">
        <!-- Contenido del header -->
    </div>
    <div class="document-card__body">
        <!-- Contenido principal -->
    </div>
    <div class="document-card__footer">
        <!-- Contenido del footer -->
    </div>
</div>
```

### Clases CSS
- **BEM Methodology:** Block__Element--Modifier
- **Prefijo:** Nombre del componente
- **Ejemplo:** `.document-card__title--urgent`

### Atributos de Datos
- **data-***: Para datos del componente
- **id**: Para identificación única
- **class**: Para estilos y JavaScript

## Estado de Desarrollo

- [ ] `header.html` - Cabecera (pendiente)
- [ ] `sidebar.html` - Barra lateral (pendiente)
- [ ] `document-card.html` - Tarjeta de documento (pendiente)
- [ ] `modal.html` - Ventana modal (pendiente)
- [ ] `notification.html` - Notificación (pendiente)
- [ ] Otros componentes (pendientes)

## Documentación de Componentes

Cada componente debe incluir:

1. **Descripción:** Qué hace el componente
2. **Props/Atributos:** Parámetros que acepta
3. **Eventos:** Eventos que emite
4. **Ejemplo de uso:** Cómo implementarlo
5. **Estilos:** Clases CSS necesarias
