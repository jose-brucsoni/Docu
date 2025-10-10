import { Component, inject, signal,NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from 'src/app/services/login'; // Tu servicio Firebase

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  // --- Dependencias ---
  private fb = inject(FormBuilder);
  private auth = inject(Login);
  private router = inject(Router);
  private zone = inject(NgZone);

  // --- Estados reactivos ---
  loading = signal(false);
  error = signal<string | null>(null);

  // --- Formulario reactivo ---
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // --- Inicio de sesión ---
  async onLogin() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.loginForm.value;

    try {
      await this.auth.loginEmail(email!, password!).toPromise();
      this.zone.run(() => {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }); 
    } catch (e: any) {
      this.error.set(this.humanizeError(e?.code || e?.message));
    } finally {
      this.loading.set(false);
    }
  }

  // --- Registro de usuario ---
  async onRegister() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.loginForm.value;

    try {
      await this.auth.registerEmail(email!, password!).toPromise();
      await this.router.navigateByUrl('/', { replaceUrl: true });
    } catch (e: any) {
      this.error.set(this.humanizeError(e?.code || e?.message));
    } finally {
      this.loading.set(false);
    }
  }

  // --- Mapeo de errores de Firebase a mensajes legibles ---
  private humanizeError(code: string): string {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Credenciales inválidas.';
      case 'auth/email-already-in-use':
        return 'El correo ya está en uso.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil.';
      case 'auth/popup-closed-by-user':
        return 'Se cerró la ventana de Google.';
      default:
        return 'Ocurrió un error. Intenta de nuevo.';
    }
  }
}
