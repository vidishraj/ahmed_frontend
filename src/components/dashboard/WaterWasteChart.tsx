import React from 'react';
import { Box, Typography, Paper, Stack, Card, CardContent } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import type { WaterWasteData, WasteData } from '../../api';

interface WaterWasteChartProps {
  waterData: WaterWasteData[];
  wasteData: WasteData[];
}

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const WaterWasteChart: React.FC<WaterWasteChartProps> = ({ waterData, wasteData }) => {
  // Handle null/undefined data
  const safeWaterData = Array.isArray(waterData) ? waterData : [];
  const safeWasteData = Array.isArray(wasteData) ? wasteData : [];

  if (safeWaterData.length === 0 && safeWasteData.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, color: '#00796b', fontWeight: 700 }}>
          Water & Waste Management
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Typography variant="body1" color="text.secondary">
            No water or waste data available for the selected filters.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Calculate summary statistics
  const totalWaterConsumption = safeWaterData.reduce((sum, item) => sum + (item.total_water_tons_per_year || 0), 0);
  const totalWasteGenerated = safeWasteData.reduce((sum, item) => sum + (item.quantity_kg_per_year || 0), 0);

  // Transform data for charts
  const waterChartData = safeWaterData.map(item => ({
    source: `Unit ${item.unit_id}`,
    consumption: item.total_water_tons_per_year || 0
  }));

  const wasteChartData = safeWasteData.map(item => ({
    type: item.waste_type,
    amount: item.quantity_kg_per_year || 0
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#00796b', fontWeight: 700 }}>
        Water & Waste Management Dashboard
      </Typography>
      
      <Stack spacing={4}>
        {/* Summary Cards */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ flex: 1, bgcolor: '#e0f2f1', borderLeft: '4px solid #00796b' }}>
            <CardContent>
              <Typography variant="h6" color="#00796b">Total Water Consumption</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#00796b' }}>
                {totalWaterConsumption.toFixed(1)} tons/year
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, bgcolor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Typography variant="h6" color="#ff9800">Total Waste Generated</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {(totalWasteGenerated / 1000).toFixed(1)} tons/year
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, bgcolor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
            <CardContent>
              <Typography variant="h6" color="#1976d2">Total Records</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2' }}>
                {safeWaterData.length + safeWasteData.length}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Charts Grid */}
        <Stack spacing={3}>
          {/* Water Consumption Chart */}
          {safeWaterData.length > 0 && (
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Water Consumption by Source
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={waterChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="source" 
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
                      <Bar dataKey="consumption" fill="#00796b" name="Water Consumption (tons/year)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Waste Generation Chart */}
          {safeWasteData.length > 0 && (
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Waste Generation by Type
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wasteChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="type" 
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
                      <Bar dataKey="amount" fill="#ff9800" name="Waste Amount (kg/year)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default WaterWasteChart; 