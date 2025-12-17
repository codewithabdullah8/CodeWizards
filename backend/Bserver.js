// backend/index.js
const express = require('express');
const cors = require('cors');
const diaryRoutes = require('./routes/diaryRoutes'); // we'll create this file

const app = express();

app.use(cors());
app.use(express.json());

// simple health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// mount diary routes under /api
app.use('/api', diaryRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
