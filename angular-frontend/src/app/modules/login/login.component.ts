import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/authService/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackButtonComponent } from '../../shared/components/back_button/back-button.component';

@Component({
  selector: 'app-login',
  imports:[FormsModule, ReactiveFormsModule,RouterLink, CommonModule, BackButtonComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading: boolean = false;

  constructor(private auth: AuthService, private router: Router) {
  }

  onLogin(): void {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          // Credenciales incorrectas
          alert ('Email o contraseña incorrectos.');
        } else {
          // Otros errores
          alert ('No se pudo iniciar sesión. Inténtalo más tarde.');
          console.error('Error al iniciar sesión', err);
        }
      }
    });
  }
}

