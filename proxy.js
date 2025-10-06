import express from 'express';
import cors from 'cors';
// If using Node <18, uncomment the next line and install node-fetch
// import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS for your frontend
app.use(cors({
  origin: ['https://edenraich.github.io', 'http://localhost:3000']
}));

app.get('/zentra', async (req, res) => {
  try {
    let deviceSNs = req.query.device_sn;
    if (!deviceSNs) {
      return res.status(400).json({ error: 'device_sn query parameter is required' });
    }
    // Support comma-separated or repeated device_sn
    if (typeof deviceSNs === 'string') {
      deviceSNs = deviceSNs.split(',').map(sn => sn.trim()).filter(Boolean);
    }

    // Fetch each device_sn separately
    const results = await Promise.all(deviceSNs.map(async (sn) => {
      const url = `https://zentracloud.com/api/v3/get_readings/?device_sn=${encodeURIComponent(sn)}`;
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': 'Token d445bff30fd09944398c70521da24e19f6c11abf'
          }
        });
        if (!response.ok) {
          const text = await response.text();
          return { device_sn: sn, error: 'Failed to fetch', status: response.status, body: text };
        }
        const data = await response.json();
        // Return only the relevant data block for frontend
        return { device_sn: sn, ...data };
      } catch (err) {
        return { device_sn: sn, error: 'Fetch error', message: err.message };
      }
    }));

    // Return as { devices: [...] } for frontend compatibility
    res.json({ devices: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Zentra Proxy Server is running.');
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}/zentra`);
});
