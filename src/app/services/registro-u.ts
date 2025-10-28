import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Usuario } from '../models/usuario.model';

/**
 * Servicio para el registro de nuevos usuarios
 * Maneja la creación de cuentas y perfiles de usuario en Firebase
 */
@Injectable({
  providedIn: 'root'
})
export class RegistroUService {
  private db = inject(Firestore);
  private auth = inject(Auth);

  /**
   * Registra un nuevo usuario en el sistema
   * Crea la cuenta en Firebase Authentication y el perfil en Firestore
   * 
   * @param nombre - Nombre del usuario
   * @param apellido - Apellido del usuario
   * @param email - Correo electrónico (se usará para login)
   * @param password - Contraseña (mínimo 6 caracteres)
   * @returns Usuario de Firebase Auth creado
   * @throws Error si el email ya existe o la contraseña es inválida
   * 
   * @description 
   * El proceso de registro incluye:
   * 1. Crear usuario en Firebase Authentication
   * 2. Actualizar el displayName con nombre y apellido
   * 3. Crear perfil en Firestore con timestamp de creación
   * 4. Retornar el usuario creado
   */
  async registrarUsuario(nombre: string, apellido: string, email: string, password: string) {
    // Crear usuario en Firebase Authentication
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    // Actualizar su nombre visible en Auth
    await updateProfile(cred.user, {
      displayName: `${nombre} ${apellido}`,
    });

    // Crear registro en Firestore
    const usuario: Usuario = {
      id: cred.user.uid,
      nombre,
      apellido,
      email: cred.user.email!,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    };

    const ref = doc(this.db, 'users', usuario.id);
    await setDoc(ref, usuario);

    return cred.user;
  }

}
export class RegistroU {
  
}
