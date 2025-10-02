import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors({
  origin: '*'
}));

app.get('/', (req, res) => {
  res.send('Zentra Proxy Server is running.');
});

app.get('/zentra', async (req, res) => {
  try {
    let deviceSNs = req.query.device_sn;
    if (!deviceSNs) {
      return res.status(400).json({ error: 'device_sn query parameter is required' });
    }
    // Ensure deviceSNs is always an array
    if (!Array.isArray(deviceSNs)) {
      deviceSNs = [deviceSNs];
    }

    // Fetch data for each device_sn in parallel
    const results = await Promise.all(deviceSNs.map(async (sn) => {
      const url = `https://zentracloud.com/api/v3/get_readings/?device_sn=${sn}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Token d445bff30fd09944398c70521da24e19f6c11abf'
        }
      });
      if (!response.ok) {
        return { device_sn: sn, error: 'Failed to fetch' };
      }
      const data = await response.json();
      return { device_sn: sn, ...data };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}/zentra`);
});
