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
    console.log(res)
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

export async function fetchPlantLocations(token?: string) {
  return apiRequest('/api/plants/geospatial/', { method: 'GET' }, token);
}

export async function fetchUnitMapData(token?: string) {
  return apiRequest('/api/units/map/', { method: 'GET' }, token);
}

export const fetchKPIList = async (
  page: number,
  pageSize: number,
  token: string,
  sortField?: string,
  sortOrder?: string,
  filterModel?: any
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (sortField) {
    params.append('sortField', sortField);
  }
  if (sortOrder) {
    params.append('sortOrder', sortOrder);
  }
  if (filterModel) {
    params.append('filterModel', JSON.stringify(filterModel));
  }

  const response = await fetch(`${BASE_URL}/api/units/kpi-list/?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch KPI data');
  }

  return response.json();
}; 