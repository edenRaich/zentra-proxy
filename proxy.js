
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
    const url = 'https://zentracloud.com/api/v3/get_readings/?device_sn=z6-32482';
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Token d445bff30fd09944398c70521da24e19f6c11abf'
      }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from ZentraCloud' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}/zentra`);
});
