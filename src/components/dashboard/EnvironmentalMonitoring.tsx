import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import type { EnvironmentalData, EmergencyData } from '../../api';

interface EnvironmentalMonitoringProps {
  noiseData: EnvironmentalData[];
  emergencyData: EmergencyData[];
}

const EnvironmentalMonitoring: React.FC<EnvironmentalMonitoringProps> = ({
  noiseData,
  emergencyData
}) => {
  // Handle null/undefined data
  const safeNoiseData = Array.isArray(noiseData) ? noiseData : [];
  const safeEmergencyData = Array.isArray(emergencyData) ? emergencyData : [];

  // Transform noise data for visualization
  const noiseChartData = safeNoiseData.map(data => ({
    quarter: data.quarter,
    average: data.average_decibel,
    dayLimit: data.limit_day_decibel,
    nightLimit: data.limit_night_decibel,
    plant: `Plant ${data.plant_id}`
  }));

  // Transform emergency data
  const emergencyByType = safeEmergencyData.reduce((acc, incident) => {
    const existingType = acc.find(t => t.type === incident.incident_type);
    if (existingType) {
      existingType.count += incident.count;
    } else {
      acc.push({
        type: incident.incident_type,
        count: incident.count
      });
    }
    return acc;
  }, [] as Array<{ type: string; count: number }>);

  // Transform timeline data - safely handle timeline array
  const timelineData = safeEmergencyData.flatMap(incident => {
    // Ensure timeline exists and is an array
    const timeline = Array.isArray(incident.timeline) ? incident.timeline : [];
    return timeline.map(event => ({
      date: new Date(event.date).getTime(),
      type: event.type,
      details: event.details,
      company: `Company ${incident.company_id}`
    }));
  }).sort((a, b) => a.date - b.date);

  // Handle empty data states
  if (safeNoiseData.length === 0 && safeEmergencyData.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Environmental Monitoring
        </Typography>
        <Typography color="text.secondary">
          No environmental monitoring data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Environmental Monitoring
      </Typography>

      {/* Noise Level Monitoring */}
      {safeNoiseData.length > 0 ? (
        <Box mb={4}>
          <Typography variant="subtitle1" gutterBottom>
            Noise Level Monitoring
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={noiseChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis label={{ value: 'Decibel (dB)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average" stroke="#8884d8" name="Average Level" />
              <Line type="monotone" dataKey="dayLimit" stroke="#82ca9d" name="Day Limit" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="nightLimit" stroke="#ffc658" name="Night Limit" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Box mb={4}>
          <Typography variant="subtitle1" gutterBottom>
            Noise Level Monitoring
          </Typography>
          <Typography color="text.secondary">No noise monitoring data available.</Typography>
        </Box>
      )}

      {/* Emergency Incidents by Type */}
      {emergencyByType.length > 0 ? (
        <Box mb={4}>
          <Typography variant="subtitle1" gutterBottom>
            Emergency Incidents by Type
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emergencyByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis label={{ value: 'Number of Incidents', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Incident Count" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Box mb={4}>
          <Typography variant="subtitle1" gutterBottom>
            Emergency Incidents by Type
          </Typography>
          <Typography color="text.secondary">No emergency incident data available.</Typography>
        </Box>
      )}

      {/* Emergency Incidents Timeline */}
      {timelineData.length > 0 ? (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Emergency Incidents Timeline
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                type="number"
                domain={['auto', 'auto']}
                tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
                name="Date"
              />
              <YAxis dataKey="company" type="category" name="Company" />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'date') {
                    return new Date(value).toLocaleDateString();
                  }
                  return value;
                }}
              />
              <Legend />
              <Scatter
                data={timelineData}
                fill="#8884d8"
                name="Incidents"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Emergency Incidents Timeline
          </Typography>
          <Typography color="text.secondary">No timeline data available.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default EnvironmentalMonitoring; 