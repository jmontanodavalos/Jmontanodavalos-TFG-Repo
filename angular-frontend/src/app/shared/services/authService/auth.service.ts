import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterDTO } from '../../interfaces/RegisterDTO';
import { LoginDTO } from '../../interfaces/LoginDTO';
import { AUTH_ROUTES } from '../../routes/auth-routes';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { User } from '../../interfaces/user';

@Injectable({
 providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private loadedSubject = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) { }

  register(data : RegisterDTO) {
    return this.http.post(AUTH_ROUTES.register(), data);
  }

  login(data: LoginDTO) {
    return this.http.post(AUTH_ROUTES.login(), data, { withCredentials: true }).pipe(
      switchMap(() => this.http.get<User>(AUTH_ROUTES.me(), { withCredentials: true })),
      tap(user => this.userSubject.next(user))
    );
  }

  list(): Observable<User[]> {
    return this.http.get<User[]>(AUTH_ROUTES.list(), { withCredentials: true });
  }

  loadUser() {
    this.http.get<User>(AUTH_ROUTES.me(), { withCredentials: true }).subscribe({
      next: user => {
        console.log('Usuario cargado:', user);
        this.userSubject.next(user);
        this.loadedSubject.next(true);
      },
      error: err => {
        console.warn('Error loading user:', err);
        this.userSubject.next(null);
        this.loadedSubject.next(true);
      }
    });
  }

  logout() {
    return this.http.post(AUTH_ROUTES.logout(), {}, { withCredentials: true }).pipe(
      tap(() => {
        this.userSubject.next(null);
        console.log('Sesión cerrada correctamente');
      })
    );
  }

  get currentUser$(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  get loaded$(): Observable<boolean> {
    return this.loadedSubject.asObservable();
  }

}
