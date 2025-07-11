import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Stack, Card, CardContent, 
  Select, MenuItem, FormControl, InputLabel, Chip
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { fetchComprehensiveSummary, type ComprehensiveSummary } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE', '#FF6699'];

const SummaryTab: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [summaryData, setSummaryData] = useState<ComprehensiveSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [companyFilter, setCompanyFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [technologyFilter, setTechnologyFilter] = useState('');

  // Fetch summary data
  const fetchData = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    setError('');
    try {
      const token = await firebaseUser.getIdToken();
      const data = await fetchComprehensiveSummary(
        companyFilter || undefined,
        regionFilter || undefined,
        cityFilter || undefined,
        technologyFilter || undefined,
        token
      );
      setSummaryData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch summary data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [firebaseUser, companyFilter, regionFilter, cityFilter, technologyFilter]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading summary data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ color: 'error.main', p: 2 }}>
        <Typography>Error: {error}</Typography>
      </Box>
    );
  }

  if (!summaryData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No summary data available.</Typography>
      </Box>
    );
  }

  const { overall_stats, company_summary, plant_summary } = summaryData;

  // Prepare chart data
  const topCompaniesByCapacity = company_summary
    .sort((a, b) => b.total_capacity_mw - a.total_capacity_mw)
    .slice(0, 10)
    .map(company => ({
      name: company.company_name.length > 15 ? company.company_name.substring(0, 15) + '...' : company.company_name,
      capacity: company.total_capacity_mw,
      generation: company.total_generation_mwh,
      emissions: company.total_pm_emissions + company.total_so2_emissions + company.total_no2_emissions
    }));

  const topCompaniesByEmissions = company_summary
    .sort((a, b) => (b.total_pm_emissions + b.total_so2_emissions + b.total_no2_emissions) - (a.total_pm_emissions + a.total_so2_emissions + a.total_no2_emissions))
    .slice(0, 10)
    .map(company => ({
      name: company.company_name.length > 15 ? company.company_name.substring(0, 15) + '...' : company.company_name,
      pm_emissions: company.total_pm_emissions,
      so2_emissions: company.total_so2_emissions,
      no2_emissions: company.total_no2_emissions,
      total_emissions: company.total_pm_emissions + company.total_so2_emissions + company.total_no2_emissions
    }));

  const plantsByRegion = plant_summary.reduce((acc: Record<string, any>, plant) => {
    const region = plant.region || 'Unknown';
    if (!acc[region]) {
      acc[region] = {
        region,
        plant_count: 0,
        total_capacity: 0,
        total_emissions: 0
      };
    }
    acc[region].plant_count += 1;
    acc[region].total_capacity += plant.total_capacity_mw;
    acc[region].total_emissions += plant.total_pm_emissions + plant.total_so2_emissions + plant.total_no2_emissions;
    return acc;
  }, {});

  const regionData = Object.values(plantsByRegion);

  const technologyDistribution = overall_stats.technologies.map(tech => {
    const techCount = plant_summary.reduce((count, plant) => {
      return count + (plant.technologies.includes(tech) ? 1 : 0);
    }, 0);
    return { name: tech, value: techCount };
  });

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Comprehensive Summary Dashboard
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Company</InputLabel>
            <Select
              value={companyFilter}
              label="Company"
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <MenuItem value="">All Companies</MenuItem>
              {overall_stats.company_names.map(company => (
                <MenuItem key={company} value={company}>{company}</MenuItem>
              ))}
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
              {overall_stats.regions.map(region => (
                <MenuItem key={region} value={region}>{region}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>City</InputLabel>
            <Select
              value={cityFilter}
              label="City"
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <MenuItem value="">All Cities</MenuItem>
              {overall_stats.cities.map(city => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Technology</InputLabel>
            <Select
              value={technologyFilter}
              label="Technology"
              onChange={(e) => setTechnologyFilter(e.target.value)}
            >
              <MenuItem value="">All Technologies</MenuItem>
              {overall_stats.technologies.map(tech => (
                <MenuItem key={tech} value={tech}>{tech}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Overall Statistics Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {overall_stats.total_companies}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Companies
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {overall_stats.total_plants}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Plants
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {overall_stats.total_units}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Units
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {overall_stats.total_capacity_mw.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Capacity (MW)
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Company Analysis Charts */}
      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Company Performance Analysis</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Top Companies by Capacity</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCompaniesByCapacity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="capacity" fill="#0088FE" name="Capacity (MW)" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Top Companies by Emissions</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCompaniesByEmissions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pm_emissions" stackId="a" fill="#8884d8" name="PM" />
                  <Bar dataKey="so2_emissions" stackId="a" fill="#82ca9d" name="SO2" />
                  <Bar dataKey="no2_emissions" stackId="a" fill="#ffc658" name="NO2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Regional & Technology Analysis</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Plants by Region</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="plant_count" fill="#0088FE" name="Plant Count" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Technology Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={technologyDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {technologyDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </Paper>

        {/* Company Summary Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Company Summary</Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Company</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Plants</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Units</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Capacity (MW)</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Generation (MWh)</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Capacity Factor (%)</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total Emissions (ton/year)</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Regions</th>
                </tr>
              </thead>
              <tbody>
                {company_summary.map((company) => (
                  <tr key={company.company_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>{company.company_name}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{company.total_plants}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{company.total_units}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{company.total_capacity_mw.toFixed(0)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{company.total_generation_mwh.toFixed(0)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{company.capacity_factor_avg.toFixed(1)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {(company.total_pm_emissions + company.total_so2_emissions + company.total_no2_emissions).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {company.regions.slice(0, 2).map(region => (
                          <Chip key={region} label={region} size="small" />
                        ))}
                        {company.regions.length > 2 && (
                          <Chip label={`+${company.regions.length - 2} more`} size="small" variant="outlined" />
                        )}
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
};

export default SummaryTab; 