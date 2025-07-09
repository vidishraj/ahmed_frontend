import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

export async function apiRequest<T = any>(
  endpoint: string,
  options: AxiosRequestConfig = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await api.request<T>({
      url: endpoint,
      ...options,
      headers,
    });
    return res.data;
  } catch (err: any) {
    let errorMsg = 'API request failed';
    if (err.response && err.response.data && err.response.data.error) {
      errorMsg = err.response.data.error;
    } else if (err.message) {
      errorMsg = err.message;
    }
    throw new Error(errorMsg);
  }
}

export async function uploadFile(
  endpoint: string,
  file: File,
  token: string
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await api.post(endpoint, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err: any) {
    let errorMsg = 'Upload failed';
    if (err.response && err.response.data && err.response.data.error) {
      errorMsg = err.response.data.error;
    } else if (err.message) {
      errorMsg = err.message;
    }
    throw new Error(errorMsg);
  }
} 