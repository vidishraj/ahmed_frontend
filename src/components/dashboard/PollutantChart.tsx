import React from 'react';
import { Box, Typography, Paper, Stack, Card, CardContent } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';

interface PollutantChartProps {
  data: any[]; // KPI data from the main endpoint
}

const PollutantChart: React.FC<PollutantChartProps> = ({ data }) => {
  // Handle null/undefined data
  const safeData = Array.isArray(data) ? data : [];

  // Handle empty data state
  if (safeData.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Environmental Emissions Analysis
        </Typography>
        <Typography color="text.secondary">
          No emissions data available.
        </Typography>
      </Box>
    );
  }

  // Filter data with valid emissions data
  // const emissionsData = safeData.filter(unit => 
  //   unit.env_load_pm !== null || unit.env_load_so2 !== null || 
  //   unit.env_load_no2 !== null || unit.env_load_co2 !== null
  // );

  // Total emissions by unit (Environmental load data)
  const totalEmissionsData = safeData
    .filter(unit => (unit.env_load_pm || unit.env_load_so2 || unit.env_load_no2))
    .slice(0, 10)
    .map(unit => {
      const totalEmissions = (unit.env_load_pm || 0) + (unit.env_load_so2 || 0) + (unit.env_load_no2 || 0);
      return {
        unit: `${unit.plant_name || 'Unknown'} - ${unit.unit_name}`.length > 20 
          ? `${unit.plant_name || 'Unknown'} - ${unit.unit_name}`.substring(0, 20) + '...'
          : `${unit.plant_name || 'Unknown'} - ${unit.unit_name}`,
        total_emissions: totalEmissions,
        pm: unit.env_load_pm || 0,
        so2: unit.env_load_so2 || 0,
        no2: unit.env_load_no2 || 0
      };
    })
    .sort((a, b) => b.total_emissions - a.total_emissions);

  // Emissions by technology type
  const emissionsByTech = safeData.reduce((acc: Record<string, any>, unit) => {
    const tech = unit.technology_type || 'Unknown';
    if (!acc[tech]) {
      acc[tech] = {
        technology: tech,
        total_pm: 0,
        total_so2: 0,
        total_no2: 0,
        unit_count: 0
      };
    }
    acc[tech].total_pm += unit.env_load_pm || 0;
    acc[tech].total_so2 += unit.env_load_so2 || 0;
    acc[tech].total_no2 += unit.env_load_no2 || 0;
    acc[tech].unit_count += 1;
    return acc;
  }, {});

  const techEmissionsData = Object.values(emissionsByTech);

  // Emissions intensity vs capacity scatter plot
  const intensityData = safeData
    .filter(unit => unit.gross_capacity_mw && unit.gross_capacity_mw > 0)
    .map(unit => {
      const totalEmissions = (unit.env_load_pm || 0) + (unit.env_load_so2 || 0) + (unit.env_load_no2 || 0);
      return {
        capacity: unit.gross_capacity_mw,
        intensity: totalEmissions / unit.gross_capacity_mw,
        unit: `${unit.plant_name || 'Unknown'} - ${unit.unit_name}`,
        technology: unit.technology_type,
        totalEmissions: totalEmissions
      };
    })
    .filter(unit => unit.intensity > 0);

  // Concentration vs Environmental Load analysis
  // const concentrationAnalysis = emissionsData
  //   .filter(unit => unit.pm_concentration_mg_per_Nm3 > 0 && unit.env_load_pm > 0)
  //   .slice(0, 10)
  //   .map(unit => ({
  //     unit: `${unit.plant_name} - ${unit.unit_name}`.length > 15 
  //       ? `${unit.plant_name} - ${unit.unit_name}`.substring(0, 15) + '...'
  //       : `${unit.plant_name} - ${unit.unit_name}`,
  //     pm_concentration: unit.pm_concentration_mg_per_Nm3,
  //     so2_concentration: unit.so2_concentration_mg_per_Nm3 || 0,
  //     no2_concentration: unit.no2_concentration_mg_per_Nm3 || 0,
  //     pm_load: unit.env_load_pm,
  //     so2_load: unit.env_load_so2 || 0,
  //     no2_load: unit.env_load_no2 || 0
  //   }));

  // Calculate summary statistics
  console.log(safeData)
  const totalSO2 = safeData.reduce((sum, item) => sum + (item.so2_emissions || 0), 0);
  const totalNO2 = safeData.reduce((sum, item) => sum + (item.no2_emissions || 0), 0);
  const totalPM = safeData.reduce((sum, item) => sum + (item.pm10_emissions || 0), 0);

  // Modern color palette for emissions
  // const COLORS = ['#d32f2f', '#f57c00', '#388e3c', '#1976d2', '#7b1fa2', '#00796b'];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#d32f2f', fontWeight: 700 }}>
        Emissions Analysis Dashboard
      </Typography>
      
      {data.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Typography variant="body1" color="text.secondary">
            No emissions data available for the selected filters.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {/* Summary Cards */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1, bgcolor: '#ffebee', borderLeft: '4px solid #d32f2f' }}>
              <CardContent>
                <Typography variant="h6" color="#d32f2f">Total SO₂ Emissions</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                  {totalSO2.toFixed(1)} tons
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: '#fff8e1', borderLeft: '4px solid #f57c00' }}>
              <CardContent>
                <Typography variant="h6" color="#f57c00">Total NO₂ Emissions</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#f57c00' }}>
                  {totalNO2.toFixed(1)} tons
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: '#f3e5f5', borderLeft: '4px solid #7b1fa2' }}>
              <CardContent>
                <Typography variant="h6" color="#7b1fa2">Total PM Emissions</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                  {totalPM.toFixed(1)} tons
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          {/* Charts Grid */}
          <Stack spacing={3}>
            {/* Top Polluters */}
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Top Polluters by Total Emissions (kg)
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={totalEmissionsData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="unit" 
                        angle={-45} 
                        textAnchor="end" 
                        height={120}
                        fontSize={11}
                        stroke="#666"
                      />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="total_emissions" fill="#d32f2f" name="Total Emissions (kg)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Emissions by Technology */}
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Emissions by Technology Type
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={techEmissionsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="technology" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        fontSize={12}
                        stroke="#666"
                      />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="total_so2" fill="#d32f2f" name="SO₂ (kg)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="total_no2" fill="#f57c00" name="NO₂ (kg)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="total_pm" fill="#7b1fa2" name="PM (kg)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Emissions Intensity vs Capacity */}
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Emissions Intensity vs Plant Capacity
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={intensityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number" 
                        dataKey="capacity" 
                        name="Capacity (MW)" 
                        stroke="#666"
                        fontSize={12}
                        label={{ value: 'Capacity (MW)', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="intensity" 
                        name="Emissions Intensity" 
                        stroke="#666"
                        fontSize={12}
                        label={{ value: 'Emissions Intensity (kg/MW)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Scatter name="Plants" fill="#d32f2f" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default PollutantChart; 