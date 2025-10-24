export interface DocumentoGeneral {
  id?: string;
  fechaEmision: string;
  fechaExpiracion: string;
  tipoDocumento: string;
  numeroDocumento?: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  lugarNacimiento?: string;
  domicilio?: string;
  estadoCivil?: string;
  grupoSanguineo?: string;
  profesion?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface DocumentoGeneralForm {
  fechaEmision: string;
  fechaExpiracion: string;
  tipoDocumento: string;
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
