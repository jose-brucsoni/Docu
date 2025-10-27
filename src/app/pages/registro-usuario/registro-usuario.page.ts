import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegistroUService } from 'src/app/services/registro-u';
import { 
  IonContent,
  IonButton,
  IonIcon,
  IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personAdd,
  personOutline,
  idCardOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircle,
  logIn
} from 'ionicons/icons';

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    IonContent,
    IonButton,
    IonIcon,
    IonInput
  ],
  templateUrl: './registro-usuario.page.html',
  styleUrls: ['./registro-usuario.page.scss'],
})
export class RegistroUsuarioPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private registroUService = inject(RegistroUService);

  // Estados reactivos
  loading = signal(false);
  error = signal<string | null>(null);
  showPass = signal(false);

  constructor() {
    addIcons({ 
      personAdd,
      personOutline,
      idCardOutline,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      alertCircle,
      logIn
    });
  }

  togglePwd() {
    this.showPass.update(v => !v);
  }

  showPwd() {
    return this.showPass();
  }

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Verifica el formulario, llama al servicio y redirige al login
  async onSubmit() {
    this.error.set(null);
    if (this.form.invalid) {
      this.error.set('Por favor completa todos los campos correctamente.');
      return;
    }

    this.loading.set(true);
    const { nombre, apellido, email, password } = this.form.value;

    try {
      await this.registroUService.registrarUsuario(nombre!, apellido!, email!, password!);
      console.log('Usuario registrado con éxito');
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (err: any) {
      console.error('Error al registrar usuario:', err);
      this.error.set('No se pudo crear la cuenta: ' + (err.message || 'Error desconocido.'));
    } finally {
      this.loading.set(false);
    }
  }
}
