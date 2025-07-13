import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPlantLocations, fetchUnitMapData, fetchKPIList } from '../api';
import { useAuth } from '../contexts/AuthContext';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import CompanyOverview from '../components/dashboard/CompanyOverview';
import EnvironmentalMonitoring from '../components/dashboard/EnvironmentalMonitoring';
import PollutantChart from '../components/dashboard/PollutantChart';
import UnitPerformanceChart from '../components/dashboard/UnitPerformanceChart';
import WaterWasteChart from '../components/dashboard/WaterWasteChart';
import SummaryTab from '../components/dashboard/SummaryTab';
import EmissionsComplianceChart from '../components/dashboard/EmissionsComplianceChart';
import { Box, Paper, Stack, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import type { 
  IDatasource, 
  IGetRowsParams, 
  SortModelItem, 
  FilterModel,
  GridApi,
  ColDef
} from 'ag-grid-community';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter,
} from 'recharts';

const MAP_HEIGHT = '400px';
const MAP_CENTER: [number, number] = [24.7136, 46.6753];
const MAP_ZOOM = 6;
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
    
ModuleRegistry.registerModules([ AllCommunityModule ]);
const plantIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});
const unitIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [1, -24],
});

const TABS = [
  { key: 'tabular', label: 'Grid View' },
  { key: 'diagramatic', label: 'Diagrams' },
  { key: 'summary', label: 'Summary' },
  { key: 'map', label: 'Map View' },
] as const;

type TabType = typeof TABS[number]['key'];

interface KPIRow {
  plant_id: number;
  plant_name: string;
  company_name: string | null;
  unit_id: number;
  unit_name: string;
  technology_type: string | null;
  region: string | null;
  city: string | null;
  year_operation_started: number | null;
  primary_fuel_energy: number | null;
  unit_efficiency: number | null;
  capacity_factor: number | null;
  env_load_pm: number | null;
  env_load_so2: number | null;
  env_load_no2: number | null;
  env_load_co2: number | null;
  pm10_emissions: number | null;
  so2_emissions: number | null;
  no2_emissions: number | null;
  annual_fuel_consumption_m3: number | null;
  lhv: number | null;
  annual_generation_mwh: number | null;
  gross_capacity_mw: number | null;
  working_hours_per_year: number | null;
  avg_flow_m3_per_min: number | null;
  pm_concentration_mg_per_Nm3: number | null;
  so2_concentration_mg_per_Nm3: number | null;
  no2_concentration_mg_per_Nm3: number | null;
  co2_concentration_mg_per_Nm3: number | null;
}

const Dashboard: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('tabular');

  // Map state
  const [plants, setPlants] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [errorMap, setErrorMap] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [techFilter, setTechFilter] = useState('');

  // Diagrammatic tab state
  const [diagramCompany, setDiagramCompany] = useState('');
  const [diagramPlant, setDiagramPlant] = useState('');
  const [diagramRegion, setDiagramRegion] = useState('');
  const [diagramCity, setDiagramCity] = useState('');
  const [diagramTech, setDiagramTech] = useState('');
  // const [diagramYear, setDiagramYear] = useState('');
  const [diagramData, setDiagramData] = useState<any[]>([]);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [diagramError, setDiagramError] = useState('');
  const [environmentalData, setEnvironmentalData] = useState<any[]>([]);
  const [emergencyData, setEmergencyData] = useState<any[]>([]);
  const [waterWasteData, setWaterWasteData] = useState<any[]>([]);
  const [wasteData, setWasteData] = useState<any[]>([]);

  // Initial load - simplified
  useEffect(() => {
    if (activeTab === 'tabular') {
      // Initial table load if needed
    }
  }, [activeTab]);

  // ag-Grid datasource
  const dataSource: IDatasource = {
    getRows: async (params: IGetRowsParams) => {
      // Calculate the page number based on startRow
      const page = Math.floor(params.startRow / 100) + 1;
      
      // Get sort model
      const sortModel = params.sortModel[0] as SortModelItem | undefined;
      const sortField = sortModel?.colId;
      const sortOrder = sortModel?.sort;
      
      // Get filter model
      const filterModel = params.filterModel as FilterModel;
      
      try {
        const token = await firebaseUser?.getIdToken();
        if (!token) throw new Error('Not authenticated');
        
        const data = await fetchKPIList(page, 100, token, sortField, sortOrder, filterModel);
        
        // Update total rows
        const totalRows = data.count;
        
        // Check if this is the last block
        const lastRow = params.startRow + data.results.length >= totalRows ? totalRows : undefined;
        
        // Return the rows to the grid
        params.successCallback(data.results, lastRow);
      } catch (error) {
        params.failCallback();
      }
    }
  };

  // ag-Grid column definitions with proper typing
  const columnDefs: ColDef<KPIRow>[] = [
    { 
      headerName: 'Company', 
      field: 'company_name', 
      minWidth: 120 
    },
    { 
      headerName: 'Plant', 
      field: 'plant_name', 
      minWidth: 120 
    },
    { 
      headerName: 'Unit', 
      field: 'unit_name', 
      minWidth: 120 
    },
    { 
      headerName: 'Primary Fuel Energy Input (MWh/year)', 
      field: 'primary_fuel_energy', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    },
    { 
      headerName: 'LHV (MWh/m³)', 
      field: 'lhv', 
      minWidth: 120,
      valueFormatter: (params) => params.value ? params.value.toFixed(4) : '-'
    },
    { 
      headerName: 'Unit Efficiency (%)', 
      field: 'unit_efficiency', 
      minWidth: 150,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    },
    { 
      headerName: 'Capacity Factor (%)', 
      field: 'capacity_factor', 
      minWidth: 150,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    },
    { 
      headerName: 'Environmental Load PM (ton/year)', 
      field: 'env_load_pm', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(4) : '-'
    },
    { 
      headerName: 'Environmental Load SO₂ (ton/year)', 
      field: 'env_load_so2', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(4) : '-'
    },
    { 
      headerName: 'Environmental Load NO₂ (ton/year)', 
      field: 'env_load_no2', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(4) : '-'
    },
    { 
      headerName: 'Environmental Load CO₂ (ton/year)', 
      field: 'env_load_co2', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(4) : '-'
    },
    { 
      headerName: 'PM10 Emissions (Thousand Tons)', 
      field: 'pm10_emissions', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(4) : '-'
    },
    { 
      headerName: 'SO₂ Emissions (Thousand Tons)', 
      field: 'so2_emissions', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(4) : '-'
    },
    { 
      headerName: 'NO₂ Emissions (Thousand Tons)', 
      field: 'no2_emissions', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(4) : '-'
    },
    { 
      headerName: 'Annual Fuel Consumption (m³/year)', 
      field: 'annual_fuel_consumption_m3', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    },
    { 
      headerName: 'Annual Generation (MWh)', 
      field: 'annual_generation_mwh', 
      minWidth: 180,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    },
    { 
      headerName: 'Gross Capacity (MW)', 
      field: 'gross_capacity_mw', 
      minWidth: 150,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    },
    { 
      headerName: 'Working Hours per Year', 
      field: 'working_hours_per_year', 
      minWidth: 180,
      valueFormatter: (params) => params.value ? params.value.toFixed(0) : '-'
    },
    { 
      headerName: 'Average Flow Rate (m³/min)', 
      field: 'avg_flow_m3_per_min', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    },
    { 
      headerName: 'PM Concentration (mg/Nm³)', 
      field: 'pm_concentration_mg_per_Nm3', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    },
    { 
      headerName: 'SO₂ Concentration (mg/Nm³)', 
      field: 'so2_concentration_mg_per_Nm3', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    },
    { 
      headerName: 'NO₂ Concentration (mg/Nm³)', 
      field: 'no2_concentration_mg_per_Nm3', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    },
    { 
      headerName: 'CO₂ Concentration (mg/Nm³)', 
      field: 'co2_concentration_mg_per_Nm3', 
      minWidth: 200,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '-'
    }
  ];

  // Fetch map data
  useEffect(() => {
    if (activeTab !== 'map') return;
    const loadData = async () => {
      setLoadingMap(true);
      setErrorMap('');
      try {
        if (!firebaseUser) throw new Error('Not authenticated');
        const token = await firebaseUser.getIdToken();
        const [plantData, unitData] = await Promise.all([
          fetchPlantLocations(token),
          fetchUnitMapData(token),
        ]);
        setPlants(plantData);
        setUnits(unitData);
      } catch (err: any) {
        setErrorMap(err.message || 'Failed to fetch map data');
      } finally {
        setLoadingMap(false);
      }
    };
    loadData();
  }, [firebaseUser, activeTab]);

  // Filtering logic for map
  const filteredPlants = plants.filter(p =>
    (!companyFilter || (p.company && p.company.toLowerCase().includes(companyFilter.toLowerCase()))) &&
    (!regionFilter || (p.region && p.region.toLowerCase().includes(regionFilter.toLowerCase())))
  );
  const filteredUnits = units.filter(u =>
    (!companyFilter || (u.company && u.company.toLowerCase().includes(companyFilter.toLowerCase()))) &&
    (!regionFilter || (u.region && u.region.toLowerCase().includes(regionFilter.toLowerCase()))) &&
    (!techFilter || (u.technology_type && u.technology_type.toLowerCase().includes(techFilter.toLowerCase())))
  );
  // Unique filter options for map
  const companies = Array.from(new Set([ ...units.map(u => u.company)].filter(Boolean)));
  const regions = Array.from(new Set([...plants.map(p => p.region), ...units.map(u => u.region)].filter(Boolean)));
  const techs = Array.from(new Set(units.map(u => u.technology_type).filter(Boolean)));

  // Fetch diagram data
  const fetchDiagramData = useCallback(async () => {
    if (!firebaseUser) return;
    setDiagramLoading(true);
    setDiagramError('');
    try {
      const token = await firebaseUser.getIdToken();
      
      // Only fetch KPI data since all charts now use this data
      const kpiData = await fetchKPIList(1, 1000, token);
      setDiagramData(kpiData.results);
      
      // Set empty arrays for other data that aren't being used meaningfully
      setEnvironmentalData([]);
      setEmergencyData([]);
      setWaterWasteData([]);
      setWasteData([]);
    } catch (err: any) {
      setDiagramError(err.message || 'Failed to fetch diagram data');
      console.error('Error fetching diagram data:', err);
    } finally {
      setDiagramLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (activeTab === 'diagramatic') {
      fetchDiagramData();
    }
  }, [activeTab, fetchDiagramData]);
  // Filtered data for diagrams - Fixed to use actual available options
  const filteredDiagramData = diagramData.filter(row =>
    (!diagramCompany || row.company_name === diagramCompany) &&
    (!diagramPlant || row.plant_name === diagramPlant) &&
    (!diagramRegion || row.region === diagramRegion) &&
    (!diagramCity || row.city === diagramCity) &&
    (!diagramTech || row.technology_type === diagramTech)
    // (!diagramYear || (row.year_operation_started && row.year_operation_started.toString() === diagramYear))
  );

  // Get unique filter options from actual KPI data
  const diagramCompanies = Array.from(new Set(diagramData.map(r => r.company_name).filter(Boolean)));
  const diagramPlants = Array.from(new Set(diagramData.map(r => r.plant_name).filter(Boolean)));
  const diagramRegions = Array.from(new Set(diagramData.map(r => r.region).filter(Boolean)));
  const diagramCities = Array.from(new Set(diagramData.map(r => r.city).filter(Boolean)));
  const diagramTechs = Array.from(new Set(diagramData.map(r => r.technology_type).filter(Boolean)));
  // const diagramYears = Array.from(new Set(diagramData.map(r => r.year_operation_started).filter(Boolean)));

  const agGridCustomStyles = `
.ag-theme-alpine.custom-aggrid {
  --ag-background-color: var(--color-light, #fff);
  --ag-header-background-color: var(--color-primary, #266541);
  --ag-header-foreground-color: #fff;
  --ag-header-font-weight: 600;
  --ag-row-hover-color: #f0f6ff;
  --ag-row-border-color: #e0e0e0;
  --ag-font-size: 15px;
  --ag-font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  border: none;
  overflow: hidden;
}
.ag-theme-alpine.custom-aggrid .ag-header {
  border-radius: 12px 12px 0 0;
}
.ag-theme-alpine.custom-aggrid .ag-root-wrapper {
  border-radius: 12px;
  background: var(--color-light, #fff);
}
.ag-theme-alpine.custom-aggrid .ag-row {
  border-bottom: 1px solid #f0f0f0;
}
.ag-theme-alpine.custom-aggrid .ag-cell {
  padding: 10px 8px;
}
.ag-theme-alpine.custom-aggrid .ag-header-cell {
  font-size: 16px;
  background: var(--color-primary, #266541);
  color: #fff;
  border-right: 1px solid #e0e0e0;
}
.ag-theme-alpine.custom-aggrid .ag-header-row {
  min-height: 48px !important;
}
.ag-theme-alpine.custom-aggrid .ag-row-selected {
  background: #e3f2fd !important;
}
`;

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === tab.key ? '#b8e3cb' : 'var(--color-light)',
              color: activeTab === tab.key ? '#fff' : '#222',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <style>{agGridCustomStyles}</style>
      {/* Tab Content */}
      {activeTab === 'tabular' && (
        <div style={{ background: 'var(--color-light)', borderRadius: 8, padding: 24 }}>
          <h2 style={{ marginBottom: 16 }}>KPI Table</h2>
          {/* {kpiError && <div style={{ color: 'red' }}>{kpiError}</div>} */}
          <div
            className="ag-theme-alpine custom-aggrid"
            style={{
              height: 600,
              width: '100%',
              borderRadius: 12,
              background: 'var(--color-light, #fff)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              border: 'none',
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            <AgGridReact<KPIRow>
              rowData={undefined}
              columnDefs={columnDefs}
              rowModelType="infinite"
              datasource={dataSource}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
                minWidth: 120,
                cellStyle: { fontSize: '15px', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', background: 'transparent' },
                filterParams: {
                  buttons: ['apply', 'reset'],
                  closeOnApply: true,
                },
              }}
              headerHeight={48}
              rowHeight={44}
              rowSelection="single"
              animateRows={true}
              cacheBlockSize={100}
              infiniteInitialRowCount={1}
              maxBlocksInCache={10}
              onFilterChanged={(params) => {
                // setFilterModel(params.api.getFilterModel()); // This line was removed
                params.api.refreshInfiniteCache();
              }}
              onSortChanged={(params) => {
                const api = params.api as GridApi<KPIRow>;
                // Sort functionality removed - keeping for ag-grid compatibility
                api.refreshInfiniteCache();
              }}
            />
          </div>
          {/* <div style={{ textAlign: 'right', marginTop: 8, color: '#666' }}>
            Total Records: {kpiTotal}
          </div> */}
        </div>
      )}
      
      {activeTab === 'summary' && <SummaryTab />}
      
      {activeTab === 'diagramatic' && (
        <Box sx={{ background: 'var(--color-light)', borderRadius: 2, p: 3, minHeight: 400 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
              Environmental Performance Dashboard
            </Typography>
            
            {/* Filters Section */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>Filters</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={diagramCompany}
                    label="Company"
                    onChange={(e) => setDiagramCompany(e.target.value)}
                  >
                    <MenuItem value="">All Companies</MenuItem>
                    {diagramCompanies.map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Plants</InputLabel>
                  <Select
                    value={diagramPlant}
                    label="Company"
                    onChange={(e) => setDiagramPlant(e.target.value)}
                  >
                    <MenuItem value="">All Plants</MenuItem>
                    {diagramPlants.map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={diagramRegion}
                    label="Region"
                    onChange={(e) => setDiagramRegion(e.target.value)}
                  >
                    <MenuItem value="">All Regions</MenuItem>
                    {diagramRegions.map(r => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>City</InputLabel>
                  <Select
                    value={diagramCity}
                    label="City"
                    onChange={(e) => setDiagramCity(e.target.value)}
                  >
                    <MenuItem value="">All Cities</MenuItem>
                    {diagramCities.map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Technology</InputLabel>
                  <Select
                    value={diagramTech}
                    label="Technology"
                    onChange={(e) => setDiagramTech(e.target.value)}
                  >
                    <MenuItem value="">All Technologies</MenuItem>
                    {diagramTechs.map(t => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Operation Year</InputLabel>
                  <Select
                    value={diagramYear}
                    label="Operation Year"
                    onChange={(e) => setDiagramYear(e.target.value)}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {diagramYears.map(y => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
              </Stack>
            </Paper>
          </Box>

          {diagramLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Loading diagrams...</Typography>
            </Box>
          )}
          
          {diagramError && (
            <Box sx={{ color: 'error.main', p: 2, borderRadius: 1 }}>
              <Typography>{diagramError}</Typography>
            </Box>
          )}

          {!diagramLoading && !diagramError && filteredDiagramData.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography color="text.secondary">No data available for selected filters.</Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Company Overview Section - Now using KPI data */}
              <CompanyOverview data={filteredDiagramData} />

              {/* Environmental and Unit Performance Row */}
              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
                {/* Unit Performance Section - Now using KPI data */}
                <Box sx={{ flex: 1 }}>
                  <UnitPerformanceChart data={filteredDiagramData} />
                </Box>

                {/* Pollutant Chart Section - Now using KPI data */}
                <Box sx={{ flex: 1 }}>
                  <PollutantChart data={filteredDiagramData} />
                </Box>
              </Stack>

              {/* New Emissions Compliance Chart */}
              <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2 }}>
                <EmissionsComplianceChart data={filteredDiagramData} />
              </Box>

              {/* Environmental Monitoring Section - Only show if data exists */}
              {(environmentalData.length > 0 || emergencyData.length > 0) && (
                <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2 }}>
                  <EnvironmentalMonitoring 
                    noiseData={environmentalData} 
                    emergencyData={emergencyData} 
                  />
                </Box>
              )}

              {/* Water and Waste Section - Only show if data exists */}
              {(waterWasteData.length > 0 || wasteData.length > 0) && (
                <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2 }}>
                  <WaterWasteChart 
                    waterData={waterWasteData}
                    wasteData={wasteData}
                  />
                </Box>
              )}

              {/* Performance & Efficiency Analysis Section */}
              <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Performance & Efficiency Analysis
                </Typography>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
                  {/* Fuel Consumption Analysis */}
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 1, height: '100%', bgcolor: '#fff', boxShadow: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                        Fuel Consumption vs Generation
                      </Typography>
                      <Box sx={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={filteredDiagramData.slice(0, 10).map(item => ({
                              plant: item.plant_name?.length > 15 ? item.plant_name.substring(0, 15) + '...' : item.plant_name,
                              fuel_consumption: item.annual_fuel_consumption_m3 || 0,
                              generation: item.annual_generation_mwh || 0
                            }))}
                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="plant" 
                              angle={-45} 
                              textAnchor="end" 
                              height={100}
                              fontSize={11}
                              stroke="#666"
                            />
                            <YAxis yAxisId="left" stroke="#666" fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" stroke="#666" fontSize={12} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }} 
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="fuel_consumption" fill="#0088FE" name="Fuel Consumption (m³)" radius={[2, 2, 0, 0]} />
                            <Bar yAxisId="right" dataKey="generation" fill="#00C49F" name="Generation (MWh)" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Box>

                  {/* Capacity vs Efficiency Scatter */}
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 1, height: '100%', bgcolor: '#fff', boxShadow: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                        Capacity vs Efficiency
                      </Typography>
                      <Box sx={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart 
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              type="number" 
                              dataKey="gross_capacity_mw" 
                              name="Capacity"
                              stroke="#666"
                              fontSize={12}
                              label={{ value: 'Capacity (MW)', position: 'insideBottom', offset: -10 }}
                            />
                            <YAxis 
                              type="number" 
                              dataKey="unit_efficiency" 
                              name="Efficiency"
                              stroke="#666"
                              fontSize={12}
                              label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip 
                              cursor={{ strokeDasharray: '3 3' }}
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                              formatter={(value, name) => [value, name === 'gross_capacity_mw' ? 'Capacity (MW)' : 'Efficiency (%)']}
                            />
                            <Scatter 
                              name="Units" 
                              data={filteredDiagramData.filter(item => item.unit_efficiency && item.unit_efficiency > 0 && item.gross_capacity_mw && item.gross_capacity_mw > 0)}
                              fill="#8884d8" 
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          )}
        </Box>
      )}
      {activeTab === 'map' && (
        <Box sx={{ background: 'var(--color-light)', borderRadius: 2, p: 3, minHeight: 400 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
            Map Visualization
          </Typography>
          
          {/* Map Filters Section */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>Filters</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Company</InputLabel>
                <Select
                  value={companyFilter}
                  label="Company"
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <MenuItem value="">All Companies</MenuItem>
                  {companies.map(c => {
                    console.log(c)
                  return  <MenuItem key={c} value={c}>{c}</MenuItem>
                  })}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Region</InputLabel>
                <Select
                  value={regionFilter}
                  label="Region"
                  onChange={(e) => setRegionFilter(e.target.value)}
                >
                  <MenuItem value="">All Regions</MenuItem>
                  {regions.map(r => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Technology</InputLabel>
                <Select
                  value={techFilter}
                  label="Technology"
                  onChange={(e) => setTechFilter(e.target.value)}
                >
                  <MenuItem value="">All Technologies</MenuItem>
                  {techs.map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
          {loadingMap && <div>Loading map...</div>}
          {errorMap && <div style={{ color: 'red' }}>{errorMap}</div>}
          <div style={{ height: MAP_HEIGHT, width: '100%', margin: '1rem 0', borderRadius: 8, overflow: 'hidden' }}>
            <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} style={{ height: MAP_HEIGHT, width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Plant Markers */}
              {filteredPlants.filter(p => {
                const lat = parseFloat(p.latitude);
                const lng = parseFloat(p.longitude);
                return Number.isFinite(lat) && Number.isFinite(lng);
              }).map(plant => {
                const lat = parseFloat(plant.latitude);
                const lng = parseFloat(plant.longitude);
                return (
                  <Marker key={`plant-${plant.plant_id || plant.id}`} position={[lat, lng] as [number, number]} icon={plantIcon}>
                    <Popup>
                      <strong>{plant.name}</strong><br />
                      {plant.city}, {plant.region}<br />
                      <em>Company:</em> {plant.company || 'N/A'}
                    </Popup>
                  </Marker>
                );
              })}
              {/* Unit Markers */}
              {filteredUnits.filter(u => {
                const lat = parseFloat(u.latitude);
                const lng = parseFloat(u.longitude);
                return Number.isFinite(lat) && Number.isFinite(lng);
              }).map(unit => {
                const lat = parseFloat(unit.latitude);
                const lng = parseFloat(unit.longitude);
                return (
                  <Marker key={`unit-${unit.unit_id}`} position={[lat, lng] as [number, number]} icon={unitIcon}>
                    <Popup>
                      <strong>{unit.name}</strong><br />
                      <em>Plant:</em> {unit.plant_name}<br />
                      <em>Company:</em> {unit.company}<br />
                      <em>Region:</em> {unit.region}<br />
                      <em>City:</em> {unit.city}<br />
                      <em>Technology:</em> {unit.technology_type}<br />
                      <em>Capacity:</em> {unit.gross_capacity_mw} MW
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
          </Box>
      )}
    </div>
  );
};

export default Dashboard; 