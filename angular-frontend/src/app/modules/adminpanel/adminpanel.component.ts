import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking } from '../../shared/interfaces/booking';
import { BookingService } from '../../shared/services/bookingService/booking.service';
import { TimeslotsService, Timeslot } from '../../shared/services/timeslotsService/timeslots.service';
import { CalendarComponent } from '../../shared/components/calendar/calendar.component';
import { AuthService } from '../../shared/services/authService/auth.service';
import { User } from '../../shared/interfaces/user';

@Component({
  selector: 'app-adminpanel',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarComponent],
  templateUrl: './adminpanel.component.html',
  styleUrl: './adminpanel.component.css'
})
export class AdminpanelComponent implements OnInit {

  selectedDate: string | null = null;
  selectedSlot: Timeslot | null = null;

  allStudents: User[] = [];
  selectedStudentId: number | null = null;
  selectedSubjectId: number | null = null;
  selectedStudentSubjects: { id: number; name: string }[] = [];

  timeslots: Timeslot[] = [];
  bookingsOfSelectedDay: Booking[] = [];
  days: { [date: string]: number } = {};
  bookingBeingEdited: Booking | null = null;
  closedDays: string[] = [];

  constructor(
    private bookingService: BookingService,
    private timeslotsService: TimeslotsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initTimeslots();
    this.initStudents();
    this.initCalendar();
  }

  private initTimeslots() {
    this.timeslotsService.getTimeslots().subscribe(res => this.timeslots = res);
  }

  private initStudents() {
    this.authService.list().subscribe(res => this.allStudents = res);
  }

  private initCalendar() {
    const today = new Date();
    this.loadMonth(today.getFullYear(), today.getMonth() + 1);
  }

  onMonthChanged({ year, month }: { year: number; month: number }) {
    this.loadMonth(year, month);
    this.clearSelectedDay();
  }

  private loadMonth(year: number, month: number) {
    this.bookingService.getMonth(month, year).subscribe(res => {
      this.days = res.days;
    });
  }

  private clearSelectedDay() {
    this.selectedDate = null;
    this.bookingsOfSelectedDay = [];
    this.selectedSlot = null;
    this.selectedStudentId = null;
    this.selectedSubjectId = null;
    this.selectedStudentSubjects = [];
  }

  selectDay(date: string) {
    this.selectedDate = date;
    this.bookingService.getDay(date).subscribe(res => {
      this.bookingsOfSelectedDay = res.bookings;
    });
  }

  selectSlot(slot: Timeslot) {
    this.selectedSlot = slot;
    this.selectedStudentId = null;
    this.selectedSubjectId = null;
    this.selectedStudentSubjects = [];
  }

  cancelSlotSelection() {
    this.selectedSlot = null;
    this.selectedStudentId = null;
    this.selectedSubjectId = null;
    this.selectedStudentSubjects = [];
    this.bookingBeingEdited = null;
  }

  makeBooking() {
    if (!this.selectedSlot || !this.selectedSubjectId || !this.selectedStudentId || !this.selectedDate) {
      console.error("Faltan campos para crear la reserva");
      return;
    }

    const payload = {
      student_id: this.selectedStudentId,
      subject_id: this.selectedSubjectId,
      timeslot_id: this.selectedSlot.id,
      date: this.selectedDate
    };

    // SI ES UNA EDICIÓN → UPDATE
    if (this.bookingBeingEdited) {
      this.bookingService.update(this.bookingBeingEdited.id, payload).subscribe({
        next: (res) => this.handleEditBookingSuccess(res),
        error: err => console.error("Error actualizando reserva:", err)
      });

      return;
    }


    this.bookingService.create(payload).subscribe({
      next: (res) => this.handleBookingSuccess(res),
      error: err => console.error("Error creando reserva:", err)
    });
  }

  private handleBookingSuccess(res: any) {
    console.log("Reserva creada correctamente:", res);
    this.selectDay(this.selectedDate!);
    this.days[this.selectedDate!] = (this.days[this.selectedDate!] || 0) + 1;
    this.cancelSlotSelection();
  }

  editBooking(slot: Timeslot, booking: Booking) {
    this.selectedSlot = slot;
    this.bookingBeingEdited = booking;
    console.log("información reserva:", booking)

    this.selectedStudentId = booking.student_id;

    const stu = this.allStudents.find(s => s.id === this.selectedStudentId);
    this.selectedStudentSubjects = stu ? stu.subjects : [];
    console.log("student_id", booking.student_id)
    console.log("subject_id", booking.subject_id)
    this.selectedSubjectId = booking.subject_id;
  }

    private handleEditBookingSuccess(res: any) {
    console.log("Reserva editada correctamente:", res);
    this.selectDay(this.selectedDate!);
    this.days[this.selectedDate!] = (this.days[this.selectedDate!] || 0);
    this.cancelSlotSelection();
  }

  deleteBooking(bookingId: number) {
    if (!confirm("¿Seguro que quieres eliminar esta reserva?")) return;

    this.bookingService.delete(bookingId).subscribe({
      next: () => {
        console.log("Reserva eliminada correctamente:");
        this.selectDay(this.selectedDate!);
        this.days[this.selectedDate!] = (this.days[this.selectedDate!] || 0) - 1;
        this.cancelSlotSelection();
      },
      error: err => console.error("Error eliminando reserva:", err)
    });
  }

  // AUXILIAR

  getBookingForTimeslot(slot: Timeslot) {
    return this.bookingsOfSelectedDay.find(b => b.timeslot_id === slot.id) || null;
  }

  onStudentSelected() {
    if (!this.selectedStudentId) {
      this.selectedStudentSubjects = [];
      this.selectedSubjectId = null;
      return;
    }

    const student = this.allStudents.find(s => s.id === this.selectedStudentId);
    this.selectedStudentSubjects = student ? student.subjects : [];

    if (!this.selectedStudentSubjects.find(sub => sub.id === this.selectedSubjectId)) {
      this.selectedSubjectId = null;
    }
  }
}

