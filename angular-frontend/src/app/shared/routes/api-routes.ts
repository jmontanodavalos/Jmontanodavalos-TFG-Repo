import { environment } from '../../environments/environments';

export const API_URL = environment.endpointUrl;

export const API_ROUTES = {
    getSubjects: () => `${API_URL}/subjects/list`,
};