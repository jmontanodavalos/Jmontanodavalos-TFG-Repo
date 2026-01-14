import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/authService/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackButtonComponent } from '../../shared/components/back_button/back-button.component';
import { ToastService } from '../../shared/services/toastService/toast.service';
import { User } from '../../shared/interfaces/user';

@Component({
  selector: 'app-login',
  imports:[FormsModule, ReactiveFormsModule,RouterLink, CommonModule, BackButtonComponent, ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading: boolean = false;
  user: User | null = null;

  constructor(private auth: AuthService, private router: Router, private toastService: ToastService) {
  }

  onLogin(): void {
    this.isLoading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (user:User) => {
        this.isLoading = false;
        this.toastService.showToast('Sesión iniciada correctamente','success',3000);
        this.auth.redirectToDashboard(
          user,
          this.router,
          this.toastService
        );
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          // Credenciales incorrectas
          this.toastService.showToast('Email o contraseña incorrectos','error',3000);

        } else {
          // Otros errores
          this.toastService.showToast('Error al iniciar sesión','error',3000);
        }
      }
    });
  }
}

