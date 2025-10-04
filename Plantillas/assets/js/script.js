// Variables globales
let splashTimeout;
let isLoginLoading = false;

// Elementos del DOM
const splashScreen = document.getElementById('splash-screen');
const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('loginForm');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const usernameInput = document.getElementById('username');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función de inicialización
function initializeApp() {
    // Mostrar splash screen por 5 segundos
    showSplashScreen();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Verificar si hay credenciales guardadas
    checkSavedCredentials();
}

// Mostrar splash screen
function showSplashScreen() {
    splashScreen.classList.remove('hidden');
    loginScreen.classList.add('hidden');
    
    // Ocultar splash screen después de 5 segundos
    splashTimeout = setTimeout(() => {
        hideSplashScreen();
    }, 5000);
}

// Ocultar splash screen y mostrar login
function hideSplashScreen() {
    splashScreen.style.opacity = '0';
    splashScreen.style.transition = 'opacity 0.5s ease-out';
    
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        
        // Enfocar el primer input después de la transición
        setTimeout(() => {
            usernameInput.focus();
        }, 100);
    }, 500);
}

// Configurar event listeners
function setupEventListeners() {
    // Toggle de visibilidad de contraseña
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    
    // Envío del formulario de login
    loginForm.addEventListener('submit', handleLogin);
    
    // Enter en los inputs
    usernameInput.addEventListener('keypress', handleKeyPress);
    passwordInput.addEventListener('keypress', handleKeyPress);
    
    // Validación en tiempo real
    usernameInput.addEventListener('input', validateInput);
    passwordInput.addEventListener('input', validateInput);
}

// Toggle de visibilidad de contraseña
function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Cambiar icono
    const icon = togglePasswordBtn;
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
}

// Manejar tecla Enter
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (event.target === usernameInput) {
            passwordInput.focus();
        } else if (event.target === passwordInput) {
            handleLogin(event);
        }
    }
}

// Validación de inputs
function validateInput(event) {
    const input = event.target;
    const inputGroup = input.closest('.input-group');
    
    if (input.value.trim() === '') {
        inputGroup.classList.remove('valid');
        inputGroup.classList.add('invalid');
    } else {
        inputGroup.classList.remove('invalid');
        inputGroup.classList.add('valid');
    }
}

// Manejar login
function handleLogin(event) {
    event.preventDefault();
    
    if (isLoginLoading) return;
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validación básica
    if (!username || !password) {
        showNotification('Por favor, completa todos los campos', 'error');
        return;
    }
    
    // Mostrar estado de carga
    showLoadingState();
    
    // Simular autenticación (aquí iría la lógica real)
    simulateLogin(username, password);
}

// Mostrar estado de carga
function showLoadingState() {
    isLoginLoading = true;
    const loginBtn = loginForm.querySelector('.login-btn');
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
}

// Ocultar estado de carga
function hideLoadingState() {
    isLoginLoading = false;
    const loginBtn = loginForm.querySelector('.login-btn');
    loginBtn.classList.remove('loading');
    loginBtn.disabled = false;
}

// Simular proceso de login
function simulateLogin(username, password) {
    // Simular delay de red
    setTimeout(() => {
        // Aquí iría la validación real con el servidor
        if (validateCredentials(username, password)) {
            // Guardar credenciales si está marcado "Recordarme"
            if (rememberMeCheckbox.checked) {
                saveCredentials(username);
            }
            
            // Guardar datos del usuario en localStorage
            const userData = {
                username: username,
                name: getDisplayName(username),
                email: `${username}@docu.com`,
                loginTime: new Date().toISOString()
            };
            
            // Usar las utilidades para guardar
            if (typeof Utils !== 'undefined' && Utils.StorageUtils) {
                Utils.StorageUtils.set(APP_CONFIG.STORAGE.USER_KEY, userData);
            } else {
                // Fallback si las utilidades no están cargadas
                localStorage.setItem('docu_user', JSON.stringify(userData));
            }
            
            showNotification('¡Bienvenido a Docu!', 'success');
            
            // Redirigir al dashboard
            setTimeout(() => {
                window.location.href = 'pages/dashboard.html';
            }, 1500);
        } else {
            showNotification('Usuario o contraseña incorrectos', 'error');
            hideLoadingState();
        }
    }, 2000);
}

// Validar credenciales (simulado)
function validateCredentials(username, password) {
    // Credenciales de prueba
    const validCredentials = {
        'admin': 'admin123',
        'usuario': '123456',
        'docu': 'docu2024'
    };
    
    return validCredentials[username] === password;
}

// Obtener nombre de visualización
function getDisplayName(username) {
    const displayNames = {
        'admin': 'Administrador',
        'usuario': 'Usuario',
        'docu': 'Docu User'
    };
    
    return displayNames[username] || username;
}

// Guardar credenciales
function saveCredentials(username) {
    localStorage.setItem('docu_username', username);
    localStorage.setItem('docu_remember', 'true');
}

// Verificar credenciales guardadas
function checkSavedCredentials() {
    const savedUsername = localStorage.getItem('docu_username');
    const rememberMe = localStorage.getItem('docu_remember');
    
    if (savedUsername && rememberMe === 'true') {
        usernameInput.value = savedUsername;
        rememberMeCheckbox.checked = true;
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Agregar estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInDown 0.3s ease-out;
        max-width: 90%;
        text-align: center;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutUp 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Agregar estilos CSS para notificaciones
const notificationStyles = `
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideOutUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
`;

// Inyectar estilos de notificaciones
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Manejar errores globales
window.addEventListener('error', function(event) {
    console.error('Error:', event.error);
    //showNotification('Ha ocurrido un error inesperado', 'error');
});

// Prevenir zoom en iOS
document.addEventListener('gesturestart', function(event) {
    event.preventDefault();
});

// Optimización para dispositivos móviles
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

// Limpiar timeout si el usuario navega antes de que termine el splash
window.addEventListener('beforeunload', function() {
    if (splashTimeout) {
        clearTimeout(splashTimeout);
    }
});
