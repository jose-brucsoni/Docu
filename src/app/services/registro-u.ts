import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class RegistroUService {
  private db = inject(Firestore);
  private auth = inject(Auth);

  async registrarUsuario(nombre: string, apellido: string, email: string, password: string) {
    // 1️⃣ Crear usuario en Firebase Authentication
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    // 2️⃣ Actualizar su nombre visible en Auth
    await updateProfile(cred.user, {
      displayName: `${nombre} ${apellido}`,
    });

    // 3️⃣ Crear registro en Firestore
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
