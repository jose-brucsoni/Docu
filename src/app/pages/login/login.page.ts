import { Component, inject, signal,NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {firstValueFrom}from 'rxjs';
import { Login } from 'src/app/services/login'; // Tu servicio Firebase

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule,RouterLink],
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
  showPassword = signal(false);

  // --- Formulario reactivo ---
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false],
  });

  togglePwd() { this.showPassword.update(v => !v); }
  showPwd() { return this.showPassword(); }

  // --- Inicio de sesión ---
  async onLogin() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.loginForm.value;
    //si el usuario existe entra a home
    try {
      await this.auth.loginEmail(email!, password!).toPromise();
      this.zone.run(() => {
        this.router.navigateByUrl('/menu-principal', { replaceUrl: true });
      }); 
    } catch (e: any) {
      this.error.set(this.humanizeError(e?.code || e?.message));
    } finally {
      this.loading.set(false);
    }
  }

   async onForgot() {
    const email = this.loginForm.value.email?.trim();
    if (!email) { this.error.set('Ingresa tu correo para recuperar la contraseña.'); return; }
    try {
      await firstValueFrom(this.auth.resetPassword(email)); 
      this.error.set('Te enviamos un enlace de recuperación a tu correo.');
    } catch (e: any) {
      this.error.set(this.humanizeError(e?.code || e?.message));
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
