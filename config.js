import { BASE_URL_FORLIVE, BASE_URL_DEV, ENVIRONMENT } from '@env';

const BASE_URL = ENVIRONMENT.trim() === 'dev2' ? BASE_URL_FORLIVE : BASE_URL_DEV;

console.log('Current Base URL:', BASE_URL);

export default BASE_URL;
