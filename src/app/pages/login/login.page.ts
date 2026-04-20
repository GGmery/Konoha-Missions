import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, IonItem, IonLabel, ToastController } from "@ionic/angular/standalone";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, IonItem, IonLabel, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = "";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.error = "Por favor completa todos los campos";
      return;
    }
    this.loading = true;
    this.error = "";
    const { username, password } = this.loginForm.value;
    
    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.presentToast("¡Bienvenido!", "success");
        this.router.navigate(["/missions"]);
      },
      error: (err) => {
        this.loading = false;
        this.error = "Usuario o contraseña incorrectos";
        this.presentToast("Error al iniciar sesión", "danger");
      }
    });
  }

  goToRegister() {
    this.router.navigate(["/register"]);
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

