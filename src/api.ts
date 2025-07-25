import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Types for diagram data - Updated to match backend serializers
export interface CompanyStats {
  totalCompanies: number;
  companiesWithPlants: number[];
  plantDistribution: Record<string, number>;
}

export interface EnvironmentalData {
  // Noise data structure from NoisePollutionSerializer
  id: number;
  plant_id: number;
  quarter: string;
  average_decibel: number;
  time_of_measurement: string;
  limit_day_decibel: number;
  limit_night_decibel: number;
}

export interface EmergencyData {
  // Emergency data structure from EmergencyDataSerializer
  company_id: number;
  incident_type: string;
  count: number;
  timeline: Array<{
    date: string;
    type: string;
    details: string;
  }>;
}

export interface UnitPerformanceData {
  // Unit performance structure from UnitPerformanceSerializer
  unit_id: number;
  annual_generation: number; // mapped from annual_generation_mwh
  gross_capacity: number; // mapped from gross_capacity_mw
  technology_type: string;
}

export interface PollutantData {
  // Pollutant data structure from PollutantDataSerializer
  id: number;
  unit_id: number;
  pm_concentration_mg_per_Nm3: number;
  so2_concentration_mg_per_Nm3: number;
  no2_concentration_mg_per_Nm3: number;
  co_concentration_mg_per_Nm3: number;
  pm_env_load_ton_per_year: number;
  so2_env_load_ton_per_year: number;
  no2_env_load_ton_per_year: number;
  co_env_load_ton_per_year: number;
}

export interface WaterWasteData {
  // Water consumption structure from WaterConsumptionSerializer
  id: number;
  unit_id: number;
  ground_water_tons_per_year: number;
  fresh_water_tons_per_year: number;
  treated_water_tons_per_year: number;
  other_water_tons_per_year: number;
  total_water_tons_per_year: number;
}

export interface WasteData {
  // Waste data structure from WasteDataSerializer
  id: number;
  unit_id: number;
  waste_type: string;
  quantity_kg_per_year: number;
  treated_quantity_kg_per_year: number;
  reuse_quantity_kg_per_year: number;
  dumping_quantity_kg_per_year: number;
}

// Summary data interfaces
export interface ComprehensiveSummary {
  overall_stats: {
    total_companies: number;
    total_plants: number;
    total_units: number;
    total_capacity_mw: number;
    total_generation_mwh: number;
    regions: string[];
    cities: string[];
    technologies: string[];
    company_names: string[];
  };
  company_summary: Array<{
    company_id: number;
    company_name: string;
    total_plants: number;
    total_units: number;
    total_capacity_mw: number;
    total_generation_mwh: number;
    capacity_factor_avg: number;
    total_pm_emissions: number;
    total_so2_emissions: number;
    total_no2_emissions: number;
    total_co2_emissions: number;
    total_water_consumption: number;
    total_waste_generation: number;
    regions: string[];
    technology_distribution: Array<{technology_type: string; count: number}>;
    emissions_intensity: number;
  }>;
  plant_summary: Array<{
    plant_id: number;
    plant_name: string;
    company_name: string;
    region: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    total_units: number;
    total_capacity_mw: number;
    total_generation_mwh: number;
    capacity_factor_avg: number;
    total_pm_emissions: number;
    total_so2_emissions: number;
    total_no2_emissions: number;
    water_consumption: number;
    waste_generation: number;
    avg_noise_level: number;
    technologies: string[];
    unit_years: number[];
    emissions_intensity: number;
  }>;
}

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

// User management functions
export const createUser = async (userData: { email: string; password: string; role: string; displayName?: string }, token: string) => {
  const response = await fetch(`${BASE_URL}/api/users/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create user');
  }

  return response.json();
};

export const deleteUser = async (uid: string, token: string) => {
  const response = await fetch(`${BASE_URL}/api/users/delete/${uid}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete user');
  }
};

// New endpoints for diagram data
export async function fetchCompanyStats(token?: string): Promise<CompanyStats> {
  return apiRequest('/api/companies/stats/', { method: 'GET' }, token);
}

export async function fetchEnvironmentalData(token?: string): Promise<EnvironmentalData[]> {
  return apiRequest('/api/stats/noise-pollution', { method: 'GET' }, token);
}

export async function fetchEmergencyData(token?: string): Promise<EmergencyData[]> {
  return apiRequest('/api/stats/environmental-emergencies', { method: 'GET' }, token);
}

export async function fetchUnitPerformance(token?: string): Promise<UnitPerformanceData[]> {
  return apiRequest('/api/stats/units', { method: 'GET' }, token);
}

export async function fetchPollutantData(token?: string): Promise<PollutantData[]> {
  return apiRequest('/api/stats/pollutant-data', { method: 'GET' }, token);
}

export async function fetchWaterWasteData(token?: string): Promise<WaterWasteData[]> {
  return apiRequest('/api/stats/water-consumption', { method: 'GET' }, token);
}

export async function fetchWasteData(token?: string): Promise<WasteData[]> {
  return apiRequest('/api/stats/waste-data', { method: 'GET' }, token);
}

export async function fetchComprehensiveSummary(
  company?: string,
  region?: string,
  city?: string,
  technology?: string,
  token?: string
): Promise<ComprehensiveSummary> {
  const params = new URLSearchParams();
  if (company) params.append('company', company);
  if (region) params.append('region', region);
  if (city) params.append('city', city);
  if (technology) params.append('technology', technology);
  
  const url = `/api/summary/comprehensive${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest(url, { method: 'GET' }, token);
} 

// Policy File interfaces
export interface PolicyFile {
  id: number;
  name: string;
  original_filename: string;
  file_size: number;
  uploaded_by: string;
  upload_date: string;
}

// Policy File API functions
export const uploadPolicyFile = async (file: File, name: string, token: string): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  
  const response = await fetch(`${BASE_URL}/api/policy-files/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload policy file');
  }

  return response.json();
};

export const fetchPolicyFiles = async (token: string): Promise<PolicyFile[]> => {
  const response = await fetch(`${BASE_URL}/api/policy-files/list/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch policy files');
  }

  return response.json();
};

export const downloadPolicyFile = async (fileId: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/policy-files/download/${fileId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to download policy file');
  }

  // Get filename from response headers
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'policy_file';

  if (contentDisposition) {
    // Prefer filename* (RFC 5987)
    const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/);
    if (filenameStarMatch && filenameStarMatch[1]) {
      filename = decodeURIComponent(filenameStarMatch[1]);
    } else {
      // Fallback to filename
      const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
  }

  // Get content type from response
  const contentType = response.headers.get('Content-Type') || 'application/octet-stream';

  // Create blob with the correct content type
  const blob = await response.blob();
  const blobWithType = new Blob([blob], { type: contentType });
  
  // Create download link
  const url = window.URL.createObjectURL(blobWithType);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
};

export const deletePolicyFile = async (fileId: number, token: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/api/policy-files/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_id: fileId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete policy file');
  }

  return response.json();
}; 