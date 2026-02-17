// News Headlines Fetcher - 1990s Style
// Fetches headlines from NYT, CNN, BBC, and NPR RSS feeds

(function() {
  'use strict';

  // RSS/Atom feed URLs. Value can be a single URL or array of URLs (e.g. for pagination).
  // WordPress-style pagination: add same feed with ?paged=2 to get more items.
  // Target: ~200 unique headlines across all feeds.
  const RSS_FEEDS = {
    // General News (CBS/ABC removed: 404 and proxy 522 timeouts)
    nyt: [
      'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
      'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
      'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
    ],
    fox: 'https://feeds.foxnews.com/foxnews/latest',
    politico: 'https://www.politico.com/rss/politicopicks.xml',
    npr: 'https://feeds.npr.org/1001/rss.xml',
    bbc: 'http://feeds.bbci.co.uk/news/rss.xml',
    guardian: 'https://www.theguardian.com/world/rss',
    // Technology (Wired: WordPress ?paged=2 for more)
    wired: [
      'https://www.wired.com/feed/rss',
      'https://www.wired.com/feed/rss?paged=2',
    ],
  };

  // CORS Proxy (fallback if direct access fails)
  const CORS_PROXY = 'https://api.allorigins.win/get?url=';

  // Maximum number of headlines to aggregate from feeds
  const MAX_HEADLINES = 200;
  // Maximum number of headlines rendered on screen at once (keeps DOM/performance in check)
  const MAX_HEADLINES_ONSCREEN_DEFAULT = 30;
  const MAX_HEADLINES_ONSCREEN_HOLE = 20;
  let maxHeadlinesOnScreen = MAX_HEADLINES_ONSCREEN_DEFAULT;

  // Maximum items to parse per feed (most news RSS feeds carry 25-50 items)
  const MAX_ITEMS_PER_FEED = 30;
  
  // Request timeout (milliseconds) - reduced for faster initial appearance
  const REQUEST_TIMEOUT = 6000; // 6 seconds

  // Batch size for incremental DOM insertion (keeps main thread responsive)
  const RENDER_BATCH_SIZE = 28;
  // When new items exceed this, we batch-append and skip per-item stagger
  const STAGGER_CAP = 35;
  // How often to rotate one on-screen headline for a new one from the pool (ms)
  const ROTATION_INTERVAL_MS = 4000;

  // Store all headlines (pool of up to MAX_HEADLINES)
  let allHeadlines = [];
  // Unique URLs that have been shown on screen (used by rotation to pick unseen headlines)
  let displayedHeadlineUrls = new Set();

  // News hole growth state
  let holeStartTime = 0;
  let holeTargetScale = 1;
  let holeConsumed = false;
  const HOLE_GROW_DURATION = 30000; // ms — time for hole to consume the full screen

  function computeHoleTargetScale() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const diagonal = Math.sqrt(vw * vw + vh * vh);
    const baseSize = vw < 768 ? 140 : 200;
    return (diagonal / baseSize) * 1.2;
  }

  // Called each time a headline is consumed by the hole.
  // Growth is proportional to elapsed time since hole mode began.
  function growHole() {
    if (!document.body.classList.contains('news-hole-mode')) return;
    if (holeStartTime === 0) return;
    const vortex = document.getElementById('news-hole-vortex');
    if (!vortex) return;

    const elapsed = Date.now() - holeStartTime;
    const progress = Math.min(1, elapsed / HOLE_GROW_DURATION);
    const scale = 1 + (holeTargetScale - 1) * progress;
    vortex.style.setProperty('--hole-scale', scale.toFixed(3));

    if (progress >= 1 && !holeConsumed) {
      holeConsumed = true;
      startEndgameSequence();
    }
  }

  function resetHoleGrowth() {
    holeStartTime = 0;
    holeTargetScale = 1;
    holeConsumed = false;
    const vortex = document.getElementById('news-hole-vortex');
    if (vortex) {
      vortex.style.transition = 'none';
      vortex.style.setProperty('--hole-scale', '1');
      requestAnimationFrame(() => {
        if (vortex) vortex.style.transition = '';
      });
    }
    // Remove typing overlay if present
    const overlay = document.getElementById('hole-consumed-overlay');
    if (overlay) overlay.remove();
  }

  // Endgame: hole has consumed the screen. Let remaining headlines drain into
  // the hole naturally (no new ones spawn thanks to holeConsumed flag).
  // Once the last headline disappears, show the typing cursor.
  function startEndgameSequence() {
    waitForHeadlinesDrained();
  }

  function waitForHeadlinesDrained() {
    if (!document.body.classList.contains('news-hole-mode')) return;
    const ctr = document.getElementById('headlines-container');
    const remaining = ctr ? ctr.querySelectorAll('.floating-headline').length : 0;
    if (remaining === 0) {
      // All headlines gone — pause briefly then show overlay
      setTimeout(() => {
        if (!document.body.classList.contains('news-hole-mode')) return;
        showTypingOverlay();
      }, 800);
    } else {
      // Check again soon
      setTimeout(waitForHeadlinesDrained, 300);
    }
  }

  function showTypingOverlay() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'hole-consumed-overlay';
    overlay.className = 'hole-consumed-overlay';
    const textEl = document.createElement('span');
    textEl.className = 'typing-text';
    textEl.textContent = '';
    overlay.appendChild(textEl);
    document.body.appendChild(overlay);

    // Wait a beat with just the blinking cursor, then start typing
    setTimeout(() => {
      if (!document.body.classList.contains('news-hole-mode')) return;
      runTypingAnimation(textEl);
    }, 1200);
  }

  // Human-like typing with typos and backspaces
  function runTypingAnimation(textEl) {
    // Sequence of actions: strings are typed, 'DELETE' removes last char, 'PAUSE' waits
    const sequence = [
      'W', 'h', 'a', 't', "'", 's', ' ',
      'g', 'o', 'i', 'n', 'h',        // typo: 'h' instead of 'g'
      'PAUSE',
      'DELETE',
      'g', ' ',
      'o', 'n', ' ',
      'w', 'i', 'h',                   // typo: 'h' instead of 'th'
      'PAUSE',
      'DELETE',
      't', 'h', ' ',
      'y', 'o', 'u', '?'
    ];

    let current = '';
    let i = 0;

    function getDelay(action) {
      if (action === 'PAUSE') return 400 + Math.random() * 350;
      if (action === 'DELETE') return 55 + Math.random() * 35;
      // Regular character — variable human timing
      return 70 + Math.random() * 90;
    }

    function step() {
      if (!document.body.classList.contains('news-hole-mode')) return;
      if (i >= sequence.length) return;

      const action = sequence[i];
      i++;

      if (action === 'PAUSE') {
        setTimeout(step, getDelay('PAUSE'));
        return;
      } else if (action === 'DELETE') {
        current = current.slice(0, -1);
      } else {
        current += action;
      }

      textEl.textContent = current;
      setTimeout(step, getDelay(action));
    }

    step();
  }

  // Debounce helper
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Timeout wrapper for fetch
  function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }

  // Fetch RSS/Atom feed with CORS proxy fallback. feedKey used for unique item ids when source has multiple URLs.
  async function fetchRSSFeed(url, source, feedKey = source) {
    try {
      const skipDirectFetch = [];
      
      if (!skipDirectFetch.includes(source)) {
        try {
          const response = await fetchWithTimeout(url, {}, REQUEST_TIMEOUT);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const text = await response.text();
          return parseRSS(text, source, feedKey);
        } catch (directError) {
          // Fall through to proxy
        }
      }
      
      const proxyUrl = CORS_PROXY + encodeURIComponent(url);
      const response = await fetchWithTimeout(proxyUrl, {}, REQUEST_TIMEOUT);
      const data = await response.json();
      return parseRSS(data.contents, source, feedKey);
    } catch (error) {
      console.error(`Failed to fetch ${source}:`, error.message);
      return [];
    }
  }

  // Parse RSS 2.0 or Atom XML. feedKey used for item ids (unique when source has multiple URLs).
  function parseRSS(xmlText, source, feedKey = source) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error(`RSS/Atom parsing error for ${source}:`, parserError.textContent);
      return [];
    }

    const isAtom = xmlDoc.querySelector('feed') !== null;
    const itemSelector = isAtom ? 'entry' : 'item';
    const items = xmlDoc.querySelectorAll(itemSelector);
    const headlines = [];
    const maxItems = Math.min(items.length, MAX_ITEMS_PER_FEED);

    for (let i = 0; i < maxItems; i++) {
      const item = items[i];
      const title = item.querySelector('title')?.textContent?.trim() || '';
      let link = '';
      let description = '';

      if (isAtom) {
        const linkEl = item.querySelector('link[href]');
        link = linkEl ? linkEl.getAttribute('href') || '' : '';
        const summary = item.querySelector('summary') || item.querySelector('content');
        description = summary?.textContent?.trim() || '';
      } else {
        link = item.querySelector('link')?.textContent?.trim() || '';
        description = item.querySelector('description')?.textContent?.trim() || '';
      }

      if (title) {
        headlines.push({
          title,
          link,
          description,
          source: source.toUpperCase(),
          id: `${feedKey}-${i}`
        });
      }
    }

    return headlines;
  }

  // Progressive rendering: render headlines as they arrive
  let renderedHeadlines = new Set();
  let progressiveRenderCallback = null;
  
  function addHeadlinesProgressively(newHeadlines) {
    if (!newHeadlines || newHeadlines.length === 0) return;
    
    // Filter out duplicates
    const uniqueHeadlines = newHeadlines.filter(h => {
      const key = h.id || `${h.source}-${h.title}`;
      if (renderedHeadlines.has(key)) return false;
      renderedHeadlines.add(key);
      return true;
    });
    
    if (uniqueHeadlines.length === 0) return;
    
    // Add to existing headlines
    allHeadlines = [...allHeadlines, ...uniqueHeadlines];
    
    // Shuffle and limit
    shuffleArray(allHeadlines);
    const displayHeadlines = allHeadlines.slice(0, MAX_HEADLINES);
    
    // Render immediately if callback is set
    if (progressiveRenderCallback) {
      progressiveRenderCallback(displayHeadlines);
    }
  }

  // Fetch all RSS feeds with progressive rendering
  async function fetchAllHeadlines(renderCallback = null, progressive = false) {
    // Set up progressive rendering if requested
    if (progressive && renderCallback) {
      progressiveRenderCallback = renderCallback;
      renderedHeadlines.clear();
      allHeadlines = [];
    }

    // Normalize to list of { source, url, feedKey } so multi-URL sources get unique ids
    const feedEntries = [];
    Object.entries(RSS_FEEDS).forEach(([source, urlOrUrls]) => {
      const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
      urls.forEach((url, idx) =>
        feedEntries.push({ source, url, feedKey: urls.length > 1 ? `${source}-${idx}` : source })
      );
    });

    const promises = feedEntries.map(async ({ source, url, feedKey }) => {
      try {
        const headlines = await fetchRSSFeed(url, source, feedKey);
        
        if (progressive && headlines.length > 0) {
          addHeadlinesProgressively(headlines);
        }
        
        return headlines;
      } catch (error) {
        console.error(`Error fetching ${source}:`, error);
        return [];
      }
    });

    // Wait for all to complete (but progressive rendering already showed some)
    const results = await Promise.allSettled(promises);
    const finalHeadlines = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
    
    // If not progressive, process all at once
    if (!progressive) {
      allHeadlines = finalHeadlines;
      shuffleArray(allHeadlines);
      allHeadlines = allHeadlines.slice(0, MAX_HEADLINES);
      
      if (renderCallback) {
        renderCallback(allHeadlines);
      }
    } else {
      // For progressive, we've already rendered; keep existing DOM, just finalize pool and run callback (e.g. start rotation)
      allHeadlines = finalHeadlines;
      shuffleArray(allHeadlines);
      allHeadlines = allHeadlines.slice(0, MAX_HEADLINES);
      if (renderCallback) {
        renderCallback(allHeadlines);
      }
    }
    
    // Clear progressive callback
    progressiveRenderCallback = null;
    
    return allHeadlines;
  }

  // Shuffle array (Fisher-Yates)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Create floating headline element with direction-based travel.
  // The element starts off-screen on one of 8 edges, crosses the viewport,
  // and exits off-screen on the opposite edge.  Both endpoints are off-screen
  // so `infinite` CSS loops never produce a visible jump.
  function createHeadlineElement(headline) {
    const element = document.createElement('div');
    element.className = 'floating-headline';
    element.setAttribute('data-source', headline.source);

    // Random styling variation
    const styles = ['style-1', 'style-2', 'style-3', 'style-4', 'style-5'];
    element.classList.add(styles[Math.floor(Math.random() * styles.length)]);

    // Create link
    const link = document.createElement('a');
    link.href = headline.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `[${headline.source}] ${headline.title}`;
    element.appendChild(link);

    // Direction-based positioning: start off-screen, travel across, exit opposite edge
    const BUF = 420; // px buffer (> max-width 320 + padding)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const drift = () => Math.round((Math.random() - 0.5) * 15); // slight perpendicular drift (vh/vw)

    const directions = [
      // Cardinal — random position along the perpendicular axis
      { left: -BUF,     top: Math.random() * vh, tx: `calc(100vw + ${BUF * 2}px)`, ty: `${drift()}vh` },   // East
      { left: vw + BUF, top: Math.random() * vh, tx: `calc(-100vw - ${BUF * 2}px)`, ty: `${drift()}vh` },  // West
      { left: Math.random() * vw, top: -BUF,     tx: `${drift()}vw`, ty: `calc(100vh + ${BUF * 2}px)` },   // South
      { left: Math.random() * vw, top: vh + BUF, tx: `${drift()}vw`, ty: `calc(-100vh - ${BUF * 2}px)` },  // North
      // Diagonal
      { left: -BUF,     top: -BUF,     tx: `calc(100vw + ${BUF * 2}px)`, ty: `calc(100vh + ${BUF * 2}px)` },   // SE
      { left: vw + BUF, top: vh + BUF, tx: `calc(-100vw - ${BUF * 2}px)`, ty: `calc(-100vh - ${BUF * 2}px)` }, // NW
      { left: -BUF,     top: vh + BUF, tx: `calc(100vw + ${BUF * 2}px)`, ty: `calc(-100vh - ${BUF * 2}px)` },  // NE
      { left: vw + BUF, top: -BUF,     tx: `calc(-100vw - ${BUF * 2}px)`, ty: `calc(100vh + ${BUF * 2}px)` },  // SW
    ];

    const dir = directions[Math.floor(Math.random() * directions.length)];
    element.style.left = dir.left + 'px';
    element.style.top  = dir.top  + 'px';
    element.style.setProperty('--travel-x', dir.tx);
    element.style.setProperty('--travel-y', dir.ty);

    // Random animation duration (12-30s) and initial delay
    const duration = 12 + Math.random() * 18;
    element.style.setProperty('--duration', `${duration}s`);
    element.style.animationDelay = (Math.random() * 3) + 's';

    // Small random rotation for visual variety
    element.style.setProperty('--rot-from', `${((Math.random() - 0.5) * 6).toFixed(1)}deg`);
    element.style.setProperty('--rot-to',   `${((Math.random() - 0.5) * 6).toFixed(1)}deg`);

    // In news hole mode: fly in from off-screen (same starting positions as homepage)
    // then animate toward the center vortex with gravitational physics
    if (document.body.classList.contains('news-hole-mode')) {
      const estW = vw < 768 ? 210 : 280;
      const estH = 70;
      animateToHole(element, dir.left, dir.top, {
        elWidth: estW,
        elHeight: estH
      });
    }

    return element;
  }

  // Animate a headline toward the center hole using Web Animations API.
  // Off-screen travel is fast (linear) so headlines appear on screen quickly.
  // Once on screen the position curve slows down (t³ linger) then accelerates
  // into the hole.  Scale/opacity stay at 1.0 until the headline has FULLY
  // entered the viewport.
  function animateToHole(element, fromX, fromY, opts) {
    opts = opts || {};
    const delay = opts.delay || 0;
    const elW = opts.elWidth || 280;
    const elH = opts.elHeight || 70;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const centerX = vw / 2;
    const centerY = vh / 2;

    // Aim the element's visual center at the hole center, not its top-left corner
    const dx = (centerX - elW / 2) - fromX;
    const dy = (centerY - elH / 2) - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Overall duration scaled by distance
    const speed = 80 + Math.random() * 40; // px/s
    const duration = Math.max(5000, Math.min(14000, (distance / speed) * 1000));

    // Compute what fraction of the total distance the element must travel
    // before it has FULLY entered the viewport (entire bounding box visible).
    let entryPFrac = 0;
    if (fromX < 0 && dx > 0) {
      // Off-screen left — fully entered when left edge reaches x = 0
      entryPFrac = Math.max(entryPFrac, -fromX / dx);
    } else if (fromX + elW > vw && dx < 0) {
      // Off-screen right — fully entered when right edge reaches x = vw
      entryPFrac = Math.max(entryPFrac, (fromX + elW - vw) / (-dx));
    }
    if (fromY < 0 && dy > 0) {
      // Off-screen top — fully entered when top edge reaches y = 0
      entryPFrac = Math.max(entryPFrac, -fromY / dy);
    } else if (fromY + elH > vh && dy < 0) {
      // Off-screen bottom — fully entered when bottom edge reaches y = vh
      entryPFrac = Math.max(entryPFrac, (fromY + elH - vh) / (-dy));
    }
    entryPFrac = Math.min(entryPFrac, 0.80);

    // Piecewise position curve:
    //   Phase 1 (0 → flyInEnd): fast linear ramp to cross the off-screen gap
    //   Phase 2 (flyInEnd → 1): t³ linger-then-accelerate for on-screen travel
    // If already on screen (retargeted elements), use t³ for the whole thing.
    const flyInEnd = entryPFrac > 0
      ? Math.max(0.08, Math.min(0.18, entryPFrac * 0.35))
      : 0;

    function posFrac(t) {
      if (flyInEnd <= 0) return Math.pow(t, 1.4);   // already on screen — gentle accel
      if (t <= flyInEnd) return (t / flyInEnd) * entryPFrac; // fast fly-in
      const rem = (t - flyInEnd) / (1 - flyInEnd);  // 0 → 1 for on-screen phase
      return entryPFrac + (1 - entryPFrac) * Math.pow(rem, 1.3); // steady then accelerates into hole
    }

    // Shrink/fade thresholds: full size until fully inside viewport
    const shrinkAt = entryPFrac + 0.05;
    const fadeAt   = entryPFrac + 0.12;

    const stops = [0, 0.10, 0.20, 0.35, 0.50, 0.65, 0.78, 0.88, 0.95, 1.0];
    const keyframes = stops.map(t => {
      const pFrac = posFrac(t);
      const px = dx * pFrac;
      const py = dy * pFrac;
      // Scale: full size until fully on screen + buffer, then shrinks toward 0
      const scale = t >= 1 ? 0
        : pFrac <= shrinkAt ? 1
        : Math.max(0, 1 - Math.pow((pFrac - shrinkAt) / (1 - shrinkAt), 0.7));
      // Opacity: fully opaque a bit longer, then fades
      const opacity = t >= 1 ? 0
        : pFrac <= fadeAt ? 1
        : Math.max(0, 1 - Math.pow((pFrac - fadeAt) / (1 - fadeAt), 0.8));

      return {
        transform: `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`,
        opacity: `${opacity.toFixed(3)}`,
        offset: t
      };
    });

    // Cancel any existing CSS travel animation
    element.style.animation = 'none';
    element.classList.add('hole-bound');

    const anim = element.animate(keyframes, {
      duration: duration,
      easing: 'linear',   // keyframes encode the acceleration directly
      fill: 'forwards',
      delay: delay
    });

    // Self-sustaining: when consumed by the hole, grow the vortex and spawn a replacement
    anim.onfinish = () => {
      if (!element.parentNode) return;
      element.remove();
      growHole();

      if (!document.body.classList.contains('news-hole-mode')) return;
      if (holeConsumed) return; // hole filled the screen — no more headlines

      const ctr = document.getElementById('headlines-container');
      if (!ctr) return;

      const urlKey = (h) => h.link || h.id || `${h.source}-${h.title}`;
      let pool = allHeadlines.filter(h => !displayedHeadlineUrls.has(urlKey(h)));
      if (pool.length === 0) pool = allHeadlines;
      if (pool.length === 0) return;

      const h = pool[Math.floor(Math.random() * pool.length)];
      const el = createHeadlineElement(h);
      el.setAttribute('data-headline-id', h.id || `${h.source}-${h.title}`);
      el.setAttribute('data-headline-url', urlKey(h));
      el.setAttribute('data-added-at', Date.now());
      displayedHeadlineUrls.add(urlKey(h));
      ctr.appendChild(el);
    };

    return anim;
  }

  // Retarget an existing on-screen headline to travel toward the hole.
  // Captures the element's current visual position, cancels its CSS animation,
  // repositions it in-place, then applies the gravitational animation.
  function retargetToHole(el, delay) {
    const rect = el.getBoundingClientRect();
    // Set inline position to current visual location *before* cancelling
    // the CSS animation so there is no visible jump when animation: none kicks in
    el.style.left = rect.left + 'px';
    el.style.top = rect.top + 'px';
    animateToHole(el, rect.left, rect.top, {
      delay: delay || 0,
      elWidth: rect.width,
      elHeight: rect.height
    });
  }

  // Render headlines to page. Uses batched DOM insertion and limited stagger for performance.
  // Never allows more than MAX_HEADLINES_ONSCREEN in the DOM.
  function renderHeadlines(headlines, append = false) {
    const container = document.getElementById('headlines-container');
    if (!container) {
      console.error('Headlines container not found');
      return;
    }

    let existingCount = container.querySelectorAll('.floating-headline').length;
    const maxToShow = maxHeadlinesOnScreen;

    if (!append) {
      if (existingCount > 0) {
        return;
      }
      container.innerHTML = '';
      displayedHeadlineUrls.clear();
      headlines = headlines.slice(0, maxToShow);
    } else {
      const slotLeft = Math.max(0, maxToShow - existingCount);
      if (slotLeft === 0) {
        container.classList.toggle('many-headlines', existingCount >= maxToShow);
        return;
      }
      headlines = headlines.slice(0, maxToShow);
    }

    const existingIds = new Set();
    if (append) {
      container.querySelectorAll('.floating-headline').forEach(el => {
        const id = el.getAttribute('data-headline-id');
        if (id) existingIds.add(id);
      });
    }

    let toAdd = headlines.filter(h => {
      const id = h.id || `${h.source}-${h.title}`;
      return !append || !existingIds.has(id);
    });
    if (append) {
      toAdd = toAdd.slice(0, Math.max(0, maxToShow - existingCount));
    }

    if (toAdd.length === 0) {
      container.classList.toggle('many-headlines', container.children.length >= maxToShow);
      return;
    }

    const baseCount = container.querySelectorAll('.floating-headline').length;
    const useBatched = toAdd.length > STAGGER_CAP;
    const staggerMs = 100;

    function appendBatch(batchHeadlines, batchIndex, totalBatches) {
      const fragment = document.createDocumentFragment();
      const useStaggerForCount = (batchIndex === 0 && batchHeadlines.length <= STAGGER_CAP && !useBatched);
      const batchTime = Date.now();
      batchHeadlines.forEach(headline => {
        const element = createHeadlineElement(headline);
        const headlineId = headline.id || `${headline.source}-${headline.title}`;
        const urlKey = headline.link || headlineId;
        element.setAttribute('data-headline-id', headlineId);
        element.setAttribute('data-headline-url', urlKey);
        element.setAttribute('data-added-at', batchTime);
        fragment.appendChild(element);
        if (!useStaggerForCount) {
          displayedHeadlineUrls.add(urlKey);
        }
      });
      container.appendChild(fragment);

      if (batchIndex === 0 && batchHeadlines.length <= STAGGER_CAP && !useBatched) {
        const newElements = Array.from(container.querySelectorAll('.floating-headline')).slice(-batchHeadlines.length);
        newElements.forEach((el, i) => {
          el.style.opacity = '0';
          setTimeout(() => {
            el.style.transition = 'opacity 0.2s';
            el.style.opacity = '1';
            const urlKey = el.getAttribute('data-headline-url') || batchHeadlines[i]?.link || batchHeadlines[i]?.id || `${batchHeadlines[i]?.source}-${batchHeadlines[i]?.title}`;
            if (urlKey) displayedHeadlineUrls.add(urlKey);
          }, i * staggerMs);
        });
      } else if (batchIndex === totalBatches - 1) {
        container.classList.toggle('many-headlines', container.children.length >= maxToShow);
      }
    }

    if (useBatched) {
      let batchIndex = 0;
      function scheduleNextBatch() {
        const start = batchIndex * RENDER_BATCH_SIZE;
        if (start >= toAdd.length) {
          container.classList.toggle('many-headlines', container.children.length >= maxToShow);
          window.dispatchEvent(new CustomEvent('headlines-rendered'));
          return;
        }
        const batch = toAdd.slice(start, start + RENDER_BATCH_SIZE);
        appendBatch(batch, batchIndex, Math.ceil(toAdd.length / RENDER_BATCH_SIZE));
        batchIndex++;
        requestAnimationFrame(scheduleNextBatch);
      }
      requestAnimationFrame(scheduleNextBatch);
    } else {
      appendBatch(toAdd, 0, 1);
      container.classList.toggle('many-headlines', container.children.length >= maxToShow);
      window.dispatchEvent(new CustomEvent('headlines-rendered'));
    }
  }

  // Initialize when DOM is ready
  function init() {
    // Container is already styled as fixed in CSS
    const container = document.getElementById('headlines-container');
    if (!container) {
      console.error('Headlines container not found');
      return;
    }

    // Progressive callback: full render when empty, append when more headlines arrive (so we fill toward 30 and counter can grow)
    let rotationStarted = false;
    function onHeadlines(headlines) {
      if (!headlines || headlines.length === 0) return;
      const isFirstRender = container.querySelectorAll('.floating-headline').length === 0;
      renderHeadlines(headlines, !isFirstRender);
      if (!rotationStarted) {
        rotationStarted = true;
        startRotation();
      }
    }

    // Start fetching with progressive rendering enabled
    fetchAllHeadlines(onHeadlines, true);

    // Only replace a headline that has already moved off-screen (so none disappear from the middle)
    function isOffScreen(el) {
      const rect = el.getBoundingClientRect();
      const margin = 50;
      return rect.right < -margin || rect.left > window.innerWidth + margin ||
             rect.bottom < -margin || rect.top > window.innerHeight + margin;
    }

    function startRotation() {
      setInterval(() => {
        if (holeConsumed) return; // hole filled the screen — stop rotating
        const container = document.getElementById('headlines-container');
        if (!container || container.children.length === 0) return;

        const urlKey = (h) => h.link || h.id || `${h.source}-${h.title}`;
        const candidates = allHeadlines.filter(h => !displayedHeadlineUrls.has(urlKey(h)));
        if (candidates.length === 0) return;

        const elements = Array.from(container.querySelectorAll('.floating-headline'));
        if (elements.length === 0) return;

        // Prefer replacing an off-screen element; fall back to the oldest on-screen element
        const offScreen = elements.filter(isOffScreen);
        let toRemove;
        if (offScreen.length > 0) {
          toRemove = offScreen[Math.floor(Math.random() * offScreen.length)];
        } else {
          // Replace element that has been on screen the longest
          let oldest = elements[0];
          let oldestTime = Number(oldest.getAttribute('data-added-at') || 0);
          for (let i = 1; i < elements.length; i++) {
            const t = Number(elements[i].getAttribute('data-added-at') || 0);
            if (t < oldestTime) { oldest = elements[i]; oldestTime = t; }
          }
          toRemove = oldest;
        }

        const headline = candidates[Math.floor(Math.random() * candidates.length)];
        const element = createHeadlineElement(headline);
        element.setAttribute('data-headline-id', headline.id || `${headline.source}-${headline.title}`);
        element.setAttribute('data-headline-url', urlKey(headline));
        element.setAttribute('data-added-at', Date.now());
        displayedHeadlineUrls.add(urlKey(headline));

        if (elements.length < maxHeadlinesOnScreen) {
          // Below the on-screen cap — add without removing so DOM fills toward the cap
          container.appendChild(element);
        } else {
          container.replaceChild(element, toRemove);
        }
        container.classList.toggle('many-headlines', container.children.length >= maxHeadlinesOnScreen);
      }, ROTATION_INTERVAL_MS);
    }

    // Respond to news-hole-mode toggling
    window.addEventListener('news-hole-mode-change', (e) => {
      const active = e.detail && e.detail.active;
      maxHeadlinesOnScreen = active ? MAX_HEADLINES_ONSCREEN_HOLE : MAX_HEADLINES_ONSCREEN_DEFAULT;

      if (active) {
        // Initialize hole growth tracking
        holeStartTime = Date.now();
        holeTargetScale = computeHoleTargetScale();

        // Trim down to the hole-mode cap so the screen isn't overcrowded
        const all = Array.from(container.querySelectorAll('.floating-headline'));
        if (all.length > maxHeadlinesOnScreen) {
          all.sort((a, b) => Number(a.getAttribute('data-added-at') || 0) - Number(b.getAttribute('data-added-at') || 0))
            .slice(0, all.length - maxHeadlinesOnScreen)
            .forEach(el => el.remove());
        }
        // Retarget remaining headlines toward the hole
        const existing = Array.from(container.querySelectorAll('.floating-headline:not(.hole-bound)'));
        existing.forEach((el, i) => {
          retargetToHole(el, 0);  // no delay — all start moving immediately
        });
      } else {
        // Reset the hole back to its original size
        resetHoleGrowth();
        // Exiting hole mode: cancel all Web Animations on hole-bound elements,
        // clear the DOM, and repopulate with fresh normal-mode headlines that
        // float edge-to-edge at full size.
        Array.from(container.querySelectorAll('.floating-headline')).forEach(el => {
          el.getAnimations().forEach(a => a.cancel());
          el.remove();
        });
        if (allHeadlines.length > 0) {
          renderHeadlines(allHeadlines, false);
        }
        container.classList.toggle('many-headlines', container.children.length >= maxHeadlinesOnScreen);
      }
    });

    // Update container size on window resize (debounced for performance)
    const debouncedResize = debounce(() => {
      if (container) {
        container.style.height = window.innerHeight + 'px';
      }
    }, 250);
    
    window.addEventListener('resize', debouncedResize);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

