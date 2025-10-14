// JavaScript específico para la página de Mis Documentos
console.log('Script documents.js cargado correctamente');

// Función de prueba inmediata
(function() {
    console.log('Función de prueba ejecutándose...');
    console.log('Document ready state:', document.readyState);
    console.log('Window loaded:', window.loaded);
})();

// Variables globales
let currentView = 'grid'; // 'grid' o 'list'
let currentPage = 1;
let itemsPerPage = 12;
let allDocuments = [];
let filteredDocuments = [];
let currentFilters = {
    category: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc'
};

// Variables para elementos del DOM (se inicializarán después)
let viewToggleBtn, viewIcon, viewText, documentsContainer, categoryFilter, statusFilter, sortBy, sortOrder, clearFiltersBtn, searchInput, addDocumentBtn;
let mobileFilterToggle, mobileViewToggle, filtersSection, filterChevron, mobileViewIcon, mobileViewText;
let prevPageBtn, nextPageBtn, paginationInfo, paginationPages;
let totalDocumentsCount, activeDocumentsCount, expiringDocumentsCount, expiredDocumentsCount;

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando...');
    initializeDocumentsPage();
});

// Fallback para asegurar que se ejecute
setTimeout(function() {
    if (allDocuments.length === 0) {
        console.log('Fallback: Reintentando carga de documentos...');
        initializeDocumentsPage();
    }
}, 1000);

// Función de prueba que se ejecuta inmediatamente
function testDocuments() {
    console.log('=== PRUEBA DE DOCUMENTOS ===');
    console.log('Document ready state:', document.readyState);
    console.log('Body exists:', !!document.body);
    console.log('Container exists:', !!document.getElementById('documentsContainer'));
    
    // Crear un documento de prueba simple
    const testDoc = {
        id: 999,
        name: 'Documento de Prueba',
        category: 'identification',
        categoryName: 'Identificación',
        dateAdded: '2024-01-01',
        expirationDate: '2025-01-01',
        status: 'active',
        fileSize: '1.0 MB',
        fileType: 'PDF',
        description: 'Documento de prueba para verificar funcionamiento'
    };
    
    allDocuments = [testDoc];
    filteredDocuments = [testDoc];
    
    console.log('Documento de prueba creado:', testDoc);
    
    // Intentar renderizar
    const container = document.getElementById('documentsContainer');
    if (container) {
        console.log('Contenedor encontrado, renderizando...');
        container.innerHTML = `
            <div class="document-card">
                <div class="document-card-header">
                    <div class="document-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                </div>
                <div class="document-info">
                    <h3 class="document-name">${testDoc.name}</h3>
                    <div class="document-category">
                        <span class="category-badge">${testDoc.categoryName}</span>
                    </div>
                    <div class="document-meta">
                        <div class="document-date">
                            <i class="fas fa-calendar"></i>
                            Vence: ${formatDate(testDoc.expirationDate)}
                        </div>
                        <div class="document-date">
                            <i class="fas fa-file"></i>
                            ${testDoc.fileType} • ${testDoc.fileSize}
                        </div>
                    </div>
                    <div class="document-status active">Activo</div>
                </div>
            </div>
        `;
        console.log('Documento renderizado correctamente');
    } else {
        console.error('No se encontró el contenedor de documentos');
    }
}

// Hacer la función global
window.testDocuments = testDocuments;

// Ejecutar prueba después de un pequeño delay
setTimeout(testDocuments, 500);

// Función de inicialización manual para testing
function initDocuments() {
    console.log('Inicialización manual...');
    loadDocuments();
}

// Hacer la función global para poder llamarla desde la consola
window.initDocuments = initDocuments;

// Función de inicialización
function initializeDocumentsPage() {
    console.log('Inicializando página de documentos...');
    
    // Inicializar elementos del DOM
    initializeDOMElements();
    
    // Verificar autenticación
    if (!checkAuthentication()) {
        console.log('No autenticado, redirigiendo al login...');
        redirectToLogin();
        return;
    }
    
    console.log('Usuario autenticado, configurando página...');
    
    // Configurar event listeners
    setupEventListeners();
    
    // Cargar datos de documentos
    loadDocuments();
    
    // Aplicar filtros de URL si existen
    applyUrlFilters();
    
    console.log('Página de documentos inicializada correctamente');
}

// Inicializar elementos del DOM
function initializeDOMElements() {
    console.log('Inicializando elementos del DOM...');
    
    // Elementos principales
    viewToggleBtn = document.getElementById('viewToggleBtn');
    viewIcon = document.getElementById('viewIcon');
    viewText = document.getElementById('viewText');
    documentsContainer = document.getElementById('documentsContainer');
    categoryFilter = document.getElementById('categoryFilter');
    statusFilter = document.getElementById('statusFilter');
    sortBy = document.getElementById('sortBy');
    sortOrder = document.getElementById('sortOrder');
    clearFiltersBtn = document.getElementById('clearFiltersBtn');
    searchInput = document.getElementById('searchInput');
    addDocumentBtn = document.getElementById('addDocumentBtn');
    
    // Elementos móviles
    mobileFilterToggle = document.getElementById('mobileFilterToggle');
    mobileViewToggle = document.getElementById('mobileViewToggle');
    filtersSection = document.getElementById('filtersSection');
    filterChevron = document.getElementById('filterChevron');
    mobileViewIcon = document.getElementById('mobileViewIcon');
    mobileViewText = document.getElementById('mobileViewText');
    
    // Elementos de paginación
    prevPageBtn = document.getElementById('prevPageBtn');
    nextPageBtn = document.getElementById('nextPageBtn');
    paginationInfo = document.getElementById('paginationInfo');
    paginationPages = document.getElementById('paginationPages');
    
    // Elementos de estadísticas
    totalDocumentsCount = document.getElementById('totalDocumentsCount');
    activeDocumentsCount = document.getElementById('activeDocumentsCount');
    expiringDocumentsCount = document.getElementById('expiringDocumentsCount');
    expiredDocumentsCount = document.getElementById('expiredDocumentsCount');
    
    console.log('Elementos del DOM inicializados:');
    console.log('- documentsContainer:', documentsContainer);
    console.log('- categoryFilter:', categoryFilter);
    console.log('- totalDocumentsCount:', totalDocumentsCount);
}

// Verificar autenticación
function checkAuthentication() {
    // Para testing, siempre retornar true
    // En producción, descomentar las siguientes líneas:
    // const user = Utils.StorageUtils.get(APP_CONFIG.STORAGE.USER_KEY);
    // return user !== null;
    return true;
}

// Redirigir al login
function redirectToLogin() {
    window.location.href = '../index.html';
}

// Configurar event listeners
function setupEventListeners() {
    // Toggle de vista
    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', toggleView);
    }
    
    // Filtros
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleFilterChange);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilterChange);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', handleFilterChange);
    }
    
    if (sortOrder) {
        sortOrder.addEventListener('change', handleFilterChange);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Botón agregar documento
    if (addDocumentBtn) {
        addDocumentBtn.addEventListener('click', handleAddDocument);
    }
    
    // Toggle de filtros móvil
    if (mobileFilterToggle) {
        mobileFilterToggle.addEventListener('click', toggleMobileFilters);
    }
    
    // Toggle de vista móvil
    if (mobileViewToggle) {
        mobileViewToggle.addEventListener('click', toggleMobileView);
    }
    
    // Paginación
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', goToPreviousPage);
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', goToNextPage);
    }
}

// Cargar documentos
function loadDocuments() {
    console.log('Cargando documentos...');
    
    // Datos simulados - en una app real vendrían de una API
    allDocuments = [
        // === DOCUMENTOS DE IDENTIFICACIÓN ===
        {
            id: 1,
            name: 'Cédula de Identidad',
            category: 'identification',
            categoryName: 'Identificación',
            dateAdded: '2024-01-15',
            expirationDate: '2029-01-15',
            status: 'active',
            fileSize: '2.3 MB',
            fileType: 'PDF',
            description: 'Documento de identidad oficial vigente'
        },
        {
            id: 2,
            name: 'Licencia de Conducir',
            category: 'identification',
            categoryName: 'Identificación',
            dateAdded: '2024-01-14',
            expirationDate: '2026-01-14',
            status: 'active',
            fileSize: '1.8 MB',
            fileType: 'PDF',
            description: 'Licencia de conducir clase B'
        },
        {
            id: 3,
            name: 'Pasaporte',
            category: 'identification',
            categoryName: 'Identificación',
            dateAdded: '2024-01-13',
            expirationDate: '2034-01-13',
            status: 'active',
            fileSize: '3.1 MB',
            fileType: 'PDF',
            description: 'Pasaporte internacional vigente'
        },
        {
            id: 4,
            name: 'Cédula de Extranjería',
            category: 'identification',
            categoryName: 'Identificación',
            dateAdded: '2023-08-20',
            expirationDate: '2025-08-20',
            status: 'active',
            fileSize: '1.9 MB',
            fileType: 'PDF',
            description: 'Documento de identidad para extranjeros'
        },
        {
            id: 5,
            name: 'Carné de Estudiante',
            category: 'identification',
            categoryName: 'Identificación',
            dateAdded: '2024-02-01',
            expirationDate: '2024-12-31',
            status: 'expiring_soon',
            fileSize: '0.8 MB',
            fileType: 'PDF',
            description: 'Carné estudiantil universitario'
        },

        // === DOCUMENTOS MÉDICOS ===
        {
            id: 6,
            name: 'Seguro Médico',
            category: 'medical',
            categoryName: 'Médico',
            dateAdded: '2023-01-15',
            expirationDate: '2024-02-15',
            status: 'expiring_soon',
            fileSize: '1.5 MB',
            fileType: 'PDF',
            description: 'Póliza de seguro médico familiar'
        },
        {
            id: 7,
            name: 'Certificado de Vacunación COVID-19',
            category: 'medical',
            categoryName: 'Médico',
            dateAdded: '2023-12-15',
            expirationDate: '2025-12-15',
            status: 'active',
            fileSize: '1.1 MB',
            fileType: 'PDF',
            description: 'Certificado de vacunación completo'
        },
        {
            id: 8,
            name: 'Historia Clínica',
            category: 'medical',
            categoryName: 'Médico',
            dateAdded: '2024-01-20',
            expirationDate: null,
            status: 'active',
            fileSize: '3.2 MB',
            fileType: 'PDF',
            description: 'Historia clínica actualizada'
        },
        {
            id: 9,
            name: 'Receta Médica - Antibióticos',
            category: 'medical',
            categoryName: 'Médico',
            dateAdded: '2024-01-08',
            expirationDate: '2024-02-08',
            status: 'expired',
            fileSize: '0.5 MB',
            fileType: 'PDF',
            description: 'Receta médica para medicamentos'
        },
        {
            id: 10,
            name: 'Examen de Sangre',
            category: 'medical',
            categoryName: 'Médico',
            dateAdded: '2024-01-25',
            expirationDate: '2024-07-25',
            status: 'active',
            fileSize: '0.9 MB',
            fileType: 'PDF',
            description: 'Resultados de laboratorio clínico'
        },
        {
            id: 11,
            name: 'Certificado de Discapacidad',
            category: 'medical',
            categoryName: 'Médico',
            dateAdded: '2023-09-10',
            expirationDate: '2025-09-10',
            status: 'active',
            fileSize: '2.1 MB',
            fileType: 'PDF',
            description: 'Certificado médico de discapacidad'
        },

        // === DOCUMENTOS LEGALES ===
        {
            id: 12,
            name: 'Contrato de Trabajo',
            category: 'legal',
            categoryName: 'Legal',
            dateAdded: '2023-06-01',
            expirationDate: '2024-02-01',
            status: 'expiring_soon',
            fileSize: '4.2 MB',
            fileType: 'PDF',
            description: 'Contrato laboral indefinido'
        },
        {
            id: 13,
            name: 'Certificado de Nacimiento',
            category: 'legal',
            categoryName: 'Legal',
            dateAdded: '2023-11-10',
            expirationDate: null,
            status: 'active',
            fileSize: '1.2 MB',
            fileType: 'PDF',
            description: 'Certificado de nacimiento original'
        },
        {
            id: 14,
            name: 'Acta de Matrimonio',
            category: 'legal',
            categoryName: 'Legal',
            dateAdded: '2023-10-20',
            expirationDate: null,
            status: 'active',
            fileSize: '2.1 MB',
            fileType: 'PDF',
            description: 'Acta de matrimonio civil'
        },
        {
            id: 15,
            name: 'Poder Notarial',
            category: 'legal',
            categoryName: 'Legal',
            dateAdded: '2023-12-05',
            expirationDate: '2024-12-05',
            status: 'active',
            fileSize: '1.8 MB',
            fileType: 'PDF',
            description: 'Poder notarial para trámites'
        },
        {
            id: 16,
            name: 'Testamento',
            category: 'legal',
            categoryName: 'Legal',
            dateAdded: '2023-07-15',
            expirationDate: null,
            status: 'active',
            fileSize: '3.5 MB',
            fileType: 'PDF',
            description: 'Testamento notarial'
        },
        {
            id: 17,
            name: 'Acta de Divorcio',
            category: 'legal',
            categoryName: 'Legal',
            dateAdded: '2022-05-10',
            expirationDate: null,
            status: 'active',
            fileSize: '2.8 MB',
            fileType: 'PDF',
            description: 'Acta de divorcio consensual'
        },

        // === DOCUMENTOS FINANCIEROS ===
        {
            id: 18,
            name: 'Extracto Bancario - Enero 2024',
            category: 'financial',
            categoryName: 'Financiero',
            dateAdded: '2024-01-10',
            expirationDate: '2024-07-10',
            status: 'active',
            fileSize: '0.8 MB',
            fileType: 'PDF',
            description: 'Extracto bancario mensual'
        },
        {
            id: 19,
            name: 'Factura de Servicios Públicos',
            category: 'financial',
            categoryName: 'Financiero',
            dateAdded: '2024-01-05',
            expirationDate: null,
            status: 'active',
            fileSize: '0.6 MB',
            fileType: 'PDF',
            description: 'Factura de servicios públicos'
        },
        {
            id: 20,
            name: 'Declaración de Renta 2023',
            category: 'financial',
            categoryName: 'Financiero',
            dateAdded: '2024-03-15',
            expirationDate: null,
            status: 'active',
            fileSize: '2.4 MB',
            fileType: 'PDF',
            description: 'Declaración de renta anual'
        },
        {
            id: 21,
            name: 'Certificado de Ingresos',
            category: 'financial',
            categoryName: 'Financiero',
            dateAdded: '2024-01-30',
            expirationDate: '2024-07-30',
            status: 'active',
            fileSize: '0.7 MB',
            fileType: 'PDF',
            description: 'Certificado de ingresos laborales'
        },
        {
            id: 22,
            name: 'Póliza de Seguro de Vida',
            category: 'financial',
            categoryName: 'Financiero',
            dateAdded: '2023-11-20',
            expirationDate: '2024-11-20',
            status: 'expiring_soon',
            fileSize: '1.9 MB',
            fileType: 'PDF',
            description: 'Póliza de seguro de vida'
        },
        {
            id: 23,
            name: 'Contrato de Arrendamiento',
            category: 'financial',
            categoryName: 'Financiero',
            dateAdded: '2023-08-01',
            expirationDate: '2024-08-01',
            status: 'expiring_soon',
            fileSize: '2.6 MB',
            fileType: 'PDF',
            description: 'Contrato de arrendamiento de vivienda'
        },

        // === DOCUMENTOS EDUCATIVOS ===
        {
            id: 24,
            name: 'Título Universitario - Ingeniería',
            category: 'education',
            categoryName: 'Educación',
            dateAdded: '2023-12-20',
            expirationDate: null,
            status: 'active',
            fileSize: '2.7 MB',
            fileType: 'PDF',
            description: 'Título de Ingeniería en Sistemas'
        },
        {
            id: 25,
            name: 'Diploma de Postgrado',
            category: 'education',
            categoryName: 'Educación',
            dateAdded: '2023-10-15',
            expirationDate: null,
            status: 'active',
            fileSize: '1.8 MB',
            fileType: 'PDF',
            description: 'Diploma de Especialización en Desarrollo Web'
        },
        {
            id: 26,
            name: 'Certificado de Inglés',
            category: 'education',
            categoryName: 'Educación',
            dateAdded: '2024-01-12',
            expirationDate: '2026-01-12',
            status: 'active',
            fileSize: '1.3 MB',
            fileType: 'PDF',
            description: 'Certificado de nivel B2 en inglés'
        },
        {
            id: 27,
            name: 'Acta de Grado',
            category: 'education',
            categoryName: 'Educación',
            dateAdded: '2023-12-18',
            expirationDate: null,
            status: 'active',
            fileSize: '2.2 MB',
            fileType: 'PDF',
            description: 'Acta de grado universitario'
        },
        {
            id: 28,
            name: 'Certificado de Cursos Online',
            category: 'education',
            categoryName: 'Educación',
            dateAdded: '2024-01-08',
            expirationDate: null,
            status: 'active',
            fileSize: '0.9 MB',
            fileType: 'PDF',
            description: 'Certificado de curso de programación'
        },
        {
            id: 29,
            name: 'Historia Académica',
            category: 'education',
            categoryName: 'Educación',
            dateAdded: '2023-11-25',
            expirationDate: null,
            status: 'active',
            fileSize: '1.5 MB',
            fileType: 'PDF',
            description: 'Historia académica universitaria'
        },

        // === DOCUMENTOS ADICIONALES ===
        {
            id: 30,
            name: 'Carné de Vacunación',
            category: 'medical',
            categoryName: 'Médico',
            dateAdded: '2023-06-10',
            expirationDate: '2025-06-10',
            status: 'active',
            fileSize: '1.4 MB',
            fileType: 'PDF',
            description: 'Carné de vacunación completo'
        },
        {
            id: 31,
            name: 'Permiso de Trabajo',
            category: 'legal',
            categoryName: 'Legal',
            dateAdded: '2023-09-15',
            expirationDate: '2025-09-15',
            status: 'active',
            fileSize: '1.6 MB',
            fileType: 'PDF',
            description: 'Permiso de trabajo para extranjeros'
        },
        {
            id: 32,
            name: 'Certificado de Antecedentes',
            category: 'legal',
            categoryName: 'Legal',
            dateAdded: '2024-01-20',
            expirationDate: '2024-07-20',
            status: 'active',
            fileSize: '0.8 MB',
            fileType: 'PDF',
            description: 'Certificado de antecedentes penales'
        },
        {
            id: 33,
            name: 'Factura de Compra - Vehículo',
            category: 'financial',
            categoryName: 'Financiero',
            dateAdded: '2023-12-01',
            expirationDate: null,
            status: 'active',
            fileSize: '1.7 MB',
            fileType: 'PDF',
            description: 'Factura de compra de vehículo'
        },
        {
            id: 34,
            name: 'Certificado de Propiedad',
            category: 'legal',
            categoryName: 'Legal',
            dateAdded: '2023-05-20',
            expirationDate: null,
            status: 'active',
            fileSize: '3.8 MB',
            fileType: 'PDF',
            description: 'Certificado de propiedad inmobiliaria'
        },
        {
            id: 35,
            name: 'Recibo de Pago - Universidad',
            category: 'education',
            categoryName: 'Educación',
            dateAdded: '2024-01-15',
            expirationDate: null,
            status: 'active',
            fileSize: '0.5 MB',
            fileType: 'PDF',
            description: 'Recibo de pago de matrícula universitaria'
        }
    ];
    
    console.log('Documentos cargados:', allDocuments.length);
    
    // Aplicar filtros iniciales
    applyFilters();
    updateStats();
    
    console.log('Documentos renderizados correctamente');
}

// Aplicar filtros de URL
function applyUrlFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const filter = urlParams.get('filter');
    
    if (category) {
        currentFilters.category = category;
        if (categoryFilter) {
            categoryFilter.value = category;
        }
    }
    
    if (filter) {
        if (filter === 'expiring') {
            currentFilters.status = 'expiring_soon';
            if (statusFilter) {
                statusFilter.value = 'expiring_soon';
            }
        }
    }
    
    applyFilters();
}

// Manejar cambio de filtros
function handleFilterChange() {
    currentFilters.category = categoryFilter ? categoryFilter.value : '';
    currentFilters.status = statusFilter ? statusFilter.value : '';
    currentFilters.sortBy = sortBy ? sortBy.value : 'name';
    currentFilters.sortOrder = sortOrder ? sortOrder.value : 'asc';
    
    currentPage = 1; // Reset a la primera página
    applyFilters();
}

// Aplicar filtros
function applyFilters() {
    console.log('Aplicando filtros...');
    console.log('Documentos totales:', allDocuments.length);
    console.log('Filtros actuales:', currentFilters);
    
    filteredDocuments = [...allDocuments];
    
    // Filtrar por categoría
    if (currentFilters.category) {
        filteredDocuments = filteredDocuments.filter(doc => 
            doc.category === currentFilters.category
        );
        console.log('Después de filtrar por categoría:', filteredDocuments.length);
    }
    
    // Filtrar por estado
    if (currentFilters.status) {
        filteredDocuments = filteredDocuments.filter(doc => 
            doc.status === currentFilters.status
        );
        console.log('Después de filtrar por estado:', filteredDocuments.length);
    }
    
    // Ordenar
    filteredDocuments.sort((a, b) => {
        let aValue, bValue;
        
        switch (currentFilters.sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'date_added':
                aValue = new Date(a.dateAdded);
                bValue = new Date(b.dateAdded);
                break;
            case 'expiration_date':
                aValue = a.expirationDate ? new Date(a.expirationDate) : new Date('2099-12-31');
                bValue = b.expirationDate ? new Date(b.expirationDate) : new Date('2099-12-31');
                break;
            case 'category':
                aValue = a.categoryName.toLowerCase();
                bValue = b.categoryName.toLowerCase();
                break;
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
        }
        
        if (currentFilters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    console.log('Documentos filtrados finales:', filteredDocuments.length);
    
    renderDocuments();
    updatePagination();
}

// Limpiar filtros
function clearFilters() {
    currentFilters = {
        category: '',
        status: '',
        sortBy: 'name',
        sortOrder: 'asc'
    };
    
    if (categoryFilter) categoryFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    if (sortBy) sortBy.value = 'name';
    if (sortOrder) sortOrder.value = 'asc';
    
    currentPage = 1;
    applyFilters();
}

// Manejar búsqueda
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    
    if (query.length < 2) {
        applyFilters();
        return;
    }
    
    filteredDocuments = allDocuments.filter(doc => 
        doc.name.toLowerCase().includes(query) ||
        doc.categoryName.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query)
    );
    
    currentPage = 1;
    renderDocuments();
    updatePagination();
}

// Toggle de vista
function toggleView() {
    currentView = currentView === 'grid' ? 'list' : 'grid';
    updateViewIcons();
    renderDocuments();
}

// Toggle de vista móvil
function toggleMobileView() {
    currentView = currentView === 'grid' ? 'list' : 'grid';
    updateViewIcons();
    renderDocuments();
}

// Actualizar iconos de vista
function updateViewIcons() {
    if (currentView === 'grid') {
        if (viewIcon) viewIcon.className = 'fas fa-th';
        if (viewText) viewText.textContent = 'Vista Grid';
        if (mobileViewIcon) mobileViewIcon.className = 'fas fa-th';
        if (mobileViewText) mobileViewText.textContent = 'Vista Grid';
    } else {
        if (viewIcon) viewIcon.className = 'fas fa-list';
        if (viewText) viewText.textContent = 'Vista Lista';
        if (mobileViewIcon) mobileViewIcon.className = 'fas fa-list';
        if (mobileViewText) mobileViewText.textContent = 'Vista Lista';
    }
}

// Toggle de filtros móvil
function toggleMobileFilters() {
    if (filtersSection && filterChevron) {
        const isVisible = filtersSection.classList.contains('show');
        
        if (isVisible) {
            filtersSection.classList.remove('show');
            filterChevron.className = 'fas fa-chevron-down';
        } else {
            filtersSection.classList.add('show');
            filterChevron.className = 'fas fa-chevron-up';
        }
    }
}

// Renderizar documentos
function renderDocuments() {
    console.log('Renderizando documentos...');
    console.log('Container:', documentsContainer);
    console.log('Documentos filtrados:', filteredDocuments.length);
    
    if (!documentsContainer) {
        console.error('No se encontró el contenedor de documentos');
        return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const documentsToShow = filteredDocuments.slice(startIndex, endIndex);
    
    console.log('Documentos a mostrar:', documentsToShow.length);
    
    if (documentsToShow.length === 0) {
        console.log('No hay documentos para mostrar, mostrando estado vacío');
        documentsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <h3>No se encontraron documentos</h3>
                <p>Intenta ajustar los filtros o agregar un nuevo documento</p>
                <button class="btn btn-primary" onclick="handleAddDocument()">
                    <i class="fas fa-plus"></i>
                    Agregar Documento
                </button>
            </div>
        `;
        return;
    }
    
    const containerClass = currentView === 'grid' ? 'documents-grid' : 'documents-list';
    documentsContainer.className = `documents-container ${containerClass}`;
    
    const documentsHTML = documentsToShow.map(doc => createDocumentCard(doc)).join('');
    documentsContainer.innerHTML = documentsHTML;
    
    console.log('Documentos renderizados correctamente');
}

// Crear tarjeta de documento
function createDocumentCard(document) {
    const statusClass = document.status === 'expiring_soon' ? 'urgent' : 
                      document.status === 'expired' ? 'expired' : '';
    
    const statusText = document.status === 'active' ? 'Activo' :
                      document.status === 'expiring_soon' ? 'Próximo a vencer' :
                      document.status === 'expired' ? 'Vencido' : 'Desconocido';
    
    const statusClassCss = document.status === 'active' ? 'active' :
                          document.status === 'expiring_soon' ? 'expiring' :
                          document.status === 'expired' ? 'expired' : '';
    
    const expirationText = document.expirationDate ? 
        `Vence: ${formatDate(document.expirationDate)}` : 
        'Sin vencimiento';
    
    const daysLeft = document.expirationDate ? 
        Math.ceil((new Date(document.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    
    const daysLeftText = daysLeft !== null ? 
        (daysLeft > 0 ? ` (${daysLeft} días)` : ' (Vencido)') : '';
    
    return `
        <div class="document-card ${statusClass}" data-document-id="${document.id}">
            <div class="document-card-header">
                <div class="document-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="document-actions">
                    <button class="action-btn" onclick="viewDocument(${document.id})" title="Ver documento">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editDocument(${document.id})" title="Editar documento">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="downloadDocument(${document.id})" title="Descargar documento">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="action-btn danger" onclick="deleteDocument(${document.id})" title="Eliminar documento">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="document-info">
                <h3 class="document-name">${document.name}</h3>
                <div class="document-category">
                    <span class="category-badge">${document.categoryName}</span>
                </div>
                <div class="document-meta">
                    <div class="document-date">
                        <i class="fas fa-calendar"></i>
                        ${expirationText}${daysLeftText}
                    </div>
                    <div class="document-date">
                        <i class="fas fa-file"></i>
                        ${document.fileType} • ${document.fileSize}
                    </div>
                    <div class="document-date">
                        <i class="fas fa-plus-circle"></i>
                        Agregado: ${formatDate(document.dateAdded)}
                    </div>
                </div>
                <div class="document-status ${statusClassCss}">${statusText}</div>
            </div>
        </div>
    `;
}

// Actualizar estadísticas
function updateStats() {
    console.log('Actualizando estadísticas...');
    
    const total = allDocuments.length;
    const active = allDocuments.filter(doc => doc.status === 'active').length;
    const expiring = allDocuments.filter(doc => doc.status === 'expiring_soon').length;
    const expired = allDocuments.filter(doc => doc.status === 'expired').length;
    
    console.log('Estadísticas:', { total, active, expiring, expired });
    
    if (totalDocumentsCount) {
        totalDocumentsCount.textContent = total;
        console.log('Total actualizado:', total);
    } else {
        console.error('No se encontró totalDocumentsCount');
    }
    
    if (activeDocumentsCount) {
        activeDocumentsCount.textContent = active;
        console.log('Activos actualizados:', active);
    } else {
        console.error('No se encontró activeDocumentsCount');
    }
    
    if (expiringDocumentsCount) {
        expiringDocumentsCount.textContent = expiring;
        console.log('Próximos a vencer actualizados:', expiring);
    } else {
        console.error('No se encontró expiringDocumentsCount');
    }
    
    if (expiredDocumentsCount) {
        expiredDocumentsCount.textContent = expired;
        console.log('Vencidos actualizados:', expired);
    } else {
        console.error('No se encontró expiredDocumentsCount');
    }
}

// Actualizar paginación
function updatePagination() {
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage === 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    if (paginationInfo) {
        paginationInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
    
    if (paginationPages) {
        generatePaginationNumbers(totalPages);
    }
}

// Generar números de paginación
function generatePaginationNumbers(totalPages) {
    if (totalPages <= 1) {
        paginationPages.innerHTML = '';
        return;
    }
    
    let pagesHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        pagesHTML += `<button class="page-number ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    paginationPages.innerHTML = pagesHTML;
}

// Navegación de páginas
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderDocuments();
        updatePagination();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderDocuments();
        updatePagination();
    }
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderDocuments();
        updatePagination();
    }
}

// Funciones de documentos
function viewDocument(id) {
    const document = allDocuments.find(doc => doc.id === id);
    if (document) {
        console.log(`Viendo documento: ${document.name}`);
        alert(`Viendo documento: ${document.name}`);
        // Aquí implementarías la navegación al detalle del documento
    }
}

function editDocument(id) {
    const document = allDocuments.find(doc => doc.id === id);
    if (document) {
        console.log(`Editando documento: ${document.name}`);
        alert(`Editando documento: ${document.name}`);
        // Aquí implementarías la navegación a la edición del documento
    }
}

function downloadDocument(id) {
    const document = allDocuments.find(doc => doc.id === id);
    if (document) {
        console.log(`Descargando: ${document.name}`);
        alert(`Descargando: ${document.name}`);
        // Aquí implementarías la descarga del documento
    }
}

function deleteDocument(id) {
    const document = allDocuments.find(doc => doc.id === id);
    if (document) {
        if (confirm(`¿Estás seguro de que quieres eliminar "${document.name}"?`)) {
            allDocuments = allDocuments.filter(doc => doc.id !== id);
            applyFilters();
            updateStats();
            console.log(`Documento "${document.name}" eliminado`);
            alert(`Documento "${document.name}" eliminado`);
        }
    }
}

function handleAddDocument() {
    console.log('Función de agregar documento en desarrollo');
    alert('Función de agregar documento en desarrollo');
    // Aquí implementarías la navegación al formulario de agregar documento
}

// Manejar redimensionamiento de ventana
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        // Cerrar sidebar móvil si está abierto
        const sidebar = document.getElementById('dashboardSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar && overlay) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        }
        
        // Cerrar filtros móviles si están abiertos
        if (filtersSection) {
            filtersSection.classList.remove('show');
            if (filterChevron) {
                filterChevron.className = 'fas fa-chevron-down';
            }
        }
    }
});

// Detectar si es dispositivo móvil
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// Optimización para touch en móvil
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // Mejorar la experiencia táctil
    document.addEventListener('touchstart', function() {}, {passive: true});
    document.addEventListener('touchmove', function() {}, {passive: true});
}

// Prevenir zoom en inputs en iOS
document.addEventListener('touchstart', function(event) {
    if (event.target.tagName === 'SELECT' || event.target.tagName === 'INPUT') {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
});

// Restaurar zoom después de un delay
document.addEventListener('touchend', function() {
    setTimeout(function() {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
    }, 500);
});

// Función auxiliar para formatear fechas
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return dateString;
    }
}
