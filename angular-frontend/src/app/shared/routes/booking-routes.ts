import { environment } from '../../environments/environments';

export const BOOKING_API_URL = `${environment.endpointUrl}/bookings`;

export const BOOKING_ROUTES = {
  list:     () => `${BOOKING_API_URL}`,                 
  show:     (id: number) => `${BOOKING_API_URL}/${id}`, 
  month:    (month: number, year: number) => `${BOOKING_API_URL}/month?month=${month}&year=${year}`,
  day:      (date: string) => `${BOOKING_API_URL}/day?date=${date}`,
  create:   () => `${BOOKING_API_URL}/create`,                 
  update:   (id: number) => `${BOOKING_API_URL}/update/${id}`, 
  delete:   (id: number) => `${BOOKING_API_URL}/delete/${id}`, 
};