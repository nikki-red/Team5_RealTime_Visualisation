// fetchMetricsWorker.js
let currentInstance = 'kidonteam5ec2';
// eslint-disable-next-line no-restricted-globals
self.onmessage = function (e) {
  if (e.data.instance) {
    currentInstance = e.data.instance;
  }

  const fetchMetrics = async () => {
    if (!currentInstance) return;

    try {
      
        const apiUrl = `https://u7i3wume3h.execute-api.us-east-1.amazonaws.com/default/InsightGuard-CloudWatch-RealTime?instance=${currentInstance}`;
        console.log('Fetching metrics from:', apiUrl);
        const response = await fetch(apiUrl, 
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText} - ${errorBody.error}gttgtff`);
      }

      const data = await response.json();
      // eslint-disable-next-line no-restricted-globals
      self.postMessage({ data });
    } catch (error) {
      // eslint-disable-next-line no-restricted-globals
      self.postMessage({ error: error.message });
    }
  };

  setInterval(fetchMetrics, 1000);
};