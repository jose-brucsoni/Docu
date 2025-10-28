import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}

  async ngOnInit() {
    // Inicializar servicio de notificaciones al arrancar la app
    await this.notificationService.inicializar();
  }
}
