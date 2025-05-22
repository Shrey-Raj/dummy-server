const express = require('express');
const dns = require('dns').promises;
const { exec } = require('child_process');
const bodyParser = require('body-parser');

const app = express();
const PORT = 80;

const VPS_IP = '65.20.77.245';

app.use(bodyParser.json());

const domainMap = {
  'reports1.ydns.eu': 'abc123',
  'another.domain.com': 'xyz789',
  'localhost': 'localhost123'
};

async function verifyARecord(domain) {
  try {
    const records = await dns.resolve4(domain);
    console.log(`DNS A records for ${domain}:`, records);
    return records.includes(VPS_IP);
  } catch (err) {
    console.error(`Failed to resolve ${domain}:`, err.message);
    return false;
  }
}

// ✅ Run certbot via NGINX for HTTPS
async function issueCert(domain) {
  return new Promise((resolve, reject) => {
    const cmd = `sudo certbot --nginx -d ${domain} --non-interactive --agree-tos -m you@example.com`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(stderr);  
      }
      resolve(stdout);
    });
  });
}

app.post('/add-domain', async (req, res) => {
  const { domain, dashboardId } = req.body;

  if (!domain || !dashboardId) {
    return res.status(400).json({ error: 'domain and dashboardId required' });
  }

  const valid = await verifyARecord(domain);
  if (!valid) {
    return res.status(400).json({ error: `A-record of ${domain} doesn't match ${VPS_IP}` });
  }

  try {
    await issueCert(domain); // Don't send a response from inside issueCert
    domainMap[domain] = dashboardId;
    return res.json({ success: true, message: `HTTPS setup completed for ${domain}` });
  } catch (err) {
    console.error("Certbot error:", err);
    return res.status(500).json({ error: `Certbot failed: ${err}` });
  }
});


app.get('/dashboard/public', (req, res) => {
  const host = req.hostname;
  const dashboardId = domainMap[host];

  if (!dashboardId) {
    return res.status(404).send('No dashboard mapped to this domain.');
  }

  res.send(`You can now visit: https://${host}/dashboard/public/${dashboardId}`);
});

app.get('/dashboard/public/:id', (req, res) => {
  const { id } = req.params;
  res.send(`<h1>Public Dashboard ID: ${id}</h1>`);
});

app.get('/', (req, res) => {
  res.send('Hello from a VPS Server');
});

app.get("/api/should-allow-domain", (req, res) => {
  const domain = req.query.domain;
  // Check if domain is owned by a user in your DB
  // const isAllowed = allowedDomains.includes(domain);
  const isAllowed = true;
  res.send(isAllowed ? "yes" : "no");
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
