import { environment } from '../../environments/environments';

export const AUTH_API_URL = environment.endpointUrl;

export const AUTH_ROUTES = {
    login: () => `${AUTH_API_URL}/login`,
    register: () => `${AUTH_API_URL}/users/register`,
    me: () => `${AUTH_API_URL}/users/me`,
    logout: () => `${AUTH_API_URL}/users/logout`,
    list: () => `${AUTH_API_URL}/users/list`
};
