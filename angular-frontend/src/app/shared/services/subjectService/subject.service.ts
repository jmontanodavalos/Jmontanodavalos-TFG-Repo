import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SUBJECT_ROUTES } from '../../routes/subject-routes';

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
        return this.http.get<Subject[]>(SUBJECT_ROUTES.getSubjects(),{
            withCredentials: true
        });
    }
}