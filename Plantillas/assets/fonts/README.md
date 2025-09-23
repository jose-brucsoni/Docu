# Fuentes de la Aplicación Docu

Esta carpeta contiene las fuentes personalizadas utilizadas en la aplicación.

## Estructura

```
fonts/
├── ttf/                   # Fuentes TrueType
│   ├── docu-regular.ttf   # Fuente regular
│   ├── docu-bold.ttf      # Fuente en negrita
│   └── docu-light.ttf     # Fuente ligera
├── woff2/                 # Fuentes Web Open Font Format 2
│   ├── docu-regular.woff2 # Fuente regular (optimizada)
│   ├── docu-bold.woff2    # Fuente en negrita (optimizada)
│   └── docu-light.woff2   # Fuente ligera (optimizada)
└── woff/                  # Fuentes Web Open Font Format (fallback)
    ├── docu-regular.woff  # Fuente regular (fallback)
    ├── docu-bold.woff     # Fuente en negrita (fallback)
    └── docu-light.woff    # Fuente ligera (fallback)
```

## Fuentes Utilizadas

### Fuente Principal
- **Nombre:** Segoe UI (sistema)
- **Fallbacks:** Tahoma, Geneva, Verdana, sans-serif
- **Uso:** Texto general de la aplicación

### Fuentes Personalizadas (Opcional)
- **Nombre:** Docu Custom
- **Estilos:** Regular, Bold, Light
- **Uso:** Logotipos y elementos especiales

## Implementación CSS

```css
@font-face {
    font-family: 'Docu Custom';
    src: url('../fonts/woff2/docu-regular.woff2') format('woff2'),
         url('../fonts/woff/docu-regular.woff') format('woff'),
         url('../fonts/ttf/docu-regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Docu Custom';
    src: url('../fonts/woff2/docu-bold.woff2') format('woff2'),
         url('../fonts/woff/docu-bold.woff') format('woff'),
         url('../fonts/ttf/docu-bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}
```

## Optimización

- **font-display: swap** - Mejora la experiencia de carga
- **Formato WOFF2** - Compresión superior para web
- **Fallbacks** - Garantiza compatibilidad
- **Subconjuntos** - Solo caracteres necesarios (opcional)

## Licencias

- **Fuentes del sistema:** Licencia del sistema operativo
- **Fuentes personalizadas:** Verificar licencias comerciales
- **Fuentes web:** Usar servicios como Google Fonts cuando sea posible
