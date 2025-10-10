import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro-usuario.page.html',
  styleUrls: ['./registro-usuario.page.scss'],
})
export class RegistroUsuarioPage {
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal<string | null>(null);
  showPass = signal(false);
  showPassConfirm = signal(false);

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required, Validators.minLength(6)]],
    terms: [false, [Validators.requiredTrue]],
  });

  togglePwd() { this.showPass.update(v => !v); }
  toggleConfirm() { this.showPassConfirm.update(v => !v); }
  showPwd() { return this.showPass(); }
  showConfirm() { return this.showPassConfirm(); }

  // Solo vista: aquí NO llamamos a Firebase. Validación mínima de UI.
  onSubmit() {
    this.error.set(null);
    if (this.form.invalid) return;

    const { password, confirm } = this.form.value;
    if (password !== confirm) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    // Aquí iría tu lógica real de registro (Firebase).
    // Dejamos un estado visual para que veas el loading.
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      // Navegación real la harás cuando conectes Firebase:
      // this.router.navigateByUrl('/home', { replaceUrl: true });
    }, 1000);
  }
}
