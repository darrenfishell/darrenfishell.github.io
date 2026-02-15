// News Headlines Fetcher - 1990s Style
// Fetches headlines from NYT, CNN, BBC, and NPR RSS feeds

(function() {
  'use strict';

  // RSS Feed URLs
  const RSS_FEEDS = {
    // General News
    nyt: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    cnn: 'https://rss.cnn.com/rss/edition.rss',
    bbc: 'http://feeds.bbci.co.uk/news/rss.xml',
    npr: 'https://feeds.npr.org/1001/rss.xml',
    fox: 'https://feeds.foxnews.com/foxnews/latest',
    breitbart: 'https://feeds.breitbart.com/breitbart',
    wsj: 'https://feeds.wsj.com/wallstreetjournal',
    
    // Technology
    theverge: 'https://www.theverge.com/rss/index.xml',
    wired: 'https://www.wired.com/feed/rss',
    techcrunch: 'https://techcrunch.com/feed/',
    arstechnica: 'http://feeds.arstechnica.com/arstechnica/index',
    reutersTech: 'https://www.reuters.com/rssFeed/technologyNews',
    
    // Business / Finance
    bloomberg: 'https://www.bloomberg.com/feed/podcast/etf-report.xml',
    financialtimes: 'https://www.ft.com/?format=rss',
    economistBiz: 'https://www.economist.com/business/rss.xml',
    
    // Science & Health
    nature: 'https://www.nature.com/nature/articles?type=article&format=rss',
    sciencemag: 'https://www.sciencemag.org/rss/current.xml',
    newscientist: 'https://www.newscientist.com/feed/home/',
    
    // World / Politics
    aljazeera: 'https://www.aljazeera.com/xml/rss/all.xml',
    reutersWorld: 'https://www.reuters.com/rssFeed/worldNews',
    politico: 'https://www.politico.com/rss/politicopicks.xml',
    guardianWorld: 'https://www.theguardian.com/world/rss',
    apNews: 'https://apnews.com/apf-topnews&output=rss',
    
    // Culture / Entertainment
    rollingStone: 'https://www.rollingstone.com/music/music-news/feed/',
    pitchfork: 'https://pitchfork.com/rss/news/'
  };

  // CORS Proxy (fallback if direct access fails)
  const CORS_PROXY = 'https://api.allorigins.win/get?url=';

  // Maximum number of headlines to display
  const MAX_HEADLINES = 30;
  
  // Maximum items to parse per feed (performance optimization)
  const MAX_ITEMS_PER_FEED = 15;
  
  // Request timeout (milliseconds) - reduced for faster initial appearance
  const REQUEST_TIMEOUT = 6000; // 6 seconds

  // Store all headlines
  let allHeadlines = [];
  
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

  // Fetch RSS feed with CORS proxy fallback and timeout
  async function fetchRSSFeed(url, source) {
    try {
      // Some feeds are known to have CORS issues, skip direct fetch
      const skipDirectFetch = ['bbc', 'cnn'].includes(source);
      
      if (!skipDirectFetch) {
        try {
          // Try direct fetch first with timeout
          let response = await fetchWithTimeout(url, {}, REQUEST_TIMEOUT);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          let text = await response.text();
          return parseRSS(text, source);
        } catch (directError) {
          // Silently fall through to proxy
        }
      }
      
      // Fallback to CORS proxy
      const proxyUrl = CORS_PROXY + encodeURIComponent(url);
      const response = await fetchWithTimeout(proxyUrl, {}, REQUEST_TIMEOUT);
      const data = await response.json();
      return parseRSS(data.contents, source);
    } catch (error) {
      console.error(`Failed to fetch ${source}:`, error.message);
      return [];
    }
  }

  // Parse RSS XML (optimized to limit items parsed)
  function parseRSS(xmlText, source) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error(`RSS parsing error for ${source}:`, parserError.textContent);
      return [];
    }

    const items = xmlDoc.querySelectorAll('item');
    const headlines = [];
    const maxItems = Math.min(items.length, MAX_ITEMS_PER_FEED);

    // Only process first N items for performance
    for (let i = 0; i < maxItems; i++) {
      const item = items[i];
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      
      if (title) {
        headlines.push({
          title: title.trim(),
          link: link.trim(),
          description: description.trim(),
          source: source.toUpperCase(),
          id: `${source}-${i}`
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

    // Fetch all feeds in parallel, but render as each completes
    const feedEntries = Object.entries(RSS_FEEDS);
    const promises = feedEntries.map(async ([source, url]) => {
      try {
        const headlines = await fetchRSSFeed(url, source);
        
        // If progressive rendering, add headlines immediately as they arrive
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
      // For progressive, we've already rendered, just ensure we have the final set
      allHeadlines = finalHeadlines;
      shuffleArray(allHeadlines);
      allHeadlines = allHeadlines.slice(0, MAX_HEADLINES);
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

  // Create floating headline element
  function createHeadlineElement(headline) {
    const element = document.createElement('div');
    element.className = 'floating-headline';
    element.setAttribute('data-source', headline.source);
    
    // Random styling variations
    const styles = [
      'style-1', 'style-2', 'style-3', 'style-4', 'style-5'
    ];
    element.classList.add(styles[Math.floor(Math.random() * styles.length)]);
    
    // Random animation type
    const animations = ['float', 'marquee', 'drift'];
    element.classList.add(`anim-${animations[Math.floor(Math.random() * animations.length)]}`);
    
    // Create link
    const link = document.createElement('a');
    link.href = headline.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `[${headline.source}] ${headline.title}`;
    
    element.appendChild(link);
    
    // Random starting position (use viewport dimensions)
    const maxX = Math.max(0, window.innerWidth - 320);
    const maxY = Math.max(0, window.innerHeight - 100);
    element.style.left = Math.random() * maxX + 'px';
    element.style.top = Math.random() * maxY + 'px';
    
    // Random animation duration (10-30 seconds)
    const duration = 10 + Math.random() * 20;
    element.style.setProperty('--animation-duration', `${duration}s`);
    
    // Random delay
    element.style.animationDelay = Math.random() * 2 + 's';
    
    return element;
  }

  // Render headlines to page (optimized with DocumentFragment)
  // Supports incremental rendering for progressive updates
  function renderHeadlines(headlines, append = false) {
    const container = document.getElementById('headlines-container');
    if (!container) {
      console.error('Headlines container not found');
      return;
    }

    // Clear container only if not appending
    if (!append) {
      container.innerHTML = '';
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Get existing headline IDs to avoid duplicates
    const existingIds = new Set();
    if (append) {
      container.querySelectorAll('.floating-headline').forEach(el => {
        const id = el.getAttribute('data-headline-id');
        if (id) existingIds.add(id);
      });
    }
    
    // Create headline elements
    let newCount = 0;
    headlines.forEach((headline, index) => {
      const headlineId = headline.id || `${headline.source}-${headline.title}`;
      
      // Skip if already rendered (for incremental updates)
      if (append && existingIds.has(headlineId)) {
        return;
      }
      
      const element = createHeadlineElement(headline);
      element.setAttribute('data-headline-id', headlineId);
      fragment.appendChild(element);
      
      // Stagger appearance (reduced delay for faster initial appearance)
      element.style.opacity = '0';
      const delay = append ? newCount * 20 : index * 20; // Even faster for incremental
      setTimeout(() => {
        element.style.transition = 'opacity 0.2s';
        element.style.opacity = '1';
      }, delay);
      
      newCount++;
    });
    
    // Append all at once for better performance
    if (fragment.children.length > 0) {
      container.appendChild(fragment);
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

    // Set up progressive rendering callback (for incremental updates)
    progressiveRenderCallback = (headlines) => {
      if (headlines && headlines.length > 0) {
        // Use incremental rendering for progressive updates
        const isFirstRender = container.children.length === 0;
        renderHeadlines(headlines, !isFirstRender);
      }
    };

    // Start fetching with progressive rendering enabled
    // Headlines will appear as soon as the first feed responds
    fetchAllHeadlines((headlines) => {
      // Final callback after all feeds complete
      if (headlines && headlines.length > 0) {
        renderHeadlines(headlines);
      }
    }, true); // Enable progressive rendering

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

