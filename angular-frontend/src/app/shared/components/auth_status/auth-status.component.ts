import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-status',
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './auth-status.component.html',
})
export class AuthStatusComponent implements OnInit {
  user: User | null = null;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

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
    this.isLoading = true;
    this.authService.logout().subscribe({
        next: () => {
        this.user = null;
        this.isLoading = false;
        this.router.navigate(['/login']);
        },
        error: err => {
          this.isLoading = false;
          console.error('Error al cerrar sesión', err)
        }
        
    });
    }
}