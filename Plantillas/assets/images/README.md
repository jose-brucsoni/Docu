# Imágenes de la Aplicación Docu

Esta carpeta contiene todas las imágenes utilizadas en la aplicación.

## Estructura

```
images/
├── logos/                 # Logotipos y marcas
│   ├── docu-logo.png      # Logo principal
│   ├── docu-icon.png      # Icono de la app
│   └── splash-logo.png    # Logo para splash screen
├── backgrounds/           # Imágenes de fondo
│   ├── login-bg.jpg       # Fondo de login
│   ├── dashboard-bg.jpg   # Fondo del dashboard
│   └── patterns/          # Patrones decorativos
├── illustrations/         # Ilustraciones
│   ├── empty-state.svg    # Estado vacío
│   ├── success.svg        # Ilustración de éxito
│   └── error.svg          # Ilustración de error
└── placeholders/          # Imágenes placeholder
    ├── document-placeholder.png
    └── user-avatar.png
```

## Especificaciones

- **Formatos soportados:** PNG, JPG, SVG, WebP
- **Resolución recomendada:** 2x para pantallas de alta densidad
- **Tamaño máximo:** 500KB por imagen
- **Optimización:** Comprimir imágenes para web

## Uso

Las imágenes se referencian desde los archivos CSS y HTML usando rutas relativas:

```css
.logo {
    background-image: url('../images/logos/docu-logo.png');
}
```

```html
<img src="assets/images/illustrations/empty-state.svg" alt="Estado vacío">
```
