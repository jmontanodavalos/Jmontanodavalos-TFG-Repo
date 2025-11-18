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
  standalone: true,
  imports: [ CommonModule, FormsModule, CalendarComponent ],
  templateUrl: './userpanel.component.html',
  styleUrl: './userpanel.component.css'
})
export class UserpanelComponent implements OnInit {
  selectedDate: string | null = null;
  selectedSlot: Timeslot | null = null;
  selectedSubjectId: number | null = null;
  studentId = 0;
  userSubjects: { id: number; name: string; description?: string }[] = [];
  timeslots: Timeslot[] = [];
  bookingsOfSelectedDay: Booking[] = [];
  days: { [date: string]: number } = {};
  closedDays: string[] = [];
  slotSelected = false;
  

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private timeslotsService: TimeslotsService,
  ) {}

  // INIT

  ngOnInit(): void {
    this.initTimeslots();
    this.initUserData();
    this.initCalendar();
  }

  private initTimeslots() {
    this.timeslotsService.getTimeslots().subscribe({
      next: res => this.timeslots = res,
      error: err => { console.error("Error cargando timeslots:", err); this.timeslots = []; }
    });
  }

  private initUserData() {
    this.authService.currentUser$.subscribe(user => {
      if (!user) return;

      this.studentId = user.id;
      this.userSubjects = user.subjects ?? [];
    });
  }

  private initCalendar() {
    const today = new Date();
    this.loadMonth(today.getFullYear(), today.getMonth() + 1);
  }

  // CALENDARIO

  onMonthChanged({ year, month }: { year: number; month: number }) {
    this.loadMonth(year, month);
    this.clearSelectedDay();
  }

  private loadMonth(year: number, month: number) {
    this.bookingService.getMonth(month, year).subscribe({
      next: res => this.days = res.days,
      error: err => console.error("Error al cargar mes:", err)
    });
  }

  private clearSelectedDay() {
    this.selectedDate = null;
    this.bookingsOfSelectedDay = [];
    this.selectedSlot = null;
    this.slotSelected = false;
  }

  selectDay(date: string) {
    this.selectedDate = date;

    this.bookingService.getDay(date).subscribe({
      next: res => {
        this.bookingsOfSelectedDay = res.bookings;
      },
      error: err => console.error("❌ Error al cargar día:", err)
    });
  }

  // TARJETAS TIMESLOTS

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

  selectSubject(subjectId: number) {
    this.selectedSubjectId = subjectId;
  }

  // RESERVA

  makeBooking() {
    const validationError = this.validateBooking();

    if (validationError) {
      console.error(validationError);
      return;
    }

    const payload = this.buildBookingPayload();

    this.bookingService.create(payload).subscribe({
      next: (res) => this.handleBookingSuccess(res),
      error: (err) => console.error("Error al crear reserva:", err)
    });
  }

  private validateBooking(): string | null {
    if (!this.selectedSubjectId) {
      return "No se ha seleccionado asignatura.";
    }

    if (!this.selectedDate) {
      return "No se ha seleccionado día.";
    }

    if (!this.selectedSlot) {
      return "No se ha seleccionado horario.";
    }
    
    return null;
  }

  private buildBookingPayload() {
    return {
      student_id: this.studentId,
      subject_id: this.selectedSubjectId!,
      timeslot_id: this.selectedSlot!.id,
      date: this.selectedDate!
    };
  }

  private handleBookingSuccess(res: any) {
    console.log("Reserva creada correctamente:", res);
    this.selectDay(this.selectedDate!);
    this.days[this.selectedDate!] = (this.days[this.selectedDate!] || 0) + 1;
    this.cancelSlotSelection();
  }



  // HTML

  getBookingForTimeslot(slot: Timeslot) {
    if (!this.bookingsOfSelectedDay || !slot) return null;
    const booking = this.bookingsOfSelectedDay.find(b => b.timeslot_id === slot.id) || null;
    return booking;
  }

}