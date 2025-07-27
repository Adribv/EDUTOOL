import React, { useState, Suspense } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School as SchoolIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load the components
const StudentRecords = React.lazy(() => import('./StudentRecords'));
const Fees = React.lazy(() => import('./Fees'));

const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
    <Typography>Loading...</Typography>
  </Box>
);

const SchoolManagement = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabConfig = [
    {
      label: 'Student Records',
      icon: <SchoolIcon />,
      component: StudentRecords,
    },
    {
      label: 'Fee Management',
      icon: <PaymentIcon />,
      component: Fees,
    },
  ];

  const renderTabContent = () => {
    const currentTab = tabConfig[activeTab];
    const Component = currentTab.component;

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Component />
      </Suspense>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            School Management
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4 }}
          >
            Manage student records and fee management operations
          </Typography>
        </motion.div>
      </AnimatePresence>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {tabConfig.map((tab, index) => (
            <Tab 
              key={index}
              label={tab.label} 
              icon={tab.icon} 
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default SchoolManagement; 