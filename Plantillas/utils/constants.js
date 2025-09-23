// Constantes de la aplicación Docu

/**
 * Tipos de documentos soportados
 */
const DOCUMENT_TYPES = {
    IDENTIFICATION: 'identification',
    PASSPORT: 'passport',
    DRIVER_LICENSE: 'driver_license',
    BIRTH_CERTIFICATE: 'birth_certificate',
    MARRIAGE_CERTIFICATE: 'marriage_certificate',
    DIPLOMA: 'diploma',
    CONTRACT: 'contract',
    INSURANCE: 'insurance',
    MEDICAL: 'medical',
    FINANCIAL: 'financial',
    LEGAL: 'legal',
    OTHER: 'other'
};

/**
 * Estados de documentos
 */
const DOCUMENT_STATUS = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    EXPIRING_SOON: 'expiring_soon',
    ARCHIVED: 'archived'
};

/**
 * Prioridades de notificación
 */
const NOTIFICATION_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

/**
 * Tipos de notificación
 */
const NOTIFICATION_TYPES = {
    EXPIRATION: 'expiration',
    REMINDER: 'reminder',
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
};

/**
 * Configuración de alertas
 */
const ALERT_SETTINGS = {
    EXPIRATION_DAYS: [30, 15, 7, 1], // Días antes del vencimiento para alertar
    REMINDER_FREQUENCY: {
        DAILY: 'daily',
        WEEKLY: 'weekly',
        MONTHLY: 'monthly'
    }
};

/**
 * Formatos de archivo soportados
 */
const SUPPORTED_FORMATS = {
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    PDF: ['.pdf'],
    DOCUMENTS: ['.doc', '.docx', '.txt', '.rtf'],
    SPREADSHEETS: ['.xls', '.xlsx', '.csv'],
    ALL: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx', '.csv']
};

/**
 * Tamaños máximos de archivo (en bytes)
 */
const FILE_SIZE_LIMITS = {
    IMAGE: 5 * 1024 * 1024, // 5MB
    PDF: 10 * 1024 * 1024, // 10MB
    DOCUMENT: 5 * 1024 * 1024, // 5MB
    MAX_TOTAL: 100 * 1024 * 1024 // 100MB
};

/**
 * Mensajes de la aplicación
 */
const MESSAGES = {
    SUCCESS: {
        LOGIN: '¡Bienvenido a Docu!',
        LOGOUT: 'Sesión cerrada correctamente',
        DOCUMENT_SAVED: 'Documento guardado exitosamente',
        DOCUMENT_DELETED: 'Documento eliminado correctamente',
        SETTINGS_SAVED: 'Configuración guardada correctamente'
    },
    ERROR: {
        LOGIN_FAILED: 'Usuario o contraseña incorrectos',
        NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
        FILE_TOO_LARGE: 'El archivo es demasiado grande',
        INVALID_FORMAT: 'Formato de archivo no soportado',
        GENERIC: 'Ha ocurrido un error inesperado'
    },
    VALIDATION: {
        REQUIRED_FIELD: 'Este campo es requerido',
        INVALID_EMAIL: 'Email inválido',
        PASSWORD_TOO_SHORT: 'La contraseña es muy corta',
        PASSWORD_TOO_LONG: 'La contraseña es muy larga',
        USERNAME_INVALID: 'Nombre de usuario inválido'
    },
    INFO: {
        LOADING: 'Cargando...',
        SAVING: 'Guardando...',
        PROCESSING: 'Procesando...',
        NO_DOCUMENTS: 'No tienes documentos registrados',
        NO_RESULTS: 'No se encontraron resultados'
    }
};

/**
 * Configuración de la interfaz
 */
const UI_CONFIG = {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    PAGINATION_SIZE: 10,
    MAX_RECENT_DOCUMENTS: 5,
    SIDEBAR_WIDTH: 280,
    HEADER_HEIGHT: 60
};

/**
 * Configuración de la cámara
 */
const CAMERA_CONFIG = {
    QUALITY: 0.8,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
    ALLOWED_ORIENTATIONS: ['portrait', 'landscape']
};

/**
 * Configuración de búsqueda
 */
const SEARCH_CONFIG = {
    MIN_QUERY_LENGTH: 2,
    MAX_RESULTS: 50,
    DEBOUNCE_DELAY: 300
};

/**
 * Configuración de exportación
 */
const EXPORT_CONFIG = {
    FORMATS: ['pdf', 'excel', 'csv'],
    MAX_DOCUMENTS: 1000,
    INCLUDE_IMAGES: true
};

// Exportar constantes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DOCUMENT_TYPES,
        DOCUMENT_STATUS,
        NOTIFICATION_PRIORITY,
        NOTIFICATION_TYPES,
        ALERT_SETTINGS,
        SUPPORTED_FORMATS,
        FILE_SIZE_LIMITS,
        MESSAGES,
        UI_CONFIG,
        CAMERA_CONFIG,
        SEARCH_CONFIG,
        EXPORT_CONFIG
    };
} else {
    window.Constants = {
        DOCUMENT_TYPES,
        DOCUMENT_STATUS,
        NOTIFICATION_PRIORITY,
        NOTIFICATION_TYPES,
        ALERT_SETTINGS,
        SUPPORTED_FORMATS,
        FILE_SIZE_LIMITS,
        MESSAGES,
        UI_CONFIG,
        CAMERA_CONFIG,
        SEARCH_CONFIG,
        EXPORT_CONFIG
    };
}
