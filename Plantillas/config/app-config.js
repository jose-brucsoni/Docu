// Configuración de la aplicación Docu
const APP_CONFIG = {
    // Información de la aplicación
    APP_NAME: 'Docu',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Control de Documentos',
    
    // Configuración de colores
    COLORS: {
        PRIMARY: '#C55A11',
        PRIMARY_DARK: '#B84A00',
        SECONDARY: '#6b7280',
        SUCCESS: '#4CAF50',
        ERROR: '#f44336',
        WARNING: '#ff9800',
        INFO: '#2196F3'
    },
    
    // Configuración de la API
    API: {
        BASE_URL: 'https://api.docu.com',
        TIMEOUT: 10000,
        VERSION: 'v1'
    },
    
    // Configuración de notificaciones
    NOTIFICATIONS: {
        DURATION: 3000,
        POSITION: 'top'
    },
    
    // Configuración de splash screen
    SPLASH_SCREEN: {
        DURATION: 5000,
        ANIMATION_DURATION: 500
    },
    
    // Configuración de validación
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 6,
        MAX_PASSWORD_LENGTH: 50,
        MIN_USERNAME_LENGTH: 3,
        MAX_USERNAME_LENGTH: 30
    },
    
    // Configuración de almacenamiento local
    STORAGE: {
        USER_KEY: 'docu_user',
        REMEMBER_KEY: 'docu_remember',
        THEME_KEY: 'docu_theme',
        SETTINGS_KEY: 'docu_settings'
    },
    
    // Configuración de rutas
    ROUTES: {
        LOGIN: '/login',
        DASHBOARD: '/dashboard',
        DOCUMENTS: '/documents',
        PROFILE: '/profile',
        SETTINGS: '/settings'
    }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
} else {
    window.APP_CONFIG = APP_CONFIG;
}
