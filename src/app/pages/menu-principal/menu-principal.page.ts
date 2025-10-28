import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentStorageService } from '../../services/document-storage.service';
import { NotificationService } from '../../services/notification.service';
import { DocumentoGeneral } from '../../models/documento-general.model';
import { Login } from '../../services/login';
import { firstValueFrom } from 'rxjs';
import { 
  IonContent, 
  IonButton,
  IonIcon,
  IonSearchbar,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  documentText, 
  documents, 
  checkmarkCircle, 
  warning, 
  alertCircle,
  search,
  calendarOutline,
  timeOutline,
  createOutline,
  trashOutline,
  chevronBackOutline,
  chevronForwardOutline,
  camera,
  add
} from 'ionicons/icons';

interface Documento {
  id: number;
  nombre: string;
  categoria: string;
  fechaAgregado: string;
  fechaEmision?: string;
  fechaVencimiento?: string;
  estado: 'active' | 'expiring_soon' | 'expired';
  tipo: string;
  tamano: string;
}

@Component({
  selector: 'app-menu-principal',
  templateUrl: './menu-principal.page.html',
  styleUrls: ['./menu-principal.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonButton,
    IonIcon,
    IonSearchbar,
    IonBadge,
    IonRefresher,
    IonRefresherContent,
    IonFab,
    IonFabButton,
    CommonModule, 
    FormsModule
  ]
})
export class MenuPrincipalPage implements OnInit {
  
  // Servicios
  private auth = inject(Login);
  
  // Información del usuario autenticado
  userId: string | null = null;
  
  // Datos cargados desde almacenamiento local
  documentos: Documento[] = [];
  documentosCargados: boolean = false;

  // Filtros
  categoriaFiltro: string = '';
  estadoFiltro: string = '';
  ordenarPor: string = 'name';
  orden: string = 'asc';
  terminoBusqueda: string = '';
  
  // Vista
  vistaGrid: boolean = true;
  
  // Estadísticas
  totalDocumentos: number = 0;
  documentosActivos: number = 0;
  documentosPorVencer: number = 0;
  documentosVencidos: number = 0;

  // Paginación
  paginaActual: number = 1;
  documentosPorPagina: number = 6;
  totalPaginas: number = 1;

  constructor(
    private router: Router,
    private documentStorageService: DocumentStorageService,
    private notificationService: NotificationService
  ) {
    addIcons({ 
      documentText, 
      documents, 
      checkmarkCircle, 
      warning, 
      alertCircle,
      search,
      calendarOutline,
      timeOutline,
      createOutline,
      trashOutline,
      chevronBackOutline,
      chevronForwardOutline,
      camera,
      add
    });
  }

  async ngOnInit() {
    // Obtener usuario autenticado
    const user = await firstValueFrom(this.auth.user$);
    if (!user) {
      console.error('No hay usuario autenticado');
      this.router.navigateByUrl('/login');
      return;
    }
    
    this.userId = user.uid;
    console.log('Usuario autenticado:', this.userId);
    
    // Inicializar y verificar notificaciones
    await this.inicializarNotificaciones();
    
    await this.cargarDocumentos();
    this.calcularEstadisticas();
    this.totalPaginas = Math.ceil(this.documentos.length / this.documentosPorPagina);
  }

  /**
   * Inicializar y verificar notificaciones para documentos próximos a vencer
   */
  async inicializarNotificaciones() {
    try {
      console.log('Inicializando notificaciones en menu-principal...');
      
      // Verificar permisos
      const tienePermisos = await this.notificationService.solicitarPermisos();
      
      if (!tienePermisos) {
        console.warn('Permisos de notificación no concedidos');
        return;
      }
      
      // Verificar y programar notificaciones para todos los documentos
      await this.notificationService.verificarYProgramarNotificaciones();
      
      // Obtener y mostrar documentos próximos a vencer
      const documentosProximos = await this.notificationService.verificarDocumentosProximosAVencer(7);
      console.log('Documentos próximos a vencer (7 días):', documentosProximos.length);
      
      if (documentosProximos.length > 0) {
        console.log('Documentos próximos a vencer:', documentosProximos);
      }
    } catch (error) {
      console.error('Error inicializando notificaciones:', error);
    }
  }

  async ionViewWillEnter() {
    // Recargar documentos cada vez que se entra a la página
    await this.cargarDocumentos();
    this.calcularEstadisticas();
    this.totalPaginas = Math.ceil(this.documentos.length / this.documentosPorPagina);
  }

  async cargarDocumentos() {
    try {
      if (!this.userId) {
        console.error('No hay usuario autenticado');
        this.documentos = [];
        return;
      }
      
      console.log('Cargando documentos del usuario:', this.userId);
      const documentosGuardados = await this.documentStorageService.obtenerDocumentosPorUsuario(this.userId);
      
      console.log('Documentos obtenidos del storage:', documentosGuardados);
      console.log('Cantidad de documentos:', documentosGuardados.length);
      
      this.documentos = documentosGuardados.map((doc: DocumentoGeneral) => this.convertirADocumentoVista(doc));
      this.documentosCargados = true;
      
      console.log('Documentos convertidos para vista:', this.documentos.length);
      console.log('Documentos en vista:', this.documentos);
      
      // Recalcular paginación
      this.totalPaginas = Math.ceil(this.documentos.length / this.documentosPorPagina);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      this.documentos = [];
    }
  }

  private convertirADocumentoVista(docGeneral: DocumentoGeneral): Documento {
    console.log('Convirtiendo documento:', docGeneral);
    
    // Determinar estado basado en fechas
    let estado: 'active' | 'expiring_soon' | 'expired' = 'active';
    
    if (docGeneral.fechaExpiracion) {
      const fechaExpiracion = this.convertirFechaADate(docGeneral.fechaExpiracion);
      if (fechaExpiracion) {
        const hoy = new Date();
        const diasRestantes = Math.ceil((fechaExpiracion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes < 0) {
          estado = 'expired';
        } else if (diasRestantes <= 30) {
          estado = 'expiring_soon';
        } else {
          estado = 'active';
        }
      }
    }

    // Usar el nombre del documento si existe, si no generar uno basado en el tipo
    let nombre: string;
    if (docGeneral.nombre && docGeneral.nombre.trim() !== '') {
      nombre = docGeneral.nombre;
    } else {
      // Fallback: generar nombre como antes si no existe
      nombre = docGeneral.tipoDocumento;
      if (docGeneral.numeroDocumento && docGeneral.numeroDocumento !== '') {
        nombre += ' - ' + docGeneral.numeroDocumento;
      }
    }

    // Convertir fecha de creación a string ISO si es necesario
    let fechaAgregado: string;
    if (docGeneral.fechaCreacion) {
      if (docGeneral.fechaCreacion instanceof Date) {
        fechaAgregado = docGeneral.fechaCreacion.toISOString();
      } else if (typeof docGeneral.fechaCreacion === 'string') {
        fechaAgregado = docGeneral.fechaCreacion;
      } else {
        // Si viene de JSON puede ser un objeto con propiedades
        fechaAgregado = new Date().toISOString();
      }
    } else {
      fechaAgregado = new Date().toISOString();
    }

    // Convertir fecha de vencimiento a Date si existe
    let fechaVencimiento: string | undefined;
    if (docGeneral.fechaExpiracion) {
      const fechaConvertida = this.convertirFechaADate(docGeneral.fechaExpiracion);
      if (fechaConvertida) {
        fechaVencimiento = fechaConvertida.toISOString();
      }
    }

    const documento = {
      id: parseInt(docGeneral.id?.replace('doc_', '') || '0'),
      nombre,
      categoria: this.mapearTipoACategoria(docGeneral.tipoDocumento),
      fechaAgregado,
      fechaEmision: docGeneral.fechaEmision,
      fechaVencimiento,
      estado,
      tipo: 'IMAGEN',
      tamano: 'N/A'
    };
    
    console.log('Documento convertido:', documento);
    return documento;
  }

  private mapearTipoACategoria(tipoDocumento: string): string {
    const mapeo: { [key: string]: string } = {
      'Cedula de identidad': 'identification',
      'Licencia de Conducir': 'identification',
      'Otros': 'general'
    };
    return mapeo[tipoDocumento] || 'general';
  }

  private convertirFechaADate(fecha: string): Date | null {
    try {
      const [dia, mes, año] = fecha.split('/').map(Number);
      return new Date(año, mes - 1, dia);
    } catch (error) {
      return null;
    }
  }

  calcularEstadisticas() {
    this.totalDocumentos = this.documentos.length;
    this.documentosActivos = this.documentos.filter(d => d.estado === 'active').length;
    this.documentosPorVencer = this.documentos.filter(d => d.estado === 'expiring_soon').length;
    this.documentosVencidos = this.documentos.filter(d => d.estado === 'expired').length;
  }

  getDocumentosFiltrados(): Documento[] {
    let documentosFiltrados = [...this.documentos];

    // Filtrar por categoría
    if (this.categoriaFiltro) {
      documentosFiltrados = documentosFiltrados.filter(d => d.categoria === this.categoriaFiltro);
    }

    // Filtrar por estado
    if (this.estadoFiltro) {
      documentosFiltrados = documentosFiltrados.filter(d => d.estado === this.estadoFiltro);
    }

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda) {
      const termino = this.terminoBusqueda.toLowerCase();
      documentosFiltrados = documentosFiltrados.filter(d => 
        d.nombre.toLowerCase().includes(termino) ||
        d.categoria.toLowerCase().includes(termino)
      );
    }

    // Ordenar
    documentosFiltrados.sort((a, b) => {
      let valorA: any, valorB: any;
      
      switch (this.ordenarPor) {
        case 'name':
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
          break;
        case 'date_added':
          valorA = new Date(a.fechaAgregado);
          valorB = new Date(b.fechaAgregado);
          break;
        case 'expiration_date':
          valorA = a.fechaVencimiento ? new Date(a.fechaVencimiento) : new Date('9999-12-31');
          valorB = b.fechaVencimiento ? new Date(b.fechaVencimiento) : new Date('9999-12-31');
          break;
        case 'category':
          valorA = a.categoria;
          valorB = b.categoria;
          break;
        default:
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
      }

      if (this.orden === 'asc') {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

    return documentosFiltrados;
  }

  getDocumentosPaginados(): Documento[] {
    const documentosFiltrados = this.getDocumentosFiltrados();
    const inicio = (this.paginaActual - 1) * this.documentosPorPagina;
    const fin = inicio + this.documentosPorPagina;
    return documentosFiltrados.slice(inicio, fin);
  }

  cambiarVista() {
    this.vistaGrid = !this.vistaGrid;
  }

  limpiarFiltros() {
    this.categoriaFiltro = '';
    this.estadoFiltro = '';
    this.terminoBusqueda = '';
    this.ordenarPor = 'name';
    this.orden = 'asc';
    this.paginaActual = 1;
  }

  onBuscar(event: any) {
    this.terminoBusqueda = event.detail.value;
    this.paginaActual = 1;
  }

  onFiltroCambio() {
    this.paginaActual = 1;
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    const documentosFiltrados = this.getDocumentosFiltrados();
    const totalPaginas = Math.ceil(documentosFiltrados.length / this.documentosPorPagina);
    if (this.paginaActual < totalPaginas) {
      this.paginaActual++;
    }
  }

  irAPagina(pagina: number) {
    this.paginaActual = pagina;
  }

  getTotalPaginas(): number {
    const documentosFiltrados = this.getDocumentosFiltrados();
    return Math.ceil(documentosFiltrados.length / this.documentosPorPagina);
  }

  getIconoCategoria(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'identification': 'id-card',
      'legal': 'gavel',
      'medical': 'heartbeat',
      'financial': 'dollar-sign',
      'education': 'graduation-cap'
    };
    return iconos[categoria] || 'file';
  }

  getColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'active': 'success',
      'expiring_soon': 'warning',
      'expired': 'danger'
    };
    return colores[estado] || 'medium';
  }

  getTextoEstado(estado: string): string {
    const textos: { [key: string]: string } = {
      'active': 'Activo',
      'expiring_soon': 'Por vencer',
      'expired': 'Vencido'
    };
    return textos[estado] || 'Desconocido';
  }

  async onRefresh(event: any) {
    await this.cargarDocumentos();
    this.calcularEstadisticas();
    event.target.complete();
  }

  agregarDocumento() {
    this.router.navigateByUrl('/gestion-docu');
  }

  verDocumento(documento: Documento) {
    // Navegar a gestión con el ID del documento
    console.log('Ver documento:', documento);
    this.router.navigate(['/gestion-docu', documento.id]);
  }

  editarDocumento(documento: Documento) {
    // Navegar a gestión con el ID del documento
    console.log('Editar documento:', documento);
    this.router.navigate(['/gestion-docu', documento.id]);
  }

  async eliminarDocumento(documento: Documento) {
    try {
      if (!this.userId) {
        console.error('No hay usuario autenticado');
        return;
      }
      
      // Buscar el ID real del documento en el almacenamiento
      const documentosGuardados = await this.documentStorageService.obtenerDocumentosPorUsuario(this.userId);
      const documentoEliminar = documentosGuardados.find((doc: DocumentoGeneral) => 
        parseInt(doc.id?.replace('doc_', '') || '0') === documento.id
      );

      if (documentoEliminar && documentoEliminar.id) {
        await this.documentStorageService.eliminarDocumento(documentoEliminar.id, this.userId);
        
        // Recargar documentos
        await this.cargarDocumentos();
        this.calcularEstadisticas();
        
        console.log('Documento eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error al eliminar documento:', error);
    }
  }
}
