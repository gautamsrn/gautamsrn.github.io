"""Cloudflare-only analytics regression checks; every external request is intercepted.

Build production output in .preview/analytics-production, production with an empty
Cloudflare token in .preview/analytics-disabled, and development output in
.preview/analytics-development. Run with Python and Playwright available.
"""
import json
import os
from pathlib import Path
from urllib.parse import unquote, urlparse

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
ENABLED = ROOT / '.preview/analytics-production'
DISABLED = ROOT / '.preview/analytics-disabled'
DEVELOPMENT = ROOT / '.preview/analytics-development'
ORIGIN = 'https://gautamsrn.github.io'
KEY = 'portfolio-analytics-consent-v1'
checks = []


def check(label, condition):
    assert condition, label
    checks.append(label)
    print('PASS: ' + label, flush=True)


def context_for(browser, build=ENABLED, origin=ORIGIN, setup=None, block_cloudflare=False):
    context = browser.new_context(viewport={'width': 1440, 'height': 1000})
    traffic, retired, errors = [], [], []

    def route_request(route):
        url = urlparse(route.request.url)
        host = url.hostname or ''
        if host.endswith(('google-analytics.com', 'googletagmanager.com', 'clarity.ms')):
            retired.append(route.request.url)
            route.abort()
        elif host.endswith('cloudflareinsights.com'):
            traffic.append(route.request.url)
            if block_cloudflare:
                route.abort('blockedbyclient')
            else:
                route.fulfill(status=200, content_type='application/javascript', body='/* intercepted provider */')
        elif host == urlparse(origin).hostname:
            path = build / unquote(url.path.lstrip('/'))
            if path.is_dir():
                path /= 'index.html'
            if path.is_file() and path.resolve().is_relative_to(build.resolve()):
                route.fulfill(path=str(path))
            else:
                route.fulfill(status=404, body='Not found')
        else:
            route.abort()

    context.route('**/*', route_request)
    if setup:
        context.add_init_script(setup)
    page = context.new_page()
    page.clock.install()
    page.on('pageerror', lambda error: errors.append(str(error)))
    return context, page, traffic, retired, errors


with sync_playwright() as playwright:
    executable = os.environ.get('CHROME_PATH', r'C:\Program Files\Google\Chrome\Application\chrome.exe')
    browser = playwright.chromium.launch(executable_path=executable, headless=True)
    for label, setup in [
        ('a new visitor', None),
        ('Do Not Track', "Object.defineProperty(navigator, 'doNotTrack', {value: '1'});"),
        ('Global Privacy Control', "Object.defineProperty(navigator, 'globalPrivacyControl', {value: true});"),
        ('blocked browser storage', "for (const key of ['localStorage', 'sessionStorage']) Object.defineProperty(window, key, {get() {throw new Error('Storage blocked')}});"),
    ]:
        context, page, traffic, retired, errors = context_for(browser, setup=setup)
        page.goto(ORIGIN)
        check('Cloudflare loads for ' + label, len(traffic) == 1)
        page.clock.fast_forward(15000)
        check('No retired provider or consent notice for ' + label, not retired and not errors
              and page.locator('[data-analytics-consent], [data-privacy-settings], [data-consent-feedback]').count() == 0
              and page.evaluate('typeof window.gtag') == 'undefined')
        check('No analytics cookies are created for ' + label, context.cookies() == [])
        if setup is None:
            check('No visitor identifiers or consent choices are stored', page.evaluate('localStorage.length + sessionStorage.length') == 0)
            for width in (320, 390, 1440):
                page.set_viewport_size({'width': width, 'height': 850})
                check(f'The page fits at {width}px without an analytics overlay', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        context.close()

    for choice in (True, False):
        setup = f"localStorage.setItem('{KEY}', JSON.stringify({{statistics: {str(choice).lower()}, expires: Date.now() + 86400000}})); sessionStorage.setItem('portfolio-analytics-prompt-seen-v1', '1'); localStorage.setItem('unrelated-preference', 'keep');"
        context, page, traffic, retired, errors = context_for(browser, setup=setup)
        for name, domain in [('_ga', 'gautamsrn.github.io'), ('_ga_TEST', '.gautamsrn.github.io'), ('_clck', 'gautamsrn.github.io'), ('_clsk', '.gautamsrn.github.io'), ('unrelated', 'gautamsrn.github.io')]:
            context.add_cookies([{'name': name, 'value': 'legacy', 'domain': domain, 'path': '/', 'secure': True}])
        page.goto(ORIGIN + '/projects/')
        check(f'Legacy consent ({choice}) cannot restart retired providers', len(traffic) == 1 and not retired and not errors)
        check(f'Legacy consent ({choice}) and prompt storage are cleared', page.evaluate(f"localStorage.getItem('{KEY}') === null && sessionStorage.getItem('portfolio-analytics-prompt-seen-v1') === null"))
        names = {cookie['name'] for cookie in context.cookies()}
        check(f'Legacy cookies are cleared for earlier consent ({choice})', names == {'unrelated'})
        check(f'Unrelated browser preferences survive cleanup ({choice})', page.evaluate("localStorage.getItem('unrelated-preference')") == 'keep')
        page.locator('footer a[href="/privacy/"]').click()
        expect(page.locator('main')).to_contain_text('Cloudflare Web Analytics')
        check('The footer Privacy link works without settings controls', page.locator('[data-privacy-settings]').count() == 0)
        context.close()

    # Use a preview hostname for HTTP: browsers upgrade the real Pages hostname via HSTS.
    for origin in ('https://preview.example', 'http://preview.example'):
        context, page, traffic, retired, errors = context_for(browser, origin=origin)
        page.goto(origin)
        check('A production build cannot collect traffic on ' + origin, not traffic and not retired and not errors)
        context.close()

    for label, build in [('disabled configuration', DISABLED), ('development build', DEVELOPMENT)]:
        context, page, traffic, retired, errors = context_for(browser, build=build)
        page.goto(ORIGIN)
        check('No analytics integration in ' + label, not traffic and not retired and not errors
              and page.locator('[data-portfolio-traffic], [data-cf-beacon]').count() == 0)
        context.close()

    context, page, traffic, retired, errors = context_for(browser, block_cloudflare=True)
    page.goto(ORIGIN)
    check('A blocked beacon leaves the portfolio usable', page.locator('main h1').is_visible() and not errors and not retired)
    context.close()
    browser.close()

pages = list(ENABLED.rglob('*.html'))
check('All production pages have exactly one traffic loader', bool(pages) and all(path.read_text(encoding='utf-8').count('data-portfolio-traffic') == 1 for path in pages))
published = list(ENABLED.rglob('*.html')) + list((ENABLED / 'assets/js').glob('*.js')) + list((ENABLED / 'assets/css').glob('*.css'))
for marker in ('googletagmanager.com', 'google-analytics.com', 'G-13FTV4QTJ4', 'data-analytics-consent', 'data-privacy-settings', 'window.gtag'):
    check('Published output has no ' + marker, all(marker not in path.read_text(encoding='utf-8') for path in published))
check('Retired Google Analytics script is not published', not (ENABLED / 'assets/js/analytics.js').exists())
privacy = (ENABLED / 'privacy/index.html').read_text(encoding='utf-8')
check('The privacy page describes Cloudflare without obsolete Google Analytics controls', 'Cloudflare Web Analytics' in privacy and 'Google Analytics' not in privacy and 'Allow statistics' not in privacy)
print(json.dumps({'passed': len(checks), 'checks': checks}, indent=2))
