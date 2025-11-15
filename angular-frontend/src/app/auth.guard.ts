// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { AuthService } from './shared/services/authService/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return combineLatest([this.authService.currentUser$, this.authService.loaded$]).pipe(
      filter(([_, loaded]) => loaded),
      take(1),
      map(([user, _]) => {
        return user ? true : this.router.createUrlTree(['/login']);
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return combineLatest([this.authService.currentUser$, this.authService.loaded$]).pipe(
      filter(([_, loaded]) => loaded),
      take(1),
      map(([user, _]) => {
        if (!user) {
          return this.router.createUrlTree(['/login']);
        }
        const roles = Array.isArray(user.role) ? user.role : [user.role];
        if (roles.includes('ROLE_ADMIN')) {
          return true;
        } else {
          return this.router.createUrlTree(['']);
        }
      })
    );
  }
}