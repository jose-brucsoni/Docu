// Utilidades comunes para la aplicación Docu

/**
 * Utilidades para manejo de fechas
 */
const DateUtils = {
    /**
     * Formatear fecha a string legible
     * @param {Date} date - Fecha a formatear
     * @param {string} format - Formato deseado
     * @returns {string} Fecha formateada
     */
    format: (date, format = 'dd/mm/yyyy') => {
        if (!date) return '';
        
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        switch (format) {
            case 'dd/mm/yyyy':
                return `${day}/${month}/${year}`;
            case 'mm/dd/yyyy':
                return `${month}/${day}/${year}`;
            case 'yyyy-mm-dd':
                return `${year}-${month}-${day}`;
            default:
                return d.toLocaleDateString();
        }
    },
    
    /**
     * Calcular días hasta vencimiento
     * @param {Date} expirationDate - Fecha de vencimiento
     * @returns {number} Días restantes
     */
    daysUntilExpiration: (expirationDate) => {
        if (!expirationDate) return 0;
        
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    },
    
    /**
     * Verificar si una fecha está próxima a vencer
     * @param {Date} expirationDate - Fecha de vencimiento
     * @param {number} daysThreshold - Días de anticipación
     * @returns {boolean} True si está próxima a vencer
     */
    isNearExpiration: (expirationDate, daysThreshold = 30) => {
        const daysLeft = DateUtils.daysUntilExpiration(expirationDate);
        return daysLeft <= daysThreshold && daysLeft >= 0;
    }
};

/**
 * Utilidades para validación
 */
const ValidationUtils = {
    /**
     * Validar email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * Validar contraseña
     * @param {string} password - Contraseña a validar
     * @returns {object} Resultado de validación
     */
    validatePassword: (password) => {
        const minLength = APP_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH;
        const maxLength = APP_CONFIG.VALIDATION.MAX_PASSWORD_LENGTH;
        
        if (!password) {
            return { isValid: false, message: 'La contraseña es requerida' };
        }
        
        if (password.length < minLength) {
            return { isValid: false, message: `La contraseña debe tener al menos ${minLength} caracteres` };
        }
        
        if (password.length > maxLength) {
            return { isValid: false, message: `La contraseña no puede tener más de ${maxLength} caracteres` };
        }
        
        return { isValid: true, message: 'Contraseña válida' };
    },
    
    /**
     * Validar nombre de usuario
     * @param {string} username - Usuario a validar
     * @returns {object} Resultado de validación
     */
    validateUsername: (username) => {
        const minLength = APP_CONFIG.VALIDATION.MIN_USERNAME_LENGTH;
        const maxLength = APP_CONFIG.VALIDATION.MAX_USERNAME_LENGTH;
        
        if (!username) {
            return { isValid: false, message: 'El nombre de usuario es requerido' };
        }
        
        if (username.length < minLength) {
            return { isValid: false, message: `El nombre de usuario debe tener al menos ${minLength} caracteres` };
        }
        
        if (username.length > maxLength) {
            return { isValid: false, message: `El nombre de usuario no puede tener más de ${maxLength} caracteres` };
        }
        
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return { isValid: false, message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' };
        }
        
        return { isValid: true, message: 'Nombre de usuario válido' };
    }
};

/**
 * Utilidades para almacenamiento local
 */
const StorageUtils = {
    /**
     * Guardar datos en localStorage
     * @param {string} key - Clave
     * @param {any} data - Datos a guardar
     */
    set: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    },
    
    /**
     * Obtener datos de localStorage
     * @param {string} key - Clave
     * @param {any} defaultValue - Valor por defecto
     * @returns {any} Datos obtenidos
     */
    get: (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error al obtener de localStorage:', error);
            return defaultValue;
        }
    },
    
    /**
     * Eliminar datos de localStorage
     * @param {string} key - Clave
     */
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error al eliminar de localStorage:', error);
        }
    },
    
    /**
     * Limpiar todo el localStorage
     */
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error al limpiar localStorage:', error);
        }
    }
};

/**
 * Utilidades para notificaciones
 */
const NotificationUtils = {
    /**
     * Mostrar notificación
     * @param {string} message - Mensaje
     * @param {string} type - Tipo de notificación
     * @param {number} duration - Duración en ms
     */
    show: (message, type = 'info', duration = APP_CONFIG.NOTIFICATIONS.DURATION) => {
        // Esta función será implementada en el archivo principal
        if (window.showNotification) {
            window.showNotification(message, type, duration);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
};

/**
 * Utilidades para formateo
 */
const FormatUtils = {
    /**
     * Formatear número con separadores de miles
     * @param {number} number - Número a formatear
     * @returns {string} Número formateado
     */
    formatNumber: (number) => {
        return new Intl.NumberFormat('es-ES').format(number);
    },
    
    /**
     * Formatear tamaño de archivo
     * @param {number} bytes - Bytes
     * @returns {string} Tamaño formateado
     */
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Capitalizar primera letra
     * @param {string} str - String a capitalizar
     * @returns {string} String capitalizado
     */
    capitalize: (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
};

// Exportar utilidades
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DateUtils,
        ValidationUtils,
        StorageUtils,
        NotificationUtils,
        FormatUtils
    };
} else {
    window.Utils = {
        DateUtils,
        ValidationUtils,
        StorageUtils,
        NotificationUtils,
        FormatUtils
    };
}
