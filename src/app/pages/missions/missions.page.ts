import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonBadge, IonButton, IonIcon, IonButtons, IonRefresher, IonRefresherContent, LoadingController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MissionsService } from '../../services/missions.service';
import { AuthService } from '../../services/auth.service';
import { Mission, Ninja } from '../../models';

@Component({
  selector: 'app-missions',
  templateUrl: './missions.page.html',
  styleUrls: ['./missions.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonBadge, IonButton, IonIcon, IonButtons, IonRefresher, IonRefresherContent, CommonModule, FormsModule]
})
export class MissionsPage implements OnInit {
  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  selectedStatus = '';
  selectedRank = '';
  currentNinja: Ninja | null = null;
  activeTab: 'todas' | 'pendientes' | 'completadas' = 'todas';

  completedMissions: Mission[] = [];
  acceptedMissions: Mission[] = [];
  availableMissions: Mission[] = [];

  constructor(
    private missionsService: MissionsService,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loadMissions();
    this.authService.getNinja$().subscribe(ninja => {
      this.currentNinja = ninja;
    });
  }

  async loadMissions() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando misiones...'
    });
    await loading.present();

    this.missionsService.getMissions(this.selectedStatus, this.selectedRank)
      .subscribe({
        next: (response: any) => {
          try {
            let missionArray: Mission[] = [];
            
            if (Array.isArray(response)) {
              missionArray = response;
            } else if (response && response.missions && Array.isArray(response.missions)) {
              missionArray = response.missions;
            } else if (response && response.data && Array.isArray(response.data)) {
              missionArray = response.data;
            } else {
              missionArray = [];
            }
            
            this.missions = missionArray;

            this.applyFilters();
            loading.dismiss();
          } catch (err) {
            this.missions = [];
            this.filteredMissions = [];
            loading.dismiss();
            this.presentToast('Error al procesar datos', 'danger');
          }
        },
        error: (err) => {
          this.missions = [];
          this.filteredMissions = [];
          loading.dismiss();
          this.presentToast('Error al cargar misiones', 'danger');
        }
      });
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    try {
      const missionsArray: Mission[] = Array.isArray(this.missions) ? this.missions : [];
      
      if (missionsArray.length === 0) {
        this.filteredMissions = [];
        this.completedMissions = [];
        this.acceptedMissions = [];
        this.availableMissions = [];
        return;
      }
      
      this.completedMissions = missionsArray.filter((m: Mission) => m.status === 'COMPLETADA');
      this.acceptedMissions = missionsArray.filter((m: Mission) => m.status === 'ACEPTADA');
      this.availableMissions = missionsArray.filter((m: Mission) => m.status === 'DISPONIBLE');
      
      // Aplicar filtros adicionales
      this.filteredMissions = missionsArray.filter((mission: Mission) => {
        const statusMatch = !this.selectedStatus || mission.status === this.selectedStatus;
        const rankMatch = !this.selectedRank || mission.rank === this.selectedRank;
        return statusMatch && rankMatch;
      });
    } catch (err) {
      this.filteredMissions = [];
      this.completedMissions = [];
      this.acceptedMissions = [];
      this.availableMissions = [];
    }
  }

  goToMissionDetail(id: string) {
    this.router.navigate(['/mission-detail', id]);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DISPONIBLE': return 'success';
      case 'ACEPTADA': return 'warning';
      case 'COMPLETADA': return 'primary';
      default: return 'medium';
    }
  }

  doRefresh(event: any) {
    this.loadMissions();
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
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
