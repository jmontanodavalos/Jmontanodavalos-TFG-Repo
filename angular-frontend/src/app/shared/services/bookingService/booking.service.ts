import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Booking } from '../../interfaces/booking';
import { BOOKING_ROUTES } from '../../routes/booking-routes';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) {}

  // Obtener todas las reservas
  list(): Observable<Booking[]> {
    return this.http.get<Booking[]>(BOOKING_ROUTES.list(), {
      withCredentials: true
    });
  }

  // Obtener una reserva por ID
  show(id: number): Observable<Booking> {
    return this.http.get<Booking>(BOOKING_ROUTES.show(id), {
      withCredentials: true
    });
  }

  // Obtener resumen del mes
  getMonth(month: number, year: number): Observable<any> {
    return this.http.get<any>(BOOKING_ROUTES.month(month, year), {
      withCredentials: true
    });
  }

  // Obtener reservas del día
  getDay(date: string): Observable<any> {
    return this.http.get<any>(BOOKING_ROUTES.day(date), {
      withCredentials: true
    });
  }

  // Crear reserva
  create(data: {
    student_id: number;
    subject_id: number;
    timeslot_id: number;
    date: string;
  }): Observable<any> {
    return this.http.post(BOOKING_ROUTES.create(), data, {
      withCredentials: true
    });
  }

  // Actualizar reserva
  update(id: number, data: any): Observable<any> {
    return this.http.put(BOOKING_ROUTES.update(id), data, {
      withCredentials: true
    });
  }

  // Eliminar reserva
  delete(id: number): Observable<any> {
    return this.http.delete(BOOKING_ROUTES.delete(id), {
      withCredentials: true
    });
  }
}