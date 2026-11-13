---
title: Privacy
permalink: /privacy/
description: Privacy and cookie-free traffic totals on Gautam Nair's portfolio.
---
<section class="wrap section">
<header class="page-heading"><p class="eyebrow">PRIVACY</p><h1>Privacy on this website.</h1></header>
<div class="prose">
{% assign cloudflare_token = site.analytics.cloudflare_token | default: '' | strip %}

<h2>Basic traffic totals</h2>
{% if cloudflare_token != '' %}
<p>I use Cloudflare Web Analytics for aggregate page views, visits, and page performance to understand and improve this website. Cloudflare describes this service as using no analytics cookies, local storage, or visitor fingerprinting to identify people. Visits are a traffic measure, not an exact count of unique people.</p>
<p>Your browser sends measurement requests to Cloudflare. These cookie-free measurements can run when Do Not Track or Global Privacy Control is enabled. Browser blockers can prevent them, so traffic totals may be incomplete. See <a href="https://www.cloudflare.com/web-analytics/">Cloudflare Web Analytics</a> and <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare's privacy policy</a>.</p>
{% else %}
<p>Visitor analytics is currently disabled. No analytics provider is loaded by this site.</p>
{% endif %}
<p>This site does not use session replays or heatmaps. It does not send custom search, click, scroll, or video interaction events.</p>

<h2>Advertising and reports</h2>
<p>I use traffic totals to improve this website, not to run advertising campaigns or build advertising audiences. Reports are not published on this portfolio. Access is controlled through the owner's Cloudflare account. Cloudflare processes measurement data under its own terms; private reports do not mean the data stays solely on the owner's computer.</p>

<h2>Hosting and external content</h2>
<p>This site is hosted by GitHub Pages. GitHub may process technical request information to serve and secure the site; see the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub privacy statement</a>. Project pages may contain YouTube or Google Drive embeds. Those services can receive request information when their content loads, independently of the site's traffic measurements. External links take you to sites with their own privacy and advertising practices.</p>
<p>For questions about this portfolio, <a href="https://www.linkedin.com/in/gautamsnair/">contact Gautam on LinkedIn</a>.</p>
</div>
</section>
