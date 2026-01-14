import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from '../../services/confirm-modalService/confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
    standalone: true,
  imports: [CommonModule]
})
export class ConfirmModalComponent {
  message = '';
  visible = false;
  private resolver: ((value: boolean) => void) | null = null;

  constructor(private confirmModalService: ConfirmModalService) {
    this.confirmModalService.openModal$.subscribe(({ message, resolver }) => {
      this.message = message;
      this.visible = true;
      this.resolver = resolver;
    });
  }

  confirm() {
    this.resolver?.(true);
    this.visible = false;
  }

  cancel() {
    this.resolver?.(false);
    this.visible = false;
  }
}
