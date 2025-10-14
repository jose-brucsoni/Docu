import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonMenu,
  IonMenuButton,
  IonButtons,
  IonPopover,
  IonList,
  IonAvatar,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';

interface Documento {
  id: number;
  nombre: string;
  categoria: string;
  fechaAgregado: string;
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
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonMenu,
    IonMenuButton,
    IonButtons,
    IonPopover,
    IonList,
    IonAvatar,
    IonFab,
    IonFabButton,
    CommonModule, 
    FormsModule
  ]
})
export class MenuPrincipalPage implements OnInit {
  
  // Datos hardcodeados
  documentos: Documento[] = [
    {
      id: 1,
      nombre: 'Cédula de Identidad',
      categoria: 'identification',
      fechaAgregado: '2024-01-15',
      fechaVencimiento: '2029-01-15',
      estado: 'active',
      tipo: 'PDF',
      tamano: '2.3 MB'
    },
    {
      id: 2,
      nombre: 'Pasaporte',
      categoria: 'identification',
      fechaAgregado: '2024-02-10',
      fechaVencimiento: '2024-12-10',
      estado: 'expiring_soon',
      tipo: 'PDF',
      tamano: '1.8 MB'
    },
    {
      id: 3,
      nombre: 'Contrato de Trabajo',
      categoria: 'legal',
      fechaAgregado: '2023-12-01',
      fechaVencimiento: '2024-12-01',
      estado: 'expired',
      tipo: 'PDF',
      tamano: '3.2 MB'
    },
    {
      id: 4,
      nombre: 'Examen Médico',
      categoria: 'medical',
      fechaAgregado: '2024-03-05',
      fechaVencimiento: '2025-03-05',
      estado: 'active',
      tipo: 'PDF',
      tamano: '1.5 MB'
    },
    {
      id: 5,
      nombre: 'Estado de Cuenta Bancario',
      categoria: 'financial',
      fechaAgregado: '2024-03-20',
      fechaVencimiento: '2024-04-20',
      estado: 'expiring_soon',
      tipo: 'PDF',
      tamano: '0.8 MB'
    },
    {
      id: 6,
      nombre: 'Título Universitario',
      categoria: 'education',
      fechaAgregado: '2023-06-15',
      estado: 'active',
      tipo: 'PDF',
      tamano: '4.1 MB'
    }
  ];

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

  constructor() { }

  ngOnInit() {
    this.calcularEstadisticas();
    this.totalPaginas = Math.ceil(this.documentos.length / this.documentosPorPagina);
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

  onRefresh(event: any) {
    setTimeout(() => {
      this.calcularEstadisticas();
      event.target.complete();
    }, 1000);
  }

  agregarDocumento() {
    console.log('Agregar documento');
    // Aquí iría la lógica para agregar un nuevo documento
  }

  verDocumento(documento: Documento) {
    console.log('Ver documento:', documento);
    // Aquí iría la lógica para ver el documento
  }

  editarDocumento(documento: Documento) {
    console.log('Editar documento:', documento);
    // Aquí iría la lógica para editar el documento
  }

  eliminarDocumento(documento: Documento) {
    console.log('Eliminar documento:', documento);
    // Aquí iría la lógica para eliminar el documento
  }
}
