import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-status',
  imports: [CommonModule,RouterModule],
  templateUrl: './auth-status.component.html',
})
export class AuthStatusComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    // Cargar sesión al iniciar
    setTimeout(() => {
        this.authService.loadUser();
    }, 200);
  }

  logout() {
    this.authService.logout().subscribe({
        next: () => {
        this.user = null;
        },
        error: err => console.error('Error al cerrar sesión', err)
    });
    }
}