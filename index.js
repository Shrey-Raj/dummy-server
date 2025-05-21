const express = require('express');
const app = express();
// const PORT = 3000;
const PORT = 80;

const domainMap = {
  'reports1.ydns.eu': 'abc123',
  'another.domain.com': 'xyz789',
  'localhost': 'localhost123'
};

// Main route to serve dashboard via custom domain
app.get('/dashboard/public', (req, res) => {
  const host = req.hostname; 
  console.log("Host = ", host);
  const dashboardId = domainMap[host];

  if (!dashboardId) {
    return res.status(404).send('No dashboard mapped to this domain.');
  }

  res.send("We will now map your domain to a dashboard. You can now go to: " + `${host}/dashboard/public/${dashboardId}`);

});

// Route that actually serves dashboard content
app.get('/dashboard/public/:id', (req, res) => {
  const { id } = req.params;
  res.send(`<h1>Public Dashboard ID: ${id}</h1>`);
});

app.get('/', (req,res)=>{
  res.send("Hello from a VPS Server"); 
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
