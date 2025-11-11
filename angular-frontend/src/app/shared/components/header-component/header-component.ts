import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStatusComponent } from '../auth_status/auth-status.component';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [ CommonModule, AuthStatusComponent ],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css'
})
export class HeaderComponent {
  constructor(public router: Router) {}

  // Hide AuthStatus on login/register
  showAuthStatus(): boolean {
      const hiddenRoutes = ['/login', '/register'];
      return !hiddenRoutes.includes(this.router.url);
  }

}