// scripts/prewarm_daemon.js
// Runs prewarm_fallback_cron.js on a schedule using node-cron
const cron = require('node-cron');
const path = require('path');
const { exec } = require('child_process');

const script = path.join(__dirname, 'prewarm_fallback_cron.js');
const schedule = process.env.PREWARM_SCHEDULE || '0 */1 * * *'; // every hour by default

console.log('Starting prewarm daemon, schedule:', schedule);
cron.schedule(schedule, () => {
  console.log('Running prewarm job at', new Date().toISOString());
  exec(`node ${script}`, (err, stdout, stderr) => {
    if (err) console.error('Prewarm job error:', err.message);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  });
});

// Keep process alive
process.stdin.resume();
