import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge, IonButton, IonIcon, IonItem, IonLabel, IonTextarea, IonSpinner, LoadingController, ToastController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MissionsService } from '../../services/missions.service';
import { AuthService } from '../../services/auth.service';
import { Mission, Ninja } from '../../models';

@Component({
  selector: 'app-mission-detail',
  templateUrl: './mission-detail.page.html',
  styleUrls: ['./mission-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge, IonButton, IonIcon, IonItem, IonLabel, IonTextarea, IonSpinner, CommonModule, FormsModule, RouterLink]
})
export class MissionDetailPage implements OnInit {
  mission: Mission | null = null;
  missionId: string = '';
  currentNinja: Ninja | null = null;
  showingReportForm = false;
  reportText = '';
  isLoading = true;
  loadingError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private missionsService: MissionsService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.missionId = this.route.snapshot.paramMap.get('id') || '';
    this.loadMissionDetail();
    this.authService.getNinja$().subscribe(ninja => {
      this.currentNinja = ninja;
    });
  }

  loadMissionDetail() {
    this.isLoading = true;
    this.loadingError = false;
    
    this.missionsService.getMissionById(this.missionId).subscribe({
      next: (mission) => {
        this.mission = mission;
        this.isLoading = false;
      },
      error: (err) => {
        
        this.missionsService.getMissions().subscribe({
          next: (missions) => {
            const foundMission = missions.find(m => m.id === this.missionId);
            
            if (foundMission) {
              this.mission = foundMission;
              this.isLoading = false;
            } else {
              this.loadingError = true;
              this.isLoading = false;
            }
          },
          error: (err2) => {
            this.loadingError = true;
            this.isLoading = false;
            this.presentToast('Error al cargar la misión', 'danger');
          }
        });
      }
    });
  }

  canAccept(): boolean {
    if (!this.currentNinja || !this.mission) return false;

    const rankMap = { 'genin': 1, 'chunin': 2, 'jonin': 3 };
    const missionRankMap = { 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5 };

    const ninjaRankValue = rankMap[this.currentNinja.rank as keyof typeof rankMap];
    const missionRankValue = missionRankMap[this.mission.rank as keyof typeof missionRankMap];

    return ninjaRankValue >= missionRankValue;
  }

  async acceptMission() {
    const loading = await this.loadingCtrl.create({
      message: 'Aceptando misión...'
    });
    await loading.present();

    this.missionsService.acceptMission(this.missionId).subscribe({
      next: (updatedMission) => {
        this.mission = updatedMission;
        loading.dismiss();
        this.presentToast('¡Misión aceptada!', 'success');
      },
      error: (err) => {
        loading.dismiss();
        this.presentToast('Error al aceptar la misión', 'danger');
      }
    });
  }

  showReportForm() {
    this.showingReportForm = true;
  }

  cancelReport() {
    this.showingReportForm = false;
    this.reportText = '';
  }

  async submitReport() {
    if (!this.reportText.trim()) {
      this.presentToast('Por favor, completa el reporte', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Enviando reporte...'
    });
    await loading.present();

    this.missionsService.reportMission(this.missionId, {
      reportText: this.reportText,
      evidenceImageUrl: ''
    }).subscribe({
      next: () => {
        loading.dismiss();
        this.presentToast('¡Misión completada! Ganaste XP', 'success');
        this.loadMissionDetail();
        this.cancelReport();
      },
      error: (err) => {
        loading.dismiss();
        this.presentToast('Error al enviar el reporte', 'danger');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DISPONIBLE': return 'success';
      case 'ACEPTADA': return 'warning';
      case 'COMPLETADA': return 'primary';
      case 'CANCELADA': return 'danger';
      default: return 'medium';
    }
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

