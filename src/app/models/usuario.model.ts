export interface Usuario {
    id: string;          // mismo id que el UID del usuario en Auth
    nombre: string;
    apellido: string;
    email: string;
    creadoEn: any;       // serverTimestamp()
    actualizadoEn: any;  // serverTimestamp()   
}
