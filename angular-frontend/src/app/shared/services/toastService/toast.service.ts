import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '../../interfaces/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    toasts$ = this.toastsSubject.asObservable();

    constructor(private injector: Injector) {}

    showToast(
        message: string,
        type: 'success' | 'error' | 'info',
        duration: number
    ): void {
        const toast: Toast = {
        message,
        type,
        duration,
        startTime: Date.now(),
        remainingTime: duration,
        paused: false,
        };

        this.toastsSubject.next([...this.toastsSubject.value, toast]);
    }


    removeToast(toast: Toast): void {
        const toasts = this.toastsSubject.value.filter((t) => t !== toast);
        this.toastsSubject.next(toasts);
  }

}