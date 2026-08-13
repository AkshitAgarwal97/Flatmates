import https from 'https';

const URL = 'https://flatmates-z2bt.onrender.com/health';
const INTERVAL_MS = 12 * 60 * 1000;

function ping(): void {
  https.get(URL, (res) => {
    res.resume();
  }).on('error', (err) => {
    console.error(`[keepAlive] ${new Date().toISOString()} ERROR:`, err.message);
  });
}

ping();
setInterval(ping, INTERVAL_MS);
