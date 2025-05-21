const express = require('express');
const app = express();
const PORT = 3000;

const domainMap = {
  'reports1.duckdns.org': 'abc123',
  'another.domain.com': 'xyz789'
};

// Main route to serve dashboard via custom domain
app.get('/dashboard/public', (req, res) => {
  const dashboardId = domainMap[host];

  if (!dashboardId) {
    return res.status(404).send('No dashboard mapped to this domain.');
  }

  // Optionally redirect to the actual dashboard route, or just render it directly
  res.redirect(`/dashboard/public/${dashboardId}`);
});

// Route that actually serves dashboard content
app.get('/dashboard/public/:id', (req, res) => {
  const { id } = req.params;
  res.send(`<h1>Public Dashboard ID: ${id}</h1>`);
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
