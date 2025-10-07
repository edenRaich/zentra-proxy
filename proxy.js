import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS for your frontend
app.use(cors({
  origin: ['https://edenraich.github.io', 'http://localhost:3000']
}));

// Fetch only the first page for each device, with configurable per_page and start_date
async function fetchFirstPage(sn, perPage, startDate) {
  let url = `https://zentracloud.com/api/v3/get_readings/?device_sn=${encodeURIComponent(sn)}&per_page=${perPage}`;
  if (startDate) {
    url += `&start_date=${encodeURIComponent(startDate)}`;
  }
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
  return {
    device_sn: sn,
    pagination: data.pagination,
    data: data.data
  };
}

app.get('/zentra', async (req, res) => {
  try {
    let deviceSNs = req.query.device_sn;
    let perPage = req.query.per_page || 500;
    let startDate = req.query.start_date;

    if (!deviceSNs) {
      return res.status(400).json({ error: 'device_sn query parameter is required' });
    }
    if (typeof deviceSNs === 'string') {
      deviceSNs = deviceSNs.split(',').map(sn => sn.trim()).filter(Boolean);
    }

    const results = await Promise.all(
      deviceSNs.map(sn => fetchFirstPage(sn, perPage, startDate))
    );
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
