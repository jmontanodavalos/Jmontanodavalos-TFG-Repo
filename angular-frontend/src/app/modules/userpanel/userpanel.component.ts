import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking } from '../../shared/interfaces/booking';
import { BookingService } from '../../shared/services/bookingService/booking.service';
import { TimeslotsService, Timeslot } from '../../shared/services/timeslotsService/timeslots.service';
import { AuthService } from '../../shared/services/authService/auth.service';


@Component({
  selector: 'app-userpanel',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './userpanel.component.html',
  styleUrl: './userpanel.component.css'
})
export class UserpanelComponent implements OnInit {
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;
  days: { [date: string]: number } = {};
  selectedDate: string | null = null;
  selectedSlot: Timeslot | null = null;
  selectedSubjectId: number | null = null;
  bookingsOfSelectedDay: Booking[] = [];
  timeslots: Timeslot[] = [];
  userSubjects: { id: number; name: string; description?: string }[] = [];
  slotSelected = false;
  closedDays: string[] = [];
  studentId = 0; // ID del usuario logeado

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private timeslotsService: TimeslotsService,
  ) {}

  ngOnInit(): void {
    this.loadMonth(this.year, this.month);
    this.initTimeslots();

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.studentId = user.id;
        if (user.subjects) {
          this.userSubjects = user.subjects;
        }
      }
    });
  }

  selectSlot(slot: Timeslot) {
    this.selectedSlot = slot;
    this.selectedSubjectId = null;
    this.slotSelected = true;
  }

  cancelSlotSelection() {
    this.selectedSlot = null;
    this.selectedSubjectId = null;
    this.slotSelected = false;
  }

  selectSubject(subjectId: number | null) {
    this.selectedSubjectId = subjectId;
  }

  makeBooking() {
    if (!this.selectedDate || !this.selectedSlot || !this.selectedSubjectId) return;

    const payload = {
      student_id: this.studentId,
      subject_id: this.selectedSubjectId,
      timeslot_id: this.selectedSlot.id,
      date: this.selectedDate
    };

    this.bookingService.create(payload).subscribe({
      next: res => {
        console.log('Reserva realizada:', res);
        this.selectDay(this.selectedDate!); // recarga reservas
        this.days[this.selectedDate!] = (this.days[this.selectedDate!] || 0) + 1;
        this.slotSelected = false;
        this.selectedSlot = null;
        this.selectedSubjectId = null;
      },
      error: err => console.error('Error creando reserva:', err)
    });
  }

  loadMonth(year: number, month: number) {
    this.bookingService.getMonth(month, year).subscribe({
      next: res => this.days = res.days,
      error: err => console.error("Error al cargar mes:", err)
    });
  }

  prevMonth() { this.changeMonth(-1); }
  nextMonth() { this.changeMonth(1); }

  private changeMonth(delta: number) {
    this.month += delta;
    if (this.month < 1) { this.month = 12; this.year--; }
    if (this.month > 12) { this.month = 1; this.year++; }
    this.loadMonth(this.year, this.month);
    this.selectedDate = null;
  }

  selectDay(date: string) {
    this.selectedDate = date;
    this.bookingService.getDay(date).subscribe({
      next: res => this.bookingsOfSelectedDay = res.bookings,
      error: err => console.error("Error al cargar día:", err)
    });
  }

  initTimeslots() {
    this.timeslotsService.getTimeslots().subscribe({
      next: res => this.timeslots = res,
      error: err => { console.error("Error cargando timeslots:", err); this.timeslots = []; }
    });
  }

  getBookingForTimeslot(slot: Timeslot) {
    if (!this.bookingsOfSelectedDay || !slot) return null;

    return this.bookingsOfSelectedDay.find(b => b.timeslot_id === slot.id) || null;
  }


  getDayColor(day: string): string {
    if (!day) return 'bg-transparent';
    if (this.isClosedDay(day)) return 'bg-black text-white';
    const count = this.days[day] || 0;
    if (count === 0) return 'bg-green-500 hover:bg-green-600';
    if (count <= 2 && count > 0) return 'bg-green-300 hover:bg-green-400';
    if (count <= 3 && count > 2) return 'bg-yellow-200 hover:bg-green-300';
    if (count <= 4 && count > 3) return 'bg-yellow-300 hover:bg-yellow-400';
    if (count <= 6 && count > 4) return 'bg-orange-300 hover:bg-orange-400'
    if (count === 7 && count > 6) return 'bg-red-400 hover:bg-red-500'
    return 'bg-red-600 hover:bg-red-700';
  }

  isToday(date: string): boolean {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = ('0' + (today.getMonth() + 1)).slice(-2);
    const dd = ('0' + today.getDate()).slice(-2);
    return date === `${yyyy}-${mm}-${dd}`;
  }

  isSunday(date: string): boolean {
    return new Date(date).getDay() === 0;
  }

  isClosedDay(day: string): boolean {
    return this.isSunday(day) || this.closedDays.includes(day);
  }

  getDaysInMonth(): (string | null)[] {
    const first = new Date(this.year, this.month - 1, 1);
    const last = new Date(this.year, this.month, 0);
    const days: (string | null)[] = [];

    const offset = first.getDay() === 0 ? 6 : first.getDay() - 1;
    for (let i = 0; i < offset; i++) days.push(null);

    for (let d = 1; d <= last.getDate(); d++) {
      const yyyy = this.year;
      const mm = ('0' + this.month).slice(-2);
      const dd = ('0' + d).slice(-2);
      days.push(`${yyyy}-${mm}-${dd}`);
    }

    return days;
  }
  
}