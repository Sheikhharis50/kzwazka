import 'dotenv/config';

const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!rawBase) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
}
export const API_BASE_URL = rawBase.replace(/\/+$/, '');
export const API_URL = `${API_BASE_URL}/api`;
