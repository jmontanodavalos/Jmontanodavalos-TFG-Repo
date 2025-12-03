import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule, NavigationEnd } from '@angular/router';
import { ToastService } from '../../services/toastService/toast.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-auth-status',
  imports: [CommonModule, RouterModule, RouterLink, ],
  templateUrl: './auth-status.component.html',
})
export class AuthStatusComponent implements OnInit {
  user: User | null = null;
  isLoading: boolean = false;
  isInPanel: boolean = false;

  constructor(private authService: AuthService, private router: Router, private toastService: ToastService) {}

  ngOnInit(): void {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentUrl = event.urlAfterRedirects;
      this.isInPanel = currentUrl.includes('admin-dashboard') || currentUrl.includes('user-dashboard');
    });

    this.isInPanel = this.router.url.includes('admin-dashboard') || 
                 this.router.url.includes('user-dashboard');

    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    // Cargar sesión al iniciar
    setTimeout(() => {
        this.authService.loadUser();
    }, 200);
  }

  goToDashboard() {
    if (!this.user) return;
    this.authService.redirectToDashboard(this.user, this.router, this.toastService);
  }

  logout() {
    this.isLoading = true;
    this.authService.logout().subscribe({
        next: () => {
        this.user = null;
        this.isLoading = false;
        this.toastService.showToast('Sesión cerrada correctamente', 'info', 3000);
        this.router.navigate(['/login']);
        },
        error: err => {
          this.isLoading = false;
          this.toastService.showToast('Error al cerrar sesión', 'error', 3000);
          console.error('Error al cerrar sesión', err)
        }
        
    });
    }
}