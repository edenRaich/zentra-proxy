import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Zentra Proxy Server is running.');
});

app.get('/zentra', async (req, res) => {
  try {
    const deviceSNs = req.query.device_sn;
    if (!deviceSNs) {
      return res.status(400).json({ error: 'Missing device_sn query parameter' });
    }

    const deviceList = deviceSNs.split(',');

    const fetches = deviceList.map(async (sn) => {
      const url = `https://zentracloud.com/api/v3/get_readings/?device_sn=${encodeURIComponent(sn.trim())}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Token d445bff30fd09944398c70521da24e19f6c11abf'
        }
      });
      if (!response.ok) {
        return { device_sn: sn, error: `Failed to fetch data (status ${response.status})` };
      }
      const data = await response.json();
      return { device_sn: sn, data };
    });

    const results = await Promise.all(fetches);

    res.json({ devices: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}/zentra`);
});
