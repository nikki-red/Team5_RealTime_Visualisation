import React, { useState, useEffect } from 'react';
import './App.css';
import { Grid, Typography, Tooltip, IconButton, Paper } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import GaugeChart from 'react-gauge-chart';
import Plot from 'react-plotly.js';



function App() {
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [metricsError, setMetricsError] = useState(null);
  const ec2Instance = 'kidonteam5ec2';
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    const worker = new Worker(new URL('./fetchMetricsWorker.js', import.meta.url));
    console.log('Worker initialized and message sent:', ec2Instance);

    // Send the initial instance to the worker
    worker.postMessage({ instance: ec2Instance });

    worker.onmessage = (e) => {
      const { data, error } = e.data;

      if (error) {
        console.log(error);
        setMetricsError(error);
      } else {
        setCurrentMetrics(data);

        // Update history with new data point
        setMetricsHistory(prev => {
          const now = new Date();
          const newHistory = [...prev, { time: now, value: data.currentValue }];
          return newHistory.filter(point => now.getTime() - point.time.getTime() <= 120000);
        });
      }
    };

    return () => {
      worker.terminate();
    };
  }, [ec2Instance]); // Re-run effect when ec2Instance 

  return (

    <Grid container spacing={3} sx={{ mt: 0 }}>

    {/* Real-time CPU Gauge */}
    <Grid item xs={12} md={4} sx={{height: '350px'}}>
      <Grid container direction="column" spacing={1}>
        {/* Date Display */}
        <Grid item>
          <Typography variant="h6" sx={{ mb: 0 }}>
            CPU Utilisation:
            <Tooltip
              title={
                <div>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Metric Description</Typography>
                  <Typography variant="body2">The percentage of physical CPU time that Amazon EC2 uses to run the EC2 instance, which includes time spent to run both the user code and the Amazon EC2 code.</Typography>
                </div>
              }
              placement="right"
            >
              <IconButton sx={{ color: '#4a4a4a', ml: 1 }}> {/* Dark gray color */}
                <InfoIcon sx={{ fontSize: 'medium' }} />
              </IconButton>
            </Tooltip>
          </Typography>
        </Grid>
        
        <Grid item sx={{ mb: 2 }}>
          <Paper elevation={2} sx={{ p: 2, bgcolor: '#ffffff' }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
              Real-time CPU Utilisation

            </Typography>
            {metricsError && (
              <Typography color="error">
                Error loading metrics: {metricsError}
              </Typography>
            )}
            {currentMetrics && (
              <>
                <GaugeChart
                  id="cpu-gauge"
                  nrOfLevels={30}
                  colors={["#FFC371", "#FF5F6D"]}
                  arcWidth={0.3}
                  percent={currentMetrics.currentValue / 100}
                  textColor="#000000"
                  formatTextValue={(value) => `${(value)}%`}
                  animate={false}
                />
                <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', display: 'block', textAlign: 'left' }}>
                  Last updated:
                </Typography>
                <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', display: 'block', textAlign: 'center' }}>
                  Time: {new Date(currentMetrics.lastUpdated).toLocaleTimeString()}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', display: 'block', textAlign: 'center' }}>
                  Date: {currentDate}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
        
      </Grid>
    </Grid>
    {/* Real-time Chart */}
          
    <Grid item xs={12} md={8}>
      <Paper elevation={2} sx={{ p: 2, bgcolor: '#ffffff' }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
          CPU Utilization History (Last 2 minutes)
        </Typography>
        {metricsHistory.length > 0 && (
          <Plot
            data={[
              {

                x: metricsHistory.map(m => m.time),
                y: metricsHistory.map(m => m.value),
                type: 'scatter',
                mode: 'lines',
                name: 'CPU Utilization',
                line: { color: '#8884d8', width: 2 }
              }
            ]}
            layout={{
              autosize: true,
              height: 370,
              margin: { l: 50, r: 30, t: 20, b: 50 },
              xaxis: {
                title: 'Time',
                tickangle: -45,
                range: [
                  new Date(Date.now() - 120000), // 2 minutes ago
                  new Date() // now
                ],
                type: 'date'
              },
              yaxis: {
                title: 'CPU Utilization (%)',
                range: [0, 100]
              }
            }}
            config={{
              responsive: true,
              displayModeBar: false
            }}
            style={{ width: '100%' }}
          />
        )}
      </Paper>
    </Grid>
            
  </Grid>
  );
}

export default App;
