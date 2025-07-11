import React from 'react';
import { Box, Typography, Paper, Stack, Card, CardContent } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface CompanyOverviewProps {
  data: any[]; // Raw KPI data
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];
  
  if (safeData.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 700 }}>
          Company Performance Overview
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Typography variant="body1" color="text.secondary">
            No data available for the selected filters.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Modern color palette
  const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#00796b', '#5d4037', '#455a64'];

  // Extract unique companies and aggregate data
  const companyMap = new Map();
  safeData.forEach(item => {
    const company = item.plant_name || 'Unknown';
    if (!companyMap.has(company)) {
      companyMap.set(company, {
        company,
        totalCapacity: 0,
        totalUnits: 0,
        totalEfficiency: 0,
        validEfficiencyCount: 0
      });
    }
    const companyData = companyMap.get(company);
    companyData.totalCapacity += item.gross_capacity_mw || 0;
    companyData.totalUnits += 1;
    if (item.unit_efficiency && item.unit_efficiency > 0) {
      companyData.totalEfficiency += item.unit_efficiency;
      companyData.validEfficiencyCount += 1;
    }
  });

  const companyData = Array.from(companyMap.values())
    .map(comp => ({
      ...comp,
      avgEfficiency: comp.validEfficiencyCount > 0 ? comp.totalEfficiency / comp.validEfficiencyCount : 0
    }))
    .sort((a, b) => b.totalCapacity - a.totalCapacity);

  // Technology distribution
  const techMap = new Map();
  safeData.forEach(item => {
    const tech = item.technology_type || 'Unknown';
    techMap.set(tech, (techMap.get(tech) || 0) + 1);
  });
  const techDistribution = Array.from(techMap.entries()).map(([name, value]) => ({ name, value }));

  // Summary statistics
  const totalCapacity = safeData.reduce((sum, item) => sum + (item.gross_capacity_mw || 0), 0);
  const efficiencyItems = safeData.filter(item => item.unit_efficiency && item.unit_efficiency > 0);
  const avgEfficiency = efficiencyItems.length > 0 
    ? efficiencyItems.reduce((sum, item) => sum + item.unit_efficiency, 0) / efficiencyItems.length 
    : 0;

  const efficiencyData = companyData
    .filter(comp => comp.avgEfficiency > 0)
    .slice(0, 10)
    .map(comp => ({
      company: comp.company,
      avgEfficiency: comp.avgEfficiency
    }));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 700 }}>
        Company Performance Overview
      </Typography>
      
      {data.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Typography variant="body1" color="text.secondary">
            No data available for the selected filters.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {/* Summary Cards */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1, bgcolor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
              <CardContent>
                <Typography variant="h6" color="#1976d2">Total Companies</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {companyData.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: '#e8f5e8', borderLeft: '4px solid #388e3c' }}>
              <CardContent>
                <Typography variant="h6" color="#388e3c">Total Capacity</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#388e3c' }}>
                  {totalCapacity.toFixed(0)} MW
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: '#fff3e0', borderLeft: '4px solid #f57c00' }}>
              <CardContent>
                <Typography variant="h6" color="#f57c00">Avg Efficiency</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#f57c00' }}>
                  {avgEfficiency.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          {/* Charts Grid */}
          <Stack spacing={3}>
            {/* Technology Distribution */}
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Technology Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={techDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {techDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} units`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Company Capacity Analysis */}
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Company Capacity Analysis (Top 10)
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={companyData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="company" 
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
                      <Bar dataKey="totalCapacity" fill="#1976d2" name="Total Capacity (MW)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Efficiency Metrics */}
            <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                  Efficiency Performance by Company (Top 10)
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={efficiencyData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="company" 
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
                      <Bar dataKey="avgEfficiency" fill="#388e3c" name="Average Efficiency (%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
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

export default CompanyOverview; 