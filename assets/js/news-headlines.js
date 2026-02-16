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
  const MAX_HEADLINES_ONSCREEN_HOLE = 80;
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
  // Unique URLs that have ever been shown on screen (counter = this.size, can grow to 200)
  let displayedHeadlineUrls = new Set();

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

    return element;
  }

  function setNewsHoleCounter(count) {
    const counterEl = document.getElementById('news-hole-counter');
    if (counterEl) {
      counterEl.textContent = count + ' unique headline' + (count === 1 ? '' : 's');
    }
    window.dispatchEvent(new CustomEvent('headlines-count', { detail: { count } }));
  }

  // Render headlines to page. Uses batched DOM insertion and limited stagger for performance.
  // Never allows more than MAX_HEADLINES_ONSCREEN in the DOM. Counter = unique URLs that have entered the screen.
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
      setNewsHoleCounter(0);
      headlines = headlines.slice(0, maxToShow);
    } else {
      const slotLeft = Math.max(0, maxToShow - existingCount);
      if (slotLeft === 0) {
        setNewsHoleCounter(displayedHeadlineUrls.size);
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
      setNewsHoleCounter(displayedHeadlineUrls.size);
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
      if (!useStaggerForCount) {
        setNewsHoleCounter(displayedHeadlineUrls.size);
      }

      if (batchIndex === 0 && batchHeadlines.length <= STAGGER_CAP && !useBatched) {
        const newElements = Array.from(container.querySelectorAll('.floating-headline')).slice(-batchHeadlines.length);
        newElements.forEach((el, i) => {
          el.style.opacity = '0';
          setTimeout(() => {
            el.style.transition = 'opacity 0.2s';
            el.style.opacity = '1';
            const urlKey = el.getAttribute('data-headline-url') || batchHeadlines[i]?.link || batchHeadlines[i]?.id || `${batchHeadlines[i]?.source}-${batchHeadlines[i]?.title}`;
            if (urlKey) displayedHeadlineUrls.add(urlKey);
            setNewsHoleCounter(displayedHeadlineUrls.size);
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
        setNewsHoleCounter(displayedHeadlineUrls.size);
        container.classList.toggle('many-headlines', container.children.length >= maxHeadlinesOnScreen);
      }, ROTATION_INTERVAL_MS);
    }

    // Respond to news-hole-mode toggling: raise/lower the on-screen cap
    window.addEventListener('news-hole-mode-change', (e) => {
      const active = e.detail && e.detail.active;
      const prevMax = maxHeadlinesOnScreen;
      maxHeadlinesOnScreen = active ? MAX_HEADLINES_ONSCREEN_HOLE : MAX_HEADLINES_ONSCREEN_DEFAULT;

      if (maxHeadlinesOnScreen > prevMax && allHeadlines.length > 0) {
        // Cap increased — fill new slots immediately
        renderHeadlines(allHeadlines, true);
      } else if (maxHeadlinesOnScreen < prevMax) {
        // Cap decreased — trim excess DOM elements (remove oldest first)
        const elements = Array.from(container.querySelectorAll('.floating-headline'));
        if (elements.length > maxHeadlinesOnScreen) {
          elements
            .sort((a, b) => Number(a.getAttribute('data-added-at') || 0) - Number(b.getAttribute('data-added-at') || 0))
            .slice(0, elements.length - maxHeadlinesOnScreen)
            .forEach(el => el.remove());
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

