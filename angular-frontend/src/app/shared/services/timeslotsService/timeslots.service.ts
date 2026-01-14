import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TIMESLOT_ROUTES } from '../../routes/timeslots-routes';

export interface Timeslot {
    id: number;
    start_time: string;
    end_time: string;
}

@Injectable({
    providedIn: 'root'
})
export class TimeslotsService {

    constructor(private http: HttpClient) { }

    getTimeslots(): Observable<Timeslot[]> {
        return this.http.get<Timeslot[]>(TIMESLOT_ROUTES.getTimeslots(),{
            withCredentials: true
        });
    }
}