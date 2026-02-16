---
layout: default
---

<div class="news-hole-entry">
  <button type="button" id="news-hole-mode-btn" class="news-hole-btn">news hole mode</button>
</div>

<div class="homepage-about">
  <div class="about-content">
    {% capture about_content %}{% include about.md %}{% endcapture %}
    {{ about_content | markdownify }}
  </div>
</div>

<div id="headlines-container"></div>

<!-- News hole mode overlay: counter + exit at top (visible only in hole mode) -->
<div class="news-hole-ui" id="news-hole-ui" aria-hidden="true">
  <div class="news-hole-top">
    <p class="news-hole-counter" id="news-hole-counter">0 unique headlines</p>
    <button type="button" id="exit-news-hole-btn" class="news-hole-btn news-hole-exit">exit the hole</button>
  </div>
</div>

<script src="{{ site.baseurl }}/assets/js/news-headlines.js"></script>
<script>
(function() {
  var btn = document.getElementById('news-hole-mode-btn');
  var exitBtn = document.getElementById('exit-news-hole-btn');
  var ui = document.getElementById('news-hole-ui');
  var counterEl = document.getElementById('news-hole-counter');

  function enterHoleMode() {
    document.body.classList.add('news-hole-mode');
    if (ui) ui.setAttribute('aria-hidden', 'false');
    updateCounter();
  }

  function exitHoleMode() {
    document.body.classList.remove('news-hole-mode');
    if (ui) ui.setAttribute('aria-hidden', 'true');
  }

  function updateCounter() {
    if (!counterEl) return;
    var container = document.getElementById('headlines-container');
    var count = container ? container.querySelectorAll('.floating-headline').length : 0;
    counterEl.textContent = count + ' unique headline' + (count === 1 ? '' : 's');
  }

  if (btn) btn.addEventListener('click', enterHoleMode);
  if (exitBtn) exitBtn.addEventListener('click', exitHoleMode);
  window.addEventListener('headlines-count', function(e) {
    if (e.detail && e.detail.count !== undefined && counterEl) {
      counterEl.textContent = e.detail.count + ' unique headline' + (e.detail.count === 1 ? '' : 's');
    }
  });
  // Update counter when entering hole mode (in case headlines already loaded)
  window.addEventListener('headlines-rendered', updateCounter);
})();
</script>

