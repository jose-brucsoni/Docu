// JavaScript específico para el Dashboard de Docu

// Variables globales del dashboard
let isSidebarOpen = false;
let currentUser = null;

// Elementos del DOM
const menuToggle = document.getElementById('menuToggle');
const dashboardSidebar = document.getElementById('dashboardSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const userMenu = document.getElementById('userMenu');
const userDropdown = document.getElementById('userDropdown');
const searchInput = document.getElementById('searchInput');
const notificationBtn = document.getElementById('notificationBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Función de inicialización del dashboard
function initializeDashboard() {
    // Verificar autenticación
    if (!checkAuthentication()) {
        redirectToLogin();
        return;
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Cargar datos del usuario
    loadUserData();
    
    // Cargar datos del dashboard
    loadDashboardData();
    
    // Configurar búsqueda
    setupSearch();
}

// Verificar autenticación
function checkAuthentication() {
    const user = Utils.StorageUtils.get(APP_CONFIG.STORAGE.USER_KEY);
    return user !== null;
}

// Redirigir al login
function redirectToLogin() {
    window.location.href = '../index.html';
}

// Configurar event listeners
function setupEventListeners() {
    // Toggle del sidebar móvil
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Overlay del sidebar
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // Menú de usuario
    if (userMenu) {
        userMenu.addEventListener('click', toggleUserMenu);
    }
    
    // Cerrar menú de usuario al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (userMenu && !userMenu.contains(event.target)) {
            closeUserMenu();
        }
    });
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Acciones rápidas
    setupQuickActions();
    
    // Notificaciones
    if (notificationBtn) {
        notificationBtn.addEventListener('click', showNotifications);
    }
}

// Toggle del sidebar móvil
function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    
    if (isSidebarOpen) {
        dashboardSidebar.classList.add('show');
        sidebarOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    } else {
        closeSidebar();
    }
}

// Cerrar sidebar
function closeSidebar() {
    isSidebarOpen = false;
    dashboardSidebar.classList.remove('show');
    sidebarOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

// Toggle del menú de usuario
function toggleUserMenu() {
    userDropdown.classList.toggle('show');
}

// Cerrar menú de usuario
function closeUserMenu() {
    userDropdown.classList.remove('show');
}

// Manejar logout
function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpiar datos de sesión
        Utils.StorageUtils.remove(APP_CONFIG.STORAGE.USER_KEY);
        Utils.StorageUtils.remove(APP_CONFIG.STORAGE.REMEMBER_KEY);
        
        // Mostrar notificación
        Utils.NotificationUtils.show('Sesión cerrada correctamente', 'success');
        
        // Redirigir al login
        setTimeout(() => {
            redirectToLogin();
        }, 1000);
    }
}

// Cargar datos del usuario
function loadUserData() {
    const user = Utils.StorageUtils.get(APP_CONFIG.STORAGE.USER_KEY);
    
    if (user) {
        currentUser = user;
        
        // Actualizar información del usuario en la UI
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        
        if (userName) userName.textContent = user.name || user.username || 'Usuario';
        if (userEmail) userEmail.textContent = user.email || 'usuario@docu.com';
    }
}

// Cargar datos del dashboard
function loadDashboardData() {
    // Simular carga de datos
    loadStats();
    loadRecentDocuments();
    loadExpiringDocuments();
}

// Cargar estadísticas
function loadStats() {
    // Datos simulados - en una app real vendrían de una API
    const stats = {
        totalDocuments: 12,
        expiringSoon: 3,
        recentlyAdded: 5,
        categoriesCount: 8
    };
    
    // Actualizar UI
    updateStatCard('totalDocuments', stats.totalDocuments);
    updateStatCard('expiringSoon', stats.expiringSoon);
    updateStatCard('recentlyAdded', stats.recentlyAdded);
    updateStatCard('categoriesCount', stats.categoriesCount);
}

// Actualizar tarjeta de estadística
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Cargar documentos recientes
function loadRecentDocuments() {
    const recentDocuments = [
        {
            id: 1,
            name: 'Cédula de Identidad',
            category: 'Identificación',
            dateAdded: '2024-01-15',
            expirationDate: '2029-01-15',
            status: 'active'
        },
        {
            id: 2,
            name: 'Licencia de Conducir',
            category: 'Identificación',
            dateAdded: '2024-01-14',
            expirationDate: '2026-01-14',
            status: 'active'
        },
        {
            id: 3,
            name: 'Pasaporte',
            category: 'Identificación',
            dateAdded: '2024-01-13',
            expirationDate: '2034-01-13',
            status: 'active'
        }
    ];
    
    renderDocumentsList('recentDocumentsList', recentDocuments);
}

// Cargar documentos próximos a vencer
function loadExpiringDocuments() {
    const expiringDocuments = [
        {
            id: 4,
            name: 'Seguro Médico',
            category: 'Médico',
            dateAdded: '2023-01-15',
            expirationDate: '2024-02-15',
            status: 'expiring_soon',
            daysLeft: 15
        },
        {
            id: 5,
            name: 'Contrato de Trabajo',
            category: 'Legal',
            dateAdded: '2023-06-01',
            expirationDate: '2024-02-01',
            status: 'expiring_soon',
            daysLeft: 7
        }
    ];
    
    renderDocumentsList('expiringDocumentsList', expiringDocuments);
}

// Renderizar lista de documentos
function renderDocumentsList(containerId, documents) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (documents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>No hay documentos disponibles</p>
            </div>
        `;
        return;
    }
    
    const documentsHTML = documents.map(doc => createDocumentCard(doc)).join('');
    container.innerHTML = documentsHTML;
}

// Crear tarjeta de documento
function createDocumentCard(document) {
    const statusClass = document.status === 'expiring_soon' ? 'urgent' : '';
    const daysLeft = document.daysLeft ? ` (${document.daysLeft} días)` : '';
    
    return `
        <div class="document-card ${statusClass}" data-document-id="${document.id}">
            <div class="document-icon">
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="document-info">
                <h3 class="document-name">${document.name}</h3>
                <p class="document-category">${document.category}</p>
                <p class="document-date">Vence: ${Utils.DateUtils.format(document.expirationDate)}${daysLeft}</p>
            </div>
            <div class="document-actions">
                <button class="action-btn" onclick="viewDocument(${document.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="editDocument(${document.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `;
}

// Configurar búsqueda
function setupSearch() {
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value);
        }, 300);
    });
}

// Realizar búsqueda
function performSearch(query) {
    if (query.length < 2) return;
    
    console.log('Buscando:', query);
    // Aquí implementarías la lógica de búsqueda real
    // Por ahora solo mostramos en consola
}

// Configurar acciones rápidas
function setupQuickActions() {
    const quickActionCards = document.querySelectorAll('.quick-action-card');
    
    quickActionCards.forEach(card => {
        card.addEventListener('click', function() {
            const action = this.dataset.action;
            handleQuickAction(action);
        });
    });
}

// Manejar acciones rápidas
function handleQuickAction(action) {
    switch (action) {
        case 'scan':
            Utils.NotificationUtils.show('Función de escaneo en desarrollo', 'info');
            break;
        case 'upload':
            Utils.NotificationUtils.show('Función de subida en desarrollo', 'info');
            break;
        case 'search':
            searchInput.focus();
            break;
        case 'export':
            Utils.NotificationUtils.show('Función de exportación en desarrollo', 'info');
            break;
        default:
            console.log('Acción no reconocida:', action);
    }
}

// Mostrar notificaciones
function showNotifications() {
    Utils.NotificationUtils.show('Centro de notificaciones en desarrollo', 'info');
}

// Funciones de documentos
function viewDocument(id) {
    Utils.NotificationUtils.show(`Viendo documento ${id}`, 'info');
    // Aquí implementarías la navegación al detalle del documento
}

function editDocument(id) {
    Utils.NotificationUtils.show(`Editando documento ${id}`, 'info');
    // Aquí implementarías la navegación a la edición del documento
}

// Manejar búsqueda
function handleSearch(event) {
    const query = event.target.value;
    if (query.length >= 2) {
        performSearch(query);
    }
}

// Funciones de botones principales
document.addEventListener('click', function(event) {
    if (event.target.id === 'addDocumentBtn') {
        Utils.NotificationUtils.show('Agregar documento en desarrollo', 'info');
    }
    
    if (event.target.id === 'scanDocumentBtn') {
        Utils.NotificationUtils.show('Escanear documento en desarrollo', 'info');
    }
});

// Manejar redimensionamiento de ventana
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeSidebar();
    }
});

// Prevenir zoom en dispositivos móviles
document.addEventListener('gesturestart', function(event) {
    event.preventDefault();
});

// Optimización para dispositivos táctiles
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}
