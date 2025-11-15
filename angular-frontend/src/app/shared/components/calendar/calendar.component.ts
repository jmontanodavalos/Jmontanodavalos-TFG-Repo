import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  @Input() days: { [date: string]: number } = {};
  @Input() closedDays: string[] = [];

  @Output() daySelected = new EventEmitter<string>();
  @Output() monthChanged = new EventEmitter<{ year: number, month: number }>();

  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;

  constructor() {}

  prevMonth() {
    this.changeMonth(-1);
  }

  nextMonth() {
    this.changeMonth(1);
  }

  private changeMonth(delta: number) {
    this.month += delta;

    if (this.month < 1) { this.month = 12; this.year--; }
    if (this.month > 12) { this.month = 1; this.year++; }

    this.monthChanged.emit({ year: this.year, month: this.month });
  }

  selectDay(day: string) {
    this.daySelected.emit(day);
  }

  getDaysInMonth(): (string | null)[] {
    const first = new Date(this.year, this.month - 1, 1);
    const last = new Date(this.year, this.month, 0);

    const result: (string | null)[] = [];

    const offset = first.getDay() === 0 ? 6 : first.getDay() - 1;
    for (let i = 0; i < offset; i++) result.push(null);

    for (let d = 1; d <= last.getDate(); d++) {
      const yyyy = this.year;
      const mm = ('0' + this.month).slice(-2);
      const dd = ('0' + d).slice(-2);
      result.push(`${yyyy}-${mm}-${dd}`);
    }

    return result;
  }

  getDayColor(day: string): string {
    if (!day) return 'bg-transparent';
    if (this.isClosedDay(day)) return 'bg-black text-white';

    const count = this.days[day] || 0;

    if (count === 0) return 'bg-green-500 hover:bg-green-600';
    if (count <= 2) return 'bg-green-300 hover:bg-green-400';
    if (count <= 3) return 'bg-yellow-200 hover:bg-yellow-300';
    if (count <= 4) return 'bg-yellow-300 hover:bg-yellow-400';
    if (count <= 6) return 'bg-orange-300 hover:bg-orange-400';
    if (count === 7) return 'bg-red-400 hover:bg-red-500';

    return 'bg-red-600 hover:bg-red-700';
  }

  isClosedDay(day: string): boolean {
    return this.isSunday(day) || this.closedDays.includes(day);
  }

  isSunday(day: string): boolean {
    return new Date(day).getDay() === 0;
  }

  isToday(day: string): boolean {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = ('0' + (today.getMonth() + 1)).slice(-2);
    const dd = ('0' + today.getDate()).slice(-2);

    return day === `${yyyy}-${mm}-${dd}`;
  }
}
