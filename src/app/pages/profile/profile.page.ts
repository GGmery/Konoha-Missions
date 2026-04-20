import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonButtons, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Ninja } from '../../models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonButtons, CommonModule]
})
export class ProfilePage implements OnInit {
  currentNinja: Ninja | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.authService.getNinja$().subscribe(ninja => {
      this.currentNinja = ninja;
    });
  }

  getAvatarUrl(): string {
    if (!this.currentNinja) return '';
    // Usar DiceBear avatars con el username del ninja
    return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${this.currentNinja.username}`;
  }

  goToMissions() {
    this.router.navigate(['/missions']);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
    this.presentToast('¡Hasta luego!', 'success');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color
    });
    await toast.present();
  }
}
