/* Cookie-free Cloudflare traffic totals. */
const config = document.querySelector('[data-portfolio-traffic]');
if (config) {
  let site;
  try { site = new URL(config.dataset.siteUrl); } catch { /* Invalid configuration stays off. */ }
  // Production builds opened locally or on preview hosts must not send traffic.
  if (site && location.protocol === 'https:' && location.origin === site.origin) {
    // Retire old analytics preferences and accessible cookies without contacting providers.
    try { localStorage.removeItem('portfolio-analytics-consent-v1'); } catch { /* Storage may be blocked. */ }
    try { sessionStorage.removeItem('portfolio-analytics-prompt-seen-v1'); } catch { /* Storage may be blocked. */ }
    try {
      const domains = location.hostname.split('.');
      const scopes = [''];
      while (domains.length > 1) {
        scopes.push(`; Domain=${domains.join('.')}`);
        domains.shift();
      }
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        if (/^_ga(?:_|$)|^_cl(?:ck|sk)$/.test(name)) scopes.forEach((scope) => {
          document.cookie = `${name}=; Max-Age=0; Path=/; Secure; SameSite=Lax${scope}`;
        });
      });
    } catch { /* Cookies may be blocked. */ }
    if (/^[a-f0-9]{32}$/.test(config.dataset.cloudflareToken) && !document.querySelector('script[data-cf-beacon]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      script.dataset.cfBeacon = JSON.stringify({ token: config.dataset.cloudflareToken, spa: false });
      document.body.append(script);
    }
  }
}
