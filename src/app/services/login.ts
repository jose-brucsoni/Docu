import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup, User } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc, serverTimestamp, getDoc } from '@angular/fire/firestore';
import { from, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Login {
  private auth = inject(Auth);
  private db = inject(Firestore);

  /** Observable del usuario de Firebase (o null) */
  user$ = authState(this.auth);

  /** Perfil en Firestore /users/{uid} (o null) */
  userDoc$ = this.user$.pipe(
    switchMap(user => {
      if (!user) return [null];
      const ref = doc(this.db, 'users', user.uid);
      return docData(ref).pipe(map(d => ({ uid: user.uid, ...d } as any)));
    })
  );

  /** Login con email y clave */
  loginEmail(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  /** Registro con email/clave (y crea perfil en Firestore si no existe) */
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

  // Cerrar sesión
  logout() {
    return from(signOut(this.auth));
  }

  // Crea el registro de usuario si no existe
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