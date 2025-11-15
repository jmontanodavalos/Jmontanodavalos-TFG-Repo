import { environment } from '../../environments/environments';

export const API_URL = environment.endpointUrl;

export const TIMESLOT_ROUTES = {
    getTimeslots: () => `${API_URL}/timeslots/list`,
};