import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfirmModalService {
  openModal$ = new Subject<{ message: string, resolver: (value: boolean) => void }>();

  confirm(message: string): Promise<boolean> {
    return new Promise(resolve => {
      this.openModal$.next({ message, resolver: resolve });
    });
  }
}
