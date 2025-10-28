import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup, User } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc, serverTimestamp, getDoc } from '@angular/fire/firestore';
import { from, map, switchMap } from 'rxjs';
import {sendPasswordResetEmail}from '@angular/fire/auth';

/**
 * Servicio de autenticación y gestión de usuarios
 * Maneja el login, registro, cierre de sesión y recuperación de contraseña con Firebase
 */
@Injectable({
  providedIn: 'root'
})
export class Login {
  private auth = inject(Auth);
  private db = inject(Firestore);

  /** 
   * Observable del estado de autenticación del usuario
   * Emite el usuario actual o null si no hay sesión activa
   * Se actualiza automáticamente cuando cambia el estado de autenticación
   */
  user$ = authState(this.auth);

  /** 
   * Observable del perfil completo del usuario en Firestore
   * Combina los datos de Firebase Auth con el perfil en la colección 'users'
   * Retorna null si no hay usuario autenticado
   */
  userDoc$ = this.user$.pipe(
    switchMap(user => {
      if (!user) return [null];
      const ref = doc(this.db, 'users', user.uid);
      return docData(ref).pipe(map(d => ({ uid: user.uid, ...d } as any)));
    })
  );

  /** 
   * Inicia sesión con email y contraseña
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Observable que emite las credenciales del usuario autenticado
   * @throws Error si las credenciales son inválidas
   */
  loginEmail(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  /**
   * Envía un email de recuperación de contraseña
   * @param email - Correo electrónico del usuario que olvidó la contraseña
   * @returns Observable con el resultado de la operación
   */
  resetPassword(email: string) {
  return from(sendPasswordResetEmail(this.auth, email));
  }

  /** 
   * Registra un nuevo usuario con email y contraseña
   * Crea el registro en Firebase Auth y crea el perfil en Firestore si no existe
   * @param email - Correo electrónico para el registro
   * @param password - Contraseña para el registro (mínimo 6 caracteres)
   * @param displayName - Nombre para mostrar (opcional)
   * @returns Observable con las credenciales del usuario registrado
   * @throws Error si el email ya está en uso o la contraseña es débil
   */
  registerEmail(email: string, password: string, displayName?: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(async cred => {
        if (displayName) {
          await updateProfile(cred.user, { displayName });
        }
        await this.ensureUserDoc(cred.user);
        return cred;
      })
    );
  }

  /**
   * Cierra la sesión del usuario actual
   * Elimina la sesión de Firebase Auth
   * @returns Observable con el resultado de la operación
   */
  logout() {
    return from(signOut(this.auth));
  }

  /**
   * Crea el registro del usuario en Firestore si no existe
   * Se llama automáticamente durante el registro
   * @param user - Usuario de Firebase Auth
   * @private
   */
  private async ensureUserDoc(user: User) {
    const ref = doc(this.db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
        role: 'user'
      });
    }
  }
} 