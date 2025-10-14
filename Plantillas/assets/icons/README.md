# Iconos de la Aplicación Docu

Esta carpeta contiene todos los iconos utilizados en la aplicación.

## Estructura

```
icons/
├── svg/                   # Iconos en formato SVG
│   ├── document.svg       # Icono de documento
│   ├── folder.svg         # Icono de carpeta
│   ├── calendar.svg       # Icono de calendario
│   ├── bell.svg           # Icono de notificación
│   ├── search.svg         # Icono de búsqueda
│   ├── settings.svg       # Icono de configuración
│   ├── user.svg           # Icono de usuario
│   └── logout.svg         # Icono de cerrar sesión
├── png/                   # Iconos en formato PNG
│   ├── 16x16/             # Iconos 16x16px
│   ├── 24x24/             # Iconos 24x24px
│   ├── 32x32/             # Iconos 32x32px
│   └── 48x48/             # Iconos 48x48px
└── favicon/               # Favicons
    ├── favicon.ico
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    └── apple-touch-icon.png
```

## Especificaciones

- **Formato principal:** SVG (escalable)
- **Formato secundario:** PNG (para compatibilidad)
- **Tamaños:** 16x16, 24x24, 32x32, 48x48 píxeles
- **Estilo:** Línea simple, consistente con el diseño
- **Color:** Adaptable al tema de la aplicación

## Uso

Los iconos SVG se pueden usar directamente en HTML:

```html
<img src="assets/icons/svg/document.svg" alt="Documento" class="icon">
```

O como background en CSS:

```css
.icon-document {
    background-image: url('../icons/svg/document.svg');
    background-size: contain;
    background-repeat: no-repeat;
}
```

## Convenciones de Nombres

- **Formato:** kebab-case (ej: `user-profile.svg`)
- **Descriptivo:** El nombre debe describir claramente el icono
- **Consistente:** Mantener el mismo estilo visual en todos los iconos
