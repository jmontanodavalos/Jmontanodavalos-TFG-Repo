import { environment } from '../../environments/environments';

export const API_URL = environment.endpointUrl;

export const SUBJECT_ROUTES = {
    getSubjects: () => `${API_URL}/subjects/list`,
};