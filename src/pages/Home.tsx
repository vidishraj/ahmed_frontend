import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Engineering as EngineeringIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: <DashboardIcon sx={{ fontSize: 40, color: '#266541' }} />,
      title: 'Real-time Monitoring',
      description: 'Comprehensive view of operational health and efficiency across all power generating stations.'
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#266541' }} />,
      title: 'Performance Analytics',
      description: 'Transform raw operational data into actionable insights for better decision making.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#266541' }} />,
      title: 'Proactive Management',
      description: 'Identify issues before they become problems and optimize processes continuously.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#266541' }} />,
      title: 'Safety & Reliability',
      description: 'Ensure sustained high performance with focus on safety and cost-effectiveness.'
    }
  ];

  const keyBenefits = [
    'Operational Excellence',
    'Real-time Data Processing',
    'Predictive Maintenance',
    'Cost Optimization',
    'Performance Tracking',
    'Regulatory Compliance'
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#effaf5' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: '#266541',
          color: '#effaf5',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label="NCEC Digital Platform" 
                  sx={{ 
                    bgcolor: 'rgba(184, 227, 203, 0.3)',
                    color: '#effaf5',
                    mb: 2,
                    fontWeight: 600,
                    border: '1px solid rgba(184, 227, 203, 0.5)'
                  }} 
                />
              </Box>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  color: '#effaf5'
                }}
              >
                Key Performance Indicators Platform
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  fontWeight: 300,
                  lineHeight: 1.4,
                  color: '#b8e3cb'
                }}
              >
                A critical digital tool for effective supervision of power generating stations
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    bgcolor: '#effaf5',
                    color: '#266541',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#b8e3cb',
                      color: '#266541'
                    }
                  }}
                  startIcon={<DashboardIcon />}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={scrollToFeatures}
                  sx={{
                    borderColor: '#effaf5',
                    color: '#effaf5',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#b8e3cb',
                      bgcolor: 'rgba(184, 227, 203, 0.1)',
                      color: '#b8e3cb'
                    }
                  }}
                  startIcon={<InsightsIcon />}
                >
                  Explore Features
                </Button>
              </Box>
            </Box>
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Paper
                elevation={8}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: '#effaf5',
                  border: '2px solid #b8e3cb'
                }}
              >
                <Box sx={{ textAlign: 'center', color: '#266541' }}>
                  <EngineeringIcon sx={{ fontSize: 80, color: '#266541', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#266541' }}>
                    Welcome, {user?.displayName || user?.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#86b29a' }}>
                    Role: {user?.role?.toUpperCase()}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Platform Description */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 'bold', mb: 3, color: '#266541' }}>
            Transforming Power Generation Supervision
          </Typography>
          <Typography variant="h6" sx={{ color: '#86b29a', maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
            In an industry where reliability, safety, and cost-effectiveness are paramount, our platform transforms 
            raw operational data into actionable insights, enabling proactive management and sustained high performance.
          </Typography>
        </Box>

        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            mb: 6, 
            borderRadius: 3,
            bgcolor: '#effaf5',
            border: '2px solid #b8e3cb'
          }}
        >
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#266541' }}>
            This Key Performance Indicators' (KPIs) platform is designed for NCEC as a critical digital tool for the 
            effective supervision of power generating stations, offering a comprehensive and real-time view into their 
            operational health and efficiency. The ability to accurately measure, monitor, and analyze performance data 
            is not merely beneficial but essential. This platform enables plant managers and stakeholders to proactively 
            identify issues, optimize processes, and ensure sustained high performance.
          </Typography>
          <Box sx={{ mt: 3, p: 3, bgcolor: '#b8e3cb', borderRadius: 2, border: '1px solid #86b29a' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#266541' }}>
              <strong>Without a robust KPI platform</strong>, supervising complex power generation assets would be akin to 
              navigating without a compass, thereby impeding the achievement of operational excellence and the fulfillment 
              of ever-increasing demands for consistent and reliable power supply.
            </Typography>
          </Box>
        </Paper>

        {/* Features Grid */}
        <Box ref={featuresRef} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 4, mb: 6 }}>
          {features.map((feature, index) => (
            <Card 
              key={index}
              elevation={2}
              sx={{ 
                height: '100%', 
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                bgcolor: '#effaf5',
                border: '1px solid #b8e3cb',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(38, 101, 65, 0.15)',
                  borderColor: '#86b29a'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2, color: '#266541' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#86b29a' }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Key Benefits */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h3" sx={{ fontWeight: 'bold', mb: 4, color: '#266541' }}>
            Key Benefits
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {keyBenefits.map((benefit, index) => (
              <Chip
                key={index}
                label={benefit}
                icon={<TrendingUpIcon />}
                variant="outlined"
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 500,
                  borderColor: '#266541',
                  color: '#266541',
                  bgcolor: '#effaf5',
                  '&:hover': {
                    bgcolor: '#b8e3cb',
                    borderColor: '#86b29a'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: '#b8e3cb',
          py: 6,
          borderTop: '2px solid #86b29a'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h3" sx={{ fontWeight: 'bold', mb: 3, color: '#266541' }}>
              Ready to Optimize Your Operations?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: '#266541' }}>
              Start monitoring your power generation performance with real-time insights.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: 3,
                bgcolor: '#266541',
                color: '#effaf5',
                '&:hover': {
                  bgcolor: '#1a4a2f'
                }
              }}
              startIcon={<AssessmentIcon />}
            >
              Access Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 