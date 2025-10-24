import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestion-docu',
  templateUrl: './gestion-docu.page.html',
  styleUrls: ['./gestion-docu.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GestionDocuPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
