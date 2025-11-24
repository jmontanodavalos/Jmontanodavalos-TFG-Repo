import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../services/toastService/toast.service';
import { CommonModule } from '@angular/common';
import { Toast } from '../../interfaces/toast';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;

      toasts.forEach(toast => {
        if (!toast.timeoutId && !toast.paused) {
          this.startTimeout(toast);
        }
      });
    });
  }

  startTimeout(toast: Toast): void {
    toast.startTime = Date.now();
    toast.timeoutId = setTimeout(() => {
      this.removeToast(toast);
    }, toast.remainingTime);
  }

  pauseToast(toast: Toast): void {
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
      toast.remainingTime! -= Date.now() - (toast.startTime ?? 0);
      toast.timeoutId = undefined;
      toast.paused = true;
    }
  }

  resumeToast(toast: Toast): void {
    if (toast.paused) {
      toast.startTime = Date.now();
      toast.timeoutId = setTimeout(() => {
        this.removeToast(toast);
      }, toast.remainingTime);
      toast.paused = false;
    }
  }

  removeToast(toast: Toast): void {
    this.toastService.removeToast(toast);
  }
}
