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

<!-- The visual "hole" vortex (visible only in hole mode) -->
<div class="news-hole-vortex" id="news-hole-vortex"></div>

<!-- News hole mode overlay: exit button at top (visible only in hole mode) -->
<div class="news-hole-ui" id="news-hole-ui" aria-hidden="true">
  <div class="news-hole-top">
    <button type="button" id="exit-news-hole-btn" class="news-hole-btn news-hole-exit">exit the hole</button>
  </div>
</div>

<script src="{{ site.baseurl }}/assets/js/news-headlines.js"></script>
<script>
(function() {
  var btn = document.getElementById('news-hole-mode-btn');
  var exitBtn = document.getElementById('exit-news-hole-btn');
  var ui = document.getElementById('news-hole-ui');

  function enterHoleMode() {
    document.body.classList.add('news-hole-mode');
    if (ui) ui.setAttribute('aria-hidden', 'false');
    window.dispatchEvent(new CustomEvent('news-hole-mode-change', { detail: { active: true } }));
  }

  function exitHoleMode() {
    document.body.classList.remove('news-hole-mode');
    if (ui) ui.setAttribute('aria-hidden', 'true');
    window.dispatchEvent(new CustomEvent('news-hole-mode-change', { detail: { active: false } }));
  }

  if (btn) btn.addEventListener('click', enterHoleMode);
  if (exitBtn) exitBtn.addEventListener('click', exitHoleMode);
})();
</script>

