import React from 'react';
import { Box, Typography, Paper, Stack, Card, CardContent } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

interface UnitPerformanceChartProps {
  data: any[]; // KPI data from the main endpoint
}

const UnitPerformanceChart: React.FC<UnitPerformanceChartProps> = ({ data }) => {
  // Handle null/undefined data
  const safeData = Array.isArray(data) ? data : [];

  // Handle empty data state
  if (safeData.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Unit Performance Analysis
        </Typography>
        <Typography color="text.secondary">
          No performance data available.
        </Typography>
      </Box>
    );
  }

  // Top performing units by efficiency
  const efficiencyData = safeData
    .filter(unit => unit.unit_efficiency !== null && unit.unit_efficiency > 0)
    .sort((a, b) => b.unit_efficiency - a.unit_efficiency)
    .slice(0, 10)
    .map(unit => ({
      unit: `${unit.plant_name} - ${unit.unit_name}`.length > 20 
        ? `${unit.plant_name} - ${unit.unit_name}`.substring(0, 20) + '...'
        : `${unit.plant_name} - ${unit.unit_name}`,
      efficiency: unit.unit_efficiency,
      capacity_factor: unit.capacity_factor || 0,
      capacity: unit.gross_capacity_mw || 0,
      generation: unit.annual_generation_mwh || 0
    }));

  // Capacity factor analysis
  const capacityFactorData = safeData
    .filter(unit => unit.capacity_factor !== null && unit.capacity_factor > 0)
    .sort((a, b) => b.capacity_factor - a.capacity_factor)
    .slice(0, 10)
    .map(unit => ({
      unit: `${unit.plant_name} - ${unit.unit_name}`.length > 20 
        ? `${unit.plant_name} - ${unit.unit_name}`.substring(0, 20) + '...'
        : `${unit.plant_name} - ${unit.unit_name}`,
      capacity_factor: unit.capacity_factor,
      efficiency: unit.unit_efficiency || 0,
      technology: unit.technology_type
    }));

  // Performance by technology
  const performanceByTech = safeData.reduce((acc: Record<string, any>, unit) => {
    const tech = unit.technology_type || 'Unknown';
    if (!acc[tech]) {
      acc[tech] = {
        technology: tech,
        total_efficiency: 0,
        total_capacity_factor: 0,
        unit_count: 0,
        total_capacity: 0,
        total_generation: 0
      };
    }
    if (unit.unit_efficiency) {
      acc[tech].total_efficiency += unit.unit_efficiency;
    }
    if (unit.capacity_factor) {
      acc[tech].total_capacity_factor += unit.capacity_factor;
    }
    acc[tech].unit_count += 1;
    acc[tech].total_capacity += unit.gross_capacity_mw || 0;
    acc[tech].total_generation += unit.annual_generation_mwh || 0;
    return acc;
  }, {});

  const techPerformanceData = Object.values(performanceByTech).map((tech: any) => ({
    technology: tech.technology,
    avg_efficiency: tech.total_efficiency / tech.unit_count,
    avg_capacity_factor: tech.total_capacity_factor / tech.unit_count,
    total_capacity: tech.total_capacity,
    total_generation: tech.total_generation,
    unit_count: tech.unit_count
  }));


  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 700 }}>
        Unit Performance Analytics
      </Typography>
      
      {data.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Typography variant="body1" color="text.secondary">
            No performance data available for the selected filters.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {/* Summary Cards */}
          <Box sx={{ flexGrow: 1, mb: 2 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: '1 1 250px', minWidth: "fit-content", maxWidth: 'fit-content' }}>
                <Card sx={{ height: '100%', bgcolor: '#e3f2fd', borderLeft: '4px solid #1976d2', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" color="#1976d2">Total Units</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2', wordBreak: 'break-word' }}>
                      {data.length}
                    </Typography>
                  </CardContent>
                </Card>
              </div>
              <div style={{ flex: '1 1 250px',  minWidth: "fit-content", maxWidth: 'fit-content' }}>
                <Card sx={{ height: '100%', bgcolor: '#e8f5e8', borderLeft: '4px solid #388e3c', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" color="#388e3c">Avg Efficiency</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#388e3c', wordBreak: 'break-word' }}>
                      {efficiencyData.length > 0 
                        ? (efficiencyData.reduce((sum, item) => sum + item.efficiency, 0) / efficiencyData.length).toFixed(1)
                        : '0'
                      }%
                    </Typography>
                  </CardContent>
                </Card>
              </div>
              <div style={{ flex: '1 1 250px',  minWidth: "fit-content", maxWidth: 'fit-content' }}>
                <Card sx={{ height: '100%', bgcolor: '#fff3e0', borderLeft: '4px solid #f57c00', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" color="#f57c00">Avg Capacity Factor</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#f57c00', wordBreak: 'break-word' }}>
                      {capacityFactorData.length > 0 
                        ? (capacityFactorData.reduce((sum, item) => sum + item.capacity_factor, 0) / capacityFactorData.length).toFixed(1)
                        : '0'
                      }%
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Box>

          {/* Charts Grid */}
          <Stack spacing={3}>
            {/* Efficiency Rankings */}
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Unit Efficiency Rankings (Top 10)
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={efficiencyData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
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
                      <Bar dataKey="efficiency" fill="#388e3c" name="Efficiency (%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Capacity Factor Analysis */}
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Capacity Factor Analysis (Top 10)
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={capacityFactorData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
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
                      <Bar dataKey="capacity_factor" fill="#f57c00" name="Capacity Factor (%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Performance by Technology */}
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Performance Metrics by Technology
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={techPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
                      <Bar dataKey="avg_efficiency" fill="#388e3c" name="Avg Efficiency (%)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="avg_capacity_factor" fill="#f57c00" name="Avg Capacity Factor (%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Generation vs Capacity Analysis */}
            {/* <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Annual Generation vs Capacity Relationship
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={generationVsCapacity} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                        dataKey="generation" 
                        name="Annual Generation (MWh)" 
                        stroke="#666"
                        fontSize={12}
                        label={{ value: 'Annual Generation (MWh)', angle: -90, position: 'insideLeft' }}
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
                      <Scatter name="Units" fill="#1976d2" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card> */}
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default UnitPerformanceChart;