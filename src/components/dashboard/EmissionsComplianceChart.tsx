import React from 'react';
import { Box, Typography, Card, CardContent, Stack } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';

interface EmissionsComplianceChartProps {
  data: any[];
}

const EmissionsComplianceChart: React.FC<EmissionsComplianceChartProps> = ({ data }) => {
  // Handle null/undefined data
  const safeData = Array.isArray(data) ? data : [];

  // Handle empty data state
  if (safeData.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Emissions Compliance & Trends Analysis
        </Typography>
        <Typography color="text.secondary">
          No compliance data available.
        </Typography>
      </Box>
    );
  }

  // Calculate compliance status based on concentration limits
  // Common limits: PM: 50 mg/Nm³, SO2: 400 mg/Nm³, NO2: 200 mg/Nm³
  const LIMITS = {
    PM: 50,
    SO2: 400,
    NO2: 200
  };

  const complianceData = safeData.map(unit => {
    const pmCompliant = (unit.pm_concentration_mg_per_Nm3 || 0) <= LIMITS.PM;
    const so2Compliant = (unit.so2_concentration_mg_per_Nm3 || 0) <= LIMITS.SO2;
    const no2Compliant = (unit.no2_concentration_mg_per_Nm3 || 0) <= LIMITS.NO2;
    
    const totalCompliant = [pmCompliant, so2Compliant, no2Compliant].filter(Boolean).length;
    const compliancePercentage = (totalCompliant / 3) * 100;
    
    return {
      unit: `${unit.plant_name || 'Unknown'} - ${unit.unit_name}`.length > 25 
        ? `${unit.plant_name || 'Unknown'} - ${unit.unit_name}`.substring(0, 25) + '...'
        : `${unit.plant_name || 'Unknown'} - ${unit.unit_name}`,
      compliance_percentage: compliancePercentage,
      pm_concentration: unit.pm_concentration_mg_per_Nm3 || 0,
      so2_concentration: unit.so2_concentration_mg_per_Nm3 || 0,
      no2_concentration: unit.no2_concentration_mg_per_Nm3 || 0,
      pm_compliant: pmCompliant,
      so2_compliant: so2Compliant,
      no2_compliant: no2Compliant,
      technology: unit.technology_type || 'Unknown',
      capacity: unit.gross_capacity_mw || 0
    };
  });

  // Overall compliance statistics
  const overallCompliance = complianceData.reduce((acc, unit) => {
    acc.total++;
    if (unit.pm_compliant) acc.pm_compliant++;
    if (unit.so2_compliant) acc.so2_compliant++;
    if (unit.no2_compliant) acc.no2_compliant++;
    if (unit.compliance_percentage === 100) acc.fully_compliant++;
    return acc;
  }, { total: 0, pm_compliant: 0, so2_compliant: 0, no2_compliant: 0, fully_compliant: 0 });

  // Compliance by technology
  const complianceByTech = complianceData.reduce((acc: Record<string, any>, unit) => {
    const tech = unit.technology || 'Unknown';
    if (!acc[tech]) {
      acc[tech] = {
        technology: tech,
        total_units: 0,
        compliant_units: 0,
        avg_pm: 0,
        avg_so2: 0,
        avg_no2: 0,
        pm_sum: 0,
        so2_sum: 0,
        no2_sum: 0
      };
    }
    acc[tech].total_units++;
    if (unit.compliance_percentage === 100) acc[tech].compliant_units++;
    acc[tech].pm_sum += unit.pm_concentration;
    acc[tech].so2_sum += unit.so2_concentration;
    acc[tech].no2_sum += unit.no2_concentration;
    return acc;
  }, {});

  const techComplianceData = Object.values(complianceByTech).map((tech: any) => ({
    technology: tech.technology,
    compliance_rate: (tech.compliant_units / tech.total_units) * 100,
    avg_pm: tech.pm_sum / tech.total_units,
    avg_so2: tech.so2_sum / tech.total_units,
    avg_no2: tech.no2_sum / tech.total_units,
    total_units: tech.total_units
  }));

  // Emissions vs Limits comparison
  const emissionsVsLimits = [
    {
      pollutant: 'PM',
      limit: LIMITS.PM,
      average: complianceData.reduce((sum, unit) => sum + unit.pm_concentration, 0) / complianceData.length,
      max: Math.max(...complianceData.map(unit => unit.pm_concentration)),
      compliant_units: overallCompliance.pm_compliant,
      total_units: overallCompliance.total
    },
    {
      pollutant: 'SO₂',
      limit: LIMITS.SO2,
      average: complianceData.reduce((sum, unit) => sum + unit.so2_concentration, 0) / complianceData.length,
      max: Math.max(...complianceData.map(unit => unit.so2_concentration)),
      compliant_units: overallCompliance.so2_compliant,
      total_units: overallCompliance.total
    },
    {
      pollutant: 'NO₂',
      limit: LIMITS.NO2,
      average: complianceData.reduce((sum, unit) => sum + unit.no2_concentration, 0) / complianceData.length,
      max: Math.max(...complianceData.map(unit => unit.no2_concentration)),
      compliant_units: overallCompliance.no2_compliant,
      total_units: overallCompliance.total
    }
  ];

  // Capacity vs Emissions relationship
  const capacityEmissionsData = complianceData
    .filter(unit => unit.capacity > 0)
    .map(unit => ({
      capacity: unit.capacity,
      total_emissions: unit.pm_concentration + unit.so2_concentration + unit.no2_concentration,
      compliance_percentage: unit.compliance_percentage,
      unit: unit.unit
    }));



  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 700 }}>
        Emissions Compliance & Trends Analysis
      </Typography>
      
      <Stack spacing={3}>
        {/* Compliance Overview Cards */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ flex: 1, bgcolor: '#e8f5e8' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="#4caf50" fontWeight="bold">
                {((overallCompliance.fully_compliant / overallCompliance.total) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fully Compliant Units
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {overallCompliance.fully_compliant} of {overallCompliance.total} units
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, bgcolor: '#fff3e0' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="#ff9800" fontWeight="bold">
                {((overallCompliance.pm_compliant / overallCompliance.total) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PM Compliant Units
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {overallCompliance.pm_compliant} of {overallCompliance.total} units
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, bgcolor: '#e3f2fd' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="#2196f3" fontWeight="bold">
                {((overallCompliance.so2_compliant / overallCompliance.total) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SO₂ Compliant Units
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {overallCompliance.so2_compliant} of {overallCompliance.total} units
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, bgcolor: '#f3e5f5' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="#9c27b0" fontWeight="bold">
                {((overallCompliance.no2_compliant / overallCompliance.total) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                NO₂ Compliant Units
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {overallCompliance.no2_compliant} of {overallCompliance.total} units
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Charts Row */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          {/* Emissions vs Regulatory Limits */}
          <Card sx={{ flex: 1, bgcolor: '#fff', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                Emissions vs Regulatory Limits
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emissionsVsLimits} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="pollutant" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value, name) => [
                        `${Number(value).toFixed(2)} mg/Nm³`,
                        name === 'limit' ? 'Regulatory Limit' : 
                        name === 'average' ? 'Average Concentration' : 'Maximum Concentration'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="limit" fill="#4caf50" name="Regulatory Limit" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="average" fill="#ff9800" name="Average Concentration" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="max" fill="#f44336" name="Maximum Concentration" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Compliance by Technology */}
          <Card sx={{ flex: 1, bgcolor: '#fff', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                Compliance Rate by Technology
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={techComplianceData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="technology" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      fontSize={11}
                      stroke="#666"
                    />
                    <YAxis 
                      stroke="#666" 
                      fontSize={12}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [
                        `${Number(value).toFixed(1)}%`,
                        'Compliance Rate'
                      ]}
                    />
                    <Bar dataKey="compliance_rate" fill="#2196f3" name="Compliance Rate (%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* Capacity vs Emissions Relationship */}
        <Card sx={{ bgcolor: '#fff', boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
              Plant Capacity vs Total Emissions Concentration
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={capacityEmissionsData.sort((a, b) => a.capacity - b.capacity)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="capacity" 
                    stroke="#666"
                    fontSize={12}
                    label={{ value: 'Capacity (MW)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    label={{ value: 'Total Emissions (mg/Nm³)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => [
                      name === 'total_emissions' ? `${Number(value).toFixed(2)} mg/Nm³` : `${Number(value).toFixed(1)}%`,
                      name === 'total_emissions' ? 'Total Emissions' : 'Compliance Rate'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total_emissions" 
                    stroke="#1976d2" 
                    fill="#1976d2" 
                    fillOpacity={0.3}
                    name="Total Emissions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default EmissionsComplianceChart; 