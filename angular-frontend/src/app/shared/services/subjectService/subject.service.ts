import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../routes/api-routes';

export interface Subject {
    id: number;
    name: string;
    description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SubjectService {

    constructor(private http: HttpClient) { }

    getSubjects(): Observable<Subject[]> {
        return this.http.get<Subject[]>(API_ROUTES.getSubjects());
    }
}