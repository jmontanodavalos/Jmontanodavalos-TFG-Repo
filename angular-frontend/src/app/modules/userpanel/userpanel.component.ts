import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking } from '../../shared/interfaces/booking';
import { BookingService } from '../../shared/services/bookingService/booking.service';
import { TimeslotsService, Timeslot } from '../../shared/services/timeslotsService/timeslots.service';
import { AuthService } from '../../shared/services/authService/auth.service';
import { CalendarComponent } from '../../shared/components/calendar/calendar.component';


@Component({
  selector: 'app-userpanel',
  imports: [ CommonModule, FormsModule, CalendarComponent ],
  templateUrl: './userpanel.component.html',
  styleUrl: './userpanel.component.css'
})
export class UserpanelComponent implements OnInit {
  selectedDate: string | null = null;
  selectedSlot: Timeslot | null = null;
  selectedSubjectId: number | null = null;
  bookingsOfSelectedDay: Booking[] = [];
  timeslots: Timeslot[] = [];
  userSubjects: { id: number; name: string; description?: string }[] = [];
  slotSelected = false;
  studentId = 0;

  days: { [date: string]: number } = {};
  closedDays: string[] = [];

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private timeslotsService: TimeslotsService,
  ) {}

  ngOnInit(): void {
    this.initTimeslots();
    const today = new Date();
    this.loadMonth(today.getFullYear(), today.getMonth() + 1);


    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.studentId = user.id;
        if (user.subjects) {
          this.userSubjects = user.subjects;
        }
      }
    });
  }

  onMonthChanged(event: { year: number; month: number }) {
    this.loadMonth(event.year, event.month);
    this.selectedDate = null;
    this.bookingsOfSelectedDay = [];
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

  private loadMonth(year: number, month: number) {
    this.bookingService.getMonth(month, year).subscribe({
      next: res => this.days = res.days,
      error: err => console.error("Error al cargar mes:", err)
    });
  }

  selectDay(date: string) {
    this.selectedDate = date;
    this.bookingService.getDay(date).subscribe({
      next: res => this.bookingsOfSelectedDay = res.bookings,
      error: err => console.error("Error al cargar día:", err)
    });
  }

  private initTimeslots() {
    this.timeslotsService.getTimeslots().subscribe({
      next: res => this.timeslots = res,
      error: err => { console.error("Error cargando timeslots:", err); this.timeslots = []; }
    });
  }

  getBookingForTimeslot(slot: Timeslot) {
    if (!this.bookingsOfSelectedDay || !slot) return null;
    return this.bookingsOfSelectedDay.find(b => b.timeslot_id === slot.id) || null;
  }
  
}