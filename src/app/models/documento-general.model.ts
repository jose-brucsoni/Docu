export interface DocumentoGeneral {
  id?: string;
  userId?: string; // ID del usuario propietario del documento
  nombre?: string; // Nombre/título del documento
  fechaEmision: string;
  fechaExpiracion: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento?: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  lugarNacimiento?: string;
  domicilio?: string;
  estadoCivil?: string;
  grupoSanguineo?: string;
  profesion?: string;
  imagenPath?: string; // Ruta de la imagen guardada localmente
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface DocumentoGeneralForm {
  nombre?: string; // Nombre/título del documento
  fechaEmision: string;
  fechaExpiracion: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  domicilio: string;
  estadoCivil: string;
  grupoSanguineo: string;
  profesion: string;
}

export interface FechasExtraidas {
  fechaEmision: string | null;
  fechaExpiracion: string | null;
  esValida: boolean;
  mensajeError?: string;
}

// Tipos de documento disponibles
export type TipoDocumento = 'Cedula de identidad' | 'Licencia de Conducir' | 'Otros';

// Opciones de tipo de documento para el selector
export const OPCIONES_TIPO_DOCUMENTO: { value: TipoDocumento; label: string; icon: string }[] = [
  { value: 'Cedula de identidad', label: 'Cédula de Identidad', icon: 'card' },
  { value: 'Licencia de Conducir', label: 'Licencia de Conducir', icon: 'car' },
  { value: 'Otros', label: 'Otros', icon: 'document' }
];
