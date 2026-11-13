(() => {
  const filters = document.querySelector('[data-project-filters]');
  if (!filters) return;
  const cards = [...document.querySelectorAll('[data-category]')];
  const count = document.querySelector('[data-project-count]');
  const discovery = document.querySelector('[data-project-discovery]');
  const search = document.querySelector('[data-project-query]');
  const empty = document.querySelector('[data-project-empty]');
  const resets = [...document.querySelectorAll('[data-project-reset]')];
  // Match word prefixes rather than incidental substrings, and treat common
  // ROS 2 spellings as one term so the version cannot match employment dates.
  const tokenize = (value) => value.normalize('NFKC').toLowerCase()
    .replace(/\bros[\s_-]*2\b/g, 'ros2')
    .match(/[\p{L}\p{N}]+(?:\+\+|#)?/gu) || [];
  const terms = new Map(cards.map((card) => [card, tokenize(card.dataset.search)]));
  let category = 'all';
  discovery.hidden = false;

  const update = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const words = tokenize(query);
    filters.querySelectorAll('button').forEach((item) => {
      item.setAttribute('aria-pressed', String(item.dataset.filter === category));
    });
    const visibleProjects = new Set();
    cards.forEach((card) => {
      card.hidden = (category !== 'all' && card.dataset.category !== category) ||
        !words.every((word) => terms.get(card).some((term) => term.startsWith(word)));
      if (!card.hidden) visibleProjects.add(card.dataset.projectId || card);
    });
    const visible = visibleProjects.size;
    document.querySelectorAll('[data-project-group]').forEach((group) => {
      group.hidden = ![...group.querySelectorAll('[data-category]')].some((card) => !card.hidden);
    });
    count.textContent = `${visible} ${visible === 1 ? 'result' : 'results'}${category === 'all' ? '' : ` in ${category}`}${query ? ` matching \u201c${search.value.trim()}\u201d` : ''}`;
    empty.hidden = visible !== 0;
    resets.forEach((button) => { button.hidden = category === 'all' && !query; });
  };
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    category = button.dataset.filter;
    update();
  });
  search.addEventListener('input', update);
  document.querySelector('[data-project-search]').addEventListener('submit', (event) => event.preventDefault());
  resets.forEach((button) => button.addEventListener('click', () => {
    category = 'all';
    search.value = '';
    update();
    search.focus();
  }));
})();

// Generate section navigation from the actual project headings.
(() => {
  const outline = document.querySelector('[data-project-outline]');
  if (!outline) return;
  const headings = [...document.querySelectorAll('[data-project-content] h2')];
  if (headings.length < 2) return;
  const list = outline.querySelector('ol');
  const links = new Map();
  const activate = (id) => links.forEach((link, section) => {
    if (section === id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = `project-section-${index + 1}`;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${encodeURIComponent(heading.id)}`;
    link.textContent = heading.textContent;
    link.addEventListener('click', () => activate(heading.id));
    links.set(heading.id, link);
    item.append(link);
    list.append(item);
  });
  outline.hidden = false;
  activate(headings[0].id);
  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.find((entry) => entry.isIntersecting);
    if (visible) activate(visible.target.id);
  }, { rootMargin: '-10% 0px -65% 0px' });
  headings.forEach((heading) => observer.observe(heading));
})();

// YouTube card previews load on deliberate hover, never on page load.
(() => {
  const covers = [...document.querySelectorAll('[data-video-preview]')];
  if (!covers.length || !window.IntersectionObserver) return;

  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const previews = covers.map((cover) => ({
    cover, label: cover.querySelector('[data-preview-label]'),
    defaultLabel: cover.querySelector('[data-preview-label]').textContent.trim(),
    hovered: false, visibleRatio: 0, player: null, ready: false, failed: false,
    hoverTimer: 0, startupTimer: 0,
  }));
  let active = null;
  let apiPromise;

  const eligible = (preview) => {
    const bounds = preview.cover.getBoundingClientRect();
    return hover.matches && !reducedMotion.matches && !document.hidden &&
      !preview.failed && !preview.cover.closest('[hidden]') &&
      bounds.width >= 200 && bounds.height >= 200;
  };
  const shouldPlay = (preview) => active === preview && preview.hovered &&
    preview.visibleRatio > .5 && eligible(preview);
  const updateLabel = (preview) => {
    preview.label.textContent = preview.defaultLabel;
  };
  const stop = (preview) => {
    preview.hovered = false;
    clearTimeout(preview.hoverTimer);
    clearTimeout(preview.startupTimer);
    if (preview.ready) preview.player.pauseVideo();
    preview.cover.classList.remove('is-previewing');
    if (active === preview) active = null;
    updateLabel(preview);
  };
  const fail = (preview) => {
    preview.failed = true;
    stop(preview);
    if (preview.player) preview.player.destroy();
    preview.player = null;
    preview.ready = false;
    preview.cover.querySelector('.hover-video')?.remove();
  };

  const loadAPI = () => {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('YouTube API unavailable')), 10000);
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timer);
        if (typeof previousCallback === 'function') previousCallback();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        clearTimeout(timer);
        reject(new Error('YouTube API unavailable'));
      };
      document.head.append(script);
    });
    return apiPromise;
  };

  const play = (preview) => {
    if (!shouldPlay(preview)) return;
    preview.player.mute();
    // Show the unobstructed player before initiating automatic playback.
    preview.cover.classList.add('is-previewing');
    requestAnimationFrame(() => {
      if (!shouldPlay(preview)) return stop(preview);
      preview.startupTimer = setTimeout(() => fail(preview), 10000);
      preview.player.playVideo();
    });
  };

  const start = async (preview) => {
    try {
      const api = await loadAPI();
      if (!shouldPlay(preview)) return;
      if (preview.player) {
        if (preview.ready) play(preview);
        else preview.startupTimer = setTimeout(() => fail(preview), 10000);
        return;
      }
      const source = new URL(preview.cover.dataset.videoPreview);
      if (!['www.youtube.com', 'www.youtube-nocookie.com'].includes(source.hostname) ||
          !/^\/embed\/[\w-]{11}$/.test(source.pathname)) return fail(preview);
      source.searchParams.set('enablejsapi', '1');
      source.searchParams.set('origin', window.location.origin);
      source.searchParams.set('playsinline', '1');
      source.searchParams.set('autoplay', '0');
      source.searchParams.set('controls', '0');
      const frame = document.createElement('iframe');
      frame.className = 'hover-video';
      frame.src = source.href;
      frame.title = `${preview.cover.getAttribute('aria-label')} preview`;
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.setAttribute('aria-hidden', 'true');
      frame.tabIndex = -1;
      preview.cover.append(frame);
      preview.startupTimer = setTimeout(() => fail(preview), 10000);
      preview.player = new api.Player(frame, {
        events: {
          onReady: (event) => {
            if (preview.failed) return;
            clearTimeout(preview.startupTimer);
            preview.player = event.target;
            preview.ready = true;
            if (shouldPlay(preview)) play(preview);
            else stop(preview);
          },
          onStateChange: (event) => {
            if (preview.failed) return;
            if (event.data === api.PlayerState.PLAYING) {
              if (!shouldPlay(preview)) stop(preview);
              else clearTimeout(preview.startupTimer);
            } else if (event.data === api.PlayerState.ENDED) stop(preview);
          },
          onError: () => fail(preview),
          onAutoplayBlocked: () => fail(preview),
        },
      });
    } catch {
      fail(preview);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const preview = previews.find((item) => item.cover === entry.target);
      preview.visibleRatio = entry.intersectionRatio;
      if (preview.visibleRatio <= .5) stop(preview);
    });
  }, { threshold: [0, .5, 1] });

  previews.forEach((preview) => {
    updateLabel(preview);
    observer.observe(preview.cover);
    preview.cover.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch' || !eligible(preview)) return;
      if (active && active !== preview) stop(active);
      active = preview;
      preview.hovered = true;
      preview.hoverTimer = setTimeout(() => start(preview), 350);
    });
    preview.cover.addEventListener('pointerleave', () => stop(preview));
    preview.cover.addEventListener('pointercancel', () => stop(preview));
  });
  const stopAll = () => previews.forEach(stop);
  const refreshEligibility = () => previews.forEach((preview) => {
    if (!eligible(preview)) stop(preview);
    updateLabel(preview);
  });
  hover.addEventListener('change', refreshEligibility);
  reducedMotion.addEventListener('change', refreshEligibility);
  window.addEventListener('resize', refreshEligibility);
  window.addEventListener('pagehide', stopAll);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAll();
  });
})();
