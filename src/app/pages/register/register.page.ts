import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonIcon, ToastController } from "@ionic/angular/standalone";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonIcon, CommonModule, FormsModule, ReactiveFormsModule]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  error = "";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      username: ["", [Validators.required]],
      rank: ["genin", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = (form as FormGroup).get("password")?.value;
    const confirmPassword = (form as FormGroup).get("confirmPassword")?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  hasUpperCase(): boolean {
    const password = this.registerForm.get("password")?.value || "";
    return /[A-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.registerForm.get("password")?.value || "";
    return /[0-9]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.registerForm.get("password")?.value || "";
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }

  passwordsMatch(): boolean {
    const password = this.registerForm.get("password")?.value;
    const confirmPassword = this.registerForm.get("confirmPassword")?.value;
    return password && confirmPassword && password === confirmPassword;
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.error = "Por favor completa todos los campos correctamente";
      return;
    }
    
    if (!this.passwordsMatch()) {
      this.error = "Las contraseñas no coinciden";
      return;
    }

    this.loading = true;
    this.error = "";
    const { username, rank, password } = this.registerForm.value;
    
    this.authService.register(username, password, rank).subscribe({
      next: () => {
        this.loading = false;
        this.presentToast("¡Cuenta creada! Inicia sesión", "success");
        this.router.navigate(["/login"]);
      },
      error: (err) => {
        this.loading = false;
        this.error = "El usuario ya existe o hubo un error";
        this.presentToast("Error al registrarse", "danger");
      }
    });
  }

  goToLogin() {
    this.router.navigate(["/login"]);
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


