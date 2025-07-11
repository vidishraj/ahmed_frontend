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
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter,
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
  { key: 'tabular', label: 'Tabular' },
  { key: 'diagramatic', label: 'Diagramatic' },
  { key: 'map', label: 'Map' },
];

interface KPIRow {
  plant_id: number;
  plant_name: string;
  unit_id: number;
  unit_name: string;
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
  const [activeTab, setActiveTab] = useState('tabular');

  // Map state
  const [plants, setPlants] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [errorMap, setErrorMap] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [techFilter, setTechFilter] = useState('');

  // Table state
  const [_, setKpiRows] = useState<any[]>([]);
  const [_1, setKpiLoading] = useState(false);
  const [kpiError, setKpiError] = useState('');
  const [kpiPageSize] = useState(100); // Increased page size for better UX
  const [kpiTotal, setKpiTotal] = useState(0);
  const [_3, setLastRow] = useState<number | undefined>(undefined);
  const [_4, setSortModel] = useState<any>(null);
  const [_5, setFilterModel] = useState<any>(null);

  // Fetch KPI data
  const fetchKPIs = useCallback(async (
    page: number,
    sortField?: string,
    sortOrder?: string,
    filters?: any,
    append: boolean = false
  ) => {
    if (!firebaseUser) return;
    setKpiLoading(true);
    setKpiError('');
    try {
      const token = await firebaseUser.getIdToken();
      const data = await fetchKPIList(page, kpiPageSize, token, sortField, sortOrder, filters);
      
      setKpiRows(prev => append ? [...prev, ...data.results] : data.results);
      setKpiTotal(data.count);
      setLastRow(data.count);
    } catch (err: any) {
      setKpiError(err.message || 'Failed to fetch KPI data');
    } finally {
      setKpiLoading(false);
    }
  }, [firebaseUser, kpiPageSize]);

  // Initial load
  useEffect(() => {
    if (activeTab === 'tabular') {
      fetchKPIs(1);
    }
  }, [activeTab, fetchKPIs]);

  // ag-Grid datasource
  const dataSource: IDatasource = {
    getRows: async (params: IGetRowsParams) => {
      // Calculate the page number based on startRow
      const page = Math.floor(params.startRow / kpiPageSize) + 1;
      
      // Get sort model
      const sortModel = params.sortModel[0] as SortModelItem | undefined;
      const sortField = sortModel?.colId;
      const sortOrder = sortModel?.sort;
      
      // Get filter model
      const filterModel = params.filterModel as FilterModel;
      
      try {
        const token = await firebaseUser?.getIdToken();
        if (!token) throw new Error('Not authenticated');
        
        const data = await fetchKPIList(page, kpiPageSize, token, sortField, sortOrder, filterModel);
        
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
  const companies = Array.from(new Set([...plants.map(p => p.company), ...units.map(u => u.company)].filter(Boolean)));
  const regions = Array.from(new Set([...plants.map(p => p.region), ...units.map(u => u.region)].filter(Boolean)));
  const techs = Array.from(new Set(units.map(u => u.technology_type).filter(Boolean)));

  // Diagrammatic tab state
  const [diagramCompany, setDiagramCompany] = useState('');
  const [diagramPlant, setDiagramPlant] = useState('');
  const [diagramRegion, setDiagramRegion] = useState('');
  const [diagramCity, setDiagramCity] = useState('');
  const [diagramTech, setDiagramTech] = useState('');
  const [diagramYear, setDiagramYear] = useState('');
  const [diagramData, setDiagramData] = useState<any[]>([]);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [diagramError, setDiagramError] = useState('');
  const [diagramRetirementYear, setDiagramRetirementYear] = useState('');
  const [diagramDevice, setDiagramDevice] = useState('');

  // Fetch KPI data for diagrams
  const fetchDiagramData = useCallback(async () => {
    if (!firebaseUser) return;
    setDiagramLoading(true);
    setDiagramError('');
    try {
      const token = await firebaseUser.getIdToken();
      const data = await fetchKPIList(1, 1000, token);
      setDiagramData(data.results);
    } catch (err: any) {
      setDiagramError(err.message || 'Failed to fetch diagram data');
    } finally {
      setDiagramLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (activeTab === 'diagramatic') {
      fetchDiagramData();
    }
  }, [activeTab, fetchDiagramData]);

  // Filtered data for diagrams
  const filteredDiagramData = diagramData.filter(row =>
    (!diagramCompany || row.company === diagramCompany) &&
    (!diagramPlant || row.plant_name === diagramPlant) &&
    (!diagramRegion || row.region === diagramRegion) &&
    (!diagramCity || row.city === diagramCity) &&
    (!diagramTech || row.technology_type === diagramTech) &&
    (!diagramYear || (row.year && row.year.toString() === diagramYear)) &&
    (!diagramRetirementYear || (row.retirement_year && row.retirement_year.toString() === diagramRetirementYear)) &&
    (!diagramDevice || row.primary_device === diagramDevice)
  );
  const diagramRetirementYears = Array.from(new Set(diagramData.map(r => r.retirement_year).filter(Boolean)));
  const diagramDevices = Array.from(new Set(diagramData.map(r => r.primary_device).filter(Boolean)));

  // Unique filter options
  const diagramCompanies = Array.from(new Set(diagramData.map(r => r.company).filter(Boolean)));
  const diagramPlants = Array.from(new Set(diagramData.map(r => r.plant_name).filter(Boolean)));
  const diagramRegions = Array.from(new Set(diagramData.map(r => r.region).filter(Boolean)));
  const diagramCities = Array.from(new Set(diagramData.map(r => r.city).filter(Boolean)));
  const diagramTechs = Array.from(new Set(diagramData.map(r => r.technology_type).filter(Boolean)));
  const diagramYears = Array.from(new Set(diagramData.map(r => r.year).filter(Boolean)));

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE', '#FF6699', '#33CC99', '#FF6666'];

  // Data aggregation helpers
  const groupBy = (arr: any[], key: string): Record<string, any[]> => {
    return arr.reduce((acc: Record<string, any[]>, item: any) => {
      const k = item[key] || 'Unknown';
      acc[k] = acc[k] || [];
      acc[k].push(item);
      return acc;
    }, {});
  };
  const sumBy = (arr: any[], key: string) => arr.reduce((sum: number, item: any) => sum + (item[key] || 0), 0);

  // Chart data
  const regionGenData = Object.entries(groupBy(filteredDiagramData, 'region')).map(([region, items]) => ({
    region,
    total_generation: sumBy(items, 'annual_generation_mwh'),
  }));
  const techGenData = Object.entries(groupBy(filteredDiagramData, 'technology_type')).map(([tech, items]) => ({
    technology: tech,
    total_generation: sumBy(items, 'annual_generation_mwh'),
  }));
  const yearTrendData = Object.entries(groupBy(filteredDiagramData, 'year')).map(([year, items]) => ({
    year,
    total_generation: sumBy(items, 'annual_generation_mwh'),
    avg_emissions: sumBy(items, 'so2_emissions_intensity') / (items.length || 1),
  }));
  const techPieData = techGenData.map(d => ({ name: d.technology, value: d.total_generation }));

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
            onClick={() => setActiveTab(tab.key)}
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
          {kpiError && <div style={{ color: 'red' }}>{kpiError}</div>}
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
              cacheBlockSize={kpiPageSize}
              infiniteInitialRowCount={1}
              maxBlocksInCache={10}
              onFilterChanged={(params) => {
                setFilterModel(params.api.getFilterModel());
                params.api.refreshInfiniteCache();
              }}
              onSortChanged={(params) => {
                const api = params.api as GridApi<KPIRow>;
                const sortModel = api.getColumnState()
                  .filter(col => col.sort)
                  .map(col => ({
                    colId: col.colId,
                    sort: col.sort
                  }));
                setSortModel(sortModel);
                api.refreshInfiniteCache();
              }}
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: 8, color: '#666' }}>
            Total Records: {kpiTotal}
          </div>
        </div>
      )}
      {activeTab === 'diagramatic' && (
        <div style={{ background: 'var(--color-light)', borderRadius: 8, padding: 24, minHeight: 400 }}>
          <h2 style={{ marginBottom: 16 }}>Diagramatic View</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <select value={diagramCompany} onChange={e => setDiagramCompany(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Companies</option>
              {diagramCompanies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={diagramPlant} onChange={e => setDiagramPlant(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Plants</option>
              {diagramPlants.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={diagramRegion} onChange={e => setDiagramRegion(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Regions</option>
              {diagramRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={diagramCity} onChange={e => setDiagramCity(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Cities</option>
              {diagramCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={diagramTech} onChange={e => setDiagramTech(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Technologies</option>
              {diagramTechs.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={diagramYear} onChange={e => setDiagramYear(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Years</option>
              {diagramYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={diagramRetirementYear} onChange={e => setDiagramRetirementYear(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Retirement Years</option>
              {diagramRetirementYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={diagramDevice} onChange={e => setDiagramDevice(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Devices</option>
              {diagramDevices.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {diagramLoading && <div>Loading diagrams...</div>}
          {diagramError && <div style={{ color: 'red' }}>{diagramError}</div>}
          {filteredDiagramData.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', margin: 40 }}>No data available for selected filters.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
              {/* Bar: Generation by Region */}
              <div style={{ flex: 1, minWidth: 400, height: 320 }}>
                <h4>Generation by Region</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={regionGenData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_generation" fill="#0088FE" name="Generation (MWh)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Pie: Technology Type Share */}
              <div style={{ flex: 1, minWidth: 400, height: 320 }}>
                <h4>Generation Share by Technology</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={techPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {techPieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Line: Generation Trend by Year */}
              <div style={{ flex: 1, minWidth: 400, height: 320 }}>
                <h4>Generation Trend by Year</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={yearTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total_generation" stroke="#0088FE" name="Generation (MWh)" />
                    <Line type="monotone" dataKey="avg_emissions" stroke="#FF8042" name="Avg SO2 Emissions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Scatter: Age vs Efficiency */}
              <div style={{ flex: 1, minWidth: 400, height: 320 }}>
                <h4>Age vs Efficiency</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis dataKey="unit_age" name="Age" />
                    <YAxis dataKey="unit_efficiency" name="Efficiency (%)" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Units" data={filteredDiagramData} fill="#00C49F" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              {/* Stacked Bar: Emissions by Plant */}
              <div style={{ flex: 1, minWidth: 400, height: 320 }}>
                <h4>Emissions by Plant</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={Object.entries(groupBy(filteredDiagramData, 'plant_name')).map(([plant, arr]) => {
                    return {
                      plant,
                      so2: sumBy(arr, 'so2_emissions_intensity'),
                      nox: sumBy(arr, 'nox_emissions_intensity'),
                      pm10: sumBy(arr, 'pm10_emissions_intensity'),
                      co: sumBy(arr, 'co_emissions_intensity'),
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plant" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="so2" stackId="a" fill="#FF8042" name="SO2" />
                    <Bar dataKey="nox" stackId="a" fill="#A28BFE" name="NOx" />
                    <Bar dataKey="pm10" stackId="a" fill="#FFBB28" name="PM10" />
                    <Bar dataKey="co" stackId="a" fill="#FF6699" name="CO" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Histogram: Age distribution */}
              <div style={{ flex: 1, minWidth: 400, height: 320 }}>
                <h4>Unit Age Distribution</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={(() => {
                    const ageBins: Record<string, number> = {};
                    filteredDiagramData.forEach(row => {
                      const age = row.unit_age || 0;
                      const bin = `${Math.floor(age / 5) * 5}-${Math.floor(age / 5) * 5 + 4}`;
                      ageBins[bin] = (ageBins[bin] || 0) + 1;
                    });
                    return Object.entries(ageBins).map(([bin, count]) => ({ bin, count }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bin" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00C49F" name="Units" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Water Use by Plant */}
              <div style={{ flex: 1, minWidth: 400, height: 320 }}>
                <h4>Water Use by Plant</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={Object.entries(groupBy(filteredDiagramData, 'plant_name')).map(([plant, arr]) => {
                    return {
                      plant,
                      water: sumBy(arr, 'total_water_tons_per_year'),
                    };
                  })}>
                    <XAxis dataKey="plant" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="water" fill="#00C49F" name="Water Use (tons/year)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Emissions by Control Device */}
              <div style={{ flex: 1, minWidth: 400, height: 320 }}>
                <h4>SO2 Emissions by Control Device</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={Object.entries(groupBy(filteredDiagramData, 'primary_device')).map(([device, arr]) => {
                      return {
                        name: device,
                        value: sumBy(arr, 'so2_emissions_intensity'),
                      };
                    })} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {diagramDevices.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Stacked Bar: Waste Handling by Plant */}
              <div style={{ flex: 1, minWidth: 400, height: 320 }}>
                <h4>Waste Handling by Plant</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={Object.entries(groupBy(filteredDiagramData, 'plant_name')).map(([plant, arr]) => {
                    return {
                      plant,
                      reuse: sumBy(arr, 'reuse_quantity_kg_per_year'),
                      dump: sumBy(arr, 'dumping_quantity_kg_per_year'),
                    };
                  })}>
                    <XAxis dataKey="plant" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="reuse" stackId="a" fill="#00C49F" name="Reuse (kg/year)" />
                    <Bar dataKey="dump" stackId="a" fill="#FF8042" name="Dump (kg/year)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === 'map' && (
        <div style={{ background: 'var(--color-light)', borderRadius: 8, padding: 24 }}>
          <h2 style={{ marginBottom: 16 }}>Map Visualization</h2>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Companies</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={techFilter} onChange={e => setTechFilter(e.target.value)} style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
              <option value=''>All Technologies</option>
              {techs.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
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
        </div>
      )}
    </div>
  );
};

export default Dashboard; 